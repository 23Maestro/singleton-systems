"""Native Movie Render Queue for the owned 3/4-point visual review maps."""
import json
import importlib
import math
import sys
import traceback
from pathlib import Path
import unreal
sys.path.insert(0,str(Path(__file__).parent))
from stat_readability import check_readability
import stat_layout
importlib.reload(stat_layout)
from stat_layout import check_stat_layout, check_callout

PROJECT=Path('/Volumes/UnrealSSD/Generated/CATENA_MEDIA_LINEUPS/source/unreal/projects/SportsBroadcastTrial58')
RECEIPTS=PROJECT.parent.parent/'receipts'
REQUEST=RECEIPTS/'stat-render-request.json'
STATE=json.loads(REQUEST.read_text())
TEMPLATE=json.loads((Path(__file__).parents[2]/'config/unreal/stat-breakdown-template.json').read_text())
PROOF=RECEIPTS/STATE['receiptName']
OUTPUT=Path(STATE['output'])


def save():PROOF.write_text(json.dumps(STATE,indent=2)+'\n')
def errored(executor,pipeline,is_fatal,error_text):
    STATE.setdefault('errors',[]).append({'fatal':bool(is_fatal),'message':str(error_text)});save()
def capture_settled_frame(delta):
    world=unreal.get_editor_subsystem(unreal.UnrealEditorSubsystem).get_game_world()
    if not world or 'LV_MahomesStat'+str(STATE['points']) not in world.get_path_name():return
    aa={a.get_actor_label():a for a in unreal.GameplayStatics.get_all_actors_of_class(world,unreal.Actor)}
    if 'Text_Stat'+str(STATE['points']) not in aa:return
    allowed={'Text_Player_FirstName','Text_Player_LastName','Text_PlayerNumber','Text_Position','Text_Asterisk'}
    allowed.update(prefix+str(i) for i in range(1,STATE['points']+1) for prefix in ('Text_Stat','Text_Title_Stat'))
    unexpected=[name for name,a in aa.items() if name.startswith('Highlight') or
                (a.get_component_by_class(unreal.Text3DComponent) and name not in allowed)]
    expected={'Text_Player_FirstName':TEMPLATE['player']['firstName'],'Text_Player_LastName':TEMPLATE['player']['lastName'],
              'Text_PlayerNumber':TEMPLATE['player']['number'],'Text_Position':TEMPLATE['player']['position'],'Text_Asterisk':TEMPLATE['season']}
    for i,row in enumerate(TEMPLATE['stats'][:STATE['points']],1):
        expected['Text_Stat'+str(i)]=row['value'];expected['Text_Title_Stat'+str(i)]=row['label']
    mismatched=[name for name,text in expected.items() if name not in aa or str(aa[name].get_component_by_class(unreal.Text3DComponent).get_editor_property('text'))!=text]
    audit=STATE.setdefault('contentAudit',{'passed':True,'unexpectedActors':[],'mismatchedText':[],'sampleCount':0})
    audit['sampleCount']+=1
    audit['unexpectedActors']=sorted(set(audit['unexpectedActors']+unexpected));audit['mismatchedText']=sorted(set(audit['mismatchedText']+mismatched))
    audit['passed']=not audit['unexpectedActors'] and not audit['mismatchedText']
    values=[aa['Text_Stat'+str(i)] for i in range(1,STATE['points']+1)]
    if any(a.get_editor_property('hidden') or abs(a.get_actor_scale3d().x-1.35)>.001 for a in values):return
    camera=aa['AvaCineCameraActor_Main'];cx=camera.get_actor_location().x
    fov=camera.get_cine_camera_component().get_horizontal_field_of_view()
    rows=[]
    for i in range(1,STATE['points']+1):
        row={}
        for kind,key in [('value','Text_Stat'),('label','Text_Title_Stat')]:
            a=aa[key+str(i)];center,extent=a.get_actor_bounds(False)
            factor=1920/(2*(center.x-cx)*math.tan(math.radians(fov/2)))
            row[kind]={'text':str(a.get_component_by_class(unreal.Text3DComponent).get_editor_property('text')),'hidden':bool(a.get_editor_property('hidden')),'pixelBounds':[960+(center.y-extent.y)*factor,540-(center.z+extent.z)*factor,960+(center.y+extent.y)*factor,540-(center.z-extent.z)*factor],'geometryHeightPx':2*extent.z*factor}
        rows.append(row)
    cc,ce=aa['Stats_Box'].get_actor_bounds(False)
    cf=1920/(2*(cc.x-cx)*math.tan(math.radians(fov/2)))
    STATE['settledNativeReadback']={'map':world.get_path_name(),'stats':rows,'photoScaleY':aa['T_Player_WIP'].get_actor_scale3d().y,'cardBoundsPx':[960+(cc.y-ce.y)*cf,540-(cc.z+ce.z)*cf,960+(cc.y+ce.y)*cf,540-(cc.z-ce.z)*cf]}
    controls={}
    for name in ['Text_Position','Position_YellowBar','MASK_Text_Position','MASK_Stat_Titles','MASK_Stats_Box','MASK_Main_Box','Text_Asterisk','T_TeamLogo_Wyrms_Logo','LineupsStat_SpeakerCallout']:
        actor=aa[name];c,e=actor.get_actor_bounds(False);f=1920/(2*(c.x-cx)*math.tan(math.radians(fov/2)))
        parent=actor.get_attach_parent_actor()
        controls[name]={'boundsPx':[960+(c.y-e.y)*f,540-(c.z+e.z)*f,960+(c.y+e.y)*f,540-(c.z-e.z)*f],'location':str(actor.get_actor_location()),'scale':str(actor.get_actor_scale3d()),'parent':parent.get_actor_label() if parent else None}
        text=actor.get_component_by_class(unreal.Text3DComponent)
        if text:controls[name]['typeface']=str(text.get_editor_property('typeface'))
        if name in ('Text_Asterisk','LineupsStat_SpeakerCallout'):
            controls[name]['sortPriorities']=[int(c.get_editor_property('translucency_sort_priority')) for c in actor.get_components_by_class(unreal.PrimitiveComponent)]
    STATE['settledNativeReadback']['controls']=controls


