"""Coin face masks, UPS trace-order map and ball textures.
Usage: python3 prep.py <logo.png> <outdir>"""
import math, sys, os
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy.spatial import cKDTree

LOGO, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
SC = 2  # 720 -> 1440
a = np.array(Image.open(LOGO).convert("RGBA")).astype(np.float32)
pad = (720 - a.shape[1]) // 2
sq = np.zeros((720, 720, 4), np.float32); sq[:, pad:pad + a.shape[1]] = a
sq = np.array(Image.fromarray(sq.astype(np.uint8)).resize((720 * SC, 720 * SC), Image.LANCZOS)).astype(np.float32)
white = np.clip((sq[..., 0] + sq[..., 1] + sq[..., 2] - 3 * 190) / (3 * 55), 0, 1) * (sq[..., 3] / 255)
N = 720 * SC; ly = np.arange(N)[:, None]
line_m = white * (ly < 355 * SC); ups_m = white * (ly >= 360 * SC)
save = lambda m, n: Image.fromarray((np.clip(m, 0, 1) * 255).astype(np.uint8)).save(os.path.join(OUT, n))
save(line_m, "line_mask.png"); save(ups_m, "ups_mask.png")
save(sq[..., 3] / 255, "disc_alpha.png")

# trace-order map: each UPS pixel gets the progress value (0..1) at which the pen reaches it
def arc(cx, cy, r, a0, a1, n=60):
    return [(cx + r * math.cos(math.radians(a0 + (a1 - a0) * i / n)), cy + r * math.sin(math.radians(a0 + (a1 - a0) * i / n))) for i in range(n + 1)]
U = [(124, 392), (124, 520)] + arc(180, 520, 56, 180, 0) + [(236, 520), (236, 372)]
P = [(316, 600), (316, 412), (385, 412)] + arc(385, 458, 46, -90, 90) + [(316, 504)]
S = arc(538, 448, 48, -15, -270, 50) + arc(530, 538, 56, -90, 175, 60)
GLYPHS = [(U, (95, 300)), (P, (285, 455)), (S, (455, 625))]
order = np.ones((N, N), np.float32)
yy, xx = np.mgrid[0:N, 0:N]
for gi, (pts, (x0, x1)) in enumerate(GLYPHS):
    pts = np.array(pts, np.float32) + [pad, 0]
    seg = np.linalg.norm(np.diff(pts, axis=0), axis=1); cum = np.concatenate([[0], np.cumsum(seg)])
    dense = []; fr = []
    for i in range(len(seg)):
        n = max(int(seg[i] / 0.5), 1)
        for k in range(n):
            dense.append(pts[i] + (pts[i + 1] - pts[i]) * k / n); fr.append((cum[i] + seg[i] * k / n) / cum[-1])
    tree = cKDTree(np.array(dense) * SC)
    sel = (ups_m > 0.01) & (xx >= (x0 + pad) * SC) & (xx < (x1 + pad) * SC)
    _, idx = tree.query(np.stack([xx[sel], yy[sel]], 1))
    order[sel] = gi * 0.28 + 0.44 * np.array(fr)[idx]
Image.fromarray((np.clip(order, 0, 1) * 65535).astype(np.uint16)).save(os.path.join(OUT, "ups_order.png"))

