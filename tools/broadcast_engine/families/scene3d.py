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
MOVE_END = 150        # every Blender camera move ends by 6 s (inside the 5-7 s rule); the rest of the scene is a hold
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
    out = {k: row[k] for k in ("team", "eagleItemId", "filePath", "sha256")}
    # the per-team DepthFlow depth source (config/lineups/team-stadium-depth.json) is required for every Blender build
    dreg = json.load(open(os.path.join(REPO, "config/lineups/team-stadium-depth.json")))
    drow = next((t for t in dreg["teams"] if t["team"] == team), None)
    assert drow and drow["sourceSha256"] == row["sha256"], \
        f"{team} has no current depth source; run tools/broadcast_engine/stadium_depth.py with DepthFlow's Python"
    assert hashlib.sha256(open(drow["depthPath"], "rb").read()).hexdigest() == drow["depthSha256"], f"{team} depth map changed"
    out["depthPath"], out["depthSha256"] = drow["depthPath"], drow["depthSha256"]
    return out

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

def treat_photo(path, out_dir, dark=0.9):
    """Broadcast plate treatment for every stadium photo: 10% darker, soft edge blur and a gentle vignette.
    Writes an episode copy beside the scene; the registered Eagle original is never touched."""
    im = bpy.data.images.load(path, check_existing=False); w, h = im.size
    a = np.array(im.pixels[:], dtype=np.float32).reshape(h, w, 4); rgb = a[..., :3]
    soft = _blur(rgb, max(2, int(w * 0.012)))
    yy, xx = np.mgrid[0:h, 0:w]; nx = (xx / (w - 1)) * 2 - 1; ny = (yy / (h - 1)) * 2 - 1
    rad = np.sqrt(nx ** 2 * 0.8 + ny ** 2 * 1.1)[..., None]
    edge = np.clip((rad - 0.55) / 0.55, 0, 1)
    rgb = rgb * (1 - edge) + soft * edge                       # edges go soft
    rgb = rgb * dark * (1 - 0.32 * edge ** 1.6)                # 10% darker by default, then a gentle vignette
    a[..., :3] = np.clip(rgb, 0, 1)
    dst = os.path.join(out_dir, "plate-" + os.path.splitext(os.path.basename(path))[0] + ".png")
    out = bpy.data.images.new("PlateTreated", w, h); out.pixels[:] = a.ravel()
    out.filepath_raw = dst; out.file_format = "PNG"; out.save(); bpy.data.images.remove(im)
    return dst

def plate(path, depth_path, out_dir, d=90.0, glow=0.55, zoom=1.3, near=24.0, grid=(192, 108), dark=0.9):
    """Stadium photo as real 3D: a grid cover-fitted at depth d (no stretching), each point pushed toward the
    camera along its own sight line by the team's DepthFlow depth map. The home frame looks exactly like the
    photo; any camera move shows true parallax. near is how close the front turf comes (metres)."""
    o, im = image_plane("Plate", treat_photo(path, out_dir, dark), d, glow)
    s = pscale(d); fw, fh = 1920 * s * zoom, 1080 * s * zoom; aspect = im.size[0] / im.size[1]
    W, H = max(fw, fh * aspect), max(fh, fw / aspect); cx, cz = px(960, 540, d).x, px(960, 540, d).z
    dim = bpy.data.images.load(depth_path, check_existing=True); dim.colorspace_settings.name = "Non-Color"
    dep = np.array(dim.pixels[:], dtype=np.float32).reshape(dim.size[1], dim.size[0], 4)[..., 0]   # row 0 = bottom
    nx, nz = grid; verts, uvs, faces = [], [], []
    for j in range(nz + 1):
        for i in range(nx + 1):
            u, v = i / nx, j / nz
            dv = float(dep[min(int(v * (dim.size[1] - 1)), dim.size[1] - 1), min(int(u * (dim.size[0] - 1)), dim.size[0] - 1)])
            dist = 1.0 / ((1 - dv) / d + dv / near)            # depth map is disparity: linear in 1/distance
            k_ = dist / d
            verts.append(((cx + (u - 0.5) * W) * k_, d * k_, (cz + (v - 0.5) * H) * k_)); uvs.append((u, v))
    for j in range(nz):
        for i in range(nx):
            a_ = j * (nx + 1) + i; faces.append((a_, a_ + 1, a_ + nx + 2, a_ + nx + 1))
    me = bpy.data.meshes.new("Plate"); me.from_pydata(verts, [], faces); me.uv_layers.new()
    for poly in me.polygons:
        for li in poly.loop_indices: me.uv_layers.active.data[li].uv = uvs[me.loops[li].vertex_index]
    for poly in me.polygons: poly.use_smooth = True
    old = o.data; o.data = me; o.location = (0, 0, 0); o.rotation_euler = (0, 0, 0); o.scale = (1, 1, 1)
    me.materials.append(old.materials[0]); bpy.data.meshes.remove(old)
    o.active_material.node_tree.nodes["Image Texture"].extension = "EXTEND"
    o.visible_shadow = False      # the 3D stadium would shadow its own turf in hard lines; cards still shadow it
    return o

