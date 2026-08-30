#!/usr/bin/env node
// Generalized per-client Eagle auto-ingest + auto-rename pipeline.
// Jacob Hill (clients/jacob-hill.json) is the first hardened test case -
// this script is written so any client is just a new clients/<slug>.json
// plus a references/<slug>-skills.jsonl, no code changes.
//
// Pipeline per job: pull new source files (local dir or a client's Drive
// intake folder) -> ingest into the job's Eagle folder -> categorize each
// new item against the client's ranked skills list -> rename
// <CLIENTCODE><JOBCODE><NN>_<topic> in priority order.
//
// Usage:
//   node client-auto-ingest.mjs --client <slug> [--job "<jobName>"] [--local-dir <dir>] [--apply]
//
// Dry run by default. Nothing is ingested or renamed until --apply.
// Items that don't match any keyword are listed under UNMATCHED and never
// auto-renamed - inspect and categorize those by hand.
// Drive is read-only: files are downloaded, never written back or deleted.

import { execFileSync } from "node:child_process";
import {
  readFileSync,
  existsSync,
  mkdirSync,
  writeFileSync,
  readdirSync,
  statSync,
  unlinkSync,
} from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";
import os from "node:os";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const EAGLE_CLI = path.join(__dirname, "eagle-api-cli.js");
const CLIENTS_DIR = path.join(__dirname, "..", "clients");
const REFERENCES_DIR = path.join(__dirname, "..", "references");
const STATE_DIR = path.join(os.homedir(), ".eagle-ingest-state");

function expandHome(p) {
  return p.startsWith("~") ? path.join(os.homedir(), p.slice(1)) : p;
}

function callEagle(tool, args) {
  const out = execFileSync(
    "node",
    [EAGLE_CLI, "call", tool, "--json", JSON.stringify(args)],
    { encoding: "utf8" }
  );
  return JSON.parse(out);
}

function callGws(method, params, extraArgs = [], options = {}) {
  return execFileSync(
    "gws",
    [...method, "--params", JSON.stringify(params), ...extraArgs],
    { encoding: "utf8", ...options }
  );
}

function listDriveFolder(folderId) {
  const output = callGws(
    ["drive", "files", "list"],
    {
      q: `'${folderId}' in parents and trashed = false`,
      fields: "nextPageToken,files(id,name,mimeType,modifiedTime,size)",
      pageSize: 200,
    },
    ["--page-all"]
  );
  return output
    .trim()
    .split("\n")
    .filter(Boolean)
    .flatMap((line) => JSON.parse(line).files ?? []);
}

function downloadDriveFile(fileId, destination) {
  const destinationDir = path.dirname(destination);
  callGws(
    ["drive", "files", "get"],
    { fileId, alt: "media" },
    ["--output", path.basename(destination)],
    { cwd: destinationDir }
  );
}

function loadClient(slug) {
  const file = path.join(CLIENTS_DIR, `${slug}.json`);
  if (!existsSync(file)) {
    console.error(`No client config at ${file}`);
    process.exit(1);
  }
  return JSON.parse(readFileSync(file, "utf8"));
}

function loadSkills(skillsFile) {
  if (!skillsFile) return [];
  const file = path.join(REFERENCES_DIR, skillsFile);
  return readFileSync(file, "utf8")
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line))
    .sort((a, b) => a.rank - b.rank);
}

function loadState(clientSlug) {
  const file = path.join(STATE_DIR, `${clientSlug}.json`);
  if (!existsSync(file)) return { processed: {}, observed: {} };
  return JSON.parse(readFileSync(file, "utf8"));
}

function saveState(clientSlug, state) {
  mkdirSync(STATE_DIR, { recursive: true });
  writeFileSync(path.join(STATE_DIR, `${clientSlug}.json`), JSON.stringify(state, null, 2));
}

function normalizeTopic(rawName) {
  let name = rawName.trim();
  name = name.replace(/^\d+\s+/, "");
  const takeMatch = name.match(/\((\d+)\)\s*$/);
  const take = takeMatch ? `-${takeMatch[1]}` : "";
  name = name.replace(/\(\d+\)\s*$/, "");
  name = name
    .replace(/\+/g, " ")
    .replace(/\.[a-zA-Z0-9]+$/, "") // strip extension if present
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return name + take;
}

