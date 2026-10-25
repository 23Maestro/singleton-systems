import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { hashValue } from "./transactions/contract.mjs";
import { loadTransactionState, saveTransactionState, withTransactionStateLock } from "./transactions/state-store.mjs";
import { prepareReviewStateDirectory } from "./reviews/state-path.mjs";

export function closeoutFile(root, session) {
  if (!session) throw new Error("A chat session ID is required.");
  const directory = process.env.TASK_CLOSEOUT_STATE_DIR || path.join(os.homedir(), ".local/state/singleton-systems/task-closeout");
  const file = path.join(directory, `${hashValue({ root: fs.realpathSync(root), session })}.json`);
  prepareReviewStateDirectory(file, false);
  return file;
}

export function taskCloseoutHook(payload) {
  if (!payload.session_id) return null;
  const file = closeoutFile(payload.cwd || process.cwd(), payload.session_id);
  const state = loadTransactionState(file);
  const pending = Object.values(state?.tasks || {}).filter(t => t.outcome !== "complete");
  if (["UserPromptSubmit", "SessionStart"].includes(payload.hook_event_name)) {
    return { context: "- [task-closeout] For selected work, find its existing Asana or Linear task. Use node --env-file=.env.local scripts/task-closeout.mjs bind --session SESSION --turn TURN --owner asana|linear --id TASK --done-when 'plain finish check'. Use the current session/turn IDs. Read docs/agents/issue-tracker.md. No named skill is needed. Finish verified children before the parent; record blocked or review work with defer. Research alone needs no task binding."
      + "\n- [task-entry] For a new Development plan, use scripts/task-lifecycle.mjs plan --file PLAN, then create --file PLAN --approved-hash HASH after scope review. For an exact Linear task, start --id TASK --session SESSION --turn TURN loads its current discussion, subtasks and blockers, then binds the same closeout. Research alone starts no work."
      + pending.map(t => `\n- [task-closeout-pending] ${t.owner}: ${t.title} ${t.url} — ${t.reason || "Closeout was not confirmed. Check this task when resuming its work."}`).join("") };
  }
  if (payload.hook_event_name !== "Stop") return null;
  const missed = pending.filter(t => t.turn === payload.turn_id && t.outcome !== "deferred");
  if (!missed.length) return null;
  const reason = `Task closeout is still pending: ${missed.map(t => `${t.title} (${t.url})`).join("; ")}. Run task-closeout check, then finish only the proven work or defer with the exact remaining step. Do not start unrelated work.`;
  return payload.stop_hook_active === true
    ? { continue: false, stopReason: reason, systemMessage: reason }
    : { decision: "block", reason };
}

async function asanaTree(id, parent = null, rows = []) {
  const { asanaRequest } = await import("./command-center-asana.ts");
  if (!/^\d+$/.test(id) || rows.length >= 200 || rows.some(t => t.id === id)) throw new Error("Invalid or repeated Asana task.");
  const { data } = await asanaRequest(`tasks/${id}?opt_fields=name,notes,html_notes,completed,workspace.gid,parent.gid,permalink_url,num_subtasks`);
  if (data?.gid !== id || typeof data.completed !== "boolean" || data.workspace?.gid !== "1216086803382161" || (parent && data.parent?.gid !== parent)) {
    throw new Error("Asana task identity, workspace or parent did not match.");
  }
  rows.push({ id, parent, title: data.name, url: data.permalink_url, completed: data.completed, notes: data.notes, html_notes: data.html_notes });
  let offset;
  const seen = new Set();
  let count = 0;
  do {
    const page = await asanaRequest(`tasks/${id}/subtasks?limit=100${offset ? `&offset=${encodeURIComponent(offset)}` : ""}`);
    if (!Array.isArray(page.data)) throw new Error("Asana subtask list is missing.");
    for (const child of page.data) { await asanaTree(child.gid, id, rows); count++; }
    offset = page.next_page?.offset;
    if (offset && seen.has(offset)) throw new Error("Asana repeated a subtask page.");
    seen.add(offset);
  } while (offset);
  if (Number.isInteger(data.num_subtasks) && data.num_subtasks !== count) throw new Error("Asana subtask list is incomplete.");
  return rows;
}

