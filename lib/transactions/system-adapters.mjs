import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { canonicalJson, cloneValue, hashValue } from "./contract.mjs";

const IGNORED_NAMES = new Set([".DS_Store"]);
const DEFAULT_COMMAND_TIMEOUT_MS = 120_000;

function compareCodeUnits(left, right) {
  return left < right ? -1 : left > right ? 1 : 0;
}

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function resolvePath(root, value) {
  if (value === "~") return os.homedir();
  if (value.startsWith("~/")) return path.join(os.homedir(), value.slice(2));
  return path.isAbsolute(value) ? value : path.join(root, value);
}

function fileInventory(directory, prefix = "") {
  const entries = [];
  for (const item of fs.readdirSync(directory, { withFileTypes: true }).sort((a, b) => compareCodeUnits(a.name, b.name))) {
    if (IGNORED_NAMES.has(item.name)) continue;
    const relative = prefix ? `${prefix}/${item.name}` : item.name;
    const full = path.join(directory, item.name);
    if (item.isDirectory()) entries.push(...fileInventory(full, relative));
    else if (item.isSymbolicLink()) entries.push({ path: relative, type: "symlink", target: fs.readlinkSync(full) });
    else if (item.isFile()) entries.push({ path: relative, type: "file", hash: sha256(fs.readFileSync(full)) });
  }
  return entries;
}

export function snapshotPath(target) {
  if (!fs.existsSync(target)) return { exists: false, type: null, hash: null, fileCount: 0 };
  const stat = fs.lstatSync(target);
  if (stat.isFile()) {
    return { exists: true, type: "file", hash: sha256(fs.readFileSync(target)), fileCount: 1 };
  }
  if (stat.isSymbolicLink()) {
    const linkTarget = fs.readlinkSync(target);
    const resolvedState = snapshotPath(fs.realpathSync(target));
    return { ...resolvedState, symlink: true, linkTarget };
  }
  if (!stat.isDirectory()) return { exists: true, type: "other", hash: null, fileCount: 0 };
  const inventory = fileInventory(target);
  return { exists: true, type: "directory", hash: hashValue(inventory), fileCount: inventory.length };
}

function mutationDenied(ownerId) {
  throw new Error(`${ownerId} is readback-only; live mutation requires Jerami approval`);
}

function receiptEvidence(kind, readback, verification) {
  return {
    adapter: kind,
    readbackHash: hashValue(readback),
    verification: cloneValue(verification.evidence),
  };
}

function pathSnapshotAdapter(ownerId, config, root) {
  const target = resolvePath(root, config.path);
  return {
    async plan() {
      return { desiredState: snapshotPath(target), path: target };
    },
    async apply() {
      return mutationDenied(ownerId);
    },
    async readback() {
      return snapshotPath(target);
    },
    async verify({ plan, readback }) {
      const ok = readback.exists && canonicalJson(readback) === canonicalJson(plan.desiredState);
      return {
        ok,
        evidence: { expectedHash: plan.desiredState.hash, actualHash: readback.hash, path: target },
        error: ok ? null : `${ownerId} changed or is missing during readback`,
      };
    },
    async receipt({ readback, verification }) {
      return receiptEvidence(config.kind, readback, verification);
    },
  };
}

function directoryParityAdapter(ownerId, config, root) {
  const source = resolvePath(root, config.source);
  const target = resolvePath(root, config.target);
  return {
    async plan() {
      return { desiredState: snapshotPath(source), source, target };
    },
    async apply() {
      return mutationDenied(ownerId);
    },
    async readback() {
      const sourceState = snapshotPath(source);
      const targetState = snapshotPath(target);
      return {
        source: sourceState,
        target: targetState,
        matches: sourceState.exists && targetState.exists && sourceState.hash === targetState.hash,
      };
    },
    async verify({ plan, readback }) {
      const ok =
        readback.matches &&
        readback.source.hash === plan.desiredState.hash &&
        readback.target.hash === plan.desiredState.hash;
      return {
        ok,
        evidence: {
          expectedHash: plan.desiredState.hash,
          sourceHash: readback.source.hash,
          targetHash: readback.target.hash,
          source,
          target,
        },
        error: ok ? null : `${ownerId} does not match ${source}`,
      };
    },
    async receipt({ readback, verification }) {
      return receiptEvidence(config.kind, readback, verification);
    },
  };
}

