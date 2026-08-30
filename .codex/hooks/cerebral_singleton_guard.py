#!/usr/bin/env python3
import json
import os
import re
import shlex
import subprocess
import sys
import urllib.parse
import urllib.request


REPO_MARKER = os.environ.get("SINGLETON_SYSTEMS_REPO_MARKER", "singleton-systems")

ROUTING_SURFACES = [
    "docs/integration-map.md",
    "docs/commands.md",
    "docs/truth-matrix.md",
    "docs/visual-system-contract.md",
    ".codex/hooks/cerebral_singleton_guard.py",
    "plugins/s-systems/skills/cerebral-router/SKILL.md",
    "plugins/s-systems/skills/planning-idea-routing/SKILL.md",
    "plugins/s-systems/skills/opportunity-hq-updater/SKILL.md",
    "plugins/s-systems/skills/singleton-visualizer/SKILL.md",
    "plugins/s-systems/skills/client-video-storyboard/SKILL.md",
    "plugins/s-systems/skills/portfolio-evidence-capture/SKILL.md",
    "plugins/s-systems/skills/client-video-storyboard/references/lineups-treatment-system.md",
    ".agents/skills/singleton-figma-system/SKILL.md",
    ".agents/skills/singleton-figma-system/references/lineups-production-system.md",
]

STALE_OWNER_PATTERNS = [
    re.compile(pattern, re.I)
    for pattern in [
        r"\bOb" + r"sidian\b",
        r"\bMi" + r"ro\b",
    ]
]

CAPABILITY_RE = re.compile(
    r"not installed|missing.*path|\bpath\b|tool installed|plugin.*(missing|installed)|pdf tool|pdf skill|homebrew|/opt/homebrew|node_modules/.bin|npm exec",
    re.I,
)
TOOL_FAILURE_RE = re.compile(
    r"(?:tool|plugin|cli|viewer|surface|connector|command|oauth|authentication|path)"
    r"[\s\S]{0,80}(?:fail|failed|failing|missing|unavailable|not working|expired|cannot|can't|blocked)"
    r"|(?:fail|failed|failing|missing|unavailable|not working|expired|cannot|can't|blocked)"
    r"[\s\S]{0,80}(?:tool|plugin|cli|viewer|surface|connector|command|oauth|authentication|path)",
    re.I,
)

REGISTRY_PATH = "config/cerebral-registry.json"
EXPLICIT_ROUTE_RE = re.compile(
    r"^\s*(?:\[route\]|route(?:\s+cerebral)?\s*:)\s*([a-z0-9-]+)\s*$",
    re.I | re.M,
)
EXPLICIT_BUCKET_RE = re.compile(
    r"^\s*(?:\[bucket\]|bucket\s*:)\s*([a-z0-9-]+)\s*$",
    re.I | re.M,
)
TAG_RE = re.compile(r"^\s*\[(route|bucket|shape|tools|query)\]\s*(.+?)\s*$", re.I | re.M)

DOCS_SKILLS_RE = re.compile(r"docs/|\.codex/|skills?/|SKILL\.md|hooks?", re.I)
SHELL_MUTATION_RE = re.compile(
    r"\b(?:apply_patch|sed\s+-i|perl\s+-pi|cp|mv|tee|truncate)\b|(?:^|\s)(?:>|>>)(?:\s|$)",
    re.I,
)
HTML_VISUAL_RE = re.compile(r"html comp|html artifact|playground|visualizer|diagram|map|png|draw\.io", re.I)
AUTOMATION_RE = re.compile(r"daemon|background worker|scheduled automation|async loop|runtime container|docker|new database", re.I)
SOCIAL_RE = re.compile(r"linkedin|instagram|youtube|social|reference|creator|jab|feint|haymaker|zander|aishwarya|gary vee", re.I)
LINEUPS_RE = re.compile(
    r"\b(?:lineups|catena(?:\s+media)?.{0,40}football|mahomes\s+comeback|"
    r"cowboys\s+expectations|super\s*bowl\s+bubble|top\s*5\s+(?:offenses|defenses))\b",
    re.I | re.S,
)
CLAUSE_RE = re.compile(r"\bclause\b|claude-specific|claude naming|claude code", re.I)
ARTIFACT_KIND_RE = (
    r"(?:markdown|mdx|linear(?:\s+(?:issue|doc|document))?|documents?|"
    r"emails?|cover\s+(?:letters?|notes?)|proposals?|briefs?|handoffs?|"
    r"(?:public\s+)?(?:html|pages?|sites?|websites?)|captions?|bios?|"
    r"(?:source\s+)?notes?|reports?|memos?|visuals?|canvases?|maps?|"
    r"artifacts?|copy|posts?|comments?|case\s+stud(?:y|ies)|client\s+notes?|"
    r"front-facing|outbound|communications?|commit\s+messages?|pull\s+requests?)"
)
ARTIFACT_INTENT_RE = re.compile(
    rf"(?:"
    rf"\b(?:write|writing|draft|create|make|making|build|edit|rewrite|update|prepare|produce|generate|compose|design|evolve|turn|package)\b"
    rf"[\s\S]{{0,160}}\b{ARTIFACT_KIND_RE}\b"
    rf"|\b{ARTIFACT_KIND_RE}\b[\s\S]{{0,80}}\b(?:for|to)\s+(?:me\s+to\s+)?review\b"
    rf")",
    re.I,
)
PUBLIC_DELIVERY_RE = re.compile(
    rf"\b(?:publish|send|post|deliver|reuse)\b[\s\S]{{0,120}}\b{ARTIFACT_KIND_RE}\b",
    re.I,
)
WRITING_RULES_PATH = "docs/harness/writing-rules.md"


