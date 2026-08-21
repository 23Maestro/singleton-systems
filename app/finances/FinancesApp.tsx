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
