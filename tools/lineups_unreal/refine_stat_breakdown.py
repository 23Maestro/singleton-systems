"""Evaluate glyphs, then apply the shared layout to the currently open owned map."""
import importlib
import json
import sys
import traceback
from pathlib import Path
import unreal
sys.path.insert(0,str(Path(__file__).parent))
import build_stat_breakdown as build
importlib.reload(build)
assert Path(unreal.Paths.convert_relative_path_to_full(unreal.Paths.project_dir())).resolve()==build.PROJECT
ACTIVE=unreal.get_editor_subsystem(unreal.UnrealEditorSubsystem).get_editor_world().get_path_name().split('.')[0]
assert ACTIVE in [build.ROOT+'/LV_MahomesStat3',build.ROOT+'/LV_MahomesStat4']
STATE={'status':'evaluating','pending':[int(ACTIVE[-1])],'variants':[],'ticks':0}
CONFIG=json.loads(build.CONFIG.read_text())
REVISION=CONFIG.get('layoutRevisionByPoints',{}).get(ACTIVE[-1],CONFIG['layoutRevision'])
PROOF=build.RECEIPTS/('stat-layout-correction-'+ACTIVE[-1]+'-v'+str(REVISION)+'.json')


def save():
    PROOF.write_text(json.dumps({k:v for k,v in STATE.items() if k!='busy'},indent=2))


def advance(delta):
    if STATE.get('busy'):return
    STATE['busy']=True
    try:
        if not STATE['pending']:
            STATE['status']='saved';save()
            unreal.unregister_slate_post_tick_callback(unreal._lineups_stat_refine_handle)
            return
        points=STATE['pending'][0];path=build.ROOT+'/LV_MahomesStat'+str(points)
        active=unreal.get_editor_subsystem(unreal.UnrealEditorSubsystem).get_editor_world()
        world=active if active.get_path_name().split('.')[0]==path else unreal.load_asset(path)
        seq=unreal.load_asset(build.ROOT+'/LS_MahomesStat'+str(points))
        if STATE['ticks']==0:
            assert unreal.EditorAssetLibrary.save_loaded_asset(world)
            assert unreal.EditorAssetLibrary.save_loaded_asset(seq)
            unreal.LevelSequenceEditorBlueprintLibrary.open_level_sequence(seq)
            unreal.LevelSequenceEditorBlueprintLibrary.set_current_time(200)
        STATE['ticks']+=1
        if STATE['ticks']<15:return
        # Two evaluations let the native Text3D rebuild and source animation settle.
        unreal.LevelSequenceEditorBlueprintLibrary.set_current_time(200)
        removed=build.remove_inherited_highlights(world,seq)
        row=build.apply_content_layout(world,seq,points);row['highlightRemoval']=removed
        assert unreal.EditorAssetLibrary.save_loaded_asset(seq,False)
        assert unreal.EditorLoadingAndSavingUtils.save_map(world,path)
        STATE['variants'].append(row);STATE['pending'].pop(0);STATE['ticks']=0
        save()
    except:
        STATE.update(status='failed',error=traceback.format_exc())
        save()
        unreal.unregister_slate_post_tick_callback(unreal._lineups_stat_refine_handle)
        unreal.log_error(STATE['error'])
    finally:
        STATE['busy']=False


unreal._lineups_stat_refine_handle=unreal.register_slate_post_tick_callback(advance)
