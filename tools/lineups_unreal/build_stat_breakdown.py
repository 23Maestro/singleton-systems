"""Adapt the installed FS_PlayerStats card in an owned map; retain native motion.

Points is 3 or 4. Animate in, then hold static. Premiere owns the transition.
"""
import hashlib
import json
import math
from pathlib import Path
import sys
import traceback
import unreal

REPO=Path('/Users/singleton23/Documents/Development/singleton-systems')
sys.path.insert(0,str(REPO/'tools/lineups_unreal'))
import editor_scene
import build_review_export as native
from stat_layout import distribute_stats, hug_callout, point_settings
from editor_toolset.toolsets.object import ObjectTools
ROOT='/Game/Lineups/StatBreakdownV1'
PROJECT=native.PROJECT
RECEIPTS=PROJECT.parent.parent/'receipts'
CONFIG=REPO/'config/unreal/stat-breakdown-template.json'


def asset_record(path):
    p=Path(path)
    return {'path':str(p),'sha256':hashlib.sha256(p.read_bytes()).hexdigest()}


def actors():
    return {a.get_actor_label():a for a in unreal.get_editor_subsystem(unreal.EditorActorSubsystem).get_all_level_actors()}


def set_text(actor,text):
    comp=actor.get_component_by_class(unreal.Text3DComponent)
    editor_scene.set_values(comp,{'text':text})
    return comp


def scale_tracks(seq,label,target):
    for binding in seq.get_bindings():
        if binding.get_name()!=label:continue
        for track in binding.get_tracks():
            for section in track.get_sections():
                for channel in section.get_all_channels():
                    if not str(channel.channel_name).startswith('Scale.'):continue
                    keys=channel.get_keys()
                    if keys:
                        old=keys[-1].get_value()
                        assert old>0
                        for key in keys:key.set_value(key.get_value()*target/old)
                    else:channel.set_default(target)


def stretch_sections(seq):
    # Preserve the sample entrance keys and hold its final state through review.
    for b in seq.get_bindings():
        for t in b.get_tracks():
            for s in t.get_sections():s.set_range(0,480)
    for t in seq.get_tracks():
        for s in t.get_sections():s.set_range(0,480)
    seq.set_playback_end(480)


def rebind(seq, aa):
    """Standalone copies need explicit actor references in their owning map."""
    sub=unreal.get_editor_subsystem(unreal.LevelSequenceEditorSubsystem)
    for binding in seq.get_bindings():
        name=binding.get_name()
        if name not in aa:
            raise ValueError('Missing native sample actor for binding: '+name)
        sub.replace_binding_with_actors([aa[name]],binding)


def chiefs_colors(world, aa):
    assert world.get_path_name().split('.')[0] in [ROOT+'/LV_MahomesStat3',ROOT+'/LV_MahomesStat4']
    gold={'r':1.,'g':.48,'b':.012,'a':1.}
    for name,actor in aa.items():
        if name.startswith('Text_Stat'):
            comp=actor.get_component_by_class(unreal.Text3DComponent)
            if comp:
                editor_scene.set_values(comp.get_editor_property('material_extension'),
                                        {'style':'Solid','frontColor':gold,'bevelColor':gold,'extrudeColor':gold})
    tab=aa['Position_YellowBar'].get_path_name()
    gold_texture=editor_scene.import_texture('ChiefsGold',asset_record('/Volumes/HomeSSD/Generated/CATENA_MEDIA_LINEUPS/source/mahomes-stat-breakdown/Chiefs-gold-solid.png'),ROOT)
    for obj in unreal.ObjectIterator():
        if isinstance(obj,unreal.DMMaterialValueTexture) and obj.get_path_name().startswith(tab+'.'):
            tex=obj.get_editor_property('value')
            if tex and ('/2D_HQ/' in tex.get_path_name() or 'ChiefsGold' in tex.get_path_name()):obj.set_value(gold_texture)
        if isinstance(obj,unreal.DMMaterialValueFloat3RGB) and obj.get_path_name().startswith(tab+'.') and not obj.get_name().startswith('Global'):
            obj.set_value(unreal.LinearColor(1.,.48,.012,1))
        if isinstance(obj,unreal.DMMaterialValueFloat1) and obj.get_path_name().startswith(world.get_path_name().split('.')[0]+'.') and '.AvaShapeActor_16.' in obj.get_path_name() and obj.get_name()=='GlobalEmissiveColorValue':
            obj.set_value(.55)



def set_sequence_component(seq,label,channel_name,value):
    for binding in seq.get_bindings():
        if binding.get_name()!=label:continue
        for track in binding.get_tracks():
            if not isinstance(track,unreal.MovieScene3DTransformTrack):continue
            for section in track.get_sections():
                for channel in section.get_all_channels():
                    if str(channel.channel_name)!=channel_name:continue
                    channel.set_default(value)
                    # These controls have constant position/scale channels.
                    for key in channel.get_keys():key.set_value(value)


