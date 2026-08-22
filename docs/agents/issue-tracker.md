# Issue tracker

Linear is the canonical issue tracker for Singleton Systems.

## Ownership

- Linear owns tasks, status, priority, assignment, blockers, and resolution.
- GitHub holds linked implementation evidence such as branches, commits, and
  pull requests.
- GitHub Issues do not duplicate Linear tasks.
- Notion owns client and portfolio records.
- Supabase holds integration receipts and temporary drafts when needed.

## Workflow

- `Backlog`: captured but not accepted.
- `Todo`: accepted and unclaimed.
- `In Progress`: claimed during the current work session.
- `In Review`: an answer or artifact awaits Jerami's review.
- `Done`: reviewed and observable.
- Due dates represent real deadlines only.

Prefer the server-side Linear GraphQL gateway for repository workflows. Use the
Linear connector only when the gateway lacks the required operation, and state
that fallback before changing Linear.

`ready-for-build` means the issue is specified enough for Jerami to begin or
approve implementation. It does not start an agent, sub-agent, branch, or
background task.

