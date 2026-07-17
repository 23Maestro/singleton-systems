# Singleton Systems Integration Map

## Purpose

Lean index for where work belongs. This file points to owner contracts; it does
not repeat their logic.

Drift gate: keep this file under 220 lines. Move repeated rules into the owner
skill or doc. Put queryable facts and event logs in Supabase, never prose copied
from Markdown.

## Owner Map

| Work | Owner | Contract |
| --- | --- | --- |
| Natural-language routing | Cerebral | `config/cerebral-registry.json` + hook |
| Raw capture and early thought | Obsidian | `planning-idea-routing` |
| Durable tasks and projects | Opportunity HQ | `opportunity-hq-updater` |
| Command implementation | Linear Command Ops | `docs/commands.md` |
| Proof files and screenshots | Eagle | `career-proof-packager` + `eagle` |
| Architecture truth | LikeC4 | `docs/visual-system-contract.md` |
| Active weekly placement | Miro | `docs/visual-system-contract.md` |
| Public review maps | Website | `/decision-maps` |
| Business facts and event logs | Supabase | `docs/truth-matrix.md` |
| Repeated reasoning | Repo skills | matching SSystems skill |

## Cerebral Route

```text
natural request
  -> Cerebral hook
  -> config/cerebral-registry.json
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

## Visual Decision Route

```text
rough thought or sketch -> Obsidian + Excalidraw
active week placement   -> Miro
command work            -> Linear Command Ops
reviewed architecture   -> LikeC4
human review artifact   -> /decision-maps
```

Canonical surface rules live in `docs/visual-system-contract.md`.

Decision-map publishing:

```text
source note -> docs/harness/<slug>.source.md
review HTML -> docs/harness/<slug>.html
build sync  -> public/decision-maps/<slug>/index.html
site index  -> app/decision-maps/page.tsx
public URL  -> https://singleton-systems.com/decision-maps
```

Use `npm run decision-maps:sync` after changing an approved map. Build runs the
same sync. Cerebral drift fails when approved source and public copy differ.

LikeC4 source stays under `docs/visual-maps`. It maps useful systems and
handoffs, not every repo file.

## Content Spine

```text
Platform -> Artist -> Attack -> Proof -> Post
```

`artist` is the plain-language alias for Supabase `reference_set`.

```text
creator/reference -> content_references after review
proof asset       -> Eagle + portfolio_assets when queryable
draft/published   -> content_posts
person/company    -> contacts
real message      -> outreach_attempts
```

Template copy, prompts, task pages, and routing rules stay in repo docs/skills.

## Harness Logs

```text
all_buckets/harness.jsonl
cash_jobs/harness.jsonl
career_jobs/harness.jsonl
freelance/harness.jsonl
offer/harness.jsonl
portfolio/harness.jsonl
```

`all_buckets` holds cross-lane routing. Other folders match durable Opportunity
HQ lanes. Do not add arbitrary lane folders.

## Stable Routes

```text
Eagle API                  -> 127.0.0.1:41596
Opportunity HQ/Eagle API   -> 127.0.0.1:41595
Obsidian MCP               -> https://127.0.0.1:27124/mcp
Singleton Systems website  -> https://singleton-systems.com
Decision Maps              -> https://singleton-systems.com/decision-maps
```

MCP is operator control, not durable dependency. Reliable code uses stable
APIs, scripts, files, or environment configuration.

## Do Not Add Here

- long business strategy
- app-specific instructions
- full skill procedures
- copied Supabase rows or schemas
- speculative integrations
- file-by-file repo inventories
- future automation wish lists

Owner docs:

- `docs/home-hub.md` - repo and connected-system orientation
- `docs/visual-system-contract.md` - Obsidian, Excalidraw, Miro, Linear, LikeC4
- `docs/truth-matrix.md` - source-of-truth and Supabase boundaries
- `docs/commands.md` - command and shortcut layer
- `docs/operating-system/phase-one-operating-system.md` - current business loop

If a rule has no clear owner, route it through `planning-idea-routing` before
adding more text here.