def apply_readability_correction(world,seq):
    """Keep full glyphs inside masks; normalize the logo UV and enlarge QB."""
    level=world.get_path_name().split('.')[0]
    assert level in [ROOT+'/LV_MahomesStat3',ROOT+'/LV_MahomesStat4']
    assert seq.get_path_name().split('.')[0]==ROOT+'/LS_MahomesStat'+level[-1]
    settings=json.loads(CONFIG.read_text())['readability']
    aa={a.get_actor_label():a for a in unreal.GameplayStatics.get_all_actors_of_class(world,unreal.Actor)}
    # The sample mask was sized for its smaller labels. Raising its top edge
    # preserves the native reveal and gives the complete cap height room.
    mask=aa['MASK_Stat_Titles'];p=mask.get_actor_location()
    mask.set_actor_location(unreal.Vector(p.x,p.y,settings['labelMaskWorldZ']),False,False)
    # The emissive logo stage used 0.8 tiling, magnifying and cropping the mark.
    logo=aa['T_TeamLogo_Wyrms_Logo'];uv_changes=[]
    for obj in unreal.ObjectIterator():
        if isinstance(obj,unreal.DMTextureUV) and unreal.Object.get_path_name(obj).startswith(logo.get_path_name()+'.'):
            before=editor_scene.read(obj,['tiling'])
            editor_scene.set_values(obj,{'tiling':dict(zip(('x','y'),settings['logoTextureTiling']))})
            uv_changes.append({'path':obj.get_path_name(),'before':before,'after':editor_scene.read(obj,['tiling'])})
    footer=aa['Text_Asterisk'].get_component_by_class(unreal.Text3DComponent)
    editor_scene.set_values(footer,{'typeface':settings['seasonTypeface']})
    bar=aa['Position_YellowBar'];p=bar.get_actor_location()
    bar.set_actor_location(unreal.Vector(p.x,p.y,settings['qbTagWorldZ']),False,False)
    sc=bar.get_actor_scale3d();bar.set_actor_scale3d(unreal.Vector(sc.x,sc.y,settings['qbTagScaleZ']))
    br=bar.get_editor_property('root_component')
    set_sequence_component(seq,'Position_YellowBar','Location.Z',br.get_editor_property('relative_location').z)
    set_sequence_component(seq,'Position_YellowBar','Scale.Z',br.get_editor_property('relative_scale3d').z)
    tagmask=aa['MASK_Text_Position'];p=tagmask.get_actor_location()
    tagmask.set_actor_location(unreal.Vector(p.x,p.y,settings['qbTagWorldZ']),False,False)
    sc=tagmask.get_actor_scale3d();tagmask.set_actor_scale3d(unreal.Vector(sc.x,sc.y,settings['qbTagScaleZ']))
    mr=tagmask.get_editor_property('root_component')
    set_sequence_component(seq,'MASK_Text_Position','Location.Z',mr.get_editor_property('relative_location').z)
    set_sequence_component(seq,'MASK_Text_Position','Scale.Z',mr.get_editor_property('relative_scale3d').z)
    qb=aa['Text_Position'];p=qb.get_actor_location()
    qb.set_actor_location(unreal.Vector(p.x,-23.,settings['qbWorldZ']),False,False)
    qb.set_actor_scale3d(unreal.Vector(*([settings['qbScale']]*3)));scale_tracks(seq,'Text_Position',settings['qbScale'])
    qr=qb.get_editor_property('root_component').get_editor_property('relative_location')
    for axis in ['X','Y','Z']:set_sequence_component(seq,'Text_Position','Location.'+axis,getattr(qr,axis.lower()))
    unreal.EditorAssetLibrary.set_metadata_tag(world,'LineupsReadabilityRevision','2')
    unreal.EditorAssetLibrary.set_metadata_tag(seq,'LineupsReadabilityRevision','2')
    return {'revision':2,**settings,'logoUV':uv_changes}


def projected_bounds(actor,camera):
    center,extent=actor.get_actor_bounds(False)
    factor=1920/(2*(center.x-camera.get_actor_location().x)*math.tan(
        math.radians(camera.get_cine_camera_component().get_horizontal_field_of_view()/2)))
    return [960+(center.y-extent.y)*factor,540-(center.z+extent.z)*factor,
            960+(center.y+extent.y)*factor,540-(center.z-extent.z)*factor]


