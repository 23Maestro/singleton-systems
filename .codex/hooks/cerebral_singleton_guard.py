#!/usr/bin/env python3
import json
import os
import re
import sys


REPO_MARKER = "Documents/Development/singleton-systems"

CORE_DOCS = [
    "docs/integration-map.md",
    "docs/home-hub.md",
    "docs/commands.md",
]

ROUTING_SURFACES = [
    "docs/integration-map.md",
    "docs/home-hub.md",
    "docs/commands.md",
    "docs/truth-matrix.md",
    "docs/opportunity-hq/updater-prompt.md",
    "docs/operating-system/singleton-systems-sprint.md",
    "docs/planning/planning-idea-routing-research-pass.md",
    ".codex/hooks/cerebral_singleton_guard.py",
    "/Users/singleton23/.codex/plugins/cache/singleton23-local/s-systems/0.1.0+codex.20260628005625/skills/cerebral-router/SKILL.md",
    "/Users/singleton23/.codex/plugins/cache/singleton23-local/s-systems/0.1.0+codex.20260628005625/skills/planning-idea-routing/SKILL.md",
]

STALE_OWNER_PATTERNS = [
    re.compile(pattern, re.I)
    for pattern in [
        r"Current owners:\s*Bear",
        r"Bear\s+raw capture",
        r"Bear capture",
        r"Bear role:",
        r"Bear remains",
        r"Bear stays",
        r"old Bear",
        r"old Bear lanes",
        r"Bear archive route",
        r"Use `Parked` or Bear",
    ]
]

KNOWN_DRIFT_REPLACEMENTS = [
    ("Current owners: Bear " + "raw capture;", "Current owners: Obsidian raw capture/offload;"),
    ("- Bear role: readable archive/import source only", "- Legacy Markdown exports role: readable archive/import source only"),
    ("Bear archive route:", "Legacy Markdown archive route:"),
    ("Bear remains a readable archive/import source", "Legacy Markdown exports remain readable archive/import sources"),
    ("Bear stays archive/import", "Legacy exports stay outside active folders until needed"),
    ("Bear capture", "raw capture"),
    ("Bear " + "raw capture", "Obsidian raw capture/offload"),
    ("old Bear lanes", "legacy capture lanes"),
    ("old Bear tag tree", "old tag sprawl"),
    ("old Bear export", "legacy export"),
    ("Use `Parked` or Bear", "Use `Parked` or Obsidian"),
]

SURFACE_HINTS = [
    ("website / offer copy", r"website|landing|copy|offer|hero|portfolio|case study"),
    ("Opportunity HQ / Notion", r"opportunity hq|career hq|notion|task|project|plan today|money clock"),
    ("Raycast command layer", r"raycast|command|shortcut|hotkey|plan-today|codex assist"),
    ("Obsidian raw capture", r"\bbear\b|obsidian|capture|offload|inbox"),
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
        "- Current owners: Obsidian raw capture/offload; Opportunity HQ durable tasks/projects; Eagle portfolio/assets; Raycast actions; Codex docs/skills naming; LikeC4 maps.",
        "- Legacy capture/archive language is not an active owner. Treat it as export/archive drift and update the owner surface before continuing.",
        "- Opportunity HQ task pages must use the selected Project's icon DB source; set or refresh the icon in the same pass as Project creation/change and verify it.",
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


def repo_root():
    cwd = os.getcwd()
    parts = cwd.split(os.sep)
    marker = ["Users", "singleton23", "Documents", "Development", "singleton-systems"]
    for index in range(len(parts)):
        if parts[index:index + len(marker)] == marker:
            return os.sep + os.path.join(*parts[:index + len(marker)])
    return cwd


def stale_owner_hits():
    root = repo_root()
    hits = []
    for path in ROUTING_SURFACES:
        full_path = path if path.startswith(os.sep) else os.path.join(root, path)
        try:
            with open(full_path, "r", encoding="utf-8") as handle:
                for line_number, line in enumerate(handle, 1):
                    if os.path.basename(full_path) == "cerebral_singleton_guard.py" and '"- Current owners:' not in line:
                        continue
                    if any(pattern.search(line) for pattern in STALE_OWNER_PATTERNS):
                        hits.append(f"{full_path}:{line_number}: {line.strip()}")
        except FileNotFoundError:
            continue
    return hits[:20]


def repair_known_drift():
    root = repo_root()
    changed = []
    for path in ROUTING_SURFACES:
        full_path = path if path.startswith(os.sep) else os.path.join(root, path)
        if os.path.basename(full_path) == "cerebral_singleton_guard.py":
            continue
        try:
            with open(full_path, "r", encoding="utf-8") as handle:
                original = handle.read()
        except FileNotFoundError:
            continue

        updated = original
        for old, new in KNOWN_DRIFT_REPLACEMENTS:
            updated = updated.replace(old, new)

        if updated != original:
            with open(full_path, "w", encoding="utf-8") as handle:
                handle.write(updated)
            changed.append(full_path)

    return changed


def emit_block(message):
    print(json.dumps({"continue": False, "stopReason": message, "systemMessage": message}))


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
        return

    if event == "SessionStart":
        emit(context("session should start from canonical Singleton Systems routing", ""), event)
        return

    if event == "PostToolUse":
        repaired = repair_known_drift()
        hits = stale_owner_hits()
        if hits:
            details = "\n".join(hits)
            emit_block(
                "Singleton Systems drift guard found stale legacy owner language after a tool ran. "
                "Update the owner surface to Obsidian raw capture / legacy export before continuing.\n"
                + details
            )
        elif repaired:
            print(json.dumps({
                "systemMessage": "Singleton Systems drift guard repaired stale owner language in: "
                + ", ".join(repaired)
            }))


if __name__ == "__main__":
    main()
