"""LineUps coin transition, 3D layer (alpha). Beats = approved animatic v3.1.
Usage: Blender -b --factory-startup --python-exit-code 1 -P build_coin.py -- <texdir> <hdri> <out.blend> [render_dir] [frames]
t = 0 is the coin's first frame. LAND 11, balls burst 15, EXIT 30 (hold is the elastic pad)."""
import bpy, math, sys, os
from mathutils import Quaternion, Vector

argv = sys.argv[sys.argv.index("--") + 1:]
TEX, HDRI, OUT = argv[0], argv[1], argv[2]
RDIR = argv[3] if len(argv) > 3 else None
FRAMES = [int(f) for f in argv[4].split(",")] if len(argv) > 4 else None

LAND, EXIT = 11, 30
BURST = LAND + 4
LAST = EXIT + 10
PX = 14.4 / 1280          # animatic px -> world (camera at 20 m, 50 mm)
R = 205 * PX
CXp, CYp = 640, 0.46 * 720
w = lambda x, y: ((x - 640) * PX, (360 - y) * PX)

clamp = lambda t: max(0.0, min(1.0, t))
ease_out = lambda t: 1 - (1 - t) ** 3
ease_in = lambda t: t ** 2.4

def lin(h):
    h = h.lstrip("#"); c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple(v / 12.92 if v <= 0.04045 else ((v + 0.055) / 1.055) ** 2.4 for v in c) + (1.0,)
BLUE = lin("#52ADE7")
EMIT = float(os.environ.get("EMIT", "0.03"))

for o in list(bpy.data.objects): bpy.data.objects.remove(o)
sc = bpy.context.scene
sc.frame_start, sc.frame_end = 0, LAST
sc.render.fps = 25
sc.render.resolution_x, sc.render.resolution_y = 1920, 1080
sc.render.engine = "BLENDER_EEVEE"
sc.eevee.taa_render_samples = 48
sc.render.film_transparent = True
sc.render.use_motion_blur = True
sc.render.motion_blur_shutter = 0.5
sc.view_settings.view_transform = "Standard"
sc.view_settings.look = "None"
sc.render.image_settings.file_format = "PNG"
sc.render.image_settings.color_mode = "RGBA"

# world: studio HDRI for chrome reflections
wd = bpy.data.worlds.new("W"); sc.world = wd; wd.use_nodes = True
nt = wd.node_tree; env = nt.nodes.new("ShaderNodeTexEnvironment"); env.image = bpy.data.images.load(HDRI)
nt.links.new(env.outputs["Color"], nt.nodes["Background"].inputs["Color"]); nt.nodes["Background"].inputs["Strength"].default_value = 1.0

cam_d = bpy.data.cameras.new("Cam"); cam_d.lens = 50; cam_d.sensor_width = 36
cam = bpy.data.objects.new("Cam", cam_d); sc.collection.objects.link(cam); sc.camera = cam
cam.location = (0, -20, 0); cam.rotation_euler = (math.radians(90), 0, 0)

ld = bpy.data.lights.new("Key", "AREA"); ld.energy = 900; ld.size = 6; ld.shape = "DISK"
key = bpy.data.objects.new("Key", ld); sc.collection.objects.link(key)
key.location = (-6, -10, 7); key.rotation_euler = Vector((6, 10, -7)).to_track_quat("-Z", "Y").to_euler()
rd = bpy.data.lights.new("Rim", "AREA"); rd.energy = 500; rd.size = 3; rd.shape = "DISK"
rim = bpy.data.objects.new("Rim", rd); sc.collection.objects.link(rim)
rim.location = (7, 4, -3); rim.rotation_euler = Vector((-7, -4, 3)).to_track_quat("-Z", "Y").to_euler()

def img(n, noncolor=True):
    i = bpy.data.images.load(os.path.join(TEX, n))
    if noncolor: i.colorspace_settings.name = "Non-Color"
    return i

# ---------- materials ----------
def m_principled(name, base, rough=0.3, metal=0.0, coat=0.0):
    m = bpy.data.materials.new(name); m.use_nodes = True; p = m.node_tree.nodes["Principled BSDF"]
    p.inputs["Base Color"].default_value = base; p.inputs["Roughness"].default_value = rough
    p.inputs["Metallic"].default_value = metal; p.inputs["Coat Weight"].default_value = coat
    return m

def value_node(nt, name, v=0.0):
    n = nt.nodes.new("ShaderNodeValue"); n.name = n.label = name; n.outputs[0].default_value = v; return n

