"""Build editable P11 team facts in the owned chart copy for first visual review."""
import hashlib
import json
import math
import sys
import traceback
from pathlib import Path
import unreal

REPO = Path('/Users/singleton23/Documents/Development/singleton-systems')
sys.path.insert(0, str(REPO / 'tools/lineups_unreal'))
import editor_scene
import build_review_export as native

PROJECT = native.PROJECT
ROOT = '/Game/Lineups/BillsPerformanceV1'
MAP, SEQ = ROOT + '/LV_BillsPerformance', ROOT + '/LS_BillsPerformance'
RECEIPT = PROJECT.parent.parent / 'receipts/bills-performance-build-v1.json'
state = {'status': 'building', 'sceneId': 'P11', 'map': MAP, 'sequence': SEQ,
         'visualApproval': False, 'editorialTimingApproved': False,
         'animationOut': False, 'reviewMode': 'static-first-layout'}
texts, created = [], []

def save():
    RECEIPT.write_text(json.dumps(state, indent=2) + '\n')

def srgb(code):
    channels = [int(code[i:i+2], 16) / 255 for i in (0, 2, 4)]
    return tuple(v / 12.92 if v <= .04045 else ((v + .055) / 1.055) ** 2.4 for v in channels)

BLUE, RED, WHITE, INK = srgb('00338D'), srgb('C60C30'), (1., 1., 1.), srgb('071B3D')

def pos(x, y, depth=950):
    # Fixed camera at X=-500, image width at X=950 is exactly 984.342857 units.
    units = (depth + 500) * 23.76 / 35 / 1920
    return unreal.Vector(depth, (x - 960) * units, (540 - y) * units)

def plane(label, x, y, width, height, mat, depth=950):
    units = (depth + 500) * 23.76 / 35 / 1920
    a = native.mesh_actor(label, quad, mat, pos(x, y, depth),
                          unreal.Vector(1, -width * units, height * units))
    a.static_mesh_component.set_cast_shadow(False)
    created.append(a)
    return a

def text(label, copy, x, y, width, height, color=WHITE, depth=939):
    center = pos(x, y, depth)
    a = native.spawn(unreal.Text3DActor, label, center)
    c = a.get_component_by_class(unreal.Text3DComponent)
    c.set_editor_property('font', unreal.load_asset('/Game/Lineups/ReviewV1/Widgets/Fonts/c6d5e1a6d369/BebasBoldSaved_Font'))
    c.set_editor_property('font_size', 24.)
    c.set_editor_property('text', copy)
    editor_scene.set_values(c.get_editor_property('layout_extension'), {'horizontalAlignment': 'Center', 'verticalAlignment': 'Center'})
    editor_scene.set_values(c.get_editor_property('geometry_extension'), {'extrude': .12, 'bevel': .025, 'bevelSegments': 2})
    rgba = dict(zip(['r', 'g', 'b', 'a'], [*color, 1.]))
    editor_scene.set_values(c.get_editor_property('material_extension'), {'style': 'Solid', 'frontColor': rgba,
                           'bevelColor': rgba, 'extrudeColor': rgba, 'bIsUnlit': True})
    units = (depth + 500) * 23.76 / 35 / 1920
    texts.append((a, width * units, height * units, center, copy))
    created.append(a)
    return a

def finish(dt):
    state['ticks'] = state.get('ticks', 0) + 1
    if state['ticks'] < 25:
        return
    try:
        if any(a.get_actor_bounds(False)[1].y < .01 for a, *_ in texts):
            if state['ticks'] < 250:
                return
            raise RuntimeError('Text geometry did not become ready')
        unreal.unregister_slate_post_tick_callback(unreal._bills_layout_tick)
        measured = []
        for a, width, height, center, copy in texts:
            origin, ext = a.get_actor_bounds(False)
            factor = min(width / (2 * ext.y), height / (2 * ext.z))
            a.set_actor_scale3d(unreal.Vector(factor, factor, factor))
            origin, ext = a.get_actor_bounds(False)
            a.set_actor_location(a.get_actor_location() + center - origin, False, False)
            measured.append({'label': a.get_actor_label(), 'text': copy, 'bounds': str(a.get_actor_bounds(False))})
        seq = unreal.AssetToolsHelpers.get_asset_tools().create_asset('LS_BillsPerformance', ROOT, unreal.LevelSequence, unreal.LevelSequenceFactoryNew())
        assert seq
        seq.set_display_rate(unreal.FrameRate(25, 1))
        seq.set_playback_start(0)
        seq.set_playback_end(150)
        binding = seq.add_possessable(camera)
        cut = seq.add_track(unreal.MovieSceneCameraCutTrack).add_section()
        cut.set_range(0, 150)
        bid = unreal.MovieSceneObjectBindingID()
        bid.set_editor_property('guid', binding.get_id())
        cut.set_camera_binding_id(bid)
        unreal.EditorAssetLibrary.set_metadata_tag(seq, 'LineupsOwner', 'lineups-bills-performance-v1')
        unreal.EditorAssetLibrary.set_metadata_tag(seq, 'LineupsTiming', 'static first-layout review; no animation out; episode cues pending')
        assert unreal.EditorAssetLibrary.save_loaded_asset(seq)
        assert unreal.EditorLoadingAndSavingUtils.save_map(world, MAP)
        unreal.LevelSequenceEditorBlueprintLibrary.open_level_sequence(seq)
        unreal.LevelSequenceEditorBlueprintLibrary.set_current_time(75)
        state.update(status='built', text=measured, createdActors=[a.get_actor_label() for a in created],
                     values=['33', '30', '5–1'], labels=['POINTS SCORED', 'POINTS ALLOWED', 'RECORD'],
                     header='BUFFALO BILLS', logoPlacement='former free-kicks heading area',
                     playerPortraitsVisible=False, fieldCount=3, fps=25)
        save()
    except Exception:
        state.update(status='failed', error=traceback.format_exc())
        save()
        raise

