import type { AppData, PlanEntry, Transaction } from "./types.ts"
import { fmtCurrency, isDate, mondayFor, todayISO } from "./dates.ts"

export const STORAGE_KEY = "freelance-ledger-v4"
export const TYPES = ["bill", "subscription", "advance", "debt"] as const
export const CATEGORY_STYLES = {
  Family: { emoji: "🫶", tone: "pink" },
  Food: { emoji: "🍽️", tone: "orange" },
  Health: { emoji: "💊", tone: "mint" },
  Household: { emoji: "🏠", tone: "blue" },
  Miscellaneous: { emoji: "🧩", tone: "slate" },
  Personal: { emoji: "✨", tone: "purple" },
  Transportation: { emoji: "🚗", tone: "yellow" },
  Work: { emoji: "💼", tone: "cyan" },
} as const
export const isPayoff = (e: PlanEntry) =>
  e.planType === "debt" || e.planType === "advance"
export const money = (n: number) => Math.round(n * 100) / 100
export const subtract = (a: number, b: number) =>
  (Math.round(a * 100) - Math.round(b * 100)) / 100

export function parseAmount(
  value: string,
  allowZero = false,
  signed = false,
): number {
  const pattern = signed ? /^-?\d+(\.\d{1,2})?$/ : /^\d+(\.\d{1,2})?$/
  if (!pattern.test(value.trim()))
    throw new Error("Enter an amount with up to two decimal places.")
  const n = Number(value)
  if (
    !Number.isSafeInteger(Math.round(n * 100)) ||
    Math.abs(n) > 999999999 ||
    (!signed && (allowZero ? n < 0 : n <= 0))
  ) {
    throw new Error("Enter a valid amount.")
  }
  return money(n)
}

export function displayBalance(e: PlanEntry): string {
  if (e.balance == null) return e.balanceDisplay || "Balance not set"
  if (e.balanceQualifier === "range" && e.balanceHigh != null)
    return `around ${fmtCurrency(e.balance)}–${fmtCurrency(e.balanceHigh)}`
  if (e.isApproximate)
    return `around ${fmtCurrency(e.balance)}${
      e.balanceQualifier === "or-less" ? " or less" : ""
    }`
  return e.balance < 0
    ? `${fmtCurrency(-e.balance)} credit`
    : fmtCurrency(e.balance)
}
export const displayAmount = (e: PlanEntry) =>
  isPayoff(e) ? displayBalance(e) : e.amountDisplay || fmtCurrency(e.amount)
export function sortAmount(e: PlanEntry): number {
  if (isPayoff(e)) return e.balanceHigh ?? e.balance ?? 0
  // ponytail: ranges sort by their displayed upper endpoint; never use this as a payment amount.
  const values = e.amountDisplay
    ?.match(/[\d,]+(?:\.\d+)?/g)
    ?.map((v) => Number(v.replace(/,/g, "")))
  return values?.length ? Math.max(...values) : e.amount
}

export function validateEntry(e: PlanEntry) {
  if (!e.id || !e.name.trim() || !TYPES.includes(e.planType))
    throw new Error("Add a name and valid type.")
  parseAmount(String(e.amount), true)
  if (e.paymentAmount != null) parseAmount(String(e.paymentAmount))
  if (e.balance != null) parseAmount(String(e.balance), true, true)
  if (e.balanceHigh != null && (e.balance == null || e.balanceHigh < e.balance))
    throw new Error("Check the balance range.")
  if (e.dueDate && !isDate(e.dueDate))
    throw new Error("Choose a valid due date.")
  if (
    e.recurrence &&
    ![
      "none",
      "weekly",
      "biweekly",
      "semimonthly",
      "monthly",
      "annually",
    ].includes(e.recurrence)
  )
    throw new Error("Choose a valid repeat option.")
  for (const day of [e.dueDay, e.secondDueDay])
    if (day != null && (!Number.isInteger(day) || day < 1 || day > 31))
      throw new Error("Choose a day from 1 to 31.")
}

