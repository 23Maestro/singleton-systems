# Task planning storage

23M-300 needs a task duration before a calendar time exists. 23M-276 needs day, week, month and Someday choices. The current block table requires a date and stores duration only through start/end timestamps.

Supabase owns dashboard planning preferences. Linear and Asana keep task identity, content, status and deadline. Existing calendar blocks keep timed placements. Effort estimates remain separate from duration.

Use 1 `command_center_task_plans` row per owner/task:

- `owner`, `owner_id`: stable task key.
- `period`: `inbox`, `day`, `week`, `month` or `someday`.
- `planned_date`: chosen day, Monday for a week, or the first day of a month. Inbox and Someday have no date.
- `duration_minutes`: null when unset; otherwise 5–1440 minutes in 5-minute steps.
- `updated_at`: last accepted dashboard write.

The server-only public dashboard route reads and writes these rows. RLS stays enabled, with no anon/authenticated table grants. Only the existing server service role has access. Retrying a save uses the same owner/task key.

Existing blocks are not rewritten or deleted by the migration. Until a preference exists, the editor reads its date and duration from the selected block. New task preferences do not change owner deadlines.

The UI keeps explicit Save/Cancel. Removing a time keeps day and duration. Someday clears the plan date and the selected placement; it does not complete or delete the source task. Scheduling a task keeps its duration and snaps only its start time.

Proof uses the agreed rendered UI and public route. Local tests stub external HTTP only. Selected real test tasks must pass save, reload and reopen before integration is accepted. Week/month views, recurrence, slots and human effort estimates remain separate slices.

## Current proof

Migration `20261025033231` is applied and recorded on the existing linked project. Readback confirms RLS, no anon/authenticated read access, and server write access. The security advisor returned no issues.

The public route saved an untimed 5-minute plan for the existing lifecycle proof issue 23M-294. A retry returned 1 matching record. Week and month choices passed route readback; a Saturday week anchor was rejected. The proof row was returned to Inbox with 5 minutes. Source task content and status were not changed. This completed proof issue does not establish an active-client UI journey.

Eight rendered planning UI tests pass, including Remove time and phone-sheet geometry. Active-task owner UI proof and integrated visual acceptance remain open.
