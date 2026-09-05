import assert from "node:assert/strict";
import fs from "node:fs";
import { commandSchema, applyCommand } from "../lib/ledger/commands.ts";
import { recordPayment } from "../lib/ledger/ledger.ts";
import { SEED as seed } from "../lib/ledger/seed.ts";

const base = structuredClone(seed);
base.balanceSet = true; base.currentBalance = 0;
base.transactions = [{ id: "8c86daca-d3de-4d5f-9cbf-2704212043f9", name: "HSN / Synchrony — first payment", type: "expense", amount: 150, date: "2026-08-19", status: "paid", createdAt: "2026-08-21T07:17:24Z", historical: true, planEntryId: "d2" }];
base.plannedPayments = [];
const command = commandSchema.parse({ type: "entry", id: "6c785814-10b1-4578-a59b-7dfd4c79a6a1", entry: { type: "income", name: "Income", amount: 500, date: "2026-08-22" } });
const income = applyCommand(base, command, "2026-09-03T00:00:00Z");
assert.equal(income.currentBalance, 500);
assert.equal(income.transactions[0].category, undefined);
assert.equal(income.transactions[1].historical, true);
assert.equal(income.planEntries.find(e => e.id === "d2").balance, 769.24);
assert.deepEqual(
  Object.fromEntries(Object.entries(income.planEntries.find(e => e.id === "d6")).filter(([key]) => ["balance", "amountDisplay", "isApproximate", "balanceQualifier", "balanceDisplay"].includes(key))),
  { balance: 1035 },
);
assert.deepEqual(applyCommand(income, command, "2026-09-03T00:00:01Z"), income);
const expense = applyCommand(income, commandSchema.parse({ type: "entry", id: "64f586d8-6548-4215-8e65-86ef4fe9e53a", entry: { type: "expense", name: "Expense", amount: 40, date: "2026-08-22", category: "Food" } }), "2026-09-03T00:00:00Z");
assert.equal(expense.currentBalance, 460);
const paid = recordPayment({ ...base, balanceSet: false }, "d2", 51.6, "2026-08-22", "new-payment");
assert.equal(paid.currentBalance, -51.6);
assert.equal(paid.planEntries.find(e => e.id === "d2").balance, 717.64);
const read = path => fs.readFileSync(path, "utf8");
const home = read("app/finances/ledger/pages/Home.tsx");
assert.doesNotMatch(home, /Set balance|Reconcile|btn-planning/);
const entry = read("app/finances/ledger/pages/Entry.tsx");
assert.doesNotMatch(entry, /Client payment|DoorDash|autoFocus/);
assert.match(entry, /type === "expense" &&/);
for (const file of ["Entry", "Plan"]) assert.doesNotMatch(read(`app/finances/ledger/pages/${file}.tsx`), /autoFocus/);
const controls = read("app/finances/ledger/components/Controls.tsx");
assert.doesNotMatch(controls, /showPicker|input\?\.focus|Use date/);
assert.match(controls, /heading\.current\?\.focus/);
assert.match(controls, /onChange\(date\); setOpen\(false\)/);
const css = read("app/finances/ledger/ledger.css");
assert.match(css, /--bg: #08090b/);
assert.match(css, /--visual-height/);
assert.match(css, /font-size: 18px/);
assert.doesNotMatch(read("app/icon.svg"), /<text|font-family/);
assert.match(read("app/icon.svg"), /translate\(357 340\) scale\(\.95\)/);
for (const file of ["app/finances/layout.tsx", "app/finances/manifest.ts", "app/finances/ledger/components/Nav.tsx", "app/finances/ledger/context.tsx"]) {
  assert.doesNotMatch(read(file), />Ledger<|[\"']Ledger(?: \||[\"'])|Loading saved ledger|saved ledger/i);
}
console.log("PASS: Finances naming, zero cash baseline, exact USAA total, category-free income, historical HSN preservation, exact payments, blank descriptions, shared form focus, one-tap dates, dark palette, outlined favicon.");
