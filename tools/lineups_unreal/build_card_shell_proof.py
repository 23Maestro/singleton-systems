"""Native engineering still: one imported mesh, two replaceable color palettes."""
import json
import traceback
from pathlib import Path
import unreal

PROJECT = Path('/Volumes/UnrealSSD/Generated/CATENA_MEDIA_LINEUPS/source/unreal/projects/SportsBroadcastTrial58')
ROOT = '/Game/Lineups/TeamCardShellV1'
MAP, SEQ = ROOT+'/LV_CardShellProof', ROOT+'/LS_CardShellProof'
RECEIPT = PROJECT.parent.parent/'receipts/card-shell-proof-v1.json'
OUTPUT = Path('/Volumes/HomeSSD/Generated/CATENA_MEDIA_LINEUPS/renders/team-card-shell-three-v1')
state = {'status':'building', 'map':MAP, 'sequence':SEQ, 'output':str(OUTPUT), 'visualApproval':False, 'engineeringStillOnly':True, 'animationOut':False}
def save(): RECEIPT.write_text(json.dumps(state,indent=2)+'\n')
def spawn(cls,name,location,rotation=unreal.Rotator()):
    actor=unreal.get_editor_subsystem(unreal.EditorActorSubsystem).spawn_actor_from_class(cls,location,rotation)
    actor.set_actor_label(name)
    return actor
def color(h):
    v=[int(h[i:i+2],16)/255 for i in (1,3,5)]
    return unreal.LinearColor(*[(c/12.92 if c<=.04045 else ((c+.055)/1.055)**2.4) for c in v],1)
def finished(executor,success):
    state.update(status='rendered' if success else 'failed', nativeRenderSuccess=bool(success), frames=[str(p) for p in OUTPUT.rglob('*.png')]);save()
def error(executor,pipeline,fatal,message):
    state.setdefault('errors',[]).append({'fatal':bool(fatal),'message':str(message)});save()