try:
    assert Path(unreal.Paths.convert_relative_path_to_full(unreal.Paths.project_dir())).resolve() == PROJECT
    world = unreal.get_editor_subsystem(unreal.UnrealEditorSubsystem).get_editor_world()
    assert world.get_path_name().split('.')[0] == MAP
    assert unreal.EditorAssetLibrary.get_metadata_tag(world, 'LineupsOwner') == 'lineups-bills-performance-v1'
    assert not unreal.EditorAssetLibrary.does_asset_exist(SEQ), 'Preserve existing layout version'
    unreal.LevelSequenceEditorBlueprintLibrary.close_level_sequence()
    for s in [o for o in unreal.ObjectIterator() if isinstance(o, unreal.LevelSequence) and o.get_path_name().startswith(MAP + '.')]:
        for b in list(s.get_bindings()):
            b.remove()
        for t in list(s.get_tracks()):
            s.remove_track(t)
    # Preserve the sample actors in the copy, but prevent its masks, portraits,
    # sponsor branding and stock transitions from controlling the new layout.
    for a in unreal.get_editor_subsystem(unreal.EditorActorSubsystem).get_all_level_actors():
        a.set_actor_hidden_in_game(True)
        a.set_is_temporarily_hidden_in_editor(True)
        a.set_actor_tick_enabled(False)
    native.ROOT = ROOT
    quad = unreal.load_asset('/Game/Lineups/ReviewV1/Meshes/SM_ReviewQuad')
    assert quad
    paper = unreal.load_asset('/Game/_Textures/T_WheatPaste_D')
    paper_mat = native.material('M_BillsPaper', paper, unlit=True)
    blue_mat = native.material('M_BillsBluePaper', paper, BLUE, unlit=True)
    red_mat = native.material('M_BillsRedPaper', paper, RED, unlit=True)
    ink_mat = native.material('M_BillsInk', color=INK, unlit=True)
    red_line = native.material('M_BillsRed', color=RED, unlit=True)
    plane('Bills_Paper', 960, 540, 1920, 1080, paper_mat, 980)
    plane('Bills_Header', 960, 100, 1920, 200, blue_mat, 960)
    plane('Bills_HeaderRule', 960, 204, 1920, 8, red_line, 957)
    text('Bills_HeaderText', 'BUFFALO BILLS', 960, 98, 1430, 92)
    logo_path = Path('/Volumes/UnrealSSD/Generated/CATENA_MEDIA_LINEUPS/source/unreal/projects/LineupsAgentTrial/SourceArt/TwoUp/rightLogo.png')
    logo = editor_scene.import_texture('BillsLogo', {'path': str(logo_path), 'sha256': hashlib.sha256(logo_path.read_bytes()).hexdigest()}, ROOT)
    logo_mat = native.material('M_BillsLogo', logo, unlit=True, masked=True)
    plane('Bills_HeadingLogo', 960, 325, 290, 290, logo_mat, 944)
    for index, (x, value, label, mat) in enumerate([(360, '33', 'POINTS SCORED', blue_mat),
                                                  (960, '30', 'POINTS ALLOWED', red_mat),
                                                  (1560, '5–1', 'RECORD', blue_mat)]):
        plane('Bills_FactShadow_' + str(index), x + 6, 742, 510, 464, ink_mat, 958)
        plane('Bills_FactPanel_' + str(index), x, 732, 510, 464, mat, 952)
        text('Bills_Value_' + str(index), value, x, 665, 400, 182)
        text('Bills_Label_' + str(index), label, x, 850, 440, 56)
    camera = native.spawn(unreal.CineCameraActor, 'Bills_ReviewCamera', unreal.Vector(-500, 0, 0))
    cc = camera.get_cine_camera_component()
    cc.filmback = unreal.CameraFilmbackSettings(sensor_width=23.76, sensor_height=13.365)
    cc.current_focal_length = 35.
    focus = cc.focus_settings
    focus.focus_method = unreal.CameraFocusMethod.DISABLE
    cc.focus_settings = focus
    pp = cc.post_process_settings
    pp.override_motion_blur_amount = True
    pp.motion_blur_amount = 0
    pp.override_auto_exposure_method = True
    pp.auto_exposure_method = unreal.AutoExposureMethod.AEM_MANUAL
    pp.override_auto_exposure_apply_physical_camera_exposure = True
    pp.auto_exposure_apply_physical_camera_exposure = False
    pp.override_bloom_intensity = True
    pp.bloom_intensity = 0
    cc.post_process_settings = pp
    unreal._bills_layout_tick = unreal.register_slate_post_tick_callback(finish)
    state['status'] = 'waiting-for-text'
    save()
except Exception:
    state.update(status='failed', error=traceback.format_exc())
    save()
    raise
