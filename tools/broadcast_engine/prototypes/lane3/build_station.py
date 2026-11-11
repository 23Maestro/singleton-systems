"""Lane 3 station template (23M-395, 23M-397): one Prime-style station on the stadium set, filled from a data file.

Usage: Blender -b --factory-startup --python-exit-code 1 -P build_station.py -- <players/x.json> <out_dir> [still FRAME | anim] [half]
Frames at 25 fps; cue frames come from the data file (see station_data.py). The camera arrives during frames 1 to 30.
"""
import bpy, sys, os, math, random
from mathutils import Vector
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import lane3 as L

args = sys.argv[sys.argv.index("--") + 1:]
from station_data import load
D = load(args[0]); args = args[1:]
OUT = args[0]; os.makedirs(OUT, exist_ok=True)
MODE = args[1] if len(args) > 1 else "still"
RES = (960, 540) if "half" in args else (1920, 1080)
random.seed(3)

ANTON = "/Users/singleton23/Library/Fonts/Anton-Regular.ttf"   # heavy condensed, the Prime type
N = D["frames"]
GLOW, ACCENT = D["colors"]["glow"], D["colors"]["accent"]

sc = L.new_scene(RES, samples=96)
sc.frame_start, sc.frame_end = 1, N
sc.render.use_motion_blur = True; sc.render.motion_blur_shutter = 0.5
L.build_set(sc)
bpy.data.objects["Stadium 1"].data.energy = 0.7e5   # shot lighting: dim the pool behind the type column so white labels read

def _fcurves(action):
    try:
        if len(action.fcurves): return action.fcurves
    except AttributeError:
        pass
    out = []
    for layer in getattr(action, "layers", []):
        for strip in layer.strips:
            for cb in strip.channelbags: out.extend(cb.fcurves)
    return out

def key(o, path, fv, ease="EASE_OUT", interp="BACK"):
    for f, v in fv:
        setattr(o, path, v); o.keyframe_insert(data_path=path, frame=f)
    for fc in _fcurves(o.animation_data.action):
        if fc.data_path == path:
            for k in fc.keyframe_points:
                k.interpolation = interp; k.easing = ease
                if interp == "BACK": k.back = 1.2

def word(body, size, color, x, z, y=0.0, extrude=0.03, emit=0.0):
    """One object per letter so each can fly in. Returns letters left to right and the word width."""
    font = bpy.data.fonts.load(ANTON, check_existing=True)
    m = L.mat(f"W {body[:6]} {color}", color, rough=0.45, emit=color if emit else None, estr=emit)
    # set the whole word once (real font spacing and kerning), then split it into letters
    cu = bpy.data.curves.new(f"w {body}", "FONT"); cu.body = body; cu.font = font; cu.size = size
    cu.extrude = extrude; cu.align_y = "BOTTOM_BASELINE"
    o = bpy.data.objects.new(f"w {body}", cu); sc.collection.objects.link(o); o.data.materials.append(m)
    o.rotation_euler = (math.radians(90), 0, 0); o.location = (x, y, z)
    for s in bpy.context.selected_objects: s.select_set(False)
    bpy.context.view_layer.objects.active = o; o.select_set(True)
    bpy.ops.object.convert(target="MESH")
    bpy.ops.object.mode_set(mode="EDIT"); bpy.ops.mesh.select_all(action="SELECT")
    bpy.ops.mesh.separate(type="LOOSE"); bpy.ops.object.mode_set(mode="OBJECT")
    parts = list(bpy.context.selected_objects)
    bpy.ops.object.origin_set(type="ORIGIN_GEOMETRY", center="BOUNDS")
    for s in parts: s.select_set(False)
    bpy.context.view_layer.update()
    out = sorted(parts, key=lambda p: p.matrix_world.translation.x)
    width = max(p.matrix_world.translation.x + p.dimensions.x / 2 for p in out) - x
    return out, width

