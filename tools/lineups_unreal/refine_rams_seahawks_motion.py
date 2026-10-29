"""Correct native text orientation and preserve breathing room above records."""
import json
from pathlib import Path
import unreal
ROOT='/Game/Lineups/RamsSeahawksMotionV1'
PROJECT=Path('/Volumes/UnrealSSD/Generated/CATENA_MEDIA_LINEUPS/source/unreal/projects/SportsBroadcastTrial58')
assert Path(unreal.Paths.convert_relative_path_to_full(unreal.Paths.project_dir())).resolve()==PROJECT
seq=unreal.load_asset(ROOT+'/LS_RamsSeahawks');assert unreal.EditorAssetLibrary.get_metadata_tag(seq,'LineupsOwner')=='lineups-rams-seahawks-motion-v1'
unreal.LevelSequenceEditorBlueprintLibrary.close_level_sequence()
world=unreal.get_editor_subsystem(unreal.UnrealEditorSubsystem).get_editor_world();assert world.get_path_name().split('.')[0]==ROOT+'/LV_RamsSeahawks'
aa={a.get_actor_label():a for a in unreal.get_editor_subsystem(unreal.EditorActorSubsystem).get_all_level_actors()}
for team,x in [('Rams',-64),('Seahawks',64)]:
 for suffix,z in [('Record',-19.5),('Name',-36.6)]:
  a=aa[team+'_'+suffix];a.set_actor_rotation(unreal.Rotator(yaw=-90),False)
  origin,extent=a.get_actor_bounds(False);a.set_actor_location(a.get_actor_location()+(unreal.Vector(x,5,z)-origin),False,False)
 a=aa[team+'_Logo'];a.set_actor_location(unreal.Vector(x,4,15),False,False);scale=.70 if team=='Rams' else .82;a.set_actor_scale3d(unreal.Vector(scale,scale,scale))
aa['VS'].set_actor_rotation(unreal.Rotator(yaw=-90),False)
for binding in seq.get_bindings():
 if binding.get_name()=='VS':
  for track in binding.get_tracks():
   if isinstance(track,unreal.MovieScene3DTransformTrack):
    for section in track.get_sections():
     for key in section.get_all_channels()[5].get_keys():key.set_value(-90.)
unreal.EditorAssetLibrary.save_loaded_asset(seq)
aa['Stadium_Backdrop'].set_actor_scale3d(unreal.Vector(1,-400,225))
assert unreal.EditorLoadingAndSavingUtils.save_map(world,ROOT+'/LV_RamsSeahawks')
Path(PROJECT.parent.parent/'receipts/rams-seahawks-refine-v1.json').write_text(json.dumps({'status':'saved','textOrientation':'yaw -90','logoCentersZ':15,'recordCentersZ':-19.5,'animationOut':False})+'\n')
