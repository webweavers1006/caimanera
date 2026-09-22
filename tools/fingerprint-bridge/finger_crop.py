"""
Large-platen fingerprint frame post-processing (Futronic FS64 support).

The FS88H is a single-finger scanner (480x320). The FS64 is a tenprint
livescan device whose full frame is 1600x1500 (~2.4 MB). Shipping those
frames untouched over the WebSocket saturates the live preview and bloats
the capture payload (hex-encoded, ~4.8 MB per capture).

This module only kicks in for LARGE frames (max dimension > LARGE_FRAME_MAX_DIM):
  - live preview: the full frame is downscaled to a CONSTANT size, so the
    browser keeps its existing fixed-dimension pipeline (zero frontend changes).

The final capture is NOT modified: it is sent as the full raw frame, exactly
like the --dose-scan output (the bridge marks it with "raw": true and the
browser renders it untouched).

Small devices (FS88H and friends) are returned unchanged — the existing
integration path is not modified. Pillow is optional: if it is not
installed, large frames simply pass through as today (no regression, just
heavier traffic).
"""

try:
    from PIL import Image
except ImportError:  # pragma: no cover — bridge works without Pillow
    Image = None

PIL_AVAILABLE = Image is not None

# Devices whose largest dimension exceeds this are treated as large platens.
# FS88H = 480x320 -> untouched. FS64 = 1600x1500 -> post-processed.
LARGE_FRAME_MAX_DIM = 800

# Live frames from large platens are scaled to this width (constant across
# frames so the browser's fixed-dimension stream pipeline keeps working).
LIVE_TARGET_WIDTH = 480


def is_large_frame(width, height):
    """True when the device frame comes from a large platen (FS64 class)."""
    return max(width, height) > LARGE_FRAME_MAX_DIM


def live_target_dimensions(width, height):
    """Dimensions the browser should use for the live stream.

    Large platens stream a downscaled preview with constant dimensions;
    small devices keep their native dimensions (and Pillow absence also
    falls back to native — no behavior change, just heavier traffic).
    """
    if not is_large_frame(width, height) or not PIL_AVAILABLE:
        return width, height
    target_w = min(width, LIVE_TARGET_WIDTH)
    target_h = max(1, round(height * target_w / width))
    return target_w, target_h


def downscale_for_live(raw, width, height):
    """Scale a large frame down for the live preview.

    Returns (bytes, out_w, out_h). Non-large frames pass through unchanged.
    """
    if not is_large_frame(width, height) or not PIL_AVAILABLE:
        return raw, width, height

    expected = width * height
    if len(raw) < expected:
        return raw, width, height  # malformed frame — pass through as today

    target_w, target_h = live_target_dimensions(width, height)
    img = Image.frombytes("L", (width, height), bytes(raw[:expected]))
    img = img.resize((target_w, target_h), Image.LANCZOS)
    return img.tobytes(), target_w, target_h


# ── High-quality capture preview (display-only) ───────────────
# The final capture still ships FULL-RES as "image" (untouched, byte-identical
# to --dose-scan) for storage. The browser, however, can only downscale with
# a single-pass bilinear filter, and a 1600px-wide frame of 500-DPI ridges
# aliases into horizontal streaks at thumbnail size. This helper produces a
# crisp LANCZOS preview (optionally cropped to the finger) so the UI can
# render it 1:1 without any browser-side rescale.

# Width of the preview sent alongside the full raw capture.
PREVIEW_TARGET_WIDTH = 640

# Crop to the content bounding box only when the finger occupies less than
# this fraction of the frame (platen background is wasted space in the
# thumbnail). Values near 1.0 disable cropping.
PREVIEW_CROP_MAX_CONTENT_FRACTION = 0.85


def capture_preview(raw, width, height, target_width=PREVIEW_TARGET_WIDTH):
    """High-quality display preview for large-platen captures.

    Crops to the finger's bounding box (bright ridges on dark platen) and
    resizes with LANCZOS to a constant width. Returns (bytes, out_w, out_h)
    or None when not applicable (small frames, Pillow missing, or malformed
    data) — callers then fall back to the full raw frame.
    """
    if not is_large_frame(width, height) or not PIL_AVAILABLE:
        return None

    expected = width * height
    if len(raw) < expected:
        return None

    img = Image.frombytes("L", (width, height), bytes(raw[:expected]))

    # Locate the finger: ridges are bright against the dark platen.
    mask = img.point(lambda p: 255 if p > 40 else 0)
    bbox = mask.getbbox()
    if bbox:
        bx0, by0, bx1, by1 = bbox
        content_area = (bx1 - bx0) * (by1 - by0)
        if content_area < width * height * PREVIEW_CROP_MAX_CONTENT_FRACTION:
            margin = round(max(bx1 - bx0, by1 - by0) * 0.06)
            bx0 = max(0, bx0 - margin)
            by0 = max(0, by0 - margin)
            bx1 = min(width, bx1 + margin)
            by1 = min(height, by1 + margin)
            img = img.crop((bx0, by0, bx1, by1))

    target_w = min(width, target_width)
    target_h = max(1, round(img.size[1] * target_w / img.size[0]))
    img = img.resize((target_w, target_h), Image.LANCZOS)
    return img.tobytes(), target_w, target_h
