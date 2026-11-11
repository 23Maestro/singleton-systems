"""Lane 3 stat card: the W9 player card rebuilt as Blender layers with 3D parallax (the Lane 4 approach).

Usage: Blender -b --factory-startup --python-exit-code 1 -P build_card.py -- <cards/x.json> <out_dir> [still FRAME | anim] [half]
The layout is the W9 card in 1920x1080 pixels. Each layer sits at its own depth but keeps its pixel position
when the camera is home (frame 30), so the camera arrival and drift give real parallax. Everything that
changes per player comes from the card file (see card_data.py). 25 fps; cue frames come from the episode edit.
"""
import bpy, sys, os, math
import numpy as np
from mathutils import Vector, Matrix
from bpy_extras.object_utils import world_to_camera_view
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
from card_data import load

args = sys.argv[sys.argv.index("--") + 1:]
D = load(args[0]); OUT = args[1]; os.makedirs(OUT, exist_ok=True)
MODE = args[2] if len(args) > 2 else "still"
RES = (960, 540) if "half" in args else (1920, 1080)
N, C = D["frames"], D["colors"]
FT = "/Users/singleton23/Library/Fonts/"
F_NAME, F_TAG = FT + "Antonio-SemiBold.ttf", FT + "Archivo-Black.ttf"
F_NUM, F_LAB, F_TAGLINE = FT + "Archivo-ExtraBold.ttf", FT + "Archivo-ExtraBoldItalic.ttf", FT + "Archivo-Bold.ttf"
PLATE = "/Volumes/HomeSSD/Generated/CATENA_MEDIA_LINEUPS/references/field-night-no-football.png"
SCRATCH = "/Volumes/HomeSSD/Generated/SINGLETON_SYSTEMS/lookdev/ambientcg/Metal038/Metal038_2K-JPG_Roughness.jpg"
HOME = 30                                  # the camera is home here; layout is exact at this frame
LENS = 50.0                                # 36 mm sensor, horizontal fit

# depth of each layer (metres from the home camera). Bigger gaps = more parallax.
Z_PLATE, Z_PANEL, Z_ONPANEL, Z_STATS, Z_ONSTATS, Z_TAGLINE, Z_PLAYER = 90.0, 24.0, 23.85, 22.0, 21.9, 21.6, 19.4

# ---------------------------------------------------------------- scene
bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
sc.render.engine = "BLENDER_EEVEE"; sc.render.resolution_x, sc.render.resolution_y = RES
sc.render.fps = 25; sc.frame_start, sc.frame_end = 1, N
sc.view_settings.view_transform = "Standard"; sc.view_settings.look = "None"
sc.eevee.taa_render_samples = 64; sc.eevee.use_raytracing = False   # screen-space tracing ghosted the white type onto the panel
sc.render.use_motion_blur = True; sc.render.motion_blur_shutter = 0.5
w = bpy.data.worlds.new("W"); sc.world = w; w.use_nodes = True
w.node_tree.nodes["Background"].inputs["Color"].default_value = (0.004, 0.006, 0.01, 1)

def lin(h):
    h = h.lstrip("#"); c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return (*[v / 12.92 if v <= 0.04045 else ((v + 0.055) / 1.055) ** 2.4 for v in c], 1.0)

def px(u, v, d):
    """Pixel (u, v) on the 1920x1080 layout, pushed to depth d, as a world point (camera home at the origin, looking +y)."""
    s = 36.0 / LENS * d / 1920.0
    return Vector(((u - 960) * s, d, (540 - v) * s))

def pscale(d): return 36.0 / LENS * d / 1920.0          # metres per layout pixel at depth d

def _fcurves(action):
    try:
        if len(action.fcurves): return action.fcurves
    except AttributeError:
        pass
    return [fc for l in getattr(action, "layers", []) for s in l.strips for cb in s.channelbags for fc in cb.fcurves]

def key(o, path, fv, interp="BEZIER", ease="EASE_OUT", back=1.4):
    for f, v in fv:
        setattr(o, path, v); o.keyframe_insert(data_path=path, frame=f)
    for fc in _fcurves(o.animation_data.action):
        if fc.data_path == path:
            for k in fc.keyframe_points:
                k.interpolation = interp; k.easing = ease
                if interp == "BACK": k.back = back

