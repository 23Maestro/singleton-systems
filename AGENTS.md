# AGENTS.md

Codex is the primary implementation driver for this repository. Work stays in
the current task unless Jerami explicitly requests a separate task. Do not
dispatch sub-agents, create AFK work, or start background implementation.

`CODEX.md` contains the canonical repository architecture, commands, writing
rules, and conventions. Read it before changing the repository. `CLAUDE.md` is
the secondary Claude Code entrypoint. This file owns Codex-specific workflow
when the files differ.

## Start here

Before exploring or changing the repository, read:

- `CONTEXT.md` for the shared Gate vocabulary.
- `docs/agents/domain.md` for domain-document rules.
- `docs/agents/issue-tracker.md` for Linear ownership and workflow.
- `docs/agents/triage-labels.md` for tracker-label mappings.

These files adapt generic skill language to Singleton Systems. They do not
authorize automatic dispatch or unsupervised implementation.

## Working contract

- Keep Jerami in control of scope, delivery, and external changes.
- Treat `Lane` as the front-facing term. Accept `Bucket` as a trigger phrase
  and tool-harness destination.
- Use Linear for task state. Use GitHub for implementation evidence.
- Treat `ready-for-build` as a readiness label only. It never starts work.
- Preserve unrelated changes in a dirty worktree.
- Verify visible behavior when the task changes a user-facing workflow.

## Checks

Use the commands documented in `CODEX.md`. When routing, hooks, skills, or
their contract docs change, run:

```bash
npm run check:cerebral
npm run check:cerebral:registry
npm run check:cerebral:hook-routing
```
