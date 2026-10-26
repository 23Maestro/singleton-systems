import { Label } from "@/components/finances/ui/label"
import { NativeSelect } from "@/components/finances/ui/native-select"
import { Input } from "@/components/finances/ui/input"
import { Button } from "@/components/finances/ui/button"
import { Children, cloneElement, isValidElement, useEffect, useRef, useState, type ReactNode } from "react"
import { CalendarDays, X } from "@/components/icons/evil"
import { Dialog, DialogContent, DialogTitle } from "@/components/finances/ui/dialog"
import { Calendar } from "@/components/finances/ui/calendar"
import type { PlanEntry, Recurrence } from "@/lib/ledger/types"
import { fmtDate, todayISO, toISODate } from "@/lib/ledger/dates"
import { lastDueDate } from "@/lib/ledger/schedule"

export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const heading = useRef<HTMLHeadingElement>(null)
  const [container, setContainer] = useState<HTMLElement | null>(null)
  useEffect(() => { setContainer(document.querySelector(".ledger-app")) }, [])
  let content = children
  if (isValidElement<{ children?: ReactNode }>(children) && children.type === "form") {
    const nodes = Children.toArray(children.props.children)
    const isActions = (node: ReactNode) => isValidElement<{ className?: string }>(node) && node.props.className?.includes("modal-actions")
    content = cloneElement(children, {}, <><div className="modal-scroll">{nodes.filter(node => !isActions(node))}</div>{nodes.filter(isActions)}</>)
  }
  if (!container) return null
  return <Dialog open onOpenChange={open => { if (!open) onClose() }}>
    <DialogContent container={container} className="finance-dialog" showCloseButton={false} aria-describedby={undefined}
      onOpenAutoFocus={event => { event.preventDefault(); heading.current?.focus({ preventScroll: true }) }}>
      <header className="modal-heading">
        <DialogTitle ref={heading} tabIndex={-1}>{title}</DialogTitle>
        <Button type="button" className="icon-button" aria-label="Close dialog" onClick={onClose}><X size={22} /></Button>
      </header>
      {content}
    </DialogContent>
  </Dialog>
}