def card_mat(name, hexc, glow=0.85, rough=0.45, bump=None):
    """Holds the exact card colour (emission) but still takes light, shadow and sheen from the scene."""
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; p = nt.nodes["Principled BSDF"]
    c = lin(hexc); p.inputs["Base Color"].default_value = c; p.inputs["Roughness"].default_value = rough
    p.inputs["Emission Color"].default_value = c; p.inputs["Emission Strength"].default_value = glow
    p.inputs["Coat Weight"].default_value = 0.0
    if bump == "scratch":
        t = nt.nodes.new("ShaderNodeTexImage"); t.image = bpy.data.images.load(SCRATCH, check_existing=True)
        t.image.colorspace_settings.name = "Non-Color"
        tc = nt.nodes.new("ShaderNodeTexCoord"); mp = nt.nodes.new("ShaderNodeMapping"); mp.inputs["Scale"].default_value = (0.25, 0.25, 0.25)
        nt.links.new(tc.outputs["Object"], mp.inputs["Vector"]); nt.links.new(mp.outputs[0], t.inputs["Vector"])
        b = nt.nodes.new("ShaderNodeBump"); b.inputs["Strength"].default_value = 0.35
        nt.links.new(t.outputs["Color"], b.inputs["Height"]); nt.links.new(b.outputs[0], p.inputs["Normal"])
        nt.links.new(t.outputs["Color"], p.inputs["Coat Weight"])
    elif bump == "paper":
        nz = nt.nodes.new("ShaderNodeTexNoise"); nz.inputs["Scale"].default_value = 1.2; nz.inputs["Detail"].default_value = 6
        nz.inputs["Distortion"].default_value = 2.5
        b = nt.nodes.new("ShaderNodeBump"); b.inputs["Strength"].default_value = 0.12
        nt.links.new(nz.outputs["Fac"], b.inputs["Height"]); nt.links.new(b.outputs[0], p.inputs["Normal"])
    return m

def slab(name, u0, v0, u1, v1, d, m, thick=0.12, bevel=0.04, origin="CENTER", pts=None, radius=0):
    """A flat card piece covering layout pixels (u0,v0)-(u1,v1) at depth d. origin: CENTER, LEFT, RIGHT or BOTTOM edge."""
    s = pscale(d); W, H = (u1 - u0) * s, (v1 - v0) * s
    me = bpy.data.meshes.new(name)
    if pts:   # custom outline in 0..1 of the box (for the number badge)
        verts = [((x - 0.5) * W, 0, (0.5 - y) * H) for x, y in pts]
        me.from_pydata(verts, [], [list(range(len(verts)))])
    elif radius:   # rounded corners, radius in layout pixels
        r = radius * s; verts = []
        for cx, cz, a0 in ((W / 2 - r, H / 2 - r, 0), (-W / 2 + r, H / 2 - r, 90), (-W / 2 + r, -H / 2 + r, 180), (W / 2 - r, -H / 2 + r, 270)):
            for i in range(9):
                a = math.radians(a0 + i * 90 / 8); verts.append((cx + r * math.cos(a), 0, cz + r * math.sin(a)))
        verts.reverse()   # same winding as the plain box, so the thickness grows away from the camera
        me.from_pydata(verts, [], [list(range(len(verts)))])
    else:
        me.from_pydata([(-W / 2, 0, H / 2), (W / 2, 0, H / 2), (W / 2, 0, -H / 2), (-W / 2, 0, -H / 2)], [], [(0, 1, 2, 3)])
    o = bpy.data.objects.new(name, me); sc.collection.objects.link(o)
    sol = o.modifiers.new("S", "SOLIDIFY"); sol.thickness = thick; sol.offset = 1.0
    bv = o.modifiers.new("B", "BEVEL"); bv.width = bevel; bv.segments = 3; bv.limit_method = "ANGLE"
    o.data.materials.append(m)
    shift = {"CENTER": Vector((0, 0, 0)), "LEFT": Vector((W / 2, 0, 0)), "RIGHT": Vector((-W / 2, 0, 0)), "BOTTOM": Vector((0, 0, H / 2))}[origin]
    me.transform(Matrix.Translation(shift))
    o.location = px((u0 + u1) / 2, (v0 + v1) / 2, d) - shift
    return o

