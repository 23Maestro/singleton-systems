import { Children, cloneElement, isValidElement, useEffect, useId, useRef, useState, type ReactNode } from "react"
import { createPortal } from "react-dom"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { CalendarDays, ChevronLeft, ChevronRight, X } from "lucide-react"
import type { PlanEntry, Recurrence } from "@/lib/ledger/types"
import { fmtDate, todayISO } from "@/lib/ledger/dates"

export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null)
  const heading = useRef<HTMLHeadingElement>(null)
  const id = useId()
  const reduced = useReducedMotion()
  // Keep each form's actions outside its scrollable fields, including when
  // the visual viewport shrinks for an on-screen keyboard.
  let content = children
  if (isValidElement<{ children?: ReactNode }>(children) && children.type === "form") {
    const nodes = Children.toArray(children.props.children)
    const isActions = (node: ReactNode) => isValidElement<{ className?: string }>(node) && node.props.className?.includes("modal-actions")
    content = cloneElement(children, {}, <><div className="modal-scroll">{nodes.filter(node => !isActions(node))}</div>{nodes.filter(isActions)}</>)
  }
  useEffect(() => {
    const dialog = ref.current!
    const previous = document.activeElement as HTMLElement | null
    dialog.showModal()
    // Opening a form must not focus an editable field or open the keyboard.
    heading.current?.focus({ preventScroll: true })
    return () => { dialog.close(); if (previous?.isConnected) previous.focus({ preventScroll: true }) }
  }, [])
  return createPortal(
    <motion.dialog ref={ref} className="modal" aria-labelledby={id}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: reduced ? 0 : 0.2 }}
      onCancel={e => { e.preventDefault(); onClose() }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <motion.div className="modal-panel" initial={{ y: reduced ? 0 : 12 }} animate={{ y: 0 }} exit={{ y: reduced ? 0 : 8 }}>
        <header className="modal-heading">
          <h2 id={id} ref={heading} tabIndex={-1}>{title}</h2>
          <button type="button" className="icon-button" aria-label="Close dialog" onClick={onClose}><X size={22} aria-hidden="true" /></button>
        </header>
        {content}
      </motion.div>
    </motion.dialog>, document.querySelector(".ledger-app") ?? document.body,
  )
}