def remove_inherited_highlights(world,seq):
    """Remove the unused soccer overlay, including its embedded animation bindings."""
    level=world.get_path_name().split('.')[0]
    assert level in [ROOT+'/LV_MahomesStat3',ROOT+'/LV_MahomesStat4']
    assert seq.get_path_name().split('.')[0]==ROOT+'/LS_MahomesStat'+level[-1]
    doomed=[a for a in unreal.GameplayStatics.get_all_actors_of_class(world,unreal.Actor)
            if a.get_actor_label().startswith('Highlight')]
    records=[{'label':a.get_actor_label(),'path':a.get_path_name()} for a in doomed]
    sequences=[seq]+[o for o in unreal.ObjectIterator() if isinstance(o,unreal.AvaSequence)
                       and unreal.Object.get_path_name(o).startswith(level+'.')]
    removed=[]
    for sequence in sequences:
        for binding in list(sequence.get_bindings()):
            if binding.get_name().startswith('Highlight'):
                removed.append({'sequence':sequence.get_path_name(),'binding':binding.get_name()})
                binding.remove()
    sub=unreal.get_editor_subsystem(unreal.EditorActorSubsystem)
    # Children first: leave the main Stat N containers and their source motion alone.
    def depth(actor):
        n=0;parent=actor.get_attach_parent_actor()
        while parent:n+=1;parent=parent.get_attach_parent_actor()
        return n
    active=unreal.get_editor_subsystem(unreal.UnrealEditorSubsystem).get_editor_world()
    for actor in sorted(doomed,key=depth,reverse=True):
        if world==active:
            if not sub.destroy_actor(actor):raise RuntimeError('Could not remove inherited highlight')
        else:
            # EditorActorSubsystem refuses actors in a loaded off-screen map.
            actor.destroy_actor()
    if any(a.get_actor_label().startswith('Highlight') for a in unreal.GameplayStatics.get_all_actors_of_class(world,unreal.Actor)):
        raise RuntimeError('Inherited highlight remains in the owned map')
    return {'removedActors':records,'removedBindings':removed}


def apply_stat_positions(world,seq,points):
    """Run after glyph rebuild and evaluation at the settled frame; uses real bounds."""
    level=world.get_path_name().split('.')[0]
    assert level==ROOT+'/LV_MahomesStat'+str(points) and points in (3,4)
    assert seq.get_path_name().split('.')[0]==ROOT+'/LS_MahomesStat'+str(points)
    world.modify();seq.modify()
    cfg=json.loads(CONFIG.read_text())
    aa={a.get_actor_label():a for a in unreal.GameplayStatics.get_all_actors_of_class(world,unreal.Actor)}
    camera=aa['AvaCineCameraActor_Main'];measurements=[]
    # Restore the established export framing before measuring screen-space gaps.
    # The editor's pilot controls can move this saved camera between sessions.
    if cfg.get('reviewCamera'):
        framing=cfg['reviewCamera']
        camera.set_actor_location(unreal.Vector(*framing['location']),False,False)
        camera.set_actor_rotation(unreal.Rotator(*framing['rotation']),False)
        camera.get_cine_camera_component().set_editor_property('current_focal_length',framing['focalLength'])
    for i,stat in enumerate(cfg['stats'][:points],1):
        row={}
        for kind,prefix in [('value','Text_Stat'),('label','Text_Title_Stat')]:
            actor=aa[prefix+str(i)]
            assert str(actor.get_component_by_class(unreal.Text3DComponent).get_editor_property('text'))==stat[kind]
            assert abs(actor.get_actor_scale3d().x-(1.35 if kind=='value' else .75))<.001,'Evaluate the settled sequence before layout'
            bounds=projected_bounds(actor,camera);row[kind]=bounds[2]-bounds[0]
        measurements.append(row)
    card=projected_bounds(aa['Stats_Box'],camera);mask=projected_bounds(aa['MASK_Stats_Box'],camera)
    settings=point_settings(cfg['statLayout'],points)
    layout=distribute_stats(measurements,max(card[0],mask[0]),min(card[2],mask[2]),settings['paddingPx'],settings['minimumGapPx'],settings.get('gapPx'),settings.get('offsetXPx',0),settings.get('mode')=='space-evenly')
    for i,group in enumerate(layout['groups'],1):
        parent=aa['Stat '+str(i)];loc=parent.get_actor_location()
        factor=1920/(2*(loc.x-camera.get_actor_location().x)*math.tan(math.radians(camera.get_cine_camera_component().get_horizontal_field_of_view()/2)))
        parent.set_actor_location(unreal.Vector(loc.x,(group['center']-960)/factor,loc.z),False,False)
        for prefix in ('Text_Stat','Text_Title_Stat'):
            actor=aa[prefix+str(i)];bounds=projected_bounds(actor,camera);p=actor.get_actor_location()
            actor.set_actor_location(unreal.Vector(p.x,p.y+(group['center']-(bounds[0]+bounds[2])/2)/factor,p.z),False,False)
            relative=actor.get_editor_property('root_component').get_editor_property('relative_location')
            set_sequence_component(seq,actor.get_actor_label(),'Location.Y',relative.y)
    revision=str(cfg.get('layoutRevisionByPoints',{}).get(str(points),cfg['layoutRevision']))
    unreal.EditorAssetLibrary.set_metadata_tag(world,'LineupsLayoutRevision',revision)
    unreal.EditorAssetLibrary.set_metadata_tag(seq,'LineupsLayoutRevision',revision)
    return layout


