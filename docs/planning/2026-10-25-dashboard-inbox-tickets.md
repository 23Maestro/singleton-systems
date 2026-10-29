# Inbox tickets

Approved by Jerami and published to Linear on October 25, 2026. Priority is excluded. The existing parent stays unchanged.

## Existing work to reuse

1. **Verify brand colors — 23M-299.** No new blocker. Verify blue desktop branding, red dates/confirmations, marigold selected queue/calendar work and the full time gutter in both themes. The palette is already implemented in preview version 11. Prove it on the new Inbox surfaces as they land. Do not create a duplicate palette ticket.

2. **Refine duration dial — 23M-300.** No new blocker for the existing source-task path; preserve existing native tracker blockers until reviewed. Use 1 compact box with side-by-side hours/minutes scroll wheels. Scrolling changes the draft; outside tap closes the box; Save commits and Cancel discards. First tracer: save/reload a 40-minute duration. Prove mobile touch/keyboard access and desktop behavior without losing the accepted numeric steps. Do not create a duplicate dial ticket.

## New slices

### 3. Capture Inbox thoughts

## What to build

Open Inbox from the far-left mobile dock button or desktop sidebar. Show a quiet list with inline Add task. Save a title-only thought to durable dashboard storage without asking for a lane, project or date. Keep imported tasks separate from newly captured thoughts.

## First tracer bullet

Capture 1 title, reload and reopen it with no lane or external task created.

## Completion signal

Use the approved rendered dashboard UI and public HTTP route seams. Start with a failing behavior test, implement the smallest complete path, then prove save/reload through the public route. Check 390/430 px mobile and 1440 px desktop; provide a hosted HTTPS preview for human visual review. Preserve imported task identity and existing production records.

## Expansion boundary

Lane assignment, provider handoff, Home taxonomy, description formatting, subtasks and Undo belong to later slices.

## Acceptance criteria

- [ ] Inbox is leftmost in the mobile dock; the separate + action remains reachable.
- [ ] A saved capture survives reload and stays unassigned; no automatic Linear or Asana routing occurs.
- [ ] A failed save keeps the typed thought and shows an error; retry creates 1 record.
- [ ] Existing mobile calendar, desktop sidebar and brand colors stay intact.

## Blocked by

None — can start immediately.

### 4. Organize Inbox tasks

## What to build

Open a captured thought, explicitly choose an existing lane/project, and plan a day or time block. An unassigned capture can also be planned without forced routing. Imported tasks retain their owners. Any explicit provider handoff must preserve context and avoid duplicate tasks or calendar blocks.

## First tracer bullet

Plan 1 unassigned capture, save/reload it, then explicitly assign 1 selected capture and reopen the same logical task in its destination.

## Completion signal

Use the approved rendered dashboard UI and public HTTP route seams. Start with a failing behavior test, implement the smallest complete path, then prove save/reload through the public route. Check 390/430 px mobile and 1440 px desktop; provide a hosted HTTPS preview for human visual review. Preserve imported task identity and existing production records.

## Expansion boundary

Home as a new lane, tag systems, retiring the old Home Tasks page and bulk migration are excluded.

## Acceptance criteria

- [ ] No destination is chosen automatically.
- [ ] An unassigned thought can be time-blocked and reopened without creating an external task.
- [ ] Explicit assignment persists with a stable task identity and the same notes and plan.
- [ ] Provider handoff failure leaves the original capture visible; retry does not duplicate it.

## Blocked by

capture-inbox

### 5. Format task notes

## What to build

Open a dedicated description editing view from a task. Support bold, italic and checklist notes. Return to the task draft, then use Save to persist. Keep checklist entries in the description. Create child tasks only through an explicit action.

## First tracer bullet

Add bold text and a checked description item to 1 Inbox task; save, reload and reopen with the same formatting and checked state.

## Completion signal

Use the approved rendered dashboard UI and public HTTP route seams. Start with a failing behavior test, implement the smallest complete path, then prove save/reload through the public route. Check 390/430 px mobile and 1440 px desktop; provide a hosted HTTPS preview for human visual review. Preserve imported task identity and existing production records.

## Expansion boundary

Real subtasks and checklist conversion belong to the next slice. Do not add tags, links or location toolbar buttons.

## Acceptance criteria

