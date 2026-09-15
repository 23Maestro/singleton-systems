import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

process.env.FINANCES_ACCESS_TOKEN = "finance-test-token-with-32-characters";

const root = process.cwd();
const {
  FINANCE_SESSION_COOKIE,
  FINANCE_SESSION_MAX_AGE_SECONDS,
  financeSessionValue,
  isFinanceAuthorized,
  verifyFinanceSessionValue,
  verifyFinanceToken,
} = await import("../lib/finance-auth.ts");
const { cycleProgress, daysLeftInCycle, getCycleForDate } = await import("../lib/finance-cycle.ts");

const now = new Date("2026-09-11T12:00:00Z").getTime();
const session = financeSessionValue(now);
assert.equal(FINANCE_SESSION_MAX_AGE_SECONDS, 60 * 60 * 24 * 365);
assert.equal(verifyFinanceToken("finance-test-token-with-32-characters"), true);
assert.equal(verifyFinanceToken("wrong-token"), false);
assert.equal(verifyFinanceSessionValue(session, now), true);
assert.equal(verifyFinanceSessionValue(session, now + FINANCE_SESSION_MAX_AGE_SECONDS * 1000), false);
assert.equal(
  isFinanceAuthorized(new Request("https://example.test/api/finances", {
    headers: { cookie: `${FINANCE_SESSION_COOKIE}=${session}` },
  }), now),
  true,
);

const lateDay = new Date(2026, 7, 19, 23, 59, 59);
const cycle = getCycleForDate(lateDay);
assert.equal(daysLeftInCycle(cycle, lateDay), 12);
assert.equal(cycleProgress(cycle, lateDay), 25);

for (const file of [
  "app/api/finances/route.ts",
  "app/api/finances/[id]/route.ts",
  "app/api/finances/[id]/promote/route.ts",
  "app/api/finances/ledger/route.ts",
]) {
  const source = fs.readFileSync(path.join(root, file), "utf8");
  assert.match(source, /financeAccessError\(request\)/, `${file} must enforce finance access`);
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
const gate = fs.readFileSync(path.join(root, "app/finances/FinanceAccessGate.tsx"), "utf8");
assert.match(gate, /api\/finances\/session/);
assert.match(gate, /stays trusted for one year/);

console.log("Finance ledger checks passed: one-year private session, guarded APIs, atomic debt payment, and local-date cycle math.");
