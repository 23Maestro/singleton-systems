import { useState } from "react"
import { ChevronLeft, ChevronRight, Inbox, Minus, Plus } from "lucide-react"
import { useApp } from "../context"
import SourceIcon from "../components/SourceIcon"
import { fmtCurrency, fmtDate, mondayFor } from "@/lib/ledger/dates"
import { CATEGORY_STYLES } from "@/lib/ledger/ledger"

export default function Home() {
  const { data, today, navigate } = useApp()
  const [weekOffset, setWeekOffset] = useState(0)
  const date = new Date(mondayFor(today) + "T12:00:00")
  date.setDate(date.getDate() + weekOffset * 7)
  const start = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
  const endDate = new Date(date)
  endDate.setDate(endDate.getDate() + 6)
  const end = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, "0")}-${String(endDate.getDate()).padStart(2, "0")}`
  const rows = [
    ...data.transactions.map((tx) => {
      const style = tx.category ? CATEGORY_STYLES[tx.category] : undefined
      const amount =
        tx.type === "income"
          ? tx.amount
          : tx.type === "expense"
            ? -tx.amount
            : (tx.signedAmount ?? 0)
      return {
        id: tx.id,
        name: tx.name,
        date: tx.date,
        amount,
        time: tx.createdAt,
        label:
          tx.type === "reconcile"
            ? "Balance correction"
            : tx.type === "income" ? "Income" : (tx.category ?? "Expense"),
        category: tx.category,
        tone: style?.tone ?? "mint",
        pending: false,
      }
    }),
    ...data.plannedPayments.map((pp) => ({
      id: pp.id,
      name: pp.name,
      date: pp.date,
      amount: -pp.amount,
      time: pp.paidAt ?? "",
      label:
        pp.status === "planned"
          ? "Previously planned · not deducted"
          : pp.planType === "bill" || pp.planType === "subscription"
            ? "C² · Paid"
            : "P² · Paid",
      category: undefined,
      tone: "slate",
      pending: pp.status === "planned",
    })),
  ]
    .filter((row) => row.date >= start && row.date <= end)
    .sort(
      (a, b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time),
    )

  return (
    <div className="page home-page">
      <section className="balance-block">
        <div className="balance-label">
          <span>Current balance</span>
        </div>
        <h1 className="cash-value">
          {fmtCurrency(data.currentBalance)}
        </h1>
        <div className="quick-actions">
          <button
            className="btn btn-income"
            onClick={() => navigate("entry", { entryType: "income" })}
          >
            <Plus size={20} aria-hidden="true" /> Income
          </button>
          <button
            className="btn btn-expense"
            onClick={() => navigate("entry", { entryType: "expense" })}
          >
            <Minus size={20} aria-hidden="true" /> Expense
          </button>
        </div>
      </section>
      <section className="card weekly-card">
        <header className="section-heading">
          <div>
            <h2>
              {weekOffset === 0 ? "This week" : "Week of " + fmtDate(start)}
            </h2>
            <p>
              {fmtDate(start)} – {fmtDate(end)}
            </p>
          </div>
          <div className="week-arrows">
            <button
              className="icon-button"
              aria-label="Previous week"
              onClick={() => setWeekOffset((v) => v - 1)}
            >
              <ChevronLeft size={22} aria-hidden="true" />
            </button>
            <button
              className="icon-button"
              aria-label="Next week"
              disabled={weekOffset === 0}
              onClick={() => setWeekOffset((v) => Math.min(0, v + 1))}
            >
              <ChevronRight size={22} aria-hidden="true" />
            </button>
          </div>
        </header>
        {rows.length ? (
          <ul className="ledger-list">
            {rows.map((row) => (
              <li key={row.id} className="ledger-row">
                <SourceIcon name={row.name} category={row.category} tone={row.tone} />
                <div className="row-copy">
                  <strong>{row.name}</strong>
                  <small>
                    {fmtDate(row.date)} · {row.label}
                  </small>
                </div>
                <span
                  className={`row-amount ${
                    row.pending
                      ? "muted"
                      : row.amount > 0
                        ? "income-text"
                        : row.amount < 0
                          ? "expense-text"
                          : ""
                  }`}
                >
                  {row.amount > 0 ? "+" : row.amount < 0 ? "−" : ""}
                  {fmtCurrency(Math.abs(row.amount))}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="empty-state">
            <Inbox size={24} aria-hidden="true" /> No entries this week.
          </p>
        )}
      </section>
    </div>
  )
}
