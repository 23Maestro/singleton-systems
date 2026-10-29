"""Build a native 3D Lineups review scene and a Movie Render Queue job.

The 7-second range is a visual review window. It ends during the hold and is
not a Mark/Manim editorial duration or an exit cue.
"""
import hashlib
import json
import sys
import traceback
from pathlib import Path
import unreal

REPO = Path('/Users/singleton23/Documents/Development/singleton-systems')
PROJECT = Path('/Volumes/UnrealSSD/Generated/CATENA_MEDIA_LINEUPS/source/unreal/projects/SportsBroadcastTrial58')
RECEIPT = PROJECT.parent.parent / 'receipts/lineups-review-export.json'
OUTPUT = Path('/Volumes/HomeSSD/Generated/CATENA_MEDIA_LINEUPS/renders/unreal-comparison-review-v1')
ROOT = '/Game/Lineups/ReviewV1'
MAP = ROOT + '/LV_ComparisonReview'
SEQ = ROOT + '/LS_ComparisonReview'
FPS, END = 30, 210
sys.path.insert(0, str(REPO / 'tools/lineups_unreal'))
import editor_scene

STATE = {'status':'building','project':str(PROJECT),'map':MAP,'sequence':SEQ,
         'output':str(OUTPUT),'editorialTimingApproved':False,'visualDemoOnly':True,
         'exitCue':None,'reviewWindowSeconds':7,'errors':[]}
def receipt():
    RECEIPT.write_text(json.dumps(STATE, indent=2)+'\n')
def setp(obj, **props):
    for key,value in props.items(): obj.set_editor_property(key,value)
def vec(x,y,z): return unreal.Vector(x,y,z)
def pos(px,py,depth):
    scale=(230+depth)/230*.1
    return vec(depth,(px-960)*scale,(540-py)*scale)
def spawn(cls,label,location=unreal.Vector(),rotation=unreal.Rotator()):
    a=unreal.get_editor_subsystem(unreal.EditorActorSubsystem).spawn_actor_from_class(cls,location,rotation)
    a.set_actor_label(label); return a

def material(name,texture=None,color=(1,1,1),unlit=False,masked=False,metallic=.12,roughness=.55):
    p=ROOT+'/Materials/'+name
    m=unreal.load_asset(p)
    if m:
        unreal.MaterialEditingLibrary.delete_all_material_expressions(m)
    else:
        m=unreal.AssetToolsHelpers.get_asset_tools().create_asset(name,ROOT+'/Materials',unreal.Material,unreal.MaterialFactoryNew())
    setp(m,two_sided=True)
    setp(m,shading_model=unreal.MaterialShadingModel.MSM_UNLIT if unlit else unreal.MaterialShadingModel.MSM_DEFAULT_LIT)
    if masked:setp(m,blend_mode=unreal.BlendMode.BLEND_MASKED,opacity_mask_clip_value=.02)
    ml=unreal.MaterialEditingLibrary
    if texture:
        t=ml.create_material_expression(m,unreal.MaterialExpressionTextureSample);setp(t,texture=texture)
        mult=ml.create_material_expression(m,unreal.MaterialExpressionMultiply)
        tint=ml.create_material_expression(m,unreal.MaterialExpressionConstant3Vector);setp(tint,constant=unreal.LinearColor(*color,1))
        ml.connect_material_expressions(t,'RGB',mult,'A');ml.connect_material_expressions(tint,'',mult,'B')
        ml.connect_material_property(mult,'',unreal.MaterialProperty.MP_EMISSIVE_COLOR if unlit else unreal.MaterialProperty.MP_BASE_COLOR)
        if masked:ml.connect_material_property(t,'A',unreal.MaterialProperty.MP_OPACITY_MASK)
    else:
        v=ml.create_material_expression(m,unreal.MaterialExpressionConstant3Vector);setp(v,constant=unreal.LinearColor(*color,1))
        ml.connect_material_property(v,'',unreal.MaterialProperty.MP_EMISSIVE_COLOR if unlit else unreal.MaterialProperty.MP_BASE_COLOR)
    for prop,value in [(unreal.MaterialProperty.MP_METALLIC,metallic),(unreal.MaterialProperty.MP_ROUGHNESS,roughness)]:
        v=ml.create_material_expression(m,unreal.MaterialExpressionConstant);setp(v,r=value);ml.connect_material_property(v,'',prop)
    ml.recompile_material(m);unreal.EditorAssetLibrary.save_loaded_asset(m);return m

