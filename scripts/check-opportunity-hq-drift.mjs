import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const registry = JSON.parse(fs.readFileSync(path.join(root, "config/cerebral-registry.json"), "utf8"));
const pluginRoot = process.env.SYSTEMS_PLUGIN_ROOT || registry.plugin.source_path;
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const skill = (name) => read(path.join(pluginRoot, "skills", name, "SKILL.md"));
const initiatives = "Development | Content Editor | AI Consultant | Portfolio";
const systemLanes = "Writing Review | System Maintenance";
const updater = skill("opportunity-hq-updater");

// Lane vocabulary is the initiative set: initiative = durable business lane.
assert.match(read("docs/harness/README.md"), new RegExp(`\\[lane\\] ${initiatives}`));
assert.match(read("docs/harness/README.md"), new RegExp(`\\[system lane\\] ${systemLanes}`));
assert.ok(registry.routes.every((route) => route.lane !== "all_buckets"));

// Lane task state must stay in Linear or Asana. Opportunity HQ is retired.
const retired = registry.routes.filter((route) => /opportunity hq/i.test(route.owner ?? ""));
assert.equal(retired.length, 0, `routes still owned by Opportunity HQ: ${retired.map((r) => r.route_key).join(", ")}`);
const staleLinearRoutes = registry.routes.filter(
  (route) => ["AI Consultant", "Content Editor"].includes(route.lane) && route.owner === "Linear",
);
assert.equal(staleLinearRoutes.length, 0, `AI or editor routes still owned by Linear: ${staleLinearRoutes.map((r) => r.route_key).join(", ")}`);
for (const route of registry.routes.filter((item) => item.owner === "Asana")) {
  const expectedProject = route.lane === "AI Consultant" ? "AI Consulting" : "Content Editor";
  assert.equal(route.project, expectedProject, `${route.route_key} uses the wrong Asana project`);
}

assert.match(skill("cerebral-router"), /Development task and project state -> Linear/);
assert.match(skill("cerebral-router"), /AI Consulting and Content Editor task state -> Asana/);
assert.match(skill("cerebral-router"), /The dashboard reads owner state and opens owner links\./);

assert.match(updater, new RegExp(`initiative: ${initiatives}`));
assert.match(updater, /Linear owns Development task state\. Asana owns AI Consulting and Content Editor\s+task state\./);
assert.match(updater, /A lead does not\s+receive a Task until real delivery work is selected\./);
assert.match(updater, /exactly three blocks/);

// Notion is demoted to Clients and Portfolio only, still via ntn.
assert.match(updater, /`\/opt\/homebrew\/bin\/ntn`/);
assert.match(updater, /for Notion, `ntn` is the\s+sole runtime route/);
assert.match(updater, /A Client record never carries task status/);
assert.match(updater, /Portfolio records still live in Notion pending migration/);

// Completion is a task-state change, not a Notion deletion.
assert.doesNotMatch(updater, /move the page to Notion Trash/);
assert.match(updater, /Completion is a task-state change\./);

console.log(`Task contract check passed: ${initiatives}`);
