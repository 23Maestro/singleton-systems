import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const agents = fs.readFileSync(path.join(root, "AGENTS.md"), "utf8");
const codex = fs.readFileSync(path.join(root, "CODEX.md"), "utf8");
const words = agents.trim().split(/\s+/).length;

assert.ok(words <= 300, `AGENTS.md has ${words} words; maximum is 300`);
assert.match(agents, /`CODEX\.md`/, "AGENTS.md must point to the canonical repository guide");

for (const reference of [
  "CONTEXT.md",
  "docs/agents/domain.md",
  "docs/agents/issue-tracker.md",
  "docs/agents/triage-labels.md",
]) {
  assert.ok(codex.includes(reference), `CODEX.md must own the startup reference to ${reference}`);
}
for (const command of [
  "npm run check:cerebral",
  "npm run check:cerebral:registry",
  "npm run check:cerebral:hook-routing",
]) {
  assert.ok(codex.includes(command), `CODEX.md must own ${command}`);
}

console.log(`Agent guidance check passed: AGENTS.md is a ${words}-word routing entrypoint; durable rules remain in CODEX.md.`);

const writing = fs.readFileSync(path.join(root, "docs/harness/writing-rules.md"), "utf8");
const payload = writing.split("## Hook payload")[1]?.split("```text")[1]?.split("```")[0];
assert.ok(payload, "writing rules must own the shared hook payload");
for (const phrase of ["Task descriptions are for Jerami", "comments on that task", "subtask names and descriptions brief and plain"]) {
  assert.ok(payload.includes(phrase), `shared writing payload must retain: ${phrase}`);
}
for (const app of ["Linear", "Asana"]) {
  assert.match(writing, new RegExp(`\\| ${app} \\| [^\\n]*comments`), `${app} must use task comments for deeper notes`);
}
