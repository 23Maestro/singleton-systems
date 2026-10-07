import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { completionStop } from "../lib/reviews/completion.mjs";
import { runRepositoryReview, approveRepositoryReview } from "../lib/reviews/engine.mjs";
import { reviewStatePath, prepareReviewStateDirectory } from "../lib/reviews/state-path.mjs";
import { hashValue } from "../lib/transactions/contract.mjs";

const source = process.cwd();
const fixture = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "delivery-stop-")));
const root = path.join(fixture, "singleton-systems");
fs.mkdirSync(path.join(root, "config/reviews"), { recursive: true });
const git = (...args) => {
  const result = spawnSync("git", args, { cwd: root, encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);
};
git("init", "-q");
fs.writeFileSync(path.join(root, "AGENTS.md"), "fixture contract\n");
git("add", "AGENTS.md");
git("-c", "user.name=Fixture", "-c", "user.email=fixture@example.invalid", "commit", "-qm", "fixture");
const config = { schemaVersion: 1, reviewId: "fixture", intent: "Verify code delivery", baseRef: "HEAD", requiredPasses: ["initial", "verification"], contractFiles: ["AGENTS.md"], checks: [{ checkId: "test", command: process.execPath, args: ["-e", "process.exit(0)"] }], humanApproval: { required: true } };
fs.writeFileSync(path.join(root, "config/reviews/singleton-systems.json"), JSON.stringify(config));
const binding = { taskId: "H10", sessionId: "session-a", runId: "run-a" };
const bound = { ...config, completionBinding: binding };
const file = path.join(root, ".git/evidence.json");
const payload = (changes = {}, extra = {}) => ({ hook_event_name: "Stop", cwd: root, session_id: binding.sessionId, turn_id: binding.runId, stop_hook_active: false, last_assistant_message: `[code-delivery] ${JSON.stringify({ ...binding, outcome: "ready", statePath: file, ...changes })}`, ...extra });
const run = (passId, extra = {}) => runRepositoryReview({ root, config: bound, statePath: file, passId, ...extra });
const check = (changes, extra) => completionStop(payload(changes, extra));
const rejected = (result, pattern) => { assert.equal(result.decision, "block"); assert.match(result.reason, pattern); };

try {
  assert.equal(await completionStop({ last_assistant_message: "Research finished. Review is pending." }), null);
  assert.equal(await completionStop({ last_assistant_message: "The [code-delivery] marker is documented." }), null);
  assert.match((await check({ outcome: "cancelled" })).systemMessage, /cancelled/);
  assert.match((await check({ outcome: "incomplete" })).systemMessage, /incomplete/);
  rejected(await check(), /missing/);
  rejected(await check({ runId: "other" }), /active session and turn/);
  rejected(await check({}, { session_id: undefined }), /active session and turn/);
  rejected(await completionStop({ ...payload(), last_assistant_message: "[code-delivery] bad json" }), /incomplete/);
  await run("initial");
  rejected(await check(), /review is incomplete/);
  await run("verification");
  const valid = fs.readFileSync(file, "utf8");
  assert.match((await check()).systemMessage, /readiness verified/);
  rejected(await check({ outcome: "approved" }), /approval is pending/);
  rejected(await check({ taskId: "another-task" }), /binding does not match/);
  rejected(await check({}, { turn_id: "next-run" }), /active session and turn/);
  const continued = await check({ taskId: "another-task" }, { stop_hook_active: true });
  assert.equal(continued.continue, false);
  assert.match(continued.systemMessage, /incomplete/);

  let state = JSON.parse(valid);
  state.receipts[0].status = "failed";
  fs.writeFileSync(file, JSON.stringify(state));
  rejected(await check(), /hash mismatch/);
  state = JSON.parse(valid);
  state.passes.at(-1).checks[0].exitCode = 1;
  fs.writeFileSync(file, JSON.stringify(state));
  rejected(await check(), /matching receipt|execution evidence/);
  state = JSON.parse(valid);
  delete state.receipts[0].configHash;
  fs.writeFileSync(file, JSON.stringify(state));
  rejected(await check(), /unbound/);
  fs.writeFileSync(file, valid);
  const failed = await runRepositoryReview({ root, config: bound, statePath: path.join(root, ".git/failed.json"), passId: "verification", adapter: {
    snapshot: async () => JSON.parse(valid).latestScope,
    runCheck: async () => ({ status: 1, error: null, timedOut: false, signal: null, stdoutHash: hashValue(""), stderrHash: hashValue(""), output: "failure" }),
  } });
  assert.equal(failed.status, "incomplete");
  rejected(await check({ statePath: path.join(root, ".git/failed.json") }), /review is incomplete/);
  await runRepositoryReview({ root, config: bound, statePath: path.join(root, ".git/interrupted.json"), passId: "verification", interruptAfterCheck: "test" });
  rejected(await check({ statePath: path.join(root, ".git/interrupted.json") }), /review is interrupted/);
  rejected(await completionStop(payload(), { now: Date.now() + 25 * 60 * 60 * 1000 }), /stale/);
  fs.writeFileSync(path.join(root, "AGENTS.md"), "changed scope\n");
  rejected(await check(), /stale for the current repository scope/);
  fs.writeFileSync(path.join(root, "AGENTS.md"), "fixture contract\n");

  await approveRepositoryReview({ root, config: bound, statePath: file, reviewer: "Fixture human", evidence: "fixture only" });
  assert.match((await check({ outcome: "approved" })).systemMessage, /does not prove a release/);

  // Invoke the configured Python hook, not just its JS helper. Cleanup stays in the fixture.
  const hookConfig = JSON.parse(fs.readFileSync(path.join(source, ".codex/hooks.json"), "utf8"));
  assert.ok(hookConfig.hooks.Stop.some((group) => group.hooks.some((hook) => hook.command.includes("cerebral_singleton_guard.py"))));
  const hook = (input, env = {}) => {
    const result = spawnSync("python3", [path.join(source, ".codex/hooks/cerebral_singleton_guard.py")], { cwd: root, input: JSON.stringify(input), encoding: "utf8", env: { ...process.env, NODE_BINARY: process.execPath, CEREBRAL_CODEX_GIT_TEMP_ROOT: path.join(fixture, "git-temp"), ...env } });
    assert.equal(result.status, 0, result.stderr);
    return result.stdout.trim() ? JSON.parse(result.stdout) : null;
  };
  assert.match(hook(payload()).systemMessage, /readiness verified/);
  rejected(hook(payload({ taskId: "wrong" })), /binding does not match/);
  assert.equal(hook(payload({ taskId: "wrong" }, { stop_hook_active: true })).continue, false);
  assert.equal(hook({ ...payload(), last_assistant_message: "Research is complete." }), null);
  rejected(hook(payload(), { NODE_BINARY: path.join(fixture, "missing-node") }), /bridge unavailable/);

  // Retained paths survive fresh processes; explicit paths retain their prior resolution.
  const home = path.join(fixture, "private-home");
  const retained = reviewStatePath(root, bound, null, home);
  assert.ok(!retained.startsWith(path.join(os.tmpdir(), "singleton-systems/reviews")));
  prepareReviewStateDirectory(retained, false);
  assert.equal(fs.statSync(path.dirname(retained)).mode & 0o077, 0);
  const restart = (passId) => {
    const result = spawnSync(process.execPath, ["--input-type=module", "-e", `import {runRepositoryReview} from ${JSON.stringify(path.join(source, "lib/reviews/engine.mjs"))}; const state=await runRepositoryReview(${JSON.stringify({ root, config: bound, statePath: retained, passId })}); console.log(JSON.stringify(state));`], { encoding: "utf8" });
    assert.equal(result.status, 0, result.stderr);
    return JSON.parse(result.stdout);
  };
  assert.equal(restart("initial").receipts.length, 1);
  assert.equal(restart("verification").receipts.length, 2);
  assert.equal(fs.statSync(retained).mode & 0o077, 0);
  const explicit = path.join(root, ".git/explicit.json");
  assert.equal(reviewStatePath(root, bound, ".git/explicit.json"), explicit);
  const cli = spawnSync(process.execPath, [path.join(source, "scripts/codex-rabbit-review.mjs"), "--repo", root, "--state", ".git/explicit.json", "--pass", "initial", "--task", binding.taskId, "--session", binding.sessionId, "--run", binding.runId, "--allow-incomplete", "--json"], { encoding: "utf8" });
  assert.equal(cli.status, 0, cli.stderr);
  assert.equal(JSON.parse(cli.stdout).statePath, explicit);
  const legacy = path.join(fixture, "legacy-temp-state.json");
  fs.writeFileSync(legacy, valid);
  prepareReviewStateDirectory(retained, false);
  assert.equal(fs.readFileSync(legacy, "utf8"), valid);

  // A successful command that changes source cannot certify its starting scope.
  const mutating = { ...bound, checks: [{ checkId: "mutate", command: process.execPath, args: ["-e", "require('fs').writeFileSync('AGENTS.md','mutation during check')"] }] };
  const altered = await runRepositoryReview({ root, config: mutating, statePath: path.join(root, ".git/mutating.json"), passId: "initial" });
  assert.equal(altered.status, "incomplete");
  fs.writeFileSync(path.join(root, "AGENTS.md"), "different before final check\n");
  const alteredFinal = await runRepositoryReview({ root, config: { ...mutating, requiredPasses: ["verification"] }, statePath: path.join(root, ".git/mutating-final.json"), passId: "verification" });
  assert.equal(alteredFinal.status, "incomplete");
  assert.match(alteredFinal.error, /stale for the current repository scope/);
  assert.notEqual(hashValue(bound), hashValue(config));
  console.log("Code delivery checks passed: binding, missing/tampered/stale evidence, scope drift, cancellation, bounded continuation, readiness/approval, configured hook bridge, retained restart and explicit paths.");
} finally {
  fs.rmSync(fixture, { recursive: true, force: true });
}