def math_node(nt, op, a, b=None, clamp_=False):
    n = nt.nodes.new("ShaderNodeMath"); n.operation = op; n.use_clamp = clamp_
    for i, x in enumerate((a, b)):
        if x is None: continue
        if isinstance(x, (int, float)): n.inputs[i].default_value = x
        else: nt.links.new(x, n.inputs[i])
    return n.outputs[0]

def face_material():
    m = bpy.data.materials.new("LU_Face"); m.use_nodes = True; nt = m.node_tree; p = nt.nodes["Principled BSDF"]
    m.surface_render_method = "BLENDED"
    tc = nt.nodes.new("ShaderNodeTexCoord")
    def tex(n):
        t = nt.nodes.new("ShaderNodeTexImage"); t.image = img(n); t.extension = "CLIP"
        nt.links.new(tc.outputs["UV"], t.inputs["Vector"]); return t.outputs["Color"]
    alpha, ups, order = tex("disc_alpha.png"), tex("ups_mask.png"), tex("ups_order.png")
    trace = value_node(nt, "trace", -0.1).outputs[0]; sweep = value_node(nt, "sweep", -5.0).outputs[0]
    on = math_node(nt, "LESS_THAN", order, trace)                      # pen has passed this pixel
    whiteness = math_node(nt, "MULTIPLY", ups, on)
    # pen tip glow: exp(-((order - trace)/0.035)^2) * ups
    d = math_node(nt, "DIVIDE", math_node(nt, "SUBTRACT", order, trace), 0.035)
    tip = math_node(nt, "MULTIPLY", math_node(nt, "EXPONENT", math_node(nt, "MULTIPLY", math_node(nt, "MULTIPLY", d, d), -1.0)), ups)
    # diagonal light sweep: exp(-(((u + (1-v))/2 - sweep)/0.07)^2)
    sep = nt.nodes.new("ShaderNodeSeparateXYZ"); nt.links.new(tc.outputs["UV"], sep.inputs[0])
    diag = math_node(nt, "MULTIPLY", math_node(nt, "ADD", sep.outputs[0], math_node(nt, "SUBTRACT", 1.0, sep.outputs[1])), 0.5)
    sd = math_node(nt, "DIVIDE", math_node(nt, "SUBTRACT", diag, sweep), 0.07)
    band = math_node(nt, "EXPONENT", math_node(nt, "MULTIPLY", math_node(nt, "MULTIPLY", sd, sd), -1.0))
    mix = nt.nodes.new("ShaderNodeMix"); mix.data_type = "RGBA"
    mix.inputs["A"].default_value = BLUE; mix.inputs["B"].default_value = (1, 1, 1, 1)
    nt.links.new(whiteness, mix.inputs["Factor"])
    nt.links.new(mix.outputs["Result"], p.inputs["Base Color"])
    nt.links.new(mix.outputs["Result"], p.inputs["Emission Color"])
    glow = math_node(nt, "ADD", EMIT, math_node(nt, "ADD", math_node(nt, "MULTIPLY", tip, 4.0), math_node(nt, "MULTIPLY", band, 1.6)))
    nt.links.new(glow, p.inputs["Emission Strength"])
    nt.links.new(math_node(nt, "GREATER_THAN", alpha, 0.5), p.inputs["Alpha"])
    p.inputs["Roughness"].default_value = 0.32; p.inputs["Coat Weight"].default_value = 0.5; p.inputs["Coat Roughness"].default_value = 0.08
    return m

def line_material():
    m = bpy.data.materials.new("LU_Line"); m.use_nodes = True; nt = m.node_tree; p = nt.nodes["Principled BSDF"]
    t = nt.nodes.new("ShaderNodeTexImage"); t.image = img("line_mask.png"); t.extension = "CLIP"
    op = value_node(nt, "opacity", 0.0).outputs[0]
    nt.links.new(math_node(nt, "MULTIPLY", t.outputs["Color"], op), p.inputs["Alpha"])
    p.inputs["Base Color"].default_value = (1, 1, 1, 1); p.inputs["Emission Color"].default_value = (1, 1, 1, 1)
    p.inputs["Emission Strength"].default_value = 0.6; p.inputs["Roughness"].default_value = 0.25; p.inputs["Coat Weight"].default_value = 1.0
    return m

