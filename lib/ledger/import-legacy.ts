import type { AppData, Category } from "./types.ts";
import { migrate } from "./ledger.ts";
import { isDate } from "./dates.ts";

export type LegacyRow = { id: string; kind: string; name: string; category: string; amount: string | number; entry_date: string | null; paid: boolean; created_at: string; updated_at: string };
const aliases: Record<string, string> = { "Macy's (PRA)": "Macy's PRA", "GEICO (lapsed)": "GEICO", Daycare: "Constellation Academy" };
const categories: Record<string, Category> = { Income: "Work", Food: "Food", Gas: "Transportation", "Child Support": "Family" };
export function importLegacy(rows: LegacyRow[], catalog: AppData): AppData {
  const data = migrate(structuredClone(catalog), catalog);
  data.balanceSet = false; data.currentBalance = 0;
  data.transactions = []; data.plannedPayments = [];
  // The saved data has no reported bank balance. Do not infer one from old income.
  for (const row of rows) {
    const amount = Number(row.amount);
    if (!Number.isFinite(amount) || amount < 0) throw new Error("Invalid legacy amount.");
    const name = aliases[row.name] ?? row.name;
    const match = data.planEntries.find(e => e.name.toLowerCase() === name.toLowerCase());
    if (row.kind === "income" || row.kind === "expense" || row.paid) {
      if (!row.entry_date || !isDate(row.entry_date)) throw new Error("Legacy payment date requires review.");
      data.transactions.push({ id: row.id, type: row.kind === "income" ? "income" : "expense", name: row.name, amount,
        date: row.entry_date, category: categories[row.category] ?? "Miscellaneous", status: "paid", createdAt: row.created_at });
    }
    if (row.kind === "income" || row.kind === "expense") continue;
    if (match) {
      // Preserve saved live figures. The old row is also retained verbatim in legacy_snapshot.
      if (row.kind === "debt") { match.balance = amount; match.amount = amount; delete match.balanceHigh; delete match.balanceQualifier; delete match.isApproximate; delete match.balanceDisplay; }
      else if (!row.paid) match.amount = amount;
      continue;
    }
    data.planEntries.push({ id: row.id, name: row.name, amount, dueDate: row.entry_date ?? "", notes: "Preserved from the previous ledger.",
      planType: row.kind === "debt" ? "debt" : "bill", isActive: row.name !== "Subscriptions",
      ...(row.kind === "debt" ? { balance: amount } : {}),
      ...(row.name === "Subscriptions" ? { tag: "Legacy total · individual subscriptions are listed separately" } : {}),
    });
  }
  return data;
}
