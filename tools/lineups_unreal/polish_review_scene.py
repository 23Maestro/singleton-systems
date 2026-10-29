"""Refine the owned review map's logo silhouettes and restrained lighting."""
import json
from pathlib import Path
import unreal
ROOT='/Game/Lineups/ReviewV1'
PROJECT=Path('/Volumes/UnrealSSD/Generated/CATENA_MEDIA_LINEUPS/source/unreal/projects/SportsBroadcastTrial58')
actors={a.get_actor_label():a for a in unreal.get_editor_subsystem(unreal.EditorActorSubsystem).get_all_level_actors()}
for side in ['left','right']:
 name='SM_'+side+'LogoSmooth';path=ROOT+'/Meshes/'+name
 if not unreal.EditorAssetLibrary.does_asset_exist(path):
  ui=unreal.FbxImportUI()
  for k,v in dict(import_mesh=True,import_materials=False,import_textures=False,import_as_skeletal=False,automated_import_should_detect_type=False,mesh_type_to_import=unreal.FBXImportType.FBXIT_STATIC_MESH).items():ui.set_editor_property(k,v)
  for k,v in dict(combine_meshes=True,convert_scene=False,convert_scene_unit=False,force_front_x_axis=False,auto_generate_collision=False,normal_import_method=unreal.FBXNormalImportMethod.FBXNIM_COMPUTE_NORMALS).items():ui.static_mesh_import_data.set_editor_property(k,v)
  t=unreal.AssetImportTask()
  for k,v in dict(filename=str(PROJECT/'SourceArt/LineupsReview'/(side+'LogoSmooth.obj')),destination_path=ROOT+'/Meshes',destination_name=name,automated=True,save=True,replace_existing=False,options=ui).items():t.set_editor_property(k,v)
  unreal.AssetToolsHelpers.get_asset_tools().import_asset_tasks([t])
 mesh=unreal.load_asset(path);assert isinstance(mesh,unreal.StaticMesh)
 actors['LineupsReview_'+side+'Logo'].static_mesh_component.set_static_mesh(mesh)
for label,power in {'RectLight_2_EdgeLight_L':4.4,'RectLight_2_EdgeLight_R':4.4,'RectLight_1_Logo_Bottom':.9,'RectLight_0_Ambient_Straight':3}.items():
 actors['LineupsReview_'+label].get_component_by_class(unreal.LightComponent).set_intensity(power)
world=unreal.get_editor_subsystem(unreal.UnrealEditorSubsystem).get_editor_world()
assert unreal.EditorLoadingAndSavingUtils.save_map(world,ROOT+'/LV_ComparisonReview')
p=PROJECT.parent.parent/'receipts/lineups-review-export.json'
r=json.loads(p.read_text());r['status']='built';r['previousRenders'].append({'output':r['output'],'status':'superseded-polish','reason':'Lower light intensity and smoother logo silhouette.'})
r['output']='/Volumes/HomeSSD/Generated/CATENA_MEDIA_LINEUPS/renders/unreal-comparison-review-v3'
r['sourceInspiredLightRoles']=r.pop('reusedLights',[])
p.write_text(json.dumps(r,indent=2)+'\n');unreal.log('LINEUPS_REVIEW_POLISHED')
