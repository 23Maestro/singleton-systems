# daily business planner

## confirmed requirements

The Singleton Systems dashboard helps Jerami plan his day. It grows into his daily business planner. Keep it lean and powerful.

Jerami and Codex place work in its owning system. Specific owner-system statuses determine which work appears on the dashboard. The eligible statuses remain undecided.

Queue first, confirmed September 6. Eligible work enters a selection queue. Jerami chooses what enters his day. Source status alone does not schedule work. Use the relevant Akiflow and Lunatask interactions to guide the next decisions.

Linear owns task state and decisions. Notion owns client and portfolio records. The dashboard presents those records and their allowed actions. Personal blocks keep a separate identity from clients.

Astra drives the current work. The Figma Make export supplies interface references for the existing Next.js app. Claude/Figma refinement follows the code-backed product contract.

Implementation waits for shared understanding. Ask before creating or changing an ADR.

## glossary

| term | meaning |
| --- | --- |
| Daily business planner | The dashboard used to plan Jerami's working day. |
| Owner | The system holding the durable record, as defined in `CONTEXT.md`. |
| Eligibility | The rule that determines whether owner-backed work appears on the dashboard. Exact statuses are pending. |
| Queue | Eligible work available for Jerami to choose. Entry does not commit it to today. |
| Placement | A work block's scheduled time. Its storage owner remains undecided. |
| Module | Anything with an interface and an implementation. |
| Interface | Everything a caller must know to use a module correctly. |
| Seam | A place where behaviour can change without editing the caller. |
| Adapter | A concrete thing that satisfies an interface at a seam. |

## next decision

Can Jerami choose a task for today without assigning an exact time?

Recommendation, pending Jerami: yes. A Today selection can hold untimed work alongside calendar blocks. Dragging directly from the queue to the calendar also works, without requiring an intermediate step.

[Akiflow Today](https://product.akiflow.com/articles/0741055-today-page) separates choosing a day from placing a task at a specific time. [Lunatask workflows](https://lunatask.app/docs/features/tasks/workflows) separate current focus from later candidates. These support the proposal; other product behaviours remain unselected.

Exact source-status rules and Notion task ownership remain unresolved. Live candidates show that blockers and source conflicts also matter.

[Candidate review](2026-09-05-planner-candidates.md) records live examples and a proposed module seam. It does not approve their execution.

## source anchors

- [23M-98](https://linear.app/23maestro/issue/23M-98/refactor-dashboard-stage-what-i-actually-do) holds the existing dashboard task. Its Figma-first sequence needs alignment after this interview.
- [Owner contract](../../CONTEXT.md) defines existing record ownership.
- 23Maestro's live Linear status list was checked on September 5, 2026.
- Jerami's September 5 interview answers establish the confirmed requirements above.
