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
    ("website / offer copy", r"website|landing|copy|offer|hero|portfolio|case study"),
    ("Opportunity HQ / Notion", r"opportunity hq|career hq|notion|task|project|plan today|money clock"),
    ("Raycast command layer", r"raycast|command|shortcut|hotkey|plan-today|codex assist"),
    ("Bear capture", r"\bbear\b|capture|offload|inbox"),
    ("Eagle portfolio", r"\beagle\b|asset|screenshot|portfolio"),
    ("Apple / mobile", r"shortcut|share sheet|mobile|app intent"),
    ("LikeC4 / maps", r"likec4|diagram|map|architecture|ecosystem"),
    ("skill / hook routing", r"skill|hook|cerebral|router|drift|surface"),
]

COPY_RE = re.compile(
    r"copy|outreach|linkedin|sales|proposal|application|cover note|caption|post|ad|dm|email",
    re.I,
)

DOCS_SKILLS_RE = re.compile(r"docs/|\.codex/|skills?/|SKILL\.md|hooks?", re.I)
HTML_VISUAL_RE = re.compile(r"html comp|html artifact|playground|visualizer|diagram|map|png|draw\.io", re.I)
AUTOMATION_RE = re.compile(r"daemon|background worker|scheduled automation|async loop|runtime container|docker|new database", re.I)
SOCIAL_RE = re.compile(r"linkedin|instagram|youtube|social|reference|creator|jab|feint|haymaker|zander|aishwarya|gary vee", re.I)
CLAUSE_RE = re.compile(r"\bclause\b|claude-specific|claude naming|claude code", re.I)


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
    lines = [
        "Cerebral / Singleton Systems drift guard:",
        f"- Reason: {reason}",
        f"- Surface(s): {surface_line}",
        f"- Review first: {', '.join(CORE_DOCS)}.",
        "- Official rule: name it once, put it in the owner surface, automate only after repetition is obvious.",
        "- Current owners: Bear raw capture; Opportunity HQ durable tasks/projects; Eagle portfolio/assets; Raycast actions; Codex docs/skills naming; LikeC4 maps.",
        "- Raycast command work lives in /Users/singleton23/Raycast/career-hq; visible language should say Opportunity HQ when possible.",
        "- Native Raycast action first. Codex Assist second, review before write/send.",
        "- Ponytail rule: smallest working change, reuse existing docs/skills/surfaces, no new abstraction or database unless the prompt explicitly earns it.",
    ]
    if COPY_RE.search(text):
        lines.append("- Copy/outreach rule: run Final Human Pass before showing any draft as final.")
    lines.extend(drift_warnings(text))
    return "\n".join(lines)


def drift_warnings(text):
    warnings = []
    lowered = text.lower()

    if DOCS_SKILLS_RE.search(text):
        warnings.append("- Drift check: docs/skills/hook edits should run a stale-name scan before done.")

    if CLAUSE_RE.search(text):
        warnings.append("- Drift check: use Cerebral tags for Singleton Systems; avoid 'clause' or Claude-specific naming unless quoted as a reference.")

    if HTML_VISUAL_RE.search(text):
        warnings.append("- Visual check: HTML comps should be readable human review surfaces with dated file names, large type, few nodes, and no crowded architecture inventory.")

    if SOCIAL_RE.search(text):
        warnings.append("- Social check: keep platform, reference_set, direct_style, post_format, and attack_type aligned in offer-proof-content plus platform skills.")

    if AUTOMATION_RE.search(text):
        warnings.append("- Harness check: interpret containers as triggerable project/bucket context packets unless runtime infrastructure is explicitly requested.")

    if "codex-brain-clause-tags" in lowered:
        warnings.append("- Visual check: supersede the crowded codex-brain-clause-tags visual with the dated Cerebral System visual.")

    return warnings


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
