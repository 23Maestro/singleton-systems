"""Copy the approved Bills layout; place cue-bound cards and track their landings."""
import json
import sys
import traceback
from pathlib import Path

import unreal

REPO = Path('/Users/singleton23/Documents/Development/singleton-systems')
sys.path.insert(0, str(REPO))
from tools.lineups_motion.timing_evidence import validate_timing_receipt, file_hash

PROJECT = Path('/Volumes/UnrealSSD/Generated/CATENA_MEDIA_LINEUPS/source/unreal/projects/SportsBroadcastTrial58')
SOURCE = '/Game/Lineups/BillsPerformanceV1'
ROOT = '/Game/Lineups/BillsPerformanceMotionV1'
MAP, SEQ = ROOT + '/LV_BillsPerformanceMotion', ROOT + '/LS_BillsPerformanceMotion'
PROOF = PROJECT.parent.parent / 'receipts/bills-performance-motion-build-v1.json'
FPS, LEAD = 25, 37
END, HOLD = 375 + LEAD, 184 + LEAD
state = {'status': 'building', 'map': MAP, 'sequence': SEQ, 'fps': FPS,
         'frameCount': END, 'staticHoldFromFrame': HOLD, 'animationOut': False,
         'layoutApproval': True, 'motionApproval': False, 'productionReady': False}


def save():
    PROOF.write_text(json.dumps(state, indent=2) + '\n')


def clamp(t):
    return min(1., max(0., t))


def smooth(t):
    t = clamp(t)
    return t * t * t * (10 + t * (-15 + 6 * t))


def transform_track(seq, actor, samples):
    binding = seq.add_possessable(actor)
    section = binding.add_track(unreal.MovieScene3DTransformTrack).add_section()
    section.set_range(0, END)
    channels = section.get_all_channels()
    assert len(channels) == 9
    for frame, values in samples:
        for channel, value in zip(channels, values):
            channel.add_key(unreal.FrameNumber(frame), value,
                            interpolation=unreal.MovieSceneKeyInterpolation.LINEAR)
    return binding


def vec(v):
    return [v.x, v.y, v.z]


