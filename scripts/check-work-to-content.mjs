import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { activationPacket, applyPacket } from "./activate-work-to-content.mjs";

const root = process.cwd();
const plugin = path.join(root, "plugins/work-to-content");
const routingChecks = spawnSync(process.env.PYTHON || "python3", ["-m", "unittest", "discover", "-s", path.join(plugin, "tests"), "-p", "test_*.py"], {
  cwd: root, encoding: "utf8", env: { ...process.env, PYTHONDONTWRITEBYTECODE: "1" }, timeout: 30000,
});
assert.equal(routingChecks.status, 0, routingChecks.stderr || routingChecks.error?.message);
console.log(routingChecks.stderr.trim());
const read = (relative) => JSON.parse(fs.readFileSync(path.join(plugin, relative), "utf8"));
const manifest = read("plugin.json");
const compatibility = read(".codex-plugin/plugin.json");
assert.equal(manifest.name, "work-to-content");
assert.equal(compatibility.name, manifest.name);
assert.equal(compatibility.version, manifest.version);
assert.equal(compatibility.requires_local_executor, true);
assert.equal(compatibility.skills, "./skills/");
assert.equal(compatibility.mcpServers, "./mcp.json");
assert.equal(compatibility.hooks, undefined, "installing the plugin must not start capture hooks");
assert.deepEqual(read("mcp.json").mcpServers.openscreen, { type: "stdio", command: "/Applications/Openscreen.app/Contents/MacOS/Openscreen", args: ["mcp"] });
const marketplace = JSON.parse(fs.readFileSync(path.join(root, ".agents/plugins/marketplace.json"), "utf8"));
const entry = marketplace.plugins.find((row) => row.name === manifest.name);
assert.equal(marketplace.name, "singleton-content");
assert.equal(path.resolve(root, entry.source.path), plugin);
assert.equal(entry.policy.installation, "AVAILABLE");

const plan = read("skills/work-to-content/references/content-plan.json");
assert.equal(plan.defaultAction, "plan");
assert.equal(plan.firstCase, "Catena Media / Lineups");
for (const action of ["plan", "setup", "edit"]) assert.equal(plan.actions[action].capture, false);
for (const action of ["plan", "setup", "record", "edit"]) assert.equal(plan.actions[action].publish, false);
assert.equal(plan.automaticRecording, false);
assert.equal(plan.automaticPublishing, false);
assert.equal(plan.automaticDelegation, false);
assert.equal(plan.workspace.notePath, "/Volumes/HomeSSD/Generated/SINGLETON_SYSTEMS/references/work-to-content.md");
assert.equal(plan.workspace.expectedVolumeUUID, "0EB7E204-D359-47B2-B9B1-89B2DC77BC5A");
assert.equal(plan.workspace.sourceRoot, "plugins/work-to-content");
assert.equal(plan.workspace.internalMediaFallback, false);
for (const [kind, directory] of Object.entries(plan.workspace.mediaRoots)) {
  assert.equal(directory, `/Volumes/HomeSSD/Generated/SINGLETON_SYSTEMS/${kind}`);
}

const provenance = read("provenance.json");
const sha = (data) => createHash("sha256").update(data).digest("hex");
const bundled = fs.readFileSync(path.join(plugin, provenance.bundledReference));
assert.equal(sha(bundled), provenance.bundledReferenceSha256);
const raw = bundled.subarray(Buffer.byteLength("<!-- writing-source:start -->\n"), -Buffer.byteLength("\n<!-- writing-source:end -->\n"));
assert.equal(sha(raw), provenance.upstreamSkillSha256, "the bundled recipe must match the pinned source");
assert.equal(sha(fs.readFileSync(path.join(plugin, provenance.licensePath))), provenance.licenseSha256);
assert.equal(provenance.ref, "v2.1.1");

const packet = activationPacket(root);
assert.deepEqual(packet.skills.map((row) => row.skill_key).sort(), ["openscreen-demo", "work-to-content"]);
assert.deepEqual(packet.routes[0].required_tools, ["work-to-content:work-to-content", "work-to-content:openscreen-demo"]);
assert.equal(packet.routes[0].owner, "Asana");
assert.equal(packet.routes[0].project, "Content Editor");

function fakeRegistry({ breakReadback = false, failWrite = false } = {}) {
  const calls = [];
  const tables = new Map();
  const request = async (url, options) => {
    const parsed = new URL(url);
    const table = parsed.pathname.split("/").at(-1);
    calls.push({ table, method: options.method ?? "GET", options });
    assert.ok(["harness_skills", "harness_capabilities", "cerebral_routes"].includes(table), "activation must never call the full registry seeder");
    if (options.method === "POST") {
      if (failWrite) return { ok: false, status: 503 };
      const rows = JSON.parse(options.body);
      tables.set(table, rows);
      return { ok: true, json: async () => rows };
    }
    const rows = structuredClone(tables.get(table));
    if (breakReadback && table === "harness_skills") rows[0].canonical_path = "wrong/source";
    return { ok: true, json: async () => rows };
  };
  return { calls, tables, request };
}

const fake = fakeRegistry();
assert.equal((await applyPacket(packet, { url: "https://registry.example", key: "fixture", request: fake.request })).outcome, "verified");
assert.deepEqual(fake.calls.filter((call) => call.method === "POST").map((call) => call.table), ["harness_skills", "harness_capabilities", "cerebral_routes"]);
assert.equal(fake.tables.get("cerebral_routes").length, 1);
assert.equal(fake.tables.get("cerebral_routes")[0].route_key, "work-to-content");
assert.equal(fake.tables.get("cerebral_routes")[0].example_prompt, undefined, "only database columns may be written");
assert.equal(fake.tables.get("harness_capabilities").length, 1);
assert.equal(fake.tables.get("harness_skills").length, 2);
for (const failure of [{ breakReadback: true }, { failWrite: true }]) {
  const broken = fakeRegistry(failure);
  await assert.rejects(applyPacket(packet, { url: "https://registry.example", key: "fixture", request: broken.request }));
  assert.ok(!broken.calls.some((call) => call.table === "cerebral_routes"), "failed prerequisites must leave the route unpublished");
}

const preview = spawnSync(process.execPath, ["scripts/activate-work-to-content.mjs"], { cwd: root, encoding: "utf8", env: { ...process.env, SUPABASE_URL: "", SUPABASE_SERVICE_ROLE_KEY: "" } });
assert.equal(preview.status, 0, preview.stderr);
assert.equal(JSON.parse(preview.stdout).outcome, "preview");
assert.equal(JSON.parse(preview.stdout).requiresHumanApproval, true);
console.log("Work to Content checks passed: package, intent, pinned source, preview and scoped activation/readback.");
