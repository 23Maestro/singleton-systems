"""Create a separate owned copy of Epic's chart for the P11 first-layout review."""
import json
import traceback
from pathlib import Path
import unreal

PROJECT = Path('/Volumes/UnrealSSD/Generated/CATENA_MEDIA_LINEUPS/source/unreal/projects/SportsBroadcastTrial58')
ROOT = '/Game/Lineups/BillsPerformanceV1'
MAP = ROOT + '/LV_BillsPerformance'
RECEIPT = PROJECT.parent.parent / 'receipts/bills-performance-prepare-v1.json'
state = {'status': 'preparing', 'map': MAP}
try:
    assert Path(unreal.Paths.convert_relative_path_to_full(unreal.Paths.project_dir())).resolve() == PROJECT
    assert not unreal.EditorAssetLibrary.does_asset_exist(MAP), 'Preserve existing version'
    unreal.LevelSequenceEditorBlueprintLibrary.close_level_sequence()
    unreal.get_editor_subsystem(unreal.LevelEditorSubsystem).save_current_level()
    duplicate = unreal.EditorAssetLibrary.duplicate_asset('/Game/_Scenes/FS_BarChart', MAP)
    assert duplicate
    unreal.EditorAssetLibrary.set_metadata_tag(duplicate, 'LineupsOwner', 'lineups-bills-performance-v1')
    assert unreal.EditorAssetLibrary.save_loaded_asset(duplicate)
    duplicate = None
    unreal.SystemLibrary.collect_garbage()
    assert unreal.get_editor_subsystem(unreal.LevelEditorSubsystem).load_level(MAP)
    rows = []
    for a in unreal.get_editor_subsystem(unreal.EditorActorSubsystem).get_all_level_actors():
        c = a.get_component_by_class(unreal.Text3DComponent)
        row = {'label': a.get_actor_label(), 'class': a.get_class().get_name(), 'location': str(a.get_actor_location()),
               'rotation': str(a.get_actor_rotation()), 'bounds': str(a.get_actor_bounds(False)),
               'components': [x.get_class().get_name() for x in a.get_components_by_class(unreal.ActorComponent)]}
        if c:
            row['text'] = str(c.text)
        if isinstance(a, unreal.CineCameraActor):
            cc = a.get_cine_camera_component()
            row['camera'] = {'focal': cc.current_focal_length, 'filmback': str(cc.filmback), 'fov': cc.get_horizontal_field_of_view(), 'projection': str(cc.projection_mode)}
        rows.append(row)
    state.update(status='prepared', actors=rows)
except Exception:
    state.update(status='failed', error=traceback.format_exc())
    raise
finally:
    RECEIPT.write_text(json.dumps(state, indent=2) + '\n')
