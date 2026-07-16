import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

// Unit-level coverage for .codex/hooks/cerebral_singleton_guard.py, complementing the
// integration-style fixtures in check-cerebral-hook-routing.mjs. These tests isolate the
// registry-loading, sorting, capability-preflight, and stale-owner-blocking behavior that the
// PR rewrote, using throwaway temp directories instead of the real config/cerebral-registry.json
// so results do not depend on the live registry content.

const root = process.cwd();
const HOOK_PATH = path.join(root, ".codex/hooks/cerebral_singleton_guard.py");
const IN_REPO_CWD = "/Users/singleton23/Documents/Development/singleton-systems";

function runHook(payload, { cwd = root, env = {} } = {}) {
  const baseEnv = { ...process.env };
  delete baseEnv.SUPABASE_URL;
  delete baseEnv.SUPABASE_ANON_KEY;
  return spawnSync("python3", [HOOK_PATH], {
    cwd,
    input: JSON.stringify(payload),
    encoding: "utf8",
    env: { ...baseEnv, ...env },
  });
}

const tempDirs = [];
function tempRepo(files) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "cerebral-hook-unit-"));
  for (const [relativePath, content] of Object.entries(files)) {
    const fullPath = path.join(dir, relativePath);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, content);
  }
  tempDirs.push(dir);
  return dir;
}

function additionalContext(result) {
  assert.equal(result.status, 0, `hook exited ${result.status}: ${result.stderr}`);
  return JSON.parse(result.stdout).hookSpecificOutput.additionalContext;
}

