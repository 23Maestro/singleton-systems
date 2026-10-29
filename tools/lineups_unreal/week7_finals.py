"""Episode-owned 10-second copies; approved masters remain unchanged.

Run in the editor. The request in the project's receipts folder selects the
scene and build/render operation. Stats follow verified spoken cues; the two
team-logo cards alone share an opening. Approved masters remain unchanged.
"""
import hashlib
import json
import math
import sys
import traceback
from pathlib import Path

import unreal

REPO = Path('/Users/singleton23/Documents/Development/singleton-systems')
sys.path.insert(0, str(REPO))
sys.path.insert(0, str(REPO / 'tools/lineups_unreal'))
import editor_scene
import build_review_export as native
from tools.lineups_motion.timing_evidence import validate_timing_receipt, file_hash

PROJECT = native.PROJECT
RECEIPTS = PROJECT.parent.parent / 'receipts'
REQUEST = json.loads((RECEIPTS / 'week7-final-request.json').read_text())
SCENE = REQUEST['scene']
FPS, END = 25, int(REQUEST.get('durationSeconds', 10) * 25)
REVISION = REQUEST.get('revision', 'v1')
assert REVISION in ['v1', 'v2']
ROOT = '/Game/Lineups/Week7_' + SCENE + '_Final' + REVISION.upper()
MAP, SEQ = ROOT + '/LV_' + SCENE, ROOT + '/LS_' + SCENE
if SCENE=='S03':
    SEQ=ROOT+'/LS_S03_Final'
OWNER = 'lineups-week7-' + SCENE.lower() + '-final-' + REVISION
PROOF = RECEIPTS / ('week7-' + SCENE.lower() + '-' + REQUEST['operation'] + '-' + REVISION + '.json')
OUTPUT = Path('/Volumes/HomeSSD/Generated/CATENA_MEDIA_LINEUPS/renders/week7-finals-' + REVISION) / REQUEST.get('outputName', SCENE)
state = dict(status='starting', sceneId=SCENE, map=MAP, sequence=SEQ,
             animationOut=False, fps=FPS, expectedFrameCount=END,
             durationSeconds=END/FPS, engine='unreal', visualApproval=SCENE in ['P11','S03'])


def save():
    PROOF.write_text(json.dumps(state, indent=2) + '\n')


def smooth(t):
    t = min(1., max(0., t))
    return t ** 3 * (10 + t * (-15 + 6 * t))


def xyz(v):
    return [v.x, v.y, v.z]


def track(seq, actor, samples):
    actor.get_editor_property('root_component').set_mobility(unreal.ComponentMobility.MOVABLE)
    b = seq.add_possessable(actor)
    section = b.add_track(unreal.MovieScene3DTransformTrack).add_section()
    section.set_range(-1, END + 1)
    for f, values in samples:
        for ch, val in zip(section.get_all_channels(), values):
            ch.add_key(unreal.FrameNumber(f), val,
                       interpolation=unreal.MovieSceneKeyInterpolation.LINEAR)
    return b


def motion_blur(camera):
    c = camera.get_cine_camera_component()
    pp = c.post_process_settings
    pp.override_motion_blur_amount = True
    pp.motion_blur_amount = .25
    pp.override_motion_blur_max = True
    pp.motion_blur_max = 5.
    c.post_process_settings = pp
    return dict(amount=c.post_process_settings.motion_blur_amount,
                maximum=c.post_process_settings.motion_blur_max,
                override=c.post_process_settings.override_motion_blur_amount)


def source_timing():
    episode = REPO / 'config/lineups/episodes/2026-10-20-nfl-week-7-power-rankings'
    path = episode / 'storyboard/timing' / (SCENE + '.manifest.json')
    plan = json.loads(path.read_text())
    proof = validate_timing_receipt(episode, plan, require_approval=False)
    state.update(sourcePlan=str(path), sourcePlanSha256=file_hash(path),
                 sourceManimReceipt=proof,
                 sourceAnchorSeconds=plan['timing']['verifiedAnchorTimestamp'],
                 sourceCues=plan['motion']['cues'],
                 editorialOverride='Jerami: 10 seconds; breakdown cards enter together at start; no spoken-beat waits; static hold, no out',
                 individualSpokenBeatReveals=False)


def clone_map(source):
    assert not unreal.EditorAssetLibrary.does_asset_exist(MAP), 'Preserve existing final copy'
    unreal.LevelSequenceEditorBlueprintLibrary.close_level_sequence()
    assert unreal.get_editor_subsystem(unreal.LevelEditorSubsystem).save_current_level()
    duplicate = unreal.EditorAssetLibrary.duplicate_asset(source, MAP)
    assert duplicate
    assert unreal.EditorAssetLibrary.save_loaded_asset(duplicate)
    duplicate = None
    unreal.SystemLibrary.collect_garbage()
    assert unreal.get_editor_subsystem(unreal.LevelEditorSubsystem).load_level(MAP)
    world = unreal.get_editor_subsystem(unreal.UnrealEditorSubsystem).get_editor_world()
    unreal.EditorAssetLibrary.set_metadata_tag(world, 'LineupsOwner', OWNER)
    return world


def create_sequence():
    assert not unreal.EditorAssetLibrary.does_asset_exist(SEQ)
    seq = unreal.AssetToolsHelpers.get_asset_tools().create_asset(
        SEQ.rsplit('/',1)[1], ROOT, unreal.LevelSequence, unreal.LevelSequenceFactoryNew())
    seq.set_display_rate(unreal.FrameRate(FPS, 1))
    seq.set_playback_start(0)
    seq.set_playback_end(END)
    unreal.EditorAssetLibrary.set_metadata_tag(seq, 'LineupsOwner', OWNER)
    unreal.EditorAssetLibrary.set_metadata_tag(seq, 'LineupsTiming', state['editorialOverride'])
    return seq