function walkFiles(root) {
  if (!existsSync(root)) return [];
  return readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name.startsWith(".")) return [];
    const entryPath = path.join(root, entry.name);
    return entry.isDirectory() ? walkFiles(entryPath) : [entryPath];
  });
}

function processedEntry(state, jobStateKey, sourcePath) {
  const processed = state.processed?.[jobStateKey] ?? [];
  if (Array.isArray(processed)) return processed.includes(sourcePath) ? { legacy: true } : null;
  return processed[sourcePath] ?? null;
}

function markProcessed(state, jobStateKey, sourcePath, details) {
  state.processed ??= {};
  const current = state.processed[jobStateKey];
  if (!current || Array.isArray(current)) state.processed[jobStateKey] = {};
  state.processed[jobStateKey][sourcePath] = details;
  if (state.observed?.[jobStateKey]) delete state.observed[jobStateKey][sourcePath];
}

function eagleFileName(item) {
  return item.ext ? `${item.name}.${item.ext}` : item.name;
}

function matchingEagleItems(items, source) {
  const expectedName = path.basename(source.path).toLowerCase();
  return items.filter(
    (item) =>
      eagleFileName(item).toLowerCase() === expectedName &&
      Number(item.size) === Number(source.size)
  );
}

function listFolderItems(folderId) {
  return callEagle("item_get", {
    folders: [folderId],
    fullDetails: true,
    limit: 1000,
  }).data ?? [];
}

function deleteVerifiedStagingFile(source, localDir) {
  const root = path.resolve(localDir);
  const target = path.resolve(source.path);
  if (!target.startsWith(`${root}${path.sep}`)) {
    throw new Error(`Refusing to remove staging file outside watch root: ${target}`);
  }
  unlinkSync(target);
}

function categorize(rawName, skills) {
  const haystack = rawName.toLowerCase().replace(/\+/g, " ");
  for (const skill of skills) {
    if (skill.keywords.some((kw) => haystack.includes(kw))) return skill;
  }
  return null;
}

function parseArgs(argv) {
  const args = { apply: false };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--client") args.client = argv[++i];
    else if (argv[i] === "--job") args.job = argv[++i];
    else if (argv[i] === "--local-dir") args.localDir = argv[++i];
    else if (argv[i] === "--apply") args.apply = true;
  }
  if (!args.client) {
    console.error(
      'Usage: node client-auto-ingest.mjs --client <slug> [--job "<jobName>"] [--local-dir <dir>] [--apply]'
    );
    process.exit(1);
  }
  return args;
}

function gatherSourceFiles(job, client, opts, state, jobStateKey) {
  const configuredLocalDir = opts.localDir ?? job.localDir;

  if (configuredLocalDir) {
    const localDir = expandHome(configuredLocalDir);
    const allowedExtensions = (job.extensions ?? []).map((ext) => ext.toLowerCase());
    const requiredStablePasses = job.requireStablePasses ?? 1;
    state.observed ??= {};
    state.observed[jobStateKey] ??= {};

    const candidates = walkFiles(localDir)
      .filter((file) => statSync(file).isFile())
      .filter((file) => {
        const name = path.basename(file).toLowerCase();
        if (name.endsWith(".crdownload") || name.endsWith(".download") || name.endsWith(".part")) {
          return false;
        }
        if (allowedExtensions.length === 0) return true;
        return allowedExtensions.includes(path.extname(file).slice(1).toLowerCase());
      })
      .filter((file) => !processedEntry(state, jobStateKey, path.resolve(file)));

    const stable = [];
    for (const file of candidates) {
      const resolved = path.resolve(file);
      const stats = statSync(resolved);
      const previous = state.observed[jobStateKey][resolved];
      const unchanged = previous?.size === stats.size && previous?.mtimeMs === stats.mtimeMs;
      const stablePasses = unchanged ? previous.stablePasses + 1 : 1;
      state.observed[jobStateKey][resolved] = {
        size: stats.size,
        mtimeMs: stats.mtimeMs,
        stablePasses,
        lastSeenAt: new Date().toISOString(),
      };
      if (stablePasses >= requiredStablePasses) {
        stable.push({
          kind: "local",
          path: resolved,
          stateId: resolved,
          name: path.basename(resolved),
          size: stats.size,
          mtimeMs: stats.mtimeMs,
          localDir,
        });
      }
    }

    const batchSize = job.batchSize ?? stable.length;
    return stable.slice(0, batchSize);
  }

  const driveFolderId = job.driveFolderId ?? client.driveFolderId;
  if (!driveFolderId) {
    console.log("  No --local-dir and no driveFolderId configured - nothing to pull.");
    return [];
  }

  const files = listDriveFolder(driveFolderId);
  const newFiles = files.filter((f) => !processedEntry(state, jobStateKey, f.id));
  if (newFiles.length === 0) return [];

  const stagingDir = path.join(expandHome(client.stagingDir), job.jobCode);
  mkdirSync(stagingDir, { recursive: true });

  return newFiles.map((f) => {
    const dest = path.join(stagingDir, f.name);
    return { kind: "drive", fileId: f.id, dest, stateId: f.id, name: f.name };
  });
}