function iso(date: Date) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}` }
const months = Array.from({ length: 12 }, (_, month) => new Date(2026, month, 1).toLocaleDateString("en-US", { month: "long" }))
function Calendar({ value, max, choose }: { value: string; max?: string; choose: (date: string) => void }) {
  const initial = new Date((value || todayISO()) + "T12:00:00")
  const [month, setMonth] = useState(new Date(initial.getFullYear(), initial.getMonth(), 1))
  const grid = useRef<HTMLDivElement>(null)
  const id = useId()
  const year = month.getFullYear()
  const offset = (month.getDay() + 6) % 7
  const count = new Date(year, month.getMonth() + 1, 0).getDate()
  const moveMonth = (step: number) => setMonth(new Date(year, month.getMonth() + step, 1))
  const today = todayISO()
  return <div className="calendar">
    <div className="calendar-heading">
      <button type="button" className="icon-button" aria-label="Previous month" onClick={() => moveMonth(-1)}><ChevronLeft size={20} /></button>
      <label className="sr-only" htmlFor={`${id}-month`}>Month</label>
      <select id={`${id}-month`} value={month.getMonth()} onChange={e => setMonth(new Date(year, Number(e.target.value), 1))}>
        {months.map((name, index) => <option key={name} value={index}>{name}</option>)}
      </select>
      <label className="sr-only" htmlFor={`${id}-year`}>Year</label>
      <select id={`${id}-year`} value={year} onChange={e => setMonth(new Date(Number(e.target.value), month.getMonth(), 1))}>
        {Array.from({ length: 121 }, (_, i) => new Date().getFullYear() - 100 + i).map(y => <option key={y}>{y}</option>)}
      </select>
      <button type="button" className="icon-button" aria-label="Next month" disabled={!!max && iso(new Date(year, month.getMonth() + 1, 1)) > max} onClick={() => moveMonth(1)}><ChevronRight size={20} /></button>
    </div>
    <div className="calendar-grid" ref={grid} role="group" aria-label={`${months[month.getMonth()]} ${year}`}>
      {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map(d => <span className="calendar-weekday" key={d}>{d}</span>)}
      {Array.from({ length: offset }, (_, i) => <span key={`blank-${i}`} />)}
      {Array.from({ length: count }, (_, i) => {
        const date = iso(new Date(year, month.getMonth(), i + 1))
        return <button type="button" key={date} data-date={date}
          aria-label={new Date(date + "T12:00:00").toLocaleDateString("en-US", { dateStyle: "full" })}
          aria-pressed={value === date} aria-current={date === today ? "date" : undefined}
          disabled={!!max && date > max} className={value === date ? "selected" : ""}
          onClick={() => choose(date)}
          onKeyDown={event => {
            const step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[event.key]
            if (step == null) return
            event.preventDefault()
            const next = new Date(date + "T12:00:00"); next.setDate(next.getDate() + step)
            const key = iso(next)
            if (max && key > max) return
            setMonth(new Date(next.getFullYear(), next.getMonth(), 1))
            requestAnimationFrame(() => grid.current?.querySelector<HTMLButtonElement>(`[data-date="${key}"]`)?.focus())
          }}>{i + 1}</button>
      })}
    </div>
    <div className="calendar-actions">
      <button type="button" className="btn btn-neutral" disabled={!!max && today > max} onClick={() => choose(today)}>Today</button>
      {!max && <button type="button" className="btn btn-neutral" onClick={() => choose("")}>Clear date</button>}
    </div>
  </div>
}

export function DateField({ label, value, onChange, max }: { label: string; value: string; onChange: (value: string) => void; max?: string }) {
  const [open, setOpen] = useState(false)
  return <div className="field">
    <span>{label}</span>
    <button type="button" className="date-input" aria-label={`${label}: ${value ? fmtDate(value) : "Not set"}`} aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen(true)}>
      <span>{value ? new Date(value + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Not set"}</span>
      <CalendarDays size={21} aria-hidden="true" />
    </button>
    <AnimatePresence>{open && <Modal title={label} onClose={() => setOpen(false)} key="calendar">
      <Calendar value={value} max={max} choose={date => { onChange(date); setOpen(false) }} />
    </Modal>}</AnimatePresence>
  </div>
}

export const REPEAT: Record<Recurrence, string> = { none: "Does not repeat", weekly: "Weekly", biweekly: "Every two weeks", semimonthly: "Twice a month", monthly: "Monthly", annually: "Annually" }
export function scheduleLabel(e: Pick<PlanEntry, "dueDate" | "recurrence" | "dueDay" | "secondDueDay">): string {
  const repeat = e.recurrence ?? "none"
  if (repeat === "semimonthly") return `${e.dueDay ?? 1} & ${e.secondDueDay ?? 15} each month`
  if (repeat === "monthly" && e.dueDay && !e.dueDate) return `Monthly · day ${e.dueDay}`
  return [e.dueDate ? fmtDate(e.dueDate) : "", repeat !== "none" ? REPEAT[repeat] : ""].filter(Boolean).join(" · ") || "Date not set"
}
export function DuePicker({ entry, onChange }: { entry: PlanEntry; onChange: (e: PlanEntry) => void }) {
  return <div className="schedule-fields">
    <DateField label="Due date" value={entry.dueDate} onChange={date => onChange({ ...entry, dueDate: date, dueDay: date ? Number(date.slice(-2)) : entry.dueDay })} />
    <label className="field"><span>Repeat</span><select value={entry.recurrence ?? "none"} onChange={e => onChange({ ...entry, recurrence: e.target.value as Recurrence, ...(e.target.value === "semimonthly" ? { dueDay: entry.dueDay ?? 1, secondDueDay: entry.secondDueDay ?? 15 } : {}) })}>
      {Object.entries(REPEAT).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
    </select></label>
    {((entry.recurrence === "monthly" && !entry.dueDate) || entry.recurrence === "semimonthly") && <div className="two-fields schedule-days">
      <label className="field"><span>Day of month</span><input type="number" min="1" max="31" value={entry.dueDay ?? ""} onChange={e => onChange({ ...entry, dueDay: Number(e.target.value) || undefined })} /></label>
      {entry.recurrence === "semimonthly" && <label className="field"><span>Second day</span><input type="number" min="1" max="31" value={entry.secondDueDay ?? 15} onChange={e => onChange({ ...entry, secondDueDay: Number(e.target.value) || undefined })} /></label>}
    </div>}
  </div>
}
