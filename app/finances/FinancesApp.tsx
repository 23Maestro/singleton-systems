"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowCircleUp, Check, Circle, PencilSimple, Receipt, TrendDown, TrendUp, X } from "@phosphor-icons/react";
import {
  FINANCE_CATEGORIES,
  type FinanceCategory,
  type FinanceEntry,
  type FinanceKind,
} from "@/lib/finance-contract";
import { cycleProgress, daysLeftInCycle, getCycleForDate } from "@/lib/finance-cycle";

const EXPENSE_CATEGORIES: FinanceCategory[] = ["Food", "Gas", "Child Support", "Misc."];
const BILL_CATEGORIES: FinanceCategory[] = ["Bill", "Child Support"];

// Read-only tinted badge shown on a log row.
const CAT_CHIP: Record<FinanceCategory, string> = {
  Income: "text-brand-text-green dark:text-brand-green",
  Bill: "text-brand-text-coral dark:text-brand-coral",
  Debt: "text-brand-text-yellow dark:text-brand-yellow",
  "Child Support": "text-brand-text-blue dark:text-brand-blue",
  Food: "text-brand-text-green dark:text-brand-green",
  Gas: "text-brand-text-blue dark:text-brand-blue",
  "Misc.": "text-[#607080] dark:text-[#b8c4cf]",
};

// Solid fill used for a selected category chip in the add/edit forms.
const CAT_SOLID: Record<FinanceCategory, string> = {
  Income: "bg-brand-green text-white",
  Bill: "bg-brand-coral text-white",
  Debt: "bg-brand-yellow text-[#101820]",
  "Child Support": "bg-brand-blue text-white",
  Food: "bg-brand-green text-white",
  Gas: "bg-brand-blue text-white",
  "Misc.": "bg-[#111820] text-white dark:bg-[#f7f8fa] dark:text-[#101820]",
};

const NEUTRAL_PILL = "text-[#607080] dark:text-[#b8c4cf]";
const NEUTRAL_SOLID = "bg-[#111820] text-white dark:bg-[#f7f8fa] dark:text-[#101820]";

function fmt(n: number): string {
  const neg = n < 0;
  const v = Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return (neg ? "-$" : "$") + v;
}

