import math
from pathlib import Path

import bpy

ROOT = Path("/Users/singleton23/Documents/Development/singleton-systems")
SCENE_2_OUTPUT = ROOT / "output" / "scene-2"
SCENE_3_OUTPUT = ROOT / "output" / "scene-3"
GRID_DIR = SCENE_2_OUTPUT / "grid-sequence"
TEXT_DIR = SCENE_3_OUTPUT / "food-mania-text-sequence"
BLEND_PATH = SCENE_3_OUTPUT / "scene-3-food-mania.blend"
PROOF_PATH = SCENE_3_OUTPUT / "blender-scene-3-proof.png"

COLLECTION_NAME = "SS_Scene_3_Food_Mania"


def remove_default_scene_objects():
    for name in ("Cube", "Camera", "Light"):
        obj = bpy.data.objects.get(name)
        if obj:
            bpy.data.objects.remove(obj, do_unlink=True)


def clear_owned_collection():
    existing = bpy.data.collections.get(COLLECTION_NAME)
    if existing:
        for obj in list(existing.objects):
            bpy.data.objects.remove(obj, do_unlink=True)
        bpy.data.collections.remove(existing)

    collection = bpy.data.collections.new(COLLECTION_NAME)
    bpy.context.scene.collection.children.link(collection)
    return collection


def link_to_collection(obj, collection):
    collection.objects.link(obj)
    for source in list(obj.users_collection):
        if source != collection:
            source.objects.unlink(obj)


def make_material(name, color, roughness=0.75):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value = color
    bsdf.inputs["Roughness"].default_value = roughness
    return mat


def make_yellow_backplate_material():
    mat = bpy.data.materials.new("SS_Mania_Textured_Yellow_Backplate")
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    bsdf = nodes.get("Principled BSDF")
    noise = nodes.new("ShaderNodeTexNoise")
    noise.inputs["Scale"].default_value = 22
    noise.inputs["Detail"].default_value = 9
    noise.inputs["Roughness"].default_value = 0.62
    color_ramp = nodes.new("ShaderNodeValToRGB")
    color_ramp.color_ramp.elements[0].position = 0.12
    color_ramp.color_ramp.elements[0].color = (0.68, 0.6, 0.1, 1)
    color_ramp.color_ramp.elements[1].position = 1
    color_ramp.color_ramp.elements[1].color = (0.92, 0.84, 0.24, 1)
    mat.node_tree.links.new(noise.outputs["Fac"], color_ramp.inputs["Fac"])
    mat.node_tree.links.new(color_ramp.outputs["Color"], bsdf.inputs["Base Color"])
    bsdf.inputs["Roughness"].default_value = 0.88
    return mat


def create_yellow_backplate(collection):
    bpy.ops.mesh.primitive_plane_add(size=1, location=(2.05, -0.06, 0.045), rotation=(0, 0, math.radians(-0.8)))
    plate = bpy.context.object
    plate.name = "SS_Mania_Textured_Yellow_Backplate"
    plate.dimensions = (5.65, 3.28, 0)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    plate.data.materials.append(make_yellow_backplate_material())
    link_to_collection(plate, collection)
    return plate


def import_image_plane(
    *,
    name,
    directory,
    filenames,
    height,
    location,
    collection,
    image_sequence=False,
):
    bpy.ops.object.select_all(action="DESELECT")
    result = bpy.ops.image.import_as_mesh_planes(
        files=[{"name": filename} for filename in filenames],
        directory=str(directory) + "/",
        relative=False,
        force_reload=True,
        image_sequence=image_sequence,
        shader="SHADELESS",
        use_transparency=True,
        render_method="BLENDED",
        use_backface_culling=False,
        show_transparent_back=True,
        overwrite_material=True,
        interpolation="Linear",
        extension="CLIP",
        use_auto_refresh=True,
        size_mode="ABSOLUTE",
        height=height,
        align_axis="+Z",
        offset=False,
    )
    if result != {"FINISHED"}:
        raise RuntimeError(f"Image plane import failed for {name}: {result}")

    plane = bpy.context.object
    plane.name = name
    plane.data.name = f"{name}_Mesh"
    plane.location = location
    link_to_collection(plane, collection)
    return plane