def read_input():
    raw = sys.stdin.read()
    return json.loads(raw) if raw.strip() else {}


def in_repo(payload):
    cwd = payload.get("cwd") or os.getcwd()
    return REPO_MARKER in cwd or os.path.exists(os.path.join(repo_root_from(cwd), REGISTRY_PATH))


def tool_text(payload):
    tool_input = payload.get("tool_input") or {}
    return json.dumps(tool_input) if isinstance(tool_input, dict) else str(tool_input)


def repo_root_from(cwd=None):
    base = cwd or os.getcwd()
    current = os.path.abspath(base)
    while True:
        if os.path.exists(os.path.join(current, REGISTRY_PATH)):
            return current
        parent = os.path.dirname(current)
        if parent == current:
            return os.path.abspath(base)
        current = parent


def load_local_registry():
    path = os.path.join(repo_root_from(), REGISTRY_PATH)
    try:
        with open(path, "r", encoding="utf-8") as handle:
            return json.load(handle)
    except (FileNotFoundError, json.JSONDecodeError, OSError):
        return {"routes": [], "capabilities": []}


def load_runtime_routes():
    base_url = os.environ.get("SUPABASE_URL", "").rstrip("/")
    anon_key = os.environ.get("SUPABASE_ANON_KEY", "")
    if not base_url or not anon_key:
        return None

    headers = {"apikey": anon_key, "Authorization": f"Bearer {anon_key}"}
    try:
        routes_url = base_url + "/rest/v1/cerebral_routes?enabled=eq.true&select=*"
        request = urllib.request.Request(routes_url, headers=headers)
        with urllib.request.urlopen(request, timeout=1.5) as response:
            return json.loads(response.read().decode("utf-8"))
    except (OSError, ValueError, json.JSONDecodeError):
        return None


def routes_for_prompt():
    runtime_routes = load_runtime_routes()
    if runtime_routes is not None:
        return runtime_routes, "Supabase runtime registry"
    return load_local_registry().get("routes", []), "local registry fallback"


def packet_tags(text):
    tags = {}
    for key, value in TAG_RE.findall(text):
        tags[key.lower()] = value.strip()
    if "tools" in tags:
        tags["tools"] = [
            item.strip()
            for item in re.split(r"\s*(?:,|\+)\s*", tags["tools"])
            if item.strip()
        ]
    return tags


def registry_matches(text):
    routes, route_source = routes_for_prompt()
    enabled_routes = [route for route in routes if route.get("enabled") is True]
    tags = packet_tags(text)
    explicit_match = EXPLICIT_ROUTE_RE.search(text)
    explicit_bucket_match = EXPLICIT_BUCKET_RE.search(text)
    explicit_route = (
        tags.get("route")
        or tags.get("bucket")
        or (explicit_match.group(1) if explicit_match else "")
        or (explicit_bucket_match.group(1) if explicit_bucket_match else "")
    ).lower()
    if explicit_route:
        matched_routes = [
            route
            for route in enabled_routes
            if route.get("route_key") == explicit_route or (route.get("bucket") or route.get("route_key")) == explicit_route
        ]
    else:
        matched_routes = [
            route
            for route in enabled_routes
            if any(re.search(trigger, text, re.I) for trigger in route.get("trigger_patterns") or [])
        ]

    capabilities = []
    capability_source = "local registry fallback"
    if needs_tool_preflight(text) or any(route.get("route_key") == "systems-tool-harness" for route in matched_routes):
        capabilities = load_local_registry().get("capabilities", [])
    return matched_routes, capabilities, capability_source if capabilities else route_source, explicit_route, tags


