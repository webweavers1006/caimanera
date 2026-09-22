#!/usr/bin/env python3
"""
WSQ Fingerprint Compressor — wrapper around NBIS cwsq.

Usage:
  python wsq-compress.py <input.gray> <output.wsq> [--width W] [--height H] [--dpi 500] [--bitrate 0.75]

Input:  raw 8-bit grayscale file (width × height bytes)
Output: WSQ-compressed file (FBI standard, ~15:1 compression)

Requires NBIS (NIST Biometric Image Software) installed:
  brew install nbis   # macOS
  apt install nbis    # Linux

If NBIS is not installed, falls back to PNG compression.
"""

import struct
import subprocess
import sys
import os
from pathlib import Path
import zlib


def raw_to_png(raw: bytes, width: int, height: int) -> bytes:
    """Minimal PNG encoder for 8-bit grayscale (fallback)."""
    def crc32(data):
        c = 0xffffffff
        for b in data:
            c ^= b
            for _ in range(8):
                c = (c >> 1) ^ (0xedb88320 if c & 1 else 0)
        return (c ^ 0xffffffff) & 0xffffffff

    def chunk(ctype, data):
        cdata = ctype + data
        clen = struct.pack(">I", len(data))
        ccrc = struct.pack(">I", crc32(cdata))
        return clen + cdata + ccrc

    # Filter: None (0) before each row
    row_size = width + 1
    filtered = bytearray(row_size * height)
    for y in range(height):
        filtered[y * row_size] = 0
        filtered[y * row_size + 1 : (y + 1) * row_size] = raw[y * width : (y + 1) * width]

    compressed = zlib.compress(bytes(filtered))

    sig = b'\x89PNG\r\n\x1a\n'
    ihdr = struct.pack(">IIBBBBB", width, height, 8, 0, 0, 0, 0)
    return sig + chunk(b'IHDR', ihdr) + chunk(b'IDAT', compressed) + chunk(b'IEND', b'')


def compress_wsq(input_path: str, output_path: str, width: int, height: int,
                 dpi: int = 500, bitrate: float = 0.75) -> bool:
    """Compress raw grayscale → WSQ using NBIS cwsq."""
    try:
        result = subprocess.run(
            ['cwsq', str(bitrate), 'raw', str(width), str(height),
             str(dpi), input_path, output_path],
            capture_output=True, text=True, timeout=30,
        )
        if result.returncode != 0:
            print(f"cwsq error: {result.stderr.strip()}", file=sys.stderr)
            return False
        return True
    except FileNotFoundError:
        print("NBIS cwsq not found — falling back to PNG", file=sys.stderr)
        return False
    except subprocess.TimeoutExpired:
        print("cwsq timed out", file=sys.stderr)
        return False


def main():
    if len(sys.argv) < 3:
        print(f"Usage: {sys.argv[0]} <input.gray> <output> [--width W] [--height H]")
        sys.exit(1)

    input_path = sys.argv[1]
    output_path = sys.argv[2]

    # Parse optional args
    width = 320
    height = 480
    dpi = 500
    bitrate = 0.75
    i = 3
    while i < len(sys.argv):
        if sys.argv[i] == '--width' and i + 1 < len(sys.argv):
            width = int(sys.argv[i + 1]); i += 2
        elif sys.argv[i] == '--height' and i + 1 < len(sys.argv):
            height = int(sys.argv[i + 1]); i += 2
        elif sys.argv[i] == '--dpi' and i + 1 < len(sys.argv):
            dpi = int(sys.argv[i + 1]); i += 2
        elif sys.argv[i] == '--bitrate' and i + 1 < len(sys.argv):
            bitrate = float(sys.argv[i + 1]); i += 2
        else:
            i += 1

    # Read raw input
    if not os.path.exists(input_path):
        print(f"Input file not found: {input_path}", file=sys.stderr)
        sys.exit(1)

    with open(input_path, 'rb') as f:
        raw = f.read()

    expected = width * height
    if len(raw) != expected:
        print(f"Warning: expected {expected} bytes, got {len(raw)}", file=sys.stderr)

    # Try WSQ first, fall back to PNG
    wsq_output = output_path if output_path.endswith('.wsq') else output_path + '.wsq'
    success = compress_wsq(input_path, wsq_output, width, height, dpi, bitrate)

    if success:
        size = os.path.getsize(wsq_output)
        print(f"✅ WSQ: {wsq_output} ({size} bytes, ratio {len(raw)/size:.1f}:1)")
    else:
        # Fallback: PNG
        png_output = output_path if output_path.endswith('.png') else output_path + '.png'
        png = raw_to_png(raw, width, height)
        with open(png_output, 'wb') as f:
            f.write(png)
        size = os.path.getsize(png_output)
        print(f"⚠️  PNG fallback: {png_output} ({size} bytes, ratio {len(raw)/size:.1f}:1)")


if __name__ == '__main__':
    main()
