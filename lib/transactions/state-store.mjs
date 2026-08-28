import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const DEFAULT_LOCK_TIMEOUT_MS = 30_000;
const DEFAULT_LOCK_RETRY_MS = 50;

function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function processIsAlive(pid) {
  if (!Number.isInteger(pid) || pid <= 0) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    if (error.code === "ESRCH") return false;
    return true;
  }
}

function removeStaleLock(lockPath) {
  let record;
  try {
    record = JSON.parse(fs.readFileSync(lockPath, "utf8"));
  } catch {
    return false;
  }
  const sameHostDeadProcess = record.hostname === os.hostname() && !processIsAlive(record.pid);
  if (!sameHostDeadProcess) return false;
  try {
    fs.unlinkSync(lockPath);
    return true;
  } catch (error) {
    if (error.code === "ENOENT") return true;
    return false;
  }
}

export function loadTransactionState(file) {
  if (!file || !fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

export function saveTransactionState(file, transaction) {
  if (!file) return null;
  const target = path.resolve(file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  const temporary = `${target}.${process.pid}.tmp`;
  fs.writeFileSync(temporary, `${JSON.stringify(transaction, null, 2)}\n`, { mode: 0o600 });
  fs.renameSync(temporary, target);
  return target;
}

export async function withTransactionStateLock(file, operation, options = {}) {
  if (!file) return operation();
  const target = path.resolve(file);
  const lockPath = `${target}.lock`;
  const timeoutMs = options.timeoutMs ?? DEFAULT_LOCK_TIMEOUT_MS;
  const retryMs = options.retryMs ?? DEFAULT_LOCK_RETRY_MS;
  fs.mkdirSync(path.dirname(target), { recursive: true });
  const deadline = Date.now() + timeoutMs;
  let handle;

  while (!handle) {
    try {
      handle = fs.openSync(lockPath, "wx", 0o600);
      fs.writeFileSync(
        handle,
        `${JSON.stringify({ pid: process.pid, hostname: os.hostname(), acquiredAt: new Date().toISOString() })}\n`,
      );
    } catch (error) {
      if (error.code !== "EEXIST") throw error;
      if (removeStaleLock(lockPath)) continue;
      if (Date.now() >= deadline) throw new Error(`timed out waiting for transaction state lock ${lockPath}`);
      await delay(retryMs);
    }
  }

  try {
    return await operation();
  } finally {
    fs.closeSync(handle);
    try {
      fs.unlinkSync(lockPath);
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
  }
}