def finished(executor,success):
    unreal.unregister_slate_post_tick_callback(unreal._lineups_stat_capture_handle)
    checks=check_readability(STATE.get('settledNativeReadback'))
    layout=check_stat_layout(STATE.get('settledNativeReadback',{}),TEMPLATE['statLayout'])
    controls=STATE.get('settledNativeReadback',{}).get('controls',{})
    callout=check_callout(controls,TEMPLATE['speakerCallout'])
    passed=success and checks['passed'] and layout['passed'] and callout['passed'] and STATE.get('contentAudit',{}).get('passed',False)
    STATE.update(status='rendered' if passed else 'review-failed',nativeRenderSuccess=bool(success),readabilityChecks=checks,layoutChecks=layout,calloutChecks=callout)
    STATE['renderedFrameCount']=len(list(OUTPUT.rglob('*.png')));save()
    unreal.log('STAT_RENDER_FINISHED '+str(success))


def render():
    assert Path(unreal.Paths.convert_relative_path_to_full(unreal.Paths.project_dir())).resolve()==PROJECT
    assert STATE['points'] in (3,4)
    assert OUTPUT.resolve().is_relative_to(Path('/Volumes/HomeSSD/Generated/CATENA_MEDIA_LINEUPS/renders'))
    assert Path(STATE['receiptName']).name==STATE['receiptName'] and STATE['receiptName'].endswith('.json')
    root='/Game/Lineups/StatBreakdownV1/'
    assert STATE['map']==root+'LV_MahomesStat'+str(STATE['points'])
    assert STATE['sequence']==root+'LS_MahomesStat'+str(STATE['points'])
    revision=str(TEMPLATE.get('layoutRevisionByPoints',{}).get(str(STATE['points']),TEMPLATE['layoutRevision']))
    for asset in (STATE['map'],STATE['sequence']):
        assert unreal.EditorAssetLibrary.get_metadata_tag(unreal.load_asset(asset),'LineupsLayoutRevision')==revision,'Run refine_stat_breakdown.py before exporting'
    if OUTPUT.exists() and list(OUTPUT.rglob('*.png')):raise RuntimeError('Preserve existing frames; use a new render version')
    OUTPUT.mkdir(parents=True,exist_ok=True)
    queue=unreal.MoviePipelineQueue();job=queue.allocate_new_job(unreal.MoviePipelineExecutorJob)
    job.job_name='Mahomes_Stat_Breakdown_'+str(STATE['points'])
    job.map=unreal.SoftObjectPath(STATE['map']);job.sequence=unreal.SoftObjectPath(STATE['sequence'])
    cfg=job.get_configuration();output=cfg.find_or_add_setting_by_class(unreal.MoviePipelineOutputSetting)
    output.output_directory=unreal.DirectoryPath(str(OUTPUT));output.file_name_format='mahomes_stat.{frame_number_rel}'
    output.output_resolution=unreal.IntPoint(1920,1080)
    output.use_custom_frame_rate=True;output.output_frame_rate=unreal.FrameRate(60000,1001)
    output.zero_pad_frame_numbers=4;output.auto_version=False
    if STATE.get('stillFrame') is not None:
        output.use_custom_playback_range=True;output.custom_start_frame=STATE['stillFrame'];output.custom_end_frame=STATE['stillFrame']+1
    cfg.find_or_add_setting_by_class(unreal.MoviePipelineDeferredPassBase)
    cfg.find_or_add_setting_by_class(unreal.MoviePipelineImageSequenceOutput_PNG).write_alpha=False
    aa=cfg.find_or_add_setting_by_class(unreal.MoviePipelineAntiAliasingSetting)
    aa.spatial_sample_count=1;aa.temporal_sample_count=2;aa.engine_warm_up_count=16;aa.render_warm_up_count=8
    cfg.find_or_add_setting_by_class(unreal.MoviePipelineGameOverrideSetting).game_mode_override=unreal.MoviePipelineGameMode
    executor=unreal.MoviePipelinePIEExecutor();executor.set_is_rendering_offscreen(True)
    executor.on_executor_errored_delegate.add_callable_unique(errored);executor.on_executor_finished_delegate.add_callable_unique(finished)
    unreal._lineups_stat_queue=queue;unreal._lineups_stat_executor=executor
    unreal._lineups_stat_finished=finished;unreal._lineups_stat_errored=errored
    unreal._lineups_stat_capture_handle=unreal.register_slate_post_tick_callback(capture_settled_frame)
    STATE.update(status='rendering',nativeRenderSuccess=None,renderedFrameCount=0,errors=[]);save()
    unreal.get_editor_subsystem(unreal.MoviePipelineQueueSubsystem).render_queue_instance_with_executor_instance(queue,executor)

try:render()
except:
    STATE.update(status='render-setup-failed',errors=STATE.get('errors',[])+[traceback.format_exc()]);save();raise
