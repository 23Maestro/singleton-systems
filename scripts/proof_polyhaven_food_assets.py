import math
from pathlib import Path

import bpy
from mathutils import Vector

ROOT = Path("/Users/singleton23/Documents/Development/singleton-systems")
OUT = ROOT / "output/scene-3/polyhaven-food-asset-proof.png"
ASSETS = [
    (ROOT / "assets/polyhaven/russian_food_cans_01/russian_food_cans_01_1k.gltf", (-0.75, 0, 0)),
    (ROOT / "assets/polyhaven/long_life_food/long_life_food_1k.gltf", (0.75, 0, 0)),
]


def main():
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete()

    mat = bpy.data.materials.new("warm_table")
    mat.diffuse_color = (0.45, 0.31, 0.19, 1)
    bpy.ops.mesh.primitive_plane_add(size=5, location=(0, 0, -0.05))
    table = bpy.context.object
    table.name = "proof_table"
    table.data.materials.append(mat)

    imported = []
    for path, offset in ASSETS:
        before = set(bpy.data.objects)
        bpy.ops.import_scene.gltf(filepath=str(path))
        objects = [obj for obj in bpy.data.objects if obj not in before]
        for obj in objects:
            obj.location.x += offset[0]
            obj.location.y += offset[1]
        imported.extend(objects)

    mins = Vector((999, 999, 999))
    maxs = Vector((-999, -999, -999))
    for obj in imported:
        for corner in obj.bound_box:
            vertex = obj.matrix_world @ Vector(corner)
            mins.x = min(mins.x, vertex.x)
            mins.y = min(mins.y, vertex.y)
            mins.z = min(mins.z, vertex.z)
            maxs.x = max(maxs.x, vertex.x)
            maxs.y = max(maxs.y, vertex.y)
            maxs.z = max(maxs.z, vertex.z)

    scale = 1.9 / max(maxs.x - mins.x, maxs.y - mins.y, maxs.z - mins.z)
    scale *= 7
    center = (mins + maxs) / 2
    for obj in imported:
        obj.location = (obj.location - center) * scale
        obj.scale *= scale

    min_z = 999
    for obj in imported:
        for corner in obj.bound_box:
            min_z = min(min_z, (obj.matrix_world @ Vector(corner)).z)
    for obj in imported:
        obj.location.z += 0.02 - min_z

    bpy.ops.object.light_add(type="AREA", location=(0, -2.2, 3))
    light = bpy.context.object
    light.data.energy = 450
    light.data.size = 3

    bpy.ops.object.camera_add(location=(0, -0.05, 3.2), rotation=(0, 0, 0))
    camera = bpy.context.object
    bpy.context.scene.camera = camera
    camera.data.type = "ORTHO"
    camera.data.ortho_scale = 2.6

    scene = bpy.context.scene
    scene.render.resolution_x = 1280
    scene.render.resolution_y = 720
    scene.render.engine = "BLENDER_EEVEE"
    scene.render.filepath = str(OUT)
    bpy.ops.render.render(write_still=True)
    print({"proof_path": str(OUT)})


main()
