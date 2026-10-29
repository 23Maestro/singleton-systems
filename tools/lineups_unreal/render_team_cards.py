"""Render owned paired-logo scenes and retain native geometry/content evidence."""
import json
import math
import traceback
from pathlib import Path
import unreal

PROJECT = Path('/Volumes/UnrealSSD/Generated/CATENA_MEDIA_LINEUPS/source/unreal/projects/SportsBroadcastTrial58')
RECEIPTS = PROJECT.parent.parent / 'receipts'
ROOT = '/Game/Lineups/TeamCardsV1/'
STATE = json.loads((RECEIPTS / 'team-cards-render-request.json').read_text())
PROOF = RECEIPTS / STATE['receiptName']


def save():
    PROOF.write_text(json.dumps(STATE, indent=2) + '\n')


def errored(executor, pipeline, fatal, message):
    STATE.setdefault('errors', []).append({'fatal': bool(fatal), 'message': str(message)})
    save()


def capture(delta):
    world = unreal.get_editor_subsystem(unreal.UnrealEditorSubsystem).get_game_world()
    if not world:
        return
    slug = next((s for s in STATE['variants'] if 'LV_' + s in world.get_path_name()), None)
    if not slug:
        return
    aa = {a.get_actor_label(): a for a in unreal.GameplayStatics.get_all_actors_of_class(world, unreal.Actor)}
    camera = aa.get('AvaCineCameraActor_Main')
    if not camera:
        return
    cx = camera.get_actor_location().x
    fov = camera.get_cine_camera_component().get_horizontal_field_of_view()
    nodes = {}
    for name in ['SM_Branding_TeamLogo_L', 'SM_Branding_TeamLogo_R', 'TeamName_L', 'TeamName_R', 'TeamRecord_L', 'TeamRecord_R', 'VS', 'Container_Solid_L3', 'Container_Solid_R3']:
        actor = aa[name]
        c, e = actor.get_actor_bounds(False)
        f = 1920 / (2 * (c.x - cx) * math.tan(math.radians(fov / 2)))
        text = actor.get_component_by_class(unreal.Text3DComponent)
        nodes[name] = {'boundsPx': [960 + (c.y-e.y)*f, 540-(c.z+e.z)*f, 960+(c.y+e.y)*f, 540-(c.z-e.z)*f],
                       'location': str(actor.get_actor_location()), 'scale': str(actor.get_actor_scale3d()),
                       'text': str(text.get_editor_property('text')) if text else None}
    STATE.setdefault('nativeReadback', {})[slug] = nodes


def finished(executor, success):
    unreal.unregister_slate_post_tick_callback(unreal._lineups_team_capture)
    STATE.update(status='rendered' if success else 'failed', nativeRenderSuccess=bool(success))
    STATE['frameCounts'] = {s: len(list((Path(STATE['output']) / s).rglob('*.png'))) for s in STATE['variants']}
    save()


def render():
    assert Path(unreal.Paths.convert_relative_path_to_full(unreal.Paths.project_dir())).resolve() == PROJECT
    output_dir = Path(STATE['output'])
    assert output_dir.resolve().is_relative_to(Path('/Volumes/HomeSSD/Generated/CATENA_MEDIA_LINEUPS/renders'))
    assert Path(STATE['receiptName']).name == STATE['receiptName'] and STATE['receiptName'].endswith('.json')
    assert STATE['variants'] and set(STATE['variants']) <= {'BrownsRavens', 'RamsSeahawks'}
    if output_dir.exists() and list(output_dir.rglob('*.png')):
        raise RuntimeError('Preserve existing frames; choose a new render version')
    queue = unreal.MoviePipelineQueue()
    for slug in STATE['variants']:
        seq = unreal.load_asset(ROOT + 'LS_' + slug)
        assert unreal.EditorAssetLibrary.get_metadata_tag(seq, 'LineupsOwner') == 'lineups-team-cards-v1'
        job = queue.allocate_new_job(unreal.MoviePipelineExecutorJob)
        job.job_name = slug
        job.map = unreal.SoftObjectPath(ROOT + 'LV_' + slug)
        job.sequence = unreal.SoftObjectPath(ROOT + 'LS_' + slug)
        cfg = job.get_configuration()
        output = cfg.find_or_add_setting_by_class(unreal.MoviePipelineOutputSetting)
        output.output_directory = unreal.DirectoryPath(str(output_dir / slug))
        output.file_name_format = slug + '.{frame_number_rel}'
        output.output_resolution = unreal.IntPoint(1920, 1080)
        output.use_custom_frame_rate = True
        output.output_frame_rate = unreal.FrameRate(60000, 1001)
        output.zero_pad_frame_numbers = 4
        output.auto_version = False
        if STATE.get('stillFrame') is not None:
            output.use_custom_playback_range = True
            output.custom_start_frame = STATE['stillFrame']
            output.custom_end_frame = STATE['stillFrame'] + 1
        cfg.find_or_add_setting_by_class(unreal.MoviePipelineDeferredPassBase)
        cfg.find_or_add_setting_by_class(unreal.MoviePipelineImageSequenceOutput_PNG).write_alpha = False
        aa = cfg.find_or_add_setting_by_class(unreal.MoviePipelineAntiAliasingSetting)
        aa.spatial_sample_count = 1
        aa.temporal_sample_count = 2
        aa.engine_warm_up_count = 16
        aa.render_warm_up_count = 8
        cfg.find_or_add_setting_by_class(unreal.MoviePipelineGameOverrideSetting).game_mode_override = unreal.MoviePipelineGameMode
    executor = unreal.MoviePipelinePIEExecutor()
    executor.set_is_rendering_offscreen(True)
    executor.on_executor_errored_delegate.add_callable_unique(errored)
    executor.on_executor_finished_delegate.add_callable_unique(finished)
    unreal._lineups_team_queue, unreal._lineups_team_executor = queue, executor
    unreal._lineups_team_capture = unreal.register_slate_post_tick_callback(capture)
    STATE.update(status='rendering', errors=[])
    save()
    unreal.get_editor_subsystem(unreal.MoviePipelineQueueSubsystem).render_queue_instance_with_executor_instance(queue, executor)


try:
    render()
except Exception:
    STATE.update(status='setup-failed', error=traceback.format_exc())
    save()
    raise
