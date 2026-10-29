"""Adapt Epic's paired team cards in owned review maps; preserve entrance only."""
import hashlib
import json
import math
from pathlib import Path
import sys
import traceback
import unreal

REPO = Path('/Users/singleton23/Documents/Development/singleton-systems')
sys.path.insert(0, str(REPO / 'tools/lineups_unreal'))
import editor_scene
import build_review_export as native

PROJECT = native.PROJECT
ROOT = '/Game/Lineups/TeamCardsV1'
INPUT = Path('/Volumes/HomeSSD/Generated/CATENA_MEDIA_LINEUPS/source/team-logo-cards')
RECEIPTS = PROJECT.parent.parent / 'receipts'
OWNER = 'lineups-team-cards-v1'
END = 600
VARIANTS = {
    'BrownsRavens': {'names': ['CLEVELAND BROWNS', 'BALTIMORE RAVENS'],
                     'logos': ['Browns', 'Ravens'], 'values': ['#9', '#10'],
                     'primary': [(1, .235, 0), (.141, .09, .451)],
                     'background': 'browns-ravens-stadium-dry-v2.png',
                     'headline': 'BROWNS WON HEAD-TO-HEAD'},
    'RamsSeahawks': {'names': ['LOS ANGELES RAMS', 'SEATTLE SEAHAWKS'],
                     'logos': ['Rams', 'Seahawks'], 'values': ['2–4', '3–3'],
                     'primary': [(0, .208, .58), (0, .133, .267)],
                     'background': 'rams-seahawks-stadium-dry-v2.png', 'headline': ''},
}


def record(path):
    path = Path(path)
    return {'path': str(path), 'sha256': hashlib.sha256(path.read_bytes()).hexdigest()}


def set_text(actor, text):
    comp = actor.get_component_by_class(unreal.Text3DComponent)
    assert comp
    editor_scene.set_values(comp, {'text': text})
    ext = comp.get_editor_property('material_extension')
    white = {'r': 1., 'g': 1., 'b': 1., 'a': 1.}
    editor_scene.set_values(ext, {'style': 'Solid', 'frontColor': white,
                                 'bevelColor': white, 'extrudeColor': white})


def objects(prefix, cls):
    for obj in unreal.ObjectIterator():
        if isinstance(obj, cls) and unreal.SystemLibrary.get_path_name(obj).startswith(prefix):
            yield obj