# Motion spec (motion-graphics rules applied to the Prime beat sheet): every element gets its own ease,
# speed and entry direction; build, then breathe with one ambient move, then hold. No animation out.
def fly_in(objs, f0, stagger=1.0, dur=16):
    """Title letters: Prime scatter build. Scattered toward camera, settle with an expo ease (confident, 0.64 s)."""
    for i, o in enumerate(objs):
        f = int(f0 + i * stagger); end = o.location.copy(); er = o.rotation_euler.copy()
        start = end + Vector((random.uniform(-0.5, 0.5), random.uniform(-1.4, -0.6), random.uniform(-0.3, 0.7)))
        key(o, "location", [(f, start), (f + dur, end)], interp="EXPO")
        key(o, "rotation_euler", [(f, (er.x + random.uniform(-0.9, 0.9), random.uniform(-0.6, 0.6), random.uniform(-0.6, 0.6))), (f + dur, er)], interp="EXPO")
        key(o, "scale", [(f - 1, (0, 0, 0)), (f, (0.5, 0.5, 0.5)), (f + dur, (1, 1, 1))], interp="EXPO")

def sit_on(labs, n):
    """Put a label's ink bottom on the number's ink bottom (the number box includes the descender)."""
    bpy.context.view_layer.update()
    bot = lambda os_: min((o.matrix_world @ Vector(c)).z for o in os_ for c in o.bound_box)
    dz = bot([n]) - bot(labs)
    for o in labs: o.location.z += dz

def bright(n, strength=1.1):
    n.data.materials[0].node_tree.nodes["Principled BSDF"].inputs["Emission Strength"].default_value = strength

def word_fit(body, size, color, x, z, max_w, emit=0.0):
    """A word that shrinks to max_w metres when the copy runs long (long names, taglines)."""
    parts, w = word(body, size, color, x, z, emit=emit)
    if w <= max_w: return parts
    for o in parts: bpy.data.objects.remove(o)
    return word(body, size * max_w / w, color, x, z, emit=emit)[0]

def slide_in(objs, f0, dx=0.7, stagger=0.5, dur=10):
    """Labels and kicker: a tight slide from the side with a cubic ease (0.4 s); whole word in under 0.5 s."""
    for i, o in enumerate(objs):
        f = int(f0 + i * stagger); end = o.location.copy()
        key(o, "location", [(f, end + Vector((dx, 0, 0))), (f + dur, end)], interp="CUBIC")
        key(o, "scale", [(f - 1, (0, 0, 0)), (f, (1, 1, 1))], interp="CONSTANT")

def slam(o, f0, dur=8, big=False):
    """Numbers drop in from above with a tilt and a back ease (fast, 0.32 s). The total comes at the camera instead."""
    end = o.location.copy(); er = o.rotation_euler.copy()
    off = Vector((0.2, -1.6, 0.4)) if big else Vector((0.0, -0.2, 0.9))
    key(o, "location", [(f0, end + off), (f0 + dur, end)])
    key(o, "rotation_euler", [(f0, (er.x - (0.2 if big else 0.7), 0, -0.25 if big else 0.15)), (f0 + dur, er)])
    key(o, "scale", [(f0 - 1, (0, 0, 0)), (f0, (1.5, 1.5, 1.5) if big else (0.9, 0.9, 0.9)), (f0 + dur, (1, 1, 1))])

# ---------------------------------------------------------------- layout (metres). Everything stands on the turf (z=0).
# The stat block fills the frame: type sizes are set against the card, not against the stadium.
CW, CH, CX, CZ0 = 3.4, 4.3, -2.3, 0.15          # photo card
TX = -0.25                                       # type column starts right of the card
NUM_R = TX + 2.35                                # numbers right-align here; labels start just after
NUM_H, LAB_S = 0.78, 0.46                        # stat number height, stat label size
TOT_H, TOT_S = 1.15, 0.62                        # total number height, total label size
Z_TOT = 0.12; ROW_Z = [Z_TOT + TOT_H + 0.3 + i * (NUM_H + 0.2) for i in range(len(D["stats"]))][::-1]
MAX_W = 5.4                                      # widest a title or tagline may run (metres)
Z_TITLE = ROW_Z[0] + NUM_H + 0.3; TITLE_S = 0.95
Z_KICK = Z_TITLE + TITLE_S * 0.78 + 0.16; KICK_S = 0.40