def needs_tool_preflight(text):
    return bool(CAPABILITY_RE.search(text) or TOOL_FAILURE_RE.search(text))


def context(reason, text):
    routes, capabilities, registry_source, explicit_route, tags = registry_matches(text)
    lines = ["Cerebral route:", f"- [reason] {reason}"]
    if routes:
        for route in sorted(routes, key=lambda item: item.get("priority", 100))[:2]:
            requested_tools = tags.get("tools") or []
            allowed_tools = route.get("required_tools") or []
            lines.extend([
                f"- [route] {route.get('route_key')}",
                f"- [surface] {route.get('surface') or 'task'}",
                f"- [lane] {route.get('lane')} | [owner] {route.get('owner')}",
                f"- [bucket] {route.get('bucket') or route.get('route_key')}",
                f"- [shape] {tags.get('shape') or route.get('shape') or 'task'}",
                f"- [tools] {' + '.join(route.get('required_tools') or [])}",
                f"- [review] {route.get('review_gate') or 'review before mutation'}",
            ])
            if tags.get("query"):
                lines.append(f"- [query] {tags.get('query')}")
            unknown_tools = [tool for tool in requested_tools if tool not in allowed_tools]
            if unknown_tools:
                lines.append(
                    f"- [route-error] Requested tool does not belong to {route.get('route_key')}: {', '.join(unknown_tools)}"
                )
            elif requested_tools:
                lines.append("- [tool-check] Requested tool belongs to this route.")
    elif explicit_route:
        lines.append(f"- [route-error] Unknown or disabled route: {explicit_route}")
    else:
        lines.append("- [next] No specialized route matched; use normal task flow.")
    if not any(route.get("route_key") == "portfolio-evidence" for route in routes):
        lines.append(
            "- [portfolio-checkpoint] At a completed meaningful review gate, when visible proof exists, "
            "use s-systems:portfolio-evidence-capture to propose no more than two visuals. "
            "Ignore routine tool calls and wait for Jerami before any Eagle write."
        )
    if needs_tool_preflight(text):
        lines.append("- [preflight] Check registry, Homebrew, and repo-local npm facts before reporting a missing tool or path.")
        if not capabilities:
            lines.append("- [do-not] Do not assert absence without verification evidence.")
        else:
            lines.append(f"- [registry] {registry_source}; use recorded path and verification command.")
        lines.append("- [repair] A safe repair inside the requested tool and surface is normal task work: verify the target, repair it, and continue.")
        lines.append("- [substitution-gate] Changing the requested tool or surface requires explicit user approval.")
        lines.append("- [pause] Stop for substitution, destructive repair, new authentication or cost, or an unresolved blocker.")
    if LINEUPS_RE.search(text):
        lines.extend([
            "- [profile] Catena Media Lineups",
            "- [contract] Read plugins/s-systems/skills/client-video-storyboard/references/lineups-treatment-system.md before transcript mapping, asset selection, Figma work, or Premiere mutation.",
            "- [menu] Use the seven approved lanes. Choose an approved option and adjust its settings. Do not invent a new option during an edit.",
            "- [assets] Use suitable client-provided Eagle assets. For new searches, prefer action photos and avoid roster portraits; contextual photos are allowed when the transcript supports them. Search Eagle, then SportsDB or OpenWiki. Fill the 1920 x 1080 frame and keep faces clear.",
            "- [copy] Preserve transcript meaning, attribution, causal ownership, and spoken order. Compress or closely paraphrase; do not invent an editorial angle.",
            "- [quick-stat] Choose Single-frame statement at 6.5 seconds or Two-photo progression at 10 seconds. Photo-led pushes run 100% to 102.5%. One point has no pipe. Premiere owns light leaks and Blur Dissolves.",
            "- [figma-contract] Use singleton-figma-system and read .agents/skills/singleton-figma-system/references/lineups-production-system.md before building a Lineups scene.",
            "- [asset-swap] Inherit the guarded football-visible Field Night background, geometry, layer order, crop roles, and motion from Components. Episode cutouts require real alpha. Only cutouts, logos, transcript copy, and reveal timing are replaceable.",
            "- [figma] Components owns approved sources. Foundations holds references. Episode Workspace holds instances and motion work. Keep text and cutout bounds tight. Prune rejected and stale work after review.",
            "- [delivery] Approved motion renders live in Eagle at Episode / 06 Motion Renders. Premiere links to that Eagle-managed file.",
            "- [premiere-gate] Inspect a fresh 1920 x 1080 screenshot before placement.",
        ])
    lines.extend(drift_warnings(text))
    if public_output_requested(text, routes):
        lines.append("")
        lines.append(writing_context())
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
        warnings.append("- Social check: keep platform, reference_set, direct_style, post_format, and attack_type aligned in offer-portfolio-content plus platform skills.")

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
                    if any(pattern.search(line) for pattern in STALE_OWNER_PATTERNS):
                        hits.append(f"{full_path}:{line_number}: {line.strip()}")
        except FileNotFoundError:
            continue
    return hits[:20]


