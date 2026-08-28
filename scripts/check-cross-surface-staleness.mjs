import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { reconcileDelivery } from "../lib/transactions/delivery.mjs";
import { canComplete, verifyReceiptChain } from "../lib/transactions/engine.mjs";

const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), "singleton-transaction-staleness-"));
const repo = path.join(fixtureRoot, "repo");
const runtime = path.join(fixtureRoot, "runtime", "s-systems");
const ownerMapPath = path.join(repo, "config", "transactions", "owner-map.json");
const fixedClock = () => new Date("2026-08-28T01:00:00.000Z");

function write(file, content) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}

function runGit(args) {
  const result = spawnSync("git", args, { cwd: repo, encoding: "utf8" });
  if (result.status !== 0) throw new Error(result.stderr || result.stdout || `git ${args.join(" ")} failed`);
  return result.stdout.trim();
}

function ledger(transaction, ownerId) {
  return transaction.mutationLedger.find((entry) => entry.ownerId === ownerId);
}

function transactionState(name) {
  return path.join(fixtureRoot, `${name}.json`);
}

async function reconcile(name, environment = {}) {
  return reconcileDelivery({
    root: repo,
    flowId: "systems-tool-harness",
    ownerMapPath,
    statePath: transactionState(name),
    environment,
    clock: fixedClock,
  });
}

