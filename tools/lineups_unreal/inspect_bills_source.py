"""Read the installed chart source without editing its assets."""
import json
from pathlib import Path
import unreal

PROJECT = Path('/Volumes/UnrealSSD/Generated/CATENA_MEDIA_LINEUPS/source/unreal/projects/SportsBroadcastTrial58')
assert Path(unreal.Paths.convert_relative_path_to_full(unreal.Paths.project_dir())).resolve() == PROJECT
result = {}
for name in ['FS_BarChart', 'FS_BarChart_DV_Alt']:
    world = unreal.load_asset('/Game/_Scenes/' + name)
    prefix = world.get_path_name().split('.')[0] + '.'
    actors, textures, sequences = [], [], []
    for obj in unreal.ObjectIterator():
        path = unreal.SystemLibrary.get_path_name(obj)
        if not path.startswith(prefix):
            continue
        if isinstance(obj, unreal.Actor):
            text = obj.get_component_by_class(unreal.Text3DComponent)
            actors.append({'label': obj.get_actor_label(), 'class': obj.get_class().get_name(),
                           'path': path, 'location': str(obj.get_actor_location()),
                           'scale': str(obj.get_actor_scale3d()),
                           'text': str(text.text) if text else None})
        if isinstance(obj, unreal.DMMaterialValueTexture):
            texture = obj.get_editor_property('value')
            textures.append({'path': path, 'texture': texture.get_path_name() if texture else None})
        if isinstance(obj, unreal.LevelSequence):
            sequences.append({'path': path, 'bindings': [b.get_name() for b in obj.get_bindings()]})
    result[name] = {'actors': actors, 'textures': textures, 'sequences': sequences}
(PROJECT.parent.parent / 'receipts/bills-chart-source-inspection.json').write_text(json.dumps(result, indent=2) + '\n')