def should_run_drift_check(payload):
    text = tool_text(payload)
    if not DOCS_SKILLS_RE.search(text):
        return False

    tool_name = str(payload.get("tool_name") or "")
    if tool_name in {"apply_patch", "Edit", "Write"}:
        return True
    return tool_name == "Bash" and bool(SHELL_MUTATION_RE.search(text))


def run_drift_check():
    root = repo_root()
    script = os.path.join(root, "scripts/check-cerebral-drift.mjs")
    result = subprocess.run(
        [os.environ.get("NODE_BINARY", "node"), script],
        cwd=root,
        capture_output=True,
        text=True,
        timeout=8,
        check=False,
    )
    if result.returncode == 0:
        return None
    details = (result.stderr or result.stdout or "Unknown drift-check failure").strip()
    return f"Cerebral drift check failed after the write:\n{details}"


REVIEWABLE_EXTENSIONS = {
    ".md",
    ".mdx",
    ".txt",
    ".rst",
    ".adoc",
    ".eml",
    ".html",
    ".htm",
}
GENERATED_ARTIFACT_PATH_RE = re.compile(r"(^|/)(node_modules|vendor|dist|build|coverage|\.next|out)(/|$)", re.I)
DIRECT_PATH_KEYS = {"file_path", "filepath", "filePath", "path", "filename", "file", "paths", "files"}
SHELL_KEYS = {"command", "cmd", "script"}


def _flatten_strings(value):
    if isinstance(value, str):
        yield value
    elif isinstance(value, (list, tuple)):
        for item in value:
            yield from _flatten_strings(item)


def _path_from_candidate(candidate, root):
    candidate = str(candidate).strip().strip("'\"")
    if not candidate or candidate.startswith("-"):
        return None
    if candidate.startswith("file://"):
        candidate = urllib.parse.unquote(urllib.parse.urlparse(candidate).path)
    path = os.path.abspath(candidate if os.path.isabs(candidate) else os.path.join(root, candidate))
    try:
        if os.path.commonpath([root, path]) != root:
            return None
    except ValueError:
        return None
    relative_path = os.path.relpath(path, root).replace(os.sep, "/")
    if GENERATED_ARTIFACT_PATH_RE.search(relative_path):
        return None
    if os.path.splitext(path)[1].lower() not in REVIEWABLE_EXTENSIONS:
        return None
    return path