def image_plane(name, path, d, glow=1.0):
    im = bpy.data.images.load(path, check_existing=True); im.alpha_mode = "STRAIGHT"
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; p = nt.nodes["Principled BSDF"]
    t = nt.nodes.new("ShaderNodeTexImage"); t.image = im; t.interpolation = "Cubic"
    nt.links.new(t.outputs["Color"], p.inputs["Base Color"]); nt.links.new(t.outputs["Color"], p.inputs["Emission Color"])
    nt.links.new(t.outputs["Alpha"], p.inputs["Alpha"]); p.inputs["Emission Strength"].default_value = glow
    p.inputs["Roughness"].default_value = 0.6; m.surface_render_method = "DITHERED"
    bpy.ops.mesh.primitive_plane_add(size=1, rotation=(math.radians(90), 0, 0)); o = bpy.context.object; o.name = name
    o.data.materials.append(m); return o, im

def alpha_bbox(im):
    a = np.array(im.pixels[:]).reshape(im.size[1], im.size[0], 4)[::-1, :, 3]
    ys, xs = np.nonzero(a > 0.1)
    return xs.min() / im.size[0], ys.min() / im.size[1], (xs.max() + 1) / im.size[0], (ys.max() + 1) / im.size[1]

def fit_image(o, im, u0, v0, u1, v1, d, anchor="BOTTOM"):
    """Scale an alpha image so its visible pixels fill the layout box height, bottom-aligned and centred."""
    bx0, by0, bx1, by1 = alpha_bbox(im); s = pscale(d)
    ih = (v1 - v0) * s / (by1 - by0); iw = ih * im.size[0] / im.size[1]
    o.scale = (iw, ih, 1)
    cx = (bx0 + bx1) / 2 - 0.5; cy = 0.5 - (by0 + by1) / 2          # visible centre offset inside the plane
    target = px((u0 + u1) / 2, (v0 + v1) / 2, d)
    o.location = target - Vector((cx * iw, 0, cy * ih))

def text(body, font, hexc, cap_px, d, glow=1.0):
    """Extruded type sized by its ink height in layout pixels. Returns the object; place it with put()."""
    cu = bpy.data.curves.new("t", "FONT"); cu.body = body; cu.font = bpy.data.fonts.load(font, check_existing=True)
    cu.size = 1.0; cu.extrude = 0.02; cu.align_x = "LEFT"; cu.align_y = "BOTTOM_BASELINE"
    o = bpy.data.objects.new("T " + body[:14], cu); sc.collection.objects.link(o)
    o.rotation_euler = (math.radians(90), 0, 0); o.location = (0, d, 0)
    o.data.materials.append(card_mat("TM " + body[:10], hexc, glow=glow, rough=0.5))
    bpy.context.view_layer.update()
    k = cap_px * pscale(d) / max(o.dimensions.y, 1e-6)       # curve local y is world z after the 90 deg turn
    o.scale = (k, k, k); bpy.context.view_layer.update()
    return o

def ink(o):
    bpy.context.view_layer.update(); p = [o.matrix_world @ Vector(c) for c in o.bound_box]
    return min(q.x for q in p), max(q.x for q in p), min(q.z for q in p), max(q.z for q in p)

def width_px(o): x0, x1, _, _ = ink(o); return (x1 - x0) / pscale(o.location.y)

def put(o, u, v, ux="LEFT", vy="TOP"):
    """Move o so its ink box edge (ux: LEFT/CENTER/RIGHT, vy: TOP/BOTTOM/CENTER) lands on layout pixel (u, v)."""
    d = o.location.y; x0, x1, z0, z1 = ink(o); t = px(u, v, d)
    ax = {"LEFT": x0, "CENTER": (x0 + x1) / 2, "RIGHT": x1}[ux]; az = {"TOP": z1, "BOTTOM": z0, "CENTER": (z0 + z1) / 2}[vy]
    o.location.x += t.x - ax; o.location.z += t.z - az

