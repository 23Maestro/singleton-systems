import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createTaskPlan, reviewTaskPlan, startTask, taskEntryContext } from "../lib/task-lifecycle.mjs";

const projectId = "1218890014545436", sectionId = "1218890014545438", workspace = { gid: "1216086803382161" };
const input = () => ({ schemaVersion: 1, requestId: "client-video-v1", owner: "asana", lane: "Content Editor", projectId, sectionId,
  parent: { title: "Edit client video", description: "Edit the approved footage & preserve credits.", doneWhen: "Jerami approves the edit." },
  tasks: [
    { key: "prepare", title: "Prepare the footage", description: "Check client <source> and notes.", doneWhen: "The source and credits are checked.", estimate: { attentionMinutes: 20, toolMinutes: 10, waitingMinutes: 0 }, blockedBy: [] },
    { key: "review", title: "Review the edit", description: "Check the finished edit.", doneWhen: "Jerami approves playback.", estimate: { attentionMinutes: 15, toolMinutes: 0, waitingMinutes: null }, blockedBy: ["prepare"] },
  ] });

function fixture(t) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "asana-lifecycle-"));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  const tasks = new Map(), writes = [], faults = {};
  const plain = html => html.replace(/<\/(?:p|h2)>/g, "\n\n").replace(/<[^>]*>/g, "").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&").trim();
  const request = async (endpoint, method = "GET", data) => {
    const url = new URL(endpoint, "https://asana.test/");
    const resource = url.pathname.slice(1), id = resource.split("/")[1];
    if (resource === `projects/${projectId}`) return { data: { gid: projectId, workspace } };
    if (resource === `sections/${sectionId}`) return { data: { gid: sectionId, project: { gid: faults.wrongSection ? "other" : projectId } } };
    if (resource === `projects/${projectId}/tasks`) return { data: [...tasks.values()], next_page: null };
    if (method === "POST" && (resource === "tasks" || resource.endsWith("/subtasks"))) {
      assert(!data.notes, "Write html_notes only");
      assert.match(data.html_notes, /^<body>/);
      assert.doesNotMatch(data.html_notes, /<\/?p(?:\s|>)/, "Asana rejects paragraph elements in html_notes");
      const gid = String(1000 + tasks.size);
      const task = { gid, name: data.name, notes: plain(data.html_notes), html_notes: data.html_notes, due_on: data.due_on ?? null, workspace, parent: resource === "tasks" ? null : { gid: id }, memberships: data.memberships.map(m => ({ project: { gid: m.project }, section: { gid: m.section } })), completed: false, permalink_url: `https://app.asana.com/1/task/${gid}`, dependencies: [] };
      tasks.set(gid, task); writes.push({ operation: "create", id: gid });
      if (faults.lostReply || faults.lostReplyFor === data.name) { delete faults.lostReply; delete faults.lostReplyFor; throw Error("Lost reply after Asana applied the write"); }
      return { data: { gid } };
    }
    const task = tasks.get(id);
    if (!task) throw Error(`Missing task: ${id}`);
    if (resource.endsWith("/subtasks")) return { data: [...tasks.values()].filter(t => t.parent?.gid === id), next_page: null };
    if (resource.endsWith("/stories")) return { data: [{ gid: "comment", resource_subtype: "comment_added", text: "Source discussion" }, { gid: "event", resource_subtype: "added_to_project", text: "System event" }], next_page: faults.repeatPage ? { offset: "again" } : null };
    if (resource.endsWith("/dependencies")) {
      if (faults.dependenciesUnavailable) throw Error("Asana request failed (402): Dependencies are not available for this task.");
      return { data: task.dependencies.map(gid => ({ gid, name: tasks.get(gid).name, completed: tasks.get(gid).completed })), next_page: null };
    }
    if (resource.endsWith("/addDependencies") && method === "POST") {
      assert(!task.dependencies.includes(data.dependencies[0]), "Duplicate dependency write");
      task.dependencies.push(...data.dependencies); writes.push({ operation: "dependency", id });
      if (faults.lostDependencyReply) { delete faults.lostDependencyReply; throw Error("Lost dependency reply"); }
      return { data: {} };
    }
    if (method === "GET") return { data: structuredClone(task) };
    throw Error(`Unexpected Asana operation ${method} ${endpoint}`);
  };
  const options = { request, owner: "asana", statePath: path.join(directory, "receipt.json") };
  const create = (plan = input()) => createTaskPlan(plan, { ...options, statePath: path.join(directory, `${plan.requestId}.json`), approvedHash: reviewTaskPlan(plan).planHash });
  return { create, tasks, writes, faults, options };
}

