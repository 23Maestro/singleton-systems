import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const registry = JSON.parse(fs.readFileSync(path.join(root, "config/cerebral-registry.json"), "utf8"));
const pluginRoot = registry.plugin.source_path;
const pluginSkillsRoot = path.join(pluginRoot, "skills");
assert.equal(registry.version, 3);
assert.ok(registry.source_revision, "registry must declare source_revision");
assert.equal(pluginRoot, "plugins/s-systems", "SSystems plugin source must stay repo-relative");
assert.equal(registry.plugin.id, "s-systems@singleton23-local");
assert.match(registry.plugin.verification_command, /s-systems@singleton23-local/);
assert.ok(Array.isArray(registry.routes) && registry.routes.length >= 16);
assert.ok(Array.isArray(registry.skills));
assert.ok(Array.isArray(registry.capabilities) && registry.capabilities.length >= 4);

const initiativeLanes = ["Development", "Content Editor", "AI Consultant", "Portfolio"];
const systemLanes = ["Writing Review", "System Maintenance"];
assert.deepEqual(registry.vocabulary.initiatives, initiativeLanes);
assert.deepEqual(registry.vocabulary.system_lanes, systemLanes);
const allowedLanes = new Set([...initiativeLanes, ...systemLanes]);
assert.deepEqual(registry.gate.review_states, ["not_required", "pending", "approved", "blocked"]);
assert.deepEqual(registry.gate.delivery_states, ["pending", "delivered", "failed"]);
assert.deepEqual(registry.gate.receipt_states, ["not_required", "recorded", "failed"]);
assert.deepEqual(registry.gate.required_delivery_fields, ["state", "owner", "recordId", "recordUrl", "error"]);

for (const route of registry.routes) {
  for (const field of ["route_key", "bucket", "trigger_patterns", "example_prompt", "lane", "owner", "required_tools", "review_gate", "priority"]) {
    assert.ok(route[field] !== undefined, `route missing ${field}`);
  }
  assert.ok(route.trigger_patterns.length > 0);
  assert.ok(route.required_tools.length > 0);
  assert.ok(allowedLanes.has(route.lane), `${route.route_key} uses unknown Lane ${route.lane}`);
  assert.notEqual(route.lane, "all_buckets", `${route.route_key} still uses Bucket vocabulary as a Lane`);
}
const clientVideoRoute = registry.routes.find((route) => route.route_key === "client-video");
assert.ok(clientVideoRoute.trigger_patterns.includes("lineups"), "client-video route must recognize Lineups prompts");
const contentEditorPrepRoute = registry.routes.find((route) => route.route_key === "client-content-editor-prep");
assert.ok(contentEditorPrepRoute, "registry must include the client content editor prep route");
assert.deepEqual(
  contentEditorPrepRoute.required_tools,
  ["s-systems:client-content-editor-prep", "s-systems:eagle"],
  "client content editor prep must pair its prep contract with Eagle",
);
assert.equal(new Set(registry.routes.map((route) => route.bucket)).size, registry.routes.length, "route buckets must be unique");

for (const capability of registry.capabilities) {
  for (const field of ["capability_key", "capability_type", "canonical_name", "status", "verification_command", "evidence"]) {
    assert.ok(capability[field], `capability missing ${field}`);
  }
}

for (const capabilityKey of ["homebrew", "pdf-skill"]) {
  const capability = registry.capabilities.find((item) => item.capability_key === capabilityKey);
  assert.equal(capability.status, "verify-on-use", `${capabilityKey} must be discovered on use`);
  assert.equal(capability.path, null, `${capabilityKey} must not store a machine/runtime path`);
}

const catalogSkills = registry.skills.map((skill) => skill.skill_key).sort();
if (fs.existsSync(pluginSkillsRoot)) {
  const pluginSkills = fs.readdirSync(pluginSkillsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && fs.existsSync(path.join(pluginSkillsRoot, entry.name, "SKILL.md")))
    .map((entry) => entry.name)
    .sort();
  assert.deepEqual(catalogSkills, pluginSkills, "registry must classify every bundled SSystems skill");
}
assert.equal(catalogSkills.length, 20, "registry must classify the 20 active SSystems skills");
assert.ok(registry.skills.every((skill) => skill.activation === "core"));

