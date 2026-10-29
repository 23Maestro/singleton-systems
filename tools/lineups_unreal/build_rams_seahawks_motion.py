"""Assemble a new paired-logo review scene; never edit approved player masters."""
import hashlib
import json
import sys
import traceback
from pathlib import Path
import unreal

REPO=Path('/Users/singleton23/Documents/Development/singleton-systems')
sys.path.insert(0,str(REPO/'tools/lineups_unreal'))
import editor_scene
import build_review_export as native
PROJECT=native.PROJECT
ROOT='/Game/Lineups/RamsSeahawksMotionV1'
MAP,SEQ=ROOT+'/LV_RamsSeahawks',ROOT+'/LS_RamsSeahawks'
RECEIPT=PROJECT.parent.parent/'receipts/rams-seahawks-motion-build-v1.json'
SOURCE=Path('/Volumes/HomeSSD/Generated/CATENA_MEDIA_LINEUPS/source')
END,FPS,HOLD=180,30,60
state={'status':'building','map':MAP,'sequence':SEQ,'animationOut':False,'holdFromFrame':HOLD,'frameCount':END,'fps':FPS,'editorialTimingApproved':False,'visualReviewOnly':True}
actors=[]
texts=[]
def save():RECEIPT.write_text(json.dumps(state,indent=2)+'\n')
def spawn(cls,label,loc=unreal.Vector(),rot=unreal.Rotator()):
 a=native.spawn(cls,label,loc,rot);actors.append(a);return a
def record(p):return {'path':str(p),'sha256':hashlib.sha256(p.read_bytes()).hexdigest()}
def import_logo(name):
 manifest=json.loads((SOURCE/'rams-seahawks-vector-logos-v1/manifest.json').read_text());r=manifest[name];assert hashlib.sha256(Path(r['path']).read_bytes()).hexdigest()==r['sha256']
 folder=ROOT+'/Logos/'+name
 paths=unreal.EditorAssetLibrary.list_assets(folder,recursive=True)
 if not paths:
  task=unreal.AssetImportTask()
  for k,v in dict(filename=r['path'],destination_path=folder,automated=True,save=True,replace_existing=False).items():task.set_editor_property(k,v)
  unreal.AssetToolsHelpers.get_asset_tools().import_asset_tasks([task])
 meshes=[unreal.load_asset(p) for p in unreal.EditorAssetLibrary.list_assets(folder,recursive=True)]
 meshes=[m for m in meshes if isinstance(m,unreal.StaticMesh)]
 assert len(meshes)==1;return meshes[0]
def attach(a,parent):
 a.attach_to_actor(parent,'',unreal.AttachmentRule.KEEP_WORLD,unreal.AttachmentRule.KEEP_WORLD,unreal.AttachmentRule.KEEP_WORLD,False)
def text(label,copy,x,z,width,height):
 a=spawn(unreal.Text3DActor,label,unreal.Vector(x,5,z),unreal.Rotator(yaw=-90))
 c=a.get_component_by_class(unreal.Text3DComponent)
 c.set_editor_property('font',unreal.load_asset('/Game/Lineups/ReviewV1/Widgets/Fonts/c6d5e1a6d369/BebasBoldSaved_Font'))
 c.set_editor_property('font_size',18.0);c.set_editor_property('text',copy)
 editor_scene.set_values(c.get_editor_property('layout_extension'),{'horizontalAlignment':'Center','verticalAlignment':'Center'})
 editor_scene.set_values(c.get_editor_property('geometry_extension'),{'extrude':.12,'bevel':.05,'bevelSegments':3})
 color={'r':.92,'g':.94,'b':.98,'a':1.}
 editor_scene.set_values(c.get_editor_property('material_extension'),{'style':'Solid','frontColor':color,'bevelColor':color,'extrudeColor':{'r':.25,'g':.28,'b':.32,'a':1.},'bIsUnlit':True})
 texts.append((a,width,height,unreal.Vector(x,5,z),copy));return a
