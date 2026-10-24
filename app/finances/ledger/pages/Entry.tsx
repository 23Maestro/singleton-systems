import { ErrorNotice } from "../components/Feedback"
import { Label } from "@/components/finances/ui/label"
import { Card } from "@/components/finances/ui/card"
import { NativeSelect } from "@/components/finances/ui/native-select"
import { Input } from "@/components/finances/ui/input"
import { Button } from "@/components/finances/ui/button"
import { useRef, useState, type FormEvent } from "react"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { Minus, Plus } from "@/components/icons/evil"
import { useApp } from "../context"
import { DateField } from "../components/Controls"
import { CATEGORY_STYLES, parseAmount } from "@/lib/ledger/ledger"
import type { Category } from "@/lib/ledger/types"

export default function Entry() {
  const { entryType, today, addTransaction, navigate } = useApp()
  const reduced = useReducedMotion()
  const [type, setType] = useState<"income" | "expense">(entryType ?? "expense")
  const [amount, setAmount] = useState("")
  const [name, setName] = useState("")
  const [date, setDate] = useState(today)
  const [category, setCategory] = useState<Category>("Miscellaneous")
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)
  const id = useRef(crypto.randomUUID())
  const saving = useRef(false)
  async function submit(event: FormEvent) {
    event.preventDefault()
    if (saving.current) return
    setError("")
    try {
      const value = parseAmount(amount)
      if (!name.trim()) throw new Error("Add a description.")
      saving.current = true
      setBusy(true)
      await addTransaction({
        id: id.current,
        type,
        amount: value,
        name: name.trim(),
        date,
        ...(type === "expense" ? { category } : {}),
        status: "paid",
        createdAt: new Date().toISOString(),
      })
      navigate("home")
    } catch (e) {
      setError((e as Error).message)
    } finally {
      saving.current = false
      setBusy(false)
    }
  }
  return (
    <div className="page entry-page">
      <div className="page-title">
        <h1>New entry</h1>
      </div>
      <Card asChild><form onSubmit={submit} className="card entry-card">
        <div className="entry-toggle" aria-label="Entry type">
          {(["income", "expense"] as const).map((t) => (
            <Button
              type="button"
              key={t}
              className={`type-choice ${t} ${type === t ? "selected" : ""}`}
              aria-pressed={type === t}
              onClick={() => setType(t)}
            >
              {t === "income" ? <Plus size={20} aria-hidden="true" /> : <Minus size={20} aria-hidden="true" />}
              {t === "income" ? "Income" : "Expense"}
            </Button>
          ))}
        </div>
        <Label className={`amount-field ${type}`}>
          <span>Amount</span>
          <div>
            <span aria-hidden="true">$</span>
            <Input
              aria-label="Amount"
              inputMode="decimal"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              autoComplete="off"
            />
          </div>
        </Label>
        <div className="stack">
          <Label className="field">
            <span>Description</span>
            <Input
              maxLength={160}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </Label>
          <DateField label="Date" value={date} onChange={setDate} max={today} />
          <AnimatePresence initial={false}>
            {type === "expense" && <motion.div key="category" className="category-reveal"
              initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }} transition={{ duration: reduced ? 0 : 0.22 }}>
              <Label className="field"><span>Category</span>
                <NativeSelect value={category} onChange={e => setCategory(e.target.value as Category)}>
                  {(Object.keys(CATEGORY_STYLES) as Category[]).map(c => <option key={c}>{c}</option>)}
                </NativeSelect>
              </Label>
            </motion.div>}
          </AnimatePresence>
          {error && (
            <ErrorNotice>
              {error}
            </ErrorNotice>
          )}
          <div className="form-actions"><Button className={`btn btn-${type} submit-button`} disabled={busy}>
            {busy ? "Saving…" : `Record ${type}`}
          </Button></div>
        </div>
      </form></Card>
    </div>
  )
}
