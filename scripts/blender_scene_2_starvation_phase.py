import math
from pathlib import Path

import bpy

ROOT = Path("/Users/singleton23/Documents/Development/singleton-systems")
OUTPUT = ROOT / "output" / "scene-2"
GRID_DIR = OUTPUT / "grid-sequence"
CALENDAR_DIR = OUTPUT / "calendar"
BLEND_PATH = OUTPUT / "scene-2-starvation-phase.blend"

COLLECTION_NAME = "SS_Scene_2_Starvation_Phase"


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


def make_paper_material():
    mat = bpy.data.materials.new("SS_Aged_Paper_Background")
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value = (0.63, 0.57, 0.45, 1)
    bsdf.inputs["Roughness"].default_value = 0.92
    return mat


def create_paper_background(collection):
    bpy.ops.mesh.primitive_plane_add(size=1, location=(0, 0, -0.08), rotation=(0, 0, 0))
    paper = bpy.context.object
    paper.name = "SS_Textured_3D_Paper_Background"
    paper.data.name = "SS_Textured_3D_Paper_Background_Mesh"
    paper.dimensions = (7.6, 4.35, 0)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    paper.data.materials.append(make_paper_material())
    link_to_collection(paper, collection)
    return paper


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


def import_grid_sequence(collection):
    frames = sorted(path.name for path in GRID_DIR.glob("element-*.png"))
    if len(frames) != 180:
        raise FileNotFoundError(f"Expected 180 Remotion grid frames in {GRID_DIR}, found {len(frames)}")

    grid = import_image_plane(
        name="SS_Starvation_Grid_Remotion_Sequence",
        directory=GRID_DIR,
        filenames=frames,
        height=3.74,
        location=(0, -0.08, 0.05),
        collection=collection,
        image_sequence=True,
    )
    return grid


def subdivide_active_plane(number_cuts=10):
    bpy.ops.object.mode_set(mode="EDIT")
    bpy.ops.mesh.select_all(action="SELECT")
    bpy.ops.mesh.subdivide(number_cuts=number_cuts)
    bpy.ops.object.mode_set(mode="OBJECT")


def create_calendar(month, collection):
    filename = f"month-{month:02d}.png"
    texture = CALENDAR_DIR / filename
    if not texture.exists():
        raise FileNotFoundError(texture)

    x = -1.85 + (month - 1) * 0.74
    y = 0.98 - (month - 1) * 0.035
    z = 0.34 + month * 0.008

    plane = import_image_plane(
        name=f"SS_Calendar_Month_{month:02d}",
        directory=CALENDAR_DIR,
        filenames=[filename],
        height=0.82,
        location=(x, y, z),
        collection=collection,
    )
    plane.rotation_euler = (0, 0, math.radians(-3))
    bpy.context.view_layer.objects.active = plane
    plane.select_set(True)
    subdivide_active_plane(number_cuts=10)

    origin_empty = bpy.data.objects.new(f"SS_Calendar_Month_{month:02d}_Top_Binding", None)
    origin_empty.empty_display_type = "PLAIN_AXES"
    origin_empty.empty_display_size = 0.06
    origin_empty.location = (x, y + 0.41, z)
    link_to_collection(origin_empty, collection)

    deform = plane.modifiers.new("Calendar page flip bend", "SIMPLE_DEFORM")
    deform.deform_method = "BEND"
    deform.deform_axis = "X"
    deform.origin = origin_empty

    start = 28 + (month - 1) * 20
    for frame, angle in [(start, 0), (start + 10, -180)]:
        deform.angle = math.radians(angle)
        deform.keyframe_insert(data_path="angle", frame=frame)

    plane.keyframe_insert(data_path="location", frame=start)
    plane.location.z = z + 0.06
    plane.keyframe_insert(data_path="location", frame=start + 10)
    return plane


def add_camera_and_light(collection):
    bpy.ops.object.light_add(type="AREA", location=(0, -1.6, 4.6))
    key = bpy.context.object
    key.name = "SS_Soft_Overhead_Area_Key"
    key.data.energy = 360
    key.data.size = 5.2
    link_to_collection(key, collection)

    bpy.ops.object.camera_add(location=(0, -0.22, 5.4), rotation=(0, 0, 0))
    camera = bpy.context.object
    camera.name = "SS_Scene_2_Overhead_Camera"
    camera.data.type = "ORTHO"
    camera.data.ortho_scale = 4.7
    bpy.context.scene.camera = camera
    link_to_collection(camera, collection)
    camera.data.keyframe_insert(data_path="ortho_scale", frame=1)
    camera.data.ortho_scale = 4.25
    camera.data.keyframe_insert(data_path="ortho_scale", frame=180)
    return camera


def configure_scene():
    scene = bpy.context.scene
    scene.frame_start = 1
    scene.frame_end = 180
    scene.frame_set(90)
    scene.render.fps = 30
    scene.render.resolution_x = 1920
    scene.render.resolution_y = 1080
    scene.render.engine = "BLENDER_EEVEE"
    if hasattr(scene, "eevee"):
        scene.eevee.taa_render_samples = 64
    scene.world.color = (0.62, 0.57, 0.49)
    scene.view_settings.view_transform = "Filmic"
    scene.view_settings.look = "Medium High Contrast"
    scene.view_settings.exposure = -0.15
    scene.view_settings.gamma = 1


def build_scene():
    configure_scene()
    collection = clear_owned_collection()
    create_paper_background(collection)
    import_grid_sequence(collection)
    for month in range(1, 7):
        create_calendar(month, collection)
    add_camera_and_light(collection)

    OUTPUT.mkdir(parents=True, exist_ok=True)
    bpy.ops.wm.save_as_mainfile(filepath=str(BLEND_PATH))
    return {
        "collection": COLLECTION_NAME,
        "blend_path": str(BLEND_PATH),
        "grid_sequence": str(GRID_DIR),
        "calendar_textures": str(CALENDAR_DIR),
    }


result = build_scene()
print(result)
