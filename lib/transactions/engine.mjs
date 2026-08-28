import {
  assertAdapter,
  assertDefinition,
  cloneValue,
  hashValue,
  normalizeVerification,
} from "./contract.mjs";

function now(clock) {
  return (clock?.() ?? new Date()).toISOString();
}

function ownerById(transaction, ownerId) {
  const owner = transaction.declaredOwners.find((candidate) => candidate.ownerId === ownerId);
  if (!owner) throw new Error(`unknown owner ${ownerId}`);
  return owner;
}

function mutationByOwner(transaction, ownerId) {
  return transaction.expectedMutations.find((mutation) => mutation.ownerId === ownerId);
}

function ledgerByOwner(transaction, ownerId) {
  return transaction.mutationLedger.find((entry) => entry.ownerId === ownerId);
}

function gateById(transaction, gateId) {
  return transaction.reviewGates.find((gate) => gate.gateId === gateId);
}

function setTransactionState(transaction, status, clock, error = null) {
  transaction.status = status;
  transaction.error = error;
  transaction.updatedAt = now(clock);
}

function setOwnerState(entry, status, options = {}) {
  entry.status = status;
  entry.staleReason = options.staleReason ?? null;
  entry.blockedByOwnerId = options.blockedByOwnerId ?? null;
}

function ownerOutcomeUncertain(entry) {
  return (
    entry.status === "prepared" ||
    entry.status === "applied" ||
    (entry.status === "stale" && entry.staleReason === "mutation-outcome-uncertain")
  );
}

function appendAttempt(transaction, entry, outcome, clock, detail = null) {
  transaction.attempts.push({
    sequence: transaction.attempts.length + 1,
    ownerId: entry.ownerId,
    deliveryKey: entry.deliveryKey,
    outcome,
    detail,
    recordedAt: now(clock),
  });
}

export function createTransaction(definition, options = {}) {
  assertDefinition(definition);
  const createdAt = now(options.clock);
  const transaction = {
    schemaVersion: 1,
    transactionId: definition.transactionId,
    idempotencyKey: definition.idempotencyKey,
    intent: definition.intent,
    lane: definition.lane,
    route: definition.route,
    declaredOwners: cloneValue(definition.declaredOwners).map((owner) => ({
      ownerId: owner.ownerId,
      uri: owner.uri,
      required: owner.required !== false,
      dependsOn: owner.dependsOn ?? [],
      reviewGateId: owner.reviewGateId ?? null,
    })),
    expectedMutations: cloneValue(definition.expectedMutations),
    preconditions: cloneValue(definition.preconditions),
    reviewGates: cloneValue(definition.reviewGates).map((gate) => ({
      gateId: gate.gateId,
      description: gate.description ?? null,
      required: gate.required !== false,
      status: gate.status ?? "pending",
      reviewer: gate.reviewer ?? null,
      evidence: gate.evidence ?? null,
      reviewedAt: gate.reviewedAt ?? null,
    })),
    status: "planned",
    error: null,
    createdAt,
    updatedAt: createdAt,
    mutationLedger: [],
    receipts: [],
    invalidations: [],
    attempts: [],
    compensationPlan: [],
  };

  transaction.mutationLedger = transaction.declaredOwners.map((owner) => {
    const mutation = mutationByOwner(transaction, owner.ownerId);
    return {
      ownerId: owner.ownerId,
      ownerUri: owner.uri,
      operation: mutation.operation,
      inputHash: null,
      deliveryKey: null,
      beforeState: null,
      afterState: null,
      readbackEvidence: null,
      status: "pending",
      staleReason: null,
      blockedByOwnerId: null,
      applyAttempts: 0,
      error: null,
      receiptHash: null,
      verifiedAt: null,
    };
  });
  return transaction;
}

