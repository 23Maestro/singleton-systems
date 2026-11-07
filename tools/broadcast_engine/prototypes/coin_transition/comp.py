"""Comp the 3D coin layer over Mark -> film burn -> grainy blue -> light leak -> Lane 4. 1920x1080, 25 fps.
Usage: python3 comp.py <workdir> <pattern.png> <outdir>"""
import math, sys, os
import numpy as np
from PIL import Image, ImageFilter

D, WORDMARK, OUT = sys.argv[1], sys.argv[2], sys.argv[3]; os.makedirs(OUT, exist_ok=True)
W, H = 1920, 1080
LAND, EXIT = 11, 30; LEAK = EXIT + 4; T0 = 25
CX, CY = W // 2, int(H * 0.46)
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
clamp = lambda t: max(0.0, min(1.0, t))
rng = np.random.default_rng(7)

def fbm(seed, octaves):
    r = np.random.default_rng(seed); acc = np.zeros((H, W), np.float32); amp, tot = 1.0, 0
    for o in range(octaves):
        n = 3 * 2 ** o; g = r.random((n, int(n * W / H) + 1)).astype(np.float32)
        acc += amp * np.array(Image.fromarray((g * 255).astype(np.uint8)).resize((W, H), Image.BICUBIC)).astype(np.float32) / 255
        tot += amp; amp *= 0.55
    return acc / tot
BURN_N, BLOTCH = fbm(3, 4), fbm(11, 3)
FIELD = np.sqrt((xx / W) ** 2 + ((H - yy) / H) ** 2) / math.sqrt(2) + (BURN_N - 0.5) * 0.32

def blue_bg():
    v = (yy / H)[..., None]
    g = np.array([60, 150, 214]) * (1 - v) ** 1.3 + np.array([9, 34, 66]) * (1 - (1 - v) ** 1.3)
    d = np.sqrt(((xx - CX) / 630) ** 2 + ((yy - CY) / 495) ** 2)[..., None]
    g = g * (0.55 + 0.45 * np.clip(d, 0, 1))
    return g.astype(np.float32)
BG = blue_bg()

def pattern_mask():
    """Tile the official LINEUPS wordmark (Eagle MSJBJEAIJAIYL, up-arrow U) in offset rows."""
    wm = Image.open(WORDMARK).convert("RGBA").getchannel("A")
    th = 26; tw = round(wm.width * th / wm.height); gap = 18; pitch = 40
    tile = wm.resize((tw, th), Image.LANCZOS)
    m = Image.new("L", (W + 2 * (tw + gap), H), 0)
    for r, y in enumerate(range(7, H, pitch)):
        x0 = -((tw + gap) // 2) * (r % 2)
        for x in range(x0, m.width, tw + gap): m.paste(tile, (x, y))
    global PERIOD; PERIOD = tw + gap
    return np.array(m).astype(np.float32) / 255   # W + 2 periods wide; bg_frame slides a W window
PM = pattern_mask()
PSTR = float(os.environ.get("PSTR", "0.16"))

def bg_frame(fr):
    off = int(fr * 1.5) % PERIOD                    # slow drift, seamless
    pm = PM[:, PERIOD - off: PERIOD - off + W]          # slow drift so the type reads as a surface
    lift = pm * (PSTR * (0.7 + 0.6 * BLOTCH))        # patchy, never uniform
    g = BG * (0.94 + 0.12 * BLOTCH[..., None])
    g = g + (np.array([170, 215, 245]) - g) * lift[..., None]
    return g + rng.normal(0, 7.5, (H, W, 1)).astype(np.float32)

# first frame the whole coin is on screen (from the 3D layer's alpha)
def full_in(t):
    p = os.path.join(D, "layer", f"{t:03d}.png")
    a = np.array(Image.open(p))[..., 3] > 8
    ys, xs = np.where(a)
    return len(xs) and xs.min() > 0 and ys.max() < H - 1
TB = next(t for t in range(LAND + 1) if full_in(t))
print("burn starts at t", TB)

ld = lambda sub, i: np.array(Image.open(os.path.join(D, sub, f"{i:03d}.png")).convert("RGB")).astype(np.float32)
total = T0 + LEAK + 62
for fr in range(total):
    t = fr - T0
    img = ld("mark", min(fr, 59) + 1) if t < LAND + 4 else None
    if t < 0:
        out = img
    else:
        u = clamp((t - TB) / (LAND + 3 - TB)); p = -0.15 + 1.75 * u * u * (3 - 2 * u) if t >= TB else -1
        bg = bg_frame(fr)
        if p < 1.6:
            a = np.clip((p - FIELD) / 0.035, 0, 1)[..., None]
            out = img * (1 - a) + bg * a
            on = float(-0.1 < p < 1.5)
            out += on * (np.exp(-((FIELD - p) / 0.022) ** 2)[..., None] * np.array([255, 240, 215]) * 0.9
                         + np.exp(-((FIELD - p - 0.03) / 0.07) ** 2)[..., None] * np.array([255, 140, 50]) * 0.55)
        else:
            out = bg
        if t <= EXIT + 10:
            L = Image.open(os.path.join(D, "layer", f"{t:03d}.png")).convert("RGBA")
            la = np.array(L).astype(np.float32) / 255
            # contact shadow from the layer alpha, pushed down
            sh = np.array(Image.fromarray((la[..., 3] * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(34))).astype(np.float32) / 255
            sh = np.vstack([np.zeros((48, W), np.float32), sh[:-48]]) * 0.55   # shift down, no wrap to the top edge
            out = out * (1 - sh[..., None]) + np.array([0, 6, 18]) * sh[..., None]
            out = out * (1 - la[..., 3:]) + la[..., :3] * 255 * la[..., 3:]
        # light leak goes over the coin too: whatever the band has passed is gone
        if t >= LEAK:
            q = clamp((t - LEAK) / 12) * 1.5 - 0.25
            pos = xx / W * 0.8 + yy / H * 0.2
            l4 = ld("l4", min(t - LEAK, 89) + 1)
            out = np.where((pos < q)[..., None], l4, out)
            out = out + np.exp(-((pos - q) / 0.06) ** 2)[..., None] * np.array([255, 236, 200]) * 0.95
    Image.fromarray(np.clip(out, 0, 255).astype(np.uint8)).save(os.path.join(OUT, f"{fr:03d}.png"))
print("frames", total, "LAND", T0 + LAND, "EXIT", T0 + EXIT)
