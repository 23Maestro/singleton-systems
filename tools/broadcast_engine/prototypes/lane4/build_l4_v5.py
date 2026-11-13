"""Lane 4 concept rebuild: the Oct 18 Mahomes vs Allen stats mock-up, in Blender, with depth and motion.

Usage: Blender -b --factory-startup --python-exit-code 1 -P build_l4_concept.py -- <out_dir>
"""
import bpy, math, random, sys, os
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[4]))
from tools.broadcast_engine.player_comparison_data import load
_args = sys.argv[sys.argv.index("--") + 1:]
DATA = load(_args[1]) if len(_args) > 1 else None
from mathutils import Vector

OUT = sys.argv[sys.argv.index("--") + 1]
os.makedirs(OUT, exist_ok=True)
HERE = os.path.dirname(os.path.abspath(__file__))
A = "/Volumes/HomeSSD/Generated/CATENA_MEDIA_LINEUPS"
F = "/Users/singleton23/Library/Fonts/"
FONT_TITLE = F + "BarlowCondensed-ExtraBoldItalic.ttf"
FONT_ROW = F + "BarlowCondensed-ExtraBoldItalic.ttf"
# House type (approved on Packers C02, 2026-11-12): upright Antonio for title and names, Saira for stats.
FONT_TEAM = F + "Antonio-SemiBold.ttf"
FONT_STAT = "/Volumes/HomeSSD/Generated/CATENA_MEDIA/references/2026-11-11-team-cards-value-metrics/fonts/SairaSemiCondensed-Bold.ttf"
PANEL = "#08110E"
FPS, N = (25, DATA["frames"]) if DATA else (30, 240)
CAM_Y, CAM_Z, REF_Y = -20.5, 0.8, 1.5
random.seed(18)

KC, KC_GOLD, BUF, BUF_RED = "#E31837", "#FFB81C", "#00338D", "#C60C30"
if DATA:
    P1, P2 = DATA["players"]
    KC, KC_GOLD, BUF, BUF_RED = P1["primary"], P1["secondary"], P2["primary"], P2["secondary"]

def lin(h, a=1.0):
    h = h.lstrip("#"); c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    f = lambda v: v / 12.92 if v <= 0.04045 else ((v + 0.055) / 1.055) ** 2.4
    return (*[f(v) for v in c], a)

def at(x, z, y):
    """Place a point composed on the reference plane at depth y, keeping its screen position."""
    k = (y - CAM_Y) / (REF_Y - CAM_Y)
    return (x * k, y, CAM_Z + (z - CAM_Z) * k), k

# ---------------------------------------------------------------- scene setup
bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
sc.render.engine = "BLENDER_EEVEE"
sc.render.resolution_x, sc.render.resolution_y = 1920, 1080
sc.render.fps = FPS; sc.frame_start, sc.frame_end = 1, N
sc.view_settings.view_transform = "Standard"; sc.view_settings.look = "None"
ee = sc.eevee
ee.taa_render_samples = 64; ee.use_raytracing = True
ee.volumetric_start, ee.volumetric_end = 1.0, 80.0; ee.volumetric_tile_size = "8"; ee.volumetric_samples = 64
sc.render.use_motion_blur = True; sc.render.motion_blur_shutter = 0.5; ee.motion_blur_steps = 2
world = bpy.data.worlds.new("World"); sc.world = world; world.use_nodes = True
wnt = world.node_tree; wnt.nodes.clear()
_env = wnt.nodes.new("ShaderNodeTexEnvironment"); _env.image = bpy.data.images.load("/Volumes/HomeSSD/Generated/SINGLETON_SYSTEMS/lookdev/polyhaven/studio_small_03/studio_small_03_2k.hdr")
_bg = wnt.nodes.new("ShaderNodeBackground"); _bg.inputs["Strength"].default_value = 0.32
_dk = wnt.nodes.new("ShaderNodeBackground"); _dk.inputs["Color"].default_value = lin("#030406")
_lp = wnt.nodes.new("ShaderNodeLightPath"); _mx = wnt.nodes.new("ShaderNodeMixShader"); _wo = wnt.nodes.new("ShaderNodeOutputWorld")
wnt.links.new(_env.outputs["Color"], _bg.inputs["Color"]); wnt.links.new(_lp.outputs["Is Camera Ray"], _mx.inputs[0])
wnt.links.new(_bg.outputs[0], _mx.inputs[1]); wnt.links.new(_dk.outputs[0], _mx.inputs[2]); wnt.links.new(_mx.outputs[0], _wo.inputs[0])

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

def key(obj, path, frames_vals, interp="BEZIER", ease="EASE_OUT"):
    for f, v in frames_vals:
        setattr(obj, path, v); obj.keyframe_insert(data_path=path, frame=f)
    for fc in _fcurves(obj.animation_data.action):
        if fc.data_path == path:
            for kp in fc.keyframe_points: kp.interpolation = interp; kp.easing = ease

