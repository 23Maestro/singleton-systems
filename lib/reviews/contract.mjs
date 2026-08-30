import { cloneValue, hashValue } from "../transactions/contract.mjs";

export const FINDING_STATUSES = Object.freeze(["open", "resolved"]);

function requiredString(value, label) {
  if (typeof value !== "string" || value.trim() === "") throw new Error(`${label} is required`);
}

export function assertReviewConfig(config) {
  if (!config || typeof config !== "object") throw new Error("review config is required");
  if (config.schemaVersion !== 1) throw new Error("review config schemaVersion must be 1");
  requiredString(config.reviewId, "reviewId");
  requiredString(config.intent, "intent");
  requiredString(config.baseRef, "baseRef");
  if (!Array.isArray(config.requiredPasses) || config.requiredPasses.length === 0) {
    throw new Error("requiredPasses must contain at least one pass");
  }
  if (new Set(config.requiredPasses).size !== config.requiredPasses.length) {
    throw new Error("requiredPasses must be unique");
  }
  for (const passId of config.requiredPasses) requiredString(passId, "passId");
  if (!Array.isArray(config.contractFiles) || config.contractFiles.length === 0) {
    throw new Error("contractFiles must contain at least one path");
  }
  if (!Array.isArray(config.checks) || config.checks.length === 0) {
    throw new Error("checks must contain at least one check");
  }
  const checkIds = new Set();
  for (const check of config.checks) {
    requiredString(check.checkId, "checkId");
    requiredString(check.command, `check ${check.checkId} command`);
    if (!Array.isArray(check.args)) throw new Error(`check ${check.checkId} args must be an array`);
    if (checkIds.has(check.checkId)) throw new Error(`duplicate check ${check.checkId}`);
    checkIds.add(check.checkId);
    if (check.timeoutMs !== undefined && (!Number.isFinite(check.timeoutMs) || check.timeoutMs <= 0)) {
      throw new Error(`check ${check.checkId} timeoutMs must be positive`);
    }
  }
  return config;
}

export function assertFindings(findings) {
  if (!Array.isArray(findings)) throw new Error("findings must be an array");
  const findingIds = new Set();
  for (const finding of findings) {
    for (const field of ["findingId", "file", "risk", "proof", "fix", "verification", "status"]) {
      requiredString(finding[field], `finding ${field}`);
    }
    if (!Number.isInteger(finding.line) || finding.line < 1) {
      throw new Error(`finding ${finding.findingId} line must be a positive integer`);
    }
    if (!FINDING_STATUSES.includes(finding.status)) {
      throw new Error(`finding ${finding.findingId} has unknown status ${finding.status}`);
    }
    if (findingIds.has(finding.findingId)) throw new Error(`duplicate finding ${finding.findingId}`);
    findingIds.add(finding.findingId);
  }
  return findings;
}

export function createReviewState(config, snapshot, clock = () => new Date()) {
  assertReviewConfig(config);
  const now = clock().toISOString();
  return {
    schemaVersion: 1,
    reviewId: config.reviewId,
    intent: config.intent,
    configHash: hashValue(config),
    status: "incomplete",
    error: "required review passes have not run",
    latestScope: cloneValue(snapshot),
    passes: [],
    receipts: [],
    humanApproval: {
      required: config.humanApproval?.required !== false,
      status: "pending",
      reviewer: null,
      evidence: null,
      scopeHash: null,
      reviewedAt: null,
    },
    createdAt: now,
    updatedAt: now,
  };
}

export function scopeHash(snapshot) {
  return hashValue(snapshot);
}

export function latestPass(state, passId) {
  return [...state.passes].reverse().find((pass) => pass.passId === passId) ?? null;
}

export function verifyReviewReceiptChain(state) {
  let previousReceiptHash = null;
  for (let index = 0; index < state.receipts.length; index += 1) {
    const receipt = state.receipts[index];
    if (receipt.sequence !== index + 1) throw new Error(`review receipt ${index + 1} has invalid sequence`);
    if (receipt.previousReceiptHash !== previousReceiptHash) {
      throw new Error(`review receipt ${receipt.sequence} has invalid previous hash`);
    }
    const unsigned = { ...receipt };
    delete unsigned.receiptHash;
    if (hashValue(unsigned) !== receipt.receiptHash) {
      throw new Error(`review receipt ${receipt.sequence} hash mismatch`);
    }
    previousReceiptHash = receipt.receiptHash;
  }
  return true;
}

