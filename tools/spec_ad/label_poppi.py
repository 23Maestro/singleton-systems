"""Flat 360-degree label for the poppi Cranberry Fizz can, redrawn in code from a reference look.
Usage: python3 label_poppi.py FONT_DIR OUT.png
The front of the can is the middle of the image (u = 0.5)."""
import math
import sys

from PIL import Image, ImageDraw, ImageFont

FD, OUT = sys.argv[1], sys.argv[2]
W, H = 4200, 2000  # 12 oz can: circumference / label height ~ 2.1
S = 3  # supersample
WHITE, RED, GREEN, LGREEN, PINK = (246, 244, 240), (226, 58, 46), (30, 110, 60), (70, 150, 90), (240, 110, 95)

im = Image.new("RGB", (W * S, H * S), WHITE)
d = ImageDraw.Draw(im)


def font(size, wght=900, soft=100):
    f = ImageFont.truetype(FD + "/Fraunces.ttf", int(size * S))
    f.set_variation_by_axes([144, wght, soft, 1])
    return f


def text(x, y, s, size, fill, angle=0, wght=900):
    """Draw text centred at (x, y) in label px, rotated by angle degrees."""
    f = font(size, wght)
    l, t, r, b = f.getbbox(s)
    tile = Image.new("L", (r - l + 40, b - t + 40), 0)
    ImageDraw.Draw(tile).text((20 - l, 20 - t), s, font=f, fill=255)
    tile = tile.rotate(angle, expand=True, resample=Image.BICUBIC)
    im.paste(Image.new("RGB", tile.size, fill), (int(x * S - tile.size[0] / 2), int(y * S - tile.size[1] / 2)), tile)


def berry(x, y, r, rot=0):
    """Red cranberry disc with the white concave-diamond mark and a red dot."""
    d.ellipse([(x - r) * S, (y - r) * S, (x + r) * S, (y + r) * S], fill=RED)
    pts = []
    for i in range(80):
        t = i / 80 * 2 * math.pi
        c, s = math.cos(t), math.sin(t)
        px = math.copysign(abs(c) ** 2.4, c) * r * 0.5
        py = math.copysign(abs(s) ** 2.4, s) * r * 0.5
        a = math.radians(rot + 45)
        pts.append(((x + px * math.cos(a) - py * math.sin(a)) * S, (y + px * math.sin(a) + py * math.cos(a)) * S))
    d.polygon(pts, fill=WHITE)
    d.ellipse([(x - r * 0.13) * S, (y - r * 0.1) * S, (x + r * 0.13) * S, (y + r * 0.16) * S], fill=RED)


def flake(x, y, r, col):
    w = max(2, int(r * 0.09 * S))
    for k in range(6):
        a = math.radians(k * 60)
        ex, ey = x + r * math.cos(a), y + r * math.sin(a)
        d.line([(x * S, y * S), (ex * S, ey * S)], fill=col, width=w)
        for f, br in ((0.55, 0.32), (0.8, 0.22)):
            bx, by = x + r * f * math.cos(a), y + r * f * math.sin(a)
            for side in (-1, 1):
                b2 = a + side * math.radians(45)
                d.line([(bx * S, by * S), ((bx + r * br * math.cos(b2)) * S, (by + r * br * math.sin(b2)) * S)], fill=col, width=w)


def sparkle(x, y, r, col):
    pts = []
    for i in range(8):
        a = math.radians(i * 45 - 90)
        rr = r if i % 2 == 0 else r * 0.25
        pts.append(((x + rr * math.cos(a)) * S, (y + rr * math.sin(a)) * S))
    d.polygon(pts, fill=col)


def gift(x, y, s):
    w = int(s * 0.07 * S)
    d.rectangle([(x - s / 2) * S, (y - s / 2) * S, (x + s / 2) * S, (y + s / 2) * S], outline=GREEN, width=w)
    d.line([(x * S, (y - s / 2) * S), (x * S, (y + s / 2) * S)], fill=RED, width=w)
    d.line([((x - s / 2) * S, (y - s * 0.1) * S), ((x + s / 2) * S, (y - s * 0.1) * S)], fill=RED, width=w)
    for side in (-1, 1):
        d.ellipse([(x + side * s * 0.22 - s * 0.16) * S, (y - s * 0.78) * S, (x + side * s * 0.22 + s * 0.16) * S, (y - s * 0.5) * S], outline=RED, width=w)


def cane(x, y, h):
    w = int(h * 0.13 * S)
    d.line([(x * S, (y + h / 2) * S), (x * S, (y - h * 0.25) * S)], fill=RED, width=w)
    d.arc([(x) * S, (y - h / 2) * S, (x + h * 0.45) * S, (y - h * 0.05) * S], 180, 360, fill=RED, width=w)
    for k in range(4):  # white stripes
        yy = y + h * (0.4 - k * 0.18)
        d.line([((x - h * 0.07) * S, yy * S), ((x + h * 0.07) * S, (yy - h * 0.06) * S)], fill=WHITE, width=max(2, w // 3))


def sugar(x, y, r):
    d.ellipse([(x - r) * S, (y - r) * S, (x + r) * S, (y + r) * S], fill=GREEN)
    text(x, y - r * 0.28, "5g", r * 0.5, WHITE)
    text(x, y + r * 0.28, "Sugar", r * 0.38, WHITE)


def tree(x, y, h, col):
    for k, f in enumerate((0.0, 0.3, 0.6)):
        top = y - h / 2 + h * f
        half = h * (0.18 + 0.08 * k)
        d.polygon([(x * S, top * S), ((x - half) * S, (top + h * 0.38) * S), ((x + half) * S, (top + h * 0.38) * S)], fill=col)


# one panel = half the can; draw the art twice so every angle has a full front
for off in (0, W / 2, W):
    cx = off + 420
    text(cx - 760, H * 0.5, "poppi", 520, GREEN, angle=90)
    text(cx - 260, 190, "Cranberry Fizz", 125, RED)
    sugar(cx - 330, 520, 150)
    berry(cx + 70, 640, 260, rot=-8)
    text(cx + 330, 380, "pop!", 120, GREEN, angle=-22)
    gift(cx - 380, 960, 200)
    flake(cx + 60, 1060, 120, PINK)
    flake(cx - 480, 1350, 80, RED)
    sparkle(cx - 520, 760, 50, GREEN)
    sparkle(cx + 230, 1000, 35, GREEN)
    text(cx - 30, 1290, "be merry!", 170, GREEN, angle=18)
    berry(cx + 0, 1720, 400, rot=6)
    cane(cx + 430, 1230, 280)
    text(cx + 760, 640, "fizz!", 120, GREEN, angle=90)
    berry(cx + 850, 1200, 320, rot=-4)
    flake(cx + 720, 520, 120, RED)
    tree(cx + 700, 1650, 260, GREEN)
    sparkle(cx + 540, 1480, 40, GREEN)
    text(cx + 1000, 300, "Prebiotic Soda", 95, GREEN, wght=500)

im = im.resize((W, H), Image.LANCZOS)
im.save(OUT)
print("label", OUT, im.size)