def save_scene(world, seq, camera, hold):
    state['motionBlur'] = motion_blur(camera)
    state['staticHoldFromFrame'] = hold
    state.setdefault('allEntrancesAtFrame', 0)
    assert unreal.EditorAssetLibrary.save_loaded_asset(seq)
    assert unreal.EditorLoadingAndSavingUtils.save_map(world, MAP)
    unreal.LevelSequenceEditorBlueprintLibrary.open_level_sequence(seq)
    unreal.LevelSequenceEditorBlueprintLibrary.set_current_time(hold + 3)
    unreal.LevelSequenceEditorBlueprintLibrary.set_lock_camera_cut_to_viewport(True)
    state.update(status='built', bindings=[b.get_name() for b in seq.get_bindings()])
    save()


def cut(seq, binding):
    section = seq.add_track(unreal.MovieSceneCameraCutTrack).add_section()
    section.set_range(0, END)
    bid = unreal.MovieSceneObjectBindingID()
    bid.set_editor_property('guid', binding.get_id())
    section.set_camera_binding_id(bid)


def build_breakdown():
    world = clone_map('/Game/Lineups/BillsPerformanceMotionV1/LV_BillsPerformanceMotion')
    aa = {a.get_actor_label(): a for a in unreal.get_editor_subsystem(unreal.EditorActorSubsystem).get_all_level_actors()}
    original = json.loads((RECEIPTS / 'bills-performance-motion-build-v1.json').read_text())
    for group in original['groups']:
        a = aa[group['root']]
        t = group['finalTransform']
        a.set_actor_location(unreal.Vector(*t[:3]), False, False)
        a.set_actor_rotation(unreal.Rotator(roll=t[3], pitch=t[4], yaw=t[5]), False)
        a.set_actor_scale3d(unreal.Vector(*t[6:]))
    seq = create_sequence()
    panels = [aa['Bills_FactPanel_' + str(i)] for i in range(3)]
    camera = aa['Bills_ReviewCamera']
    if SCENE == 'P12':
        build_chiefs_layout(world, seq, camera, aa)
        return
    for panel in panels:
        final, scale, rot = panel.get_actor_location(), panel.get_actor_scale3d(), panel.get_actor_rotation()
        samples = []
        for f in [-1, *range(16), END - 1, END]:
            u = 1 - (1 - min(1., max(0., f / 15))) ** 3
            loc = final + unreal.Vector(-90 * (1-u), 0, -470 * (1-u))
            factor = .92 + .08 * u
            samples.append((f, [*xyz(loc), rot.roll, rot.pitch + 4*(1-u), rot.yaw,
                                scale.x*factor, scale.y*factor, scale.z*factor]))
        track(seq, panel, samples)
    full = unreal.Vector(-500, 0, 0)
    units = 1452 * 23.76 / 35 / 1920
    pair = unreal.Vector(952 - 1452 / 1.22, -300 * units, -60 * units)
    def camera_at(f):
        if f < 30: return full + (pair-full)*smooth(f/30)
        if f <= 75: return pair
        if f < 125: return pair + (full-pair)*smooth((f-75)/50)
        return full
    samples = [(f, [*xyz(camera_at(f)), 0, 0, 0, 1, 1, 1])
               for f in [-1, *range(126), END-1, END]]
    cut(seq, track(seq, camera, samples))
    state.update(cardSettledFrame=15, cardCount=3,
                 cameraMoves=[{'frames':[0,30], 'action':'push into 33 and 30 with full logo'},
                              {'frames':[75,125], 'action':'pull back to all 3 and hold'}])
    save_scene(world, seq, camera, 125)