export function migrate(raw: AppData, seed: AppData): AppData {
  if (
    !raw ||
    !Array.isArray(raw.planEntries) ||
    !Array.isArray(raw.transactions) ||
    !Array.isArray(raw.plannedPayments) ||
    typeof raw.balanceSet !== "boolean" ||
    !Number.isFinite(raw.currentBalance)
  ) {
    throw new Error(
      "Saved finances could not be read. Your original data has been kept.",
    )
  }
  if ((raw.schemaVersion ?? 0) > 2)
    throw new Error(
      "These finances were saved by a newer app. Your data has been kept.",
    )
  if (raw.schemaVersion === 2) return raw
  const data = structuredClone(raw)
  for (const e of data.planEntries) {
    const original = seed.planEntries.find(
      (s) => s.id === e.id && s.name === e.name,
    )
    if (e.dueDate === "monthly") {
      e.recurrence = "monthly"
      e.dueDate = ""
    }
    if (e.dueDate && !isDate(e.dueDate)) {
      e.notes = [e.notes, `Previous schedule: ${e.dueDate}`]
        .filter(Boolean)
        .join("\n")
      e.dueDate = ""
    }
    // Fill corrected schedules without replacing an existing user-selected date.
    if (original && !e.dueDate) {
      e.dueDate = original.dueDate
      e.recurrence = original.recurrence
      e.dueDay = original.dueDay
      e.secondDueDay = original.secondDueDay
    }
    if (original && e.paymentAmount == null)
      e.paymentAmount = original.paymentAmount
    if (
      isPayoff(e) &&
      e.balance == null &&
      e.isApproximate &&
      e.balanceDisplay
    ) {
      const amounts = e.balanceDisplay
        .match(/[\d,]+(?:\.\d+)?/g)
        ?.map((v) => Number(v.replace(/,/g, "")))
      if (amounts?.length && amounts.length <= 2) {
        e.balance = amounts[0]
        e.balanceHigh = amounts[1]
        e.balanceQualifier =
          amounts.length === 2
            ? "range"
            : e.balanceDisplay.includes("or less")
              ? "or-less"
              : "around"
      }
    }
  }
  // One-time bill intake. Do not reset saved balances, payments, edits, or resurrect later deletions.
  for (const bill of seed.planEntries.filter((e) => e.planType === "bill")) {
    if (
      !data.planEntries.some(
        (e) =>
          e.id === bill.id || e.name.toLowerCase() === bill.name.toLowerCase(),
      )
    )
      data.planEntries.push(structuredClone(bill))
  }
  data.schemaVersion = 2
  return data
}

export function recordEntry(data: AppData, tx: Transaction): AppData {
  if (data.transactions.some((t) => t.id === tx.id)) return data
  if (!tx.id || !tx.name.trim() || !isDate(tx.date))
    throw new Error("Add a description and valid date.")
  if (tx.date > todayISO())
    throw new Error("Record income or spending on today or an earlier date.")
  if (tx.type !== "income" && tx.type !== "expense")
    throw new Error("Select Income or Expense.")
  if (tx.type === "expense" && (!tx.category || !(tx.category in CATEGORY_STYLES)))
    throw new Error("Choose a category.")
  parseAmount(String(tx.amount))
  return {
    ...data,
    balanceSet: true,
    currentBalance: subtract(
      data.currentBalance,
      tx.type === "income" ? -tx.amount : tx.amount,
    ),
    transactions: [tx, ...data.transactions],
  }
}

export function recordPayment(
  data: AppData,
  entryId: string,
  amount: number,
  date: string,
  id: string,
): AppData {
  if (data.plannedPayments.some((p) => p.id === id && p.status === "paid"))
    return data
  parseAmount(String(amount))
  if (!id || !isDate(date)) throw new Error("Choose a valid payment date.")
  if (date > todayISO())
    throw new Error("A recorded payment cannot have a future date.")
  const e = data.planEntries.find((item) => item.id === entryId)
  if (!e)
    throw new Error("This item no longer exists. Close and reopen the payment.")
  const changed = { ...e }
  if (isPayoff(e)) {
    if (e.balance == null)
      throw new Error(
        "Set a balance with the pencil first. An estimate is fine.",
      )
    changed.balance = subtract(e.balance, amount)
    if (e.balanceHigh != null)
      changed.balanceHigh = subtract(e.balanceHigh, amount)
    changed.paymentAmount = amount
    changed.balanceDisplay = undefined
  }
  return {
    ...data,
    balanceSet: true,
    currentBalance: subtract(data.currentBalance, amount),
    planEntries: data.planEntries.map((item) =>
      item.id === entryId ? changed : item,
    ),
    plannedPayments: [
      {
        id,
        planEntryId: e.id,
        name: e.name,
        amount,
        date,
        cycleStart: mondayFor(date),
        status: "paid",
        paidAt: new Date().toISOString(),
        planType: e.planType,
        dueDate: e.dueDate,
      },
      ...data.plannedPayments.filter((p) => p.id !== id),
    ],
  }
}