function run(root, command, args, environment, timeoutMs = DEFAULT_COMMAND_TIMEOUT_MS) {
  const result = spawnSync(command, args, {
    cwd: root,
    env: environment,
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
    error: result.error?.message ?? null,
    timedOut: result.error?.code === "ETIMEDOUT",
    stdoutHash: sha256(stdout),
    stderrHash: sha256(stderr),
    output: `${stdout}${stderr}`.trim().slice(-2000),
  };
}

function commandReadbackAdapter(ownerId, config, root, environment) {
  const timeoutMs = config.timeoutMs ?? DEFAULT_COMMAND_TIMEOUT_MS;
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
    throw new Error(`${ownerId} timeoutMs must be a positive finite number`);
  }
  const commands = config.commands ?? [{ command: config.command, args: config.args ?? [] }];
  const watchPaths = (config.watchPaths ?? []).map((item) => resolvePath(root, item));
  return {
    async plan() {
      return {
        commands: cloneValue(commands),
        watchedState: watchPaths.map((item) => ({ path: item, snapshot: snapshotPath(item) })),
      };
    },
    async apply() {
      return mutationDenied(ownerId);
    },
    async readback() {
      return {
        watchedState: watchPaths.map((item) => ({ path: item, snapshot: snapshotPath(item) })),
        commands: commands.map((item) => run(root, item.command, item.args ?? [], environment, timeoutMs)),
      };
    },
    async verify({ plan, readback }) {
      const commandsPass = readback.commands.every((item) => item.status === 0 && !item.error);
      const watchedStateMatches = canonicalJson(readback.watchedState) === canonicalJson(plan.watchedState);
      const ok = commandsPass && watchedStateMatches;
      return {
        ok,
        evidence: {
          commands: readback.commands.map(({ command, args, status, signal, error, timedOut, stdoutHash, stderrHash }) => ({
            command,
            args,
            status,
            signal,
            error,
            timedOut,
            stdoutHash,
            stderrHash,
          })),
          watchedStateHash: hashValue(readback.watchedState),
        },
        error: ok ? null : `${ownerId} command readback failed or its watched source changed`,
      };
    },
    async receipt({ readback, verification }) {
      return receiptEvidence(config.kind, readback, verification);
    },
  };
}

function gitState(root) {
  const head = run(root, "git", ["rev-parse", "HEAD"], process.env);
  const branch = run(root, "git", ["branch", "--show-current"], process.env);
  const status = run(root, "git", ["status", "--porcelain=v1", "--untracked-files=all"], process.env);
  const upstream = run(root, "git", ["rev-parse", "--abbrev-ref", "@{upstream}"], process.env);
  const divergence = upstream.status === 0
    ? run(root, "git", ["rev-list", "--left-right", "--count", `HEAD...${upstream.output}`], process.env)
    : null;
  const [ahead, behind] = divergence?.status === 0
    ? divergence.output.split(/\s+/).map((value) => Number(value))
    : [null, null];
  return {
    available: head.status === 0 && branch.status === 0 && status.status === 0,
    head: head.output || null,
    branch: branch.output || null,
    attached: Boolean(branch.output),
    clean: status.status === 0 && status.output === "",
    upstream: upstream.status === 0 ? upstream.output : null,
    ahead,
    behind,
    pushed: upstream.status === 0 && ahead === 0,
    statusHash: status.status === 0 ? sha256(status.output) : null,
    statusPreview: status.output,
  };
}

function gitStateAdapter(ownerId, config, root) {
  return {
    async plan() {
      const current = gitState(root);
      return {
        desiredState: {
          head: current.head,
          requireClean: config.requireClean === true,
          requireAttachedBranch: config.requireAttachedBranch === true,
          requirePushed: config.requirePushed === true,
        },
      };
    },
    async apply() {
      return mutationDenied(ownerId);
    },
    async readback() {
      return gitState(root);
    },
    async verify({ plan, readback }) {
      const ok =
        readback.available &&
        readback.head === plan.desiredState.head &&
        (!plan.desiredState.requireClean || readback.clean) &&
        (!plan.desiredState.requireAttachedBranch || readback.attached) &&
        (!plan.desiredState.requirePushed || readback.pushed);
      return {
        ok,
        evidence: cloneValue(readback),
        error: ok ? null : `${ownerId} is dirty, detached, unavailable, or changed during readback`,
      };
    },
    async receipt({ readback, verification }) {
      return receiptEvidence(config.kind, readback, verification);
    },
  };
}

function taskCatalogAdapter(ownerId, config, root, environment) {
  const manifestPath = resolvePath(root, config.expectedVersionPath);
  return {
    async plan() {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
      return { desiredState: { version: manifest.version }, environmentKey: config.versionEnvironmentKey };
    },
    async apply() {
      return mutationDenied(ownerId);
    },
    async readback({ plan }) {
      const version = environment[config.versionEnvironmentKey] || null;
      return {
        expectedVersion: plan.desiredState.version,
        activeVersion: version,
        available: Boolean(version),
        requiresFreshTask: Boolean(version && version !== plan.desiredState.version),
      };
    },
    async verify({ readback }) {
      const ok = readback.available && readback.activeVersion === readback.expectedVersion;
      return {
        ok,
        evidence: cloneValue(readback),
        error: ok ? null : `${ownerId} is unverified or requires a fresh Codex task`,
      };
    },
    async receipt({ readback, verification }) {
      return receiptEvidence(config.kind, readback, verification);
    },
  };
}

export function createSystemAdapters(adapterConfigs, options) {
  const root = path.resolve(options.root);
  const environment = { ...process.env, ...(options.environment ?? {}) };
  return Object.fromEntries(
    Object.entries(adapterConfigs).map(([ownerId, config]) => {
      let adapter;
      if (config.kind === "path-snapshot") adapter = pathSnapshotAdapter(ownerId, config, root);
      else if (config.kind === "directory-parity") adapter = directoryParityAdapter(ownerId, config, root);
      else if (config.kind === "command-readback") {
        adapter = commandReadbackAdapter(ownerId, config, root, environment);
      } else if (config.kind === "git-state") adapter = gitStateAdapter(ownerId, config, root);
      else if (config.kind === "task-catalog") adapter = taskCatalogAdapter(ownerId, config, root, environment);
      else throw new Error(`unsupported system adapter ${config.kind}`);
      return [ownerId, adapter];
    }),
  );
}
