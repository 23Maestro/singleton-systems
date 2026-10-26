"use client";
import { ErrorNotice } from "./components/Feedback"
import { Button } from "@/components/finances/ui/button"
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import type { AppData, Page, PlanEntry, Transaction } from "@/lib/ledger/types";
import { paidOff } from "@/lib/ledger/progress"
import type { LedgerCommand } from "@/lib/ledger/commands";
import { todayISO } from "@/lib/ledger/dates";
import { financePaths as paths, financePageInfo } from "@/lib/ledger/metadata";

export type PaymentOptions = { deductCash: boolean; progressOnly?: true; previousCash?: number; previousDebt?: number };
export type PayoffReward = { id: string; amount: number; milestone?: number };
type Context = {
  data: AppData; reward: PayoffReward | null; page: Page; entryType: "income" | "expense" | null; today: string; notice: string;
  navigate: (page: Page, options?: { entryType?: "income" | "expense" }) => void;
  addTransaction: (tx: Transaction) => Promise<void>;
  pay: (entryId: string, amount: number, date: string, id: string, options?: PaymentOptions) => Promise<void>;
  resolve: (entryId: string, amount: number, date: string, id: string, options: PaymentOptions) => Promise<void>;
  addProgress: (amount: number, date: string, id: string) => Promise<void>;
  clearBalance: (previousBalance: number, id: string) => Promise<void>;
  reconcile: (amount: number, id: string) => Promise<void>;
  saveEntry: (entry: PlanEntry, previous?: PlanEntry) => Promise<void>;
  deleteEntry: (entry: PlanEntry, id: string) => Promise<void>;
};
const AppContext = createContext<Context | null>(null);
export function AppProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const page: Page = pathname === paths.entry ? "entry" : pathname === paths.plan ? "plan" : pathname === paths.calendar ? "calendar" : "home";
  const [entryType, setEntryType] = useState<"income" | "expense" | null>(null);
  const [data, setData] = useState<AppData | null>(null);
  const dataRef = useRef<AppData | null>(null);
  const [reward, setReward] = useState<PayoffReward | null>(null);
  const [error, setError] = useState(""); const [notice, setNotice] = useState("");
  const [today, setToday] = useState(todayISO);
  const revision = useRef(-1); const pending = useRef(0);
  const editIds = useRef(new Map<string, string>());
  useEffect(() => {
    const { title, description, url } = financePageInfo(page);
    document.title = title;
    document.querySelector('link[rel="canonical"]')?.setAttribute("href", url);
    for (const [selector, content] of [
      ['meta[name="description"]', description], ['meta[property="og:title"]', title],
      ['meta[property="og:description"]', description], ['meta[property="og:url"]', url],
      ['meta[name="twitter:title"]', title], ['meta[name="twitter:description"]', description],
    ]) document.querySelector(selector)?.setAttribute("content", content);
  }, [page]);
  useEffect(() => {
    const type = new URLSearchParams(window.location.search).get("type");
    setEntryType(type === "income" || type === "expense" ? type : null);
  }, [pathname]);
  const accept = useCallback((snapshot: { data: AppData; revision: number }) => {
    if (snapshot.revision >= revision.current) { revision.current = snapshot.revision; dataRef.current = snapshot.data; setData(snapshot.data); setError(""); }
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
  useEffect(() => { if (reward) { const timer = setTimeout(() => setReward(null), 3500); return () => clearTimeout(timer); } }, [reward]);
  async function commit(command: LedgerCommand, message: string) {
    pending.current++;
    try {
      const response = await fetch("/api/finances/ledger", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(command), signal: AbortSignal.timeout(25000) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Save could not be confirmed. Retry the same confirmation.");
      const before = dataRef.current ? paidOff(dataRef.current) : 0;
      const after = paidOff(result.data);
      accept(result); setNotice(message);
      if (after > before && ["payment", "debt-progress"].includes(command.type)) setReward({ id: command.id, amount: command.type === "payment" || command.type === "debt-progress" ? command.amount : 0,
        ...(Math.floor(after / 500) > Math.floor(before / 500) ? { milestone: Math.floor(after / 500) * 500 } : {}) });
    } finally { pending.current--; }
  }
  const value: Context | null = data && {
    data, reward, page, entryType, today, notice,
    // Next's native history integration keeps this shell and its saved snapshot
    // mounted across the finance routes, avoiding a loading flash on every tab.
    navigate: (next, options) => { setEntryType(options?.entryType ?? null); window.history.pushState(null, "", paths[next] + (options?.entryType ? `?type=${options.entryType}` : "")); },
    addTransaction: tx => commit({ type: "entry", id: tx.id, entry: { type: tx.type as "income" | "expense", name: tx.name, amount: tx.amount, date: tx.date, ...(tx.type === "expense" ? { category: tx.category } : {}) } }, "Entry saved"),
    pay: (entryId, amount, date, id, options) => commit({ type: "payment", entryId, amount, date, id, ...options }, "Payment recorded"),
    resolve: (entryId, amount, date, id, options) => commit({ type: "payment", entryId, amount, date, id, resolve: true, ...options }, "Full balance paid · item resolved"),
    addProgress: (amount, date, id) => commit({ type: "debt-progress", amount, date, id }, "Payoff progress added"),
    clearBalance: (previousBalance, id) => commit({ type: "reconcile", amount: 0, previousBalance, id }, "Balance cleared"),
    reconcile: (amount, id) => commit({ type: "reconcile", amount, id }, "Balance updated"),
    deleteEntry: (entry, id) => commit({ type: "save-item", id, entry, previous: entry, remove: true }, "Item deleted from Plan"),
    saveEntry: (entry, previous) => {
      const key = JSON.stringify({ entry, previous });
      if (!editIds.current.has(key)) editIds.current.set(key, crypto.randomUUID());
      return commit({ type: "save-item", id: editIds.current.get(key)!, entry, previous }, "Details saved");
    },
  };
  if (!value) return <main className="page"><h1>Finances</h1><p role="status">{error || "Loading saved finances…"}</p>{error && <Button className="btn btn-neutral" onClick={() => void refresh()}>Retry</Button>}</main>;
  return <AppContext.Provider value={value}>{error && <ErrorNotice>{error} Changes may be out of date. <Button onClick={() => void refresh()}>Retry</Button></ErrorNotice>}{children}</AppContext.Provider>;
}
export function useApp() { const value = useContext(AppContext); if (!value) throw new Error("AppProvider is required."); return value; }
