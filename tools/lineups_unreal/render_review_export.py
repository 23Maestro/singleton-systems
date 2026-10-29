"""Render the saved Lineups visual-review sequence with native Movie Render Queue."""
import json
import traceback
from pathlib import Path
import unreal

PROJECT=Path('/Volumes/UnrealSSD/Generated/CATENA_MEDIA_LINEUPS/source/unreal/projects/SportsBroadcastTrial58')
PROOF=PROJECT.parent.parent/'receipts/lineups-review-export.json'
STATE=json.loads(PROOF.read_text())
OUTPUT=Path(STATE['output'])

def save():PROOF.write_text(json.dumps(STATE,indent=2)+'\n')
def errored(executor,pipeline,is_fatal,error_text):
    STATE['errors'].append({'fatal':bool(is_fatal),'message':str(error_text)});save()
def finished(executor,success):
    STATE['status']='rendered' if success else 'render-failed'
    STATE['nativeRenderSuccess']=bool(success)
    STATE['renderedFrameCount']=len(list((OUTPUT/'frames').glob('*.png')))
    save();unreal.log('LINEUPS_RENDER_FINISHED '+str(success))

try:
    assert STATE['status'] in ('built','render-setup-failed'),STATE['status']
    assert Path(unreal.Paths.convert_relative_path_to_full(unreal.Paths.project_dir())).resolve()==PROJECT
    assert OUTPUT.parent.is_dir()
    if (OUTPUT/'frames').exists() and list((OUTPUT/'frames').glob('*.png')):
        raise RuntimeError('Preserve the existing render and choose a new output version')
    (OUTPUT/'frames').mkdir(parents=True,exist_ok=True)
    queue=unreal.MoviePipelineQueue()
    job=queue.allocate_new_job(unreal.MoviePipelineExecutorJob)
    job.job_name='Lineups_Mahomes_Allen_Visual_Review'
    job.map=unreal.SoftObjectPath(STATE['map'])
    job.sequence=unreal.SoftObjectPath(STATE['sequence'])
    cfg=job.get_configuration()
    output=cfg.find_or_add_setting_by_class(unreal.MoviePipelineOutputSetting)
    output.output_directory=unreal.DirectoryPath(str(OUTPUT/'frames'))
    output.file_name_format='lineups_review.{frame_number_rel}'
    output.output_resolution=unreal.IntPoint(1920,1080)
    output.use_custom_frame_rate=True;output.output_frame_rate=unreal.FrameRate(STATE['frameRate'],1)
    output.zero_pad_frame_numbers=4;output.auto_version=False
    cfg.find_or_add_setting_by_class(unreal.MoviePipelineDeferredPassBase)
    png=cfg.find_or_add_setting_by_class(unreal.MoviePipelineImageSequenceOutput_PNG);png.write_alpha=False
    aa=cfg.find_or_add_setting_by_class(unreal.MoviePipelineAntiAliasingSetting)
    aa.spatial_sample_count=1;aa.temporal_sample_count=2
    aa.engine_warm_up_count=16;aa.render_warm_up_count=8
    game=cfg.find_or_add_setting_by_class(unreal.MoviePipelineGameOverrideSetting)
    game.game_mode_override=unreal.MoviePipelineGameMode
    executor=unreal.MoviePipelinePIEExecutor()
    executor.set_is_rendering_offscreen(True)
    executor.on_executor_errored_delegate.add_callable_unique(errored)
    executor.on_executor_finished_delegate.add_callable_unique(finished)
    # Keep Python delegates and native queue alive through async rendering.
    unreal._lineups_review_queue=queue;unreal._lineups_review_executor=executor
    unreal._lineups_review_finished=finished;unreal._lineups_review_errored=errored
    STATE.update(status='rendering',nativeRenderSuccess=None,renderedFrameCount=0);save()
    unreal.get_editor_subsystem(unreal.MoviePipelineQueueSubsystem).render_queue_instance_with_executor_instance(queue,executor)
except Exception:
    STATE['status']='render-setup-failed';STATE['errors'].append(traceback.format_exc());save();raise