def build(slug):
    assert Path(unreal.Paths.convert_relative_path_to_full(unreal.Paths.project_dir())).resolve() == PROJECT
    cfg = VARIANTS[slug]
    map_path, seq_path = ROOT + '/LV_' + slug, ROOT + '/LS_' + slug
    if unreal.EditorAssetLibrary.does_asset_exist(map_path):
        old = unreal.load_asset(map_path)
        assert unreal.EditorAssetLibrary.get_metadata_tag(old, 'LineupsOwner') == OWNER
    else:
        old = unreal.EditorAssetLibrary.duplicate_asset('/Game/_Scenes/FS_TeamVSTeam', map_path)
        assert old
        unreal.EditorAssetLibrary.set_metadata_tag(old, 'LineupsOwner', OWNER)
        assert unreal.EditorAssetLibrary.save_loaded_asset(old)
    # Python references to a duplicated world must be released before LoadLevel.
    old = None
    unreal.LevelSequenceEditorBlueprintLibrary.close_level_sequence()
    unreal.SystemLibrary.collect_garbage()
    active = unreal.get_editor_subsystem(unreal.UnrealEditorSubsystem).get_editor_world()
    current = active.get_path_name().split('.')[0]
    active = None
    if current != map_path:
        assert unreal.get_editor_subsystem(unreal.LevelEditorSubsystem).load_level(map_path)
    world = unreal.get_editor_subsystem(unreal.UnrealEditorSubsystem).get_editor_world()
    aa = {a.get_actor_label(): a for a in unreal.get_editor_subsystem(unreal.EditorActorSubsystem).get_all_level_actors()}
    embedded = list(objects(map_path + '.', unreal.AvaSequence))
    entrance = next(s for s in embedded if not str(s.get_label()).endswith('Out'))
    seq = unreal.load_asset(seq_path)
    if not seq:
        seq = unreal.AssetToolsHelpers.get_asset_tools().duplicate_asset('LS_' + slug, ROOT, entrance)
    assert seq
    sub = unreal.get_editor_subsystem(unreal.LevelSequenceEditorSubsystem)
    for b in seq.get_bindings():
        if b.get_name() in aa:
            sub.replace_binding_with_actors([aa[b.get_name()]], b)
    unreal.LevelSequenceEditorBlueprintLibrary.open_level_sequence(seq)
    unreal.LevelSequenceEditorBlueprintLibrary.set_current_time(180)
    native.ROOT = ROOT
    textures = [editor_scene.import_texture(name, record(INPUT / (name + '-square.png')), ROOT) for name in cfg['logos']]
    solids = [editor_scene.import_texture(name + 'Primary', record(INPUT / (name + '-primary.png')), ROOT) for name in cfg['logos']]
    changes = []
    for obj in objects(map_path + '.', unreal.DMMaterialValueTexture):
        old_texture = obj.get_editor_property('value')
        path = old_texture.get_path_name() if old_texture else ''
        if '/2D_HQ/MACH' in path or '/2D_Brush/MACH' in path:
            obj.set_value(solids[0]); changes.append(obj.get_path_name())
        elif '/2D_HQ/HARE' in path or '/2D_Brush/HARE' in path:
            obj.set_value(solids[1]); changes.append(obj.get_path_name())
    for side, index in [('L', 0), ('R', 1)]:
        name, color = cfg['logos'][index], cfg['primary'][index]
        for label in ['Container_Solid_' + side + '3', 'Container_Gradient_' + side + '1', 'Container_BottomBar_' + side + '1', 'Container_Pattern_' + side + '1']:
            for obj in objects(aa[label].get_path_name() + '.', unreal.DMMaterialValueFloat3RGB):
                if not obj.get_name().startswith('Global'):
                    obj.set_value(unreal.LinearColor(*color, 1))
        actor = aa['SM_Branding_TeamLogo_' + side]
        mesh = native.mesh('SM_' + name + '_Beveled', PROJECT / 'SourceArt/TeamCards' / slug / ('leftLogoSmooth.obj' if index == 0 else 'rightLogoSmooth.obj'))
        actor.static_mesh_component.set_static_mesh(mesh)
        face = native.material('M_' + name + '_LogoFace', textures[index], metallic=.12, roughness=.55)
        edge = native.material('M_' + name + '_LogoEdge', color=color, metallic=.3, roughness=.45)
        for slot, item in enumerate(mesh.get_editor_property('static_materials')):
            actor.static_mesh_component.set_material(slot, face if str(item.material_slot_name) == 'Face' else edge)
        actor.set_actor_rotation(unreal.Rotator(0, 0, 0), False)
        loc = actor.get_actor_location(); actor.set_actor_location(unreal.Vector(loc.x, (-310 if index == 0 else 310), 65), False, False)
        # Match the source's logo area; measure actual silhouettes in the next pass.
        actor.set_actor_scale3d(unreal.Vector(.55, .55, .55))
        set_text(aa['TeamName_' + side], cfg['names'][index])
        set_text(aa['TeamRecord_' + side], cfg['values'][index])
        aa['TeamRecord_' + side].set_actor_scale3d(unreal.Vector(.4, .4, .4))
    hidden = ['TeamPlacement_Tab_L', 'TeamPlacement_Tab_R', 'Container_BrushText_L3', 'Container_BrushText_R3']
    for label in hidden:
        aa[label].set_actor_hidden_in_game(True); aa[label].set_is_temporarily_hidden_in_editor(True)
    for b in list(seq.get_bindings()):
        if b.get_name() in hidden:
            b.remove()
    for s in embedded:
        if str(s.get_label()).endswith('Out'):
            for b in list(s.get_bindings()): b.remove()
            for track in list(s.get_tracks()): s.remove_track(track)
    for track in list(seq.get_tracks()) + [t for b in seq.get_bindings() for t in b.get_tracks()]:
        for section in track.get_sections():
            section.set_range(0, END)
            section.set_completion_mode(unreal.MovieSceneCompletionMode.KEEP_STATE)
    seq.set_playback_end(END)
    camera = aa['AvaCineCameraActor_Main']; cc = camera.get_cine_camera_component()
    bg_texture = editor_scene.import_texture(slug + 'Stadium', record(INPUT / cfg['background']), ROOT)
    bg_material = native.material('M_' + slug + '_Stadium', bg_texture, unlit=True)
    bg = aa.get('LineupsTeam_Stadium')
    distance = 4000; width = 2 * distance * math.tan(math.radians(cc.get_horizontal_field_of_view() / 2)) * 1.01
    if not bg:
        bg = native.mesh_actor('LineupsTeam_Stadium', unreal.load_asset('/Game/Lineups/ReviewV1/Meshes/SM_ReviewQuad'), bg_material,
                               unreal.Vector(camera.get_actor_location().x + distance, 0, 0), unreal.Vector(1, -width, width * 1080 / 1920))
        bg.static_mesh_component.set_cast_shadow(False)
    for name, y, z, intensity in [('Key', -450, 450, 90), ('Fill', 450, 300, 55)]:
        label = 'LineupsTeam_' + name
        if label not in aa:
            light = native.spawn(unreal.RectLight, label, unreal.Vector(400, y, z), unreal.Rotator(pitch=-20, yaw=0, roll=0))
            light.light_component.set_editor_property('intensity', intensity)
            light.light_component.set_editor_property('source_width', 600.)
            light.light_component.set_editor_property('source_height', 450.)
    if not seq.get_tracks() or not any(isinstance(t, unreal.MovieSceneCameraCutTrack) for t in seq.get_tracks()):
        binding = seq.add_possessable(camera)
        cut = seq.add_track(unreal.MovieSceneCameraCutTrack).add_section(); cut.set_range(0, END)
        bid = unreal.MovieSceneObjectBindingID(); bid.set_editor_property('guid', binding.get_id()); cut.set_camera_binding_id(bid)
    unreal.EditorAssetLibrary.set_metadata_tag(seq, 'LineupsOwner', OWNER)
    unreal.EditorAssetLibrary.set_metadata_tag(seq, 'LineupsHold', 'Static after entrance; no animation out; Premiere owns transition')
    unreal.EditorAssetLibrary.set_metadata_tag(world, 'LineupsOwner', OWNER)
    assert unreal.EditorAssetLibrary.save_loaded_asset(seq)
    assert unreal.EditorLoadingAndSavingUtils.save_map(world, map_path)
    return {'map': map_path, 'sequence': seq_path, 'state': 'built-layout-pending', 'source': '/Game/_Scenes/FS_TeamVSTeam',
            'textureChanges': len(changes), 'headline': cfg['headline'], 'animationOutAllowed': False}


if __name__ == '__main__':
    result = {'status': 'building', 'variants': []}
    try:
        for slug in VARIANTS:
            result['variants'].append(build(slug))
        result['status'] = 'built-layout-pending'
    except Exception:
        result.update(status='failed', error=traceback.format_exc())
    (RECEIPTS / 'team-cards-build.json').write_text(json.dumps(result, indent=2))
