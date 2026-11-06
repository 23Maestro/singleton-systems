"""Add the LineUps coin portal open to the Lane 4 concept scene.

Usage: Blender -b <lane4-concept-v1.blend> --python-exit-code 1 -P add_lineups_open.py -- <out.blend>
"""
import bpy, math, sys

OUT = sys.argv[sys.argv.index("--") + 1]
LOGO = "/Volumes/HomeSSD/Content Editor.library/images/MSJBJEAI3JUKP.info/Lineups Circular Logo.png"
SHIFT = 44
CYAN = "#52ADE7"
sc = bpy.context.scene

def lin(h, a=1.0):
    h = h.lstrip("#"); c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    f = lambda v: v / 12.92 if v <= 0.04045 else ((v + 0.055) / 1.055) ** 2.4
    return (*[f(v) for v in c], a)

def fcurves(action):
    try:
        if len(action.fcurves): return list(action.fcurves)
    except AttributeError:
        pass
    out = []
    for layer in getattr(action, "layers", []):
        for strip in layer.strips:
            for cb in strip.channelbags: out.extend(cb.fcurves)
    return out

# 1. push every existing move 18 frames later
for act in bpy.data.actions:
    for fc in fcurves(act):
        for kp in fc.keyframe_points:
            kp.co.x += SHIFT; kp.handle_left.x += SHIFT; kp.handle_right.x += SHIFT
sc.frame_end = sc.frame_end + SHIFT

def key(obj, path, fv, interp="BEZIER", ease="EASE_OUT"):
    for f, v in fv:
        setattr(obj, path, v); obj.keyframe_insert(data_path=path, frame=f)
    for fc in fcurves(obj.animation_data.action):
        if fc.data_path == path:
            for kp in fc.keyframe_points: kp.interpolation = interp; kp.easing = ease

def mat(name, base, rough=0.3, metal=0.0, coat=0.0, emit=None, estr=0.0):
    m = bpy.data.materials.new(name); m.use_nodes = True; p = m.node_tree.nodes["Principled BSDF"]
    p.inputs["Base Color"].default_value = lin(base); p.inputs["Roughness"].default_value = rough
    p.inputs["Metallic"].default_value = metal; p.inputs["Coat Weight"].default_value = coat
    if emit: p.inputs["Emission Color"].default_value = lin(emit); p.inputs["Emission Strength"].default_value = estr
    return m

def fade_input(m, frames):
    """Multiply the material's alpha by a keyed value."""
    nt = m.node_tree; p = nt.nodes["Principled BSDF"]
    val = nt.nodes.new("ShaderNodeValue")
    src = p.inputs["Alpha"].links[0].from_socket if p.inputs["Alpha"].is_linked else None
    mul = nt.nodes.new("ShaderNodeMath"); mul.operation = "MULTIPLY"
    if src: nt.links.new(src, mul.inputs[0])
    else: mul.inputs[0].default_value = 1.0
    nt.links.new(val.outputs[0], mul.inputs[1]); nt.links.new(mul.outputs[0], p.inputs["Alpha"])
    for f, v in frames:
        val.outputs[0].default_value = v; val.outputs[0].keyframe_insert("default_value", frame=f)
    m.surface_render_method = "DITHERED"

# 2. the coin, in front of the camera's first position
C = (-2.0, -24.0, 2.0)
coin = bpy.data.objects.new("LU_Coin", None); sc.collection.objects.link(coin); coin.location = C
im = bpy.data.images.load(LOGO); r = 1.55
bpy.ops.mesh.primitive_cylinder_add(radius=r * 0.985, depth=0.22, vertices=96, rotation=(math.radians(90), 0, 0))
body = bpy.context.object; body.name = "LU_CoinBody"; body.parent = coin; body.location = (0, 0.12, 0)
bv = body.modifiers.new("Bevel", "BEVEL"); bv.width = 0.05; bv.segments = 4
bm = mat("LU_Edge", "#e9eef2", rough=0.18, metal=1.0, coat=1.0); body.data.materials.append(bm)
bpy.ops.mesh.primitive_plane_add(size=1, rotation=(math.radians(90), 0, 0))
face = bpy.context.object; face.name = "LU_Face"; face.parent = coin; face.location = (0, 0.0, 0)
face.scale = (2 * r * 706 / 720, 2 * r, 1)
fm = bpy.data.materials.new("LU_FaceM"); fm.use_nodes = True; nt = fm.node_tree; p = nt.nodes["Principled BSDF"]
t = nt.nodes.new("ShaderNodeTexImage"); t.image = im
nt.links.new(t.outputs["Color"], p.inputs["Base Color"]); nt.links.new(t.outputs["Alpha"], p.inputs["Alpha"])
nt.links.new(t.outputs["Color"], p.inputs["Emission Color"]); p.inputs["Emission Strength"].default_value = 0.55
p.inputs["Roughness"].default_value = 0.2; p.inputs["Coat Weight"].default_value = 1.0
face.data.materials.append(fm)
fade_input(fm, [(40, 1.0), (46, 0.0)]); fade_input(bm, [(40, 1.0), (46, 0.0)])
key(coin, "scale", [(1, (0.0001,) * 3), (2, (2.0,) * 3), (3, (1.15,) * 3), (5, (1.0,) * 3), (38, (1.07,) * 3), (46, (11.0,) * 3)])
key(coin, "rotation_euler", [(2, (0, 0, math.radians(-28))), (5, (0, 0, math.radians(-3))), (38, (0, 0, math.radians(4)))])
key(coin, "location", [(38, C), (46, (C[0] * 0.6, C[1] - 3.2, C[2] * 0.9))], ease="EASE_IN")