def build_chiefs_layout(world, seq, camera, aa):
    # Separate team copy with editable categorical facts, never invented totals.
    native.ROOT = ROOT
    def srgb(code):
        v = [int(code[i:i+2], 16)/255 for i in (0,2,4)]
        return tuple(x/12.92 if x <= .04045 else ((x+.055)/1.055)**2.4 for x in v)
    red, gold = srgb('E31837'), srgb('FFB81C')
    paper = unreal.load_asset('/Game/_Textures/T_WheatPaste_D')
    redmat = native.material('M_ChiefsRed', paper, red, unlit=True)
    goldmat = native.material('M_ChiefsGold', paper, gold, unlit=True)
    redrule = native.material('M_ChiefsRule', color=gold, unlit=True)
    ml = unreal.MaterialEditingLibrary
    header = native.material('M_ChiefsHeader', paper, red, unlit=True)
    sample = next(o for o in unreal.ObjectIterator() if isinstance(o, unreal.MaterialExpressionTextureSample) and o.get_outer() == header)
    uv = ml.create_material_expression(header, unreal.MaterialExpressionTextureCoordinate)
    uv.set_editor_property('u_tiling', 3.)
    ml.connect_material_expressions(uv, '', sample, 'Coordinates')
    ml.recompile_material(header)
    unreal.EditorAssetLibrary.save_loaded_asset(header)
    aa['Bills_Header'].static_mesh_component.set_material(0, header)
    aa['Bills_HeaderRule'].static_mesh_component.set_material(0, redrule)
    logo = unreal.load_asset('/Game/Lineups/StatBreakdownV1/Assets/T_ChiefsLogo_24fbbcef22bf')
    assert logo
    aa['Bills_HeadingLogo'].static_mesh_component.set_material(0, native.material('M_ChiefsLogo', logo, unlit=True, masked=True))
    actor_system = unreal.get_editor_subsystem(unreal.EditorActorSubsystem)
    title = aa['Bills_HeaderText']
    title.get_component_by_class(unreal.Text3DComponent).set_editor_property('text', 'KANSAS CITY CHIEFS')
    for a in list(aa.values()):
        if a.get_actor_label().startswith(('Bills_FactPanel_', 'Bills_FactShadow_', 'Bills_Value_', 'Bills_Label_')):
            assert actor_system.destroy_actor(a)
    quad = unreal.load_asset('/Game/Lineups/ReviewV1/Meshes/SM_ReviewQuad')
    shadow = native.material('M_ChiefsInk', color=srgb('211B13'), unlit=True)
    texts, panels = [], []
    def pos(x,y,d=952):
        k = (d+500)*23.76/35/1920
        return unreal.Vector(d,(x-960)*k,(540-y)*k)
    def plane(label,x,y,w,h,mat,d):
        k=(d+500)*23.76/35/1920
        a=native.mesh_actor(label,quad,mat,pos(x,y,d),unreal.Vector(1,-w*k,h*k))
        a.static_mesh_component.set_cast_shadow(False)
        a.static_mesh_component.set_mobility(unreal.ComponentMobility.MOVABLE)
        return a
    def text(label,copy,x,y,w,h,color=(1,1,1)):
        a=native.spawn(unreal.Text3DActor,label,pos(x,y,939))
        c=a.get_component_by_class(unreal.Text3DComponent)
        c.set_editor_property('font', unreal.load_asset('/Game/Lineups/ReviewV1/Widgets/Fonts/c6d5e1a6d369/BebasBoldSaved_Font'))
        c.set_editor_property('font_size',24.)
        c.set_editor_property('text',copy)
        editor_scene.set_values(c.get_editor_property('layout_extension'),{'horizontalAlignment':'Center','verticalAlignment':'Center'})
        editor_scene.set_values(c.get_editor_property('geometry_extension'),{'extrude':.12,'bevel':.025,'bevelSegments':2})
        rgba=dict(zip(['r','g','b','a'],[*color,1.]))
        editor_scene.set_values(c.get_editor_property('material_extension'),{'style':'Solid','frontColor':rgba,'bevelColor':rgba,'extrudeColor':rgba,'bIsUnlit':True})
        k=1439*23.76/35/1920
        texts.append((a,w*k,h*k,pos(x,y,939)))
        return a
    texts.append((title,1430*1439*23.76/35/1920,92*1439*23.76/35/1920,pos(960,98,939)))
    for i,(x,value,label) in enumerate([(270,'FUMBLE','BALL SECURITY'),(730,'INT','END ZONE'),(1190,'XP','MISSED'),(1650,'FG','MISSED')]):
        panel=plane('Chiefs_FactPanel_'+str(i),x,732,400,464,redmat if i%2==0 else goldmat,952)
        children=[plane('Chiefs_FactShadow_'+str(i),x+6,742,400,464,shadow,958),
                  text('Chiefs_Value_'+str(i),value,x,665,350,150,(1,1,1) if i%2==0 else (0,0,0)),
                  text('Chiefs_Label_'+str(i),label,x,850,350,52,(1,1,1) if i%2==0 else (0,0,0))]
        panels.append((panel,children))
    ticks=[0]
    def finish(dt):
        ticks[0]+=1
        if ticks[0]<25:return
        try:
            if any(a.get_actor_bounds(False)[1].y<.01 for a,*_ in texts):
                assert ticks[0]<250,'Text geometry unavailable'
                return
            unreal.unregister_slate_post_tick_callback(unreal._week7_layout_tick)
            measured=[]
            for a,w,h,center in texts:
                a.set_actor_scale3d(unreal.Vector(1,1,1))
                origin,e=a.get_actor_bounds(False)
                factor=min(w/(e.y*2),h/(e.z*2))
                a.set_actor_scale3d(unreal.Vector(factor,factor,factor))
                origin,e=a.get_actor_bounds(False)
                a.set_actor_location(a.get_actor_location()+center-origin,False,False)
                measured.append({'label':a.get_actor_label(),'text':str(a.get_component_by_class(unreal.Text3DComponent).get_editor_property('text')),'heightPixels':e.z*2/(1439*23.76/35/1920)})
            for panel,children in panels:
                for child in children:
                    child.get_editor_property('root_component').set_mobility(unreal.ComponentMobility.MOVABLE)
                    child.attach_to_actor(panel,'',unreal.AttachmentRule.KEEP_WORLD,unreal.AttachmentRule.KEEP_WORLD,unreal.AttachmentRule.KEEP_WORLD,False)
                final,sc=panel.get_actor_location(),panel.get_actor_scale3d()
                samples=[]
                for f in [-1,*range(16),END-1,END]:
                    u=1-(1-min(1.,max(0.,f/15)))**3
                    loc=final+unreal.Vector(-90*(1-u),0,-470*(1-u))
                    factor=.92+.08*u
                    samples.append((f,[*xyz(loc),0,4*(1-u),0,sc.x*factor,sc.y*factor,sc.z*factor]))
                track(seq,panel,samples)
            full=unreal.Vector(-500,0,0)
            close=unreal.Vector(952-1452/1.04,0,0)
            def camera_at(f):
                if f<30:return full+(close-full)*smooth(f/30)
                if f<=65:return close
                if f<105:return close+(full-close)*smooth((f-65)/40)
                return full
            cut(seq,track(seq,camera,[(f,[*xyz(camera_at(f)),0,0,0,1,1,1]) for f in [-1,*range(106),END-1,END]]))
            state.update(cardCount=4,cardSettledFrame=15,text=measured)
            save_scene(world,seq,camera,105)
        except Exception:
            state.update(status='failed',error=traceback.format_exc());save();raise
    unreal._week7_layout_tick=unreal.register_slate_post_tick_callback(finish)
    state['status']='waiting-for-text';save()