def apply_panel_corners(world):
    assert world.get_path_name().split('.')[0] in [ROOT+'/LV_MahomesStat3',ROOT+'/LV_MahomesStat4']
    aa={a.get_actor_label():a for a in unreal.GameplayStatics.get_all_actors_of_class(world,unreal.Actor)}
    panel=aa['Main_Box'];mesh=panel.get_editor_property('dynamic_mesh')
    cfg=json.loads(CONFIG.read_text())['redPanelCorners']
    bounds=projected_bounds(panel,aa['AvaCineCameraActor_Main'])
    size=editor_scene.read(mesh,['size2D'])['size2D']
    radius=cfg['radiusPx']*size['x']/(bounds[2]-bounds[0])
    keys=['topLeft','topRight','bottomLeft','bottomRight']
    world.modify();mesh.modify()
    current=editor_scene.read(mesh,['globalBevelSize','globalBevelSubdivisions'])
    if abs(current['globalBevelSize']-radius)>.1 or current['globalBevelSubdivisions']!=cfg['subdivisions']:
        # Some copied Motion Design components are marked as templates and
        # reject Python writes. Their native Details control remains editable.
        try:
            mesh.global_bevel_size=radius
            mesh.global_bevel_subdivisions=cfg['subdivisions']
        except Exception as error:
            raise ValueError(f'Set Main_Box / Shape / Global Bevel Size to {radius:.3f} and subdivisions to {cfg["subdivisions"]} in native Details, then rerun') from error
    corners=editor_scene.read(mesh,keys)
    assert all(c['type']=='CurveIn' and abs(c['bevelSize']-radius)<.1 for c in corners.values())
    return {'requestedRadiusPx':cfg['radiusPx'],'corners':corners}


def lock_reading_hold(world,seq):
    level=world.get_path_name().split('.')[0]
    assert level in [ROOT+'/LV_MahomesStat3',ROOT+'/LV_MahomesStat4']
    assert seq.get_path_name().split('.')[0]==ROOT+'/LS_MahomesStat'+level[-1]
    world.modify();seq.modify();disabled=[];sections=0
    for embedded in unreal.ObjectIterator():
        if not isinstance(embedded,unreal.AvaSequence) or not embedded.get_path_name().startswith(level+'.'):continue
        if str(embedded.get_label()).endswith('Out'):
            embedded.modify()
            for binding in list(embedded.get_bindings()):binding.remove()
            for track in list(embedded.get_tracks()):embedded.remove_track(track)
            unreal.EditorAssetLibrary.set_metadata_tag(embedded,'LineupsDisabled','Disabled: no animation out; Premiere owns transition')
            disabled.append(embedded.get_path_name())
    tracks=list(seq.get_tracks())+[track for binding in seq.get_bindings() for track in binding.get_tracks()]
    for track in tracks:
        for section in track.get_sections():
            section.set_completion_mode(unreal.MovieSceneCompletionMode.KEEP_STATE);sections+=1
    unreal.EditorAssetLibrary.set_metadata_tag(seq,'LineupsHold','KeepState; static after entrance; no animation out; Premiere owns transition')
    unreal.EditorAssetLibrary.set_metadata_tag(seq,'LineupsTiming','Mark/Manim entrance cues; static hold; no animation out; Premiere owns transition')
    return {'disabledOutSequences':disabled,'keepStateSections':sections,'automaticExit':False}