card = bpy.data.objects.new("Card", None); sc.collection.objects.link(card); card.location = (CX, 0, CZ0 + CH / 2)
bpy.ops.mesh.primitive_plane_add(size=1); ph = bpy.context.object; ph.name = "Photo"
ph.scale = (CW, CH, 1); ph.rotation_euler = (math.radians(90), 0, 0); ph.parent = card
pm = bpy.data.materials.new("Photo"); pm.use_nodes = True; pn = pm.node_tree
img = bpy.data.images.load(D["photo"]); iw, ih = img.size
tx = pn.nodes.new("ShaderNodeTexImage"); tx.image = img; tx.extension = "CLIP"
uv = pn.nodes.new("ShaderNodeTexCoord"); mp = pn.nodes.new("ShaderNodeMapping")
s = (CW / CH) / (iw / ih)                       # cover-crop the landscape photo to the portrait card
# breathe: the one ambient move inside the card is a slow photo push (6% over the hold)
for fr, z in ((22, 1.0), (N, 0.94)):
    mp.inputs["Scale"].default_value = (s * z, z, 1); mp.inputs["Location"].default_value = (D.get("photo_center_x", 0.5) - s * z / 2, (1 - z) / 2, 0)
    mp.inputs["Scale"].keyframe_insert("default_value", frame=fr); mp.inputs["Location"].keyframe_insert("default_value", frame=fr)
pn.links.new(uv.outputs["UV"], mp.inputs["Vector"]); pn.links.new(mp.outputs["Vector"], tx.inputs["Vector"])
pb = pn.nodes["Principled BSDF"]; pn.links.new(tx.outputs["Color"], pb.inputs["Base Color"])
pn.links.new(tx.outputs["Color"], pb.inputs["Emission Color"]); pb.inputs["Emission Strength"].default_value = 0.7
pb.inputs["Roughness"].default_value = 0.35; ph.data.materials.append(pm)
bpy.ops.mesh.primitive_cube_add(size=1); back = bpy.context.object; back.name = "Card back"
back.scale = (CW, 0.05, CH); back.location = (0, 0.03, 0); back.parent = card; back.data.materials.append(L.mat("Back", "#0B0F14"))
glow = L.mat("Frame glow", GLOW, emit=GLOW, estr=3)
bars = []
FT = 0.06
for nm, sx, sz, lx, lz in (("top", CW + FT, FT, 0, CH / 2), ("bot", CW + FT, FT, 0, -CH / 2),
                            ("left", FT, CH, -CW / 2, 0), ("right", FT, CH, CW / 2, 0)):
    bpy.ops.mesh.primitive_cube_add(size=1); b = bpy.context.object; b.name = "Frame " + nm
    b.scale = (sx, 0.08, sz); b.location = (lx, -0.03, lz); b.parent = card; b.data.materials.append(glow); bars.append(b)

# frame draws as a goal-post line (frames 3-12), then the card opens from it (9-22)
for b in bars[2:] + bars[:1]:
    key(b, "scale", [(3, (b.scale.x, b.scale.y, 0.0) if b in bars[2:] else (0.0, b.scale.y, b.scale.z)), (12, tuple(b.scale))], interp="EXPO")
key(card, "scale", [(9, (1, 1, 0.02)), (22, (1, 1, 1))])
for o in (ph, back, bars[1]):
    key(o, "scale", [(9, (0, 0, 0)), (10, tuple(o.scale))], interp="CONSTANT")

# ---------------------------------------------------------------- type
TYPE = []
kick = word_fit(D["kicker"], KICK_S, ACCENT, TX, Z_KICK, MAX_W, emit=1.5)
title = word_fit(D["title"], TITLE_S, "#FFFFFF", TX, Z_TITLE, MAX_W, emit=1.0)
slide_in(kick, 12, dx=-0.8); fly_in(title, 15, 1.0); TYPE += kick + title
for x, z in zip(D["stats"], ROW_Z):
    f = x["frame"]
    n = L.number(x["value"], height=NUM_H, align="RIGHT"); n.location = (NUM_R, -0.05, z)
    labs, _ = word(x["label"], LAB_S, "#FFFFFF", NUM_R + 0.22, z, emit=1.0); sit_on(labs, n); bright(n); slam(n, f - 8)
    slide_in(labs, f - 2, dx=0.7); TYPE += [n] + labs
