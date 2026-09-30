#!/usr/bin/env python3
"""Load the supplied 745 visual direction; gate only the enrolled edit.

The hook verifies contract enrollment, not rendered appearance. Native UI edits
receive reminders; their controls cannot prove the target sequence or pixels.
"""
import argparse
import hashlib
import json
import math
import os
from pathlib import Path
import re
import subprocess
import sys
import tempfile

ROOT = Path(__file__).resolve().parents[2]
READ_OPERATIONS = re.compile(r"^(get_|list_|find_|read_|search_|detect_|analyze_|inspect_|check_)")
NAVIGATION = {"set_playhead_position", "set_active_sequence", "play_sequence", "stop_playback", "save_project", "save_project_as"}
UUID = re.compile(r"[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}", re.I)


def load_data():
    directory = Path(os.environ.get("CREATIVE_745_CONFIG_DIR", ROOT / "config/745-creative"))
    contract = json.loads((directory / "visual-contract.json").read_text())
    if contract.get("schemaVersion") != 1 or not contract.get("clients") or not contract.get("sources", {}).get("visualDirection"):
        raise ValueError("745 visual contract is missing its version, clients, or visual-direction source")
    for client_id, entry in list(contract["clients"].items()):
        if "contractFile" not in entry:
            continue
        if set(entry) != {"contractFile"} or not isinstance(entry["contractFile"], str):
            raise ValueError(f"745 client index must contain only contractFile: {client_id}")
        client_path = (directory / entry["contractFile"]).resolve()
        if directory.resolve() not in client_path.parents:
            raise ValueError(f"745 client contract must stay inside its config directory: {client_id}")
        document = json.loads(client_path.read_text())
        if document.get("schemaVersion") != 1 or document.get("clientId") != client_id:
            raise ValueError(f"745 client contract identity/version mismatch: {client_id}")
        client = document.get("client")
        if not isinstance(client, dict) or not all(client.get(field) for field in ("name", "aliases", "brand", "rules", "lanes")):
            raise ValueError(f"745 client contract incomplete: {client_id}")
        if document.get("sources", {}).get("visualDirection") != contract["sources"]["visualDirection"]:
            raise ValueError(f"745 client visual-direction source mismatch: {client_id}")
        client["sources"] = document["sources"]
        contract["clients"][client_id] = client
    active_path = directory / "active-edit.json"
    active = json.loads(active_path.read_text()) if active_path.exists() else None
    return contract, active, active_path


def profile(contract, client_id, lane_id):
    client = contract["clients"].get(client_id)
    if not client or lane_id not in client.get("lanes", {}):
        raise ValueError(f"Unknown 745 client/lane: {client_id}/{lane_id}; bind a listed treatment before editing")
    return client, client["lanes"][lane_id]


def validate_active(contract, active):
    if not isinstance(active, dict) or active.get("schemaVersion") != 1:
        raise ValueError("745 edit requires a versioned active-edit.json")
    client, lane = profile(contract, active.get("clientId"), active.get("laneId"))
    permitted_fields = {"schemaVersion", "clientId", "laneId", "sequenceId", "projectPath", "source", "sourceTitle",
                        "headline", "headlineLines", "captionOwner", "width", "height", "adjustments", "visualStatus"}
    if set(active) - permitted_fields:
        raise ValueError("745 active edit contains unapproved style overrides; fixed style fields live only in the contract")
    policy = contract.get("jeramiWiggleRoom") or {}
    if policy.get("maxDeviationPercent") != 10:
        raise ValueError("745 template must retain Jerami's 10% allowance")
    adjustments = active.get("adjustments", {})
    if not isinstance(adjustments, dict):
        raise ValueError("745 adjustments must be an object")
    for field, value in adjustments.items():
        if field not in policy["adjustablePercentFields"]:
            raise ValueError(f"745 fixed or unknown style field: {field}; ask Jerami before changing it")
        if isinstance(value, bool) or not isinstance(value, (int, float)) or not math.isfinite(value) or abs(value) > 10:
            raise ValueError(f"745 {field} exceeds the 10% allowance or is not a finite percentage")
    if not UUID.fullmatch(str(active.get("sequenceId", ""))):
        raise ValueError("745 edit requires the exact Premiere sequence ID")
    if (active.get("width"), active.get("height")) != (1080, 1920) or active.get("captionOwner") != "Opus Clip":
        raise ValueError("745 edit must retain 1080x1920 and Opus Clip caption ownership")
    for field in ("source", "projectPath", "headline"):
        if not isinstance(active.get(field), str) or not active[field].strip():
            raise ValueError(f"745 active edit is missing {field}")
    reference = lane.get("reference")
    if reference:
        reference_path = Path(reference["path"])
        if not reference_path.is_file():
            raise ValueError(f"745 visual reference unavailable: {reference_path}; restore it, do not guess")
        if hashlib.sha256(reference_path.read_bytes()).hexdigest() != reference.get("sha256"):
            raise ValueError("745 visual reference hash changed; review the replacement before binding")
    return client, lane


