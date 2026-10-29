"""Read exact native APIs needed by the export builder."""
import json
from pathlib import Path
import unreal
names = {
'SubobjectDataBlueprintFunctionLibrary':['get_data','get_object','get_object_for_blueprint'],
'SubobjectDataSubsystem':['add_new_subobject','k2_gather_subobject_data_for_instance'],
'WidgetComponent':['set_widget_class','set_draw_size','set_edit_time_usable','set_two_sided'],
'MoviePipelineQueueSubsystem':['render_queue_instance_with_executor_instance'],
'MoviePipelineQueue':['allocate_new_job'],
'MovieSceneScriptingDoubleChannel':['add_key'],
'MovieSceneCameraCutSection':['set_camera_binding_id'],
'EditorLoadingAndSavingUtils':['save_map'],
}
out={}
for cls,methods in names.items():
 obj=getattr(unreal,cls,None)
 out[cls]={m:getattr(obj,m).__doc__ if obj and hasattr(obj,m) else None for m in methods}
out['subobject_functions']=dir(unreal.SubobjectDataBlueprintFunctionLibrary)
out['widgetprops']=unreal.WidgetComponent.__doc__
out['meshImport']=unreal.FbxStaticMeshImportData.__doc__
Path('/Volumes/UnrealSSD/Generated/CATENA_MEDIA_LINEUPS/source/unreal/receipts/export-api-probe.json').write_text(json.dumps(out,indent=2))
