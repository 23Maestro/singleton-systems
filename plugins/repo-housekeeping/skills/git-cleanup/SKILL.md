---
name: git-cleanup
license: CC-BY-SA-4.0
description: Inspect local Git branches and worktrees, prove whether work is merged or superseded, and remove only explicitly selected branches or worktrees after confirmation. Use for branch and worktree cleanup, not document pruning or client media cleanup.
---

# Git cleanup

This is a Codex adapter of Trail of Bits Git Cleanup. Read
[merge-evidence.md](references/merge-evidence.md) before categorizing branches.
Perform the analysis in the current task. Do not start background workers.

Read the repository guide, verify its Git root, and inspect HEAD, tracking refs,
staged, unstaged and untracked paths, stashes, and every linked worktree. Resolve
origin/HEAD, then strip origin/. If it is missing, verify the repository default
and reject pipelines that succeed with empty output. Refresh remote
refs only when network access is within the request; report cached evidence.

Protect the actual default branch, current branch, long-lived integration and
environment branches, release/* and hotfix/*. Report their local-only commits.
Do not delete dirty worktrees or user-owned state. Preserve unique work and
untracked files in a verified recovery copy before any authorized mutation.

Classify every branch and worktree. Investigate each proposed removal again to
look for missing work. Name the commit, PR diff or containing branch supporting
it. Similar names, age, deleted remotes and reflogs are insufficient evidence.

| Category | Proof | Action |
|---|---|---|
| SAFE_TO_DELETE | Tip is an ancestor of the actual default branch | Candidate for git branch -d |
| SQUASH_MERGED | Named commit or PR diff contains all changes | Candidate for git branch -D |
| SUPERSEDED | Named newer branch contains all commits and preserved behavior | Candidate for git branch -D |
| REMOTE_GONE | Upstream is gone and work is not accounted for | Preserve for review |
| UNPUSHED_WORK | Commits absent from its own upstream | Preserve |
| LOCAL_WORK | Unique local commits, no upstream | Preserve |
| SYNCED_WITH_REMOTE | Matches a live upstream | Preserve |
| PROTECTED | Default, current or long-lived branch | Preserve |

List unknown or unanalyzed branches explicitly. An inventory failure cannot
support a clean-repo claim. Show dirty paths for each worktree and distinguish
commits absent from main from commits absent from a branch's own upstream.

## Confirm removals

Show one complete analysis including preserved and unknown work. Obtain the
user's selection of exact branches or worktrees. A generic cleanup request is
not selection of every ref. Then show the exact commands and obtain one final
confirmation. Reuse existing explicit authorization for those same targets;
never interpret silence as approval. Do not add a third gate for force deletion.

Remove an authorized clean worktree before deleting its checked-out branch.
Use argument arrays where possible. Shell commands must single-quote literal
branch names and paths, escaping embedded single quotes. Legal ref names can
contain command substitutions, backticks and shell separators.

Immediately before each SAFE_TO_DELETE removal, re-run git merge-base
--is-ancestor using the live refs/heads/<branch> and verified default branch.
Skip removal if that proof fails. git branch -d alone also accepts branches
merged only to their own upstream and cannot prove incorporation in main.
Run each mutation separately, report each result, and stop for changed state.
An unreported worktree holding a branch is outside the confirmation scope.

Report retained, removed, failed and unknown state, with the recovery location.
Working-tree cleanup, branch removal, pushing and client media cleanup are
separate actions. This skill does not authorize pushing or media changes.