def mat(name, base="#111111", rough=0.4, metal=0.0, coat=0.0, emit=None, estr=0.0, alpha=1.0):
    m = bpy.data.materials.new(name); m.use_nodes = True
    p = m.node_tree.nodes["Principled BSDF"]
    p.inputs["Base Color"].default_value = lin(base) if isinstance(base, str) else base
    p.inputs["Roughness"].default_value = rough; p.inputs["Metallic"].default_value = metal
    p.inputs["Coat Weight"].default_value = coat; p.inputs["Alpha"].default_value = alpha
    if emit:
        p.inputs["Emission Color"].default_value = lin(emit); p.inputs["Emission Strength"].default_value = estr
    if alpha < 1: m.surface_render_method = "DITHERED"
    return m

def etched(name, color, value=0.55, scale=6.0):
    """Team-color etched metal: brushed streaks plus scratches as bump."""
    m = mat(name, rough=0.38, metal=0.35, coat=0.7)
    nt = m.node_tree; p = nt.nodes["Principled BSDF"]
    c = lin(color); p.inputs["Base Color"].default_value = (c[0] * value, c[1] * value, c[2] * value, 1)
    tc = nt.nodes.new("ShaderNodeTexCoord")
    mp = nt.nodes.new("ShaderNodeMapping"); mp.inputs["Scale"].default_value = (scale * 0.15, scale * 4.0, scale)
    mp.inputs["Rotation"].default_value = (0, 0, random.uniform(-0.8, 0.8))
    nz = nt.nodes.new("ShaderNodeTexNoise"); nz.inputs["Scale"].default_value = 3; nz.inputs["Detail"].default_value = 3
    wv = nt.nodes.new("ShaderNodeTexWave"); wv.inputs["Scale"].default_value = scale * 2; wv.inputs["Distortion"].default_value = 6
    mx = nt.nodes.new("ShaderNodeMath"); mx.operation = "MULTIPLY"
    bump = nt.nodes.new("ShaderNodeBump"); bump.inputs["Strength"].default_value = 0.16; bump.inputs["Distance"].default_value = 0.02
    nt.links.new(tc.outputs["Object"], mp.inputs["Vector"]); nt.links.new(mp.outputs[0], nz.inputs["Vector"])
    nt.links.new(tc.outputs["Object"], wv.inputs["Vector"])
    nt.links.new(nz.outputs["Fac"], mx.inputs[0]); nt.links.new(wv.outputs["Fac"], mx.inputs[1])
    nt.links.new(mx.outputs[0], bump.inputs["Height"]); nt.links.new(bump.outputs["Normal"], p.inputs["Normal"])
    nt.links.new(bump.outputs["Normal"], p.inputs["Coat Normal"])
    return m

def box(name, size, loc, m, rot=(0, 0, 0), bevel=0.04):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc, rotation=rot)
    o = bpy.context.object; o.name = name; o.scale = size
    b = o.modifiers.new("Bevel", "BEVEL"); b.width = bevel; b.segments = 3; b.limit_method = "ANGLE"
    o.data.materials.append(m); return o

def text(body, size, color, font, extrude=0.04, emit=0.0, align="CENTER", m=None):
    cu = bpy.data.curves.new("T", "FONT"); cu.body = body
    cu.font = bpy.data.fonts.load(font, check_existing=True)
    cu.size = size; cu.extrude = min(extrude, 0.02); cu.bevel_depth = 0.0
    cu.align_x = align; cu.align_y = "CENTER"
    o = bpy.data.objects.new("T_" + body[:10], cu); sc.collection.objects.link(o)
    o.rotation_euler = (math.radians(90), 0, 0)
    o.data.materials.append(m or mat("TM_" + body[:8], color, rough=0.6, emit=color, estr=max(emit, 1.0)))
    return o

# ------------------------------------------------- far layer: stadium bokeh (y 34)
bok = mat("Bokeh", "#ffffff", emit="#dfe9ff", estr=14)
for side, tint in ((-1, "#ffd6cf"), (1, "#cfe0ff")):
    bm = mat("Bokeh%d" % side, "#ffffff", emit=tint, estr=6)
    for i in range(14):
        x = side * random.uniform(14, 30); z = random.uniform(-6, 2)
        bpy.ops.mesh.primitive_uv_sphere_add(radius=random.uniform(0.12, 0.22), location=(x, random.uniform(32, 40), z))
        bpy.context.object.data.materials.append(bm)

# ------------------------------------------------- etched team shards (y 9 .. 18) + team-tinted stadium wall (y 24)
def slab(name, pts2d, y, k, m, thick=0.35):
    verts = [(x * k, 0, z * k) for x, z in pts2d]
    me = bpy.data.meshes.new(name); me.from_pydata(verts, [], [list(range(len(verts)))])
    o = bpy.data.objects.new(name, me); sc.collection.objects.link(o)
    o.modifiers.new("Solid", "SOLIDIFY").thickness = thick
    bv = o.modifiers.new("Bevel", "BEVEL"); bv.width = 0.09; bv.segments = 2; bv.harden_normals = True
    o.data.materials.append(m); return o

_IMG = {}
def _img(path):
    if path not in _IMG:
        im = bpy.data.images.load(path); im.colorspace_settings.name = "Non-Color"; _IMG[path] = im
    return _IMG[path]
