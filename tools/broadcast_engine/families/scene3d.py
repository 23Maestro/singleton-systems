"""Shared Blender layer kit for the Lineups card families (team cards, value metrics).

Same approach as the 3B stat card (prototypes/lane3/build_card.py): every layer sits at its own depth but keeps its
1920x1080 layout pixel position when the camera is home, so the camera arrival and drift give real parallax.
ponytail: helpers are copied from build_card.py, which stays untouched; fold 3B onto this module once 3B is re-proven.
"""
import bpy, os, json, math, hashlib
import numpy as np
from mathutils import Vector, Matrix
from bpy_extras.object_utils import world_to_camera_view

REPO = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
FT = "/Users/singleton23/Library/Fonts/"
LENS, HOME = 50.0, 30
sc = None

def setup(frames, half=False):
    global sc
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    sc.render.engine = "BLENDER_EEVEE"; sc.render.resolution_x, sc.render.resolution_y = (960, 540) if half else (1920, 1080)
    sc.render.fps = 25; sc.frame_start, sc.frame_end = 1, frames
    sc.view_settings.view_transform = "Standard"; sc.view_settings.look = "None"   # ADR 0003: team colours stay exact
    sc.eevee.taa_render_samples = 64; sc.eevee.use_raytracing = False             # screen-space tracing ghosts white type
    sc.render.use_motion_blur = True; sc.render.motion_blur_shutter = 0.5
    w = bpy.data.worlds.new("W"); sc.world = w; w.use_nodes = True
    w.node_tree.nodes["Background"].inputs["Color"].default_value = (0.004, 0.006, 0.01, 1)
    return sc

# ---------------------------------------------------------------- stadium (config/lineups/team-stadiums.json owns the choice)
def stadium(team):
    """The focus team's registered stadium photo, checksum-verified. None means 'Stadium photo needed: TEAM'."""
    reg = json.load(open(os.path.join(REPO, "config/lineups/team-stadiums.json")))
    row = next((t for t in reg["teams"] if t["team"] == team), None)
    if not row: return None
    got = hashlib.sha256(open(row["filePath"], "rb").read()).hexdigest()
    assert got == row["sha256"], f"{team} stadium checksum changed: {got}"
    return {k: row[k] for k in ("team", "eagleItemId", "filePath", "sha256")}

# ---------------------------------------------------------------- colour, space, keys
def lin(h):
    h = h.lstrip("#"); c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return (*[v / 12.92 if v <= 0.04045 else ((v + 0.055) / 1.055) ** 2.4 for v in c], 1.0)

def pscale(d): return 36.0 / LENS * d / 1920.0          # metres per layout pixel at depth d

def px(u, v, d):
    s = pscale(d); return Vector(((u - 960) * s, d, (540 - v) * s))

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

# ---------------------------------------------------------------- materials
def flat_mat(name, hexc, glow=0.85, rough=0.45, metal=0.0):
    m = bpy.data.materials.new(name); m.use_nodes = True; p = m.node_tree.nodes["Principled BSDF"]
    c = lin(hexc); p.inputs["Base Color"].default_value = c; p.inputs["Roughness"].default_value = rough
    p.inputs["Metallic"].default_value = metal
    p.inputs["Emission Color"].default_value = c; p.inputs["Emission Strength"].default_value = glow
    return m

