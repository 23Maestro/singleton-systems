import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const hook = path.join(root, ".codex/hooks/cerebral_singleton_guard.py");
const python = process.env.PYTHON || "python3";

const registry = JSON.parse(fs.readFileSync(path.join(root, "config/cerebral-registry.json"), "utf8"));
const routes = registry.routes.filter((route) => route.enabled);

function runHook(prompt, env = {}) {
  return spawnSync(python, [hook], {
    cwd: root,
    input: JSON.stringify({ hook_event_name: "UserPromptSubmit", cwd: root, prompt }),
    encoding: "utf8",
    env: { ...process.env, ...env },
  });
}

function runPostTool(toolName, toolInput, env = {}) {
  return spawnSync(python, [hook], {
    cwd: root,
    input: JSON.stringify({ hook_event_name: "PostToolUse", cwd: root, tool_name: toolName, tool_input: toolInput }),
    encoding: "utf8",
    env: { ...process.env, ...env },
  });
}

function runPreTool(command, workdir = root, env = {}) {
  return spawnSync(python, [hook], {
    cwd: root,
    input: JSON.stringify({
      hook_event_name: "PreToolUse",
      cwd: root,
      tool_name: "Bash",
      tool_input: { command, workdir },
    }),
    encoding: "utf8",
    env: { ...process.env, SUPABASE_URL: "", SUPABASE_ANON_KEY: "", ...env },
  });
}

function runStop(prompt, lastAssistantMessage, stopHookActive = false, env = {}) {
  return spawnSync(python, [hook], {
    cwd: root,
    input: JSON.stringify({
      hook_event_name: "Stop",
      cwd: root,
      prompt,
      stop_hook_active: stopHookActive,
      last_assistant_message: lastAssistantMessage,
    }),
    encoding: "utf8",
    env: { ...process.env, ...env },
  });
}

for (const route of routes) {
  for (const prompt of [route.example_prompt, `[route] ${route.route_key}\nHandle this request.`]) {
    const result = runHook(prompt);
    assert.equal(result.status, 0, `${route.route_key}: hook exited ${result.status}: ${result.stderr}`);
    const must = [
      `[route] ${route.route_key}`,
      `[lane] ${route.lane}`,
      `[bucket] ${route.bucket}`,
      `[owner] ${route.owner}`,
      ...(route.project ? [`[project] ${route.project}`] : []),
      ...route.required_tools,
    ];
    for (const snippet of must) {
      assert.match(result.stdout, new RegExp(snippet.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), `${route.route_key}: missing ${snippet}`);
    }
  }
}

const explicitBucket = runHook("[bucket] writing-review\nCompress this client update.");
assert.equal(explicitBucket.status, 0);
for (const snippet of ["[route] writing-review", "[lane] Writing Review", "[bucket] writing-review"]) {
  assert.match(explicitBucket.stdout, new RegExp(snippet.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), `explicit bucket: missing ${snippet}`);
}

