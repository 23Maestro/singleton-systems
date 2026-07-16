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

const sourceRevision = "2026-07-16";
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

async function seedRegistry() {
  const response = await fetchWithTimeout(`${url}/rest/v1/rpc/seed_cerebral_registry`, {
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
    throw new Error(`seed_cerebral_registry: ${response.status} ${await response.text()}`);
  }
  return response.json();
}

const [seeded] = await seedRegistry();

console.log(
  `Seeded Cerebral registry: ${seeded.routes_count} routes, ${seeded.skills_count} skills, ${seeded.capabilities_count} capabilities.`,
);
