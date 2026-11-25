# GitHub repo maintenance

One page for how work moves through this repo. Claude, Codex, Grok and
ChatGPT all follow it.

## The rule of thumb

1. **Repo files change → use a worktree.** Code, site pages, skills, hooks
   and docs. One task and one agent per worktree.
2. **No repo files change → stay on main.** Video edits, outreach, Asana or
   Linear updates, research and talk. Media lives on HomeSSD or MediaSSD,
   never in Git.
3. **Done means fully done.** When Jerami says commit, it means commit, merge
   to main and push to GitHub, the same day. No pull request unless he asks.
   Then remove the worktree.
4. **Start from fresh main.** Fetch first. Never leave unsaved edits in the
   main folder; they block every other session's update.
5. **Secrets live in one place:** the main checkout's `.env.local`. Never copy
   it. Worktrees link to it.
6. **Supabase registry changes go through migrations** in
   `supabase/migrations/`. No agent edits the registry live.

## New worktrees set themselves up

`git worktree add` runs `.husky/post-checkout`, which runs
[`scripts/worktree-setup.mjs`](../../../scripts/worktree-setup.mjs). It does
three things:

- Links the main checkout's `.env.local`.
- Installs the worktree's own dependencies from pnpm's shared store. This takes
  a few seconds. `node_modules` is never shared between checkouts.
- Points every checkout at the main `.husky/_`, so the pre-commit gate
  (`npm run verify`) runs in worktrees too.

It runs again after every `pnpm install` through the `prepare` script. To run
it by hand: `npm run worktree:setup`. Its test is
[`scripts/worktree-setup.test.mjs`](../../../scripts/worktree-setup.test.mjs),
part of `npm run check:housekeeping`.

The Cerebral hook also reads the main `.env.local` from a worktree
(`.codex/hooks/cerebral_singleton_guard.py`).

## One owner per job

| Job | Owner |
| --- | --- |
| Decide if a task needs a worktree, then create it | [`worktree-router`](../../../.agents/skills/worktree-router/SKILL.md) |
| Set up a new worktree | `scripts/worktree-setup.mjs` (automatic) |
| Remove finished branches and worktrees | [`git-cleanup`](../../../plugins/repo-housekeeping/skills/git-cleanup/SKILL.md) |
| Repo structure and old generated files | [`repo-maintenance`](../../../plugins/repo-housekeeping/skills/repo-maintenance/SKILL.md) |
| Stale docs and unused code | [`repo-prune-review`](../../../plugins/repo-housekeeping/skills/repo-prune-review/SKILL.md) |
| Disk space and caches | [`dev-storage`](../../../.agents/skills/dev-storage/SKILL.md) |
| Generated build output | `npm run clean:generated` |
| Where files belong | [`storage-gate`](../../../scripts/developer-storage/storage-gate.mjs), see [File homes](../files.md) |
| Task closeout after work is done | `npm run task:closeout`, see [task rules](../../agents/issue-tracker.md) |

`repo-maintenance` and `dev-storage` report stale worktrees. Only `git-cleanup`
removes them.

## Safe cleanup

Remove a worktree only when it has no unsaved work and its branch is merged
into main. Leave a worktree that belongs to an open agent session; the app
removes it when the session is archived. Never delete unmerged work.

## Checks

- `npm run verify` runs before every commit.
- `npm run check:housekeeping` covers the cleanup and setup scripts.
- `npm run check:cerebral:hook-routing` covers the hook, including worktrees.

## Adding a new maintenance tool

Put it under one of the owners above and add a row to this table. A script
that only one agent knows about is drift.
