# Singleton Systems Integration Map

## Purpose

Lean index for where work belongs. This file points to owner contracts; it does
not repeat their logic.

## Owner Map

| Work | Owner | Contract |
| --- | --- | --- |
| Natural-language routing | Cerebral + Supabase registry | `config/cerebral-registry.json` + hook |
| Development ideas, commands, active decisions | Linear | `Command + Ideas` and `Singleton Systems` |
| AI Consulting tasks and project state | Asana | `AI Consulting` |
| Content Editor tasks and project state | Asana | `Content Editor` |
| Career tasks and job workflow state | Opportunity HQ | `opportunity-hq-updater` |
| Development Wayfinder maps and decisions | Linear | `wayfinder` |
| AI Consulting and Content Editor Wayfinder maps | Asana | `wayfinder` |
| Branches, commits, pull requests, implementation evidence | GitHub | repository workflow |
| Queryable events and cross-surface facts | Supabase | `docs/truth-matrix.md` |
| Portfolio evidence checkpoints | Eagle | `portfolio-evidence-capture` + `eagle` |
| Portfolio blocks and claims | Eagle source evidence | `career-portfolio-packager` |
| Home-task truth | Apps Script | Personal Ops contract |
| Active weekly review | Next/Vercel dashboard | `docs/visual-system-contract.md` |
| Architecture truth | LikeC4 | `docs/visual-system-contract.md` |
| Repeated reasoning | Repo skills | matching SSystems skill |
| Code review receipts | GitHub/repository | `codex-rabbit` + repo review config |

## Cerebral Route

```text
natural request
  -> Cerebral hook
  -> Supabase live registry or checked-in fallback
  -> owner skill or surface
  -> review gate
  -> requested mutation
  -> verification
```

Natural language remains default. Exact route packets are optional helpers.
Cerebral routes attention; it does not silently mutate owner systems.

Run:

```bash
npm run check:cerebral
npm run check:cerebral:hook-routing
npm run check:cerebral:registry
```

## Active Review Route

```text
Development idea / decision -> Linear
AI Consulting task          -> Asana AI Consulting
Content Editor task         -> Asana Content Editor
fuzzy or branching work     -> Lane owner via Wayfinder
queryable event           -> Supabase
active-week review        -> Next/Vercel dashboard
reviewed architecture     -> LikeC4
human review artifact     -> /decision-maps
```

The dashboard reads its owners. It does not create a parallel backlog.

## Stable Routes

```text
Eagle API                 -> 127.0.0.1:41596
Opportunity HQ/Eagle API  -> 127.0.0.1:41595
Singleton Systems website -> https://singleton-systems.com
Decision Maps             -> https://singleton-systems.com/decision-maps
```

MCP is operator control, not a durable dependency. Reliable code uses stable
APIs, scripts, files, or environment configuration.

## Do Not Add Here

- long business strategy
- full skill procedures
- copied Supabase rows or schemas
- speculative integrations
- duplicate task systems
- future automation wish lists
