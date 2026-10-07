import fs from "node:fs";
import path from "node:path";
import { hashValue } from "../transactions/contract.mjs";
import { loadTransactionState, withTransactionStateLock } from "../transactions/state-store.mjs";
import { assertReviewConfig, completionBlockers, latestPass } from "./contract.mjs";
import { createRepositoryAdapter } from "./repository-adapter.mjs";
import { reviewStatePath } from "./state-path.mjs";

const MAX_AGE_MS = 24 * 60 * 60 * 1000;
const MARKER = "[code-delivery]";

function failure(payload, error) {
  const reason = `Code delivery remains incomplete: ${error}. End with an accurate incomplete declaration, or repair evidence within the approved scope. Release still requires human approval.`;
  // A Stop block creates a continuation. Never create an unlimited repair loop.
  return payload.stop_hook_active === true
    ? { continue: false, stopReason: reason, systemMessage: reason }
    : { decision: "block", reason };
}

export async function completionStop(payload, options = {}) {
  const message = payload.last_assistant_message;
  if (typeof message !== "string" || !message.split(/\r?\n/).some((line) => line.startsWith(MARKER))) return null;
  try {
    const lines = message.split(/\r?\n/).filter((line) => line.startsWith(MARKER));
    if (lines.length !== 1) throw new Error("exactly one standalone code-delivery declaration is required");
    const claim = JSON.parse(lines[0].slice(MARKER.length).trim());
    if (!claim || typeof claim !== "object") throw new Error("invalid declaration");
    if (!["ready", "approved", "incomplete", "cancelled"].includes(claim.outcome)) throw new Error("invalid delivery outcome");
    if (["incomplete", "cancelled"].includes(claim.outcome)) {
      return { systemMessage: `Code delivery is ${claim.outcome}; no readiness or release approval was granted.` };
    }
    const binding = { taskId: claim.taskId, sessionId: claim.sessionId, runId: claim.runId };
    if (!payload.session_id || !payload.turn_id || binding.sessionId !== payload.session_id || binding.runId !== payload.turn_id) {
      throw new Error("delivery is not bound to the active session and turn");
    }
    const root = fs.realpathSync(payload.cwd);
    // The final reply cannot select weaker checks or a different contract.
    const config = assertReviewConfig({
      ...JSON.parse(fs.readFileSync(path.join(root, "config/reviews/singleton-systems.json"), "utf8")),
      completionBinding: binding,
    });
    if (claim.statePath !== undefined && (typeof claim.statePath !== "string" || !claim.statePath.trim())) throw new Error("invalid statePath");
    const file = reviewStatePath(root, config, claim.statePath);
    if (!fs.existsSync(file)) throw new Error("review evidence is missing");
    return await withTransactionStateLock(file, async () => {
      const state = loadTransactionState(file);
      if (state.reviewId !== config.reviewId || state.configHash !== hashValue(config)) throw new Error("review task/run or config binding does not match");
      if (!["awaiting_human", "approved"].includes(state.status)) throw new Error(`review is ${state.status}`);
      for (const receipt of state.receipts) {
        if (receipt.reviewId !== config.reviewId || receipt.configHash !== hashValue(config)) throw new Error("receipt is unbound or has a different config");
      }
      const snapshot = await (options.adapter ?? createRepositoryAdapter()).snapshot(root, config);
      const checked = structuredClone(state);
      checked.humanApproval.required = claim.outcome === "approved" || config.humanApproval?.required !== false;
      const blockers = completionBlockers(checked, config, snapshot).filter((item) => !(claim.outcome === "ready" && item === "human approval is pending"));
      const pass = latestPass(state, config.requiredPasses.at(-1));
      const receipt = state.receipts.find((item) => item.receiptHash === pass?.receiptHash);
      const age = (options.now ?? Date.now()) - Date.parse(receipt?.issuedAt);
      if (!Number.isFinite(age) || age < 0 || age > MAX_AGE_MS) blockers.push("verification receipt is stale or has an invalid date");
      for (const check of config.checks) {
        const result = pass?.checks.filter((item) => item.checkId === check.checkId) ?? [];
        if (result.length !== 1 || result[0].status !== "passed" || result[0].exitCode !== 0 || result[0].error || result[0].timedOut || hashValue(result[0].command) !== hashValue([check.command, ...check.args])) {
          blockers.push(`check ${check.checkId} has no passing execution evidence`);
        }
      }
      if (blockers.length) throw new Error(blockers.join("; "));
      return { systemMessage: claim.outcome === "ready"
        ? "Local implementation readiness verified. Human approval for commit, push, release and external writes remains separate."
        : "Current repository review approval verified. This receipt does not prove a release or external delivery occurred." };
    }, { timeoutMs: 1000 });
  } catch (error) {
    return failure(payload, error.message);
  }
}
