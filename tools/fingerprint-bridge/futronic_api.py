"""
Futronic Fingerprint Scanner API — Cross-platform wrapper.

Loads the correct native library (.dylib / .so / .dll) based on the OS.
All functions use ctypes to call into the Futronic SDK.

Platform support:
  - macOS:   native/macos/libScanAPI.dylib (universal arm64+x86_64)
  - Windows: native/windows/ftrScanAPI.dll + native/windows/FTRAPI.dll
  - Linux:   native/linux/libScanAPI.so + native/linux/libFTRAPI.so
"""

import ctypes
import platform
import os
import sys
from pathlib import Path
from ctypes import c_void_p, c_int, c_ubyte, c_uint, POINTER, byref, create_string_buffer, cast

# ──────────────────────────────────────────────────────────────
# Platform detection & library loading
# ──────────────────────────────────────────────────────────────

# PyInstaller compatibility: when bundled, sys._MEIPASS is the temp extraction dir
if getattr(sys, 'frozen', False):
    BASE_DIR = Path(sys._MEIPASS) / "native"
else:
    BASE_DIR = Path(__file__).parent / "native"

SYSTEM = platform.system()
MACHINE = platform.machine()

# Library path map — each OS has its own folder
_LIB_MAP = {
    "Darwin": {
        "scan": BASE_DIR / "macos" / "libScanAPI.dylib",
        "ftr":  None,  # macOS libScanAPI includes everything for capture
    },
    "Windows": {
        "scan": BASE_DIR / "windows" / "ftrScanAPI.dll",
        "ftr":  BASE_DIR / "windows" / "FTRAPI.dll",
    },
    "Linux": {
        "scan": BASE_DIR / "linux" / "libScanAPI.so",
        "ftr":  BASE_DIR / "linux" / "libFTRAPI.so",
    },
}


def _load_lib(name, path):
    """Load a native library. Returns None on failure — never crashes the bridge.

    On Windows with 64-bit Python, the 32-bit Futronic DLLs cannot be loaded
    via ctypes (WinError 193). This is expected: capture runs through the
    standalone futronic-capture.exe subprocess instead. ctypes is only used
    for optional diagnostics (open/close/check commands).
    """
    if path is None:
        return None
    if not path.exists():
        _LOAD_ERRORS[name] = (
            f"Missing native library: {path}\n"
            f"  → Request the Futronic SDK for {SYSTEM} ({MACHINE}) and place\n"
            f"    the {path.name} file in native/{SYSTEM.lower()}/"
        )
        print(f"  [WARN] [{SYSTEM}] {path.name} not found — ctypes diagnostics disabled")
        return None
    try:
        lib = ctypes.CDLL(str(path))
        print(f"  [OK] [{SYSTEM}] {path.name} loaded ({MACHINE})")
        return lib
    except OSError as e:
        _LOAD_ERRORS[name] = (
            f"Failed to load {path.name} via ctypes: {e}\n"
            f"  → Architecture mismatch (Python {platform.architecture()[0]} vs 32-bit DLL).\n"
            f"    Capture still works via futronic-capture.exe subprocess."
        )
        print(f"  [WARN] [{SYSTEM}] {path.name} failed to load: {e}")
        print(f"     ctypes diagnostics disabled — capture runs via native binary")
        return None


# ── Load libraries (non-fatal — bridge works without ctypes) ──
_LOAD_ERRORS = {}
_scan_lib = _load_lib("scan", _LIB_MAP[SYSTEM]["scan"])
_ftr_lib = _load_lib("ftr", _LIB_MAP[SYSTEM]["ftr"])

# ──────────────────────────────────────────────────────────────
# Function signatures — Scan API (hardware)
# ──────────────────────────────────────────────────────────────

