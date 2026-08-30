import { cloneValue, hashValue } from "../transactions/contract.mjs";
import {
  appendApprovalReceipt,
  appendReviewReceipt,
  assertFindings,
  assertReviewConfig,
  completionBlockers,
  createReviewState,
  latestPass,
  scopeHash,
  verifyReviewReceiptChain,
} from "./contract.mjs";
import { createRepositoryAdapter } from "./repository-adapter.mjs";
import { loadTransactionState, saveTransactionState, withTransactionStateLock } from "../transactions/state-store.mjs";

function now(clock) {
  return clock().toISOString();
}

function passStatus(pass) {
  if (pass.checks.some((check) => check.status !== "passed")) return "failed";
  if (pass.findings.some((finding) => finding.status === "open")) return "failed";
  return "passed";
}

function setStateStatus(state, status, error, clock) {
  state.status = status;
  state.error = error;
  state.updatedAt = now(clock);
}

function assertStoredState(state, config) {
  if (state.reviewId !== config.reviewId) throw new Error("stored review belongs to another reviewId");
  verifyReviewReceiptChain(state);
}

function findResumablePass(state, passId, currentScopeHash) {
  const pass = latestPass(state, passId);
  if (!pass || pass.status !== "running" || pass.scopeHash !== currentScopeHash) return null;
  return pass;
}

export async function runRepositoryReview(options) {
  const config = assertReviewConfig(options.config);
  const findings = assertFindings(options.findings ?? []);
  const passId = options.passId;
  if (!config.requiredPasses.includes(passId)) throw new Error(`unknown review pass ${passId}`);
  const clock = options.clock ?? (() => new Date());
  const adapter = options.adapter ?? createRepositoryAdapter();

  return withTransactionStateLock(options.statePath, async () => {
    const snapshot = await adapter.snapshot(options.root, config);
    const currentScopeHash = scopeHash(snapshot);
    const stored = loadTransactionState(options.statePath);
    const state = stored ?? createReviewState(config, snapshot, clock);
    assertStoredState(state, config);
    if (state.configHash !== hashValue(config)) {
      setStateStatus(state, "incomplete", "review config changed; start a new review state", clock);
      saveTransactionState(options.statePath, state);
      return state;
    }

    state.latestScope = cloneValue(snapshot);
    if (state.humanApproval.status === "approved" && state.humanApproval.scopeHash !== currentScopeHash) {
      state.humanApproval = {
        ...state.humanApproval,
        status: "pending",
        reviewer: null,
        evidence: null,
        scopeHash: null,
        reviewedAt: null,
      };
    }

    let pass = findResumablePass(state, passId, currentScopeHash);
    if (!pass) {
      pass = {
        passId,
        attempt: state.passes.filter((item) => item.passId === passId).length + 1,
        scopeHash: currentScopeHash,
        headCommit: snapshot.headCommit,
        diffHash: snapshot.diffHash,
        contractHash: snapshot.contractHash,
        status: "running",
        checks: [],
        findings: cloneValue(findings),
        startedAt: now(clock),
        completedAt: null,
        receiptHash: null,
      };
      state.passes.push(pass);
    } else if (hashValue(pass.findings) !== hashValue(findings)) {
      setStateStatus(state, "incomplete", `findings changed while pass ${passId} was interrupted`, clock);
      saveTransactionState(options.statePath, state);
      return state;
    }

    setStateStatus(state, "running", null, clock);
    saveTransactionState(options.statePath, state);
    for (const check of config.checks) {
      if (pass.checks.some((result) => result.checkId === check.checkId)) continue;
      const result = await adapter.runCheck(options.root, check);
      pass.checks.push({
        checkId: check.checkId,
        command: [check.command, ...check.args],
        status: result.status === 0 && !result.error && !result.timedOut ? "passed" : "failed",
        exitCode: result.status,
        signal: result.signal,
        timedOut: result.timedOut,
        error: result.error,
        stdoutHash: result.stdoutHash,
        stderrHash: result.stderrHash,
        output: result.output,
      });
      saveTransactionState(options.statePath, state);
      if (options.interruptAfterCheck === check.checkId) {
        setStateStatus(state, "interrupted", `interrupted after ${check.checkId}`, clock);
        saveTransactionState(options.statePath, state);
        return state;
      }
    }

    pass.status = passStatus(pass);
    pass.completedAt = now(clock);
    appendReviewReceipt(state, pass, clock);
    const blockers = completionBlockers(state, config, snapshot);
    if (pass.status !== "passed") {
      setStateStatus(state, "incomplete", `review pass ${passId} has failed checks or open findings`, clock);
    } else if (blockers.length > 0) {
      const pendingOnly = blockers.every((blocker) => blocker === "human approval is pending");
      setStateStatus(state, pendingOnly ? "awaiting_human" : "incomplete", blockers.join("; "), clock);
    } else {
      setStateStatus(state, "approved", null, clock);
    }
    saveTransactionState(options.statePath, state);
    return state;
  });
}

export async function approveRepositoryReview(options) {
  const config = assertReviewConfig(options.config);
  const clock = options.clock ?? (() => new Date());
  const adapter = options.adapter ?? createRepositoryAdapter();
  if (typeof options.reviewer !== "string" || options.reviewer.trim() === "") throw new Error("reviewer is required");
  if (typeof options.evidence !== "string" || options.evidence.trim() === "") throw new Error("approval evidence is required");

  return withTransactionStateLock(options.statePath, async () => {
    const state = loadTransactionState(options.statePath);
    if (!state) throw new Error("review state is missing");
    assertStoredState(state, config);
    const snapshot = await adapter.snapshot(options.root, config);
    state.latestScope = cloneValue(snapshot);
    if (
      state.humanApproval.status === "approved" &&
      state.humanApproval.scopeHash === scopeHash(snapshot) &&
      state.humanApproval.reviewer === options.reviewer &&
      state.humanApproval.evidence === options.evidence
    ) {
      const duplicateBlockers = completionBlockers(state, config, snapshot);
      if (duplicateBlockers.length === 0) return state;
    }
    const readinessState = cloneValue(state);
    readinessState.humanApproval.required = false;
    const blockers = completionBlockers(readinessState, config, snapshot);
    if (blockers.length > 0) {
      setStateStatus(state, "incomplete", blockers.join("; "), clock);
      saveTransactionState(options.statePath, state);
      return state;
    }
    state.humanApproval = {
      ...state.humanApproval,
      status: "approved",
      reviewer: options.reviewer,
      evidence: options.evidence,
      scopeHash: scopeHash(snapshot),
      reviewedAt: now(clock),
    };
    appendApprovalReceipt(state, clock);
    const finalBlockers = completionBlockers(state, config, snapshot);
    setStateStatus(
      state,
      finalBlockers.length === 0 ? "approved" : "incomplete",
      finalBlockers.length === 0 ? null : finalBlockers.join("; "),
      clock,
    );
    saveTransactionState(options.statePath, state);
    return state;
  });
}
