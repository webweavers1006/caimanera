"""Analyze a captured fingerprint BMP: per-column and per-row means,
to detect dark bands / uneven exposure."""
import sys

from PIL import Image

path = sys.argv[1]
img = Image.open(path)
w, h = img.size
data = img.tobytes()

col_sums = [0] * w
row_sums = [0] * h
for y in range(h):
    row = data[y * w:(y + 1) * w]
    for x in range(w):
        col_sums[x] += row[x]
        row_sums[y] += row[x]

col_mean = [c / h for c in col_sums]
row_mean = [r / w for r in row_sums]

# Left/center/right thirds (columns)
third = w // 3
left = sum(col_mean[:third]) / third
center = sum(col_mean[third:2 * third]) / (w - 2 * third)
right = sum(col_mean[2 * third:]) / third
print(f"size={w}x{h}")
print(f"col means -> left={left:.1f} center={center:.1f} right={right:.1f}")
print(f"darkest col x={min(range(w), key=lambda x: col_mean[x])} mean={min(col_mean):.1f}")
print(f"brightest col x={max(range(w), key=lambda x: col_mean[x])} mean={max(col_mean):.1f}")
print(f"row mean min={min(row_mean):.1f} max={max(row_mean):.1f}")
print(f"overall mean={sum(data) / len(data):.1f}")

# Seam detection: a ghosted capture (finger moved mid-scan) shows an
# abrupt jump between adjacent columns (the displacement seam).
diffs = [abs(col_mean[x + 1] - col_mean[x]) for x in range(w - 1)]
seam_x = max(range(w - 1), key=lambda x: diffs[x])
print(f"max col jump={diffs[seam_x]:.1f} at x={seam_x} (mean jump={sum(diffs)/len(diffs):.1f})")

# Contrast (std) per third - smeared halves lose ridge contrast
import statistics


def third_std(name, x0, x1):
    vals = [data[y * w + x] for y in range(0, h, 2) for x in range(x0, x1, 2)]
    return statistics.pstdev(vals)


print(f"std left={third_std('left',0,third):.1f} center={third_std('center',third,2*third):.1f} right={third_std('right',2*third,w):.1f}")