def apply_content_layout(world,seq,points):
    layout=apply_stat_positions(world,seq,points)
    corners=apply_panel_corners(world)
    hold=lock_reading_hold(world,seq)
    cfg=json.loads(CONFIG.read_text())
    aa={a.get_actor_label():a for a in unreal.GameplayStatics.get_all_actors_of_class(world,unreal.Actor)}
    camera=aa['AvaCineCameraActor_Main']
    # The source Material Designer panel is already translucent; adjust its own alpha.
    opacity=[]
    for obj in unreal.ObjectIterator():
        if isinstance(obj,unreal.DMMaterialValueFloat1) and unreal.Object.get_path_name(obj).startswith(aa['Main_Box'].get_path_name()+'.') and obj.get_name()=='GlobalOpacityValue':
            obj.set_value(cfg['redPanelOpacity']);opacity.append(float(obj.get_editor_property('value')))
    assert len(opacity)==1 and abs(opacity[0]-.9)<.001
    # A separate editable rectangle hugs the measured callout, with native text
    # motion inherited by attachment. Its short reveal uses the source's timing.
    footer=aa['Text_Asterisk'];bounds=projected_bounds(footer,camera)
    callout=cfg['speakerCallout'];target=hug_callout(bounds,callout['paddingXPx'],callout['paddingYPx'])
    native.ROOT=ROOT
    material=native.material('M_SpeakerCallout',color=(0,0,0),unlit=True)
    material.set_editor_property('blend_mode',unreal.BlendMode.BLEND_TRANSLUCENT)
    material.set_editor_property('disable_depth_test',False)
    unreal.MaterialEditingLibrary.recompile_material(material)
    assert unreal.EditorAssetLibrary.save_loaded_asset(material)
    plate=aa.get('LineupsStat_SpeakerCallout')
    if not plate:
        plate=unreal.get_editor_subsystem(unreal.EditorActorSubsystem).duplicate_actor(aa['LineupsStat_FieldNight'],world)
        assert plate;plate.set_actor_label('LineupsStat_SpeakerCallout')
    mesh=plate.static_mesh_component;mesh.set_material(0,material)
    mesh.set_editor_property('translucency_sort_priority',4)
    plate.attach_to_actor(footer,'',unreal.AttachmentRule.KEEP_WORLD,unreal.AttachmentRule.KEEP_WORLD,unreal.AttachmentRule.KEEP_WORLD,False)
    # The source sorts all Content descendants by Outliner order. An attached
    # child would otherwise become priority 6 and cover its priority-5 text.
    stack=unreal.ActorModifierCoreLibrary.find_modifier_stack(plate,True)
    priority=next((m for m in unreal.ActorModifierCoreLibrary.get_stack_modifiers(stack)
                   if isinstance(m,unreal.AvaTranslucentPriorityModifier)),None)
    if not priority:
        operation=unreal.ActorModifierCoreInsertOperation(modifier_class=unreal.AvaTranslucentPriorityModifier)
        priority=unreal.ActorModifierCoreLibrary.insert_modifier(stack,operation)
    assert priority
    priority.set_mode(unreal.AvaTranslucentPriorityModifierMode.MANUAL)
    priority.set_sort_priority(4)
    priority.set_include_children(False)
    unreal.ActorModifierCoreLibrary.mark_modifier_dirty(priority)
    # Depth-test behind the glyphs: an always-on-top translucent plate covers
    # opaque text even when its translucency sort priority is lower.
    x=footer.get_actor_location().x+2
    f=1920/(2*(x-camera.get_actor_location().x)*math.tan(math.radians(camera.get_cine_camera_component().get_horizontal_field_of_view()/2)))
    plate.set_actor_location(unreal.Vector(x,((target[0]+target[2])/2-960)/f,(540-(target[1]+target[3])/2)/f),False,False)
    plate.set_actor_scale3d(unreal.Vector(1,-(target[2]-target[0])/f,(target[3]-target[1])/f))
    for binding in list(seq.get_bindings()):
        if binding.get_name()=='LineupsStat_SpeakerCallout':binding.remove()
    binding=seq.add_possessable(plate)
    section=binding.add_track(unreal.MovieScene3DTransformTrack).add_section();section.set_range(0,480)
    root=plate.get_editor_property('root_component');loc=root.get_editor_property('relative_location');sc=root.get_editor_property('relative_scale3d')
    defaults=[loc.x,loc.y,loc.z,0,0,0,sc.x,sc.y,sc.z]
    for channel,value in zip(section.get_all_channels(),defaults):
        channel.set_default(value)
        if str(channel.channel_name)=='Scale.Y':
            channel.add_key(unreal.FrameNumber(39),0.,interpolation=unreal.MovieSceneKeyInterpolation.AUTO)
            channel.add_key(unreal.FrameNumber(70),value,interpolation=unreal.MovieSceneKeyInterpolation.AUTO)
    revision=cfg.get('layoutRevisionByPoints',{}).get(str(points),cfg['layoutRevision'])
    return {'revision':revision,'points':points,'layout':layout,'redPanelCorners':corners,'hold':hold,'redPanelOpacity':opacity[0],
            'speakerCallout':{'text':str(footer.get_component_by_class(unreal.Text3DComponent).get_editor_property('text')),'glyphBoundsPx':bounds,'plateBoundsPx':target,**callout}}


