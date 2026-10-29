"""Remove flat cutout shadow seams without changing the approved layout."""
import json
from pathlib import Path
import unreal
ROOT='/Game/Lineups/ReviewV1'
world=unreal.get_editor_subsystem(unreal.UnrealEditorSubsystem).get_editor_world()
assert world.get_path_name().split('.')[0]==ROOT+'/LV_ComparisonReview'
actors={a.get_actor_label():a for a in unreal.get_editor_subsystem(unreal.EditorActorSubsystem).get_all_level_actors()}
for side in ['left','right']:actors['LineupsReview_'+side+'Player'].static_mesh_component.set_cast_shadow(False)
assert unreal.EditorLoadingAndSavingUtils.save_map(world,ROOT+'/LV_ComparisonReview')
p=Path('/Volumes/UnrealSSD/Generated/CATENA_MEDIA_LINEUPS/source/unreal/receipts/lineups-review-export.json')
r=json.loads(p.read_text());assert r['status']=='rendered'
r['previousRenders'].append({'output':r['output'],'status':'superseded-polish','reason':'Flat cutout shadow seams disabled; dimensional logo shadows retained.'})
r['status']='built';r['output']='/Volumes/HomeSSD/Generated/CATENA_MEDIA_LINEUPS/renders/unreal-comparison-review-v4'
p.write_text(json.dumps(r,indent=2)+'\n')
