---
name: task-management
description: Plan selected Singleton Systems work with due-date questions and proposed time estimates, then use the shared task startup and closeout. Use for task management, taskmanagement, or a goal that needs a reviewed task plan.
---

# Task management

Use one owner ID from task creation through startup and closeout. Extend the
existing SSystems Task Updater and lifecycle commands. Work in the selected
chat. Creating a plan does not start agents or background work.

## Intake

Read the selected task, its discussion and source links before planning new
work. Match an existing record by outcome and project. Ask when the match is
unclear. Use Linear for Development, Asana for Content Editor and AI Consulting.
Keep unselected thoughts in their capture surface.

Ask for a real due date when it is unknown. Reuse a clear answer already in the
chat or task. “No deadline” means no due date. A day chosen to work on the task
is separate from its deadline. Clarify incomplete dates and time zones when a
deadline includes a time. Preserve a confirmed existing deadline.

Propose rough, editable estimates with a short basis. Show Jerami's attention,
tool runtime and external waiting separately. Use minutes or null for unknown
values. Do not report planned savings as measured results.

Use the old Opportunity HQ planning shape with current task owners: a clear
outcome, small actions, blockers and finish checks. Split attention work into
pieces of 2 hours or less. Show the first 1–3 ready actions. Parent totals
summarize children; count each child once. Keep task names short and put
source context in their descriptions.

## Review and create

Show the task shape, deadline answer and proposed estimates before creation.
Carry prior approval forward within its scope. Do not ask again for known
answers or approved test boundaries.

Run these commands from the Singleton Systems checkout. Use its existing
server-side credentials and fixed owner projects. Never print credentials.

```bash
npm run task:lifecycle -- plan --file PLAN
npm run task:lifecycle -- create --file PLAN --approved-hash HASH
```

The reviewed JSON uses stable request/task keys, parent and child finish checks,
blockedBy keys and separate attentionMinutes, toolMinutes and waitingMinutes
estimates. Set dueDate to a confirmed YYYY-MM-DD or null for no deadline. Omit
it only for an older plan whose deadline answer is unknown. Do not put a
deadline only in prose. Read back task IDs, dates, estimates and relations.
After an uncertain reply, read the result and retry the same request ID.

For Asana, preserve production notes and use supported HTML descriptions.
Free Asana stores blockers as native task links under a Blocked by heading in
each subtask. Keep linked blockers in the same deliverable. Entry reads their
current state. Missing or unrelated links leave context incomplete. Dates use
Asana's native due_on field. Preserve existing dates and production notes.
Read the owner records before replacing an older request that used paid native
dependencies. Keep the old receipt. A live client proof is still required before
calling a new owner path complete.

## Start and close out

```bash
npm run task:lifecycle -- context --owner linear --id TASK
npm run task:lifecycle -- start --owner linear --id TASK --session SESSION --turn TURN
npm run task:lifecycle -- check --owner linear --id TASK --session SESSION --turn TURN
npm run task:lifecycle -- finish --owner linear --id TASK --session SESSION --turn TURN --evidence PROOF
npm run task:lifecycle -- defer --owner linear --id TASK --session SESSION --turn TURN --reason NEXT_STEP
```

Use owner asana for client work. Use the active session and turn IDs. Start
loads current context and binds the exact task to the existing closeout.
Use a clear finish check when the task lacks one. Readback and tests do not
replace a required client or human review.

Finish only proven children, then the parent. Keep incomplete work open with
its exact next step. Completion updates the owner record; it does not delete
it. Keep one backlog and link implementation evidence. Calendar placement,
client messages and public delivery retain their own authorization.
