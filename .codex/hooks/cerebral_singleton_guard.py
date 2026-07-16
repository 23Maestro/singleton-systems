#!/usr/bin/env python3
import json
import os
import re
import sys
import urllib.parse
import urllib.request


REPO_MARKER = "Documents/Development/singleton-systems"

ROUTING_SURFACES = [
    "docs/integration-map.md",
    "docs/home-hub.md",
    "docs/commands.md",
    "docs/truth-matrix.md",
    "docs/opportunity-hq/updater-prompt.md",
    "docs/operating-system/singleton-systems-sprint.md",
    "docs/planning/planning-idea-routing-research-pass.md",
    ".codex/hooks/cerebral_singleton_guard.py",
    "/Users/singleton23/plugins/s-systems/skills/cerebral-router/SKILL.md",
    "/Users/singleton23/plugins/s-systems/skills/planning-idea-routing/SKILL.md",
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

CAPABILITY_RE = re.compile(
    r"not installed|missing.*path|\bpath\b|tool installed|plugin.*(missing|installed)|pdf tool|pdf skill|homebrew|/opt/homebrew|node_modules/.bin|npm exec",
    re.I,
)

REGISTRY_PATH = "config/cerebral-registry.json"

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


def repo_root_from(cwd=None):
    base = cwd or os.getcwd()
    parts = base.split(os.sep)
    marker = ["Users", "singleton23", "Documents", "Development", "singleton-systems"]
    for index in range(len(parts)):
        if parts[index:index + len(marker)] == marker:
            return os.sep + os.path.join(*parts[:index + len(marker)])
    return base


def load_local_registry():
    path = os.path.join(repo_root_from(), REGISTRY_PATH)
    try:
        with open(path, "r", encoding="utf-8") as handle:
            return json.load(handle)
    except (FileNotFoundError, json.JSONDecodeError, OSError):
        return {"routes": [], "capabilities": []}


def load_runtime_registry():
    base_url = os.environ.get("SUPABASE_URL", "").rstrip("/")
    anon_key = os.environ.get("SUPABASE_ANON_KEY", "")
    if not base_url or not anon_key:
        return None

    headers = {"apikey": anon_key, "Authorization": f"Bearer {anon_key}"}
    try:
        routes_url = base_url + "/rest/v1/cerebral_routes?enabled=eq.true&select=*"
        capabilities_url = base_url + "/rest/v1/harness_capabilities?select=*"
        def fetch(url):
            request = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(request, timeout=1.5) as response:
                return json.loads(response.read().decode("utf-8"))
        return {"routes": fetch(routes_url), "capabilities": fetch(capabilities_url)}
    except (OSError, ValueError, json.JSONDecodeError):
        return None


def registry_for_prompt(text):
    runtime = load_runtime_registry()
    return (runtime, "Supabase runtime registry") if runtime is not None else (load_local_registry(), "local registry fallback")


def registry_matches(text):
    registry, source = registry_for_prompt(text)
    matched_routes = []
    for route in registry.get("routes", []):
        triggers = route.get("trigger_patterns") or []
        if any(re.search(trigger, text, re.I) for trigger in triggers):
            matched_routes.append(route)

    capabilities = []
    if CAPABILITY_RE.search(text) or any(route.get("route_key") == "systems-tool-harness" for route in matched_routes):
        capabilities = registry.get("capabilities", [])
    return matched_routes, capabilities, source


def context(reason, text):
    routes, capabilities, registry_source = registry_matches(text)
    lines = ["Cerebral route:", f"- [reason] {reason}"]
    if routes:
        for route in sorted(routes, key=lambda item: item.get("priority", 100))[:2]:
            lines.extend([
                f"- [surface] {route.get('surface') or 'task'}",
                f"- [lane] {route.get('lane')} | [owner] {route.get('owner')}",
                f"- [tools] {' + '.join(route.get('required_tools') or [])}",
                f"- [review] {route.get('review_gate') or 'review before mutation'}",
            ])
    else:
        lines.append("- [next] No specialized route matched; use normal task flow.")
    if CAPABILITY_RE.search(text):
        lines.append("- [preflight] Check registry, Homebrew, and repo-local npm facts before reporting a missing tool or path.")
        if not capabilities:
            lines.append("- [do-not] Do not assert absence without verification evidence.")
        else:
            lines.append(f"- [registry] {registry_source}; use recorded path and verification command.")
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
    return repo_root_from()


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
        hits = stale_owner_hits()
        if hits:
            details = "\n".join(hits)
            emit_block(
                "Singleton Systems drift guard found stale legacy owner language after a tool ran. "
                "Update the owner surface to Obsidian raw capture / legacy export before continuing.\n"
                + details
            )


if __name__ == "__main__":
    main()
