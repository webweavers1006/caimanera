"""
Fingerprint Bridge — WebSocket server for Futronic scanners.

Listens on ws://127.0.0.1:3002 (localhost only).
Receives JSON commands, executes them against the scanner, returns results.

Commands:
  { "action": "status" }        → Get bridge & scanner status
  { "action": "open" }          → Open the scanner
  { "action": "close" }         → Close the scanner
  { "action": "check" }         → Check if finger is on scanner
  { "action": "capture" }       → Capture fingerprint image
  { "action": "capture_frame" } → Capture raw frame
  { "action": "live_start" }    → Start live fingerprint preview stream
  { "action": "live_stop" }     → Stop live preview stream
"""

import asyncio
import json
import os
import struct
import sys
import platform
from pathlib import Path
import websockets
from websockets.asyncio.server import serve

from futronic_api import (
    FingerprintError,
    open_device,
    close_device,
    get_status as api_status,
)

# Platform info (mirrors futronic_api)
SYSTEM = platform.system()
if getattr(sys, 'frozen', False):
    BASE_DIR = Path(sys._MEIPASS) / "native"
else:
    BASE_DIR = Path(__file__).parent / "native"

# Native binary name differs per OS (Windows requires .exe)
_BINARY_NAME = "futronic-capture.exe" if SYSTEM == "Windows" else "futronic-capture"


def native_binary_path():
    """Path to the native capture binary for this platform.

    Installers copy the binary next to bridge.py, but in the source checkout
    it lives in native/<platform>/. Check the bridge root first, then the
    platform directory.
    """
    root = BASE_DIR.parent / _BINARY_NAME
    if root.exists():
        return root
    return BASE_DIR / SYSTEM.lower() / _BINARY_NAME

# ── Load .env.bridge if present ────────────────────────────────
_env_file = Path(__file__).parent / ".env.bridge"
if _env_file.exists():
    with open(_env_file) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                key, _, val = line.partition("=")
                os.environ.setdefault(key.strip(), val.strip())

# ── Config ─────────────────────────────────────────────────────
HOST = "127.0.0.1"
PORT = 3002          # wss:// (or ws:// when no certs) — documented public port
PORT_PLAIN = 3003    # ws:// — always available for dev / plain-HTTP pages

# Frame framing: the native binary writes frames as
# [FRD1][uint16_le w][uint16_le h][uint32_le size][raw bytes].
# The Futronic SDK may inject extra bytes into stdout, so the bridge
# re-synchronizes by scanning for this marker instead of assuming a
# fixed stride between frames.
FRAME_MAGIC = b"FRD1"
FRAME_HEADER_SIZE = 12

# TLS support — if cert files exist, serve wss:// for HTTPS pages.
CERT_DIR = Path(__file__).parent / "certs"
SSL_CERT = CERT_DIR / "bridge.crt"
SSL_KEY = CERT_DIR / "bridge.key"

# Allowed origins — configurable via BRIDGE_ALLOWED_ORIGINS env var.
# Set in LaunchAgent/systemd service or .env file.
# Example: BRIDGE_ALLOWED_ORIGINS=https://siac.saime.gob.ve,*.saime.gob.ve
# If not set, all origins are allowed (bridge is 127.0.0.1 only, network-isolated).

# ── State ──────────────────────────────────────────────────────
device = None
# Track live stream tasks per connection: { id(websocket): asyncio.Task }
_live_tasks = {}


def ok(data=None):
    return json.dumps({"status": "ok", **(data or {})})


def error(msg, code=None):
    payload = {"status": "error", "msg": msg}
    if code is not None:
        payload["code"] = code
    return json.dumps(payload)


# ── Command handlers ───────────────────────────────────────────

async def handle_status():
    return ok({"bridge": api_status()})


async def handle_open():
    global device
    if device:
        return ok({"device": str(device), "msg": "already open"})
    try:
        device = open_device()
        return ok({"device": str(device), "msg": "opened"})
    except FingerprintError as e:
        return error(str(e))
    except Exception as e:
        return error(f"Unexpected error: {e}")


async def handle_close():
    global device
    if device:
        close_device(device)
        device = None
        return ok({"msg": "closed"})
    return ok({"msg": "was not open"})