def artifact_path_candidates(payload):
    root = repo_root()
    tool_input = payload.get("tool_input") or {}
    direct_values = []
    patch_values = []
    shell_values = []

    def collect(value, key=""):
        if isinstance(value, dict):
            for child_key, child_value in value.items():
                lowered = str(child_key)
                if lowered in DIRECT_PATH_KEYS:
                    direct_values.extend(_flatten_strings(child_value))
                elif lowered == "patch":
                    patch_values.extend(_flatten_strings(child_value))
                elif lowered in SHELL_KEYS:
                    shell_values.extend(_flatten_strings(child_value))
                else:
                    if isinstance(child_value, str) and re.search(r"\*\*\*\s+(?:Begin Patch|Update|Add|Delete)\s+", child_value, re.I):
                        patch_values.append(child_value)
                    collect(child_value, lowered)
        elif isinstance(value, str) and key in DIRECT_PATH_KEYS:
            direct_values.append(value)

    if isinstance(tool_input, str):
        if re.search(r"\*\*\*\s+(?:Begin Patch|Update|Add|Delete)\s+", tool_input, re.I):
            patch_values.append(tool_input)
        else:
            shell_values.append(tool_input)
    else:
        collect(tool_input)

    candidates = list(direct_values)
    for patch in patch_values:
        candidates.extend(
            match.group(1).strip()
            for match in re.finditer(
                r"^\*\*\*\s+(?:Update|Add|Delete)\s+File:\s*(.+?)\s*$",
                patch,
                re.I | re.M,
            )
        )

    for command in shell_values:
        try:
            tokens = shlex.split(command)
        except ValueError:
            tokens = []
        candidates.extend(
            token
            for token in tokens
            if os.path.splitext(token.strip("'\""))[1].lower() in REVIEWABLE_EXTENSIONS
        )

    paths = []
    for candidate in candidates:
        path = _path_from_candidate(candidate, root)
        if path and os.path.isfile(path) and path not in paths:
            paths.append(path)
    return paths


def should_run_artifact_check(payload):
    tool_name = str(payload.get("tool_name") or "")
    return tool_name in {"apply_patch", "Edit", "Write", "Bash"} and bool(artifact_path_candidates(payload))


def run_artifact_check(payload):
    paths = artifact_path_candidates(payload)
    if not paths:
        return None
    root = repo_root()
    script = os.path.join(root, "scripts/check-tells.mjs")
    result = subprocess.run(
        [os.environ.get("NODE_BINARY", "node"), script, "--strict", *paths],
        cwd=root,
        capture_output=True,
        text=True,
        timeout=8,
        check=False,
    )
    if result.returncode == 0:
        return None
    details = (result.stderr or result.stdout or "Unknown writing-tells check failure").strip()
    return f"AI writing-tells check failed after the write:\n{details}"


def emit_block(message):
    print(json.dumps({"continue": False, "stopReason": message, "systemMessage": message}))


def public_output_requested(text, routes=None):
    public_routes = {"offer-content", "agency-growth", "freelance-proposal", "cover-note", "website-offer"}
    if any((route.get("route_key") or "") in public_routes for route in routes or []):
        return True
    text = text or ""
    return bool(ARTIFACT_INTENT_RE.search(text) or PUBLIC_DELIVERY_RE.search(text))


def writing_rules_doc():
    path = os.path.join(repo_root(), WRITING_RULES_PATH)
    try:
        with open(path, "r", encoding="utf-8") as handle:
            return handle.read()
    except OSError:
        return ""


def writing_context():
    doc = writing_rules_doc()
    match = re.search(r"## Hook payload[\s\S]*?```text\n([\s\S]*?)\n```", doc)
    if match:
        return "Writing rules for reviewable artifacts:\n" + match.group(1).strip()
    return f"Writing rules for reviewable artifacts: read {WRITING_RULES_PATH} before delivery."


def writing_words():
    doc = writing_rules_doc()
    match = re.search(r"\*\*Words\.\*\*([\s\S]*?)\n\n", doc)
    if not match:
        return []
    return [
        word.strip().rstrip(".")
        for word in re.sub(r"\s+", " ", match.group(1)).split(",")
        if word.strip()
    ]


def writing_rules():
    words = writing_words()
    word_re = r"\b(" + "|".join(re.escape(word) for word in words) + r")\b" if words else r"$^"
    return [
        (re.compile(word_re, re.I), "banned word"),
        (re.compile(r"\bnot just\b[^.!?]{1,60}?\bbut\b", re.I), "negative parallelism"),
        (re.compile(r"\bnot\b[^.!?]{1,40}?,\s*but\b", re.I), "negative parallelism"),
        (re.compile(r"\brather than\b", re.I), "negative parallelism"),
        (re.compile(r"\bserves as\b", re.I), 'copula dodge: write "is"'),
        (re.compile(r"\bfeatures\s+(a|an|the|\d+|two|three|four|five|six|seven|eight|nine|ten)\b", re.I), 'copula dodge: write "has"'),
        (re.compile(r"\b(experts|observers|analysts|critics)\s+(argue|say|note|have)\b", re.I), "vague attribution"),
        (re.compile(r"\b(industry )?reports?\s+suggest\b", re.I), "vague attribution"),
        (re.compile(r"\befforts are ongoing\b", re.I), "vague attribution"),
        (re.compile(r"\bnestled in the\b|\bmarking a pivotal\b|\brich cultural\b", re.I), "puffery"),
        (re.compile(r"^\s*[-*]\s*\*\*[^*]+\*\*:", re.I | re.M), "bold inline list header"),
    ]


