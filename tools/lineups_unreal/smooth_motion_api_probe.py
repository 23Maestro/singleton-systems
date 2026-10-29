"""Read the current engine's native material and widget fade APIs."""
import json
from pathlib import Path
import unreal
out={}
for name in ['MovieSceneComponentMaterialTrack','ComponentMaterialInfo','MovieSceneParameterSection','MovieSceneColorTrack','MovieSceneFloatTrack','MaterialExpressionScalarParameter','WidgetComponent']:
 cls=getattr(unreal,name,None)
 out[name]={'doc':str(cls.__doc__) if cls else None,'methods':{n:str(getattr(cls,n).__doc__) for n in ['add_scalar_parameter_key','get_all_channels','set_material_index','set_material_info','set_tint_color_and_opacity','set_property_name_and_path'] if cls and hasattr(cls,n)}}
Path('/Volumes/UnrealSSD/Generated/CATENA_MEDIA_LINEUPS/source/unreal/receipts/smooth-motion-api-probe.json').write_text(json.dumps(out,indent=2))
unreal.EditorLoadingAndSavingUtils.save_dirty_packages(True,True)