async def handle_capture():
    """Capture a single fingerprint by spawning futronic-capture directly.
    The binary handles its own device open/close — no ctypes device handle needed.
    Output is binary: [uint16_le width][uint16_le height][raw grayscale bytes].
    """
    global device

    # Close any ctypes-opened device to release USB before the binary takes over
    if device:
        close_device(device)
        device = None
        await asyncio.sleep(0.3)  # Let USB settle

    binary = native_binary_path()
    if not binary.exists():
        return error(f"Native capture binary not found: {binary}")

    env = os.environ.copy()
    if SYSTEM == "Darwin":
        env["DYLD_LIBRARY_PATH"] = str(BASE_DIR / "macos")

    try:
        proc = await asyncio.create_subprocess_exec(
            str(binary),
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
            env=env,
        )

        # Read binary frame: 4-byte header + raw bytes
        stdout_data, stderr_data = await asyncio.wait_for(
            proc.communicate(), timeout=30
        )

        if proc.returncode != 0:
            stderr_text = stderr_data.decode("utf-8", errors="replace").strip()
            return error(stderr_text or "Capture failed")

        idx = stdout_data.find(FRAME_MAGIC)
        if idx < 0:
            return error("Capture returned invalid data (frame marker not found)")

        # Parse header: uint16_le width, uint16_le height, uint32_le size
        width = struct.unpack_from("<H", stdout_data, idx + 4)[0]
        height = struct.unpack_from("<H", stdout_data, idx + 6)[0]
        size = struct.unpack_from("<I", stdout_data, idx + 8)[0]
        raw = stdout_data[idx + FRAME_HEADER_SIZE: idx + FRAME_HEADER_SIZE + size]

        if len(raw) == 0:
            return error("Capture returned empty image data")

        return ok({
            "image": raw.hex(),
            "size": len(raw),
            "width": width,
            "height": height,
        })

    except asyncio.TimeoutError:
        return error("Capture timed out (no finger placed on scanner?)")
    except Exception as e:
        return error(f"Capture error: {e}")


async def handle_live_start(websocket):
    """Start live fingerprint stream for this connection."""
    ws_id = id(websocket)

    # Stop any existing stream for this connection
    if ws_id in _live_tasks:
        _live_tasks[ws_id].cancel()
        del _live_tasks[ws_id]

    # Run the stream in a background task
    task = asyncio.create_task(_stream_frames(websocket, ws_id))
    _live_tasks[ws_id] = task

    # Response (dimensions) will be sent by _stream_frames when ready
    return None