def ball_material(name, texname, rough):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; p = nt.nodes["Principled BSDF"]
    t = nt.nodes.new("ShaderNodeTexImage"); t.image = img(texname, noncolor=False)
    nt.links.new(t.outputs["Color"], p.inputs["Base Color"]); p.inputs["Roughness"].default_value = rough
    bump = nt.nodes.new("ShaderNodeBump"); bump.inputs["Strength"].default_value = 0.15
    nz = nt.nodes.new("ShaderNodeTexNoise"); nz.inputs["Scale"].default_value = 180
    nt.links.new(nz.outputs["Fac"], bump.inputs["Height"]); nt.links.new(bump.outputs["Normal"], p.inputs["Normal"])
    return m

# ---------- coin ----------
coin = bpy.data.objects.new("Coin", None); sc.collection.objects.link(coin); coin.rotation_mode = "QUATERNION"
bpy.ops.mesh.primitive_cylinder_add(radius=R * 1.035, depth=0.24, vertices=128, rotation=(math.radians(90), 0, 0))
body = bpy.context.object; body.name = "CoinBody"; body.parent = coin
bv = body.modifiers.new("Bevel", "BEVEL"); bv.width = 0.045; bv.segments = 5; bv.limit_method = "ANGLE"
body.modifiers.new("WN", "WEIGHTED_NORMAL")
body.data.materials.append(m_principled("LU_Chrome", lin("#e8edf2"), rough=0.16, metal=1.0, coat=0.6))
FM = face_material()
for side, yy in (("Front", -0.1215), ("Back", 0.1215)):
    bpy.ops.mesh.primitive_plane_add(size=2 * R, rotation=(math.radians(90), 0, 0 if side == "Front" else math.radians(180)))
    f = bpy.context.object; f.name = "Face" + side; f.parent = coin; f.location = (0, yy, 0)
    f.data.materials.append(FM if side == "Front" else m_principled("LU_Back", BLUE, rough=0.3, coat=1.0))
    if side == "Back":
        bm = f.data.materials[0]; p = bm.node_tree.nodes["Principled BSDF"]
        t = bm.node_tree.nodes.new("ShaderNodeTexImage"); t.image = img("disc_alpha.png"); t.extension = "CLIP"
        bm.node_tree.links.new(t.outputs["Color"], p.inputs["Alpha"])
        p.inputs["Emission Color"].default_value = BLUE; p.inputs["Emission Strength"].default_value = EMIT
# LINE: own plane, scaled about the word's center for the slam
lc_u, lc_v = (356 + 7) / 720, 247 / 720
lpiv = bpy.data.objects.new("LinePivot", None); sc.collection.objects.link(lpiv); lpiv.parent = coin
lpiv.location = ((lc_u - 0.5) * 2 * R, -0.124, (0.5 - lc_v) * 2 * R)
bpy.ops.mesh.primitive_plane_add(size=2 * R, rotation=(math.radians(90), 0, 0))
lp = bpy.context.object; lp.name = "LineWord"; lp.parent = lpiv
lp.location = (-(lc_u - 0.5) * 2 * R, 0, -(0.5 - lc_v) * 2 * R)
LM = line_material(); lp.data.materials.append(LM)

# ring flash
bpy.ops.mesh.primitive_torus_add(major_radius=R * 1.05, minor_radius=0.025, major_segments=128, minor_segments=8, rotation=(math.radians(90), 0, 0))
ring = bpy.context.object; ring.name = "RingFlash"
RM = bpy.data.materials.new("LU_Ring"); RM.use_nodes = True; rn = RM.node_tree
for n in list(rn.nodes):
    if n.type == "BSDF_PRINCIPLED": rn.nodes.remove(n)
em = rn.nodes.new("ShaderNodeEmission"); em.inputs["Color"].default_value = (1, 1, 1, 1)
rn.links.new(em.outputs[0], rn.nodes["Material Output"].inputs["Surface"]); ring.data.materials.append(RM)

