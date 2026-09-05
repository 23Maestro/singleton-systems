export const FINANCE_KINDS = ["income", "bill", "debt", "expense"] as const;
export type FinanceKind = (typeof FINANCE_KINDS)[number];

export const FINANCE_CATEGORIES = [
  "Income",
  "Bill",
  "Debt",
  "Child Support",
  "Food",
  "Gas",
  "Misc.",
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