def shrink_to(o, max_px):
    wpx = width_px(o)
    if wpx > max_px:
        o.scale *= max_px / wpx; bpy.context.view_layer.update()

# ---------------------------------------------------------------- far layer: stadium plate
plate, pim = image_plane("Plate", PLATE, Z_PLATE, glow=0.55)
s = pscale(Z_PLATE); plate.scale = (1920 * s * 1.3, 1080 * s * 1.3, 1); plate.location = px(960, 540, Z_PLATE)
# The 3/4 camera arrival sees past the photo's edge. Grow the plane 3x and mirror-tile the
# texture outward, so the home frame shows the same photo at the same size.
PLATE_GROW = 3.0
plate.scale = tuple(v * PLATE_GROW for v in plate.scale[:2]) + (1,)
for l in plate.data.uv_layers.active.data: l.uv = (l.uv - Vector((0.5, 0.5))) * PLATE_GROW + Vector((0.5, 0.5))
plate.active_material.node_tree.nodes["Image Texture"].extension = "MIRROR"
key(plate, "scale", [(1, tuple(plate.scale)), (N, tuple(v * 1.04 for v in plate.scale))], ease="EASE_IN_OUT")

# ---------------------------------------------------------------- panel layer
panel = slab("Panel", 195, 147, 1462, 973, Z_PANEL, card_mat("Panel", C["panel"], glow=0.8, rough=0.9, bump="scratch"), thick=0.2, bevel=0.06, origin="LEFT", radius=22)
tag = slab("Tag", 852, 157, 980, 219, Z_ONPANEL, card_mat("Tag", C["tag"], glow=0.95), thick=0.06, bevel=0.015, origin="BOTTOM")
tag_t = text(D["position"], F_TAG, C["tag_text"], 40, Z_ONPANEL - 0.1); put(tag_t, 916, 188, "CENTER", "CENTER")
shield = [(0, 0), (1, 0), (1, 0.82), (0.5, 1), (0, 0.82)]
badge = slab("Badge", 730, 180, 822, 335, Z_ONPANEL, card_mat("Badge", C["badge"], glow=0.9), thick=0.06, bevel=0.015, pts=shield)
num = text(D["number"], F_NAME, "#FFFFFF", 64, Z_ONPANEL - 0.1); put(num, 776, 245, "CENTER", "TOP")
names = []
for line, (top, cap) in zip(D["name_lines"], ((230, 95), (340, 92))):
    t = text(line, F_NAME, "#FFFFFF", cap, Z_ONPANEL - 0.05); shrink_to(t, 375); put(t, 850, top, "LEFT", "TOP"); names.append(t)
logo, lim = image_plane("Logo", D["logo"], Z_ONPANEL - 0.05); fit_image(logo, lim, 1240, 160, 1430, 350, Z_ONPANEL - 0.05)

# ---------------------------------------------------------------- stats layer
stats = slab("Stats", 735, 484, 1803, 835, Z_STATS, card_mat("Paper", "#ECECEC", glow=0.82, rough=0.7, bump="paper"), thick=0.12, bevel=0.03, origin="BOTTOM")
cols = []
for x in D["stats"]:
    n = text(x["value"], F_NUM, "#0E192D", 86, Z_ONSTATS)
    l = text(x["label"], F_LAB, "#2E2E2E", 47, Z_ONSTATS)
    cols.append((x, n, l))
GAP = 62
widths = [max(width_px(n), width_px(l)) for _, n, l in cols]
k = min(1.0, (1803 - 735 - 120 - GAP * (len(cols) - 1)) / sum(widths))   # long labels shrink together
if k < 1:
    for _, n, l in cols:
        for o in (n, l): o.scale *= k
    widths = [w_ * k for w_ in widths]
u = 1269 - (sum(widths) + GAP * (len(cols) - 1)) / 2
for (x, n, l), w_ in zip(cols, widths):
    put(n, u + w_ / 2, 592, "CENTER", "TOP"); put(l, u + w_ / 2, 770, "CENTER", "BOTTOM"); u += w_ + GAP

