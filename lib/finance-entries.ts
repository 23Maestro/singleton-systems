import { supabaseRest } from "@/lib/supabase-rest";
import type {
  FinanceCategory,
  FinanceEntry,
  FinanceKind,
} from "@/lib/finance-contract";

export { FINANCE_CATEGORIES, FINANCE_KINDS } from "@/lib/finance-contract";
export type { FinanceCategory, FinanceEntry, FinanceKind } from "@/lib/finance-contract";

type FinanceEntryRow = {
  id: string;
  kind: FinanceKind;
  name: string;
  category: FinanceCategory;
  amount: number | string;
  entry_date: string | null;
  paid: boolean;
  created_at: string;
  updated_at: string;
};

function fromRow(row: FinanceEntryRow): FinanceEntry {
  return {
    id: row.id,
    kind: row.kind,
    name: row.name,
    category: row.category,
    amount: typeof row.amount === "string" ? parseFloat(row.amount) : row.amount,
    entryDate: row.entry_date,
    paid: row.paid,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function requireRow(row: FinanceEntryRow | undefined, operation: string): FinanceEntryRow {
  if (!row) throw new Error(`${operation} returned no finance entry.`);
  return row;
}

export async function listFinanceEntries(): Promise<FinanceEntry[]> {
  const rows: FinanceEntryRow[] = await supabaseRest(
    "finance_entries?select=*&order=entry_date.desc.nullslast,created_at.desc",
  );
  return (rows || []).map(fromRow);
}

export type NewFinanceEntry = {
  kind: FinanceKind;
  name: string;
  category: FinanceCategory;
  amount: number;
  entryDate: string | null;
};

export async function createFinanceEntry(entry: NewFinanceEntry): Promise<FinanceEntry> {
  const rows: FinanceEntryRow[] = await supabaseRest("finance_entries", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({
      kind: entry.kind,
      name: entry.name,
      category: entry.category,
      amount: entry.amount,
      entry_date: entry.entryDate,
      paid: entry.kind === "expense" || entry.kind === "income",
    }),
  });
  return fromRow(requireRow(rows[0], "Create"));
}

export type FinanceEntryPatch = Partial<{
  name: string;
  category: FinanceCategory;
  amount: number;
  entryDate: string | null;
  paid: boolean;
}>;

export async function updateFinanceEntry(id: string, patch: FinanceEntryPatch): Promise<FinanceEntry> {
  const body: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (patch.name !== undefined) body.name = patch.name;
  if (patch.category !== undefined) body.category = patch.category;
  if (patch.amount !== undefined) body.amount = patch.amount;
  if (patch.entryDate !== undefined) body.entry_date = patch.entryDate;
  if (patch.paid !== undefined) body.paid = patch.paid;

  const rows: FinanceEntryRow[] = await supabaseRest(`finance_entries?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify(body),
  });
  return fromRow(requireRow(rows[0], "Update"));
}

export async function deleteFinanceEntry(id: string): Promise<void> {
  await supabaseRest(`finance_entries?id=eq.${encodeURIComponent(id)}`, { method: "DELETE" });
}

export async function promoteDebtPayment(
  id: string,
  amount: number,
  entryDate: string,
): Promise<{ debt: FinanceEntry; payment: FinanceEntry }> {
  const result: { debt: FinanceEntryRow; payment: FinanceEntryRow } = await supabaseRest(
    "rpc/promote_finance_debt_payment",
    {
      method: "POST",
      body: JSON.stringify({
        p_debt_id: id,
        p_amount: amount,
        p_entry_date: entryDate,
      }),
    },
  );

  return {
    debt: fromRow(requireRow(result?.debt, "Debt promotion")),
    payment: fromRow(requireRow(result?.payment, "Debt payment")),
  };
}
