"""Compare two BMPs byte-by-byte: find first differences, totals,
and test whether one is a shifted version of the other."""
import sys

a = open(sys.argv[1], "rb").read()
b = open(sys.argv[2], "rb").read()
print(f"len(a)={len(a)} len(b)={len(b)}")

if len(a) == len(b):
    diffs = [i for i in range(len(a)) if a[i] != b[i]]
    print(f"same length, differing bytes: {len(diffs)}")
    if diffs:
        print("first 10 diff offsets:", diffs[:10])
        first = diffs[0]
        print(f"a[{first}:{first+32}] = {a[first:first+32].hex()}")
        print(f"b[{first}:{first+32}] = {b[first:first+32].hex()}")
else:
    print("DIFFERENT LENGTHS")

# Shift test: is b = a shifted by k bytes (extra/missing bytes in transfer)?
best = None
for k in range(-128, 129):
    if k >= 0:
        same = sum(1 for i in range(len(a) - k) if a[i] == b[i + k])
        total = len(a) - k
    else:
        same = sum(1 for i in range(len(a)) if a[i] == b[i + k])
        total = len(a)
    if total <= 0:
        continue
    ratio = same / total
    if best is None or ratio > best[1]:
        best = (k, ratio)
print(f"best shift: b = a shifted by {best[0]} bytes, match ratio {best[1]:.4f}")
