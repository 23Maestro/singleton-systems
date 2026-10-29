"""Read back the saved comparison layout and native motion keys."""
import json
from pathlib import Path
import unreal
ROOT='/Game/Lineups/ReviewV1'
seq=unreal.load_asset(ROOT+'/LS_ComparisonReview')
assert seq.get_display_rate().numerator==30 and seq.get_playback_end()==210
actors={a.get_actor_label():a for a in unreal.get_editor_subsystem(unreal.EditorActorSubsystem).get_all_level_actors()}
assert abs(actors['LineupsReview_leftLogo'].get_actor_location().z-actors['LineupsReview_rightLogo'].get_actor_location().z)<.001
api=unreal.get_default_object(unreal.UMGToolSet)
widgets={}
for layer in ['Titles','Card']:
 bp=unreal.load_asset(ROOT+'/Widgets/WBP_Review'+layer)
 widgets[layer]={str(x.widget_name):x.widget for x in api.call_method('GetWidgets',args=(bp,)).widgets}
card=widgets['Card'];titles=widgets['Titles']
fonts={name:int(w.get_editor_property('font').size) for name,w in card.items() if name.startswith('Row') and isinstance(w,unreal.TextBlock)}
assert len(fonts)==12 and min(fonts.values())>=36,fonts
borders={name:str(w.slot.get_size()) for name,w in card.items() if name.startswith('CardBorder')}
assert len(borders)==4
for name in ['CardBorderTop','CardBorderBottom']:assert card[name].slot.get_size().y==3
for name in ['CardBorderLeft','CardBorderRight']:assert card[name].slot.get_size().x==3
card_bottom=card['StatCard'].slot.get_position().y+card['StatCard'].slot.get_size().y
clearance=min(titles[s+'NamePlate'].slot.get_position().y for s in ['left','right'])-card_bottom
assert clearance>=20,clearance
motion=[]
for b in seq.get_bindings():
 for t in b.get_tracks():
  if not isinstance(t,(unreal.MovieScene3DTransformTrack,unreal.MovieSceneVisibilityTrack)):continue
  for s in t.get_sections():
   channels=[]
   for ch in s.get_all_channels():
    channels.append([{'frame':k.get_time().frame_number.value,'value':k.get_value()} for k in ch.get_keys()])
   motion.append({'actor':str(b.get_name()),'track':t.get_class().get_name(),'channels':channels})
for track in motion:
 if track['actor'] in ('LineupsReview_Card','LineupsReview_CardBody') and track['track']=='MovieScene3DTransformTrack':
  z=track['channels'][2];final=z[-1]['value'];assert all(k['value']>=final-.0001 for k in z),z
  assert z[-2]['frame']==49 and z[-1]['frame']==210,z
 if track['track']=='MovieSceneVisibilityTrack':assert [k['value'] for k in track['channels'][0]]==[False,True]
result={'status':'passed','minimumCardFont':min(fonts.values()),'fontSizes':fonts,'cardBorderPx':3,'nameplateClearancePx':clearance,'logoCenterPlaneAligned':True,'frameCount':210,'frameRate':30,'visualDemoOnly':True,'exitCue':None,'motion':motion}
Path('/Volumes/UnrealSSD/Generated/CATENA_MEDIA_LINEUPS/source/unreal/receipts/lineups-review-verification.json').write_text(json.dumps(result,indent=2)+'\n')
unreal.log('LINEUPS_REVIEW_VERIFICATION_PASSED')