def render():
    assert not OUTPUT.exists() or not list(OUTPUT.glob('*.png')), 'Preserve prior rendered frames'
    seq=unreal.load_asset(SEQ)
    assert seq and unreal.EditorAssetLibrary.get_metadata_tag(seq,'LineupsOwner')==OWNER
    queue=unreal.MoviePipelineQueue()
    job=queue.allocate_new_job(unreal.MoviePipelineExecutorJob)
    job.job_name=SCENE+'_Final'
    job.map=unreal.SoftObjectPath(MAP)
    job.sequence=unreal.SoftObjectPath(SEQ)
    cfg=job.get_configuration()
    out=cfg.find_or_add_setting_by_class(unreal.MoviePipelineOutputSetting)
    out.output_directory=unreal.DirectoryPath(str(OUTPUT))
    out.file_name_format=SCENE+'.{frame_number_rel}'
    out.output_resolution=unreal.IntPoint(1920,1080)
    out.use_custom_frame_rate=True
    out.output_frame_rate=unreal.FrameRate(FPS,1)
    out.auto_version=False
    if 'renderEnd' in REQUEST:
        render_end=int(REQUEST['renderEnd'])
        assert 65 < render_end <= END
        out.use_custom_playback_range=True
        out.custom_start_frame=0
        out.custom_end_frame=render_end
        state.update(expectedFrameCount=render_end,finalFrameCount=END,
                     holdTreatment='Freeze last settled native frame for the remaining final duration')
    cfg.find_or_add_setting_by_class(unreal.MoviePipelineDeferredPassBase)
    cfg.find_or_add_setting_by_class(unreal.MoviePipelineImageSequenceOutput_PNG)
    aa=cfg.find_or_add_setting_by_class(unreal.MoviePipelineAntiAliasingSetting)
    aa.spatial_sample_count,aa.temporal_sample_count=4,4
    aa.override_anti_aliasing=True
    aa.anti_aliasing_method=unreal.AntiAliasingMethod.AAM_NONE
    aa.engine_warm_up_count,aa.render_warm_up_count=32,8
    console=cfg.find_or_add_setting_by_class(unreal.MoviePipelineConsoleVariableSetting)
    assert console.add_or_update_console_variable('r.MotionBlurQuality',4.)
    cfg.find_or_add_setting_by_class(unreal.MoviePipelineGameOverrideSetting).game_mode_override=unreal.MoviePipelineGameMode
    executor=unreal.MoviePipelinePIEExecutor()
    executor.set_is_rendering_offscreen(True)
    def failed(executor,pipeline,fatal,message):
        state.setdefault('errors',[]).append({'fatal':bool(fatal),'message':str(message)});save()
    def finished(executor,success):
        frames=sorted(OUTPUT.glob(SCENE+'.*.png'))
        state.update(status='rendered' if success else 'failed',nativeRenderSuccess=bool(success),frameCount=len(frames));save()
    executor.on_executor_errored_delegate.add_callable_unique(failed)
    executor.on_executor_finished_delegate.add_callable_unique(finished)
    unreal._week7_queue,unreal._week7_executor=queue,executor
    state.update(status='rendering',output=str(OUTPUT),temporalSamples=4,spatialSamples=4,motionBlurAmount=.25)
    save()
    unreal.get_editor_subsystem(unreal.MoviePipelineQueueSubsystem).render_queue_instance_with_executor_instance(queue,executor)


def widen_shared_opening():
    assert SCENE == 'P11'
    unreal.LevelSequenceEditorBlueprintLibrary.close_level_sequence()
    assert unreal.get_editor_subsystem(unreal.LevelEditorSubsystem).load_level(MAP)
    seq=unreal.load_asset(SEQ)
    b=next(b for b in seq.get_bindings() if b.get_name()=='Bills_ReviewCamera')
    for t in list(b.get_tracks()): b.remove_track(t)
    section=b.add_track(unreal.MovieScene3DTransformTrack).add_section()
    section.set_range(-1, END+1)
    full=unreal.Vector(-500,0,0)
    close=unreal.Vector(952-1452/1.08,0,0)
    def at(f):
        if f<30:return full+(close-full)*smooth(f/30)
        if f<=75:return close
        if f<125:return close+(full-close)*smooth((f-75)/50)
        return full
    for f in [-1,*range(126),END-1,END]:
        for ch,val in zip(section.get_all_channels(),[*xyz(at(f)),0,0,0,1,1,1]):
            ch.add_key(unreal.FrameNumber(f),val,interpolation=unreal.MovieSceneKeyInterpolation.LINEAR)
    assert unreal.EditorAssetLibrary.save_loaded_asset(seq)
    state.update(status='saved',allCardsProtected=True,maximumZoom=1.08,staticHoldFromFrame=125)
    save()


