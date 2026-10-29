# Shared task lifecycle

October 23, 2026. Approved by Jerami. The 5 tickets and 6 native blocker links are published and verified. 23M-287 is Done after Jerami's review. Implementation is active on 23M-288. This extends the dashboard plan.

## Recommended shape

Extend the existing SSystems plugin and Cerebral router. Use one lifecycle: capture → plan → create in the owner → load entry context → work → read back results → close out or leave the next action. The same task ID must survive the whole path.

The repository already has route resolution, Asana and Linear transports, exact task bindings, and a transaction engine with declared owners, dependencies and receipts. Current system transaction adapters are readback-only. They do not yet create this complete lifecycle. Reuse the contract and working transports; implement the missing paths.

Touch the systems declared for the selected action. A client delivery may need its Asana task, Supabase client link and dashboard view. A Development task does not need a duplicate Asana record. Keep links and integration proof without copying task state into another backlog.

| Record | Owner |
| --- | --- |
| Development task, children and blockers | Linear |
| Content Editor and AI Consulting task state | Asana |
| Outreach lead and follow-up data | Google Sheet |
| Active-client record | Supabase |
| Code and routing policy | Repository |

Every request needs an action ID, owner and record ID, source links, selected scope, destination chat when needed, and a return location. Check existing records before creating. Retry an uncertain write by reading its result first. Keep partial work visible. Load task descriptions, relevant comments and client/source context at entry. Close only proven work and keep unfinished actions open.

Estimates show hands-on work, tool runtime and external waiting separately. Use native owner fields where supported; otherwise review a labeled task-detail format. Store a task's estimate with its owning task, not in an unlinked JSON ledger. Parent totals must avoid counting the same child work twice. Show assumed savings as estimates until measured.

Proposed V1 defaults for this ticket review: use supported native estimate fields, with labeled task details as the fallback; show the estimate source and allow edits. An explicit task ID or source link binds that record without asking again. An ambiguous task match needs a choice. A task-creation request authorizes its stated scope; inferred added scope still needs review. Calendar placement stays a reviewed action.

## Verified source points

- Cerebral registry and prompt hook resolve the work route.
- `lib/command-center-asana.ts` and `lib/linear-api.ts` supply server-side transports.
- `lib/task-closeout.mjs` binds task IDs and finish checks, verifies task trees and defers unfinished work.
- `lib/transactions/engine.mjs` supplies transaction state, dependencies, retries and review gates. System adapters remain readback-only.
- The Opportunity HQ updater prompt supplies the earlier small-task, blocker, duration and daily-block planning shape. Its old Notion ownership rules are superseded for this dashboard.
- The preserved October 7 handoff plan and 0-item delivery probe are references for chat routing. A real browser request and returned result remain unproved.

## Jev comparison

Local Jev completed successfully with valid IDs and scores. It selected `extend_ssystems` over a separate plugin and `needs_review`. These are comparative scores, not confidence. The fit follows from the existing router, transports, closeout and transaction contract. Jev grants no permission to build.

## Graphify vet and installation