def context(contract, client_id, lane_id, active=None):
    client, lane = profile(contract, client_id, lane_id)
    result = {
        "profile": f"{client_id}/{lane_id}", "source": contract["sources"]["visualDirection"],
        "brand": client["brand"], "rules": client["rules"], "lane": lane,
        "references": client.get("references", {}),
        "clientSources": client.get("sources", {}),
        "coverDirection": client.get("coverDirection", {}),
        "batch": client.get("batch", {}),
        "productionStatus": client.get("productionStatus", {}),
        "workflow": contract["workflow"],
        "jeramiWiggleRoom": contract["jeramiWiggleRoom"],
    }
    if active and (active.get("clientId"), active.get("laneId")) == (client_id, lane_id):
        result["activeEdit"] = active
    return "745 visual contract (source rules govern; Jev cannot override them):\n" + json.dumps(result, ensure_ascii=False, indent=2)


def emit(event, text, deny=False):
    output = {"hookEventName": event}
    if deny:
        output.update(permissionDecision="deny", permissionDecisionReason=text)
    else:
        output["additionalContext"] = text
    print(json.dumps({"hookSpecificOutput": output}))


def prompt_match(contract, prompt):
    lowered = prompt.lower()
    clients = [(key, value) for key, value in contract["clients"].items()
               if any(alias in lowered for alias in value["aliases"])]
    if len(clients) != 1:
        return None
    client_id, client = clients[0]
    lanes = [key for key, value in client["lanes"].items()
             if any(re.search(r"(?<!\w)" + re.escape(alias) + r"(?!\w)", lowered) for alias in value["aliases"])]
    return (client_id, lanes[0]) if len(lanes) == 1 else (client_id, None)


def hook(payload):
    event = payload.get("hook_event_name")
    tool_name = str(payload.get("tool_name", ""))
    tool_input = payload.get("tool_input") or {}
    searchable = json.dumps(tool_input, ensure_ascii=False)
    prompt = str(payload.get("prompt", ""))
    is_prompt = event == "UserPromptSubmit"
    if is_prompt and not re.search(r"745|pastor john|john.?s? prayer|pastor ben|eric miller", prompt, re.I):
        return
    if event not in {"UserPromptSubmit", "PreToolUse"}:
        return
    if not is_prompt and not ("premiere_pro" in tool_name or "cua" in tool_name or tool_name in {"functions.exec", "exec"}):
        return
    if tool_name in {"functions.exec", "exec"} and "mcp__premiere_pro__" not in searchable:
        return
    if "premiere_pro" in tool_name:
        operation = tool_name.rsplit("__", 1)[-1]
        if READ_OPERATIONS.match(operation) or operation in NAVIGATION:
            return
    try:
        contract, active, _ = load_data()
        if is_prompt:
            match = prompt_match(contract, prompt)
            if match and match[1]:
                emit(event, context(contract, *match, active=active))
            else:
                menu = {key: list(value["lanes"]) for key, value in contract["clients"].items()}
                emit(event, "745 visual direction: select the exact client/content lane. Do not inherit the active Prayer look for another lane.\n"
                     + json.dumps(menu) + "\nUse .codex/hooks/creative_745.py suggest --state '<source facts>' for a bounded Jev suggestion. It never binds automatically.")
            return
        if not active:
            if "745" in searchable:
                raise ValueError("745 target has no active edit binding; bind the exact client, lane, and sequence")
            return
        sequence_id = str(active.get("sequenceId", ""))
        # Different explicit sequences are unrelated and must remain untouched.
        explicit = tool_input.get("sequenceId") if isinstance(tool_input, dict) else None
        if explicit and explicit != sequence_id:
            return
        found_ids = UUID.findall(searchable)
        if not explicit and found_ids and sequence_id not in found_ids:
            return
        in_scope = explicit == sequence_id or sequence_id in found_ids or any(
            value and value in searchable for value in (active.get("projectPath"), active.get("source")))
        native_ui = "cua" in tool_name and re.search(r"premiere|Adobe", searchable, re.I)
        if native_ui:
            emit(event, context(contract, active["clientId"], active["laneId"], active)
                 + "\nUI REMINDER ONLY: verify the visible project and sequence before a write. This hook cannot inspect or block wrong UI styling.")
            return
        if not in_scope:
            return
        if "premiere_pro" in tool_name:
            operation = tool_name.rsplit("__", 1)[-1]
            if READ_OPERATIONS.match(operation) or operation in NAVIGATION:
                return
        validate_active(contract, active)
        if "create_caption_track" in tool_name or re.search(r"mcp__premiere_pro__create_caption_track\s*\(", searchable):
            raise ValueError("745 captions belong to Opus Clip; preserve the native track disabled for the clean master")
        emit(event, context(contract, active["clientId"], active["laneId"], active)
             + "\nENROLLMENT PASSED. This is not visual approval: inspect the title treatment and cover against the reference before declaring them complete.")
    except (OSError, ValueError, KeyError, TypeError) as error:
        if is_prompt:
            emit(event, f"745 visual contract unavailable: {error}. Stop visual mutation until repaired.")
        else:
            emit(event, f"745 visual contract blocked: {error}", deny=True)


