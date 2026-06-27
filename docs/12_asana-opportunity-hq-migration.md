# Asana Opportunity HQ Migration

## Goal

Move Opportunity HQ from Notion-first durable task tracking to Asana-first
project/task tracking, without changing the operating model.

## Current State

```text
Notion / Opportunity HQ = current durable truth
Asana = target durable truth
Bear = raw capture
Eagle = proof/assets
Raycast = action layer
Codex = planning, cleanup, and reviewed mutations
```

Do not split the queue across Notion and Asana. Until the migration is
explicitly cut over, Notion remains current truth and Asana is the target.

## Schema Rule

Opportunity HQ projects are always-on lanes. Do not model normal project
movement with project-management template phases like Planning, Execution, and
Launch.

Task status is the board section:

```text
Queued
Today
In Motion
Waiting
Done
Parked
```

Do not add a duplicate task `Status` custom field. Do not add `Stage` to
Opportunity HQ tasks. Do not add `Estimated time`; use the existing `Duration`
field.

Lean task fields:

```text
Duration
Goal Horizon
Shift
Money Priority
```

`Money Priority` can stay while the Money Clock still needs Critical /
Strategic / Later sorting. If it stops helping, remove it rather than creating a
second priority model.

## Credential Split

```text
ASANA_ACCESS_TOKEN
  Local REST/API scripts and readback checks.

ASANA_WORKSPACE_GID
  Workspace target for direct API calls.

ASANA_CLIENT_ID
ASANA_CLIENT_SECRET
  Asana V2 MCP OAuth app credentials passed by Codex `env_vars`.
```

Codex MCP config lives in `~/.codex/config.toml`. Asana OAuth state is handled
by `mcp-remote`; do not commit credentials or copied auth files.

## Route Rule

MCP is for operator access and tool discovery. Raycast commands and local
scripts should use direct Asana REST calls with `ASANA_ACCESS_TOKEN` and
`ASANA_WORKSPACE_GID`.

Add caching only around repeated direct API reads. Do not make cache state the
source of truth.

Repeatable live readback:

```bash
npm run asana:readback
```

This writes an ignored local cache to:

```text
.cache/asana-opportunity-hq/readback.json
.cache/asana-opportunity-hq/readback.md
```

The cache is for inspection speed only. Asana remains the target durable store.
The command fails if lane sections, project custom fields, required task field
values, exact task titles, the goal relationship, or the dependency proof chain
drift.

Current read-only probe results:

```text
users/me: ok
workspace projects: ok
workspace custom fields: ok
workspace tags: ok
project detail: ok
project sections: ok
project tasks: ok
task detail: ok
subtasks: ok
dependencies/dependents fields: readable on tasks
```

Current MCP status:

```text
~/.codex/config.toml has the Asana MCP block.
ASANA_CLIENT_ID and ASANA_CLIENT_SECRET are still needed in the shell env.
```

Current Notion source status:

```text
Opportunity Tasks data source:
  625c153d-4dad-41f9-b328-9b67e7479782

Opportunity Projects data source:
  f8999c09-6aa3-4c27-b573-d7bb7cc1b101

Notion data-source query:
  blocked by the current Notion plan.
  Error requires Business plan or higher with Notion AI.

Fallback used:
  Notion search scoped to the Opportunity Tasks collection plus targeted page
  fetches for high-signal tasks.
```

## Pilot 1

Date: 2026-06-26

Created/verified:

```text
Offer project: existing
Portfolio project: created
Sections on both: Queued, Today, In Motion, Waiting, Done, Parked
Custom fields on both: Duration, Money Priority, Goal Horizon, Shift
Pilot parent task: Asana pilot: Singleton landing page
Pilot parent project: Offer
Pilot parent section: Queued
Pilot parent due date: 2026-06-29
Pilot parent fields: Duration=2h, Money Priority=Strategic, Goal Horizon=End of W1, Shift=Afternoon
Subtask dependency: Test proof-link handling depends on Map Notion task fields to Asana fields
```

This pilot task was deleted during cleanup. Singleton Systems landing page is
the real task and should use `Goal Horizon=End of Month`.

Result:

```text
Asana can represent the core Opportunity HQ shape with projects, sections,
native due dates, reusable enum fields, subtasks, dependencies, and permalinks.
```

Pilot decision:

