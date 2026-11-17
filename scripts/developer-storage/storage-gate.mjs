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

const DEFAULT_VOLUME_ROOT = "/Volumes/HomeSSD";
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
const LIBRARY_KINDS = { templates: "Templates", references: "References", deliverables: "Deliverables" };

class StorageGateError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

function configuration(area = "active") {
  if (!["active", "library"].includes(area)) {
    throw new StorageGateError("INVALID_AREA", "area must be active or library; Generated accepts no new work");
  }
  const volumeRoot = path.resolve(process.env.STORAGE_GATE_VOLUME_ROOT || DEFAULT_VOLUME_ROOT);
  const activeRoot = path.resolve(process.env.STORAGE_GATE_ROOT || path.join(volumeRoot, "Active Work"));
  const libraryRoot = path.join(volumeRoot, "Media Library");
  const root = area === "active" ? activeRoot : libraryRoot;
  return {
    root,
    volumeRoot,
    area,
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
  if (!existsSync(config.volumeRoot)) {
    throw new StorageGateError(
      "VOLUME_MISSING",
      `${config.volumeRoot} is unavailable; refusing an internal-disk fallback`,
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
  const generated = physicalPath(path.join(config.volumeRoot, "Generated"));
  const selected = physicalPath(config.root);
  if (isWithin(selected, generated) || isWithin(generated, selected)) {
    throw new StorageGateError("DISPOSABLE_ROOT", "Generated is reserved for reviewed disposable files; route new work to Active Work or Media Library");
  }
  if (info.readOnly) {
    throw new StorageGateError(
      "VOLUME_READ_ONLY",
      `${config.root} is mounted read-only`,
    );
  }

  try {
    accessSync(config.volumeRoot, fsConstants.W_OK);
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
  const config = configuration(options.area || "active");
  const kind = String(options.kind || "").toLowerCase();
  const kinds = config.area === "active" ? VALID_KINDS : new Set(Object.keys(LIBRARY_KINDS));
  if (!kinds.has(kind)) {
    throw new StorageGateError(
      "INVALID_KIND",
      `kind must be one of: ${[...kinds].join(", ")}`,
    );
  }

  verifyVolume(config);
  const destination = path.join(config.root, normalizeClient(options.client), config.area === "library" ? LIBRARY_KINDS[kind] : kind);
  assertWithinPhysicalRoot(destination, config.root);
  mkdirSync(destination, { recursive: true });
  process.stdout.write(`${destination}\n`);
}

function readStdin() {
  return readFileSync(0, "utf8");
}

function checkOutput(args) {
  const options = parseArgs(args);
  const config = verifyVolume(configuration(options.area || "active"));
  const target = path.resolve(options.path || ".");
  const parts = path.relative(config.root, target).split(path.sep);
  const kinds = config.area === "active" ? VALID_KINDS : new Set(Object.values(LIBRARY_KINDS));
  if (!options.path || !isWithin(target, config.root) || parts.length < 3 ||
      !/^(?:[A-Z0-9]+(?:_[A-Z0-9]+)*|_INBOX)$/.test(parts[0]) || !kinds.has(parts[1])) {
    throw new StorageGateError("INVALID_OUTPUT", `output must be inside ${config.root}/<CLIENT>/<TYPE>/; legacy Generated inputs may be read but new outputs must be routed`);
  }
  assertWithinPhysicalRoot(target, config.root);
  process.stdout.write(`${target}\n`);
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
  const input = payload.tool_input || payload.toolInput || {};
  const command = input.command || input.cmd || "";
  if (!/^(?:Bash|exec_command)$/i.test(toolName) ||
      !/(?:^|[\n;&|])\s*(?:npx\s+(?:--yes\s+|-y\s+)?)?hyperframes(?:@[^\s]+)?\s+render\b/.test(command)) {
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
    else if (command === "check-output") checkOutput(args);
    else if (command === "hook") hook();
    else {
      throw new StorageGateError(
        "USAGE",
        'use "storage-gate.mjs route --area active|library --client <name> --kind <kind>" or "storage-gate.mjs hook"',
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
