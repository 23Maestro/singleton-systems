#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import {
  accessSync,
  constants as fsConstants,
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  realpathSync,
} from "node:fs";
import path from "node:path";

const DEFAULT_ROOT = "/Volumes/HomeSSD/Generated";
const DEFAULT_UUID = "0EB7E204-D359-47B2-B9B1-89B2DC77BC5A";
const DEFAULT_MIN_FREE_BYTES = 50 * 1024 ** 3;
const DEFAULT_DISKUTIL = "/usr/sbin/diskutil";
const VALID_KINDS = new Set([
  "source",
  "audio",
  "renders",
  "previews",
  "references",
]);

class StorageGateError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

function configuration() {
  const root = path.resolve(process.env.STORAGE_GATE_ROOT || DEFAULT_ROOT);
  return {
    root,
    volumeRoot: path.resolve(
      process.env.STORAGE_GATE_VOLUME_ROOT || path.dirname(root),
    ),
    expectedUuid: process.env.STORAGE_GATE_EXPECTED_UUID || DEFAULT_UUID,
    minFreeBytes: Number(
      process.env.STORAGE_GATE_MIN_FREE_BYTES || DEFAULT_MIN_FREE_BYTES,
    ),
    diskutil: process.env.STORAGE_GATE_DISKUTIL || DEFAULT_DISKUTIL,
  };
}

function parseDiskInfo(output) {
  const uuid = output.match(/^\s*Volume UUID:\s*(.+?)\s*$/m)?.[1];
  const freeBytes = output.match(
    /^\s*(?:Container )?Free Space:.*?\((\d+) Bytes\)/m,
  )?.[1];
  const volumeReadOnly = output.match(
    /^\s*Volume Read-Only:\s*(Yes|No)\s*$/im,
  )?.[1];
  const mediaReadOnly = output.match(
    /^\s*Media Read-Only:\s*(Yes|No)\s*$/im,
  )?.[1];

  return {
    uuid,
    freeBytes: freeBytes === undefined ? undefined : Number(freeBytes),
    readOnly:
      volumeReadOnly?.toLowerCase() === "yes" ||
      mediaReadOnly?.toLowerCase() === "yes",
  };
}

