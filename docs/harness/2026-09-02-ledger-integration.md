# Ledger integration

## Target

Singleton Systems owns the Next.js app. Vercel hosts the preview. Supabase
owns saved ledger data. Figma Make supplies design concepts only.

The port adds no dependencies. It excludes the Vite scaffold and Figma
package files. Home, Entry, and Plan use the approved interface and payment
rules. CSS is scoped to Ledger. Provider icons are bundled under `/ledger/`.

## Built

The server validates entry, payment, balance correction, and item-edit
commands. Supabase commits the ledger state and operation receipt together.
Request IDs prevent repeated deductions. Revision checks reject conflicting
writes. Item edits do not record payments.

The browser reads Supabase through Next.js server routes. Service-role
credentials stay on the server. Financial data is absent from client seed
bundles and local storage. Theme preference remains browser-local.

## Data boundary

The Supabase schema and data cutover are applied. All 23 legacy
records remain in place. The import keeps a verified complete legacy snapshot,
4 historical transactions, and 38 catalog items. The old aggregate subscription
row remains inactive. Existing live debt figures take precedence over matching
catalog figures. No current bank balance is inferred from old transactions.

Old ledger writes are now rejected to prevent two writable owners.

## Review Gate

Next.js build, typecheck, and ledger checks pass. Database tests cover atomic
writes, replay, stale revisions, and private grants. Test data was rolled back.

The [Vercel preview](https://singleton-systems-mm8fhawhs-23maestros-projects.vercel.app/finances)
is ready. Deployment: `dpl_7EhWJMuqxbC918rHBgGzLov7uc9K`.
Jerami selected no login. The preview is unlinked and marked noindex; it has
no access restriction. Production was not promoted.

The hosted API reads Supabase. An unchanged item save and its retry both
succeeded, with one operation receipt and no change to financial values.
The preserved legacy snapshot matches all 23 source records. Home, Entry,
Plan, the item editor, and the P² dialog were checked in the hosted browser.
Entry geometry has no horizontal overflow at 320 and 390 pixels. The install
manifest returns 200. Physical-phone installation remains untested.

Enter the current bank balance on Home before recording payments. No test
balance or payment was imported. Refunds and payment reversal remain outside
this build, as recorded in the original handoff.
