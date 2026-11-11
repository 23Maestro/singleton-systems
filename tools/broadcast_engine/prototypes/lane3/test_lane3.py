"""Checks for 23M-393 (ground shadows) and 23M-394 (number glyphs). Writes a review still.

Usage: Blender -b --factory-startup --python-exit-code 1 -P test_lane3.py -- <out_dir> [half]
"""
import bpy, sys, os, math
import numpy as np
from bpy_extras.object_utils import world_to_camera_view
from mathutils import Vector
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import lane3 as L

args = sys.argv[sys.argv.index("--") + 1:]
OUT = args[0]; os.makedirs(OUT, exist_ok=True)
RES = (960, 540) if "half" in args else (1920, 1080)

# ---- glyph check: every glyph builds, an unknown one is refused
sc = L.new_scene(RES, samples=32)
for g in sorted(L.GLYPHS):
    o = L.number(g); bpy.context.view_layer.update()
    assert o.dimensions.x > 0.05 and o.dimensions.z > 0.01, f"glyph {g!r} built empty"
try:
    L.number("38A"); raise AssertionError("unknown glyph was accepted")
except ValueError:
    pass
print("PASS glyphs", len(L.GLYPHS))

# ---- shadow check: a card and number standing on the turf darken the turf beside them
sc = L.new_scene(RES, samples=32)
L.build_set(sc)
card = bpy.data.objects.new("Card", None)
bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, 1.25)); card = bpy.context.object; card.name = "Card"
card.scale = (1.7, 0.08, 2.5); card.data.materials.append(L.mat("Card", "#1A1A1A", rough=0.5))
num = L.number("4,000+", height=0.9); num.location = (1.2, -0.6, 0.0)
cam = L.camera(sc, (-1.0, -9.5, 1.7), (0.8, 0, 1.0), lens=40)

def render(path):
    sc.render.filepath = path; bpy.ops.render.render(write_still=True)
    im = bpy.data.images.load(path); a = np.array(im.pixels[:]).reshape(im.size[1], im.size[0], 4)[::-1, :, :3]
    bpy.data.images.remove(im); return a @ np.array([0.2126, 0.7152, 0.0722])

lit = render(f"{OUT}/set_shadow_check.png")
for o in (card, num): o.hide_render = True
bare = render(f"{OUT}/set_bare.png")
for o in (card, num): o.hide_render = False

# region: turf just in front of each object's base, where the key light throws its shadow
H, W = lit.shape
def base_box(o, ahead=1.6):
    bpy.context.view_layer.update()
    pts = [o.matrix_world @ Vector(c) for c in o.bound_box]
    xs = [p.x for p in pts]; y0 = min(p.y for p in pts)
    ground = [Vector((x, y, 0.005)) for x in (min(xs), max(xs)) for y in (y0 - ahead, y0)]
    sv = [world_to_camera_view(sc, cam, p) for p in ground]
    x0, x1 = int(min(v.x for v in sv) * W), int(max(v.x for v in sv) * W)
    yt, yb = int((1 - max(v.y for v in sv)) * H), int((1 - min(v.y for v in sv)) * H)
    return slice(max(yt, 0), min(yb, H)), slice(max(x0, 0), min(x1, W))

for o in (card, num):
    r = base_box(o)
    # glyph shadows are sparse, so measure how much of the turf is darkened by 30% or more, not the box mean
    shaded = (lit[r] < 0.7 * bare[r]).mean()
    print(f"{o.name}: {100 * shaded:.0f}% of turf ahead is in shadow")
    assert lit[r].size > 50, f"{o.name}: shadow region off screen"
    assert shaded > 0.15, f"{o.name}: no visible ground shadow ({100 * shaded:.0f}% shaded)"
# control: open turf with nothing standing on it must not read as shadow
r = (slice(int(H * 0.88), H), slice(0, int(W * 0.15)))
assert (lit[r] < 0.7 * bare[r]).mean() < 0.02, "shadow metric fires on open turf"
print("PASS shadows")