HERO = None                                       # the bottom slot: a hero total, or the tagline
if D.get("total"):
    t = D["total"]
    HERO = L.number(t["value"], height=TOT_H, color=ACCENT, align="RIGHT"); HERO.location = (NUM_R, -0.05, Z_TOT)
    tl, _ = word(t["label"], TOT_S, ACCENT, NUM_R + 0.22, Z_TOT, emit=1.2); sit_on(tl, HERO); bright(HERO, 0.9)
    slam(HERO, t["frame"] - 9, dur=9, big=True); slide_in(tl, t["frame"] - 2, dx=0.9); TYPE += [HERO] + tl
elif D.get("tagline"):
    tg = word_fit(D["tagline"], TOT_S, ACCENT, TX, Z_TOT + 0.25, MAX_W, emit=1.2)
    fly_in(tg, D["tagline_frame"] - 12, 0.7); TYPE += tg; HERO = tg[0]

# ---------------------------------------------------------------- camera: arrives from the left station, then drifts in.
# Framed to the block (card + type), slightly low so the type stands up off the turf.
BX = (CX - CW / 2 + max(o.matrix_world.translation.x + o.dimensions.x / 2 for o in TYPE)) / 2
BZ = (Z_KICK + KICK_S) / 2
cam = L.camera(sc, (BX - 4.0, -12.5, BZ + 0.6), (BX - 1.4, 8, BZ - 0.6), lens=35)
aim = bpy.data.objects.new("Aim", None); sc.collection.objects.link(aim)
tc = cam.constraints.new("TRACK_TO"); tc.target = aim; tc.track_axis = "TRACK_NEGATIVE_Z"; tc.up_axis = "UP_Y"
cam.data.dof.use_dof = True; cam.data.dof.aperture_fstop = 2.8
focus = bpy.data.objects.new("Focus", None); sc.collection.objects.link(focus); focus.location = (BX, 0, BZ); cam.data.dof.focus_object = focus
END = (BX + 0.1, -12.0, BZ - 0.4)
key(cam, "location", [(1, (BX - 4.0, -14.0, BZ + 0.6)), (30, (BX, -12.6, BZ - 0.3)), (N, END)], interp="BEZIER", ease="EASE_IN_OUT")
key(aim, "location", [(1, (BX - 2.6, 8, BZ + 0.2)), (30, (BX, 8, BZ - 0.1)), (N, (BX + 0.05, 8, BZ - 0.1))], interp="BEZIER", ease="EASE_IN_OUT")

# safe-area check at the end of the hold: every letter, number and the card sit inside the 5% title-safe margin
from bpy_extras.object_utils import world_to_camera_view
sc.frame_set(N); bpy.context.view_layer.update()
for o in TYPE + bars:
    for c in o.bound_box:
        v = world_to_camera_view(sc, cam, o.matrix_world @ Vector(c))
        assert 0.05 <= v.x <= 0.95 and 0.05 <= v.y <= 0.95, f"{o.name} leaves the safe area ({v.x:.2f}, {v.y:.2f})"
print("PASS safe area")
sc.frame_set(1)

# ---------------------------------------------------------------- bloom
cg = bpy.data.node_groups.new("Comp", "CompositorNodeTree"); sc.compositing_node_group = cg
cg.interface.new_socket("Image", in_out="OUTPUT", socket_type="NodeSocketColor")
rl = cg.nodes.new("CompositorNodeRLayers"); gl = cg.nodes.new("CompositorNodeGlare"); go = cg.nodes.new("NodeGroupOutput")
gl.inputs["Type"].default_value = "Bloom"; gl.inputs["Threshold"].default_value = 0.8
gl.inputs["Strength"].default_value = 0.5; gl.inputs["Size"].default_value = 0.7
cg.links.new(rl.outputs["Image"], gl.inputs["Image"]); cg.links.new(gl.outputs[0], go.inputs[0])

bpy.ops.wm.save_as_mainfile(filepath=os.path.join(OUT, "lane3-station.blend"))
if MODE == "still":
    fr = int(args[2]) if len(args) > 2 and args[2].isdigit() else N
    sc.frame_set(fr); sc.render.filepath = os.path.join(OUT, f"station_{fr:03d}.png"); bpy.ops.render.render(write_still=True)
else:
    sc.render.filepath = os.path.join(OUT, "frames", "f_"); sc.render.image_settings.file_format = "PNG"
    bpy.ops.render.render(animation=True)
print("DONE", OUT)