try:
    assert Path(unreal.Paths.convert_relative_path_to_full(unreal.Paths.project_dir())).resolve() == PROJECT
    episode = REPO / 'config/lineups/episodes/2026-10-20-nfl-week-7-power-rankings'
    source_plan = episode / 'storyboard/timing/P11.manifest.json'
    plan = json.loads(source_plan.read_text())
    # Reuse only the verified word cues. The original renderer-bound Figma plan
    # stays intact; this receipt describes the separate native Unreal execution.
    timing = validate_timing_receipt(episode, plan, require_approval=False)
    cues = plan['motion']['cues'][1:]
    cue_frames = [int(c['sceneTime'] * FPS + .5) for c in cues]
    assert cue_frames == [6, 26, 114]
    begins = [f + LEAD for f in cue_frames]
    assert all(c['duration'] == .4 for c in cues)
    state.update(sourcePlan=str(source_plan), sourcePlanSha256=file_hash(source_plan),
                 sourceManimReceipt=timing, sourceEngine=plan['motion']['engine'],
                 nativeTimingAdapter='verified word cues, nearest-half-up 25fps; authored camera choreography',
                 audioAnchor=plan['timing']['verifiedAnchorTimestamp'],
                 audioStart=plan['timing']['verifiedAnchorTimestamp'] - LEAD / FPS,
                 leadInFrames=LEAD, cueFrames=begins,
                 cueSeconds=[c['transcriptTimestamp'] for c in cues])
    unreal.LevelSequenceEditorBlueprintLibrary.close_level_sequence()
    if unreal.EditorAssetLibrary.does_asset_exist(MAP):
        prior = json.loads(PROOF.read_text())
        assert prior['status'] == 'failed' and prior['map'] == MAP, 'Preserve successful motion copy'
        state['removedStockActors'] = prior.get('removedStockActors', [])
        current = unreal.get_editor_subsystem(unreal.UnrealEditorSubsystem).get_editor_world()
        assert current.get_path_name().split('.')[0] == MAP, 'Resume only the owned failed working copy'
    else:
        unreal.get_editor_subsystem(unreal.LevelEditorSubsystem).save_current_level()
        duplicate = unreal.EditorAssetLibrary.duplicate_asset(SOURCE + '/LV_BillsPerformance', MAP)
        assert duplicate
        assert unreal.EditorAssetLibrary.save_loaded_asset(duplicate)
        duplicate = None
        unreal.SystemLibrary.collect_garbage()
        assert unreal.get_editor_subsystem(unreal.LevelEditorSubsystem).load_level(MAP)
    world = unreal.get_editor_subsystem(unreal.UnrealEditorSubsystem).get_editor_world()
    assert world.get_path_name().split('.')[0] == MAP
    unreal.EditorAssetLibrary.set_metadata_tag(world, 'LineupsOwner', 'lineups-bills-performance-motion-v1')
    actors = {a.get_actor_label(): a for a in unreal.get_editor_subsystem(unreal.EditorActorSubsystem).get_all_level_actors()}
    removed = []
    actor_system = unreal.get_editor_subsystem(unreal.EditorActorSubsystem)
    for label, actor in list(actors.items()):
        if (not actor.get_path_name().startswith(MAP + '.') or
                label.startswith('Bills_') or isinstance(actor, unreal.WorldSettings)):
            continue
        assert actor_system.destroy_actor(actor), 'Could not remove stock actor: ' + label
        removed.append(label)
        del actors[label]
    state['removedStockActors'] = list(dict.fromkeys(state.get('removedStockActors', []) + removed))
    seq = unreal.load_asset(SEQ) if unreal.EditorAssetLibrary.does_asset_exist(SEQ) else None
    if seq:
        assert not seq.get_bindings() and not seq.get_tracks(), 'Preserve non-empty sequence'
    else:
        seq = unreal.AssetToolsHelpers.get_asset_tools().create_asset(
            'LS_BillsPerformanceMotion', ROOT, unreal.LevelSequence, unreal.LevelSequenceFactoryNew())
    unreal.EditorAssetLibrary.set_metadata_tag(seq, 'LineupsOwner', 'lineups-bills-performance-motion-v1')
    seq.set_display_rate(unreal.FrameRate(FPS, 1))
    seq.set_playback_start(0)
    seq.set_playback_end(END)
    groups = []
    for i, begin in enumerate(begins):
        root = actors['Bills_FactPanel_' + str(i)]
        root.static_mesh_component.set_mobility(unreal.ComponentMobility.MOVABLE)
        attached = []
        for stem in ['Bills_FactShadow_', 'Bills_Value_', 'Bills_Label_']:
            child = actors[stem + str(i)]
            child.get_editor_property('root_component').set_mobility(unreal.ComponentMobility.MOVABLE)
            child.attach_to_actor(root, '', unreal.AttachmentRule.KEEP_WORLD,
                                  unreal.AttachmentRule.KEEP_WORLD, unreal.AttachmentRule.KEEP_WORLD, False)
            attached.append(child.get_actor_label())
        final, scale, rot = root.get_actor_location(), root.get_actor_scale3d(), root.get_actor_rotation()
        samples = []
        for f in sorted({0, END - 1, *range(begin, begin + 11)}):
            t = clamp((f - begin) / 10)
            u = 1 - (1 - t) ** 3
            # Enter from below and in front, settle onto the panel in depth.
            # All text and its shadow travel with the panel as one solid card.
            location = final + unreal.Vector(-90 * (1 - u), 0, -470 * (1 - u))
            factor = .92 + .08 * u
            values = [*vec(location), rot.roll, rot.pitch + 4 * (1 - u), rot.yaw,
                      scale.x * factor, scale.y * factor, scale.z * factor]
            samples.append((f, values))
        transform_track(seq, root, samples)
        groups.append({'root': root.get_actor_label(), 'children': attached,
                       'cueFrame': begin, 'settledFrame': begin + 10,
                       'finalTransform': samples[-1][1]})
    camera = actors['Bills_ReviewCamera']
    camera.get_editor_property('root_component').set_mobility(unreal.ComponentMobility.MOVABLE)
    units = (952 + 500) * 23.76 / 35 / 1920
    close = [unreal.Vector(80, (x - 960) * units, (540 - 732) * units)
             for x in [360, 960, 1560]]
    full = unreal.Vector(-500, 0, 0)
    def camera_at(frame):
        if frame < LEAD:
            return full + (close[0] - full) * smooth(frame / LEAD)
        frame -= LEAD
        if frame <= 18:
            return close[0]
        if frame < 40:
            return close[0] + (close[1] - close[0]) * smooth((frame - 18) / 22)
        if frame <= 98:
            return close[1]
        if frame < 124:
            return close[1] + (close[2] - close[1]) * smooth((frame - 98) / 26)
        if frame <= 144:
            return close[2]
        if frame < HOLD - LEAD:
            return close[2] + (full - close[2]) * smooth((frame - 144) / (HOLD - LEAD - 144))
        return full
    camera_samples = [(f, [*vec(camera_at(f)), 0, 0, 0, 1, 1, 1]) for f in range(HOLD + 1)]
    camera_samples.append((END - 1, camera_samples[-1][1]))
    binding = transform_track(seq, camera, camera_samples)
    cut = seq.add_track(unreal.MovieSceneCameraCutTrack).add_section()
    cut.set_range(0, END)
    bid = unreal.MovieSceneObjectBindingID()
    bid.set_editor_property('guid', binding.get_id())
    cut.set_camera_binding_id(bid)
    unreal.EditorAssetLibrary.set_metadata_tag(seq, 'LineupsOwner', 'lineups-bills-performance-motion-v1')
    unreal.EditorAssetLibrary.set_metadata_tag(seq, 'LineupsTiming', 'Mark word cues 43/63/151; 37 frame lead-in; static from221; no out')
    assert unreal.EditorAssetLibrary.save_loaded_asset(seq)
    assert unreal.EditorLoadingAndSavingUtils.save_map(world, MAP)
    unreal.LevelSequenceEditorBlueprintLibrary.open_level_sequence(seq)
    unreal.LevelSequenceEditorBlueprintLibrary.set_current_time(HOLD)
    state.update(status='built', groups=groups, cameraMoves=[
        {'frames': [0, LEAD], 'action': 'push into 33 panel'},
        {'frames': [18 + LEAD, 40 + LEAD], 'action': 'truck 33 to 30'},
        {'frames': [98 + LEAD, 124 + LEAD], 'action': 'truck 30 to record'},
        {'frames': [144 + LEAD, HOLD], 'action': 'pull back to approved full board'}],
        text={k: str(a.get_component_by_class(unreal.Text3DComponent).get_editor_property('text'))
              for k, a in actors.items() if k.startswith(('Bills_Value_', 'Bills_Label_', 'Bills_HeaderText'))},
        boundActors=[b.get_name() for b in seq.get_bindings()])
    save()
except Exception:
    state.update(status='failed', error=traceback.format_exc())
    save()
    raise
