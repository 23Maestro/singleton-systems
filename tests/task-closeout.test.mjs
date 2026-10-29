import { test } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { mkdtempSync, realpathSync, rmSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { execFile, spawn } from "node:child_process";
import { promisify } from "node:util";

const exec = promisify(execFile);
const root = process.cwd();
const cli = path.join(root, "scripts/task-closeout.mjs");
const preload = path.join(root, "tests/fixtures/task-owner-http.mjs");

async function fixture(t) {
  const directory = realpathSync(mkdtempSync(path.join(tmpdir(), "task-closeout-test-")));
  const tasks = new Map(["100", "101"].map(id => [id, {
    gid: id, name: id === "100" ? "Prepare episode" : "Review export", completed: false,
    workspace: { gid: "1216086803382161" }, parent: id === "101" ? { gid: "100" } : null,
    permalink_url: `https://app.asana.com/0/0/${id}`, num_subtasks: id === "100" ? 1 : 0,
    notes: "Review is pending. Keep the source link.",
    html_notes: '<body>Review is pending. <a href="https://example.com/source">Keep the source link.</a></body>',
    due_on: null,
    memberships: [{ project: { gid: "1218890014545436" }, section: { gid: "1218890014545438" } }],
  }]));
  const writes = [];
  const faults = {};
  const registry = JSON.parse(readFileSync(path.join(root, "config/cerebral-registry.json")));
  const issues = new Map(["issue-1", "issue-2"].map((id, i) => [id, {
    id, identifier: `23M-${i + 1}`, title: i ? "Check form" : "Build form", url: `https://linear.app/23maestro/issue/23M-${i + 1}`,
    parent: i ? { id: "issue-1" } : null, state: { name: "In Progress", type: "started" },
    description: "Review is pending. [Source](https://example.com/source)",
    team: { key: "23M", states: { nodes: [{ id: "done-state", name: "Done", type: "completed" }] } },
  }]));
  const server = createServer(async (req, res) => {
    const url = new URL(req.url, "http://localhost");
    const match = url.pathname.match(/^\/api\/1\.0\/tasks\/(\d+)(\/subtasks|\/stories)?$/);
    let status = 200;
    let result;
    if (url.pathname === "/rest/v1/cerebral_routes") result = registry.routes;
    else if (url.pathname === "/rest/v1/harness_capabilities") result = registry.capabilities;
    else if (url.pathname === "/rest/v1/harness_skills") result = [{ skill_key: "cerebral-router", canonical_path: "plugins/s-systems/skills/cerebral-router" }];
    else if (url.pathname === "/graphql") {
      const chunks = []; for await (const chunk of req) chunks.push(chunk);
      const body = JSON.parse(Buffer.concat(chunks));
      const issue = issues.get(body.variables.id) || [...issues.values()].find(x => x.identifier === body.variables.id);
      if (body.query.includes("LifecycleContext")) result = { data: { issue: {
        children: { nodes: [...issues.values()].filter(x => x.parent?.id === issue.id), pageInfo: { hasNextPage: false } },
        comments: { nodes: [], pageInfo: { hasNextPage: false } },
        inverseRelations: { nodes: [], pageInfo: { hasNextPage: false } },
      } } };
      else if (body.query.startsWith("mutation")) {
        if (faults.rejectLinear || (issue.id === "issue-1" && issues.get("issue-2").state.type !== "completed")) result = { data: { issueUpdate: { success: false } } };
        else {
          if (!faults.ignoreWrite) {
            issue.state = { name: "Done", type: "completed" };
            if (!faults.ignoreSummary && body.variables.input.description) issue.description = body.variables.input.description;
          }
          writes.push(issue.id); result = { data: { issueUpdate: { success: true } } };
        }
      } else result = { data: { issue: issue ? { ...issue, children: { nodes: [...issues.values()].filter(x => x.parent?.id === issue.id).map(x => ({ id: x.id })), pageInfo: { hasNextPage: false, endCursor: null } } } : null } };
    }
    else if (match?.[2] === "/stories") result = { data: [], next_page: null };
    else if (match?.[2]) result = { data: [...tasks.values()].filter(x => x.parent?.gid === match[1]), next_page: null };
    else if (match && req.method === "GET") {
      if (faults.readUnavailable) { status = 503; result = {}; }
      else result = { data: tasks.get(match[1]) };
    }
    else if (match && req.method === "PUT") {
      const task = tasks.get(match[1]);
      const chunks = []; for await (const chunk of req) chunks.push(chunk);
      const edit = JSON.parse(Buffer.concat(chunks)).data;
      if (task.gid === "100" && !tasks.get("101").completed) {
        status = 409; result = { error: "Child still open" };
      } else {
        if (!faults.ignoreWrite) {
          const { html_notes, ...other } = edit;
          Object.assign(task, other);
          if (!faults.ignoreSummary && html_notes) {
            task.html_notes = html_notes;
            task.notes = html_notes.replace(/<[^>]+>/g, " ").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
          }
        }
        if (faults.reopenAfterParent && task.gid === "100") tasks.get("101").completed = false;
        writes.push(task.gid); result = { data: task };
        if (faults.loseWriteReply) { faults.loseWriteReply = false; req.socket.destroy(); return; }
      }
    } else { status = 404; result = {}; }
    res.writeHead(status, { "Content-Type": "application/json" }); res.end(JSON.stringify(result));
  });
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  t.after(() => { server.close(); rmSync(directory, { recursive: true, force: true }); });
  const env = { ...process.env, TASK_CLOSEOUT_STATE_DIR: directory, TASK_CLOSEOUT_TEST_ORIGIN: `http://127.0.0.1:${server.address().port}`,
    ASANA_ACCESS_TOKEN: "test-token", LINEAR_API_KEY: "test-key", COMPOSIO_API_KEY: "", COMMAND_CENTER_ASANA_CONNECTION_ID: "" };
  const run = async (command, options = {}, entrypoint = cli) => {
    const args = ["--import", preload, entrypoint, command, "--session", "chat-a", "--turn", "turn-a"];
    for (const [key, value] of Object.entries(options)) args.push(`--${key}`, value);
    try { const r = await exec(process.execPath, args, { cwd: root, env }); return { code: 0, ...JSON.parse(r.stdout) }; }
    catch (error) { return { code: error.code, ...JSON.parse(error.stdout || "{}"), stderr: error.stderr }; }
  };
  const hook = (event, extra = {}) => new Promise((resolve, reject) => {
    const child = spawn(process.env.PYTHON || "python3", [path.join(root, ".codex/hooks/cerebral_singleton_guard.py")], {
      cwd: root, env: { ...env, NODE_BINARY: process.execPath, SUPABASE_URL: env.TASK_CLOSEOUT_TEST_ORIGIN, SUPABASE_PUBLISHABLE_KEY: "test-key", SUPABASE_ANON_KEY: "test-key", CEREBRAL_CODEX_GIT_TEMP_ROOT: path.join(directory, "git-temp") },
    });
    let out = "", err = "";
    child.stdout.on("data", data => out += data); child.stderr.on("data", data => err += data);
    child.on("error", reject); child.on("close", code => {
      if (code) reject(new Error(err));
      else resolve(out.trim() ? JSON.parse(out) : null);
    });
    child.stdin.end(JSON.stringify({ hook_event_name: event, cwd: root, session_id: "chat-a", turn_id: "turn-a", ...extra }));
  });
  return { run, lifecycle: (command, options) => run(command, options, path.join(root, "scripts/task-lifecycle.mjs")), hook, env, tasks, issues, writes, faults };
}

test("Asana closes only the named finished children, then verifies the parent", async t => {
  const f = await fixture(t);
  const bound = await f.run("bind", { owner: "asana", id: "100", "done-when": "Jerami confirms the episode is finished" });
  assert.equal(bound.code, 0, bound.error || bound.stderr);
  const result = await f.run("finish", { owner: "asana", id: "100", children: "101", evidence: "Jerami confirmed this episode is done" });
  assert.equal(result.code, 0, result.error || result.stderr);
  assert.equal(result.outcome, "complete");
  const check = await f.run("check", { owner: "asana", id: "100" });
  assert.equal(check.outcome, "complete");
  assert.deepEqual(check.tasks.map(x => [x.id, x.completed]), [["100", true], ["101", true]]);
  assert.deepEqual(f.writes, ["101", "100"]);
});

test("Linear uses the issue's own Done state and verifies children before the parent", async t => {
  const f = await fixture(t);
  const bound = await f.run("bind", { owner: "linear", id: "23M-1", "done-when": "The form works and its checks pass" });
  assert.equal(bound.code, 0, bound.error || bound.stderr);
  const done = await f.run("finish", { owner: "linear", id: "23M-1", children: "issue-2", evidence: "Form checks passed on the current code" });
  assert.equal(done.code, 0, done.error || done.stderr);
  assert.equal(done.outcome, "complete");
  assert.deepEqual(done.tasks.map(x => [x.id, x.completed]), [["issue-1", true], ["issue-2", true]]);
  assert.deepEqual(f.writes, ["issue-2", "issue-1"]);
});

test("normal chat hooks request task matching, catch missed closeout and restore it on resume", async t => {
  const f = await fixture(t);
  const prompt = await f.hook("UserPromptSubmit", { prompt: "Help me finish this work." });
  assert.match(prompt.hookSpecificOutput.additionalContext, /task-closeout.*bind/);
  assert.match(prompt.hookSpecificOutput.additionalContext, /task-entry.*task-lifecycle.*approved-hash/);
  assert.match(prompt.hookSpecificOutput.additionalContext, /Asana.*Linear|Linear.*Asana/);
  assert.equal(await f.hook("Stop", { last_assistant_message: "Research notes are ready." }), null);
  await f.run("bind", { owner: "asana", id: "100", "done-when": "Jerami approves the exports" });
  const stop = await f.hook("Stop", { last_assistant_message: "The exports are finished." });
  assert.equal(stop.decision, "block");
  assert.match(stop.reason, /Prepare episode/);
  const resume = await f.hook("SessionStart", { source: "resume", turn_id: "turn-b" });
  assert.match(resume.hookSpecificOutput.additionalContext, /https:\/\/app.asana.com\/0\/0\/100/);
  await f.run("finish", { owner: "asana", id: "100", children: "101", evidence: "Jerami approved the exports" });
  assert.equal(await f.hook("Stop", { last_assistant_message: "The task and child are checked off." }), null);
});

test("unfinished approval can stay open without a repeat loop or blocking a later research turn", async t => {
  const f = await fixture(t);
  await f.run("bind", { owner: "asana", id: "100", "done-when": "Jerami approves the exports" });
  const premature = await f.run("finish", { owner: "asana", id: "100", evidence: "Files are exported" });
  assert.notEqual(premature.code, 0);
  assert.match(premature.error, /required child.*open/i);
  assert.deepEqual(f.writes, []);
  const blocked = await f.hook("Stop", { last_assistant_message: "Files are exported." });
  assert.equal(blocked.decision, "block");
  const bounded = await f.hook("Stop", { stop_hook_active: true });
  assert.equal(bounded.continue, false);
  const deferred = await f.run("defer", { owner: "asana", id: "100", reason: "Jerami still needs to approve playback" });
  assert.equal(deferred.code, 0, deferred.error);
  assert.equal(deferred.outcome, "deferred");
  assert.equal(await f.hook("Stop", { last_assistant_message: "Playback approval is pending." }), null);
  const resume = await f.hook("UserPromptSubmit", { turn_id: "turn-b", prompt: "Explain this code." });
  assert.match(resume.hookSpecificOutput.additionalContext, /Jerami still needs to approve playback/);
  assert.equal(await f.hook("Stop", { turn_id: "turn-b", last_assistant_message: "Here is the explanation." }), null);
  assert.equal(f.tasks.get("100").completed, false);
});

test("a failed fresh read cannot reuse an older completed result", async t => {
  const f = await fixture(t);
  await f.run("bind", { owner: "asana", id: "100", "done-when": "The episode is approved" });
  await f.run("finish", { owner: "asana", id: "100", children: "101", evidence: "Jerami confirmed completion" });
  f.faults.readUnavailable = true;
  const check = await f.run("check", { owner: "asana", id: "100" });
  assert.notEqual(check.code, 0);
  const stop = await f.hook("Stop", { last_assistant_message: "The API is unavailable." });
  assert.equal(stop?.decision, "block");
  assert.deepEqual(f.writes, ["101", "100"]);
});

test("Asana recovers a lost write reply by reading first and never repeats the completed write", async t => {
  const f = await fixture(t);
  await f.run("bind", { owner: "asana", id: "100", "done-when": "Approved exports" });
  f.faults.loseWriteReply = true;
  const failed = await f.run("finish", { owner: "asana", id: "100", children: "101", evidence: "Jerami confirmed completion" });
  assert.notEqual(failed.code, 0);
  assert.equal((await f.hook("Stop", { last_assistant_message: "Closeout was interrupted." })).decision, "block");
  const resumed = await f.run("finish", { owner: "asana", id: "100", children: "101", evidence: "Jerami confirmed completion" });
  assert.equal(resumed.outcome, "complete");
  assert.deepEqual(f.writes, ["101", "100"]);
});

test("HTTP success without completed readback never closes the parent", async t => {
  const f = await fixture(t);
  await f.run("bind", { owner: "asana", id: "100", "done-when": "Approved exports" });
  f.faults.ignoreWrite = true;
  const result = await f.run("finish", { owner: "asana", id: "100", children: "101", evidence: "Jerami confirmed completion" });
  assert.notEqual(result.code, 0);
  assert.match(result.error, /did not confirm/);
  assert.equal(f.tasks.get("100").completed, false);
  assert.equal((await f.hook("Stop", { last_assistant_message: "Readback failed." })).decision, "block");
});

test("proof and exact child scope are required before any write", async t => {
  const f = await fixture(t);
  await f.run("bind", { owner: "asana", id: "100", "done-when": "Approved exports" });
  const noProof = await f.run("finish", { owner: "asana", id: "100", children: "101" });
  assert.match(noProof.error, /needs proof/);
  const wrongChild = await f.run("finish", { owner: "asana", id: "100", children: "999", evidence: "Approved" });
  assert.match(wrongChild.error, /outside this task/);
  assert.deepEqual(f.writes, []);
});

test("finish fails when the final tree read shows a reopened child", async t => {
  const f = await fixture(t);
  await f.run("bind", { owner: "asana", id: "100", "done-when": "Approved exports" });
  f.faults.reopenAfterParent = true;
  const result = await f.run("finish", { owner: "asana", id: "100", children: "101", evidence: "Jerami confirmed completion" });
  assert.notEqual(result.code, 0);
  assert.match(result.error, /still open|reopened/);
  assert.equal((await f.hook("Stop", { last_assistant_message: "A child reopened." })).decision, "block");
});

test("Linear rejection and unchanged readback keep work open", async t => {
  const f = await fixture(t);
  await f.run("bind", { owner: "linear", id: "23M-1", "done-when": "The form works" });
  f.faults.rejectLinear = true;
  const rejected = await f.run("finish", { owner: "linear", id: "23M-1", children: "issue-2", evidence: "Checks passed" });
  assert.match(rejected.error, /rejected completion/);
  assert.deepEqual(f.writes, []);
  f.faults.rejectLinear = false;
  f.faults.ignoreWrite = true;
  const unchanged = await f.run("finish", { owner: "linear", id: "23M-1", children: "issue-2", evidence: "Checks passed" });
  assert.match(unchanged.error, /did not confirm/);
  assert.equal(f.issues.get("issue-1").state.type, "started");
  assert.equal((await f.hook("Stop", { last_assistant_message: "Closeout failed." })).decision, "block");
});

test("normal hooks read local state without needing TypeScript API support", async t => {
  const f = await fixture(t);
  await f.run("bind", { owner: "asana", id: "100", "done-when": "Approved exports" });
  f.env.NODE_OPTIONS = "--no-experimental-strip-types";
  const prompt = await f.hook("UserPromptSubmit", { prompt: "Continue this task." });
  assert.match(prompt.hookSpecificOutput.additionalContext, /task-closeout.*bind/);
  const stop = await f.hook("Stop", { last_assistant_message: "The work is finished." });
  assert.match(stop.reason, /Prepare episode/);
});

test("finish records a current summary, preserves earlier context and verifies both native description fields", async t => {
  const f = await fixture(t);
  await f.run("bind", { owner: "asana", id: "100", "done-when": "Jerami confirms completion" });
  const result = await f.run("finish", { owner: "asana", id: "100", children: "101", evidence: "Jerami confirmed completion", summary: "All 52 videos are done; keep <source> & context." });
  assert.equal(result.outcome, "complete", result.error);
  for (const task of f.tasks.values()) {
    assert.match(task.html_notes, /^<body><h2>Done<\/h2>/);
    assert.match(task.html_notes, /All 52 videos are done; keep &lt;source&gt; &amp; context\./);
    assert.match(task.html_notes, /Earlier task notes/);
    assert.match(task.html_notes, /href="https:\/\/example.com\/source"/);
    assert.match(task.notes, /All 52 videos are done; keep <source> & context\./);
  }
  assert.equal((await f.run("finish", { owner: "asana", id: "100", children: "101", evidence: "Jerami confirmed completion", summary: "All 52 videos are done; keep <source> & context." })).outcome, "complete");
  assert.deepEqual(f.writes, ["101", "100"]);
});

test("completed state without the saved summary remains pending and cannot close its parent", async t => {
  const f = await fixture(t);
  await f.run("bind", { owner: "asana", id: "100", "done-when": "Approved exports" });
  f.faults.ignoreSummary = true;
  const result = await f.run("finish", { owner: "asana", id: "100", children: "101", evidence: "Jerami confirmed completion" });
  assert.notEqual(result.code, 0);
  assert.match(result.error, /summary/);
  assert.equal(f.tasks.get("100").completed, false);
  assert.equal((await f.hook("Stop", { last_assistant_message: "The summary did not save." })).decision, "block");
  assert.equal((await f.run("check", { owner: "asana", id: "100" })).outcome, "pending");
  f.faults.ignoreSummary = false;
  assert.equal((await f.run("finish", { owner: "asana", id: "100", children: "101", evidence: "Jerami confirmed completion" })).outcome, "complete");
});

test("Linear closeout puts current completion before old review notes and detects later summary loss", async t => {
  const f = await fixture(t);
  await f.run("bind", { owner: "linear", id: "23M-1", "done-when": "The form works" });
  const result = await f.run("finish", { owner: "linear", id: "23M-1", children: "issue-2", evidence: "The form passed its checks" });
  assert.equal(result.outcome, "complete", result.error);
  assert.match(f.issues.get("issue-1").description, /^## Done\n\nThe form passed its checks\n\n## Earlier task notes/);
  assert.match(f.issues.get("issue-1").description, /\[Source\]\(https:\/\/example.com\/source\)/);
  f.issues.get("issue-2").description = "Review is pending again.";
  assert.equal((await f.run("check", { owner: "linear", id: "23M-1" })).outcome, "pending");
});

test("the lifecycle CLI starts and finishes dated work through the existing closeout without closing its parent", async t => {
  const f = await fixture(t);
  const id = "11111111-1111-4111-a111-111111111111";
  f.issues.set(id, { ...structuredClone(f.issues.get("issue-2")), id, identifier: "23M-3", dueDate: "2026-11-04", project: { id: "project" }, description: "Attention: 20 min\n\n## Done when\n\nThe date survives shared closeout." });
  const context = await f.lifecycle("context", { id, owner: "linear" });
  assert.equal(context.task.dueDate, "2026-11-04", context.error);
  const started = await f.lifecycle("start", { id, owner: "linear" });
  assert.equal(started.binding.tasks[0].id, id, started.error);
  const finished = await f.lifecycle("finish", { id, owner: "linear", evidence: "The dated child passed its finish check." });
  assert.equal(finished.outcome, "complete", finished.error);
  assert.equal(finished.tasks[0].dueDate, "2026-11-04");
  const remaining = await f.run("bind", { owner: "linear", id: "23M-1", "done-when": "All required children pass." });
  assert.equal(remaining.outcome, "pending");
  assert.equal(remaining.tasks.find(x => x.id === "issue-1").completed, false);
});

test("free-Asana lifecycle CLI keeps dates and blocker links through the shared closeout", async t => {
  const f = await fixture(t);
  f.tasks.set("102", { ...structuredClone(f.tasks.get("101")), gid: "102", name: "Check source", completed: true });
  f.tasks.get("100").num_subtasks = 2;
  Object.assign(f.tasks.get("101"), {
    due_on: "2026-11-04",
    notes: "Keep the source.\n\nBlocked by\n\nCheck source\n\nDone when\n\nThe edit check passes.",
    html_notes: '<body>Keep the source.\n\n<h2>Blocked by</h2>\n\n<a data-asana-gid="102" data-asana-dynamic="false">Check source</a>\n\n<h2>Done when</h2>\n\nThe edit check passes.</body>',
  });
  const context = await f.lifecycle("context", { owner: "asana", id: "101" });
  assert.equal(context.blockers[0].gid, "102", context.error);
  const start = await f.lifecycle("start", { owner: "asana", id: "101" });
  assert.equal(start.binding.tasks[0].id, "101", start.error);
  const done = await f.lifecycle("finish", { owner: "asana", id: "101", evidence: "The dated edit passed its check." });
  assert.equal(done.outcome, "complete", done.error);
  assert.equal(done.tasks[0].dueDate, "2026-11-04");
  assert.match(done.tasks[0].html_notes, /data-asana-gid="102"/);
  assert.match(done.tasks[0].html_notes, /Keep the source/);
  const parent = await f.lifecycle("context", { owner: "asana", id: "100" });
  assert.equal(parent.task.completed, false);
});
