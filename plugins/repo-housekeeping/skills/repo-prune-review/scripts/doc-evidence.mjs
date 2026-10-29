import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const textExtensions = new Set([".md", ".mdx", ".txt", ".json", ".yaml", ".yml", ".ts", ".tsx", ".js", ".mjs", ".cjs", ".py", ".sh", ".toml"]);
const skippedDirectories = new Set(["node_modules", ".git", ".next", "output", "dist", ".scratch", "coverage", "sessions", "memories"]);
const digest = (content) => crypto.createHash("sha256").update(content).digest("hex");
const inside = (root, file) => file === root || file.startsWith(`${root}${path.sep}`);
const escape = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function textFile(root, relative) {
  const absolute = path.resolve(root, relative);
  if (!inside(root, absolute)) return null;
  const parts = relative.split(/[\\/]/);
  const basename = path.basename(relative);
  if (parts.some((part) => skippedDirectories.has(part)) || /^\.env(?:\.|$)/.test(basename)
    || /^(?:auth|credentials|secrets)(?:[.-]|$)/i.test(basename)
    || /(?:^|[-.])lock\.(?:json|yaml|yml)$/.test(basename)
    || !textExtensions.has(path.extname(relative))) return null;
  try {
    const stat = fs.lstatSync(absolute);
    if (!stat.isFile() || stat.isSymbolicLink() || stat.size > 1024 * 1024
      || !inside(root, fs.realpathSync(absolute))) return null;
    const bytes = fs.readFileSync(absolute);
    if (bytes.includes(0)) return null;
    return { text: bytes.toString("utf8"), hash: digest(bytes) };
  } catch { return null; }
}

