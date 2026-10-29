# Shared task management

October 25, 2026. Scope approved by Jerami. TDD requirements and test boundaries are preapproved in this chat. No fixed deadline. Published as 23M-312 and 23M-313 under 23M-288, with 312 blocking 313.

Extend the existing SSystems Task Updater and lifecycle commands. Startup binds the same owner ID to the existing closeout. Keep Linear 23M-288 open and preserve its description. Publish only the two approved children below; do not duplicate 23M-287–291.

## 1. Plan reviewed work

**Blocked by:** None; the Linear lifecycle proof in 23M-287 is Done.

**What to build:** Intake reads existing context, asks for a real deadline when unknown, proposes editable attention/tool/waiting estimates, and shows small tasks, blockers and finish checks before creation. Use the recovered Opportunity HQ planning structure with current task owners. An explicit “no deadline” answer stays undated. Work dates remain separate.

**First tracer bullet:** Review one small Development plan with one confirmed deadline and one undated child; create it in Linear, reopen its context, start one child, and close only proven work through existing closeout.

**Completion signal:** A conversational intake walkthrough and public lifecycle/closeout commands confirm native deadline readback, separate estimates, exact-ID binding, duplicate-safe retry, preserved edits and an open unfinished child/parent. Reject invalid calendar dates before any write. Existing plans remain usable without invented deadlines.

**Expansion boundary:** New task apps, estimate-learning services, automatic calendar placement, outreach and daily-capacity planning.

- [ ] Ask only for missing deadline information; reuse clear answers from the chat/task.
- [ ] Propose rough estimates with their basis; split attention work into pieces of two hours or less and count child totals once.
- [ ] Confirm date and estimate readback through the same task context used at startup and closeout.

## 2. Finish Asana routing

**Blocked by:** 1, for the shared deadline/intake contract.

**What to build:** Carry the reviewed plan into free Asana using supported linked task references for blockers. Preserve production notes, rich text, parent/client section, deadlines and estimates. Startup and closeout use the same owner ID and commands.

**First tracer bullet:** Under one selected real client deliverable, create reviewed subtasks, reopen context, update one proven child, reload the existing dashboard and leave remaining work open.

**Completion signal:** Owner readback proves links, due dates, estimates and completion state. Public commands succeed without paid dependency APIs. Lost replies, repeated requests and changed source notes preserve IDs and later edits. The real client walkthrough passes; mocked tests alone cannot complete this slice.

**Expansion boundary:** New client projects, production-media changes, client messages and dashboard redesign.

- [ ] Select the proof deliverable and reviewed child work before production writes.
- [ ] Verify linked references and their current task states, including unavailable or unrelated targets.
- [ ] Finish verified children first; preserve parent and outstanding review work.

## TDD and estimate

Preapproved boundaries: conversational intake, public lifecycle/closeout commands, native owner APIs and the existing dashboard reload for the Asana proof. Mock external services only. Run one failing behavior test, its minimal implementation and the integration proof per slice. Keep review separate.

Proposed budget: 15 minutes of Jerami’s decisions/review and 120 minutes of implementation/checks across both slices. External waiting is unknown. These are estimates, not measured savings.

## First slice readback

The task-management skill is installed and calls the shared lifecycle. Linear date support passes the live creation, retry, context, startup and closeout proof. 23M-314 is Done with a labeled test date of November 4, 2026. The build remains undated. 23M-315 and 23M-312 stay open for Jerami’s review. 23M-313 remains Todo.

The live proof also found and fixed adoption of an existing nested task. Its original parent stays intact. Failed v1 state is retained; owner reads confirmed no v1 children before the v2 proof. Source edits and the active deadline answer remain protected.