test("Asana creation verifies project, client section, HTML, estimates and linked blockers", async t => {
  const f = fixture(t), created = await f.create();
  assert.equal(created.outcome, "created", created.error);
  assert.equal(f.tasks.size, 3);
  const first = created.tasks.find(x => x.key === "prepare");
  const second = created.tasks.find(x => x.key === "review");
  assert.equal(f.tasks.get(first.id).parent.gid, created.parentId);
  assert.equal((await taskEntryContext(second.id, f.options)).blockers[0].gid, first.id);
  assert.match(f.tasks.get(first.id).html_notes, /&lt;source&gt;/);
  assert.match(f.tasks.get(first.id).notes, /Attention: 20 min/);
  assert.match(f.tasks.get(second.id).notes, /External waiting: Unknown/);
  const count = f.writes.length;
  assert.equal((await f.create()).outcome, "created");
  assert.equal(f.writes.length, count);
  f.tasks.get(first.id).completed = true;
  assert.equal((await f.create()).outcome, "created", "Later completion does not replay creation");
  assert.equal(f.writes.length, count);
  f.faults.wrongSection = true;
  await assert.rejects(() => f.create(), /section did not match/);
  const invalid = input(); invalid.projectId = "1218913626827109";
  assert.throws(() => reviewTaskPlan(invalid), /fixed project/);
});

test("Asana preserves reviewed dates and explicit no-deadline answers through creation and context", async t => {
  const f = fixture(t), plan = input();
  plan.parent.dueDate = null;
  plan.tasks[0].dueDate = "2026-11-04";
  plan.tasks[1].dueDate = null;
  const created = await f.create(plan);
  assert.equal(created.outcome, "created", created.error);
  const dated = await taskEntryContext(created.tasks.find(x => x.key === "prepare").id, f.options);
  const undated = await taskEntryContext(created.tasks.find(x => x.key === "review").id, f.options);
  assert.equal(dated.task.dueDate, "2026-11-04");
  assert.equal(dated.task.due_on, "2026-11-04");
  assert.equal(undated.task.dueDate, null);
});

test("free Asana creates readable blocker links and loads current blocker state without paid dependencies", async t => {
  const f = fixture(t); f.faults.dependenciesUnavailable = true;
  const created = await f.create();
  assert.equal(created.outcome, "created", created.error);
  const prepare = created.tasks.find(x => x.key === "prepare");
  const review = created.tasks.find(x => x.key === "review");
  const context = await taskEntryContext(review.id, f.options);
  assert.match(context.task.html_notes, /<h2>Blocked by<\/h2>/);
  assert.equal(context.blockers[0].gid, prepare.id);
  assert.equal(context.blockers[0].completed, false);
  f.tasks.get(prepare.id).completed = true;
  assert.equal((await taskEntryContext(review.id, f.options)).blockers[0].completed, true);
  assert.equal((await f.create()).outcome, "created");
});

test("partly broken blocker notes stay incomplete instead of dropping unreadable references", async t => {
  const f = fixture(t), created = await f.create();
  const selected = created.tasks.find(x => x.key === "review");
  f.tasks.get(selected.id).html_notes = f.tasks.get(selected.id).html_notes.replace("</a>", "</a>\nUnlinked blocker");
  await assert.rejects(() => taskEntryContext(selected.id, f.options), /blocker.*review/i);
});

test("missing or unrelated linked blockers prevent task entry", async t => {
  const f = fixture(t), created = await f.create();
  const blocker = created.tasks.find(x => x.key === "prepare");
  const selected = created.tasks.find(x => x.key === "review");
  const saved = f.tasks.get(blocker.id);
  saved.parent = { gid: "9999" };
  await assert.rejects(() => taskEntryContext(selected.id, f.options), /outside this deliverable/);
  f.tasks.delete(blocker.id);
  await assert.rejects(() => taskEntryContext(selected.id, f.options), /Missing task/);
});

