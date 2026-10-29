"""The reviewed two-player request boundary for the Unreal trial."""

import math
import fcntl
import importlib.util
import json
from pathlib import Path
import re
import shutil
import time
import uuid

from tools.lineups_unreal.native_client import NativeClient

ROOT = Path(__file__).resolve().parents[2]


class ComparisonError(ValueError):
    pass


def build_comparison(request):
    if not isinstance(request, dict):
        raise ComparisonError("Supply a reviewed comparison request.")
    card = request.get("card") or {}
    size = card.get("fontSize", 44)
    if type(size) not in (int, float) or not math.isfinite(size) or size < 36:
        raise ComparisonError("Stat card text must be at least 36 px.")
    if request.get("mode") == "statistics":
        rows = card.get("rows")
        if not isinstance(rows, list) or not 1 <= len(rows) <= 5:
            raise ComparisonError("A statistics breakdown requires 1 to 5 rows.")
        for row in rows:
            if (not isinstance(row, dict) or any(not isinstance(row.get(key), str) or not row[key].strip()
                                                for key in ("label", "left", "right", "source"))):
                raise ComparisonError("Each stat row needs a label, both values, and its source.")
    if request.get("mode") not in ("conceptual", "statistics"):
        raise ComparisonError("Choose conceptual or statistics from the reviewed narration.")
    players = request.get("players")
    if (not isinstance(players, list) or len(players) != 2
            or any(not isinstance(name, str) or not name.strip() for name in players)):
        raise ComparisonError("Supply exactly two player names.")
    if not isinstance(request.get("headline"), str) or not request["headline"].strip():
        raise ComparisonError("Supply the speaker-led headline.")
    if not re.fullmatch(r"WBP_[A-Za-z0-9_]+", request.get("assetName", "WBP_TwoPlayerComparison")):
        raise ComparisonError("Use a simple WBP_ scene name in the trial folder.")
    config = json.loads((ROOT / "config/unreal/comparison-template.json").read_text())
    helper = ROOT / "plugins/s-systems/skills/unreal-storage/scripts/unreal_workspace.py"
    spec = importlib.util.spec_from_file_location("lineups_trial_storage", helper)
    storage = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(storage)
    project = storage.route(ROOT, "CATENA_MEDIA_LINEUPS", "projects") / config["projectName"]
    project_file = storage.working_project(ROOT, "CATENA_MEDIA_LINEUPS", project / (config["projectName"] + ".uproject"))
    directory = project / "Saved/LineupsComparison"
    directory.mkdir(parents=True, exist_ok=True)
    with (directory / "build.lock").open("w") as lock:
        try:
            fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        except BlockingIOError as error:
            raise ComparisonError("Another comparison build is running.") from error
        client = NativeClient()
        if client.call("EditorToolset.EditorAppToolset", "IsPIERunning"):
            raise ComparisonError("Stop the trial play session before changing source widgets.")
        job_id = uuid.uuid4().hex
        backup = Path.home() / ".local/state/singleton-systems/unreal-setup/two-up-backups" / job_id
        backup.mkdir(parents=True)
        for name in ("Content", "Config"):
            if (project / name).is_dir():
                shutil.copytree(project / name, backup / name)
        shutil.copy2(project_file, backup / project_file.name)
        job = {"jobId": job_id, "project": str(project_file), "request": request, "config": config}
        temporary = directory / "request.tmp"
        temporary.write_text(json.dumps(job))
        temporary.replace(directory / "request.json")
        slate = "SlateInspectorToolset.SlateInspectorToolset"
        client.call(slate, "Observe", {"ref": "", "maxDepth": 35})
        snapshot = client.call(slate, "Snapshot", {"ref": "", "maxDepth": 35})
        windows = re.split(r"(?=^window )", snapshot, flags=re.MULTILINE)
        main = next((window for window in windows
                     if window.startswith('window "' + config["projectName"] + ' - Unreal Editor"')), "")
        command_bar = main.partition('text "Cmd"')[2]
        target = re.search(r"textbox[^\n]*\[ref=([^\]]+)\]", command_bar)
        if not target:
            raise ComparisonError("The trial editor's native Cmd field is not available.")
        entry = ROOT / "tools/lineups_unreal/editor_entry.py"
        if not client.call(slate, "Type", {"ref": target[1], "text": "py " + json.dumps(str(entry)), "submit": True}):
            raise ComparisonError("Unreal did not accept the native Python command.")
        receipt = directory / (job_id + ".json")
        deadline = time.monotonic() + 90
        while not receipt.exists() and time.monotonic() < deadline:
            time.sleep(0.1)
        if not receipt.exists():
            raise ComparisonError("Unreal returned no build receipt; inspect the editor log before retrying.")
        result = json.loads(receipt.read_text())
        if result.get("jobId") != job_id or result.get("status") != "passed":
            raise ComparisonError(result.get("error", "Unreal build readback failed."))
        result.update({"receipt": str(receipt), "recoveryPoint": str(backup)})
        return result
