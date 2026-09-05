import "server-only";
import { createHash } from "node:crypto";
import { supabaseRest } from "@/lib/supabase-rest";
import { applyCommand, type LedgerCommand } from "./commands";
import type { AppData } from "./types";

export type Snapshot = { data: AppData; revision: number };
export async function readLedger(): Promise<Snapshot> {
  const rows = await supabaseRest("finance_ledger_state?id=eq.personal&select=data,revision", { cache: "no-store", signal: AbortSignal.timeout(15000) });
  if (!rows?.[0]) throw new Error("Finances migration has not been applied.");
  return rows[0];
}

export async function executeCommand(command: LedgerCommand): Promise<Snapshot> {
  const canonical = (v: unknown): unknown => Array.isArray(v) ? v.map(canonical) : v && typeof v === "object"
    ? Object.fromEntries(Object.entries(v).sort(([a], [b]) => a.localeCompare(b)).map(([k, value]) => [k, canonical(value)])) : v;
  const hash = createHash("sha256").update(JSON.stringify(canonical(command))).digest("hex");
  const prior = await supabaseRest(`finance_ledger_operations?id=eq.${command.id}&select=request_hash`, { cache: "no-store", signal: AbortSignal.timeout(15000) });
  if (prior?.length) {
    if (prior[0].request_hash !== hash) throw new Error("This confirmation was already saved with different details. Reopen the form.");
    return readLedger();
  }
  const timestamp = new Date().toISOString();
  for (let attempt = 0; attempt < 3; attempt++) {
    const current = await readLedger();
    const data = applyCommand(current.data, command, timestamp);
    const result = await supabaseRest("rpc/commit_finance_ledger", {
      method: "POST", cache: "no-store", signal: AbortSignal.timeout(15000),
      body: JSON.stringify({ p_id: command.id, p_hash: hash, p_revision: current.revision, p_data: data, p_kind: command.type }),
    });
    if (!result.conflict) return { data: result.data, revision: result.revision };
  }
  throw new Error("Finances changed on another device. Try again.");
}
