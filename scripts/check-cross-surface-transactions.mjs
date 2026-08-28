import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import {
  approveReview,
  canComplete,
  createTransaction,
  executeTransaction,
  planCompensation,
  verifyReceiptChain,
} from "../lib/transactions/engine.mjs";
import { canonicalJson, cloneValue, hashValue } from "../lib/transactions/contract.mjs";
import { materializeOwnerFlow } from "../lib/transactions/owner-graph.mjs";

const root = process.cwd();
const fixtureRoot = path.join(root, "config", "transactions", "fixtures");
const fixedClock = () => new Date("2026-08-27T23:00:00.000Z");

function loadJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function fixture(name) {
  return loadJson(path.join(fixtureRoot, name));
}

function ledger(transaction, ownerId) {
  return transaction.mutationLedger.find((entry) => entry.ownerId === ownerId);
}

function rehashReceipts(transaction) {
  let previousReceiptHash = null;
  transaction.receipts = transaction.receipts.map((receipt, index) => {
    const unsigned = {
      ...receipt,
      sequence: index + 1,
      previousReceiptHash,
    };
    delete unsigned.receiptHash;
    const rehashed = { ...unsigned, receiptHash: hashValue(unsigned) };
    previousReceiptHash = rehashed.receiptHash;
    return rehashed;
  });
}

function memoryAdapters(transaction, faults = {}) {
  const state = faults.state ?? new Map();
  const applyCounts = faults.applyCounts ?? new Map();
  const adapters = Object.fromEntries(
    transaction.declaredOwners.map((owner) => [
      owner.ownerId,
      {
        async plan({ mutation }) {
          if (faults.planErrorOwner === owner.ownerId) throw new Error(`synthetic plan error for ${owner.ownerId}`);
          return cloneValue(mutation.input);
        },
        async readback({ phase }) {
          const current = cloneValue(state.get(owner.ownerId) ?? null);
          if (phase === "after" && faults.mismatchOwner === owner.ownerId) {
            return { mismatch: true, actual: current };
          }
          return current;
        },
        async apply({ plan, deliveryKey }) {
          if (faults.applyErrorOwner === owner.ownerId) throw new Error(`synthetic apply error for ${owner.ownerId}`);
          applyCounts.set(owner.ownerId, (applyCounts.get(owner.ownerId) ?? 0) + 1);
          state.set(owner.ownerId, cloneValue(plan.desiredState));
          return { deliveryKey, accepted: true };
        },
        async verify({ plan, readback }) {
          const ok = canonicalJson(readback) === canonicalJson(plan.desiredState);
          return {
            ok,
            evidence: {
              expectedHash: hashValue(plan.desiredState),
              actualHash: hashValue(readback),
              ...(faults.evidenceRevisionOwner === owner.ownerId
                ? { revision: faults.evidenceRevision ?? "changed" }
                : {}),
            },
            error: ok ? null : `readback mismatch for ${owner.ownerId}`,
          };
        },
        async receipt({ readback, verification }) {
          if (faults.receiptErrorOwner === owner.ownerId) throw new Error(`synthetic receipt error for ${owner.ownerId}`);
          return {
            adapter: "synthetic-memory",
            readbackHash: hashValue(readback),
            verification: cloneValue(verification.evidence),
          };
        },
      },
    ]),
  );
  return { adapters, state, applyCounts, faults };
}

async function validRepositoryProof() {
  const transaction = createTransaction(fixture("repository-workflow.json"), { clock: fixedClock });
  const harness = memoryAdapters(transaction);
  await executeTransaction(transaction, harness.adapters, { clock: fixedClock });
  assert.equal(transaction.status, "completed");
  assert.equal(canComplete(transaction), true);
  assert.equal(transaction.receipts.length, 6);
  assert.ok(transaction.mutationLedger.every((entry) => entry.status === "verified"));
  assert.equal(verifyReceiptChain(transaction), true);
  assert.deepEqual(
    transaction.receipts.map((receipt) => receipt.ownerId),
    [
      "repository-policy",
      "plugin-packaging",
      "cerebral-registry",
      "supabase-registry",
      "repository-checks",
      "repository-readback",
    ],
  );
  return { transaction, harness };
}

