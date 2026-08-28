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

function writeLockRecord(handle) {
  fs.writeFileSync(
    handle,
    `${JSON.stringify({ pid: process.pid, hostname: os.hostname(), acquiredAt: new Date().toISOString() })}\n`,
  );
}

function releaseLock(handle, lockPath) {
  let cleanupError = null;
  try {
    fs.closeSync(handle);
  } catch (error) {
    cleanupError = error;
  }
  try {
    fs.unlinkSync(lockPath);
  } catch (error) {
    if (error.code !== "ENOENT" && cleanupError === null) cleanupError = error;
  }
  return cleanupError;
}

function acquireTransactionStateLock(lockPath) {
  const reaperPath = `${lockPath}.reaper`;
  let reaperHandle;
  try {
    reaperHandle = fs.openSync(reaperPath, "wx", 0o600);
  } catch (error) {
    if (error.code === "EEXIST") return null;
    throw error;
  }

  let lockHandle = null;
  let acquisitionError = null;
  try {
    try {
      lockHandle = fs.openSync(lockPath, "wx", 0o600);
    } catch (error) {
      if (error.code !== "EEXIST") throw error;
      let record = null;
      try {
        record = JSON.parse(fs.readFileSync(lockPath, "utf8"));
      } catch {
        record = null;
      }
      const sameHostDeadProcess = record?.hostname === os.hostname() && !processIsAlive(record.pid);
      if (sameHostDeadProcess) {
        try {
          fs.unlinkSync(lockPath);
        } catch (unlinkError) {
          if (unlinkError.code !== "ENOENT") throw unlinkError;
        }
        lockHandle = fs.openSync(lockPath, "wx", 0o600);
      }
    }
    if (lockHandle !== null) writeLockRecord(lockHandle);
  } catch (error) {
    acquisitionError = error;
  } finally {
    const reaperCleanupError = releaseLock(reaperHandle, reaperPath);
    if (acquisitionError === null && reaperCleanupError) acquisitionError = reaperCleanupError;
  }

  if (acquisitionError) {
    if (lockHandle !== null) releaseLock(lockHandle, lockPath);
    throw acquisitionError;
  }
  return lockHandle;
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
    handle = acquireTransactionStateLock(lockPath);
    if (handle) break;
    if (Date.now() >= deadline) throw new Error(`timed out waiting for transaction state lock ${lockPath}`);
    await delay(retryMs);
  }

  let result;
  let operationError = null;
  try {
    result = await operation();
  } catch (error) {
    operationError = error;
  }
  const cleanupError = releaseLock(handle, lockPath);
  if (operationError) throw operationError;
  if (cleanupError) throw cleanupError;
  return result;
}
