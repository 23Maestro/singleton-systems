import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const { cycleProgress, daysLeftInCycle, getCycleForDate } = await import("../lib/finance-cycle.ts");

const lateDay = new Date(2026, 7, 19, 23, 59, 59);
const cycle = getCycleForDate(lateDay);
assert.equal(daysLeftInCycle(cycle, lateDay), 12);
assert.equal(cycleProgress(cycle, lateDay), 25);

for (const file of [
  "app/api/finances/route.ts",
  "app/api/finances/[id]/route.ts",
  "app/api/finances/[id]/promote/route.ts",
]) {
  const source = fs.readFileSync(path.join(root, file), "utf8");
  assert.doesNotMatch(source, /financeAccessError|finance-auth/, `${file} must not require finance access`);
  assert.doesNotMatch(source, /\{ error: parsed\.error\.flatten\(\) \}/, `${file} must return a string error`);
}

const entries = fs.readFileSync(path.join(root, "lib/finance-entries.ts"), "utf8");
assert.match(entries, /rpc\/promote_finance_debt_payment/);
assert.doesNotMatch(entries, /Math\.max\(0, remaining - amount\)/);

const migration = fs.readFileSync(
  path.join(root, "supabase/migrations/20260830170000_promote_finance_debt_payment.sql"),
  "utf8",
);
for (const snippet of ["for update", "security definer", "payment exceeds the remaining debt balance", "grant execute"]) {
  assert.match(migration, new RegExp(snippet));
}

const client = fs.readFileSync(path.join(root, "app/finances/FinancesApp.tsx"), "utf8");
assert.match(client, /@\/lib\/finance-contract/);
assert.doesNotMatch(client, /@\/lib\/finance-entries/);
assert.doesNotMatch(client, /api\/finances\/session|Ledger locked|>Lock<|signOut/);

console.log("Finance ledger checks passed: direct access, UUID-gated API, atomic debt payment, and local-date cycle math.");
