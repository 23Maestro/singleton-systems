"""Build the approved full-body visual demo with coupled, restrained motion.

The generated cutouts are an explicit demo exception. Production uses mask-only
extraction. This eight-second export ends during the hold, with no exit cue.
"""
import hashlib
import json
from pathlib import Path
import sys
import traceback
import unreal

REPO=Path('/Users/singleton23/Documents/Development/singleton-systems')
sys.path.insert(0,str(REPO/'tools/lineups_unreal'))
import editor_scene
import build_review_export as native
native.END=480
ROOT='/Game/Lineups/ReviewV1'
SEQ=ROOT+'/LS_FullBodySmoothReview'
PROJECT=native.PROJECT
PROOF=PROJECT.parent.parent/'receipts/lineups-review-export.json'
REVIEW=PROJECT.parent.parent/'receipts/fullbody-smooth-build.json'
FPS,END=60,480
state={'status':'building','errors':[],'visualDemoOnly':True,'demoImageryException':True}

def save(): REVIEW.write_text(json.dumps(state,indent=2)+'\n')
def smooth(t):return t*t*t*(t*(t*6-15)+10)
def ease_out(t):return 1-(1-t)**4

def samples(start,duration,fn):
    times=sorted(set([0,start,start+duration,END]+list(range(start,start+duration+1,2))))
    return [(f,fn(max(0.,min(1.,(f-start)/duration)))) for f in times]

def transform(seq,a,start,duration,dy=0.,dz=0.,camera=False):
    end=a.get_actor_location();sc=a.get_actor_scale3d()
    keys=[]
    for f,p in samples(start,duration,smooth if camera else ease_out):
        loc=native.vec(end.x-4*(1-p) if camera else end.x,end.y+dy*(1-p),end.z+dz*(1-p))
        keys.append((f,loc,sc))
    binding=native.key_transform(seq,a,keys)
    for track in binding.get_tracks():
        for section in track.get_sections():
            for channel in section.get_all_channels():
                for key in channel.get_keys():key.set_interpolation_mode(unreal.RichCurveInterpMode.RCIM_LINEAR)
    return binding

def component_binding(seq,component,parent):
    binding=seq.add_possessable(component);binding.set_parent(parent);return binding

def material_fade(seq,component,parent,start,duration):
    binding=component_binding(seq,component,parent)
    track=binding.add_track(unreal.MovieSceneComponentMaterialTrack)
    info=unreal.ComponentMaterialInfo(material_slot_index=0,material_type=unreal.ComponentMaterialType.INDEXED_MATERIAL)
    track.set_material_info(info);section=track.add_section();section.set_range(0,END)
    ticks=seq.get_tick_resolution().numerator/seq.get_tick_resolution().denominator/FPS
    for frame,value in samples(start,duration,smooth):
        section.add_scalar_parameter_key(unreal.MaterialParameterInfo(name='Reveal'),unreal.FrameNumber(round(frame*ticks)),value,'','',unreal.MovieSceneKeyInterpolation.LINEAR)

def widget_fade(seq,a,parent,start,duration):
    comp=a.get_component_by_class(unreal.WidgetComponent)
    binding=component_binding(seq,comp,parent)
    track=binding.add_track(unreal.MovieSceneColorTrack);track.set_property_name_and_path('TintColorAndOpacity','TintColorAndOpacity')
    section=track.add_section();section.set_range(0,END);channels=section.get_all_channels();assert len(channels)==4
    for channel in channels[:3]:channel.add_key(unreal.FrameNumber(0),1.)
    for frame,value in samples(start,duration,smooth):channels[3].add_key(unreal.FrameNumber(frame),value,interpolation=unreal.MovieSceneKeyInterpolation.LINEAR)