export function approveReview(transaction, gateId, input, options = {}) {
  const gate = gateById(transaction, gateId);
  if (!gate) throw new Error(`unknown review gate ${gateId}`);
  if (!input?.reviewer) throw new Error(`review gate ${gateId} requires a reviewer`);
  gate.status = "approved";
  gate.reviewer = input.reviewer;
  gate.evidence = cloneValue(input.evidence ?? null);
  gate.reviewedAt = now(options.clock);
  transaction.updatedAt = gate.reviewedAt;
  return transaction;
}

export function rejectReview(transaction, gateId, input, options = {}) {
  const gate = gateById(transaction, gateId);
  if (!gate) throw new Error(`unknown review gate ${gateId}`);
  gate.status = "rejected";
  gate.reviewer = input?.reviewer ?? null;
  gate.evidence = cloneValue(input?.evidence ?? null);
  gate.reviewedAt = now(options.clock);
  setTransactionState(transaction, "incomplete", options.clock, `review gate ${gateId} was rejected`);
  return transaction;
}

function dependentOwnerIds(transaction, ownerId) {
  const found = new Set();
  const queue = [ownerId];
  while (queue.length > 0) {
    const current = queue.shift();
    for (const owner of transaction.declaredOwners) {
      if ((owner.dependsOn ?? []).includes(current) && !found.has(owner.ownerId)) {
        found.add(owner.ownerId);
        queue.push(owner.ownerId);
      }
    }
  }
  return [...found];
}

export function invalidateDownstream(transaction, ownerId, reason, options = {}) {
  ownerById(transaction, ownerId);
  const invalidatedAt = now(options.clock);
  for (const dependentId of dependentOwnerIds(transaction, ownerId)) {
    const entry = ledgerByOwner(transaction, dependentId);
    if (entry.status === "pending" && entry.receiptHash === null && options.markPending !== true) continue;
    const uncertainOutcome = ownerOutcomeUncertain(entry);
    setOwnerState(entry, "stale", {
      staleReason: uncertainOutcome ? "mutation-outcome-uncertain" : "upstream-invalidated",
      blockedByOwnerId: ownerId,
    });
    entry.error = `invalidated by ${ownerId}: ${reason}`;
    entry.receiptHash = null;
    entry.verifiedAt = null;
    transaction.invalidations.push({
      sequence: transaction.invalidations.length + 1,
      ownerId: dependentId,
      causedByOwnerId: ownerId,
      reason,
      invalidatedAt,
    });
  }
  setTransactionState(transaction, "incomplete", options.clock, `downstream owners are stale after ${ownerId}`);
  return transaction;
}

function receiptPayload(transaction, entry, adapterEvidence, issuedAt) {
  return {
    schemaVersion: 1,
    sequence: transaction.receipts.length + 1,
    transactionId: transaction.transactionId,
    ownerId: entry.ownerId,
    ownerUri: entry.ownerUri,
    operation: entry.operation,
    deliveryKey: entry.deliveryKey,
    inputHash: entry.inputHash,
    beforeStateHash: hashValue(entry.beforeState),
    afterStateHash: hashValue(entry.afterState),
    readbackEvidenceHash: hashValue(entry.readbackEvidence),
    adapterEvidence: cloneValue(adapterEvidence),
    previousReceiptHash: transaction.receipts.at(-1)?.receiptHash ?? null,
    status: "verified",
    issuedAt,
  };
}

