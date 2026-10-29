# Dashboard rebuild tickets

Current scope and build order: [Akiflow clone implementation plan](2026-10-24-akiflow-clone-plan.md). The existing tickets are being updated to that contract. Earlier status and candidate boundaries below are historical where the newer contract differs.

Planned: October 22, 2026. Approved and published: October 23, 2026.

Status: 13 Linear tickets and 33 native blocker links verified. Implementation has not started.

## Scope

Rework `/dashboard` into a daily planner that feels like Akiflow. Replace its custom UI controls with free shadcn components. Treat existing behavior and saved planning state as candidates for improvement. Update the dashboard's tooling and register the free 1,000+ component catalog. Jerami approved this ticket plan on October 23, 2026. No install or dashboard implementation has started.

Approved catalog: Shadcn Studio. Its component page matches the requested 1,000+ free variants. Its free registry is `@shadcn-studio`. Register access and add selected components during ticket 02.

Tracker: Linear, Singleton Systems project. Map the skill's `ready-for-agent` role to `ready-for-build`. The approved breakdown is published with native blocking links. Each issue, label, and relation passed readback. Readiness does not launch work. Do not stage, commit, push, branch, create a worktree, or dispatch agents without a separate request.

The old task [23M-98: Plan work dashboard](https://linear.app/23maestro/issue/23M-98/plan-work-dashboard) was read with its comments and children. It is Done and has no comments or children. Use it as background. Do not reopen it or make new work its children. Its older four-tab sketch differs from the current code. The review in ticket 01 resolves the new direction; it does not rewrite prior decisions.

## Client interview — October 23, 2026

The interview is open. Record each answer here and in the linked Linear issue. Review the added ticket breakdown before publishing new build tickets.

### Confirmed direction

- Clients opens as a Kanban board. Use Asana and Notion as visual references. Use Quo for client details and actions that fit the selected view.
- A dropdown selects a work view. Tabs within that view narrow the work further. Favor clear named views over repeated manual filters.
- The 2 starting work views are Content Editor and Video Outreach. Content Editor has Active and Pending tabs. Video Outreach needs a Follow-up tab for contacts already emailed. Its other tabs remain open.
- Content Editor groups deliverable cards under company columns. The same company can appear in Active and Pending. Active shows open work with a due date. Define Pending separately. Cards show the task name and due date. Use Week 7 Power Rankings above Texans Rebound in the Catena Media column as the supplied layout example. Final ordering beyond that example remains open.
- Opening a deliverable shows the parent task and its subtasks in the same detail modal used by the planner. Surface planning estimates for the parent and each subtask. Jerami reports 3–5 hours as the current Catena production range. Estimate storage and parent/subtask rollup rules remain open.
- Use the Raycast view picker as a behavior reference. The exact shortcut remains open; Command-P is an example, not a browser key binding decision.
- A Follow-up action sends the selected contact and relevant history to Codex. Return a draft for review. The existing unsent-message rule still applies.
- Approved ownership: the Sheet owns outreach and connects directly to the dashboard. Supabase owns active-client records. Asana owns Content Editor deliverables; Linear owns Development tasks. Decide the lead-to-client handoff and source links before moving data.
- Carry context into work at entry and preserve results at closeout. A task link alone is not enough. Retrieve the task description, relevant comments, client record and source links before an action runs.
- Reuse the shared review handoff across repo pruning, Lineups choices and client actions. Keep the destination chat bound to the request. Return the result to its source view and owning record.

### Working glossary

| Term | Meaning |
| --- | --- |
| Work view | The dropdown choice, such as Content Editor or Video Outreach |
| View tab | A focused set within a work view, such as Active or Follow-up |
| Board card | A deliverable in Content Editor; the outreach card unit remains open |
| Board column | A company in Content Editor; separate from the domain term Lane |
| Planning estimate | Expected work time for a parent task or subtask; distinct from scheduled block length and billing workload |
| Entry context | The selected record, task owner and IDs, source links, current history, requested action, destination chat and return location |
| Closeout | Check the result, update the owning task, and leave the next action when work remains |

### Recovered evidence and gaps

The chat **Build universal command center** records the Quo client direction. Original Quo screenshots were not recovered in the scoped chat, local export and Eagle checks. The linked Supabase database had 0 contacts, 0 interactions, 0 drafts and 4 planner blocks during this review.

The preserved [review handoff plan](/Users/singleton23/.codex/worktrees/housekeeping-wip-20261013/singleton-systems/docs/planning/2026-10-07-review-batch-handoff.md) is an untracked file in the housekeeping worktree. It proposes saved review batches, a hosted queue and a private Mac relay. Its Convex storage choice is a prior proposal. The [folder review page](https://singleton-systems.com/decision-maps/2026-10-07-prune-folder-review) still saves picks in the browser and exports JSON. **Enforce Harness Completion Evidence** records a successful 0-item CLI delivery probe. A real browser batch and returned result remain unproved. Current Lineups pages also save locally and export choices.

**Task descriptions and comments** is the related closeout interview. It is waiting on whether newly found work inside approved scope should create or update a subtask. Its task-writing rules belong to that interview. This dashboard adds the entry-context requirement. Current closeout code binds IDs, URLs and finish checks; it does not retrieve full descriptions or discussion history.

Shared docs still name Notion as the client-record owner. The approved dashboard contract now uses Supabase for active-client records and the Sheet for outreach. Bring the shared documentation into accord in its reviewed follow-up. Keep Asana as the Content Editor task owner and Linear as the Development task owner.

### Ticket coverage

- The [shared task lifecycle draft](/Users/singleton23/Documents/Development/singleton-systems/docs/planning/2026-10-23-task-lifecycle-router.source.md) adds 5 proposed slices for creation, entry and closeout. It records Jev's comparison and the vetted Graphify installation. The added breakdown awaits review; the original 13 tickets remain published.
- 23M-273 owns the expanded experience map and the pending breakdown for entry context, Sheet connection and shared Codex handoff.
- 23M-281 records the Kanban default and work-view navigation.
- 23M-282 records the follow-up draft action. Its shared handoff dependency still needs a separate reviewed slice.
- 23M-98 remains historical Done work. The scoped tracker search found no separate current shared-handoff issue.

The October 23 interview updates to 23M-273, 23M-281 and 23M-282 passed description and comment readback. The later company-column and estimate decisions also update 23M-277. Added build slices remain pending review.

The ownership split is approved. Daily capacity counts Jerami's hands-on time separately from tool runtime. Tool runtime still affects finish times and blockers. Examples include draft generation, transcription, video exports and code checks after a selected request starts. Client-response waiting is a separate external wait. This time model does not authorize automatic runs. Pending-tab rules, card ordering, estimate storage and the lead-to-client handoff still need review.

### Estimate helper — proposal to clarify

The creation step needs the same small-task and blocker structure as to-tickets. Start from a goal, draft small actions, link dependencies, estimate the actions and total work, then suggest ready tasks that fit the available day. Keep larger work open across days. This belongs before task entry and closeout. It is broader than a duration picker or a prebuilt ledger.

Jerami mentions 1–3 options and being able to type a different value. The form of those choices remains open. Do not turn the unclear parts of the transcript into requirements.

Proposed behavior: opening a task loads its existing context, offers up to 3 editable estimates and a short step breakdown, and saves the selected plan to the owning task. Automatic selection of a matching task needs a clear identity rule; the transcript does not settle ambiguous matches.

The checked router resolves work categories from registry triggers. Closeout remembers an explicitly bound task. Neither checked path supplies a general client/task estimate ledger or adaptive estimate choices. The home-task system has duration presets. Catena has its runtime workload rubric. The business-time plan records actual hours and economics. These are reuse sources, not proof of the requested helper.

### Recovered HQ planning flow

The [Opportunity HQ updater prompt](/Users/singleton23/Documents/Development/singleton-systems/docs/opportunity-hq/updater-prompt.md) contains Mini-Project Plan Mode. It turns a goal into a parent task, actionable subtasks, blockers, first 1–3 priority unlocks, duration, status and suggested work date/shift. Its size labels range from Tiny through Large and Later. Its Focus Shift Export uses rough task durations to propose 3–5 realistic work blocks.

Reuse that planning structure with the approved owners. The old prompt routes durable work to Notion and contains dated priority rules; those do not override the current Asana/Linear split. The vault search found no matching operating note beyond a bundled example file. The useful HQ source recovered here is the repository prompt.

Proposed shared flow: capture the goal → plan small tasks and blockers → review estimates and capacity → save to the owning tracker → choose ready work for Today → time-block → load task context at entry → record results and remaining work at closeout. Budget hands-on time separately from tool runtime and external waiting. Automatic draft generation, task matching and calendar placement are separate decisions. Keep automation savings labeled as estimates until measured.

### Live client fields — October 23, 2026

The linked database has 0 contacts, 0 interactions, 0 saved drafts, 0 outreach attempts and 4 planner blocks. These fields already exist in `contacts`:

| Group | Fields |
| --- | --- |
| Identity | id, name, company, email, phone |
| Context | platform, relationship_context, source_url, notes |
| Classification | status, lane |
| Work and follow-up | linear_project_id, next_action, next_action_at |
| Payment reference | invoice_url, payment_note |
| Record dates | created_at, updated_at |

Status defaults to active. The current form offers lead, conversation, proposal, active, paused and closed. These contact statuses are separate from the Active/Pending work tabs. Lane defaults to AI Consultant. The form offers AI Consultant, Content Editor and Development.

`crm_interactions` holds contact-linked channel, summary, time and source URL. `crm_message_drafts` holds reusable title, Lane, subject and body, with no contact ID. The older `outreach_attempts` table has target, platform, attempt type, summary, reference set, status and dates, with no contact ID. Neither table proves an active Sheet connection.

Missing from the current contact model: an Asana client/project link and a Sheet record link. Company is text, with no separate company table in the checked CRM schema. The client deliverables panel currently matches Linear project IDs. This needs an owner-aware link for Asana work.

The task model and child-task model have no planning estimate field. The existing modal lists subtasks and stores calendar duration through block start/end times. The [Catena workload rubric](/Users/singleton23/Documents/Development/singleton-systems/plugins/s-systems/skills/upwork-hourly-rubric/references/catena-lineups-rubric.json) maps finished runtimes to workload hours. Keep that basis separate from the new planning estimates. The existing [Sheet adapter](/Users/singleton23/Documents/Development/singleton-systems/lib/home-tasks-google.ts) supplies a local read/write pattern; outreach still needs its own field mapping and connection checks.

## Current evidence

### Source locations

| Role | Source |
| --- | --- |
| Exact public route | `app/dashboard/page.tsx`, `app/dashboard/layout.tsx` |
| Main UI | `app/command-center/CommandCenterApp.tsx` — 2,181 lines |
| Task editor | `app/command-center/TaskEditor.tsx` — 726 lines |
| Schedule picker | `app/command-center/SchedulePicker.tsx` — 165 lines |
| Custom styles and theme | `app/command-center/command-center.css` — 1,997 lines; `theme.ts` |
| Server actions and snapshots | `app/api/command-center/route.ts`, `lib/command-center.ts` |
| Scheduling rules | `lib/command-center-schedule.ts` |
| Asana adapter | `lib/command-center-asana.ts` |
| Existing Akiflow notes | `docs/planning/2026-09-05-business-planner-interview.md`; `docs/planning/planning-idea-routing-research-pass.md`, “What Akiflow Gets Right” |

### Observed

- The live exact route loads. Its navigation contains Planner, Updates, and Clients. Queue is the task rail inside Planner.
- At 1,440 × 1,000, the navigation rail is 72 pixels and the task rail is 290 pixels. The default view is a full week.
- At 834 × 1,194, the calendar viewport was 482 pixels wide with 826 pixels of content. It needs horizontal scrolling. No claim of real iPad hardware testing is made.
- Opening a task's Schedule control displays a custom dialog. Pressing Escape left that dialog open in this browser run. The Close button dismissed it.
- The source contains timed placement, 15-minute snapping, drag/move/resize behavior, keyboard movement, and task/subtask actions. These are implementation observations, not proof that every live write works.
- A placement has a selected date and nullable start/end times. The storage model can represent untimed work. Saved planning state, stale references, duplication, and recovery still need end-to-end checks.
- Eligibility is hardcoded from source statuses plus blockers and Lane filters. The earlier interview left eligibility open. Review and specify the final rule.
- No root `components.json` exists. The manifest uses Next 16, React 19, and Tailwind 3.4.16. Current Studio docs use shadcn CLI v4. Installation needs a compatibility pass; the older Tailwind 3 CLI advice is not the final route for the requested current registry.
- `package.json` and `lib/command-center.ts` already have unrelated edits. Preserve them.

### Akiflow evidence and limits

REA CLI 6.7.0 performed a bounded browser launch, navigation, and waits at `https://web.akiflow.com/`. It reached `/auth/login`. The owned browser was terminated. Evidence: `ev_d109ff1519cf9d719d8a08fe85c099eb9a4e884a4ca95d96c38b24032a272999`.

The capture does not establish signed-in planner behavior, private APIs, data models, or backend implementation. No Akiflow-named application was found in the 2 standard Applications folders. REA MCP tools were absent in this session; the CLI supplied the runtime evidence. No client configuration was changed.

Official docs and a public product image support these patterns:

| Pattern | Proposed dashboard use | Evidence |
| --- | --- | --- |
| Inbox separate from planned work | Queue remains a choice pool; selecting Today is explicit | [Inbox](https://product.akiflow.com/articles/5284502-your-inbox) |
| A planned date can exist without a time | Separate Today selection, deadline, and timed placement | [Today](https://product.akiflow.com/articles/0741055-today-page) |
| Compact navigation beside task list and calendar | Collapsible task rail, fewer borders, clear selected state | [Navigation](https://product.akiflow.com/help/articles/7210597-navigating-akiflow), [official product image](https://framerusercontent.com/images/eE3zfnbwzc9vnhCbcsfkdWQG4v8.png) |
| Command bar and visible shortcuts | Search, capture, and act on a selected task without losing context | [Command bar](https://product.akiflow.com/articles/6483573-command-bar), [shortcuts](https://product.akiflow.com/articles/7262522-keyboard-shortcuts) |
| Calendar view and density controls | Useful day/week defaults, remembered view, readable iPad layout | [Calendar options](https://product.akiflow.com/help/articles/0807758-customize-your-calendar) |
| A slot contains several tasks | Persist a named container and membership; show capacity and progress | [Time slots](https://akiflow.featurebase.app/en/help/articles/3089241-time-slots) |

The public image is visual reference, not a verified screenshot of the current signed-in release. Current navigation docs take precedence over old screenshots. Exact Akiflow spacing, live transitions, undo rules, and touch behavior remain unverified.

### Library sources

- [Shadcn Studio component catalog](https://shadcnstudio.com/components): advertises 1,000+ free variants.
- [Studio CLI and free registry](https://shadcnstudio.com/docs/getting-started/how-to-use-shadcn-cli): current CLI v4 setup and free access without authentication.
- [Studio terms](https://shadcnstudio.com/license): retain source and license provenance for selected items; use the free catalog.
- [Official shadcn components](https://ui.shadcn.com/docs/components): use primitives that fit each interaction.
- [Official Calendar](https://ui.shadcn.com/docs/components/calendar): date selection; the hourly planner needs its own scheduling implementation.
- [Tailwind compatibility](https://ui.shadcn.com/docs/tailwind-v4), [older Tailwind 3 setup](https://v3.shadcn.com/docs/installation/next): choose current compatible versions during ticket 02.

## Component coverage

| Surface | Free primitives to evaluate | Ticket |
| --- | --- | --- |
| Navigation, theme, pane sizing | Sidebar, Button, Tooltip, Sheet, Resizable, Scroll Area, Separator | 03 |
| Queue, Today, filters, due labels | Checkbox, Badge, Toggle Group, Dropdown Menu, Context Menu | 04 |
| Task editor, projects, subtasks, links | Dialog/Sheet, Input, Textarea, Label, Select/Combobox, Checkbox, Popover | 05 |
| Scheduling and view controls | Calendar/Date Picker, Popover, Toggle Group, Button, Input | 06 |
| Search, capture, action menu, shortcuts | Command, Dialog, shortcut labels | 07 |
| Waiting/review, loading, empty/error state | Alert, Skeleton, Badge, Button, Sonner | 08 |
| Client board, work views, forms, next action, history | Card, Tabs, Dropdown Menu, Sheet, Avatar, Input, Select, Textarea; Table for later alternate views | 09 |
| Draft list/editor, mail preview | Dialog/Sheet, Input, Textarea, Dropdown Menu, Scroll Area | 10 |
| Calendar source controls and event detail | Checkbox, Popover, Dialog, Badge, Tooltip | 11 |
| Multi-task slots and focus | Sheet, Progress, Checkbox, Command | 12 |

All applicable dashboard controls must have an owner in this table. Keep semantic HTML and domain logic where a primitive is not a replacement. Add only used components. A stock admin template does not define the planner's UX.

## Approved tickets

### 01 — Map Akiflow experience

**What to build:** A reviewed desktop/iPad experience map for Queue, Today, calendar, task details, Clients, and recovery. Treat the current app as a baseline to improve. Use Akiflow for planning, Asana and Notion for the client workspace look, and Quo for client actions. Map the entry context, Sheet connection and shared Codex handoff described in the client interview before splitting their build work.

**First tracer bullet:** Compare one real Queue → Today → timed-block journey with the official Akiflow evidence and a proposed screen flow.

**Completion signal:** Jerami reviews the flow and state model. Each behavior has an evidence source or is marked as a design choice. Any needed signed-in observation is either captured with available access or remains explicitly unresolved.

**Expansion boundary:** Research recurrence, bulk actions, focus/rituals, AI, statistics, mobile, offline behavior, and external-calendar writes as candidates. Do not silently add them to the build scope. No new ADR without review.

**Blocked by:** None — can start immediately.

- [ ] Cover visual hierarchy, navigation, task actions, time handling, saved state, errors, and accessibility.
- [ ] Resolve the old four-tab note against the new Akiflow-style direction. Record Shadcn Studio as the approved free catalog.

### 02 — Update tools and registry

**What to build:** A current, compatible dashboard toolchain with official shadcn and the approved free Shadcn Studio registry available. A real task row renders with one installed free control.

**First tracer bullet:** A real snapshot task renders through the existing server path with a registry-installed Button and working light/dark styles.

**Completion signal:** Record installed versions and registry resolution. Install one selected free item without credentials, render it, and pass typecheck/build plus the homepage and dashboard smoke checks. Check Node, Next, React, Tailwind, PostCSS, icons, and shared utility compatibility. Read the installed Next guides before code edits.

**Expansion boundary:** Broad dependency changes unrelated to this dashboard remain separate. If Tailwind 4 is needed, treat it as an explicit compatibility migration with checks across affected routes. No blind latest-version sweep or bulk import of 1,000 files.

**Blocked by:** None — can start immediately after ticket approval.

- [ ] Register the free namespace and record source/license provenance; select one consistent primitive family.
- [ ] Preserve dirty edits and existing routes. Record any upgrade that cannot safely fit this slice before expanding work.

### 03 — Rebuild planner navigation

**What to build:** A compact shell with clear Queue/Today access, calendar space, Updates, and Clients. The task rail can collapse or resize. Theme and view preferences have an explicit persistence rule.

**First tracer bullet:** Load the real Queue in the new shell, select a task, collapse the rail, and return to the same context.

**Completion signal:** Desktop and 834-pixel iPad viewport demos show readable tasks and usable navigation in both themes. Reload checks prove the approved preference behavior.

**Expansion boundary:** Task editing, placement writes, and client forms remain in later tickets.

**Blocked by:** 01, 02.

- [ ] Replace navigation/header controls with selected free primitives and visible focus states.
- [ ] Keep independent scroll areas and a usable narrow-screen path; avoid relying on hover.

### 04 — Improve Today planning

**What to build:** Choose a source-backed task for a day without assigning time. Change the day, return it to Queue, or place it later. Improve the saved planning model, eligibility, and stale-item handling where evidence warrants it.

**First tracer bullet:** Select one eligible Asana task for Today, reload, and read back the untimed placement while its owner status and deadline remain correct.

**Completion signal:** Queue → Today → another day → Queue survives reload without duplicate or orphan placement. Test the selected eligibility rules, source completion, unavailable sources, date boundaries, and failed saves. Exercise a Development task through Linear too.

**Expansion boundary:** Hourly drag/resize belongs to 06. Multi-task slots belong to 12. Preserve business record identities while improving planning persistence.

**Blocked by:** 01, 03.

- [ ] Approve the eligibility table, planned-date/deadline distinction, and missed-day behavior.
- [ ] Use an additive migration and readback if stored planning data needs to change. No silent data cleanup.

### 05 — Improve task editing

**What to build:** Create and edit tasks through the correct owner using one consistent detail panel from the planner and client board. Cover descriptions, deadlines, projects/sections, links, and subtasks with clear save and failure states. Show planning estimates for the parent and subtasks after ticket 01 resolves their storage and rollup rules.

**First tracer bullet:** Edit an Asana task title in the new panel, save through its adapter, and reopen the owner-confirmed value.

**Completion signal:** Create/update/subtask actions read back correctly for supported Asana and Linear paths. Cancel, repeated clicks, validation, focus return, and failed writes behave correctly. Unsupported actions are explained or disabled.

**Expansion boundary:** Recurrence, priority, attachments, and bulk edits need explicit owner/API support decisions from 01. Do not invent fields the owner cannot store.

**Blocked by:** 01, 03.

- [ ] Replace custom editor controls and repair close/Escape behavior.
- [ ] Improve the current save flow where it loses state or gives unclear feedback.
- [ ] Open the same parent and subtasks from a client-board card and a planner block.
- [ ] After the estimate contract is reviewed, verify parent and subtask estimate persistence without treating calendar-block length as the task estimate.

### 06 — Improve timed scheduling

**What to build:** Place, move, resize, and remove timed work with pointer, keyboard, and touch-friendly controls. Improve calendar density, overlap handling, view selection, and state recovery.

**First tracer bullet:** Drag one task to a time, confirm the saved placement after reload, then move the same block with the keyboard.

**Completion signal:** Verify day/week views, 15-minute snapping, duration changes, overlap display, date/time-zone boundaries, cancellation, and failed-save recovery. Show a scheduling path that does not require dragging. Verify real iPad touch before claiming device support.

**Expansion boundary:** This is the hourly planner, not shadcn's date-picker Calendar. External events belong to 11 and containers to 12.

**Blocked by:** 01, 03, 04.

- [ ] Improve the custom schedule dialog using free primitives and correct focus/Escape behavior.
- [ ] Keep an explicit distinction between due date, selected day, and time block.

### 07 — Add task commands

**What to build:** Open a command bar, find live work, capture through the right owner, and use explicit actions on a selected task. Make keyboard actions discoverable.

**First tracer bullet:** Open Cmd/Ctrl+K, search a real task, and open its details without losing the current calendar context.

**Completion signal:** Search and selection work by keyboard. Capture creates one task with owner readback. Plan/complete actions use the approved flows. Escape returns focus. Typing and IME input do not trigger global shortcuts.

**Expansion boundary:** Natural-language parsing and AI scheduling are candidates, not assumed requirements. Plan actions may call the existing approved picker.

**Blocked by:** 01, 03, 05.

- [ ] Replace the custom shortcut overlay with Command-based controls and a help view.
- [ ] Show the action target and save result; prevent duplicate creates.

### 08 — Improve work updates

**What to build:** See waiting, blocked, and review work with its owner and next allowed action. Make loading, empty, partial-source failure, stale data, and retry states consistent across the app.

**First tracer bullet:** Open one real blocked/review item from Updates, follow its owner link, then refresh its current state.

**Completion signal:** A failing source does not look like an empty workload. Retry restores it. Owner changes read back. Scheduling never clears a blocker or grants approval by itself.

**Expansion boundary:** No background watchers, notification service, or new approval authority in this slice.

**Blocked by:** 01, 03.

- [ ] Replace update cards and shared feedback controls with the chosen primitives.
- [ ] Keep already loaded work usable during a partial refresh failure.

### 09 — Improve client records

**What to build:** Open Clients as Kanban. Switch Content Editor and Video Outreach through a dropdown, then use focused tabs. Content Editor has Active and Pending tabs, company columns, and deliverable cards showing task name and due date. Active shows open dated work. Open a deliverable in the shared task modal with its subtasks. Use Asana and Notion for the visual direction and Quo for client actions suited to the view.

**First tracer bullet:** Show one real Asana deliverable in its company column under Active. Open its shared task modal, confirm its subtasks, edit its due date through the owner adapter, and confirm the board after reload.

**Completion signal:** Create/edit/history flows read back from their current store. Required fields, dates, Lane, project links, empty records, and failed saves work without inventing contact details. Validate the owner contract against the existing CRM implementation before changing storage.

**Expansion boundary:** Mail/drafts belong to 10. Outreach storage and the shared Codex handoff are captured in ticket 01 for a separate reviewed breakdown. Pending-tab rules, outreach cards and board ordering remain in the experience review. The task modal and estimates belong to 05.

**Blocked by:** 01, 03.

- [ ] Replace client navigation, board, contact-form, and interaction-form controls. Show a clear work view and selected tab.
- [ ] Keep unsaved edits safe and use a usable panel on iPad-sized screens.

### 10 — Improve drafts and mail

**What to build:** Find and edit saved drafts, read the selected client's mail context, and open an addressed compose window for human review.

**First tracer bullet:** Save one draft, reopen its confirmed text, and open Gmail compose with the selected recipient and draft.

**Completion signal:** Draft persistence, account-disconnected, empty-mail, load-failure, and compose-link cases work. The flow leaves the message unsent.

**Expansion boundary:** A Codex follow-up draft action is requested and captured in ticket 01. Its shared handoff dependency needs a separate reviewed slice. Sending mail and broader mailbox import remain outside this draft-editing slice.

**Blocked by:** 01, 09.

- [ ] Replace draft menus/editors and mail-preview controls.
- [ ] Verify current recipient context before generating compose links.

### 11 — Show calendar availability

**What to build:** See selected external-calendar events alongside dashboard task blocks so meetings and personal time inform planning. Keep events distinct from tasks.

**First tracer bullet:** Read one event from an already authorized calendar and show it beside one saved task block at the correct local time.

**Completion signal:** Compare the source event with the dashboard, including all-day events and daylight-saving boundaries. Test calendar visibility, stale/disconnected state, and task/event distinction. Check access before implementation; new account grants require Jerami.

**Expansion boundary:** Start with read-only availability. Event creation, invitation, external block sync, and bidirectional writes require a later decision. This ticket does not gate task scheduling.

**Blocked by:** 01, 06.

- [ ] Confirm the available calendar source and its allowed access.
- [ ] Use consistent source visibility controls and event detail UI.

### 12 — Add multi-task slots

**What to build:** Create a named time slot, add several owner-backed tasks, move the container, and see remaining work in a focused view.

**First tracer bullet:** Save a slot with 2 real task references, reload it, and move the slot with membership intact.

**Completion signal:** Container time, task membership/order, progress, and focus view read back. Completing a member updates its task owner. Over-capacity, removal, failed writes, and slot deletion have specified behavior. Ordinary overlapping blocks never become a slot just because they touch.

**Expansion boundary:** Recurring slots, automatic grouping, AI allocation, external-calendar locking, and multi-session accounting require later slices if selected in 01.

**Blocked by:** 01, 04, 06.

- [ ] Review the additive slot/membership model before applying any migration.
- [ ] Show duration and task count without making a slot another task backlog.

### 13 — Retire legacy controls

**What to build:** Finish the dashboard migration and remove unused custom controls/styles once every active surface uses the agreed design. Review existing behavior against the new contract, not just visual parity.

**First tracer bullet:** Run capture → Today → timed block → task edit → owner-confirmed completion on the integrated dashboard using the new controls.

**Completion signal:** The component inventory has no unexplained legacy controls. Run required repo checks and build. Verify both themes, keyboard/focus, reduced motion, contrast, desktop, real iPad touch, partial failures, persistence, and source-owner readback. Provide a hosted HTTPS review on the approved release path. Deploy/promote only within the delivery authorization in force at that time.

**Expansion boundary:** Remove only code with no remaining callers. Keep domain scheduling logic when it still fits the reviewed behavior. Marketing-site redesign and unrelated dependency cleanup are excluded.

**Blocked by:** 03, 04, 05, 06, 07, 08, 09, 10, 11, 12.

- [ ] Use expand → migrate → contract so slices remain verifiable while old controls still serve unmigrated views.
- [ ] Verify affected shared routes after toolchain changes. Record missing human/device/external proof as pending.

## Published tickets

All tickets are Todo and labeled `ready-for-build`. No due dates were added. The old 23M-98 task remains unchanged. Linear owns task state.

| Plan | Linear ticket | Blocked by |
| --- | --- | --- |
| 01 | [23M-273: Map Akiflow experience](https://linear.app/23maestro/issue/23M-273/map-akiflow-experience) | None |
| 02 | [23M-274: Update tools and registry](https://linear.app/23maestro/issue/23M-274/update-tools-and-registry) | None |
| 03 | [23M-275: Rebuild planner navigation](https://linear.app/23maestro/issue/23M-275/rebuild-planner-navigation) | 23M-273, 23M-274 |
| 04 | [23M-276: Improve Today planning](https://linear.app/23maestro/issue/23M-276/improve-today-planning) | 23M-273, 23M-275 |
| 05 | [23M-277: Improve task editing](https://linear.app/23maestro/issue/23M-277/improve-task-editing) | 23M-273, 23M-275 |
| 06 | [23M-278: Improve timed scheduling](https://linear.app/23maestro/issue/23M-278/improve-timed-scheduling) | 23M-273, 23M-275, 23M-276 |
| 07 | [23M-279: Add task commands](https://linear.app/23maestro/issue/23M-279/add-task-commands) | 23M-273, 23M-275, 23M-277 |
| 08 | [23M-280: Improve work updates](https://linear.app/23maestro/issue/23M-280/improve-work-updates) | 23M-273, 23M-275 |
| 09 | [23M-281: Improve client records](https://linear.app/23maestro/issue/23M-281/improve-client-records) | 23M-273, 23M-275 |
| 10 | [23M-282: Improve drafts and mail](https://linear.app/23maestro/issue/23M-282/improve-drafts-and-mail) | 23M-273, 23M-281 |
| 11 | [23M-283: Show calendar availability](https://linear.app/23maestro/issue/23M-283/show-calendar-availability) | 23M-273, 23M-278 |
| 12 | [23M-284: Add multi-task slots](https://linear.app/23maestro/issue/23M-284/add-multi-task-slots) | 23M-273, 23M-276, 23M-278 |
| 13 | [23M-285: Retire legacy controls](https://linear.app/23maestro/issue/23M-285/retire-legacy-controls) | 23M-275, 23M-276, 23M-277, 23M-278, 23M-279, 23M-280, 23M-281, 23M-282, 23M-283, 23M-284 |

The first available tickets are 23M-273 and 23M-274. Their build and UX completion checks remain open.

## Research files

Private browser captures and complete REA evidence are under `/Volumes/HomeSSD/Generated/SINGLETON_SYSTEMS/references/2026-10-22-dashboard-akiflow/`. Keep real task screenshots out of public review pages. The evidence files are research references. Linear owns ticket state.

Open limits: signed-in Akiflow behavior is unobserved; current dashboard writes were not exercised; real iPad touch is untested; calendar access was not checked; new slot storage is a proposal. This is enough for a concrete ticket review, not a claim that the rebuild is complete.
