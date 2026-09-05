export type Category = "Food" | "Transportation" | "Health" | "Household" | "Family" | "Work" | "Personal" | "Miscellaneous"

export type PlanType = "bill" | "subscription" | "advance" | "debt"
export type TxType = "income" | "expense" | "reconcile"
export type Page = "home" | "entry" | "plan"
export type Recurrence = "none" | "weekly" | "biweekly" | "semimonthly" | "monthly" | "annually"

export interface Transaction {
  id: string
  type: TxType
  name: string
  amount: number
  date: string
  category?: Category
  status: "paid"
  createdAt: string
  signedAmount?: number
  /** Retained before the fresh cash baseline; never replay against cash. */
  historical?: boolean
  planEntryId?: string
}

export interface PlannedPayment {
  id: string
  planEntryId: string
  name: string
  amount: number
  date: string
  cycleStart: string
  status: "planned" | "paid"
  paidAt?: string
  planType: PlanType
  dueDate?: string
}

export interface PlanEntry {
  id: string
  name: string
  /** Saved recurring amount. P² uses paymentAmount, never this original payoff figure. */
  amount: number
  /** Overrides all display of amount. Preserves "around $X", ranges, etc. */
  amountDisplay?: string
  dueDate: string
  recurrence?: Recurrence
  dueDay?: number
  secondDueDay?: number
  paymentAmount?: number
  notes: string
  planType: PlanType
  isActive: boolean
  /** Current payoff balance, including explicitly marked estimates. */
  balance?: number
  balanceHigh?: number
  balanceQualifier?: "around" | "or-less" | "range"
  /** Legacy display retained during migration. */
  balanceDisplay?: string
  /** Estimates remain editable and do not block payments. */
  isApproximate?: boolean
  tag?: string
  settlementAmount?: number
  settlementDisplay?: string
}

export interface AppData {
  schemaVersion?: number
  balanceSet: boolean
  currentBalance: number
  transactions: Transaction[]
  plannedPayments: PlannedPayment[]
  planEntries: PlanEntry[]
}
