import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { hashValue } from "../lib/transactions/contract.mjs";
import { approveRepositoryReview, runRepositoryReview } from "../lib/reviews/engine.mjs";
import { assertFindings, verifyReviewReceiptChain } from "../lib/reviews/contract.mjs";
import { createRepositoryAdapter } from "../lib/reviews/repository-adapter.mjs";

const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), "codex-rabbit-check-"));
const fixedClock = () => new Date("2026-08-30T06:30:00.000Z");
const emptyHash = hashValue("");
const config = {
  schemaVersion: 1,
  reviewId: "fixture-review",
  intent: "Prove the fail-closed review gate.",
  baseRef: "origin/main",
  requiredPasses: ["initial", "verification"],
  contractFiles: ["AGENTS.md"],
  checks: [
    { checkId: "contract", command: "fixture", args: ["contract"] },
    { checkId: "tests", command: "fixture", args: ["tests"] },
  ],
  humanApproval: { required: true },
};

function statePath(name) {
  return path.join(fixtureRoot, `${name}.json`);
}

function snapshot(diffHash = hashValue("diff-a")) {
  return {
    root: "/fixture/repo",
    baseRef: "origin/main",
    headCommit: "abc123",
    mergeBase: "base123",
    diffHash,
    contractHash: hashValue("contract"),
    changedFiles: ["fixture.mjs"],
    untrackedFiles: [],
  };
}

function result(overrides = {}) {
  return {
    status: 0,
    signal: null,
    timedOut: false,
    error: null,
    stdoutHash: emptyHash,
    stderrHash: emptyHash,
    output: "ok",
    ...overrides,
  };
}

function adapter(options = {}) {
  const calls = options.calls ?? new Map();
  return {
    calls,
    async snapshot() {
      return snapshot(options.diffHash?.value);
    },
    async runCheck(_root, check) {
      calls.set(check.checkId, (calls.get(check.checkId) ?? 0) + 1);
      return options.results?.[check.checkId] ?? result();
    },
  };
}

function runCli(cwd, args) {
  const script = path.join(process.cwd(), "scripts/codex-rabbit-review.mjs");
  return spawnSync(process.execPath, [script, ...args], { cwd, encoding: "utf8" });
}

function finding(status = "open") {
  return [{
    findingId: "unsafe-write",
    file: "fixture.mjs",
    line: 10,
    risk: "The write can escape its declared owner.",
    proof: "The path accepts a parent segment.",
    fix: "Reject paths outside the owner root.",
    verification: "The escape fixture exits nonzero.",
    status,
  }];
}

async function run(name, passId, options = {}) {
  return runRepositoryReview({
    root: "/fixture/repo",
    config: options.config ?? config,
    statePath: statePath(name),
    passId,
    findings: options.findings ?? [],
    adapter: options.adapter ?? adapter(),
    clock: fixedClock,
    interruptAfterCheck: options.interruptAfterCheck,
  });
}

