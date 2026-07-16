import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const url = process.env.SUPABASE_URL?.replace(/\/$/, "");
const apiKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!url || !apiKey) {
  console.error("Set SUPABASE_URL plus SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY before live verification.");
  process.exit(1);
}

const expected = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), "config/cerebral-registry.json"), "utf8"),
);

async function select(table) {
  const response = await fetch(`${url}/rest/v1/${table}?select=*`, {
    headers: { apikey: apiKey, Authorization: `Bearer ${apiKey}` },
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
assert.equal(skills.filter((row) => row.activation === "core").length, 14);
console.log(`Live Cerebral registry verified: ${routes.length} routes, ${skills.length} skills, ${capabilities.length} capabilities.`);
