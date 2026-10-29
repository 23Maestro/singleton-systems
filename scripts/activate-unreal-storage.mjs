import assert from "node:assert/strict";
import fs from "node:fs";
import { pathToFileURL } from "node:url";

export function activationPacket(root = process.cwd()) {
  const registry = JSON.parse(fs.readFileSync(`${root}/config/cerebral-registry.json`, "utf8"));
  const skill = registry.skills.find((row) => row.skill_key === "unreal-storage");
  const route = registry.routes.find((row) => row.route_key === "unreal-storage");
  assert.ok(skill && route, "Unreal storage must exist in the source registry.");
  assert.ok(fs.existsSync(`${root}/plugins/s-systems/skills/unreal-storage/SKILL.md`), "The canonical Unreal skill is missing.");
  const fields = new Set(["route_key", "trigger_patterns", "lane", "owner", "intent", "shape", "required_tools", "review_gate", "priority", "enabled", "surface"]);
  return {
    skill: { ...skill, canonical_path: "plugins/s-systems/skills/unreal-storage", source_revision: registry.source_revision },
    route: { ...Object.fromEntries(Object.entries(route).filter(([field]) => fields.has(field))), source_revision: registry.source_revision },
  };
}

export async function applyPacket(packet, { url, key, request = fetch }) {
  assert.ok(url && key, "Supabase server credentials are required.");
  const headers = { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" };
  for (const [table, keyField, wanted] of [["harness_skills", "skill_key", packet.skill], ["cerebral_routes", "route_key", packet.route]]) {
    const endpoint = `${url.replace(/\/$/, "")}/rest/v1/${table}`;
    const written = await request(`${endpoint}?on_conflict=${keyField}`, {
      method: "POST", headers: { ...headers, Prefer: "resolution=merge-duplicates,return=representation" },
      body: JSON.stringify([wanted]), signal: AbortSignal.timeout(20000),
    });
    assert.ok(written.ok, `${table} write failed: HTTP ${written.status}`);
    const response = await request(`${endpoint}?${new URLSearchParams({ [keyField]: `eq.${wanted[keyField]}`, select: "*" })}`, { headers, signal: AbortSignal.timeout(20000) });
    assert.ok(response.ok, `${table} readback failed: HTTP ${response.status}`);
    const rows = await response.json();
    assert.equal(rows.length, 1, `${table} must have exactly one matching row`);
    for (const [field, value] of Object.entries(wanted)) assert.deepEqual(rows[0][field], value, `${table}.${field} differs`);
  }
  return { outcome: "verified", route: "unreal-storage", skill: "unreal-storage" };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = process.argv.slice(2);
  assert.ok(args.length === 0 || (args.length === 1 && args[0] === "--apply"), "Use --apply or no flags.");
  const packet = activationPacket();
  console.log(JSON.stringify(args.includes("--apply")
    ? await applyPacket(packet, { url: process.env.SUPABASE_URL, key: process.env.SUPABASE_SERVICE_ROLE_KEY })
    : { outcome: "preview", packet }, null, 2));
}
