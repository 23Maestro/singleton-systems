"""Read back the clean Bills scene at the beginning, middle and end of its hold."""
import json
import traceback
from pathlib import Path
import unreal

ROOT = '/Game/Lineups/BillsPerformanceMotionV1'
MAP, SEQ = ROOT + '/LV_BillsPerformanceMotion', ROOT + '/LS_BillsPerformanceMotionPairFocus'
PROOF = Path('/Volumes/UnrealSSD/Generated/CATENA_MEDIA_LINEUPS/source/unreal/receipts/bills-performance-motion-runtime-v2.json')
frames, snapshots = [221, 300, 411], []
ticks, index = 0, 0


def inspect(dt):
    global ticks, index
    ticks += 1
    if ticks < 3:
        return
    try:
        aa = unreal.get_editor_subsystem(unreal.EditorActorSubsystem).get_all_level_actors()
        snapshots.append({'frame': frames[index], 'actors': {
            a.get_actor_label(): str(a.get_actor_transform()) for a in aa if a.get_actor_label().startswith('Bills_')}})
        index += 1
        if index < len(frames):
            unreal.LevelSequenceEditorBlueprintLibrary.set_current_time(frames[index])
            ticks = 0
            return
        unreal.unregister_slate_post_tick_callback(unreal._bills_verify_tick)
        assert all(s['actors'] == snapshots[0]['actors'] for s in snapshots), 'Hold transforms changed'
        assert len(snapshots[0]['actors']) == 18
        stock = [a.get_actor_label() for a in aa if a.get_path_name().startswith(MAP + '.')
                 and not a.get_actor_label().startswith('Bills_') and not isinstance(a, unreal.WorldSettings)]
        assert not stock, stock
        unreal.LevelSequenceEditorBlueprintLibrary.set_current_time(221)
        lock = getattr(unreal.LevelSequenceEditorBlueprintLibrary, 'set_lock_camera_cut_to_viewport', None)
        if lock:
            lock(True)
        PROOF.write_text(json.dumps({'status': 'passed', 'map': MAP, 'sequence': SEQ,
                                    'stockActorsRemaining': stock, 'holdSnapshots': snapshots,
                                    'cameraCutLockedForReview': bool(lock), 'animationOut': False}, indent=2) + '\n')
    except Exception:
        unreal.unregister_slate_post_tick_callback(unreal._bills_verify_tick)
        PROOF.write_text(json.dumps({'status': 'failed', 'error': traceback.format_exc()}, indent=2) + '\n')
        raise


world = unreal.get_editor_subsystem(unreal.UnrealEditorSubsystem).get_editor_world()
assert world.get_path_name().split('.')[0] == MAP
seq = unreal.load_asset(SEQ)
assert unreal.EditorAssetLibrary.get_metadata_tag(seq, 'LineupsOwner') == 'lineups-bills-performance-motion-v1'
unreal.LevelSequenceEditorBlueprintLibrary.open_level_sequence(seq)
unreal.LevelSequenceEditorBlueprintLibrary.set_current_time(frames[0])
unreal._bills_verify_tick = unreal.register_slate_post_tick_callback(inspect)
