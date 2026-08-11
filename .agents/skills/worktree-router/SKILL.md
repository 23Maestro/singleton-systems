---
name: worktree-router
description: Decide whether a repository task should be isolated in a Git worktree, offer one concise opt-in nudge, and safely create or manage the worktree after approval. Use before multi-file feature, build, refactor, plugin, skill, automation, or PR-sized work; when the current checkout contains unrelated changes; when parallel agents or alternative implementations are planned; or when the user mentions worktrees, branch isolation, or GitHub workflow setup. Skip read-only work and tiny one-file edits.
---

# Worktree Router

Keep repository work isolated without turning worktrees into ceremony. Inspect first, suggest once when useful, and never create, move, push, merge, or remove anything without task-specific authorization.

## Route the task

Inspect the repository with read-only commands:

```bash
git rev-parse --show-toplevel
git branch --show-current
git status --short
git worktree list --porcelain
git remote -v
```

Recommend a worktree when one or more are true:

- The task is likely to touch multiple files or take more than a short edit.
- The current checkout has unrelated modified or untracked files.
- The work is a feature, refactor, plugin, skill, automation, experiment, or likely pull request.
- Another agent or implementation may run in parallel.
- The user wants a clean comparison or rollback boundary.

Do not nudge when the task is read-only, a clearly tiny one-file edit, already inside a suitable linked worktree, or the user declined for this task.

Ask once:

> This looks worktree-sized because <specific reason>. Want me to create `<branch>` at `<path>`? If not, I’ll continue here.

Treat “no” as final for the current task. Do not keep asking.

## Create only after approval

Use these defaults unless the repository already has a convention:

- Branch: `codex/<short-task-slug>`
- Directory: sibling of the main checkout, `<repo>-<short-task-slug>`
- Base: the user-approved ref; otherwise current `HEAD`

Before creation:

1. Confirm the proposed branch and directory do not already exist.
2. Explain that uncommitted changes are not included in a new worktree.
3. If the task already started, identify the exact scoped files to carry over and get approval for that list.
4. Never stash the entire checkout or copy unrelated changes to make the worktree appear clean.

Create with an explicit path, branch, and base:

```bash
git worktree add -b codex/<slug> /absolute/sibling/path <base-ref>
```

When carrying over approved work, copy only the named files after the worktree exists. Exclude dependency folders, caches, build output, credentials, `.env` files, and unrelated assets. Preserve the originals until the copied work verifies successfully.

## Initialize the linked worktree

After creation:

1. Detect the package manager and project setup from tracked files.
2. Install dependencies only when required for verification.
3. Keep dependency folders ignored; never stage `node_modules`, caches, or generated junk accidentally.
4. Check tools that store absolute paths. Repoint development registrations or watchers such as Figma plugin manifests after relocation.
5. Run the repository’s relevant verification commands inside the linked worktree.
6. Report the absolute path, branch, copied files, verification result, and remaining uncommitted state.

Do not call a worktree ready merely because `git worktree add` succeeded.

## Handle GitHub without surprises

Treat worktree creation, commits, pushes, pull requests, merges, and cleanup as separate decisions.

- Do not stage unrelated files.
- Do not commit, push, or open a pull request unless requested.
- Inspect existing `.github/` conventions before proposing templates or workflows.
- Add `.github` files only for a demonstrated repository need, not as generic setup.
- Before removal, verify the linked worktree is clean and the branch is preserved or merged.
- Prefer `git worktree remove <path>` for cleanup; delete the branch separately and only when safe.

## Keep hooks advisory

If adding a prompt or pre-hook later, make it advisory:

- Inspect only.
- Emit one short suggestion with the reason.
- Exit successfully.
- Never create branches, copy files, change the working directory, block the task, or override an explicit user choice.

Start with this skill alone. Add a hook only after repeated real use shows the routing policy is stable.
