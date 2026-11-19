# Tools and records

Historical tool checks: November 6 and 17, 2026. Recheck account identity,
permissions and schemas on use. Use a working CLI or API first. Follow the
active workspace browser rule when browser work is needed.

## Working tool path

| Job | Verified path | Readback |
| --- | --- | --- |
| Search and read mail | Gmail connector, `jerami@singleton-systems.com` | Full messages, labels and all related threads |
| Save an approved draft | Gmail connector draft tools | Exact recipient, subject, body and thread |
| Send when authorized | Gmail connector send-draft tool | Returned message ID and `SENT` label, then message readback |
| Read and update sheet | `gws sheets` CLI | Exact values, formulas, notes and native date formats |
| Read sheet with Composio | Local `GOOGLESHEETS_VALUES_GET` | Successful read of `Prospects!A6:F10` |
| Manage next task | Connected Asana tools | Task ID, parent, description, comments and native due date |

A prior live check saved and read back an unsent draft in its original thread.
The Sheets CLI could not read its credential in the background, and hosted
Composio had a temporary quota error. The existing repository `getSheetsClient`
in `lib/google-sheets.ts` read and updated the sheet through its existing
connection. Use that bounded fallback without copying tokens or starting a
new sign-in. Read the row values, event note and formulas back. These checks
do not prove a scheduled notice. Keep contact details and draft receipts in
their existing records, outside this public guide.

Asana rich text accepts a `<body>` root with headings, emphasis, links and real
newlines. Paragraph `<p>` tags returned “XML is invalid” in the native tool;
use newlines for paragraphs. Read both saved description fields back.

Local Composio discovery lists Gmail thread/draft tools, Sheets value tools and
Asana task tools. Only Sheets was connected in this CLI session. Gmail and
Asana discovery is capability evidence. It is not a successful account action.
Keep the working connector path for those services. Revisit Composio when a
required operation is missing or Jerami chooses a migration. No new connection
is needed for this skill's current workflow.

On November 6, `gws docs documents get` did not yield the playbook text in this
session. The Google Drive connector returned it. Keep retries scoped to the
failed operation and inspect a write result before choosing another path.

## Sheet mapping

Use the outreach sheet linked by the active workspace guide. Resolve its ID
and read current tab metadata before a range read or write.

| Tab | Role |
| --- | --- |
| Follow-ups | Short `Who`, `Next step`, `When` view in A:C |
| Prospects | Lead records, header row 6, data from row 7 |
| Board | Derived visual board, preserve its formulas |
| Data Brokering | Separate buyer-intake work, outside client acquisition |

Prospects columns A:R are `Prospect`, `Contact`, `Status`, `Sent at (ET)`,
`Follow-up due`, `Next action`, `Email thread`, `Sample`, `Market`,
`Relationship`, `Contact source`, `Video / service`, `Evidence date`,
`Minutes`, `Fit / qualification`, `Website`, `Stage order`, `Board key`.
S:Z are reserved for lead/chat/request/draft fields used by the existing repo
helper. Preserve their contents and labels.

Read metadata and row 6 before any write. Resolve the row by a stable Lead ID
when present. Otherwise match the exact contact, prospect and opportunity,
then re-read before mutation. Never rely on an old row number.

Keep coarse Status values compatible with the board. Map new outreach to
`Not contacted`, cold waiting and shared samples to `Awaiting reply`, human
conversations to `Replied`, and wins/declines/opt-outs to `Closed`. A park after
cold silence is an `Awaiting reply` row with an explicit parked stage note,
cleared email follow-up date and an internal review task. A hard bounce stays
held for address review with the failed address marked in its note. Do not
invent new Status enums or change board formulas to express the finer stages.

D records the latest actual outbound time in Eastern. Preserve older timestamps
as separate events before replacing D. E holds the next message-review date.
Clear E when no message is due. F names the next action or internal review.
G links to the current relevant Gmail thread. Use its cell note for the finer
stage, original history and event list. H holds the actual sample link.

## Event record

Preserve existing note text. Append an `Outreach events` section to the note on
G only during an authorized record update. Keep 1 entry per actual event. Use
message IDs to avoid duplicates. A revised summary never replaces history.

```json
{
  "event_id": "gmail:<actual-message-id>",
  "direction": "outbound",
  "kind": "sample_permission",
  "at": "<actual timestamp with offset>",
  "thread_id": "<actual-thread-id>",
  "stage_after": "permission",
  "evidence_url": "<Gmail message URL>"
}
```

For non-email events, use a channel and a checkable source ID. Keep a phone call
and an email as separate events. Never infer a send, reply, call or agreement
from an old task or a drafted message. Record a draft ID as draft evidence
outside the send-event count.

## Sheet commands

```bash
gws sheets spreadsheets get --params '{"spreadsheetId":"<spreadsheet-id>","fields":"sheets.properties"}'
gws sheets spreadsheets values get --params '{"spreadsheetId":"<spreadsheet-id>","range":"Prospects!A6:Z40"}'
```

For hyperlinks, formulas, notes or native date checks, read the selected ranges
with `spreadsheets get`, `includeGridData=true` and bounded fields. Use sparse
updates. Notes require a narrow `updateCells` request with `fields="note"`.
Preserve hyperlink formulas when changing a linked cell. Keep native dates
compatible with existing formatting. A visual date label is not its stored value.

## Asana and recovery

Use the matching Lane's existing project and accepted outreach task from the
workspace guide. Read current project membership, children and next actions
before writing. Reuse the current task. For a shared task, keep each person's
date in the sheet and set the task date to its earliest unresolved action.
Add a per-contact subtask only when the requested work needs one. Do not
create duplicate tasks on each run.

Put current deliverable and next action in the task description. Put send
receipts and review findings in comments. Write descriptions as XML-compatible
`html_notes` inside `<body>`. Use native `due_on`, then read both description
fields and due date back. Follow repository task-closeout rules for selected work.

Before changing either system, retain the selected values, source IDs and
intended writes. Read again immediately before writing. Sheets does not provide
an atomic compare-and-swap through these tools. Use 1 writer for the selected
lead. If values changed, rebase the proposed update on the new facts.

After a send, verify Gmail first. Then merge the event, update the lead's next
state, and update its Asana next step. Read each write back. If 1 update fails,
report which systems are current and retry only the missing write. Look for the
message ID before appending the event again. Never resend to repair the ledger.