def check_plate_cover(o, n):
    """Through the whole camera move, all four corners of the view must hit the stadium surface."""
    from mathutils.bvhtree import BVHTree
    cam = sc.camera; bpy.context.view_layer.update()
    tree = BVHTree.FromObject(o, bpy.context.evaluated_depsgraph_get())
    for f in range(1, min(n, MOVE_END) + 1):
        sc.frame_set(f); bpy.context.view_layer.update(); mw = cam.matrix_world; eye = mw.translation
        for corner in cam.data.view_frame(scene=sc):
            hit = tree.ray_cast(eye, ((mw @ corner) - eye).normalized())
            assert hit[0] is not None, f"camera sees past the stadium photo at frame {f}"

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

# Type system. Team names use Antonio SemiBold, a lighter cut of the brand's Anton with open counters;
# Saira Semi Condensed carries numbers and supporting words.
TEAM_FONT = FT + "Antonio-SemiBold.ttf"
SAIRA = "/Volumes/HomeSSD/Generated/CATENA_MEDIA/references/2026-11-11-team-cards-value-metrics/fonts/SairaSemiCondensed-Bold.ttf"
# Effect levels. Objects (cards, arrows, bars, logos) get the full 3D treatment elsewhere.
#   flat - numbers and big words: reads flat like broadcast type, a fine lit edge and a tight shadow, no spins
#   mid  - labels: a little depth and a softer shadow
#   team - team names: thin edge and wider spacing so condensed letters stay readable
TIERS = {"team": dict(extrude=0.01, bevel=0.0015, spacing=1.08, shadow=(3, 4, 0.6)),
         "flat": dict(extrude=0.006, bevel=0.0025, spacing=1.06, shadow=(3, 4, 0.55)),
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

def floor_shadow(u0, u1, floor_v, d, owner=None, depth=2.8, strength=0.95, tilt=24):
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

# Layer-cake build: the base lands first, then each layer on top gets its own move, a few frames apart.
#   rise   - big values: up from just below, opening from a squash
#   wipe   - names and labels: grow from their left edge
#   block_dissolve - logos: snap on in a quick grid of blocks
def rise(o, f0, dur=8, dv=28):
    full = tuple(o.scale); slide(o, f0, dv=dv, dur=dur, interp="CUBIC")
    key(o, "scale", [(f0, (full[0], full[1] * 0.35, full[2])), (f0 + dur, full)], interp="EXPO")

def wipe(o, f0, dur=7):
    full = tuple(o.scale)
    key(o, "scale", [(f0, (0.0, full[1], full[2])), (f0 + dur, full)], interp="CUBIC")

def block_dissolve(o, f0, dur=6, blocks=16):
    """Image plane appears block by block: each cell of a grid turns on at its own random moment."""
    m = o.active_material; nt = m.node_tree; p = nt.nodes["Principled BSDF"]; t = nt.nodes["Image Texture"]
    tc = nt.nodes.new("ShaderNodeTexCoord"); mul = nt.nodes.new("ShaderNodeVectorMath"); mul.operation = "MULTIPLY"
    mul.inputs[1].default_value = (blocks, blocks, 1); fl = nt.nodes.new("ShaderNodeVectorMath"); fl.operation = "FLOOR"
    wn = nt.nodes.new("ShaderNodeTexWhiteNoise"); wn.noise_dimensions = "3D"
    prog = nt.nodes.new("ShaderNodeValue"); lt = nt.nodes.new("ShaderNodeMath"); lt.operation = "LESS_THAN"
    a = nt.nodes.new("ShaderNodeMath"); a.operation = "MULTIPLY"
    nt.links.new(tc.outputs["UV"], mul.inputs[0]); nt.links.new(mul.outputs[0], fl.inputs[0]); nt.links.new(fl.outputs[0], wn.inputs["Vector"])
    nt.links.new(wn.outputs["Value"], lt.inputs[0]); nt.links.new(prog.outputs[0], lt.inputs[1])
    nt.links.new(lt.outputs[0], a.inputs[0]); nt.links.new(t.outputs["Alpha"], a.inputs[1]); nt.links.new(a.outputs[0], p.inputs["Alpha"])
    prog.outputs[0].default_value = 0.0; prog.outputs[0].keyframe_insert("default_value", frame=f0)
    prog.outputs[0].default_value = 1.01; prog.outputs[0].keyframe_insert("default_value", frame=f0 + dur)
    for fc in _fcurves(nt.animation_data.action):
        for kp in fc.keyframe_points: kp.interpolation = "LINEAR"

def parent(child, to):
    """Keep the child where it is; its location keys stay in layout space."""
    bpy.context.view_layer.update(); child.parent = to; child.matrix_parent_inverse = to.matrix_world.inverted()

def hide_until_open(n):
    """A piece squashed to zero scale still renders its bevel as a sliver; hide it until it opens.
    Each piece waits for the later of its own opening and every parent's, so a parent never un-hides a child early."""
    opens = {}
    for o in sc.objects:
        ad = o.animation_data
        if not (ad and ad.action): continue
        fcs = [fc for fc in _fcurves(ad.action) if fc.data_path == "scale"]
        if fcs: opens[o.name] = next((f for f in range(1, n + 1) if all(fc.evaluate(f) > 1e-3 for fc in fcs)), 1)
    for o in list(sc.objects):
        first, p = opens.get(o.name, 1), o.parent
        while p: first, p = max(first, opens.get(p.name, 1)), p.parent
        if first > 1: key(o, "hide_render", [(1, True), (first, False)], interp="CONSTANT")

# ---------------------------------------------------------------- light, camera, finish
def key_light():
    sun = bpy.data.lights.new("Key", "SUN"); sun.energy = 2.2; sun.angle = math.radians(8)
    so = bpy.data.objects.new("Key", sun); sc.collection.objects.link(so)
    # nearly overhead, tipped 18 deg away from the camera and a touch from the left:
    # every piece's shadow falls on the turf right under it and a little behind
    so.rotation_euler = (math.radians(18), math.radians(-8), 0)

def camera(n, focus, start=(-3.2, -2.6, 1.0), move=(1.4, 0.7, -0.3)):
    """3/4 arrival that lands home on frame 30, then a truck that ends by MOVE_END (6 s). Then it holds."""
    cd = bpy.data.cameras.new("Cam"); cd.lens = LENS; cd.sensor_fit = "HORIZONTAL"; cd.sensor_width = 36
    cd.dof.use_dof = True; cd.dof.aperture_fstop = 4.0; cd.dof.focus_distance = focus
    cam = bpy.data.objects.new("Cam", cd); sc.collection.objects.link(cam); sc.camera = cam
    aim = bpy.data.objects.new("Aim", None); sc.collection.objects.link(aim)
    tc = cam.constraints.new("TRACK_TO"); tc.target = aim; tc.track_axis = "TRACK_NEGATIVE_Z"; tc.up_axis = "UP_Y"
    end = min(n, MOVE_END)
    key(cam, "location", [(1, start), (HOME, (0, 0, 0)), (end, move)], ease="EASE_OUT")
    key(aim, "location", [(1, (-0.8, focus, 0.35)), (HOME, (0, focus, 0)), (end, (move[0] * 0.3, focus, -0.08))], ease="EASE_OUT")
    return cam

def hold_from(n):
    """First frame after every object has stopped: the camera move (MOVE_END) or the last landing, whichever is later.
    Frames after it are a freeze of it."""
    last = MOVE_END
    for o in sc.objects:
        ad = o.animation_data
        if ad and ad.action:
            for fc in _fcurves(ad.action):
                if fc.data_path != "hide_render" and fc.keyframe_points: last = max(last, int(fc.keyframe_points[-1].co.x))
    return min(n, last + 1)

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
            if o.hide_render or min(o.matrix_world.to_scale()) < 1e-3: continue   # not on screen yet
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
        # render only the motion; the hold is copies of the last moving frame (the Unreal comps froze the same way)
        n, h = sc.frame_end, hold_from(sc.frame_end); sc.frame_end = h
        sc.render.filepath = os.path.join(out, "frames", "f_"); sc.render.image_settings.file_format = "PNG"
        bpy.ops.render.render(animation=True)
        import shutil
        last = os.path.join(out, "frames", f"f_{h:04d}.png")
        for f in range(h + 1, n + 1): shutil.copyfile(last, os.path.join(out, "frames", f"f_{f:04d}.png"))
        print(f"HOLD rendered 1-{h}, froze {h + 1}-{n}")

# ---------------------------------------------------------------- brushed team metal (card surface option)
BRUSH = "/Volumes/HomeSSD/Generated/SINGLETON_SYSTEMS/lookdev/ambientcg/Metal009/Metal009_2K-JPG_Roughness.jpg"

def brushed_mat(name, hexc, sweep_at=None, sweep_dur=14):
    """Team color in brushed metal: horizontal grain from the Metal009 scan (CC0, local), a lit bevel,
    and one soft light sweep across the face as the card lands."""
    m = flat_mat(name, hexc, glow=0.6, rough=0.32, metal=0.55); nt = m.node_tree; p = nt.nodes["Principled BSDF"]
    tc = nt.nodes.new("ShaderNodeTexCoord"); mp = nt.nodes.new("ShaderNodeMapping"); mp.inputs["Scale"].default_value = (0.35, 9.0, 1.0)
    tx = nt.nodes.new("ShaderNodeTexImage"); tx.image = bpy.data.images.load(BRUSH, check_existing=True)
    tx.image.colorspace_settings.name = "Non-Color"
    nt.links.new(tc.outputs["Generated"], mp.inputs["Vector"]); nt.links.new(mp.outputs[0], tx.inputs["Vector"])
    rr = nt.nodes.new("ShaderNodeMapRange"); rr.inputs["To Min"].default_value = 0.22; rr.inputs["To Max"].default_value = 0.45
    nt.links.new(tx.outputs["Color"], rr.inputs["Value"]); nt.links.new(rr.outputs["Result"], p.inputs["Roughness"])
    bp = nt.nodes.new("ShaderNodeBump"); bp.inputs["Strength"].default_value = 0.06
    nt.links.new(tx.outputs["Color"], bp.inputs["Height"]); nt.links.new(bp.outputs["Normal"], p.inputs["Normal"])
    if sweep_at is not None:                      # a soft diagonal band of light crosses the face once
        sx = nt.nodes.new("ShaderNodeSeparateXYZ"); nt.links.new(tc.outputs["Generated"], sx.inputs[0])
        diag = nt.nodes.new("ShaderNodeMath"); diag.operation = "MULTIPLY_ADD"; diag.inputs[1].default_value = 0.6
        nt.links.new(sx.outputs["Y"], diag.inputs[0]); nt.links.new(sx.outputs["X"], diag.inputs[2])
        pos = nt.nodes.new("ShaderNodeValue"); d = nt.nodes.new("ShaderNodeMath"); d.operation = "SUBTRACT"
        nt.links.new(diag.outputs[0], d.inputs[0]); nt.links.new(pos.outputs[0], d.inputs[1])
        ab = nt.nodes.new("ShaderNodeMath"); ab.operation = "ABSOLUTE"; nt.links.new(d.outputs[0], ab.inputs[0])
        band = nt.nodes.new("ShaderNodeMapRange"); band.inputs["From Max"].default_value = 0.22
        band.inputs["To Min"].default_value = 1.0; band.inputs["To Max"].default_value = 0.0
        nt.links.new(ab.outputs[0], band.inputs["Value"])
        st = nt.nodes.new("ShaderNodeMath"); st.operation = "MULTIPLY_ADD"; st.inputs[1].default_value = 0.45; st.inputs[2].default_value = 0.6
        nt.links.new(band.outputs["Result"], st.inputs[0]); nt.links.new(st.outputs[0], p.inputs["Emission Strength"])
        mx = nt.nodes.new("ShaderNodeMix"); mx.data_type = "RGBA"; mx.inputs["A"].default_value = lin(hexc); mx.inputs["B"].default_value = (1, 1, 1, 1)
        soft = nt.nodes.new("ShaderNodeMath"); soft.operation = "MULTIPLY"; soft.inputs[1].default_value = 0.3
        nt.links.new(band.outputs["Result"], soft.inputs[0]); nt.links.new(soft.outputs[0], mx.inputs["Factor"])
        nt.links.new(mx.outputs["Result"], p.inputs["Emission Color"])
        for f, v in ((sweep_at, -0.4), (sweep_at + sweep_dur, 1.6)):
            pos.outputs[0].default_value = v; pos.outputs[0].keyframe_insert("default_value", frame=f)
        for fc in _fcurves(nt.animation_data.action):
            for kp in fc.keyframe_points: kp.interpolation = "SINE"; kp.easing = "EASE_IN_OUT"
    return m

# ---------------------------------------------------------------- dust logo: specks drift in on a wind and settle into the logo
def _srgb(c): return np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)

