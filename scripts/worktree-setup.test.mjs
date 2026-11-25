import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

const repoRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const cleanEnv = Object.fromEntries(Object.entries(process.env).filter(([key]) => !key.startsWith("GIT_")));
// Stand-in for pnpm install so the test stays fast and offline.
cleanEnv.WORKTREE_SETUP_INSTALL = "mkdir node_modules && touch node_modules/.installed";
const git = (cwd, ...args) => execFileSync("git", args, { cwd, encoding: "utf8", env: cleanEnv }).trim();

function makeMainCheckout() {
  const main = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "wt-setup-")));
  git(main, "init", "-q", "-b", "main");
  git(main, "config", "user.email", "test@example.com");
  git(main, "config", "user.name", "Test");
  fs.mkdirSync(path.join(main, "scripts"));
  fs.copyFileSync(path.join(repoRoot, "scripts/worktree-setup.mjs"), path.join(main, "scripts/worktree-setup.mjs"));
  fs.mkdirSync(path.join(main, ".husky/_"), { recursive: true });
  fs.copyFileSync(path.join(repoRoot, ".husky/post-checkout"), path.join(main, ".husky/post-checkout"));
  // Minimal stand-in for husky's generated runner: run .husky/<hook-name>.
  fs.writeFileSync(path.join(main, ".husky/_/h"), 'sh -e "$(dirname "$(dirname "$0")")/$(basename "$0")" "$@"\n');
  fs.writeFileSync(path.join(main, ".husky/_/post-checkout"), '#!/usr/bin/env sh\n. "$(dirname "$0")/h"\n', { mode: 0o755 });
  fs.writeFileSync(path.join(main, ".gitignore"), "node_modules\n.env.local\n.husky/_\n");
  git(main, "add", ".");
  git(main, "commit", "-q", "-m", "init");
  fs.mkdirSync(path.join(main, "node_modules"));
  fs.writeFileSync(path.join(main, ".env.local"), "SECRET=main\n");
  return main;
}

test("setup in the main checkout points every worktree at one hooks folder", () => {
  const main = makeMainCheckout();
  execFileSync("node", ["scripts/worktree-setup.mjs"], { cwd: main, env: cleanEnv });
  assert.equal(git(main, "config", "core.hooksPath"), path.join(main, ".husky/_"));
});

test("a new worktree gets the main env file, its own dependencies and the commit gate on its own", () => {
  const main = makeMainCheckout();
  execFileSync("node", ["scripts/worktree-setup.mjs"], { cwd: main, env: cleanEnv });
  const wt = path.join(main, "..", path.basename(main) + "-wt");
  execFileSync("git", ["worktree", "add", "-q", "-b", "feature", wt], { cwd: main, env: cleanEnv });
  assert.equal(fs.readFileSync(path.join(wt, ".env.local"), "utf8"), "SECRET=main\n");
  assert.ok(fs.existsSync(path.join(wt, "node_modules/.installed")), "dependencies are installed in the worktree");
  assert.ok(!fs.lstatSync(path.join(wt, "node_modules")).isSymbolicLink(), "node_modules is never shared with main");
  assert.equal(git(wt, "config", "core.hooksPath"), path.join(main, ".husky/_"));
});

test("setup never replaces a real file already in the worktree", () => {
  const main = makeMainCheckout();
  const wt = path.join(main, "..", path.basename(main) + "-own");
  git(main, "worktree", "add", "-q", "-b", "own", wt);
  fs.writeFileSync(path.join(wt, ".env.local"), "SECRET=own\n");
  execFileSync("node", [path.join(main, "scripts/worktree-setup.mjs")], { cwd: wt, env: cleanEnv });
  assert.equal(fs.readFileSync(path.join(wt, ".env.local"), "utf8"), "SECRET=own\n");
});
