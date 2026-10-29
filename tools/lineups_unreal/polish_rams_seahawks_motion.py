"""Remove overlapping logo bevels, fade fixed VS, and anchor turf contact shadows."""
import hashlib
import json
import sys
import traceback
from pathlib import Path
import unreal
REPO=Path('/Users/singleton23/Documents/Development/singleton-systems')
sys.path.insert(0,str(REPO/'tools/lineups_unreal'))
import editor_scene
import build_review_export as native
PROJECT=native.PROJECT
ROOT='/Game/Lineups/RamsSeahawksMotionV1'
SOURCE=Path('/Volumes/HomeSSD/Generated/CATENA_MEDIA_LINEUPS/source')
proof=PROJECT.parent.parent/'receipts/rams-seahawks-polish-v2.json'
r={'status':'updating','animationOut':False}
try:
 assert Path(unreal.Paths.convert_relative_path_to_full(unreal.Paths.project_dir())).resolve()==PROJECT
 seq=unreal.load_asset(ROOT+'/LS_RamsSeahawks');assert unreal.EditorAssetLibrary.get_metadata_tag(seq,'LineupsOwner')=='lineups-rams-seahawks-motion-v1'
 unreal.LevelSequenceEditorBlueprintLibrary.close_level_sequence()
 world=unreal.get_editor_subsystem(unreal.UnrealEditorSubsystem).get_editor_world();assert world.get_path_name().split('.')[0]==ROOT+'/LV_RamsSeahawks'
 assert unreal.EditorLoadingAndSavingUtils.save_map(world,ROOT+'/LV_RamsSeahawks')
 aa={a.get_actor_label():a for a in unreal.get_editor_subsystem(unreal.EditorActorSubsystem).get_all_level_actors()}
 manifest=json.loads((SOURCE/'rams-seahawks-vector-logos-v2/manifest.json').read_text())
 logo_paths={}
 for team in ['Rams','Seahawks']:
  record=manifest[team];assert hashlib.sha256(Path(record['path']).read_bytes()).hexdigest()==record['sha256']
  folder=ROOT+'/StableLogos/'+team
  if not unreal.EditorAssetLibrary.list_assets(folder,recursive=True):
   task=unreal.AssetImportTask()
   for k,v in dict(filename=record['path'],destination_path=folder,automated=True,save=True,replace_existing=False).items():task.set_editor_property(k,v)
   unreal.AssetToolsHelpers.get_asset_tools().import_asset_tasks([task])
  meshes=[unreal.load_asset(p) for p in unreal.EditorAssetLibrary.list_assets(folder,recursive=True)]
  meshes=[m for m in meshes if isinstance(m,unreal.StaticMesh)];assert len(meshes)==1
  aa[team+'_Logo'].static_mesh_component.set_static_mesh(meshes[0]);logo_paths[team]=meshes[0].get_path_name()
 # Keep both feet on one plane throughout the entrance.
 for binding in list(seq.get_bindings()):
  if binding.get_name() in ['VS','VS_Opacity']:
   binding.remove()
  elif binding.get_name() in ['Rams_Card','Seahawks_Card']:
   for track in binding.get_tracks():
    if isinstance(track,unreal.MovieScene3DTransformTrack):
     for section in track.get_sections():
      for key in section.get_all_channels()[2].get_keys():key.set_value(0.)
 for team,x in [('Rams',-64),('Seahawks',64)]:aa[team+'_Card'].set_actor_location(unreal.Vector(x,0,0),False,False)
 vs=aa['VS'];vs.set_actor_location(unreal.Vector(0,7,1),False,False);vs.set_actor_rotation(unreal.Rotator(yaw=-90),False)
 vs.set_actor_hidden_in_game(True);vs.set_is_temporarily_hidden_in_editor(True)
 tools=unreal.AssetToolsHelpers.get_asset_tools();native.ROOT=ROOT
 collection=unreal.load_asset(ROOT+'/MPC_VSFade') or tools.create_asset('MPC_VSFade',ROOT,unreal.MaterialParameterCollection,unreal.MaterialParameterCollectionFactoryNew())
 parameter=unreal.CollectionScalarParameter();parameter.set_editor_property('parameter_name','Opacity');parameter.set_editor_property('default_value',0.)
 collection.set_editor_property('scalar_parameters',[parameter]);unreal.EditorAssetLibrary.save_loaded_asset(collection)
 texture_path=SOURCE/'rams-seahawks-vs-fade-v1.png'
 texture=editor_scene.import_texture('VS_Fade',{'path':str(texture_path),'sha256':hashlib.sha256(texture_path.read_bytes()).hexdigest()},ROOT)
 material=native.material('M_VSFade',texture=texture,unlit=True)
 material.set_editor_property('blend_mode',unreal.BlendMode.BLEND_TRANSLUCENT);ml=unreal.MaterialEditingLibrary
 sample=next(e for e in unreal.ObjectIterator() if isinstance(e,unreal.MaterialExpressionTextureSample) and e.get_outer()==material)
 opacity=ml.create_material_expression(material,unreal.MaterialExpressionCollectionParameter);opacity.set_editor_property('collection',collection);opacity.set_editor_property('parameter_name','Opacity')
 multiply=ml.create_material_expression(material,unreal.MaterialExpressionMultiply);ml.connect_material_expressions(sample,'A',multiply,'A');ml.connect_material_expressions(opacity,'',multiply,'B');ml.connect_material_property(multiply,'',unreal.MaterialProperty.MP_OPACITY)
 ml.recompile_material(material);unreal.EditorAssetLibrary.save_loaded_asset(material)
 fade=aa.get('VS_Fade') or native.spawn(unreal.StaticMeshActor,'VS_Fade',unreal.Vector(0,7,1),unreal.Rotator(yaw=-90))
 fade.static_mesh_component.set_static_mesh(unreal.load_asset('/Game/Lineups/ReviewV1/Meshes/SM_ReviewQuad'));fade.static_mesh_component.set_material(0,material);fade.static_mesh_component.set_cast_shadow(False)
 fade.set_actor_location(unreal.Vector(0,7,1),False,False);fade.set_actor_scale3d(unreal.Vector(1,-14,14*376/405));fade.set_actor_rotation(unreal.Rotator(yaw=-90),False)
 for track in list(seq.get_tracks()):
  if isinstance(track,unreal.MovieSceneMaterialParameterCollectionTrack):seq.remove_track(track)
 track=seq.add_track(unreal.MovieSceneMaterialParameterCollectionTrack);track.set_editor_property('mpc',collection);section=track.add_section();section.set_range(0,180)
 rate=seq.get_tick_resolution()
 for frame,value in [(0,0.),(60,0.),(75,1.),(179,1.)]:section.add_scalar_parameter_key('Opacity',unreal.FrameNumber(round(frame*rate.numerator/(30*rate.denominator))),value)
 # A shallow transparent shadow footprint stays on the turf under each card.
 shadow_path=SOURCE/'rams-seahawks-contact-shadow-v1.png';digest=hashlib.sha256(shadow_path.read_bytes()).hexdigest()
 texture=editor_scene.import_texture('ContactShadow',{'path':str(shadow_path),'sha256':digest},ROOT)
 native.ROOT=ROOT
 m=native.material('M_TurfContactShadow',texture=texture,color=(0,0,0),unlit=True)
 m.set_editor_property('blend_mode',unreal.BlendMode.BLEND_TRANSLUCENT)
 ml=unreal.MaterialEditingLibrary
 samples=[e for e in unreal.ObjectIterator() if isinstance(e,unreal.MaterialExpressionTextureSample) and e.get_outer()==m]
 assert len(samples)==1;ml.connect_material_property(samples[0],'A',unreal.MaterialProperty.MP_OPACITY);ml.recompile_material(m);unreal.EditorAssetLibrary.save_loaded_asset(m)
 plane=unreal.load_asset('/Engine/BasicShapes/Plane')
 for team,x in [('Rams',-64),('Seahawks',64)]:
  label=team+'_TurfContactShadow';a=aa.get(label) or native.spawn(unreal.StaticMeshActor,label,unreal.Vector(x,12,-44.72))
  a.static_mesh_component.set_static_mesh(plane);a.static_mesh_component.set_material(0,m);a.static_mesh_component.set_cast_shadow(False);a.static_mesh_component.set_mobility(unreal.ComponentMobility.MOVABLE)
  a.set_actor_scale3d(unreal.Vector(1.5,.75,1));a.set_actor_location(unreal.Vector(x,12,-44.72),False,False);a.set_actor_rotation(unreal.Rotator(),False)
  a.attach_to_actor(aa[team+'_Card'],'',unreal.AttachmentRule.KEEP_WORLD,unreal.AttachmentRule.KEEP_WORLD,unreal.AttachmentRule.KEEP_WORLD,False)
 unreal.EditorAssetLibrary.set_metadata_tag(seq,'LineupsPolish','fixed VS fade 60-75; ground-bound contact shadows; separated logo bevel layers')
 unreal.EditorAssetLibrary.save_loaded_asset(seq);assert unreal.EditorLoadingAndSavingUtils.save_map(world,ROOT+'/LV_RamsSeahawks')
 r.update(status='saved',logos=logo_paths,logoLayerSeparationMeters=.003,logoBevelThicknessMeters=.0009,vsTransformAnimated=False,vsFadeFrames=[60,75],shadowMethod='soft translucent contact shadow planes attached to card roots at turf height',groundZ=-44.72)
except Exception:r.update(status='failed',error=traceback.format_exc());raise
finally:proof.write_text(json.dumps(r,indent=2)+'\n')