def repair_spoken_breakdown():
    """Restore approved Bills keys; Chiefs uses word cues and a fixed camera."""
    assert REVISION == 'v2' and SCENE in ['P11', 'P12']
    source_timing()
    state.update(editorialOverride='Stats follow Mark. Bills preserves approved pair-focus camera; Chiefs camera fixed. No animation out.',
                 individualSpokenBeatReveals=True, allEntrancesAtFrame=None)
    if SCENE == 'P11':
        assert END == 400
        source_root = '/Game/Lineups/BillsPerformanceMotionV1'
        source = unreal.load_asset(source_root + '/LS_BillsPerformanceMotionPairFocus')
        world = clone_map(source_root + '/LV_BillsPerformanceMotion')
        aa = {a.get_actor_label(): a for a in unreal.get_editor_subsystem(unreal.EditorActorSubsystem).get_all_level_actors()}
        seq = create_sequence()
        for old in source.get_bindings():
            actor = aa[old.get_name()]
            binding = seq.add_possessable(actor)
            for old_track in old.get_tracks():
                assert isinstance(old_track, unreal.MovieScene3DTransformTrack)
                section = binding.add_track(unreal.MovieScene3DTransformTrack).add_section()
                section.set_range(-1, END + 1)
                for before, after in zip(old_track.get_sections()[0].get_all_channels(), section.get_all_channels()):
                    keys = before.get_keys()
                    assert keys
                    for k in keys:
                        tm = k.get_time()
                        f = tm.frame_number.value + tm.sub_frame
                        if f <= END:
                            after.add_key(unreal.FrameNumber(tm.frame_number.value), k.get_value(), sub_frame=tm.sub_frame,
                                          interpolation=unreal.MovieSceneKeyInterpolation.LINEAR)
                    for f in [END - 1, END]:
                        after.add_key(unreal.FrameNumber(f), keys[-1].get_value(), interpolation=unreal.MovieSceneKeyInterpolation.LINEAR)
            if isinstance(actor, unreal.CineCameraActor):
                camera = actor
                cut(seq, binding)
        hold = 221
        state.update(sourceApprovedSequence=source.get_path_name(), approvedCameraKeysPreserved=True,
                     sourceAudioStartSeconds=636.10, leadInFrames=37, cueFrames=[43,63,151],
                     cueSeconds=[637.83,638.62,642.13], cardSettledFrames=[53,73,161],
                     cameraPairHoldFrames=[37,135], cameraStatic=False)
    else:
        assert END == 300
        source_root = '/Game/Lineups/Week7_P12_FinalV1'
        source = unreal.load_asset(source_root + '/LS_P12')
        finals = {}
        for b in source.get_bindings():
            if b.get_name().startswith('Chiefs_FactPanel_'):
                finals[b.get_name()] = [c.get_keys()[-1].get_value() for c in b.get_tracks()[0].get_sections()[0].get_all_channels()]
        world = clone_map(source_root + '/LV_P12')
        aa = {a.get_actor_label(): a for a in unreal.get_editor_subsystem(unreal.EditorActorSubsystem).get_all_level_actors()}
        seq = create_sequence()
        cues = state['sourceCues'][1:]
        black = dict(r=0., g=0., b=0., a=1.)
        for i in [1,3]:
            for stem in ['Chiefs_Value_', 'Chiefs_Label_']:
                comp = aa[stem+str(i)].get_component_by_class(unreal.Text3DComponent)
                editor_scene.set_values(comp.get_editor_property('material_extension'),
                                        {'frontColor':black,'bevelColor':black,'extrudeColor':black,'bIsUnlit':True})
        state['goldCardTextColor'] = '#000000'
        begins = [int(c['sceneTime'] * FPS + .5) for c in cues]
        assert begins == [0,83,198,248]
        for i, begin in enumerate(begins):
            panel = aa['Chiefs_FactPanel_' + str(i)]
            final = finals[panel.get_actor_label()]
            samples = []
            for f in sorted({-1,0,END-1,END,*range(begin,begin+11)}):
                u = 1 - (1 - min(1., max(0., (f-begin)/10)))**3
                factor = .92+.08*u
                values = [final[0]-90*(1-u),final[1],final[2]-470*(1-u),final[3],final[4]+4*(1-u),final[5],
                          *[v*factor for v in final[6:]]]
                samples.append((f,values))
            track(seq,panel,samples)
        camera = aa['Bills_ReviewCamera']
        cut(seq,track(seq,camera,[(-1,[-500,0,0,0,0,0,1,1,1]),(END,[-500,0,0,0,0,0,1,1,1])]))
        hold = 258
        state.update(sourceAudioStartSeconds=703.71,leadInFrames=0,cueFrames=begins,
                     cueSeconds=[c['transcriptTimestamp'] for c in cues],cardSettledFrames=[f+10 for f in begins],cameraStatic=True)
    save_scene(world,seq,camera,hold)
    # Save the evaluated terminal transforms, then verify no post-hold motion.
    for b in seq.get_bindings():
        for t in b.get_tracks():
            for section in t.get_sections():
                for ch in section.get_all_channels():
                    keys=ch.get_keys();last=keys[-1].get_value()
                    assert all(abs(k.get_value()-last)<.0001 for k in keys if k.get_time().frame_number.value>=hold)
    state['staticHoldVerified']=True
    save()


