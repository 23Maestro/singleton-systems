import { taskRequestSchema } from "./task-request.ts";
import { bindOutreachRequest, readOutreachSheet, returnOutreachDraft } from "./outreach-sheet.mjs";
import { connectCodexControl, codexDraftResult, findCodexRequest, startCodexRequest } from "./codex-control.mjs";
import { canonicalJson, hashValue } from "./transactions/contract.mjs";
import { createTransaction, executeTransaction } from "./transactions/engine.mjs";

export function taskQueueClient(role = "backend", options = {}) {
  const url = options.url ?? process.env.TASK_REQUEST_QUEUE_URL ?? (process.env.NEXT_PUBLIC_CONVEX_SITE_URL ? `${process.env.NEXT_PUBLIC_CONVEX_SITE_URL}/task-requests` : null);
  const token = options.token ?? process.env[role === "relay" ? "TASK_REQUEST_RELAY_TOKEN" : "TASK_REQUEST_BACKEND_TOKEN"];
  if (!url || !token || new URL(url).protocol !== "https:") throw new Error("The hosted task queue needs its HTTPS URL and scoped token.");
  const fetcher = options.fetch ?? fetch;
  const send = async (endpoint, body) => {
    const response = await fetcher(endpoint, { method: body ? "POST" : "GET", headers: { Authorization: `Bearer ${token}`, ...(body ? { "Content-Type": "application/json" } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}), signal: AbortSignal.timeout(20000), cache: "no-store" });
    if (!response.ok) throw new Error(`The hosted task queue rejected this operation (${response.status}).`);
    return response.json();
  };
  return { read(requestId) { const endpoint = new URL(url); endpoint.searchParams.set("requestId", requestId); return send(endpoint); }, command(body) { return send(url, body); } };
}

export async function enqueueOutreachRequest(input, options = {}) {
  const request = taskRequestSchema.parse(input);
  if (options.approvedHash !== hashValue(request)) throw new Error("Review the source and assigned chat; supply the exact approved request hash.");
  const queue = options.queue ?? taskQueueClient();
  const prior = await queue.read(request.requestId); // Verify access before a Sheet write.
  if (prior && prior.payload !== canonicalJson(request)) throw new Error("This request ID already has different context.");
  if (prior) return prior;
  await bindOutreachRequest(request, options);
  await queue.command({ action: "enqueue", request });
  const saved = await queue.read(request.requestId);
  if (!saved || saved.payload !== canonicalJson(request)) throw new Error("The queue did not confirm the request. Read back before retrying.");
  return saved;
}

export function outreachTransaction(input) {
  const request = taskRequestSchema.parse(input);
  if (request.workflow !== "outreach-followup") throw new Error("This workflow has no relay adapter yet.");
  return createTransaction({ transactionId: request.requestId, idempotencyKey: hashValue(request), intent: "Return an unsent follow-up draft", lane: "AI Consultant", route: "task-lifecycle", declaredOwners: [
    { ownerId: "codex-turn", uri: `codex://threads/${request.destination.threadId}`, dependsOn: [] },
    { ownerId: "sheet-draft", uri: request.returnTo.uri, dependsOn: ["codex-turn"] },
  ], expectedMutations: [
    { ownerId: "codex-turn", operation: "draft-follow-up", input: request },
    { ownerId: "sheet-draft", operation: "return-draft", input: { recordId: request.source.recordId, requestId: request.requestId, sourceRevision: request.source.revision } },
  ], preconditions: [{ preconditionId: "source-and-chat-reviewed", status: "passed" }], reviewGates: [] });
}

