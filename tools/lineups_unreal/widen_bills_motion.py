"""Frame the two score cards together with the logo, then open to the record."""
import itertools
import json
import traceback
from pathlib import Path
import unreal

ROOT = '/Game/Lineups/BillsPerformanceMotionV1'
MAP = ROOT + '/LV_BillsPerformanceMotion'
SOURCE, TARGET = ROOT + '/LS_BillsPerformanceMotion', ROOT + '/LS_BillsPerformanceMotionPairFocus'
PROOF = Path('/Volumes/UnrealSSD/Generated/CATENA_MEDIA_LINEUPS/source/unreal/receipts/bills-performance-motion-pair-focus-v1.json')
END, HOLD, LEAD = 412, 221, 37
r = {'status': 'updating', 'map': MAP, 'sequence': TARGET, 'sourceSequence': SOURCE,
     'animationOut': False, 'motionApproval': False, 'productionReady': False}


def smooth(t):
    t = min(1., max(0., t))
    return t ** 3 * (10 + t * (-15 + 6 * t))


try:
    world = unreal.get_editor_subsystem(unreal.UnrealEditorSubsystem).get_editor_world()
    assert world.get_path_name().split('.')[0] == MAP
    source = unreal.load_asset(SOURCE)
    assert unreal.EditorAssetLibrary.get_metadata_tag(source, 'LineupsOwner') == 'lineups-bills-performance-motion-v1'
    existing = unreal.EditorAssetLibrary.does_asset_exist(TARGET)
    if existing:
        prior = json.loads(PROOF.read_text())
        assert prior['status'] == 'saved' and prior['sequence'] == TARGET and not prior['motionApproval']
    unreal.LevelSequenceEditorBlueprintLibrary.set_current_time(221)
    aa = {a.get_actor_label(): a for a in unreal.get_editor_subsystem(unreal.EditorActorSubsystem).get_all_level_actors()}
    # Record settled glyph/logo bounds before closing the evaluated source.
    protected = {k: a.get_actor_bounds(False) for k, a in aa.items()
                 if k.startswith(('Bills_HeaderText', 'Bills_HeadingLogo', 'Bills_Label_', 'Bills_Value_', 'Bills_FactPanel_'))}
    unreal.LevelSequenceEditorBlueprintLibrary.close_level_sequence()
    seq = unreal.load_asset(TARGET) if existing else unreal.EditorAssetLibrary.duplicate_asset(SOURCE, TARGET)
    assert seq
    b = next(b for b in seq.get_bindings() if b.get_name() == 'Bills_ReviewCamera')
    for track in list(b.get_tracks()):
        b.remove_track(track)
    section = b.add_track(unreal.MovieScene3DTransformTrack).add_section()
    section.set_range(0, END)
    channels = section.get_all_channels()
    full = unreal.Vector(-500, 0, 0)
    units = (952 + 500) * 23.76 / 35 / 1920
    pair = unreal.Vector(952 - (952 + 500) / 1.22, (660 - 960) * units, (540 - 600) * units)
    wide = unreal.Vector(952 - (952 + 500) / 1.08, 0, (540 - 520) * units)
    def camera_at(frame):
        if frame < LEAD:
            return full + (pair - full) * smooth(frame / LEAD)
        if frame <= 135:
            return pair
        if frame < 174:
            return pair + (wide - pair) * smooth((frame - 135) / (174 - 135))
        if frame <= 181:
            return wide
        if frame < HOLD:
            return wide + (full - wide) * smooth((frame - 181) / (HOLD - 181))
        return full
    margins = []
    for f in range(END):
        loc = camera_at(f)
        # Every settled card plus the entire logo and heading must fit even at
        # maximum push. Entrance-only travel from below is intentionally exempt.
        for label, (origin, ext) in protected.items():
            # The heading may leave the close view. Both score cards and the
            # full logo stay protected; the new record text fits when it lands.
            if label == 'Bills_HeaderText' and f < HOLD:
                continue
            if label.endswith('_2'):
                threshold = 174 if label.startswith('Bills_FactPanel_') else 161
                if f < threshold:
                    continue
            projected = []
            for sx, sy, sz in itertools.product([-1, 1], repeat=3):
                point = origin + unreal.Vector(sx * ext.x, sy * ext.y, sz * ext.z)
                depth = point.x - loc.x
                assert depth > 0
                projected.append((960 + (point.y - loc.y) / depth * 35 / 23.76 * 1920,
                                  540 - (point.z - loc.z) / depth * 35 / 13.365 * 1080))
            margin = min(min(x, 1920-x, y, 1080-y) for x, y in projected)
            assert margin >= 14, (f, label, margin)
            margins.append(margin)
        if f <= HOLD or f == END - 1:
            for channel, value in zip(channels, [loc.x, loc.y, loc.z, 0, 0, 0, 1, 1, 1]):
                channel.add_key(unreal.FrameNumber(f), value,
                                interpolation=unreal.MovieSceneKeyInterpolation.LINEAR)
    unreal.EditorAssetLibrary.set_metadata_tag(seq, 'LineupsOwner', 'lineups-bills-performance-motion-v1')
    unreal.EditorAssetLibrary.set_metadata_tag(seq, 'LineupsTiming', 'same Mark cues 43/63/151; paired score focus with full logo; static from221; no out')
    unreal.EditorAssetLibrary.set_metadata_tag(seq, 'LineupsCameraRevision', 'Jerami: show 33 and 30 together with Bills logo, then open to record')
    assert unreal.EditorAssetLibrary.save_loaded_asset(seq)
    unreal.LevelSequenceEditorBlueprintLibrary.open_level_sequence(seq)
    unreal.LevelSequenceEditorBlueprintLibrary.set_current_time(77)
    unreal.LevelSequenceEditorBlueprintLibrary.set_lock_camera_cut_to_viewport(True)
    r.update(status='saved', pairZoom=1.22, allCardsZoom=1.08, framing='both score cards and full Bills logo',
             protectedElements=list(protected), minimumProtectedMarginPixels=min(margins),
             cameraPairPosition=[pair.x, pair.y, pair.z], cameraWidePosition=[wide.x, wide.y, wide.z], cardCueFrames=[43, 63, 151],
             staticHoldFromFrame=221, fullBoardHoldFrames=191,
             cameraMoves=[{'frames': [0, 37], 'action': 'push into both score cards and logo'},
                          {'frames': [135, 174], 'action': 'open toward record, retaining both score cards'},
                          {'frames': [181, 221], 'action': 'pull back to full board'}])
except Exception:
    r.update(status='failed', error=traceback.format_exc())
    raise
finally:
    PROOF.write_text(json.dumps(r, indent=2) + '\n')
