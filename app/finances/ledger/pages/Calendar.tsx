import { createContext, useContext, useMemo, useState } from "react"
import { Calendar as MonthCalendar, CalendarDayButton } from "@/components/finances/ui/calendar"
import { Button } from "@/components/finances/ui/button"
import { Card } from "@/components/finances/ui/card"
import { Badge } from "@/components/finances/ui/badge"
import { CalendarIcon, Plus } from "@/components/icons/evil"
import { hasSchedule, monthEvents, type CalendarEvent } from "@/lib/ledger/calendar"
import { fmtCurrency, toISODate } from "@/lib/ledger/dates"
import { useApp } from "../context"
import SourceIcon from "../components/SourceIcon"

const EventContext = createContext<CalendarEvent[]>([])
function MoneyDayButton(props: React.ComponentProps<typeof CalendarDayButton>) {
  const events = useContext(EventContext)
  const items = events.filter(event => event.date === toISODate(props.day.date))
  const due = items.some(event => event.kind === "due")
  const income = items.some(event => event.kind === "income")
  const spent = items.some(event => ["expense", "payment", "correction"].includes(event.kind))
  return <CalendarDayButton {...props} aria-label={`${props["aria-label"] ?? props.day.date.toLocaleDateString()}, ${items.length} ${items.length === 1 ? "item" : "items"}`}>
    <span>{props.day.date.getDate()}</span><span className="day-markers" aria-hidden="true">{due && <i className="due-dot" />}{income && <i className="income-dot" />}{spent && <i className="expense-dot" />}</span>
  </CalendarDayButton>
}

export default function Calendar() {
  const { data, today, navigate } = useApp()
  const [selected, setSelected] = useState(() => new Date(today + "T12:00:00"))
  const [month, setMonth] = useState(() => new Date(today + "T12:00:00"))
  const events = useMemo(() => monthEvents(data, month), [data, month])
  const dayEvents = events.filter(event => event.date === toISODate(selected))
  const undated = data.planEntries.filter(entry => entry.isActive && !hasSchedule(entry))
  const dueCount = events.filter(event => event.kind === "due").length
  const label = month.toLocaleDateString("en-US", { month: "long", year: "numeric" })
  return <div className="page budget-calendar-page">
    <div className="page-title"><div><p className="calendar-eyebrow">Your money, by day</p><h1>Calendar</h1></div>
      <Button className="btn btn-neutral" onClick={() => { const date = new Date(today + "T12:00:00"); setMonth(date); setSelected(date) }}>Today</Button>
    </div>
    <div className="calendar-summary"><span><strong>{dueCount}</strong> due dates in {month.toLocaleDateString("en-US", { month: "long" })}</span><span>Current cash <strong>{fmtCurrency(data.currentBalance)}</strong></span></div>
    <div className="budget-calendar-layout">
      <Card className="card calendar-month-card">
        <EventContext.Provider value={events}><MonthCalendar mode="single" month={month} onMonthChange={date => { setMonth(date); setSelected(new Date(date.getFullYear(), date.getMonth(), 1, 12)) }} selected={selected}
          onSelect={date => { if (date) setSelected(date) }} weekStartsOn={1} fixedWeeks showOutsideDays={false}
          aria-label={`${label} money calendar`}
          components={{ DayButton: MoneyDayButton }} /></EventContext.Provider>
        <div className="calendar-legend"><span><i className="due-dot" /> Due</span><span><i className="income-dot" /> Income</span><span><i className="expense-dot" /> Paid / spent</span></div>
        <p className="calendar-note">Due dates are reminders. Cash changes when you record a payment.</p>
      </Card>
      <Card className="card calendar-agenda" aria-live="polite">
        <header className="section-heading"><div><p>{selected.toLocaleDateString("en-US", { weekday: "long" })}</p><h2>{selected.toLocaleDateString("en-US", { month: "long", day: "numeric" })}</h2></div><Badge variant="secondary">{dayEvents.length} {dayEvents.length === 1 ? "item" : "items"}</Badge></header>
        {dayEvents.length ? <ul>{dayEvents.map(event => <li key={event.id} className="calendar-event"><SourceIcon name={event.name} tone={event.kind === "income" ? "mint" : "purple"} /><div className="row-copy"><strong>{event.name}</strong><small>{event.kind === "due" ? "Due · payment not assumed" : event.kind === "payment" ? "Payment recorded" : event.kind === "correction" ? "Balance correction" : event.kind === "income" ? "Income received" : "Expense recorded"}</small><span className={event.kind === "income" ? "income-text" : ""}>{event.amountLabel}</span></div></li>)}</ul> : <div className="calendar-day-empty"><CalendarIcon size={40} /><h3>Nothing here yet</h3><p>Pick a marked day to see bills and recorded activity.</p></div>}
        <div className="calendar-agenda-actions"><Button className="btn btn-neutral" onClick={() => navigate("plan")}>Open plan</Button><Button className="btn btn-primary" onClick={() => navigate("entry")}><Plus size={20} /> Add entry</Button></div>
      </Card>
    </div>
    {!!undated.length && <Card className="card undated-card"><header className="section-heading"><div><h2>{undated.length} {undated.length === 1 ? "item needs" : "items need"} a date</h2><p>Add dates in Plan to put these on your calendar.</p></div><Button className="btn btn-neutral" onClick={() => navigate("plan")}>Set dates</Button></header><p>{undated.map(entry => entry.name).join(" · ")}</p></Card>}
  </div>
}
