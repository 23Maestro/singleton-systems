"""Keep the backdrop full bleed for the whole camera push."""
import json
from pathlib import Path
import unreal
ROOT='/Game/Lineups/ReviewV1'
w=unreal.get_editor_subsystem(unreal.UnrealEditorSubsystem).get_editor_world()
assert w.get_path_name().split('.')[0]==ROOT+'/LV_ComparisonReview'
a=next(a for a in unreal.get_editor_subsystem(unreal.EditorActorSubsystem).get_all_level_actors() if a.get_actor_label()=='LineupsReview_Backdrop')
a.set_actor_scale3d(unreal.Vector(1,-1920*.109565*1.04,1080*.109565*1.04))
assert unreal.EditorLoadingAndSavingUtils.save_map(w,ROOT+'/LV_ComparisonReview')
p=Path('/Volumes/UnrealSSD/Generated/CATENA_MEDIA_LINEUPS/source/unreal/receipts/lineups-review-export.json')
r=json.loads(p.read_text());assert r['status']=='rendered'
r['previousRenders'].append({'output':r['output'],'status':'superseded-overscan','reason':'Backdrop overscan covers the start of the camera push.'})
r['status']='built';r['output']='/Volumes/HomeSSD/Generated/CATENA_MEDIA_LINEUPS/renders/unreal-comparison-review-v6';p.write_text(json.dumps(r,indent=2)+'\n')
