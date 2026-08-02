# Linear Wayfinder Flow

## Purpose

Use Linear as the map and decision-ticket surface. Track native blockers there
so the frontier is visible without opening GitHub. Link GitHub only when a
decision produces implementation evidence.

## Live Status

- Linear connector: authenticated; workspace team `23Maestro` is reachable.
- Preferred runtime: server-side Linear GraphQL gateway with readback.
- Target labels: `wayfinder:map`, `wayfinder:research`,
  `wayfinder:prototype`, `wayfinder:grilling`, `wayfinder:task`.

## Two Lanes

Operating process:

`Wayfinder -> Spec -> Tickets -> Implement -> Code Review`

Linear status progression:

`Backlog -> Todo -> In Progress -> In Review -> Done`

The process names describe what work is happening. Linear statuses describe
its execution state; they are not the same taxonomy.

## Roles

| Surface | Owns | Does not own |
| --- | --- | --- |
| Linear | map, tickets, blockers, priority, status, assignment, resolution | implementation evidence |
| GitHub | branch, commit, pull request, implementation artifact | planning or task status |
| Codex | works one visible ticket and writes its reviewed resolution | sub-agents or background sync |
| Pull request | implementation proof and review link | discovery or prioritization |
| HTML review | scanable snapshot | canonical record |

## Operating Sequence

1. Create one Linear map issue for a destination that cannot fit one session.
2. Add only currently precise decision tickets as sub-issues.
3. Wire native Linear blocker relationships after issue identities exist.
4. Leave tickets unassigned until claimed.
5. Work one ticket in the current visible session; never launch a sub-agent.
6. Post the reviewed resolution, close the ticket, and append its linked gist to the map.
7. Graduate newly precise fog into fresh tickets and select the next frontier ticket later.
8. When implementation begins, link the Linear identifier in the branch and pull request.

## Lean Rules

- Use normal professional sentences, not Caveman voice.
- State outcome, necessary reason, and next action.
- Cut filler, hedging, pleasantries, and repeated ticket context.
- Keep full sentences where sequence, safety, or ambiguity needs clarity.
- Evidence can be long, but link it instead of pasting it into Linear or chat.
- Blockers and their resolution belong in Linear.
- Status and due dates must be intentional. Use `Backlog` for capture, `Todo` for accepted work, `In Progress` for active work, `In Review` for review/handoff, and `Done` only after the observable result is complete. Set due dates only for real deadlines, scheduled reviews, or dashboard-visible follow-ups.
- Create an HTML snapshot when it makes the route, current state, or linked decisions easier to scan.
- Add a C4-style context visual only when three or more system handoffs need explanation.
- No webhook, database, polling job, or custom sync service.

## Integration Boundary

Use native PR and commit linking. Keep broad GitHub Issues Sync off so Linear
remains the single owner for map and ticket state.

## First Pilot

Choose one real idea with enough uncertainty to need one research or decision
ticket. Do not create an unrelated issue inventory. The pilot proves the contract.
