"""Lane 3 building blocks: scene setup, the stadium set (23M-393) and the 3D number kit (23M-394).

Imported by the build and test scripts, which run inside Blender:
    Blender -b --factory-startup --python-exit-code 1 -P <script>.py -- <out_dir>
"""
import bpy, math, os
from mathutils import Vector

KIT = "/Volumes/HomeSSD/Generated/CATENA_MEDIA/references/2026-10-08-stadium-kit"
FIELD_GLB = f"{KIT}/american-football-field.glb"   # GLB, never the downloaded .blend
GRASS = f"{KIT}/grass001/Grass001_2K-PNG"
HDRI = f"{KIT}/stadium_01_4k.hdr"
NUMBER_FONT = "/Users/singleton23/Library/Fonts/Anton-Regular.ttf"   # clean condensed numbers, same family as the Prime type
GLYPHS = set("0123456789,+%.")
FIELD_Y = 42.0   # near goal line at y = -3.7: the camera (y about -8) stands in the near end zone, stations just past the goal line


def lin(h, a=1.0):
    h = h.lstrip("#"); c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    f = lambda v: v / 12.92 if v <= 0.04045 else ((v + 0.055) / 1.055) ** 2.4
    return (*[f(v) for v in c], a)


def new_scene(res=(1920, 1080), fps=25, samples=64):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    sc.render.engine = "BLENDER_EEVEE"
    sc.render.resolution_x, sc.render.resolution_y = res
    sc.render.fps = fps
    sc.view_settings.view_transform = "Standard"; sc.view_settings.look = "Medium High Contrast"; sc.view_settings.exposure = -0.3
    ee = sc.eevee
    ee.taa_render_samples = samples; ee.use_raytracing = True
    ee.use_shadows = True
    ee.volumetric_start, ee.volumetric_end = 0.5, 120.0
    ee.volumetric_tile_size = "4"; ee.volumetric_samples = 64
    ee.use_volumetric_shadows = True
    return sc


def mat(name, base="#111111", rough=0.4, metal=0.0, emit=None, estr=0.0):
    m = bpy.data.materials.new(name); m.use_nodes = True
    p = m.node_tree.nodes["Principled BSDF"]
    p.inputs["Base Color"].default_value = lin(base) if isinstance(base, str) else base
    p.inputs["Roughness"].default_value = rough; p.inputs["Metallic"].default_value = metal
    if emit:
        p.inputs["Emission Color"].default_value = lin(emit); p.inputs["Emission Strength"].default_value = estr
    return m


def _turf_material():
    m = bpy.data.materials.new("Turf"); m.use_nodes = True
    nt = m.node_tree; p = nt.nodes["Principled BSDF"]
    tc = nt.nodes.new("ShaderNodeTexCoord"); mp = nt.nodes.new("ShaderNodeMapping")
    mp.inputs["Scale"].default_value = (1 / 1.4, 1 / 1.4, 1)   # ambientCG footprint is about 1.4 m
    nt.links.new(tc.outputs["Object"], mp.inputs["Vector"])
    def img(suffix, noncolor=False):
        n = nt.nodes.new("ShaderNodeTexImage"); n.image = bpy.data.images.load(f"{GRASS}_{suffix}.png")
        if noncolor: n.image.colorspace_settings.name = "Non-Color"
        nt.links.new(mp.outputs["Vector"], n.inputs["Vector"]); return n
    col = img("Color"); rough = img("Roughness", True); nrm = img("NormalGL", True)
    dark = nt.nodes.new("ShaderNodeHueSaturation"); dark.inputs["Value"].default_value = 0.42; dark.inputs["Saturation"].default_value = 1.6; dark.inputs["Hue"].default_value = 0.53
    gc = nt.nodes.new("ShaderNodeTexCoord"); sep = nt.nodes.new("ShaderNodeSeparateXYZ"); nt.links.new(gc.outputs["Generated"] if False else gc.outputs["Object"], sep.inputs[0])
    dv = nt.nodes.new("ShaderNodeMath"); dv.operation = "DIVIDE"; dv.inputs[1].default_value = 4.572
    md = nt.nodes.new("ShaderNodeMath"); md.operation = "FLOORED_MODULO"; md.inputs[1].default_value = 2.0
    fl = nt.nodes.new("ShaderNodeMath"); fl.operation = "FLOOR"
    mr = nt.nodes.new("ShaderNodeMapRange"); mr.inputs["To Min"].default_value = 0.78; mr.inputs["To Max"].default_value = 1.0
    nt.links.new(sep.outputs["Y"], dv.inputs[0]); nt.links.new(dv.outputs[0], fl.inputs[0]); nt.links.new(fl.outputs[0], md.inputs[0]); nt.links.new(md.outputs[0], mr.inputs["Value"])
    mul = nt.nodes.new("ShaderNodeMix"); mul.data_type = "RGBA"; mul.blend_type = "MULTIPLY"; mul.inputs["Factor"].default_value = 1.0
    nt.links.new(col.outputs["Color"], dark.inputs["Color"]); nt.links.new(dark.outputs["Color"], mul.inputs[6]); nt.links.new(mr.outputs[0], mul.inputs[7])
    nt.links.new(mul.outputs[2], p.inputs["Base Color"])
    nt.links.new(rough.outputs["Color"], p.inputs["Roughness"])
    nm = nt.nodes.new("ShaderNodeNormalMap"); nm.inputs["Strength"].default_value = 0.8
    nt.links.new(nrm.outputs["Color"], nm.inputs["Color"]); nt.links.new(nm.outputs["Normal"], p.inputs["Normal"])
    return m