def shard_mat(name, color, value):
    m = mat(name, rough=0.3, metal=0.78, coat=0.35)
    nt = m.node_tree; p = nt.nodes["Principled BSDF"]
    c = lin(color); p.inputs["Base Color"].default_value = (c[0] * value, c[1] * value, c[2] * value, 1)
    p.inputs["Anisotropic"].default_value = 0.6
    tc = nt.nodes.new("ShaderNodeTexCoord"); mp = nt.nodes.new("ShaderNodeMapping")
    mp.inputs["Scale"].default_value = (random.uniform(0.15, 0.3),) * 3
    mp.inputs["Rotation"].default_value = (0, random.uniform(-1.2, 1.2), 0)
    nt.links.new(tc.outputs["Object"], mp.inputs[0])
    br = nt.nodes.new("ShaderNodeTexImage"); br.image = _img("/Volumes/HomeSSD/Generated/SINGLETON_SYSTEMS/lookdev/ambientcg/Metal009/Metal009_2K-JPG_Roughness.jpg"); br.projection = "BOX"
    sc_ = nt.nodes.new("ShaderNodeTexImage"); sc_.image = _img("/Volumes/HomeSSD/Generated/SINGLETON_SYSTEMS/lookdev/ambientcg/Metal038/Metal038_2K-JPG_Roughness.jpg"); sc_.projection = "BOX"
    nm = nt.nodes.new("ShaderNodeTexImage"); nm.image = _img("/Volumes/HomeSSD/Generated/SINGLETON_SYSTEMS/lookdev/ambientcg/Metal009/Metal009_2K-JPG_NormalGL.jpg"); nm.projection = "BOX"
    for t in (br, sc_, nm): nt.links.new(mp.outputs[0], t.inputs[0])
    mix = nt.nodes.new("ShaderNodeMath"); mix.operation = "MAXIMUM"
    nt.links.new(br.outputs["Color"], mix.inputs[0]); nt.links.new(sc_.outputs["Color"], mix.inputs[1])
    mr = nt.nodes.new("ShaderNodeMapRange"); mr.inputs["To Min"].default_value = 0.08; mr.inputs["To Max"].default_value = 0.3
    nt.links.new(mix.outputs[0], mr.inputs["Value"]); nt.links.new(mr.outputs[0], p.inputs["Roughness"])
    nmap = nt.nodes.new("ShaderNodeNormalMap"); nmap.inputs["Strength"].default_value = 0.5
    nt.links.new(nm.outputs["Color"], nmap.inputs["Color"]); nt.links.new(nmap.outputs[0], p.inputs["Normal"])
    return m

def wall(side, color):
    stadium = DATA.get('stadium') if DATA else None
    img = bpy.data.images.load(stadium['filePath'] if stadium else f"{A}/references/field-night-no-football.png")
    m = bpy.data.materials.new(f"Wall{side}"); m.use_nodes = True; nt = m.node_tree; nt.nodes.clear()
    t = nt.nodes.new("ShaderNodeTexImage"); t.image = img
    mix = nt.nodes.new("ShaderNodeMix"); mix.data_type = "RGBA"; mix.blend_type = "MULTIPLY"; mix.inputs["Factor"].default_value = 1.0
    mix.inputs["B"].default_value = tuple(c * 1.6 for c in lin(color)[:3]) + (1,)
    em = nt.nodes.new("ShaderNodeEmission"); em.inputs["Strength"].default_value = 0.55
    o = nt.nodes.new("ShaderNodeOutputMaterial")
    nt.links.new(t.outputs["Color"], mix.inputs["A"]); nt.links.new(mix.outputs["Result"], em.inputs["Color"]); nt.links.new(em.outputs[0], o.inputs[0])
    loc, k = at(side * 7.0, 1.5, 24)
    bpy.ops.mesh.primitive_plane_add(size=1, location=loc, rotation=(math.radians(90), 0, 0))
    w_ = bpy.context.object; w_.scale = (16 * k, 13 * k, 1); w_.data.materials.append(m)
    if side > 0 and not stadium: w_.scale.x *= -1   # preserve readable team branding on new stadium photos

def _split(poly, ang):
    cx = sum(p[0] for p in poly) / len(poly); cz = sum(p[1] for p in poly) / len(poly)
    cx += random.uniform(-0.25, 0.25); cz += random.uniform(-0.25, 0.25)
    dx, dz = math.cos(ang), math.sin(ang)
    A, B = [], []
    for i in range(len(poly)):
        p, q = poly[i], poly[(i + 1) % len(poly)]
        sp = (p[0] - cx) * dz - (p[1] - cz) * dx; sq = (q[0] - cx) * dz - (q[1] - cz) * dx
        (A if sp >= 0 else B).append(p)
        if (sp >= 0) != (sq >= 0):
            t = sp / (sp - sq); x = (p[0] + t * (q[0] - p[0]), p[1] + t * (q[1] - p[1])); A.append(x); B.append(x)
    return [x for x in (A, B) if len(x) >= 3]

def _area(poly):
    return abs(sum(poly[i][0] * poly[(i + 1) % len(poly)][1] - poly[(i + 1) % len(poly)][0] * poly[i][1] for i in range(len(poly)))) / 2