function todayISO(): string {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${today.getFullYear()}-${month}-${day}`;
}

type LogFilter = "all" | "bill" | "debt";
type AddKind = "income" | "expense" | "bill" | "debt";
type Panel = "income" | "spend" | "billDebt" | null;

export default function FinancesApp() {
  const [entries, setEntries] = useState<FinanceEntry[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [panel, setPanel] = useState<Panel>(null);
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
    let active = true;
    async function start() {
      try {
        const entriesResponse = await fetch("/api/finances", { cache: "no-store" });
        const data = await entriesResponse.json();
        if (!entriesResponse.ok) throw new Error(data.error || "Could not load the ledger.");
        if (active) setEntries(data.entries || []);
      } catch (cause) {
        if (active) {
          setError(cause instanceof Error ? cause.message : "Could not load the ledger.");
        }
      } finally {
        if (active) setLoaded(true);
      }
    }
    void start();
    return () => {
      active = false;
    };
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

  function openPanel(type: Exclude<Panel, null>) {
    setPanel(type);
    setAmount("");
    setName("");
    setEntryDate(todayISO());
    setHasNoDate(false);
    if (type === "income") {
      setAddKind("income");
      setCategory("Income");
    } else if (type === "billDebt") {
      setAddKind("bill");
      setCategory("Bill");
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
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Could not add the entry.");
      return;
    }
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
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Could not update the bill.");
      return;
    }
    const { entry: updated } = await res.json();
    setEntries((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
  }

  async function removeEntry(id: string) {
    if (!window.confirm("Remove this ledger entry?")) return;
    const res = await fetch(`/api/finances/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Could not remove the entry.");
      return;
    }
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
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Could not save the entry.");
      return;
    }
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
      body: JSON.stringify({ amount: val, entryDate: todayISO() }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Could not record the debt payment.");
      return;
    }
    const { debt, payment } = await res.json();
    setEntries((prev) => [payment, ...prev.map((e) => (e.id === debt.id ? debt : e))]);
    setPromotingId(null);
    setPromoteAmount("");
  }

  if (!loaded) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-[#eef3f7] text-[#607080] dark:bg-black dark:text-[#b8c4cf]">
        Loading ledger…
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-[#eef3f7] text-[#101820] [color-scheme:light_dark] dark:bg-black dark:text-[#f7f8fa]">
      <section className="relative mx-auto flex min-h-dvh w-full max-w-3xl flex-col px-3 pb-24 pt-[max(12px,env(safe-area-inset-top))] sm:px-6">
        <header className="sticky top-0 z-10 -mx-3 mb-4 flex items-center justify-between gap-3 border-b border-black/10 bg-white px-3 py-3 dark:border-white/10 dark:bg-black sm:mx-0">
          <div className="flex min-w-0 items-center gap-3">
            <Link href="/" className="block w-24 shrink-0 sm:w-28" aria-label="Singleton Systems home">
              <Image
                src="/singleton-systems-wordmark.svg"
                alt="Singleton Systems"
                width={660}
                height={260}
                className="h-auto w-full dark:invert"
              />
            </Link>
            <div className="min-w-0">
              <h1 className="truncate text-[22px] font-semibold tracking-normal">Ledger</h1>
              <p className="text-sm text-[#607080] dark:text-[#aeb8c2]">Pay cycle · {cycle.label}</p>
            </div>
          </div>
        </header>

        {error && (
          <div className="mb-4 rounded-lg border border-brand-coral/40 px-3 py-2 text-sm text-brand-text-coral dark:text-brand-coral">
            {error}
          </div>
        )}

        <div className="mb-5 pt-3 pb-4" style={{ borderTop: "2px dashed rgba(0,0,0,0.1)" }}>
          <div className="mb-2 flex justify-between text-xs text-[#607080] dark:text-[#aeb8c2]">
            <span>{daysLeft} days left in cycle</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-black/10 dark:bg-white/10">
            <div
              className="h-1.5 rounded-full bg-[#111820] transition-all dark:bg-[#f7f8fa]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="mb-5 rounded-xl border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-black">
          <div className="mb-1 text-xs uppercase tracking-widest text-[#607080] dark:text-[#aeb8c2]">
            Available right now
          </div>
          <div
            className={`mb-4 text-4xl font-bold tabular-nums ${
              available >= 0 ? "" : "text-brand-text-coral dark:text-brand-coral"
            }`}
          >
            {fmt(available)}
          </div>
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div>
              <div className="text-[#607080] dark:text-[#aeb8c2]">Confirmed in</div>
              <div className="font-semibold tabular-nums text-brand-text-green dark:text-brand-green">{fmt(confirmedIncome)}</div>
            </div>
            <div>
              <div className="text-[#607080] dark:text-[#aeb8c2]">Logged spend</div>
              <div className="font-semibold tabular-nums text-brand-text-coral dark:text-brand-coral">{fmt(loggedSpend)}</div>
            </div>
            <div>
              <div className="text-[#607080] dark:text-[#aeb8c2]">Pending bills</div>
              <div className="font-semibold tabular-nums text-brand-text-yellow dark:text-brand-yellow">{fmt(pendingBillsTotal)}</div>
            </div>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-3 gap-3 md:max-w-lg">
          <button
            onClick={() => openPanel("income")}
            className="flex items-center justify-center gap-2 rounded-xl bg-brand-green py-3.5 text-sm font-semibold text-white"
          >
            <TrendUp size={18} weight="bold" /> Income
          </button>
          <button
            onClick={() => openPanel("spend")}
            className="flex items-center justify-center gap-2 rounded-xl bg-brand-coral py-3.5 text-sm font-semibold text-white"
          >
            <TrendDown size={18} weight="bold" /> Spend
          </button>
          <button
            onClick={() => openPanel("billDebt")}
            className="flex items-center justify-center gap-2 rounded-xl bg-brand-yellow py-3.5 text-sm font-semibold text-[#101820]"
          >
            <Receipt size={18} weight="bold" /> Bill/Debt
          </button>
        </div>

        {panel && (
          <div className="mb-6 rounded-xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-black">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-semibold">
                {panel === "income" ? "New income" : panel === "spend" ? "New spend" : addKind === "debt" ? "New debt" : "New bill"}
              </span>
              <button onClick={() => setPanel(null)} className="text-[#607080] dark:text-[#aeb8c2]"><X size={18} weight="bold" /></button>
            </div>

            {panel === "billDebt" && (
              <div className="mb-3 flex flex-wrap gap-2">
                {(["bill", "debt"] as const).map((k) => (
                  <button
                    key={k}
                    onClick={() => {
                      setAddKind(k);
                      setCategory(k === "bill" ? "Bill" : "Debt");
                    }}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium capitalize ${
                      addKind === k ? `border-transparent ${NEUTRAL_SOLID}` : `border-black/10 dark:border-white/10 ${NEUTRAL_PILL}`
                    }`}
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
              className="mb-3 w-full border-b border-black/10 bg-transparent pb-2 text-2xl font-bold tabular-nums outline-none dark:border-white/10"
            />

            <input
              placeholder={panel === "income" ? "Source" : "Name"}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mb-3 w-full border-b border-black/10 bg-transparent pb-2 text-sm outline-none dark:border-white/10"
            />

            {((panel === "spend") || (panel === "billDebt" && addKind === "bill")) && (
              <div className="mb-3 flex flex-wrap gap-2">
                {(panel === "billDebt" ? BILL_CATEGORIES : EXPENSE_CATEGORIES).map((c) => (
                  <button
                    key={c}
                    onClick={() => setCategory(c)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
                      category === c ? `border-transparent ${CAT_SOLID[c]}` : `border-black/10 dark:border-white/10 ${NEUTRAL_PILL}`
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}

            {addKind === "debt" && (
              <label className="mb-3 flex items-center gap-2 text-xs text-[#607080] dark:text-[#aeb8c2]">
                <input type="checkbox" checked={hasNoDate} onChange={(e) => setHasNoDate(e.target.checked)} />
                No payment plan yet (open balance)
              </label>
            )}

            {!(addKind === "debt" && hasNoDate) && (
              <input
                type="date"
                value={entryDate}
                onChange={(e) => setEntryDate(e.target.value)}
                className="mb-4 w-full border-b border-black/10 bg-transparent pb-2 text-sm outline-none [color-scheme:light] dark:border-white/10 dark:[color-scheme:dark]"
              />
            )}

            <button onClick={submitEntry} className={`w-full rounded-xl py-3 text-sm font-semibold ${NEUTRAL_SOLID}`}>
              Add entry
            </button>
          </div>
        )}

        {incomeEntries.length > 0 && (
          <div className="mb-6">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-[#607080] dark:text-[#aeb8c2]">Income</h2>
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
              className={`rounded-full border px-3 py-1.5 text-xs font-medium capitalize ${
                filter === f ? `border-transparent ${NEUTRAL_SOLID}` : `border-black/10 dark:border-white/10 ${NEUTRAL_PILL}`
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="mb-6 space-y-2">
          {logEntries.length === 0 && <p className="text-sm italic text-[#607080] dark:text-[#aeb8c2]">Nothing here.</p>}
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
      </section>
    </main>
  );
}

function IncomeCard({ entry, onDelete }: { entry: FinanceEntry; onDelete: () => void }) {
  return (
    <div className="min-w-[160px] rounded-xl border border-black/10 bg-white px-4 py-3 dark:border-white/10 dark:bg-black">
      <div className="text-lg font-bold tabular-nums text-brand-text-green dark:text-brand-green">{fmt(entry.amount)}</div>
      <div className="truncate text-sm">{entry.name}</div>
      <div className="mt-1 flex items-center justify-between text-xs text-[#607080] dark:text-[#aeb8c2]">
        <span>{entry.entryDate || "—"}</span>
        <button onClick={onDelete} className="text-[#607080] dark:text-[#aeb8c2]">remove</button>
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
      <div className="rounded-xl border border-black/80 bg-white px-4 py-3 dark:border-white/80 dark:bg-black">
        <input
          value={draftName}
          onChange={(e) => setDraftName(e.target.value)}
          className="mb-2 w-full border-b border-black/10 bg-transparent text-sm outline-none dark:border-white/10"
        />
        <div className="mb-2 flex flex-wrap gap-2">
          {FINANCE_CATEGORIES.filter((c) => c !== "Income").map((c) => (
            <button
              key={c}
              onClick={() => setDraftCategory(c)}
              className={`rounded-full border px-2.5 py-1 text-xs ${
                draftCategory === c ? `border-transparent ${CAT_SOLID[c]}` : `border-black/10 dark:border-white/10 ${NEUTRAL_PILL}`
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <input
          inputMode="decimal"
          value={draftAmount}
          onChange={(e) => setDraftAmount(e.target.value)}
          className="mb-2 w-full border-b border-black/10 bg-transparent text-sm outline-none dark:border-white/10"
        />
        <input
          type="date"
          value={draftDate}
          onChange={(e) => setDraftDate(e.target.value)}
          className="mb-3 w-full border-b border-black/10 bg-transparent text-sm outline-none [color-scheme:light] dark:border-white/10 dark:[color-scheme:dark]"
        />

        {promoting ? (
          <div className="mb-2 flex gap-2">
            <input
              autoFocus
              inputMode="decimal"
              placeholder="Amount to promote"
              value={promoteAmount}
              onChange={(e) => props.onPromoteAmountChange(e.target.value)}
              className="flex-1 border-b border-brand-green bg-transparent text-sm outline-none"
            />
            <button onClick={props.onPromoteConfirm} className="rounded-full bg-brand-green px-3 py-1.5 text-xs font-semibold text-white">
              Confirm
            </button>
            <button onClick={props.onPromoteCancel} className={`rounded-full border border-black/10 px-3 py-1.5 text-xs dark:border-white/10 ${NEUTRAL_PILL}`}>
              Cancel
            </button>
          </div>
        ) : props.onPromoteStart ? (
          <button
            onClick={props.onPromoteStart}
            className="mb-2 flex w-full items-center justify-center gap-1.5 rounded-lg border border-brand-green py-2 text-xs font-semibold text-brand-text-green dark:text-brand-green"
          >
            <ArrowCircleUp size={14} weight="bold" /> Promote extra payment
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
            className={`flex-1 rounded-lg py-2 text-xs font-semibold ${NEUTRAL_SOLID}`}
          >
            Save
          </button>
          <button onClick={props.onCancelEdit} className={`flex-1 rounded-lg border border-black/10 py-2 text-xs dark:border-white/10 ${NEUTRAL_PILL}`}>
            Cancel
          </button>
          <button onClick={props.onDelete} className="rounded-lg border border-black/10 px-3 py-2 text-xs text-brand-text-coral dark:border-white/10 dark:text-brand-coral">
            Remove
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between rounded-xl border border-black/10 bg-white px-4 py-3 dark:border-white/10 dark:bg-black">
      {props.onTogglePaid ? (
        <button onClick={props.onTogglePaid} className={`shrink-0 ${CAT_CHIP[entry.category]}`}>
          {entry.paid ? <Check size={20} weight="bold" /> : <Circle size={20} />}
        </button>
      ) : (
        <span className={`shrink-0 ${CAT_CHIP[entry.category]}`}>
          <Circle size={20} weight={entry.kind === "expense" ? "fill" : "regular"} />
        </span>
      )}
      <div className="min-w-0 flex-1 px-3">
        <div className="truncate text-sm font-medium">{entry.name}</div>
        <div className="text-xs text-[#607080] dark:text-[#aeb8c2]">
          <span className={CAT_CHIP[entry.category]}>{entry.category}</span> · {entry.entryDate || "no date"}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2 text-right">
        <div className="text-sm font-semibold tabular-nums">{fmt(entry.amount)}</div>
        <button onClick={props.onEdit} className="text-[#607080] dark:text-[#aeb8c2]"><PencilSimple size={14} weight="bold" /></button>
      </div>
    </div>
  );
}