# balls
BALLS = []
def add_ball(kind):
    if kind == "puck":
        bpy.ops.mesh.primitive_cylinder_add(radius=0.62, depth=0.36, vertices=64)
        o = bpy.context.object; b = o.modifiers.new("Bevel", "BEVEL"); b.width = 0.04; b.segments = 3
        o.data.materials.append(m_principled("LU_Puck", lin("#121214"), rough=0.55))
    elif kind == "paddle":
        o = bpy.data.objects.new("Ball_paddle", None); sc.collection.objects.link(o)
        bpy.ops.mesh.primitive_cylinder_add(radius=0.62, depth=0.07, vertices=96, rotation=(math.radians(90), 0, 0))
        blade = bpy.context.object; blade.parent = o; bb = blade.modifiers.new("Bevel", "BEVEL"); bb.width = 0.02; bb.segments = 3
        blade.data.materials.append(m_principled("LU_PaddleRubber", lin("#c8202a"), rough=0.7))
        bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, -0.86)); h = bpy.context.object; h.parent = o
        h.scale = (0.15, 0.1, 0.5); hb = h.modifiers.new("Bevel", "BEVEL"); hb.width = 0.03; hb.segments = 3
        h.data.materials.append(m_principled("LU_Wood", lin("#c99a5b"), rough=0.5))
    elif kind == "shuttlecock":
        o = bpy.data.objects.new("Ball_shuttlecock", None); sc.collection.objects.link(o)
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.2, segments=48, ring_count=24, location=(0, 0, -0.42))
        cork = bpy.context.object; cork.parent = o; bpy.ops.object.shade_smooth()
        cork.data.materials.append(m_principled("LU_Cork", lin("#f4f2ec"), rough=0.4))
        bpy.ops.mesh.primitive_cone_add(radius1=0.2, radius2=0.55, depth=0.8, vertices=16, end_fill_type="NOTHING", location=(0, 0, 0.0))
        sk = bpy.context.object; sk.parent = o
        sk.modifiers.new("Solid", "SOLIDIFY").thickness = 0.015
        wf = sk.modifiers.new("Ribs", "WIREFRAME"); wf.thickness = 0.02; wf.use_replace = False
        skm = m_principled("LU_Feather", lin("#fbfbf8"), rough=0.55); skm.node_tree.nodes["Principled BSDF"].inputs["Subsurface Weight"].default_value = 0.3
        sk.data.materials.append(skm)
        bpy.ops.mesh.primitive_torus_add(major_radius=0.25, minor_radius=0.025, location=(0, 0, -0.28)); band = bpy.context.object; band.parent = o
        band.data.materials.append(m_principled("LU_Band", lin("#1f3c6e"), rough=0.4))
    else:
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.62, segments=64, ring_count=32)
        o = bpy.context.object; bpy.ops.object.shade_smooth()
        if kind == "football": o.scale = (1.0, 0.64, 0.64)
        rough = {"basketball": 0.6, "baseball": 0.55, "football": 0.5, "soccer": 0.35, "tennis": 0.9}[kind]
        o.data.materials.append(ball_material("LU_" + kind, f"ball_{kind}.png", rough))
    o.name = "Ball_" + kind; o.rotation_mode = "XYZ"
    holder = bpy.data.objects.new("BallPos_" + kind, None); sc.collection.objects.link(holder); o.parent = holder
    BALLS.append((kind, holder, o))
# outro ring order, clockwise from the top (trophy left out)
KINDS = ["football", "shuttlecock", "soccer", "baseball", "paddle", "puck", "basketball", "tennis"]
SIZE = {"football": 1.0, "shuttlecock": 0.85, "soccer": 1.0, "baseball": 0.72, "paddle": 0.95, "puck": 0.75, "basketball": 1.0, "tennis": 0.62}
for k in KINDS: add_ball(k)

# ---------- animation (baked per frame from the animatic math) ----------
START = (-240.0, 720 + 240.0)
def coin_path(t):
    k = 1 - (1 - clamp(t / LAND)) ** 3.2
    x = START[0] + (CXp - START[0]) * k
    y = START[1] + (CYp - START[1]) * k - math.sin(math.pi * k) * 70
    return x, y, 0.82 + 0.18 * k, 360 * (1 - (1 - clamp(t / LAND)) ** 2.4)

DIAG = Vector((1, 0, 1)).normalized()
RX, RY, TILT, OY = 480, 260, math.radians(-8), 40
DEPTH = 3.2

def key_value(mat, node, f, v):
    n = mat.node_tree.nodes[node]; n.outputs[0].default_value = v; n.outputs[0].keyframe_insert("default_value", frame=f)

