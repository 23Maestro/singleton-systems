#!/usr/bin/env node

import { createWriteStream } from "node:fs";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  statSync,
  truncateSync,
  writeFileSync,
} from "node:fs";
import { pipeline } from "node:stream/promises";
import { Readable } from "node:stream";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { pathToFileURL } from "node:url";

const GRAPHQL_URL = "https://api.frame.io/graphql";

const COLLECTION_QUERY = `
query GetShareCollectionAssets($shareId: ID!, $folderId: ID, $assetType: ChildAssetTypeInput, $page: PageInput!) {
  share(shareId: $shareId) {
    id
    ... on Share {
      collectionAssets(page: $page, assetType: $assetType, folderId: $folderId) {
        nodes { id index __typename }
        totalCount
        pageInfo { hasNextPage endCursor mode __typename }
        __typename
      }
    }
    __typename
  }
}`;

const DOWNLOAD_QUERY = `
query GetAssetsForDownload($assetIds: [ID!]!) {
  assets(assetIds: $assetIds) {
    id
    name
    ... on VideoAsset {
      media {
        id
        original { key downloadUrl filesizeInBytes codec __typename }
        __typename
      }
    }
    ... on AudioAsset {
      media {
        id
        original { key downloadUrl filesizeInBytes codec __typename }
        __typename
      }
    }
    ... on ImageAsset {
      media {
        id
        original { key downloadUrl filesizeInBytes codec __typename }
        __typename
      }
    }
    ... on UnsupportedAsset {
      media {
        id
        original { key downloadUrl filesizeInBytes codec __typename }
        __typename
      }
    }
    __typename
  }
}`;

function parseArgs(argv) {
  const args = { concurrency: 3, dryRun: false };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--share") args.shareId = argv[++i];
    else if (argv[i] === "--folder") args.folderId = argv[++i];
    else if (argv[i] === "--output") args.output = argv[++i];
    else if (argv[i] === "--expected") args.expected = Number(argv[++i]);
    else if (argv[i] === "--limit") args.limit = Number(argv[++i]);
    else if (argv[i] === "--concurrency") args.concurrency = Number(argv[++i]);
    else if (argv[i] === "--dry-run") args.dryRun = true;
  }
  if (!args.shareId || !args.folderId || !args.output) {
    console.error(
      "Usage: frameio-share-download.mjs --share <shareId> --folder <folderId> --output <dir> [--expected N] [--limit N] [--concurrency N] [--dry-run]"
    );
    process.exit(1);
  }
  for (const [name, value] of [
    ["expected", args.expected],
    ["limit", args.limit],
    ["concurrency", args.concurrency],
  ]) {
    if (value !== undefined && (!Number.isInteger(value) || value < 1)) {
      throw new Error(`--${name} must be a positive integer`);
    }
  }
  return args;
}

async function runPool(items, concurrency, worker) {
  let nextIndex = 0;
  const workers = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (nextIndex < items.length) {
      const item = items[nextIndex++];
      await worker(item);
    }
  });
  await Promise.all(workers);
}

function loadState(file) {
  if (!existsSync(file)) return { completed: {} };
  return JSON.parse(readFileSync(file, "utf8"));
}

function saveState(file, state) {
  writeFileSync(file, `${JSON.stringify(state, null, 2)}\n`);
}

function safeFileName(name) {
  const clean = path.basename(name).replace(/[\u0000-\u001f]/g, "_");
  if (!clean || clean === "." || clean === "..") throw new Error(`Unsafe asset name: ${name}`);
  return clean;
}

async function graphql(shareId, operationName, query, variables) {
  const response = await fetch(GRAPHQL_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "apollographql-client-name": "web-app",
      "apollographql-client-version": "@frameio/next-web-app@647.0",
      "x-frameio-session-id": randomUUID(),
      "x-frameio-share-authentication": Buffer.from(shareId).toString("base64"),
      "x-gql-op": operationName,
    },
    body: JSON.stringify({ operationName, variables, query }),
  });
  const responseText = await response.text();
  if (!response.ok) {
    throw new Error(`${operationName} failed: HTTP ${response.status}: ${responseText.slice(0, 600)}`);
  }
  const payload = JSON.parse(responseText);
  if (payload.errors?.length) {
    throw new Error(`${operationName} failed: ${payload.errors.map((error) => error.message).join(", ")}`);
  }
  return payload.data;
}

async function listAssetIds(shareId, folderId) {
  const data = await graphql(shareId, "GetShareCollectionAssets", COLLECTION_QUERY, {
    shareId,
    folderId,
    assetType: "FILE",
    page: { first: 200 },
  });
  const connection = data.share.collectionAssets;
  if (connection.pageInfo.hasNextPage) {
    throw new Error("Folder has more than 200 files; pagination is required before download.");
  }
  return {
    ids: connection.nodes.map((node) => node.id),
    totalBytes: null,
  };
}

