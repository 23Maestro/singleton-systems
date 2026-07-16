import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

// Self-contained structural/referential-integrity checks for config/cerebral-registry.json and
// its two Supabase migrations. Unlike check-cerebral-registry.mjs (which cross-checks the live
// plugin skills directory and ~/.codex/config.toml on the author's machine), everything here is
// derived only from files inside this repository so it can run in any environment.

const root = process.cwd();
const registry = JSON.parse(fs.readFileSync(path.join(root, "config/cerebral-registry.json"), "utf8"));

assert.equal(registry.version, 2);
assert.ok(registry.plugin && typeof registry.plugin.id === "string" && registry.plugin.id.length > 0);
assert.ok(Array.isArray(registry.routes) && registry.routes.length > 0);
assert.ok(Array.isArray(registry.skills) && registry.skills.length > 0);
assert.ok(Array.isArray(registry.capabilities) && registry.capabilities.length > 0);

// --- Uniqueness -------------------------------------------------------------------------------

function assertUniqueKeys(items, field, label) {
  const keys = items.map((item) => item[field]);
  assert.equal(new Set(keys).size, keys.length, `${label} must have unique ${field} values`);
}

assertUniqueKeys(registry.routes, "route_key", "routes");
assertUniqueKeys(registry.skills, "skill_key", "skills");
assertUniqueKeys(registry.capabilities, "capability_key", "capabilities");

// --- Route shape -------------------------------------------------------------------------------

const requiredRouteFields = [
  "route_key", "trigger_patterns", "surface", "lane", "owner", "intent",
  "shape", "required_tools", "review_gate", "priority", "enabled",
];

for (const route of registry.routes) {
  for (const field of requiredRouteFields) {
    assert.ok(field in route, `route ${route.route_key} missing ${field}`);
  }
  assert.ok(Array.isArray(route.trigger_patterns) && route.trigger_patterns.length > 0, `${route.route_key} needs trigger_patterns`);
  assert.ok(Array.isArray(route.required_tools) && route.required_tools.length > 0, `${route.route_key} needs required_tools`);
  assert.equal(typeof route.priority, "number", `${route.route_key} priority must be numeric`);
  assert.equal(typeof route.enabled, "boolean", `${route.route_key} enabled must be boolean`);

  for (const trigger of route.trigger_patterns) {
    assert.doesNotThrow(() => new RegExp(trigger, "i"), `${route.route_key} has an invalid trigger pattern: ${trigger}`);
  }
}

// --- Skills ------------------------------------------------------------------------------------

for (const skill of registry.skills) {
  assert.ok(["core", "disabled"].includes(skill.activation), `${skill.skill_key} has an invalid activation value`);
  assert.ok(typeof skill.reason === "string" && skill.reason.length > 0, `${skill.skill_key} needs a reason`);
}

const coreSkillCount = registry.skills.filter((skill) => skill.activation === "core").length;
assert.equal(coreSkillCount, 14, "expected exactly 14 core skills");

// --- Referential integrity: every route's required_tools must resolve to a core skill --------
// (Some tools are exposed under an alias different from their skill_key, e.g. eagle-skill is
// exposed as `s-systems:eagle`; those aliases are declared in the skill's own reason field.)

const aliasPattern = /exposed as (s-systems:[a-z0-9-]+)/i;
const resolvableTools = new Set();
for (const skill of registry.skills) {
  if (skill.activation === "core") {
    resolvableTools.add(`s-systems:${skill.skill_key}`);
  }
  const aliasMatch = skill.reason.match(aliasPattern);
  if (aliasMatch) {
    resolvableTools.add(aliasMatch[1]);
  }
}

for (const route of registry.routes) {
  for (const tool of route.required_tools) {
    if (tool.startsWith("s-systems:")) {
      assert.ok(
        resolvableTools.has(tool),
        `route ${route.route_key} requires ${tool}, which is not a core skill or documented alias`,
      );
    }
  }
}

// --- Capabilities --------------------------------------------------------------------------

const requiredCapabilityFields = [
  "capability_key", "capability_type", "canonical_name", "status", "verification_command", "evidence",
];
for (const capability of registry.capabilities) {
  for (const field of requiredCapabilityFields) {
    assert.ok(capability[field], `capability ${capability.capability_key} missing ${field}`);
  }
}

for (const capabilityKey of ["homebrew", "pdf-skill", "repo-npm-binary"]) {
  const capability = registry.capabilities.find((item) => item.capability_key === capabilityKey);
  assert.ok(capability, `expected capability ${capabilityKey} to exist`);
  assert.equal(capability.status, "verify-on-use", `${capabilityKey} must be discovered on use, not hardcoded`);
}

const pluginCapability = registry.capabilities.find((item) => item.capability_key === "s-systems-plugin");
assert.equal(pluginCapability.installed, true);
assert.equal(pluginCapability.status, "verified");
assert.equal(pluginCapability.path, registry.plugin.source_path);

// --- Cross-check against the SQL migrations -------------------------------------------------

const createMigration = fs.readFileSync(
  path.join(root, "supabase/migrations/20260715000000_cerebral_registry.sql"),
  "utf8",
);
const seedMigration = fs.readFileSync(
  path.join(root, "supabase/migrations/20260716013000_seed_cerebral_registry.sql"),
  "utf8",
);

const routeColumns = [
  "route_key", "trigger_patterns", "lane", "owner", "intent", "shape",
  "required_tools", "review_gate", "priority", "enabled", "source_revision",
];
for (const column of routeColumns) {
  assert.match(createMigration, new RegExp(`\\b${column}\\b`), `cerebral_routes table is missing column ${column}`);
}

for (const route of registry.routes) {
  assert.ok(seedMigration.includes(`'${route.route_key}'`), `seed migration is missing route ${route.route_key}`);
}
for (const skill of registry.skills) {
  assert.ok(seedMigration.includes(`'${skill.skill_key}'`), `seed migration is missing skill ${skill.skill_key}`);
}
for (const capability of registry.capabilities) {
  assert.ok(seedMigration.includes(`'${capability.capability_key}'`), `seed migration is missing capability ${capability.capability_key}`);
}

console.log(
  `Cerebral registry schema check passed: ${registry.routes.length} routes, `
  + `${registry.skills.length} skills, ${registry.capabilities.length} capabilities cross-checked.`,
);