"""Render the native Mark-cued Bills motion copy without an exit animation."""
import json
import traceback
from pathlib import Path
import unreal

PROJECT = Path('/Volumes/UnrealSSD/Generated/CATENA_MEDIA_LINEUPS/source/unreal/projects/SportsBroadcastTrial58')
ROOT = '/Game/Lineups/BillsPerformanceMotionV1'
SEQUENCE = ROOT + '/LS_BillsPerformanceMotionPairFocus'
OUTPUT = Path('/Volumes/HomeSSD/Generated/CATENA_MEDIA_LINEUPS/renders/bills-performance-motion-v3')
PROOF = PROJECT.parent.parent / 'receipts/bills-performance-motion-render-v3.json'
state = {'status': 'starting', 'output': str(OUTPUT), 'errors': [], 'sceneId': 'P11',
         'motionApproval': False, 'productionReady': False, 'animationOut': False}


def save():
    PROOF.write_text(json.dumps(state, indent=2) + '\n')


def failed(executor, pipeline, fatal, message):
    state['errors'].append({'fatal': bool(fatal), 'message': str(message)})
    save()


def finished(executor, success):
    frames = sorted(OUTPUT.glob('BillsPerformance.*.png'))
    state.update(status='rendered' if success else 'failed', nativeRenderSuccess=bool(success),
                 frameCount=len(frames), firstFrame=str(frames[0]) if frames else None,
                 lastFrame=str(frames[-1]) if frames else None)
    save()


try:
    assert Path(unreal.Paths.convert_relative_path_to_full(unreal.Paths.project_dir())).resolve() == PROJECT
    assert not OUTPUT.exists() or not list(OUTPUT.rglob('*.png')), 'Preserve prior render'
    seq = unreal.load_asset(SEQUENCE)
    assert unreal.EditorAssetLibrary.get_metadata_tag(seq, 'LineupsOwner') == 'lineups-bills-performance-motion-v1'
    queue = unreal.MoviePipelineQueue()
    job = queue.allocate_new_job(unreal.MoviePipelineExecutorJob)
    job.job_name = 'BillsPerformanceMotion'
    job.map = unreal.SoftObjectPath(ROOT + '/LV_BillsPerformanceMotion')
    job.sequence = unreal.SoftObjectPath(SEQUENCE)
    cfg = job.get_configuration()
    out = cfg.find_or_add_setting_by_class(unreal.MoviePipelineOutputSetting)
    out.output_directory = unreal.DirectoryPath(str(OUTPUT))
    out.file_name_format = 'BillsPerformance.{frame_number_rel}'
    out.output_resolution = unreal.IntPoint(1920, 1080)
    out.use_custom_frame_rate = True
    out.output_frame_rate = unreal.FrameRate(25, 1)
    out.auto_version = False
    cfg.find_or_add_setting_by_class(unreal.MoviePipelineDeferredPassBase)
    cfg.find_or_add_setting_by_class(unreal.MoviePipelineImageSequenceOutput_PNG)
    aa = cfg.find_or_add_setting_by_class(unreal.MoviePipelineAntiAliasingSetting)
    aa.spatial_sample_count, aa.temporal_sample_count = 8, 1
    aa.override_anti_aliasing = True
    aa.anti_aliasing_method = unreal.AntiAliasingMethod.AAM_NONE
    aa.engine_warm_up_count, aa.render_warm_up_count = 32, 8
    cfg.find_or_add_setting_by_class(unreal.MoviePipelineGameOverrideSetting).game_mode_override = unreal.MoviePipelineGameMode
    executor = unreal.MoviePipelinePIEExecutor()
    executor.set_is_rendering_offscreen(True)
    executor.on_executor_errored_delegate.add_callable_unique(failed)
    executor.on_executor_finished_delegate.add_callable_unique(finished)
    unreal._bills_motion_queue, unreal._bills_motion_executor = queue, executor
    state.update(status='rendering', fps=25, expectedFrameCount=412, staticHoldFromFrame=221)
    save()
    unreal.get_editor_subsystem(unreal.MoviePipelineQueueSubsystem).render_queue_instance_with_executor_instance(queue, executor)
except Exception:
    state.update(status='failed', error=traceback.format_exc())
    save()
    raise