const skillNames = new Set(catalogSkills);
const allowedExternalTools = new Set([
  "design-canvas",
  "linear:linear",
  "paper-desktop:code-to-design",
  "supabase:supabase",
]);
for (const route of registry.routes) {
  for (const tool of route.required_tools) {
    if (tool.startsWith("s-systems:")) {
      const skillName = tool.replace(/^s-systems:/, "") === "eagle"
        ? "eagle-skill"
        : tool.replace(/^s-systems:/, "");
      assert.ok(skillNames.has(skillName), `${route.route_key} requires missing SSystems skill ${tool}`);
    } else {
      assert.ok(allowedExternalTools.has(tool), `${route.route_key} requires unclassified external tool ${tool}`);
    }
  }
}

for (const skill of catalogSkills) {
  const text = fs.readFileSync(path.join(pluginSkillsRoot, skill, "SKILL.md"), "utf8");
  assert.doesNotMatch(text, /\]\(\.\.\/\.\.\/\.\.\/docs\//, `${skill} must reference repo docs by canonical path`);
}

const sourceContractFiles = [
  "config/cerebral-registry.json",
  "docs/harness/README.md",
  "docs/integration-map.md",
  "plugins/s-systems/README.md",
  ...catalogSkills.map((skill) => path.join(pluginSkillsRoot, skill, "SKILL.md")),
];
for (const file of sourceContractFiles) {
  const text = fs.readFileSync(path.join(root, file), "utf8");
  assert.doesNotMatch(text, /\/Users\/singleton23\/plugins\/s-systems/, `${file} must not point at the legacy machine-local source`);
  assert.doesNotMatch(text, /Prospect Pipeline.*canonical|canonical.*Prospect Pipeline/i, `${file} must not make Prospect Pipeline canonical for SSystems`);
}

const pluginCapability = registry.capabilities.find((item) => item.capability_key === "s-systems-plugin");
assert.equal(pluginCapability.path, "plugins/s-systems", "SSystems capability path must stay canonical");
assert.equal(pluginCapability.status, "verify-on-use", "SSystems plugin install must be verified on use");
assert.match(pluginCapability.evidence, /versioned repo source is canonical/);

const migration = fs.readFileSync(path.join(root, "supabase/migrations/20260715000000_cerebral_registry.sql"), "utf8");
for (const table of ["cerebral_routes", "harness_capabilities", "harness_skills", "harness_verification_events"]) {
  assert.match(migration, new RegExp(`create table if not exists public\\.${table}`));
  assert.match(migration, new RegExp(`alter table public\\.${table} enable row level security`));
  assert.match(migration, new RegExp(`on public\\.${table} for select`));
}
assert.match(migration, /for select/);
assert.doesNotMatch(migration, /for insert|for update|for delete/);

const laneMigration = fs.readFileSync(path.join(root, "supabase/migrations/20260822222607_harden_cerebral_lane_vocabulary.sql"), "utf8");
for (const lane of allowedLanes) assert.match(laneMigration, new RegExp(lane));
assert.match(laneMigration, /'writing-review'/);
assert.doesNotMatch(laneMigration, /all_buckets/);

const skillPathMigration = fs.readFileSync(
  path.join(root, "supabase/migrations/20260902003000_add_canonical_skill_paths.sql"),
  "utf8",
);
assert.match(skillPathMigration, /canonical_path text\s+generated always as/);
assert.match(skillPathMigration, /plugins\/s-systems\/skills/);
assert.match(skillPathMigration, /to anon, authenticated/);

const deliveryOutcome = fs.readFileSync(path.join(root, "lib/delivery-outcome.ts"), "utf8");
for (const state of [...registry.gate.delivery_states, ...registry.gate.receipt_states]) {
  assert.match(deliveryOutcome, new RegExp(`"${state}"`), `delivery outcome missing ${state}`);
}
for (const field of registry.gate.required_delivery_fields) {
  assert.match(deliveryOutcome, new RegExp(`${field}:`), `delivery outcome missing ${field}`);
}
for (const file of ["app/api/ai-intake/route.ts", "app/api/linear/inbox/route.ts"]) {
  const text = fs.readFileSync(path.join(root, file), "utf8");
  assert.match(text, /@\/lib\/delivery-outcome/, `${file} must use the shared delivery outcome`);
}

console.log(`Cerebral registry check passed: ${registry.routes.length} routes, ${registry.skills.length} skills, ${registry.capabilities.length} capabilities.`);
