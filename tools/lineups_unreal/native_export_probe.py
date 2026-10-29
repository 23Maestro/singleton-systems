"""Inspect native scene and render APIs before the Lineups export."""
import json
from pathlib import Path
import unreal

out = {'project': unreal.Paths.project_dir(), 'classes': {}, 'actors': []}
for name in ['MoviePipelineQueueSubsystem','MoviePipelinePIEExecutor','MoviePipelineOutputSetting','MoviePipelineDeferredPassBase','MoviePipelineImageSequenceOutput_PNG','MovieScene3DTransformTrack','Text3DActor','WidgetComponent','SubobjectDataSubsystem','AddNewSubobjectParams','SubobjectDataBlueprintFunctionLibrary','GeometryScriptLibrary_MeshPrimitiveFunctions']:
    cls = getattr(unreal, name, None)
    if cls:
        out['classes'][name] = {'doc': (cls.__doc__ or '')[:1800], 'methods': [x for x in dir(cls) if any(y in x.lower() for y in ['render','queue','component','widget','text','subobject','finished','executor','setting'])]}
for a in unreal.get_editor_subsystem(unreal.EditorActorSubsystem).get_all_level_actors():
    label = a.get_actor_label()
    if 'Camera' in label or label in ['Player_L','Player_R','Image_Player_L','Image_Player_R'] or label.startswith('RectLight'):
        out['actors'].append({'label': label, 'class': a.get_class().get_name(), 'path': a.get_path_name(), 'location': str(a.get_actor_location()), 'rotation': str(a.get_actor_rotation()), 'scale': str(a.get_actor_scale3d())})
        if isinstance(a, unreal.CineCameraActor):
            c = a.get_cine_camera_component()
            out['camera'] = {'focal': c.current_focal_length, 'filmback': str(c.filmback), 'ortho_width': c.ortho_width, 'projection_mode': str(c.projection_mode)}
Path('/Volumes/UnrealSSD/Generated/CATENA_MEDIA_LINEUPS/source/unreal/receipts/native-export-probe.json').write_text(json.dumps(out, indent=2))
unreal.log('LINEUPS_EXPORT_PROBE_PASSED')