const envelopeSchema = loadJson(path.join(root, "config", "transactions", "transaction-envelope.schema.json"));
const receiptSchema = loadJson(path.join(root, "config", "transactions", "receipt.schema.json"));
const ownerMap = loadJson(path.join(root, "config", "transactions", "owner-map.json"));
const ajv = new Ajv2020({ allErrors: true });
addFormats(ajv);
ajv.addSchema(receiptSchema);
const validateEnvelope = ajv.compile(envelopeSchema);
const validateReceipt = ajv.getSchema(receiptSchema.$id);
assert.equal(envelopeSchema.properties.status.enum.includes("incomplete"), true);
assert.equal(envelopeSchema.properties.mutationLedger.items.$ref, "#/$defs/ledgerEntry");
assert.equal(receiptSchema.properties.previousReceiptHash.type.includes("null"), true);
assert.equal(ownerMap.stateOwners["task-state"].owner, "Linear");
assert.equal(ownerMap.stateOwners["implementation-evidence"].owner, "GitHub/repository");
assert.equal(ownerMap.stateOwners["client-opportunity-truth"].owner, "Notion");
assert.equal(ownerMap.stateOwners["integration-receipts-and-drafts"].owner, "Supabase");
assert.equal(ownerMap.flows["systems-tool-harness"].owners[0].ownerId, "source-checkout");
assert.ok(ownerMap.flows["systems-tool-harness"].owners.some(({ ownerId }) => ownerId === "active-task-catalog"));

const materialized = materializeOwnerFlow({ root, flowId: "systems-tool-harness" });
const plannedTransaction = createTransaction(materialized.definition, { clock: fixedClock });
assert.equal(validateEnvelope(plannedTransaction), true, JSON.stringify(validateEnvelope.errors));

const validProof = await validRepositoryProof();
assert.equal(validateEnvelope(validProof.transaction), true, JSON.stringify(validateEnvelope.errors));
for (const receipt of validProof.transaction.receipts) {
  assert.equal(validateReceipt(receipt), true, JSON.stringify(validateReceipt.errors));
}

{
  const transaction = createTransaction(fixture("repository-workflow.json"), { clock: fixedClock });
  const harness = memoryAdapters(transaction, { applyErrorOwner: "cerebral-registry" });
  await executeTransaction(transaction, harness.adapters, { clock: fixedClock });
  assert.equal(transaction.status, "incomplete");
  assert.equal(ledger(transaction, "repository-policy").status, "verified");
  assert.equal(ledger(transaction, "plugin-packaging").status, "verified");
  assert.equal(ledger(transaction, "cerebral-registry").status, "stale");
  assert.equal(ledger(transaction, "cerebral-registry").staleReason, "mutation-outcome-uncertain");
  assert.equal(ledger(transaction, "supabase-registry").status, "stale");
  assert.equal(ledger(transaction, "repository-checks").status, "stale");
  assert.equal(ledger(transaction, "repository-checks").staleReason, "upstream-invalidated");
  assert.equal(ledger(transaction, "repository-checks").blockedByOwnerId, "cerebral-registry");
  assert.equal(canComplete(transaction), false);
  assert.ok(transaction.compensationPlan.length >= 2);
  assert.ok(transaction.compensationPlan.every((item) => item.automatic === false));
}

{
  const transaction = createTransaction(fixture("notion-linear.json"), { clock: fixedClock });
  transaction.expectedMutations = [];
  ledger(transaction, "notion-opportunity").status = "applied";
  assert.doesNotThrow(() => planCompensation(transaction));
  assert.equal(transaction.compensationPlan[0].operation, "manual-review");
}

