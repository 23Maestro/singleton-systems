import { execFile } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { mkdir, realpath, stat } from "node:fs/promises";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import { isOpenverseId, openversePreview, searchOpenverse } from "./providers/openverse.mjs";

const execFileAsync = promisify(execFile);
const HERE = path.dirname(fileURLToPath(import.meta.url));
const EAGLE_BASE = process.env.EAGLE_API_BASE || "http://127.0.0.1:41595";
const HOST = "127.0.0.1";
const PORT = Number(process.env.LINEUPS_ROLODEX_PORT || 41723);
const LINEUPS_FOLDER_ID = "MSI0D9BAOCVEH";
const CACHE_DIR = path.join(os.tmpdir(), "lineups-nfl-rolodex-cache");
const ALLOWED_ORIGINS = new Set(["null", "https://www.figma.com", "https://figma.com"]);
const IMAGE_EXTENSIONS = new Set(["jpg", "jpeg", "png", "gif"]);

const identificationManifest = JSON.parse(
  readFileSync(path.join(HERE, "metadata", "identification-manifest.json"), "utf8"),
);
const proofIndex = JSON.parse(readFileSync(path.join(HERE, "metadata", "proof-index.json"), "utf8"));
const metadataEntries = [...identificationManifest, ...proofIndex];

let libraryCache = null;