def key(seq,a,begin,duration,start,final,start_yaw=0):
 b=seq.add_possessable(a);s=b.add_track(unreal.MovieScene3DTransformTrack).add_section();s.set_range(0,END);channels=s.get_all_channels();sc=a.get_actor_scale3d();rot=a.get_actor_rotation()
 for frame in sorted(set([0,END-1,*range(begin,begin+duration+1)])):
  t=min(1,max(0,(frame-begin)/duration));u=1-(1-t)**3
  loc=start+(final-start)*u
  vals=[loc.x,loc.y,loc.z,rot.roll,rot.pitch,rot.yaw+start_yaw*(1-u),sc.x,sc.y,sc.z]
  for ch,val in zip(channels,vals):ch.add_key(unreal.FrameNumber(frame),val,interpolation=unreal.MovieSceneKeyInterpolation.LINEAR)
 return b
def finish_layout(dt):
 global ticks
 ticks+=1
 if ticks<25:return
 try:
  for a,w,h,center,copy in texts:
   origin,e=a.get_actor_bounds(False)
   if e.x<.01 or e.z<.01:
    if ticks<200:return
    raise RuntimeError('Text geometry did not build: '+copy)
  unreal.unregister_slate_post_tick_callback(unreal._rams_layout_tick)
  for a,w,h,center,copy in texts:
   origin,e=a.get_actor_bounds(False);factor=min(w/(e.x*2),h/(e.z*2));a.set_actor_scale3d(unreal.Vector(factor,factor,factor))
   origin,e=a.get_actor_bounds(False);a.set_actor_location(a.get_actor_location()+(center-origin),False,False)
  # Attach only after text sizing. Each assembled card enters as one solid object.
  for a in actors:
   label=a.get_actor_label()
   for team in ['Rams','Seahawks']:
    if label.startswith(team+'_') and label!=team+'_Card':attach(a,roots[team])
  seq=unreal.AssetToolsHelpers.get_asset_tools().create_asset('LS_RamsSeahawks',ROOT,unreal.LevelSequence,unreal.LevelSequenceFactoryNew());seq.set_display_rate(unreal.FrameRate(FPS,1));seq.set_playback_start(0);seq.set_playback_end(END)
  for team,sign,begin in [('Rams',-1,0),('Seahawks',1,4)]:
   a=roots[team];final=a.get_actor_location();key(seq,a,begin,40,unreal.Vector(sign*205,-14,-4),final,sign*8)
  key(seq,vs,24,24,unreal.Vector(0,7,-2),unreal.Vector(0,7,1))
  camera_binding=key(seq,camera,0,HOLD,unreal.Vector(0,261,-3),unreal.Vector(0,253,-3))
  cut=seq.add_track(unreal.MovieSceneCameraCutTrack).add_section();cut.set_range(0,END);bid=unreal.MovieSceneObjectBindingID();bid.set_editor_property('guid',camera_binding.get_id());cut.set_camera_binding_id(bid)
  unreal.EditorAssetLibrary.set_metadata_tag(seq,'LineupsOwner','lineups-rams-seahawks-motion-v1');unreal.EditorAssetLibrary.set_metadata_tag(seq,'LineupsTiming','review-only; static after frame60; no animation out; Mark/Manim timing required for episode')
  unreal.EditorAssetLibrary.save_loaded_asset(seq)
  assert unreal.EditorLoadingAndSavingUtils.save_map(unreal.get_editor_subsystem(unreal.UnrealEditorSubsystem).get_editor_world(),MAP)
  unreal.LevelSequenceEditorBlueprintLibrary.open_level_sequence(seq);unreal.LevelSequenceEditorBlueprintLibrary.set_current_time(90)
  state.update(status='built',text=[{'label':a.get_actor_label(),'copy':copy,'bounds':str(a.get_actor_bounds(False))} for a,w,h,c,copy in texts],actors=[a.get_actor_label() for a in actors]);save()
 except Exception:
  state.update(status='failed',error=traceback.format_exc());save();raise