function verifyVolume(config = configuration()) {
  if (!existsSync(config.root)) {
    throw new StorageGateError(
      "VOLUME_MISSING",
      `${config.root} is unavailable; refusing an internal-disk fallback`,
    );
  }

  let output;
  try {
    output = execFileSync(config.diskutil, ["info", config.volumeRoot], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
  } catch (error) {
    throw new StorageGateError(
      "VOLUME_UNVERIFIED",
      `could not verify ${config.volumeRoot}: ${error.message}`,
    );
  }

  const info = parseDiskInfo(output);
  if (info.uuid !== config.expectedUuid) {
    throw new StorageGateError(
      "WRONG_VOLUME",
      `expected HomeSSD UUID ${config.expectedUuid}, found ${info.uuid || "none"}`,
    );
  }
  assertWithinPhysicalRoot(config.root, config.volumeRoot);
  if (info.readOnly) {
    throw new StorageGateError(
      "VOLUME_READ_ONLY",
      `${config.root} is mounted read-only`,
    );
  }

  try {
    accessSync(config.root, fsConstants.W_OK);
  } catch {
    throw new StorageGateError(
      "VOLUME_READ_ONLY",
      `${config.root} is not writable`,
    );
  }

  if (!Number.isFinite(info.freeBytes)) {
    throw new StorageGateError(
      "FREE_SPACE_UNVERIFIED",
      `could not determine free space for ${config.root}`,
    );
  }
  if (info.freeBytes < config.minFreeBytes) {
    throw new StorageGateError(
      "INSUFFICIENT_SPACE",
      `${config.root} has ${info.freeBytes} bytes free; ${config.minFreeBytes} required`,
    );
  }

  return config;
}

function normalizeClient(value) {
  const normalized = String(value || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return normalized || "_INBOX";
}

function parseArgs(args) {
  const parsed = {};
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (!arg.startsWith("--")) continue;
    const equals = arg.indexOf("=");
    if (equals >= 0) {
      parsed[arg.slice(2, equals)] = arg.slice(equals + 1);
      continue;
    }
    parsed[arg.slice(2)] = args[index + 1];
    index += 1;
  }
  return parsed;
}

function route(args) {
  const options = parseArgs(args);
  const kind = String(options.kind || "").toLowerCase();
  if (!VALID_KINDS.has(kind)) {
    throw new StorageGateError(
      "INVALID_KIND",
      `kind must be one of: ${[...VALID_KINDS].join(", ")}`,
    );
  }

  const config = verifyVolume();
  const destination = path.join(config.root, normalizeClient(options.client), kind);
  assertWithinPhysicalRoot(destination, config.root);
  mkdirSync(destination, { recursive: true });
  process.stdout.write(`${destination}\n`);
}

function readStdin() {
  return readFileSync(0, "utf8");
}

function extractOption(command, option) {
  const escaped = option.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = command.match(
    new RegExp(`(?:^|\\s)--${escaped}(?:=|\\s+)(?:"([^"]+)"|'([^']+)'|([^\\s]+))`),
  );
  return match?.[1] ?? match?.[2] ?? match?.[3];
}

function rewriteOption(command, option, value) {
  const escaped = option.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(
    `(^|\\s)--${escaped}(?:=|\\s+)(?:"[^"]*"|'[^']*'|[^\\s]+)`,
  );
  if (pattern.test(command)) {
    return command.replace(
      pattern,
      (_match, prefix) => `${prefix}--${option} "${value}"`,
    );
  }
  return `${command} --${option} "${value}"`;
}

function isWithin(candidate, parent) {
  const relative = path.relative(parent, candidate);
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

function physicalPath(candidate, cwd = process.cwd()) {
  // Preserve .. until realpath resolves it: a preceding symlink changes its meaning.
  let existing = path.isAbsolute(candidate) ? candidate : `${cwd}${path.sep}${candidate}`;
  const missing = [];
  while (true) {
    try {
      lstatSync(existing);
    } catch (error) {
      if (error.code !== "ENOENT" || existing === path.dirname(existing)) {
        throw new StorageGateError("UNSAFE_PATH", `cannot inspect ${candidate}: ${error.message}`);
      }
      missing.unshift(path.basename(existing));
      existing = path.dirname(existing);
      continue;
    }
    try {
      return path.join(realpathSync.native(existing), ...missing);
    } catch (error) {
      throw new StorageGateError("UNSAFE_PATH", `cannot resolve ${candidate}: ${error.message}`);
    }
  }
}

function assertWithinPhysicalRoot(candidate, root, cwd) {
  if (!isWithin(physicalPath(candidate, cwd), physicalPath(root))) {
    throw new StorageGateError("UNSAFE_PATH", `${candidate} resolves outside ${root}`);
  }
}

function isAllowedRenderOutput(outputPath, cwd, root) {
  if (!outputPath) return false;
  const absolute = path.resolve(cwd, outputPath);
  if (!isWithin(absolute, root)) return false;
  const parts = path.relative(root, absolute).split(path.sep);
  return parts.length >= 3 && parts[0] !== "hyperframes" && parts[1] === "renders";
}

function denyHook(reason) {
  process.stdout.write(
    `${JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "deny",
        permissionDecisionReason: reason,
      },
    })}\n`,
  );
}

function hook() {
  let payload;
  try {
    payload = JSON.parse(readStdin());
  } catch {
    return;
  }

  const toolName = payload.tool_name || payload.toolName || "";
  const command = payload.tool_input?.command || payload.toolInput?.command || "";
  if (!/bash/i.test(toolName) || !/\bhyperframes(?:@[^\s]+)?\s+render\b/.test(command)) {
    return;
  }

  const config = verifyVolume();
  const cwd = payload.cwd || process.cwd();
  const output = extractOption(command, "output");
  const framesCache = extractOption(command, "frames-cache-dir");
  const allowedCache = path.join(
    config.root,
    "hyperframes",
    "cache",
    "extracted-frames",
  );
  const cacheValid =
    framesCache && path.resolve(cwd, framesCache) === path.resolve(allowedCache);

  if (isAllowedRenderOutput(output, cwd, config.root) && cacheValid) {
    assertWithinPhysicalRoot(output, config.root, cwd);
    assertWithinPhysicalRoot(framesCache, config.root, cwd);
    return;
  }

  const correctedOutput = path.join(
    config.root,
    "_INBOX",
    "renders",
    path.basename(output || "render.mp4"),
  );
  const correctedCommand = rewriteOption(
    rewriteOption(command, "output", correctedOutput),
    "frames-cache-dir",
    allowedCache,
  );
  denyHook(
    `Storage Gate denied an internal or unclassified HyperFrames destination. Corrected command: ${correctedCommand}. Resolve a named client first with npm run storage:gate -- route --client "<name>" --kind renders.`,
  );
}

function main() {
  const [command, ...args] = process.argv.slice(2);
  try {
    if (command === "route") route(args);
    else if (command === "hook") hook();
    else {
      throw new StorageGateError(
        "USAGE",
        'use "storage-gate.mjs route --client <name> --kind <kind>" or "storage-gate.mjs hook"',
      );
    }
  } catch (error) {
    if (command === "hook" && error instanceof StorageGateError) {
      denyHook(`Storage Gate denied this HyperFrames render. ${error.code}: ${error.message}`);
      return;
    }
    const code = error instanceof StorageGateError ? error.code : "STORAGE_GATE_ERROR";
    process.stderr.write(`${code}: ${error.message}\n`);
    process.exitCode = 2;
  }
}

main();
