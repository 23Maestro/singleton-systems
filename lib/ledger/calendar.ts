import type { AppData, PlanEntry } from "./types.ts"
import { isDate, toISODate } from "./dates.ts"
import { displayAmount, isPayoff } from "./ledger.ts"

export type CalendarEvent = { id: string; date: string; name: string; kind: "due" | "income" | "expense" | "payment" | "correction"; amountLabel: string; entryId?: string }
const localDate = (value: string) => new Date(value + "T12:00:00")
const ordinal = (date: Date) => Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000
const clampDay = (date: Date, day: number) => Math.min(day, new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate())

export function isDueOn(entry: PlanEntry, value: string): boolean {
  if (!entry.isActive || !isDate(value)) return false
  const date = localDate(value)
  const anchor = isDate(entry.dueDate) ? localDate(entry.dueDate) : null
  if (anchor && value < entry.dueDate) return false
  const repeat = entry.recurrence ?? "none"
  if (repeat === "none") return !!anchor && value === entry.dueDate
  if (repeat === "monthly") {
    const day = entry.dueDay ?? anchor?.getDate()
    return day != null && date.getDate() === clampDay(date, day)
  }
  if (repeat === "semimonthly") return [entry.dueDay ?? anchor?.getDate() ?? 1, entry.secondDueDay ?? 15].some(day => date.getDate() === clampDay(date, day))
  if (!anchor) return false
  if (repeat === "annually") return date.getMonth() === anchor.getMonth() && date.getDate() === clampDay(date, anchor.getDate())
  const distance = ordinal(date) - ordinal(anchor)
  return distance % (repeat === "weekly" ? 7 : 14) === 0
}

export function hasSchedule(entry: PlanEntry): boolean {
  return isDate(entry.dueDate) || entry.recurrence === "semimonthly" || (entry.recurrence === "monthly" && entry.dueDay != null)
}

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
  for (const payment of data.plannedPayments.filter(p => inMonth(p.date) && p.status === "paid" && !p.resolved)) {
    events.push({ id: payment.id, date: payment.date, name: payment.name, kind: "payment", amountLabel: currency(-payment.amount), entryId: payment.planEntryId })
  }
  return events.sort((a, b) => a.date.localeCompare(b.date) || a.kind.localeCompare(b.kind) || a.name.localeCompare(b.name))
}
function currency(amount: number) { return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount) }
