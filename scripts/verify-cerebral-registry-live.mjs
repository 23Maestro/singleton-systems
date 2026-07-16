import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const url = process.env.SUPABASE_URL?.replace(/\/$/, "");
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before live verification.");
  process.exit(1);
}

const expected = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), "config/cerebral-registry.json"), "utf8"),
);
const expectedRevision = expected.source_revision;
assert.ok(expectedRevision, "config/cerebral-registry.json is missing source_revision");

const timeoutMs = Number(process.env.CEREBRAL_REGISTRY_FETCH_TIMEOUT_MS || 10_000);

async function fetchWithTimeout(endpoint, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(endpoint, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

async function select(table) {
  const response = await fetchWithTimeout(`${url}/rest/v1/${table}?select=*`, {
    headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
  });
  if (!response.ok) throw new Error(`${table}: ${response.status} ${await response.text()}`);
  return response.json();
}

const [routes, skills, capabilities] = await Promise.all([
  select("cerebral_routes"),
  select("harness_skills"),
  select("harness_capabilities"),
]);

assert.deepEqual(new Set(routes.map((row) => row.route_key)), new Set(expected.routes.map((row) => row.route_key)));
assert.deepEqual(new Set(skills.map((row) => row.skill_key)), new Set(expected.skills.map((row) => row.skill_key)));
assert.deepEqual(new Set(capabilities.map((row) => row.capability_key)), new Set(expected.capabilities.map((row) => row.capability_key)));
const routeByKey = new Map(routes.map((row) => [row.route_key, row]));
for (const route of expected.routes) {
  const actual = routeByKey.get(route.route_key);
  assert.deepEqual(actual.trigger_patterns, route.trigger_patterns, `${route.route_key} trigger_patterns drifted`);
  assert.deepEqual(actual.required_tools, route.required_tools, `${route.route_key} required_tools drifted`);
  assert.equal(actual.lane, route.lane, `${route.route_key} lane drifted`);
  assert.equal(actual.owner, route.owner, `${route.route_key} owner drifted`);
  assert.equal(actual.priority, route.priority, `${route.route_key} priority drifted`);
  assert.equal(actual.enabled, route.enabled, `${route.route_key} enabled drifted`);
}

const skillByKey = new Map(skills.map((row) => [row.skill_key, row]));
for (const skill of expected.skills) {
  const actual = skillByKey.get(skill.skill_key);
  assert.equal(actual.activation, skill.activation, `${skill.skill_key} activation drifted`);
  assert.equal(actual.reason, skill.reason, `${skill.skill_key} reason drifted`);
}

const capabilityByKey = new Map(capabilities.map((row) => [row.capability_key, row]));
for (const capability of expected.capabilities) {
  const actual = capabilityByKey.get(capability.capability_key);
  assert.equal(actual.status, capability.status, `${capability.capability_key} status drifted`);
  assert.equal(actual.verification_command, capability.verification_command, `${capability.capability_key} verification_command drifted`);
}

const expectedCoreCount = expected.skills.filter((row) => row.activation === "core").length;
assert.equal(skills.filter((row) => row.activation === "core").length, expectedCoreCount);
assert.deepEqual(new Set([...routes, ...skills, ...capabilities].map((row) => row.source_revision)), new Set([expectedRevision]));
console.log(`Live Cerebral registry verified: ${routes.length} routes, ${skills.length} skills, ${capabilities.length} capabilities.`);
