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
import tempfile
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

from finger_crop import (
    is_large_frame,
    live_target_dimensions,
    downscale_for_live,
    capture_preview,
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


def read_bmp_file(path):
    """Read an 8-bit grayscale BMP written by the native binary.

    Returns (raw_bytes, width, height) with top-down row order.
    """
    with open(path, "rb") as f:
        data = f.read()
    if len(data) < 54 or data[:2] != b"BM":
        raise ValueError("not a BMP file")
    data_offset = struct.unpack_from("<I", data, 10)[0]
    width = struct.unpack_from("<i", data, 18)[0]
    height = struct.unpack_from("<i", data, 22)[0]
    bpp = struct.unpack_from("<H", data, 28)[0]
    if bpp != 8:
        raise ValueError(f"unsupported BMP bpp {bpp}")
    if width < 0:
        width = -width
    if height < 0:
        height = -height
    # 8-bit rows are padded to a multiple of 4 bytes.
    stride = (width + 3) & ~3
    raw = bytearray(width * height)
    for y in range(height):
        src = data_offset + (height - 1 - y) * stride
        raw[y * width:(y + 1) * width] = data[src:src + width]
    return bytes(raw), width, height


def parse_stdout_frame(stdout_data):
    """Legacy fallback: parse the FRD1-framed stdout stream.

    Returns (raw_bytes, width, height) or (None, 0, 0) when no frame
    marker is found.
    """
    idx = stdout_data.find(FRAME_MAGIC)
    if idx < 0:
        return None, 0, 0

    width = struct.unpack_from("<H", stdout_data, idx + 4)[0]
    height = struct.unpack_from("<H", stdout_data, idx + 6)[0]
    size = struct.unpack_from("<I", stdout_data, idx + 8)[0]

    # Pixel data starts at the SECOND FRD1 marker — the SDK injects junk
    # bytes between the header and the data.
    data_idx = stdout_data.find(FRAME_MAGIC, idx + 4)
    if data_idx < 0 or data_idx + 4 + size > len(stdout_data):
        data_idx = idx + FRAME_HEADER_SIZE  # legacy layout fallback
    return stdout_data[data_idx + 4: data_idx + 4 + size], width, height


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

    The binary handles its own device open/close — no ctypes device handle
    needed. Preferred transfer is via BMP FILE (`--out`): the Futronic SDK
    injects junk bytes into stdout on Windows, and file I/O is immune.
    Falls back to legacy stdout framing for older binaries.
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

    # Temp BMP the binary writes the capture to (file-transfer mode).
    out_fd, out_path = tempfile.mkstemp(prefix="saime-cap-", suffix=".bmp")
    os.close(out_fd)

    try:
        proc = await asyncio.create_subprocess_exec(
            str(binary),
            "--out",
            out_path,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
            env=env,
        )

        stdout_data, stderr_data = await asyncio.wait_for(
            proc.communicate(), timeout=30
        )

        # Log the binary's diagnostics (STABLE attempts, dose used, etc.)
        # even on success — the watchdog writes them to bridge.log.
        if stderr_data:
            diag = stderr_data.decode("utf-8", errors="replace").strip()
            for line in diag.splitlines():
                print(f"  [CAPTURE] {line}")

        if proc.returncode != 0:
            stderr_text = stderr_data.decode("utf-8", errors="replace").strip()
            return error(stderr_text or "Capture failed")

        # ── Preferred: read the BMP file (byte-exact capture) ──
        if os.path.exists(out_path) and os.path.getsize(out_path) > 0:
            raw, width, height = read_bmp_file(out_path)
        else:
            # ── Legacy fallback: parse the stdout frame ──
            raw, width, height = parse_stdout_frame(stdout_data)
            if raw is None:
                return error(
                    "Capture returned invalid data (frame marker not found)"
                )

        if len(raw) == 0:
            return error("Capture returned empty image data")

        # Large-platen devices (Futronic FS64 tenprint): send the FULL
        # frame untouched — identical to the --dose-scan output. The
        # browser renders it raw when "raw" is true. Small devices
        # (FS88H) behave exactly as before.
        raw_frame = is_large_frame(width, height)

        # Diagnostic parity check (FTR_SAVE_CAPTURE=1 in .env.bridge):
        # dump the exact bytes received from the binary to capture-bridge.bmp
        # so it can be compared byte-by-byte against capture-raw.bmp (binary)
        # and dose-scan/dose-N.bmp on the field PC.
        if os.environ.get("FTR_SAVE_CAPTURE") == "1":
            try:
                from PIL import Image as PILImage
                PILImage.frombytes("L", (width, height), raw).save(
                    Path(__file__).parent / "capture-bridge.bmp"
                )
            except Exception:
                pass

        response = {
            "image": raw.hex(),
            "size": len(raw),
            "width": width,
            "height": height,
            **({"raw": True} if raw_frame else {}),
        }

        # Display-only LANCZOS preview (large platens). The full raw frame
        # above remains byte-identical to --dose-scan and is what the web
        # app stores; "preview" lets the browser render a crisp thumbnail
        # without its lossy single-pass downscale.
        if raw_frame:
            preview = capture_preview(raw, width, height)
            if preview:
                response["preview"] = preview[0].hex()
                response["previewWidth"] = preview[1]
                response["previewHeight"] = preview[2]

        return ok(response)

    except asyncio.TimeoutError:
        return error("Capture timed out (no finger placed on scanner?)")
    except Exception as e:
        return error(f"Capture error: {e}")
    finally:
        try:
            os.unlink(out_path)
        except OSError:
            pass


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
                        # Large-platen devices stream a downscaled preview
                        # with constant dimensions so the browser keeps its
                        # fixed-dimension pipeline. Small devices (FS88H)
                        # keep native dimensions — unchanged behavior.
                        live_w, live_h = live_target_dimensions(
                            dimensions[0], dimensions[1]
                        )
                        await websocket.send(json.dumps({
                            "action": "live_start",
                            "status": "ok",
                            "width": live_w,
                            "height": live_h,
                            "imageSize": live_w * live_h,
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

                    # Pixel data starts at the SECOND FRD1 marker — the SDK
                    # injects junk bytes between the header and the data.
                    data_idx = buffer.find(FRAME_MAGIC, 4)
                    if data_idx < 0 or data_idx + 4 + size > len(buffer):
                        break  # partial frame — wait for more bytes

                    raw = buffer[data_idx + 4: data_idx + 4 + size]
                    buffer = buffer[data_idx + 4 + size:]

                    if w == width and h == height and ws_id in _live_tasks:
                        # Downscale large-platen frames (FS64) for the live
                        # preview; FS88H frames pass through unchanged.
                        raw, _, _ = downscale_for_live(raw, width, height)
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