def build_matchup():
    """The approved Rams/Seahawks shell, with only team inputs replaced."""
    assert SCENE == 'A01'
    world=clone_map('/Game/Lineups/RamsSeahawksMotionV1/LV_RamsSeahawks')
    aa={a.get_actor_label():a for a in unreal.get_editor_subsystem(unreal.EditorActorSubsystem).get_all_level_actors()}
    native.ROOT=ROOT
    tools=unreal.AssetToolsHelpers.get_asset_tools()
    seq=create_sequence()
    def color(h):
        v=[int(h[i:i+2],16)/255 for i in (0,2,4)]
        return unreal.LinearColor(*[x/12.92 if x<=.04045 else ((x+.055)/1.055)**2.4 for x in v],1.)
    specs=[('Rams','Browns',-64,'CLEVELAND BROWNS','#9',{'TeamPanel':'FF3C00','RaisedStripe':'B42E00','TeamAccent':'311D00'}),
           ('Seahawks','Ravens',64,'BALTIMORE RAVENS','#10',{'TeamPanel':'241773','RaisedStripe':'17103D','TeamAccent':'9E7C0C'})]
    texts=[]
    roots=[]
    for old,team,x,name,rank,palette in specs:
        root=aa[old+'_Card']
        root.set_actor_location(unreal.Vector(x,0,0),False,False)
        root.set_actor_rotation(unreal.Rotator(),False)
        root.set_actor_scale3d(unreal.Vector(1,1,1))
        root.set_actor_label(team+'_Card')
        mesh=root.static_mesh_component.static_mesh
        for i,slot in enumerate(mesh.static_materials):
            key=str(slot.material_slot_name)
            if key in palette:
                parent=root.static_mesh_component.get_material(i)
                mi=tools.duplicate_asset('MI_'+team+'_'+key,ROOT+'/Materials',parent)
                assert mi
                unreal.MaterialEditingLibrary.set_material_instance_vector_parameter_value(mi,'BaseColorFactor',color(palette[key]))
                assert unreal.EditorAssetLibrary.save_loaded_asset(mi)
                root.static_mesh_component.set_material(i,mi)
        logo=aa[old+'_Logo']
        asset=unreal.load_asset('/Game/Lineups/TeamCardsV1/Meshes/SM_'+team+'_Beveled')
        assert asset
        logo.static_mesh_component.set_static_mesh(asset)
        for i,slot in enumerate(asset.static_materials):
            material=unreal.load_asset('/Game/Lineups/TeamCardsV1/Materials/M_'+team+('_LogoFace' if str(slot.material_slot_name)=='Face' else '_LogoEdge'))
            assert material
            logo.static_mesh_component.set_material(i,material)
        logo.set_actor_rotation(unreal.Rotator(yaw=-90),False)
        logo.set_actor_scale3d(unreal.Vector(1,-1,1))
        origin,e=logo.get_actor_bounds(False)
        factor=min(82/(2*e.x),55/(2*e.z))
        logo.set_actor_scale3d(unreal.Vector(factor,-factor,factor))
        origin,e=logo.get_actor_bounds(False)
        logo.set_actor_location(logo.get_actor_location()+unreal.Vector(x,5,13)-origin,False,False)
        logo.set_actor_label(team+'_Logo')
        for suffix,copy,z,w,h in [('Name',name,-36.6,87,9),('Record',rank,-19.5,40,12)]:
            a=aa[old+'_'+suffix]
            a.set_actor_label(team+'_'+suffix)
            a.get_component_by_class(unreal.Text3DComponent).set_editor_property('text',copy)
            texts.append((a,w,h,unreal.Vector(x,5,z)))
        shadow=aa[old+'_TurfContactShadow'];shadow.set_actor_label(team+'_TurfContactShadow')
        roots.append(root)
    source=Path('/Volumes/HomeSSD/Generated/CATENA_MEDIA_LINEUPS/source/team-logo-cards/browns-ravens-stadium-dry-v2.png')
    texture=editor_scene.import_texture('Stadium',{'path':str(source),'sha256':hashlib.sha256(source.read_bytes()).hexdigest()},ROOT)
    aa['Stadium_Backdrop'].static_mesh_component.set_material(0,native.material('M_Stadium',texture,(.62,.62,.62),unlit=True))
    aa['CardLight_Blue'].get_component_by_class(unreal.RectLightComponent).set_light_color(color('FF3C00'),False)
    aa['CardLight_Green'].get_component_by_class(unreal.RectLightComponent).set_light_color(color('4930A3'),False)
    # The fixed VS uses its own collection, so episode playback cannot alter the master.
    collection=tools.duplicate_asset('MPC_VSFade',ROOT,unreal.load_asset('/Game/Lineups/RamsSeahawksMotionV1/MPC_VSFade'))
    material=tools.duplicate_asset('M_VSFade',ROOT+'/Materials',unreal.load_asset('/Game/Lineups/RamsSeahawksMotionV1/Materials/M_VSFade'))
    for e in unreal.ObjectIterator():
        if isinstance(e,unreal.MaterialExpressionCollectionParameter) and e.get_outer()==material:
            e.set_editor_property('collection',collection)
    unreal.MaterialEditingLibrary.recompile_material(material)
    assert unreal.EditorAssetLibrary.save_loaded_asset(material)
    assert unreal.EditorAssetLibrary.save_loaded_asset(collection)
    aa['VS_Fade'].static_mesh_component.set_material(0,material)
    headline=native.spawn(unreal.Text3DActor,'BrownsRavens_Headline',unreal.Vector(0,5,60),unreal.Rotator(yaw=-90))
    c=headline.get_component_by_class(unreal.Text3DComponent)
    c.set_editor_property('font',unreal.load_asset('/Game/Lineups/ReviewV1/Widgets/Fonts/c6d5e1a6d369/BebasBoldSaved_Font'))
    c.set_editor_property('font_size',18.)
    c.set_editor_property('text','BROWNS WON HEAD-TO-HEAD')
    editor_scene.set_values(c.get_editor_property('layout_extension'),{'horizontalAlignment':'Center','verticalAlignment':'Center'})
    editor_scene.set_values(c.get_editor_property('geometry_extension'),{'extrude':.12,'bevel':.05,'bevelSegments':3})
    white={'r':.92,'g':.94,'b':.98,'a':1.}
    editor_scene.set_values(c.get_editor_property('material_extension'),{'style':'Solid','frontColor':white,'bevelColor':white,'extrudeColor':white,'bIsUnlit':True})
    texts.append((headline,220,11,unreal.Vector(0,5,60)))
    ticks=[0]
    def finish(dt):
        ticks[0]+=1
        if ticks[0]<25:return
        try:
            if any(a.get_actor_bounds(False)[1].x<.01 for a,*_ in texts):
                assert ticks[0]<250,'Text geometry unavailable'
                return
            unreal.unregister_slate_post_tick_callback(unreal._week7_layout_tick)
            for a,w,h,center in texts:
                a.set_actor_scale3d(unreal.Vector(1,1,1))
                origin,e=a.get_actor_bounds(False)
                factor=min(w/(2*e.x),h/(2*e.z))
                a.set_actor_scale3d(unreal.Vector(factor,factor,factor))
                origin,e=a.get_actor_bounds(False)
                a.set_actor_location(a.get_actor_location()+center-origin,False,False)
            for root,sign in zip(roots,[-1,1]):
                final=root.get_actor_location();samples=[]
                for f in [-1,*range(34),END-1,END]:
                    u=1-(1-min(1.,max(0.,f/33)))**3
                    loc=unreal.Vector(sign*205,-14,0)+(final-unreal.Vector(sign*205,-14,0))*u
                    samples.append((f,[*xyz(loc),0,0,sign*8*(1-u),1,1,1]))
                track(seq,root,samples)
            camera=aa['RamsSeahawks_Camera']
            samples=[]
            for f in [-1,*range(51),END-1,END]:
                y=261-8*smooth(f/50)
                samples.append((f,[0,y,-3,0,0,-90,1,1,1]))
            cut(seq,track(seq,camera,samples))
            t=seq.add_track(unreal.MovieSceneMaterialParameterCollectionTrack)
            t.set_editor_property('mpc',collection)
            section=t.add_section();section.set_range(-1,END+1)
            rate=seq.get_tick_resolution()
            for f,value in [(-1,0.),(0,0.),(50,0.),(63,1.),(END,1.)]:
                section.add_scalar_parameter_key('Opacity',unreal.FrameNumber(round(f*rate.numerator/(FPS*rate.denominator))),value)
            state.update(teams=['Browns','Ravens'],ranks=['#9','#10'],cardSettledFrame=33,vsStationary=True,vsFadeFrames=[50,63],cardBoundFieldShadows=True,sharedShell='/Game/Lineups/TeamCardShellV1',sourceMaster='/Game/Lineups/RamsSeahawksMotionV1')
            save_scene(world,seq,camera,64)
        except Exception:
            state.update(status='failed',error=traceback.format_exc());save();raise
    unreal._week7_layout_tick=unreal.register_slate_post_tick_callback(finish)
    state['status']='waiting-for-text';save()