async def _stream_frames(websocket, ws_id):
    """Background coroutine: spawn futronic-capture --stream and forward frames."""

    binary = native_binary_path()
    if not binary.exists():
        await websocket.send(error(f"Native capture binary not found: {binary}"))
        return

    env = os.environ.copy()
    if SYSTEM == "Darwin":
        env["DYLD_LIBRARY_PATH"] = str(BASE_DIR / "macos")

    proc = None
    try:
        proc = await asyncio.create_subprocess_exec(
            str(binary), "--stream",
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
            env=env,
        )

        # Read stderr for stream status messages (READY, WAITING, etc.)
        # and stdout for binary frame data — concurrently
        dimensions = None

        async def read_stderr():
            """Read status lines from stderr."""
            nonlocal dimensions
            while proc.returncode is None:
                line = await proc.stderr.readline()
                if not line:
                    break
                text = line.decode("utf-8", errors="replace").strip()
                if text.startswith("STREAM:READY"):
                    parts = text.split()
                    if len(parts) >= 4:
                        dimensions = (int(parts[1]), int(parts[2]), int(parts[3]))
                        await websocket.send(json.dumps({
                            "action": "live_start",
                            "status": "ok",
                            "width": dimensions[0],
                            "height": dimensions[1],
                            "imageSize": dimensions[2],
                        }))
                elif text.startswith("STREAM:WAITING"):
                    print("  [FINGER] Waiting for finger...")
                elif text.startswith("STREAM:FINGER_DETECTED"):
                    print("  [FINGER] Finger detected — streaming frames")
                elif text.startswith("STREAM:FINGER_REMOVED"):
                    print("  [FINGER] Finger removed — waiting...")
                elif text.startswith("STREAM:DONE"):
                    break
                elif text.startswith("ERROR"):
                    await websocket.send(error(text))

        async def read_frames():
            """Read frames from stdout, re-synchronizing on the FRD1 marker.
            The SDK may inject extra bytes into stdout, so the stream cannot
            be parsed with a fixed stride."""
            nonlocal dimensions

            # Wait for dimensions first
            while dimensions is None and proc.returncode is None:
                await asyncio.sleep(0.1)

            if not dimensions:
                return

            width, height, image_size = dimensions

            buffer = b""
            while proc.returncode is None:
                try:
                    chunk = await proc.stdout.read(4096)
                except Exception:
                    break
                if not chunk:
                    break
                buffer += chunk

                while True:
                    idx = buffer.find(FRAME_MAGIC)
                    if idx < 0:
                        # Keep only a tail that may hold a partial marker.
                        keep = len(FRAME_MAGIC) - 1
                        buffer = buffer[-keep:] if len(buffer) > keep else buffer
                        break

                    buffer = buffer[idx:]
                    if len(buffer) < FRAME_HEADER_SIZE:
                        break

                    w = struct.unpack_from("<H", buffer, 4)[0]
                    h = struct.unpack_from("<H", buffer, 6)[0]
                    size = struct.unpack_from("<I", buffer, 8)[0]

                    # Sanity check — discard bogus markers found in image data.
                    if size > image_size + 65536:
                        buffer = buffer[len(FRAME_MAGIC):]
                        continue

                    need = FRAME_HEADER_SIZE + size
                    if len(buffer) < need:
                        break

                    raw = buffer[FRAME_HEADER_SIZE:need]
                    buffer = buffer[need:]

                    if w == width and h == height and ws_id in _live_tasks:
                        await websocket.send(raw)

        # Run both readers concurrently
        stderr_task = asyncio.create_task(read_stderr())
        frames_task = asyncio.create_task(read_frames())

        # Wait for either to complete (or until cancelled)
        done, pending = await asyncio.wait(
            [stderr_task, frames_task],
            return_when=asyncio.FIRST_COMPLETED,
        )

        # Cancel remaining tasks
        for task in pending:
            task.cancel()

        # Notify client that stream ended
        if ws_id in _live_tasks:
            await websocket.send(json.dumps({
                "action": "live_stop",
                "status": "ok",
                "reason": "stream_ended",
            }))

    except asyncio.CancelledError:
        pass  # Normal — stream was stopped by user
    except websockets.exceptions.ConnectionClosed:
        pass  # Client disconnected
    except Exception as e:
        print(f"  [WARN] Live stream error: {e}")
        try:
            await websocket.send(error(f"Live stream error: {e}"))
        except Exception:
            pass
    finally:
        _live_tasks.pop(ws_id, None)
        if proc and proc.returncode is None:
            try:
                proc.terminate()
                await asyncio.wait_for(proc.wait(), timeout=3)
            except (asyncio.TimeoutError, ProcessLookupError):
                try:
                    proc.kill()
                except ProcessLookupError:
                    pass


async def handle_live_stop(websocket):
    """Stop the live fingerprint stream for this connection."""
    ws_id = id(websocket)
    task = _live_tasks.pop(ws_id, None)
    if task:
        task.cancel()
        try:
            await task  # Wait for full cleanup (subprocess terminated, USB released)
        except asyncio.CancelledError:
            pass
        return ok({"msg": "live stream stopped"})
    return ok({"msg": "no active stream"})


def _origin_allowed(origin):
    """Check if the WebSocket origin is allowed.
    Since the bridge binds to 127.0.0.1 only, network isolation already
    prevents external connections. Origin check is defense-in-depth.
    
    Set BRIDGE_ALLOWED_ORIGINS in the environment (or .env file) to a
    comma-separated list of allowed origins. Example:
      BRIDGE_ALLOWED_ORIGINS=https://siac.saime.gob.ve,https://admin.saime.gob.ve
    
    Supports wildcard subdomains: *.saime.gob.ve
    """
    if not origin:
        return True

    # Localhost is always allowed
    if "localhost" in origin or "127.0.0.1" in origin:
        return True

    # Check env-configured origins (set by install.sh or manually)
    allowed = os.environ.get("BRIDGE_ALLOWED_ORIGINS", "")
    if allowed:
        origins = set(o.strip() for o in allowed.split(",") if o.strip())
        if origin in origins:
            return True
        # Wildcard subdomain: *.saime.gob.ve matches siac.saime.gob.ve
        for o in origins:
            if o.startswith("*.") and origin.endswith(o[1:]):
                return True
        return False

    # No env var set → allow all (bridge is localhost-only anyway)
    return True

