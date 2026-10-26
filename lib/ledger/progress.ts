import type { AppData } from "./types.ts"
import { isPayoff } from "./ledger.ts"

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
