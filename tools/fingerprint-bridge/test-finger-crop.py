"""Quick offline test for finger_crop preview logic (no hardware needed)."""
import math
import random
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent / "tools" / "fingerprint-bridge"))

from finger_crop import capture_preview, downscale_for_live, is_large_frame, live_target_dimensions  # noqa: E402


def synthetic_fs64_frame(width=1600, height=1500):
    """A dark platen with a bright finger-like blob (top-center) + ridges."""
    img = bytearray(width * height)
    cx, cy, rw, rh = 780, 420, 300, 260  # finger bbox
    for y in range(cy - rh, cy + rh):
        for x in range(cx - rw, cx + rw):
            if 0 <= x < width and 0 <= y < height:
                # ridge pattern: horizontal-ish lines inside the finger
                v = 180 if ((y // 9) % 2) == 0 else 90
                noise = random.randint(-15, 15)
                img[y * width + x] = max(0, min(255, v + noise))
    return bytes(img)


# 1. Large frame → preview crops to finger and resizes to constant width
frame = synthetic_fs64_frame()
assert is_large_frame(1600, 1500)
preview = capture_preview(frame, 1600, 1500)
assert preview is not None, "expected a preview for the large frame"
pbytes, pw, ph = preview
print(f"preview: {pw}x{ph} ({len(pbytes)} bytes)")
assert pw == 640, f"expected width 640, got {pw}"
assert ph < 1500, "expected vertical crop toward the finger"
assert len(pbytes) == pw * ph

# 2. Live downscale still returns constant target dims
live_w, live_h = live_target_dimensions(1600, 1500)
out, ow, oh = downscale_for_live(frame, 1600, 1500)
assert (ow, oh) == (live_w, live_h) == (480, 450), (ow, oh, live_w, live_h)
assert len(out) == ow * oh
print(f"live downscale: {ow}x{oh}")

# 3. Small frames (FS88H) are untouched by preview + live helpers
small = bytes(480 * 320)
assert capture_preview(small, 480, 320) is None
assert downscale_for_live(small, 480, 320) == (small, 480, 320)
assert live_target_dimensions(480, 320) == (480, 320)
print("small frame pass-through: OK")

# 4. Malformed (truncated) large frame → preview returns None, no crash
assert capture_preview(frame[:100000], 1600, 1500) is None
print("malformed frame guard: OK")

print("ALL TESTS PASSED")