def satin_mat(name, hexc):
    """rank-card.sculpted-satin v2: team primary colour, fine grain, a soft fold along the right edge, quiet centre.
    Only the colour changes per team (docs/lineups-rank-card-surface.md)."""
    m = flat_mat(name, hexc, glow=0.75, rough=0.42); nt = m.node_tree; p = nt.nodes["Principled BSDF"]
    tc = nt.nodes.new("ShaderNodeTexCoord"); sx = nt.nodes.new("ShaderNodeSeparateXYZ")
    nt.links.new(tc.outputs["Generated"], sx.inputs[0])
    fold = nt.nodes.new("ShaderNodeValToRGB"); r = fold.color_ramp; r.interpolation = "EASE"     # light across the card width
    r.elements[0].position, r.elements[0].color = 0.0, (0.86, 0.86, 0.86, 1)
    r.elements[1].position, r.elements[1].color = 0.80, (1.0, 1.0, 1.0, 1)
    for pos, v in ((0.45, 1.04), (0.87, 0.72), (0.93, 1.22), (1.0, 0.95)):
        e = r.elements.new(pos); e.color = (v, v, v, 1)
    nt.links.new(sx.outputs["X"], fold.inputs["Fac"])
    base = nt.nodes.new("ShaderNodeMix"); base.data_type = "RGBA"; base.blend_type = "MULTIPLY"
    base.inputs["Factor"].default_value = 1.0; base.inputs["A"].default_value = lin(hexc)
    nt.links.new(fold.outputs["Color"], base.inputs["B"])
    nt.links.new(base.outputs["Result"], p.inputs["Base Color"]); nt.links.new(base.outputs["Result"], p.inputs["Emission Color"])
    nz = nt.nodes.new("ShaderNodeTexNoise"); nz.inputs["Scale"].default_value = 900; nz.inputs["Detail"].default_value = 2
    bp = nt.nodes.new("ShaderNodeBump"); bp.inputs["Strength"].default_value = 0.06
    nt.links.new(nz.outputs["Fac"], bp.inputs["Height"])
    fb = nt.nodes.new("ShaderNodeBump"); fb.inputs["Strength"].default_value = 0.5                 # the fold itself
    nt.links.new(fold.outputs["Color"], fb.inputs["Height"]); nt.links.new(bp.outputs["Normal"], fb.inputs["Normal"])
    nt.links.new(fb.outputs["Normal"], p.inputs["Normal"])
    return m

# ---------------------------------------------------------------- geometry
def slab(name, u0, v0, u1, v1, d, m, thick=0.12, bevel=0.04, origin="CENTER", pts=None):
    """A flat piece covering layout pixels (u0,v0)-(u1,v1) at depth d. origin: CENTER, LEFT, RIGHT, BOTTOM, TOP."""
    s = pscale(d); W, H = (u1 - u0) * s, (v1 - v0) * s
    me = bpy.data.meshes.new(name)
    if pts:
        verts = [((x - 0.5) * W, 0, (0.5 - y) * H) for x, y in pts]
    else:
        verts = [(-W / 2, 0, H / 2), (W / 2, 0, H / 2), (W / 2, 0, -H / 2), (-W / 2, 0, -H / 2)]
    me.from_pydata(verts, [], [list(range(len(verts)))])
    o = bpy.data.objects.new(name, me); sc.collection.objects.link(o)
    sol = o.modifiers.new("S", "SOLIDIFY"); sol.thickness = thick; sol.offset = 1.0
    bv = o.modifiers.new("B", "BEVEL"); bv.width = bevel; bv.segments = 3; bv.limit_method = "ANGLE"
    o.data.materials.append(m)
    shift = {"CENTER": (0, 0), "LEFT": (W / 2, 0), "RIGHT": (-W / 2, 0), "BOTTOM": (0, H / 2), "TOP": (0, -H / 2)}[origin]
    shift = Vector((shift[0], 0, shift[1])); me.transform(Matrix.Translation(shift))
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

def _blur(a, r):
    """Separable box blur, run twice (close to a gaussian)."""
    for _ in range(2):
        for ax in (0, 1):
            c = np.cumsum(np.pad(a, [(r + 1, r) if i == ax else (0, 0) for i in range(3)], mode="edge"), axis=ax)
            hi = np.take(c, range(2 * r + 1, c.shape[ax]), axis=ax); lo = np.take(c, range(0, c.shape[ax] - 2 * r - 1), axis=ax)
            a = (hi - lo) / (2 * r + 1)
    return a