export function appendReviewReceipt(state, pass, clock = () => new Date()) {
  verifyReviewReceiptChain(state);
  const previousReceiptHash = state.receipts.at(-1)?.receiptHash ?? null;
  const unsigned = {
    schemaVersion: 1,
    sequence: state.receipts.length + 1,
    reviewId: state.reviewId,
    passId: pass.passId,
    scopeHash: pass.scopeHash,
    checksHash: hashValue(pass.checks),
    findingsHash: hashValue(pass.findings),
    previousReceiptHash,
    status: pass.status,
    issuedAt: clock().toISOString(),
  };
  const duplicate = state.receipts.find(
    (receipt) =>
      receipt.passId === unsigned.passId &&
      receipt.scopeHash === unsigned.scopeHash &&
      receipt.checksHash === unsigned.checksHash &&
      receipt.findingsHash === unsigned.findingsHash &&
      receipt.status === unsigned.status,
  );
  if (duplicate) {
    pass.receiptHash = duplicate.receiptHash;
    return duplicate;
  }
  const receipt = { ...unsigned, receiptHash: hashValue(unsigned) };
  state.receipts.push(receipt);
  pass.receiptHash = receipt.receiptHash;
  return receipt;
}

export function appendApprovalReceipt(state, clock = () => new Date()) {
  verifyReviewReceiptChain(state);
  const previousReceiptHash = state.receipts.at(-1)?.receiptHash ?? null;
  const approvalEvidence = {
    reviewer: state.humanApproval.reviewer,
    evidence: state.humanApproval.evidence,
    scopeHash: state.humanApproval.scopeHash,
    reviewedAt: state.humanApproval.reviewedAt,
  };
  const unsigned = {
    schemaVersion: 1,
    sequence: state.receipts.length + 1,
    reviewId: state.reviewId,
    passId: "human-approval",
    scopeHash: state.humanApproval.scopeHash,
    checksHash: hashValue([]),
    findingsHash: hashValue(approvalEvidence),
    previousReceiptHash,
    status: "approved",
    issuedAt: clock().toISOString(),
  };
  const receipt = { ...unsigned, receiptHash: hashValue(unsigned) };
  state.receipts.push(receipt);
  return receipt;
}

function unresolvedFindings(state) {
  const latestById = new Map();
  for (const pass of state.passes) {
    if (pass.status === "running") continue;
    for (const finding of pass.findings) latestById.set(finding.findingId, finding);
  }
  return [...latestById.values()].filter((finding) => finding.status === "open");
}

function receiptMatchesPass(state, pass) {
  const receipt = state.receipts.find(({ receiptHash }) => receiptHash === pass.receiptHash);
  return Boolean(
    receipt &&
    receipt.passId === pass.passId &&
    receipt.scopeHash === pass.scopeHash &&
    receipt.checksHash === hashValue(pass.checks) &&
    receipt.findingsHash === hashValue(pass.findings) &&
    receipt.status === pass.status
  );
}

export function completionBlockers(state, config, snapshot) {
  const blockers = [];
  try {
    verifyReviewReceiptChain(state);
  } catch (error) {
    blockers.push(error.message);
  }
  if (state.configHash !== hashValue(config)) blockers.push("review config changed");
  for (const [index, passId] of config.requiredPasses.entries()) {
    const pass = latestPass(state, passId);
    if (!pass) blockers.push(`required pass ${passId} is missing`);
    else if (!pass.receiptHash || !receiptMatchesPass(state, pass)) {
      blockers.push(`required pass ${passId} has no matching receipt`);
    }
    else if (index === config.requiredPasses.length - 1 && pass.status !== "passed") {
      blockers.push(`required pass ${passId} is ${pass.status}`);
    }
  }
  for (const finding of unresolvedFindings(state)) blockers.push(`finding ${finding.findingId} is open`);
  const lastRequiredPass = latestPass(state, config.requiredPasses.at(-1));
  if (!lastRequiredPass || lastRequiredPass.scopeHash !== scopeHash(snapshot)) {
    blockers.push("latest required pass is stale for the current repository scope");
  }
  if (state.humanApproval.required && state.humanApproval.status !== "approved") {
    blockers.push("human approval is pending");
  }
  if (
    state.humanApproval.status === "approved" &&
    state.humanApproval.scopeHash !== scopeHash(snapshot)
  ) {
    blockers.push("human approval is stale for the current repository scope");
  }
  if (state.humanApproval.status === "approved") {
    const approvalEvidence = {
      reviewer: state.humanApproval.reviewer,
      evidence: state.humanApproval.evidence,
      scopeHash: state.humanApproval.scopeHash,
      reviewedAt: state.humanApproval.reviewedAt,
    };
    const approvalReceipt = state.receipts.at(-1);
    if (
      approvalReceipt?.passId !== "human-approval" ||
      approvalReceipt.scopeHash !== state.humanApproval.scopeHash ||
      approvalReceipt.findingsHash !== hashValue(approvalEvidence) ||
      approvalReceipt.status !== "approved"
    ) {
      blockers.push("human approval receipt is missing or mismatched");
    }
  }
  return blockers;
}