# ---------------------------------------------------------------- tagline
tg = None
if D.get("tagline"):
    tg_t = text(D["tagline"], F_TAGLINE, "#FFFFFF", 47, Z_TAGLINE - 0.1)
    tw = width_px(tg_t)
    tg = slab("TaglineBox", 1407 - tw - 36, 893, 1407, 957, Z_TAGLINE, card_mat("TagBox", "#000000", glow=0.0, rough=0.4), thick=0.06, bevel=0.01, origin="RIGHT")
    put(tg_t, 1407 - 18, 925, "RIGHT", "CENTER")

# ---------------------------------------------------------------- front layer: the Figma cutout
player, cim = image_plane("Player", D["cutout"], Z_PLAYER, glow=0.9); fit_image(player, cim, 232, 190, 705, 960, Z_PLAYER)

# ---------------------------------------------------------------- light: soft key from the upper left so the stats card and player shadow the panel
sun = bpy.data.lights.new("Key", "SUN"); sun.energy = 2.2; sun.angle = math.radians(8)
so = bpy.data.objects.new("Key", sun); sc.collection.objects.link(so); so.rotation_euler = (math.radians(60), math.radians(-22), math.radians(-12))

# ---------------------------------------------------------------- motion. Build in, breathe, hold. No exit; Premiere owns the cut.
def pop(o, f0, dur=8, interp="BACK", axis=None, start=0.0):
    full = tuple(o.scale); z = tuple(start if (axis is None or i in axis) else full[i] for i in range(3))
    key(o, "scale", [(f0, z), (f0 + dur, full)], interp=interp)

def slide(o, f0, du=0, dv=0, dur=10, interp="CUBIC"):
    end = o.location.copy(); s = pscale(o.location.y)
    key(o, "location", [(f0, end + Vector((du * s, 0, -dv * s))), (f0 + dur, end)], interp=interp)
    key(o, "scale", [(f0 - 1, (0, 0, 0)), (f0, tuple(o.scale))], interp="CONSTANT")

def turn(o, f0, dur, deg, axis=2, interp="EXPO"):
    """Rotate in from deg around one axis (2 = vertical, a door swing; 0 = horizontal, a flip) to the rest pose."""
    rest = o.rotation_euler.copy(); start = rest.copy(); start[axis] += math.radians(deg)
    key(o, "rotation_euler", [(f0, tuple(start)), (f0 + dur, tuple(rest))], interp=interp)

# panel swings open like a door on its left edge; everything on it follows once it lands
pop(panel, 1, 12, "EXPO", axis=(0,)); turn(panel, 1, 14, -70)
slide(player, 8, dv=140, dur=12, interp="BACK"); turn(player, 8, 14, 35)          # player rises and turns to camera
pop(tag, 13, 7, "BACK", axis=(2,)); turn(tag, 13, 9, 80, axis=0); slide(tag_t, 15, dv=-20, dur=6)
pop(badge, 14, 8, "EXPO", axis=(2,)); turn(badge, 14, 10, -60); slide(num, 16, du=-40, dur=8); turn(num, 16, 10, -70)
for i, t in enumerate(names):                                                       # name lines swing in from the right
    slide(t, 16 + 3 * i, du=120, dur=11); turn(t, 16 + 3 * i, 12, 75)
pop(logo, 20, 12, "BACK"); turn(logo, 20, 16, 180, interp="BACK")                  # logo spins round once
key(stats, "scale", [(23, (0, 0, 0)), (24, tuple(stats.scale))], interp="CONSTANT"); turn(stats, 24, 12, -95, axis=0)                     # stats card flips up on its bottom edge
for x, n, l in cols:
    f = x["frame"]
    pop(n, f - 6, 6, "BACK"); turn(n, f - 6, 8, 90)                                 # value spins round onto its cue
    slide(l, f - 3, dv=-30, dur=7); turn(l, f - 3, 8, -70, axis=0)                  # label tips up under it
if tg:
    f = D["tagline_frame"]; pop(tg, f - 8, 8, "EXPO", axis=(0,)); turn(tg, f - 8, 10, 70); slide(tg_t, f - 4, du=40, dur=6)