async function linearTree(selector, parent = null, rows = []) {
  const { linearGraphql } = await import("./linear-api.ts");
  if (typeof selector !== "string" || !/^[\w-]+$/.test(selector) || rows.length >= 200) throw new Error("Invalid Linear task.");
  let cursor = null;
  const seen = new Set();
  let record;
  do {
    const { issue } = await linearGraphql(`query($id:String!,$after:String){issue(id:$id){id identifier title description url parent{id} state{name type} team{key states{nodes{id name type}}} children(first:100,after:$after){nodes{id} pageInfo{hasNextPage endCursor}}}}`, { id: selector, after: cursor });
    if (!issue || (issue.id !== selector && issue.identifier !== selector) || issue.team?.key !== "23M" || typeof issue.state?.type !== "string" || (parent && issue.parent?.id !== parent)) throw new Error("Linear task identity, team or parent did not match.");
    if (!record) {
      if (rows.some(t => t.id === issue.id)) throw new Error("Linear repeated a task.");
      record = { id: issue.id, parent, title: issue.title, url: issue.url, description: issue.description, completed: issue.state.type === "completed", doneState: issue.team.states.nodes.find(t => t.name === "Done" && t.type === "completed")?.id };
      rows.push(record);
    }
    if (!Array.isArray(issue.children?.nodes) || typeof issue.children.pageInfo?.hasNextPage !== "boolean") throw new Error("Linear subtask list is missing.");
    for (const child of issue.children.nodes) await linearTree(child.id, issue.id, rows);
    cursor = issue.children.pageInfo.hasNextPage ? issue.children.pageInfo.endCursor : null;
    if (issue.children.pageInfo.hasNextPage && (!cursor || seen.has(cursor))) throw new Error("Linear repeated a subtask page.");
    seen.add(cursor);
  } while (cursor);
  return rows;
}

const normalizedText = value => (value ?? "").replace(/\s+/g, " ").trim();
const escapeHtml = value => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

function summaryPrefix(owner, summary) {
  return owner === "asana"
    ? `<body><h2>Done</h2>\n\n${escapeHtml(summary)}\n\n<h2>Earlier task notes</h2>\n\n`
    : `## Done\n\n${summary}\n\n## Earlier task notes\n\n`;
}

function summaryMatches(task, owner, summary) {
  const value = owner === "asana" ? task.html_notes : task.description;
  return normalizedText(value).startsWith(normalizedText(summaryPrefix(owner, summary)))
    && (owner !== "asana" || normalizedText(task.notes).includes(normalizedText(summary)));
}

function summaryEdit(task, owner, summary) {
  const prefix = summaryPrefix(owner, summary);
  if (owner === "linear") return { description: prefix + (task.description ?? "") };
  const prior = typeof task.html_notes === "string" && /^<body(?:\s[^>]*)?>[\s\S]*<\/body>$/.test(task.html_notes)
    ? task.html_notes.replace(/^<body(?:\s[^>]*)?>/, "").replace(/<\/body>$/, "")
    : escapeHtml(task.notes ?? "");
  return { html_notes: prefix + prior + "</body>" };
}

