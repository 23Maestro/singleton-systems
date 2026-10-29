import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { collectEvidence } from "./doc-evidence.mjs";
import * as evidenceTools from "./doc-evidence.mjs";

function fixture(t) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "prune-evidence-test-"));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  const repo = path.join(directory, "repo");
  fs.mkdirSync(repo);
  execFileSync("git", ["init", "-q"], { cwd: repo });
  execFileSync("git", ["-c", "user.name=Test", "-c", "user.email=test@example.invalid", "commit", "--allow-empty", "-qm", "fixture"], { cwd: repo });
  const write = (name, content) => {
    const file = path.join(repo, name);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, content);
  };
  return { directory, repo, write };
}

test("finds callers and command presence without executing or changing documents", (t) => {
  const { directory, repo, write } = fixture(t);
  const original = "Current rule and old rule.\nnpm run useful\nnpm run missing\n";
  write("docs/mixed.md", original);
  write("scripts/check.mjs", 'readFileSync("docs/mixed.md");');
  write("docs/archive/old.md", "Previously used mixed.md.");
  write("public/decision-maps/review/source.json", JSON.stringify({ file: "docs/mixed.md" }));
  write("docs/unrelated.md", "A different file: mixed.md.bak and unmixed.md.");
  write("package.json", JSON.stringify({ scripts: { useful: "touch do-not-run" } }));
  write(".env.local", "SECRET=docs/mixed.md");
  const installed = path.join(directory, "installed");
  fs.mkdirSync(installed);
  fs.writeFileSync(path.join(installed, "SKILL.md"), "Read docs/mixed.md.");
  const evidence = collectEvidence({ repo, targets: ["docs/mixed.md"], extraRoots: [installed] });
  const item = evidence.items[0];
  assert.deepEqual(new Set(item.references.map((reference) => reference.kind)), new Set(["check-or-script", "historical-or-review", "installed-skill"]));
  assert.deepEqual(item.commands.map((command) => command.present), [true, false]);
  assert.equal(item.recommendation, "needs-reading");
  assert.equal(item.removalTest, "not-run");
  assert.equal(fs.readFileSync(path.join(repo, "docs/mixed.md"), "utf8"), original);
  assert.equal(fs.existsSync(path.join(repo, "do-not-run")), false);
  assert.equal(JSON.stringify(evidence).includes("SECRET="), false);
  assert.equal(item.references.some((reference) => reference.file === ".env.local"), false);
  assert.equal(item.references.some((reference) => reference.file === "docs/unrelated.md"), false);
  assert.equal(item.references.find((reference) => reference.file.endsWith("source.json")).kind, "historical-or-review");
});

test("a document with no found callers is never automatically marked for archive", (t) => {
  const { repo, write } = fixture(t);
  write("docs/manual.md", "A person still uses this.");
  const item = collectEvidence({ repo, targets: ["docs/manual.md"] }).items[0];
  assert.equal(item.references.length, 0);
  assert.equal(item.recommendation, "needs-reading");
});

test("rejects outside targets and symlinks that could leave the reviewed repository", (t) => {
  const { directory, repo, write } = fixture(t);
  write("docs/inside.md", "Inside.");
  const outside = path.join(directory, "outside");
  fs.mkdirSync(outside);
  fs.writeFileSync(path.join(outside, "outside.md"), "Outside.");
  fs.symlinkSync(path.join(outside, "outside.md"), path.join(repo, "file-link.md"));
  fs.symlinkSync(outside, path.join(repo, "directory-link"));
  for (const target of ["../outside/outside.md", "file-link.md", "directory-link/outside.md"]) {
    assert.throws(() => collectEvidence({ repo, targets: [target] }), /outside|permitted/);
  }
});

