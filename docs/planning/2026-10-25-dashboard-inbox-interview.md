# Inbox review

Working notes from Jerami's 5 Akiflow screenshots and the photo review. This is not an ADR or an approved storage change.

## Confirmed

- Build the Inbox experience first. Put Inbox at the far left of the mobile dock.
- Match the quiet Inbox list on desktop and mobile. Keep the bottom dock on mobile and the sidebar on desktop.
- Capture a thought without first choosing a destination. Let the task be organized later.
- New Inbox captures stay unassigned until Jerami chooses a lane. Do not route them automatically to Development, Asana or another destination.
- Keep Singleton blue, red and marigold accents from the prior visual pass.
- Open description editing in its own view. Support bold, italic and checklist notes.
- Description checkboxes stay in the description. Offer a separate action to turn an item into a real subtask.
- Allow real subtasks to be added while editing a task. Do not copy every reference toolbar button. Tags, links and location buttons are not requested.
- Skip priority in this plan. Do not add a priority menu or Goal control.
- Put hours and minutes in 1 compact duration popover with 2 scroll wheels. Replace the 2 separate dropdowns. Keep the accepted numeric steps.
- Scrolling either duration wheel updates the draft. Tapping outside closes the popover. Save commits the task changes; closing the task without saving discards them.
- After a successful save or completion, show a brief rounded confirmation banner with a thin border, subtle glow and Undo for the last action. Match photo 3's treatment. Do not show success before the write succeeds.

## Organization under review

Jerami's current work is Content Editor, Development and Home. AI Consulting is dormant and remains part of the system. Home tasks should be captured and planned on this dashboard, without requiring the old home-tasks page or its Sheet. Sunsetting that page is a separate choice.

Current code has 3 Lane values and owner-backed work from Linear, Asana and Notion. Calendar blocks accept a home owner, but the shared WorkItem model does not. A home block value alone does not supply dashboard-owned task capture.

Proposal, not yet approved: keep lanes for the kind of work, projects for a client or bounded outcome, and optional tags for extra labels. Add Home as a lane with dashboard-owned tasks. Keep imported work linked to its current owner. Avoid replacing the existing lane model with a Business project and mandatory tags.

## Terms

- Inbox: captured work awaiting organization or planning. Capture does not require a lane, project or calendar time.
- Description checklist: checkboxes within task notes; these are not separate tasks.
- Subtask: a separate child task with its own completion state.
- Lane: the kind of work. Existing values are Content Editor, AI Consultant and Development; Home is proposed.
- Project: a client or bounded outcome within a lane.
- Tag: an optional label across tasks. This interview does not approve a tag system.
- Owner: the system holding the durable task. A lane and an owner are separate concepts.

## Next step

The 5-photo behavior review is complete. Jerami approved the ticket plan. Tickets 23M-303 through 23M-307 are published, with scoped color/dial notes on 23M-299 and 23M-300. Build 23M-303 first. Priority is excluded. Home lane organization remains a proposal; approval of unassigned Inbox capture does not approve that schema change.