{
  const transaction = createTransaction(fixture("repository-workflow.json"), { clock: fixedClock });
  const harness = memoryAdapters(transaction, { applyErrorOwner: "supabase-registry" });
  await executeTransaction(transaction, harness.adapters, { clock: fixedClock });
  assert.equal(transaction.status, "incomplete");
  assert.equal(ledger(transaction, "cerebral-registry").status, "verified");
  assert.equal(ledger(transaction, "supabase-registry").status, "stale");
  assert.equal(ledger(transaction, "repository-checks").status, "stale");
  assert.equal(ledger(transaction, "repository-readback").status, "stale");
  assert.equal(canComplete(transaction), false);
}

{
  const { transaction, harness } = await validRepositoryProof();
  const mutation = transaction.expectedMutations.find(({ ownerId }) => ownerId === "repository-policy");
  mutation.input.desiredState.contractRevision = "touch-once-r2";
  await executeTransaction(transaction, harness.adapters, {
    clock: fixedClock,
    interruptAfterOwner: "repository-policy",
  });
  assert.equal(transaction.status, "interrupted");
  assert.equal(ledger(transaction, "repository-policy").status, "applied");
  for (const ownerId of [
    "plugin-packaging",
    "cerebral-registry",
    "supabase-registry",
    "repository-checks",
    "repository-readback",
  ]) {
    assert.equal(ledger(transaction, ownerId).status, "stale");
  }
  assert.equal(canComplete(transaction), false);
  await executeTransaction(transaction, harness.adapters, { clock: fixedClock });
  assert.equal(transaction.status, "completed");
  assert.equal(canComplete(transaction), true);
}

{
  const transaction = createTransaction(fixture("notion-linear.json"), { clock: fixedClock });
  const harness = memoryAdapters(transaction, { mismatchOwner: "linear-next-action" });
  approveReview(
    transaction,
    "client-update-review",
    { reviewer: "Jerami", evidence: "synthetic approval" },
    { clock: fixedClock },
  );
  await executeTransaction(transaction, harness.adapters, { clock: fixedClock });
  assert.equal(transaction.status, "incomplete");
  assert.equal(ledger(transaction, "notion-opportunity").status, "verified");
  assert.equal(ledger(transaction, "linear-next-action").status, "stale");
  assert.match(transaction.error, /readback mismatch/);
  assert.equal(canComplete(transaction), false);
}

{
  const transaction = createTransaction(fixture("notion-linear.json"), { clock: fixedClock });
  const harness = memoryAdapters(transaction, { planErrorOwner: "notion-opportunity" });
  approveReview(transaction, "client-update-review", { reviewer: "Jerami" }, { clock: fixedClock });
  await executeTransaction(transaction, harness.adapters, { clock: fixedClock });
  assert.equal(transaction.status, "incomplete");
  assert.equal(ledger(transaction, "notion-opportunity").status, "failed");
  assert.match(transaction.error, /synthetic plan error/);
}

{
  const transaction = createTransaction(fixture("notion-linear.json"), { clock: fixedClock });
  const harness = memoryAdapters(transaction, { receiptErrorOwner: "notion-opportunity" });
  approveReview(transaction, "client-update-review", { reviewer: "Jerami" }, { clock: fixedClock });
  await executeTransaction(transaction, harness.adapters, { clock: fixedClock });
  assert.equal(transaction.status, "incomplete");
  assert.equal(ledger(transaction, "notion-opportunity").status, "stale");
  assert.equal(ledger(transaction, "notion-opportunity").staleReason, "mutation-outcome-uncertain");
  assert.equal(ledger(transaction, "notion-opportunity").applyAttempts, 1);
  assert.match(transaction.error, /synthetic receipt error/);
  assert.ok(transaction.compensationPlan.length >= 1);
  assert.ok(transaction.compensationPlan.some(({ ownerId }) => ownerId === "notion-opportunity"));
  harness.faults.receiptErrorOwner = null;
  await executeTransaction(transaction, harness.adapters, { clock: fixedClock });
  assert.equal(transaction.status, "completed");
  assert.equal(ledger(transaction, "notion-opportunity").applyAttempts, 1);
  assert.equal(harness.applyCounts.get("notion-opportunity"), 1);
}