- [ ] Mobile uses the focused description sheet and bottom formatting toolbar from photo 2; desktop has the same editing behavior.
- [ ] Bold, italic and checklist notes persist after save/reload.
- [ ] Returning from description editing preserves the task draft; cancelling the task does not save it.
- [ ] Imported owner content round-trips without losing unsupported existing content; unsupported edits are explicit.

## Blocked by

capture-inbox

### 6. Create task subtasks

## What to build

Add an official child task while editing a task, or explicitly turn a description checklist item into a child. Keep ordinary description checkboxes as notes. Save through the correct task owner and show the same child from Inbox, Planner and the client task editor where applicable.

## First tracer bullet

Convert 1 checklist item into a real child, save/reload and complete that child without completing the parent.

## Completion signal

Use the approved rendered dashboard UI and public HTTP route seams. Start with a failing behavior test, implement the smallest complete path, then prove save/reload through the public route. Check 390/430 px mobile and 1440 px desktop; provide a hosted HTTPS preview for human visual review. Preserve imported task identity and existing production records.

## Expansion boundary

Automatic breakdowns, child estimates, recurrence and rebuilding client views are excluded.

## Acceptance criteria

- [ ] Direct subtask creation and explicit checklist conversion create 1 child each, with duplicate-safe retries.
- [ ] Checklist conversion preserves the item text and leaves no ambiguous duplicate checklist item.
- [ ] Parent and child completion remain separate; child state survives reload.
- [ ] A failed child write preserves the draft and original checklist item.

## Blocked by

format-description

### 7. Undo task changes

## What to build

After a successful task edit or completion, show a brief rounded banner with a thin border, subtle glow and Undo for the last successful action. Undo restores that action through the same durable owner and updates the visible task.

## First tracer bullet

Complete 1 selected Inbox task, use Undo in the banner, then reload and confirm the task is open again.

## Completion signal

Use the approved rendered dashboard UI and public HTTP route seams. Start with a failing behavior test, implement the smallest complete path, then prove save/reload through the public route. Check 390/430 px mobile and 1440 px desktop; provide a hosted HTTPS preview for human visual review. Preserve imported task identity and existing production records.

## Expansion boundary

Bulk Undo, full history, external concurrent-write reversal and deleting newly created tasks are excluded. Reject stale reversal. Preserve newer task changes.

## Acceptance criteria

- [ ] Show success only after the write succeeds.
- [ ] Undo restores the last edit or completion and survives reload; failed Undo shows a clear error.
- [ ] Use the photo 3 banner style with readable text, a subtle glow and an accessible Undo action in both themes.
- [ ] A newer successful action replaces the prior Undo; keyboard and touch users can reach it.

## Blocked by

capture-inbox

## Sequence

Build Inbox capture first. Then organize/plan captures and refine the existing dial. Format descriptions before checklist-to-subtask conversion. Add Undo on the durable capture path. Colors are a shared acceptance rule, not a gate on storage or capture. Each slice has its own hosted visual review.

## Outside this plan

Priority and Goal, a new Home lane, tag systems, sunsetting Home Tasks, recurrence, slots, sync research, production deployment and automatic task routing. Home capture can use the unassigned Inbox until the lane/storage choice is reviewed.

## Publication

Created 5 narrow children under 23M-273. All 4 native blocker links, parent IDs and ready-for-build labels passed live readback. Added and verified scoped color/dial comments on 23M-299 and 23M-300. The existing parent description and state were preserved. Estimates remain unknown; task creation does not start implementation.

## Published records

- [23M-303: Capture Inbox thoughts](https://linear.app/23maestro/issue/23M-303/capture-inbox-thoughts) — blocked by none.
- [23M-304: Format task notes](https://linear.app/23maestro/issue/23M-304/format-task-notes) — blocked by 23M-303.
- [23M-305: Organize Inbox tasks](https://linear.app/23maestro/issue/23M-305/organize-inbox-tasks) — blocked by 23M-303.
- [23M-306: Undo task changes](https://linear.app/23maestro/issue/23M-306/undo-task-changes) — blocked by 23M-303.
- [23M-307: Create task subtasks](https://linear.app/23maestro/issue/23M-307/create-task-subtasks) — blocked by 23M-304.

Build frontier: 23M-303. No implementation was started by publication.