def title_case_heading_hits(text):
    hits = []
    for line_number, line in enumerate(text.splitlines(), 1):
        match = re.match(r"^#{1,6}\s+(.*)$", line)
        if not match:
            continue
        words = [word for word in match.group(1).split() if re.match(r"^[A-Za-z]", word)]
        caps = [word for word in words if re.match(r"^[A-Z]", word)]
        if len(words) >= 3 and len(caps) == len(words):
            hits.append((line_number, "Title Case Heading", match.group(1)))
    return hits


def _blank_non_newline(match):
    return re.sub(r"[^\n]", " ", match.group(0))


def strip_writing_code(text):
    clean = re.sub(r"```[\s\S]*?```", _blank_non_newline, text)
    clean = re.sub(r"<(script|style|pre|code)\b[\s\S]*?</\1\s*>", _blank_non_newline, clean, flags=re.I)
    return re.sub(r"`[^`\n]+`", _blank_non_newline, clean)


def writing_hits(text):
    text = strip_writing_code(text)
    hits = []
    for pattern, label in writing_rules():
        for match in pattern.finditer(text):
            line_number = text[: match.start()].count("\n") + 1
            hits.append((line_number, label, match.group(0).strip()[:80]))
    hits.extend(title_case_heading_hits(text))
    return sorted(hits, key=lambda item: item[0])


def last_user_prompt_from_transcript(payload):
    transcript_path = payload.get("transcript_path")
    if not transcript_path:
        return ""
    transcript_path = os.path.expanduser(str(transcript_path))
    try:
        with open(transcript_path, "r", encoding="utf-8") as handle:
            lines = handle.readlines()[-80:]
    except OSError:
        return ""
    for line in reversed(lines):
        try:
            record = json.loads(line)
        except json.JSONDecodeError:
            continue
        message = record.get("message") or record
        if message.get("role") != "user":
            continue
        content = message.get("content") or record.get("content") or ""
        if isinstance(content, str):
            return content
        if isinstance(content, list):
            parts = []
            for item in content:
                if isinstance(item, dict) and item.get("type") == "text":
                    parts.append(str(item.get("text") or ""))
            return "\n".join(parts)
    return ""


def stop_prompt(payload):
    return (
        str(payload.get("prompt") or "")
        or str(payload.get("user_prompt") or "")
        or last_user_prompt_from_transcript(payload)
    )


def run_writing_stop_gate(payload):
    prompt = stop_prompt(payload)
    if not public_output_requested(prompt):
        return None
    if payload.get("stop_hook_active") is True:
        return None
    message = str(payload.get("last_assistant_message") or "")
    if not message.strip():
        return None
    hits = writing_hits(message)
    if not hits:
        return None
    details = "\n".join(
        f"- line {line}: {label} -> {snippet}"
        for line, label, snippet in hits[:10]
    )
    return (
        "Outbound writing gate blocked the final answer. Rewrite the artifact with the AI writing pass before stopping.\n"
        + details
    )


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

    if event == "Stop":
        writing_error = run_writing_stop_gate(payload)
        if writing_error:
            print(json.dumps({"decision": "block", "reason": writing_error}))
        return

    if event == "PostToolUse":
        if should_run_drift_check(payload):
            try:
                drift_error = run_drift_check()
            except (OSError, subprocess.SubprocessError) as error:
                drift_error = f"Cerebral drift check could not run after the write: {error}"
            if drift_error:
                emit_block(drift_error)
                return

        if should_run_artifact_check(payload):
            try:
                artifact_error = run_artifact_check(payload)
            except (OSError, subprocess.SubprocessError) as error:
                artifact_error = f"AI writing-tells check could not run after the write: {error}"
            if artifact_error:
                emit_block(artifact_error)
                return

        hits = stale_owner_hits()
        if hits:
            details = "\n".join(hits)
            emit_block(
                "Singleton Systems drift guard found stale legacy owner language after a tool ran. "
                "Update the active contract to the Linear, GitHub, Supabase, and dashboard model before continuing.\n"
                + details
            )


if __name__ == "__main__":
    main()
