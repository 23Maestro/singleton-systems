import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const root = process.cwd();
const home = os.homedir();
const checkInstalled = process.argv.includes("--installed");
const skillRoots = [
  path.join(root, "skills", "html-playground"),
  ...fs.readdirSync(path.join(root, "plugins", "s-systems", "skills"), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(root, "plugins", "s-systems", "skills", entry.name)),
];

const allowedResourceDirectories = new Set(["agents", "assets", "references", "scripts"]);
const skillSpecificResourceDirectories = new Map([
  ["eagle-skill", new Set(["clients"])],
]);
const ignoredNames = new Set([".DS_Store"]);

function walk(directory) {
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (ignoredNames.has(entry.name) || entry.name.includes(".codex-backup-")) continue;
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...walk(fullPath));
    else if (entry.isFile()) files.push(fullPath);
  }
  return files.sort();
}

function resourcePaths(markdown) {
  const paths = new Set();
  for (const match of markdown.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
    paths.add(match[1].split("#")[0]);
  }
  for (const match of markdown.matchAll(/`([^`\n]+)`/g)) {
    for (const token of match[1].split(/\s+/)) {
      const cleaned = token.replace(/^[('"']+|[)'"',.;:]+$/g, "").split("#")[0];
      if (/^(references|scripts|assets|templates)\//.test(cleaned)) paths.add(cleaned);
    }
  }
  for (const match of markdown.matchAll(/\b(?:references|scripts|assets|templates)\/[A-Za-z0-9._/-]+/g)) {
    paths.add(match[0]);
  }
  return [...paths].filter(Boolean);
}

function checkSkill(skillRoot) {
  const skillFile = path.join(skillRoot, "SKILL.md");
  const skillName = path.basename(skillRoot);
  const skillSpecificDirectories = skillSpecificResourceDirectories.get(skillName) ?? new Set();
  assert.ok(fs.existsSync(skillFile), `${skillRoot}: missing SKILL.md`);
  const markdown = fs.readFileSync(skillFile, "utf8");

  assert.doesNotMatch(markdown, /(?:^|[\s`(])docs\//m, `${skillFile}: installed skills cannot depend on repo docs`);
  assert.doesNotMatch(markdown, /(?:^|[\s`(])config\//m, `${skillFile}: installed skills cannot depend on repo config`);
  assert.doesNotMatch(markdown, /\/Users\//, `${skillFile}: installed skills cannot contain machine-local paths`);

  for (const entry of fs.readdirSync(skillRoot, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      assert.ok(
        allowedResourceDirectories.has(entry.name) || skillSpecificDirectories.has(entry.name),
        `${skillRoot}: unsupported resource directory ${entry.name}; use references/, scripts/, or assets/`,
      );
    }
  }

  for (const resource of resourcePaths(markdown)) {
    assert.ok(!resource.startsWith("templates/"), `${skillFile}: move templates into references/: ${resource}`);
    const resolved = path.resolve(skillRoot, resource);
    assert.ok(resolved.startsWith(`${skillRoot}${path.sep}`), `${skillFile}: resource escapes skill folder: ${resource}`);
    assert.ok(fs.existsSync(resolved), `${skillFile}: missing skill-relative resource ${resource}`);
  }
}

function hash(file) {
  return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}

function snapshot(directory) {
  assert.ok(fs.existsSync(directory), `missing directory ${directory}`);
  return new Map(walk(directory).map((file) => [path.relative(directory, file), hash(file)]));
}

function assertParity(canonical, generated, label) {
  const expected = snapshot(canonical);
  const actual = snapshot(generated);
  assert.deepEqual([...actual.keys()], [...expected.keys()], `${label}: file inventory drift`);
  for (const [file, expectedHash] of expected) {
    assert.equal(actual.get(file), expectedHash, `${label}: content drift in ${file}`);
  }
  console.log(`parity ok: ${label}`);
}

for (const skillRoot of skillRoots) checkSkill(skillRoot);
console.log(`resource paths ok: ${skillRoots.length} canonical skills`);

if (checkInstalled) {
  const htmlSource = path.join(root, "skills", "html-playground");
  assertParity(htmlSource, path.join(home, ".codex", "skills", "html-playground"), "html-playground global mirror");

  const pluginSource = path.join(root, "plugins", "s-systems");
  assertParity(pluginSource, path.join(home, "plugins", "s-systems"), "s-systems Codex source mirror");
  assertParity(pluginSource, path.join(home, ".claude", "plugins-dev", "s-systems"), "s-systems Claude source mirror");

  const manifest = JSON.parse(fs.readFileSync(path.join(pluginSource, ".codex-plugin", "plugin.json"), "utf8"));
  const cache = path.join(home, ".codex", "plugins", "cache", "singleton23-local", "s-systems", manifest.version);
  assertParity(pluginSource, cache, `s-systems installed cache ${manifest.version}`);
}
