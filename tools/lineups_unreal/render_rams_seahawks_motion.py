"""Render the owned Rams-Seahawks scene; request selects a still or motion proof."""
import json
import traceback
from pathlib import Path
import unreal
PROJECT=Path('/Volumes/UnrealSSD/Generated/CATENA_MEDIA_LINEUPS/source/unreal/projects/SportsBroadcastTrial58')
RECEIPTS=PROJECT.parent.parent/'receipts'
request=json.loads((RECEIPTS/'rams-seahawks-render-request.json').read_text())
assert request['mode'] in ['still','motion']
output=Path(request['output']);assert output.resolve().is_relative_to(Path('/Volumes/HomeSSD/Generated/CATENA_MEDIA_LINEUPS/renders'))
proof=RECEIPTS/request['receipt'];assert Path(request['receipt']).name==request['receipt']
ROOT='/Game/Lineups/RamsSeahawksMotionV1'
state={**request,'status':'starting','errors':[],'animationOut':False,'editorialTimingApproved':False}
def save():proof.write_text(json.dumps(state,indent=2)+'\n')
def failed(executor,pipeline,fatal,message):state['errors'].append({'fatal':bool(fatal),'message':str(message)});save()
def finished(executor,success):state.update(status='rendered' if success else 'failed',nativeRenderSuccess=bool(success),frameCount=len(list(output.rglob('*.png'))));save()
try:
 assert Path(unreal.Paths.convert_relative_path_to_full(unreal.Paths.project_dir())).resolve()==PROJECT
 if output.exists() and list(output.rglob('*.png')):raise RuntimeError('Preserve existing frames; choose a new version')
 seq=unreal.load_asset(ROOT+'/LS_RamsSeahawks');assert unreal.EditorAssetLibrary.get_metadata_tag(seq,'LineupsOwner')=='lineups-rams-seahawks-motion-v1'
 queue=unreal.MoviePipelineQueue();job=queue.allocate_new_job(unreal.MoviePipelineExecutorJob);job.job_name='RamsSeahawks';job.map=unreal.SoftObjectPath(ROOT+'/LV_RamsSeahawks');job.sequence=unreal.SoftObjectPath(ROOT+'/LS_RamsSeahawks')
 cfg=job.get_configuration();out=cfg.find_or_add_setting_by_class(unreal.MoviePipelineOutputSetting);out.output_directory=unreal.DirectoryPath(str(output));out.file_name_format='RamsSeahawks.{frame_number_rel}';out.output_resolution=unreal.IntPoint(1920,1080);out.use_custom_frame_rate=True;out.output_frame_rate=unreal.FrameRate(30,1);out.auto_version=False
 if request['mode']=='still':
  frame=int(request.get('stillFrame',90));assert 0<=frame<180
  out.use_custom_playback_range=True;out.custom_start_frame=frame;out.custom_end_frame=frame+1
 cfg.find_or_add_setting_by_class(unreal.MoviePipelineDeferredPassBase);cfg.find_or_add_setting_by_class(unreal.MoviePipelineImageSequenceOutput_PNG)
 aa=cfg.find_or_add_setting_by_class(unreal.MoviePipelineAntiAliasingSetting);aa.spatial_sample_count=16;aa.temporal_sample_count=1;aa.override_anti_aliasing=True;aa.anti_aliasing_method=unreal.AntiAliasingMethod.AAM_NONE;aa.engine_warm_up_count=24;aa.render_warm_up_count=8
 cfg.find_or_add_setting_by_class(unreal.MoviePipelineGameOverrideSetting).game_mode_override=unreal.MoviePipelineGameMode
 executor=unreal.MoviePipelinePIEExecutor();executor.set_is_rendering_offscreen(True);executor.on_executor_errored_delegate.add_callable_unique(failed);executor.on_executor_finished_delegate.add_callable_unique(finished)
 unreal._rams_motion_queue,unreal._rams_motion_executor=queue,executor
 state['status']='rendering';save();unreal.get_editor_subsystem(unreal.MoviePipelineQueueSubsystem).render_queue_instance_with_executor_instance(queue,executor)
except Exception:state.update(status='failed',error=traceback.format_exc());save();raise
