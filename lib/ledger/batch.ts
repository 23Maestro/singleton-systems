import { createHash } from "node:crypto";
import { applyCommand, commandSchema } from "./commands.ts";
import type { AppData } from "./types.ts";

// Keep batch and entry IDs stable across retries without sharing IDs with other routes.
function idFor(value: string): string {
  const hex = createHash("sha256").update(value).digest("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-a${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}

export type BatchEntry = { name: string; amount: number; date: string; category: string };

export function prepareExpenseBatch(batchId: string, entries: BatchEntry[]) {
  if (!/^[a-zA-Z0-9-]{20,100}$/.test(batchId)) throw new Error("Invalid batch ID.");
  if (!Array.isArray(entries) || entries.length < 1 || entries.length > 50) throw new Error("Choose 1 to 50 entries.");
  const commands = entries.map((entry, index) => commandSchema.parse({
    type: "entry", id: idFor(`expense-batch-entry-v1:${batchId}:${index}`),
    entry: { ...entry, type: "expense" },
  }));
  const hash = createHash("sha256").update(JSON.stringify(commands)).digest("hex");
  return { id: idFor(`expense-batch-v1:${batchId}`), hash, commands };
}

export function applyExpenseBatch(data: AppData, batch: ReturnType<typeof prepareExpenseBatch>, timestamp: string): AppData {
  return batch.commands.reduce((state, command) => applyCommand(state, command, timestamp), data);
}

// A changed ledger requires a fresh review; the database RPC handles concurrent writes
// and repeated confirmations atomically using its operation journal.
export async function commitExpenseBatch(options: {
  batchId: string;
  entries: BatchEntry[];
  reviewedRevision: number;
  timestamp: string;
  read: () => Promise<{ data: AppData; revision: number }>;
  commit: (input: { p_id: string; p_hash: string; p_revision: number; p_data: AppData; p_kind: "entry" }) => Promise<{ conflict?: boolean; replayed?: boolean; revision?: number }>;
}) {
  if (!Number.isSafeInteger(options.reviewedRevision) || options.reviewedRevision < 0) throw new Error("Invalid reviewed revision.");
  const batch = prepareExpenseBatch(options.batchId, options.entries);
  const current = await options.read();
  // The RPC must still see a prior matching ID to recognize a retry after a lost reply.
  // Its locked revision check prevents a new save when the review has become stale.
  const data = applyExpenseBatch(current.data, batch, options.timestamp);
  const result = await options.commit({ p_id: batch.id, p_hash: batch.hash,
    p_revision: options.reviewedRevision, p_data: data, p_kind: "entry" });
  if (result.conflict) throw new Error("Finances changed. Review the batch again.");
  if (!Number.isSafeInteger(result.revision)) throw new Error("Save was not confirmed.");
  return { revision: result.revision!, replayed: Boolean(result.replayed) };
}
