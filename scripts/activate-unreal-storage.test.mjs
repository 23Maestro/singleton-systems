import assert from "node:assert/strict";
import test from "node:test";
import { activationPacket, applyPacket } from "./activate-unreal-storage.mjs";

test("activation writes only Unreal rows and verifies the skill before publishing its route", async () => {
  const calls = [];
  const rows = new Map();
  const request = async (url, options) => {
    const table = new URL(url).pathname.split("/").at(-1);
    calls.push([table, options.method ?? "GET"]);
    if (options.method === "POST") rows.set(table, JSON.parse(options.body));
    return { ok: true, status: 200, json: async () => rows.get(table) };
  };
  const packet = activationPacket();
  await applyPacket(packet, { url: "https://example.invalid", key: "test", request });
  assert.deepEqual(calls, [["harness_skills", "POST"], ["harness_skills", "GET"], ["cerebral_routes", "POST"], ["cerebral_routes", "GET"]]);
  assert.equal(rows.get("harness_skills")[0].skill_key, "unreal-storage");
  assert.equal(rows.get("cerebral_routes")[0].route_key, "unreal-storage");
  assert.equal(rows.get("cerebral_routes").length, 1);
});

test("a changed skill readback stops activation before the route is published", async () => {
  const calls = [];
  const request = async (url, options) => {
    const table = new URL(url).pathname.split("/").at(-1);
    calls.push(table);
    return { ok: true, status: 200, json: async () => [{ ...activationPacket().skill, canonical_path: "wrong/path" }] };
  };
  await assert.rejects(applyPacket(activationPacket(), { url: "https://example.invalid", key: "test", request }), /canonical_path differs/);
  assert.ok(!calls.includes("cerebral_routes"));
});
