# Forms and records

Supabase owns clients, prospects and intake records. Each request links to
1 contact. The dashboard reads those records. Notion links retained on imported
cards identify past sources; they are not a second record owner.

Video and recruiting inquiries both belong to Content Editor. Recruiting is
the focused offer; keep the offer and form source separate from the Lane field.
AI workflow inquiries belong to AI Consulting. There are 3 forms across 2 service Lanes.

## Current source paths

| Form | Server path | Replacement flow in source |
| --- | --- | --- |
| Editing inquiry | [Video route](../../app/api/video-intake/route.ts) and [delivery](../../lib/video-intake.ts) | Saves a Supabase contact link and inquiry in one transaction |
| Recruiting inquiry | [Recruiting route](../../app/api/recruiting-intake/route.ts) and [delivery](../../lib/recruiting-delivery.ts) | Saves a Supabase contact link and inquiry in one transaction |
| AI workflow session | [AI route](../../app/api/ai-intake/route.ts) and [storage/delivery](../../lib/ai-intake.ts) | Saves a linked inquiry; keeps private audio delivery success or failure |

AI voice memos use private Supabase storage. The
[Original AI intake migration](../../supabase/migrations/20260727202653_ai_intake_requests.sql)
retains old receipts. The [client inquiry migration](../../supabase/migrations/20261111180912_client_inquiry_records.sql)
adds the shared contact and inquiry path. It was applied on November 11, 2026.
Its database tests use a rollback transaction. [Delivery outcomes](../../lib/delivery-outcome.ts) distinguish
saved receipts from delivery to the owner. Preserve that failure handling.

Run `check:client-intake` for form, retry, failure and dashboard checks.
Run `check:client-intake:db` for the private RPC and views; fixtures roll back.
Check the deployed routes and environment before a
cutover. No test inquiry should be sent to a client-facing queue without a test plan.

## Client cutover

[23M-407](https://linear.app/23maestro/issue/23M-407) owns the real-record trace
and cutover review. Check all 3 forms, dashboard reads, outreach links and return
visits against the same client or prospect ID. Keep relationship type, Lane,
payment and next action separate.

The Lane client indexes link the chosen record home:
[editing](../operations/content-editor/clients.md) and
[consulting](../operations/ai-consulting/clients.md).
Asana owns the next action; the sheet owns outreach history.

Retire a Notion source only after history is retained, replacement reads work,
failed writes can recover and owner links are checked. Deletion remains separate.

## Release check

Vercel builds check the client inquiry RPC before publishing this code. The
check sends empty fields that the first database guard rejects before any write.
A missing schema blocks the build with 23M-407 as the next step. Local builds
still run without changing live records. A main push does not apply migrations.

## Private dashboard

The dashboard, its write API and client mail lookup require the existing
Studio owner session. Open the private Studio bookmark, then return to the
dashboard. A hidden URL or `noindex` tag does not protect client records.

Release proof belongs with 23M-407. Check anonymous requests return 401 before
importing reviewed cards. Keep unknown facts marked for review.