def treat_photo(path, out_dir):
    """Broadcast plate treatment for every stadium photo: 10% darker, soft edge blur and a gentle vignette.
    Writes an episode copy beside the scene; the registered Eagle original is never touched."""
    im = bpy.data.images.load(path, check_existing=False); w, h = im.size
    a = np.array(im.pixels[:], dtype=np.float32).reshape(h, w, 4); rgb = a[..., :3]
    soft = _blur(rgb, max(2, int(w * 0.012)))
    yy, xx = np.mgrid[0:h, 0:w]; nx = (xx / (w - 1)) * 2 - 1; ny = (yy / (h - 1)) * 2 - 1
    rad = np.sqrt(nx ** 2 * 0.8 + ny ** 2 * 1.1)[..., None]
    edge = np.clip((rad - 0.55) / 0.55, 0, 1)
    rgb = rgb * (1 - edge) + soft * edge                       # edges go soft
    rgb = rgb * 0.9 * (1 - 0.32 * edge ** 1.6)                 # 10% darker, then a gentle vignette
    a[..., :3] = np.clip(rgb, 0, 1)
    dst = os.path.join(out_dir, "plate-" + os.path.splitext(os.path.basename(path))[0] + ".png")
    out = bpy.data.images.new("PlateTreated", w, h); out.pixels[:] = a.ravel()
    out.filepath_raw = dst; out.file_format = "PNG"; out.save(); bpy.data.images.remove(im)
    return dst

def plate(path, out_dir, d=90.0, glow=0.55, zoom=1.3):
    """Stadium photo behind everything, cover-fitted (no stretching) and big enough that the camera
    never sees its edge (check_plate_cover proves it). No mirror tiling."""
    o, im = image_plane("Plate", treat_photo(path, out_dir), d, glow)
    s = pscale(d); fw, fh = 1920 * s * zoom, 1080 * s * zoom; aspect = im.size[0] / im.size[1]
    o.scale = (max(fw, fh * aspect), max(fh, fw / aspect), 1); o.location = px(960, 540, d)
    o.active_material.node_tree.nodes["Image Texture"].extension = "EXTEND"
    return o

def check_plate_cover(o, n):
    """Every frame, all four corners of the camera view must land on the plate."""
    cam = sc.camera; hw, hh = o.scale.x / 2, o.scale.y / 2; c = o.location
    for f in range(1, n + 1):
        sc.frame_set(f); bpy.context.view_layer.update(); mw = cam.matrix_world; eye = mw.translation
        for corner in cam.data.view_frame(scene=sc):
            ray = (mw @ corner) - eye; t = (c.y - eye.y) / ray.y; hit = eye + ray * t
            assert abs(hit.x - c.x) <= hw and abs(hit.z - c.z) <= hh, f"camera sees past the stadium photo at frame {f}"

def fit_image(o, im, u0, v0, u1, v1, d):
    """Scale an alpha image to fit inside the layout box (contain), centred on its visible pixels."""
    a = np.array(im.pixels[:]).reshape(im.size[1], im.size[0], 4)[::-1, :, 3]
    ys, xs = np.nonzero(a > 0.1)
    bx0, by0, bx1, by1 = xs.min() / im.size[0], ys.min() / im.size[1], (xs.max() + 1) / im.size[0], (ys.max() + 1) / im.size[1]
    s = pscale(d); aspect = im.size[0] / im.size[1]
    vis_w, vis_h = (bx1 - bx0) * aspect, (by1 - by0)            # visible size for a plane of height 1
    k = min((u1 - u0) * s / vis_w, (v1 - v0) * s / vis_h)
    iw, ih = k * aspect, k; o.scale = (iw, ih, 1)
    cx = (bx0 + bx1) / 2 - 0.5; cy = 0.5 - (by0 + by1) / 2
    o.location = px((u0 + u1) / 2, (v0 + v1) / 2, d) - Vector((cx * iw, 0, cy * ih))

# Type system. Anton is the brand face for team names; Saira Semi Condensed carries numbers and supporting words.
ANTON = FT + "Anton-Regular.ttf"
SAIRA = "/Volumes/HomeSSD/Generated/CATENA_MEDIA/references/2026-11-11-team-cards-value-metrics/fonts/SairaSemiCondensed-Bold.ttf"
# Effect levels. Objects (cards, arrows, bars, logos) get the full 3D treatment elsewhere.
#   flat - numbers and big words: reads flat like broadcast type, a fine lit edge and a tight shadow, no spins
#   mid  - team names and labels: a little depth and a softer shadow
TIERS = {"flat": dict(extrude=0.006, bevel=0.0025, spacing=1.06, shadow=(3, 4, 0.55)),
         "mid": dict(extrude=0.018, bevel=0.005, spacing=1.04, shadow=(4, 5, 0.65))}

