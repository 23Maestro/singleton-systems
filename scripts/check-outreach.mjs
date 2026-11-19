import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = path.join(root, "skills/outreach");

function markdownFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? markdownFiles(file) : entry.name.endsWith(".md") ? [file] : [];
  });
}

// Every local module link must still resolve after installation as one folder.
for (const file of markdownFiles(source)) {
  const text = fs.readFileSync(file, "utf8");
  for (const [, target] of text.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
    if (/^(https?:|#)/.test(target)) continue;
    const resolved = path.resolve(path.dirname(file), target.split("#")[0]);
    assert.ok(resolved.startsWith(`${source}${path.sep}`), `${file}: module link escapes the source: ${target}`);
    assert.ok(fs.existsSync(resolved), `${file}: missing module ${target}`);
  }
}

if (process.argv.includes("--installed")) {
  const entries = new Map([
    ["outreach", source],
    ["gift", path.join(source, "references/gift-entry")],
  ]);
  for (const [name, expected] of entries) {
    const installed = path.join(os.homedir(), ".codex/skills", name);
    assert.ok(fs.lstatSync(installed).isSymbolicLink(), `${name}: replace the duplicate policy with a source entry`);
    assert.equal(fs.realpathSync(installed), fs.realpathSync(expected), `${name}: entry points to a different source`);
  }
  console.log("Outreach and Gift resolve to the versioned source.");
}
console.log("Outreach module links pass.");
