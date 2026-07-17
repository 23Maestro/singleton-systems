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

for (const route of routes) {
  for (const prompt of [route.example_prompt, `[route] ${route.route_key}\nHandle this request.`]) {
    const result = runHook(prompt);
    assert.equal(result.status, 0, `${route.route_key}: hook exited ${result.status}: ${result.stderr}`);
    const must = [`[route] ${route.route_key}`, `[lane] ${route.lane}`, `[owner] ${route.owner}`, ...route.required_tools];
    for (const snippet of must) {
      assert.match(result.stdout, new RegExp(snippet.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), `${route.route_key}: missing ${snippet}`);
    }
  }
}

const preflight = runHook("Can you use the PDF tool to inspect this file?");
assert.equal(preflight.status, 0);
for (const snippet of ["[preflight]", "[registry]"]) {
  assert.match(preflight.stdout, new RegExp(snippet.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), `preflight: missing ${snippet}`);
}

const unknownRoute = runHook("[route] imaginary-route\nDo something.");
assert.equal(unknownRoute.status, 0);
assert.match(unknownRoute.stdout, /\[route-error\] Unknown or disabled route: imaginary-route/);

const offerPacket = runHook(`[route] offer-content
[shape] working-brief
[tools] s-systems:offer-proof-content
[query] Turn this creator reference into a proof-led content angle.`);
assert.equal(offerPacket.status, 0);
for (const snippet of [
  "[route] offer-content",
  "[shape] working-brief",
  "[tools] s-systems:offer-proof-content",
  "[query] Turn this creator reference into a proof-led content angle.",
  "[tool-check] Requested tool belongs to this route.",
]) {
  assert.match(offerPacket.stdout, new RegExp(snippet.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), `offer packet: missing ${snippet}`);
}

const wrongToolPacket = runHook(`[route] offer-content
[tools] s-systems:freelance-gig-proposals
[query] Turn this creator reference into a proof-led content angle.`);
assert.equal(wrongToolPacket.status, 0);
assert.match(wrongToolPacket.stdout, /\[route-error\] Requested tool does not belong to offer-content: s-systems:freelance-gig-proposals/);

const unrelated = runHook("Review the site typography.");
assert.equal(unrelated.status, 0);
assert.doesNotMatch(unrelated.stdout, /s-systems:freelance-gig-proposals/);
assert.match(unrelated.stdout, /\[next\] No specialized route matched/);
assert.ok(unrelated.stdout.length < 500, "unmatched prompts must not receive a large policy block");

console.log(`Cerebral hook routing check passed: ${routes.length} natural prompts, ${routes.length} exact routes, 4 guards.`);
