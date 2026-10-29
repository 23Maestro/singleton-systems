"""Apply verified native rotation/handedness and lighting fixes to review V1."""
import json
from pathlib import Path
import unreal
ROOT='/Game/Lineups/ReviewV1'
seq=unreal.load_asset(ROOT+'/LS_ComparisonReview')
actors={a.get_actor_label():a for a in unreal.get_editor_subsystem(unreal.EditorActorSubsystem).get_all_level_actors()}
for suffix in ['Backdrop','leftPlayer','rightPlayer','leftLogo','rightLogo']:
 a=actors['LineupsReview_'+suffix];s=a.get_actor_scale3d();s.y=-abs(s.y);a.set_actor_scale3d(s)
for suffix in ['Titles','Card']:
 actors['LineupsReview_'+suffix].set_actor_rotation(unreal.Rotator(pitch=0,yaw=180,roll=0),False)
for b in seq.get_bindings():
 for t in b.get_tracks():
  if not isinstance(t,unreal.MovieScene3DTransformTrack):continue
  for s in t.get_sections():
   ch=s.get_all_channels()
   if str(b.get_name())=='LineupsReview_Card':
    for idx,value in [(3,0),(4,0),(5,180)]:
     for k in ch[idx].get_keys():k.set_value(value)
   if 'Player' in str(b.get_name()):
    for k in ch[7].get_keys():k.set_value(-abs(k.get_value()))
specs={'RectLight_2_EdgeLight_L':(0,55,0,22), 'RectLight_2_EdgeLight_R':(0,-55,0,22), 'RectLight_1_Logo_Bottom':(45,0,0,4.5), 'RectLight_0_Ambient_Straight':(-35,0,0,15)}
for label,(p,y,r,power) in specs.items():
 a=actors['LineupsReview_'+label];a.set_actor_rotation(unreal.Rotator(pitch=p,yaw=y,roll=r),False)
 a.get_component_by_class(unreal.LightComponent).set_intensity(power)
cc=actors['LineupsReview_Camera'].get_cine_camera_component()
pp=cc.post_process_settings;pp.override_bloom_intensity=True;pp.bloom_intensity=.1;cc.post_process_settings=pp
unreal.EditorAssetLibrary.save_loaded_asset(seq)
world=unreal.get_editor_subsystem(unreal.UnrealEditorSubsystem).get_editor_world()
assert unreal.EditorLoadingAndSavingUtils.save_map(world,ROOT+'/LV_ComparisonReview')
unreal.LevelSequenceEditorBlueprintLibrary.set_current_time(100)
p=Path('/Volumes/UnrealSSD/Generated/CATENA_MEDIA_LINEUPS/source/unreal/receipts/lineups-review-export.json')
r=json.loads(p.read_text());r['status']='built';r['previousRenders']=r.get('previousRenders',[])+[{'output':r['output'],'status':'superseded-visual-errors','reason':'Native positional rotator order and OBJ handedness corrected; lighting retuned.'}]
r['output']='/Volumes/HomeSSD/Generated/CATENA_MEDIA_LINEUPS/renders/unreal-comparison-review-v2'
p.write_text(json.dumps(r,indent=2)+'\n')
unreal.log('LINEUPS_REVIEW_REFINED')
