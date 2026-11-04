# Craft inbox

The dashboard reads Jerami’s 23Space inbox through `GET /tasks?scope=inbox`.
Opening Inbox or pressing Refresh runs the server’s `craftRefresh` command.
Refresh checks the Craft Logbook for completed captures and the Inbox for
reopened captures. The dashboard keeps its saved plans and capture IDs.

For a local completion test, set `COMMAND_CENTER_CRAFT_WRITEBACK=1` and use a
loopback dashboard URL in development. The task checkbox sends completion to
Craft and checks the source state before saving the dashboard status. Undo
reopens the task in Craft’s Inbox. Hosted writeback needs verified operator
access control.

Set `COMMAND_CENTER_CRAFT_API_URL` in the host’s private server environment.
Its value is the full Craft API connection link. It is a credential. Do not
put it in source, logs, browser storage or a `NEXT_PUBLIC_` variable.
Local macOS runs can use the craft-inbox skill’s saved Keychain connection.
Hosted runs need their own private environment value. Each read checks the
23Space ID before fetching tasks. Redirects and other spaces are rejected.

The private `command_center_inbox.source` field keeps the Craft space/task IDs,
source title, Markdown, dates and open link. A unique index protects that source
identity. A stable capture UUID keeps existing plans and blocks linked.
Refresh updates source fields and keeps local notes, lane, status and planning.
Identical refreshes keep the saved version. New entries stay unassigned.
Source title and deadline are edited in Craft. Source dates do not set a block.

A failed read leaves saved entries and plans in place and shows an error.
An uncertain import can be retried with the same source identity. Empty results
do not delete saved captures. The dashboard imports open Inbox tasks. A task
absent from both Inbox and Logbook keeps its saved status.

`tests/command-center-craft.test.mjs` checks the public route with external
HTTP replaced. Real source and database readback remain separate proof.
