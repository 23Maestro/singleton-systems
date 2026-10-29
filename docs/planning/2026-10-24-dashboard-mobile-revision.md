# Dashboard visual revision

Superseded by [the Akiflow clone implementation plan](2026-10-24-akiflow-clone-plan.md). Jerami rejected the cosmetic revision and requested visual and functional Akiflow parity adapted to Singleton Systems. The history below records prior work and proof; it is not visual approval.

Jerami rejected the first visual pass on mobile. Remove the small subtitles and WORK VIEW. Keep the title. Simplify client/contact entry by reducing form fields on mobile and desktop. Keep the action row.

The 6 supplied Akiflow photos belong to 23M-273. They show task capture, slot duration, repeat choices, planning choices, navigation and the day calendar. They do not prove save behavior, desktop behavior or backend storage.

## Approved tickets

1. **Trim dashboard chrome** — no ticket blockers. Keep one view title, focused tabs and the board. Keep the current client action buttons. Related: 23M-275.
2. **Shorten contact entry** — no ticket blockers. Show Name, Company and Email first, then prove create/edit/reload without losing hidden values. Related: 23M-281.
3. **Observe desktop planning** — needs Jerami sign-in and handoff. Follow one real test journey and record observed behavior. Related: 23M-273.
4. **Plan tasks on mobile** — blocked by 3 and behavior review. Prove untimed planning first, then timed planning through the shared task sheet. Related: 23M-277 and 23M-278.

The existing issues retain task ownership. Jerami approved the 4 slices and public test boundaries on October 24. Publish them as linked issues. Each complete draft lives under `.scratch/dashboard-mobile-revision/issues/`. Do not modify or close the parent issues when publishing approved child tickets.

## Approved TDD boundaries

- Browser UI: open Clients, switch view, open a card, close it and return focus at phone, tablet and desktop widths. Assert visible behavior, not class names.
- Contact flow: use create/edit/save/reload through the dashboard and public owner route. Verify required fields, failed saves and preserved optional values through that same interface.
- Planning flow: use shared task open/plan/save/reload. Test planned date separately from deadline and effort estimates. Final proof uses a selected real owner record.

The boundaries are approved. Use one failing behavior test → minimal implementation → observed integration result per slice. No bulk test-first pass and no refactor during the TDD loop.

## Review gate

The TDD skill says: “Before writing any test, write down the seams under test and confirm them with the user.” The to-tickets skill requires review of ticket size and blocking edges before publication. Both decisions are approved. Implementation remains a later selected step. Existing authorized photo storage and installer preparation can continue.

## Desktop handoff

Use the official Akiflow download through computer use. Keep installer working files on the verified HomeSSD reference path and the installed app in Applications. Jerami performs sign-in. Do not claim signed-in runtime evidence until he hands control back.

## Published tickets

- [23M-297 — Observe desktop planning](https://linear.app/23maestro/issue/23M-297/observe-desktop-planning)
- [23M-298 — Shorten contact entry](https://linear.app/23maestro/issue/23M-298/shorten-contact-entry)
- [23M-299 — Trim dashboard chrome](https://linear.app/23maestro/issue/23M-299/trim-dashboard-chrome)
- [23M-300 — Plan tasks on mobile](https://linear.app/23maestro/issue/23M-300/plan-tasks-on-mobile)

Desktop scope was confirmed on October 24. Apply subtitle and WORK VIEW removal and short contact fields at 390 px, 834 px and 1440 px. Keep the top client action buttons. Akiflow 2.83.8 is installed in Applications and open at its welcome screen. Signed-in observation awaits Jerami.

## Goal checkpoint

Jerami approved working through steps 1–6, then a grill-with-docs review of current Content Editor clients and outreach. The goal is active.

Revision 3 is published at the existing hosted review URL. It removes page subtitles and WORK VIEW on desktop and mobile. Company cards retain deliverable and due date. Contact entry starts with Name, Company and Email; More details keeps the other fields editable.

The baseline failed the agreed browser checks. The revision passes 6 tests at 390, 834 and 1440 px, including task focus return, hidden-field values, failed-save feedback and cancel. Typecheck, scoped ESLint and the default production build passed. Visual review remains open before planning work.

Owner save/reload also passed through the actual dashboard and public route. Test contact ID 1 is named Dashboard UI proof 2026-10-24. A basic Company edit kept Email, Phone and Notes after a full reload. The record remains for inspection. No existing client was edited. The hosted preview still uses sample records and blocks writes.

### Contact keyboard follow-up

A further public UI check failed because New contact left focus behind the form. The form now opens as a native dialog, focuses Name, keeps Tab within its controls, and closes with Escape from an input. Closing returns focus to New contact. Page shortcuts stay inactive while it is open. All 7 browser checks, typecheck, scoped ESLint and the default build pass. The same hosted review receives this fix; visual approval remains open.
