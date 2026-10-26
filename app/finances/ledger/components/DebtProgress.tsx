import { useRef, useState, type FormEvent } from "react"
import { Card } from "@/components/finances/ui/card"
import { Button } from "@/components/finances/ui/button"
import { Badge } from "@/components/finances/ui/badge"
import { Input } from "@/components/finances/ui/input"
import { Label } from "@/components/finances/ui/label"
import { Plus } from "@/components/icons/evil"
import { debtRemaining, nextMilestone, paidOff } from "@/lib/ledger/progress"
import { fmtCurrency } from "@/lib/ledger/dates"
import { parseAmount } from "@/lib/ledger/ledger"
import { useApp } from "../context"
import { DateField, Modal } from "./Controls"
import { ErrorNotice } from "./Feedback"

function PastPayment({ onClose }: { onClose: () => void }) {
  const { addProgress, today } = useApp()
  const [amount, setAmount] = useState("")
  const [date, setDate] = useState(today)
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)
  const saving = useRef(false), id = useRef(crypto.randomUUID())
  async function submit(event: FormEvent) {
    event.preventDefault()
    if (saving.current) return
    setError("")
    try {
      const value = parseAmount(amount)
      saving.current = true; setBusy(true)
      await addProgress(value, date, id.current)
      onClose()
    } catch (error) { setError((error as Error).message) }
    finally { saving.current = false; setBusy(false) }
  }
  return <Modal title="Add past debt payment" onClose={() => { if (!saving.current) onClose() }}>
    <form className="stack" onSubmit={submit}>
      <p>Add money already paid and already reflected in your debt balances. Cash and remaining debt stay unchanged.</p>
      <Label className="field"><span>Amount paid</span><Input inputMode="decimal" placeholder="0.00" required value={amount} onChange={e => setAmount(e.target.value)} /></Label>
      <DateField label="Paid on" value={date} onChange={setDate} max={today} />
      {error && <ErrorNotice>{error}</ErrorNotice>}
      <div className="modal-actions"><Button type="button" className="btn btn-neutral" disabled={busy} onClick={onClose}>Cancel</Button><Button className="btn btn-primary" disabled={busy}>{busy ? "Saving…" : "Save progress"}</Button></div>
    </form>
  </Modal>
}

export default function DebtProgress() {
  const { data } = useApp()
  const [open, setOpen] = useState(false)
  const paid = paidOff(data), remaining = debtRemaining(data), milestone = nextMilestone(paid)
  return <>
    <Card asChild><section className="card payoff-card" aria-label="Debt payoff progress">
      <div className="payoff-heading"><div><p className="calendar-eyebrow">Every payment moves you forward</p><h2>Debt payoff</h2></div>
        {paid >= 500 && <Badge className="payoff-badge">{fmtCurrency(Math.floor(paid / 500) * 500)} milestone</Badge>}
      </div>
      <div className="payoff-totals"><div><span>Total paid off</span><strong className="payoff-paid" aria-live="polite">{data.debtProgress || paid > 0 ? fmtCurrency(paid) : "Not set"}</strong></div>
        <div><span>Remaining debt</span><strong className="payoff-remaining">{remaining.approximate ? "≈ " : ""}{fmtCurrency(remaining.low)}{remaining.high !== remaining.low ? `–${fmtCurrency(remaining.high)}` : ""}</strong>
          {remaining.unknown > 0 && <small>Plus {remaining.unknown} {remaining.unknown === 1 ? "balance" : "balances"} not set</small>}
        </div></div>
      <div className="payoff-milestone"><span>Next milestone</span><strong>{fmtCurrency(milestone)}</strong></div>
      <progress className="payoff-meter" max={milestone} value={paid} aria-label={`Payoff progress toward ${fmtCurrency(milestone)}`} />
      <div className="payoff-footer"><p>{fmtCurrency(Math.round((milestone - paid) * 100) / 100)} to your next milestone</p><Button type="button" variant="outline" className="btn btn-neutral" onClick={() => setOpen(true)}><Plus size={18} /> Add past payment</Button></div>
    </section></Card>
    {open && <PastPayment onClose={() => setOpen(false)} />}
  </>
}