def text(body, font, hexc, cap_px, d, tier="flat", glow=1.0):
    """Type sized by ink height in layout pixels, with its tier's depth, letter spacing and drop shadow.
    Place it with put(); the shadow rides along."""
    t = TIERS[tier]
    cu = bpy.data.curves.new("t", "FONT"); cu.body = body
    cu.font = bpy.data.fonts.load(font if os.path.isabs(font) else FT + font, check_existing=True)
    cu.size = 1.0; cu.extrude = t["extrude"]; cu.bevel_depth = t["bevel"]; cu.bevel_resolution = 2
    cu.space_character = t["spacing"]; cu.align_x = "LEFT"; cu.align_y = "BOTTOM_BASELINE"
    o = bpy.data.objects.new("T " + body[:14], cu); sc.collection.objects.link(o)
    o.rotation_euler = (math.radians(90), 0, 0); o.location = (0, d, 0)
    o.data.materials.append(flat_mat("TM " + body[:10], hexc, glow=glow, rough=0.5))
    bpy.context.view_layer.update()
    k = cap_px * pscale(d) / max(o.dimensions.y, 1e-6); o.scale = (k, k, k); bpy.context.view_layer.update()
    drop_shadow(o, *t["shadow"])
    return o

def drop_shadow(o, du=5, dv=7, alpha=0.75):
    """Broadcast drop shadow: a dark copy just behind and below the type, carried by it through every move."""
    sh = o.copy(); sh.data = o.data.copy(); sc.collection.objects.link(sh); sh.name = "Shadow " + o.name
    m = bpy.data.materials.new("Shadow"); m.use_nodes = True; p = m.node_tree.nodes["Principled BSDF"]
    p.inputs["Base Color"].default_value = (0, 0, 0, 1); p.inputs["Alpha"].default_value = alpha
    p.inputs["Roughness"].default_value = 1.0; m.surface_render_method = "BLENDED"
    sh.data.materials.clear(); sh.data.materials.append(m); sh.visible_shadow = False
    s_ = pscale(o.location.y); sh.location = o.location + Vector((du * s_, 0.04, -dv * s_))
    parent(sh, o); return sh

def floor_shadow(u0, u1, floor_v, d, owner=None, depth=2.6, strength=0.8, tilt=24):
    """Shadow on the turf under a piece: a soft dark pool lying flat at floor level, darkest right under the piece.
    With an owner it moves, turns and scales with it, so the piece reads as having weight."""
    s = pscale(d); pad = (u1 - u0) * 0.08
    x0, x1 = (u0 - pad - 960) * s, (u1 + pad - 960) * s; z = (540 - floor_v) * s - 0.02
    me = bpy.data.meshes.new("Floor")
    back = 0.6                                   # the pool runs from just behind the base toward the camera, so it shows below the piece
    # the camera sits almost level with the turf, so a truly flat pool is a sliver; tip its near edge down toward the lens
    ny, nz = d - depth * math.cos(math.radians(tilt)), z - depth * math.sin(math.radians(tilt))
    me.from_pydata([(x0, ny, nz), (x1, ny, nz), (x1, d + back, z), (x0, d + back, z)], [], [(0, 1, 2, 3)])
    o = bpy.data.objects.new("Floor shadow", me); sc.collection.objects.link(o); o.visible_shadow = False
    m = bpy.data.materials.new("FloorShadow"); m.use_nodes = True; nt = m.node_tree; p = nt.nodes["Principled BSDF"]
    p.inputs["Base Color"].default_value = (0, 0, 0, 1); p.inputs["Roughness"].default_value = 1.0
    m.surface_render_method = "BLENDED"
    tc = nt.nodes.new("ShaderNodeTexCoord"); sub = nt.nodes.new("ShaderNodeVectorMath"); sub.operation = "SUBTRACT"
    sub.inputs[1].default_value = (0.5, 0.80, 0.5)
    mul = nt.nodes.new("ShaderNodeVectorMath"); mul.operation = "MULTIPLY"; mul.inputs[1].default_value = (2.1, 1.35, 0.0)
    ln = nt.nodes.new("ShaderNodeVectorMath"); ln.operation = "LENGTH"
    mr = nt.nodes.new("ShaderNodeMapRange"); mr.inputs["To Min"].default_value = 1.0; mr.inputs["To Max"].default_value = 0.0
    pw = nt.nodes.new("ShaderNodeMath"); pw.operation = "POWER"; pw.inputs[1].default_value = 1.8
    sc_ = nt.nodes.new("ShaderNodeMath"); sc_.operation = "MULTIPLY"; sc_.inputs[1].default_value = strength
    nt.links.new(tc.outputs["Generated"], sub.inputs[0]); nt.links.new(sub.outputs[0], mul.inputs[0])
    nt.links.new(mul.outputs[0], ln.inputs[0]); nt.links.new(ln.outputs["Value"], mr.inputs["Value"])
    nt.links.new(mr.outputs["Result"], pw.inputs[0]); nt.links.new(pw.outputs[0], sc_.inputs[0]); nt.links.new(sc_.outputs[0], p.inputs["Alpha"])
    o.data.materials.append(m)
    if owner: parent(o, owner)
    return o

