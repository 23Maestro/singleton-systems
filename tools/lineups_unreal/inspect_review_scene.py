"""Read back review geometry, camera and native rotation conventions."""
import json
from pathlib import Path
import unreal
out={'rotatorDoc':unreal.Rotator.__doc__,'examples':[str(unreal.Rotator(0,180,0)),str(unreal.Rotator(pitch=0,yaw=180,roll=0))],'actors':[]}
for a in unreal.get_editor_subsystem(unreal.EditorActorSubsystem).get_all_level_actors():
 if not a.get_actor_label().startswith('LineupsReview_'):continue
 r={'name':a.get_actor_label(),'rotation':str(a.get_actor_rotation()),'location':str(a.get_actor_location()),'scale':str(a.get_actor_scale3d())}
 if isinstance(a,unreal.CineCameraActor):r['pp']=str(a.get_cine_camera_component().post_process_settings)
 out['actors'].append(r)
Path('/Volumes/UnrealSSD/Generated/CATENA_MEDIA_LINEUPS/source/unreal/receipts/review-scene-inspect.json').write_text(json.dumps(out,indent=2))