def fading_material(name,texture=None):
    path=ROOT+'/Materials/'+name
    material=unreal.load_asset(path)
    if material:unreal.MaterialEditingLibrary.delete_all_material_expressions(material)
    else:material=unreal.AssetToolsHelpers.get_asset_tools().create_asset(name,ROOT+'/Materials',unreal.Material,unreal.MaterialFactoryNew())
    native.setp(material,two_sided=True,blend_mode=unreal.BlendMode.BLEND_TRANSLUCENT,shading_model=unreal.MaterialShadingModel.MSM_UNLIT)
    ml=unreal.MaterialEditingLibrary
    reveal=ml.create_material_expression(material,unreal.MaterialExpressionScalarParameter)
    native.setp(reveal,parameter_name='Reveal',default_value=1.)
    if texture:
        tex=ml.create_material_expression(material,unreal.MaterialExpressionTextureSample);native.setp(tex,texture=texture)
        ml.connect_material_property(tex,'RGB',unreal.MaterialProperty.MP_EMISSIVE_COLOR)
        multiply=ml.create_material_expression(material,unreal.MaterialExpressionMultiply)
        ml.connect_material_expressions(tex,'A',multiply,'A');ml.connect_material_expressions(reveal,'',multiply,'B')
        ml.connect_material_property(multiply,'',unreal.MaterialProperty.MP_OPACITY)
    else:
        color=ml.create_material_expression(material,unreal.MaterialExpressionConstant3Vector)
        native.setp(color,constant=unreal.LinearColor(.008,.009,.012,1))
        ml.connect_material_property(color,'',unreal.MaterialProperty.MP_EMISSIVE_COLOR)
        ml.connect_material_property(reveal,'',unreal.MaterialProperty.MP_OPACITY)
    ml.recompile_material(material);assert unreal.EditorAssetLibrary.save_loaded_asset(material)
    return material

def clone_title(name,keep):
    path=ROOT+'/Widgets/'+name
    bp=unreal.load_asset(path)
    if not bp:bp=unreal.EditorAssetLibrary.duplicate_asset(ROOT+'/Widgets/WBP_ReviewTitles',path)
    assert bp
    api=unreal.get_default_object(unreal.UMGToolSet)
    for info in api.call_method('GetWidgets',args=(bp,)).widgets:
        n=str(info.widget_name)
        if n in ['Stage','Canvas']:continue
        editor_scene.set_values(info.widget,{'visibility':'Visible' if n in keep else 'Collapsed'})
    assert api.call_method('CompileWidgetBlueprint',args=(bp,))
    assert unreal.EditorAssetLibrary.save_loaded_asset(bp)
    return bp

