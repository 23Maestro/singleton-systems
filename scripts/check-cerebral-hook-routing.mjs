import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import path from "node:path";

const root = process.cwd();
const hook = path.join(root, ".codex/hooks/cerebral_singleton_guard.py");

const cases = [
  {
    name: "Upwork routes to Freelance",
    prompt: "Help me write an Upwork proposal for this freelance client post.",
    must: ["[surface] proposal", "[lane] Freelance", "s-systems:freelance-gig-proposals", "Final Human Pass"],
  },
  {
    name: "SSystems routes to tool harness",
    prompt: "The SSystems tool harness says the plugin is not installed on path.",
    must: ["[surface] skill / hook routing", "s-systems:tool-harness", "[preflight]", "[registry]"],
  },
  {
    name: "PDF capability is preflighted",
    prompt: "Can you use the PDF tool to inspect this file?",
    must: ["[preflight]", "[registry]"],
  },
  {
    name: "Direct outreach routes to agency growth",
    prompt: "Build a cold email sequence for this direct B2B lead.",
    must: ["[surface] outreach", "s-systems:agency-growth", "Final Human Pass"],
  },
  {
    name: "Applications route to the resume skill",
    prompt: "Tailor my resume for this job application.",
    must: ["[lane] Career Jobs", "s-systems:job-application-resume"],
  },
  {
    name: "Proof routes to Eagle and proof packaging",
    prompt: "Turn this Eagle proof asset into a portfolio block.",
    must: ["[owner] Eagle", "s-systems:career-proof-packager", "s-systems:eagle"],
  },
  {
    name: "Planning routes to the planning skill",
    prompt: "This raw workflow idea is a someday research lead.",
    must: ["s-systems:planning-idea-routing"],
  },
  {
    name: "Visualization routes to the visualizer",
    prompt: "Update the LikeC4 architecture map.",
    must: ["s-systems:singleton-visualizer"],
  },
];

for (const testCase of cases) {
  const result = spawnSync("/usr/bin/python3", [hook], {
    cwd: root,
    input: JSON.stringify({ hook_event_name: "UserPromptSubmit", cwd: root, prompt: testCase.prompt }),
    encoding: "utf8",
  });
  assert.equal(result.status, 0, `${testCase.name}: hook exited ${result.status}: ${result.stderr}`);
  for (const snippet of testCase.must) {
    assert.match(result.stdout, new RegExp(snippet.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), `${testCase.name}: missing ${snippet}`);
  }
}

const unrelated = spawnSync("/usr/bin/python3", [hook], {
  cwd: root,
  input: JSON.stringify({ hook_event_name: "UserPromptSubmit", cwd: root, prompt: "Review the site typography." }),
  encoding: "utf8",
});
assert.equal(unrelated.status, 0);
assert.doesNotMatch(unrelated.stdout, /s-systems:freelance-gig-proposals/);
assert.match(unrelated.stdout, /\[next\] No specialized route matched/);
assert.ok(unrelated.stdout.length < 500, "unmatched prompts must not receive a large policy block");

console.log(`Cerebral hook routing check passed: ${cases.length + 1} fixtures.`);
