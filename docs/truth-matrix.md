# Singleton Systems Truth Matrix

## Owner Matrix

| Truth type | Owner | Notes |
| --- | --- | --- |
| System capture, decisions, commands, active next moves | Linear | `Command + Ideas` for intake; `Singleton Systems` for larger work. |
| Career task state and job workflow | Opportunity HQ | Keep its durable lane/status model until a separately approved migration. |
| Research, specs, dependencies, implementation history | GitHub | Wayfinder map, tickets, PRs, and durable evidence. |
| Queryable events, routing registry, cross-surface reporting | Supabase | Facts only; never copy whole ticket bodies or prompt templates. |
| Portfolio assets, screenshots, clips, examples | Eagle | Files and visual evidence live here. |
| Home-task state | Apps Script | Keep home operations separate while the task list remains small. |
| Dashboard review | Next/Vercel | Reads owners and opens owner actions; stores no independent task status. |
| Operating rules, prompts, skill contracts | Repo docs and skills | Versioned text stays in Git. |
| Desktop and mobile action clients | Raycast and Apple Shortcuts | Clients call approved owner APIs; no personal API secrets in clients. |

## Supabase Contract

Supabase is the cross-surface fact layer and live Cerebral registry. Existing
tables remain the small, queryable spine:

```text
cerebral_routes / harness_skills / harness_capabilities
outreach_attempts / contacts
content_references / content_posts / portfolio_assets
```

Use it when a fact repeats across interfaces or needs filtering, joins,
reporting, or the dashboard. Keep templates and full reasoning in Git-backed
docs/skills, and keep active decision bodies in Linear.

```text
Linear or Opportunity HQ event
  -> Cerebral confirms owner and review gate
  -> Supabase records only the queryable fact
  -> dashboard reads the fact and opens the owner link
```

## Non-Goals

```text
Do not move skill text into Supabase.
Do not make Supabase replace Linear, GitHub, Opportunity HQ, Eagle, or Apps Script.
Do not create a social scheduler or autonomous task agent.
Do not put secrets in dashboard clients, Shortcuts, or Raycast.
```

## First Implementation Gate

Before adding a table, function, or cross-surface writer:

```text
1. Inventory current writers and readers.
2. Confirm the fact repeats at least three times.
3. Propose the smallest data shape.
4. Name the authentication boundary and verification path.
5. Get review before mutation.
```
