import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { hashValue } from "../transactions/contract.mjs";
import { assertReviewConfig } from "./contract.mjs";

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

function untrackedInventory(root, selectors = []) {
  const output = requireGitOutput(root, ["ls-files", "--others", "--exclude-standard", "-z", "--", ...selectors], "list untracked files");
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
      if (stat.isDirectory()) {
        // Git lists an embedded checkout as one untracked directory. Bind its
        // content without traversing .git, ignored dependencies or link targets.
        const nestedRoot = requireGitOutput(target, ["rev-parse", "--show-toplevel"], "read nested repository root");
        if (fs.realpathSync(nestedRoot) !== fs.realpathSync(target)) throw new Error(`untracked directory is not a repository: ${relativePath}`);
        return {
          path: relativePath,
          type: "repository",
          headCommit: requireGitOutput(target, ["rev-parse", "HEAD"], "read nested HEAD"),
          diffHash: hashValue({
            trackedDiff: requireGitOutput(target, ["diff", "--binary", "--no-ext-diff", "HEAD", "--"], "read nested diff"),
            untracked: untrackedInventory(target),
          }),
        };
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

function selectedInventory(root, selectors) {
  const listed = requireGitOutput(root, ["ls-files", "-c", "-o", "--exclude-standard", "-z", "--", ...selectors], "list selected inputs").split("\0").filter(Boolean);
  // Explicit files include ignored local environment inputs and missing files.
  for (const selector of selectors) if (!fs.existsSync(path.join(root, selector)) || !fs.lstatSync(path.join(root, selector)).isDirectory()) listed.push(selector);
  return [...new Set(listed)].sort().map(relative => {
    const target = path.join(root, relative);
    const stat = fs.lstatSync(target, { throwIfNoEntry: false });
    if (!stat) return { path: relative, type: "missing" };
    if (!stat.isFile() || stat.isSymbolicLink() || !fs.realpathSync(target).startsWith(`${fs.realpathSync(root)}${path.sep}`)) throw new Error(`selected input is not a regular repository file: ${relative}`);
    return { path: relative, mode: stat.mode & 0o777, hash: crypto.createHash("sha256").update(fs.readFileSync(target)).digest("hex") };
  });
}

export function createRepositoryAdapter(options = {}) {
  const commandRunner = options.commandRunner ?? run;
  return {
    snapshot(rootInput, config) {
      assertReviewConfig(config);
      const root = path.resolve(rootInput);
      const headCommit = requireGitOutput(root, ["rev-parse", "HEAD"], "read HEAD");
      const mergeBase = requireGitOutput(root, ["merge-base", config.baseRef, "HEAD"], "resolve merge base");
      const selectors = config.scope ? [...new Set([...config.scope.paths, ...config.scope.inputs])].sort() : [];
      const trackedDiff = requireGitOutput(
        root,
        ["diff", "--binary", "--no-ext-diff", mergeBase, "--", ...selectors],
        "read active diff",
      );
      const untracked = untrackedInventory(root, selectors);
      const contracts = contractInventory(root, config.contractFiles);
      const snapshot = {
        root,
        baseRef: config.baseRef,
        headCommit,
        mergeBase,
        diffHash: hashValue({ trackedDiff, untracked }),
        contractHash: hashValue(contracts),
        changedFiles: requireGitOutput(root, ["diff", "--name-only", mergeBase, "--", ...selectors], "list changed files")
          .split("\n")
          .filter(Boolean),
        untrackedFiles: untracked.map(({ path: relativePath }) => relativePath),
      };
      if (config.scope) {
        snapshot.workspaceHash = hashValue({ tracked: requireGitOutput(root, ["diff", "--binary", "--no-ext-diff", "HEAD", "--"], "read check workspace"), status: requireGitOutput(root, ["status", "--porcelain=v1", "-z"], "read check workspace status") });
        snapshot.selection = {
          name: config.scope.name,
          selectors,
          contentHash: hashValue(selectedInventory(root, selectors)),
          baselineHash: hashValue(requireGitOutput(root, ["ls-tree", "-r", mergeBase, "--", ...selectors], "read selected baseline")),
          runtimeHash: hashValue({ node: process.version, platform: process.platform, arch: process.arch, nodeEnv: process.env.NODE_ENV ?? null }),
        };
      }
      return snapshot;
    },
    runCheck(rootInput, check) {
      return commandRunner(path.resolve(rootInput), check.command, check.args, check.timeoutMs ?? DEFAULT_TIMEOUT_MS);
    },
  };
}
