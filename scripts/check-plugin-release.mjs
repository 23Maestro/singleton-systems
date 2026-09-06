import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  assertInstalledPlugin,
  assertCacheRetention,
  backupCaches,
  assertManifestConsistency,
  cacheVersions,
  localTimestamp,
  manifestFiles,
  nextVersion,
  parseArgs,
  readManifestVersions,
  restoreMissingCaches,
  restoreFiles,
  snapshotFiles,
  writeManifestVersions,
} from "./release-s-systems-plugin.mjs";

assert.deepEqual(parseArgs([]), { dryRun: false, version: null });
assert.deepEqual(parseArgs(["--dry-run", "--version", "0.2.1+codex.20260826130000"]), {
  dryRun: true,
  version: "0.2.1+codex.20260826130000",
});
assert.throws(() => parseArgs(["--wat"]), /unknown argument/);
assert.throws(() => parseArgs(["--version"]), /requires an exact version/);

assert.match(localTimestamp(new Date(2026, 7, 26, 13, 4, 5)), /^20260826130405$/);
assert.equal(
  nextVersion("0.2.1+codex.20260826120000", "0.2.1+codex.20260826130000"),
  "0.2.1+codex.20260826130000",
);
assert.throws(
  () => nextVersion("0.2.1+codex.20260826120000", "0.2.1+codex.20260826120000"),
  /must be newer/,
);
assert.throws(
  () => nextVersion("0.2.1+codex.20260826120000", "0.3.0+codex.20260826130000"),
  /must preserve/,
);
assert.throws(() => nextVersion("0.2.1+codex.20260826120000", "bad"), /invalid release version/);

const fixture = fs.mkdtempSync(path.join(os.tmpdir(), "s-systems-release-check-"));
const pluginRoot = path.join(fixture, "plugins", "s-systems");
fs.mkdirSync(path.join(pluginRoot, ".codex-plugin"), { recursive: true });
fs.mkdirSync(path.join(pluginRoot, ".claude-plugin"), { recursive: true });
fs.writeFileSync(
  path.join(pluginRoot, ".codex-plugin", "plugin.json"),
  `${JSON.stringify({ name: "s-systems", version: "0.2.1+codex.20260826120000" }, null, 2)}\n`,
);
fs.writeFileSync(
  path.join(pluginRoot, ".claude-plugin", "plugin.json"),
  `${JSON.stringify({ name: "s-systems", version: "0.2.1+codex.20260826120000" }, null, 2)}\n`,
);
fs.writeFileSync(
  path.join(pluginRoot, ".claude-plugin", "marketplace.json"),
  `${JSON.stringify({ plugins: [{ name: "s-systems", version: "0.2.1+codex.20260826120000" }] }, null, 2)}\n`,
);

const files = manifestFiles(fixture);
const snapshots = snapshotFiles(files);
assert.equal(assertManifestConsistency(readManifestVersions(files)), "0.2.1+codex.20260826120000");
writeManifestVersions(files, "0.2.1+codex.20260826130000");
assert.deepEqual(
  readManifestVersions(files).map(({ version }) => version),
  Array(3).fill("0.2.1+codex.20260826130000"),
);
restoreFiles(snapshots);
assert.deepEqual(
  readManifestVersions(files).map(({ version }) => version),
  Array(3).fill("0.2.1+codex.20260826120000"),
);
writeManifestVersions(files, "0.2.1+codex.20260826130000");

assertInstalledPlugin(
  {
    installed: [
      {
        pluginId: "s-systems@singleton23-local",
        version: "0.2.1+codex.20260826130000",
        installed: true,
        enabled: true,
      },
    ],
  },
  "0.2.1+codex.20260826130000",
);
assert.throws(() => assertInstalledPlugin({ installed: [] }, "0.2.1+codex.20260826130000"), /not installed/);

const cacheRoot = path.join(fixture, "cache");
const current = "0.2.1+codex.20260826130000";
const stale = "0.2.1+codex.20260826120000";
const staleSkill = path.join(cacheRoot, stale, "skills", "job-application-resume", "SKILL.md");
fs.mkdirSync(path.dirname(staleSkill), { recursive: true });
fs.writeFileSync(staleSkill, "---\nname: job-application-resume\n---\n");
fs.mkdirSync(path.join(cacheRoot, current), { recursive: true });
assert.deepEqual(assertCacheRetention(cacheRoot, current, [stale]), [stale]);
assert.ok(fs.existsSync(staleSkill), "release invalidated an active task's absolute skill path");
fs.rmSync(path.join(cacheRoot, stale), { recursive: true, force: true });
assert.throws(() => assertCacheRetention(cacheRoot, current, [stale]), /removed cache version/);
const cacheBackup = backupCaches(cacheRoot, [current]);
fs.rmSync(path.join(cacheRoot, current), { recursive: true, force: true });
restoreMissingCaches(cacheRoot, cacheBackup, [current]);
assert.ok(fs.existsSync(path.join(cacheRoot, current)), "release did not restore an active cache removed by plugin install");
fs.rmSync(cacheBackup, { recursive: true, force: true });

fs.rmSync(fixture, { recursive: true, force: true });
console.log("Plugin release checks passed: arguments, versions, manifests, installed state, and active-task cache retention.");