def import_sequence_layer(collection, directory, pattern, name, height, location):
    frames = sorted(path.name for path in directory.glob(pattern))
    if not frames:
        raise FileNotFoundError(f"No frames matching {pattern} in {directory}")
    return import_image_plane(
        name=name,
        directory=directory,
        filenames=frames,
        height=height,
        location=location,
        collection=collection,
        image_sequence=True,
    )


def create_ground(collection):
    mat = make_material("SS_Mania_Dark_Floor", (0.12, 0.105, 0.08, 1), roughness=0.95)
    bpy.ops.mesh.primitive_plane_add(size=1, location=(0, 0, -0.42))
    ground = bpy.context.object
    ground.name = "SS_Mania_Physics_Floor"
    ground.dimensions = (8.8, 4.9, 0)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    ground.data.materials.append(mat)
    link_to_collection(ground, collection)
    bpy.ops.rigidbody.object_add()
    ground.rigid_body.type = "PASSIVE"
    ground.rigid_body.friction = 0.72
    return ground


def create_low_poly_can(collection, index, location, rotation):
    metal = make_material(f"SS_Can_{index:02d}_Dull_Metal", (0.55, 0.53, 0.47, 1), roughness=0.62)
    label = make_material(f"SS_Can_{index:02d}_Faded_Label", (0.76, 0.17 + index * 0.02, 0.1, 1), roughness=0.8)
    bpy.ops.mesh.primitive_cylinder_add(vertices=12, radius=0.16, depth=0.44, location=location, rotation=rotation)
    can = bpy.context.object
    can.name = f"SS_Tumbling_Tin_Can_{index:02d}"
    can.data.materials.append(metal)
    can.data.materials.append(label)
    for poly in can.data.polygons:
        if abs(poly.normal.z) < 0.2:
            poly.material_index = 1
    link_to_collection(can, collection)
    bpy.ops.rigidbody.object_add()
    can.rigid_body.type = "ACTIVE"
    can.rigid_body.mass = 0.28
    can.rigid_body.friction = 0.48
    can.rigid_body.restitution = 0.42
    can.rigid_body.linear_damping = 0.12
    can.rigid_body.angular_damping = 0.08
    return can


def create_cans(collection):
    placements = [
        ((2.92, -1.1, 1.35), (1.2, 0.1, 0.4)),
        ((3.22, -0.42, 1.65), (0.7, 0.8, -0.2)),
        ((2.55, 0.22, 1.42), (1.4, -0.4, 0.8)),
        ((3.56, 0.72, 1.85), (0.3, 1.2, 0.1)),
        ((2.18, 1.0, 1.55), (0.9, -0.9, 0.5)),
        ((3.74, -1.45, 1.8), (1.1, 0.6, -0.7)),
    ]
    return [create_low_poly_can(collection, i + 1, loc, rot) for i, (loc, rot) in enumerate(placements)]


def create_cookbook_page(collection, index, location, rotation):
    page_mat = make_material(f"SS_Cookbook_Page_{index:02d}_Paper", (0.83, 0.77, 0.58, 1), roughness=0.9)
    bpy.ops.mesh.primitive_plane_add(size=1, location=location, rotation=rotation)
    page = bpy.context.object
    page.name = f"SS_Fluttering_Cookbook_Page_{index:02d}"
    page.dimensions = (0.72, 0.48, 0)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    page.data.materials.append(page_mat)
    link_to_collection(page, collection)

    bpy.context.view_layer.objects.active = page
    page.select_set(True)
    bpy.ops.object.mode_set(mode="EDIT")
    bpy.ops.mesh.select_all(action="SELECT")
    bpy.ops.mesh.subdivide(number_cuts=8)
    bpy.ops.object.mode_set(mode="OBJECT")

    cloth = page.modifiers.new("Recipe page cloth flutter", "CLOTH")
    cloth.settings.quality = 5
    cloth.settings.mass = 0.08
    cloth.settings.tension_stiffness = 3
    cloth.settings.compression_stiffness = 3
    cloth.settings.shear_stiffness = 2
    cloth.settings.air_damping = 2

    return page


def create_cookbook_pages(collection):
    placements = [
        ((1.0, -1.18, 0.2), (0.2, -0.35, 0.24)),
        ((1.72, -0.5, 0.28), (-0.42, 0.28, -0.18)),
        ((2.35, 0.72, 0.22), (0.36, -0.22, 0.58)),
        ((0.82, 0.9, 0.32), (-0.32, 0.16, -0.42)),
    ]
    return [create_cookbook_page(collection, i + 1, loc, rot) for i, (loc, rot) in enumerate(placements)]


