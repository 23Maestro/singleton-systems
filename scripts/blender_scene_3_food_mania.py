import math
from pathlib import Path

import bpy
from mathutils import Vector

ROOT = Path("/Users/singleton23/Documents/Development/singleton-systems")
SCENE_2_OUTPUT = ROOT / "output" / "scene-2"
SCENE_3_OUTPUT = ROOT / "output" / "scene-3"
GRID_DIR = SCENE_2_OUTPUT / "grid-sequence"
LABEL_DIR = SCENE_3_OUTPUT / "labels"
ASSET_DIR = ROOT / "assets" / "polyhaven"

BLEND_PATH = SCENE_3_OUTPUT / "scene-3-food-mania.blend"
PROOF_PATH = SCENE_3_OUTPUT / "blender-scene-3-proof.png"
CAMERA_PROOF_PATH = SCENE_3_OUTPUT / "blender-scene-3-camera-start-proof.png"

COLLECTION_NAME = "SS_Scene_3_Return_Food_Mania"


def reset_scene():
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete()
    for collection in list(bpy.data.collections):
        if collection.name.startswith("SS_Scene_3"):
            bpy.data.collections.remove(collection)


def make_collection():
    collection = bpy.data.collections.new(COLLECTION_NAME)
    bpy.context.scene.collection.children.link(collection)
    return collection


def link_to_collection(obj, collection):
    collection.objects.link(obj)
    for source in list(obj.users_collection):
        if source != collection:
            source.objects.unlink(obj)


def look_at(obj, target):
    direction = Vector(target) - obj.location
    obj.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()


def set_ease_out(obj):
    if not obj.animation_data or not obj.animation_data.action:
        return
    fcurves = getattr(obj.animation_data.action, "fcurves", None)
    if fcurves is None:
        return
    for fcurve in fcurves:
        for key in fcurve.keyframe_points:
            key.interpolation = "BEZIER"
            key.easing = "EASE_OUT"


def make_principled_material(name, color, roughness=0.8, alpha=1.0):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    mat.blend_method = "BLEND" if alpha < 1 else "OPAQUE"
    mat.show_transparent_back = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value = color
    bsdf.inputs["Roughness"].default_value = roughness
    bsdf.inputs["Alpha"].default_value = alpha
    return mat


