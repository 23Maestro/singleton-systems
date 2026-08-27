import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const hook = path.join(root, ".codex/hooks/cerebral_singleton_guard.py");
const python = process.env.PYTHON || "python3";

const registry = JSON.parse(fs.readFileSync(path.join(root, "config/cerebral-registry.json"), "utf8"));
const routes = registry.routes.filter((route) => route.enabled);

function runHook(prompt) {
  return spawnSync(python, [hook], {
    cwd: root,
    input: JSON.stringify({ hook_event_name: "UserPromptSubmit", cwd: root, prompt }),
    encoding: "utf8",
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

function runStop(prompt, lastAssistantMessage, stopHookActive = false) {
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
  });
}

for (const route of routes) {
  for (const prompt of [route.example_prompt, `[route] ${route.route_key}\nHandle this request.`]) {
    const result = runHook(prompt);
    assert.equal(result.status, 0, `${route.route_key}: hook exited ${result.status}: ${result.stderr}`);
    const must = [`[route] ${route.route_key}`, `[lane] ${route.lane}`, `[bucket] ${route.bucket}`, `[owner] ${route.owner}`, ...route.required_tools];
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
assert.ok(unrelated.stdout.length < 500, "unmatched prompts must not receive a large policy block");

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
    "Preserve transcript meaning, attribution, causal ownership",
    "Single-frame statement at 6.5 seconds",
    "Two-photo progression at 10 seconds",
    "100% to 102.5%",
    "One point has no pipe",
    "singleton-figma-system",
    ".agents/skills/singleton-figma-system/references/lineups-production-system.md",
    "football-visible Field Night background",
    "Episode cutouts require real alpha",
    "Only cutouts, logos, transcript copy, and reveal timing are replaceable",
    "Keep text and cutout bounds tight",
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

const cleanArtifact = runPostTool("Edit", {
  file_path: path.join(root, "docs/visuals/2026-08-04-ai-upgrade-wayfinder.html"),
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

console.log(`Cerebral hook routing check passed: ${routes.length} natural prompts, ${routes.length} exact routes, 17 guards.`);