try {
  // 1. Repo gating: outside the repo marker the hook must stay completely silent.
  {
    const result = runHook({
      hook_event_name: "UserPromptSubmit",
      cwd: "/tmp/some/other/path",
      prompt: "Upwork proposal",
    });
    assert.equal(result.status, 0, `unexpected exit: ${result.stderr}`);
    assert.equal(result.stdout, "", "hook must stay silent outside the repo marker");
  }

  // 2. No local registry file -> empty fallback registry, generic routing message only.
  {
    const dir = tempRepo({});
    const context = additionalContext(
      runHook(
        { hook_event_name: "UserPromptSubmit", cwd: IN_REPO_CWD, prompt: "Review the site typography." },
        { cwd: dir },
      ),
    );
    assert.match(context, /\[next\] No specialized route matched; use normal task flow\./);
    assert.doesNotMatch(context, /\[preflight\]/);
  }

  // 3. Capability keyword with an empty fallback registry -> preflight warning plus a
  //    "do not assert absence" note, since no capability rows are available to cite.
  {
    const dir = tempRepo({});
    const context = additionalContext(
      runHook(
        { hook_event_name: "UserPromptSubmit", cwd: IN_REPO_CWD, prompt: "Is this tool installed on path?" },
        { cwd: dir },
      ),
    );
    assert.match(context, /\[preflight\] Check registry, Homebrew, and repo-local npm facts/);
    assert.match(context, /\[do-not\] Do not assert absence without verification evidence\./);
    assert.doesNotMatch(context, /\[registry\]/);
  }

  // 4. Capability keyword with a populated local registry -> cites the registry instead of
  //    warning that nothing was found.
  {
    const dir = tempRepo({
      "config/cerebral-registry.json": JSON.stringify({
        routes: [],
        capabilities: [{ capability_key: "demo", status: "verify-on-use" }],
      }),
    });
    const context = additionalContext(
      runHook(
        { hook_event_name: "UserPromptSubmit", cwd: IN_REPO_CWD, prompt: "Is this tool installed on path?" },
        { cwd: dir },
      ),
    );
    assert.match(context, /\[registry\] local registry fallback; use recorded path and verification command\./);
    assert.doesNotMatch(context, /\[do-not\]/);
  }

  // 5. Route ranking: routes are sorted by ascending priority, only the top two render, and
  //    missing surface/review_gate fall back to their documented defaults.
  {
    const dir = tempRepo({
      "config/cerebral-registry.json": JSON.stringify({
        routes: [
          { route_key: "r1", trigger_patterns: ["fooword"], priority: 5, lane: "LaneA", owner: "OwnerA", required_tools: ["toolA", "toolB"], review_gate: "Gate A", surface: "surfaceA" },
          { route_key: "r2", trigger_patterns: ["fooword"], priority: 1, lane: "LaneB", owner: "OwnerB", required_tools: ["toolC"], review_gate: null, surface: null },
          { route_key: "r3", trigger_patterns: ["fooword"], priority: 50, lane: "LaneC", owner: "OwnerC", required_tools: ["toolD"], review_gate: "Gate C", surface: "surfaceC" },
        ],
        capabilities: [],
      }),
    });
    const context = additionalContext(
      runHook({ hook_event_name: "UserPromptSubmit", cwd: IN_REPO_CWD, prompt: "fooword test" }, { cwd: dir }),
    );
    const laneBIndex = context.indexOf("LaneB");
    const surfaceAIndex = context.indexOf("[surface] surfaceA");
    assert.ok(laneBIndex !== -1 && surfaceAIndex !== -1, "both top-priority routes should render");
    assert.ok(laneBIndex < surfaceAIndex, "the lower priority number (r2) must be listed before r1");
    assert.match(context, /\[surface\] task/, "a missing surface must fall back to 'task'");
    assert.match(context, /\[review\] review before mutation/, "a missing review_gate must fall back to the default text");
    assert.match(context, /\[tools\] toolA \+ toolB/, "required_tools must be joined with ' + '");
    assert.doesNotMatch(context, /LaneC|OwnerC/, "the third (lowest-priority) route must be dropped");
  }

  // 6. Capability preflight is gated on the prompt text, not on which route matched: the
  //    systems-tool-harness route can match without any preflight/registry lines appearing.
  {
    const dir = tempRepo({
      "config/cerebral-registry.json": JSON.stringify({
        routes: [{
          route_key: "systems-tool-harness",
          trigger_patterns: ["s-systems"],
          priority: 10,
          lane: "Offer",
          owner: "Docs/skills",
          required_tools: ["s-systems:tool-harness"],
          review_gate: "Run registry and hook checks before completion.",
          surface: "skill / hook routing",
        }],
        capabilities: [{ capability_key: "demo", status: "verify-on-use" }],
      }),
    });
    const context = additionalContext(
      runHook(
        { hook_event_name: "UserPromptSubmit", cwd: IN_REPO_CWD, prompt: "Lets discuss s-systems architecture direction." },
        { cwd: dir },
      ),
    );
    assert.match(context, /\[surface\] skill \/ hook routing/);
    assert.doesNotMatch(context, /\[preflight\]|\[registry\]|\[do-not\]/);
  }

  // 7. PreToolUse: dict tool_input is JSON-encoded before drift scanning.
  {
    const dir = tempRepo({});
    const result = runHook(
      { hook_event_name: "PreToolUse", cwd: IN_REPO_CWD, tool_name: "Edit", tool_input: { file_path: "docs/integration-map.md" } },
      { cwd: dir },
    );
    const parsed = JSON.parse(result.stdout);
    assert.equal(parsed.hookSpecificOutput.hookEventName, "PreToolUse");
    assert.match(parsed.hookSpecificOutput.additionalContext, /\[reason\] before Edit can change or inspect implementation/);
    assert.match(parsed.hookSpecificOutput.additionalContext, /Drift check: docs\/skills\/hook edits should run a stale-name scan/);
  }

  // 8. PreToolUse: non-dict tool_input falls back to str() without raising.
  {
    const dir = tempRepo({});
    const result = runHook(
      { hook_event_name: "PreToolUse", cwd: IN_REPO_CWD, tool_name: "Bash", tool_input: ["ls", "-la"] },
      { cwd: dir },
    );
    assert.equal(result.status, 0, `unexpected exit: ${result.stderr}`);
    const parsed = JSON.parse(result.stdout);
    assert.match(parsed.hookSpecificOutput.additionalContext, /\[reason\] before Bash can change or inspect implementation/);
  }

  // 9. SessionStart calls context() with an empty string and still emits a structured payload.
  {
    const dir = tempRepo({});
    const result = runHook({ hook_event_name: "SessionStart", cwd: IN_REPO_CWD }, { cwd: dir });
    const parsed = JSON.parse(result.stdout);
    assert.equal(parsed.hookSpecificOutput.hookEventName, "SessionStart");
    assert.match(parsed.hookSpecificOutput.additionalContext, /\[reason\] session should start from canonical Singleton Systems routing/);
    assert.match(parsed.hookSpecificOutput.additionalContext, /\[next\] No specialized route matched/);
  }

  // 10. PostToolUse blocks on stale owner language and leaves the file untouched -- the old
  //     repair_known_drift auto-fix behavior was removed by this PR.
  {
    const dir = tempRepo({ "docs/integration-map.md": "Some intro line.\nBear capture notes go here for context.\nEnd of file.\n" });
    const before = fs.readFileSync(path.join(dir, "docs/integration-map.md"), "utf8");
    const result = runHook({ hook_event_name: "PostToolUse", cwd: IN_REPO_CWD, tool_name: "Edit", tool_input: {} }, { cwd: dir });
    const after = fs.readFileSync(path.join(dir, "docs/integration-map.md"), "utf8");
    assert.equal(after, before, "the hook must not silently rewrite stale language anymore");
    assert.equal(result.status, 0, `unexpected exit: ${result.stderr}`);
    const parsed = JSON.parse(result.stdout);
    assert.equal(parsed.continue, false);
    assert.match(parsed.stopReason, /Singleton Systems drift guard found stale legacy owner language/);
    assert.match(parsed.stopReason, /docs\/integration-map\.md:2: Bear capture notes/);
    assert.doesNotMatch(result.stdout, /repaired/i, "the removed auto-repair system message must never be emitted");
  }

  // 11. PostToolUse with no stale hits stays completely silent.
  {
    const dir = tempRepo({ "docs/integration-map.md": "Obsidian raw capture/offload owns this surface.\n" });
    const result = runHook({ hook_event_name: "PostToolUse", cwd: IN_REPO_CWD, tool_name: "Edit", tool_input: {} }, { cwd: dir });
    assert.equal(result.status, 0);
    assert.equal(result.stdout, "");
  }

  // 12. Malformed local registry JSON falls back to the empty default instead of crashing.
  {
    const dir = tempRepo({ "config/cerebral-registry.json": "{ not valid json" });
    const result = runHook({ hook_event_name: "UserPromptSubmit", cwd: IN_REPO_CWD, prompt: "hello there" }, { cwd: dir });
    assert.equal(result.status, 0, `unexpected exit: ${result.stderr}`);
    const context = JSON.parse(result.stdout).hookSpecificOutput.additionalContext;
    assert.match(context, /\[next\] No specialized route matched/);
  }

  // 13. Supabase env vars pointing at an unreachable host fall back to the local registry
  //     instead of hanging or crashing the hook.
  {
    const dir = tempRepo({});
    const result = runHook(
      { hook_event_name: "UserPromptSubmit", cwd: IN_REPO_CWD, prompt: "Is this tool installed on path?" },
      { cwd: dir, env: { SUPABASE_URL: "http://127.0.0.1:1", SUPABASE_ANON_KEY: "test-key" } },
    );
    assert.equal(result.status, 0, `unexpected exit: ${result.stderr}`);
    const context = JSON.parse(result.stdout).hookSpecificOutput.additionalContext;
    assert.match(context, /\[do-not\] Do not assert absence without verification evidence\./);
  }

  console.log("Cerebral hook unit check passed: 13 fixtures.");
} finally {
  for (const dir of tempDirs) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}