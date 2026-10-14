import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

test("the maintenance skill runs outside its source repo without changing inspected work", () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), "housekeeping-portable-"));
  const project = path.join(temp, "project with spaces");
  const skill = path.join(temp, "standalone skill");
  const env = Object.fromEntries(Object.entries(process.env).filter(([key]) => !key.startsWith("GIT_")));
  env.PYTHONDONTWRITEBYTECODE = "1";
  function git(args) {
    const result = spawnSync("git", ["-c", "core.hooksPath=/dev/null", "-c", "commit.gpgSign=false", ...args], { cwd: project, env, encoding: "utf8" });
    assert.equal(result.status, 0, result.stderr);
    return result.stdout;
  }
  try {
    fs.mkdirSync(project);
    fs.cpSync(new URL("../plugins/repo-housekeeping/skills/repo-maintenance/", import.meta.url), skill, { recursive: true });
    git(["init", "-b", "main"]);
    git(["config", "user.name", "Fixture"]);
    git(["config", "user.email", "fixture@example.invalid"]);
    fs.writeFileSync(path.join(project, "README.md"), "base\n");
    git(["add", "README.md"]);
    git(["commit", "-m", "fixture baseline"]);
    fs.writeFileSync(path.join(project, "README.md"), "unfinished source\n");
    fs.writeFileSync(path.join(project, "new.txt"), "unique untracked work\n");
    const before = { head: git(["rev-parse", "HEAD"]), status: git(["status", "--porcelain=v1", "-uall"]) };
    const result = spawnSync("python3", [path.join(skill, "scripts/audit_repo_maintenance.py"), "--repo", project, "--base", "main", "--json"], { cwd: temp, env, encoding: "utf8", timeout: 30_000 });
    assert.equal(result.status, 0, result.stderr);
    const report = JSON.parse(result.stdout);
    assert.equal(fs.realpathSync(report.repo_root), fs.realpathSync(project));
    assert.equal(report.current_branch, "main");
    assert.deepEqual(report.canonical_dirty_paths.sort(), ["README.md", "new.txt"]);
    assert.deepEqual({ head: git(["rev-parse", "HEAD"]), status: git(["status", "--porcelain=v1", "-uall"]) }, before);
    assert.equal(fs.readFileSync(path.join(project, "new.txt"), "utf8"), "unique untracked work\n");
  } finally {
    fs.rmSync(temp, { recursive: true, force: true });
  }
});
