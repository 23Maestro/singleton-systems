# Personal Finance Ledger Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `/finances`, a Supabase-backed personal ledger (income, bills, debts, ad-hoc expenses) replacing the static `FinanceLedger.jsx` prototype, with a bi-weekly pay cycle, a debt-only "promote extra payment" action, and a responsive Singleton Systems–branded UI.

**Architecture:** One flat `finance_entries` table (kind: income/bill/debt/expense) accessed only through `lib/finance-entries.ts` (wraps `lib/supabase-rest.ts`), exposed via three Next.js route handlers under `app/api/finances/`, rendered by one client component `app/finances/FinancesApp.tsx`. Pure bi-weekly cycle math lives in `lib/finance-cycle.ts`, verified with a standalone Node check script (this repo has no test framework — see Global Constraints).

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, Tailwind, `lucide-react` icons, Supabase (PostgREST via `lib/supabase-rest.ts`), zod for request validation, native `<input type="date">` (no date-picker library).

## Global Constraints

- No test framework is configured in this repo (Jest/Vitest/etc.). Verification per task is `npm run typecheck`, `npm run lint`, and a manual curl or browser check against the dev server — per `CLAUDE.md` Conventions.
- Supabase access goes only through `lib/supabase-rest.ts` — no new client, no `@supabase/supabase-js`.
- Server secrets (`SUPABASE_SERVICE_ROLE_KEY`) stay inside `app/api/**/route.ts` and `lib/**` — never imported into a client component.
- Category taxonomy is fixed: `Income, Bill, Debt, Child Support, Food, Gas, Other`. Do not add categories.
- Pay cycle is bi-weekly, fixed: 1st–15th, then 16th–end of month. Not weekly, not aligned to Upwork's submission day.
- "Promote" (pull extra money onto a balance from available funds) exists on `debt`-kind entries only — never on `bill` or `income`.
- Route is personal-tool style like `/home-tasks` and `/linear-inbox`: `robots: { index: false, follow: false }`, no additional auth layer (matches existing convention in this repo).
- Dynamic API route params are `Promise<{ id: string }>` (Next 15 convention already used in `app/api/linear/inbox/draft/[id]/route.ts`).

---

### Task 1: Supabase migration — `finance_entries` table

**Files:**
- Create: `supabase/migrations/20260821000000_finance_entries.sql`

**Interfaces:**
- Produces: table `public.finance_entries` with columns `id uuid`, `kind text`, `name text`, `category text`, `amount numeric(12,2)`, `entry_date date` (nullable), `paid boolean`, `created_at timestamptz`, `updated_at timestamptz`. Locked to service-role only (RLS enabled, no policies, `anon`/`authenticated` revoked) — same pattern as `linear_inbox_submissions`.

- [ ] **Step 1: Write the migration file**

```sql
create table if not exists public.finance_entries (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('income', 'bill', 'debt', 'expense')),
  name text not null,
  category text not null check (category in ('Income', 'Bill', 'Debt', 'Child Support', 'Food', 'Gas', 'Other')),
  amount numeric(12,2) not null check (amount >= 0),
  entry_date date,
  paid boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists finance_entries_kind_idx
  on public.finance_entries (kind);

create index if not exists finance_entries_entry_date_idx
  on public.finance_entries (entry_date);

alter table public.finance_entries enable row level security;

revoke all privileges on table public.finance_entries from anon, authenticated;
```

- [ ] **Step 2: Verify the migration is well-formed**

Run: `node -e "require('fs').readFileSync('supabase/migrations/20260821000000_finance_entries.sql','utf8')" && echo "readable"`
Expected: `readable` (this repo has no local Supabase CLI apply step wired into `npm test`; the file is applied the same way prior migrations in this directory were — outside this plan's scope).

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/20260821000000_finance_entries.sql
git commit -m "feat(finances): add finance_entries table migration"
```

---

### Task 2: Bi-weekly cycle math — `lib/finance-cycle.ts`

**Files:**
- Create: `lib/finance-cycle.ts`
- Create: `scripts/check-finance-cycle.mjs`

**Interfaces:**
- Produces: `getCycleForDate(date: Date): FinanceCycle` where `FinanceCycle = { start: string; end: string; label: string }` (ISO `YYYY-MM-DD` strings), `cycleProgress(cycle: FinanceCycle, today: Date): number` (0–100), `daysLeftInCycle(cycle: FinanceCycle, today: Date): number`, `daysInMonth(year: number, month: number): number`.
- Consumed by: Task 5 (`FinancesApp.tsx`).

- [ ] **Step 1: Write `lib/finance-cycle.ts`**

```typescript
export type FinanceCycle = {
  start: string;
  end: string;
  label: string;
};

const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
] as const;