def shards(side, color):
    random.seed(70 + side)
    inner = 1.2   # facets reach over the chevron column's edge
    region = [(side * inner, -6.5), (side * 12.5, -6.5), (side * 12.5, 8.5), (side * inner, 8.5)]
    polys = [region]
    for _ in range(72):
        polys.sort(key=_area); big = polys.pop()
        ang = math.radians(random.choice([random.uniform(25, 65), random.uniform(115, 155), random.uniform(-10, 10)]))
        polys += _split(big, ang)
    for i, poly in enumerate(polys):
        cx = sum(p[0] for p in poly) / len(poly); cz = sum(p[1] for p in poly) / len(poly)
        shrink = 0.965
        pts = [(cx + (x - cx) * shrink, cz + (z - cz) * shrink) for x, z in poly]
        y = random.uniform(9.8, 12.6) if abs(cx) > 2.2 else random.uniform(9.6, 10.4)
        loc, k = at(cx, cz, y)
        verts = [((x - cx) * k, 0, (z - cz) * k) for x, z in pts]
        if side > 0: verts = verts[::-1]
        me = bpy.data.meshes.new(f"F{side}_{i}"); me.from_pydata(verts, [], [list(range(len(verts)))])
        o = bpy.data.objects.new(f"Facet{side}_{i}", me); sc.collection.objects.link(o); o.location = loc
        o.rotation_euler = (math.radians(random.uniform(-14, 14)), math.radians(random.uniform(-8, 8)), math.radians(random.uniform(-14, 14)))
        o.modifiers.new("Solid", "SOLIDIFY").thickness = 0.25
        bv = o.modifiers.new("Bevel", "BEVEL"); bv.width = 0.05; bv.segments = 2; bv.harden_normals = True; bv.use_clamp_overlap = True
        o.data.materials.append(shard_mat(f"Gem{side}{i}", color, random.choice([0.18, 0.28, 0.4, 0.55, 0.75, 1.0])))
        f0 = 6 + int(abs(cx) * 1.6) + random.randint(0, 4)
        end = tuple(o.location); start = (end[0] + side * 9, end[1], end[2] + random.uniform(-1.5, 1.5))
        key(o, "location", [(f0, start), (f0 + 8, end), (N, (end[0] + side * 0.35, end[1], end[2]))])
        key(o, "rotation_euler", [(f0 + 8, tuple(o.rotation_euler)), (N, (o.rotation_euler.x + math.radians(random.uniform(-3, 3)), o.rotation_euler.y, o.rotation_euler.z + math.radians(random.uniform(-3, 3))))])

for sd, col in ((-1, KC), (1, BUF)):
    wall(sd, col); shards(sd, col)

# ------------------------------------------------- embossed logos (y 8.5)
def logo(svg, sx, sz, width, name, y=8.5):
    before = set(bpy.data.objects)
    bpy.ops.import_curve.svg(filepath=svg)
    objs = [o for o in bpy.data.objects if o not in before and o.type == "CURVE"]
    bpy.context.view_layer.update()
    def bb(o):
        q = [o.matrix_world @ Vector(c) for c in o.bound_box]
        return Vector((min(p.x for p in q), min(p.y for p in q))), Vector((max(p.x for p in q), max(p.y for p in q)))
    full = max((bb(o)[1] - bb(o)[0]).x for o in objs)
    def canvas_box(o):
        # A canvas background is a full-width rectangle: every point sits on a bounding-box corner.
        # A full-width oval (the Packers gold ring has 6 points) is real artwork and stays.
        lo, hi = o.bound_box[0], o.bound_box[6]; tol = 1e-3 * max(hi[0] - lo[0], hi[1] - lo[1], 1e-6)
        pts = [q.co for sp in o.data.splines for q in (sp.bezier_points or sp.points)]
        return (bb(o)[1] - bb(o)[0]).x >= full * 0.999 and all(
            min(abs(q[0] - lo[0]), abs(q[0] - hi[0])) < tol and min(abs(q[1] - lo[1]), abs(q[1] - hi[1])) < tol for q in pts)
    for o in list(objs):  # drop open paths and the canvas-size background box
        if not any(s.use_cyclic_u for s in o.data.splines) or canvas_box(o):
            bpy.data.objects.remove(o); objs.remove(o)
    pts = [p for o in objs for p in bb(o)]
    mn = Vector((min(p.x for p in pts), min(p.y for p in pts))); mx = Vector((max(p.x for p in pts), max(p.y for p in pts)))
    w = mx.x - mn.x; ctr = (mn + mx) / 2
    meshes = []
    for i, o in enumerate(objs):
        o.data.extrude = 0.03 * w; o.data.bevel_depth = 0.0          # no curve bevel: it spikes on sharp tips
        o.location.z += i * 0.01 * w                                  # draw order as depth, no z-fighting
        for j, m in enumerate(o.data.materials):
            if m is None: continue
            # The official SVG fill, unlit: emission 1.0 under the Standard view renders the source colour exactly.
            nm = bpy.data.materials.new(m.name + "_E"); nm.use_nodes = True; nt = nm.node_tree; nt.nodes.clear()
            em = nt.nodes.new("ShaderNodeEmission"); em.inputs["Color"].default_value = tuple(m.diffuse_color[:3]) + (1,)
            nt.links.new(em.outputs[0], nt.nodes.new("ShaderNodeOutputMaterial").inputs["Surface"])
            o.data.materials[j] = nm
        bpy.context.view_layer.objects.active = o
        for s in bpy.context.selected_objects: s.select_set(False)
        o.select_set(True); bpy.ops.object.convert(target="MESH")
        me = bpy.context.object
        bv = me.modifiers.new("Bevel", "BEVEL"); bv.width = 0.006 * w; bv.segments = 3
        bv.limit_method = "ANGLE"; bv.use_clamp_overlap = True; bv.harden_normals = True
        wn = me.modifiers.new("WN", "WEIGHTED_NORMAL"); wn.keep_sharp = True
        meshes.append(me)
    e = bpy.data.objects.new(name, None); sc.collection.objects.link(e)
    e.location = (ctr.x, ctr.y, 0); bpy.context.view_layer.update()
    for me in meshes:
        me.parent = e; me.matrix_parent_inverse = e.matrix_world.inverted()
    loc, k = at(sx, sz, y); s = width * k / w
    e.location = loc; e.rotation_euler = (math.radians(90), 0, 0); e.scale = (s, s, s)
    return e, s
