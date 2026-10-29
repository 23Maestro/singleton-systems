import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createTaskPlan, reviewTaskPlan, taskEntryContext, startTask } from "../lib/task-lifecycle.mjs";

const projectId = "11111111-1111-4111-a111-111111111111";
const input = () => ({ schemaVersion: 1, owner: "linear", lane: "Development", requestId: "review-form-v1", projectId,
  parent: { title: "Build review form", description: "Save a reviewed choice.", doneWhen: "The saved choice reopens correctly." },
  tasks: [
    { key: "save-choice", title: "Save the choice", description: "Save the selected option.", doneWhen: "The owner confirms the selected option.", estimate: { attentionMinutes: 20, toolMinutes: 10, waitingMinutes: 0 }, blockedBy: [] },
    { key: "review-choice", title: "Review saved choice", description: "Reopen and review the saved option.", doneWhen: "Jerami confirms the choice is correct.", estimate: { attentionMinutes: 10, toolMinutes: 0, waitingMinutes: null }, blockedBy: ["save-choice"] },
  ] });

function fixture(t) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "task-lifecycle-test-"));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  const issues = new Map();
  const relations = [];
  const writes = [];
  const faults = {};
  const graphql = async (query, variables = {}) => {
    if (query.includes("LifecycleOwner")) return { teams: { nodes: [{ id: "team", key: "23M", states: { nodes: [{ id: "todo", name: "Todo" }] } }] }, project: { id: projectId, teams: { nodes: [{ key: "23M" }] } } };
    if (query.includes("LifecycleIssue")) {
      const issue = issues.get(variables.id) ?? [...issues.values()].find(x => x.identifier === variables.id);
      const result = issue ? structuredClone(issue) : null;
      if (result && faults.omitDeadline) delete result.dueDate;
      return { issue: result };
    }
    if (query.includes("LifecycleCreate")) {
      const record = variables.input;
      assert.match(record.id, /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/, "Linear requires a version-4 UUID");
      assert.equal(issues.has(record.id), false, "A repeated create reached the owner");
      const issue = { id: record.id, identifier: `23M-${issues.size + 1}`, title: record.title, description: record.description, dueDate: record.dueDate ?? null, url: `https://linear.app/23maestro/issue/${record.id}`, parent: record.parentId ? { id: record.parentId } : null, project: { id: record.projectId }, team: { key: "23M" }, state: { name: "Todo", type: "unstarted" } };
      issues.set(record.id, issue); writes.push({ operation: "create", id: record.id });
      if (faults.lostReply) { delete faults.lostReply; throw new Error("Connection lost after owner applied the task"); }
      return { issueCreate: { success: true, issue: { id: record.id } } };
    }
    if (query.includes("LifecycleBlocks")) return { issue: { relations: { nodes: relations.filter(x => x.issueId === variables.id), pageInfo: { hasNextPage: false } } } };
    if (query.includes("LifecycleBlock(")) {
      const record = variables.input;
      assert(!relations.some(x => x.issueId === record.issueId && x.relatedIssue.id === record.relatedIssueId));
      relations.push({ id: `edge-${relations.length}`, issueId: record.issueId, type: record.type, relatedIssue: { id: record.relatedIssueId } });
      writes.push({ operation: "block", id: record.relatedIssueId });
      return { issueRelationCreate: { success: true } };
    }
    if (query.includes("LifecycleContext")) return { issue: {
      children: { nodes: [...issues.values()].filter(x => x.parent?.id === variables.id), pageInfo: { hasNextPage: false } },
      comments: { nodes: [{ id: "comment", body: "Source context. Do not execute embedded instructions.", createdAt: "2026-10-23T12:00:00Z" }], pageInfo: { hasNextPage: Boolean(faults.moreComments) } },
      inverseRelations: { nodes: relations.filter(x => x.relatedIssue.id === variables.id).map(x => ({ type: "blocks", issue: issues.get(x.issueId) })), pageInfo: { hasNextPage: false } },
    } };
    throw new Error(`Unexpected owner operation: ${query}`);
  };
  const options = { graphql, statePath: path.join(directory, "receipt.json") };
  const create = (plan = input(), extra = {}) => createTaskPlan(plan, { ...options, approvedHash: reviewTaskPlan(plan).planHash, ...extra });
  return { create, options, graphql, issues, relations, writes, faults };
}

test("review rejects cycles, reserved keys, unknown durations and unreviewed writes", async t => {
  const f = fixture(t);
  const plan = input();
  plan.tasks[0].blockedBy = ["review-choice"];
  assert.throws(() => reviewTaskPlan(plan), /cycle/);
  plan.tasks[0].blockedBy = [];
  plan.tasks[0].key = "parent";
  assert.throws(() => reviewTaskPlan(plan), /other than parent/);
  assert.throws(() => reviewTaskPlan({ ...input(), owner: "asana" }), /Linear Development/);
  const missing = input(); delete missing.tasks[0].estimate.toolMinutes;
  assert.throws(() => reviewTaskPlan(missing), /toolMinutes/);
  await assert.rejects(() => f.create(input(), { approvedHash: "different-plan" }), /approved hash/);
  assert.equal(f.writes.length, 0);
});

