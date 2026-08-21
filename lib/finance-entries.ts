import { supabaseRest } from "@/lib/supabase-rest";

export const FINANCE_KINDS = ["income", "bill", "debt", "expense"] as const;
export type FinanceKind = (typeof FINANCE_KINDS)[number];

export const FINANCE_CATEGORIES = [
  "Income",
  "Bill",
  "Debt",
  "Child Support",
  "Food",
  "Gas",
  "Other",
] as const;
export type FinanceCategory = (typeof FINANCE_CATEGORIES)[number];

export type FinanceEntry = {
  id: string;
  kind: FinanceKind;
  name: string;
  category: FinanceCategory;
  amount: number;
  entryDate: string | null;
  paid: boolean;
  createdAt: string;
  updatedAt: string;
};

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
  return fromRow(rows[0]);
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

  const rows: FinanceEntryRow[] = await supabaseRest(`finance_entries?id=eq.${id}`, {
    method: "PATCH",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify(body),
  });
  return fromRow(rows[0]);
}

export async function deleteFinanceEntry(id: string): Promise<void> {
  await supabaseRest(`finance_entries?id=eq.${id}`, { method: "DELETE" });
}

export async function promoteDebtPayment(
  id: string,
  amount: number,
): Promise<{ debt: FinanceEntry; payment: FinanceEntry }> {
  const rows: FinanceEntryRow[] = await supabaseRest(`finance_entries?id=eq.${id}&select=*`);
  const debtRow = rows[0];
  if (!debtRow || debtRow.kind !== "debt") {
    throw new Error("Promote is only valid on a debt entry.");
  }
  const remaining = typeof debtRow.amount === "string" ? parseFloat(debtRow.amount) : debtRow.amount;
  const nextAmount = Math.max(0, remaining - amount);

  const updatedRows: FinanceEntryRow[] = await supabaseRest(`finance_entries?id=eq.${id}`, {
    method: "PATCH",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({ amount: nextAmount, updated_at: new Date().toISOString() }),
  });

  const paymentRows: FinanceEntryRow[] = await supabaseRest("finance_entries", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({
      kind: "expense",
      name: `${debtRow.name} — extra payment`,
      category: "Debt",
      amount,
      entry_date: new Date().toISOString().slice(0, 10),
      paid: true,
    }),
  });

  return { debt: fromRow(updatedRows[0]), payment: fromRow(paymentRows[0]) };
}
