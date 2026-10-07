import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { hashValue } from "../transactions/contract.mjs";

// Resolve without writing: Stop must be able to report missing evidence.
export function reviewStatePath(root, config, explicit, home = os.homedir()) {
  if (explicit) return path.resolve(root, explicit);
  const key = hashValue({ root: fs.realpathSync(root), reviewId: config.reviewId, binding: config.completionBinding ?? null });
  return path.join(home, ".local", "state", "singleton-systems", "reviews", `${key}.json`);
}

export function prepareReviewStateDirectory(file, explicit) {
  if (explicit) return; // Preserve the caller's directory policy.
  const directory = path.dirname(file);
  fs.mkdirSync(directory, { recursive: true, mode: 0o700 });
  const stat = fs.lstatSync(directory);
  if (!stat.isDirectory() || stat.isSymbolicLink() || fs.realpathSync(directory) !== directory || (stat.mode & 0o077)) {
    throw new Error("default review state directory must be private and must not use symlinks");
  }
}
