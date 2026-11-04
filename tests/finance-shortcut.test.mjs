import assert from "node:assert/strict";
import test from "node:test";
import { shortcutEntryHandler } from "../lib/ledger/shortcut.ts";
import { applyCommand } from "../lib/ledger/commands.ts";

const token = "test-only-finance-shortcut-key-0123456789";
const entry = { requestId: "2026-11-02T14:10:12.123-05:00", type: "expense", name: 'Food "and" coffee', amount: 12.34, date: "2026-11-02", category: "Food" };
function request(body = entry, authorization = `Bearer ${token}`, contentType = "application/json") {
  return new Request("https://example.test/api/finances/entries", { method: "POST", headers: { Authorization: authorization, "Content-Type": contentType }, body: typeof body === "string" ? body : JSON.stringify(body) });
}

test("Shortcut access fails closed before any ledger call", async () => {
  let calls = 0;
  const execute = async () => { calls++; };
  for (const config of [{ token: undefined, enabled: true }, { token: "short", enabled: true }, { token, enabled: false }]) {
    assert.equal((await shortcutEntryHandler({ ...config, execute })(request())).status, 503);
  }
  const post = shortcutEntryHandler({ token, enabled: true, execute });
  for (const key of ["", "Bearer wrong", token]) assert.equal((await post(request(entry, key))).status, 401);
  assert.equal(calls, 0);
});

test("invalid entries cannot change cash", async () => {
  let calls = 0;
  const post = shortcutEntryHandler({ token, enabled: true, execute: async () => { calls++; } });
  for (const patch of [{ amount: 0 }, { amount: -1 }, { amount: 1.234 }, { amount: "12.34" }, { amount: 1e10 }, { date: "2026-02-30" }, { type: "reconcile" }, { name: " " }, { category: "Unknown" }, { requestId: "short" }, { extra: true }]) {
    assert.equal((await post(request({ ...entry, ...patch }))).status, 400, JSON.stringify(patch));
  }
  assert.equal((await post(request("bad json"))).status, 400);
  assert.equal((await post(request(entry, `Bearer ${token}`, "text/plain"))).status, 415);
  assert.equal((await post(request("x".repeat(4097)))).status, 413);
  assert.equal(calls, 0);
});

test("a repeated HTTP save changes cash once and returns only a receipt", async () => {
  let data = { balanceSet: true, currentBalance: 100, transactions: [], plannedPayments: [], planEntries: [] };
  const operations = new Map();
  const post = shortcutEntryHandler({ token, enabled: true, execute: async command => {
    const payload = JSON.stringify(command);
    if (operations.has(command.id)) {
      if (operations.get(command.id) !== payload) throw new Error("different details");
      return { data };
    }
    data = applyCommand(data, command, "2026-11-02T19:00:00Z");
    operations.set(command.id, payload);
    return { data };
  } });
  const saved = await post(request());
  assert.equal(saved.status, 200);
  assert.equal(saved.headers.get("cache-control"), "private, no-store");
  const receipt = await saved.json();
  assert.deepEqual(Object.keys(receipt).sort(), ["id", "status"]);
  assert.equal(receipt.status, "saved");
  assert.deepEqual(await (await post(request())).json(), receipt);
  assert.equal(data.transactions.length, 1);
  assert.equal(data.currentBalance, 87.66);
  assert.equal((await post(request({ ...entry, amount: 20 }))).status, 409);
  assert.equal(data.currentBalance, 87.66);
  assert.equal((await post(request({ ...entry, requestId: entry.requestId + "-income", type: "income", amount: 50 }))).status, 200);
  assert.equal(data.currentBalance, 137.66);
});

test("database failures do not leak private data or claim a save", async () => {
  const post = shortcutEntryHandler({ token, enabled: true, execute: async () => { throw new Error("Supabase private secret balance"); } });
  const response = await post(request());
  assert.equal(response.status, 409);
  assert.doesNotMatch(JSON.stringify(await response.json()), /Supabase|secret|balance/);
});
