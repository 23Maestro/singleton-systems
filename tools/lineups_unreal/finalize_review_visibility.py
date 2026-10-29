"""Correct native visibility keys and save the owned review sequence."""
import unreal
seq=unreal.load_asset('/Game/Lineups/ReviewV1/LS_ComparisonReview')
count=0
for binding in seq.get_bindings():
    for track in binding.get_tracks():
        if isinstance(track,unreal.MovieSceneVisibilityTrack):
            for section in track.get_sections():
                for channel in section.get_all_channels():
                    for key in channel.get_keys():
                        key.set_value(key.get_time().frame_number.value != 0);count+=1
assert count==10,count
assert unreal.EditorAssetLibrary.save_loaded_asset(seq)
unreal.LevelSequenceEditorBlueprintLibrary.set_current_time(100)
unreal.log('LINEUPS_VISIBILITY_FIXED '+str(count))
