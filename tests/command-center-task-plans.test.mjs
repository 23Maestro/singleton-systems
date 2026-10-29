import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { build } from "esbuild";
import { mkdir } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import path from "node:path";

// Public route handlers, with only external HTTP replaced. No production credentials.
Object.assign(process.env, { SUPABASE_URL: "https://test.supabase.invalid", SUPABASE_SERVICE_ROLE_KEY: "test", ASANA_ACCESS_TOKEN: "test", LINEAR_API_KEY: "test" });
const output = path.resolve(".scratch/task-plan-route-test/route.mjs");
await mkdir(path.dirname(output), { recursive: true });
await build({ entryPoints: ["app/api/command-center/route.ts"], bundle: true, platform: "node", format: "esm", packages: "external", outfile: output, tsconfig: "tsconfig.json" });
const { POST, GET } = await import(pathToFileURL(output).href);
let plans;
beforeEach(() => {
  plans = new Map();
  globalThis.fetch = async (input, init = {}) => {
    const url = new URL(input);
    if (url.hostname === "test.supabase.invalid") {
      if (url.pathname.endsWith("/command_center_task_plans")) {
        if (init.method === "POST") {
          const row = JSON.parse(init.body);
          plans.set(`${row.owner}:${row.owner_id}`, row);
          return Response.json([row]);
        }
        return Response.json([...plans.values()]);
      }
      return Response.json([]);
    }
    if (url.hostname === "app.asana.com") return Response.json({ data: [], next_page: null });
    if (url.hostname === "api.linear.app") return Response.json({ data: { issues: { nodes: [], pageInfo: { hasNextPage: false, endCursor: null } } } });
    throw new Error("Unexpected external request");
  };
});
const save = (extra) => POST(new Request("https://dashboard.test/api/command-center", {
  method: "POST", headers: { origin: "https://dashboard.test", "content-type": "application/json" },
  body: JSON.stringify({ action: "taskPlanSave", owner: "asana", ownerId: "123", period: "inbox", plannedDate: null, durationMinutes: 5, ...extra }),
}));

test("an untimed plan is retrievable once after a duplicate save", async () => {
  assert.equal((await save({})).status, 200);
  assert.equal((await save({})).status, 200);
  const snapshot = await (await GET()).json();
  assert.deepEqual(snapshot.plans.map(({ owner, owner_id, period, planned_date, duration_minutes }) => ({ owner, owner_id, period, planned_date, duration_minutes })), [
    { owner: "asana", owner_id: "123", period: "inbox", planned_date: null, duration_minutes: 5 },
  ]);
});

test("planning periods reject mismatched dates and invalid duration without saving", async () => {
  for (const command of [
    { period: "week", plannedDate: "2026-10-24" },
    { period: "month", plannedDate: "2026-10-24" },
    { period: "day", plannedDate: null },
    { period: "someday", plannedDate: "2026-10-24" },
    { durationMinutes: 7 },
  ]) assert.equal((await save(command)).status, 400);
  assert.deepEqual((await (await GET()).json()).plans, []);
});
