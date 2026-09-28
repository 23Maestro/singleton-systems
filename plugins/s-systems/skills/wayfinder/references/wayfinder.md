# Wayfinder owner operations

Owner: `singleton-systems`

Upstream reviewed: Matt Pocock's `skills/engineering/wayfinder/SKILL.md`
at commit `38d62e71ed01fc05d5ae63b0807172e9546049d5` (2026-07-29).

Intentional deviations:

- Linear owns Development maps.
- Asana owns AI Consulting and Content Editor maps.
- Jerami remains present for every ticket.
- No sub-agent, AFK ticket, automatic research dispatch, or research branch.
- No dependency on `/research`, `/prototype`, `/domain-modeling`, or
  `/setup-matt-pocock-skills`.
- No local-Markdown tracker fallback. Stop if the Lane owner is unavailable.

## Hierarchy Contract

```text
Lane        -> durable business lane
Project     -> the Lane owner project
Map record  -> one foggy route inside that project
Child record -> one decision or prerequisite
GitHub      -> linked implementation evidence only
```

The locked initiative names are:

```text
Development
Content Editor
AI Consultant
Portfolio
```

The planned Linear Development project name is exactly `S.Systems`. AI
Consulting maps use Asana project `AI Consulting` (`1218884867598641`). Content
Editor maps use Asana project `Content Editor` (`1218890014545436`). Do not
create or rename a project while using this skill.

Use one shared Wayfinder skill. Put lane-specific context in the map's `Notes`;
never copy or fork the skill per initiative.

## Development labels

```text
wayfinder:map
wayfinder:research
wayfinder:prototype
wayfinder:grilling
wayfinder:task
```

Do not normalize case, spacing, or punctuation.

## Owner operations

1. Read the Lane project, workflow, and existing tasks.
2. Stop if the intended project is missing. For Development, also stop when a
   required label is missing.
3. Create the map in the Lane owner. Use a Linear issue with `wayfinder:map` for
   Development. Use an Asana parent task for AI Consulting or Content Editor.
4. Create precise decisions as child records. Linear children use one type
   label. Asana children put the type in the description.
5. Add native dependencies after all record identities exist. If the owner
   tool cannot create the dependency, stop and give the exact manual step.
6. Leave open records unassigned until claimed.
7. Claim one record by assigning it to Jerami. Move AI Consulting work to `In
   Progress`. Keep Content Editor work in its client section.
8. Resolve it with a concise answer comment. Complete it only after the answer
   or prerequisite is observable, then update the map index.

For Development, prefer the server-side Linear GraphQL gateway and read the
result back through GraphQL. Use the Linear connector only when GraphQL lacks
the required operation. For AI Consulting or Content Editor, use the connected
Asana tool and read the result back there.

Development status contract:

```text
Backlog    -> captured, not accepted
Todo       -> accepted and currently unclaimed
In Progress -> claimed in the current session
In Review  -> answer or artifact awaiting Jerami's review
Done       -> reviewed resolution is observable
```

Set a due date only for a real deadline or scheduled review. Never invent one
for research, fog, or parked work.

## GitHub Boundary

The Lane task system owns map state, tickets, blockers, status, priority,
assignment, and resolution. GitHub may hold a linked branch, commit, pull
request, spec, or artifact produced after a decision. A backlink is evidence.
Never mirror a decision ticket as a GitHub Issue.

When implementation begins, include the Linear or Asana identifier in the
branch and pull request. Keep broad GitHub Issues Sync disabled.

## Verification

```text
npm run plugins:sync
npm run check:skills
npm run check:cerebral
npm run check:cerebral:hook-routing
npm run check:cerebral:registry
```