def build_set(sc, haze=0.0, rays=False):
    """Stadium at night: field model with real turf, dimmed stadium HDRI, haze, rays from upper left, lit pool.

    Returns the turf object. Stations stand on z = 0 near the 50-yard line (x around 0).
    """
    bpy.ops.import_scene.gltf(filepath=FIELD_GLB)
    root = sc.objects["American Football Field"]
    root.rotation_mode = "XYZ"   # glTF imports use quaternions, which ignore rotation_euler
    root.rotation_euler = (0, 0, math.radians(90)); root.location = (0, FIELD_Y, 0)   # long axis runs away from camera
    turf = _turf_material()
    turf_obj = None
    bpy.context.view_layer.update()
    for o in list(sc.objects):   # the near goal post stands in front of the camera; keep only the far one
        if o.type == "MESH" and any(s.material and s.material.name.startswith(("GoalPost", "Padding")) for s in o.material_slots) \
                and sum((o.matrix_world @ Vector(c)).y for c in o.bound_box) / 8 < FIELD_Y:
            o.hide_render = True
    # Prime keeps the field simple: hide the model's painted turf, numbers and hashes; keep only the far goal post
    for o in list(sc.objects):
        if o.type == "MESH" and not any(s.material and s.material.name.startswith(("GoalPost", "Padding")) for s in o.material_slots):
            o.hide_render = True
    bpy.ops.mesh.primitive_plane_add(size=600, location=(0, 0, 0)); turf_obj = bpy.context.object; turf_obj.name = "Turf"
    turf_obj.data.materials.append(turf)
    # soft yard lines every 5 yards, faded, no numbers or hash marks
    line = mat("Yard line", "#BFC4BF", rough=0.9)
    goal = FIELD_Y - 45.72
    for i in range(21):
        bpy.ops.mesh.primitive_plane_add(size=1, location=(0, goal + i * 4.572, 0.004)); ln = bpy.context.object
        ln.scale = (48.8, 0.10 if i % 20 else 0.2, 1); ln.data.materials.append(line)

    w = bpy.data.worlds.new("Stadium"); sc.world = w; w.use_nodes = True; nt = w.node_tree; nt.nodes.clear()
    env = nt.nodes.new("ShaderNodeTexEnvironment"); env.image = bpy.data.images.load(HDRI)
    cc = nt.nodes.new("ShaderNodeHueSaturation"); cc.inputs["Saturation"].default_value = 0.25; cc.inputs["Value"].default_value = 0.012
    tint = nt.nodes.new("ShaderNodeMix"); tint.data_type = "RGBA"; tint.blend_type = "MULTIPLY"
    tint.inputs["Factor"].default_value = 1.0; tint.inputs[7].default_value = lin("#6E86B8")
    bg = nt.nodes.new("ShaderNodeBackground"); bg.inputs["Strength"].default_value = 0.25
    out = nt.nodes.new("ShaderNodeOutputWorld")
    nt.links.new(env.outputs["Color"], cc.inputs["Color"]); nt.links.new(cc.outputs["Color"], tint.inputs[6])
    nt.links.new(tint.outputs[2], bg.inputs["Color"]); nt.links.new(bg.outputs[0], out.inputs[0])

    # haze fills the space between camera and stands (off for the Lawrence look)
    if haze:
      bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 10, 12)); vol = bpy.context.object; vol.name = "Haze"
      vol.scale = (160, 120, 24)
      vm = bpy.data.materials.new("Haze"); vm.use_nodes = True; vn = vm.node_tree; vn.nodes.clear()
      pv = vn.nodes.new("ShaderNodeVolumePrincipled"); pv.inputs["Density"].default_value = haze
      pv.inputs["Anisotropy"].default_value = 0.55
      vo = vn.nodes.new("ShaderNodeOutputMaterial"); vn.links.new(pv.outputs[0], vo.inputs["Volume"])
      vol.data.materials.append(vm)

    def light(name, kind, loc, aim, energy, color="#FFF4E0", size=0.5, spot=None):
        d = bpy.data.lights.new(name, kind); d.energy = energy; d.color = lin(color)[:3]
        if kind == "SPOT": d.spot_size = math.radians(spot); d.spot_blend = 0.6; d.shadow_soft_size = size
        if kind == "AREA": d.size = size
        o = bpy.data.objects.new(name, d); sc.collection.objects.link(o); o.location = loc
        o.rotation_euler = (Vector(aim) - Vector(loc)).to_track_quat("-Z", "Y").to_euler(); return o

    # key: high stadium light from upper left, casts the ground shadows and the visible rays
    # floodlight bank high in the upper left, as in the Lawrence plate
    lamp = mat("Flood", "#FFFFFF", emit="#FFF3E0", estr=25)
    for side in (-1, 1):
        for r in range(2):
            for c in range(8):
                bpy.ops.mesh.primitive_uv_sphere_add(radius=0.35, location=(side * (30 + c * 1.0), FIELD_Y + 62, 26 - r * 1.0))
                bpy.context.object.data.materials.append(lamp)
        # stadium spots from the far corners light the field and throw shadows toward camera
        light(f"Stadium {side}", "SPOT", (side * 32, FIELD_Y + 60, 26), (side * 6, 30, 0), 1.6e5, size=3.0, spot=30)
    light("Key", "SUN", (0, 0, 10), (0.6, -1.0, -1.1), 0.9, size=0.02)
    bpy.data.lights["Key"].angle = math.radians(2.0)
    light("Fill", "AREA", (1, -9, 4), (0, 0, 1.4), 160, color="#DCE6FF", size=6)
    return turf_obj