export function normalize(value) {
  return String(value ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function metadataHaystack(entry) {
  return normalize([
    entry.eagleId,
    entry.currentName,
    entry.proposedPersonName,
    entry.team,
    entry.role,
    entry.position,
    entry.imageContext,
    ...(entry.aliases || []),
  ].join(" "));
}

export function matchesMetadata(entry, query) {
  const tokens = normalize(query).split(" ").filter(Boolean);
  const haystack = metadataHaystack(entry);
  return tokens.length > 0 && tokens.every((token) => haystack.includes(token));
}

export function isSafeItemId(value) {
  return /^[A-Z0-9]{8,32}$/.test(value);
}

export function isAllowedOrigin(origin) {
  return !origin || ALLOWED_ORIGINS.has(origin);
}

async function eagleJson(resource) {
  const response = await fetch(`${EAGLE_BASE}${resource}`);
  const payload = await response.json();
  if (!response.ok || payload.status !== "success") {
    throw new Error(payload.message || `Eagle returned ${response.status}`);
  }
  return payload.data;
}

function findFolder(folders, id) {
  for (const folder of folders) {
    if (folder.id === id) return folder;
    const child = findFolder(folder.children || [], id);
    if (child) return child;
  }
  return null;
}

function folderIds(folder, result = new Set()) {
  if (!folder) return result;
  result.add(folder.id);
  for (const child of folder.children || []) folderIds(child, result);
  return result;
}

async function libraryContext() {
  if (libraryCache) return libraryCache;
  const info = await eagleJson("/api/library/info");
  const root = await realpath(info.library.path);
  const lineups = findFolder(info.folders || [], LINEUPS_FOLDER_ID);
  if (!lineups) throw new Error("The LineUps Eagle folder is unavailable.");
  libraryCache = { root, allowedFolderIds: folderIds(lineups) };
  return libraryCache;
}

async function liveItem(itemId) {
  if (!isSafeItemId(itemId)) throw new Error("Invalid Eagle item ID.");
  return eagleJson(`/api/item/info?id=${encodeURIComponent(itemId)}`);
}

function publicItem(item, metadata = null) {
  return {
    id: item.id,
    currentName: item.name,
    person: metadata?.proposedPersonName || item.name,
    team: metadata?.team || "Unidentified team",
    role: metadata?.role || "needs identification",
    position: metadata?.position || "Unidentified position",
    imageContext: metadata?.imageContext || "Unidentified image context",
    sourceUrl: metadata?.sourceUrl || item.url || null,
    confidence: metadata?.confidence ?? 0,
    needsReview: metadata?.needsReview ?? true,
    previewUrl: `/api/items/${item.id}/preview`,
  };
}

async function searchItems(query) {
  const { allowedFolderIds } = await libraryContext();
  const metadataMatches = metadataEntries.filter((entry) => matchesMetadata(entry, query));
  const keywordItems = await eagleJson(
    `/api/item/list?keyword=${encodeURIComponent(query)}&limit=50&offset=0`,
  );
  const merged = new Map();

  for (const item of keywordItems) {
    if (!item.folders?.some((folderId) => allowedFolderIds.has(folderId))) continue;
    const metadata = metadataEntries.find((entry) => entry.eagleId === item.id) || null;
    merged.set(item.id, publicItem(item, metadata));
  }

  for (const metadata of metadataMatches) {
    try {
      const item = await liveItem(metadata.eagleId);
      if (!item.folders?.some((folderId) => allowedFolderIds.has(folderId))) continue;
      merged.set(item.id, publicItem(item, metadata));
    } catch {
      // A stale sidecar row is omitted. Eagle remains the authority for file existence.
    }
  }

  return [...merged.values()].sort((left, right) => {
    if (left.needsReview !== right.needsReview) return Number(left.needsReview) - Number(right.needsReview);
    return right.confidence - left.confidence || left.person.localeCompare(right.person);
  });
}

async function needsIdentificationItems() {
  const entries = metadataEntries.filter((entry) => entry.needsReview);
  const items = [];
  for (const metadata of entries) {
    try {
      items.push(publicItem(await liveItem(metadata.eagleId), metadata));
    } catch {
      // Ignore removed Eagle items.
    }
  }
  return items;
}

async function checkedLibraryPath(candidate) {
  const { root } = await libraryContext();
  const resolved = await realpath(candidate);
  if (resolved !== root && !resolved.startsWith(`${root}${path.sep}`)) {
    throw new Error("Eagle returned a path outside the active library.");
  }
  return resolved;
}

async function thumbnailPath(itemId) {
  const encodedPath = await eagleJson(`/api/item/thumbnail?id=${encodeURIComponent(itemId)}`);
  return checkedLibraryPath(decodeURI(encodedPath));
}

async function originalPath(item) {
  const { root } = await libraryContext();
  const candidate = path.join(root, "images", `${item.id}.info`, `${item.name}.${item.ext}`);
  return checkedLibraryPath(candidate);
}

function mimeFromHeader(buffer, fallback = "application/octet-stream") {
  if (buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "image/png";
  if (buffer[0] === 0xff && buffer[1] === 0xd8) return "image/jpeg";
  if (buffer.subarray(0, 3).toString("ascii") === "GIF") return "image/gif";
  if (buffer.subarray(0, 4).toString("ascii") === "RIFF") return "image/webp";
  return fallback;
}

async function figmaImagePath(item) {
  const input = await originalPath(item);
  const ext = String(item.ext).toLowerCase();
  if (IMAGE_EXTENSIONS.has(ext) && item.width <= 4096 && item.height <= 4096) {
    return { file: input, contentType: ext === "jpg" || ext === "jpeg" ? "image/jpeg" : `image/${ext}` };
  }

  await mkdir(CACHE_DIR, { recursive: true });
  const inputStat = await stat(input);
  const cacheFile = path.join(CACHE_DIR, `${item.id}-${Math.trunc(inputStat.mtimeMs)}.png`);
  if (!existsSync(cacheFile)) {
    await execFileAsync("/usr/bin/sips", ["-s", "format", "png", "-Z", "4096", input, "--out", cacheFile]);
  }
  return { file: cacheFile, contentType: "image/png" };
}

function applyCors(request, response) {
  const origin = request.headers.origin;
  if (!isAllowedOrigin(origin)) return false;
  response.setHeader("Vary", "Origin");
  if (origin) response.setHeader("Access-Control-Allow-Origin", origin);
  response.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");
  return true;
}

function json(response, statusCode, payload) {
  response.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
  response.end(JSON.stringify(payload));
}

async function sendImage(response, file, contentType = null) {
  const handle = readFileSync(file);
  response.writeHead(200, {
    "Content-Type": contentType || mimeFromHeader(handle),
    "Content-Length": handle.byteLength,
    "Cache-Control": "private, max-age=300",
  });
  response.end(handle);
}

function sendImageBytes(response, bytes, contentType) {
  response.writeHead(200, {
    "Content-Type": contentType,
    "Content-Length": bytes.byteLength,
    "Cache-Control": "private, max-age=300",
  });
  response.end(bytes);
}

export async function handleRequest(request, response) {
  if (!applyCors(request, response)) {
    json(response, 403, { error: "Origin is not allowed." });
    return;
  }
  if (request.method === "OPTIONS") {
    response.writeHead(204);
    response.end();
    return;
  }
  if (request.method !== "GET") {
    json(response, 405, { error: "Only GET requests are supported." });
    return;
  }

  const url = new URL(request.url || "/", `http://${HOST}:${PORT}`);
  if (url.pathname === "/health") {
    const app = await eagleJson("/api/application/info");
    json(response, 200, { ok: true, eagleVersion: app.version, lineupsFolderId: LINEUPS_FOLDER_ID });
    return;
  }
  if (url.pathname === "/api/search") {
    const query = url.searchParams.get("q")?.trim() || "";
    if (!query) return json(response, 400, { error: "Enter a search term." });
    json(response, 200, { items: await searchItems(query) });
    return;
  }
  if (url.pathname === "/api/needs-identification") {
    json(response, 200, { items: await needsIdentificationItems() });
    return;
  }
  if (url.pathname === "/api/acquisition/openverse") {
    const query = url.searchParams.get("q")?.trim() || "";
    if (!query) return json(response, 400, { error: "Enter a player or coach name." });
    const result = await searchOpenverse({
      query,
      team: url.searchParams.get("team") || "",
      role: url.searchParams.get("role") || "",
      limit: url.searchParams.get("limit") || 12,
    });
    json(response, 200, result);
    return;
  }

  const openverseMatch = url.pathname.match(
    /^\/api\/acquisition\/openverse\/([0-9a-f-]+)\/preview$/i,
  );
  if (openverseMatch) {
    if (!isOpenverseId(openverseMatch[1])) return json(response, 400, { error: "Invalid Openverse image ID." });
    const preview = await openversePreview(openverseMatch[1]);
    sendImageBytes(response, preview.bytes, preview.contentType);
    return;
  }

  const match = url.pathname.match(/^\/api\/items\/([A-Z0-9]+)\/(preview|image)$/);
  if (!match || !isSafeItemId(match[1])) {
    json(response, 404, { error: "Route not found." });
    return;
  }
  const [, itemId, mode] = match;
  const item = await liveItem(itemId);
  if (mode === "preview") {
    const file = await thumbnailPath(itemId);
    await sendImage(response, file);
    return;
  }
  const image = await figmaImagePath(item);
  await sendImage(response, image.file, image.contentType);
}

export function startServer() {
  const server = http.createServer((request, response) => {
    handleRequest(request, response).catch((error) => {
      if (!response.headersSent) json(response, 500, { error: error instanceof Error ? error.message : String(error) });
      else response.destroy(error);
    });
  });
  server.listen(PORT, HOST, () => {
    process.stdout.write(`Lineups NFL Rolodex bridge: http://${HOST}:${PORT}\n`);
  });
  return server;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) startServer();