def refine_matchup_logos():
    assert SCENE=='A01'
    unreal.LevelSequenceEditorBlueprintLibrary.close_level_sequence()
    world=unreal.get_editor_subsystem(unreal.UnrealEditorSubsystem).get_editor_world()
    assert world.get_path_name().split('.')[0]==MAP, 'Open the owned scene before refining logos'
    aa={a.get_actor_label():a for a in unreal.get_editor_subsystem(unreal.EditorActorSubsystem).get_all_level_actors()}
    manifest=json.loads(Path('/Volumes/HomeSSD/Generated/CATENA_MEDIA_LINEUPS/source/browns-ravens-vector-logos-v3/manifest.json').read_text())
    result=[]
    for team,x in [('Browns',-64),('Ravens',64)]:
        source=manifest[team]
        assert hashlib.sha256(Path(source['path']).read_bytes()).hexdigest()==source['sha256']
        folder=ROOT+'/VectorLogosV3/'+team
        assert not unreal.EditorAssetLibrary.list_assets(folder,recursive=True),'Preserve imported logo version'
        task=unreal.AssetImportTask()
        for k,v in dict(filename=source['path'],destination_path=folder,automated=True,save=True,replace_existing=False).items():task.set_editor_property(k,v)
        unreal.AssetToolsHelpers.get_asset_tools().import_asset_tasks([task])
        meshes=[unreal.load_asset(p) for p in unreal.EditorAssetLibrary.list_assets(folder,recursive=True)]
        meshes=[m for m in meshes if isinstance(m,unreal.StaticMesh)]
        assert len(meshes)==1
        a=aa[team+'_Logo'];c=a.static_mesh_component
        c.set_static_mesh(meshes[0])
        for i,slot in enumerate(meshes[0].static_materials):c.set_material(i,slot.material_interface)
        a.set_actor_rotation(unreal.Rotator(),False)
        a.set_actor_scale3d(unreal.Vector(1,1,1))
        origin,e=a.get_actor_bounds(False)
        factor=min(82/(e.x*2),50/(e.z*2))
        a.set_actor_scale3d(unreal.Vector(factor,factor,factor))
        origin,e=a.get_actor_bounds(False)
        a.set_actor_location(a.get_actor_location()+unreal.Vector(x,5,15)-origin,False,False)
        origin,e=a.get_actor_bounds(False)
        rank_center,rank_ext=aa[team+'_Record'].get_actor_bounds(False)
        gap=(origin.z-e.z)-(rank_center.z+rank_ext.z)
        assert gap>=3.4,(team,gap)
        result.append({'team':team,'nativeMesh':meshes[0].get_path_name(),'source':source,'logoCenterZ':origin.z,'rankGapWorldUnits':gap})
    assert unreal.EditorLoadingAndSavingUtils.save_map(world,MAP)
    state.update(status='saved',logos=result,logoPlaneZ=15,maximumLogoHeight=50)
    save()


def export_completed_matchup():
    """Copy the approved scene and bind its original motion to the owned actors."""
    assert SCENE=='S03'
    clone_map('/Game/Lineups/RamsSeahawksMotionV1/LV_RamsSeahawks')
    repair_completed_matchup_camera()


