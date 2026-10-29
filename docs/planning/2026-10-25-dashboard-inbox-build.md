# Inbox build

The approved plan is implemented for dashboard-owned Inbox tasks. Priority and a new Home lane are excluded.

## Visible behavior

Inbox is the far-left mobile dock action and a desktop sidebar action. It opens a quiet list with inline capture. New thoughts have no lane or provider destination. A stable capture ID makes an unchanged retry safe.

The task editor can set an existing lane, attach client context and plan an unassigned task. These choices do not send a capture to Asana or Linear. Imported tasks keep their current owners.

Description opens its own editing sheet. Bold, italic and checklist notes use the pinned free Tiptap editor and Markdown storage. Checklist notes stay separate from official subtasks. A selected checklist item can become a draft child. New dashboard children save with the parent in 1 database transaction. Cancelling the draft creates no child.

Duration uses 1 compact box with adjacent scroll wheels. Scroll and keyboard changes update the draft. Outside tap closes the box; task Save persists and Cancel discards. The accepted 5-minute steps and desktop search remain.

Successful dashboard edits and completion show the rounded green confirmation with a thin border, subtle glow and Undo. Undo uses the saved version and rejects stale edits. Combined planning changes and new child creation show confirmation without an incomplete Undo action.

Singleton blue branding, red dates/confirmations and marigold calendar/queue selection remain. The midnight label still fits its gutter.

## Proof

- 7 new rendered Inbox checks pass, including phone/desktop capture, lane/week planning, formatted notes, draft duration, completion Undo and checklist conversion to a saved child.
- 13 existing planning checks and 13 responsive checks pass.
- 4 public route checks pass. The stale-edit check failed before the new route existed, then passed.
- Typecheck and scoped ESLint pass.
- Live public route handlers saved the named dashboard proof record, retried it without duplication, saved Markdown notes and 1 child, stored a 40-minute duration, completed/reopened the task and rejected a stale write with HTTP 409. The proof parent and child end Done. No imported source task was edited.
- Proof parent: `ac514081-752a-44c5-b7b6-ce695b3da481`. Child: `bc514081-752a-44c5-b7b6-ce695b3da481`.
- Migrations `20261025083922` and `20261025084841` are applied and recorded. RLS is enabled. Table/function access is server-only. The security advisor reports no issues.
- Visual proof is under HomeSSD `Generated/SINGLETON_SYSTEMS/references/2026-10-25-inbox-proof/`.

## Review boundaries

The hosted Site uses sample records. Inbox edits persist only in that browser. It has no production credentials or source-owner writes. Production source/API publication remains separate.

Keep these open: human visual review; full source-owner formatting/subtask round trips; explicit duplicate-safe provider handoff; Undo covering a combined plan/content change; final bound code verification. Task 23M-303 awaits its hosted visual review. Parent 23M-273 remains open.
