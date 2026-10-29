"""Run through Unreal's native Python console; no server or plugin install."""

import json
import importlib
import sys
import traceback
from pathlib import Path

import unreal

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
from tools.lineups_unreal import editor_scene
importlib.reload(editor_scene)


directory = Path(unreal.Paths.convert_relative_path_to_full(unreal.Paths.project_saved_dir())) / "LineupsComparison"
job = json.loads((directory / "request.json").read_text())
try:
    actual_project = Path(unreal.Paths.get_project_file_path()).resolve()
    if actual_project != Path(job["project"]).resolve():
        raise ValueError("The active Unreal project differs from the requested trial.")
    result = editor_scene.apply_request(job["request"], job["config"])
    result.update({"jobId": job["jobId"], "status": "passed"})
except Exception:
    result = {"jobId": job["jobId"], "status": "failed", "error": traceback.format_exc()}
receipt = directory / (job["jobId"] + ".json")
temporary = receipt.with_suffix(".tmp")
temporary.write_text(json.dumps(result, indent=2))
temporary.replace(receipt)