try:
    assert Path(unreal.Paths.convert_relative_path_to_full(unreal.Paths.project_dir())).resolve()==PROJECT
    assert OUTPUT.parent.is_dir()
    if unreal.EditorAssetLibrary.does_asset_exist(SEQ):
        raise RuntimeError('Preserve existing proof; choose a new version')
    unreal.LevelSequenceEditorBlueprintLibrary.close_level_sequence()
    unreal.get_editor_subsystem(unreal.LevelEditorSubsystem).save_current_level()
    if not unreal.EditorAssetLibrary.does_asset_exist(MAP):
        assert unreal.EditorLevelLibrary.new_level(MAP)
    world=unreal.get_editor_subsystem(unreal.UnrealEditorSubsystem).get_editor_world()
    assert world.get_path_name().split('.')[0]==MAP
    del world
    actor_sub=unreal.get_editor_subsystem(unreal.EditorActorSubsystem)
    for existing in actor_sub.get_all_level_actors():
        if existing.get_actor_label().startswith(('CardShell_', 'ShellLight_', 'ShellCamera')):
            actor_sub.destroy_actor(existing)
    imported=json.loads((PROJECT.parent.parent/'receipts/card-shell-import-v1.json').read_text())
    assert imported['status']=='imported'
    mesh=unreal.load_asset(imported['meshes'][0]['path'])
    actors=[]
    tools=unreal.AssetToolsHelpers.get_asset_tools()
    for name,x,palette in [('Rams',-64,{'TeamPanel':'#003594','RaisedStripe':'#002771','TeamAccent':'#FFD100'}),('Seahawks',64,{'TeamPanel':'#002244','RaisedStripe':'#001831','TeamAccent':'#69BE28'})]:
        a=spawn(unreal.StaticMeshActor,'CardShell_'+name,unreal.Vector(x,0,0))
        c=a.static_mesh_component;c.set_static_mesh(mesh)
        for i,slot in enumerate(mesh.static_materials):
            slot_name=str(slot.material_slot_name)
            if slot_name in palette:
                material_name='MI_'+name+'_'+slot_name
                m=unreal.load_asset(ROOT+'/Palettes/'+material_name) or tools.duplicate_asset(material_name,ROOT+'/Palettes',slot.material_interface)
                assert m
                unreal.MaterialEditingLibrary.set_material_instance_vector_parameter_value(m,'BaseColorFactor',color(palette[slot_name]))
                actual=unreal.MaterialEditingLibrary.get_material_instance_vector_parameter_value(m,'BaseColorFactor')
                assert all(abs(getattr(actual,k)-getattr(color(palette[slot_name]),k))<.001 for k in ['r','g','b'])
                if slot_name in ['TeamPanel','RaisedStripe']:
                    for parameter,value in [('MetallicFactor',.15),('RoughnessFactor',.56),('NormalScale',.035)]:
                        unreal.MaterialEditingLibrary.set_material_instance_scalar_parameter_value(m,parameter,value)
                unreal.EditorAssetLibrary.save_loaded_asset(m);c.set_material(i,m)
        actors.append({'label':a.get_actor_label(),'mesh':c.static_mesh.get_path_name(),'materials':[c.get_material(i).get_path_name() for i in range(c.get_num_materials())]})
    for name,loc,power,size in [('Key',(-95,125,100),1.8,110),('Fill',(110,100,35),.9,100),('Top',(0,60,140),1.4,130)]:
        location=unreal.Vector(*loc)
        light=spawn(unreal.RectLight,'ShellLight_'+name,location,unreal.MathLibrary.find_look_at_rotation(location,unreal.Vector()))
        lc=light.get_component_by_class(unreal.RectLightComponent);lc.set_intensity(power);lc.set_editor_property('source_width',float(size));lc.set_editor_property('source_height',float(size))
    camera=spawn(unreal.CineCameraActor,'ShellCamera',unreal.Vector(0,325,6),unreal.Rotator(pitch=0,yaw=-90,roll=0))
    cc=camera.get_cine_camera_component();cc.filmback=unreal.CameraFilmbackSettings(sensor_width=36,sensor_height=20.25);cc.current_focal_length=35
    focus=cc.focus_settings;focus.focus_method=unreal.CameraFocusMethod.DISABLE;cc.focus_settings=focus
    pp=cc.post_process_settings;pp.override_motion_blur_amount=True;pp.motion_blur_amount=0;pp.override_auto_exposure_method=True;pp.auto_exposure_method=unreal.AutoExposureMethod.AEM_MANUAL;pp.override_auto_exposure_apply_physical_camera_exposure=True;pp.auto_exposure_apply_physical_camera_exposure=False;pp.override_bloom_intensity=True;pp.bloom_intensity=.05;cc.post_process_settings=pp
    seq=tools.create_asset('LS_CardShellProof',ROOT,unreal.LevelSequence,unreal.LevelSequenceFactoryNew());seq.set_display_rate(unreal.FrameRate(30,1));seq.set_playback_start(0);seq.set_playback_end(1)
    binding=seq.add_possessable(camera);cut=seq.add_track(unreal.MovieSceneCameraCutTrack).add_section();cut.set_range(0,1);bid=unreal.MovieSceneObjectBindingID();bid.set_editor_property('guid',binding.get_id());cut.set_camera_binding_id(bid)
    unreal.EditorAssetLibrary.set_metadata_tag(seq,'LineupsOwner','lineups-card-shell-proof-v1');unreal.EditorAssetLibrary.save_loaded_asset(seq)
    assert unreal.EditorLoadingAndSavingUtils.save_map(unreal.get_editor_subsystem(unreal.UnrealEditorSubsystem).get_editor_world(),MAP)
    state.update(status='built',actors=actors);save()
    queue=unreal.MoviePipelineQueue();job=queue.allocate_new_job(unreal.MoviePipelineExecutorJob);job.job_name='CardShellProof';job.map=unreal.SoftObjectPath(MAP);job.sequence=unreal.SoftObjectPath(SEQ)
    cfg=job.get_configuration();out=cfg.find_or_add_setting_by_class(unreal.MoviePipelineOutputSetting);out.output_directory=unreal.DirectoryPath(str(OUTPUT));out.file_name_format='CardShellProof.{frame_number_rel}';out.output_resolution=unreal.IntPoint(1920,1080);out.use_custom_frame_rate=True;out.output_frame_rate=unreal.FrameRate(30,1);out.auto_version=False
    cfg.find_or_add_setting_by_class(unreal.MoviePipelineDeferredPassBase);cfg.find_or_add_setting_by_class(unreal.MoviePipelineImageSequenceOutput_PNG)
    aa=cfg.find_or_add_setting_by_class(unreal.MoviePipelineAntiAliasingSetting);aa.spatial_sample_count=4;aa.temporal_sample_count=1;aa.engine_warm_up_count=24;aa.render_warm_up_count=8
    cfg.find_or_add_setting_by_class(unreal.MoviePipelineGameOverrideSetting).game_mode_override=unreal.MoviePipelineGameMode
    executor=unreal.MoviePipelinePIEExecutor();executor.set_is_rendering_offscreen(True);executor.on_executor_finished_delegate.add_callable_unique(finished);executor.on_executor_errored_delegate.add_callable_unique(error)
    unreal._shell_proof_queue,unreal._shell_proof_executor=queue,executor
    state['status']='rendering';save();unreal.get_editor_subsystem(unreal.MoviePipelineQueueSubsystem).render_queue_instance_with_executor_instance(queue,executor)
except Exception:
    state.update(status='failed',error=traceback.format_exc());save();raise
