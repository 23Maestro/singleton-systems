import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const registry = JSON.parse(fs.readFileSync(path.join(root, "config/cerebral-registry.json"), "utf8"));
const pluginRoot = registry.plugin.source_path;
const pluginSkillsRoot = path.join(pluginRoot, "skills");
assert.equal(registry.version, 2);
assert.ok(registry.source_revision, "registry must declare source_revision");
assert.ok(Array.isArray(registry.routes) && registry.routes.length >= 12);
assert.ok(Array.isArray(registry.skills));
assert.ok(Array.isArray(registry.capabilities) && registry.capabilities.length >= 4);

for (const route of registry.routes) {
    for (const field of ["route_key", "trigger_patterns", "example_prompt", "lane", "owner", "required_tools", "review_gate", "priority"]) {
    assert.ok(route[field] !== undefined, `route missing ${field}`);
  }
  assert.ok(route.trigger_patterns.length > 0);
  assert.ok(route.required_tools.length > 0);
}

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
assert.ok(registry.skills.every((skill) => skill.activation === "core"));

for (const skill of catalogSkills) {
  const text = fs.readFileSync(path.join(pluginSkillsRoot, skill, "SKILL.md"), "utf8");
  assert.doesNotMatch(text, /\]\(\.\.\/\.\.\/\.\.\/docs\//, `${skill} must reference repo docs by canonical path`);
}

const migration = fs.readFileSync(path.join(root, "supabase/migrations/20260715000000_cerebral_registry.sql"), "utf8");
for (const table of ["cerebral_routes", "harness_capabilities", "harness_skills", "harness_verification_events"]) {
  assert.match(migration, new RegExp(`create table if not exists public\\.${table}`));
  assert.match(migration, new RegExp(`alter table public\\.${table} enable row level security`));
  assert.match(migration, new RegExp(`on public\\.${table} for select`));
}
assert.match(migration, /for select/);
assert.doesNotMatch(migration, /for insert|for update|for delete/);

console.log(`Cerebral registry check passed: ${registry.routes.length} routes, ${registry.skills.length} skills, ${registry.capabilities.length} capabilities.`);