test("a saved review becomes stale when its source, caller, or command availability changes", (t) => {
  const { repo, write } = fixture(t);
  write("docs/rule.md", "Current rule. npm run verify");
  write("scripts/reader.mjs", 'readFileSync("docs/rule.md");');
  write("package.json", JSON.stringify({ scripts: { verify: "echo check" } }));
  const saved = collectEvidence({ repo, targets: ["docs/rule.md"] });
  assert.equal(evidenceTools.checkEvidence(saved).status, "current");
  write("scripts/reader.mjs", 'readFileSync("docs/rule.md");\n// Changed reader behavior.');
  assert.ok(evidenceTools.checkEvidence(saved).issues.some((issue) => issue.code === "callers-changed"));
  write("scripts/reader.mjs", 'readFileSync("docs/rule.md");');
  write("package.json", JSON.stringify({ scripts: {} }));
  assert.ok(evidenceTools.checkEvidence(saved).issues.some((issue) => issue.code === "commands-changed"));
  write("docs/rule.md", "New rule.");
  assert.ok(evidenceTools.checkEvidence(saved).issues.some((issue) => issue.code === "source-changed"));
});

test("adding or removing a caller invalidates a review even when the document stays unchanged", (t) => {
  const { repo, write } = fixture(t);
  write("docs/rule.md", "Current rule.");
  const saved = collectEvidence({ repo, targets: ["docs/rule.md"] });
  write("scripts/new-reader.mjs", 'readFileSync("docs/rule.md");');
  assert.equal(evidenceTools.checkEvidence(saved).status, "needs-review");
  const withCaller = collectEvidence({ repo, targets: ["docs/rule.md"] });
  fs.unlinkSync(path.join(repo, "scripts/new-reader.mjs"));
  assert.ok(evidenceTools.checkEvidence(withCaller).issues.some((issue) => issue.code === "callers-changed"));
  assert.equal(fs.readFileSync(path.join(repo, "docs/rule.md"), "utf8"), "Current rule.");
});

test("missing and different installed skills hold the review without modifying either copy", (t) => {
  const { directory, repo, write } = fixture(t);
  write("skills/editor/SKILL.md", "Use the approved engine for this scene.");
  const installedPath = path.join(directory, "installed-skill.md");
  fs.writeFileSync(installedPath, "Use the approved engine for this scene.");
  const saved = collectEvidence({ repo, targets: ["skills/editor/SKILL.md"] });
  saved.mirrors = [{ file: "skills/editor/SKILL.md", installedPath }];
  assert.equal(evidenceTools.checkEvidence(saved).status, "current");
  fs.writeFileSync(installedPath, "Always use the old engine.");
  assert.ok(evidenceTools.checkEvidence(saved).issues.some((issue) => issue.code === "installed-copy-differs"));
  assert.equal(fs.readFileSync(installedPath, "utf8"), "Always use the old engine.");
  fs.unlinkSync(installedPath);
  assert.ok(evidenceTools.checkEvidence(saved).issues.some((issue) => issue.code === "installed-copy-missing"));
  assert.equal(fs.readFileSync(path.join(repo, "skills/editor/SKILL.md"), "utf8"), "Use the approved engine for this scene.");
});

test("malformed records and unavailable evidence never count as current", (t) => {
  const { repo, write } = fixture(t);
  assert.throws(() => evidenceTools.checkEvidence({}), /saved evidence/);
  write("docs/rule.md", "Current rule.");
  const saved = collectEvidence({ repo, targets: ["docs/rule.md"] });
  assert.throws(() => evidenceTools.checkEvidence({ ...saved, mirrors: [{ file: "unreviewed.md", installedPath: "/tmp/unused" }] }), /reviewed file/);
  fs.unlinkSync(path.join(repo, "docs/rule.md"));
  assert.equal(evidenceTools.checkEvidence(saved).status, "needs-review");
});

test("the check command prints clean JSON and fails for stale input without changing the saved review", (t) => {
  const { directory, repo, write } = fixture(t);
  write("docs/rule.md", "Current rule.");
  const saved = JSON.stringify(collectEvidence({ repo, targets: ["docs/rule.md"] }));
  const file = path.join(directory, "saved-review.json");
  fs.writeFileSync(file, saved);
  const script = fileURLToPath(new URL("./doc-evidence.mjs", import.meta.url));
  const run = () => spawnSync(process.execPath, [script, "--check", file], { cwd: directory, encoding: "utf8" });
  const current = run();
  assert.equal(current.status, 0, current.stderr);
  assert.equal(JSON.parse(current.stdout).status, "current");
  write("docs/rule.md", "Changed rule.");
  const stale = run();
  assert.equal(stale.status, 1, stale.stderr);
  assert.equal(JSON.parse(stale.stdout).status, "needs-review");
  assert.equal(fs.readFileSync(file, "utf8"), saved);
});