def populate_three():
    cfg=json.loads(CONFIG.read_text());assert cfg['points']==3 and cfg['supportedPoints']==[3,4]
    world=unreal.get_editor_subsystem(unreal.UnrealEditorSubsystem).get_editor_world()
    assert world.get_path_name().split('.')[0]==ROOT+'/LV_MahomesStat3'
    seq=unreal.load_asset(ROOT+'/LS_MahomesStat3');assert seq
    unreal.LevelSequenceEditorBlueprintLibrary.open_level_sequence(seq)
    aa=actors();rebind(seq,aa)
    unreal.LevelSequenceEditorBlueprintLibrary.set_current_time(180)
    native.ROOT=ROOT
    textures={
        'player':editor_scene.import_texture('MahomesFlex',asset_record(cfg['player']['source']),ROOT),
        'field':editor_scene.import_texture('FieldNight',asset_record(cfg['background']),ROOT),
        'logo':editor_scene.import_texture('ChiefsLogo',cfg['teamLogo'],ROOT),
        'red':editor_scene.import_texture('ChiefsPrimary',asset_record('/Volumes/HomeSSD/Generated/CATENA_MEDIA_LINEUPS/source/mahomes-stat-breakdown/Chiefs-primary-solid.png'),ROOT)}
    changes=[]
    # These Material Designer values are embedded in the owned map, not shared assets.
    for obj in unreal.ObjectIterator():
        if not isinstance(obj,unreal.DMMaterialValueTexture):continue
        path=obj.get_path_name()
        if not path.startswith(world.get_path_name().split('.')[0]+'.'):continue
        old=obj.get_editor_property('value');old_path=old.get_path_name() if old else ''
        replacement=None
        if '.AvaShapeActor_20.' in path and '/PlayerPortraits/' in old_path:replacement=textures['player']
        if '.AvaShapeActor_22.' in path and '/2D_HQ/' in old_path:replacement=textures['logo']
        if '.AvaShapeActor_16.' in path:
            if '/2D_HQ/' in old_path:replacement=textures['red']
            elif '/2D_TeamPatterns/' in old_path:replacement=unreal.load_asset('/Game/_Textures/T_Grunge_8')
        if replacement:
            obj.set_value(replacement)
            assert obj.get_editor_property('value')==replacement
            changes.append({'object':path,'before':old_path,'after':replacement.get_path_name()})
    # The sample shape's size2D is read-only. Preserve photo aspect through its
    # editable transform, including the sequence's Scale.Y default.
    player=aa['T_Player_WIP'];scale=player.get_actor_scale3d()
    target_y=1.0174999772571027*1000/668
    player.set_actor_scale3d(unreal.Vector(scale.x,target_y,scale.z))
    for binding in seq.get_bindings():
        if binding.get_name()=='T_Player_WIP':
            for track in binding.get_tracks():
                for section in track.get_sections():
                    for channel in section.get_all_channels():
                        if str(channel.channel_name)=='Scale.Y':channel.set_default(target_y)
    set_text(aa['Text_Player_FirstName'],cfg['player']['firstName'])
    set_text(aa['Text_Player_LastName'],cfg['player']['lastName'])
    set_text(aa['Text_Position'],cfg['player']['position'])
    set_text(aa['Text_PlayerNumber'],cfg['player']['number'])
    set_text(aa['Text_Asterisk'],cfg['season'])
    aa['Text_Asterisk'].set_actor_scale3d(unreal.Vector(.52,.52,.52))
    scale_tracks(seq,'Text_Asterisk',.52)
    for label in ['T_UPL_Horizontal','T_Flag_Mexico']:
        aa[label].set_actor_hidden_in_game(True);aa[label].set_is_temporarily_hidden_in_editor(True)
        for binding in seq.get_bindings():
            if binding.get_name()==label:
                for track in list(binding.get_tracks()):
                    if isinstance(track,unreal.MovieSceneVisibilityTrack):binding.remove_track(track)
    label_schema=None
    for i,stat in enumerate(cfg['stats'][:3],1):
        value=aa['Text_Stat'+str(i)];label=aa['Text_Title_Stat'+str(i)]
        set_text(value,stat['value']);comp=set_text(label,stat['label'])
        value.set_actor_scale3d(unreal.Vector(1.35,1.35,1.35));scale_tracks(seq,value.get_actor_label(),1.35)
        label.set_actor_scale3d(unreal.Vector(.75,.75,.75));scale_tracks(seq,label.get_actor_label(),.75)
        ext=comp.get_editor_property('material_extension');schema=json.loads(ObjectTools.list_properties(ext))
        label_schema={'path':ext.get_path_name(),'keys':list(schema)}
    # Full-frame background behind the original sample; retain separately editable layers.
    if not any(a.get_actor_label()=='LineupsStat_FieldNight' for a in aa.values()):
        mat=native.material('M_FieldNight',textures['field'],unlit=True)
        camera=aa['AvaCineCameraActor_Main'];fov=camera.get_cine_camera_component().get_horizontal_field_of_view()
        distance=3000;w=2*distance*math.tan(math.radians(fov/2))*1.01
        bg=native.mesh_actor('LineupsStat_FieldNight',unreal.load_asset('/Game/Lineups/ReviewV1/Meshes/SM_ReviewQuad'),mat,unreal.Vector(2500,0,0),unreal.Vector(1,-w,w*1080/1920))
        bg.static_mesh_component.set_cast_shadow(False)
    stretch_sections(seq)
    chiefs_colors(world,aa)
    scale_tracks(seq,'T_TeamLogo_Wyrms_Logo',.21)
    apply_readability_correction(world,seq)
    unreal.EditorAssetLibrary.set_metadata_tag(world,'LineupsPoints','3')
    unreal.EditorAssetLibrary.set_metadata_tag(seq,'LineupsPoints','3')
    unreal.EditorAssetLibrary.set_metadata_tag(seq,'LineupsTiming','visual-demo-only; source entrance retained; no animation out; Premiere owns transition')
    assert unreal.EditorAssetLibrary.save_loaded_asset(seq)
    assert unreal.EditorLoadingAndSavingUtils.save_map(world,ROOT+'/LV_MahomesStat3')
    unreal.LevelSequenceEditorBlueprintLibrary.set_current_time(180)
    receipt={'status':'built-layout-pending','points':3,'map':ROOT+'/LV_MahomesStat3','sequence':ROOT+'/LS_MahomesStat3','nextStep':'Run refine_stat_breakdown.py with this map open after native glyph rebuild before rendering','materialChanges':changes,'labelMaterialSchema':label_schema,'configSha256':hashlib.sha256(CONFIG.read_bytes()).hexdigest(),'visualDemoOnly':True,'frameRate':{'numerator':seq.get_display_rate().numerator,'denominator':seq.get_display_rate().denominator},'frameCount':480}
    (RECEIPTS/'stat-breakdown-3-build.json').write_text(json.dumps(receipt,indent=2))
    unreal.log('STAT_BREAKDOWN_3_BUILT')


