import { useRef, useState, type FormEvent } from "react"
import { AnimatePresence } from "framer-motion"
import { ArrowUpRight, CreditCard, Pencil, Plus, Receipt, Repeat2 } from "lucide-react"
import { useApp } from "../context"
import {
  Modal,
  DateField,
  DuePicker,
  scheduleLabel,
} from "../components/Controls"
import SourceIcon from "../components/SourceIcon"
import { fmtCurrency, fmtDate } from "@/lib/ledger/dates"
import {
  displayAmount,
  displayBalance,
  isPayoff,
  parseAmount,
  sortAmount,
  subtract,
  TYPES,
} from "@/lib/ledger/ledger"
import type { PlanEntry, PlanType } from "@/lib/ledger/types"

const LABELS: Record<PlanType, string> = {
  bill: "Bills",
  subscription: "Subscriptions",
  advance: "Advances",
  debt: "Debts",
}
const GROUP_ICONS = {
  bill: Receipt,
  subscription: Repeat2,
  advance: ArrowUpRight,
  debt: CreditCard,
}

function PaymentModal({
  entry,
  onClose,
}: {
  entry: PlanEntry
  onClose: () => void
}) {
  const { data, pay, today } = useApp()
  const payoff = isPayoff(entry)
  const preset = payoff
    ? entry.paymentAmount
    : entry.isApproximate
      ? undefined
      : entry.amount
  const pending = data.plannedPayments.find(
    (p) => p.planEntryId === entry.id && p.status === "planned",
  )
  const [amount, setAmount] = useState(
    pending ? String(pending.amount) : preset ? String(preset) : "",
  )
  const [date, setDate] = useState(today)
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)
  const id = useRef(pending?.id ?? crypto.randomUUID())
  const saving = useRef(false)
  let number: number | undefined
  try {
    number = parseAmount(amount)
  } catch {}
  const remaining =
    number == null || entry.balance == null
      ? undefined
      : {
          ...entry,
          balance: subtract(entry.balance, number),
          balanceHigh:
            entry.balanceHigh == null
              ? undefined
              : subtract(entry.balanceHigh, number),
        }
  async function submit(event: FormEvent) {
    event.preventDefault()
    if (saving.current) return
    setError("")
    try {
      const value = parseAmount(amount)
      saving.current = true
      setBusy(true)
      await pay(entry.id, value, date, id.current)
      onClose()
    } catch (e) {
      setError((e as Error).message)
    } finally {
      saving.current = false
      setBusy(false)
    }
  }
  const previous = data.plannedPayments.find(
    (p) => p.planEntryId === entry.id && p.status === "paid",
  )
  return (
    <Modal
      title={payoff ? "Promote payment" : "Add to current cycle"}
      onClose={() => {
        if (!busy) onClose()
      }}
    >
      <form className="stack" onSubmit={submit}>
        <div className="payment-source">
          <SourceIcon name={entry.name} />
          <div>
            <strong>{entry.name}</strong>
            <small>
              {payoff
                ? displayBalance(entry) + " remaining"
                : scheduleLabel(entry)}
            </small>
          </div>
          <span className={`action-pill ${payoff ? "p2" : "c2"}`}>
            {payoff ? "P²" : "C²"}
          </span>
        </div>
        <label className="field">
          <span>Payment amount</span>
          <input
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
          />
        </label>
        <DateField
          label="Paid on"
          value={date}
          onChange={setDate}
          max={today}
        />
        <div className="payment-preview">
          <div>
            <span>Cash after payment</span>
            <strong>
              {number != null
                ? fmtCurrency(subtract(data.currentBalance, number))
                : "—"}
            </strong>
          </div>
          {payoff && (
            <div>
              <span>Remaining balance</span>
              <strong>
                {remaining ? displayBalance(remaining) : displayBalance(entry)}
              </strong>
            </div>
          )}
        </div>
        {previous && (
          <p className="hint">
            Last paid {fmtCurrency(previous.amount)} · {fmtDate(previous.date)}
          </p>
        )}
        <p className="hint">Confirming records money you have paid.</p>
        {error && (
          <p role="alert" className="error">
            {error}
          </p>
        )}
        <div className="modal-actions">
          <button
            type="button"
            className="btn btn-neutral"
            onClick={onClose}
            disabled={busy}
          >
            Cancel
          </button>
          <button
            className={`btn ${payoff ? "btn-p2" : "btn-c2"}`}
            disabled={busy}
          >
            {busy ? "Saving…" : "Confirm payment"}
          </button>
        </div>
      </form>
    </Modal>
  )
}

