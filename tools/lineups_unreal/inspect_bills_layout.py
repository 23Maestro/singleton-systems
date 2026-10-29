"""Evaluate the cloned chart's entrance and inspect editable shape controls."""
import json
from pathlib import Path
import unreal
from editor_toolset.toolsets.object import ObjectTools

ROOT = '/Game/Lineups/BillsPerformanceV1'
MAP = ROOT + '/LV_BillsPerformance'
world = unreal.get_editor_subsystem(unreal.UnrealEditorSubsystem).get_editor_world()
assert world.get_path_name().split('.')[0] == MAP
seqs = [o for o in unreal.ObjectIterator() if isinstance(o, unreal.AvaSequence) and o.get_path_name().startswith(MAP + '.')]
result = {'sequences': [{'path': s.get_path_name(), 'label': str(s.get_label()), 'start': s.get_playback_start(), 'end': s.get_playback_end()} for s in seqs]}
entrance = next(s for s in seqs if not str(s.get_label()).endswith('Out'))
seq = unreal.AssetToolsHelpers.get_asset_tools().duplicate_asset('LS_BillsSourceIn', ROOT, entrance)
assert seq
actors = {a.get_actor_label(): a for a in unreal.get_editor_subsystem(unreal.EditorActorSubsystem).get_all_level_actors()}
sub = unreal.get_editor_subsystem(unreal.LevelSequenceEditorSubsystem)
for b in seq.get_bindings():
    if b.get_name() in actors:
        sub.replace_binding_with_actors([actors[b.get_name()]], b)
unreal.LevelSequenceEditorBlueprintLibrary.open_level_sequence(seq)
unreal.LevelSequenceEditorBlueprintLibrary.set_current_time(seq.get_playback_end() - 1)
result['actors'] = []
for label in ['Main_Box', 'TopPurple_Box', 'Bar_1', 'Stat_1', 'Text_TitleText_MOST']:
    a = actors[label]
    row = {'label': label, 'bounds': str(a.get_actor_bounds(False)), 'properties': {}}
    for c in a.get_components_by_class(unreal.ActorComponent):
        if c.get_class().get_name() in ['AvaShapeRectangleDynamicMesh', 'ActorModifierCoreComponent']:
            row['properties'][c.get_path_name()] = json.loads(ObjectTools.list_properties(c))
    result['actors'].append(row)
Path('/Volumes/UnrealSSD/Generated/CATENA_MEDIA_LINEUPS/source/unreal/receipts/bills-layout-controls.json').write_text(json.dumps(result, indent=2) + '\n')
