"""Extend the owned Bills backdrop for camera travel; verify the saved no-out keys."""
import json
import sys
import traceback
from pathlib import Path
import unreal

REPO = Path('/Users/singleton23/Documents/Development/singleton-systems')
sys.path.insert(0, str(REPO / 'tools/lineups_unreal'))
import build_review_export as native

ROOT = '/Game/Lineups/BillsPerformanceMotionV1'
MAP, SEQ = ROOT + '/LV_BillsPerformanceMotion', ROOT + '/LS_BillsPerformanceMotion'
PROOF = native.PROJECT.parent.parent / 'receipts/bills-performance-motion-polish-v1.json'
r = {'status': 'checking'}
try:
    world = unreal.get_editor_subsystem(unreal.UnrealEditorSubsystem).get_editor_world()
    assert world.get_path_name().split('.')[0] == MAP
    seq = unreal.load_asset(SEQ)
    assert unreal.EditorAssetLibrary.get_metadata_tag(seq, 'LineupsOwner') == 'lineups-bills-performance-motion-v1'
    unreal.LevelSequenceEditorBlueprintLibrary.close_level_sequence()
    aa = {a.get_actor_label(): a for a in unreal.get_editor_subsystem(unreal.EditorActorSubsystem).get_all_level_actors()}
    stock = [k for k, a in aa.items() if a.get_path_name().startswith(MAP + '.')
             and not k.startswith('Bills_') and not isinstance(a, unreal.WorldSettings)]
    assert not stock, stock
    native.ROOT = ROOT
    paper = unreal.load_asset('/Game/_Textures/T_WheatPaste_D')
    def overscan(label, name, color, vertical=1):
        mat = native.material(name, texture=paper, color=color, unlit=True)
        ml = unreal.MaterialEditingLibrary
        sample = next(e for e in unreal.ObjectIterator()
                      if isinstance(e, unreal.MaterialExpressionTextureSample) and e.get_outer() == mat)
        uv = ml.create_material_expression(mat, unreal.MaterialExpressionTextureCoordinate)
        uv.set_editor_property('u_tiling', 3.)
        uv.set_editor_property('v_tiling', float(vertical))
        ml.connect_material_expressions(uv, '', sample, 'Coordinates')
        ml.recompile_material(mat)
        unreal.EditorAssetLibrary.save_loaded_asset(mat)
        a = aa[label]
        base = {'Bills_Paper': (980, 1920, 1080), 'Bills_Header': (960, 1920, 200)}[label]
        depth, width, height = base
        units = (depth + 500) * 23.76 / 35 / 1920
        a.set_actor_scale3d(unreal.Vector(1, -width * units * 3, height * units * vertical))
        a.static_mesh_component.set_material(0, mat)
    overscan('Bills_Paper', 'M_BillsPaperOverscan', (1, 1, 1), 3)
    def srgb(code):
        c = [int(code[i:i+2], 16) / 255 for i in (0, 2, 4)]
        return tuple(v / 12.92 if v <= .04045 else ((v + .055) / 1.055) ** 2.4 for v in c)
    overscan('Bills_Header', 'M_BillsHeaderOverscan', srgb('00338D'))
    a = aa['Bills_HeaderRule']
    units = (957 + 500) * 23.76 / 35 / 1920
    a.set_actor_scale3d(unreal.Vector(1, -1920 * units * 3, 8 * units))
    rows = []
    for b in seq.get_bindings():
        tracks = b.get_tracks()
        assert len(tracks) == 1 and isinstance(tracks[0], unreal.MovieScene3DTransformTrack)
        for s in tracks[0].get_sections():
            channels = []
            for ch in s.get_all_channels():
                keys = ch.get_keys()
                # Each track ends with a hold key identical to its settled value.
                assert len(keys) >= 2
                assert abs(keys[-1].get_value() - keys[-2].get_value()) < 1e-6
                channels.append({'count': len(keys), 'final': keys[-1].get_value()})
            rows.append({'binding': b.get_name(), 'channels': channels})
    assert len(rows) == 4
    master = [t.get_class().get_name() for t in seq.get_tracks()]
    assert master == ['MovieSceneCameraCutTrack'], master
    for a in aa.values():
        c = a.get_component_by_class(unreal.Text3DComponent)
        if c:
            assert str(c.get_editor_property('text')) in ['BUFFALO BILLS', '33', '30', '5–1', 'POINTS SCORED', 'POINTS ALLOWED', 'RECORD']
    assert unreal.EditorLoadingAndSavingUtils.save_map(world, MAP)
    unreal.LevelSequenceEditorBlueprintLibrary.open_level_sequence(seq)
    unreal.LevelSequenceEditorBlueprintLibrary.set_current_time(221)
    r.update(status='passed', stockActorsRemaining=stock, animatedBindings=rows, masterTracks=master,
             paperOverscan=3, headerOverscan=3, animationOut=False, staticHoldFromFrame=221)
except Exception:
    r.update(status='failed', error=traceback.format_exc())
    raise
finally:
    PROOF.write_text(json.dumps(r, indent=2) + '\n')