const portfolioCheckpoint = runHook("Log this for my portfolio as a portfolio checkpoint.");
assert.equal(portfolioCheckpoint.status, 0);
assert.doesNotMatch(portfolioCheckpoint.stdout, /\[portfolio-checkpoint\]/, "explicit evidence route must not duplicate its review gate");
for (const snippet of [
  "[route] portfolio-evidence",
  "[lane] Portfolio",
  "[owner] Eagle",
  "s-systems:portfolio-evidence-capture",
  "Show no more than two candidate visuals",
]) {
  assert.match(
    portfolioCheckpoint.stdout,
    new RegExp(snippet.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
    `portfolio checkpoint: missing ${snippet}`,
  );
}

const projectReviewGate = runHook("Use client video storyboard for this Lineups football edit.");
assert.equal(projectReviewGate.status, 0);
assert.match(projectReviewGate.stdout, /\[portfolio-checkpoint\]/);
assert.match(projectReviewGate.stdout, /Ignore routine tool calls and wait for Jerami before any Eagle write/);

const preflight = runHook("Can you use the PDF tool to inspect this file?");
assert.equal(preflight.status, 0);
for (const snippet of ["[preflight]", "[registry]"]) {
  assert.match(preflight.stdout, new RegExp(snippet.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), `preflight: missing ${snippet}`);
}

const sameToolRepair = runHook("The official Understand Anything viewer is missing its compiled dashboard. Build that same viewer and continue.");
assert.equal(sameToolRepair.status, 0);
for (const snippet of ["[repair]", "[substitution-gate]", "[pause]"]) {
  assert.match(sameToolRepair.stdout, new RegExp(snippet.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), `same-tool repair: missing ${snippet}`);
}
assert.match(sameToolRepair.stdout, /safe repair inside the requested tool and surface is normal task work/i);
assert.match(sameToolRepair.stdout, /Changing the requested tool or surface requires explicit user approval/);

const failingCliPath = runHook("The Google CLI path is failing. Verify the installed command and fix the same CLI.");
assert.equal(failingCliPath.status, 0);
assert.match(failingCliPath.stdout, /\[preflight\]/);
assert.match(failingCliPath.stdout, /\[repair\]/);
assert.match(failingCliPath.stdout, /\[substitution-gate\]/);

const blockedPreferredPathFallback = runHook(
  "The Next.js endpoint is unavailable because this repo is on Next 15, so I’m using the live rendered page and doing the next best thing.",
);
assert.equal(blockedPreferredPathFallback.status, 0);
for (const snippet of ["[preflight]", "[repair]", "[substitution-gate]", "[substitution-block]"]) {
  assert.match(
    blockedPreferredPathFallback.stdout,
    new RegExp(snippet.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
    `preferred-path fallback: missing ${snippet}`,
  );
}
assert.match(blockedPreferredPathFallback.stdout, /Do not continue on the substitute/);
assert.match(blockedPreferredPathFallback.stdout, /repair or upgrade the requested path first/);

const unknownRoute = runHook("[route] imaginary-route\nDo something.");
assert.equal(unknownRoute.status, 0);
assert.match(unknownRoute.stdout, /\[route-error\] Unknown or disabled route: imaginary-route/);

const offerPacket = runHook(`[route] offer-content
[shape] working-brief
[tools] s-systems:offer-portfolio-content
[query] Turn this creator reference into a portfolio-led content angle.`);
assert.equal(offerPacket.status, 0);
for (const snippet of [
  "[route] offer-content",
  "[shape] working-brief",
  "[tools] s-systems:offer-portfolio-content",
  "[query] Turn this creator reference into a portfolio-led content angle.",
  "[tool-check] Requested tool belongs to this route.",
]) {
  assert.match(offerPacket.stdout, new RegExp(snippet.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), `offer packet: missing ${snippet}`);
}
assert.match(offerPacket.stdout, /Writing rules for reviewable artifacts/, "offer packet: missing writing rules");
assert.match(offerPacket.stdout, /Jerami review: aim for 300-500 words maximum/, "offer packet: hook did not read the canonical payload");
assert.match(offerPacket.stdout, /Swap test hooks and site copy/, "offer packet: missing swap test");
assert.match(offerPacket.stdout, /Linear: CommonMark/, "offer packet: missing Linear operational format");
assert.match(offerPacket.stdout, /Asana: convert drafts to supported HTML in `html_notes`/, "offer packet: missing Asana rich-text transport");
assert.match(offerPacket.stdout, /`notes` is plain text/, "offer packet: missing Asana plain-text boundary");

const socialPrompt = runHook("Write a LinkedIn post I can publish about AI hooks.");
assert.equal(socialPrompt.status, 0);
assert.match(socialPrompt.stdout, /\[route\] offer-content/);
assert.match(socialPrompt.stdout, /Writing rules for reviewable artifacts/);

const wrongToolPacket = runHook(`[route] offer-content
[tools] s-systems:freelance-gig-proposals
[query] Turn this creator reference into a portfolio-led content angle.`);
assert.equal(wrongToolPacket.status, 0);
assert.match(wrongToolPacket.stdout, /\[route-error\] Requested tool does not belong to offer-content: s-systems:freelance-gig-proposals/);

const unrelated = runHook("Review the site typography.");
assert.equal(unrelated.status, 0);
assert.doesNotMatch(unrelated.stdout, /s-systems:freelance-gig-proposals/);
assert.match(unrelated.stdout, /\[next\] No specialized route matched/);
assert.match(unrelated.stdout, /\[portfolio-checkpoint\]/, "unmatched project work must retain the evidence gate");
assert.ok(unrelated.stdout.length < 500, "unmatched prompts must not receive a large policy block");

const wrongEaglePath = runPreTool("node scripts/eagle-api-cli.js list");
assert.equal(wrongEaglePath.status, 0);
assert.match(wrongEaglePath.stdout, /"continue": false/);
assert.match(wrongEaglePath.stdout, /plugins\/s-systems\/skills\/eagle-skill\/scripts\/eagle-api-cli\.js/);

const unavailableRegistry = runHook("Review the site typography.", {
  CEREBRAL_SUPABASE_ENV_FILE: path.join(root, ".missing-supabase-env"),
  SUPABASE_URL: "",
  SUPABASE_PUBLISHABLE_KEY: "",
  SUPABASE_ANON_KEY: "",
});
assert.equal(unavailableRegistry.status, 0);
assert.match(unavailableRegistry.stdout, /"continue": false/);
assert.match(unavailableRegistry.stdout, /No local registry fallback is allowed/);

const wrongEagleDocument = runPreTool("sed -n '1,240p' .agents/skills/eagle-skill/SKILL.md");
assert.equal(wrongEagleDocument.status, 0);
assert.match(wrongEagleDocument.stdout, /"continue": false/);
assert.match(wrongEagleDocument.stdout, /plugins\/s-systems\/skills\/eagle-skill\/SKILL\.md/);
assert.match(wrongEagleDocument.stdout, /do not report the skill as stale/i);

const correctEagleDocument = runPreTool(
  "sed -n '1,240p' plugins/s-systems/skills/eagle-skill/SKILL.md",
);
assert.equal(correctEagleDocument.status, 0);
assert.doesNotMatch(correctEagleDocument.stdout, /"continue": false/);

const standaloneSkillDocument = runPreTool("sed -n '1,240p' .agents/skills/dev-storage/SKILL.md");
assert.equal(standaloneSkillDocument.status, 0);
assert.doesNotMatch(standaloneSkillDocument.stdout, /"continue": false/);

const unknownSkillDocument = runPreTool("sed -n '1,240p' .agents/skills/not-registered/SKILL.md");
assert.equal(unknownSkillDocument.status, 0);
assert.match(unknownSkillDocument.stdout, /"continue": false/);
assert.match(unknownSkillDocument.stdout, /not registered in harness_skills/);

const correctEaglePath = runPreTool(
  "node plugins/s-systems/skills/eagle-skill/scripts/eagle-api-cli.js list",
);
assert.equal(correctEaglePath.status, 0);
assert.doesNotMatch(correctEaglePath.stdout, /"continue": false/);

const wrongUpworkPath = runPreTool("node scripts/estimate-catena-hours.mjs 13:41");
assert.equal(wrongUpworkPath.status, 0);
assert.match(wrongUpworkPath.stdout, /"continue": false/);
assert.match(wrongUpworkPath.stdout, /plugins\/s-systems\/skills\/upwork-hourly-rubric\/scripts\/estimate-catena-hours\.mjs/);

const wrongRepoSkillPath = runPreTool("python3 scripts/dev_storage.py --json");
assert.equal(wrongRepoSkillPath.status, 0);
assert.match(wrongRepoSkillPath.stdout, /"continue": false/);
assert.match(wrongRepoSkillPath.stdout, /\.agents\/skills\/dev-storage\/scripts\/dev_storage\.py/);

const correctRepoSkillPath = runPreTool(
  "python3 .agents/skills/dev-storage/scripts/dev_storage.py --json",
);
assert.equal(correctRepoSkillPath.status, 0);
assert.doesNotMatch(correctRepoSkillPath.stdout, /"continue": false/);

const ordinaryRepoScript = runPreTool("node scripts/check-cerebral-registry.mjs");
assert.equal(ordinaryRepoScript.status, 0);
assert.doesNotMatch(ordinaryRepoScript.stdout, /"continue": false/);

const pricing = runHook("What should I charge for this video edit after the platform fee?");
assert.equal(pricing.status, 0);
for (const snippet of [
  "[route] freelance-pricing",
  "[lane] AI Consultant",
  "[bucket] freelance-pricing",
  "[tools] s-systems:freelance-pricing",
]) {
  assert.match(pricing.stdout, new RegExp(snippet.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), `pricing route: missing ${snippet}`);
}

const hourlyEvidence = runHook("Build an hours plan for this active Upwork hourly video contract.");
assert.equal(hourlyEvidence.status, 0);
for (const snippet of [
  "[route] upwork-hourly-evidence",
  "[lane] AI Consultant",
  "[owner] Upwork",
  "[tools] s-systems:upwork-hourly-rubric",
]) {
  assert.match(
    hourlyEvidence.stdout,
    new RegExp(snippet.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
    `hourly evidence route: missing ${snippet}`,
  );
}

for (const prompt of [
  "Use client video storyboard for this Lineups football edit.",
  "Build the Catena Media college football edit from the transcript.",
]) {
  const lineups = runHook(prompt);
  assert.equal(lineups.status, 0, `Lineups hook exited ${lineups.status}: ${lineups.stderr}`);
  for (const snippet of [
    "[route] client-video",
    "[profile] Catena Media Lineups",
    "plugins/s-systems/skills/client-video-storyboard/references/lineups-treatment-system.md",
    "Use the seven approved lanes",
    "prefer action photos and avoid roster portraits",
    "contextual photos are allowed",
    "One source image may appear only once per episode",
    "logo and middle subject share the 960 px centerline",
    "Preserve transcript meaning, attribution, causal ownership",
    "Single-frame statement at 6.5 seconds",
    "Two-photo progression at 10 seconds",
    "100% to 102.5%",
    "One point has no pipe",
    "singleton-figma-system",
    ".agents/skills/singleton-figma-system/references/lineups-production-system.md",
    "file-hygiene and layer-cleanup",
    "safe-auto-layout-conversion",
    "accessibility-review",
    "football-visible Field Night background",
    "locked no-football Field Night background",
    "Keep background and artwork as separate editable Figma layers",
    "Export complete motion scenes with their approved backgrounds included",
    "Asset Swap and Comparison require real-alpha player assets",
    "Search Eagle for suitable alpha player art first",
    "Figma's native Remove background tool",
    "The other five lanes have no automatic player-cutout requirement",
    "Player-asset alpha does not require transparent final scene exports",
    "Episode cutouts require real alpha",
    "Only cutouts, logos, transcript copy, and reveal timing are replaceable",
    "Keep text and cutout bounds tight",
    "centered dark text",
    "Auto Width or Hug",
    "112 px or larger",
    "48 px or larger",
    "Episode / 06 Motion Renders",
    "Fill the 1920 x 1080 frame",
    "Components owns approved sources",
    "Inspect a fresh 1920 x 1080 screenshot",
  ]) {
    assert.ok(lineups.stdout.includes(snippet), `Lineups hook: missing ${snippet}`);
  }
}

const enforcedDrift = runPostTool("Edit", {
  file_path: path.join(root, "plugins/s-systems/skills/opportunity-hq-updater/SKILL.md"),
});
assert.equal(enforcedDrift.status, 0, `post-write drift guard exited ${enforcedDrift.status}: ${enforcedDrift.stderr}`);

const blockedDrift = runPostTool(
  "Edit",
  { file_path: path.join(root, "plugins/s-systems/skills/opportunity-hq-updater/SKILL.md") },
  { NODE_BINARY: "/usr/bin/false" },
);
assert.match(blockedDrift.stdout, /"continue": false/);
assert.match(blockedDrift.stdout, /Cerebral drift check failed after the write/);

const blockedWriting = runStop(
  "Write a LinkedIn post I can publish about AI hooks.",
  "The unlock is a robust workflow that can additionally streamline your process.",
);
assert.equal(blockedWriting.status, 0);
assert.match(blockedWriting.stdout, /"decision": "block"/);
assert.match(blockedWriting.stdout, /Outbound writing gate blocked/);
assert.match(blockedWriting.stdout, /banned word/);

const cleanWriting = runStop(
  "Write a LinkedIn post I can publish about AI hooks.",
  "AI output gets better when standards become checks.\n\nPrompts help. Plans help. Hooks force review.",
);
assert.equal(cleanWriting.status, 0);
assert.equal(cleanWriting.stdout.trim(), "");

const markdownWriting = runStop(
  "Create a Markdown Linear document for review.",
  "This is a robust plan.",
);
assert.equal(markdownWriting.status, 0);
assert.match(markdownWriting.stdout, /"decision": "block"/);
assert.match(markdownWriting.stdout, /banned word/);

const escapedNewlineWriting = runStop(
  "Create a Markdown Linear document for review.",
  "# Status\\n\\n## What changed\\n\\n- Added the route.",
);
assert.equal(escapedNewlineWriting.status, 0);
assert.match(escapedNewlineWriting.stdout, /"decision": "block"/);
assert.match(escapedNewlineWriting.stdout, /literal escaped newline/);

const crampedCommonMarkWriting = runStop(
  "Create a Markdown Asana task for review.",
  "# Status\nCurrent state.\n## What changed\n- Added the route.",
);
assert.equal(crampedCommonMarkWriting.status, 0);
assert.match(crampedCommonMarkWriting.stdout, /"decision": "block"/);
assert.match(crampedCommonMarkWriting.stdout, /CommonMark blank line/);

const cleanCommonMarkWriting = runStop(
  "Create a Markdown Linear document for review.",
  "# Status\n\nCurrent state.\n\n## What changed\n\n- Added the route.\n\n## Next\n\n- Verify the readback.",
);
assert.equal(cleanCommonMarkWriting.status, 0);
assert.equal(cleanCommonMarkWriting.stdout.trim(), "");

const htmlWriting = runStop(
  "Build a public HTML page for review.",
  "This is a robust page.",
);
assert.equal(htmlWriting.status, 0);
assert.match(htmlWriting.stdout, /"decision": "block"/);

const ordinaryChat = runStop(
  "What does the word robust mean?",
  "This is a robust answer.",
);
assert.equal(ordinaryChat.status, 0);
assert.equal(ordinaryChat.stdout.trim(), "", "ordinary chat must not invoke the writing gate");

const cleanupRoot = fs.mkdtempSync(path.join(root, ".codex-git-temp-cleanup-test-"));
try {
  const fresh = path.join(cleanupRoot, "tmp.fresh");
  fs.mkdirSync(path.join(fresh, "objects"), { recursive: true });
  fs.writeFileSync(path.join(fresh, "index"), "scratch index", "utf8");
  const fiveSecondsAgo = new Date(Date.now() - 5_000);
  for (const item of [fresh, path.join(fresh, "objects"), path.join(fresh, "index")]) {
    fs.utimesSync(item, fiveSecondsAgo, fiveSecondsAgo);
  }
  const unrelatedTemp = path.join(cleanupRoot, "tmp.unrelated");
  fs.mkdirSync(path.join(unrelatedTemp, "objects"), { recursive: true });
  const preserveFresh = runStop("Finish the task.", "Done.", false, {
    CEREBRAL_CODEX_GIT_TEMP_ROOT: cleanupRoot,
    CEREBRAL_CODEX_GIT_TEMP_STOP_WRITERS: "0",
  });
  assert.equal(preserveFresh.status, 0, preserveFresh.stderr);
  assert.equal(fs.existsSync(fresh), true, "Stop hook must preserve a fresh Git-temp database");
  assert.equal(fs.existsSync(unrelatedTemp), true, "Stop hook must preserve non-matching temporary directories");
  const cleanup = runStop("Finish the task.", "Done.", false, {
    CEREBRAL_CODEX_GIT_TEMP_ROOT: cleanupRoot,
    CEREBRAL_CODEX_GIT_TEMP_STOP_WRITERS: "0",
    CEREBRAL_CODEX_GIT_TEMP_MIN_AGE_SECONDS: "0",
  });
  assert.equal(cleanup.status, 0, cleanup.stderr);
  assert.equal(fs.existsSync(fresh), false, "Stop hook must remove an abandoned Git-temp database");
  const interrupted = path.join(cleanupRoot, "tmp.interrupted");
  fs.mkdirSync(path.join(interrupted, "objects"), { recursive: true });
  fs.writeFileSync(path.join(interrupted, "index.lock"), "scratch lock", "utf8");
  const recovery = runHook("Review the site typography.", {
    CEREBRAL_CODEX_GIT_TEMP_ROOT: cleanupRoot,
    CEREBRAL_CODEX_GIT_TEMP_STOP_WRITERS: "0",
    CEREBRAL_CODEX_GIT_TEMP_MIN_AGE_SECONDS: "0",
  });
  assert.equal(recovery.status, 0, recovery.stderr);
  assert.equal(fs.existsSync(interrupted), false, "next prompt must clean an interrupted Git-temp database");
} finally {
  fs.rmSync(cleanupRoot, { recursive: true, force: true });
}

const cleanArtifact = runPostTool("Edit", {
  file_path: path.join(root, "docs/visuals/2026-07-07-video-projects-routing.html"),
});
assert.equal(cleanArtifact.status, 0, `clean artifact check exited ${cleanArtifact.status}: ${cleanArtifact.stderr}`);
assert.doesNotMatch(cleanArtifact.stdout, /"continue": false/);

const tempDir = fs.mkdtempSync(path.join(root, ".writing-tells-test-"));
try {
  const blockedArtifactPath = path.join(tempDir, "review.md");
  fs.writeFileSync(blockedArtifactPath, "This is a robust plan.\n", "utf8");
  const blockedArtifact = runPostTool("Edit", { file_path: blockedArtifactPath });
  assert.equal(blockedArtifact.status, 0);
  assert.match(blockedArtifact.stdout, /"continue": false/);
  assert.match(blockedArtifact.stdout, /AI writing-tells check failed after the write/);

  const blockedPatch = runPostTool("apply_patch", {
    input: `*** Begin Patch\n*** Update File: ${blockedArtifactPath}\n@@\n`,
  });
  assert.equal(blockedPatch.status, 0);
  assert.match(blockedPatch.stdout, /"continue": false/);
  assert.match(blockedPatch.stdout, /AI writing-tells check failed after the write/);

  const blockedHtmlPath = path.join(tempDir, "review.html");
  fs.writeFileSync(blockedHtmlPath, "<p>This is a robust page.</p><script>const robust = true;</script>\n", "utf8");
  const blockedHtml = runPostTool("Write", { file_path: blockedHtmlPath });
  assert.equal(blockedHtml.status, 0);
  assert.match(blockedHtml.stdout, /"continue": false/);
  assert.match(blockedHtml.stdout, /AI writing-tells check failed after the write/);

  const sourceCodePath = path.join(tempDir, "source.tsx");
  fs.writeFileSync(sourceCodePath, "export const copy = 'robust';\n", "utf8");
  const sourceCode = runPostTool("Write", { file_path: sourceCodePath });
  assert.equal(sourceCode.status, 0);
  assert.equal(sourceCode.stdout.trim(), "", "source code must stay outside the writing gate");
} finally {
  fs.rmSync(tempDir, { recursive: true, force: true });
}

console.log(`Cerebral hook routing check passed: ${routes.length} natural prompts, ${routes.length} exact routes, 28 guards.`);