lkc, skc = logo(P1["logo"] if DATA else f"{A}/source/nfl-club-logos-svg/KC.svg", -5.6, 2.3, 7.4, "LogoKC")
lbuf, sbuf = logo(P2["logo"] if DATA else f"{A}/source/nfl-club-logos-svg/BUF.svg", 5.9, 3.5, 8.2, "LogoBUF")
for e, s, d in ((lkc, skc, 1), (lbuf, sbuf, -1)):
    r = e.rotation_euler.copy()
    key(e, "scale", [(15, (0.0001,) * 3), (16, (s * 2.1,) * 3), (18, (s * 1.1,) * 3), (21, (s,) * 3), (N, (s * 0.96,) * 3)])
    key(e, "rotation_euler", [(16, (r.x, 0, math.radians(-9 * d))), (N, (r.x, 0, math.radians(6 * d)))])

# ------------------------------------------------- chevron spine: wide rubber column of shallow V bands, behind the shard edges
SPY = 13.5
sl, k = at(0, 1.5, SPY)
SW = 3.1 * k                                   # ~15% of frame width, like the reference
back = box("Spine", (SW, 0.9, 40), (sl[0], sl[1] + 0.5, sl[2]), mat("SpineBack", "#030304", rough=0.8), bevel=0.05)
hw = SW * 0.5 * 0.99; pitch = 0.95 * k * 0.6; band = pitch * 0.74; drop = hw * math.tan(math.radians(14))
verts, faces = [], []
for i in range(int(40 / pitch)):
    z = -20 + i * pitch; v = len(verts)
    verts += [(-hw, 0, z + drop), (0, 0, z), (hw, 0, z + drop), (hw, 0, z + drop + band), (0, 0, z + band), (-hw, 0, z + drop + band)]
    faces += [[v, v + 1, v + 4, v + 5], [v + 1, v + 2, v + 3, v + 4]]
me = bpy.data.meshes.new("Chevrons"); me.from_pydata(verts, [], faces)
chev = bpy.data.objects.new("Chevrons", me); sc.collection.objects.link(chev); chev.location = (sl[0], sl[1], sl[2])
sol = chev.modifiers.new("Solid", "SOLIDIFY"); sol.thickness = 0.4; sol.offset = 1.0
bv = chev.modifiers.new("Bevel", "BEVEL"); bv.width = 0.15; bv.segments = 5; bv.harden_normals = True
chev.data.materials.append(mat("Rubber", "#08090b", rough=0.5, coat=0.0))
edges = []

for o in [back, chev] + edges:
    key(o, "scale", [(1, (o.scale.x, o.scale.y, 0.01)), (8, tuple(o.scale))])