function pad2(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

function toISODate(year: number, month: number, day: number): string {
  return `${year}-${pad2(month + 1)}-${pad2(day)}`;
}

export function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/** Bi-weekly cycle fixed to the calendar: 1st-15th, then 16th-end of month. */
export function getCycleForDate(date: Date): FinanceCycle {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  const lastDay = daysInMonth(year, month);
  const monthLabel = MONTH_LABELS[month];

  if (day <= 15) {
    return {
      start: toISODate(year, month, 1),
      end: toISODate(year, month, 15),
      label: `${monthLabel} 1-15`,
    };
  }
  return {
    start: toISODate(year, month, 16),
    end: toISODate(year, month, lastDay),
    label: `${monthLabel} 16-${lastDay}`,
  };
}

export function cycleProgress(cycle: FinanceCycle, today: Date): number {
  const start = new Date(`${cycle.start}T00:00:00`);
  const end = new Date(`${cycle.end}T00:00:00`);
  const totalDays = Math.round((end.getTime() - start.getTime()) / 86400000) + 1;
  const elapsed = Math.round((today.getTime() - start.getTime()) / 86400000) + 1;
  const clamped = Math.min(totalDays, Math.max(1, elapsed));
  return Math.round((clamped / totalDays) * 100);
}

export function daysLeftInCycle(cycle: FinanceCycle, today: Date): number {
  const end = new Date(`${cycle.end}T00:00:00`);
  const diff = Math.round((end.getTime() - today.getTime()) / 86400000);
  return Math.max(0, diff);
}
```

- [ ] **Step 2: Write the standalone check script**

```javascript
import assert from "node:assert/strict";
import {
  cycleProgress,
  daysInMonth,
  daysLeftInCycle,
  getCycleForDate,
} from "../lib/finance-cycle.ts";

// Second-half cycle: Aug 19, 2026 -> 16-31
const secondHalf = getCycleForDate(new Date(2026, 7, 19));
assert.equal(secondHalf.start, "2026-08-16");
assert.equal(secondHalf.end, "2026-08-31");
assert.equal(secondHalf.label, "Aug 16-31");

// First-half cycle: Aug 3, 2026 -> 1-15
const firstHalf = getCycleForDate(new Date(2026, 7, 3));
assert.equal(firstHalf.start, "2026-08-01");
assert.equal(firstHalf.end, "2026-08-15");
assert.equal(firstHalf.label, "Aug 1-15");

// Short month, second half: Feb 20, 2027 (non-leap) -> 16-28
const shortMonth = getCycleForDate(new Date(2027, 1, 20));
assert.equal(shortMonth.end, "2027-02-28");

// Leap year boundary
assert.equal(daysInMonth(2028, 1), 29);
assert.equal(daysInMonth(2027, 1), 28);

// Days left / progress math on the second-half Aug cycle at day 19
assert.equal(daysLeftInCycle(secondHalf, new Date(2026, 7, 19)), 12);
assert.equal(daysLeftInCycle(secondHalf, new Date(2026, 7, 31)), 0);
const progress = cycleProgress(secondHalf, new Date(2026, 7, 19));
assert.ok(progress > 0 && progress <= 100, `expected 0 < progress <= 100, got ${progress}`);

console.log("finance-cycle checks passed");
```

- [ ] **Step 3: Run the check and verify it passes**

Run: `node --experimental-strip-types scripts/check-finance-cycle.mjs`
Expected: `finance-cycle checks passed`

- [ ] **Step 4: Typecheck**

Run: `npm run typecheck`
Expected: no errors mentioning `lib/finance-cycle.ts`

- [ ] **Step 5: Commit**

```bash
git add lib/finance-cycle.ts scripts/check-finance-cycle.mjs
git commit -m "feat(finances): add bi-weekly cycle math with a runnable check"
```

---

### Task 3: Data access layer — `lib/finance-entries.ts`

**Files:**
- Create: `lib/finance-entries.ts`

**Interfaces:**
- Consumes: `supabaseRest(path, init)` from `@/lib/supabase-rest` (existing).
- Produces: `FINANCE_KINDS: readonly ["income","bill","debt","expense"]`, `FinanceKind`, `FINANCE_CATEGORIES: readonly [...]`, `FinanceCategory`, `FinanceEntry` type (`id, kind, name, category, amount, entryDate, paid, createdAt, updatedAt`), `listFinanceEntries(): Promise<FinanceEntry[]>`, `NewFinanceEntry` type, `createFinanceEntry(entry: NewFinanceEntry): Promise<FinanceEntry>`, `FinanceEntryPatch` type, `updateFinanceEntry(id: string, patch: FinanceEntryPatch): Promise<FinanceEntry>`, `deleteFinanceEntry(id: string): Promise<void>`, `promoteDebtPayment(id: string, amount: number): Promise<{ debt: FinanceEntry; payment: FinanceEntry }>`.
- Consumed by: Task 4 (API routes).

- [ ] **Step 1: Write `lib/finance-entries.ts`**

```typescript
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
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: no errors mentioning `lib/finance-entries.ts`

- [ ] **Step 3: Commit**

```bash
git add lib/finance-entries.ts
git commit -m "feat(finances): add finance_entries data access layer"
```

---

### Task 4: API routes

**Files:**
- Create: `app/api/finances/route.ts`
- Create: `app/api/finances/[id]/route.ts`
- Create: `app/api/finances/[id]/promote/route.ts`

**Interfaces:**
- Consumes: everything from Task 3 (`lib/finance-entries.ts`).
- Produces: `GET /api/finances` → `{ entries: FinanceEntry[] }`; `POST /api/finances` (body `{ kind, name, category, amount, entryDate }`) → `{ entry: FinanceEntry }` (201); `PATCH /api/finances/:id` (body: any subset of `{ name, category, amount, entryDate, paid }`) → `{ entry: FinanceEntry }`; `DELETE /api/finances/:id` → `{ ok: true }`; `POST /api/finances/:id/promote` (body `{ amount }`) → `{ debt: FinanceEntry, payment: FinanceEntry }`.
- Consumed by: Task 5 (`FinancesApp.tsx`).

- [ ] **Step 1: Write `app/api/finances/route.ts`**

```typescript
import { NextResponse } from "next/server";
import { z } from "zod";
import {
  FINANCE_CATEGORIES,
  FINANCE_KINDS,
  createFinanceEntry,
  listFinanceEntries,
} from "@/lib/finance-entries";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const createSchema = z.object({
  kind: z.enum(FINANCE_KINDS),
  name: z.string().trim().min(1),
  category: z.enum(FINANCE_CATEGORIES),
  amount: z.number().positive(),
  entryDate: z.string().date().nullable().default(null),
});

export async function GET() {
  try {
    const entries = await listFinanceEntries();
    return NextResponse.json({ entries });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  const parsed = createSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  try {
    const entry = await createFinanceEntry(parsed.data);
    return NextResponse.json({ entry }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}
```

- [ ] **Step 2: Write `app/api/finances/[id]/route.ts`**

```typescript
import { NextResponse } from "next/server";
import { z } from "zod";
import { FINANCE_CATEGORIES, deleteFinanceEntry, updateFinanceEntry } from "@/lib/finance-entries";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const patchSchema = z.object({
  name: z.string().trim().min(1).optional(),
  category: z.enum(FINANCE_CATEGORIES).optional(),
  amount: z.number().positive().optional(),
  entryDate: z.string().date().nullable().optional(),
  paid: z.boolean().optional(),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const payload = await request.json().catch(() => null);
  const parsed = patchSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  try {
    const entry = await updateFinanceEntry(id, parsed.data);
    return NextResponse.json({ entry });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await deleteFinanceEntry(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}
```

- [ ] **Step 3: Write `app/api/finances/[id]/promote/route.ts`**

```typescript
import { NextResponse } from "next/server";
import { z } from "zod";
import { promoteDebtPayment } from "@/lib/finance-entries";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const promoteSchema = z.object({ amount: z.number().positive() });

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const payload = await request.json().catch(() => null);
  const parsed = promoteSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  try {
    const result = await promoteDebtPayment(id, parsed.data.amount);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 400 });
  }
}
```

- [ ] **Step 4: Typecheck**

Run: `npm run typecheck`
Expected: no errors mentioning `app/api/finances/`

- [ ] **Step 5: Start the dev server and manually verify the CRUD + promote flow**

Run: `npm run dev` (leave running)

Then, in another shell, with the dev server up on `http://localhost:3000`:

```bash
# Create a debt with no payment plan (Klarna-style)
curl -s -X POST http://localhost:3000/api/finances \
  -H "Content-Type: application/json" \
  -d '{"kind":"debt","name":"Klarna","category":"Debt","amount":413.51,"entryDate":null}'
```

Expected: JSON body `{"entry":{...,"kind":"debt","name":"Klarna","amount":413.51,"entryDate":null,...}}` — copy the returned `id`.

```bash
# Promote $51.17 against it (replace ID_HERE with the id from above)
curl -s -X POST http://localhost:3000/api/finances/ID_HERE/promote \
  -H "Content-Type: application/json" \
  -d '{"amount":51.17}'
```

Expected: JSON body with `debt.amount` equal to `362.34` and a `payment` object with `kind: "expense"`, `category: "Debt"`, `amount: 51.17`.

```bash
# List and confirm both rows are present
curl -s http://localhost:3000/api/finances | node -e "process.stdin.once('data', d => console.log(JSON.parse(d).entries.length))"
```

Expected: a number >= 2.

- [ ] **Step 6: Commit**

```bash
git add app/api/finances
git commit -m "feat(finances): add finance CRUD and promote API routes"
```

---

### Task 5: Finances page — layout, page shell, and client UI

**Files:**
- Create: `app/finances/layout.tsx`
- Create: `app/finances/page.tsx`
- Create: `app/finances/FinancesApp.tsx`

**Interfaces:**
- Consumes: `GET/POST /api/finances`, `PATCH/DELETE /api/finances/:id`, `POST /api/finances/:id/promote` (Task 4); `getCycleForDate`, `cycleProgress`, `daysLeftInCycle` (Task 2); `FINANCE_CATEGORIES`, `FinanceCategory`, `FinanceEntry`, `FinanceKind` types (Task 3).
- Produces: the `/finances` route.

- [ ] **Step 1: Write `app/finances/layout.tsx`**

```typescript
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Finances",
  description: "Personal income, bills, and debt ledger.",
  robots: {
    index: false,
    follow: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F2EFE9" },
    { media: "(prefers-color-scheme: dark)", color: "#121212" },
  ],
};

export default function FinancesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
```

- [ ] **Step 2: Write `app/finances/page.tsx`**

```typescript
import FinancesApp from "./FinancesApp";

export default function FinancesPage() {
  return <FinancesApp />;
}
```

- [ ] **Step 3: Write `app/finances/FinancesApp.tsx`**

```typescript
"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowUpCircle, Check, Circle, Pencil, TrendingDown, TrendingUp, X } from "lucide-react";
import {
  FINANCE_CATEGORIES,
  type FinanceCategory,
  type FinanceEntry,
  type FinanceKind,
} from "@/lib/finance-entries";
import { cycleProgress, daysLeftInCycle, getCycleForDate } from "@/lib/finance-cycle";

const INK = "#121212";
const SURFACE = "#1C1B18";
const SURFACE_2 = "#242220";
const BORDER = "#332F29";
const GOLD = "#C99A3B";
const GREEN = "#5C9575";
const RUST = "#B5533C";
const TEXT = "#F2EFE9";
const MUTED = "#9C958A";

const CAT_COLOR: Record<FinanceCategory, string> = {
  Income: GREEN,
  Bill: RUST,
  Debt: "#C0724F",
  "Child Support": GOLD,
  Food: GREEN,
  Gas: "#7C9BC9",
  Other: MUTED,
};

const EXPENSE_CATEGORIES: FinanceCategory[] = ["Food", "Gas", "Child Support", "Other"];
const BILL_CATEGORIES: FinanceCategory[] = ["Bill", "Child Support"];

function fmt(n: number): string {
  const neg = n < 0;
  const v = Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return (neg ? "-$" : "$") + v;
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

type LogFilter = "all" | "bill" | "debt";
type AddKind = "income" | "expense" | "bill" | "debt";

export default function FinancesApp() {
  const [entries, setEntries] = useState<FinanceEntry[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [panel, setPanel] = useState<"income" | "expense" | null>(null);
  const [addKind, setAddKind] = useState<AddKind>("expense");
  const [amount, setAmount] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState<FinanceCategory>("Food");
  const [entryDate, setEntryDate] = useState(todayISO());
  const [hasNoDate, setHasNoDate] = useState(false);
  const [filter, setFilter] = useState<LogFilter>("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [promotingId, setPromotingId] = useState<string | null>(null);
  const [promoteAmount, setPromoteAmount] = useState("");

  useEffect(() => {
    fetch("/api/finances")
      .then((res) => res.json())
      .then((data) => {
        setEntries(data.entries || []);
        setLoaded(true);
      });
  }, []);

  const incomeEntries = useMemo(
    () => [...entries].filter((e) => e.kind === "income").sort((a, b) => b.amount - a.amount),
    [entries],
  );
  const billEntries = useMemo(() => entries.filter((e) => e.kind === "bill"), [entries]);
  const debtEntries = useMemo(() => entries.filter((e) => e.kind === "debt"), [entries]);
  const expenseEntries = useMemo(() => entries.filter((e) => e.kind === "expense"), [entries]);

  const confirmedIncome = useMemo(() => incomeEntries.reduce((s, e) => s + e.amount, 0), [incomeEntries]);
  const pendingBillsTotal = useMemo(
    () => billEntries.filter((e) => !e.paid).reduce((s, e) => s + e.amount, 0),
    [billEntries],
  );
  const loggedSpend = useMemo(() => {
    const paidBills = billEntries.filter((e) => e.paid).reduce((s, e) => s + e.amount, 0);
    const spend = expenseEntries.reduce((s, e) => s + e.amount, 0);
    return paidBills + spend;
  }, [billEntries, expenseEntries]);
  const available = confirmedIncome - loggedSpend - pendingBillsTotal;

  const cycle = useMemo(() => getCycleForDate(new Date()), []);
  const progress = useMemo(() => cycleProgress(cycle, new Date()), [cycle]);
  const daysLeft = useMemo(() => daysLeftInCycle(cycle, new Date()), [cycle]);

  const logEntries = useMemo(() => {
    const pool =
      filter === "all"
        ? [...billEntries, ...debtEntries, ...expenseEntries]
        : filter === "bill"
          ? billEntries
          : debtEntries;
    return [...pool].sort((a, b) => {
      const aTime = new Date(a.entryDate || a.createdAt).getTime();
      const bTime = new Date(b.entryDate || b.createdAt).getTime();
      return bTime - aTime;
    });
  }, [filter, billEntries, debtEntries, expenseEntries]);

  function openPanel(type: "income" | "expense") {
    setPanel(type);
    setAmount("");
    setName("");
    setEntryDate(todayISO());
    setHasNoDate(false);
    if (type === "income") {
      setAddKind("income");
      setCategory("Income");
    } else {
      setAddKind("expense");
      setCategory("Food");
    }
  }

  async function submitEntry() {
    const val = parseFloat(amount);
    if (!val || val <= 0 || !name.trim()) return;
    const kind: FinanceKind =
      addKind === "income" ? "income" : addKind === "bill" ? "bill" : addKind === "debt" ? "debt" : "expense";
    const resolvedCategory = kind === "income" ? "Income" : kind === "debt" ? "Debt" : category;
    const resolvedDate = kind === "debt" && hasNoDate ? null : entryDate;

    const res = await fetch("/api/finances", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind, name: name.trim(), category: resolvedCategory, amount: val, entryDate: resolvedDate }),
    });
    if (!res.ok) return;
    const { entry } = await res.json();
    setEntries((prev) => [entry, ...prev]);
    setPanel(null);
  }

  async function togglePaid(entry: FinanceEntry) {
    const res = await fetch(`/api/finances/${entry.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paid: !entry.paid }),
    });
    if (!res.ok) return;
    const { entry: updated } = await res.json();
    setEntries((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
  }

  async function removeEntry(id: string) {
    const res = await fetch(`/api/finances/${id}`, { method: "DELETE" });
    if (!res.ok) return;
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }

  async function saveEdit(
    id: string,
    patch: { name: string; category: FinanceCategory; amount: number; entryDate: string | null },
  ) {
    const res = await fetch(`/api/finances/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!res.ok) return;
    const { entry: updated } = await res.json();
    setEntries((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
    setEditingId(null);
  }

  async function submitPromote(id: string) {
    const val = parseFloat(promoteAmount);
    if (!val || val <= 0) return;
    const res = await fetch(`/api/finances/${id}/promote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: val }),
    });
    if (!res.ok) return;
    const { debt, payment } = await res.json();
    setEntries((prev) => [payment, ...prev.map((e) => (e.id === debt.id ? debt : e))]);
    setPromotingId(null);
    setPromoteAmount("");
  }

  if (!loaded) {
    return (
      <div style={{ backgroundColor: INK, color: MUTED, minHeight: "100vh" }} className="flex items-center justify-center font-sans">
        Loading ledger…
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: INK, color: TEXT, minHeight: "100vh" }} className="font-sans">
      <div className="max-w-5xl mx-auto px-4 md:px-8 pt-6 pb-24">
        <div className="flex items-baseline justify-between mb-1">
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: TEXT }}>Ledger</h1>
          <span className="text-xs uppercase tracking-widest" style={{ color: MUTED }}>Singleton Systems</span>
        </div>
        <p className="text-sm mb-4" style={{ color: MUTED }}>Pay cycle · {cycle.label}</p>

        <div className="mb-5 pt-3 pb-4 px-1" style={{ borderTop: `2px dashed ${BORDER}` }}>
          <div className="flex justify-between text-xs mb-2" style={{ color: MUTED }}>
            <span>{daysLeft} days left in cycle</span>
          </div>
          <div className="w-full h-1.5 rounded-full" style={{ backgroundColor: SURFACE_2 }}>
            <div className="h-1.5 rounded-full transition-all" style={{ width: `${progress}%`, backgroundColor: GOLD }} />
          </div>
        </div>

        <div className="rounded-2xl p-5 mb-5" style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}` }}>
          <div className="text-xs uppercase tracking-widest mb-1" style={{ color: MUTED }}>Available right now</div>
          <div className="text-4xl font-bold tabular-nums mb-4" style={{ color: available >= 0 ? TEXT : RUST }}>
            {fmt(available)}
          </div>
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div>
              <div style={{ color: MUTED }}>Confirmed in</div>
              <div className="tabular-nums font-semibold" style={{ color: GREEN }}>{fmt(confirmedIncome)}</div>
            </div>
            <div>
              <div style={{ color: MUTED }}>Logged spend</div>
              <div className="tabular-nums font-semibold" style={{ color: RUST }}>{fmt(loggedSpend)}</div>
            </div>
            <div>
              <div style={{ color: MUTED }}>Pending bills</div>
              <div className="tabular-nums font-semibold" style={{ color: GOLD }}>{fmt(pendingBillsTotal)}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6 md:max-w-sm">
          <button
            onClick={() => openPanel("income")}
            className="flex items-center justify-center gap-2 rounded-xl py-3.5 font-semibold text-sm"
            style={{ backgroundColor: GREEN, color: INK }}
          >
            <TrendingUp size={16} strokeWidth={2.5} /> Log income
          </button>
          <button
            onClick={() => openPanel("expense")}
            className="flex items-center justify-center gap-2 rounded-xl py-3.5 font-semibold text-sm"
            style={{ backgroundColor: GOLD, color: INK }}
          >
            <TrendingDown size={16} strokeWidth={2.5} /> Log spend
          </button>
        </div>

        {panel && (
          <div className="rounded-2xl p-4 mb-6" style={{ backgroundColor: SURFACE_2, border: `1px solid ${BORDER}` }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold" style={{ color: TEXT }}>
                {panel === "income" ? "New income" : "New spend"}
              </span>
              <button onClick={() => setPanel(null)} style={{ color: MUTED }}><X size={18} /></button>
            </div>

            {panel === "expense" && (
              <div className="flex flex-wrap gap-2 mb-3">
                {(["expense", "bill", "debt"] as AddKind[]).map((k) => (
                  <button
                    key={k}
                    onClick={() => {
                      setAddKind(k);
                      setCategory(k === "bill" ? "Bill" : k === "debt" ? "Debt" : "Food");
                    }}
                    className="text-xs px-3 py-1.5 rounded-full font-medium capitalize"
                    style={{
                      backgroundColor: addKind === k ? GOLD : "transparent",
                      color: addKind === k ? INK : MUTED,
                      border: `1px solid ${addKind === k ? GOLD : BORDER}`,
                    }}
                  >
                    {k}
                  </button>
                ))}
              </div>
            )}

            <input
              autoFocus
              inputMode="decimal"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full text-2xl font-bold tabular-nums bg-transparent outline-none mb-3"
              style={{ color: TEXT, borderBottom: `1px solid ${BORDER}`, paddingBottom: "8px" }}
            />

            <input
              placeholder={panel === "income" ? "Source (e.g. Catena Media)" : "Name"}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-sm bg-transparent outline-none mb-3"
              style={{ color: TEXT, borderBottom: `1px solid ${BORDER}`, paddingBottom: "8px" }}
            />

            {panel === "expense" && addKind !== "debt" && (
              <div className="flex flex-wrap gap-2 mb-3">
                {(addKind === "bill" ? BILL_CATEGORIES : EXPENSE_CATEGORIES).map((c) => (
                  <button
                    key={c}
                    onClick={() => setCategory(c)}
                    className="text-xs px-3 py-1.5 rounded-full font-medium"
                    style={{
                      backgroundColor: category === c ? CAT_COLOR[c] : "transparent",
                      color: category === c ? INK : MUTED,
                      border: `1px solid ${category === c ? CAT_COLOR[c] : BORDER}`,
                    }}
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}

            {addKind === "debt" && (
              <label className="flex items-center gap-2 text-xs mb-3" style={{ color: MUTED }}>
                <input type="checkbox" checked={hasNoDate} onChange={(e) => setHasNoDate(e.target.checked)} />
                No payment plan yet (open balance)
              </label>
            )}

            {!(addKind === "debt" && hasNoDate) && (
              <input
                type="date"
                value={entryDate}
                onChange={(e) => setEntryDate(e.target.value)}
                className="w-full text-sm bg-transparent outline-none mb-4"
                style={{ color: TEXT, borderBottom: `1px solid ${BORDER}`, paddingBottom: "8px", colorScheme: "dark" }}
              />
            )}

            <button onClick={submitEntry} className="w-full rounded-xl py-3 font-semibold text-sm" style={{ backgroundColor: GOLD, color: INK }}>
              Add entry
            </button>
          </div>
        )}

        {incomeEntries.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: MUTED }}>Income</h2>
            <div className="flex flex-wrap gap-3">
              {incomeEntries.map((entry) => (
                <IncomeCard key={entry.id} entry={entry} onDelete={() => removeEntry(entry.id)} />
              ))}
            </div>
          </div>
        )}

        <div className="mb-3 flex gap-2">
          {(["all", "bill", "debt"] as LogFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="text-xs px-3 py-1.5 rounded-full font-medium capitalize"
              style={{
                backgroundColor: filter === f ? GOLD : "transparent",
                color: filter === f ? INK : MUTED,
                border: `1px solid ${filter === f ? GOLD : BORDER}`,
              }}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="space-y-2 mb-6">
          {logEntries.length === 0 && <p className="text-sm italic" style={{ color: MUTED }}>Nothing here.</p>}
          {logEntries.map((entry) => (
            <LogRow
              key={entry.id}
              entry={entry}
              editing={editingId === entry.id}
              promoting={promotingId === entry.id}
              promoteAmount={promoteAmount}
              onEdit={() => setEditingId(entry.id)}
              onCancelEdit={() => setEditingId(null)}
              onSave={(patch) => saveEdit(entry.id, patch)}
              onDelete={() => removeEntry(entry.id)}
              onTogglePaid={entry.kind === "bill" ? () => togglePaid(entry) : undefined}
              onPromoteStart={entry.kind === "debt" ? () => setPromotingId(entry.id) : undefined}
              onPromoteCancel={() => {
                setPromotingId(null);
                setPromoteAmount("");
              }}
              onPromoteAmountChange={setPromoteAmount}
              onPromoteConfirm={() => submitPromote(entry.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function IncomeCard({ entry, onDelete }: { entry: FinanceEntry; onDelete: () => void }) {
  return (
    <div className="rounded-xl px-4 py-3 min-w-[160px]" style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}` }}>
      <div className="text-lg font-bold tabular-nums" style={{ color: GREEN }}>{fmt(entry.amount)}</div>
      <div className="text-sm truncate" style={{ color: TEXT }}>{entry.name}</div>
      <div className="flex items-center justify-between text-xs mt-1" style={{ color: MUTED }}>
        <span>{entry.entryDate || "—"}</span>
        <button onClick={onDelete} style={{ color: MUTED }}>remove</button>
      </div>
    </div>
  );
}