def dust_in(logo, im, f0, dur=16, n=4500, wind=(-1.0, 0.0, 0.25), seed=7):
    """Thousands of tiny specks, each colored from the logo pixel it lands on, blow in from one side with a little
    turbulence and settle into the logo shape. The crisp logo fades in under them as they arrive."""
    rng = np.random.default_rng(seed)
    w, h = im.size; px_ = np.array(im.pixels[:], dtype=np.float32).reshape(h, w, 4)
    ys, xs = np.nonzero(px_[..., 3] > 0.5); pick = rng.choice(len(xs), size=min(n, len(xs)), replace=False)
    xs, ys = xs[pick], ys[pick]; col = _srgb(px_[ys, xs, :3])
    fr = sc.frame_current; sc.frame_set(f0); bpy.context.view_layer.update()   # read the logo where the landed card holds it
    mw = logo.matrix_world.copy(); sc.frame_set(fr)
    tgt = [mw @ Vector((x / w - 0.5, y / h - 0.5, 0.002)) for x, y in zip(xs, ys)]
    size = logo.scale.x
    wv = Vector(wind).normalized(); dist = rng.uniform(0.25, 0.9, len(tgt)) * size     # start just beside the logo
    jit = rng.normal(0, 0.12 * size, (len(tgt), 3))
    start = [t + wv * dd + Vector(j) for t, dd, j in zip(tgt, dist, jit)]
    bow = rng.normal(0, 0.18 * size, (len(tgt), 3))                            # each speck curls off the straight line
    xn = (xs / w); delay = np.clip(0.35 * (1 - xn) + rng.uniform(0, 0.15, len(xs)), 0, 0.5)   # far side of the wind settles last
    me = bpy.data.meshes.new("Dust"); me.from_pydata([tuple(t) for t in tgt], [], [])
    a = me.attributes.new("start", "FLOAT_VECTOR", "POINT"); a.data.foreach_set("vector", np.array([tuple(s) for s in start]).ravel())
    a = me.attributes.new("bow", "FLOAT_VECTOR", "POINT"); a.data.foreach_set("vector", bow.astype(np.float32).ravel())
    a = me.attributes.new("delay", "FLOAT", "POINT"); a.data.foreach_set("value", delay.astype(np.float32))
    a = me.attributes.new("col", "FLOAT_COLOR", "POINT"); a.data.foreach_set("color", np.c_[col, np.ones(len(col))].astype(np.float32).ravel())
    o = bpy.data.objects.new("Dust", me); sc.collection.objects.link(o); o.visible_shadow = False
    ng = bpy.data.node_groups.new("DustIn", "GeometryNodeTree")
    ng.interface.new_socket("Geometry", in_out="INPUT", socket_type="NodeSocketGeometry")
    ng.interface.new_socket("Geometry", in_out="OUTPUT", socket_type="NodeSocketGeometry")
    N = ng.nodes; L = ng.links.new
    gi, go = N.new("NodeGroupInput"), N.new("NodeGroupOutput")
    def attr(name, t):
        x = N.new("GeometryNodeInputNamedAttribute"); x.data_type = t; x.inputs["Name"].default_value = name; return x
    def math(op, a_=None, b_=None):
        x = N.new("ShaderNodeMath"); x.operation = op
        for i, v in enumerate((a_, b_)):
            if isinstance(v, (int, float)): x.inputs[i].default_value = v
            elif v is not None: L(v, x.inputs[i])
        return x
    tm = N.new("GeometryNodeInputSceneTime"); st, dl, cl = attr("start", "FLOAT_VECTOR"), attr("delay", "FLOAT"), attr("col", "FLOAT_COLOR")
    local = math("SUBTRACT", tm.outputs["Frame"], float(f0))                     # frames since the dust starts
    dd = math("MULTIPLY", dl.outputs["Attribute"], float(dur))
    own = math("SUBTRACT", local.outputs[0], dd.outputs[0])                     # frames since this speck appeared
    tt = math("DIVIDE", own.outputs[0], dur * 0.6); tt.use_clamp = True
    # ease-out: a speck moves fastest the moment it appears and only slows as it lands, so nothing waits in place
    ease = math("SUBTRACT", 1.0, math("POWER", math("SUBTRACT", 1.0, tt.outputs[0]).outputs[0], 3.0).outputs[0])
    mix = N.new("ShaderNodeMix"); mix.data_type = "VECTOR"; L(ease.outputs[0], mix.inputs["Factor"])
    L(st.outputs["Attribute"], mix.inputs["A"]); pos = N.new("GeometryNodeInputPosition"); L(pos.outputs[0], mix.inputs["B"])
    curl = math("SINE", math("MULTIPLY", tt.outputs[0], 3.14159265).outputs[0])  # a gust bend, zero at both ends
    bw = N.new("ShaderNodeVectorMath"); bw.operation = "SCALE"; L(attr("bow", "FLOAT_VECTOR").outputs["Attribute"], bw.inputs[0])
    L(curl.outputs[0], bw.inputs["Scale"])
    path = N.new("ShaderNodeVectorMath"); path.operation = "ADD"; L(mix.outputs["Result"], path.inputs[0]); L(bw.outputs[0], path.inputs[1])
    sp = N.new("GeometryNodeSetPosition"); L(gi.outputs[0], sp.inputs["Geometry"]); L(path.outputs[0], sp.inputs["Position"])
    fade = math("SUBTRACT", 1.0, math("DIVIDE", math("SUBTRACT", local.outputs[0], dur - 2.0).outputs[0], 5.0).outputs[0]); fade.use_clamp = True
    vis = math("DIVIDE", own.outputs[0], 3.0); vis.use_clamp = True             # each speck fades in while already moving
    alpha = math("MULTIPLY", fade.outputs[0], vis.outputs[0])
    s1 = N.new("GeometryNodeStoreNamedAttribute"); s1.data_type = "FLOAT_COLOR"; s1.inputs["Name"].default_value = "dustcol"
    L(sp.outputs[0], s1.inputs["Geometry"]); L(cl.outputs["Attribute"], s1.inputs["Value"])
    s2 = N.new("GeometryNodeStoreNamedAttribute"); s2.data_type = "FLOAT"; s2.inputs["Name"].default_value = "dustalpha"
    L(s1.outputs[0], s2.inputs["Geometry"]); L(alpha.outputs[0], s2.inputs["Value"])
    grid = N.new("GeometryNodeMeshGrid"); speck = size / np.sqrt(n) * 0.5
    grid.inputs["Size X"].default_value = speck; grid.inputs["Size Y"].default_value = speck
    grid.inputs["Vertices X"].default_value = 2; grid.inputs["Vertices Y"].default_value = 2
    iop = N.new("GeometryNodeInstanceOnPoints"); L(s2.outputs[0], iop.inputs["Points"]); L(grid.outputs["Mesh"], iop.inputs["Instance"])
    iop.inputs["Rotation"].default_value = (math_rad := 1.5707963, 0, 0)
    rz = N.new("GeometryNodeRealizeInstances"); L(iop.outputs[0], rz.inputs[0])
    sm2 = N.new("GeometryNodeSetMaterial"); L(rz.outputs[0], sm2.inputs["Geometry"]); L(sm2.outputs[0], go.inputs[0])
    mat = bpy.data.materials.new("Dust"); mat.use_nodes = True; mt = mat.node_tree; p = mt.nodes["Principled BSDF"]
    ac = mt.nodes.new("ShaderNodeAttribute"); ac.attribute_name = "dustcol"; aa = mt.nodes.new("ShaderNodeAttribute"); aa.attribute_name = "dustalpha"
    mt.links.new(ac.outputs["Color"], p.inputs["Base Color"]); mt.links.new(ac.outputs["Color"], p.inputs["Emission Color"])
    p.inputs["Emission Strength"].default_value = 1.15; mt.links.new(aa.outputs["Fac"], p.inputs["Alpha"]); mat.surface_render_method = "BLENDED"
    sm2.inputs["Material"].default_value = mat
    mod = o.modifiers.new("Dust", "NODES"); mod.node_group = ng
    # the crisp logo fades in under the settling specks
    lm = logo.active_material; lt = lm.node_tree; lp = lt.nodes["Principled BSDF"]; tx = lt.nodes["Image Texture"]
    fv = lt.nodes.new("ShaderNodeValue"); mul = lt.nodes.new("ShaderNodeMath"); mul.operation = "MULTIPLY"
    lt.links.new(tx.outputs["Alpha"], mul.inputs[0]); lt.links.new(fv.outputs[0], mul.inputs[1]); lt.links.new(mul.outputs[0], lp.inputs["Alpha"])
    for f, v in ((f0 + dur - 6, 0.0), (f0 + dur + 1, 1.0)):
        fv.outputs[0].default_value = v; fv.outputs[0].keyframe_insert("default_value", frame=f)
    return o
