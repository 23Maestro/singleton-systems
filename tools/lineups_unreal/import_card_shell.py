"""Import the approved Three.js asset pathway into an isolated native folder."""
import json
import hashlib
import traceback
from pathlib import Path
import unreal

PROJECT = Path('/Volumes/UnrealSSD/Generated/CATENA_MEDIA_LINEUPS/source/unreal/projects/SportsBroadcastTrial58')
SOURCE = Path('/Volumes/HomeSSD/Generated/CATENA_MEDIA_LINEUPS/source/team-card-shell-three-v1/TeamCardShell.glb')
ROOT = '/Game/Lineups/TeamCardShellV1'
PROOF = PROJECT.parent.parent / 'receipts/card-shell-import-v1.json'
state = {'status': 'importing', 'source': str(SOURCE), 'root': ROOT}
try:
    assert Path(unreal.Paths.convert_relative_path_to_full(unreal.Paths.project_dir())).resolve() == PROJECT
    assert SOURCE.is_file()
    manifest=json.loads(SOURCE.with_name('manifest.json').read_text())
    assert hashlib.sha256(SOURCE.read_bytes()).hexdigest()==manifest['glbSha256']
    state['sourceSha256']=manifest['glbSha256']
    if not unreal.EditorAssetLibrary.list_assets(ROOT, recursive=True):
        task = unreal.AssetImportTask()
        for key, value in dict(filename=str(SOURCE), destination_path=ROOT+'/Imported', automated=True, save=True, replace_existing=False).items():
            task.set_editor_property(key, value)
        unreal.AssetToolsHelpers.get_asset_tools().import_asset_tasks([task])
    assets = unreal.EditorAssetLibrary.list_assets(ROOT, recursive=True)
    meshes = []
    for path in assets:
        asset = unreal.load_asset(path)
        if isinstance(asset, unreal.StaticMesh):
            filenames=list(asset.get_editor_property('asset_import_data').extract_filenames())
            assert filenames and Path(filenames[0]).resolve()==SOURCE.resolve(), filenames
            meshes.append({'path': path, 'bounds': str(asset.get_bounds()), 'extent': [asset.get_bounds().box_extent.x, asset.get_bounds().box_extent.y, asset.get_bounds().box_extent.z], 'materials': [str(s.material_slot_name) for s in asset.static_materials]})
    if len(meshes) != 1 or len(meshes[0]['materials']) != 6:
        raise RuntimeError('Expected one static mesh and six material slots: '+str(meshes))
    state.update(status='imported', meshes=meshes, assets=list(assets))
except Exception:
    state.update(status='failed', error=traceback.format_exc())
    raise
finally:
    PROOF.write_text(json.dumps(state, indent=2)+'\n')