function main() {
  const opts = parseArgs(process.argv.slice(2));
  const client = loadClient(opts.client);

  const appInfo = callEagle("get_app_info", {});
  const libraryPath = appInfo?.data?.libraryPath ?? "";
  if (!libraryPath.endsWith(client.eagleLibrary)) {
    console.error(
      `Refusing to run: Eagle library is "${libraryPath}", client "${client.clientSlug}" expects it to end with "${client.eagleLibrary}". Confirm the correct library is open before mutating.`
    );
    process.exit(1);
  }

  const state = loadState(client.clientSlug);
  state.processed ??= {};
  state.observed ??= {};

  const jobEntries = Object.entries(client.jobs)
    .filter(([name]) => !opts.job || name === opts.job)
    .filter(([, job]) => job.ingest !== false);

  for (const [jobName, job] of jobEntries) {
    const jobStateKey = `${client.clientSlug}:${job.jobCode}`;
    console.log(`\n=== ${client.clientSlug} / ${jobName} (${job.jobCode}) ===`);

    if (job.ingestMode === "source-preserve" && !(opts.localDir ?? job.localDir)) {
      console.error("  source-preserve requires a local source directory; Drive sources are unsupported.");
      continue;
    }

    const sourceFiles = gatherSourceFiles(job, client, opts, state, jobStateKey);
    if (sourceFiles.length === 0) {
      console.log("  Nothing new to ingest.");
      continue;
    }

    console.log(`  ${sourceFiles.length} new source file(s) found.`);
    for (const f of sourceFiles) console.log(`    - ${f.name}`);

    if (!opts.apply) {
      console.log("  Dry run only. Re-run with --apply to download/ingest/rename these.");
      continue;
    }

    // Download Drive sources first.
    for (const f of sourceFiles) {
      if (f.kind === "drive") {
        downloadDriveFile(f.fileId, f.dest);
        f.path = f.dest;
      }
    }

    if (job.ingestMode === "source-preserve") {
      let folderItems = listFolderItems(job.eagleFolderId);
      const missing = [];

      for (const source of sourceFiles) {
        const matches = matchingEagleItems(folderItems, source);
        if (matches.length === 0) {
          missing.push(source);
          continue;
        }
        if (matches.length > 1) {
          console.error(`  Ambiguous Eagle readback; staging file retained: ${source.name}`);
          continue;
        }
        const [existing] = matches;
        console.log(`  Already verified in Eagle: ${source.name}`);
        if (job.cleanupAfterVerified && existsSync(source.path)) {
          deleteVerifiedStagingFile(source, source.localDir);
        }
        markProcessed(state, jobStateKey, source.stateId, {
          size: source.size,
          mtimeMs: source.mtimeMs,
          eagleItemId: existing.id,
          verifiedAt: new Date().toISOString(),
        });
      }

      if (missing.length > 0) {
        callEagle("item_add", {
          folders: [job.eagleFolderId],
          tags: job.tags ?? [],
          annotation: job.annotation ?? "",
          items: missing.map((source) => ({
            name: path.parse(source.name).name,
            source: { type: "path", path: source.path },
          })),
        });

        for (let attempt = 0; attempt < 4; attempt++) {
          folderItems = listFolderItems(job.eagleFolderId);
          if (missing.every((source) => matchingEagleItems(folderItems, source).length === 1)) break;
          Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 750);
        }

        for (const source of missing) {
          const matches = matchingEagleItems(folderItems, source);
          if (matches.length !== 1) {
            console.error(`  Verification failed; staging file retained: ${source.name}`);
            continue;
          }
          const [imported] = matches;
          console.log(`  Verified in Eagle: ${source.name} -> ${imported.id}`);
          if (job.cleanupAfterVerified && existsSync(source.path)) {
            deleteVerifiedStagingFile(source, source.localDir);
          }
          markProcessed(state, jobStateKey, source.stateId, {
            size: source.size,
            mtimeMs: source.mtimeMs,
            eagleItemId: imported.id,
            verifiedAt: new Date().toISOString(),
          });
        }
      }

      const verifiedCount = listFolderItems(job.eagleFolderId).length;
      console.log(
        `  Source-preserve total: ${verifiedCount}${job.expectedCount ? ` / ${job.expectedCount}` : ""}`
      );
      continue;
    }

    const skills = loadSkills(client.skillsFile);

    // Snapshot the job folder before ingest so we can diff after.
    const before = callEagle("item_get", { folders: [job.eagleFolderId], limit: 1000 });
    const beforeIds = new Set((before.data ?? []).map((i) => i.id));

    callEagle("item_add", {
      folders: [job.eagleFolderId],
      items: sourceFiles.map((f) => ({ source: { type: "path", path: f.path } })),
    });

    const after = callEagle("item_get", { folders: [job.eagleFolderId], limit: 1000 });
    const newItems = (after.data ?? []).filter((i) => !beforeIds.has(i.id));

    console.log(`  Ingested ${newItems.length} item(s). Categorizing...`);

    const byRank = new Map();
    const unmatched = [];
    for (const item of newItems) {
      const skill = categorize(item.name, skills);
      if (!skill) {
        unmatched.push(item);
        continue;
      }
      if (!byRank.has(skill.rank)) byRank.set(skill.rank, []);
      byRank.get(skill.rank).push({ item, skill });
    }

    const ordered = [...byRank.keys()].sort((a, b) => a - b).flatMap((r) => byRank.get(r));
    const existingCount = (before.data ?? []).filter((i) =>
      i.name.startsWith(`${client.clientCode}${job.jobCode}`)
    ).length;

    const renames = ordered.map(({ item, skill }, idx) => {
      const order = String(existingCount + idx + 1).padStart(2, "0");
      const topic = normalizeTopic(item.name);
      return {
        id: item.id,
        proposed: `${client.clientCode}${job.jobCode}${order}_${topic}`,
        category: skill.category,
      };
    });

    if (renames.length > 0) {
      const updateResp = callEagle("item_update", {
        items: renames.map((r) => ({ id: r.id, name: r.proposed })),
      });
      console.log(`  ${updateResp.message}`);
      for (const r of renames) console.log(`    -> ${r.proposed}  [${r.category}]`);
    }

    if (unmatched.length > 0) {
      console.log(`  UNMATCHED (${unmatched.length}) - ingested but NOT renamed, needs manual review:`);
      for (const item of unmatched) console.log(`    - ${item.id}  ${item.name}`);
    }

    const existingProcessed = Array.isArray(state.processed[jobStateKey])
      ? state.processed[jobStateKey]
      : Object.keys(state.processed[jobStateKey] ?? {});
    state.processed[jobStateKey] = [...existingProcessed, ...sourceFiles.map((f) => f.stateId)];
  }

  if (opts.apply) saveState(client.clientSlug, state);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();

export { matchingEagleItems };