function kind(file, rootKind) {
  if (rootKind === "installed-skill") return rootKind;
  if (/(?:^|\/)(?:archive|reviews|portfolio-evidence)(?:\/|$)|^public\/decision-maps\/|(?:snapshot|readback|receipt|ledger|\.source\.)/i.test(file)) return "historical-or-review";
  if (/^(?:scripts|tests)\//.test(file)) return "check-or-script";
  if (/^(?:\.codex|config|app|lib|components)\//.test(file)) return "runtime-or-config";
  return "document-or-skill";
}

export function collectEvidence({ repo, targets, extraRoots = [] }) {
  const repository = fs.realpathSync(path.resolve(repo));
  const list = (command, args, root) => [...new Set(execFileSync(command, args, { cwd: root, maxBuffer: 32 * 1024 * 1024 }).toString().split("\0").filter(Boolean))];
  const roots = [{ path: repository, kind: "repository", files: list("git", ["ls-files", "-z", "-c", "-o", "--exclude-standard"], repository) }];
  for (const extra of extraRoots) {
    const root = fs.realpathSync(path.resolve(extra));
    if (roots.some((entry) => entry.path === root)) continue;
    roots.push({ path: root, kind: "installed-skill", files: list("rg", ["--files", "--hidden", "-0", "-g", "!.git", "-g", "!node_modules"], root) });
  }
  const corpus = roots.flatMap((root) => root.files.flatMap((file) => {
    const content = textFile(root.path, file);
    return content ? [{ root: root.path, file, kind: kind(file, root.kind), ...content }] : [];
  }));
  const packageFile = textFile(repository, "package.json");
  const scripts = packageFile ? JSON.parse(packageFile.text).scripts ?? {} : {};
  const items = targets.map((target) => {
    const absolute = path.resolve(repository, target);
    if (!inside(repository, absolute)) throw new Error(`Target is outside the repository: ${target}`);
    const file = path.relative(repository, absolute).split(path.sep).join("/");
    const source = textFile(repository, file);
    if (!source) throw new Error(`Target is not a readable, permitted text file: ${file}`);
    const matcher = new RegExp(`(?:^|[^\\w.-])(?:${escape(file)}|${escape(path.basename(file))})(?![\\w-]|\\.[\\w-])`);
    const references = corpus.flatMap((caller) => {
      if (caller.root === repository && caller.file === file) return [];
      return caller.text.split(/\r?\n/).flatMap((line, index) => matcher.test(line)
        ? [{ root: caller.root, file: caller.file, line: index + 1, kind: caller.kind, callerSha256: caller.hash }] : []);
    });
    const commands = source.text.split(/\r?\n/).flatMap((line, index) => {
      const npm = [...line.matchAll(/\bnpm run ([\w:-]+)/g)].map((match) => ({ line: index + 1, command: match[0], present: Object.hasOwn(scripts, match[1]), evidence: "package-script-presence-only" }));
      const direct = [...line.matchAll(/\b(?:node|python3?)\s+((?:scripts|tools|\.codex)\/[\w./-]+\.(?:mjs|cjs|js|py))/g)].map((match) => {
        const destination = path.resolve(repository, match[1]);
        const present = inside(repository, destination) && Boolean(textFile(repository, match[1]));
        return { line: index + 1, command: match[0], present, evidence: "script-presence-only" };
      });
      return [...npm, ...direct];
    });
    return { file, sourceRevision: source.hash, references, commands, recommendation: "needs-reading", removalTest: "not-run" };
  });
  return {
    schemaVersion: 1, workflow: "repo-pruning", checkedAt: new Date().toISOString(), repository,
    head: execFileSync("git", ["rev-parse", "HEAD"], { cwd: repository }).toString().trim(),
    searchedRoots: roots.map((root) => {
      const scannedTextFiles = corpus.filter((file) => file.root === root.path).length;
      return { path: root.path, kind: root.kind, listedFiles: root.files.length, scannedTextFiles, skippedFiles: root.files.length - scannedTextFiles };
    }),
    limits: [
      "Literal references are leads, not proof of execution; matching basenames can be ambiguous.",
      "No references does not mean unused. Recommendations require reading the contents.",
      "Commands are checked for presence only; nothing in documents is executed.",
      "Dynamic, manual, remote, and unsearched callers require separate review.",
      "Large, binary, secret-named, ignored, and generated files are skipped. Callers have hashes and locations, not copied contents.",
    ],
    items,
  };
}

export function checkEvidence(saved) {
  const hashPattern = /^[a-f0-9]{64}$/;
  if (saved?.schemaVersion !== 1 || saved.workflow !== "repo-pruning"
    || typeof saved.repository !== "string" || !path.isAbsolute(saved.repository)
    || !Array.isArray(saved.searchedRoots) || !saved.searchedRoots.length
    || !Array.isArray(saved.items) || !saved.items.length
    || saved.items.some((item) => !item || typeof item.file !== "string" || !item.file
      || !hashPattern.test(item.sourceRevision) || !Array.isArray(item.references)
      || !Array.isArray(item.commands))) throw new Error("Invalid saved evidence record.");
  if (saved.searchedRoots.some((root) => !root || typeof root.path !== "string" || !path.isAbsolute(root.path)
    || !["repository", "installed-skill"].includes(root.kind))
    || saved.searchedRoots.filter((root) => root.kind === "repository").length !== 1
    || !saved.searchedRoots.some((root) => root.kind === "repository" && root.path === saved.repository)) {
    throw new Error("Invalid saved evidence search scope.");
  }
  const mirrors = saved.mirrors ?? [];
  if (!Array.isArray(mirrors) || mirrors.some((mirror) => !mirror || !saved.items.some((item) => item.file === mirror.file)
    || typeof mirror.installedPath !== "string" || !path.isAbsolute(mirror.installedPath))) {
    throw new Error("Each mirror must name a reviewed file and an absolute installedPath.");
  }
  const issues = [];
  let current;
  try {
    current = collectEvidence({
      repo: saved.repository,
      targets: saved.items.map((item) => item.file),
      extraRoots: saved.searchedRoots.filter((root) => root.kind === "installed-skill").map((root) => root.path),
    });
  } catch (error) {
    return { schemaVersion: 1, status: "needs-review", checkedAt: new Date().toISOString(), issues: [{ code: "scope-unavailable", reason: error.message }] };
  }
  const references = (item) => JSON.stringify(item.references.map((reference) => [reference.root, reference.file, reference.line, reference.kind, reference.callerSha256]).sort());
  for (const [index, item] of saved.items.entries()) {
    const latest = current.items[index];
    if (item.sourceRevision !== latest.sourceRevision) issues.push({ file: item.file, code: "source-changed" });
    if (references(item) !== references(latest)) issues.push({ file: item.file, code: "callers-changed" });
    if (JSON.stringify(item.commands) !== JSON.stringify(latest.commands)) issues.push({ file: item.file, code: "commands-changed" });
  }
  for (const mirror of mirrors) {
    const source = current.items.find((item) => item.file === mirror.file);
    try {
      const stat = fs.statSync(mirror.installedPath);
      if (!stat.isFile() || stat.size > 1024 * 1024) throw new Error("Installed copy is not a permitted text file.");
      if (digest(fs.readFileSync(mirror.installedPath)) !== source.sourceRevision) {
        issues.push({ file: mirror.file, installedPath: mirror.installedPath, code: "installed-copy-differs" });
      }
    } catch (error) {
      issues.push({ file: mirror.file, installedPath: mirror.installedPath, code: error.code === "ENOENT" ? "installed-copy-missing" : "installed-copy-unreadable" });
    }
  }
  return {
    schemaVersion: 1, status: issues.length ? "needs-review" : "current", checkedAt: current.checkedAt,
    issues, checkedFiles: saved.items.length, checkedMirrors: mirrors.length,
    limits: "Current means the checked inputs still match. It does not prove the document is true or approve removal.",
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = process.argv.slice(2);
    if (args[0] === "--check") {
      if (args.length !== 2) throw new Error("Use --check SAVED_EVIDENCE.json.");
      const result = checkEvidence(JSON.parse(fs.readFileSync(args[1], "utf8")));
      process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
      if (result.status !== "current") process.exitCode = 1;
    } else {
      const options = { repo: process.cwd(), targets: [], extraRoots: [] };
      for (let index = 0; index < args.length; index++) {
        const argument = args[index];
        if (argument === "--repo" || argument === "--extra-root") {
          const value = args[++index];
          if (!value || value.startsWith("--")) throw new Error(`Missing value for ${argument}`);
          if (argument === "--repo") options.repo = value;
          else options.extraRoots.push(value);
        } else if (argument.startsWith("--")) throw new Error(`Unknown option: ${argument}`);
        else options.targets.push(argument);
      }
      if (!options.targets.length) throw new Error("Provide at least one document path.");
      process.stdout.write(`${JSON.stringify(collectEvidence(options), null, 2)}\n`);
    }
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  }
}
