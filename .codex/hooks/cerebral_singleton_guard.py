#!/usr/bin/env python3
import json
import os
import re
import shlex
import shutil
import signal
import subprocess
import sys
import tempfile
import time
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
    ".agents/skills/safe-auto-layout-conversion/SKILL.md",
    ".agents/skills/file-hygiene/SKILL.md",
    ".agents/skills/accessibility-review/SKILL.md",
    ".agents/skills/layer-cleanup/SKILL.md",
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
    r"(?:tool|plugin|cli|viewer|surface|connector|command|endpoint|framework|version|runtime|oauth|authentication|path)"
    r"[\s\S]{0,80}(?:fail|failed|failing|missing|unavailable|not working|expired|cannot|can't|blocked)"
    r"|(?:fail|failed|failing|missing|unavailable|not working|expired|cannot|can't|blocked)"
    r"[\s\S]{0,80}(?:tool|plugin|cli|viewer|surface|connector|command|endpoint|framework|version|runtime|oauth|authentication|path)",
    re.I,
)
SUBSTITUTION_RE = re.compile(
    r"(?:fail|failed|failing|missing|unavailable|unsupported|outdated|not working|not enabled|cannot|can't|blocked)"
    r"[\s\S]{0,180}(?:so\s+(?:i(?:'m| am)|we(?:'re| are))|instead|next best|fall back|fallback|switch(?:ing)?|using the live)"
    r"|(?:instead|next best|fall back|fallback|switch(?:ing)?)"
    r"[\s\S]{0,180}(?:fail|failed|failing|missing|unavailable|unsupported|outdated|not working|not enabled|cannot|can't|blocked)",
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


def codex_git_temp_candidates(temp_root):
    candidates = []
    try:
        minimum_age = float(os.environ.get("CEREBRAL_CODEX_GIT_TEMP_MIN_AGE_SECONDS", "10"))
    except ValueError:
        minimum_age = 10
    now = time.time()
    try:
        entries = os.scandir(temp_root)
    except OSError:
        return candidates
    with entries:
        for entry in entries:
            if not entry.name.startswith("tmp.") or not entry.is_dir(follow_symlinks=False):
                continue
            candidate = os.path.realpath(entry.path)
            if os.path.dirname(candidate) != temp_root:
                continue
            objects = os.path.join(candidate, "objects")
            if not os.path.isdir(objects) or os.path.islink(objects):
                continue
            if not any(os.path.isfile(os.path.join(candidate, name)) for name in ("index", "index.lock")):
                continue
            try:
                newest_marker = max(
                    os.path.getmtime(candidate),
                    os.path.getmtime(objects),
                    *(
                        os.path.getmtime(os.path.join(candidate, name))
                        for name in ("index", "index.lock")
                        if os.path.exists(os.path.join(candidate, name))
                    ),
                )
            except OSError:
                continue
            if now - newest_marker < minimum_age:
                continue
            candidates.append(candidate)
    return candidates


def open_temp_processes(temp_root):
    try:
        result = subprocess.run(
            ["lsof", "-nP", "+c", "0", "-F", "pcn"],
            capture_output=True,
            check=False,
            text=True,
            timeout=5,
        )
    except (OSError, subprocess.SubprocessError):
        return None
    prefix = temp_root + os.sep
    processes = {}
    current_pid = None
    for line in result.stdout.splitlines():
        if line.startswith("p"):
            try:
                current_pid = int(line[1:])
            except ValueError:
                current_pid = None
                continue
            processes.setdefault(current_pid, {"command": "", "paths": set()})
        elif current_pid is not None and line.startswith("c"):
            processes[current_pid]["command"] = line[1:]
        elif current_pid is not None and line.startswith("n"):
            path = line[1:]
            if path == temp_root or path.startswith(prefix):
                processes[current_pid]["paths"].add(path)
    return processes


def allocated_bytes(path):
    total = 0
    for current_root, directories, files in os.walk(path, followlinks=False):
        for name in directories + files:
            item = os.path.join(current_root, name)
            try:
                stat = os.lstat(item)
            except OSError:
                continue
            total += getattr(stat, "st_blocks", 0) * 512
    return total


def cleanup_codex_git_temp(stop_writers=False):
    configured_root = os.environ.get("CEREBRAL_CODEX_GIT_TEMP_ROOT")
    temp_root = os.path.realpath(configured_root or tempfile.gettempdir())
    candidates = codex_git_temp_candidates(temp_root)
    if not candidates:
        return {"removed": 0, "bytes": 0, "skipped": 0}
    processes = open_temp_processes(temp_root)
    if processes is None:
        return {"removed": 0, "bytes": 0, "skipped": len(candidates)}
    if stop_writers and os.environ.get("CEREBRAL_CODEX_GIT_TEMP_STOP_WRITERS", "1") != "0":
        for pid, process in processes.items():
            if "codex-workspace-diff" not in process["command"]:
                continue
            if not any(
                path == candidate or path.startswith(candidate + os.sep)
                for path in process["paths"]
                for candidate in candidates
            ):
                continue
            try:
                os.kill(pid, signal.SIGTERM)
            except (ProcessLookupError, PermissionError):
                continue
        processes = open_temp_processes(temp_root)
        if processes is None:
            return {"removed": 0, "bytes": 0, "skipped": len(candidates)}
    open_paths = {
        path
        for process in processes.values()
        for path in process["paths"]
    }
    removed = 0
    recovered = 0
    skipped = 0
    for candidate in candidates:
        prefix = candidate + os.sep
        if any(path == candidate or path.startswith(prefix) for path in open_paths):
            skipped += 1
            continue
        size = allocated_bytes(candidate)
        try:
            shutil.rmtree(candidate)
        except OSError:
            skipped += 1
            continue
        removed += 1
        recovered += size
    return {"removed": removed, "bytes": recovered, "skipped": skipped}


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


class RegistryUnavailable(RuntimeError):
    pass


def supabase_connection():
    root = repo_root_from()
    env_path = os.environ.get("CEREBRAL_SUPABASE_ENV_FILE") or os.path.join(root, ".env.local")
    values = {}
    try:
        with open(env_path, "r", encoding="utf-8") as handle:
            for raw_line in handle:
                line = raw_line.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                key, value = line.split("=", 1)
                key = key.strip()
                if key in {"SUPABASE_URL", "SUPABASE_PUBLISHABLE_KEY", "SUPABASE_ANON_KEY"}:
                    values[key] = value.strip().strip("'\"")
    except OSError:
        pass

    base_url = (os.environ.get("SUPABASE_URL") or values.get("SUPABASE_URL") or "").rstrip("/")
    api_key = (
        os.environ.get("SUPABASE_PUBLISHABLE_KEY")
        or os.environ.get("SUPABASE_ANON_KEY")
        or values.get("SUPABASE_PUBLISHABLE_KEY")
        or values.get("SUPABASE_ANON_KEY")
        or ""
    )
    if not base_url or not api_key:
        raise RegistryUnavailable(
            "Live Supabase routing blocked: SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY "
            f"must be available in the hook environment or {env_path}. No local registry fallback is allowed."
        )
    return base_url, api_key


def load_runtime_rows(table, query, required_fields):
    base_url, api_key = supabase_connection()
    try:
        timeout = float(os.environ.get("CEREBRAL_REGISTRY_TIMEOUT_SECONDS", "5"))
    except ValueError as error:
        raise RegistryUnavailable("Live Supabase routing blocked: invalid registry timeout.") from error
    request = urllib.request.Request(
        f"{base_url}/rest/v1/{table}?{query}",
        headers={"apikey": api_key, "Authorization": f"Bearer {api_key}"},
    )
    try:
        with urllib.request.urlopen(request, timeout=timeout) as response:
            rows = json.loads(response.read().decode("utf-8"))
    except (OSError, ValueError, json.JSONDecodeError) as error:
        raise RegistryUnavailable(
            f"Live Supabase routing blocked: {table} could not be read ({error}). "
            "No local registry fallback is allowed."
        ) from error
    if not isinstance(rows, list) or not rows:
        raise RegistryUnavailable(
            f"Live Supabase routing blocked: {table} returned no registry rows. "
            "No local registry fallback is allowed."
        )
    if any(not isinstance(row, dict) or any(row.get(field) is None for field in required_fields) for row in rows):
        raise RegistryUnavailable(f"Live Supabase routing blocked: {table} returned an incomplete registry row.")
    return rows


def load_runtime_routes():
    return load_runtime_rows(
        "cerebral_routes",
        "enabled=eq.true&select=*",
        ("route_key", "trigger_patterns", "lane", "owner", "intent", "shape", "required_tools", "review_gate", "priority", "enabled", "surface"),
    )


def load_runtime_skills():
    return load_runtime_rows(
        "harness_skills",
        "activation=eq.core&select=skill_key,canonical_path",
        ("skill_key", "canonical_path"),
    )


def load_runtime_capabilities():
    return load_runtime_rows(
        "harness_capabilities",
        "select=*",
        ("capability_key", "status", "verification_command"),
    )


def canonical_skill_roots(root, skills):
    roots = []
    seen = set()

    def add(skill_root, display_root):
        skill_root = os.path.abspath(os.path.expanduser(skill_root))
        real_root = os.path.realpath(skill_root)
        if real_root in seen:
            return
        if not os.path.isfile(os.path.join(skill_root, "SKILL.md")):
            raise RegistryUnavailable(
                f"Live Supabase routing blocked: {display_root}/SKILL.md does not exist in the repository."
            )
        seen.add(real_root)
        roots.append((skill_root, display_root))

    for skill in skills:
        canonical_path = str(skill.get("canonical_path") or "")
        if not canonical_path:
            continue
        skill_root = os.path.abspath(os.path.join(root, canonical_path))
        try:
            if os.path.commonpath([root, skill_root]) != root:
                continue
        except ValueError:
            continue
        add(skill_root, canonical_path)

    return roots


def canonical_skill_script_error(payload):
    if str(payload.get("tool_name") or "") != "Bash":
        return None
    tool_input = payload.get("tool_input") or {}
    if not isinstance(tool_input, dict):
        return None
    command = str(tool_input.get("command") or tool_input.get("cmd") or "")
    if not command:
        return None

    root = repo_root_from(payload.get("cwd"))
    skills = load_runtime_skills()
    registered = {skill["skill_key"]: skill["canonical_path"] for skill in skills}
    try:
        tokens = shlex.split(command)
    except ValueError:
        return None
    effective_cwd = str(tool_input.get("workdir") or payload.get("cwd") or root)
    for token in tokens:
        candidate = token.strip(";&|()")
        expanded = os.path.expandvars(os.path.expanduser(candidate))
        if "$" in expanded:
            continue
        absolute = os.path.abspath(expanded if os.path.isabs(expanded) else os.path.join(effective_cwd, expanded))
        try:
            relative = os.path.relpath(absolute, root).replace(os.sep, "/")
        except ValueError:
            continue
        match = re.match(r"^\.agents/skills/([^/]+)(/.*)?$", relative)
        if not match:
            continue
        skill_key, suffix = match.group(1), match.group(2) or ""
        expected_root = registered.get(skill_key)
        if not expected_root:
            return (
                "Live Supabase canonical skill path check blocked Bash. "
                f"{relative} is not registered in harness_skills. Stop and repair the live registry."
            )
        if expected_root != f".agents/skills/{skill_key}":
            expected = f"{expected_root}{suffix}"
            return (
                "Live Supabase canonical skill path check blocked Bash. "
                f"{relative} is registered at {expected}. Retry with that path; do not report the skill as stale."
            )

    expected_by_name = {}
    for skill_root, display_root in canonical_skill_roots(root, skills):
        scripts_root = os.path.join(skill_root, "scripts")
        if not os.path.isdir(scripts_root):
            continue
        for directory, _, files in os.walk(scripts_root):
            for filename in files:
                script_path = os.path.join(directory, filename)
                display_path = os.path.join(
                    display_root,
                    os.path.relpath(script_path, skill_root),
                ).replace(os.sep, "/")
                expected_by_name.setdefault(filename, {})[os.path.realpath(script_path)] = display_path

    for token in tokens:
        candidate = token.strip(";&|()")
        expected_paths = expected_by_name.get(os.path.basename(candidate))
        if not expected_paths:
            continue
        expanded_candidate = os.path.expandvars(os.path.expanduser(candidate))
        if "$" in expanded_candidate:
            continue
        actual_path = os.path.realpath(os.path.abspath(
            expanded_candidate
            if os.path.isabs(expanded_candidate)
            else os.path.join(effective_cwd, expanded_candidate)
        ))
        if actual_path in expected_paths:
            continue
        expected = " or ".join(sorted(expected_paths.values()))
        return (
            "Canonical skill path check blocked Bash. "
            f"{os.path.basename(candidate)} must run from {expected}; "
            f"received {candidate}. Live Supabase harness_skills owns canonical script paths."
        )
    return None


def routes_for_prompt():
    return load_runtime_routes(), "Supabase runtime registry"


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
    capability_source = "Supabase runtime registry"
    if needs_tool_preflight(text) or any(route.get("route_key") == "systems-tool-harness" for route in matched_routes):
        capabilities = load_runtime_capabilities()
    return matched_routes, capabilities, capability_source if capabilities else route_source, explicit_route, tags


def needs_tool_preflight(text):
    return bool(CAPABILITY_RE.search(text) or TOOL_FAILURE_RE.search(text))


def attempts_unapproved_substitution(text):
    return bool(SUBSTITUTION_RE.search(text))


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
            if route.get("project"):
                lines.insert(len(lines) - 4, f"- [project] {route.get('project')}")
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
    if attempts_unapproved_substitution(text):
        lines.append(
            "- [substitution-block] Do not continue on the substitute. Verify and repair or upgrade the requested path first. "
            "Ask Jerami only when that repair changes scope, adds cost or authentication, is destructive, or carries unresolved risk."
        )
    if LINEUPS_RE.search(text):
        lines.extend([
            "- [profile] Catena Media Lineups",
            "- [contract] Read plugins/s-systems/skills/client-video-storyboard/references/lineups-treatment-system.md before transcript mapping, asset selection, Figma work, or Premiere mutation.",
            "- [menu] Use the seven approved lanes. Choose an approved option and adjust its settings. Do not invent a new option during an edit.",
            "- [assets] Use suitable client-provided Eagle assets. For new searches, prefer action photos and avoid roster portraits; contextual photos are allowed when the transcript supports them. Search Eagle, then SportsDB or OpenWiki. Fill the 1920 x 1080 frame and keep faces clear.",
            "- [asset-integrity] One source image may appear only once per episode. Record source IDs and image hashes in the episode asset ledger before Figma or Premiere work.",
            "- [asset-layout] Three-subject swaps use left, center, and right thirds. The logo and middle subject share the 960 px centerline; side subjects face inward when a suitable asset exists.",
            "- [copy] Preserve transcript meaning, attribution, causal ownership, and spoken order. Compress or closely paraphrase; do not invent an editorial angle.",
            "- [quick-stat] Choose Single-frame statement at 6.5 seconds or Two-photo progression at 10 seconds. Photo-led pushes run 100% to 102.5%. One point has no pipe. Premiere owns light leaks and Blur Dissolves.",
            "- [figma-contract] Use singleton-figma-system and read .agents/skills/singleton-figma-system/references/lineups-production-system.md before building a Lineups scene.",
            "- [figma-skills] Load file-hygiene and layer-cleanup before structural Figma edits. Load safe-auto-layout-conversion for Auto Layout or sizing changes. Load accessibility-review for color, contrast, or accessibility work.",
            "- [data-driven] Stat breakdown, Simple and Full comparison, year-by-year, and recurring boards require the locked no-football Field Night background. Keep background and artwork as separate editable Figma layers. Export complete motion scenes with their approved backgrounds included; transparent overlays require an explicit request. Verify the background image hash and node in Figma readback.",
            "- [player-alpha] Asset Swap and Comparison require real-alpha player assets for player compositing. Comparison includes Cinematic 2-up, Simple, and Full with two, three, or four subjects. Search Eagle for suitable alpha player art first; otherwise choose a suitable simple action photo and use Figma's native Remove background tool. Preserve the original and verify real alpha and clean edges. The other five lanes have no automatic player-cutout requirement. Player-asset alpha does not require transparent final scene exports.",
            "- [asset-swap] Inherit the guarded football-visible Field Night background, geometry, layer order, crop roles, and motion from Components. Episode cutouts require real alpha. Only cutouts, logos, transcript copy, and reveal timing are replaceable.",
            "- [figma] Components owns approved sources. Foundations holds references. Episode Workspace holds instances and motion work. Keep text and cutout bounds tight. Scene titles use centered dark text, Auto Width or Hug, and 112 px or larger type. Support labels use 48 px or larger type. Prune rejected and stale work after review.",
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
        (re.compile(r"\\n"), "literal escaped newline"),
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


def commonmark_spacing_hits(text):
    hits = []
    lines = text.splitlines()
    in_fence = False
    in_list_block = False
    for index, line in enumerate(lines):
        trimmed = line.strip()
        is_fence = re.match(r"^(?:`{3,}|~{3,})", trimmed)
        if is_fence:
            if not in_fence and index > 0 and lines[index - 1].strip():
                hits.append((index + 1, "CommonMark blank line before fenced code", trimmed))
            if in_fence and index + 1 < len(lines) and lines[index + 1].strip():
                hits.append((index + 1, "CommonMark blank line after fenced code", trimmed))
            in_fence = not in_fence
            in_list_block = False
            continue
        if in_fence:
            continue
        if not trimmed:
            in_list_block = False
            continue
        if re.match(r"^#{1,6}\s+", line) and index + 1 < len(lines) and lines[index + 1].strip():
            hits.append((index + 1, "CommonMark blank line after heading", trimmed))
        list_pattern = r"^\s*(?:[-*+] |\d+[.)] )"
        is_list = re.match(list_pattern, line)
        prior_list_in_block = False
        cursor = index - 1
        while cursor >= 0 and lines[cursor].strip():
            if re.match(list_pattern, lines[cursor]):
                prior_list_in_block = True
            cursor -= 1
        if is_list and index > 0 and lines[index - 1].strip() and not prior_list_in_block:
            hits.append((index + 1, "CommonMark blank line before list", trimmed))
        if is_list:
            in_list_block = True
        elif in_list_block and not re.match(r"^\s{2,}\S", line):
            hits.append((index + 1, "CommonMark blank line after list", trimmed))
            in_list_block = False
    return hits


def writing_hits(text):
    spacing_hits = commonmark_spacing_hits(text)
    text = strip_writing_code(text)
    hits = []
    for pattern, label in writing_rules():
        for match in pattern.finditer(text):
            line_number = text[: match.start()].count("\n") + 1
            hits.append((line_number, label, match.group(0).strip()[:80]))
    hits.extend(title_case_heading_hits(text))
    hits.extend(spacing_hits)
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
        cleanup_codex_git_temp(stop_writers=True)
        prompt = str(payload.get("prompt") or "")
        try:
            emit(context("repo prompt should stay aligned across surfaces", prompt), event)
        except RegistryUnavailable as error:
            emit_block(str(error))
        return

    if event == "PreToolUse":
        try:
            skill_path_error = canonical_skill_script_error(payload)
            if skill_path_error:
                emit_block(skill_path_error)
                return
            emit(context(f"before {payload.get('tool_name') or 'tool'} can change or inspect implementation", tool_text(payload)), event)
        except RegistryUnavailable as error:
            emit_block(str(error))
        return

    if event == "SessionStart":
        cleanup_codex_git_temp()
        try:
            emit(context("session should start from canonical Singleton Systems routing", ""), event)
        except RegistryUnavailable as error:
            emit_block(str(error))
        return

    if event == "Stop":
        cleanup_result = cleanup_codex_git_temp(stop_writers=True)
        if cleanup_result["removed"]:
            recovered_gib = cleanup_result["bytes"] / (1024 ** 3)
            print(
                f"Cerebral Stop cleanup removed {cleanup_result['removed']} abandoned Git-temp "
                f"directories and recovered {recovered_gib:.2f} GiB.",
                file=sys.stderr,
            )
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