def make_paper_material(name, base=(0.68, 0.61, 0.45, 1), accent=(0.86, 0.79, 0.58, 1)):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    bsdf = nodes.get("Principled BSDF")
    noise = nodes.new("ShaderNodeTexNoise")
    noise.inputs["Scale"].default_value = 30
    noise.inputs["Detail"].default_value = 12
    noise.inputs["Roughness"].default_value = 0.58
    ramp = nodes.new("ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].position = 0.18
    ramp.color_ramp.elements[0].color = base
    ramp.color_ramp.elements[1].position = 1.0
    ramp.color_ramp.elements[1].color = accent
    mat.node_tree.links.new(noise.outputs["Fac"], ramp.inputs["Fac"])
    mat.node_tree.links.new(ramp.outputs["Color"], bsdf.inputs["Base Color"])
    bsdf.inputs["Roughness"].default_value = 0.91
    return mat


def create_crumpled_plane(name, width, height, loc, collection, cuts=42, z_scale=0.035):
    verts = []
    faces = []
    uvs = []
    for y in range(cuts + 1):
        for x in range(cuts + 1):
            u = x / cuts
            v = y / cuts
            px = (u - 0.5) * width
            py = (v - 0.5) * height
            wave = math.sin(u * 23.0) * math.sin(v * 17.0) * 0.45
            wrinkle = math.sin((u + v) * 47.0) * 0.22 + math.cos((u - v) * 31.0) * 0.16
            edge_lift = (abs(u - 0.5) ** 2 + abs(v - 0.5) ** 2) * 0.08
            pz = (wave + wrinkle) * z_scale + edge_lift
            verts.append((px, py, pz))
            uvs.append((u, v))
    for y in range(cuts):
        for x in range(cuts):
            a = y * (cuts + 1) + x
            faces.append((a, a + 1, a + cuts + 2, a + cuts + 1))

    mesh = bpy.data.meshes.new(f"{name}_Mesh")
    mesh.from_pydata(verts, [], faces)
    mesh.update()
    uv_layer = mesh.uv_layers.new(name="UVMap")
    for poly in mesh.polygons:
        for loop_index in poly.loop_indices:
            uv_layer.data[loop_index].uv = uvs[mesh.loops[loop_index].vertex_index]

    obj = bpy.data.objects.new(name, mesh)
    obj.location = loc
    collection.objects.link(obj)
    return obj


def make_image_material(name, image_path, alpha=True):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    mat.blend_method = "BLEND" if alpha else "OPAQUE"
    mat.show_transparent_back = True

    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    nodes.clear()

    output = nodes.new("ShaderNodeOutputMaterial")
    bsdf = nodes.new("ShaderNodeBsdfPrincipled")
    tex = nodes.new("ShaderNodeTexImage")
    tex.image = bpy.data.images.load(str(image_path), check_existing=True)
    tex.interpolation = "Linear"

    bsdf.inputs["Roughness"].default_value = 0.86
    links.new(tex.outputs["Color"], bsdf.inputs["Base Color"])
    if alpha:
        links.new(tex.outputs["Alpha"], bsdf.inputs["Alpha"])
    links.new(bsdf.outputs["BSDF"], output.inputs["Surface"])
    return mat


def create_grid_board(collection):
    base = create_crumpled_plane(
        "SS_Physical_Starvation_Grid_Paper_Board",
        width=3.95,
        height=2.55,
        loc=(-1.52, -0.05, 0.075),
        collection=collection,
        cuts=28,
        z_scale=0.018,
    )
    base.rotation_euler = (math.radians(1.8), math.radians(-5.2), math.radians(-1.8))
    base.data.materials.append(make_paper_material("SS_Grid_Board_Aged_Paper"))

    grid_frame = sorted(GRID_DIR.glob("element-*.png"))[96]
    grid = create_crumpled_plane(
        "SS_Remotion_Grid_Inked_On_Board",
        width=3.82,
        height=2.38,
        loc=(-1.52, -0.05, 0.105),
        collection=collection,
        cuts=28,
        z_scale=0.006,
    )
    grid.rotation_euler = base.rotation_euler
    grid.data.materials.append(make_image_material("SS_Remotion_Grid_Frame_Material", grid_frame, alpha=True))

    for obj in (base, grid):
        obj.keyframe_insert("location", frame=1)
        obj.location.x -= 0.12
        obj.location.y += 0.04
        obj.keyframe_insert("location", frame=64)
        set_ease_out(obj)

    return base, grid


def import_image_plane(name, image_path, height, location, rotation, collection):
    bpy.ops.object.select_all(action="DESELECT")
    result = bpy.ops.image.import_as_mesh_planes(
        files=[{"name": image_path.name}],
        directory=str(image_path.parent) + "/",
        relative=False,
        force_reload=True,
        image_sequence=False,
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
    obj = bpy.context.object
    obj.name = name
    obj.location = location
    obj.rotation_euler = rotation
    link_to_collection(obj, collection)
    return obj


def create_labels(collection):
    label_specs = [
        ("hoarded", "SS_Label_HOARDED", (1.06, -0.78, 0.42), (math.radians(63), 0, math.radians(-7)), 0.18, 54),
        ("hid", "SS_Label_HID", (1.86, -0.12, 0.48), (math.radians(60), 0, math.radians(5)), 0.15, 68),
        ("recipes", "SS_Label_RECIPES", (1.42, 0.48, 0.44), (math.radians(64), 0, math.radians(-3)), 0.17, 82),
    ]
    labels = []
    for key, name, final_loc, rot, height, start_frame in label_specs:
        path = LABEL_DIR / f"{key}.png"
        if not path.exists():
            raise FileNotFoundError(f"Missing label texture: {path}")
        label = import_image_plane(name, path, height, final_loc, rot, collection)
        label.location = (final_loc[0] + 0.18, final_loc[1] + 0.04, final_loc[2] - 0.18)
        label.scale = (0.88, 0.88, 0.88)
        label.keyframe_insert("location", frame=start_frame)
        label.keyframe_insert("scale", frame=start_frame)
        label.location = final_loc
        label.scale = (1, 1, 1)
        label.keyframe_insert("location", frame=start_frame + 18)
        label.keyframe_insert("scale", frame=start_frame + 18)
        set_ease_out(label)
        labels.append(label)
    return labels


def import_gltf_group(asset_path, collection, name, final_location, target_width, final_rotation=(0, 0, 0), start_offset=(1.2, -0.2, 0.75), start_frame=42):
    before = set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=str(asset_path))
    objects = [obj for obj in bpy.data.objects if obj not in before]
    if not objects:
        raise RuntimeError(f"No objects imported from {asset_path}")

    empty = bpy.data.objects.new(name, None)
    collection.objects.link(empty)
    for obj in objects:
        link_to_collection(obj, collection)
        obj.parent = empty

    bpy.context.view_layer.update()
    mins, maxs = bounds_for_objects(objects)
    center = (mins + maxs) / 2
    size = max(maxs.x - mins.x, maxs.y - mins.y, maxs.z - mins.z)
    scale = target_width / size if size else 1

    for obj in objects:
        obj.location = (obj.location - center) * scale
        obj.scale = obj.scale * scale

    bpy.context.view_layer.update()
    mins, _ = bounds_for_objects(objects)
    for obj in objects:
        obj.location.z += -mins.z

    empty.rotation_euler = final_rotation
    empty.location = Vector(final_location) + Vector(start_offset)
    empty.keyframe_insert("location", frame=start_frame)
    empty.keyframe_insert("rotation_euler", frame=start_frame)
    empty.location = final_location
    empty.rotation_euler = (final_rotation[0] + math.radians(5), final_rotation[1] - math.radians(3), final_rotation[2])
    empty.keyframe_insert("location", frame=start_frame + 48)
    empty.keyframe_insert("rotation_euler", frame=start_frame + 48)
    set_ease_out(empty)
    return empty, objects


def bounds_for_objects(objects):
    mins = Vector((1e9, 1e9, 1e9))
    maxs = Vector((-1e9, -1e9, -1e9))
    for obj in objects:
        if not hasattr(obj, "bound_box"):
            continue
        for corner in obj.bound_box:
            world = obj.matrix_world @ Vector(corner)
            mins.x = min(mins.x, world.x)
            mins.y = min(mins.y, world.y)
            mins.z = min(mins.z, world.z)
            maxs.x = max(maxs.x, world.x)
            maxs.y = max(maxs.y, world.y)
            maxs.z = max(maxs.z, world.z)
    return mins, maxs


def create_table_surface(collection):
    table = create_crumpled_plane(
        "SS_Crumpled_Aged_Paper_Table_Surface",
        width=6.7,
        height=3.7,
        loc=(0.42, 0.02, 0),
        collection=collection,
        cuts=56,
        z_scale=0.032,
    )
    table.data.materials.append(make_paper_material("SS_Table_Crumpled_Paper", base=(0.54, 0.48, 0.35, 1), accent=(0.78, 0.71, 0.52, 1)))
    return table


def create_food_assets(collection):
    cans, _ = import_gltf_group(
        ASSET_DIR / "russian_food_cans_01" / "russian_food_cans_01_1k.gltf",
        collection,
        "SS_Real_Pantry_Cans_Drift_Group",
        final_location=(1.66, -0.58, 0.12),
        target_width=0.95,
        final_rotation=(math.radians(7), math.radians(-4), math.radians(-18)),
        start_offset=(1.25, -0.36, 0.65),
        start_frame=38,
    )
    food, _ = import_gltf_group(
        ASSET_DIR / "long_life_food" / "long_life_food_1k.gltf",
        collection,
        "SS_Real_Long_Life_Food_Drift_Group",
        final_location=(2.16, 0.34, 0.1),
        target_width=0.88,
        final_rotation=(math.radians(3), math.radians(5), math.radians(13)),
        start_offset=(1.08, 0.18, 0.58),
        start_frame=52,
    )
    return [cans, food]


def add_lighting(collection):
    world = bpy.context.scene.world or bpy.data.worlds.new("World")
    bpy.context.scene.world = world
    world.color = (0.07, 0.055, 0.04)

    lights = [
        ("SS_Warm_Paper_Key", "AREA", (-1.6, -2.0, 3.2), (1.0, 0.93, 0.78), 520, 4.2),
        ("SS_Yellow_Mania_Wash", "AREA", (2.7, -1.2, 2.3), (1.0, 0.78, 0.18), 250, 2.1),
        ("SS_Cool_Editorial_Fill", "AREA", (-2.6, 1.8, 2.5), (0.65, 0.76, 1.0), 110, 3.5),
    ]
    for name, light_type, loc, color, energy, size in lights:
        bpy.ops.object.light_add(type=light_type, location=loc)
        light = bpy.context.object
        light.name = name
        light.data.energy = energy
        light.data.color = color
        light.data.size = size
        look_at(light, (0.7, 0.0, 0.0))
        link_to_collection(light, collection)


def add_camera(collection):
    cam_data = bpy.data.cameras.new("SS_Scene_3_Truck_Right_Camera_Data")
    cam = bpy.data.objects.new("SS_Scene_3_Truck_Right_Camera", cam_data)
    collection.objects.link(cam)
    cam_data.type = "PERSP"
    cam_data.lens = 46
    cam_data.dof.use_dof = True
    cam_data.dof.focus_distance = 4.7
    cam_data.dof.aperture_fstop = 5.6

    scene = bpy.context.scene
    scene.camera = cam

    keyframes = [
        (1, (-1.15, -4.25, 3.05), (-1.55, -0.05, 0.08)),
        (72, (0.3, -4.55, 3.18), (-0.24, -0.02, 0.08)),
        (126, (1.22, -4.28, 3.0), (1.18, -0.02, 0.12)),
        (150, (1.42, -4.12, 2.92), (1.48, -0.04, 0.12)),
    ]
    for frame, loc, target in keyframes:
        scene.frame_set(frame)
        cam.location = loc
        look_at(cam, target)
        cam.keyframe_insert("location", frame=frame)
        cam.keyframe_insert("rotation_euler", frame=frame)
    set_ease_out(cam)
    return cam


def configure_scene():
    scene = bpy.context.scene
    scene.frame_start = 1
    scene.frame_end = 150
    scene.frame_set(108)
    scene.render.fps = 30
    scene.render.resolution_x = 1920
    scene.render.resolution_y = 1080
    scene.render.resolution_percentage = 100
    scene.render.engine = "BLENDER_EEVEE"
    scene.render.film_transparent = False
    scene.view_settings.view_transform = "AgX"
    scene.view_settings.look = "AgX - Medium High Contrast"
    scene.view_settings.exposure = -0.1
    scene.view_settings.gamma = 1.0


def audit_scene():
    print("=== SCENE 3 AUDIT ===")
    print(f"Objects: {len(bpy.context.scene.objects)}")
    print(f"Camera: {bpy.context.scene.camera.name if bpy.context.scene.camera else 'NONE'}")
    print(f"Engine: {bpy.context.scene.render.engine}")
    for obj in bpy.context.scene.objects:
        print(f"{obj.name} | {obj.type} | hide_render={obj.hide_render}")


def build_scene():
    if not LABEL_DIR.exists():
        raise FileNotFoundError(f"Missing Scene 3 label textures. Run npm run remotion:scene-three:assets first: {LABEL_DIR}")

    SCENE_3_OUTPUT.mkdir(parents=True, exist_ok=True)
    reset_scene()
    configure_scene()
    collection = make_collection()

    create_table_surface(collection)
    create_grid_board(collection)
    create_food_assets(collection)
    create_labels(collection)
    add_lighting(collection)
    add_camera(collection)

    audit_scene()

    bpy.ops.wm.save_as_mainfile(filepath=str(BLEND_PATH))

    scene = bpy.context.scene
    scene.frame_set(1)
    scene.render.filepath = str(CAMERA_PROOF_PATH)
    bpy.ops.render.render(write_still=True)

    scene.frame_set(108)
    scene.render.filepath = str(PROOF_PATH)
    bpy.ops.render.render(write_still=True)

    return {
        "collection": COLLECTION_NAME,
        "blend_path": str(BLEND_PATH),
        "camera_start_proof": str(CAMERA_PROOF_PATH),
        "proof_path": str(PROOF_PATH),
        "labels": str(LABEL_DIR),
    }


result = build_scene()
print(result)