test("incomplete native blocker state or date readback prevents task entry", async t => {
  const f = fixture(t), created = await f.create();
  const blocker = f.tasks.get(created.tasks.find(x => x.key === "prepare").id);
  const selected = created.tasks.find(x => x.key === "review");
  delete blocker.completed;
  await assert.rejects(() => taskEntryContext(selected.id, f.options), /incomplete|readback/i);
  blocker.completed = false;
  delete blocker.due_on;
  await assert.rejects(() => taskEntryContext(selected.id, f.options), /incomplete|readback/i);
});

test("retry preserves a later deadline edit and refuses to clear an adopted deliverable date", async t => {
  const f = fixture(t), plan = input();
  plan.tasks[0].dueDate = "2026-11-04";
  const created = await f.create(plan);
  const selected = created.tasks.find(x => x.key === "prepare");
  f.tasks.get(selected.id).due_on = "2026-11-05";
  const writes = f.writes.length;
  assert.equal((await f.create(plan)).outcome, "incomplete");
  assert.equal((await taskEntryContext(selected.id, f.options)).task.dueDate, "2026-11-05");
  assert.equal(f.writes.length, writes);
  f.tasks.get(created.parentId).due_on = "2026-11-06";
  const adopted = input(); adopted.requestId = "preserve-deadline";
  adopted.parent.existingId = created.parentId; adopted.parent.dueDate = null;
  assert.equal((await f.create(adopted)).outcome, "incomplete");
  assert.equal(f.tasks.get(created.parentId).due_on, "2026-11-06");
  assert.equal(f.writes.length, writes);
});

test("Asana recovers lost parent and linked-child create replies through owner reads", async t => {
  const f = fixture(t); f.faults.lostReply = true;
  assert.equal((await f.create()).outcome, "incomplete");
  assert.equal(f.tasks.size, 1);
  f.faults.lostReplyFor = "Review the edit";
  assert.equal((await f.create()).outcome, "incomplete");
  const recovered = await f.create();
  assert.equal(recovered.outcome, "created", recovered.error);
  assert.equal(f.writes.filter(w => w.operation === "create").length, 3);
  assert.equal((await taskEntryContext(recovered.tasks.find(x => x.key === "review").id, f.options)).blockers.length, 1);
});

test("Asana adoption preserves existing production notes and later edits are never overwritten", async t => {
  const f = fixture(t), initial = await f.create();
  const parent = f.tasks.get(initial.parentId);
  parent.notes = "Current production notes"; parent.html_notes = "<body>Current production notes</body>";
  const adopted = input(); adopted.requestId = "adopt-v2"; adopted.parent.existingId = initial.parentId;
  const result = await f.create(adopted);
  assert.equal(result.outcome, "created", result.error);
  assert.equal(result.parentId, initial.parentId);
  assert.equal(parent.notes, "Current production notes");
  const child = f.tasks.get(result.tasks.find(x => x.key === "prepare").id);
  child.notes = "Jerami's later edit";
  const writes = f.writes.length;
  assert.equal((await f.create(adopted)).outcome, "incomplete");
  assert.equal(child.notes, "Jerami's later edit");
  assert.equal(f.writes.length, writes);
});

test("free Asana adopts an open deliverable without changing its production notes", async t => {
  const f = fixture(t), created = await f.create();
  const adopted = input(); adopted.requestId = "unavailable-v2"; adopted.parent.existingId = created.parentId;
  f.faults.dependenciesUnavailable = true;
  const before = f.tasks.get(created.parentId).html_notes;
  const result = await f.create(adopted);
  assert.equal(result.outcome, "created", result.error);
  assert.equal(f.tasks.get(created.parentId).html_notes, before);
  assert.equal((await taskEntryContext(created.parentId, f.options)).children.length, 4);
});

test("Asana entry loads source context and uses the same exact-ID closeout; repeated pages fail closed", async t => {
  const f = fixture(t), created = await f.create();
  const selected = created.tasks.find(x => x.key === "review");
  const context = await taskEntryContext(selected.id, f.options);
  assert.equal(context.parent.gid, created.parentId);
  assert.equal(context.comments.length, 1);
  assert.equal(context.blockers.length, 1);
  let bound;
  await startTask(selected.id, { ...f.options, session: "session", turn: "turn", closeout: async (_command, options) => { bound = options; return { outcome: "pending" }; } });
  assert.equal(bound.owner, "asana");
  assert.equal(bound.id, selected.id);
  assert.equal(bound["done-when"], "Jerami approves playback.");
  f.faults.repeatPage = true;
  await assert.rejects(() => taskEntryContext(selected.id, f.options), /incomplete/);
});