for t in range(0, LAST + 1):
    f = t
    # coin
    if t < LAND:
        x, y, s, ang = coin_path(t); q = Quaternion(DIAG, math.radians(ang))
    else:
        x, y = CXp, CYp; s = 0.96 if t == LAND else 1.0 + 0.03 * clamp((t - LAND) / (EXIT - LAND)); q = Quaternion()
        if t >= EXIT:
            q = Quaternion(Vector((0, 0, 1)), math.radians(90 * ease_in(clamp((t - EXIT) / 8)))); s *= 1 + 0.25 * clamp((t - EXIT) / 8)
    wx, wz = w(x, y)
    coin.location = (wx, 0, wz); coin.scale = (s, s, s); coin.rotation_quaternion = q
    coin.hide_render = t > EXIT + 8
    for p_ in ("location", "scale", "rotation_quaternion", "hide_render"): coin.keyframe_insert(p_, frame=f)
    # LINE slam
    k = clamp((t - LAND) / 3); ls = 1.45 - 0.45 * ease_out(k)
    lpiv.scale = (ls, 1, ls); lpiv.keyframe_insert("scale", frame=f)
    key_value(LM, "opacity", f, 0.0 if t < LAND else min(1.0, (t - LAND + 1) / 1.5))
    # UPS trace and sweep
    key_value(FM, "trace", f, -0.1 if t < LAND + 1 else clamp((t - (LAND + 1)) / 11) * 1.02)
    key_value(FM, "sweep", f, (t - (EXIT - 6)) / 4 * 1.4 - 0.2 if EXIT - 6 <= t <= EXIT - 2 else -5.0)
    # ring flash
    kk = (t - LAND) / 6; on = 0 <= kk < 1
    rs = 1.0 + 0.9 * clamp(kk); ring.location = (w(CXp, CYp)[0], -0.2, w(CXp, CYp)[1]); ring.scale = (rs, rs, rs)
    ring.hide_render = not on
    for p_ in ("location", "scale", "hide_render"): ring.keyframe_insert(p_, frame=f)
    em.inputs["Strength"].default_value = 8.0 * (1 - clamp(kk)) if on else 0.0; em.inputs["Strength"].keyframe_insert("default_value", frame=f)
    # balls: v2 ring clock (burst at 7, fling at 22)
    tt = None if t < BURST else (7 + (t - BURST) * (15 / (EXIT - BURST)) if t < EXIT else 22 + (t - EXIT))
    for i, (kind, holder, o) in enumerate(BALLS):
        vis = tt is not None and tt <= 31
        if vis:
            burst = ease_out(clamp((tt - 7) / 4))
            spin = 0.9 * ease_out(clamp((tt - 7) / 15)) + 2.2 * ease_in(clamp((tt - 22) / 8))
            fling = ease_in(clamp((tt - 22) / 8))
            a = -math.pi / 2 + math.pi / 8 + 2 * math.pi * i / len(BALLS) + spin  # offset so none parks behind the coin
            rr = (0.55 + 0.45 * burst) * (1 + 2.6 * fling)
            x0, y0 = RX * math.cos(a) * rr, RY * math.sin(a) * rr
            sx = CXp + x0 * math.cos(TILT) - y0 * math.sin(TILT); sy = CYp + OY + x0 * math.sin(TILT) + y0 * math.cos(TILT)
            bx, bz = w(sx, sy)
            holder.location = (bx, -math.sin(a) * DEPTH * rr - 6 * fling, bz)
            sz = (0.4 + 0.6 * burst) * 0.92 * SIZE[kind]; holder.scale = (sz, sz, sz)
            o.rotation_euler = (t * 0.21 + i, t * 0.13, t * 0.3 * (1 if i % 2 else -1))
        if not vis: holder.scale = (0, 0, 0)  # multi-part props (paddle, shuttlecock) ignore the parent hide
        holder.hide_render = not vis; o.hide_render = not vis
        for p_ in ("location", "scale", "hide_render"): holder.keyframe_insert(p_, frame=f)
        o.keyframe_insert("rotation_euler", frame=f); o.keyframe_insert("hide_render", frame=f)

# per-frame keys: linear, hide_render constant
for a in bpy.data.actions:
    try: fcs = list(a.fcurves)
    except AttributeError: fcs = [fc for l in a.layers for st in l.strips for cb in st.channelbags for fc in cb.fcurves]
    for fc in fcs:
        for kp in fc.keyframe_points:
            kp.interpolation = "CONSTANT" if fc.data_path in ("hide_render",) or "default_value" in fc.data_path and False else "LINEAR"
for m in (FM, LM):
    ad = m.node_tree.animation_data
    if ad and ad.action:
        try: fcs = list(ad.action.fcurves)
        except AttributeError: fcs = [fc for l in ad.action.layers for st in l.strips for cb in st.channelbags for fc in cb.fcurves]
        for fc in fcs:
            for kp in fc.keyframe_points: kp.interpolation = "CONSTANT"

bpy.ops.wm.save_as_mainfile(filepath=OUT)
print("SAVED", OUT)
if RDIR:
    os.makedirs(RDIR, exist_ok=True)
    for fr in (FRAMES if FRAMES is not None else range(sc.frame_start, sc.frame_end + 1)):
        sc.frame_set(fr); sc.render.filepath = os.path.join(RDIR, f"{fr:03d}.png")
        bpy.ops.render.render(write_still=True)
    print("RENDERED", RDIR)
