import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { hashValue } from "../transactions/contract.mjs";

const DEFAULT_TIMEOUT_MS = 120_000;
const GIT_TIMEOUT_MS = 30_000;

function run(root, command, args, timeoutMs = DEFAULT_TIMEOUT_MS) {
  const result = spawnSync(command, args, {
    cwd: root,
    encoding: "utf8",
    maxBuffer: 10 * 1024 * 1024,
    timeout: timeoutMs,
  });
  const stdout = result.stdout ?? "";
  const stderr = result.stderr ?? "";
  return {
    command,
    args,
    status: result.status,
    signal: result.signal,
    timedOut: result.error?.code === "ETIMEDOUT",
    error: result.error?.message ?? null,
    stdoutHash: crypto.createHash("sha256").update(stdout).digest("hex"),
    stderrHash: crypto.createHash("sha256").update(stderr).digest("hex"),
    output: `${stdout}${stderr}`.trim().slice(-2000),
  };
}

function requireGitOutput(root, args, label) {
  const result = spawnSync("git", args, {
    cwd: root,
    encoding: "utf8",
    maxBuffer: 50 * 1024 * 1024,
    timeout: GIT_TIMEOUT_MS,
  });
  if (result.status !== 0 || result.error) {
    const timeout = result.error?.code === "ETIMEDOUT" ? "git read timed out" : null;
    throw new Error(`${label}: ${timeout || (result.stderr ?? "").trim() || result.error?.message || "git failed"}`);
  }
  return (result.stdout ?? "").replace(/\n$/, "");
}

function untrackedInventory(root) {
  const output = requireGitOutput(root, ["ls-files", "--others", "--exclude-standard", "-z"], "list untracked files");
  return output
    .split("\0")
    .filter(Boolean)
    .sort()
    .map((relativePath) => {
      const target = path.join(root, relativePath);
      const stat = fs.lstatSync(target);
      if (stat.isSymbolicLink()) {
        return { path: relativePath, type: "symlink", target: fs.readlinkSync(target) };
      }
      if (!stat.isFile()) throw new Error(`unsupported untracked path type: ${relativePath}`);
      return {
        path: relativePath,
        type: "file",
        hash: crypto.createHash("sha256").update(fs.readFileSync(target)).digest("hex"),
      };
    });
}

function contractInventory(root, contractFiles) {
  return contractFiles.map((relativePath) => {
    const target = path.resolve(root, relativePath);
    if (!target.startsWith(`${root}${path.sep}`) && target !== root) {
      throw new Error(`contract file escapes repository: ${relativePath}`);
    }
    if (!fs.existsSync(target) || !fs.statSync(target).isFile()) {
      throw new Error(`contract file is missing: ${relativePath}`);
    }
    return {
      path: relativePath,
      hash: crypto.createHash("sha256").update(fs.readFileSync(target)).digest("hex"),
    };
  });
}

export function createRepositoryAdapter(options = {}) {
  const commandRunner = options.commandRunner ?? run;
  return {
    snapshot(rootInput, config) {
      const root = path.resolve(rootInput);
      const headCommit = requireGitOutput(root, ["rev-parse", "HEAD"], "read HEAD");
      const mergeBase = requireGitOutput(root, ["merge-base", config.baseRef, "HEAD"], "resolve merge base");
      const trackedDiff = requireGitOutput(
        root,
        ["diff", "--binary", "--no-ext-diff", mergeBase, "--"],
        "read active diff",
      );
      const untracked = untrackedInventory(root);
      const contracts = contractInventory(root, config.contractFiles);
      return {
        root,
        baseRef: config.baseRef,
        headCommit,
        mergeBase,
        diffHash: hashValue({ trackedDiff, untracked }),
        contractHash: hashValue(contracts),
        changedFiles: requireGitOutput(root, ["diff", "--name-only", mergeBase, "--"], "list changed files")
          .split("\n")
          .filter(Boolean),
        untrackedFiles: untracked.map(({ path: relativePath }) => relativePath),
      };
    },
    runCheck(rootInput, check) {
      return commandRunner(path.resolve(rootInput), check.command, check.args, check.timeoutMs ?? DEFAULT_TIMEOUT_MS);
    },
  };
}