function EditModal({
  entry,
  isNew,
  onClose,
}: {
  entry: PlanEntry
  isNew: boolean
  onClose: () => void
}) {
  const { saveEntry, data } = useApp()
  const [draft, setDraft] = useState(entry)
  const [amount, setAmount] = useState(
    isPayoff(entry)
      ? entry.paymentAmount == null
        ? ""
        : String(entry.paymentAmount)
      : entry.isApproximate
        ? ""
        : String(entry.amount),
  )
  const [balance, setBalance] = useState(
    entry.isApproximate
      ? ""
      : entry.balance == null
        ? ""
        : String(entry.balance),
  )
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)
  const saving = useRef(false)
  const payoff = isPayoff(draft)
  async function save(event: FormEvent) {
    event.preventDefault()
    if (saving.current) return
    setError("")
    try {
      let next = { ...draft, name: draft.name.trim() }
      if (payoff) {
        next.paymentAmount = amount.trim() ? parseAmount(amount) : undefined
        if (balance.trim())
          next = {
            ...next,
            balance: parseAmount(balance, true, true),
            balanceHigh: undefined,
            balanceQualifier: undefined,
            balanceDisplay: undefined,
            amountDisplay: undefined,
            isApproximate: false,
          }
        else if (isNew) throw new Error("Enter an opening balance.")
      } else if (amount.trim()) {
        next = {
          ...next,
          amount: parseAmount(amount, true),
          amountDisplay: undefined,
          isApproximate: false,
          balance: undefined,
        }
      } else if (!entry.isApproximate) throw new Error("Enter an amount.")
      saving.current = true
      setBusy(true)
      await saveEntry(next, isNew ? undefined : entry)
      onClose()
    } catch (e) {
      setError((e as Error).message)
    } finally {
      saving.current = false
      setBusy(false)
    }
  }
  return (
    <Modal
      title={
        isNew
          ? "Add " + LABELS[entry.planType].toLowerCase().replace(/s$/, "")
          : "Edit " + entry.name
      }
      onClose={() => {
        if (!busy) onClose()
      }}
    >
      <form onSubmit={save} className={`stack edit-form ${payoff ? "payoff" : ""}`}>
        <label className="field">
          <span>Name</span>
          <input
            value={draft.name}
            maxLength={160}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            required
          />
        </label>
        <label className="field">
          <span>{payoff ? "Usual payment" : "Amount"}</span>
          <input
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={
              payoff ? "Set when ready" : (draft.amountDisplay ?? "0.00")
            }
          />
        </label>
        {payoff && (
          <label className="field">
            <span>Remaining balance</span>
            <input
              inputMode="decimal"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              placeholder={entry.isApproximate ? displayBalance(entry) : "0.00"}
            />
            {entry.isApproximate && (
              <small className="hint">
                Enter an exact balance when ready. Leave blank to keep the
                estimate.
              </small>
            )}
          </label>
        )}
        <DuePicker entry={draft} onChange={setDraft} />
        <label className="field">
          <span>Notes</span>
          <textarea
            rows={2}
            value={draft.notes}
            maxLength={2000}
            onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
          />
        </label>
        {entry.settlementAmount != null && (
          <p className="hint">
            Settlement option: {fmtCurrency(entry.settlementAmount)}
          </p>
        )}
        <label className="check-label">
          <input
            type="checkbox"
            checked={draft.isActive}
            onChange={(e) => setDraft({ ...draft, isActive: e.target.checked })}
          />
          Active
        </label>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        <div className="modal-actions">
          <button
            type="button"
            className="btn btn-neutral"
            onClick={onClose}
            disabled={busy}
          >
            Cancel
          </button>
          <button className="btn btn-primary" disabled={busy}>
            {busy ? "Saving…" : "Save details"}
          </button>
        </div>
        {(data.plannedPayments.some((p) => p.planEntryId === entry.id) || data.transactions.some(t => t.planEntryId === entry.id)) && (
          <details className="payment-history">
            <summary>Payment history</summary>
            {data.transactions.filter(t => t.planEntryId === entry.id).map(t => <div key={t.id}>
              <span>{fmtDate(t.date)} · {t.historical ? "First payment · before cash reset" : "Paid"}</span><strong>{fmtCurrency(t.amount)}</strong>
            </div>)}
            {data.plannedPayments
              .filter((p) => p.planEntryId === entry.id)
              .map((p) => (
                <div key={p.id}>
                  <span>
                    {fmtDate(p.date)} ·{" "}
                    {p.status === "paid" ? "Paid" : "Previously planned"}
                  </span>
                  <strong>{fmtCurrency(p.amount)}</strong>
                </div>
              ))}
          </details>
        )}
      </form>
    </Modal>
  )
}

