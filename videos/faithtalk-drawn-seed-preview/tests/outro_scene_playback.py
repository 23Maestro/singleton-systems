"""Seam: rendered scene playback. Checks an outro scene render against its approved static card.

Usage: python3 tests/outro_scene_playback.py <render.mp4> <approved-1920.png> [x0,y0,x1,y1 compare region] [x0,y0,x1,y1 skip]...

- Hold to the cut: the last frame equals the settled frame (no exit fades).
- Settled art: inside the compare region the settled frame matches the approved card.
  The review watermark corner is always skipped; pass extra skip boxes for approved additions.
"""
import subprocess, sys
import numpy as np
from PIL import Image

video, ref_path = sys.argv[1], sys.argv[2]
box = lambda s: tuple(int(v) for v in s.split(","))
region = box(sys.argv[3]) if len(sys.argv) > 3 else (0, 0, 1920, 1080)
skips = [(0, 0, 280, 160)] + [box(s) for s in sys.argv[4:]]
SETTLED_T = 5.0   # every scene is fully in by frame 126 (4.2 s)
ART_DIFF = 40     # wrong art differs by far more than compression noise

def frame(t):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-ss", str(t), "-i", video, "-frames:v", "1",
                          "-vf", "scale=1920:1080,format=rgb24", "-f", "rawvideo", "-"], capture_output=True).stdout
    return np.frombuffer(raw, np.uint8).reshape(1080, 1920, 3).astype(int)

dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", video],
                           capture_output=True, text=True).stdout)
settled, last = frame(SETTLED_T), frame(dur - 0.05)
fails = []

moving = np.abs(settled - last).max(2) > 40
if moving.sum() > 200:
    fails.append(f"hold to cut: {int(moving.sum())} px changed between {SETTLED_T}s and the last frame")

ref = np.asarray(Image.open(ref_path).convert("RGB")).astype(int)
diff = np.abs(settled - ref).max(2)
mask = np.zeros_like(diff, bool)
x0, y0, x1, y1 = region
mask[y0:y1, x0:x1] = True
for sx0, sy0, sx1, sy1 in skips:
    mask[sy0:sy1, sx0:sx1] = False
bad = (diff > ART_DIFF) & mask
if bad.sum() > 400:
    ys, xs = np.nonzero(bad)
    fails.append(f"settled art: {int(bad.sum())} px differ from approved card, bbox x{xs.min()}-{xs.max()} y{ys.min()}-{ys.max()}")

print("\n".join(fails) if fails else "ok: holds to the cut; settled art matches the approved card")
print("FAIL" if fails else "PASS")
sys.exit(1 if fails else 0)
