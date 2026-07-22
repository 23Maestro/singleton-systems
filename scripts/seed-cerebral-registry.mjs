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

const [seeded] = await seedRegistry();
const [routesRemoved, skillsRemoved, capabilitiesRemoved] = await Promise.all([
  deleteRetired("cerebral_routes", "route_key", registry.routes.map((route) => route.route_key)),
  deleteRetired("harness_skills", "skill_key", registry.skills.map((skill) => skill.skill_key)),
  deleteRetired("harness_capabilities", "capability_key", registry.capabilities.map((capability) => capability.capability_key)),
]);

console.log(
  `Seeded Cerebral registry: ${seeded.routes_count} routes, ${seeded.skills_count} skills, ${seeded.capabilities_count} capabilities; pruned ${routesRemoved}/${skillsRemoved}/${capabilitiesRemoved}.`,
);
