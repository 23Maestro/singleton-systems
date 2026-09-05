"use client";
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import type { AppData, Page, PlanEntry, Transaction } from "@/lib/ledger/types";
import type { LedgerCommand } from "@/lib/ledger/commands";
import { todayISO } from "@/lib/ledger/dates";

type Context = {
  data: AppData; page: Page; entryType: "income" | "expense" | null; today: string; notice: string;
  navigate: (page: Page, options?: { entryType?: "income" | "expense" }) => void;
  addTransaction: (tx: Transaction) => Promise<void>;
  pay: (entryId: string, amount: number, date: string, id: string) => Promise<void>;
  reconcile: (amount: number, id: string) => Promise<void>;
  saveEntry: (entry: PlanEntry, previous?: PlanEntry) => Promise<void>;
};
const AppContext = createContext<Context | null>(null);
const paths: Record<Page, string> = { home: "/finances", entry: "/finances-form", plan: "/finances-plan" };
export function AppProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const page: Page = pathname === paths.entry ? "entry" : pathname === paths.plan ? "plan" : "home";
  const [entryType, setEntryType] = useState<"income" | "expense" | null>(null);
  const [data, setData] = useState<AppData | null>(null);
  const [error, setError] = useState(""); const [notice, setNotice] = useState("");
  const [today, setToday] = useState(todayISO);
  const revision = useRef(-1); const pending = useRef(0);
  const editIds = useRef(new Map<string, string>());
  useEffect(() => {
    const type = new URLSearchParams(window.location.search).get("type");
    setEntryType(type === "income" || type === "expense" ? type : null);
  }, [pathname]);
  const accept = useCallback((snapshot: { data: AppData; revision: number }) => {
    if (snapshot.revision >= revision.current) { revision.current = snapshot.revision; setData(snapshot.data); setError(""); }
  }, []);
  const refresh = useCallback(async () => {
    if (pending.current) return;
    try {
      const response = await fetch("/api/finances/ledger", { cache: "no-store", signal: AbortSignal.timeout(20000) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not load saved finances.");
      accept(result);
    } catch (e) { setError(e instanceof Error ? e.message : "Could not load saved finances."); }
  }, [accept]);
  useEffect(() => {
    void refresh();
    const sync = () => { setToday(todayISO()); if (document.visibilityState === "visible") void refresh(); };
    const timer = setInterval(sync, 15000);
    window.addEventListener("focus", sync); document.addEventListener("visibilitychange", sync);
    return () => { clearInterval(timer); window.removeEventListener("focus", sync); document.removeEventListener("visibilitychange", sync); };
  }, [refresh]);
  useEffect(() => { if (notice) { const timer = setTimeout(() => setNotice(""), 4500); return () => clearTimeout(timer); } }, [notice]);
  async function commit(command: LedgerCommand, message: string) {
    pending.current++;
    try {
      const response = await fetch("/api/finances/ledger", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(command), signal: AbortSignal.timeout(25000) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Save could not be confirmed. Retry the same confirmation.");
      accept(result); setNotice(message);
    } finally { pending.current--; }
  }
  const value: Context | null = data && {
    data, page, entryType, today, notice,
    // Next's native history integration keeps this shell and its saved snapshot
    // mounted across the three routes, avoiding a loading flash on every tab.
    navigate: (next, options) => { setEntryType(options?.entryType ?? null); window.history.pushState(null, "", paths[next] + (options?.entryType ? `?type=${options.entryType}` : "")); },
    addTransaction: tx => commit({ type: "entry", id: tx.id, entry: { type: tx.type as "income" | "expense", name: tx.name, amount: tx.amount, date: tx.date, ...(tx.type === "expense" ? { category: tx.category } : {}) } }, "Entry saved"),
    pay: (entryId, amount, date, id) => commit({ type: "payment", entryId, amount, date, id }, "Payment recorded"),
    reconcile: (amount, id) => commit({ type: "reconcile", amount, id }, "Balance updated"),
    saveEntry: (entry, previous) => {
      const key = JSON.stringify({ entry, previous });
      if (!editIds.current.has(key)) editIds.current.set(key, crypto.randomUUID());
      return commit({ type: "save-item", id: editIds.current.get(key)!, entry, previous }, "Details saved");
    },
  };
  if (!value) return <main className="page"><h1>Finances</h1><p role="status">{error || "Loading saved finances…"}</p>{error && <button className="btn btn-neutral" onClick={() => void refresh()}>Retry</button>}</main>;
  return <AppContext.Provider value={value}>{error && <p className="error" role="alert">{error} Changes may be out of date. <button onClick={() => void refresh()}>Retry</button></p>}{children}</AppContext.Provider>;
}
export function useApp() { const value = useContext(AppContext); if (!value) throw new Error("AppProvider is required."); return value; }
