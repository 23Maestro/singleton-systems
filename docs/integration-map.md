# Singleton Systems Integration Map

## Purpose

Lean index for where work belongs. This file points to owner contracts; it does
not repeat their logic.

## Owner Map

| Work | Owner | Contract |
| --- | --- | --- |
| Natural-language routing | Cerebral + Supabase registry | `config/cerebral-registry.json` + hook |
| System ideas, commands, active decisions | Linear | `Command + Ideas` and `Singleton Systems` |
| Career tasks and job workflow state | Opportunity HQ | `opportunity-hq-updater` |
| Research, specs, dependencies, implementation proof | GitHub | `wayfinder` |
| Queryable events and cross-surface facts | Supabase | `docs/truth-matrix.md` |
| Proof files and screenshots | Eagle | `career-proof-packager` + `eagle` |
| Home-task truth | Apps Script | Personal Ops contract |
| Active weekly review | Next/Vercel dashboard | `docs/visual-system-contract.md` |
| Architecture truth | LikeC4 | `docs/visual-system-contract.md` |
| Repeated reasoning | Repo skills | matching SSystems skill |

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
idea / command / decision -> Linear
fuzzy or branching build  -> GitHub Wayfinder map
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