```text
Use Asana sections for execution status.
Use custom fields for Duration, Money Priority, Goal Horizon, and Shift.
Use native due dates for Work Date.
Use project membership for the lane.
Keep links/proof links in the task description until repeated use proves a
custom field is worth it.
```

## Raycast Plan

Native reference:

```text
github.com/raycast/extensions/extensions/asana
```

Useful native Asana extension shape:

```text
withAsanaAuth -> @raycast/utils OAuthService.asana({ scope: "default" })
api/request.ts -> one request helper
api/tasks.ts -> create/update/get/subtasks/search
api/projects.ts -> projects/sections/add task to section
hooks -> useCachedPromise wrappers
CreateTaskForm -> memberships set project + section together
My Tasks -> grouped list by section
```

CareerHQ already has the right seam:

```text
src/lib/notion.ts exports:
  listOpportunityProjects
  createOpportunityTask
  listOpportunityTasks
  listProofTasks
  updateOpportunityTask
  appendOpportunityTaskBodyText
```

First implementation should create the same surface in:

```text
/Users/singleton23/Raycast/career-hq/src/lib/asana.ts
```

Read-only smoke command:

```text
/Users/singleton23/Raycast/career-hq/src/asana-smoke.ts
Raycast command: Asana Smoke Check
disabledByDefault: true
```

This command verifies that the Raycast Asana adapter can read the five
Opportunity HQ projects and tasks without changing the existing Notion-backed
commands.

Routing status:

```text
Active Raycast commands still route to src/lib/notion.ts.
Only the disabled Asana Smoke Check command routes to src/lib/asana.ts.
```

Hold rule:

```text
Do not route existing Raycast operations to Asana inside career-hq until the
repo strategy is decided. A separate Asana-focused Raycast repo may be cleaner
than cutting over this existing Notion-backed extension in place.
```

Then wire commands one at a time:

```text
1. Opportunity HQ Workbench: read-only Asana list for Offer/Portfolio.
2. Log Opportunity Task: create Asana task using the existing form shape.
3. Capture Portfolio: append Eagle note to Asana task description or comment.
4. Draft Proposal: update task notes/status only after create/update is proven.
```

Do not rewrite the Raycast UI first. Keep command names, filters, shortcuts, and
visible Opportunity HQ language stable while swapping the backing adapter.

Asana task created for this plan:

```text
Raycast Asana adapter pilot
https://app.asana.com/1/1216086803382161/project/1216085286554312/task/1216085587114702
```

Subtasks:

```text
Mirror native Raycast Asana auth/client shape
Create lib/asana.ts with Opportunity HQ exports
Pilot Workbench read-only against Offer project
Pilot Log Opportunity Task write to Asana
Probe Asana Goals as optional horizon layer
```

## Goals Probe

Read-only check:

```text
GET /goals?workspace=ASANA_WORKSPACE_GID -> 200, empty list
```

Write check:

```text
Created test goal:
  TEST - Goal for parent task mini-project
  https://app.asana.com/0/goal/1216085728180187

Goal creation requires:
  owner
  workspace
  name
  time_period
  due_on

Task supporting relationship:
  rejected by Asana.
  Official shape supports goal, project, or portfolio as supporting resources,
  not tasks.

Project supporting relationship:
  works after setting the goal metric to automatic project task completion.

Working metric payload:
  progress_source = project_task_completion
  unit = percentage
  precision = 0

Supporting relationship proved:
  Offer project -> test goal
```

Decision:

```text
Keep Goal Horizon as a task custom field for every migrated task.

Use Asana Goals selectively for weekly/monthly horizons only when a project-level
progress view is useful.

For mini-projects, keep the parent task as the operational holder and link to
the Asana Goal in the description. Let the goal be supported by the related
project or another goal, not by the task itself.
```

## Mapping

Keep the existing lane language.

```text
Opportunity Projects -> Asana projects
Opportunity Tasks -> Asana tasks
Project relation -> project membership
Status -> project sections
Duration -> custom field
Money Priority -> custom field
Goal Horizon -> custom field
Work Date -> due date
Shift -> custom field
Link -> task link/body field
Portfolio note -> task link/body field
Notes -> task description, only when useful
```

Asana subtasks and dependencies should replace long Notion page-body
checklists when separate status or sequencing matters.

## Migration Slice

1. Create the five Asana lane projects:

```text
Cash Jobs
Career Jobs
Freelance
Offer
Portfolio
```

Status:

```text
Cash Jobs: created
Career Jobs: created
Freelance: created
Offer: existing
Portfolio: created
```

