import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const registry = JSON.parse(fs.readFileSync(path.join(root, "config/cerebral-registry.json"), "utf8"));
assert.equal(registry.version, 2);
assert.ok(Array.isArray(registry.routes) && registry.routes.length >= 12);
assert.ok(Array.isArray(registry.skills));
assert.ok(Array.isArray(registry.capabilities) && registry.capabilities.length >= 4);

for (const route of registry.routes) {
  for (const field of ["route_key", "trigger_patterns", "lane", "owner", "required_tools", "review_gate", "priority"]) {
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

const pluginSkills = fs.readdirSync("/Users/singleton23/plugins/s-systems/skills", { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && fs.existsSync(`/Users/singleton23/plugins/s-systems/skills/${entry.name}/SKILL.md`))
  .map((entry) => entry.name)
  .sort();
const catalogSkills = registry.skills.map((skill) => skill.skill_key).sort();
assert.deepEqual(catalogSkills, pluginSkills, "registry must classify every bundled SSystems skill");
assert.equal(registry.skills.filter((skill) => skill.activation === "core").length, 14);
assert.ok(registry.skills.every((skill) => skill.activation === "core" || skill.activation === "disabled"));

const disabledNames = [
  "s-systems:ad-creative-strategist",
  "s-systems:auto-logger",
  "s-systems:bear",
  "s-systems:content-creator",
  "s-systems:foundation-pass",
  "s-systems:instagram-curator",
  "s-systems:linkedin-content-creator",
  "s-systems:outbound-strategist",
  "s-systems:podcast-strategist",
  "s-systems:sales-outreach",
];
const codexConfig = fs.readFileSync("/Users/singleton23/.codex/config.toml", "utf8");
for (const name of disabledNames) {
  assert.match(codexConfig, new RegExp(`name = "${name}"\\nenabled = false`));
}

const migration = fs.readFileSync(path.join(root, "supabase/migrations/20260715000000_cerebral_registry.sql"), "utf8");
for (const table of ["cerebral_routes", "harness_capabilities", "harness_skills", "harness_verification_events"]) {
  assert.match(migration, new RegExp(`create table if not exists public\\.${table}`));
  assert.match(migration, new RegExp(`enable row level security`));
}
assert.match(migration, /for select/);
assert.doesNotMatch(migration, /for insert|for update|for delete/);

console.log(`Cerebral registry check passed: ${registry.routes.length} routes, ${registry.skills.length} skills, ${registry.capabilities.length} capabilities.`);
