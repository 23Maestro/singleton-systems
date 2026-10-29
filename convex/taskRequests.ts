import { internalMutation, internalQuery } from "./_generated/server.js";
import type { MutationCtx, QueryCtx } from "./_generated/server.js";
import { v } from "convex/values";
import { z } from "zod";
import { taskRequestSchema, verifyOutreachDraft } from "../lib/task-request.ts";
import { canonicalJson } from "../lib/transactions/canonical.mjs";

const commandSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("enqueue"), request: taskRequestSchema }).strict(),
  z.object({ action: z.literal("claim"), workerId: z.uuid(), requestId: z.uuid().optional() }).strict(),
  z.object({ action: z.literal("resume"), workerId: z.uuid(), requestId: z.uuid() }).strict(),
  z.object({ action: z.literal("checkpoint"), workerId: z.uuid(), requestId: z.uuid(), transaction: z.string().max(300000), turnId: z.string().min(1).max(160).optional(), status: z.enum(["queued", "delivering", "working", "completed", "needs_review", "failed"]), result: z.unknown().optional(), error: z.string().max(2000).optional() }).strict(),
]);
const find = (ctx: QueryCtx | MutationCtx, requestId: string) => ctx.db.query("taskRequests").withIndex("by_request", q => q.eq("requestId", requestId)).unique();

export const read = internalQuery({ args: { requestId: v.string() }, handler: (ctx, args) => {
  z.uuid().parse(args.requestId);
  return find(ctx, args.requestId);
} });

export const update = internalMutation({ args: { command: v.string() }, handler: async (ctx, args) => {
  const command = commandSchema.parse(JSON.parse(args.command)), now = Date.now();
  if (command.action === "enqueue") {
    const payload = canonicalJson(command.request), requestId = command.request.requestId;
    const before = await find(ctx, requestId);
    if (before) {
      if (before.payload !== payload) throw new Error("The request ID belongs to a different source or destination.");
      return before;
    }
    const id = await ctx.db.insert("taskRequests", { requestId, payload, status: "queued", createdAt: now, updatedAt: now });
    return ctx.db.get(id);
  }
  if (command.action === "claim") {
    const row = command.requestId ? await find(ctx, command.requestId) : await ctx.db.query("taskRequests").withIndex("by_status_created", q => q.eq("status", "queued")).order("asc").first();
    if (!row || row.status !== "queued") return null;
    await ctx.db.patch(row._id, { status: "delivering", leaseOwner: command.workerId, leaseUntil: now + 120000, updatedAt: now });
    return ctx.db.get(row._id);
  }
  const row = await find(ctx, command.requestId);
  if (!row) throw new Error("The task request is missing.");
  if (command.action === "resume") {
    if (!["delivering", "working", "needs_review"].includes(row.status)) throw new Error("This request cannot be resumed by a relay.");
    if (row.leaseOwner !== command.workerId && (row.leaseUntil ?? 0) > now) throw new Error("Another relay owns this request.");
    await ctx.db.patch(row._id, { status: row.status === "needs_review" ? "delivering" : row.status, leaseOwner: command.workerId, leaseUntil: now + 120000, updatedAt: now });
    // Keep delivering/working. A lost dispatch must reconcile against the chat.
    return ctx.db.get(row._id);
  }
  if (row.leaseOwner !== command.workerId || (row.leaseUntil ?? 0) <= now || !["delivering", "working"].includes(row.status)) throw new Error("This relay no longer owns the request.");
  const transaction = JSON.parse(command.transaction);
  if (transaction.transactionId !== row.requestId || !Array.isArray(transaction.mutationLedger)) throw new Error("The transaction does not match this request.");
  if (command.status === "queued" && transaction.attempts?.some((attempt: { outcome: string }) => ["prepared", "applied", "verified", "recovered"].includes(attempt.outcome))) throw new Error("An attempted dispatch cannot be queued again without reconciliation.");
  const result = command.result === undefined ? undefined : verifyOutreachDraft(command.result, JSON.parse(row.payload));
  if (command.status === "completed" && (transaction.status !== "completed" || !result || !["codex-turn", "sheet-draft"].every(ownerId => transaction.mutationLedger.some((entry: { ownerId: string; status: string }) => entry.ownerId === ownerId && entry.status === "verified")))) throw new Error("Completion needs verified chat and Sheet receipts plus the matching draft.");
  if (row.turnId && command.turnId && row.turnId !== command.turnId) throw new Error("Preserve the assigned Codex turn.");
  await ctx.db.patch(row._id, { status: command.status, transaction: command.transaction, ...(command.turnId ? { turnId: command.turnId } : {}), ...(result ? { result: canonicalJson(result) } : {}), error: command.error, ...(command.status === "queued" ? { leaseOwner: undefined, leaseUntil: undefined } : { leaseUntil: now + 120000 }), updatedAt: now });
  return ctx.db.get(row._id);
} });