# 3. black curtain behind the coin hides the set until the pass
bpy.ops.mesh.primitive_plane_add(size=1, location=(C[0], C[1] + 0.6, C[2]), rotation=(math.radians(90), 0, 0))
cur = bpy.context.object; cur.name = "LU_Curtain"; cur.scale = (40, 24, 1)
cm = mat("LU_CurtainM", "#020203", rough=1.0); cur.data.materials.append(cm); fade_input(cm, [(40, 1.0), (46, 0.0)])

# light sweep across the coin through the hold
sw = bpy.data.lights.new("CoinSweep", "AREA"); sw.energy = 120; sw.size = 0.6
swo = bpy.data.objects.new("CoinSweep", sw); sc.collection.objects.link(swo)
tc = swo.constraints.new("TRACK_TO"); tc.target = coin; tc.track_axis = "TRACK_NEGATIVE_Z"; tc.up_axis = "UP_Y"
key(swo, "location", [(3, (C[0] - 4, C[1] - 3, C[2] + 3)), (40, (C[0] + 4, C[1] - 3, C[2] + 2))], ease="EASE_IN_OUT")
key(swo, "scale", [(40, (1, 1, 1)), (41, (0.0001,) * 3)], interp="CONSTANT")

# LineUps bug lands in its on-air corner and stays
bpy.ops.mesh.primitive_plane_add(size=1, rotation=(math.radians(90), 0, 0))
bug = bpy.context.object; bug.name = "LU_Bug"
k_ = (-1.5 - (-20.5)) / (1.5 - (-20.5)); bug.location = (8.9 * k_, -1.5, 0.8 + (5.6 - 0.8) * k_)
bm2 = bpy.data.materials.new("LU_BugM"); bm2.use_nodes = True; nt2 = bm2.node_tree; p2 = nt2.nodes["Principled BSDF"]
t2 = nt2.nodes.new("ShaderNodeTexImage"); t2.image = im
th = nt2.nodes.new("ShaderNodeMath"); th.operation = "GREATER_THAN"; th.inputs[1].default_value = 0.5
nt2.links.new(t2.outputs["Color"], p2.inputs["Base Color"]); nt2.links.new(t2.outputs["Color"], p2.inputs["Emission Color"])
nt2.links.new(t2.outputs["Alpha"], th.inputs[0]); nt2.links.new(th.outputs[0], p2.inputs["Alpha"])
p2.inputs["Emission Strength"].default_value = 1.0; bm2.surface_render_method = "DITHERED"; bug.data.materials.append(bm2)
s0 = 1.15 * k_
key(bug, "scale", [(47, (0.0001,) * 3), (48, (s0 * 2.0, s0 * 2.0, 1)), (50, (s0 * 1.1, s0 * 1.1, 1)), (52, (s0, s0, 1))])

# 5. focus starts on the coin, pulls to the table
fp = bpy.data.objects.new("FocusPt", None); sc.collection.objects.link(fp)
tb = bpy.data.objects["Table"].matrix_world.translation.copy()
key(fp, "location", [(1, C), (40, C), (52, tuple(tb))], ease="EASE_IN_OUT")
sc.camera.data.dof.focus_object = fp

bpy.ops.wm.save_as_mainfile(filepath=OUT)
print("OPEN ADDED", sc.frame_end)