# ------------------------------------------------- players (y 1.5) and nameplates (y -1.2)
def player(path, name, sx, h, rim, enter_from):
    im = bpy.data.images.load(path); w = h * im.size[0] / im.size[1]
    # The photo, unlit: emission 1.0 shows the source pixels; scene lights no longer add on top.
    m = bpy.data.materials.new(name + "M"); m.use_nodes = True; nt = m.node_tree; nt.nodes.clear()
    t = nt.nodes.new("ShaderNodeTexImage"); t.image = im; t.interpolation = "Cubic"; im.alpha_mode = "STRAIGHT"
    em = nt.nodes.new("ShaderNodeEmission"); nt.links.new(t.outputs["Color"], em.inputs["Color"])
    th_ = nt.nodes.new("ShaderNodeMath"); th_.operation = "GREATER_THAN"; th_.inputs[1].default_value = 0.5
    tp = nt.nodes.new("ShaderNodeBsdfTransparent"); mx_ = nt.nodes.new("ShaderNodeMixShader")
    nt.links.new(t.outputs["Alpha"], th_.inputs[0]); nt.links.new(th_.outputs[0], mx_.inputs[0])
    nt.links.new(tp.outputs[0], mx_.inputs[1]); nt.links.new(em.outputs[0], mx_.inputs[2])
    nt.links.new(mx_.outputs[0], nt.nodes.new("ShaderNodeOutputMaterial").inputs["Surface"]); m.surface_render_method = "DITHERED"
    bpy.ops.mesh.primitive_plane_add(size=1, rotation=(math.radians(90), 0, 0))
    body = bpy.context.object; body.name = name; body.scale = (w, h, 1); body.data.materials.append(m)
    rm = bpy.data.materials.new(name + "Rim"); rm.use_nodes = True; nt = rm.node_tree; nt.nodes.clear()
    t2 = nt.nodes.new("ShaderNodeTexImage"); t2.image = im
    e2 = nt.nodes.new("ShaderNodeEmission"); e2.inputs["Color"].default_value = lin(rim); e2.inputs["Strength"].default_value = 1.0  # rim shows the team colour, not a clipped glow
    tr = nt.nodes.new("ShaderNodeBsdfTransparent"); mx = nt.nodes.new("ShaderNodeMixShader"); o2 = nt.nodes.new("ShaderNodeOutputMaterial")
    th2 = nt.nodes.new("ShaderNodeMath"); th2.operation = "GREATER_THAN"; th2.inputs[1].default_value = 0.5
    nt.links.new(t2.outputs["Alpha"], th2.inputs[0]); nt.links.new(th2.outputs[0], mx.inputs[0]); nt.links.new(tr.outputs[0], mx.inputs[1]); nt.links.new(e2.outputs[0], mx.inputs[2])
    nt.links.new(mx.outputs[0], o2.inputs[0]); rm.surface_render_method = "DITHERED"
    bpy.ops.mesh.primitive_plane_add(size=1); r = bpy.context.object; r.name = name + "Rim"; r.data.materials.append(rm)
    r.parent = body; r.location = (0, 0, -0.1); r.rotation_euler = (0, 0, 0); r.scale = (1.012, 1.006, 1)
    z = -5.6 + h / 2
    key(body, "location", [(24, (sx + enter_from, REF_Y, z)), (33, (sx, REF_Y, z)), (N, (sx * 1.015, REF_Y, z))])
    return body

def nameplate(label, sx, sz, color, stripe, stripe_side):
    loc, k = at(sx, sz, -1.2)
    w, h, sh = 6.6 * k, 1.3 * k, 0.45 * k
    me = bpy.data.meshes.new("NP"); me.from_pydata([(-w / 2 + sh, 0, h / 2), (w / 2 + sh, 0, h / 2), (w / 2 - sh, 0, -h / 2), (-w / 2 - sh, 0, -h / 2)], [], [(0, 1, 2, 3)])
    o = bpy.data.objects.new("NP_" + label, me); sc.collection.objects.link(o); o.location = loc
    o.modifiers.new("Solid", "SOLIDIFY").thickness = 0.12
    bv = o.modifiers.new("Bevel", "BEVEL"); bv.width = 0.02; bv.segments = 2
    o.data.materials.append(mat("NPM" + label, color, rough=0.3, coat=1.0, emit=color, estr=0.25))
    sme = bpy.data.meshes.new("ST"); sw = 0.28 * k; x0 = stripe_side * (w / 2 - sw)
    sme.from_pydata([(x0 - sw / 2 + sh, -0.07, h / 2), (x0 + sw / 2 + sh, -0.07, h / 2), (x0 + sw / 2 - sh, -0.07, -h / 2), (x0 - sw / 2 - sh, -0.07, -h / 2)], [], [(0, 1, 2, 3)])
    s = bpy.data.objects.new("ST_" + label, sme); sc.collection.objects.link(s); s.parent = o; s.location = (0, -0.2, 0)
    s.data.materials.append(mat("STM" + label, stripe, rough=0.3, emit=stripe, estr=1.5))
    t = text(label, 0.98 * k, "#ffffff", FONT_TITLE, extrude=0.02, emit=1.0); t["role"] = "name"; t.parent = o; t.location = (stripe_side * -0.2 * k, -0.32, 0)
    return o

mah = player(P1["cutout"] if DATA else f"{A}/source/unreal-full-body-demo/Mahomes-full-body-demo.png", "Mahomes", -6.6, 9.4, KC, -14)
alle = player(P2["cutout"] if DATA else f"{A}/source/unreal-full-body-demo/Allen-full-body-demo.png", "Allen", 6.4, 10.4, BUF, 14)
np1 = nameplate(P1["name"].upper() if DATA else "PATRICK MAHOMES", -6.3, -4.3, P1["plate"] if DATA else "#b5102b", KC_GOLD, -1)
np2 = nameplate(P2["name"].upper() if DATA else "JOSH ALLEN", 6.5, -4.3, P2["plate"] if DATA else "#0b2c8a", BUF_RED, 1)
for o, d in ((np1, -1), (np2, 1)):
    e = tuple(o.location); key(o, "location", [(26, (e[0] + d * 12, e[1], e[2])), (34, e), (N, (e[0] * 1.01, e[1], e[2]))])

# ------------------------------------------------- title: chrome 2025 STATS (y -1.5)
chrome = mat("Chrome", "#ffffff", rough=0.5, emit="#ffffff", estr=1.1)
tl, k = at(-8.95, 5.7, -1.5)
title = text(DATA["title"] if DATA else "2025 STATS", 1.55 * k, "#ffffff", FONT_TITLE, extrude=0.16, align="LEFT", m=chrome)
title.location = tl; title["role"] = "title"
key(title, "scale", [(37, (0.0001,) * 3), (38, (1.9,) * 3), (40, (1.08,) * 3), (43, (1, 1, 1)), (N, (1.02,) * 3)])

