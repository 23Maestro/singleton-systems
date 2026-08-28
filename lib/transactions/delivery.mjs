import path from "node:path";
import { createTransaction, executeTransaction } from "./engine.mjs";
import { materializeOwnerFlow } from "./owner-graph.mjs";
import { createSystemAdapters } from "./system-adapters.mjs";
import { loadTransactionState, saveTransactionState, withTransactionStateLock } from "./state-store.mjs";

export async function reconcileDelivery(options) {
  return withTransactionStateLock(options.statePath, async () => {
    const root = path.resolve(options.root);
    const flow = materializeOwnerFlow({
      root,
      flowId: options.flowId,
      ownerMapPath: options.ownerMapPath,
      transactionId: options.transactionId,
    });
    const stored = loadTransactionState(options.statePath);
    if (stored && stored.idempotencyKey !== flow.definition.idempotencyKey) {
      throw new Error("stored transaction belongs to a different owner graph or plugin revision");
    }
    const transaction = stored ?? createTransaction(flow.definition, { clock: options.clock });
    const adapters = createSystemAdapters(flow.adapters, {
      root,
      environment: options.environment,
    });
    await executeTransaction(transaction, adapters, {
      clock: options.clock,
      mode: "reconcile",
      continueOnFailure: true,
    });
    const savedAt = saveTransactionState(options.statePath, transaction);
    return { transaction, graphHash: flow.graphHash, statePath: savedAt };
  });
}