2. Create the shared sections and custom fields:

```text
Sections: Queued | Today | In Motion | Waiting | Done | Parked
Duration: 5m | 15m | 30m | 45m | 60m | 90m | 2h | 4h+
Money Priority: Critical | Strategic | Later
Goal Horizon: End of W1 | End of W2 | End of W3 | End of Month | Next Month | 6 Months | Long Term
Shift: Morning | Midday | Afternoon | Evening | Late
```

Status:

```text
All five lane projects have the standard sections.
All five lane projects have the shared custom fields attached.
```

3. Import the first real search-backed Opportunity HQ batch.

Status on 2026-06-26:

```text
created: 27
existing: 16
represented total: 43

Cash Jobs: 10
Career Jobs: 6
Freelance: 4
Offer: 5 migrated tasks plus pre-existing template tasks before cleanup
Portfolio: 18
```

Live readback command:

```text
npm run asana:readback
```

Latest readback:

```text
Cash Jobs: 10 tasks (Queued:10)
Career Jobs: 6 tasks (Queued:6)
Freelance: 4 tasks (Queued:3, Waiting:1)
Offer: 7 tasks (Queued:5, Today:1, In Motion:1)
Portfolio: 22 tasks (Queued:21, Waiting:1)
Goal: TEST - Goal for parent task mini-project
  metric=project_task_completion
  relationships=1
```

Template cleanup completed:

```text
Removed generic template tasks from Offer.
Removed phase sections from Offer.
Removed Untitled section from every lane project.
Deleted the explicit Asana pilot landing-page task.
Renamed Raycast Asana adapter pilot -> Raycast Asana adapter.
Removed Estimated time from Offer.
Removed Priority, Status, and Stage from Offer by deleting those template custom
fields directly after project-level removal returned 403.
All five lane projects now have only: Duration, Money Priority, Goal Horizon, Shift.
```

Second search-backed Portfolio pass:

```text
Added:
  J. Larkins training edit example
  Prospect ID sports highlight edit timeline
  Prospect ID sports highlight examples
  Prospect ID raw vs finished highlight comparison

Reason:
  Notion search surfaced these as distinct proof tasks that the first import
  compressed too aggressively.
```

Third search-backed lane check:

```text
Checked Cash Jobs, Career Jobs, Freelance, Offer, and Portfolio with targeted
Notion workspace search terms.

Result:
  No additional clean distinct rows were found for Cash Jobs, Career Jobs,
  Freelance, or Offer beyond existing normalized Asana task names.

Portfolio:
  AI/Audio, AI/Script, Capture System, workflow checklist, and NurseHub rows
  are represented by existing clean Asana titles.

Known normalization examples:
  Apply: Parts Authority Delivery Driver -> Parts Authority delivery driver
  Review/apply: AdaptHealth Medical Equipment Delivery Driver -> AdaptHealth
    medical equipment delivery driver
  Review/apply: IXL remote math education video localization editor -> IXL
    remote video localization editor
  AI/Audio: ElevenLabs voice generation example -> AI audio voice generation
    example
```

Current audit report:

```text
.cache/asana-opportunity-hq/readback.md
```

Use this ignored local report to compare the live Asana task list against future
Notion search/export passes without re-reading every task manually.

Important limit:

```text
This batch is not guaranteed exhaustive because direct Notion data-source query
is blocked by the current Notion plan. It is safe as a first migration pass,
but the final cutover needs either a full Notion export/query path or repeated
lane-specific search/fetch passes with readback.
```

4. Prove dependencies and subtasks.

Status:

```text
Created parent task:
  Migrate Opportunity HQ to Asana

Created dependency chain:
  Read Notion Opportunity HQ source data
  -> Create clean Asana task import
  -> Verify Asana counts and dependencies

Readback:
  npm run asana:readback verifies the dependency chain by subtask GID.
```

5. Update Raycast commands after the Asana shape is proven:

```text
Log Opportunity Task
Update Opportunity Task
Plan Today
Capture Portfolio Asset
```

6. Cut over only when Asana can answer the same daily question:

```text
What has to happen today so money, offer, and proof all keep moving?
```

## Stop Rules

- Do not create a second lane taxonomy.
- Do not build a custom database beside Asana.
- Do not migrate every Notion page before one lane proves the model.
- Do not make MCP the only dependency path; direct REST scripts may still own
  reliable Raycast behavior.