if tg: tg_t.visible_shadow = False

# a piece squashed to zero scale still renders its bevel as a sliver, so hide each piece until it opens
for o in list(sc.objects):
    ad = o.animation_data
    if not (ad and ad.action): continue
    fcs = [fc for fc in _fcurves(ad.action) if fc.data_path == "scale"]
    if not fcs: continue
    first = next((f for f in range(1, N + 1) if all(fc.evaluate(f) > 1e-3 for fc in fcs)), 1)
    if first > 1:
        key(o, "hide_render", [(1, True), (first, False)], interp="CONSTANT")

cd = bpy.data.cameras.new("Cam"); cd.lens = LENS; cd.sensor_fit = "HORIZONTAL"; cd.sensor_width = 36
cd.dof.use_dof = True; cd.dof.aperture_fstop = 4.0; cd.dof.focus_distance = Z_STATS
cam = bpy.data.objects.new("Cam", cd); sc.collection.objects.link(cam); sc.camera = cam
aim = bpy.data.objects.new("Aim", None); sc.collection.objects.link(aim)
tc = cam.constraints.new("TRACK_TO"); tc.target = aim; tc.track_axis = "TRACK_NEGATIVE_Z"; tc.up_axis = "UP_Y"
key(cam, "location", [(1, (-7.5, -6.0, 2.4)), (HOME, (0, 0, 0)), (N, (1.6, 0.8, -0.35))], ease="EASE_OUT")
key(aim, "location", [(1, (-1.0, Z_STATS, 0.4)), (HOME, (0, Z_STATS, 0)), (N, (0.45, Z_STATS, -0.1))], ease="EASE_OUT")

# ---------------------------------------------------------------- checks: every value lands on its cue frame; nothing leaves the frame
for x, n, _ in cols:
    sc.frame_set(x["frame"] - 7); assert max(n.scale) < 1e-3, f"{x['value']} shows before its cue"
    sc.frame_set(x["frame"]); full = n.scale.copy()
    sc.frame_set(N); assert (n.scale - full).length < 1e-4, f"{x['value']} is not settled on cue frame {x['frame']}"
for fr in (HOME, N):
    sc.frame_set(fr); bpy.context.view_layer.update()
    for o in [panel, stats, logo] + names + [n for _, n, _ in cols] + [l for _, _, l in cols] + ([tg] if tg else []):
        for c in o.bound_box:
            v = world_to_camera_view(sc, cam, o.matrix_world @ Vector(c))
            assert 0.02 <= v.x <= 0.98 and 0.02 <= v.y <= 0.98, f"{o.name} leaves the frame at {fr} ({v.x:.2f}, {v.y:.2f})"
print("PASS cues land on their frames; PASS frame check")
sc.frame_set(1)

cg = bpy.data.node_groups.new("Comp", "CompositorNodeTree"); sc.compositing_node_group = cg
cg.interface.new_socket("Image", in_out="OUTPUT", socket_type="NodeSocketColor")
rl = cg.nodes.new("CompositorNodeRLayers"); gl = cg.nodes.new("CompositorNodeGlare"); go = cg.nodes.new("NodeGroupOutput")
gl.inputs["Type"].default_value = "Bloom"; gl.inputs["Threshold"].default_value = 1.2
gl.inputs["Strength"].default_value = 0.15; gl.inputs["Size"].default_value = 0.6
cg.links.new(rl.outputs["Image"], gl.inputs["Image"]); cg.links.new(gl.outputs[0], go.inputs[0])

bpy.ops.wm.save_as_mainfile(filepath=os.path.join(OUT, "lane3-card.blend"))
if MODE == "still":
    fr = int(args[3]) if len(args) > 3 and args[3].isdigit() else N
    sc.frame_set(fr); sc.render.filepath = os.path.join(OUT, f"card_{fr:03d}.png"); bpy.ops.render.render(write_still=True)
elif MODE == "anim":
    sc.render.filepath = os.path.join(OUT, "frames", "f_"); sc.render.image_settings.file_format = "PNG"
    bpy.ops.render.render(animation=True)
print("DONE", OUT)
