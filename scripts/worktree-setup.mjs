#!/usr/bin/env node
// Make any checkout of this repo ready to work in.
// - Points every worktree at the main checkout's .husky/_ so the pre-commit gate always runs.
// - In a linked worktree, links .env.local from the main checkout and installs its own dependencies.
// Safe to run again. Never replaces a real file. Runs on its own after `git worktree add`
// through .husky/post-checkout, and after `npm install` through the prepare script.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const git = (...args) => execFileSync("git", args, { encoding: "utf8" }).trim();

const here = git("rev-parse", "--show-toplevel");
const main = path.dirname(git("rev-parse", "--path-format=absolute", "--git-common-dir"));
const hooks = path.join(main, ".husky/_");
const done = [];

if (fs.existsSync(hooks) && git("config", "--default", "", "core.hooksPath") !== hooks) {
  git("config", "core.hooksPath", hooks);
  done.push(`hooks -> ${hooks}`);
}

const exists = (file) => { try { fs.lstatSync(file); return true; } catch { return false; } };

if (here !== main) {
  // Secrets stay in one place: link the main checkout's .env.local.
  const env = path.join(here, ".env.local");
  if (!exists(env) && fs.existsSync(path.join(main, ".env.local"))) {
    fs.symlinkSync(path.join(main, ".env.local"), env);
    done.push(".env.local -> main checkout");
  }
  // Dependencies are never shared: install from pnpm's shared store (hard links, fast).
  // WORKTREE_SETUP_NESTED stops the prepare script from installing twice.
  if (!exists(path.join(here, "node_modules")) && !process.env.WORKTREE_SETUP_NESTED) {
    const install = process.env.WORKTREE_SETUP_INSTALL || "pnpm install --frozen-lockfile --prefer-offline";
    try {
      execFileSync("sh", ["-c", install], { cwd: here, stdio: "inherit", env: { ...process.env, WORKTREE_SETUP_NESTED: "1" } });
      done.push("dependencies installed");
    } catch {
      done.push("dependency install FAILED, run `pnpm install` in this worktree");
    }
  }
}

console.log(done.length ? `worktree setup: ${done.join(", ")}` : "worktree setup: already ready");