if _scan_lib:
    # ── Device interface setup (MUST be called before open_device) ──
    _scan_lib.ftrSetBaseInterface.argtypes = [c_int]
    _scan_lib.ftrSetBaseInterface.restype = None
    _scan_lib.ftrGetBaseInterfaceNumber.restype = c_int

    # ── Device management ──
    _scan_lib.ftrScanOpenDevice.restype = c_void_p
    _scan_lib.ftrScanCloseDevice.argtypes = [c_void_p]
    _scan_lib.ftrScanCloseDevice.restype = c_int
    # NOTE: ftrScanGetInterfaces may crash on some dylib versions — wrapped defensively
    _scan_lib.ftrScanGetLastError.restype = c_int
    _scan_lib.ftrScanGetImageSize.argtypes = [c_void_p]
    _scan_lib.ftrScanGetImageSize.restype = c_int

    # ── Finger detection ──
    _scan_lib.ftrScanIsFingerPresent.argtypes = [c_void_p, POINTER(c_int)]
    _scan_lib.ftrScanIsFingerPresent.restype = c_int

    # ── Image capture (flat) — try multiple variants ──
    _scan_lib.ftrScanGetImage.argtypes = [c_void_p, POINTER(c_ubyte)]
    _scan_lib.ftrScanGetImage.restype = c_int

    # NOTE: ftrScanGetImage2 is intentionally NOT bound — the shipped
    # ftrScanAPI.dll does not export it, and accessing a missing export
    # raises AttributeError at import time, crashing bridge.py on startup.
    # The native binary captures via classic ftrScanGetImage (fixed dose).

    _scan_lib.ftrScanGetFrame.argtypes = [c_void_p, POINTER(c_ubyte)]
    _scan_lib.ftrScanGetFrame.restype = c_int

    # Specific-size capture (bypasses ftrScanGetImageSize)
    _scan_lib.ftrScanGetImageOfSpecificSize.argtypes = [c_void_p, POINTER(c_ubyte), c_int, c_int]
    _scan_lib.ftrScanGetImageOfSpecificSize.restype = c_int

    _scan_lib.ftrScanGetImageOfSpecificSize2.argtypes = [c_void_p, POINTER(c_ubyte), c_int, c_int]
    _scan_lib.ftrScanGetImageOfSpecificSize2.restype = c_int

    # ── Device info ──
    _scan_lib.ftrScanGetDeviceInfo.restype = c_int
    _scan_lib.ftrScanGetVersion.restype = c_int
    _scan_lib.ftrScanGetSerialNumber.restype = c_int

    # ── Liveness detection ──
    _scan_lib.ftrScanGetLFDParameters.restype = c_int

    # ── Options ──
    _scan_lib.ftrScanGetOptions.restype = c_int
    _scan_lib.ftrScanSetOptions.restype = c_int

# ──────────────────────────────────────────────────────────────
# Function signatures — FTR API (matching engine, Windows/Linux)
# ──────────────────────────────────────────────────────────────

if _ftr_lib:
    _ftr_lib.FTRInitialize.restype = c_int
    _ftr_lib.FTRTerminate.restype = c_int
    _ftr_lib.FTRSetParam.restype = c_int
    _ftr_lib.FTRGetParam.restype = c_int
    _ftr_lib.FTRCaptureFrame.restype = c_int
    _ftr_lib.FTREnroll.restype = c_int
    _ftr_lib.FTREnrollX.restype = c_int
    _ftr_lib.FTRVerify.restype = c_int
    _ftr_lib.FTRVerifyN.restype = c_int
    _ftr_lib.FTRIdentify.restype = c_int
    _ftr_lib.FTRIdentifyN.restype = c_int
    _ftr_lib.FTRSetBaseTemplate.restype = c_int
    _ftr_lib.FTRTerminate.restype = c_int


def _rebind_stdcall(lib):
    """Rebind all configured functions to the __stdcall calling convention.

    The Futronic SDK exports use __stdcall on Windows (callee cleans the
    stack). ctypes defaults to cdecl, which corrupts the stack and crashes
    or returns garbage. WINFUNCTYPE sets the correct convention while
    keeping the already configured restype/argtypes.
    """
    for name in dir(lib):
        if name.startswith("_"):
            continue
        try:
            fn = getattr(lib, name)
        except Exception:
            continue
        if not isinstance(fn, ctypes._CFuncPtr):
            continue
        try:
            proto = ctypes.WINFUNCTYPE(fn.restype, *fn.argtypes)
            setattr(lib, name, proto((name, lib)))
        except Exception:
            # Keep the original binding if the rebind fails (e.g. varargs).
            pass


if _scan_lib:
    _rebind_stdcall(_scan_lib)
if _ftr_lib:
    _rebind_stdcall(_ftr_lib)


