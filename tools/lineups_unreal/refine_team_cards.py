"""Measure native glyphs, normalize paired-card layout, preserve entrance and hold."""
import json
import math
import sys
import traceback
from pathlib import Path
import unreal
sys.path.insert(0, str(Path(__file__).parent))
import build_team_cards as build

ROOT = build.ROOT
world = unreal.get_editor_subsystem(unreal.UnrealEditorSubsystem).get_editor_world()
ACTIVE = world.get_path_name().split('.')[0]
world = None
assert ACTIVE in [ROOT + '/LV_' + s for s in build.VARIANTS]
slug = ACTIVE.rsplit('_', 1)[1]
seq = unreal.load_asset(ROOT + '/LS_' + slug)
assert unreal.EditorAssetLibrary.get_metadata_tag(seq, 'LineupsOwner') == build.OWNER
STATE = {'status': 'evaluating', 'slug': slug, 'ticks': 0}
PROOF = build.RECEIPTS / ('team-cards-layout-' + slug + '.json')


def save():
    PROOF.write_text(json.dumps(STATE, indent=2) + '\n')


def channels(actor):
    for binding in seq.get_bindings():
        if binding.get_name() == actor.get_actor_label():
            for track in binding.get_tracks():
                if isinstance(track, unreal.MovieScene3DTransformTrack):
                    for section in track.get_sections():
                        yield from section.get_all_channels()


def pin_transform(actor, scale_ratio=None):
    root = actor.get_editor_property('root_component')
    loc = root.get_editor_property('relative_location')
    rot = root.get_editor_property('relative_rotation')
    sc = root.get_editor_property('relative_scale3d')
    values = dict(zip(('Location.X','Location.Y','Location.Z','Rotation.X','Rotation.Y','Rotation.Z','Scale.X','Scale.Y','Scale.Z'),
                      (loc.x,loc.y,loc.z,rot.roll,rot.pitch,rot.yaw,sc.x,sc.y,sc.z)))
    for channel in channels(actor):
        name = str(channel.channel_name)
        if name not in values:
            continue
        target = values[name]
        channel.set_default(target)
        keys = channel.get_keys()
        if name.startswith('Scale.') and scale_ratio is not None and keys:
            final = keys[-1].get_value()
            if abs(final) > .00001:
                ratio = target / final
                for key in keys:
                    key.set_value(key.get_value() * ratio)
                continue
        for key in keys:
            key.set_value(target)


def reset_transform(actor):
    binding = next((b for b in seq.get_bindings() if b.get_name() == actor.get_actor_label()), None)
    if binding is None:
        binding = seq.add_possessable(actor)
    for track in list(binding.get_tracks()):
        if isinstance(track, unreal.MovieScene3DTransformTrack):
            binding.remove_track(track)
    section = binding.add_track(unreal.MovieScene3DTransformTrack).add_section()
    section.set_range(0, build.END)
    section.set_completion_mode(unreal.MovieSceneCompletionMode.KEEP_STATE)
    pin_transform(actor)


def bounds(actor, camera):
    c,e = actor.get_actor_bounds(False)
    factor = 1920 / (2*(c.x-camera.get_actor_location().x)*math.tan(math.radians(camera.get_cine_camera_component().get_horizontal_field_of_view()/2)))
    return [960+(c.y-e.y)*factor,540-(c.z+e.z)*factor,960+(c.y+e.y)*factor,540-(c.z-e.z)*factor], factor


def place(actor, camera, center, height=None, width=None, max_width=None):
    b,f = bounds(actor,camera)
    ratio = (height/(b[3]-b[1])) if height else (width/(b[2]-b[0])) if width else 1
    if max_width and (b[2]-b[0])*ratio > max_width:
        ratio = max_width/(b[2]-b[0])
    sc = actor.get_actor_scale3d()
    actor.set_actor_scale3d(unreal.Vector(sc.x*ratio,sc.y*ratio,sc.z*ratio))
    b,f = bounds(actor,camera)
    loc = actor.get_actor_location()
    actor.set_actor_location(unreal.Vector(loc.x,loc.y+(center[0]-(b[0]+b[2])/2)/f,loc.z-(center[1]-(b[1]+b[3])/2)/f),False,False)
    pin_transform(actor, ratio)