# ------------------------------------------------- stat table: dark glass (y -0.8)
tc_, k = at(0.0, -1.45, -0.8)
tw, th = 8.2 * k, 4.1 * k
table = box("Table", (tw, 0.18, th), tc_, mat("Glass", "#0b0c0f", rough=0.6, coat=0.12), bevel=0.05)
key(table, "location", [(50, (tc_[0], tc_[1], tc_[2] - 6)), (58, tc_)])
key(table, "scale", [(49, (0.0001,) * 3), (50, (tw, 0.18, th)), (N, (tw, 0.18, th))], interp="CONSTANT")
rows = [("GAMES", "14", "17", 62), ("PASS YDS", "3,587", "3,668", 72), ("PASS TD", "22", "25", 82), ("INT", "11", "10", 92)]
if DATA:
    rows = [(r["label"], r["left"], r["right"], r["frame"] - 4) for r in DATA["stats"]]
rule = mat("Rule", "#8b8f96", emit="#8b8f96", estr=0.6)
for i, (lab, a, b, f) in enumerate(rows):
    rz = tc_[2] + th / 2 - th * (i + 0.5) / 4
    for txt, xx, size, fnt in ((a, -tw * 0.33, 0.95, FONT_TITLE), (lab, 0, 0.68, FONT_ROW), (b, tw * 0.33, 0.95, FONT_TITLE)):
        t = text(txt, size * k, "#ffffff", fnt, extrude=0.03, emit=0.9); t.location = (tc_[0] + xx, tc_[1] - 0.2, rz)
        t["role"] = "label" if xx == 0 else "value"
        key(t, "scale", [(f - 1, (0.0001,) * 3), (f, (1.8,) * 3), (f + 2, (1.06,) * 3), (f + 4, (1, 1, 1))])
    if i < 3:
        ln = box(f"Rule{i}", (tw * 0.92, 0.02, 0.025), (tc_[0], tc_[1] - 0.15, rz - th / 8), rule, bevel=0.0)
        key(ln, "scale", [(f + 2, (0.0001, 0.02, 0.025)), (f + 8, (tw * 0.92, 0.02, 0.025))])

# ------------------------------------------------- foreground dust (y -14 .. -10)
dm = mat("Dust", "#ffffff", emit="#fff1dc", estr=2.0)
for i in range(28):
    bpy.ops.mesh.primitive_ico_sphere_add(radius=random.uniform(0.012, 0.028), subdivisions=1,
        location=(random.uniform(-6, 6), random.uniform(-15, -10.5), random.uniform(-2.5, 4)))
    d = bpy.context.object; d.data.materials.append(dm); a = d.location.copy()
    key(d, "location", [(1, tuple(a)), (N, tuple(a + Vector((random.uniform(-0.5, 0.5), 0, random.uniform(0.2, 0.8)))))], interp="LINEAR")

# ------------------------------------------------- air
bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 20, 5)); hz = bpy.context.object; hz.scale = (80, 40, 30)
hm = bpy.data.materials.new("Haze"); hm.use_nodes = True; nt = hm.node_tree; nt.nodes.clear()
pv = nt.nodes.new("ShaderNodeVolumePrincipled"); pv.inputs["Density"].default_value = 0.001
o = nt.nodes.new("ShaderNodeOutputMaterial"); nt.links.new(pv.outputs[0], o.inputs["Volume"]); hz.data.materials.append(hm)

# ------------------------------------------------- light
aim = bpy.data.objects.new("Aim", None); sc.collection.objects.link(aim); aim.location = (0, 6, 1)
def light(name, kind, loc, energy, color, size=1.0, spot=None):
    ld = bpy.data.lights.new(name, kind); ld.energy = energy; ld.color = lin(color)[:3]
    if kind == "AREA": ld.size = size
    if kind == "SPOT": ld.spot_size = math.radians(spot or 30); ld.spot_blend = 0.5
    o = bpy.data.objects.new(name, ld); sc.collection.objects.link(o); o.location = loc
    c = o.constraints.new("TRACK_TO"); c.target = aim; c.track_axis = "TRACK_NEGATIVE_Z"; c.up_axis = "UP_Y"; return o
k_ = light("Key", "AREA", (-11, -8, 12), 3200, "#fff4ea", size=0.7)
key(k_, "location", [(1, (-12, -8, 12)), (N, (-4, -9, 11))], ease="EASE_IN_OUT")
light("RimKC", "AREA", (-8, 4, 7), 2600, KC, size=4)
light("RimBUF", "AREA", (8, 4, 7), 2600, BUF, size=4)
light("Top", "AREA", (0, 8, 16), 1500, "#ffffff", size=8)
_gr = light("GrazeR", "AREA", (12, 2, 14), 2200, "#e8f0ff", size=2.5); _gr.data.shape = "DISK"
st_ = light("SpineTop", "SPOT", (0, 7, 22), 6000, "#eef3ff", spot=9); st_.data.spot_blend = 0.9
light("Fill", "AREA", (4, -14, 1), 350, "#dbe8ff", size=8)
light("BeamKC", "SPOT", (-14, 28, 14), 18000, "#ffcfc9", spot=20)
light("BeamBUF", "SPOT", (14, 28, 14), 18000, "#c9dcff", spot=20)
for i, x in enumerate((-12, 12)):  # reflection cards for the chrome title, hidden from camera
    bpy.ops.mesh.primitive_plane_add(size=1, location=(x, -32, 9), rotation=(math.radians(70), 0, 0))
    c = bpy.context.object; c.scale = (14, 6, 1); c.visible_camera = False
    c.data.materials.append(mat(f"Card{i}", "#000000", emit="#ffffff", estr=4))

