import type { AppData, PlanEntry, PlanType } from "./types.ts"
import { isPayoff, sortAmount } from "./ledger.ts"
import { fmtCurrency } from "./dates.ts"

export function groupTotal(entries: PlanEntry[], type: PlanType): string | null {
  if (type === "bill") return null
  const items = entries.filter(e => e.planType === type && (type !== "subscription" || e.isActive))
  const sum = (high: boolean) => items.reduce((cents, e) => {
    const amount = type === "subscription" ? (high ? sortAmount(e) : e.amount) : (high ? e.balanceHigh ?? e.balance : e.balance)
    return cents + Math.round(Math.max(0, amount ?? 0) * 100)
  }, 0) / 100
  const low = sum(false), high = sum(true)
  const approximate = items.some(e => type === "subscription" ? Boolean(e.amountDisplay) : e.isApproximate)
  const unknown = type !== "subscription" && items.some(e => e.balance == null)
  return `${approximate ? "≈ " : ""}${fmtCurrency(low)}${high !== low ? `–${fmtCurrency(high)}` : ""}${unknown ? "+" : ""}`
}

export function paidOff(data: AppData): number {
  const cents = Math.round((data.debtProgress?.openingPaid ?? 0) * 100)
  return data.plannedPayments.reduce((sum, payment) => sum + (
    payment.status === "paid" && payment.countsTowardProgress ? Math.round(payment.amount * 100) : 0
  ), cents) / 100
}

export function debtRemaining(data: AppData) {
  const entries = data.planEntries.filter(isPayoff)
  const total = (high: boolean) => entries.reduce((sum, entry) => sum + Math.round(Math.max(0,
    (high ? entry.balanceHigh ?? entry.balance : entry.balance) ?? 0) * 100), 0) / 100
  return { low: total(false), high: total(true), unknown: entries.filter(e => e.balance == null).length,
    approximate: entries.some(e => e.isApproximate) }
}

export const nextMilestone = (amount: number) => (Math.floor(amount / 500) + 1) * 500
