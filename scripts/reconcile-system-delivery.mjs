import os from "node:os";
import path from "node:path";
import { reconcileDelivery } from "../lib/transactions/delivery.mjs";

function parseArgs(argv) {
  const options = { json: false, allowIncomplete: false, statePath: null, taskPluginVersion: null };
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === "--json") options.json = true;
    else if (value === "--allow-incomplete") options.allowIncomplete = true;
    else if (value === "--state") {
      if (!argv[index + 1] || argv[index + 1].startsWith("--")) throw new Error("--state requires a path");
      options.statePath = argv[++index];
    } else if (value === "--task-plugin-version") {
      if (!argv[index + 1] || argv[index + 1].startsWith("--")) {
        throw new Error("--task-plugin-version requires a version");
      }
      options.taskPluginVersion = argv[++index];
    }
    else if (value === "--apply") throw new Error("apply mode is disabled; live mutation requires Jerami approval");
    else throw new Error(`unknown argument ${value}`);
  }
  return options;
}

function lineFor(entry) {
  const detail = entry.error ? ` — ${entry.error}` : "";
  return `${entry.status.padEnd(8)} ${entry.ownerId}${detail}`;
}

const args = parseArgs(process.argv.slice(2));
const root = process.cwd();
const statePath = path.resolve(
  args.statePath ?? path.join(os.tmpdir(), "singleton-systems", "transactions", "systems-tool-harness.json"),
);
const environment = args.taskPluginVersion
  ? { S_SYSTEMS_TASK_PLUGIN_VERSION: args.taskPluginVersion }
  : {};
const result = await reconcileDelivery({
  root,
  flowId: "systems-tool-harness",
  statePath,
  environment,
});

if (args.json) {
  console.log(JSON.stringify(result, null, 2));
} else {
  console.log(`transaction ${result.transaction.transactionId}: ${result.transaction.status}`);
  for (const entry of result.transaction.mutationLedger) console.log(lineFor(entry));
  console.log(`receipt chain: ${result.transaction.receipts.length} verified owner receipt(s)`);
  console.log(`state: ${result.statePath}`);
  if (result.transaction.compensationPlan.length > 0) {
    console.log("repair plan:");
    for (const item of [...result.transaction.compensationPlan].reverse()) {
      console.log(`- ${item.ownerId}: ${item.instructions}`);
    }
  }
}

if (result.transaction.status !== "completed" && !args.allowIncomplete) process.exitCode = 2;
