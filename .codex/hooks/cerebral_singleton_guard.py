#!/usr/bin/env python3
import json
import os
import re
import sys


REPO_MARKER = "Documents/Development/singleton-systems"

CORE_DOCS = [
    "docs/04_singleton-systems-integration-map.md",
    "docs/03_singleton-systems-home-hub.md",
    "docs/06_commands.md",
]

SURFACE_HINTS = [
    ("website / offer copy", r"website|landing|copy|offer|hero|proof|case study"),
    ("Opportunity HQ / Notion", r"opportunity hq|career hq|notion|task|project|plan today|money clock"),
    ("Raycast command layer", r"raycast|command|shortcut|hotkey|plan-today|codex assist"),
    ("Bear capture", r"\bbear\b|capture|offload|inbox"),
    ("Eagle proof", r"\beagle\b|asset|screenshot|proof"),
    ("Apple / mobile", r"shortcut|share sheet|mobile|app intent"),
    ("LikeC4 / maps", r"likec4|diagram|map|architecture|ecosystem"),
    ("skill / hook routing", r"skill|hook|cerebral|router|drift|surface"),
]


def read_input():
    raw = sys.stdin.read()
    return json.loads(raw) if raw.strip() else {}


def in_repo(payload):
    return REPO_MARKER in (payload.get("cwd") or os.getcwd())


def tool_text(payload):
    tool_input = payload.get("tool_input") or {}
    return json.dumps(tool_input) if isinstance(tool_input, dict) else str(tool_input)


def surfaces(text):
    found = [name for name, pattern in SURFACE_HINTS if re.search(pattern, text, re.I)]
    return ", ".join(found[:4]) if found else "classify from Cerebral map"


def context(reason, text):
    surface_line = surfaces(text)
    return "\n".join(
        [
            "Cerebral / Singleton Systems drift guard:",
            f"- Reason: {reason}",
            f"- Surface(s): {surface_line}",
            f"- Review first: {', '.join(CORE_DOCS)}.",
            "- Official rule: name it once, put it in the owner surface, automate only after repetition is obvious.",
            "- Current owners: Bear raw capture; Opportunity HQ durable tasks/projects; Eagle proof/assets; Raycast actions; Codex docs/skills naming; LikeC4 maps.",
            "- Raycast command work lives in /Users/singleton23/Raycast/career-hq; visible language should say Opportunity HQ when possible.",
            "- Native Raycast action first. Codex Assist second, review before write/send.",
            "- Ponytail rule: smallest working change, reuse existing docs/skills/surfaces, no new abstraction or database unless the prompt explicitly earns it.",
        ]
    )


def emit(text, event_name):
    print(json.dumps({"hookSpecificOutput": {"hookEventName": event_name, "additionalContext": text}}))


def main():
    payload = read_input()
    if not in_repo(payload):
        return

    event = payload.get("hook_event_name") or ""
    if event == "UserPromptSubmit":
        prompt = str(payload.get("prompt") or "")
        emit(context("repo prompt should stay aligned across surfaces", prompt), event)
        return

    if event == "PreToolUse":
        emit(context(f"before {payload.get('tool_name') or 'tool'} can change or inspect implementation", tool_text(payload)), event)


if __name__ == "__main__":
    main()