def build():
    assert Path(unreal.Paths.convert_relative_path_to_full(unreal.Paths.project_dir())).resolve()==PROJECT
    world=unreal.get_editor_subsystem(unreal.UnrealEditorSubsystem).get_editor_world()
    assert world.get_path_name().split('.')[0]==ROOT+'/LV_ComparisonReview'
    assert not unreal.EditorAssetLibrary.does_asset_exist(SEQ),'Preserve the existing sequence and choose a new version'
    config=json.loads((REPO/'config/unreal/comparison-fullbody-demo.json').read_text())
    contract=json.loads((REPO/'config/unreal/comparison-motion-contract.json').read_text())
    assert config['approvedDemoException'] and contract['imagery']['demoException']['productionUseApproved'] is False
    assert Path(config['beforeBackup']).is_dir()
    unreal.LevelSequenceEditorBlueprintLibrary.close_level_sequence()
    actor_sub=unreal.get_editor_subsystem(unreal.EditorActorSubsystem)
    actors={a.get_actor_label():a for a in actor_sub.get_all_level_actors()}
    for label,a in actors.items():
        if label.startswith('LineupsSmooth_'):actor_sub.destroy_actor(a)
    for label in ['leftPlayer','rightPlayer','Titles','Card','CardBody']:
        a=actors['LineupsReview_'+label];a.set_actor_hidden_in_game(True);a.set_is_temporarily_hidden_in_editor(True)
    seq=unreal.AssetToolsHelpers.get_asset_tools().create_asset('LS_FullBodySmoothReview',ROOT,unreal.LevelSequence,unreal.LevelSequenceFactoryNew())
    seq.set_display_rate(unreal.FrameRate(FPS,1));seq.set_playback_start(0);seq.set_playback_end(END)
    camera=actors['LineupsReview_Camera'];camera.set_actor_location(native.vec(-230,0,0),False,False)
    cam=transform(seq,camera,0,132,camera=True)
    cut=seq.add_track(unreal.MovieSceneCameraCutTrack).add_section();cut.set_range(0,END)
    bid=unreal.MovieSceneObjectBindingID();bid.set_editor_property('guid',cam.get_id());cut.set_camera_binding_id(bid)
    placements={}
    quad=unreal.load_asset(ROOT+'/Meshes/SM_ReviewQuad')
    for side,cx,start in [('left',400,21),('right',1520,29)]:
        record=config['assets'][side+'Player'];tex=editor_scene.import_texture(side+'FullBody',record,ROOT+'/Widgets')
        mat=fading_material('M_Smooth_'+side+'Player',tex)
        x0,y0,x1,y1=record['primaryBodyBounds'];w,h=record['size'];scale=config['bodyHeightPx']/(y1-y0)
        iw,ih=w*scale,h*scale;px=cx-((x0+x1)/2-w/2)*scale;py=config['helmetTopPx']-y0*scale+ih/2
        factor=(230-12)/230*.1
        a=native.mesh_actor('LineupsSmooth_'+side+'Player',quad,mat,native.pos(px,py,-12),native.vec(1,-iw*factor,ih*factor))
        a.static_mesh_component.set_cast_shadow(False)
        parent=transform(seq,a,start,57,dy=(-22 if side=='left' else 22)*factor)
        material_fade(seq,a.static_mesh_component,parent,start,24)
        keep={side+'Name',side+'NamePlate',side+'NameEdge'}
        plate=native.widget_actor('LineupsSmooth_'+side+'Nameplate',clone_title('WBP_Smooth'+side.title()+'Plate',keep),-28)
        parent=transform(seq,plate,start,57,dy=(-22 if side=='left' else 22)*(230-28)/230*.1)
        widget_fade(seq,plate,parent,start,24)
        placements[side]={'helmetTopPx':config['helmetTopPx'],'bodyBottomPx':config['helmetTopPx']+config['bodyHeightPx'],'imageCenter':[px,py],'imageSize':[iw,ih],'source':record['path'],'entranceStartFrame':start,'entranceEndFrame':start+57,'fadeEndFrame':start+24,'nameplateCoupled':True}
    headline=native.widget_actor('LineupsSmooth_Headline',clone_title('WBP_SmoothHeadline',{'Headline'}),-28)
    parent=transform(seq,headline,8,40,dz=-.35);widget_fade(seq,headline,parent,8,30)
    card=native.widget_actor('LineupsSmooth_Card',unreal.load_asset(ROOT+'/Widgets/WBP_ReviewCard'),-30)
    parent=transform(seq,card,90,42,dz=1.2);widget_fade(seq,card,parent,90,30)
    factor=200/230*.1
    body=native.mesh_actor('LineupsSmooth_CardBody',unreal.load_asset('/Engine/BasicShapes/Cube'),fading_material('M_Smooth_CardBody'),native.pos(960,752.5,-29.2),native.vec(.008,860*factor/100,345*factor/100))
    body.static_mesh_component.set_cast_shadow(False)
    parent=transform(seq,body,90,42,dz=1.2);material_fade(seq,body.static_mesh_component,parent,90,30)
    unreal.EditorAssetLibrary.set_metadata_tag(seq,'LineupsTiming','visual-demo-only; 60fps smooth review; no exit cue; production uses Mark/Manim')
    assert unreal.EditorAssetLibrary.save_loaded_asset(seq)
    assert unreal.EditorLoadingAndSavingUtils.save_map(world,ROOT+'/LV_ComparisonReview')
    unreal.LevelSequenceEditorBlueprintLibrary.open_level_sequence(seq);unreal.LevelSequenceEditorBlueprintLibrary.set_current_time(180)
    previous=json.loads(PROOF.read_text());previous['previousRenders'].append({'output':previous['output'],'status':'prior-waist-crop-review','reason':'Jerami requested fuller bodies and smoother restrained motion.'})
    previous.update(status='built',sequence=SEQ,frameRate=FPS,frameCount=END,reviewWindowSeconds=8,output='/Volumes/HomeSSD/Generated/CATENA_MEDIA_LINEUPS/renders/unreal-full-body-smooth-v1',errors=[],nativeRenderSuccess=None,renderedFrameCount=0,placements=placements,contractSha256=hashlib.sha256((REPO/'config/unreal/comparison-motion-contract.json').read_bytes()).hexdigest(),demoImageryException=True,productionMaskOnly=True,exitCue=None)
    previous.pop('reviewExport',None);PROOF.write_text(json.dumps(previous,indent=2)+'\n')
    state.update(status='built',sequence=SEQ,placements=placements,frameCount=END,frameRate=FPS,contractSha256=previous['contractSha256']);save();unreal.log('LINEUPS_FULLBODY_SMOOTH_BUILT')

try:build()
except Exception:
    state['status']='build-failed';state['errors'].append(traceback.format_exc());save();raise
