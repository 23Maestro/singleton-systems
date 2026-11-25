"""Reusable 12 oz can: wraps any flat 360-degree label (front = image middle) and renders a cut-out PNG.
Usage: Blender -b -P can_template.py -- LABEL.png OUT.png [TURN_DEGREES]"""
import math
import sys

import bmesh
import bpy

argv = sys.argv[sys.argv.index("--") + 1:]
LABEL, OUT = argv[0], argv[1]
TURN = math.radians(float(argv[2])) if len(argv) > 2 else 0.0

bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
N = 128
Z0, Z1 = 0.22, 3.40  # label band

# can shell: lathe a profile (radius 1 = 33 mm)
PROFILE = [(0.0, 0.06), (0.62, 0.0), (0.84, 0.02), (0.96, 0.14), (1.0, 0.3), (1.0, 3.25), (0.96, 3.4),
           (0.87, 3.54), (0.84, 3.62), (0.86, 3.66), (0.84, 3.7), (0.78, 3.69), (0.76, 3.61), (0.0, 3.63)]
bm = bmesh.new()
vs = [bm.verts.new((r, 0, z)) for r, z in PROFILE]
for a, b in zip(vs, vs[1:]):
    bm.edges.new((a, b))
bmesh.ops.spin(bm, geom=bm.verts[:] + bm.edges[:], cent=(0, 0, 0), axis=(0, 0, 1), angle=2 * math.pi, steps=N, use_merge=True)
me = bpy.data.meshes.new("shell")
bm.to_mesh(me)
bm.free()
shell = bpy.data.objects.new("shell", me)
sc.collection.objects.link(shell)
for p in me.polygons:
    p.use_smooth = True

# label band with its own UVs; u = 0.5 faces the camera (-Y)
bm = bmesh.new()
uv = bm.loops.layers.uv.new()
rows = []
for z in (Z0, Z1):
    ring = []
    for i in range(N + 1):
        t = -1.5 * math.pi + 2 * math.pi * i / N  # i = N/2 -> -pi/2 (front)
        ring.append(bm.verts.new((1.004 * math.cos(t), 1.004 * math.sin(t), z)))
    rows.append(ring)
for i in range(N):
    f = bm.faces.new((rows[0][i], rows[0][i + 1], rows[1][i + 1], rows[1][i]))
    for lp, (u, v) in zip(f.loops, ((i / N, 0), ((i + 1) / N, 0), ((i + 1) / N, 1), (i / N, 1))):
        lp[uv].uv = (u, v)
    f.smooth = True
me2 = bpy.data.meshes.new("label")
bm.to_mesh(me2)
bm.free()
label = bpy.data.objects.new("label", me2)
sc.collection.objects.link(label)

can = bpy.data.objects.new("can", None)
sc.collection.objects.link(can)
shell.parent = label.parent = can
can.rotation_euler.z = TURN

m = bpy.data.materials.new("metal")
m.use_nodes = True
b = m.node_tree.nodes["Principled BSDF"]
b.inputs["Base Color"].default_value = (0.78, 0.79, 0.8, 1)
b.inputs["Metallic"].default_value = 1.0
b.inputs["Roughness"].default_value = 0.28
shell.data.materials.append(m)

m = bpy.data.materials.new("print")
m.use_nodes = True
nt = m.node_tree
b = nt.nodes["Principled BSDF"]
tex = nt.nodes.new("ShaderNodeTexImage")
tex.image = bpy.data.images.load(LABEL)
nt.links.new(tex.outputs["Color"], b.inputs["Base Color"])
b.inputs["Roughness"].default_value = 0.38
b.inputs["Metallic"].default_value = 0.15
label.data.materials.append(m)

# light: soft key front-left, two rims, bright grey world
def area(name, loc, energy, size):
    L = bpy.data.lights.new(name, "AREA")
    L.energy, L.size = energy, size
    o = bpy.data.objects.new(name, L)
    o.location = loc
    sc.collection.objects.link(o)
    o.rotation_euler = (0, 0, 0)
    c = o.constraints.new("TRACK_TO")
    c.target, c.track_axis, c.up_axis = can, "TRACK_NEGATIVE_Z", "UP_Y"

area("key", (-5, -7, 4), 900, 5)
area("rimL", (-6, 4, 3), 500, 2)
area("rimR", (6, 4, 3), 500, 2)
area("fill", (5, -6, 1), 200, 6)
w = bpy.data.worlds.new("w")
w.use_nodes = True
w.node_tree.nodes["Background"].inputs[0].default_value = (0.9, 0.9, 0.9, 1)
w.node_tree.nodes["Background"].inputs[1].default_value = 0.25
sc.world = w

cam = bpy.data.cameras.new("cam")
cam.lens = 85
cam.sensor_fit = "VERTICAL"
co = bpy.data.objects.new("cam", cam)
sc.collection.objects.link(co)
co.location = (0, -19.5, 2.7)
aim = bpy.data.objects.new("aim", None)
aim.location = (0, 0, 1.85)
sc.collection.objects.link(aim)
c = co.constraints.new("TRACK_TO")
c.target, c.track_axis, c.up_axis = aim, "TRACK_NEGATIVE_Z", "UP_Y"
sc.camera = co

sc.render.engine = "BLENDER_EEVEE"
sc.view_settings.view_transform = "Standard"
sc.render.film_transparent = True
sc.render.resolution_x, sc.render.resolution_y = 1400, 2400
sc.render.image_settings.file_format = "PNG"
sc.render.image_settings.color_mode = "RGBA"
sc.render.filepath = OUT
bpy.ops.render.render(write_still=True)
print("can", OUT)