def cli():
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest="command", required=True)
    show = sub.add_parser("show")
    show.add_argument("--client")
    show.add_argument("--lane")
    bind = sub.add_parser("bind")
    for flag in ("client", "lane", "sequence", "project", "source", "headline"):
        bind.add_argument("--" + flag, required=True)
    bind.add_argument("--adjustments-json", default="{}", help="Percent deltas from the measured lane-template baseline; each is limited to +/-10")
    suggest = sub.add_parser("suggest")
    suggest.add_argument("--state", required=True)
    suggest.add_argument("--client")
    args = parser.parse_args()
    contract, active, active_path = load_data()
    if args.command == "show":
        if bool(args.client) != bool(args.lane):
            parser.error("show requires both --client and --lane, or neither for the active edit")
        if not args.client and not active:
            parser.error("no active edit; specify --client and --lane")
        print(context(contract, args.client or active["clientId"], args.lane or active["laneId"], active))
    elif args.command == "bind":
        proposed = {"schemaVersion": 1, "clientId": args.client, "laneId": args.lane,
                    "sequenceId": args.sequence, "projectPath": str(Path(args.project).resolve()),
                    "source": str(Path(args.source).resolve()), "headline": args.headline,
                    "captionOwner": "Opus Clip", "width": 1080, "height": 1920,
                    "adjustments": json.loads(args.adjustments_json),
                    "visualStatus": "direction bound; visual output not yet verified"}
        validate_active(contract, proposed)
        for field in ("projectPath", "source"):
            if not Path(proposed[field]).is_file():
                parser.error(f"{field} file is unavailable")
        with tempfile.NamedTemporaryFile(mode="w", dir=active_path.parent, delete=False) as handle:
            json.dump(proposed, handle, indent=2)
            handle.write("\n")
            temporary = handle.name
        os.replace(temporary, active_path)
        print(context(contract, args.client, args.lane, proposed))
    elif args.command == "suggest":
        if args.client and args.client not in contract["clients"]:
            parser.error("unknown client")
        options = [{"id": f"{client_id}/{lane_id}", "description": f"{client['name']} / {lane['name']}: {lane['treatment']}"}
                   for client_id, client in contract["clients"].items() if not args.client or client_id == args.client
                   for lane_id, lane in client["lanes"].items() if "batchScope" not in lane]
        options.append({"id": "needs_review", "description": "Source does not establish a single listed client/content lane; inspect before choosing."})
        decision = {"id": "745-content-lane", "state": args.state + "\nSource-backed lane rules only. Do not override an explicit client or lane. Static and Marquee Walk assets are outside the 54-video batch.",
                    "question": "Which listed content lane fits these source facts?", "options": options}
        result = subprocess.run(["jev-decide", "--json", json.dumps(decision)], check=False, capture_output=True, text=True, timeout=120)
        if result.returncode:
            raise RuntimeError(result.stderr.strip() or result.stdout.strip() or "Jev unavailable; no model fallback")
        scored = json.loads(result.stdout)
        selected = scored["selected_option_id"]
        if selected not in {option["id"] for option in options}:
            raise ValueError("Jev returned an option outside the supplied lanes")
        print(json.dumps({"selected_option_id": selected, "option_ids": scored["option_ids"],
                          "probabilities": scored["probabilities"], "automaticBinding": False,
                          "note": "Relative scores, not calibrated confidence. Documents and explicit user selection override Jev."}, indent=2))


if __name__ == "__main__":
    try:
        cli() if len(sys.argv) > 1 else hook(json.load(sys.stdin))
    except (OSError, ValueError, RuntimeError, subprocess.SubprocessError) as error:
        print(str(error), file=sys.stderr)
        sys.exit(1)