type LogRowProps = {
  entry: FinanceEntry;
  editing: boolean;
  promoting: boolean;
  promoteAmount: string;
  onEdit: () => void;
  onCancelEdit: () => void;
  onSave: (patch: { name: string; category: FinanceCategory; amount: number; entryDate: string | null }) => void;
  onDelete: () => void;
  onTogglePaid?: () => void;
  onPromoteStart?: () => void;
  onPromoteCancel: () => void;
  onPromoteAmountChange: (value: string) => void;
  onPromoteConfirm: () => void;
};

function LogRow(props: LogRowProps) {
  const { entry, editing, promoting, promoteAmount } = props;
  const [draftName, setDraftName] = useState(entry.name);
  const [draftCategory, setDraftCategory] = useState<FinanceCategory>(entry.category);
  const [draftAmount, setDraftAmount] = useState(String(entry.amount));
  const [draftDate, setDraftDate] = useState(entry.entryDate || "");

  useEffect(() => {
    setDraftName(entry.name);
    setDraftCategory(entry.category);
    setDraftAmount(String(entry.amount));
    setDraftDate(entry.entryDate || "");
  }, [entry, editing]);

  if (editing) {
    return (
      <div className="rounded-xl px-4 py-3" style={{ backgroundColor: SURFACE_2, border: `1px solid ${GOLD}` }}>
        <input
          value={draftName}
          onChange={(e) => setDraftName(e.target.value)}
          className="w-full text-sm bg-transparent outline-none mb-2"
          style={{ color: TEXT, borderBottom: `1px solid ${BORDER}` }}
        />
        <div className="flex flex-wrap gap-2 mb-2">
          {FINANCE_CATEGORIES.filter((c) => c !== "Income").map((c) => (
            <button
              key={c}
              onClick={() => setDraftCategory(c)}
              className="text-xs px-2.5 py-1 rounded-full"
              style={{
                backgroundColor: draftCategory === c ? CAT_COLOR[c] : "transparent",
                color: draftCategory === c ? INK : MUTED,
                border: `1px solid ${draftCategory === c ? CAT_COLOR[c] : BORDER}`,
              }}
            >
              {c}
            </button>
          ))}
        </div>
        <input
          inputMode="decimal"
          value={draftAmount}
          onChange={(e) => setDraftAmount(e.target.value)}
          className="w-full text-sm bg-transparent outline-none mb-2"
          style={{ color: TEXT, borderBottom: `1px solid ${BORDER}` }}
        />
        <input
          type="date"
          value={draftDate}
          onChange={(e) => setDraftDate(e.target.value)}
          className="w-full text-sm bg-transparent outline-none mb-3"
          style={{ color: TEXT, borderBottom: `1px solid ${BORDER}`, colorScheme: "dark" }}
        />

        {promoting ? (
          <div className="flex gap-2 mb-2">
            <input
              autoFocus
              inputMode="decimal"
              placeholder="Amount to promote"
              value={promoteAmount}
              onChange={(e) => props.onPromoteAmountChange(e.target.value)}
              className="flex-1 text-sm bg-transparent outline-none"
              style={{ color: TEXT, borderBottom: `1px solid ${GREEN}` }}
            />
            <button onClick={props.onPromoteConfirm} className="text-xs px-3 py-1.5 rounded-full font-semibold" style={{ backgroundColor: GREEN, color: INK }}>
              Confirm
            </button>
            <button onClick={props.onPromoteCancel} className="text-xs px-3 py-1.5 rounded-full" style={{ color: MUTED, border: `1px solid ${BORDER}` }}>
              Cancel
            </button>
          </div>
        ) : props.onPromoteStart ? (
          <button
            onClick={props.onPromoteStart}
            className="w-full mb-2 flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold"
            style={{ backgroundColor: "transparent", color: GREEN, border: `1px solid ${GREEN}` }}
          >
            <ArrowUpCircle size={14} /> Promote extra payment
          </button>
        ) : null}

        <div className="flex gap-2">
          <button
            onClick={() =>
              props.onSave({
                name: draftName.trim(),
                category: draftCategory,
                amount: parseFloat(draftAmount) || entry.amount,
                entryDate: draftDate || null,
              })
            }
            className="flex-1 rounded-lg py-2 text-xs font-semibold"
            style={{ backgroundColor: GOLD, color: INK }}
          >
            Save
          </button>
          <button onClick={props.onCancelEdit} className="flex-1 rounded-lg py-2 text-xs" style={{ color: MUTED, border: `1px solid ${BORDER}` }}>
            Cancel
          </button>
          <button onClick={props.onDelete} className="rounded-lg py-2 px-3 text-xs" style={{ color: RUST, border: `1px solid ${BORDER}` }}>
            Remove
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between rounded-xl px-4 py-3" style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}` }}>
      {props.onTogglePaid ? (
        <button onClick={props.onTogglePaid} className="shrink-0" style={{ color: CAT_COLOR[entry.category] }}>
          {entry.paid ? <Check size={20} /> : <Circle size={20} strokeWidth={2} />}
        </button>
      ) : (
        <span className="shrink-0" style={{ color: CAT_COLOR[entry.category] }}>
          <Circle size={20} strokeWidth={2} fill={entry.kind === "expense" ? CAT_COLOR[entry.category] : "none"} />
        </span>
      )}
      <div className="flex-1 min-w-0 px-3">
        <div className="text-sm font-medium truncate" style={{ color: TEXT }}>{entry.name}</div>
        <div className="text-xs" style={{ color: MUTED }}>
          <span style={{ color: CAT_COLOR[entry.category] }}>{entry.category}</span> · {entry.entryDate || "no date"}
        </div>
      </div>
      <div className="text-right shrink-0 flex items-center gap-2">
        <div className="text-sm font-semibold tabular-nums" style={{ color: TEXT }}>{fmt(entry.amount)}</div>
        <button onClick={props.onEdit} style={{ color: MUTED }}><Pencil size={14} /></button>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Typecheck and lint**

Run: `npm run typecheck && npm run lint`
Expected: no errors mentioning `app/finances/`

- [ ] **Step 5: Verify in the browser**

With the dev server running (`npm run dev`), open `http://localhost:3000/finances` and confirm:
1. The page loads with the Ledger header, cycle label matching today's bi-weekly window, and the "Available right now" card.
2. Click "Log income" → date picker defaults to today, enter an amount and source, submit → a horizontal income card appears at top, sorted with the highest amount first if more than one exists.
3. Click "Log spend" → the Expense/Bill/Debt pill selector appears; add a Debt with "No payment plan yet" checked and no date → it appears in the log under the Debt filter with no date shown.
4. Click the pencil icon on that debt → edit mode opens, "Promote extra payment" button is visible (debts only — confirm it does NOT appear on a bill row's edit state).
5. Click Promote, enter an amount, confirm → the debt's amount decreases and a new expense row appears in the "All" filter.
6. Resize the browser to desktop width and confirm the layout is not a narrow centered mobile column — content should use the wider `max-w-5xl` container.

- [ ] **Step 6: Commit**

```bash
git add app/finances
git commit -m "feat(finances): add /finances ledger page"
```

---

### Task 6: Final verification pass

**Files:** none (verification only)

- [ ] **Step 1: Full typecheck**

Run: `npm run typecheck`
Expected: exit code 0

- [ ] **Step 2: Full lint**

Run: `npm run lint`
Expected: exit code 0

- [ ] **Step 3: Cycle check script still passes**

Run: `node --experimental-strip-types scripts/check-finance-cycle.mjs`
Expected: `finance-cycle checks passed`

- [ ] **Step 4: Confirm no drift-check regression**

Run: `npm run check:cerebral`
Expected: exit code 0 (this feature does not touch the Cerebral registry/skill/doc contract, so this should be unaffected — run it to confirm)

- [ ] **Step 5: Final commit if any fixes were made in this task**

```bash
git add -A
git commit -m "chore(finances): final verification pass"
```
