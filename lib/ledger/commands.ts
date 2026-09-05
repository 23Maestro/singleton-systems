import { z } from "zod";
import type { AppData, PlanEntry } from "./types.ts";
import { recordEntry, recordPayment, subtract, validateEntry } from "./ledger.ts";
import { todayISO } from "./dates.ts";

const money = z.number().finite().min(-999999999).max(999999999).refine(n => Math.abs(n * 100 - Math.round(n * 100)) < 0.00001, "Use two decimal places.");
const date = z.string().date();
const item = z.object({
  id: z.string().min(1).max(100), name: z.string().trim().min(1).max(160),
  amount: money.nonnegative(), amountDisplay: z.string().max(160).optional(),
  dueDate: z.union([date, z.literal("")]),
  recurrence: z.enum(["none", "weekly", "biweekly", "semimonthly", "monthly", "annually"]).optional(),
  dueDay: z.number().int().min(1).max(31).optional(), secondDueDay: z.number().int().min(1).max(31).optional(),
  paymentAmount: money.positive().optional(), notes: z.string().max(2000),
  planType: z.enum(["bill", "subscription", "advance", "debt"]), isActive: z.boolean(),
  balance: money.optional(), balanceHigh: money.optional(),
  balanceQualifier: z.enum(["around", "or-less", "range"]).optional(),
  balanceDisplay: z.string().max(160).optional(), isApproximate: z.boolean().optional(),
  tag: z.string().max(160).optional(), settlementAmount: money.nonnegative().optional(),
  settlementDisplay: z.string().max(160).optional(),
}).strict();

export const commandSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("entry"), id: z.string().uuid(), entry: z.object({
    type: z.enum(["income", "expense"]), name: z.string().trim().min(1).max(160),
    amount: money.positive(), date, category: z.enum(["Family", "Food", "Health", "Household", "Miscellaneous", "Personal", "Transportation", "Work"]).optional(),
  }).strict() }).strict(),
  z.object({ type: z.literal("payment"), id: z.string().uuid(), entryId: z.string().min(1).max(100), amount: money.positive(), date }).strict(),
  z.object({ type: z.literal("reconcile"), id: z.string().uuid(), amount: money }).strict(),
  z.object({ type: z.literal("save-item"), id: z.string().uuid(), entry: item, previous: item.optional() }).strict(),
]);
export type LedgerCommand = z.infer<typeof commandSchema>;

export function applyCommand(data: AppData, command: LedgerCommand, timestamp: string): AppData {
  if (command.type === "entry") return recordEntry(data, { ...command.entry, category: command.entry.type === "income" ? undefined : command.entry.category ?? "Miscellaneous", id: command.id, status: "paid", createdAt: timestamp });
  if (command.type === "payment") return recordPayment(data, command.entryId, command.amount, command.date, command.id);
  if (command.type === "reconcile") {
    if (data.transactions.some(t => t.id === command.id)) return data;
    const difference = subtract(command.amount, data.currentBalance);
    return { ...data, balanceSet: true, currentBalance: command.amount, transactions: [{
      id: command.id, type: "reconcile", name: "Balance updated", amount: Math.abs(difference),
      signedAmount: difference, date: todayISO(), status: "paid", createdAt: timestamp,
    }, ...data.transactions] };
  }
  const entry = command.entry as PlanEntry;
  validateEntry(entry);
  const existing = data.planEntries.find(e => e.id === entry.id);
  // Check fields independent of JSONB's key order.
  const canonical = (value: unknown): string => JSON.stringify(value, Object.keys(value as object).sort());
  if (command.previous && (!existing || canonical(existing) !== canonical(command.previous)))
    throw new Error("This item changed. Close and reopen the editor to use its latest values.");
  if (existing && !command.previous) throw new Error("This item already exists. Reopen its editor.");
  return { ...data, planEntries: existing ? data.planEntries.map(e => e.id === entry.id ? entry : e) : [...data.planEntries, entry] };
}
