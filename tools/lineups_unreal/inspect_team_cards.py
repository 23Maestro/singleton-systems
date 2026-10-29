"""Inspect the installed paired-logo source without changing the active level."""
import json
from pathlib import Path
import unreal

project = Path('/Volumes/UnrealSSD/Generated/CATENA_MEDIA_LINEUPS/source/unreal/projects/SportsBroadcastTrial58')
assert Path(unreal.Paths.convert_relative_path_to_full(unreal.Paths.project_dir())).resolve() == project
world = unreal.load_asset('/Game/_Scenes/FS_TeamVSTeam')
assert world
prefix = world.get_path_name().split('.')[0] + '.'
rows = []
textures = []
sequences = []
for obj in unreal.ObjectIterator():
    try:
        path = unreal.SystemLibrary.get_path_name(obj)
    except TypeError:
        continue
    if not path.startswith(prefix):
        continue
    if isinstance(obj, unreal.Actor):
        text = obj.get_component_by_class(unreal.Text3DComponent)
        rows.append({'label': obj.get_actor_label(), 'path': obj.get_path_name(),
                     'class': obj.get_class().get_name(), 'location': str(obj.get_actor_location()),
                     'scale': str(obj.get_actor_scale3d()), 'text': str(text.get_editor_property('text')) if text else None})
    if isinstance(obj, unreal.DMMaterialValueTexture):
        value = obj.get_editor_property('value')
        textures.append({'path': obj.get_path_name(), 'texture': value.get_path_name() if value else None})
    if isinstance(obj, unreal.LevelSequence):
        sequences.append({'path': obj.get_path_name(), 'bindings': [b.get_name() for b in obj.get_bindings()]})
receipt = project.parent.parent / 'receipts/team-cards-source-inspection.json'
receipt.write_text(json.dumps({'world': world.get_path_name(), 'actors': rows, 'textures': textures, 'sequences': sequences}, indent=2))