def add_fourth_motion(seq, actor, reference_name, delay=6):
    """Copy the source's value/label entrance channels onto the added stat."""
    source=json.loads((RECEIPTS/'stat-source-motion.json').read_text())
    entry=next(row for row in source['curves'] if row['name']==reference_name)
    binding=seq.add_possessable(actor)
    comp=actor.get_editor_property('root_component')
    loc=comp.get_editor_property('relative_location')
    rot=comp.get_editor_property('relative_rotation')
    scale=comp.get_editor_property('relative_scale3d')
    defaults=[loc.x,loc.y,loc.z,rot.roll,rot.pitch,rot.yaw,scale.x,scale.y,scale.z]
    for data in entry['tracks']:
        if data['type']=='MovieScene3DTransformTrack':
            section=binding.add_track(unreal.MovieScene3DTransformTrack).add_section();section.set_range(0,480)
            channels=section.get_all_channels()
            for ch,value in zip(channels,defaults):ch.set_default(value)
            by_name={str(ch.channel_name):ch for ch in channels}
            for record in data['channels']:
                keys=record['keys'];ch=by_name.get(record['name'])
                if not keys or ch is None:continue
                factor=scale.x/keys[-1]['value'] if record['name'].startswith('Scale.') else 1
                for key in keys:
                    ch.add_key(unreal.FrameNumber(key['frame']+delay),key['value']*factor,
                               interpolation=unreal.MovieSceneKeyInterpolation.AUTO)
        elif data['type']=='MovieSceneVisibilityTrack':
            track=binding.add_track(unreal.MovieSceneVisibilityTrack);track.set_property_name_and_path('bHidden','bHidden')
            section=track.add_section();section.set_range(0,480)
            section.get_all_channels()[0].set_default(False)
            for key in data['channels'][0]['keys']:
                section.get_all_channels()[0].add_key(unreal.FrameNumber(key['frame']+(delay if key['frame'] else 0)),key['value'])


def populate_four():
    cfg=json.loads(CONFIG.read_text());assert cfg['points']==4 and cfg['supportedPoints']==[3,4]
    world=unreal.get_editor_subsystem(unreal.UnrealEditorSubsystem).get_editor_world()
    assert world.get_path_name().split('.')[0]==ROOT+'/LV_MahomesStat3'
    if unreal.EditorAssetLibrary.does_asset_exist(ROOT+'/LV_MahomesStat4'):
        assert not (RECEIPTS/'stat-breakdown-4-build.json').exists(),'Preserve the completed 4-point copy'
        world4=unreal.load_asset(ROOT+'/LV_MahomesStat4')
        seq=unreal.load_asset(ROOT+'/LS_MahomesStat4');assert seq
        return finish_four(world4,seq)
    seq3=unreal.load_asset(ROOT+'/LS_MahomesStat3');unreal.LevelSequenceEditorBlueprintLibrary.open_level_sequence(seq3)
    unreal.LevelSequenceEditorBlueprintLibrary.set_current_time(180)
    aa=actors();sub=unreal.get_editor_subsystem(unreal.EditorActorSubsystem)
    previous={name:aa[name].get_actor_transform() for name in ['Stat 1','Stat 2','Stat 3']}
    created=[]
    parent=sub.duplicate_actor(aa['Stat 3'],world);parent.set_actor_label('Stat 4');created.append(parent)
    parent.attach_to_actor(aa['Stats Box'],'',unreal.AttachmentRule.KEEP_WORLD,unreal.AttachmentRule.KEEP_WORLD,unreal.AttachmentRule.KEEP_WORLD,False)
    value=sub.duplicate_actor(aa['Text_Stat3'],world);value.set_actor_label('Text_Stat4');created.append(value)
    label=sub.duplicate_actor(aa['Text_Title_Stat3'],world);label.set_actor_label('Text_Title_Stat4');created.append(label)
    for actor in [value,label]:actor.attach_to_actor(parent,'',unreal.AttachmentRule.KEEP_WORLD,unreal.AttachmentRule.KEEP_WORLD,unreal.AttachmentRule.KEEP_WORLD,False)
    set_text(value,cfg['stats'][3]['value']);set_text(label,cfg['stats'][3]['label'])
    assert unreal.EditorLoadingAndSavingUtils.save_map(world,ROOT+'/LV_MahomesStat4')
    # Save-as leaves the current editor world open. Restore the 3-point world;
    # edit the saved 4-point package off-screen instead of switching worlds.
    for actor in reversed(created):assert sub.destroy_actor(actor)
    for name,t in previous.items():aa[name].set_actor_transform(t,False,False)
    assert unreal.EditorLoadingAndSavingUtils.save_map(world,ROOT+'/LV_MahomesStat3')
    world4=unreal.load_asset(ROOT+'/LV_MahomesStat4');assert isinstance(world4,unreal.World)
    aa4={a.get_actor_label():a for a in unreal.GameplayStatics.get_all_actors_of_class(world4,unreal.Actor)}
    embedded=[o for o in unreal.ObjectIterator() if isinstance(o,unreal.AvaSequence) and unreal.Object.get_path_name(o).startswith(ROOT+'/LV_MahomesStat4.')]
    source=next(s for s in embedded if str(s.get_label())=='In')
    seq=unreal.AssetToolsHelpers.get_asset_tools().duplicate_asset('LS_MahomesStat4',ROOT,source);assert seq
    unreal.LevelSequenceEditorBlueprintLibrary.open_level_sequence(seq);rebind(seq,aa4)
    camera=seq.add_possessable(aa4['AvaCineCameraActor_Main'])
    section=seq.add_track(unreal.MovieSceneCameraCutTrack).add_section();section.set_range(0,480)
    bid=unreal.MovieSceneObjectBindingID();bid.set_editor_property('guid',camera.get_id());section.set_camera_binding_id(bid)
    finish_four(world4,seq)


