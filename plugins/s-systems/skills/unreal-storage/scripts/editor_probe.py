"""Run in Unreal's full editor to prove native Python access and save a readback."""
import json
import os
from pathlib import Path
import unreal

output = Path(os.environ["UNREAL_AGENT_PROBE_OUTPUT"])
actors = unreal.get_editor_subsystem(unreal.EditorActorSubsystem).get_all_level_actors()
receipt = {
    "engine_version": unreal.SystemLibrary.get_engine_version(),
    "project_directory": unreal.Paths.project_dir(),
    "project_saved_directory": unreal.Paths.project_saved_dir(),
    "actor_count": len(actors),
    "actors": [{"name": actor.get_name(), "label": actor.get_actor_label(),
                "class": actor.get_class().get_name()} for actor in actors[:100]],
    "scene_modified": False,
}
output.write_text(json.dumps(receipt, indent=2) + "\n")
unreal.log(f"UNREAL_AGENT_PROBE_PASSED {output}")
