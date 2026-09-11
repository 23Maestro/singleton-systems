# planner candidates

Checked September 5, 2026, America/New_York. Records are candidates for product review. Their presence does not confirm that the work remains undone.

## source inventory

| source | observed state |
| --- | --- |
| Linear, 23Maestro, unarchived | 26 Todo, 2 In Progress, 4 In Review; all pages retrieved. |
| Notion, Cadence HQ Clients | Active and Lead views returned 4 Active and 5 Lead records. Paused records were outside this pass. |
| Notion, Cadence HQ Tasks | Active Queue returned 38 rows: 36 Queued, 1 Waiting, 1 Parked. None Today or In Motion. |
| Home Tasks, Google Sheets Chores | 7 rows: 1 Today and 6 Pending. Direct read through listHomeTasks succeeded. |

## representative candidates

| record | stored state | proposed use |
| --- | --- | --- |
| [Steelers QB transcript + storyboard](https://linear.app/23maestro/issue/23M-156) | In Review; due September 7; linked review packet | Review card and owner-linked action. |
| [Anne Beaver](https://linear.app/23maestro/issue/23M-145) | Todo; due September 1; linked Notion lead | Follow-up candidate. Confirm present communication state before sending. |
| [Ginain Grayes](https://app.notion.com/p/3ac4c8bd6c2681279f7de41d0a75c249) | Active; next touch September 2 | Reconciliation example. Notion records the follow-up and September 4 brief; Linear 23M-146 still asks for the September 2 follow-up. |
| [Catena Media](https://app.notion.com/p/3ac4c8bd6c268194af04eb7258e7bf8b) | Active; next touch September 3 | Relationship follow-up cue, separate from the Steelers production review. |
| [Capture: Eagle proof library](https://app.notion.com/p/3914c8bd6c268167b314eba1e0e6939c) | Queued; 15m; defined completion | Notion task candidate. July record needs relevance confirmation. |
| Unmount Ps5 Kit | Pending; 10m | Personal placement example. |
| Organize Cabinet | Pending; 15m | Personal placement example. |

## exclusions and unresolved facts

23M-152 is Todo but blocked by 23M-150 and 23M-151. Status alone cannot establish readiness.

Command Canine is Active but its page is empty. Client activity alone cannot supply a next action. Jacob Hill Add-Ons links its client but lacks a concrete next action.

The Home Tasks Today flag has no date. Its row IDs contain July timestamps; current urgency is unverified. Completion currently deletes the source row.

Notion's existing portfolio task state conflicts with the blanket Linear task-ownership contract. Direct scheduling needs an explicit ownership exception. No migration is approved.

## proposed module seam

One planner-read module returns candidates with owner identity, native status, reason for inclusion, source link, and observed time. Source failures stay visible. Failed reads never mean an empty queue.

Internal adapters handle Linear issue relations, Notion task/client distinctions, and Sheets rows. The implementation keeps source reads free of writes. The current Home Tasks GET also calls listHomeTaskOptions, which can create or seed a sheet; use listHomeTasks for read-only discovery.

Scheduling storage and write actions remain undecided. No ADR or implementation change is included.
