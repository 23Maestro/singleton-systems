import type { PlanEntry } from "./types.ts"
import { isDate, toISODate } from "./dates.ts"
const localDate = (value: string) => new Date(value + "T12:00:00")
const ordinal = (date: Date) => Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000
const clampDay = (date: Date, day: number) => Math.min(day, new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate())

function scheduledOn(entry: PlanEntry, value: string): boolean {
  if (!isDate(value)) return false
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

function occurrencesThrough(entry: PlanEntry, value: string): number {
  const anchor = localDate(entry.dueDate), date = localDate(value)
  const months = (date.getFullYear() - anchor.getFullYear()) * 12 + date.getMonth() - anchor.getMonth()
  switch (entry.recurrence) {
    case "monthly": return months + 1 - Number(anchor.getDate() > clampDay(anchor, entry.dueDay ?? anchor.getDate()))
    case "annually": return date.getFullYear() - anchor.getFullYear() + 1
    case "weekly": return Math.floor((ordinal(date) - ordinal(anchor)) / 7) + 1
    case "biweekly": return Math.floor((ordinal(date) - ordinal(anchor)) / 14) + 1
    case "semimonthly": {
      let count = 0
      for (let offset = 0; offset <= months; offset++) {
        const month = new Date(anchor.getFullYear(), anchor.getMonth() + offset, 1, 12)
        const days = new Set([entry.dueDay ?? anchor.getDate(), entry.secondDueDay ?? 15].map(day => clampDay(month, day)))
        for (const day of days) {
          const candidate = toISODate(new Date(month.getFullYear(), month.getMonth(), day, 12))
          if (candidate >= entry.dueDate && candidate <= value) count++
        }
      }
      return count
    }
    default: return 1
  }
}

export function isDueOn(entry: PlanEntry, value: string): boolean {
  if (!entry.isActive || !scheduledOn(entry, value)) return false
  if ((entry.planType === "debt" || entry.planType === "advance") && entry.balance != null && entry.balance <= 0) return false
  if (entry.planType !== "debt") return true
  if (entry.repeatUntil && value > entry.repeatUntil) return false
  return entry.paymentsRemaining == null || (isDate(entry.dueDate) && occurrencesThrough(entry, value) <= entry.paymentsRemaining)
}

export function nextDueAfter(entry: PlanEntry, after: string): string {
  if (!isDate(after) || !entry.recurrence || entry.recurrence === "none") return ""
  const day = localDate(after)
  // Every supported cadence has another occurrence within a leap year.
  for (let step = 0; step < 366; step++) {
    day.setDate(day.getDate() + 1)
    const value = toISODate(day)
    if (entry.repeatUntil && value > entry.repeatUntil) return ""
    if (scheduledOn(entry, value)) return value
  }
  return ""
}

export function lastDueDate(entry: PlanEntry): string {
  if (entry.repeatUntil) return entry.repeatUntil
  if (!isDate(entry.dueDate) || !entry.paymentsRemaining) return ""
  let value = scheduledOn(entry, entry.dueDate) ? entry.dueDate : nextDueAfter(entry, entry.dueDate)
  for (let index = 1; index < entry.paymentsRemaining && value; index++) value = nextDueAfter(entry, value)
  return value
}
