# Task views

23M-275 adds the named task views from the Akiflow references. The desktop sidebar and task-queue selector use the same state. The chosen view survives reload with the existing display preferences. Phone navigation stays at the bottom; the queue opens on demand.

The views apply within the selected work lanes:

- Inbox: no planning choice and no calendar placement.
- Today: planned for today or overdue, or a calendar placement through today.
- Week: this week's plans, dated tasks and calendar placements.
- Month: this month's plans, dated tasks, overlapping week plans and calendar placements.
- Someday: an explicit Someday choice.
- All tasks: open source tasks, including blocked and review work.

A source deadline does not set a planned day. Completed source tasks stay out of the queue. Monday remains the existing calendar week boundary. Client board views keep their separate business rules.

The rendered UI test covers named view contents, deadline independence, reload, desktop sidebar selection and opening a task with one click. A separate test confirms that returning from Clients keeps the chosen calendar position. That position is retained during navigation, not across a page reload.

23M-300 also proves that Plan traps Tab within its controls and Escape returns to the task draft. Desktop duration search keeps typed text separate until Enter or a choice confirms it. Escape preserves the prior duration. Mobile uses the hours/minutes wheels.

These are technical checks. The integrated reference comparison and active-task owner UI journey remain open.
