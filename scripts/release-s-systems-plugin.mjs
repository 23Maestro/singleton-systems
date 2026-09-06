import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";

const PLUGIN_ID = "s-systems@singleton23-local";
const VERSION_PATTERN = /^(\d+\.\d+\.\d+\+codex\.)(\d{14})$/;
const FRESH_TASK_NOTICE =
  "Plugin updated. This open task still has its startup catalog. Start a fresh task to load the released SSystems skills. If the old version appears, fully quit and reopen Codex.";

export function parseArgs(argv) {
  const result = { dryRun: false, version: null };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--dry-run") result.dryRun = true;
    else if (argument === "--version") {
      const version = argv[index + 1];
      assert.ok(version && !version.startsWith("--"), "--version requires an exact version");
      result.version = version;
      index += 1;
    } else {
      throw new Error(`unknown argument: ${argument}`);
    }
  }
  return result;
}

function pad(value) {
  return String(value).padStart(2, "0");
}

export function localTimestamp(date = new Date()) {
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
    pad(date.getHours()),
    pad(date.getMinutes()),
    pad(date.getSeconds()),
  ].join("");
}

export function manifestFiles(root) {
  return [
    path.join(root, "plugins", "s-systems", ".codex-plugin", "plugin.json"),
    path.join(root, "plugins", "s-systems", ".claude-plugin", "plugin.json"),
    path.join(root, "plugins", "s-systems", ".claude-plugin", "marketplace.json"),
  ];
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

export function readManifestVersions(files) {
  return files.map((file) => {
    const json = readJson(file);
    const version = file.endsWith("marketplace.json") ? json.plugins?.[0]?.version : json.version;
    assert.ok(version, `${file}: missing plugin version`);
    return { file, version };
  });
}

export function assertManifestConsistency(versions) {
  const unique = new Set(versions.map(({ version }) => version));
  assert.equal(unique.size, 1, `plugin manifest versions differ: ${[...unique].join(", ")}`);
  const [current] = unique;
  assert.match(current, VERSION_PATTERN, `invalid current plugin version: ${current}`);
  return current;
}

export function nextVersion(current, requested = null, date = new Date()) {
  const match = current.match(VERSION_PATTERN);
  assert.ok(match, `invalid current plugin version: ${current}`);
  const candidate = requested ?? `${match[1]}${localTimestamp(date)}`;
  const candidateMatch = candidate.match(VERSION_PATTERN);
  assert.ok(candidateMatch, `invalid release version: ${candidate}`);
  assert.equal(candidateMatch[1], match[1], `release must preserve ${match[1]}`);
  assert.ok(candidateMatch[2] > match[2], `release version must be newer than ${current}`);
  return candidate;
}

export function writeManifestVersions(files, version) {
  for (const file of files) {
    const json = readJson(file);
    if (file.endsWith("marketplace.json")) {
      assert.ok(Array.isArray(json.plugins) && json.plugins.length === 1, `${file}: expected one plugin`);
      json.plugins[0].version = version;
    } else {
      json.version = version;
    }
    fs.writeFileSync(file, `${JSON.stringify(json, null, 2)}\n`);
  }
}

export function snapshotFiles(files) {
  return files.map((file) => ({ file, content: fs.readFileSync(file, "utf8") }));
}

export function restoreFiles(snapshots) {
  for (const { file, content } of snapshots) fs.writeFileSync(file, content);
}

function run(command, args, options = {}) {
  const rendered = [command, ...args].join(" ");
  console.log(`\n> ${rendered}`);
  const result = spawnSync(command, args, {
    cwd: options.cwd,
    encoding: "utf8",
    stdio: options.capture ? ["ignore", "pipe", "pipe"] : "inherit",
  });
  if (result.status !== 0) {
    const detail = options.capture ? result.stderr || result.stdout : "";
    throw new Error(`${rendered} failed with exit ${result.status}${detail ? `\n${detail.trim()}` : ""}`);
  }
  return options.capture ? result.stdout : "";
}

function runNpm(root, script) {
  run("npm", ["run", script], { cwd: root });
}

export function assertInstalledPlugin(codexList, expectedVersion) {
  const plugin = codexList.installed?.find(({ pluginId }) => pluginId === PLUGIN_ID);
  assert.ok(plugin, `${PLUGIN_ID} is not installed`);
  assert.equal(plugin.version, expectedVersion, `installed version is ${plugin.version}; expected ${expectedVersion}`);
  assert.equal(plugin.installed, true, `${PLUGIN_ID} is not installed`);
  assert.equal(plugin.enabled, true, `${PLUGIN_ID} is not enabled`);
  return plugin;
}

export function cacheVersions(cacheRoot) {
  if (!fs.existsSync(cacheRoot)) return [];
  return fs
    .readdirSync(cacheRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

export function assertCacheRetention(cacheRoot, currentVersion, versionsBeforeRelease) {
  assert.ok(fs.existsSync(path.join(cacheRoot, currentVersion)), `missing current cache ${currentVersion}`);
  const after = cacheVersions(cacheRoot);
  for (const version of versionsBeforeRelease) {
    assert.ok(after.includes(version), `release removed cache version ${version} referenced by an active task`);
  }
  return after.filter((version) => version !== currentVersion);
}

export function backupCaches(cacheRoot, versions) {
  const backupRoot = fs.mkdtempSync(path.join(os.tmpdir(), "s-systems-cache-backup-"));
  for (const version of versions) {
    const source = path.join(cacheRoot, version);
    if (fs.existsSync(source)) fs.cpSync(source, path.join(backupRoot, version), { recursive: true });
  }
  return backupRoot;
}

export function restoreMissingCaches(cacheRoot, backupRoot, versions) {
  fs.mkdirSync(cacheRoot, { recursive: true });
  for (const version of versions) {
    const destination = path.join(cacheRoot, version);
    const backup = path.join(backupRoot, version);
    if (!fs.existsSync(destination) && fs.existsSync(backup)) fs.cpSync(backup, destination, { recursive: true });
  }
}

function printPlan({ currentVersion, releaseVersion, files, cacheRoot, retained, mirrors }) {
  console.log(`Current version: ${currentVersion}`);
  console.log(`Release version: ${releaseVersion}`);
  console.log("Manifest updates:");
  for (const file of files) console.log(`- ${file}`);
  console.log("Mirror targets:");
  for (const mirror of mirrors) console.log(`- ${mirror}`);
  console.log(`Installed cache: ${path.join(cacheRoot, releaseVersion)}`);
  console.log(`Existing caches retained for active tasks: ${retained.length ? retained.join(", ") : "none"}`);
}

export function main(argv = process.argv.slice(2)) {
  const { dryRun, version: requestedVersion } = parseArgs(argv);
  const root = process.cwd();
  const home = os.homedir();
  const files = manifestFiles(root);
  const versions = readManifestVersions(files);
  const currentVersion = assertManifestConsistency(versions);
  const releaseVersion = nextVersion(currentVersion, requestedVersion);
  const cacheRoot = path.join(home, ".codex", "plugins", "cache", "singleton23-local", "s-systems");
  const releaseCache = path.join(cacheRoot, releaseVersion);
  const existingCaches = cacheVersions(cacheRoot);
  const mirrors = [path.join(home, "plugins", "s-systems"), path.join(home, ".claude", "plugins-dev", "s-systems")];

  assert.ok(!fs.existsSync(releaseCache), `release cache already exists: ${releaseCache}`);

  runNpm(root, "check:agents");
  runNpm(root, "check:skills");
  runNpm(root, "check:cerebral");
  runNpm(root, "check:cerebral:hook-routing");
  runNpm(root, "check:cerebral:registry");
  runNpm(root, "check:drift");
  run("git", ["diff", "--check"], { cwd: root });

  printPlan({ currentVersion, releaseVersion, files, cacheRoot, retained: existingCaches, mirrors });
  if (dryRun) {
    run(process.execPath, [path.join(root, "scripts", "sync-s-systems-mirrors.mjs")], { cwd: root });
    console.log("\nDry run complete. No manifests, mirrors, plugin config, or caches were changed.");
    return;
  }

  const cacheBackup = backupCaches(cacheRoot, existingCaches);
  const manifestSnapshots = snapshotFiles(files);
  try {
    writeManifestVersions(files, releaseVersion);
    run(process.execPath, [path.join(root, "scripts", "sync-s-systems-mirrors.mjs"), "--apply"], { cwd: root });
    run("codex", ["plugin", "add", PLUGIN_ID, "--json"], { cwd: root });
    restoreMissingCaches(cacheRoot, cacheBackup, existingCaches);

    const listOutput = run("codex", ["plugin", "list", "--json"], { cwd: root, capture: true });
    assertInstalledPlugin(JSON.parse(listOutput), releaseVersion);
    runNpm(root, "check:skills:installed");

    const retained = assertCacheRetention(cacheRoot, releaseVersion, existingCaches);
    for (const version of retained) console.log(`retained cache ${version} for active tasks`);
    runNpm(root, "check:skills:installed");
  } catch (error) {
    restoreFiles(manifestSnapshots);
    try {
      run(process.execPath, [path.join(root, "scripts", "sync-s-systems-mirrors.mjs"), "--apply"], { cwd: root });
      if (fs.existsSync(releaseCache)) {
        const rollbackTrash = path.join(home, ".Trash");
        fs.mkdirSync(rollbackTrash, { recursive: true });
        let destination = path.join(rollbackTrash, `s-systems-codex-cache-${releaseVersion}-rollback-${localTimestamp()}`);
        if (fs.existsSync(destination)) destination = `${destination}-1`;
        fs.renameSync(releaseCache, destination);
      }
      run("codex", ["plugin", "add", PLUGIN_ID, "--json"], { cwd: root });
      restoreMissingCaches(cacheRoot, cacheBackup, existingCaches);
      const rollbackList = run("codex", ["plugin", "list", "--json"], { cwd: root, capture: true });
      assertInstalledPlugin(JSON.parse(rollbackList), currentVersion);
      runNpm(root, "check:skills:installed");
    } catch (rollbackError) {
      throw new Error(`${error.message}\nRollback failed: ${rollbackError.message}`, { cause: error });
    }
    throw error;
  } finally {
    if (cacheBackup) fs.rmSync(cacheBackup, { recursive: true, force: true });
  }

  console.log(`\nRelease verified: ${PLUGIN_ID} ${releaseVersion}`);
  console.log(FRESH_TASK_NOTICE);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    main();
  } catch (error) {
    console.error(`\nPlugin release failed: ${error.message}`);
    process.exitCode = 1;
  }
}

export { FRESH_TASK_NOTICE, PLUGIN_ID, VERSION_PATTERN };