Recovered chat: **Verify YouTube Short Legitimacy**, October 21–22. Exact project: [Graphify-Labs/graphify](https://github.com/Graphify-Labs/graphify). Its role is code relationship lookup. It does not own task state or perform this lifecycle.

Pinned source: `92741d162b2094ffc2fed58cfbd8ee823e9da62c`. The full source scan covered 1,101 files and reported high risk from installer examples, test fixtures and subprocess patterns. This is a static pattern scan, not a proof of safety. The repository has no literal SKILL.md folder. Its Codex template and 8 reference files form the selected bundle.

The selected 9-file bundle scanned low risk. It was staged without running upstream scripts, then installed with vet-and-install. The system skill validator passed. Installed skill: `/Users/singleton23/.codex/skills/graphify/SKILL.md`.

A local guard limits invocation to explicit Graphify requests and selected code/schema/config. It excludes semantic document/media passes, agents, watchers, hooks, servers and automatic package upgrades. Generated graph output belongs in the verified HomeSSD references folder. Runtime `graphifyy` 0.9.95 was installed with uv from the pinned source revision. The CLI help command and skill validation passed. No graph index or local usefulness benchmark has been run.

Graphify is optional for all tickets below. A later trial should ask 3 scoped questions: trace task creation, trace task entry/closeout, and trace a declared cross-surface write. Measure initial indexing, refresh cost, correctness and exploratory work saved.

## Approved tickets

### 01 — Route Development tasks

**What to build:** A selected goal becomes reviewed small tasks in Linear, with blockers, hands-on/tool estimates and finish checks. Bind the returned IDs to the same entry and closeout path.

**First tracer bullet:** Create 1 parent and 2 linked tasks from a reviewed plan, reopen their context, complete 1 proven child, and leave the other child and parent open.

**Completion signal:** Linear readback proves IDs, parent links, blocker direction, estimates and completion state. Retrying the same request creates no duplicate. A missing or failed write remains visibly incomplete.

**Expansion boundary:** Asana, outreach, client conversion and automatic calendar placement belong to later slices. The record format for estimates must be reviewed before writes.

**Blocked by:** None.

### 02 — Route client delivery

**What to build:** Use the same lifecycle for Content Editor and AI Consulting work in their fixed Asana projects. Client delivery appears in its company section and opens with its parent, subtasks and source context.

**First tracer bullet:** Create 1 reviewed deliverable under an existing client section, load it from the dashboard, update 1 subtask, and verify its remaining work at closeout.

**Completion signal:** Asana confirms project, section, child/dependency links, estimates, supported rich-text descriptions and comments. The dashboard reflects those records after reload. Retry and partial-failure checks preserve IDs and unfinished work.

**Expansion boundary:** Creating separate client projects, moving media and sending client messages remain outside this slice. Dashboard styling stays in the approved migration tickets.

**Blocked by:** 01.

### 03 — Route outreach requests

**What to build:** A selected Sheet lead starts a context-bound Codex draft request and receives the result back at that lead. Preserve the selected chat and source record across the request.

**First tracer bullet:** Select 1 already-emailed lead, load its prior outreach and linked resources, send 1 real follow-up draft request, return its unsent draft and verify the Sheet update.

**Completion signal:** The intended chat receives the correct record once. Readback proves the returned draft belongs to that lead. Retry, a missing row, offline relay and source changes leave a clear recoverable result. An unrelated open chat cannot change the target.

**Expansion boundary:** Sending mail, bulk outreach and wiring every Lineups/review page remain separate. Reuse the common request contract so those pages can add their own adapters.

**Blocked by:** 01.

### 04 — Link active clients

**What to build:** An explicit reviewed lead-to-client action links the source Sheet row, Supabase client record and owning Asana work. Client data and task state retain their approved owners.

**First tracer bullet:** Convert 1 selected lead, confirm 1 linked active-client record and 1 Asana deliverable, then open them through the company view.

**Completion signal:** Readback proves the original Sheet link, deduplicated client identity and correct Asana section/task. Retry creates no extra client or task. Partial success remains visible until every declared owner confirms.

**Expansion boundary:** Bulk migration, automatic conversion, enrichment and payment processing remain separate. Confirm which fields transfer before implementation.

**Blocked by:** 02, 03.

### 05 — Plan daily capacity

**What to build:** Use real task estimates and blockers to suggest ready work that fits Jerami's attention budget. Show tool runtime and external waiting beside it. Larger work can span days.

**First tracer bullet:** From a 10-hour task plan with blockers, review a 4-hour day containing only ready work. Keep the remaining tasks visible and open. Select 1 task for Today and time-block it.

**Completion signal:** Verify remaining capacity, blocker handling, estimate edits, parent/child totals and failed saves. Source task state stays in Asana or Linear. Jerami reviews the suggested day before calendar placement.

**Expansion boundary:** Automatic rescheduling, measured savings claims and a separate time-tracking product remain outside this slice. Reuse dashboard tickets 23M-276, 23M-278 and 23M-284 for their UI work.

**Blocked by:** 01, 02.

## Publication and build order

Jerami approved the 5 slices and set an active goal on October 23. Each ticket body, Todo state, readiness label and project passed readback. All 6 blocker links passed native relation readback.

| Slice | Linear | Blocked by |
| --- | --- | --- |
| 01 | [23M-287](https://linear.app/23maestro/issue/23M-287/route-development-tasks) | None |
| 02 | [23M-288](https://linear.app/23maestro/issue/23M-288/route-client-delivery) | 23M-287 |
| 03 | [23M-289](https://linear.app/23maestro/issue/23M-289/route-outreach-requests) | 23M-287 |
| 04 | [23M-290](https://linear.app/23maestro/issue/23M-290/link-active-clients) | 23M-288, 23M-289 |
| 05 | [23M-291](https://linear.app/23maestro/issue/23M-291/plan-daily-capacity) | 23M-287, 23M-288 |

23M-287 is Done. 23M-288 is In Progress and bound to this chat's closeout. The goal remains active until the verified lifecycle checks pass across the approved slices.

## First live proof

The Linear path created [23M-293](https://linear.app/23maestro/issue/23M-293/verify-linear-path) and [23M-294](https://linear.app/23maestro/issue/23M-294/review-lifecycle-path) under 23M-287. Readback confirmed their separate estimates and the native 293-blocks-294 link. A retry created no extra tasks. Task entry read the current parent, children, comments and blockers, then bound the exact task ID to closeout.

23M-293 passed its finish check. Jerami approved the proof and continuation to Asana. 23M-294 and the parent are now Done by verified closeout. The full `npm test` run, 16 focused tests, ESLint, typecheck and production build passed. All 4 Cerebral checks passed.

Both first code review attempts stopped before checks because the inventory rejected the existing nested checkout at `sites/lineups-texans-review-2026-10-22/`. The inventory now binds nested HEAD, tracked edits and untracked content without reading Git metadata or ignored files. Regression tests and a real repository snapshot passed. Initial and fresh verification passes passed all configured checks before Asana implementation began. No production release occurred.

Private proof files: `lifecycle-287-proof-plan-v2.json`, `lifecycle-287-proof-create-v2.json` and `lifecycle-287-proof-entry.json` under the HomeSSD dashboard reference folder. The failed v1 receipt remains intact; Linear rejected its ID format before creating a child. V2 uses the accepted format.

## Asana slice in progress

The same plan, create, context and start commands now have an Asana path for the fixed client projects. It uses the shared transaction and closeout engines. Tests cover client sections, formatted task details, separate estimates, retries after lost replies and protection for later edits. An adopted deliverable keeps its production notes.

Live project and section reads passed. The live dependency read for Texans Rebound returned HTTP 402: “Dependencies are not available for this task.” Jerami confirmed free Asana on October 24. Use linked task references for dependencies. The current implementation still checks native dependency access before adding work under an adopted deliverable. 23M-288 remains open to implement the approved fallback and prove the first real client-delivery flow. The proof deliverable still needs selection.

Outreach discovery found the current Sheet and its 23 prospect rows. The Board key is a changing formula, so return routing needs a durable lead ID. Evidence is in `lifecycle-owner-discovery-2026-10-23.json` under the HomeSSD dashboard reference folder. Tracker comments on 23M-288 and 23M-289 retain these findings.