# ball textures, equirect 2048x1024 (u = lon, v = lat)
W, H = 2048, 1024
lon = (np.arange(W)[None] / W) * 2 * np.pi - np.pi; lat = np.pi / 2 - (np.arange(H)[:, None] / H) * np.pi
X = np.cos(lat) * np.cos(lon); Y = np.cos(lat) * np.sin(lon); Z = np.sin(lat) * np.ones_like(lon)
rng = np.random.default_rng(1)
def grain(s):  # pebble / leather noise
    g = rng.random((H // s, W // s)).astype(np.float32)
    return np.array(Image.fromarray((g * 255).astype(np.uint8)).resize((W, H), Image.BICUBIC)).astype(np.float32) / 255
def line_dist(f):  # distance-ish to the zero set of f, in radians
    gy, gx = np.gradient(f); g = np.sqrt(gx ** 2 + gy ** 2) + 1e-6
    return np.abs(f) / g * (np.pi / H)
def saveimg(rgb, n): Image.fromarray(np.clip(rgb, 0, 255).astype(np.uint8)).save(os.path.join(OUT, n))

# basketball: orange pebble, black channels on two great circles + two curved seams
col = np.array([214, 104, 38], np.float32) * (0.88 + 0.12 * grain(4))[..., None]
seam = np.zeros((H, W), bool)
for f in (X, Y, Z * 1.0):
    seam |= line_dist(f) < 0.022
curve = np.abs(Y) - (0.62 + 0.18 * Z ** 2)  # the two side ovals
seam |= line_dist(curve * (np.abs(X) > -1)) < 0.022
col[seam] = [22, 14, 10]
saveimg(col, "ball_basketball.png")

# baseball: white leather, red double-stitch seam (tennis-ball curve)
col = np.array([244, 241, 232], np.float32) * (0.95 + 0.05 * grain(8))[..., None]
seamf = Z - 0.75 * np.sin(2 * lon) * np.cos(lat) ** 1.0 * 0.9
d = line_dist(seamf)
stitch = ((d > 0.03) & (d < 0.06)) & (np.sin(lon * 90 + lat * 40) > 0.2)
col[stitch] = [200, 28, 36]; col[d < 0.012] *= 0.85
saveimg(col, "ball_baseball.png")

# football: brown pebble leather, white laces + stripes; long axis = X (lon 0 / pi are the tips)
col = np.array([112, 52, 26], np.float32) * (0.82 + 0.18 * grain(3))[..., None]
lace_zone = (np.abs(lon - np.pi / 2) < 0.42) & (np.abs(lat) < 0.04)
col[lace_zone] = [245, 242, 235]
for k in range(-6, 7):
    stitch = (np.abs(lon - (np.pi / 2 + k * 0.065)) < 0.012) & (np.abs(lat) < 0.11)
    col[stitch] = [245, 242, 235]
for s in (-1, 1):
    col[np.abs(X - s * 0.80) < 0.035] = [238, 236, 230]   # stripe rings near each tip
col[line_dist(Z) < 0.008] *= 0.6
saveimg(col, "ball_football.png")
print("ok", order[ups_m > 0.5].min(), order[ups_m > 0.5].max())

# soccer: truncated icosahedron = nearest of 12 pentagon + 20 hexagon centers
phi = (1 + 5 ** 0.5) / 2
ico = np.array([(0, s1, s2 * phi) for s1 in (-1, 1) for s2 in (-1, 1)] + [(s1, s2 * phi, 0) for s1 in (-1, 1) for s2 in (-1, 1)]
               + [(s2 * phi, 0, s1) for s1 in (-1, 1) for s2 in (-1, 1)], float)
dod = np.array([(a, b, c) for a in (-1, 1) for b in (-1, 1) for c in (-1, 1)] + [(0, s1 / phi, s2 * phi) for s1 in (-1, 1) for s2 in (-1, 1)]
               + [(s1 / phi, s2 * phi, 0) for s1 in (-1, 1) for s2 in (-1, 1)] + [(s2 * phi, 0, s1 / phi) for s1 in (-1, 1) for s2 in (-1, 1)], float)
C = np.concatenate([ico / np.linalg.norm(ico, axis=1)[:, None], dod / np.linalg.norm(dod, axis=1)[:, None]])
P = np.stack([X, Y, Z], -1).reshape(-1, 3)
dots = P @ C.T; dots[:, :12] -= 0.03; srt = np.sort(dots, 1)  # shrink pentagons toward real proportions
near = dots.argmax(1); edge = (srt[:, -1] - srt[:, -2]) < 0.008
col = np.where((near < 12)[:, None], [[24, 24, 28]], [[246, 246, 244]]).astype(np.float32)
col[edge] = [70, 70, 74]
col = col.reshape(H, W, 3) * (0.94 + 0.06 * grain(6))[..., None]
saveimg(col, "ball_soccer.png")

# tennis: optic yellow felt, white curved seam
col = np.array([214, 230, 62], np.float32) * (0.88 + 0.12 * grain(2))[..., None]
col[line_dist(Z - 0.75 * np.sin(2 * lon) * np.cos(lat) * 0.9) < 0.028] = [246, 246, 238]
saveimg(col, "ball_tennis.png")
print("ok soccer tennis")
