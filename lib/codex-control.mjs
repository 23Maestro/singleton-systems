import os from "node:os";
import path from "node:path";
import WebSocket from "ws";
import { z } from "zod";
import { taskRequestMessage, taskRequestSchema, outreachDraftSchema, verifyOutreachDraft } from "./task-request.ts";

export async function connectCodexControl(options = {}) {
  const socketPath = options.socketPath ?? process.env.CODEX_TASK_CONTROL_SOCKET ?? path.join(os.homedir(), ".codex/app-server-control/app-server-control.sock");
  if (!path.isAbsolute(socketPath) || socketPath.includes(":")) throw new Error("Choose a local Codex control socket.");
  const timeoutMs = options.timeoutMs ?? 15000;
  const ws = new WebSocket(`ws+unix://${socketPath}:/`, { maxPayload: 16 * 1024 * 1024 });
  const pending = new Map();
  let serial = 0;
  const failAll = error => { for (const request of pending.values()) { clearTimeout(request.timer); request.reject(error); } pending.clear(); };
  ws.on("message", raw => {
    let message;
    try { message = JSON.parse(raw.toString()); } catch { failAll(new Error("Codex returned invalid protocol data.")); ws.terminate(); return; }
    // Server approval/input requests belong in Codex. The relay never approves them.
    if (message.method) return;
    const waiting = pending.get(message.id);
    if (!waiting) return;
    clearTimeout(waiting.timer); pending.delete(message.id);
    if (message.error) waiting.reject(new Error(`Codex rejected the request: ${message.error.message}`));
    else waiting.resolve(message.result);
  });
  ws.on("error", error => failAll(error));
  ws.on("close", () => failAll(new Error("Codex control connection closed.")));
  const call = (method, params) => new Promise((resolve, reject) => {
    const id = ++serial;
    const timer = setTimeout(() => { pending.delete(id); reject(new Error(`Codex ${method} timed out; read back before retrying a write.`)); }, timeoutMs);
    pending.set(id, { resolve, reject, timer });
    try { ws.send(JSON.stringify({ id, method, params })); } catch (error) { clearTimeout(timer); pending.delete(id); reject(error); }
  });
  try {
    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => { ws.terminate(); reject(new Error("Codex control connection timed out.")); }, timeoutMs);
      ws.once("open", () => { clearTimeout(timer); resolve(); });
      ws.once("error", error => { clearTimeout(timer); reject(error); });
      ws.once("close", () => { clearTimeout(timer); reject(new Error("Codex control connection closed before initialization.")); });
    });
    await call("initialize", { clientInfo: { name: "singleton_task_lifecycle", title: "Singleton task lifecycle", version: "1.0.0" }, capabilities: { experimentalApi: true } });
    ws.send(JSON.stringify({ method: "initialized" }));
  } catch (error) { ws.terminate(); throw error; }
  return { call, close() { ws.close(); const timer = setTimeout(() => ws.terminate(), 1000); timer.unref(); } };
}

export async function findCodexRequest(client, input) {
  const request = taskRequestSchema.parse(input), marker = `[singleton-request:${request.requestId}]`;
  let cursor;
  const seen = new Set();
  for (let page = 0; page < 20; page++) {
    const result = await client.call("thread/turns/list", { threadId: request.destination.threadId, itemsView: "full", sortDirection: "desc", limit: 20, ...(cursor ? { cursor } : {}) });
    if (!Array.isArray(result.data)) throw new Error("Codex thread history is incomplete.");
    const matches = result.data.filter(turn => turn.items?.some(item => item.type === "userMessage" && item.content?.some(part => part.type === "text" && part.text?.includes(marker))));
    if (matches.length > 1) throw new Error("More than one turn matches this request. Review the assigned chat.");
    if (matches.length) {
      const turn = matches[0];
      if (!turn.items.some(item => item.type === "userMessage" && item.content?.some(part => part.type === "text" && part.text === taskRequestMessage(request)))) throw new Error("The existing request has different source context.");
      return turn;
    }
    cursor = result.nextCursor;
    if (!cursor) return null;
    if (seen.has(cursor)) throw new Error("Codex thread history repeated a page.");
    seen.add(cursor);
  }
  throw new Error("Codex history is too long to confirm this request. Narrow the source; do not replay it.");
}

export async function startCodexRequest(client, input) {
  const request = taskRequestSchema.parse(input);
  const prior = await findCodexRequest(client, request);
  if (prior) return prior;
  const { thread } = await client.call("thread/read", { threadId: request.destination.threadId, includeTurns: false });
  if (thread?.id !== request.destination.threadId || !["idle", "notLoaded"].includes(thread.status?.type)) throw new Error("The assigned Codex chat is busy or missing. Leave the request queued.");
  const resumed = await client.call("thread/resume", { threadId: request.destination.threadId, excludeTurns: true });
  if (resumed.thread?.id !== request.destination.threadId) throw new Error("Codex resumed a different chat.");
  const { turn } = await client.call("turn/start", { threadId: request.destination.threadId, clientUserMessageId: request.requestId, input: [{ type: "text", text: taskRequestMessage(request) }], outputSchema: z.toJSONSchema(outreachDraftSchema) });
  if (!turn?.id) throw new Error("Codex did not confirm the assigned turn.");
  return turn;
}

export function codexDraftResult(turn, envelope) {
  if (turn?.status !== "completed") throw new Error(`The Codex turn is ${turn?.status ?? "unconfirmed"}; its draft is not complete.`);
  const messages = turn.items?.filter(item => item.type === "agentMessage");
  const message = messages?.findLast(item => item.phase === "final_answer") ?? messages?.at(-1);
  if (!message?.text) throw new Error("The completed Codex turn has no final draft.");
  return verifyOutreachDraft(JSON.parse(message.text), envelope);
}
