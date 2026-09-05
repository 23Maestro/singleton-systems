import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { runInNewContext } from "node:vm"
import {
  displayBalance,
  migrate,
  parseAmount,
  recordEntry,
  recordPayment,
  sortAmount,
  validateEntry,
} from "../lib/ledger/ledger.ts"
import { isDate, mondayFor, toISODate, todayISO } from "../lib/ledger/dates.ts"

const context = readFileSync(
  new URL("../lib/ledger/seed.ts", import.meta.url),
  "utf8",
)
const seed = JSON.parse(
  JSON.stringify(
    runInNewContext(
      "(" +
        context.match(
          /(?:export )?const SEED: AppData = ([\s\S]*?);?;\n/,
        )[1] +
        ")",
    ),
  ),
)
seed.planEntries.forEach((e) => {
  if (e.dueDate === "monthly") {
    e.dueDate = ""
    e.recurrence = "monthly"
  }
})
assert.equal(seed.planEntries.length, 37)
assert.equal(new Set(seed.planEntries.map((e) => e.id)).size, 37)
seed.planEntries.forEach(validateEntry)
assert.ok(!seed.planEntries.some((e) => ["Gas", "Groceries"].includes(e.name)))
assert.equal(seed.planEntries.find((e) => e.id === "b2").dueDate, "2026-09-04")
assert.equal(
  seed.planEntries.find((e) => e.id === "b4").recurrence,
  "semimonthly",
)

let data = { ...structuredClone(seed), balanceSet: true, currentBalance: 59 }
data = recordEntry(data, {
  id: "income-1",
  type: "income",
  amount: 2000,
  name: "Client paid",
  date: todayISO(),
  category: "Work",
  status: "paid",
  createdAt: "test",
})
assert.equal(data.currentBalance, 2059)
data = recordPayment(data, "b1", 700, todayISO(), "rent-1")
assert.equal(data.currentBalance, 1359)
assert.equal(data.planEntries.find((e) => e.id === "b1").amount, 700)
assert.equal(recordPayment(data, "b1", 700, todayISO(), "rent-1"), data)
const before = structuredClone(data)
const inputReference = data
data = recordPayment(data, "s1", 100, todayISO(), "chatgpt-1")
assert.equal(data.planEntries.find((e) => e.id === "s1").amount, 20)
assert.equal(data.currentBalance, 1259)
data = recordPayment(data, "d2", 51.6, todayISO(), "hsn-1")
assert.equal(data.planEntries.find((e) => e.id === "d2").balance, 717.64)
assert.equal(data.planEntries.find((e) => e.id === "d2").paymentAmount, 51.6)
data = recordPayment(data, "a1", 50, todayISO(), "cleo-1")
assert.equal(data.planEntries.find((e) => e.id === "a1").balance, 54.98)
data = recordPayment(data, "d5", 50, todayISO(), "discover-1")
assert.equal(
  displayBalance(data.planEntries.find((e) => e.id === "d5")),
  "around $9,950.00",
)
data = recordPayment(data, "d8", 50, todayISO(), "spectrum-1")
assert.equal(
  displayBalance(data.planEntries.find((e) => e.id === "d8")),
  "around $100.00–$300.00",
)
assert.equal(sortAmount(data.planEntries.find((e) => e.id === "d8")), 300)
assert.deepEqual(inputReference, before)
assert.equal(before.planEntries.find((e) => e.id === "d2").balance, 769.24)
for (const value of ["", "abc", "1.234", "-4", "1e2", "NaN", "Infinity"])
  assert.throws(() => parseAmount(value))
assert.equal(parseAmount("0", true), 0)
assert.equal(parseAmount("-10", true, true), -10)
assert.throws(() => recordPayment(data, "d1", NaN, todayISO(), "bad"))
assert.throws(() => recordPayment(data, "d1", 1, "2099-01-01", "future"))
assert.throws(() =>
  recordEntry(data, {
    id: "badcat",
    type: "expense",
    amount: 1,
    name: "Gas",
    date: todayISO(),
    category: "Unknown",
  }),
)
assert.equal(isDate("2026-02-30"), false)
assert.equal(isDate("2028-02-29"), true)
assert.equal(mondayFor("2026-09-06"), "2026-08-31")
assert.equal(mondayFor("2026-09-07"), "2026-09-07")
assert.equal(toISODate(new Date(2026, 8, 7)), "2026-09-07")
const original = structuredClone(seed)
delete original.schemaVersion
original.currentBalance = 432.1
original.planEntries = original.planEntries.filter((e) => e.planType !== "bill")
original.planEntries.find((e) => e.id === "s1").amount = 100
original.transactions.push({ id: "existing", name: "Existing", amount: 7 })
const migrated = migrate(original, seed)
assert.equal(migrated.currentBalance, 432.1)
assert.equal(migrated.planEntries.find((e) => e.id === "s1").amount, 100)
assert.equal(migrated.transactions[0].id, "existing")
assert.equal(migrated.planEntries.length, 37)
assert.equal(migrate(migrated, seed), migrated)
const deleted = {
  ...migrated,
  planEntries: migrated.planEntries.filter((e) => e.id !== "b1"),
}
assert.equal(migrate(deleted, seed).planEntries.length, 36)
assert.throws(() => migrate({}, seed))
console.log(
  "PASS: 37 records; exact money; C² overrides; P² depletion; estimates and ranges; duplicate safety; validation; dates; non-destructive migration.",
)