def add_turbulence(collection):
    bpy.ops.object.effector_add(type="TURBULENCE", location=(1.95, 0.1, 0.85))
    turbulence = bpy.context.object
    turbulence.name = "SS_Recipe_Page_Turbulence"
    turbulence.field.strength = 18
    turbulence.field.size = 1.35
    turbulence.field.flow = 1.4
    link_to_collection(turbulence, collection)
    return turbulence


def add_lighting(collection):
    lights = [
        ("SS_Harsh_Yellow_Key", (2.3, -1.4, 3.2), (1.0, 0.78, 0.18), 430),
        ("SS_Harsh_Red_Side", (-2.4, 0.7, 2.4), (1.0, 0.12, 0.05), 270),
        ("SS_Cold_Overhead_Slash", (0.3, 1.8, 3.6), (0.6, 0.72, 1.0), 210),
    ]
    for name, location, color, energy in lights:
        bpy.ops.object.light_add(type="POINT", location=location)
        light = bpy.context.object
        light.name = name
        light.data.color = color
        light.data.energy = energy
        light.data.shadow_soft_size = 1.1
        link_to_collection(light, collection)


def add_camera(collection):
    bpy.ops.object.camera_add(location=(0, -0.24, 5.6), rotation=(0, 0, 0))
    camera = bpy.context.object
    camera.name = "SS_Scene_3_Shaking_Overhead_Camera"
    camera.data.type = "ORTHO"
    camera.data.ortho_scale = 4.65
    bpy.context.scene.camera = camera
    link_to_collection(camera, collection)

    shake_degrees = [-0.35, 0.22, -0.08, 0.42, -0.18, 0.31, -0.28, 0.16, -0.22, 0.3]
    for index, frame in enumerate(range(1, 151, 16)):
        camera.rotation_euler.z = math.radians(shake_degrees[index % len(shake_degrees)])
        camera.keyframe_insert(data_path="rotation_euler", frame=frame)
    return camera


def configure_scene():
    scene = bpy.context.scene
    scene.frame_start = 1
    scene.frame_end = 150
    scene.frame_set(80)
    scene.render.fps = 30
    scene.render.resolution_x = 1920
    scene.render.resolution_y = 1080
    scene.render.engine = "BLENDER_EEVEE"
    if hasattr(scene, "eevee"):
        scene.eevee.taa_render_samples = 64
    scene.world.color = (0.07, 0.055, 0.035)
    scene.view_settings.view_transform = "Filmic"
    scene.view_settings.look = "High Contrast"
    scene.view_settings.exposure = -0.08
    scene.view_settings.gamma = 1
    if not scene.rigidbody_world:
        bpy.ops.rigidbody.world_add()
    scene.rigidbody_world.point_cache.frame_start = 1
    scene.rigidbody_world.point_cache.frame_end = 150


def build_scene():
    remove_default_scene_objects()
    configure_scene()
    collection = clear_owned_collection()
    create_ground(collection)
    import_sequence_layer(
        collection,
        GRID_DIR,
        "element-*.png",
        "SS_Scene_2_Grid_Left_Remotion_Sequence",
        3.0,
        (-1.92, -0.08, 0.02),
    )
    create_yellow_backplate(collection)
    import_sequence_layer(
        collection,
        TEXT_DIR,
        "food-mania-*.png",
        "SS_Food_Mania_Gotham_Text_Sequence",
        3.0,
        (2.05, -0.06, 0.12),
    )
    # Real food props should come from licensed/CC0 assets; the old procedural cans read as placeholders.
    create_cookbook_pages(collection)
    add_turbulence(collection)
    add_lighting(collection)
    add_camera(collection)

    SCENE_3_OUTPUT.mkdir(parents=True, exist_ok=True)
    bpy.ops.wm.save_as_mainfile(filepath=str(BLEND_PATH))
    bpy.context.scene.render.filepath = str(PROOF_PATH)
    bpy.ops.render.render(write_still=True)
    return {
        "collection": COLLECTION_NAME,
        "blend_path": str(BLEND_PATH),
        "proof_path": str(PROOF_PATH),
        "text_sequence": str(TEXT_DIR),
    }


result = build_scene()
print(result)