export async function processOutreachRequest(row, options = {}) {
  const request = taskRequestSchema.parse(JSON.parse(row.payload));
  if (row.requestId !== request.requestId) throw new Error("The queue row belongs to a different request.");
  const transaction = row.transaction ? JSON.parse(row.transaction) : outreachTransaction(request);
  if (transaction.transactionId !== request.requestId || transaction.idempotencyKey !== hashValue(request)) throw new Error("The retained transaction belongs to different context.");
  const queue = options.queue ?? taskQueueClient("relay");
  const workerId = options.workerId;
  if (!workerId || row.leaseOwner !== workerId) throw new Error("Claim this exact request before processing it.");
  let client = options.client, result, turnId = row.turnId;
  const sheets = options.sheets;
  const nativeEntry = () => transaction.mutationLedger.find(entry => entry.ownerId === "codex-turn");
  const checkpoint = async (status, error) => {
    turnId = nativeEntry()?.afterState?.id ?? turnId;
    return queue.command({ action: "checkpoint", requestId: request.requestId, workerId, status, transaction: canonicalJson(transaction), ...(turnId ? { turnId } : {}), ...(result ? { result } : {}), ...(error ? { error: error.slice(0, 2000) } : {}) });
  };
  try {
    const sheet = await readOutreachSheet({ sheets });
    const leads = sheet.leads.filter(lead => lead.leadId === request.source.recordId);
    const lead = leads[0];
    if (leads.length !== 1 || lead.sourceRevision !== request.source.revision || lead.requestId !== request.requestId || lead.assignedChat !== `${request.destination.hostId}:${request.destination.threadId}` || !["Queued", "Working", "Draft ready"].includes(lead.requestStatus)) throw new Error("The source lead or assigned request changed. Review before dispatch.");
    client ??= await connectCodexControl(options);
    if (!transaction.attempts.some(attempt => attempt.outcome === "prepared")) {
      const { thread } = await client.call("thread/read", { threadId: request.destination.threadId, includeTurns: false });
      if (thread?.id !== request.destination.threadId || !["idle", "notLoaded"].includes(thread.status?.type)) { await checkpoint("queued", "The assigned chat is busy. The request remains queued."); return { outcome: "queued", transaction }; }
      // Acquire the selected chat before preparing a write. A writer conflict stays queued.
      const resumed = await client.call("thread/resume", { threadId: request.destination.threadId, excludeTurns: true });
      if (resumed.thread?.id !== request.destination.threadId) throw new Error("Codex did not resume the assigned chat.");
    }
    const oldTurn = nativeEntry()?.afterState;
    if (nativeEntry()?.status === "verified") result = codexDraftResult(oldTurn, request);
    const readLead = async () => (await readOutreachSheet({ sheets })).leads.find(lead => lead.leadId === request.source.recordId) ?? null;
    const verifyLead = lead => Boolean(result && lead && lead.sourceRevision === request.source.revision && lead.requestId === request.requestId && lead.assignedChat === `${request.destination.hostId}:${request.destination.threadId}` && lead.requestStatus === "Draft ready" && lead.draftBaseline[0] === `${result.subject}\n\n${result.body}` && lead.draftBaseline[1] === request.requestId && lead.draftBaseline[2] === request.source.revision);
    const adapters = {
      "codex-turn": {
        async plan() { return request; },
        async apply() { return startCodexRequest(client, request); },
        async readback() { return findCodexRequest(client, request); },
        async verify({ readback }) { try { result = codexDraftResult(readback, request); return { ok: true, evidence: { threadId: request.destination.threadId, turnId: readback.id } }; } catch (error) { return { ok: false, error: error.message }; } },
        async receipt({ readback }) { return { threadId: request.destination.threadId, turnId: readback.id, requestId: request.requestId, sourceRevision: request.source.revision }; },
      },
      "sheet-draft": {
        async plan() { return { recordId: request.source.recordId, requestId: request.requestId, sourceRevision: request.source.revision }; },
        async apply() { return returnOutreachDraft(request, result, { sheets }); },
        readback: readLead,
        async verify({ readback }) { return { ok: verifyLead(readback), evidence: readback ? { recordId: readback.leadId, requestId: readback.requestId } : null, error: "The returned Sheet draft was not confirmed." }; },
        async receipt({ readback }) { return { owner: "google-sheet", recordId: readback.leadId, requestId: request.requestId, sourceRevision: request.source.revision }; },
      },
    };
    await executeTransaction(transaction, adapters, { checkpoint: () => checkpoint(turnId || nativeEntry()?.afterState?.id ? "working" : "delivering") });
    if (transaction.status === "completed") await executeTransaction(transaction, adapters, { mode: "reconcile" });
    const state = nativeEntry()?.afterState?.status;
    const status = transaction.status === "completed" ? "completed" : ["inProgress", "in_progress"].includes(state) ? "working" : "needs_review";
    await checkpoint(status, status === "working" ? undefined : transaction.error);
    return { outcome: status, requestId: request.requestId, turnId, result, transaction };
  } catch (error) {
    const attempted = transaction.attempts.some(attempt => ["prepared", "applied", "verified", "recovered"].includes(attempt.outcome));
    const sourceChanged = /source lead|assigned request/.test(error.message);
    await checkpoint(attempted || sourceChanged ? "needs_review" : "queued", error.message);
    return { outcome: attempted || sourceChanged ? "needs_review" : "queued", error: error.message, transaction };
  } finally {
    if (!options.client) client?.close();
  }
}