def advance(delta):
    STATE['ticks'] += 1
    if STATE['ticks'] < 15:
        return
    try:
        world = unreal.get_editor_subsystem(unreal.UnrealEditorSubsystem).get_editor_world()
        aa = {a.get_actor_label():a for a in unreal.get_editor_subsystem(unreal.EditorActorSubsystem).get_all_level_actors()}
        camera = aa['AvaCineCameraActor_Main']
        phase = STATE.get('phase', 0)
        if phase == 0:
            for embedded in build.objects(ACTIVE + '.', unreal.AvaSequence):
                for binding in list(embedded.get_bindings()): binding.remove()
                for track in list(embedded.get_tracks()): embedded.remove_track(track)
        if phase == 0:
            for name in ['Team_L','Team_R','SM_Branding_TeamLogo_L','SM_Branding_TeamLogo_R','TeamName_L','TeamName_R','TeamRecord_L','TeamRecord_R','VS']:
                reset_transform(aa[name])
        for side, index in [('L',0),('R',1)]:
            center = 500 if index == 0 else 1420
            group = aa['Team_' + side]
            loc = group.get_actor_location()
            group.set_actor_location(unreal.Vector(1021,-242 if index==0 else 242,-1),False,False)
            group.set_actor_scale3d(unreal.Vector(.9,.9,.9))
            pin_transform(group, .9)
            logo = aa['SM_Branding_TeamLogo_' + side]
            if phase == 0:
                logo.set_actor_rotation(unreal.Rotator(pitch=0,yaw=0,roll=0),False)
                logo.set_actor_scale3d(unreal.Vector(.56,-.56,.56))
                pin_transform(logo, 1)
            else:
                place(logo,camera,(center,435),width=570,max_width=570)
            place(aa['TeamName_'+side],camera,(center,780),height=60,max_width=630)
            place(aa['TeamRecord_'+side],camera,(center,705),height=82,max_width=350)
            if phase == 0:
                color = build.VARIANTS[slug]['primary'][index]
                linear = [v/12.92 if v<=.04045 else ((v+.055)/1.055)**2.4 for v in color]
                for label in ['Container_Solid_'+side+'3','Container_Gradient_'+side+'1','Container_Pattern_'+side+'1','Container_BottomBar_'+side+'1']:
                    tint = (.006,.008,.012) if 'BottomBar' in label else tuple(v*.4 for v in linear)
                    for value in build.objects(aa[label].get_path_name()+'.', unreal.DMMaterialValueFloat3RGB):
                        if not value.get_name().startswith('Global'):value.set_value(unreal.LinearColor(*tint,1))
            # The source rank tabs and brush labels are soccer artwork, not NFL data.
            for label in ['TeamPlacement_Tab_'+side,'Container_BrushText_'+side+'3']:
                aa[label].set_actor_hidden_in_game(True)
                aa[label].set_is_temporarily_hidden_in_editor(True)
        place(aa['VS'],camera,(960,495),height=140)
        if phase == 0:
            STATE.update(phase=1,ticks=0);return
        if build.VARIANTS[slug]['headline']:
            headline = aa.get('LineupsTeam_Headline')
            if not headline:
                headline = unreal.get_editor_subsystem(unreal.EditorActorSubsystem).duplicate_actor(aa['VS'],world)
                headline.set_actor_label('LineupsTeam_Headline')
                headline.detach_from_actor(unreal.DetachmentRule.KEEP_WORLD,unreal.DetachmentRule.KEEP_WORLD,unreal.DetachmentRule.KEEP_WORLD)
            build.set_text(headline,build.VARIANTS[slug]['headline'])
            if phase == 1:
                headline.set_actor_location(unreal.Vector(900,0,220),False,False)
                headline.set_actor_scale3d(unreal.Vector(.8,.8,.8))
            else:
                place(headline,camera,(960,110),height=92,max_width=1600)
            reset_transform(headline)
            # Rebuilt text bounds are measured in the second pass below.
        if phase == 1:
            STATE.update(phase=2,ticks=0);return
        unreal.unregister_slate_post_tick_callback(unreal._lineups_team_refine)
        STATE['nodes'] = {name:bounds(actor,camera)[0] for name,actor in aa.items() if name.startswith(('SM_Branding_TeamLogo','TeamName','TeamRecord','VS'))}
        unreal.EditorAssetLibrary.set_metadata_tag(world,'LineupsLayoutRevision','2')
        unreal.EditorAssetLibrary.set_metadata_tag(seq,'LineupsLayoutRevision','2')
        assert unreal.EditorAssetLibrary.save_loaded_asset(seq)
        assert unreal.EditorLoadingAndSavingUtils.save_map(world,ACTIVE)
        STATE['status']='saved';save()
    except Exception:
        unreal.unregister_slate_post_tick_callback(unreal._lineups_team_refine)
        STATE.update(status='failed',error=traceback.format_exc());save();unreal.log_error(STATE['error'])


unreal.LevelSequenceEditorBlueprintLibrary.open_level_sequence(seq)
unreal.LevelSequenceEditorBlueprintLibrary.set_current_time(200)
unreal._lineups_team_refine = unreal.register_slate_post_tick_callback(advance)
save()