# ──────────────────────────────────────────────────────────────
# Public API — high-level functions
# ──────────────────────────────────────────────────────────────

class FingerprintError(Exception):
    """Error from the fingerprint scanner."""
    pass


# ── Device management ──────────────────────────────────────────

def open_device():
    """Open the fingerprint scanner. Returns a device handle (opaque pointer)."""
    if _scan_lib is None:
        raise FingerprintError(
            "ctypes device control unavailable (library not loadable on this "
            "Python architecture). Capture still works via futronic-capture binary."
        )
    try:
        # Set base interface — required for FS80/FS88/FS64 models
        _scan_lib.ftrSetBaseInterface(c_int(0))
        handle = _scan_lib.ftrScanOpenDevice()
        if not handle:
            error_code = _scan_lib.ftrScanGetLastError()
            raise FingerprintError(f"Cannot open scanner. Error code: {error_code}")
        print(f"  [OK] Device opened: {handle}")
        return handle
    except OSError as e:
        raise FingerprintError(f"Cannot open scanner (native error): {e}")


def close_device(device):
    """Close the scanner and release the handle."""
    if _scan_lib and device:
        try:
            _scan_lib.ftrScanCloseDevice(device)
        except Exception:
            pass


def get_interfaces():
    """Get number of connected Futronic scanners. Returns 0 on error."""
    if _scan_lib is None:
        return 0
    try:
        return _scan_lib.ftrScanGetInterfaces()
    except Exception:
        return 0


# ── Finger detection ───────────────────────────────────────────

def is_finger_present(device):
    """Check if a finger is placed on the scanner. Returns True/False."""
    if _scan_lib is None:
        return False
    present = c_int()
    result = _scan_lib.ftrScanIsFingerPresent(device, byref(present))
    return result == 0 and present.value == 1


# ── Image capture ──────────────────────────────────────────────

def get_image_size(device):
    """Get the expected image buffer size from the device.
    Must be called AFTER get_device_info() which initializes the device properly."""
    if _scan_lib is None:
        raise FingerprintError("Scan library not available")
    try:
        size = _scan_lib.ftrScanGetImageSize(device)
        if size <= 0:
            raise FingerprintError(f"Invalid image size: {size}")
        print(f"  [SIZE] Image size: {size} bytes")
        return size
    except OSError as e:
        raise FingerprintError(f"Cannot get image size: {e}")


def get_device_info(device):
    """Get device info. Must be called BEFORE get_image_size to initialize the device."""
    if _scan_lib is None:
        raise FingerprintError("Scan library not available")
    try:
        result = _scan_lib.ftrScanGetDeviceInfo(device)
        print(f"  [INFO] Device info: result={result}")
        return result
    except OSError as e:
        print(f"  [WARN] Device info failed: {e}")
        return -1


# ── Status & info ──────────────────────────────────────────────

def get_status():
    """Return a status object describing the current platform setup."""
    return {
        "system": SYSTEM,
        "machine": MACHINE,
        "pythonArch": platform.architecture()[0],
        "scanLib": str(_LIB_MAP[SYSTEM]["scan"]) if _scan_lib else None,
        "ftrLib": str(_LIB_MAP[SYSTEM]["ftr"]) if _ftr_lib else None,
        "ctypesAvailable": _scan_lib is not None,
        "ctypesErrors": _LOAD_ERRORS or None,
        "matchingAvailable": False,  # matching is server-side (NBIS)
        "scannersDetected": "unknown (call open_device or run capture)",
    }


# ── CLI diagnostic ─────────────────────────────────────────────

if __name__ == "__main__":
    import json
    print("Futronic API Diagnostic")
    print("=" * 50)
    status = get_status()
    print(json.dumps(status, indent=2, default=str))

    if _scan_lib:
        print("\n[TEST] Testing scanner...")
        try:
            dev = open_device()
            print(f"  [OK] Device opened: {dev}")
            print(f"  [SIZE] Image size: {get_image_size(dev)} bytes")
            present = is_finger_present(dev)
            print(f"  [FINGER] Finger present: {present}")
            if present:
                print(f"  ℹ️  Finger detected — use bridge.py capture for full image capture")
            close_device(dev)
            print("  [OK] Device closed")
        except Exception as e:
            print(f"  [ERROR] {e}")