export async function taskCloseout(command, options, root = process.cwd()) {
  const file = closeoutFile(root, options.session);
  return withTransactionStateLock(file, async () => {
    const state = loadTransactionState(file) || { schemaVersion: 1, tasks: {} };
    const key = `${options.owner}:${options.id}`;
    if (!["asana", "linear"].includes(options.owner)) throw new Error("Choose Asana or Linear.");
    const readTree = options.owner === "asana" ? asanaTree : linearTree;
    if (!options.turn) throw new Error("A turn ID is required.");
    if (!["bind", "check", "finish", "defer"].includes(command)) throw new Error("Unknown closeout command.");
    if (command === "bind" && !options["done-when"]?.trim()) throw new Error("State what counts as finished.");
    let entry = state.tasks[key];
    if (command !== "bind" && !entry) throw new Error("Bind this task before closing it.");
    if (command === "defer") {
      if (!options.reason?.trim()) throw new Error("State the exact remaining work or missing approval.");
      Object.assign(entry, { outcome: "deferred", reason: options.reason, turn: options.turn });
      saveTransactionState(file, state);
      return { outcome: "deferred", reason: entry.reason, statePath: file };
    }
    if (entry) {
      Object.assign(entry, { outcome: "pending", turn: options.turn });
      delete entry.reason;
      saveTransactionState(file, state);
    }
    let rows = await readTree(options.id);
    if (entry && entry.id !== rows[0].id) throw new Error("The owner returned a different task from the bound one.");
    if (command === "bind") {
      entry = state.tasks[key] = { owner: options.owner, id: rows[0].id, title: rows[0].title, url: rows[0].url, doneWhen: options["done-when"], turn: options.turn, outcome: "pending" };
      saveTransactionState(file, state);
    }
    if (command === "finish") {
      if (!options.evidence?.trim()) throw new Error("Completion needs proof or Jerami's confirmation.");
      const selected = new Set([rows[0].id, ...(options.children?.split(",").filter(Boolean) || [])]);
      if ([...selected].some(id => !rows.some(t => t.id === id))) throw new Error("A selected child is outside this task.");
      const summary = (options.summary ?? options.evidence).trim();
      if (!summary || summary.length > 10000) throw new Error("Use a current completion summary of 1–10000 characters.");
      entry.summary = { text: summary, taskIds: [...selected] };
      saveTransactionState(file, state);
      for (const task of [...rows].reverse().filter(t => selected.has(t.id))) {
        if (rows.some(t => t.parent === task.id && !t.completed)) throw new Error("A required child is still open.");
        if (!task.completed || !summaryMatches(task, options.owner, summary)) {
          entry.outcome = "pending";
          entry.prepared = task.id;
          saveTransactionState(file, state);
          if (options.owner === "asana") {
            const { asanaRequest } = await import("./command-center-asana.ts");
            await asanaRequest(`tasks/${task.id}`, "PUT", { completed: true, ...summaryEdit(task, options.owner, summary) });
            const { data } = await asanaRequest(`tasks/${task.id}?opt_fields=completed,notes,html_notes,parent.gid`);
            if (data?.gid !== task.id || data.completed !== true || (task.parent && data.parent?.gid !== task.parent)) throw new Error("Asana did not confirm completion.");
            if (!summaryMatches(data, options.owner, summary)) throw new Error("Asana did not confirm the completion summary in notes and html_notes.");
            Object.assign(task, { notes: data.notes, html_notes: data.html_notes });
          } else {
            const { linearGraphql } = await import("./linear-api.ts");
            if (!task.doneState) throw new Error("Linear Done state is unavailable.");
            const result = await linearGraphql(`mutation($id:String!,$input:IssueUpdateInput!){issueUpdate(id:$id,input:$input){success}}`, { id: task.id, input: { stateId: task.doneState, ...summaryEdit(task, options.owner, summary) } });
            if (result.issueUpdate?.success !== true) throw new Error("Linear rejected completion.");
            const { issue } = await linearGraphql(`query($id:String!){issue(id:$id){id description state{type} parent{id}}}`, { id: task.id });
            if (issue?.id !== task.id || issue.state?.type !== "completed" || (task.parent && issue.parent?.id !== task.parent)) throw new Error("Linear did not confirm completion.");
            if (!summaryMatches(issue, options.owner, summary)) throw new Error("Linear did not confirm the completion summary.");
            task.description = issue.description;
          }
          task.completed = true;
          delete entry.prepared;
          saveTransactionState(file, state);
        }
      }
      entry.evidence = options.evidence;
      rows = await readTree(options.id);
    }
    const summariesSaved = !entry.summary || entry.summary.taskIds.every(id => {
      const task = rows.find(t => t.id === id);
      return task && summaryMatches(task, options.owner, entry.summary.text);
    });
    const outcome = rows.every(t => t.completed) && summariesSaved ? "complete" : "pending";
    Object.assign(entry, { outcome, turn: options.turn, checkedAt: new Date().toISOString(), readbackHash: hashValue(rows) });
    saveTransactionState(file, state);
    if (command === "finish" && outcome !== "complete") throw new Error("A task is still open, reopened, or missing its completion summary in the final readback.");
    return { outcome, tasks: rows, statePath: file };
  }, { timeoutMs: 1000 });
}