def ink(o):
    bpy.context.view_layer.update(); p = [o.matrix_world @ Vector(c) for c in o.bound_box]
    return min(q.x for q in p), max(q.x for q in p), min(q.z for q in p), max(q.z for q in p)

def width_px(o): x0, x1, _, _ = ink(o); return (x1 - x0) / pscale(o.location.y)

def put(o, u, v, ux="LEFT", vy="TOP"):
    d = o.location.y; x0, x1, z0, z1 = ink(o); t = px(u, v, d)
    o.location.x += t.x - {"LEFT": x0, "CENTER": (x0 + x1) / 2, "RIGHT": x1}[ux]
    o.location.z += t.z - {"TOP": z1, "BOTTOM": z0, "CENTER": (z0 + z1) / 2}[vy]

def shrink_to(o, max_px):
    w = width_px(o)
    if w > max_px: o.scale *= max_px / w; bpy.context.view_layer.update()

# ---------------------------------------------------------------- motion vocabulary (build in, breathe, hold; Premiere owns the exit)
def pop(o, f0, dur=8, interp="BACK", axis=None):
    full = tuple(o.scale); z = tuple(0.0 if (axis is None or i in axis) else full[i] for i in range(3))
    key(o, "scale", [(f0, z), (f0 + dur, full)], interp=interp)

def slide(o, f0, du=0, dv=0, dur=10, interp="CUBIC"):
    end = o.location.copy(); s = pscale(o.matrix_world.translation.y)
    key(o, "location", [(f0, end + Vector((du * s, 0, -dv * s))), (f0 + dur, end)], interp=interp)
    key(o, "scale", [(f0 - 1, (0, 0, 0)), (f0, tuple(o.scale))], interp="CONSTANT")

def turn(o, f0, dur, deg, axis=2, interp="EXPO"):
    rest = o.rotation_euler.copy(); start = rest.copy(); start[axis] += math.radians(deg)
    key(o, "rotation_euler", [(f0, tuple(start)), (f0 + dur, tuple(rest))], interp=interp)

def parent(child, to):
    """Keep the child where it is; its location keys stay in layout space."""
    bpy.context.view_layer.update(); child.parent = to; child.matrix_parent_inverse = to.matrix_world.inverted()

def hide_until_open(n):
    """A piece squashed to zero scale still renders its bevel as a sliver; hide it until it opens."""
    for o in list(sc.objects):
        ad = o.animation_data
        if not (ad and ad.action): continue
        fcs = [fc for fc in _fcurves(ad.action) if fc.data_path == "scale"]
        if not fcs: continue
        first = next((f for f in range(1, n + 1) if all(fc.evaluate(f) > 1e-3 for fc in fcs)), 1)
        if first > 1:
            for x in [o] + list(o.children_recursive):
                key(x, "hide_render", [(1, True), (first, False)], interp="CONSTANT")

# ---------------------------------------------------------------- light, camera, finish
def key_light():
    sun = bpy.data.lights.new("Key", "SUN"); sun.energy = 2.2; sun.angle = math.radians(8)
    so = bpy.data.objects.new("Key", sun); sc.collection.objects.link(so)
    so.rotation_euler = (math.radians(60), math.radians(-22), math.radians(-12))