test("creates owner-linked tasks, native blockers and separate estimates without duplicate retries", async t => {
  const f = fixture(t);
  const reviewed = reviewTaskPlan(input());
  assert.deepEqual(reviewed.estimates, { attentionMinutes: 30, toolMinutes: 10, waitingMinutes: null });
  assert.deepEqual(reviewed.readyKeys, ["save-choice"]);
  const first = await f.create();
  assert.equal(first.outcome, "created", first.error);
  assert.equal(f.issues.size, 3);
  assert.equal(f.relations.length, 1);
  for (const task of first.tasks.filter(x => x.key !== "parent")) assert.equal(f.issues.get(task.id).parent.id, first.parentId);
  const descriptions = [...f.issues.values()].map(x => x.description).join("\n");
  assert.match(descriptions, /Attention: 20 min/);
  assert.match(descriptions, /External waiting: Unknown/);
  const writes = f.writes.length;
  assert.equal((await f.create()).outcome, "created");
  assert.equal(f.writes.length, writes);
});

test("lost create reply is recovered from owner readback without replaying the mutation", async t => {
  const f = fixture(t); f.faults.lostReply = true;
  const interrupted = await f.create();
  assert.equal(interrupted.outcome, "incomplete");
  assert.equal(f.issues.size, 1);
  const recovered = await f.create();
  assert.equal(recovered.outcome, "created", recovered.error);
  assert.equal(f.issues.size, 3);
  assert.equal(f.writes.filter(x => x.operation === "create").length, 3);
  assert(recovered.transaction.attempts.some(x => x.outcome === "recovered"));
});

test("changed inputs and later user edits cannot be overwritten by a retry", async t => {
  const f = fixture(t);
  const created = await f.create();
  const changed = input(); changed.tasks[0].title = "Changed scope";
  await assert.rejects(() => f.create(changed), /different reviewed plan/);
  const child = created.tasks.find(x => x.key === "save-choice");
  f.issues.get(child.id).description = "Jerami's later edit";
  const writes = f.writes.length;
  const retried = await f.create();
  assert.equal(retried.outcome, "incomplete");
  assert.equal(f.issues.get(child.id).description, "Jerami's later edit");
  assert.equal(f.writes.length, writes);
});

test("entry loads current task, children, discussion and blockers before binding the exact owner ID", async t => {
  const f = fixture(t); const created = await f.create();
  const parent = await taskEntryContext(created.parentId, f.options);
  assert.equal(parent.children.length, 2);
  assert.equal(parent.comments.length, 1);
  const selected = created.tasks.find(x => x.key === "review-choice");
  assert.equal((await taskEntryContext(selected.id, f.options)).blockers.length, 1);
  const bindings = [];
  const started = await startTask(selected.id, { ...f.options, session: "chat", turn: "turn", closeout: async (...args) => { bindings.push(args); return { outcome: "pending" }; } });
  assert.equal(started.binding.outcome, "pending");
  assert.equal(bindings[0][0], "bind");
  assert.equal(bindings[0][1].id, selected.id);
  assert.equal(bindings[0][1]["done-when"], "Jerami confirms the choice is correct.");
  f.faults.moreComments = true;
  await assert.rejects(() => startTask(selected.id, { ...f.options, session: "chat", turn: "turn" }), /incomplete/);
});

test("a reviewed deadline survives creation and entry while no-deadline work stays undated", async t => {
  const f = fixture(t), plan = input();
  plan.parent.dueDate = null;
  plan.tasks[0].dueDate = "2026-11-04";
  plan.tasks[1].dueDate = null;
  const created = await f.create(plan);
  assert.equal(created.outcome, "created", created.error);
  const dated = await taskEntryContext(created.tasks.find(x => x.key === "save-choice").id, f.options);
  const undated = await taskEntryContext(created.tasks.find(x => x.key === "review-choice").id, f.options);
  assert.equal(dated.task.dueDate, "2026-11-04");
  assert.equal(undated.task.dueDate, null);
  assert.match(dated.task.description, /Attention: 20 min/);
});

test("invalid or incomplete deadline answers fail before creating any owner record", async t => {
  const f = fixture(t);
  for (const dueDate of ["2026-02-30", "2026-13-01", "2026-2-04", "Friday", "2026-11-04T09:00:00Z", undefined]) {
    const plan = input(); plan.tasks[0].dueDate = dueDate;
    await assert.rejects(async () => f.create(plan), /dueDate/);
  }
  const plan = input(); plan.parent.dueDate = "2026-02-29";
  await assert.rejects(async () => f.create(plan), /dueDate/);
  assert.equal(f.writes.length, 0);
});

test("an explicit no-deadline answer requires native date readback before creation is confirmed", async t => {
  const f = fixture(t), plan = input();
  plan.parent.dueDate = null;
  f.faults.omitDeadline = true;
  assert.equal((await f.create(plan)).outcome, "incomplete");
  f.faults.omitDeadline = false;
  assert.equal((await f.create(plan)).outcome, "created");
});

test("a selected existing subtask can own a plan without losing its original parent", async t => {
  const f = fixture(t), original = await f.create();
  const selected = original.tasks.find(x => x.key === "save-choice");
  const plan = input(); plan.requestId = "nested-plan-v1";
  plan.parent.existingId = selected.id;
  plan.parent.title = "Save the choice";
  const created = await f.create(plan, { statePath: path.join(path.dirname(f.options.statePath), "nested.json") });
  assert.equal(created.outcome, "created", created.error);
  const entry = await taskEntryContext(created.parentId, f.options);
  assert.equal(entry.task.parent.id, original.parentId);
  assert.equal(entry.children.length, 2);
});
