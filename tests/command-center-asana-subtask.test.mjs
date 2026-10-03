// Seam tests for Asana subtask completion and due dates (lib/command-center-asana.ts).
// The Asana HTTP boundary is replaced with an in-memory fake; no network, no credentials.
process.env.ASANA_ACCESS_TOKEN = "test-token";
import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { completeAsanaSubtask, listAsanaWork } from "../lib/command-center-asana.ts";

const AI_PROJECT = "1218884867598641";
let tasks;
let calls;
let failPut;

function task(gid, extra = {}) {
  return {
    gid,
    name: `Task ${gid}`,
    notes: "",
    html_notes: "<body></body>",
    completed: false,
    due_on: null,
    permalink_url: `https://app.asana.com/0/0/${gid}`,
    parent: null,
    num_subtasks: 0,
    memberships: [],
    ...extra,
  };
}

beforeEach(() => {
  calls = [];
  failPut = false;
  tasks = {
    100: task("100", {
      memberships: [{ project: { gid: AI_PROJECT }, section: { gid: "9", name: "To Do" } }],
      num_subtasks: 1,
    }),
    101: task("101", { parent: { gid: "100" }, due_on: "2026-10-09", name: "Draft intro" }),
    200: task("200", { memberships: [{ project: { gid: "555" }, section: null }] }),
    201: task("201", { parent: { gid: "200" } }),
    300: task("300", {
      memberships: [{ project: { gid: AI_PROJECT }, section: null }],
    }),
  };
  globalThis.fetch = async (url, init = {}) => {
    const path = String(url).replace("https://app.asana.com/api/1.0/", "");
    const method = init.method ?? "GET";
    calls.push(`${method} ${path.split("?")[0]}`);
    const [route, query] = path.split("?");
    const ok = (data) =>
      new Response(JSON.stringify({ data }), { status: 200 });
    const match = route.match(/^tasks\/(\d+)(\/subtasks)?$/);
    if (route.match(/^projects\/\d+\/tasks$/))
      return ok(Object.values(tasks).filter((t) => !t.parent && t.memberships.some((m) => route.includes(m.project.gid))));
    if (match?.[2])
      return ok(Object.values(tasks).filter((t) => t.parent?.gid === match[1]));
    if (match && method === "GET") return ok(tasks[match[1]]);
    if (match && method === "PUT") {
      if (failPut) return new Response("{}", { status: 500 });
      Object.assign(tasks[match[1]], JSON.parse(init.body).data);
      return ok(tasks[match[1]]);
    }
    return new Response("{}", { status: 404 });
  };
});

test("child listing carries each subtask's due date", async () => {
  const work = await listAsanaWork();
  const parent = work.find((item) => item.id === "100");
  assert.deepEqual(parent.children, [
    {
      id: "101",
      title: "Draft intro",
      url: "https://app.asana.com/0/0/101",
      status: "To Do",
      dueDate: "2026-10-09",
    },
  ]);
});

test("completing a subtask marks only that task done and reads it back", async () => {
  const done = await completeAsanaSubtask("100", "101");
  assert.equal(tasks[101].completed, true);
  assert.equal(tasks[100].completed, false);
  assert.deepEqual(done, {
    id: "101",
    title: "Draft intro",
    url: "https://app.asana.com/0/0/101",
    status: "Done",
    dueDate: "2026-10-09",
  });
  assert.ok(calls.at(-1).startsWith("GET tasks/101"), "last call is the readback");
  assert.ok(!calls.some((call) => call.includes("sections")), "no section moves");
});

test("a subtask under a different parent is rejected without a write", async () => {
  await assert.rejects(completeAsanaSubtask("100", "201"), /not a subtask/i);
  assert.ok(!calls.some((call) => call.startsWith("PUT")));
});

test("a parent outside the configured projects is rejected without a write", async () => {
  await assert.rejects(completeAsanaSubtask("200", "201"), /outside the configured/i);
  assert.ok(!calls.some((call) => call.startsWith("PUT")));
});

test("a failed write surfaces an error and leaves the subtask open", async () => {
  failPut = true;
  await assert.rejects(completeAsanaSubtask("100", "101"), /Asana request failed/);
  assert.equal(tasks[101].completed, false);
});

test("an already completed subtask is confirmed without another write", async () => {
  tasks[101].completed = true;
  const done = await completeAsanaSubtask("100", "101");
  assert.equal(done.status, "Done");
  assert.ok(!calls.some((call) => call.startsWith("PUT")));
});
