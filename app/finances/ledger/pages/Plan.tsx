import { ErrorNotice } from "../components/Feedback"
import { Label } from "@/components/finances/ui/label"
import { Card } from "@/components/finances/ui/card"
import { Badge } from "@/components/finances/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/finances/ui/collapsible"
import { Textarea } from "@/components/finances/ui/textarea"
import { Checkbox } from "@/components/finances/ui/checkbox"
import { Input } from "@/components/finances/ui/input"
import { Button } from "@/components/finances/ui/button"
import { useRef, useState, type FormEvent } from "react"
import { AnimatePresence } from "framer-motion"
import { ArrowUpRight, Check, CreditCard, Pencil, Plus, Receipt, Repeat2 } from "@/components/icons/evil"
import DebtProgress from "../components/DebtProgress"
import { useApp } from "../context"
import {
  Modal,
  CashChoice,
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

function ResolveModal({ entry, onClose }: { entry: PlanEntry; onClose: () => void }) {
  const { data, resolve, today } = useApp()
  const [cashBefore] = useState(data.currentBalance)
  const [deductCash, setDeductCash] = useState<boolean | null>(null)
  const previousDebt = useRef(entry.balance)
  const [date, setDate] = useState(today)
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)
  const id = useRef(crypto.randomUUID())
  const saving = useRef(false)
  const amount = entry.balance
  const ready = amount != null && amount >= 0 && (entry.balanceHigh == null || entry.balanceHigh === amount)
  async function submit(event: FormEvent) {
    event.preventDefault()
    if (saving.current || !ready || deductCash == null) return
    saving.current = true
    setBusy(true)
    setError("")
    try {
      await resolve(entry.id, amount!, date, id.current, { deductCash, previousCash: cashBefore, previousDebt: previousDebt.current })
      onClose()
    } catch (e) {
      setError((e as Error).message)
    } finally {
      saving.current = false
      setBusy(false)
    }
  }
  return <Modal title={`Resolve ${entry.name}?`} onClose={() => { if (!saving.current) onClose() }}>
    <form className="stack" onSubmit={submit}>
      {ready ? <>
        <p>Record the entire remaining balance of {fmtCurrency(amount!)} as paid and mark {entry.name} resolved.</p>
        {entry.isApproximate && <p className="hint">This uses the saved estimate. Edit the remaining balance first if the amount paid was different.</p>}
        <CashChoice amount={fmtCurrency(amount!)} value={deductCash} onChange={setDeductCash} />
        <p className="hint">{deductCash === true ? `Cash after payment: ${fmtCurrency(subtract(cashBefore, amount!))}.` : deductCash === false ? "Cash stays unchanged. The debt is recorded as paid in full." : "Choose Yes or No before confirming."}</p>
        <DateField label="Payment date" value={date} max={today} onChange={setDate} />
      </> : <p>Use the pencil to set an exact remaining balance before resolving this item.</p>}
      {error && <ErrorNotice>{error}</ErrorNotice>}
      <div className="modal-actions">
        <Button type="button" className="btn btn-neutral" onClick={onClose} disabled={busy}>Cancel</Button>
        <Button className="btn btn-primary" disabled={busy || !ready || deductCash == null}>{busy ? "Saving…" : "Resolve in full"}</Button>
      </div>
    </form>
  </Modal>
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
  const [deductCash, setDeductCash] = useState<boolean | null>(null)
  const [progressOnly, setProgressOnly] = useState(false)
  const [cashBefore] = useState(data.currentBalance)
  const previousDebt = useRef(entry.balance)
  const preset = payoff
    ? entry.paymentAmount == null ? undefined : entry.balance == null ? entry.paymentAmount : Math.min(entry.paymentAmount, Math.max(0, entry.balance))
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
    progressOnly || number == null || entry.balance == null
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
      if (payoff && !progressOnly && deductCash == null) throw new Error("Choose Yes or No for deducting cash.")
      saving.current = true
      setBusy(true)
      await pay(entry.id, value, date, id.current, payoff ? { deductCash: progressOnly ? false : deductCash!, ...(progressOnly ? { progressOnly: true } : {}), previousCash: cashBefore, previousDebt: previousDebt.current } : undefined)
      onClose()
    } catch (e) {
      setError((e as Error).message)
    } finally {
      saving.current = false
      setBusy(false)
    }
  }
  const previous = data.plannedPayments.find(
    (p) => p.planEntryId === entry.id && p.status === "paid" && !p.progressOnly,
  )
  return (
    <Modal
      title={payoff ? "Record debt payment" : "Add to current cycle"}
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
          <Badge className={`action-pill ${payoff ? "p2" : "c2"}`}>
            {payoff ? "P²" : "C²"}
          </Badge>
        </div>
        <Label className="field">
          <span>Payment amount</span>
          <Input
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
          />
        </Label>
        <DateField
          label="Paid on"
          value={date}
          onChange={setDate}
          max={today}
        />
        {payoff && <>
          <Label className="check-label"><Checkbox checked={progressOnly} onCheckedChange={checked => setProgressOnly(checked === true)} disabled={busy} /> Progress only — already reflected in my debt balance</Label>
          {progressOnly ? <p className="hint">Adds to total paid off. Cash, debt balance and payments remaining stay unchanged.</p> : <CashChoice amount={number == null ? "this payment" : fmtCurrency(number)} value={deductCash} onChange={setDeductCash} />}
        </>}
        <div className="payment-preview">
          <div>
            <span>Cash after payment</span>
            <strong>
              {payoff && (progressOnly || deductCash === false) ? fmtCurrency(data.currentBalance) : payoff && deductCash == null ? "Choose Yes or No" : number != null ? fmtCurrency(subtract(cashBefore, number)) : "—"}
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
          <ErrorNotice>
            {error}
          </ErrorNotice>
        )}
        <div className="modal-actions">
          <Button
            type="button"
            className="btn btn-neutral"
            onClick={onClose}
            disabled={busy}
          >
            Cancel
          </Button>
          <Button
            className={`btn ${payoff ? "btn-p2" : "btn-c2"}`}
            disabled={busy || (payoff && !progressOnly && deductCash == null)}
          >
            {busy ? "Saving…" : progressOnly ? "Save progress" : "Confirm payment"}
          </Button>
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
  const { saveEntry, deleteEntry, data } = useApp()
  const [draft, setDraft] = useState(entry)
  const [remove, setRemove] = useState(false)
  const deleteId = useRef(crypto.randomUUID())
  const deleteSnapshot = useRef(entry)
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
      if (remove && !isNew) {
        saving.current = true
        setBusy(true)
        await deleteEntry(deleteSnapshot.current, deleteId.current)
        onClose()
        return
      }
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
      <form onSubmit={save} noValidate={remove} className={`stack edit-form ${payoff ? "payoff" : ""}`}>
        <Label className="field">
          <span>Name</span>
          <Input
            value={draft.name}
            maxLength={160}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            required
          />
        </Label>
        <Label className="field">
          <span>{payoff ? "Usual payment" : "Amount"}</span>
          <Input
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={
              payoff ? "Set when ready" : (draft.amountDisplay ?? "0.00")
            }
          />
        </Label>
        {payoff && (
          <Label className="field">
            <span>Remaining balance</span>
            <Input
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
          </Label>
        )}
        <DuePicker entry={draft} onChange={setDraft} />
        <Label className="field">
          <span>Notes</span>
          <Textarea
            rows={2}
            value={draft.notes}
            maxLength={2000}
            onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
          />
        </Label>
        {entry.settlementAmount != null && (
          <p className="hint">
            Settlement option: {fmtCurrency(entry.settlementAmount)}
          </p>
        )}
        <div className="plan-item-flags"><Label className="check-label">
          <Checkbox
            checked={draft.isActive}
            disabled={busy || remove}
            onCheckedChange={(checked) => setDraft({ ...draft, isActive: checked === true })}
          />
          Active
        </Label>
        {!isNew && <Label className="check-label delete-label">
          Delete
          <Checkbox checked={remove} disabled={busy} onCheckedChange={checked => setRemove(checked === true)} />
        </Label>}</div>
        {remove && <p className="hint delete-hint">Delete {entry.name} from Plan and future due reminders. Recorded payments and cash stay unchanged.</p>}
        {error && (
          <ErrorNotice>
            {error}
          </ErrorNotice>
        )}
        <div className="modal-actions">
          <Button
            type="button"
            className="btn btn-neutral"
            onClick={onClose}
            disabled={busy}
          >
            Cancel
          </Button>
          <Button className={`btn ${remove ? "btn-expense" : "btn-primary"}`} disabled={busy}>
            {busy ? (remove ? "Deleting…" : "Saving…") : (remove ? "Delete item" : "Save details")}
          </Button>
        </div>
        {(data.plannedPayments.some((p) => p.planEntryId === entry.id) || data.transactions.some(t => t.planEntryId === entry.id)) && (
          <Collapsible className="payment-history">
            <CollapsibleTrigger asChild><Button type="button" variant="ghost" className="history-trigger">Payment history</Button></CollapsibleTrigger>
            <CollapsibleContent className="history-content">
            {data.transactions.filter(t => t.planEntryId === entry.id).map(t => <div key={t.id}>
              <span>{fmtDate(t.date)} · {t.historical ? "First payment · before cash reset" : "Paid"}</span><strong>{fmtCurrency(t.amount)}</strong>
            </div>)}
            {data.plannedPayments
              .filter((p) => p.planEntryId === entry.id)
              .map((p) => (
                <div key={p.id}>
                  <span>
                    {fmtDate(p.date)} ·{" "}
                    {p.progressOnly ? "Progress only · balances unchanged" : p.status === "paid" ? p.cashDeducted === false ? "Paid · cash unchanged" : "Paid" : "Previously planned"}
                  </span>
                  <strong>{fmtCurrency(p.amount)}</strong>
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>
        )}
      </form>
    </Modal>
  )
}

export default function Plan() {
  const { data } = useApp()
  const [filter, setFilter] = useState<"all" | PlanType>("all")
  const [dialog, setDialog] = useState<{
    mode: "pay" | "resolve" | "edit" | "add"
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
      {(filter === "all" || filter === "debt" || filter === "advance") && <DebtProgress />}
      <div className="filter-tabs" role="group" aria-label="Plan filter">
        <Button
          aria-pressed={filter === "all"}
          className={filter === "all" ? "active" : ""}
          onClick={() => setFilter("all")}
        >
          All
        </Button>
        {TYPES.map((type) => (
          <Button
            key={type}
            aria-pressed={filter === type}
            className={filter === type ? "active" : ""}
            onClick={() => setFilter(type)}
          >
            {LABELS[type]}
          </Button>
        ))}
      </div>
      <div className="plan-groups" key={filter}>
        {TYPES.filter((type) => filter === "all" || filter === type).map(
          (type) => {
            const entries = data.planEntries
              .filter((e) => e.planType === type && (e.isActive || !isPayoff(e) || e.balance !== 0))
              .sort(
                (a, b) =>
                  sortAmount(b) - sortAmount(a) || a.name.localeCompare(b.name),
              )
            const GroupIcon = GROUP_ICONS[type]
            return (
              <Card key={type} asChild><section className="card plan-group">
                <header className="section-heading">
                  <h2>
                    <span className={`group-icon ${type}`} aria-hidden="true">
                      <GroupIcon size={20} />
                    </span>
                    {LABELS[type]}
                  </h2>
                  <Button
                    className="add-button"
                    aria-label={`Add ${LABELS[type].toLowerCase()}`}
                    onClick={() => add(type)}
                  >
                    <Plus size={18} aria-hidden="true" /> Add
                  </Button>
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
                        (p) => p.planEntryId === e.id && p.status === "paid" && !p.progressOnly,
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
                            {!e.isActive && <small>{payoff && e.balance === 0 ? "Resolved" : "Inactive"}</small>}
                          </div>
                          <span className="row-amount">{displayAmount(e)}</span>
                          <div className="row-actions" role="group" aria-label={`Actions for ${e.name}`}>
                            <Button
                              disabled={
                                !e.isActive ||
                                (payoff &&
                                  !e.isApproximate &&
                                  (e.balance ?? 1) <= 0)
                              }
                              className={`action-pill ${payoff ? "p2" : "c2"}`}
                              aria-label={`${
                                payoff
                                  ? "Record payment for"
                                  : "Add payment for"
                              } ${e.name}`}
                              title={
                                payoff
                                  ? "Record payment"
                                  : "Add to current cycle"
                              }
                              onClick={() =>
                                setDialog({ mode: "pay", entry: e })
                              }
                            >
                              {payoff ? "P²" : "C²"}
                            </Button>
                            {payoff && e.isActive && <Button
                              variant="outline"
                              className="resolve-button"
                              aria-label={`Resolve ${e.name} in full`}
                              onClick={() => setDialog({ mode: "resolve", entry: e })}
                            ><Check size={16} aria-hidden="true" /> Resolve</Button>}
                            <Button
                              variant="ghost"
                              className="edit-button"
                              aria-label={`Edit ${e.name}`}
                              onClick={() =>
                                setDialog({ mode: "edit", entry: e })
                              }
                            >
                              <Pencil size={16} aria-hidden="true" /> Edit
                            </Button>
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </section></Card>
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
      {dialog?.mode === "resolve" && <ResolveModal key={dialog.entry.id} entry={dialog.entry} onClose={() => setDialog(null)} />}
      {dialog && (dialog.mode === "edit" || dialog.mode === "add") && (
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