{
  const { transaction, harness } = await validRepositoryProof();
  const receiptsBefore = transaction.receipts.length;
  const appliesBefore = new Map(harness.applyCounts);
  await executeTransaction(transaction, harness.adapters, { clock: fixedClock });
  assert.equal(transaction.status, "completed");
  assert.equal(transaction.receipts.length, receiptsBefore);
  assert.deepEqual(harness.applyCounts, appliesBefore);
  assert.equal(transaction.attempts.filter(({ outcome }) => outcome === "duplicate").length, 6);
}

{
  const transaction = createTransaction(fixture("notion-linear.json"), { clock: fixedClock });
  const harness = memoryAdapters(transaction);
  await executeTransaction(transaction, harness.adapters, { clock: fixedClock });
  assert.equal(transaction.status, "awaiting_review");
  assert.equal(harness.applyCounts.size, 0);
  approveReview(
    transaction,
    "client-update-review",
    { reviewer: "Jerami", evidence: { decision: "approved" } },
    { clock: fixedClock },
  );
  await executeTransaction(transaction, harness.adapters, {
    clock: fixedClock,
    interruptAfterOwner: "notion-opportunity",
  });
  assert.equal(transaction.status, "interrupted");
  assert.equal(ledger(transaction, "notion-opportunity").status, "applied");
  assert.equal(harness.applyCounts.get("notion-opportunity"), 1);
  const serialized = JSON.stringify(transaction);
  const resumed = JSON.parse(serialized);
  await executeTransaction(resumed, harness.adapters, { clock: fixedClock });
  assert.equal(resumed.status, "completed");
  assert.equal(harness.applyCounts.get("notion-opportunity"), 1);
  assert.equal(harness.applyCounts.get("linear-next-action"), 1);
  assert.ok(resumed.attempts.some(({ ownerId, outcome }) => ownerId === "notion-opportunity" && outcome === "recovered"));
}

{
  const transaction = createTransaction(fixture("notion-linear.json"), { clock: fixedClock });
  const harness = memoryAdapters(transaction);
  approveReview(transaction, "client-update-review", { reviewer: "Jerami" }, { clock: fixedClock });
  let durablePreparedState = null;
  await executeTransaction(transaction, harness.adapters, {
    clock: fixedClock,
    checkpoint(current) {
      const entry = ledger(current, "notion-opportunity");
      if (entry.status === "prepared") durablePreparedState = JSON.parse(JSON.stringify(current));
      if (entry.status === "applied") throw new Error("synthetic crash before applied checkpoint");
    },
  });
  assert.equal(transaction.status, "incomplete");
  assert.equal(harness.applyCounts.get("notion-opportunity"), 1);
  assert.equal(ledger(durablePreparedState, "notion-opportunity").status, "prepared");
  assert.equal(validateEnvelope(durablePreparedState), true, JSON.stringify(validateEnvelope.errors));
  await executeTransaction(durablePreparedState, harness.adapters, { clock: fixedClock });
  assert.equal(durablePreparedState.status, "completed");
  assert.equal(harness.applyCounts.get("notion-opportunity"), 1);
  assert.ok(
    durablePreparedState.attempts.some(
      ({ ownerId, outcome }) => ownerId === "notion-opportunity" && outcome === "recovered",
    ),
  );
}

