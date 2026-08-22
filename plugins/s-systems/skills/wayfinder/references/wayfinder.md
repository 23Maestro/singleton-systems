# Linear Wayfinder Operations

Owner: `singleton-systems`

Upstream reviewed: Matt Pocock's `skills/engineering/wayfinder/SKILL.md`
at commit `38d62e71ed01fc05d5ae63b0807172e9546049d5` (2026-07-29).

Intentional deviations:

- Linear is the issue tracker.
- Jerami remains present for every ticket.
- No sub-agent, AFK ticket, automatic research dispatch, or research branch.
- No dependency on `/research`, `/prototype`, `/domain-modeling`, or
  `/setup-matt-pocock-skills`.
- No local-Markdown tracker fallback; stop if the Linear setup is unavailable.

## Hierarchy Contract

```text
Initiative -> durable business lane
Project    -> finite engagement, delivery outcome, development effort, or packaging effort
Map issue  -> one foggy route inside that project
Sub-issue  -> one decision or prerequisite
GitHub     -> linked implementation evidence only
```

The locked initiative names are:

```text
Development
Content Editor
AI Consultant
Portfolio
```

The planned Development project name is exactly `S.Systems`. Creating or
renaming initiatives and projects belongs to a separately reviewed Linear
configuration pass. Do not silently substitute `Singleton Systems` or create
missing records while using this skill.

Use one shared Wayfinder skill. Put lane-specific context in the map's `Notes`;
never copy or fork the skill per initiative.

## Labels

```text
wayfinder:map
wayfinder:research
wayfinder:prototype
wayfinder:grilling
wayfinder:task
```

Do not normalize case, spacing, or punctuation.

## Linear Operations

1. Read the initiative, project, team workflow, labels, and existing issues.
2. Stop if the intended initiative, project, or label is missing. Report the
   exact missing name; do not invent it.
3. Create the map as a project issue with `wayfinder:map`.
4. Create precise decision tickets as map sub-issues with one type label.
5. Add native Linear blocker relationships after all issue identities exist.
   If the available GraphQL operation cannot create the relationship, stop and
   provide the exact manual Linear step. Do not replace native blockers with a
   quiet body convention.
6. Leave open tickets unassigned and not `In Progress` until claimed.
7. Claim one ticket by assigning it to Jerami and setting `In Progress`.
8. Resolve it with a concise answer comment. Move it to `Done` only after the
   answer or prerequisite is observable, then update the map index.

Prefer the server-side Linear GraphQL gateway over the connector for reads and
writes. Keep credentials server-side and read the result back through GraphQL.
Use the connector only when GraphQL lacks the required operation, and state the
fallback before mutation.

Status contract:

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

Linear owns map state, tickets, blockers, status, priority, assignment, and
resolution. GitHub may hold a linked branch, commit, pull request, spec, or
artifact produced after a decision. A backlink is evidence, not state
ownership. Never mirror a Linear decision ticket as a GitHub Issue.

When implementation begins, include the Linear identifier in the branch and
pull request. Keep broad GitHub Issues Sync disabled.

## Verification

```text
npm run plugins:sync
npm run check:skills
npm run check:cerebral
npm run check:cerebral:hook-routing
npm run check:cerebral:registry
```
