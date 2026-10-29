"""Render one full-resolution native frame for the P11 first-layout review."""
import json
import traceback
from pathlib import Path
import unreal

PROJECT = Path('/Volumes/UnrealSSD/Generated/CATENA_MEDIA_LINEUPS/source/unreal/projects/SportsBroadcastTrial58')
ROOT = '/Game/Lineups/BillsPerformanceV1'
OUTPUT = Path('/Volumes/HomeSSD/Generated/CATENA_MEDIA_LINEUPS/renders/bills-performance-v1')
PROOF = PROJECT.parent.parent / 'receipts/bills-performance-render-v1.json'
state = {'status': 'starting', 'output': str(OUTPUT), 'errors': [], 'sceneId': 'P11',
         'visualApproval': False, 'editorialTimingApproved': False, 'animationOut': False}

def save():
    PROOF.write_text(json.dumps(state, indent=2) + '\n')

def failed(executor, pipeline, fatal, message):
    state['errors'].append({'fatal': bool(fatal), 'message': str(message)})
    save()

def finished(executor, success):
    state.update(status='rendered' if success else 'failed', nativeRenderSuccess=bool(success),
                 frames=[str(p) for p in OUTPUT.rglob('*.png')])
    save()

try:
    assert Path(unreal.Paths.convert_relative_path_to_full(unreal.Paths.project_dir())).resolve() == PROJECT
    assert not OUTPUT.exists() or not list(OUTPUT.rglob('*.png')), 'Preserve existing review output'
    seq = unreal.load_asset(ROOT + '/LS_BillsPerformance')
    assert unreal.EditorAssetLibrary.get_metadata_tag(seq, 'LineupsOwner') == 'lineups-bills-performance-v1'
    queue = unreal.MoviePipelineQueue()
    job = queue.allocate_new_job(unreal.MoviePipelineExecutorJob)
    job.job_name = 'BillsPerformance'
    job.map = unreal.SoftObjectPath(ROOT + '/LV_BillsPerformance')
    job.sequence = unreal.SoftObjectPath(ROOT + '/LS_BillsPerformance')
    cfg = job.get_configuration()
    out = cfg.find_or_add_setting_by_class(unreal.MoviePipelineOutputSetting)
    out.output_directory = unreal.DirectoryPath(str(OUTPUT))
    out.file_name_format = 'BillsPerformance.{frame_number_rel}'
    out.output_resolution = unreal.IntPoint(1920, 1080)
    out.use_custom_frame_rate = True
    out.output_frame_rate = unreal.FrameRate(25, 1)
    out.auto_version = False
    out.use_custom_playback_range = True
    out.custom_start_frame, out.custom_end_frame = 75, 76
    cfg.find_or_add_setting_by_class(unreal.MoviePipelineDeferredPassBase)
    cfg.find_or_add_setting_by_class(unreal.MoviePipelineImageSequenceOutput_PNG)
    aa = cfg.find_or_add_setting_by_class(unreal.MoviePipelineAntiAliasingSetting)
    aa.spatial_sample_count, aa.temporal_sample_count = 16, 1
    aa.override_anti_aliasing = True
    aa.anti_aliasing_method = unreal.AntiAliasingMethod.AAM_NONE
    aa.engine_warm_up_count, aa.render_warm_up_count = 24, 8
    cfg.find_or_add_setting_by_class(unreal.MoviePipelineGameOverrideSetting).game_mode_override = unreal.MoviePipelineGameMode
    executor = unreal.MoviePipelinePIEExecutor()
    executor.set_is_rendering_offscreen(True)
    executor.on_executor_errored_delegate.add_callable_unique(failed)
    executor.on_executor_finished_delegate.add_callable_unique(finished)
    unreal._bills_review_queue, unreal._bills_review_executor = queue, executor
    state['status'] = 'rendering'
    save()
    unreal.get_editor_subsystem(unreal.MoviePipelineQueueSubsystem).render_queue_instance_with_executor_instance(queue, executor)
except Exception:
    state.update(status='failed', error=traceback.format_exc())
    save()
    raise