export default function Plan() {
  const { data } = useApp()
  const [filter, setFilter] = useState<"all" | PlanType>("all")
  const [dialog, setDialog] = useState<{
    mode: "pay" | "edit" | "add"
    entry: PlanEntry
  } | null>(null)
  const liveEntry =
    dialog && data.planEntries.find((e) => e.id === dialog.entry.id)
  function add(type: PlanType) {
    setDialog({
      mode: "add",
      entry: {
        id: crypto.randomUUID(),
        name: "",
        amount: 0,
        dueDate: "",
        recurrence: "none",
        notes: "",
        planType: type,
        isActive: true,
      },
    })
  }
  return (
    <div className="page plan-page">
      <div className="page-title">
        <h1>Plan</h1>
        <div className="plan-cash">
          <span>Current balance</span>
          <strong>
            {fmtCurrency(data.currentBalance)}
          </strong>
        </div>
      </div>
      <div className="filter-tabs" role="group" aria-label="Plan filter">
        <button
          aria-pressed={filter === "all"}
          className={filter === "all" ? "active" : ""}
          onClick={() => setFilter("all")}
        >
          All
        </button>
        {TYPES.map((type) => (
          <button
            key={type}
            aria-pressed={filter === type}
            className={filter === type ? "active" : ""}
            onClick={() => setFilter(type)}
          >
            {LABELS[type]}
          </button>
        ))}
      </div>
      <div className="plan-groups" key={filter}>
        {TYPES.filter((type) => filter === "all" || filter === type).map(
          (type) => {
            const entries = data.planEntries
              .filter((e) => e.planType === type)
              .sort(
                (a, b) =>
                  sortAmount(b) - sortAmount(a) || a.name.localeCompare(b.name),
              )
            const GroupIcon = GROUP_ICONS[type]
            return (
              <section key={type} className="card plan-group">
                <header className="section-heading">
                  <h2>
                    <span className={`group-icon ${type}`} aria-hidden="true">
                      <GroupIcon size={20} />
                    </span>
                    {LABELS[type]}
                  </h2>
                  <button
                    className="add-button"
                    aria-label={`Add ${LABELS[type].toLowerCase()}`}
                    onClick={() => add(type)}
                  >
                    <Plus size={18} aria-hidden="true" /> Add
                  </button>
                </header>
                {entries.length === 0 ? (
                  <p className="empty-state">
                    No {LABELS[type].toLowerCase()} yet.
                  </p>
                ) : (
                  <ul>
                    {entries.map((e) => {
                      const payoff = isPayoff(e)
                      const paid = data.plannedPayments.find(
                        (p) => p.planEntryId === e.id && p.status === "paid",
                      )
                      return (
                        <li
                          key={e.id}
                          className={`plan-row ${e.isActive ? "" : "inactive"}`}
                        >
                          <SourceIcon
                            name={e.name}
                            tone={payoff ? "purple" : "blue"}
                          />
                          <div className="row-copy">
                            <strong>{e.name}</strong>
                            <small>
                              {scheduleLabel(e)}
                              {e.tag ? " · " + e.tag : ""}
                            </small>
                            {paid && (
                              <small className="paid-note">
                                ✓ Paid {fmtDate(paid.date)}
                              </small>
                            )}
                            {!e.isActive && <small>Inactive</small>}
                          </div>
                          <span className="row-amount">{displayAmount(e)}</span>
                          <div className="row-actions">
                            <button
                              disabled={
                                !e.isActive ||
                                (payoff &&
                                  !e.isApproximate &&
                                  (e.balance ?? 1) <= 0)
                              }
                              className={`action-pill ${payoff ? "p2" : "c2"}`}
                              aria-label={`${
                                payoff
                                  ? "Promote payment for"
                                  : "Add payment for"
                              } ${e.name}`}
                              title={
                                payoff
                                  ? "Promote payment"
                                  : "Add to current cycle"
                              }
                              onClick={() =>
                                setDialog({ mode: "pay", entry: e })
                              }
                            >
                              {payoff ? "P²" : "C²"}
                            </button>
                            <button
                              className="icon-button edit-button"
                              aria-label={`Edit ${e.name}`}
                              onClick={() =>
                                setDialog({ mode: "edit", entry: e })
                              }
                            >
                              <Pencil size={20} aria-hidden="true" />
                            </button>
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </section>
            )
          },
        )}
      </div>
      <AnimatePresence>{dialog?.mode === "pay" && liveEntry && (
        <PaymentModal
          key={dialog.entry.id}
          entry={liveEntry}
          onClose={() => setDialog(null)}
        />
      )}
      {dialog && dialog.mode !== "pay" && (
        <EditModal
          key={dialog.entry.id}
          entry={dialog.entry}
          isNew={dialog.mode === "add"}
          onClose={() => setDialog(null)}
        />
      )}</AnimatePresence>
    </div>
  )
}
