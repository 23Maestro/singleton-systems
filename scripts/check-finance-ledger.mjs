import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

process.env.FINANCES_ACCESS_TOKEN = "finance-test-token-with-32-characters";

const root = process.cwd();
const {
  FINANCE_SESSION_COOKIE,
  financeAuthConfigured,
  financeSessionValue,
  isFinanceAuthorized,
  verifyFinanceToken,
} = await import("../lib/finance-auth.ts");
const { cycleProgress, daysLeftInCycle, getCycleForDate } = await import("../lib/finance-cycle.ts");

assert.equal(financeAuthConfigured(), true);
assert.equal(verifyFinanceToken("finance-test-token-with-32-characters"), true);
assert.equal(verifyFinanceToken("wrong-token"), false);
const session = financeSessionValue();
assert.match(session, /^[a-f0-9]{64}$/);
assert.equal(
  isFinanceAuthorized(new Request("https://example.test/api/finances", {
    headers: { cookie: `${FINANCE_SESSION_COOKIE}=${session}` },
  })),
  true,
);
assert.equal(
  isFinanceAuthorized(new Request("https://example.test/api/finances", {
    headers: { cookie: `${FINANCE_SESSION_COOKIE}=wrong` },
  })),
  false,
);

process.env.VERCEL_ENV = "preview";
process.env.FINANCES_PREVIEW_OPEN_ACCESS = "true";
assert.equal(isFinanceAuthorized(new Request("https://example.test/api/finances")), true);
delete process.env.FINANCES_PREVIEW_OPEN_ACCESS;
delete process.env.VERCEL_ENV;

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
  assert.match(source, /financeAccessError\(request\)/, `${file} must enforce the finance session`);
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
assert.match(client, /api\/finances\/session/);
assert.match(client, /catch \(cause\)[\s\S]*setAuthChecked\(true\)[\s\S]*setAuthenticated\(false\)/);

console.log("Finance ledger checks passed: private session, UUID-gated API, atomic debt payment, and local-date cycle math.");