try {
  {
    const failed = await run("failed-check", "initial", {
      adapter: adapter({ results: { tests: result({ status: 1, output: "tests failed" }) } }),
    });
    assert.equal(failed.status, "incomplete");
    assert.equal(failed.passes[0].status, "failed");
    assert.match(failed.error, /failed checks/);
  }

  {
    await run("pass-receipt-tamper", "initial");
    await run("pass-receipt-tamper", "verification");
    const file = statePath("pass-receipt-tamper");
    const tampered = JSON.parse(fs.readFileSync(file, "utf8"));
    tampered.passes.at(-1).receiptHash = hashValue("another-valid-looking-hash");
    fs.writeFileSync(file, `${JSON.stringify(tampered, null, 2)}\n`);
    const incomplete = await approveRepositoryReview({
      root: "/fixture/repo",
      config,
      statePath: file,
      adapter: adapter(),
      reviewer: "Jerami",
      evidence: "Review attempted.",
      clock: fixedClock,
    });
    assert.equal(incomplete.status, "incomplete");
    assert.match(incomplete.error, /has no matching receipt/);
  }

  {
    const timedOut = await run("timeout", "initial", {
      adapter: adapter({ results: { contract: result({ status: null, timedOut: true, error: "timed out" }) } }),
    });
    assert.equal(timedOut.status, "incomplete");
    assert.equal(timedOut.passes[0].checks[0].timedOut, true);
  }

  {
    const repo = path.join(fixtureRoot, "symlink-repo");
    fs.mkdirSync(repo);
    fs.writeFileSync(path.join(repo, "AGENTS.md"), "fixture\n");
    for (const args of [["init", "-q"], ["config", "user.email", "fixture@example.com"], ["config", "user.name", "Fixture"], ["add", "AGENTS.md"], ["commit", "-qm", "fixture"]]) {
      const git = spawnSync("git", args, { cwd: repo, encoding: "utf8" });
      assert.equal(git.status, 0, git.stderr);
    }
    fs.symlinkSync("missing-target", path.join(repo, "broken-link"));
    const realAdapter = createRepositoryAdapter();
    const symlinkSnapshot = realAdapter.snapshot(repo, { ...config, baseRef: "HEAD" });
    assert.deepEqual(symlinkSnapshot.untrackedFiles, ["broken-link"]);
  }

  {
    const learnedFindings = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), "config/reviews/coderabbit-findings.fixture.json"), "utf8"),
    );
    assert.equal(learnedFindings.length, 7);
    assert.doesNotThrow(() => assertFindings(learnedFindings));
  }

  {
    const repo = path.join(fixtureRoot, "portable-repo");
    fs.mkdirSync(path.join(repo, "config"), { recursive: true });
    fs.writeFileSync(path.join(repo, "AGENTS.md"), "fixture contract\n");
    fs.writeFileSync(path.join(repo, "index.mjs"), "export const answer = 42;\n");
    const portableConfig = {
      schemaVersion: 1,
      reviewId: "portable-fixture",
      intent: "Review a Git repository without a pull request.",
      baseRef: "HEAD",
      requiredPasses: ["initial", "verification"],
      contractFiles: ["AGENTS.md"],
      checks: [{ checkId: "node-check", command: process.execPath, args: ["--check", "index.mjs"] }],
      humanApproval: { required: true },
    };
    fs.writeFileSync(path.join(repo, "config", "review.json"), `${JSON.stringify(portableConfig, null, 2)}\n`);
    for (const args of [
      ["init", "-q"],
      ["config", "user.email", "fixture@example.com"],
      ["config", "user.name", "Fixture"],
      ["add", "."],
      ["commit", "-qm", "fixture"],
    ]) {
      const git = spawnSync("git", args, { cwd: repo, encoding: "utf8" });
      assert.equal(git.status, 0, git.stderr);
    }
    fs.writeFileSync(path.join(repo, ".git", "findings.json"), "[]\n");
    const common = [
      "--repo", repo,
      "--config", "config/review.json",
      "--state", ".git/review-state.json",
      "--json",
    ];
    const initial = runCli(fixtureRoot, [...common, "--pass", "initial", "--findings", ".git/findings.json", "--allow-incomplete"]);
    assert.equal(initial.status, 0, initial.stderr);
    assert.equal(JSON.parse(initial.stdout).state.status, "incomplete");

    const verification = runCli(fixtureRoot, [...common, "--pass", "verification", "--findings", ".git/findings.json", "--allow-incomplete"]);
    assert.equal(verification.status, 0, verification.stderr);
    assert.equal(JSON.parse(verification.stdout).state.status, "awaiting_human");

    const approvalArgs = [...common, "--approve", "--reviewer", "Jerami", "--evidence", "Reviewed fixture scope"];
    const approved = runCli(fixtureRoot, approvalArgs);
    assert.equal(approved.status, 0, approved.stderr);
    const approvedState = JSON.parse(approved.stdout).state;
    assert.equal(approvedState.status, "approved");
    assert.equal(approvedState.receipts.length, 3);

    const duplicateApproval = runCli(fixtureRoot, approvalArgs);
    assert.equal(duplicateApproval.status, 0, duplicateApproval.stderr);
    assert.equal(JSON.parse(duplicateApproval.stdout).state.receipts.length, 3);

    fs.writeFileSync(path.join(repo, "index.mjs"), "export const answer = 43;\n");
    for (const args of [["add", "index.mjs"], ["commit", "-qm", "new commit"]]) {
      const git = spawnSync("git", args, { cwd: repo, encoding: "utf8" });
      assert.equal(git.status, 0, git.stderr);
    }
    const staleApproval = runCli(fixtureRoot, approvalArgs);
    assert.equal(staleApproval.status, 2, staleApproval.stderr);
    assert.match(JSON.parse(staleApproval.stdout).state.error, /stale for the current repository scope/);
  }

  {
    const open = await run("open-finding", "initial", { findings: finding("open") });
    assert.equal(open.status, "incomplete");
    assert.equal(open.passes[0].findings[0].status, "open");
  }

  {
    const calls = new Map();
    const resumableAdapter = adapter({ calls });
    const interrupted = await run("resume", "initial", {
      adapter: resumableAdapter,
      interruptAfterCheck: "contract",
    });
    assert.equal(interrupted.status, "interrupted");
    const resumed = await run("resume", "initial", { adapter: resumableAdapter });
    assert.equal(resumed.passes.at(-1).status, "passed");
    assert.equal(calls.get("contract"), 1);
    assert.equal(calls.get("tests"), 1);
  }

  {
    const first = await run("duplicate", "initial");
    assert.equal(first.receipts.length, 1);
    const duplicate = await run("duplicate", "initial");
    assert.equal(duplicate.receipts.length, 1);
    assert.equal(duplicate.passes.at(-1).receiptHash, duplicate.receipts[0].receiptHash);
  }

  {
    await run("tamper", "initial");
    const file = statePath("tamper");
    const tampered = JSON.parse(fs.readFileSync(file, "utf8"));
    tampered.receipts[0].checksHash = hashValue("forged");
    fs.writeFileSync(file, `${JSON.stringify(tampered, null, 2)}\n`);
    await assert.rejects(() => run("tamper", "verification"), /hash mismatch/);
  }

  {
    const initial = await run("valid", "initial", { findings: finding("open") });
    assert.equal(initial.status, "incomplete");
    const verification = await run("valid", "verification", { findings: finding("resolved") });
    assert.equal(verification.status, "awaiting_human");
    assert.equal(verification.receipts.length, 2);
    assert.equal(verifyReviewReceiptChain(verification), true);

    const approved = await approveRepositoryReview({
      root: "/fixture/repo",
      config,
      statePath: statePath("valid"),
      adapter: adapter(),
      reviewer: "Jerami",
      evidence: "Reviewed both passes.",
      clock: fixedClock,
    });
    assert.equal(approved.status, "approved");
    assert.equal(approved.humanApproval.status, "approved");
    assert.equal(approved.receipts.length, 3);
    assert.equal(approved.receipts.at(-1).passId, "human-approval");

    const duplicateApproval = await approveRepositoryReview({
      root: "/fixture/repo",
      config,
      statePath: statePath("valid"),
      adapter: adapter(),
      reviewer: "Jerami",
      evidence: "Reviewed both passes.",
      clock: () => new Date("2026-08-30T06:31:00.000Z"),
    });
    assert.equal(duplicateApproval.receipts.length, 3);
    assert.equal(duplicateApproval.updatedAt, approved.updatedAt);

    const ajv = new Ajv2020({ allErrors: true, strict: false });
    addFormats(ajv);
    const schema = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), "config/reviews/review-state.schema.json"), "utf8"),
    );
    assert.equal(ajv.validate(schema, approved), true, JSON.stringify(ajv.errors));
  }

  {
    await run("stale", "initial");
    await run("stale", "verification");
    const changedDiff = { value: hashValue("diff-b") };
    const stale = await approveRepositoryReview({
      root: "/fixture/repo",
      config,
      statePath: statePath("stale"),
      adapter: adapter({ diffHash: changedDiff }),
      reviewer: "Jerami",
      evidence: "Reviewed old scope.",
      clock: fixedClock,
    });
    assert.equal(stale.status, "incomplete");
    assert.match(stale.error, /stale for the current repository scope/);
  }

  {
    await run("unresolved", "initial", { findings: finding("open") });
    const unresolved = await run("unresolved", "verification");
    assert.equal(unresolved.status, "incomplete");
    assert.match(unresolved.error, /finding unsafe-write is open/);
  }

  {
    await run("config-drift", "initial");
    const changedConfig = { ...config, intent: "Changed intent." };
    const drifted = await run("config-drift", "verification", { config: changedConfig });
    assert.equal(drifted.status, "incomplete");
    assert.match(drifted.error, /config changed/);
  }
} finally {
  fs.rmSync(fixtureRoot, { recursive: true, force: true });
}

console.log("Codex Rabbit checks passed: failures, timeout, findings, resume, duplicate delivery, tampering, staleness, config drift, valid approval, and a second Git repository without a pull request.");