def mesh(name,source):
    path=ROOT+'/Meshes/'+name
    if unreal.EditorAssetLibrary.does_asset_exist(path):return unreal.load_asset(path)
    ui=unreal.FbxImportUI();setp(ui,import_mesh=True,import_materials=False,import_textures=False,import_as_skeletal=False,automated_import_should_detect_type=False,mesh_type_to_import=unreal.FBXImportType.FBXIT_STATIC_MESH)
    data=ui.static_mesh_import_data
    setp(data,combine_meshes=True,convert_scene=False,convert_scene_unit=False,force_front_x_axis=False,auto_generate_collision=False,normal_import_method=unreal.FBXNormalImportMethod.FBXNIM_COMPUTE_NORMALS)
    task=unreal.AssetImportTask();setp(task,filename=str(source),destination_path=ROOT+'/Meshes',destination_name=name,automated=True,save=True,replace_existing=False,options=ui)
    unreal.AssetToolsHelpers.get_asset_tools().import_asset_tasks([task]);m=unreal.load_asset(path)
    if not isinstance(m,unreal.StaticMesh):raise RuntimeError('Mesh import failed: '+name)
    return m

def mesh_actor(label,mesh_asset,mat,location,scale,rotation=unreal.Rotator()):
    a=spawn(unreal.StaticMeshActor,label,location,rotation);c=a.static_mesh_component;c.set_static_mesh(mesh_asset);c.set_material(0,mat);c.set_mobility(unreal.ComponentMobility.MOVABLE);a.set_actor_scale3d(scale);return a

def widget_actor(label,widget_bp,depth):
    a=spawn(unreal.Actor,label)
    sub=unreal.get_engine_subsystem(unreal.SubobjectDataSubsystem)
    handle=sub.k2_gather_subobject_data_for_instance(a)[0]
    h,reason=sub.add_new_subobject(unreal.AddNewSubobjectParams(parent_handle=handle,new_class=unreal.WidgetComponent))
    data=unreal.SubobjectDataBlueprintFunctionLibrary.get_data(h)
    obj=unreal.SubobjectDataBlueprintFunctionLibrary.get_associated_object(data)
    if not isinstance(obj,unreal.WidgetComponent):raise RuntimeError('Widget component creation failed: '+str(reason))
    setp(obj,widget_class=widget_bp.generated_class(),draw_size=unreal.IntPoint(1920,1080),blend_mode=unreal.WidgetBlendMode.TRANSPARENT,tick_when_offscreen=True,is_two_sided=True)
    obj.set_mobility(unreal.ComponentMobility.MOVABLE)
    a.set_actor_location(vec(depth,0,0),False,False);a.set_actor_rotation(unreal.Rotator(pitch=0,yaw=180,roll=0),False)
    f=(230+depth)/230*.1;a.set_actor_scale3d(vec(f,f,f))
    return a

def key_transform(seq,a,keys):
    b=seq.add_possessable(a);t=b.add_track(unreal.MovieScene3DTransformTrack);s=t.add_section();s.set_range(0,END)
    channels=s.get_all_channels()
    for frame,loc,scale in keys:
        rot=a.get_actor_rotation();vals=[loc.x,loc.y,loc.z,rot.roll,rot.pitch,rot.yaw,scale.x,scale.y,scale.z]
        for ch,value in zip(channels,vals):ch.add_key(unreal.FrameNumber(frame),value,interpolation=unreal.MovieSceneKeyInterpolation.AUTO)
    return b

def visible_after(seq,a,frame):
    b=seq.add_possessable(a);t=b.add_track(unreal.MovieSceneVisibilityTrack);t.set_property_name_and_path('bHidden','bHidden');s=t.add_section();s.set_range(0,END);ch=s.get_all_channels()[0]
    ch.add_key(unreal.FrameNumber(0),False);ch.add_key(unreal.FrameNumber(frame),True)