async def handler(websocket):
    # Validate origin (defense-in-depth; bridge is already 127.0.0.1-only)
    origin = websocket.request.headers.get("Origin", "")
    if not _origin_allowed(origin):
        await websocket.close(4003, f"Origin not allowed: {origin}")
        return

    ws_id = id(websocket)
    print(f"[WS] Client connected from {origin or 'unknown'}")

    try:
        async for message in websocket:
            try:
                cmd = json.loads(message)
            except json.JSONDecodeError:
                await websocket.send(error("invalid JSON"))
                continue

            action = cmd.get("action", "")
            request_id = cmd.get("requestId")

            if action == "status":
                response = await handle_status()

            elif action == "open":
                response = await handle_open()

            elif action == "close":
                response = await handle_close()

            elif action == "capture":
                response = await handle_capture()

            elif action == "live_start":
                await handle_live_start(websocket)
                # Response (dimensions) sent by _stream_frames background task
                continue  # Skip the requestId echo — live_start is async

            elif action == "live_stop":
                response = await handle_live_stop(websocket)

            else:
                await websocket.send(error(f"unknown action: {action}"))
                continue

            # Echo back requestId so the client can match the response
            if request_id and response:
                try:
                    data = json.loads(response)
                    data["requestId"] = request_id
                    response = json.dumps(data)
                except (json.JSONDecodeError, TypeError):
                    pass

            if response:
                await websocket.send(response)

    except websockets.exceptions.ConnectionClosed:
        pass
    finally:
        # Cleanup: cancel any live stream for this connection
        task = _live_tasks.pop(id(websocket), None)
        if task:
            task.cancel()
        print("[WS] Client disconnected")


# ── Main ───────────────────────────────────────────────────────

async def main():
    status = api_status()
    print("[WS] Fingerprint Bridge starting")
    print(f"   Platform: {status['system']} ({status['machine']})")
    print(f"   Python:   {status['pythonArch']}")
    print(f"   Matching: {'[ON]' if status['matchingAvailable'] else '[OFF] (server-side NBIS)'}")
    print(f"   Devices:  {status['scannersDetected']} detected")
    print()

    # Two listeners on 127.0.0.1:
    #   - ws:// on PORT_PLAIN — always available (dev / plain-HTTP pages)
    #   - wss:// on PORT when TLS certs exist (production / HTTPS pages)
    #   - ws:// on PORT when no certs exist (legacy compatibility)
    servers = []
    try:
        plain_server = await serve(handler, HOST, PORT_PLAIN)
        servers.append(plain_server)
        print(f"[OK] Plain WebSocket server on ws://{HOST}:{PORT_PLAIN}")

        if SSL_CERT.exists() and SSL_KEY.exists():
            import ssl
            ssl_context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
            ssl_context.load_cert_chain(str(SSL_CERT), str(SSL_KEY))
            tls_server = await serve(handler, HOST, PORT, ssl=ssl_context)
            servers.append(tls_server)
            print(f"[OK] TLS WebSocket server on wss://{HOST}:{PORT}")
        else:
            legacy_server = await serve(handler, HOST, PORT)
            servers.append(legacy_server)
            print(f"[OK] Plain WebSocket server on ws://{HOST}:{PORT} (no TLS certs)")
            print("     Run the installer to enable wss:// for HTTPS pages.")

        print("[OK] Bridge ready — waiting for connections")
        await asyncio.Future()
    finally:
        for server in servers:
            server.close()
        for server in servers:
            try:
                await server.wait_closed()
            except Exception:
                pass


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n[BYE] Bridge stopped.")
        if device:
            close_device(device)
        sys.exit(0)
