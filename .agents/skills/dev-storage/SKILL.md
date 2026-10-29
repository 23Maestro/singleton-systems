---
name: dev-storage
description: Audit and reduce macOS development storage bloat with Hazel discovery, rebuildable-cache cleanup, Node runtime review, and safe Git worktree retirement. Use for low-disk warnings, stale dependency cleanup, or branch and worktree hygiene; do not use for media-library organization.
---

# Dev Storage

Protect source first, then remove only reproducible local state.

## Video Boundary

Route video intake, working media, renders, proxies, previews, media migration,
and retention to `s-systems:video-storage`. This skill may report that media is
consuming space, but it must not move, organize, or retire that media.

## Baseline

- `PROTECTED`: source, `.git`, manifests, lockfiles, `.env*`, databases, project
  files, and user media.
- `REVIEW`: unmerged branches, dirty worktrees, active dependencies, installed
  runtimes, global packages, and tool-specific local state.
- `REBUILDABLE`: `node_modules`, framework caches, Python caches, Xcode caches,
  package-manager caches, and generated output verified by the project.

Hazel is the background discovery layer. It traverses
`~/Documents/Development`, tags eligible folders `BLOAT_REVIEW`, and never
deletes. Baseline inactivity thresholds are 7 days for framework/Python caches,
14 days for Xcode caches, and 30 days for `node_modules`.

Run the same classifier across the tree:

```bash
DEV_STORAGE_SKILL="${CODEX_HOME:-$HOME/.codex}/skills/dev-storage"
python3 "$DEV_STORAGE_SKILL/scripts/dev_storage.py"
```

Use `--apply-reviewed` only after the user authorizes the listed paths. Never
interpret general storage pressure as permission to delete source or review
items.

## Repository Pass

1. Fetch and inspect before changing anything:

   ```bash
   git fetch origin --prune
   git status --short
   git branch -vv
   git worktree list --porcelain
   ```

2. Publish completed work only after repository checks pass. Preserve explicit
   WIP and active feature branches.
3. Remove a linked checkout with `git worktree remove <path>` only when clean.
   Delete its branch separately only when merged, patch-equivalent, or explicitly
   retired.
4. Run the repository's own generated-artifact cleaner before generic cleanup.
5. Follow the repository's pinned package manager and frozen lockfile. Run
   diagnostics before reinstalling. With pnpm, use `pnpm install --frozen-lockfile`;
   keep its store on the checkout's disk so package files can be shared. npm-only
   projects may use `npm ci` after confirming the install is needed and inactive.
   Never share a mutable `node_modules` directory between worktrees. Docs-only
   work needs no install. Do not copy build caches into release folders.

## Machine Pass

CAD tooling uses HomeSSD. Follow [the CAD route](references/cad-storage.md).
Use its managed uv update command so an update preserves the CAD launcher.

Whisper is a retained tool, not a cleanup candidate. Keep `ggml-medium.en.bin`
at `/Volumes/HomeSSD/Generated/SINGLETON_SYSTEMS/source/whisper-models/`.
Keep `~/.cache/whisper-models/ggml-medium.en.bin` linked to that file so existing
transcription commands work. Never delete the model or its link during cache
cleanup, even when unused or over budget. Removal needs a new request that
specifically names Whisper. Downloads and replacements must use the verified
HomeSSD route; never rebuild internally when the drive is absent. The guard
reports a missing model or changed link without moving or downloading files.

Use the companion guard when free space drops or cleanup must recur. It covers
the known cache, browser-clone, Codex checkout, model, and app-data locations,
plus bounded project-cache discovery. It checks Hazel's actual execution health.

```bash
DEV_STORAGE_SKILL="${CODEX_HOME:-$HOME/.codex}/skills/dev-storage"
python3 "$DEV_STORAGE_SKILL/scripts/dev_storage.py" --machine
python3 "$DEV_STORAGE_SKILL/scripts/storage_guard.py" run
python3 "$DEV_STORAGE_SKILL/scripts/storage_guard.py" health
```

`run` saves a bounded growth history. It is report-only unless the user has
approved the explicit `--maintain chrome-clones,uv-prune` rules. Those rules
require 48 observed idle hours and fresh process/open-file checks. Gaps over
12 hours reset the grace. No process is killed. uv owns its own pruning; never
delete its cached environments by hand or use `--force`.

The guard never deletes projects, Git, worktrees, history, media, models, or
app-managed data. Over-budget locations remain visible with their class. Use
the existing project classifier for project-cache review. Before making a
release checkout, reuse a suitable managed Git worktree and shared dependencies;
avoid full local clones with duplicated Git history. See
[the guard policy and sources](references/storage-guard.md).

- Run `pnpm store prune` for unreferenced shared pnpm packages.
- Clean npm or uv caches only when storage recovery is requested; caches are
  downloads, not project source.
- Before `nvm uninstall VERSION`, verify no project pin and no live process uses
  that exact runtime. Preserve the current default and service runtimes.
- Do not install Rift by default. Its upstream README currently labels it
  experimental. Recheck upstream before use; native Git worktrees plus omitted
  dependencies are the baseline.

Report bytes recovered, protected exceptions, exact branches retained, restore
commands, and verification results.