def number(text, height=1.0, depth=0.04, bevel=0.004, color="#F2F2F2", name=None, align="LEFT"):
    """Real 3D digits in the Envato white style: bold, matte white, soft bevel. Raises on unknown glyphs."""
    bad = sorted(set(text) - GLYPHS)
    if bad: raise ValueError(f"No glyph for {''.join(bad)!r}")
    cu = bpy.data.curves.new(name or f"num {text}", "FONT"); cu.body = text
    cu.font = bpy.data.fonts.load(NUMBER_FONT, check_existing=True)
    cu.size = height / 0.86          # Anton cap height is about 0.86 em
    cu.extrude = depth / 2; cu.bevel_depth = bevel; cu.bevel_resolution = 4
    cu.align_x = align; cu.align_y = "BOTTOM"; cu.space_character = 1.02   # BOTTOM keeps the comma tail above the turf
    o = bpy.data.objects.new(cu.name, cu); bpy.context.scene.collection.objects.link(o)
    o.rotation_euler = (math.radians(90), 0, 0)   # stand upright on the turf, facing -Y
    o.data.materials.append(mat("Number white", color, rough=0.5, emit=color, estr=0.6))
    return o


def camera(sc, loc, aim, lens=35):
    c = bpy.data.objects.new("Camera", bpy.data.cameras.new("Camera")); sc.collection.objects.link(c)
    c.location = loc; c.data.lens = lens
    c.rotation_euler = (Vector(aim) - Vector(loc)).to_track_quat("-Z", "Y").to_euler()
    sc.camera = c; return c
