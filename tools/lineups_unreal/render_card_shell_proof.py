"""Native engineering still: one imported mesh, two replaceable color palettes."""
import json
import traceback
from pathlib import Path
import unreal

PROJECT = Path('/Volumes/UnrealSSD/Generated/CATENA_MEDIA_LINEUPS/source/unreal/projects/SportsBroadcastTrial58')
ROOT = '/Game/Lineups/TeamCardShellV1'
MAP, SEQ = ROOT+'/LV_CardShellProof', ROOT+'/LS_CardShellProof'
RECEIPT = PROJECT.parent.parent/'receipts/card-shell-proof-v4.json'
OUTPUT = Path('/Volumes/HomeSSD/Generated/CATENA_MEDIA_LINEUPS/renders/team-card-shell-three-v4')
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
    world=unreal.get_editor_subsystem(unreal.UnrealEditorSubsystem).get_editor_world()
    assert world.get_path_name().split('.')[0]==MAP
    for actor in unreal.get_editor_subsystem(unreal.EditorActorSubsystem).get_all_level_actors():
        if actor.get_actor_label().startswith('ShellLight_'):
            lc=actor.get_component_by_class(unreal.RectLightComponent)
            lc.set_intensity({'ShellLight_Key':1.8,'ShellLight_Fill':.9,'ShellLight_Top':1.4}[actor.get_actor_label()])
    for team in ['Rams','Seahawks']:
        for slot in ['TeamPanel','RaisedStripe']:
            material=unreal.load_asset(ROOT+'/Palettes/MI_'+team+'_'+slot)
            unreal.MaterialEditingLibrary.set_material_instance_scalar_parameter_value(material,'MetallicFactor',.15)
            unreal.MaterialEditingLibrary.set_material_instance_scalar_parameter_value(material,'RoughnessFactor',.56)
            unreal.MaterialEditingLibrary.set_material_instance_scalar_parameter_value(material,'NormalScale',.035)
            unreal.EditorAssetLibrary.save_loaded_asset(material)
    assert unreal.EditorLoadingAndSavingUtils.save_map(world,MAP)
    del world
    if OUTPUT.exists() and list(OUTPUT.rglob('*.png')):
        raise RuntimeError('Preserve existing render')
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
