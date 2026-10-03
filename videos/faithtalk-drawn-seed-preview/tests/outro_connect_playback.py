"""Seam: rendered scene playback. Checks a Connect scene render against the approved static card.

Usage: python3 tests/outro_connect_playback.py renders/outro/connect-figma-motion-4k.mp4
"""
import subprocess, sys
import numpy as np
from PIL import Image

video = sys.argv[1]
REF = "tests/reference/connect-approved-static-1920.png"  # Figma screenshot of the approved 01 / Connect instance
SETTLED_T = 5.0          # every element is in by frame 126 (4.2 s)
BAND = (0, 335, 1920, 802)  # emerald band; 87% opaque, so a new background moves pixels by at most ~33/255
ART_DIFF = 60            # text/icons that are wrong differ by far more than background bleed

def frame(t):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-ss", str(t), "-i", video, "-frames:v", "1",
                          "-vf", "scale=1920:1080,format=rgb24", "-f", "rawvideo", "-"], capture_output=True).stdout
    return np.frombuffer(raw, np.uint8).reshape(1080, 1920, 3).astype(int)

dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", video],
                           capture_output=True, text=True).stdout)
settled, last = frame(SETTLED_T), frame(dur - 0.05)
fails = []

hold = np.abs(settled - last).max(2)
if (hold > 40).sum() > 200:
    fails.append(f"hold to cut: {(hold > 40).sum()} px changed between {SETTLED_T}s and the last frame")

ref = np.asarray(Image.open(REF).convert("RGB")).astype(int)
x0, y0, x1, y1 = BAND
art = np.abs(settled[y0:y1, x0:x1] - ref[y0:y1, x0:x1]).max(2)
bad = int((art > ART_DIFF).sum())
if bad > 400:
    ys, xs = np.nonzero(art > ART_DIFF)
    fails.append(f"settled art: {bad} px differ from approved card, bbox x{xs.min()}-{xs.max()} y{ys.min()+y0}-{ys.max()+y0}")

print("\n".join(fails) if fails else "ok: holds to the cut; settled art matches the approved card")
print("FAIL" if fails else "PASS")
sys.exit(1 if fails else 0)