export function DateField({ label, value, onChange, max }: { label: string; value: string; onChange: (value: string) => void; max?: string }) {
  const [open, setOpen] = useState(false)
  return <div className="field">
    <span>{label}</span>
    <Button type="button" className="date-input" aria-label={`${label}: ${value ? fmtDate(value) : "Not set"}`} aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen(true)}>
      <span>{value ? new Date(value + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Not set"}</span>
      <CalendarDays size={24} />
    </Button>
    {open && <Modal title={label} onClose={() => setOpen(false)}>
      <div className="date-picker-calendar">
        <Calendar mode="single" selected={value ? new Date(value + "T12:00:00") : undefined}
          defaultMonth={new Date((value || todayISO()) + "T12:00:00")} weekStartsOn={1}
          captionLayout="dropdown" startMonth={new Date(1926, 0)} endMonth={new Date(2126, 11)}
          disabled={max ? { after: new Date(max + "T12:00:00") } : undefined}
          onSelect={date => { if (date) { onChange(toISODate(date)); setOpen(false) } }} />
        <div className="calendar-actions">
          <Button type="button" className="btn btn-neutral" disabled={!!max && todayISO() > max} onClick={() => { onChange(todayISO()); setOpen(false) }}>Today</Button>
          {!max && <Button type="button" className="btn btn-neutral" onClick={() => { onChange(""); setOpen(false) }}>Clear date</Button>}
        </div>
      </div>
    </Modal>}
  </div>
}

export const REPEAT: Record<Recurrence, string> = { none: "Does not repeat", weekly: "Weekly", biweekly: "Every two weeks", semimonthly: "Twice a month", monthly: "Monthly", annually: "Annually" }
export function scheduleLabel(e: Pick<PlanEntry, "dueDate" | "recurrence" | "dueDay" | "secondDueDay" | "paymentsRemaining" | "repeatUntil">): string {
  const repeat = e.recurrence ?? "none"
  if (e.paymentsRemaining != null) return `${e.paymentsRemaining} ${e.paymentsRemaining === 1 ? "payment" : "payments"} left · ${REPEAT[repeat]}`
  if (e.repeatUntil) return `${REPEAT[repeat]} · ends ${fmtDate(e.repeatUntil)}`
  if (repeat === "semimonthly") return `${e.dueDay ?? 1} & ${e.secondDueDay ?? 15} each month`
  if (repeat === "monthly" && e.dueDay && !e.dueDate) return `Monthly · day ${e.dueDay}`
  return [e.dueDate ? fmtDate(e.dueDate) : "", repeat !== "none" ? REPEAT[repeat] : ""].filter(Boolean).join(" · ") || "Date not set"
}
export function DuePicker({ entry, onChange }: { entry: PlanEntry; onChange: (e: PlanEntry) => void }) {
  const finite = entry.planType === "debt" && entry.recurrence && entry.recurrence !== "none"
  const [end, setEnd] = useState(entry.paymentsRemaining != null ? "count" : entry.repeatUntil ? "date" : "never")
  const last = finite ? lastDueDate(entry) : ""
  return <div className="schedule-fields">
    <DateField label="Due date" value={entry.dueDate} onChange={date => onChange({ ...entry, dueDate: date, dueDay: date ? Number(date.slice(-2)) : entry.dueDay })} />
    <Label className="field"><span>Repeat</span><NativeSelect value={entry.recurrence ?? "none"} onChange={e => { if (e.target.value === "none") setEnd("never"); onChange({ ...entry, recurrence: e.target.value as Recurrence, ...(e.target.value === "none" ? { paymentsRemaining: undefined, repeatUntil: undefined } : {}), ...(e.target.value === "semimonthly" ? { dueDay: entry.dueDay ?? 1, secondDueDay: entry.secondDueDay ?? 15 } : {}) }) }}>
      {Object.entries(REPEAT).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
    </NativeSelect></Label>
    {((entry.recurrence === "monthly" && !entry.dueDate) || entry.recurrence === "semimonthly") && <div className="two-fields schedule-days">
      <Label className="field"><span>Day of month</span><Input type="number" min="1" max="31" value={entry.dueDay ?? ""} onChange={e => onChange({ ...entry, dueDay: Number(e.target.value) || undefined })} /></Label>
      {entry.recurrence === "semimonthly" && <Label className="field"><span>Second day</span><Input type="number" min="1" max="31" value={entry.secondDueDay ?? 15} onChange={e => onChange({ ...entry, secondDueDay: Number(e.target.value) || undefined })} /></Label>}
    </div>}
    {finite && <>
      <Label className="field"><span>Ends</span><NativeSelect value={end} onChange={e => { setEnd(e.target.value); onChange({ ...entry,
        paymentsRemaining: e.target.value === "count" ? Math.min(1000, Math.max(1, entry.paymentAmount && entry.balance ? Math.ceil(entry.balance / entry.paymentAmount) : 1)) : undefined,
        repeatUntil: e.target.value === "date" ? entry.dueDate || todayISO() : undefined }) }}>
        <option value="never">No end set</option><option value="count">After payments</option><option value="date">On a date</option>
      </NativeSelect></Label>
      {end === "count" && <Label className="field"><span>Payments remaining</span><Input type="number" min="0" max="1000" step="1" required value={entry.paymentsRemaining ?? ""} onChange={e => onChange({ ...entry, paymentsRemaining: e.target.value === "" ? undefined : Number(e.target.value) })} /></Label>}
      {end === "date" && <DateField label="End date" value={entry.repeatUntil ?? ""} onChange={value => { if (!value) setEnd("never"); onChange({ ...entry, repeatUntil: value || undefined }) }} />}
      {end !== "never" && last && <p className="hint schedule-days">Last payment: {fmtDate(last)}</p>}
    </>}
  </div>
}

export function CashChoice({ amount, value, onChange }: { amount: string; value: boolean | null; onChange: (value: boolean) => void }) {
  return <fieldset className="cash-choice"><legend>Deduct {amount} from your current cash balance?</legend>
    <div className="cash-choice-options">{[true, false].map(choice => <Label key={String(choice)} className={`choice ${value === choice ? "selected" : ""}`}>
      <Input className="cash-radio" type="radio" name="deduct-cash" value={String(choice)} checked={value === choice} onChange={() => onChange(choice)} required />
      {choice ? "Yes, deduct cash" : "No, cash unchanged"}
    </Label>)}</div></fieldset>
}