try {
  write(path.join(repo, "CONTEXT.md"), "# fixture policy\n");
  write(path.join(repo, "config", "cerebral-registry.json"), '{"source_revision":"fixture-r1"}\n');
  write(
    path.join(repo, "plugins", "s-systems", ".codex-plugin", "plugin.json"),
    '{"name":"s-systems","version":"1.0.0+codex.fixture"}\n',
  );
  write(path.join(repo, "plugins", "s-systems", "skills", "fixture", "SKILL.md"), "# fixture skill\n");
  write(
    ownerMapPath,
    `${JSON.stringify(
      {
        version: 1,
        stateOwners: { receipts: { owner: "Supabase" } },
        flows: {
          "systems-tool-harness": {
            lane: "System Maintenance",
            route: "systems-tool-harness",
            intent: "Verify one fixture delivery across every owner.",
            reviewGates: [],
            owners: [
              {
                ownerId: "source-checkout",
                uri: "git://fixture/source",
                required: true,
                dependsOn: [],
                adapter: { kind: "git-state", requireClean: true, requireAttachedBranch: true },
              },
              {
                ownerId: "plugin-source",
                uri: "repo://plugins/s-systems",
                required: true,
                dependsOn: ["source-checkout"],
                adapter: { kind: "path-snapshot", path: "plugins/s-systems" },
              },
              {
                ownerId: "cerebral-registry",
                uri: "repo://config/cerebral-registry.json",
                required: true,
                dependsOn: ["source-checkout"],
                adapter: { kind: "path-snapshot", path: "config/cerebral-registry.json" },
              },
              {
                ownerId: "codex-plugin-runtime",
                uri: "tool-harness://codex/s-systems",
                required: true,
                dependsOn: ["plugin-source"],
                adapter: { kind: "directory-parity", source: "plugins/s-systems", target: runtime },
              },
              {
                ownerId: "supabase-registry",
                uri: "supabase://cerebral-registry",
                required: true,
                dependsOn: ["cerebral-registry"],
                adapter: {
                  kind: "command-readback",
                  command: process.execPath,
                  args: [
                    "-e",
                    "process.exit(process.env.SIMULATE_SUPABASE_STALE === '1' ? 1 : 0)",
                  ],
                  watchPaths: ["config/cerebral-registry.json"],
                },
              },
              {
                ownerId: "active-task-catalog",
                uri: "tool-harness://codex/task",
                required: true,
                dependsOn: ["codex-plugin-runtime"],
                adapter: {
                  kind: "task-catalog",
                  expectedVersionPath: "plugins/s-systems/.codex-plugin/plugin.json",
                  versionEnvironmentKey: "S_SYSTEMS_TASK_PLUGIN_VERSION",
                },
              },
              {
                ownerId: "repository-checks",
                uri: "command://fixture/checks",
                required: true,
                dependsOn: ["codex-plugin-runtime", "supabase-registry", "active-task-catalog"],
                adapter: {
                  kind: "command-readback",
                  command: process.execPath,
                  args: ["-e", "process.exit(0)"],
                  watchPaths: ["CONTEXT.md", "plugins/s-systems"],
                },
              },
            ],
          },
        },
      },
      null,
      2,
    )}\n`,
  );

  runGit(["init", "-b", "main"]);
  runGit(["config", "user.name", "Transaction Fixture"]);
  runGit(["config", "user.email", "fixture@singleton.systems"]);
  runGit(["add", "."]);
  runGit(["commit", "-m", "Create transaction fixture"]);
  fs.mkdirSync(path.dirname(runtime), { recursive: true });
  fs.cpSync(path.join(repo, "plugins", "s-systems"), runtime, { recursive: true });

  const currentEnvironment = { S_SYSTEMS_TASK_PLUGIN_VERSION: "1.0.0+codex.fixture" };
  const valid = await reconcile("valid", currentEnvironment);
  assert.equal(valid.transaction.status, "completed");
  assert.equal(valid.transaction.preconditions[0].preconditionId, "readback-only-run");
  assert.equal(canComplete(valid.transaction), true);
  assert.equal(valid.transaction.receipts.length, 7);
  assert.equal(verifyReceiptChain(valid.transaction), true);
  assert.ok(valid.statePath && fs.existsSync(valid.statePath));

  const receiptsBeforeRetry = valid.transaction.receipts.length;
  const duplicate = await reconcile("valid", currentEnvironment);
  assert.equal(duplicate.transaction.status, "completed");
  assert.equal(duplicate.transaction.receipts.length, receiptsBeforeRetry);
  assert.equal(duplicate.transaction.attempts.filter(({ outcome }) => outcome === "duplicate").length, 7);

  write(path.join(runtime, "skills", "fixture", "SKILL.md"), "# stale runtime skill\n");
  const staleRuntime = await reconcile("valid", currentEnvironment);
  assert.equal(staleRuntime.transaction.status, "incomplete");
  assert.equal(ledger(staleRuntime.transaction, "codex-plugin-runtime").status, "stale");
  assert.equal(ledger(staleRuntime.transaction, "active-task-catalog").status, "stale");
  assert.equal(ledger(staleRuntime.transaction, "repository-checks").status, "stale");
  assert.equal(canComplete(staleRuntime.transaction), false);
  assert.ok(staleRuntime.transaction.compensationPlan.some(({ ownerId }) => ownerId === "codex-plugin-runtime"));
  assert.ok(staleRuntime.transaction.compensationPlan.every(({ automatic }) => automatic === false));
  assert.equal(
    staleRuntime.transaction.compensationPlan.find(({ ownerId }) => ownerId === "active-task-catalog").operation,
    "reverify-after-dependencies",
  );

  fs.rmSync(runtime, { recursive: true, force: true });
  fs.cpSync(path.join(repo, "plugins", "s-systems"), runtime, { recursive: true });
  const repairedRuntime = await reconcile("valid", currentEnvironment);
  assert.equal(repairedRuntime.transaction.status, "completed");
  assert.equal(canComplete(repairedRuntime.transaction), true);

  const staleTask = await reconcile("stale-task", {
    S_SYSTEMS_TASK_PLUGIN_VERSION: "0.9.0+codex.stale",
  });
  assert.equal(staleTask.transaction.status, "incomplete");
  assert.equal(ledger(staleTask.transaction, "active-task-catalog").status, "stale");
  assert.equal(ledger(staleTask.transaction, "repository-checks").status, "stale");
  assert.equal(canComplete(staleTask.transaction), false);
  const repairedTask = await reconcile("stale-task", currentEnvironment);
  assert.equal(repairedTask.transaction.status, "completed");

  write(path.join(repo, "CONTEXT.md"), "# dirty fixture policy\n");
  const dirtyCheckout = await reconcile("dirty-checkout", currentEnvironment);
  assert.equal(dirtyCheckout.transaction.status, "incomplete");
  assert.equal(ledger(dirtyCheckout.transaction, "source-checkout").status, "stale");
  assert.equal(ledger(dirtyCheckout.transaction, "plugin-source").status, "stale");
  assert.equal(canComplete(dirtyCheckout.transaction), false);
  write(path.join(repo, "CONTEXT.md"), "# fixture policy\n");
  const repairedCheckout = await reconcile("dirty-checkout", currentEnvironment);
  assert.equal(repairedCheckout.transaction.status, "completed");

  const staleSupabase = await reconcile("stale-supabase", {
    ...currentEnvironment,
    SIMULATE_SUPABASE_STALE: "1",
  });
  assert.equal(staleSupabase.transaction.status, "incomplete");
  assert.equal(ledger(staleSupabase.transaction, "supabase-registry").status, "stale");
  assert.equal(ledger(staleSupabase.transaction, "repository-checks").status, "stale");
  assert.equal(canComplete(staleSupabase.transaction), false);
  const repairedSupabase = await reconcile("stale-supabase", currentEnvironment);
  assert.equal(repairedSupabase.transaction.status, "completed");

  console.log(
    "Cross-surface staleness checks passed: real checkout, runtime, task-catalog, command/Supabase readback, durable resume, downstream invalidation, repair plan, and verified completion.",
  );
} finally {
  fs.rmSync(fixtureRoot, { recursive: true, force: true });
}
