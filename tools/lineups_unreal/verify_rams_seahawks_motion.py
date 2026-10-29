"""Read native scene geometry and keys; reject movement after the reading hold."""
import json
import traceback
from pathlib import Path
import unreal
PROJECT=Path('/Volumes/UnrealSSD/Generated/CATENA_MEDIA_LINEUPS/source/unreal/projects/SportsBroadcastTrial58')
ROOT='/Game/Lineups/RamsSeahawksMotionV1'
proof=PROJECT.parent.parent/'receipts/rams-seahawks-motion-verified-v2.json'
r={'status':'checking','humanApproval':False}
try:
 assert Path(unreal.Paths.convert_relative_path_to_full(unreal.Paths.project_dir())).resolve()==PROJECT
 seq=unreal.load_asset(ROOT+'/LS_RamsSeahawks');assert unreal.EditorAssetLibrary.get_metadata_tag(seq,'LineupsOwner')=='lineups-rams-seahawks-motion-v1'
 assert seq.get_playback_end()==180
 holds={}
 for binding in seq.get_bindings():
  for track in binding.get_tracks():
   assert isinstance(track,unreal.MovieScene3DTransformTrack),'Only entrance transforms are allowed'
   for section in track.get_sections():
    for channel in section.get_all_channels():
     keys=sorted([(k.get_time().frame_number.value,k.get_value()) for k in channel.get_keys()])
     before=[v for f,v in keys if f<=60];after=[(f,v) for f,v in keys if f>60]
     assert before and after and all(abs(v-before[-1])<1e-5 for f,v in after),binding.get_name()
  holds[binding.get_name()]='static from frame 60 through 179'
 unreal.LevelSequenceEditorBlueprintLibrary.open_level_sequence(seq);unreal.LevelSequenceEditorBlueprintLibrary.set_current_time(90)
 aa={a.get_actor_label():a for a in unreal.get_editor_subsystem(unreal.EditorActorSubsystem).get_all_level_actors()}
 assert aa['Rams_Card'].static_mesh_component.static_mesh==aa['Seahawks_Card'].static_mesh_component.static_mesh
 readings={}
 for team,record,name in [('Rams','2–4','LOS ANGELES RAMS'),('Seahawks','3–3','SEATTLE SEAHAWKS')]:
  for suffix,copy in [('Record',record),('Name',name)]:
   a=aa[team+'_'+suffix];assert str(a.get_component_by_class(unreal.Text3DComponent).get_editor_property('text'))==copy
   assert a.get_attach_parent_actor()==aa[team+'_Card']
   center,e=a.get_actor_bounds(False);assert e.x*2<90
   if suffix=='Record':assert center.z-e.z>-27.3
   readings[a.get_actor_label()]={'text':copy,'extent':[e.x,e.y,e.z],'center':[center.x,center.y,center.z]}
  assert abs(aa[team+'_Logo'].get_actor_location().z-15)<.01
  assert aa[team+'_Logo'].get_attach_parent_actor()==aa[team+'_Card']
 for team in ['Rams','Seahawks']:
  shadow=aa[team+'_TurfContactShadow'];assert shadow.get_attach_parent_actor()==aa[team+'_Card']
  assert abs(shadow.get_actor_location().z+44.72)<.01
 assert not any(b.get_name() in ['VS','VS_Opacity'] for b in seq.get_bindings())
 fade=aa['VS_Fade'];assert abs(fade.get_actor_location().x)<.001
 tracks=[t for t in seq.get_tracks() if isinstance(t,unreal.MovieSceneMaterialParameterCollectionTrack)];assert len(tracks)==1
 keys=[(k.get_time().frame_number.value,k.get_value()) for section in tracks[0].get_sections() for ch in section.get_all_channels() for k in ch.get_keys()]
 assert keys==[(0,0.),(60,0.),(75,1.),(179,1.)],keys
 r.update(status='verified',stationaryVS=True,vsFadeFrames=[60,75],cardBoundTurfShadows=True,holdKeys=holds,animationOut=False,text=readings,sharedCardMesh=True,logoHorizontalPlane=True)
except Exception:r.update(status='failed',error=traceback.format_exc());raise
finally:proof.write_text(json.dumps(r,indent=2)+'\n')
