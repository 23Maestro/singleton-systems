#!/usr/bin/env python3
"""Route Intent Keys and require a current preflight for its episode builder."""
import json
from pathlib import Path
import re
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
from tools.intent_keys import production

PROMPT = re.compile(r"\bintent[ _-]+(?:keys|solutions)\b", re.I)
SCOPE = re.compile(r"\b(?:intent-keys-e\d+|INTENT_SOLUTIONS|intent-solutions)\b")
BUILD = re.compile(
    r'''(?<![\w./-])["']?(?P<path>(?:[\w./-]*/)?build\.(?:py|mjs))["']?\s+(?P<stage>page|render|delivery)\b'''
)
NATIVE = re.compile(r"""\bhyperframes\s+render\s+["']?(?P<path>[\w./-]+)["']?""")
UPLOAD = re.compile(r"\bcomposio\s+execute\s+FRAME_IO_V4_CREATE_LOCAL_UPLOAD\b")
MEDIA_NAME = re.compile(r"\bintent-keys-e\d+(?:-short)?-v\d+\.mp4\b")
CURL_UPLOAD = re.compile(
    r"""\bcurl\b[^;\n]*?\s(?:-T|--upload-file)(?:=|\s+)["']?(?P<path>[\w./-]+\.mp4)\b"""
)
LOCAL = re.compile(r"\bcd\s+[\"']?([\w./-]*intent-keys-e\d+)[\"']?\s*(?:&&|;|\n)")
NOTE = (
    "Intent Keys long-form uses docs/intent-keys-production.md and "
    "config/intent-solutions/intent-keys/treatment.json. Align words to the audio, "
    "review transcript gaps even over motion or rustling, use the E01 sheet and "
    "light leak, upper-right Max for regular screen footage, and the E02 countdown for quizzes. "
    "Use Max's Manrope captions and the E01 helper. Use the E01 Flubs badge unless the brief calls for "
    "the E03 Flubs + Keys badge. Pulse the flub badge at each confirmed increment. Run the episode preflight "
    "before render or delivery. Review fresh output with sound."
)


def emit(event, message, deny=False):
    result = {"hookEventName": event}
    if deny:
        result.update(permissionDecision="deny", permissionDecisionReason=message)
    else:
        result["additionalContext"] = message
    print(json.dumps({"hookSpecificOutput": result}))


def target(match, command, cwd):
    prior_cd = list(LOCAL.finditer(command, 0, match.start()))
    base = cwd / prior_cd[-1][1] if prior_cd else cwd
    return (base / match["path"]).resolve()


def native_preflight(composition):
    episode = next((p for p in (composition, *composition.parents)
                    if re.fullmatch(r"intent-keys-e\d+", p.name)), None)
    if episode is None:
        return
    if re.fullmatch(r"short-v\d+", composition.name):
        production.require_preflight(composition, composition.name.removeprefix("short-"))
        return
    part = next((re.match(r"parts-(v\d+)-", p.name) for p in composition.parents
                 if re.match(r"parts-(v\d+)-", p.name)), None)
    if part is None:
        raise ValueError("Use the episode builder for Intent long-form rendering")
    production.require_preflight(episode, part[1])


def upload_names(command, cwd):
    names = set(MEDIA_NAME.findall(command))
    for match in re.finditer(r"(?<!\w)@([\w./-]+\.json)\b", command):
        path = cwd / match[1]
        if path.is_file() and path.stat().st_size <= 65536:
            try:
                name = production.read(path).get("name", "")
            except (OSError, ValueError, AttributeError):
                continue
            if isinstance(name, str) and MEDIA_NAME.fullmatch(name):
                names.add(name)
    return names


def main(payload):
    event = payload.get("hook_event_name")
    if event == "UserPromptSubmit":
        if PROMPT.search(payload.get("prompt", "")):
            emit(event, NOTE)
        return
    if event != "PreToolUse":
        return
    tool_input = payload.get("tool_input") or {}
    command = tool_input.get("cmd") or tool_input.get("command") or tool_input.get("code") or ""
    cwd = Path(tool_input.get("workdir") or payload.get("cwd") or ".")
    scoped = SCOPE.search(command + " " + str(cwd))
    upload = UPLOAD.search(command)
    if upload:
        try:
            names = upload_names(command, cwd)
            if scoped and not names:
                raise ValueError("Identify the exact versioned Intent export in the upload metadata")
            for name in names:
                production.require_handoff(production.MEDIA / "renders" / name)
        except (OSError, ValueError, TypeError, KeyError, AttributeError) as error:
            emit(event, f"Intent Keys handoff blocked: {error}", deny=True)
            return
    try:
        for match in CURL_UPLOAD.finditer(command):
            export = target(match, command, cwd)
            if MEDIA_NAME.fullmatch(export.name):
                production.require_handoff(export)
    except (OSError, ValueError, TypeError, KeyError, AttributeError) as error:
        emit(event, f"Intent Keys handoff blocked: {error}", deny=True)
        return
    if not scoped:
        return
    try:
        for match in BUILD.finditer(command):
            folder = target(match, command, cwd).parent
            if not re.fullmatch(r"intent-keys-e\d+", folder.name):
                continue
            if match["stage"] == "page":
                production.require_treatment_plan(folder)
            else:
                production.require_preflight(folder)
        for match in NATIVE.finditer(command):
            native_preflight(target(match, command, cwd))
    except (OSError, ValueError, TypeError, KeyError, AttributeError) as error:
        emit(event, f"Intent Keys preflight blocked this build. Run the episode's check stage. {error}", deny=True)
        return
    emit(event, NOTE)


if __name__ == "__main__":
    main(json.load(sys.stdin))