async function getDownloadAssets(shareId, ids) {
  const data = await graphql(shareId, "GetAssetsForDownload", DOWNLOAD_QUERY, { assetIds: ids });
  const assets = data.assets ?? [];
  const returnedIds = new Set(assets.map((asset) => asset.id));
  if (assets.length !== ids.length || ids.some((id) => !returnedIds.has(id))) {
    throw new Error(`Frame.io returned ${assets.length} of ${ids.length} requested assets`);
  }
  return assets.map((asset) => ({
    id: asset.id,
    name: safeFileName(asset.name),
    url: asset.media?.original?.downloadUrl,
    size: Number(asset.media?.original?.filesizeInBytes),
  }));
}

function completedAssetIsPresent(record, outputDir) {
  if (!record || !Number.isFinite(record.size)) return false;
  const destination = path.join(outputDir, safeFileName(record.name));
  return existsSync(destination) && statSync(destination).size === record.size;
}

async function downloadAsset(asset, outputDir) {
  if (!asset.url || !Number.isFinite(asset.size)) {
    throw new Error(`Original download is unavailable for ${asset.name}`);
  }

  const destination = path.join(outputDir, asset.name);
  const partial = `${destination}.part`;
  if (existsSync(destination) && statSync(destination).size === asset.size) return destination;

  let offset = existsSync(partial) ? statSync(partial).size : 0;
  if (offset === asset.size) {
    renameSync(partial, destination);
    return destination;
  }
  if (offset > asset.size) {
    truncateSync(partial, 0);
    offset = 0;
  }

  const headers = offset > 0 ? { range: `bytes=${offset}-` } : {};
  let response = await fetch(asset.url, { headers });
  if (offset > 0 && response.status === 200) {
    truncateSync(partial, 0);
    offset = 0;
    response = await fetch(asset.url);
  }
  if (!response.ok || !response.body) {
    throw new Error(`Download failed for ${asset.name}: HTTP ${response.status}`);
  }

  await pipeline(Readable.fromWeb(response.body), createWriteStream(partial, { flags: offset > 0 ? "a" : "w" }));
  const received = statSync(partial).size;
  if (received !== asset.size) {
    throw new Error(`Size mismatch for ${asset.name}: expected ${asset.size}, received ${received}`);
  }
  renameSync(partial, destination);
  return destination;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const outputDir = path.resolve(args.output);
  mkdirSync(outputDir, { recursive: true });
  const stateFile = path.join(outputDir, ".frameio-download-state.json");
  const state = loadState(stateFile);

  const { ids: allIds, totalBytes } = await listAssetIds(args.shareId, args.folderId);
  if (args.expected && allIds.length !== args.expected) {
    throw new Error(`Expected ${args.expected} assets, found ${allIds.length}`);
  }
  const ids = args.limit ? allIds.slice(0, args.limit) : allIds;
  console.log(`Frame.io folder: ${allIds.length} assets, ${totalBytes ?? "unknown"} bytes`);
  if (args.dryRun) return;

  let completedThisRun = 0;
  const destinationOwners = new Map();
  for (const [id, record] of Object.entries(state.completed)) {
    if (!completedAssetIsPresent(record, outputDir)) {
      delete state.completed[id];
      continue;
    }
    const priorOwner = destinationOwners.get(record.name);
    if (priorOwner && priorOwner !== id) {
      throw new Error(`Duplicate destination name in saved state: ${record.name}`);
    }
    destinationOwners.set(record.name, id);
  }
  for (let index = 0; index < ids.length; index += 20) {
    const chunk = ids.slice(index, index + 20).filter((id) => {
      if (completedAssetIsPresent(state.completed[id], outputDir)) return false;
      delete state.completed[id];
      return true;
    });
    if (chunk.length === 0) continue;
    const assets = await getDownloadAssets(args.shareId, chunk);
    for (const asset of assets) {
      const priorOwner = destinationOwners.get(asset.name);
      if (priorOwner && priorOwner !== asset.id) {
        throw new Error(`Duplicate destination name: ${asset.name}`);
      }
      destinationOwners.set(asset.name, asset.id);
    }
    await runPool(assets, args.concurrency, async (asset) => {
      const destination = await downloadAsset(asset, outputDir);
      state.completed[asset.id] = {
        name: asset.name,
        size: asset.size,
        downloadedAt: new Date().toISOString(),
      };
      saveState(stateFile, state);
      completedThisRun += 1;
      console.log(`[${Object.keys(state.completed).length}/${ids.length}] ${path.basename(destination)}`);
    });
  }

  console.log(`Download pass complete: ${completedThisRun} new, ${Object.keys(state.completed).length} recorded.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}

export { downloadAsset };