def repair_completed_matchup_camera():
    assert SCENE=='S03'
    unreal.LevelSequenceEditorBlueprintLibrary.close_level_sequence()
    world=unreal.get_editor_subsystem(unreal.UnrealEditorSubsystem).get_editor_world()
    assert world.get_path_name().split('.')[0]==MAP
    aa={a.get_actor_label():a for a in unreal.get_editor_subsystem(unreal.EditorActorSubsystem).get_all_level_actors()}
    source=unreal.load_asset('/Game/Lineups/RamsSeahawksMotionV1/LS_RamsSeahawks')
    assert unreal.EditorAssetLibrary.get_metadata_tag(source,'LineupsOwner')=='lineups-rams-seahawks-motion-v1'
    seq=create_sequence();camera_binding=None
    for old in source.get_bindings():
        actor=aa[old.get_name()];binding=seq.add_possessable(actor)
        if isinstance(actor,unreal.CineCameraActor):camera_binding=binding
        for t in old.get_tracks():
            assert isinstance(t,unreal.MovieScene3DTransformTrack)
            new=binding.add_track(unreal.MovieScene3DTransformTrack).add_section();new.set_range(-1,END+1)
            sections=t.get_sections();assert len(sections)==1
            for old_ch,new_ch in zip(sections[0].get_all_channels(),new.get_all_channels()):
                keys=old_ch.get_keys();assert keys
                for k in keys:
                    time=k.get_time();f=(time.frame_number.value+time.sub_frame)*FPS/30
                    whole=math.floor(f)
                    new_ch.add_key(unreal.FrameNumber(whole),k.get_value(),sub_frame=f-whole,interpolation=unreal.MovieSceneKeyInterpolation.LINEAR)
                for f in [END-1,END]:new_ch.add_key(unreal.FrameNumber(f),keys[-1].get_value(),interpolation=unreal.MovieSceneKeyInterpolation.LINEAR)
    assert camera_binding
    cut(seq,camera_binding)
    collection=unreal.load_asset('/Game/Lineups/RamsSeahawksMotionV1/MPC_VSFade')
    t=seq.add_track(unreal.MovieSceneMaterialParameterCollectionTrack);t.set_editor_property('mpc',collection)
    section=t.add_section();section.set_range(-1,END+1);rate=seq.get_tick_resolution()
    for seconds,value in [(0,0.),(2,0.),(2.5,1.),(10,1.)]:
        section.add_scalar_parameter_key('Opacity',unreal.FrameNumber(round(seconds*rate.numerator/rate.denominator)),value)
    state.update(sourceMaster='/Game/Lineups/RamsSeahawksMotionV1',approvedMotionPreservedInSeconds=True,
                 cameraReboundToOwnedActor=True,allEntrancesAtFrame=None,entranceFrames=[0,3],
                 vsStationary=True,vsFadeSeconds=[2,2.5],editorialOverride='Copy exact approved 30fps key times to 25fps subframes; new native camera binding; extend static hold only')
    save_scene(world,seq,aa['RamsSeahawks_Camera'],64)


def verify_finals():
    rows=[]
    for scene,hold in [('A01',64),('P11',125),('P12',105),('S03',64)]:
        root='/Game/Lineups/Week7_'+scene+'_FinalV1'
        path=root+('/LS_S03_Final' if scene=='S03' else '/LS_'+scene)
        seq=unreal.load_asset(path);assert seq
        assert unreal.EditorAssetLibrary.get_metadata_tag(seq,'LineupsOwner')=='lineups-week7-'+scene.lower()+'-final-v1'
        rate=seq.get_display_rate();assert rate.numerator==25 and rate.denominator==1
        assert seq.get_playback_start()==0 and seq.get_playback_end()==250
        transforms=[]
        for b in seq.get_bindings():
            for t in b.get_tracks():
                assert isinstance(t,unreal.MovieScene3DTransformTrack)
                for section in t.get_sections():
                    for ch in section.get_all_channels():
                        keys=ch.get_keys();assert keys
                        final=keys[-1].get_value()
                        for k in keys:
                            time=k.get_time();f=time.frame_number.value+time.sub_frame
                            if f>=hold:assert abs(k.get_value()-final)<.0001,(scene,b.get_name(),f)
                        assert keys[-1].get_time().frame_number.value>=249
                transforms.append(b.get_name())
        master=[t.get_class().get_name() for t in seq.get_tracks()]
        assert set(master)<=set(['MovieSceneCameraCutTrack','MovieSceneMaterialParameterCollectionTrack'])
        assert master.count('MovieSceneCameraCutTrack')==1
        rows.append({'sceneId':scene,'sequence':path,'fps':25,'sequenceFrames':250,'nativeHoldFromFrame':hold,'staticTransformBindings':transforms,'masterTracks':master,'animationOut':False})
    state.update(status='passed',scenes=rows)
    save()


try:
    assert Path(unreal.Paths.convert_relative_path_to_full(unreal.Paths.project_dir())).resolve()==PROJECT
    if REQUEST['operation']=='build':
        source_timing()
        assert SCENE in ['P11','P12','A01','S03']
        if SCENE=='A01':build_matchup()
        elif SCENE=='S03':export_completed_matchup()
        else:build_breakdown()
    elif REQUEST['operation']=='render':
        render()
    elif REQUEST['operation']=='widen':
        widen_shared_opening()
    elif REQUEST['operation']=='repair-spoken':
        repair_spoken_breakdown()
    elif REQUEST['operation']=='logos':
        refine_matchup_logos()
    elif REQUEST['operation']=='repair-camera':
        source_timing();repair_completed_matchup_camera()
    elif REQUEST['operation']=='verify':
        verify_finals()
    else:
        raise ValueError('Unsupported operation')
except Exception:
    state.update(status='failed',error=traceback.format_exc());save();raise