export function verifyReceiptChain(transaction) {
  let previousReceiptHash = null;
  for (let index = 0; index < transaction.receipts.length; index += 1) {
    const receipt = transaction.receipts[index];
    const owner = transaction.declaredOwners.find(({ ownerId }) => ownerId === receipt.ownerId);
    if (receipt.transactionId !== transaction.transactionId) {
      throw new Error(`receipt ${receipt.sequence} belongs to a different transaction`);
    }
    if (!owner) throw new Error(`receipt ${receipt.sequence} names undeclared owner ${receipt.ownerId}`);
    if (receipt.ownerUri !== owner.uri) throw new Error(`receipt ${receipt.sequence} has the wrong owner URI`);
    const unsigned = { ...receipt };
    delete unsigned.receiptHash;
    if (receipt.sequence !== index + 1) throw new Error(`receipt ${index + 1} has an invalid sequence`);
    if (receipt.previousReceiptHash !== previousReceiptHash) {
      throw new Error(`receipt ${receipt.sequence} does not chain to the prior receipt`);
    }
    const actualHash = hashValue(unsigned);
    if (receipt.receiptHash !== actualHash) throw new Error(`receipt ${receipt.sequence} is stale or tampered`);
    previousReceiptHash = receipt.receiptHash;
  }
  return true;
}

function receiptMatchesEntry(receipt, transaction, entry) {
  return Boolean(
    receipt &&
      receipt.transactionId === transaction.transactionId &&
      receipt.ownerId === entry.ownerId &&
      receipt.ownerUri === entry.ownerUri &&
      receipt.operation === entry.operation &&
      receipt.deliveryKey === entry.deliveryKey &&
      receipt.inputHash === entry.inputHash &&
      receipt.beforeStateHash === hashValue(entry.beforeState) &&
      receipt.afterStateHash === hashValue(entry.afterState) &&
      receipt.readbackEvidenceHash === hashValue(entry.readbackEvidence) &&
      receipt.status === "verified",
  );
}

export function planCompensation(transaction) {
  transaction.compensationPlan = [...transaction.mutationLedger]
    .reverse()
    .filter((entry) => ["prepared", "applied", "failed", "stale"].includes(entry.status) || entry.applyAttempts > 0)
    .map((entry) => {
      const mutation = mutationByOwner(transaction, entry.ownerId);
      const dependencyOnly = entry.status === "stale" && entry.staleReason === "dependency-incomplete";
      const dependencyId = dependencyOnly ? entry.blockedByOwnerId : null;
      return {
        ownerId: entry.ownerId,
        ownerUri: entry.ownerUri,
        operation: dependencyOnly
          ? "reverify-after-dependencies"
          : mutation?.compensation?.operation ?? "manual-review",
        targetState: cloneValue(entry.beforeState),
        instructions: dependencyOnly
          ? `Direct readback passed. Reverify after ${dependencyId ?? "the dependency"} is repaired.`
          : mutation?.compensation?.instructions ?? "Inspect the owner and choose a repair or compensating action.",
        automatic: false,
        semantics: "best-effort compensation; no cross-system ACID guarantee",
      };
    });
  return transaction.compensationPlan;
}

function requiredPreconditionsPass(transaction) {
  return transaction.preconditions.every((condition) => condition.required === false || condition.status === "passed");
}

function requiredReviewsPass(transaction) {
  return transaction.reviewGates.every((gate) => gate.required === false || gate.status === "approved");
}

export function canComplete(transaction) {
  try {
    verifyReceiptChain(transaction);
  } catch {
    return false;
  }
  if (!requiredPreconditionsPass(transaction) || !requiredReviewsPass(transaction)) return false;
  return transaction.declaredOwners.every((owner) => {
    if (owner.required === false) return true;
    const entry = ledgerByOwner(transaction, owner.ownerId);
    if (entry.status !== "verified" || !entry.receiptHash) return false;
    const receipt = transaction.receipts.find(({ receiptHash }) => receiptHash === entry.receiptHash);
    return receiptMatchesEntry(receipt, transaction, entry);
  });
}

function fail(transaction, entry, error, options, status = "failed", staleReason = null) {
  setOwnerState(
    entry,
    status,
    status === "stale" ? { staleReason: staleReason ?? "readback-failed" } : {},
  );
  entry.error = error instanceof Error ? error.message : String(error);
  entry.receiptHash = null;
  entry.verifiedAt = null;
  appendAttempt(transaction, entry, status, options.clock, entry.error);
  invalidateDownstream(transaction, entry.ownerId, entry.error, {
    clock: options.clock,
    markPending: true,
  });
  planCompensation(transaction);
  setTransactionState(transaction, "incomplete", options.clock, `${entry.ownerId}: ${entry.error}`);
  return transaction;
}

