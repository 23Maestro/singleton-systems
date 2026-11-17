import { test } from "node:test";
import assert from "node:assert/strict";
import { applyExpenseBatch, commitExpenseBatch, prepareExpenseBatch } from "../lib/ledger/batch.ts";
import { createExpenseReview } from "../lib/ledger/expense-review.ts";
import { createExpenseHttp } from "../lib/ledger/expense-http.ts";

const input = [
  { name: "Eye exam", amount: 49, date: "2026-11-13", category: "Health" },
  { name: "Pizza", amount: 28.38, date: "2026-11-13", category: "Food" },
];
const starting = { balanceSet: true, currentBalance: 100, transactions: [], planEntries: [], plannedPayments: [] };
const key = "batch-12345678901234567890";

test("a confirmed batch applies all entries and replays without another deduction", () => {
  const batch = prepareExpenseBatch(key, input);
  const saved = applyExpenseBatch(starting, batch, "2026-11-13T12:00:00Z");
  assert.equal(saved.currentBalance, 22.62);
  assert.equal(saved.transactions.length, 2);
  assert.deepEqual(applyExpenseBatch(saved, batch, "2026-11-13T12:00:01Z"), saved);
  assert.equal(starting.currentBalance, 100);
});

test("batch validation rejects bad entries and detects changed retry details", () => {
  assert.throws(() => prepareExpenseBatch(key, []));
  assert.throws(() => prepareExpenseBatch(key, [{ ...input[0], amount: -1 }]));
  assert.throws(() => prepareExpenseBatch(key, [{ ...input[0], category: "Unknown" }]));
  const original = prepareExpenseBatch(key, input);
  const changed = prepareExpenseBatch(key, [{ ...input[0], amount: 50 }, input[1]]);
  assert.equal(original.id, changed.id);
  assert.notEqual(original.hash, changed.hash);
});

test("the journal commits the batch once and rejects stale reviews", async () => {
  let state = { data: starting, revision: 4 };
  let record;
  const read = async () => structuredClone(state);
  const commit = async command => {
    if (record?.id === command.p_id) {
      if (record.hash !== command.p_hash) throw new Error("Changed confirmation");
      return { revision: state.revision, replayed: true };
    }
    if (command.p_revision !== state.revision) return { conflict: true };
    state = { data: command.p_data, revision: state.revision + 1 };
    record = { id: command.p_id, hash: command.p_hash };
    return { revision: state.revision };
  };
  const args = { batchId: key, entries: input, reviewedRevision: 4, timestamp: "2026-11-13T12:00:00Z", read, commit };
  assert.deepEqual(await commitExpenseBatch(args), { revision: 5, replayed: false });
  assert.deepEqual(await commitExpenseBatch(args), { revision: 5, replayed: true });
  assert.equal(state.data.currentBalance, 22.62);
  await assert.rejects(commitExpenseBatch({ ...args, entries: [{ ...input[0], amount: 50 }] }), /Changed confirmation/);
  await assert.rejects(commitExpenseBatch({ ...args, batchId: "batch-other-123456789012345" }), /Finances changed/);
  assert.equal(state.data.transactions.length, 2);
});

test("review checks the ledger before confirmation and blocks malformed results", async () => {
  let writes = 0;
  let snapshot = { data: { ...starting, transactions: [{ name: "Old pizza", amount: 28.38, date: "2026-11-13", type: "expense" }] }, revision: 1 };
  const review = createExpenseReview({ read: async () => snapshot, commit: async cmd => { writes++; snapshot = { data: cmd.p_data, revision: 2 }; return { revision: 2 }; } });
  const draft = await review.prepare({ threadId: "thread", entries: input, questions: [] });
  assert.equal(draft.status, "review");
  assert.deepEqual(draft.duplicates, [{ index: 1, matches: ["Old pizza"] }]);
  assert.equal(writes, 0);
  assert.equal((await review.confirm(draft.id)).balance, 22.62);
  assert.equal(writes, 1);
  await assert.rejects(review.prepare({ threadId: "thread", entries: [{ ...input[0], date: "2026-11-13garbage" }], questions: [] }));
  assert.equal((await review.prepare({ threadId: "thread", entries: [], questions: ["Which date?"] })).status, "questions");
  assert.equal(writes, 1);
});

test("the phone handler requires Tailscale identity and confirmation before a write", async () => {
  let snapshot = { data: starting, revision: 1 }; let writes = 0;
  const review = createExpenseReview({ read: async () => snapshot, commit: async cmd => { writes++; snapshot = { data: cmd.p_data, revision: 2 }; return { revision: 2 }; } });
  const handler = createExpenseHttp({ login: "owner@example.com", review, parseImages: async () => ({ threadId: "thread", entries: input, questions: [] }) });
  const req = (path, body, headers = {}) => new Request(`http://localhost${path}`, { method: "POST", headers: { "content-type": "application/json", ...headers }, body: JSON.stringify(body) });
  const payload = { images: ["aGVsbG8="], note64: "dG9kYXk=" };
  assert.equal((await handler(req("/prepare", payload))).status, 403);
  assert.equal((await handler(req("/prepare", payload, { "tailscale-user-login": "owner@example.com", origin: "https://bad.test" }))).status, 403);
  const draft = await (await handler(req("/prepare", payload, { "tailscale-user-login": "owner@example.com" }))).json();
  assert.equal(draft.status, "review"); assert.equal(writes, 0);
  assert.equal((await handler(req("/confirm", { id: draft.id }, { "tailscale-user-login": "owner@example.com" }))).status, 200);
  assert.equal(writes, 1);
});