def build():
    assert Path(unreal.Paths.convert_relative_path_to_full(unreal.Paths.project_dir())).resolve()==PROJECT.resolve()
    assert OUTPUT.parent.is_dir() and PROJECT.joinpath('LineupsSportsTrial.uproject').is_file()
    if unreal.EditorAssetLibrary.does_asset_exist(SEQ):
        raise RuntimeError('Review sequence already exists; preserve it and choose a new version')
    contract=json.loads((REPO/'config/unreal/comparison-motion-contract.json').read_text())
    assert contract['status']=='approved' and contract['layout']['cardMinimumFontSize']>=36
    request=json.loads((REPO/'config/unreal/comparison-statistics-trial.json').read_text())
    config=json.loads((REPO/'config/unreal/comparison-template.json').read_text());config['contentRoot']=ROOT+'/Widgets'
    # Work only in a separate native copy. Existing source and approved trial stay intact.
    if not unreal.EditorAssetLibrary.does_asset_exist(MAP):
        if not unreal.EditorLevelLibrary.new_level(MAP):
            raise RuntimeError('Could not create the separate review map')
    world=unreal.get_editor_subsystem(unreal.UnrealEditorSubsystem).get_editor_world()
    if world.get_path_name().split('.')[0] != MAP:
        raise RuntimeError('Open the saved review map directly before building; no in-process world duplication')
    for name in ['Scene_Rig_Lights','Scene_Rig_Shared','Scene_Rig_TeamData']:
        level=unreal.GameplayStatics.get_streaming_level(world,name)
        if level:
            level.set_should_be_visible(False)
            level.set_editor_property('should_be_visible_in_editor',False)
    actors=unreal.get_editor_subsystem(unreal.EditorActorSubsystem)
    for a in actors.get_all_level_actors():
        if a.get_actor_label().startswith('LineupsReview_'):
            actors.destroy_actor(a)
        elif isinstance(a,unreal.Light):
            pass
        else:
            a.set_actor_hidden_in_game(True);a.set_is_temporarily_hidden_in_editor(True)
    texture={k:editor_scene.import_texture(k,v,config['contentRoot']) for k,v in config['assets'].items()}
    api=unreal.get_default_object(unreal.UMGToolSet)
    widgets={}
    for layer in ['Titles','Card']:
        req={**request,'assetName':'WBP_Review'+layer}
        proof=editor_scene.apply_request(req,config);bp=unreal.load_asset(proof['assetPath']);tree=api.call_method('GetWidgets',args=(bp,))
        for info in tree.widgets:
            n=str(info.widget_name)
            hide=n in ['Background','leftLogo','rightLogo','leftPlayer','rightPlayer']
            if layer=='Titles':hide=hide or n=='StatCard'
            else:hide=hide or n in ['Headline','leftName','rightName','leftNamePlate','rightNamePlate','leftNameEdge','rightNameEdge']
            if hide:editor_scene.set_values(info.widget,{'visibility':'Collapsed'})
        assert api.call_method('CompileWidgetBlueprint',args=(bp,));assert unreal.EditorAssetLibrary.save_loaded_asset(bp)
        widgets[layer]=bp
    geom=PROJECT/'SourceArt/LineupsReview'
    quad=mesh('SM_ReviewQuad',geom/'quad.obj')
    bgmat=material('M_Backdrop',texture['background'],(.65,.65,.65),False,False,.12,.65)
    bg=mesh_actor('LineupsReview_Backdrop',quad,bgmat,pos(960,540,22),vec(1,-1920*.109565*1.04,1080*.109565*1.04))
    player_actors=[]
    for side,cx in [('left',395),('right',1555)]:
        depth=-12;factor=(230+depth)/230*.1
        mat=material('M_'+side+'Player',texture[side+'Player'],unlit=True,masked=True)
        a=mesh_actor('LineupsReview_'+side+'Player',quad,mat,pos(cx,225+1150/3,depth),vec(1,-1150*factor,(1150*2/3)*factor));a.static_mesh_component.set_cast_shadow(False);player_actors.append(a)
    for side,cx,color in [('left',400,(.2,.04,.02)),('right',1520,(.02,.07,.2))]:
        m=mesh('SM_'+side+'LogoSmooth',geom/(side+'LogoSmooth.obj'))
        front=material('M_'+side+'LogoFace',texture[side+'Logo'],(.3,.3,.3),False,False,.28,.4)
        edge=material('M_'+side+'LogoEdge',color=color,metallic=.55,roughness=.36)
        a=mesh_actor('LineupsReview_'+side+'Logo',m,front,pos(cx,350,3),vec(.12,-.12,.12));a.static_mesh_component.set_material(1,edge)
    titles=widget_actor('LineupsReview_Titles',widgets['Titles'],-28)
    card=widget_actor('LineupsReview_Card',widgets['Card'],-30)
    plate_mat=material('M_CardBody',color=(.008,.009,.012),metallic=.15,roughness=.55)
    factor=200/230*.1
    plate=mesh_actor('LineupsReview_CardBody',unreal.load_asset('/Engine/BasicShapes/Cube.Cube'),plate_mat,pos(960,752.5,-29.2),vec(.008,860*factor/100,345*factor/100))
    # Recreate the sample's four-light roles in this separate shallow set.
    specs={'RectLight_2_EdgeLight_L':((-40,-105,20),(0,55,0),(1,.035,.018),2200),
           'RectLight_2_EdgeLight_R':((-40,105,20),(0,-55,0),(.018,.12,1),2200),
           'RectLight_1_Logo_Bottom':((-35,0,-65),(45,0,0),(.7,.8,1),450),
           'RectLight_0_Ambient_Straight':((-95,0,95),(-35,0,0),(1,.94,.86),1500)}
    lights=[]
    for label,(loc,rot,col,power) in specs.items():
        a=spawn(unreal.RectLight,'LineupsReview_'+label,vec(*loc),unreal.Rotator(pitch=rot[0],yaw=rot[1],roll=rot[2]))
        lc=a.get_component_by_class(unreal.LightComponent)
        lc.set_light_color(unreal.LinearColor(*col,1),False);lc.set_intensity(power/500)
        lc.set_editor_property('source_width',45.0);lc.set_editor_property('source_height',25.0)
        lights.append(label)
    camera=spawn(unreal.CineCameraActor,'LineupsReview_Camera',vec(-238,0,0))
    cc=camera.get_cine_camera_component();setp(cc,filmback=unreal.CameraFilmbackSettings(sensor_width=36,sensor_height=20.25),current_focal_length=43.125,current_aperture=8)
    focus=cc.focus_settings;focus.focus_method=unreal.CameraFocusMethod.DISABLE;cc.focus_settings=focus
    pp=cc.post_process_settings;pp.override_motion_blur_amount=True;pp.motion_blur_amount=0;pp.override_auto_exposure_method=True;pp.auto_exposure_method=unreal.AutoExposureMethod.AEM_MANUAL;pp.override_auto_exposure_apply_physical_camera_exposure=True;pp.auto_exposure_apply_physical_camera_exposure=False;pp.override_bloom_intensity=True;pp.bloom_intensity=.1;cc.post_process_settings=pp
    seq=unreal.AssetToolsHelpers.get_asset_tools().create_asset('LS_ComparisonReview',ROOT,unreal.LevelSequence,unreal.LevelSequenceFactoryNew())
    seq.set_display_rate(unreal.FrameRate(FPS,1));seq.set_playback_start(0);seq.set_playback_end(END)
    cam_binding=key_transform(seq,camera,[(0,vec(-238,0,0),vec(1,1,1)),(32,vec(-231,0,0),vec(1,1,1)),(48,vec(-230,0,0),vec(1,1,1)),(END,vec(-230,0,0),vec(1,1,1))])
    cut=seq.add_track(unreal.MovieSceneCameraCutTrack).add_section();cut.set_range(0,END);bid=unreal.MovieSceneObjectBindingID();bid.set_editor_property('guid',cam_binding.get_id());cut.set_camera_binding_id(bid)
    for idx,a in enumerate(player_actors):
        final=a.get_actor_location();start=vec(final.x,final.y+(-8 if idx==0 else 8),final.z-1);middle=vec(final.x,final.y+(-1 if idx==0 else 1),final.z-.1);sc=a.get_actor_scale3d();begin=7+idx*3
        key_transform(seq,a,[(0,start,sc),(begin,start,sc),(begin+13,middle,sc),(begin+21,final,sc),(END,final,sc)]);visible_after(seq,a,begin)
    visible_after(seq,titles,25)
    for a in [card,plate]:
        final=a.get_actor_location();sc=a.get_actor_scale3d();start=vec(final.x,final.y,final.z+2)
        key_transform(seq,a,[(0,start,sc),(33,start,sc),(43,vec(final.x,final.y,final.z+.2),sc),(49,final,sc),(END,final,sc)]);visible_after(seq,a,33)
    unreal.EditorAssetLibrary.set_metadata_tag(seq,'LineupsTiming','visual-demo-only; export ends during hold; Mark/Manim cues required')
    unreal.EditorAssetLibrary.save_loaded_asset(seq)
    world=unreal.get_editor_subsystem(unreal.UnrealEditorSubsystem).get_editor_world();assert unreal.EditorLoadingAndSavingUtils.save_map(world,MAP)
    unreal.LevelSequenceEditorBlueprintLibrary.open_level_sequence(seq);unreal.LevelSequenceEditorBlueprintLibrary.set_current_time(100)
    STATE.update(status='built',widgets={k:v.get_path_name() for k,v in widgets.items()},sourceInspiredLightRoles=lights,frameRate=FPS,frameCount=END,contractSha256=hashlib.sha256((REPO/'config/unreal/comparison-motion-contract.json').read_bytes()).hexdigest())
    receipt();unreal.log('LINEUPS_REVIEW_BUILD_PASSED')

if __name__ == '__main__':
    try:
        build()
    except Exception:
        STATE['status']='build-failed';STATE['errors'].append(traceback.format_exc());receipt();raise