{
  const transaction = createTransaction(fixture("notion-linear.json"), { clock: fixedClock });
  const harness = memoryAdapters(transaction);
  approveReview(transaction, "client-update-review", { reviewer: "Jerami" }, { clock: fixedClock });
  let durablePreparedState = null;
  await executeTransaction(transaction, harness.adapters, {
    clock: fixedClock,
    checkpoint(current) {
      durablePreparedState = JSON.parse(JSON.stringify(current));
      throw new Error("synthetic crash before external apply");
    },
  });
  assert.equal(harness.applyCounts.size, 0);
  const notionAdapter = harness.adapters["notion-opportunity"];
  delete harness.adapters["notion-opportunity"];
  await executeTransaction(durablePreparedState, harness.adapters, { clock: fixedClock });
  assert.equal(ledger(durablePreparedState, "notion-opportunity").staleReason, "mutation-outcome-uncertain");
  harness.adapters["notion-opportunity"] = notionAdapter;
  await executeTransaction(durablePreparedState, harness.adapters, {
    clock: fixedClock,
    mode: "reconcile",
    continueOnFailure: true,
  });
  assert.equal(ledger(durablePreparedState, "notion-opportunity").staleReason, "mutation-outcome-uncertain");
  await executeTransaction(durablePreparedState, harness.adapters, { clock: fixedClock });
  assert.equal(durablePreparedState.status, "incomplete");
  assert.equal(ledger(durablePreparedState, "notion-opportunity").status, "stale");
  assert.match(durablePreparedState.error, /automatic replay refused/);
  assert.equal(harness.applyCounts.size, 0);
}

{
  const { transaction, harness } = await validRepositoryProof();
  transaction.receipts[1].adapterEvidence.readbackHash = "0".repeat(64);
  assert.throws(() => verifyReceiptChain(transaction), /stale or tampered/);
  assert.equal(canComplete(transaction), false);
  const appliesBefore = new Map(harness.applyCounts);
  await executeTransaction(transaction, harness.adapters, { clock: fixedClock });
  assert.equal(transaction.status, "incomplete");
  assert.match(transaction.error, /stale or tampered/);
  assert.deepEqual(harness.applyCounts, appliesBefore);
}

{
  const { transaction } = await validRepositoryProof();
  transaction.receipts[0].transactionId = "tx-other";
  rehashReceipts(transaction);
  assert.throws(() => verifyReceiptChain(transaction), /different transaction/);
  assert.equal(canComplete(transaction), false);
}

{
  const { transaction } = await validRepositoryProof();
  ledger(transaction, "repository-readback").afterState = { rewritten: true };
  assert.equal(verifyReceiptChain(transaction), true);
  assert.equal(canComplete(transaction), false);
}

{
  const { transaction, harness } = await validRepositoryProof();
  const receiptsBefore = transaction.receipts.length;
  harness.faults.evidenceRevisionOwner = "repository-readback";
  harness.faults.evidenceRevision = "r2";
  await executeTransaction(transaction, harness.adapters, { clock: fixedClock, mode: "reconcile" });
  assert.equal(transaction.status, "completed");
  assert.equal(transaction.receipts.length, receiptsBefore + 1);
  assert.equal(canComplete(transaction), true);
}

{
  const transaction = createTransaction(fixture("notion-linear.json"), { clock: fixedClock });
  const harness = memoryAdapters(transaction);
  approveReview(
    transaction,
    "client-update-review",
    { reviewer: "Jerami", evidence: "approved synthetic owner updates" },
    { clock: fixedClock },
  );
  await executeTransaction(transaction, harness.adapters, { clock: fixedClock });
  assert.equal(transaction.status, "completed");
  assert.equal(canComplete(transaction), true);
  assert.deepEqual(
    transaction.mutationLedger.map(({ ownerId, status }) => ({ ownerId, status })),
    [
      { ownerId: "notion-opportunity", status: "verified" },
      { ownerId: "linear-next-action", status: "verified" },
    ],
  );
}

console.log(
  "Cross-surface transaction checks passed: schema validation, repository proof, partial write, structured staleness, readback mismatch, adapter error, duplicate retry, review gate, interrupted resume, crash-window recovery without replay, bound receipt tampering, and valid Notion/Linear completion.",
);
