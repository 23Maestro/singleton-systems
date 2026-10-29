"""Keep the card clear of both nameplates throughout its entrance."""
import json
from pathlib import Path
import unreal
ROOT='/Game/Lineups/ReviewV1'
world=unreal.get_editor_subsystem(unreal.UnrealEditorSubsystem).get_editor_world()
assert world.get_path_name().split('.')[0]==ROOT+'/LV_ComparisonReview'
seq=unreal.load_asset(ROOT+'/LS_ComparisonReview')
final_z={'LineupsReview_Card':0.,'LineupsReview_CardBody':-(752.5-540)*(230-29.2)/230*.1}
count=0
for b in seq.get_bindings():
 name=str(b.get_name())
 if name not in final_z:continue
 for t in b.get_tracks():
  if not isinstance(t,unreal.MovieScene3DTransformTrack):continue
  for s in t.get_sections():
   for k in s.get_all_channels()[2].get_keys():
    frame=k.get_time().frame_number.value
    k.set_value(final_z[name]+(2 if frame in (0,33) else .2 if frame==43 else 0));count+=1
assert count==10,count
assert unreal.EditorAssetLibrary.save_loaded_asset(seq)
unreal.LevelSequenceEditorBlueprintLibrary.set_current_time(100)
p=Path('/Volumes/UnrealSSD/Generated/CATENA_MEDIA_LINEUPS/source/unreal/receipts/lineups-review-export.json')
r=json.loads(p.read_text());assert r['status']=='rendered'
r['previousRenders'].append({'output':r['output'],'status':'superseded-spacing','reason':'Card enters from above so the bottom corners remain clear of both nameplates.'})
r['status']='built';r['output']='/Volumes/HomeSSD/Generated/CATENA_MEDIA_LINEUPS/renders/unreal-comparison-review-v5'
p.write_text(json.dumps(r,indent=2)+'\n')
