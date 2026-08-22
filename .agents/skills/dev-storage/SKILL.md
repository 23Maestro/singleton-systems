---
name: dev-storage
description: Audit and reduce macOS development storage bloat with Hazel discovery, rebuildable-cache cleanup, Node runtime review, and safe Git worktree retirement. Use for low-disk warnings, stale dependency cleanup, or branch and worktree hygiene; do not use for media-library organization.
---

# Dev Storage

Protect source first, then remove only reproducible local state.

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
python3 scripts/dev_storage.py
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
5. Restore npm dependencies with `npm ci`. Keep the lockfile.

## Machine Pass

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
