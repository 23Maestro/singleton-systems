import fs from "node:fs";
import path from "node:path";

const url = process.env.SUPABASE_URL?.replace(/\/$/, "");
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before seeding the Cerebral registry.");
  process.exit(1);
}

const registry = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), "config/cerebral-registry.json"), "utf8"),
);

async function upsert(table, rows, conflictKey) {
  const response = await fetch(`${url}/rest/v1/${table}?on_conflict=${conflictKey}`, {
    method: "POST",
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=representation",
    },
    body: JSON.stringify(rows),
  });
  if (!response.ok) {
    throw new Error(`${table}: ${response.status} ${await response.text()}`);
  }
  return response.json();
}

const routes = registry.routes.map(({ surface, ...route }) => ({ ...route, source_revision: "2026-07-16" }));
const skills = registry.skills.map((skill) => ({ ...skill, source_revision: "2026-07-16" }));
const capabilities = registry.capabilities;

const [seededRoutes, seededSkills, seededCapabilities] = await Promise.all([
  upsert("cerebral_routes", routes, "route_key"),
  upsert("harness_skills", skills, "skill_key"),
  upsert("harness_capabilities", capabilities, "capability_key"),
]);

console.log(
  `Seeded Cerebral registry: ${seededRoutes.length} routes, ${seededSkills.length} skills, ${seededCapabilities.length} capabilities.`,
);
