# GitHub + Linear Wayfinder Flow

## Purpose

Use Linear on mobile to make a short decision. Keep the evidence and durable
record in GitHub. Let Codex copy the decision into the linked GitHub issue.
Track blockers in GitHub so the map always shows which ticket can move next.

## Live Status

- GitHub and Linear: confirmed integrated for Singleton Systems.
- GitHub target: `23Maestro/singleton-systems`.
- Linear connector: authenticated; workspace team `23Maestro` is reachable.
- Shared Wayfinder labels: `Wayfinder: Research`, `Wayfinder: Grilling`,
  `Wayfinder: Prototype`, `Wayfinder: Manual Setup`.

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
| Linear | priority, status, owner, current decision, next move | research body or decision history |
| GitHub | map issue, blockers, findings, case studies, prototypes, specs, ticket history | mobile triage |
| Codex | reads linked pair, writes approved decision ledger, builds approved work | autonomous background sync |
| Pull request | implementation proof and review link | discovery or prioritization |
| HTML review | scanable snapshot | canonical record |

## Operating Sequence

1. Start a GitHub map issue when a loose idea is too large or foggy for one session.
2. Add child issues only where research, a grilling decision, a prototype, or manual setup reveals a real branch in the route.
3. Record `Blocked by`, `Blocks`, and `Next unblocked ticket` on the map and child issue. Use native GitHub relationships when available.
4. Link a concise Linear item only when the item needs a mobile decision, priority, ownership, or an active next move.
5. If the Linear item is blocked, include only the blocker and the action that clears it.
6. Make the decision in Linear on mobile:
   `GitHub: URL`, `Blocked by: URL or none`, `Decision: sentence`, `Next: action`.
7. Assign the Linear item to Codex or ask Codex to update it.
8. Codex adds this comment to GitHub:
   `Decision`, `Status`, `Reason`, `Next ticket/PR`.
9. Close or update the current child issue, return to the map, and choose the next unblocked ticket.
10. When implementation begins, link the Linear identifier in the branch or PR title; Linear tracks PR status through its native GitHub integration once enabled.

## Lean Rules

- Use normal professional sentences, not Caveman voice.
- State outcome, necessary reason, and next action.
- Cut filler, hedging, pleasantries, and repeated ticket context.
- Keep full sentences where sequence, safety, or ambiguity needs clarity.
- Evidence can be long, but link it instead of pasting it into Linear or chat.
- Blocker history belongs in GitHub; Linear shows only what blocks the current decision.
- Create an HTML snapshot when it makes the route, current state, or linked decisions easier to scan.
- Add a C4-style context visual only when three or more system handoffs need explanation.
- No webhook, database, polling job, or custom sync service.

## Integration Boundary

GitHub and Linear are confirmed integrated for Singleton Systems. Use their
native PR and commit linking. Keep broad GitHub Issues Sync off so GitHub
remains the complete research and evidence record.

## First Pilot

Choose one real idea with enough uncertainty to need one research or decision
ticket. Do not create an unrelated issue inventory. The pilot proves the contract.
