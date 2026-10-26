import type { AppData } from "./types.ts"
import { toISODate } from "./dates.ts"
import { isDueOn } from "./schedule.ts"
import { displayAmount, isPayoff } from "./ledger.ts"

export type CalendarEvent = { id: string; date: string; name: string; kind: "due" | "income" | "expense" | "payment" | "correction"; amountLabel: string; entryId?: string }
const localDate = (value: string) => new Date(value + "T12:00:00")

export function monthEvents(data: AppData, month: Date): CalendarEvent[] {
  const start = toISODate(new Date(month.getFullYear(), month.getMonth(), 1))
  const end = toISODate(new Date(month.getFullYear(), month.getMonth() + 1, 0))
  const inMonth = (date: string) => date >= start && date <= end
  const events: CalendarEvent[] = []
  for (let day = 1; day <= localDate(end).getDate(); day++) {
    const date = toISODate(new Date(month.getFullYear(), month.getMonth(), day))
    for (const entry of data.planEntries) {
      if (!isDueOn(entry, date)) continue
      const label = isPayoff(entry) ? (entry.paymentAmount != null ? currency(entry.paymentAmount) : "Payment not set") : displayAmount(entry)
      events.push({ id: `due-${entry.id}-${date}`, date, name: entry.name, kind: "due", amountLabel: label, entryId: entry.id })
    }
  }
  for (const tx of data.transactions.filter(tx => inMonth(tx.date) && tx.name !== "Balance cleared")) {
    const signed = tx.type === "income" ? tx.amount : tx.type === "expense" ? -tx.amount : (tx.signedAmount ?? 0)
    events.push({ id: tx.id, date: tx.date, name: tx.name, kind: tx.type === "reconcile" ? "correction" : tx.type, amountLabel: currency(signed) })
  }
  for (const payment of data.plannedPayments.filter(p => inMonth(p.date) && p.status === "paid" && !p.resolved && !p.progressOnly)) {
    events.push({ id: payment.id, date: payment.date, name: payment.name, kind: "payment", amountLabel: payment.cashDeducted === false ? `${currency(payment.amount)} debt paid` : currency(-payment.amount), entryId: payment.planEntryId })
  }
  return events.sort((a, b) => a.date.localeCompare(b.date) || a.kind.localeCompare(b.kind) || a.name.localeCompare(b.name))
}
function currency(amount: number) { return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount) }
