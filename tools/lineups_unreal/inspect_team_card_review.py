"""Read active review bindings and modifiers before further layout changes."""
import json
from pathlib import Path
import unreal

def inspect():
    world=unreal.get_editor_subsystem(unreal.UnrealEditorSubsystem).get_editor_world()
    slug=world.get_path_name().split('.')[0].rsplit('_',1)[1]
    seq=unreal.load_asset('/Game/Lineups/TeamCardsV1/LS_'+slug)
    source=unreal.load_asset('/Game/_Scenes/FS_TeamVSTeam')
    source_seq=next(o for o in unreal.ObjectIterator() if isinstance(o,unreal.AvaSequence) and o.get_path_name().startswith('/Game/_Scenes/FS_TeamVSTeam.') and not str(o.get_label()).endswith('Out'))
    aa={a.get_actor_label():a for a in unreal.get_editor_subsystem(unreal.EditorActorSubsystem).get_all_level_actors()}
    data={'slug':slug,'bindings':[],'actors':[], 'sourceRanges':[{ 'name':b.get_name(),'tracks':[[{'start':sec.get_start_frame() if sec.has_start_frame() else None,'end':sec.get_end_frame() if sec.has_end_frame() else None,'blend':str(sec.get_blend_type())} for sec in tr.get_sections()] for tr in b.get_tracks()]} for b in source_seq.get_bindings()]}
    for b in seq.get_bindings():
        row={'name':b.get_name(),'tracks':[]}
        for t in b.get_tracks():
            tr={'class':t.get_class().get_name(),'sections':[]}
            for s in t.get_sections():
                section={'start':s.get_start_frame() if s.has_start_frame() else None,'end':s.get_end_frame() if s.has_end_frame() else None,'blend':str(s.get_blend_type()),'channels':[]}
                for ch in s.get_all_channels():
                    section['channels'].append({'name':str(ch.channel_name),'default':str(ch.get_default()) if ch.has_default() else None,'keys':[{'time':str(k.get_time()),'value':str(k.get_value())} for k in ch.get_keys()]})
                tr['sections'].append(section)
            row['tracks'].append(tr)
        data['bindings'].append(row)
    for name in ['Team_L','SM_Branding_TeamLogo_L','TeamName_L','TeamRecord_L']:
        actor=aa[name];root=actor.get_editor_property('root_component')
        stack=unreal.ActorModifierCoreLibrary.find_modifier_stack(actor,False)
        data['actors'].append({'name':name,'worldScale':str(actor.get_actor_scale3d()),'relativeScale':str(root.get_editor_property('relative_scale3d')),'rotation':str(actor.get_actor_rotation()),'parent':str(actor.get_attach_parent_actor()),'modifiers':[{'class':m.get_class().get_name(),'enableMethods':[n for n in dir(m) if 'enable' in n.lower()]} for m in unreal.ActorModifierCoreLibrary.get_stack_modifiers(stack)] if stack else []})
    Path('/Volumes/UnrealSSD/Generated/CATENA_MEDIA_LINEUPS/source/unreal/receipts/team-card-review-bindings.json').write_text(json.dumps(data,indent=2))

inspect()
