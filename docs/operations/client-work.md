# Client work

[Clients & Work](https://docs.google.com/spreadsheets/d/1RI6OGmv9HF5NTmHJu4Vk6QInT3Fs5-lOeXUZPTp8y28/edit)
keeps outreach and work history in one workbook. Keep its existing outreach tabs.
Supabase owns client facts. Asana owns editing and consulting tasks. The sheet
owns work-event history; an invoice owns billed amounts. Link these records.
Do not create a second editable JSONL ledger or a new plugin.

## Read at entry

Match the Supabase contact ID, source channel and existing task. Read the
client's work tab and its cell notes before estimating, invoicing or resuming.
A client start date is not a database row's creation date. Keep confirmed dates
exact and approximate dates marked. A prospect has no paid-client start date.

Use 6 columns in each work table:

| Column | Record |
| --- | --- |
| Assignment | One job or a requested revision, with a stable work ID in its cell note |
| Work date | When work happened or delivery was verified; state which date is known |
| Air date | Planned, changed or confirmed airing; keep the earlier date in the note |
| Deliverables | Names and final counts; versions do not add original deliverables |
| Hours | Recorded billed hours, measured time, a labeled estimate with its basis, or Unknown |
| Billing / proof | Fee or billing state, with invoice, task, source and final-file links in the note |

Keep client start, acquisition channel and short context in the Clients tab,
linked to the same Supabase contact. That tab is a readable summary of the
client card. Keep the account context in Supabase; refresh the summary after
changes. Record a sample or test edit as acquisition work until paid work is
confirmed. Link an accepted test edit to its Asana task, even before a sale.

## Record at closeout

Find the work ID before writing. Update the existing row for status or proof;
add a linked revision row when a new request changes the work. Put the reason,
request source, prior work ID and billing decision in its cell note. Preserve
earlier delivery and air dates. A corrected upload alone does not authorize an
extra charge. Count shared hours once and link rows that share a billed package.

Read back the row, notes and source links. Put its link in the task's current
result. Then use the existing task closeout. An unpaid invoice or unknown hours
does not reopen an approved media delivery; keep billing review distinct.
This is an agent closeout step, not an enabled background sync or calendar rule.

## 745 Creative and FaithTalk

Contact ID `45` owns the [745 Work tab](https://docs.google.com/spreadsheets/d/1RI6OGmv9HF5NTmHJu4Vk6QInT3Fs5-lOeXUZPTp8y28/edit#gid=2026111602).
Read its context before applying an old episode label or hourly comparison.
An episode number is not an edit count. Map paid scope to actual work events;
do not infer that a new outro was prepaid from the label “Episodes 2–5.”
Keep broadcast outro work separate from the social package.

For local proof, inspect `/Volumes/MediaSSD/05_FINISHED/745Productions/` for
John, Ben and Eric. FaithTalk work and assembly records are under
`/Volumes/HomeSSD/Active Work/FAITHTALK/`; kept deliveries are under
`/Volumes/HomeSSD/Media Library/FAITHTALK/Deliverables/`. Verify each path and
follow its source record before use. File dates after migration do not prove
the original delivery date. Review-only renders are not client deliveries.

Catena uses the same record shape with its existing billing rubric. Keep
House of Valentina sample work linked to its prospect card and Asana owner.
Backfill each client from source evidence; do not invent historical hours.