def camera(n, focus, start=(-3.2, -2.6, 1.0), drift=(1.4, 0.7, -0.3)):
    """3/4 arrival that lands home on frame 30, then a slow drift to the last frame."""
    cd = bpy.data.cameras.new("Cam"); cd.lens = LENS; cd.sensor_fit = "HORIZONTAL"; cd.sensor_width = 36
    cd.dof.use_dof = True; cd.dof.aperture_fstop = 4.0; cd.dof.focus_distance = focus
    cam = bpy.data.objects.new("Cam", cd); sc.collection.objects.link(cam); sc.camera = cam
    aim = bpy.data.objects.new("Aim", None); sc.collection.objects.link(aim)
    tc = cam.constraints.new("TRACK_TO"); tc.target = aim; tc.track_axis = "TRACK_NEGATIVE_Z"; tc.up_axis = "UP_Y"
    key(cam, "location", [(1, start), (HOME, (0, 0, 0)), (n, drift)], ease="EASE_OUT")
    key(aim, "location", [(1, (-0.8, focus, 0.35)), (HOME, (0, focus, 0)), (n, (drift[0] * 0.3, focus, -0.08))], ease="EASE_OUT")
    return cam

def check_on_cue(o, f, label, lead=7):
    """Hidden `lead` frames before its cue, settled by the cue."""
    sc.frame_set(f - lead); assert min(o.scale) < 1e-3, f"{label} shows before its cue"
    sc.frame_set(f); a = o.matrix_world.copy(); sc.frame_set(sc.frame_end)
    assert all(abs(x - y) < 1e-4 for r1, r2 in zip(a, o.matrix_world) for x, y in zip(r1, r2)), f"{label} is not settled on cue frame {f}"

def check_in_frame(objs, frames):
    cam = sc.camera
    for fr in frames:
        sc.frame_set(fr); bpy.context.view_layer.update()
        for o in objs:
            for c in o.bound_box:
                v = world_to_camera_view(sc, cam, o.matrix_world @ Vector(c))
                assert 0.02 <= v.x <= 0.98 and 0.02 <= v.y <= 0.98, f"{o.name} leaves the frame at {fr} ({v.x:.2f}, {v.y:.2f})"

def finish(blend_path, out, mode, still_frame=None, bloom=0.15):
    cg = bpy.data.node_groups.new("Comp", "CompositorNodeTree"); sc.compositing_node_group = cg
    cg.interface.new_socket("Image", in_out="OUTPUT", socket_type="NodeSocketColor")
    rl = cg.nodes.new("CompositorNodeRLayers"); gl = cg.nodes.new("CompositorNodeGlare"); go = cg.nodes.new("NodeGroupOutput")
    gl.inputs["Type"].default_value = "Bloom"; gl.inputs["Threshold"].default_value = 1.2
    gl.inputs["Strength"].default_value = bloom; gl.inputs["Size"].default_value = 0.6
    cg.links.new(rl.outputs["Image"], gl.inputs["Image"]); cg.links.new(gl.outputs[0], go.inputs[0])
    sc.frame_set(1)
    os.makedirs(os.path.dirname(blend_path), exist_ok=True); bpy.ops.wm.save_as_mainfile(filepath=blend_path)
    if mode == "still":
        for fr in still_frame:
            sc.frame_set(fr); sc.render.filepath = os.path.join(out, f"f_{fr:04d}.png"); bpy.ops.render.render(write_still=True)
    elif mode == "anim":
        sc.render.filepath = os.path.join(out, "frames", "f_"); sc.render.image_settings.file_format = "PNG"
        bpy.ops.render.render(animation=True)

def scrim(d, alpha=0.55):
    """A see-through dark sheet over the whole home frame at depth d, so type stays legible on bright stadium photos."""
    m = bpy.data.materials.new("Scrim"); m.use_nodes = True; p = m.node_tree.nodes["Principled BSDF"]
    p.inputs["Base Color"].default_value = (0, 0, 0, 1); p.inputs["Alpha"].default_value = alpha
    p.inputs["Roughness"].default_value = 1.0; m.surface_render_method = "BLENDED"
    bpy.ops.mesh.primitive_plane_add(size=1, rotation=(math.radians(90), 0, 0)); o = bpy.context.object; o.name = "Scrim"
    s = pscale(d); o.scale = (1920 * s * 3, 1080 * s * 3, 1); o.location = px(960, 540, d); o.data.materials.append(m)
    o.visible_shadow = False
    return o