def finish_four(world4,seq):
    assert world4.get_path_name().split('.')[0]==ROOT+'/LV_MahomesStat4'
    assert seq.get_path_name().split('.')[0]==ROOT+'/LS_MahomesStat4'
    aa4={a.get_actor_label():a for a in unreal.GameplayStatics.get_all_actors_of_class(world4,unreal.Actor)}
    unreal.LevelSequenceEditorBlueprintLibrary.open_level_sequence(seq)
    for binding in list(seq.get_bindings()):
        if binding.get_name() in ['Text_Stat4','Text_Title_Stat4']:binding.remove()
    rebind(seq,aa4)
    for i in [1,2,3]:
        scale_tracks(seq,'Text_Stat'+str(i),1.35);scale_tracks(seq,'Text_Title_Stat'+str(i),.75)
    scale_tracks(seq,'Text_Asterisk',.52);scale_tracks(seq,'T_TeamLogo_Wyrms_Logo',.21)
    card_scale=aa4['Stats_Box'].get_actor_scale3d()
    aa4['Stats_Box'].set_actor_scale3d(unreal.Vector(card_scale.x,1.03,card_scale.z))
    aa4['Text_Stat4'].set_actor_scale3d(unreal.Vector(1.35,1.35,1.35))
    aa4['Text_Title_Stat4'].set_actor_scale3d(unreal.Vector(.75,.75,.75))
    for binding in seq.get_bindings():
        if binding.get_name()=='T_Player_WIP':
            for track in binding.get_tracks():
                for section in track.get_sections():
                    for channel in section.get_all_channels():
                        if str(channel.channel_name)=='Scale.Y':channel.set_default(1.0174999772571027*1000/668)
    add_fourth_motion(seq,aa4['Text_Stat4'],'Text_Stat3')
    add_fourth_motion(seq,aa4['Text_Title_Stat4'],'Text_Title_Stat3')
    rebind(seq,aa4)
    chiefs_colors(world4,aa4)
    stretch_sections(seq)
    for b in seq.get_bindings():
        if b.get_name() in ['T_UPL_Horizontal','T_Flag_Mexico']:
            for t in list(b.get_tracks()):
                if isinstance(t,unreal.MovieSceneVisibilityTrack):b.remove_track(t)
    apply_readability_correction(world4,seq)
    unreal.EditorAssetLibrary.set_metadata_tag(world4,'LineupsPoints','4')
    unreal.EditorAssetLibrary.set_metadata_tag(seq,'LineupsPoints','4')
    unreal.EditorAssetLibrary.set_metadata_tag(seq,'LineupsTiming','visual-demo-only; matching fourth-stat entrance; no animation out; Premiere owns transition')
    assert unreal.EditorAssetLibrary.save_loaded_asset(seq)
    assert unreal.EditorAssetLibrary.save_loaded_asset(world4)
    (RECEIPTS/'stat-breakdown-4-build.json').write_text(json.dumps({'status':'built-layout-pending','points':4,'map':ROOT+'/LV_MahomesStat4','sequence':ROOT+'/LS_MahomesStat4','sameTextScaleAsThree':True,'nextStep':'Run refine_stat_breakdown.py after native glyph rebuild before rendering','fourthEntranceOffsetFrames':6,'visualDemoOnly':True,'frameCount':480},indent=2))
    unreal.log('STAT_BREAKDOWN_4_BUILT')


if __name__=='__main__':
    try:
        assert Path(unreal.Paths.convert_relative_path_to_full(unreal.Paths.project_dir())).resolve()==PROJECT
        points=json.loads(CONFIG.read_text())['points']
        if points==3:populate_three()
        elif points==4:populate_four()
        else:raise ValueError('Points must be 3 or 4')
    except:
        (RECEIPTS/'stat-breakdown-build-error.json').write_text(json.dumps({'error':traceback.format_exc()},indent=2));raise
