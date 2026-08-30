#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";

const API_URL = "http://127.0.0.1:41596/api/tools/call";
const FIELDS = [
  "sequence_number",
  "premiere_name",
  "original_name",
  "eagle_item_id",
  "media_path",
  "tour",
  "camera",
  "destination_bin",
  "classification",
  "confidence",
  "reason",
  "premiere_item_id",
  "premiere_tree_path",
  "status",
];

function parseArgs(argv) {
  const result = {};
  for (let index = 0; index < argv.length; index += 2) {
    const key = argv[index];
    const value = argv[index + 1];
    if (!key?.startsWith("--") || value === undefined) {
      throw new Error("Usage: build-eagle-premiere-manifest.mjs --spec <file> --output-dir <dir>");
    }
    result[key.slice(2)] = value;
  }
  if (!result.spec || !result["output-dir"]) {
    throw new Error("Both --spec and --output-dir are required");
  }
  return result;
}

async function callEagle(tool, params) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ tool, params }),
  });
  if (!response.ok) {
    throw new Error(`Eagle HTTP ${response.status}: ${await response.text()}`);
  }
  const payload = await response.json();
  if (!payload.success) {
    throw new Error(payload.message || `Eagle ${tool} failed`);
  }
  return payload;
}

function originalName(item) {
  const suffix = item.ext ? `.${item.ext}` : "";
  return item.name.toLowerCase().endsWith(suffix.toLowerCase())
    ? item.name
    : `${item.name}${suffix}`;
}

function csvCell(value) {
  const text = value === null || value === undefined ? "" : String(value);
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

async function fileState(filePath) {
  try {
    const stat = await fs.stat(filePath);
    return stat.isFile() ? "file" : "not-file";
  } catch (error) {
    return error.code === "ENOENT" ? "missing" : `error:${error.code || "unknown"}`;
  }
}

const args = parseArgs(process.argv.slice(2));
const specPath = path.resolve(args.spec);
const outputDir = path.resolve(args["output-dir"]);
const spec = JSON.parse(await fs.readFile(specPath, "utf8"));
const groups = [...(spec.groups || []), ...(spec.excludedGroups || [])];
if (!spec.prefix || groups.length === 0) {
  throw new Error("Spec requires prefix and at least one group");
}

const collator = new Intl.Collator("en", { numeric: true, sensitivity: "base" });
const rows = [];
let sequenceNumber = 0;

for (const group of groups) {
  const payload = await callEagle("item_get", {
    folders: [group.folderId],
    fullDetails: true,
    limit: 1000,
  });
  const items = [...payload.data].sort((a, b) => collator.compare(originalName(a), originalName(b)));
  if (group.expectedCount !== undefined && items.length !== group.expectedCount) {
    throw new Error(`${group.tour}/${group.camera}: expected ${group.expectedCount}, found ${items.length}`);
  }
  for (const item of items) {
    const classification = group.classification || "usable";
    const usable = classification === "usable";
    if (usable) sequenceNumber += 1;
    rows.push({
      sequence_number: usable ? sequenceNumber : "",
      premiere_name: usable
        ? `${spec.prefix}-${String(sequenceNumber).padStart(spec.padding || 3, "0")}`
        : "",
      original_name: originalName(item),
      eagle_item_id: item.id,
      media_path: item.filePath,
      tour: group.tour,
      camera: group.camera,
      destination_bin: usable ? group.destinationBin : "",
      classification,
      confidence: group.confidence || (usable ? "high" : "medium"),
      reason: group.reason || "Eagle folder assignment",
      premiere_item_id: "",
      premiere_tree_path: "",
      status: usable ? "planned" : "excluded",
      _file_state: await fileState(item.filePath),
    });
  }
}

const duplicateValues = (key) => {
  const seen = new Set();
  const duplicates = new Set();
  for (const row of rows) {
    const value = row[key];
    if (!value) continue;
    if (seen.has(value)) duplicates.add(value);
    seen.add(value);
  }
  return [...duplicates];
};

const usableRows = rows.filter((row) => row.classification === "usable");
const validation = {
  total: rows.length,
  usable: usableRows.length,
  excluded: rows.length - usableRows.length,
  missing_paths: rows.filter((row) => row._file_state !== "file").map((row) => ({
    eagle_item_id: row.eagle_item_id,
    media_path: row.media_path,
    state: row._file_state,
  })),
  duplicate_eagle_item_ids: duplicateValues("eagle_item_id"),
  duplicate_media_paths: duplicateValues("media_path"),
  duplicate_premiere_names: duplicateValues("premiere_name"),
  by_group: Object.values(rows.reduce((summary, row) => {
    const key = `${row.tour} | ${row.camera} | ${row.classification}`;
    summary[key] ||= { tour: row.tour, camera: row.camera, classification: row.classification, count: 0 };
    summary[key].count += 1;
    return summary;
  }, {})),
};

const hasErrors = validation.missing_paths.length
  || validation.duplicate_eagle_item_ids.length
  || validation.duplicate_media_paths.length
  || validation.duplicate_premiere_names.length;
if (hasErrors) {
  console.error(JSON.stringify(validation, null, 2));
  process.exitCode = 1;
} else {
  await fs.mkdir(outputDir, { recursive: true });
  const baseName = spec.outputBase || "premiere-ingest-manifest";
  const cleanRows = rows.map(({ _file_state, ...row }) => row);
  await fs.writeFile(path.join(outputDir, `${baseName}.json`), `${JSON.stringify(cleanRows, null, 2)}\n`);
  const csv = [FIELDS.join(","), ...cleanRows.map((row) => FIELDS.map((field) => csvCell(row[field])).join(","))].join("\n");
  await fs.writeFile(path.join(outputDir, `${baseName}.csv`), `${csv}\n`);
  await fs.writeFile(path.join(outputDir, `${baseName}-validation.json`), `${JSON.stringify(validation, null, 2)}\n`);
  console.log(JSON.stringify({ outputDir, baseName, validation }, null, 2));
}
