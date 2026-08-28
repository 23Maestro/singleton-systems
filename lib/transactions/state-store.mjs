import fs from "node:fs";
import path from "node:path";

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