try:
 assert Path(unreal.Paths.convert_relative_path_to_full(unreal.Paths.project_dir())).resolve()==PROJECT
 if unreal.EditorAssetLibrary.does_asset_exist(MAP) or unreal.EditorAssetLibrary.does_asset_exist(SEQ):raise RuntimeError('Preserve existing motion scene; choose a new version')
 unreal.LevelSequenceEditorBlueprintLibrary.close_level_sequence();unreal.get_editor_subsystem(unreal.LevelEditorSubsystem).save_current_level()
 assert unreal.EditorLevelLibrary.new_level(MAP)
 native.ROOT=ROOT
 mesh=unreal.load_asset('/Game/Lineups/TeamCardShellV1/Imported/TeamCardShell/StaticMeshes/TeamCardShell')
 roots={}
 for name,x in [('Rams',-64),('Seahawks',64)]:
  a=spawn(unreal.StaticMeshActor,name+'_Card',unreal.Vector(x,0,0));c=a.static_mesh_component;c.set_static_mesh(mesh);c.set_mobility(unreal.ComponentMobility.MOVABLE)
  for i,slot in enumerate(mesh.static_materials):
   if str(slot.material_slot_name) in ['TeamPanel','RaisedStripe','TeamAccent']:
    c.set_material(i,unreal.load_asset('/Game/Lineups/TeamCardShellV1/Palettes/MI_'+name+'_'+str(slot.material_slot_name)))
  roots[name]=a
  logo=spawn(unreal.StaticMeshActor,name+'_Logo',unreal.Vector(x,4,15));logo.static_mesh_component.set_static_mesh(import_logo(name));logo.static_mesh_component.set_mobility(unreal.ComponentMobility.MOVABLE)
  logo.set_actor_scale3d(unreal.Vector(*([.70 if name=='Rams' else .82]*3)))
  text(name+'_Record','2–4' if name=='Rams' else '3–3',x,-19.5,40,12)
  text(name+'_Name','LOS ANGELES RAMS' if name=='Rams' else 'SEATTLE SEAHAWKS',x,-36.6,87,9)
 vs=text('VS','VS',0,1,14,19)
 # Native quad faces local X. Yaw -90 puts image-right along world +X.
 tex=editor_scene.import_texture('Stadium',record(SOURCE/'team-logo-cards/rams-seahawks-stadium-dry-v2.png'),ROOT)
 bgmat=native.material('M_Stadium',tex,(.62,.62,.62),unlit=True)
 quad=unreal.load_asset('/Game/Lineups/ReviewV1/Meshes/SM_ReviewQuad')
 bg=spawn(unreal.StaticMeshActor,'Stadium_Backdrop',unreal.Vector(0,-110,0),unreal.Rotator(yaw=-90));bg.static_mesh_component.set_static_mesh(quad);bg.static_mesh_component.set_material(0,bgmat);bg.static_mesh_component.set_cast_shadow(False);bg.set_actor_scale3d(unreal.Vector(1,-400,225))
 for name,loc,power,size,col in [('Key',(-95,125,100),1.8,110,(1,1,1)),('Fill',(110,100,35),.9,100,(1,1,1)),('Top',(0,60,140),1.4,130,(1,1,1)),('Blue',(-135,40,30),.6,50,(.02,.15,1)),('Green',(135,40,30),.6,50,(.25,1,.02))]:
  v=unreal.Vector(*loc);light=spawn(unreal.RectLight,'CardLight_'+name,v,unreal.MathLibrary.find_look_at_rotation(v,unreal.Vector()))
  lc=light.get_component_by_class(unreal.RectLightComponent);lc.set_intensity(power);lc.set_light_color(unreal.LinearColor(*col,1),False);lc.set_editor_property('source_width',float(size));lc.set_editor_property('source_height',float(size))
 camera=spawn(unreal.CineCameraActor,'RamsSeahawks_Camera',unreal.Vector(0,253,-3),unreal.Rotator(yaw=-90))
 cc=camera.get_cine_camera_component();cc.filmback=unreal.CameraFilmbackSettings(sensor_width=36,sensor_height=20.25);cc.current_focal_length=35
 focus=cc.focus_settings;focus.focus_method=unreal.CameraFocusMethod.DISABLE;cc.focus_settings=focus
 pp=cc.post_process_settings;pp.override_motion_blur_amount=True;pp.motion_blur_amount=0;pp.override_auto_exposure_method=True;pp.auto_exposure_method=unreal.AutoExposureMethod.AEM_MANUAL;pp.override_auto_exposure_apply_physical_camera_exposure=True;pp.auto_exposure_apply_physical_camera_exposure=False;pp.override_bloom_intensity=True;pp.bloom_intensity=.08;cc.post_process_settings=pp
 ticks=0;unreal._rams_layout_tick=unreal.register_slate_post_tick_callback(finish_layout);state['status']='waiting-for-text';save()
except Exception:
 state.update(status='failed',error=traceback.format_exc());save();raise