# ------------------------------------------------- camera: push in, then never stops
cd = bpy.data.cameras.new("Cam"); cd.lens = 38
cam = bpy.data.objects.new("Cam", cd); sc.collection.objects.link(cam); sc.camera = cam
tgt = bpy.data.objects.new("CamTarget", None); sc.collection.objects.link(tgt)
c = cam.constraints.new("TRACK_TO"); c.target = tgt; c.track_axis = "TRACK_NEGATIVE_Z"; c.up_axis = "UP_Y"
key(cam, "location", [(1, (-1.6, -30, 2.2)), (18, (-0.35, -22.2, 1.1)), (N, (0.35, -19.8, 0.7))])
key(tgt, "location", [(1, (-0.2, 4, 1.0)), (N, (0.2, 4, 0.6))], ease="EASE_IN_OUT")
cd.dof.use_dof = True; cd.dof.aperture_fstop = 2.8; cd.dof.focus_object = bpy.data.objects["Table"]

# ------------------------------------------------- house type: flat white text, dark title and table panels
def flat(name, hexc):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; nt.nodes.clear()
    e = nt.nodes.new("ShaderNodeEmission"); e.inputs["Color"].default_value = lin(hexc)
    nt.links.new(e.outputs[0], nt.nodes.new("ShaderNodeOutputMaterial").inputs["Surface"]); return m
white = flat("HouseWhite", "#ffffff")
team_font, stat_font = (bpy.data.fonts.load(f, check_existing=True) for f in (FONT_TEAM, FONT_STAT))
bpy.context.view_layer.update()
for o in [o for o in sc.objects if o.type == "FONT" and o.get("role")]:
    cu = o.data; h0, w0 = o.dimensions.y, o.dimensions.x
    cu.font = team_font if o["role"] in ("name", "title") else stat_font; cu.extrude = 0; cu.bevel_depth = 0
    bpy.context.view_layer.update()
    cu.size *= min(h0 / max(o.dimensions.y, 1e-4), w0 / max(o.dimensions.x, 1e-4)) * 1.05   # same footprint as before
    if o["role"] in ("label", "value"):
        cu.size *= 1.3 if o["role"] == "label" else 1.45; o.location.z -= 0.08               # large, clear stats
    cu.materials.clear(); cu.materials.append(white)
# Labels sit at 0.62x the row's value size, as on the approved C02 table.
vals = [o for o in sc.objects if o.get("role") == "value"]
for o in [o for o in sc.objects if o.get("role") == "label"]:
    row = [v.data.size for v in vals if abs(v.location.z - o.location.z) < 1e-3]
    if row: o.data.size = 0.62 * max(row)
bpy.context.view_layer.update()
pts = list(title.bound_box); x0 = min(q[0] for q in pts) - 0.2; x1 = max(q[0] for q in pts) + 0.2
y0 = min(q[1] for q in pts) - 0.12; y1 = max(q[1] for q in pts) + 0.12
pm = bpy.data.meshes.new("Title panel"); pm.from_pydata([(x0, y0, -0.06), (x1, y0, -0.06), (x1, y1, -0.06), (x0, y1, -0.06)], [], [(0, 1, 2, 3)])
panel = bpy.data.objects.new("Title panel", pm); sc.collection.objects.link(panel); panel.parent = title; panel.data.materials.append(flat("TitlePanel", PANEL))
table.data.materials.clear(); table.data.materials.append(flat("TablePanel", PANEL))

for _n in ("SpineTop", "Top", "GrazeR", "Key", "Fill"): bpy.data.objects[_n].data.volume_factor = 0.0
_cg = bpy.data.node_groups.new("Comp", "CompositorNodeTree"); sc.compositing_node_group = _cg
_cg.interface.new_socket("Image", in_out="OUTPUT", socket_type="NodeSocketColor")
_rl = _cg.nodes.new("CompositorNodeRLayers"); _gl = _cg.nodes.new("CompositorNodeGlare"); _go = _cg.nodes.new("NodeGroupOutput")
_gl.inputs["Type"].default_value = "Bloom"; _gl.inputs["Threshold"].default_value = 2.0; _gl.inputs["Strength"].default_value = 0.12; _gl.inputs["Size"].default_value = 0.6
_cg.links.new(_rl.outputs["Image"], _gl.inputs["Image"]); _cg.links.new(_gl.outputs[0], _go.inputs[0])
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(OUT, "lane4-concept-v1.blend"))
print("BUILT", OUT)