export async function executeTransaction(transaction, adapters, options = {}) {
  const reconcileOnly = options.mode === "reconcile";
  try {
    assertDefinition(transaction);
    verifyReceiptChain(transaction);
  } catch (error) {
    planCompensation(transaction);
    setTransactionState(transaction, "incomplete", options.clock, error.message);
    return transaction;
  }

  if (!requiredPreconditionsPass(transaction)) {
    setTransactionState(transaction, "incomplete", options.clock, "one or more required preconditions failed");
    return transaction;
  }

  setTransactionState(transaction, "applying", options.clock);
  for (const owner of transaction.declaredOwners) {
    const entry = ledgerByOwner(transaction, owner.ownerId);
    const mutation = mutationByOwner(transaction, owner.ownerId);
    let adapter;
    let automaticReplayForbidden = ownerOutcomeUncertain(entry);
    try {
      adapter = assertAdapter(adapters[owner.ownerId], owner.ownerId);
    } catch (error) {
      fail(
        transaction,
        entry,
        error,
        options,
        automaticReplayForbidden ? "stale" : "failed",
        automaticReplayForbidden ? "mutation-outcome-uncertain" : null,
      );
      if (reconcileOnly && options.continueOnFailure) continue;
      return transaction;
    }

    const dependencyIncomplete = (owner.dependsOn ?? []).find(
      (dependencyId) => ledgerByOwner(transaction, dependencyId).status !== "verified",
    );
    if (dependencyIncomplete) {
      if (reconcileOnly) {
        const uncertainOutcome = ownerOutcomeUncertain(entry);
        setOwnerState(entry, "stale", {
          staleReason: uncertainOutcome ? "mutation-outcome-uncertain" : "dependency-incomplete",
          blockedByOwnerId: dependencyIncomplete,
        });
        entry.error = `${owner.ownerId} is blocked by incomplete owner ${dependencyIncomplete}`;
        entry.receiptHash = null;
        entry.verifiedAt = null;
      } else {
        setTransactionState(
          transaction,
          "incomplete",
          options.clock,
          `${owner.ownerId} is blocked by incomplete owner ${dependencyIncomplete}`,
        );
        return transaction;
      }
    }

    if (owner.reviewGateId) {
      const gate = gateById(transaction, owner.reviewGateId);
      if (gate.status !== "approved") {
        setTransactionState(transaction, "awaiting_review", options.clock, `review gate ${gate.gateId} is ${gate.status}`);
        return transaction;
      }
    }

    try {
      const plan = await adapter.plan({ transaction, owner, mutation: cloneValue(mutation) });
      const inputHash = hashValue({ operation: mutation.operation, plan });
      const deliveryKey = hashValue({
        idempotencyKey: transaction.idempotencyKey,
        ownerId: owner.ownerId,
        inputHash,
      });

      const priorStatus = entry.status;
      const priorInputHash = entry.inputHash;
      const priorAfterState = cloneValue(entry.afterState);
      const priorReceiptHash = entry.receiptHash;

      if (!reconcileOnly && entry.status === "verified" && entry.inputHash === inputHash && entry.receiptHash) {
        entry.deliveryKey = deliveryKey;
        appendAttempt(transaction, entry, "duplicate", options.clock, "verified delivery already exists");
        continue;
      }

      const resumingAppliedMutation = entry.status === "applied" && entry.inputHash === inputHash;
      const uncertainMutation = ownerOutcomeUncertain(entry);
      const resumingUncertainMutation = uncertainMutation && entry.inputHash === inputHash;
      automaticReplayForbidden = resumingAppliedMutation || resumingUncertainMutation;
      if (uncertainMutation && entry.inputHash !== inputHash) {
        fail(
          transaction,
          entry,
          `${owner.ownerId} has an uncertain prepared mutation with changed input; automatic replay refused`,
          options,
          "stale",
          "mutation-outcome-uncertain",
        );
        return transaction;
      }
      if (entry.status === "verified" && entry.inputHash !== inputHash) {
        invalidateDownstream(transaction, owner.ownerId, "approved mutation input changed", options);
        setOwnerState(entry, "pending");
        entry.receiptHash = null;
        entry.verifiedAt = null;
      }

      entry.inputHash = inputHash;
      entry.deliveryKey = deliveryKey;
      entry.error = null;
      entry.staleReason = null;
      entry.blockedByOwnerId = null;

      if (reconcileOnly) {
        const readback = await adapter.readback({ transaction, owner, mutation, plan, phase: "after" });
        if (entry.beforeState === null && !priorReceiptHash) entry.beforeState = cloneValue(readback);
        entry.afterState = cloneValue(readback);
        const verification = normalizeVerification(
          await adapter.verify({ transaction, owner, mutation, plan, readback: cloneValue(readback) }),
        );
        entry.readbackEvidence = cloneValue(verification.evidence);
        appendAttempt(transaction, entry, "readback", options.clock);
        if (!verification.ok) {
          fail(
            transaction,
            entry,
            verification.error,
            options,
            "stale",
            automaticReplayForbidden ? "mutation-outcome-uncertain" : "readback-failed",
          );
          if (options.continueOnFailure) continue;
          return transaction;
        }

        if (dependencyIncomplete) {
          setOwnerState(entry, "stale", {
            staleReason: "dependency-incomplete",
            blockedByOwnerId: dependencyIncomplete,
          });
          entry.error = `${owner.ownerId} readback passed but dependency ${dependencyIncomplete} is incomplete`;
          entry.receiptHash = null;
          entry.verifiedAt = null;
          appendAttempt(transaction, entry, "stale", options.clock, entry.error);
          continue;
        }

        if (
          priorStatus === "verified" &&
          priorInputHash === inputHash &&
          priorReceiptHash &&
          hashValue(priorAfterState) === hashValue(readback) &&
          receiptMatchesEntry(
            transaction.receipts.find(({ receiptHash }) => receiptHash === priorReceiptHash),
            transaction,
            entry,
          )
        ) {
          setOwnerState(entry, "verified");
          entry.receiptHash = priorReceiptHash;
          appendAttempt(transaction, entry, "duplicate", options.clock, "readback still matches verified delivery");
          continue;
        }

        const adapterEvidence = await adapter.receipt({
          transaction,
          owner,
          mutation,
          plan,
          readback: cloneValue(readback),
          verification: cloneValue(verification),
        });
        const issuedAt = now(options.clock);
        const unsignedReceipt = receiptPayload(transaction, entry, adapterEvidence, issuedAt);
        const receipt = { ...unsignedReceipt, receiptHash: hashValue(unsignedReceipt) };
        transaction.receipts.push(receipt);
        setOwnerState(entry, "verified");
        entry.receiptHash = receipt.receiptHash;
        entry.verifiedAt = issuedAt;
        appendAttempt(transaction, entry, "verified", options.clock);
        continue;
      }

      if (resumingUncertainMutation) {
        const readback = await adapter.readback({ transaction, owner, mutation, plan, phase: "after" });
        entry.afterState = cloneValue(readback);
        const verification = normalizeVerification(
          await adapter.verify({ transaction, owner, mutation, plan, readback: cloneValue(readback) }),
        );
        entry.readbackEvidence = cloneValue(verification.evidence);
        appendAttempt(transaction, entry, "readback", options.clock, "checking uncertain prepared mutation");
        if (!verification.ok) {
          fail(
            transaction,
            entry,
            `${owner.ownerId} prepared mutation outcome is unverified; automatic replay refused`,
            options,
            "stale",
            "mutation-outcome-uncertain",
          );
          return transaction;
        }
        const adapterEvidence = await adapter.receipt({
          transaction,
          owner,
          mutation,
          plan,
          readback: cloneValue(readback),
          verification: cloneValue(verification),
        });
        const issuedAt = now(options.clock);
        const unsignedReceipt = receiptPayload(transaction, entry, adapterEvidence, issuedAt);
        const receipt = { ...unsignedReceipt, receiptHash: hashValue(unsignedReceipt) };
        transaction.receipts.push(receipt);
        setOwnerState(entry, "verified");
        entry.receiptHash = receipt.receiptHash;
        entry.verifiedAt = issuedAt;
        appendAttempt(transaction, entry, "recovered", options.clock, "prepared mutation verified without replay");
        continue;
      }

      if (!resumingAppliedMutation) {
        entry.beforeState = cloneValue(
          await adapter.readback({ transaction, owner, mutation, plan, phase: "before" }),
        );
        setOwnerState(entry, "prepared");
        automaticReplayForbidden = true;
        appendAttempt(transaction, entry, "prepared", options.clock, "delivery key persisted before apply");
        await options.checkpoint?.(transaction);
        const appliedState = await adapter.apply({
          transaction,
          owner,
          mutation,
          plan,
          deliveryKey,
        });
        entry.afterState = cloneValue(appliedState);
        setOwnerState(entry, "applied");
        entry.applyAttempts += 1;
        appendAttempt(transaction, entry, "applied", options.clock);
        await options.checkpoint?.(transaction);
      } else {
        appendAttempt(transaction, entry, "resumed", options.clock, "readback resumed without another apply");
      }

      if (options.interruptAfterOwner === owner.ownerId && !resumingAppliedMutation) {
        setTransactionState(transaction, "interrupted", options.clock, `interrupted after ${owner.ownerId} apply`);
        planCompensation(transaction);
        return transaction;
      }

      const readback = await adapter.readback({ transaction, owner, mutation, plan, phase: "after" });
      entry.afterState = cloneValue(readback);
      const verification = normalizeVerification(
        await adapter.verify({ transaction, owner, mutation, plan, readback: cloneValue(readback) }),
      );
      entry.readbackEvidence = cloneValue(verification.evidence);
      if (!verification.ok) throw new Error(verification.error);

      const adapterEvidence = await adapter.receipt({
        transaction,
        owner,
        mutation,
        plan,
        readback: cloneValue(readback),
        verification: cloneValue(verification),
      });
      const issuedAt = now(options.clock);
      const unsignedReceipt = receiptPayload(transaction, entry, adapterEvidence, issuedAt);
      const receipt = { ...unsignedReceipt, receiptHash: hashValue(unsignedReceipt) };
      transaction.receipts.push(receipt);
      setOwnerState(entry, "verified");
      entry.receiptHash = receipt.receiptHash;
      entry.verifiedAt = issuedAt;
      appendAttempt(transaction, entry, "verified", options.clock);
    } catch (error) {
      fail(
        transaction,
        entry,
        error,
        options,
        automaticReplayForbidden ? "stale" : "failed",
        automaticReplayForbidden ? "mutation-outcome-uncertain" : null,
      );
      if (reconcileOnly && options.continueOnFailure) continue;
      return transaction;
    }
  }

  if (canComplete(transaction)) {
    transaction.compensationPlan = [];
    setTransactionState(transaction, "completed", options.clock);
  } else {
    planCompensation(transaction);
    const blockers = transaction.declaredOwners
      .filter((owner) => owner.required !== false)
      .map((owner) => ledgerByOwner(transaction, owner.ownerId))
      .filter((entry) => entry.status !== "verified")
      .map((entry) => `${entry.ownerId}: ${entry.error ?? entry.status}`);
    setTransactionState(transaction, "incomplete", options.clock, blockers.join("; ") || "receipt verification failed");
  }
  return transaction;
}
