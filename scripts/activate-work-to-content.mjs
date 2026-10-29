import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { repoSkillRows } from "./lib/repo-skill-registry.mjs";

export function activationPacket(root) {
  const registry = JSON.parse(fs.readFileSync(path.join(root, "config/cerebral-registry.json"), "utf8"));
  const routes = registry.routes.filter((row) => row.route_key === "work-to-content");
  const skills = repoSkillRows(root, registry.skills).filter((row) => row.canonical_path.startsWith("plugins/work-to-content/skills/"));
  const capabilities = registry.capabilities.filter((row) => row.capability_key === "work-to-content-plugin");
  assert.equal(routes.length, 1, "expected one content route");
  assert.equal(skills.length, 2, "expected the router and OpenScreen skill");
  assert.equal(capabilities.length, 1, "expected one plugin capability");
  return { routes, skills, capabilities, sourceRevision: registry.source_revision };
}

export async function applyPacket(packet, { url, key, request = fetch }) {
  assert.ok(url && key, "Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
  const base = url.replace(/\/$/, "");
  const headers = { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" };
  async function call(endpoint, options = {}) {
    const response = await request(`${base}/rest/v1/${endpoint}`, { ...options, headers: { ...headers, ...options.headers }, signal: AbortSignal.timeout(20000) });
    if (!response.ok) throw new Error(`Registry request failed: HTTP ${response.status}`);
    return response.json();
  }
  const routeFields = new Set(["route_key", "trigger_patterns", "lane", "owner", "intent", "shape", "required_tools", "review_gate", "priority", "enabled", "surface", "project"]);
  const groups = [
    ["harness_skills", "skill_key", packet.skills],
    ["harness_capabilities", "capability_key", packet.capabilities],
    // Publish the route only after the skill and capability readbacks pass.
    ["cerebral_routes", "route_key", packet.routes.map((row) => Object.fromEntries(Object.entries(row).filter(([field]) => routeFields.has(field))))],
  ];
  for (const [table, keyField, sourceRows] of groups) {
    const expected = sourceRows.map((row) => ({ ...row, source_revision: packet.sourceRevision }));
    await call(`${table}?on_conflict=${keyField}`, { method: "POST", headers: { Prefer: "resolution=merge-duplicates,return=representation" }, body: JSON.stringify(expected) });
    const query = new URLSearchParams({ [keyField]: `in.(${expected.map((row) => row[keyField]).join(",")})`, select: "*" });
    const rows = await call(`${table}?${query}`);
    assert.equal(rows.length, expected.length, `${table}: readback count differs`);
    for (const wanted of expected) {
      const actual = rows.find((row) => row[keyField] === wanted[keyField]);
      assert.ok(actual, `${table}: missing ${wanted[keyField]}`);
      for (const [field, value] of Object.entries(wanted)) {
        assert.deepEqual(actual[field], value, `${table}: readback differs for ${wanted[keyField]}.${field}`);
      }
    }
  }
  return { outcome: "verified", route: "work-to-content", skills: packet.skills.map((row) => row.skill_key) };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const args = process.argv.slice(2);
  if (args.some((arg) => arg !== "--apply") || args.length > 1) {
    throw new Error("Usage: node --env-file=.env.local scripts/activate-work-to-content.mjs [--apply]");
  }
  const packet = activationPacket(process.cwd());
  if (!args.includes("--apply")) {
    console.log(JSON.stringify({ outcome: "preview", requiresHumanApproval: true, packet }, null, 2));
  } else {
    console.log(JSON.stringify(await applyPacket(packet, { url: process.env.SUPABASE_URL, key: process.env.SUPABASE_SERVICE_ROLE_KEY })));
  }
}
