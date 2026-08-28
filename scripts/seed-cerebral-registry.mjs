import fs from "node:fs";
import path from "node:path";
import { linkedQuery, quoteJsonb } from "./lib/supabase-linked-cli.mjs";

const url = process.env.SUPABASE_URL?.replace(/\/$/, "");
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const linkedCli = process.argv.slice(2).includes("--linked-cli");

if (process.argv.slice(2).some((argument) => argument !== "--linked-cli")) {
  console.error("Usage: node scripts/seed-cerebral-registry.mjs [--linked-cli]");
  process.exit(1);
}

if (!linkedCli && (!url || !serviceKey)) {
  console.error("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY, or pass --linked-cli explicitly.");
  process.exit(1);
}

const registry = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), "config/cerebral-registry.json"), "utf8"),
);

const sourceRevision = registry.source_revision;
if (!sourceRevision) {
  console.error("config/cerebral-registry.json is missing source_revision.");
  process.exit(1);
}
const timeoutMs = Number(process.env.CEREBRAL_REGISTRY_FETCH_TIMEOUT_MS || 10_000);
if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
  console.error("CEREBRAL_REGISTRY_FETCH_TIMEOUT_MS must be a positive number.");
  process.exit(1);
}

async function fetchWithTimeout(endpoint, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(endpoint, { ...options, signal: controller.signal });
    const body = await response.text();
    return { response, body };
  } finally {
    clearTimeout(timeout);
  }
}

async function seedRegistry() {
  const { response, body } = await fetchWithTimeout(`${url}/rest/v1/rpc/seed_cerebral_registry`, {
    method: "POST",
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      p_routes: registry.routes.map(({ surface, ...route }) => route),
      p_skills: registry.skills,
      p_capabilities: registry.capabilities,
      p_source_revision: sourceRevision,
    }),
  });
  if (!response.ok) {
    throw new Error(`seed_cerebral_registry: ${response.status} ${body}`);
  }
  return JSON.parse(body);
}

function activeKeys(field, rows) {
  return rows.map((row) => row[field]);
}

function seedWithLinkedCli() {
  const routes = registry.routes.map(({ surface, ...route }) => route);
  const routeKeys = activeKeys("route_key", routes);
  const skillKeys = activeKeys("skill_key", registry.skills);
  const capabilityKeys = activeKeys("capability_key", registry.capabilities);
  const sourceRevisionSql = `${quoteJsonb(sourceRevision, "revision")} #>> '{}'`;
  const sql = `
with seeded as materialized (
  select * from public.seed_cerebral_registry(
    ${quoteJsonb(routes, "routes")},
    ${quoteJsonb(registry.skills, "skills")},
    ${quoteJsonb(registry.capabilities, "capabilities")},
    ${sourceRevisionSql}
  )
),
routes_removed as (
  delete from public.cerebral_routes
  where route_key not in (
    select jsonb_array_elements_text(${quoteJsonb(routeKeys, "route_keys")})
  )
  returning 1
),
skills_removed as (
  delete from public.harness_skills
  where skill_key not in (
    select jsonb_array_elements_text(${quoteJsonb(skillKeys, "skill_keys")})
  )
  returning 1
),
capabilities_removed as (
  delete from public.harness_capabilities
  where capability_key not in (
    select jsonb_array_elements_text(${quoteJsonb(capabilityKeys, "capability_keys")})
  )
  returning 1
)
select
  seeded.routes_count,
  seeded.skills_count,
  seeded.capabilities_count,
  (select count(*)::int from routes_removed) as routes_removed,
  (select count(*)::int from skills_removed) as skills_removed,
  (select count(*)::int from capabilities_removed) as capabilities_removed
from seeded;
`;
  const [result] = linkedQuery(sql);
  if (!result) throw new Error("Supabase CLI seed returned no result");
  return result;
}

async function deleteRetired(table, key, activeKeys) {
  const filter = `not.in.(${activeKeys.join(",")})`;
  const { response, body } = await fetchWithTimeout(
    `${url}/rest/v1/${table}?${key}=${encodeURIComponent(filter)}`,
    {
      method: "DELETE",
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        Prefer: "return=representation",
      },
    },
  );
  if (!response.ok) throw new Error(`${table} prune: ${response.status} ${body}`);
  return JSON.parse(body).length;
}

let seeded;
let routesRemoved;
let skillsRemoved;
let capabilitiesRemoved;

if (linkedCli) {
  const result = seedWithLinkedCli();
  seeded = result;
  routesRemoved = result.routes_removed;
  skillsRemoved = result.skills_removed;
  capabilitiesRemoved = result.capabilities_removed;
} else {
  [seeded] = await seedRegistry();
  [routesRemoved, skillsRemoved, capabilitiesRemoved] = await Promise.all([
    deleteRetired("cerebral_routes", "route_key", registry.routes.map((route) => route.route_key)),
    deleteRetired("harness_skills", "skill_key", registry.skills.map((skill) => skill.skill_key)),
    deleteRetired("harness_capabilities", "capability_key", registry.capabilities.map((capability) => capability.capability_key)),
  ]);
}

console.log(
  `Seeded Cerebral registry: ${seeded.routes_count} routes, ${seeded.skills_count} skills, ${seeded.capabilities_count} capabilities; pruned ${routesRemoved}/${skillsRemoved}/${capabilitiesRemoved}.`,
);
