# Opportunity HQ Updater Prompt

## Purpose

Use this prompt when a raw thought, goal, link, job, Upwork lead, portfolio idea, or
shortcut idea needs to be routed into the current Singleton Systems operating
model.

The model is:

```text
Obsidian = raw capture and later/passive ideas
Opportunity HQ = durable projects, tasks, focus, and time blocks
Eagle = portfolio/assets/evidence
Raycast/Codex = actions and routing
```

## Opportunity Search Run

Codex owns this workflow. Raycast may open tasks, links, portfolio assets, proposals, and
Notion pages, but it should not run the search or plan the day.

```text
Run an Opportunity Search Run.

Rules:
- Search current jobs/leads only.
- Do not apply.
- Do not use computer control.
- Do not mutate Notion until I approve winners.
- Skip or flag duplicate job links already in Opportunity HQ.
- Link every approved task to exactly one of the five lane projects unless I
  explicitly say it is a parked one-off.
- Use thin task names. Put details in page content, not the title.
- Keep Notes to a one-line scan label.
- Do not set Work Date or Shift until the planning pass.

Return:
1. Clear winners only.
2. For each winner: title, project lane, pay if available, link, duration estimate,
   priority, and short notes.
3. A separate "skip" list only when something looked tempting but should not be
   logged.

After I approve winners:
- Log each approved winner to Opportunity Tasks.
- Status: Queued unless I say Today.
- Project: Cash Jobs, Career Jobs, Freelance, Offer, or Portfolio.
- Money Priority: Critical for Cash Jobs, Career Jobs, and Freelance unless clearly
  optional.
- Notes: one short line only.
- Page content: pay, why, portfolio angle, check-before-apply, source.
- Do not submit applications or proposals.
```

Default project mapping:

```text
Cash Jobs -> Paid by July 1
Career Jobs -> White collar video/broadcast applications
Freelance -> Freelance proposals
Offer -> Singleton portfolio + website
Portfolio -> Singleton portfolio + website
Blue collar resume prep -> Blue collar resume ready
```

Thin name examples:

```text
AutoZone driver
Cintas route rep
MedSpeed driver
Care Access video editor
NPRC video editor
Remote video search
```

## Focus Shift Export

Reuse the Prospect Pipeline `.ics` export pattern from
`/Users/singleton23/Raycast/prospect-pipeline/src/daily-call-blocks.tsx`: build
plain text, write a dated `.ics` file to Downloads, copy the summary, and open
the file.

```text
Build Opportunity HQ focus blocks.

Input:
- Approved Opportunity Tasks for [DAY/RANGE].

Rules:
- Build 3-5 realistic time shifts.
- Use task Duration values as rough estimates, not fake precision.
- Include titles, times, descriptions, and sane durations.
- Generate `.ics` into Downloads and open it.
- Copy a plain-text plan summary to clipboard.
- Ask before updating Notion Work Date / Shift.
- No Raycast planning command.
- No AppleScript calendar event creation.
- No automation until one manual run works.
```

## Copy/Paste Prompt

```text
Analyze my raw input and route it into my Opportunity HQ system.

Current operating model:
- Obsidian is for raw capture, unclear thoughts, later ideas, passive shortcut ideas, ChatGPT/Codex questions, and things I might want to process later.
- Opportunity HQ is Notion. It owns durable projects, tasks, status, duration estimates, money priority, daily focus, and shifts.
- Eagle stores portfolio/assets/evidence.
- Raycast/Codex are the action layer for creating, opening, updating, clarifying, rewriting, and routing.

Opportunity HQ has two durable databases:
1. Opportunity Projects
2. Opportunity Tasks

Do not create a separate Focus Board database. Focus Board, Daily Blocks, Work Calendar, Applications, Freelance, Singleton, and Portfolio are views of Opportunity Tasks.

Project lanes:
- Cash Jobs
- Career Jobs
- Freelance
- Offer
- Portfolio

Project fields:
- Project
- Stage
- Tasks
- Notes

Project Stage options:
- To Do
- In Progress
- Done

The five project lanes are durable lanes, not finishable deliverables. Keep
them `In Progress` unless the lane itself is being paused or retired.

Task fields:
- Task
- Status
- Duration
- Money Priority
- Project
- Goal Horizon
- Work Date
- Shift
- Link
- Notes
- Page Content

Status options:
- Queued
- Today
- In Motion
- Waiting
- Done
- Parked

Duration options:
- 5m
- 15m
- 30m
- 45m
- 60m
- 90m
- 2h
- 4h+

Money Priority:
- Critical
- Strategic
- Later

Shift options:
- Morning
- Midday
- Afternoon
- Evening
- Late

Default priority:
- Cash Jobs = Critical
- Career Jobs = Critical
- Freelance = Critical unless clearly optional/later
- Offer = Strategic unless tied to immediate income
- Portfolio = Strategic unless needed for an application/proposal
- Passive shortcut/system ideas = Later unless they directly help immediate work

Decide first:
1. Should this stay in Obsidian, become an Opportunity HQ task, become an Opportunity HQ project, or become an Eagle portfolio item?
2. If it belongs in Opportunity HQ, is it a project or a task?
3. If it is a task, what project lane, status, duration, money priority, link, and notes should it have?
4. If it is a project, what outcome does it represent and what 2-6 tasks should belong under it?

Project rule:
- The five Project rows are the lanes: Cash Jobs, Career Jobs, Freelance, Offer, Portfolio.
- Every real task should link to exactly one Project. Blank Project is a cleanup problem, not the default.
- Every task's page icon should come from the icon DB source for its Project.
  Project/task pages are references, not the durable icon source.
- Current icon DB source: Cash Jobs = custom icon `cash-job`
  (`notion://custom_emoji/a3b304a1-8d81-47f4-aea9-74ce88acc795/38e4c8bd-6c26-8079-9053-007a3a48e114`).
- Finishable deliverables become tasks/goals under a lane project, not new lane rows.
- If a subtask needs its own duration estimate, make it a separate task.
- Use page/body checkboxes only for tiny checklists.

Mini-Project Plan Mode:
- Use "mini-project" as a trigger phrase.
- A mini-project is a parent Opportunity Task, not a new Opportunity Project row.
- Opportunity Projects remain only the five durable lanes: Cash Jobs, Career Jobs, Freelance, Offer, Portfolio.
- When I say "make a mini-project" or "let's make a plan," run a Plan Mode-style intake:
  1. Ask for or infer the mini-project name.
  2. Pick the Project lane.
  3. Assign a Mini-Project Size label:
     - Tiny: 1-2 subtasks, under 30 minutes total
     - Small: 3-4 subtasks, 30-90 minutes total
     - Medium: 5-8 subtasks, 2-4 hours total
     - Large: 9+ subtasks or 4h+ total
     - Strategic: multi-day / dependency-heavy / unclear scope
  4. Treat the mini-project as the parent task.
  5. Compress my natural-language explanation into actionable sub-tasks.
  6. Identify blockers/dependencies.
  7. Mark the first 1-3 blocker tasks as the priority unlocks.
  8. Suggest Goal Horizon, Work Date, Shift, Status, Duration, and Money Priority.
  9. Return a reviewed Notion-ready payload before any mutation.
- If a mini-project is created, the parent task and any related child tasks use
  the selected Project's icon DB source.
- Mini-Project Size is a planning label, not the task execution Status.
- Status remains: Queued, Today, In Motion, Waiting, Done, Parked.
- Do not create a new Notion schema property yet unless this pattern repeats enough to justify it.
- For now, include Mini-Project Size in the reviewed payload/page content.

Obsidian rule:
- Keep raw, unclear, emotional, exploratory, someday, or passive shortcut ideas in Obsidian.
- Examples: shortcut ideas, future automation ideas, later ChatGPT/Codex questions, experiments, reference thoughts.
- If an Obsidian idea later gets task weight, money relevance, portfolio value, or a real next action, suggest pushing it into Opportunity HQ.

Shortcut/passive idea rule:
- If the idea is useful but not needed for immediate income, classify it as Obsidian first.
- If it could later become portfolio or a reusable system, mark it as a future candidate.
- If it is quick and likely under 30 minutes, estimate it honestly but keep priority Later unless it directly supports the current week.

Output in this exact format:

Route:
Obsidian / Opportunity Task / Opportunity Project / Eagle Portfolio / Split

Why:
One short explanation.

Opportunity Project:
Only include if needed.

Opportunity Task:
Task:
Project:
Status:
Duration:
Money Priority:
Project:
Work Date:
Shift:
Link:
Notes:

Suggested Subtasks:
Only include if needed. If any subtask needs its own time estimate, mark it as a separate task.

Obsidian Capture:
Only include if this should stay raw or later.
Suggested Obsidian folder:
Suggested note title:
Cleaned note:

Eagle Portfolio:
Only include if there is portfolio/evidence to capture.
Folder:
Tags:
Asset idea:

Do Not:
List anything that should not be overbuilt, added yet, or confused with another project lane.

Rules:
- Treat me as one person, not an agency.
- Do not use "we."
- Do not invent portfolio, clients, metrics, or scale.
- Keep video editing and workflow cleanup separate unless I explicitly connect them.
- Prioritize blue collar jobs, white collar applications, freelance, and immediate income before website polish.
- Keep language concise and usable.
- Use thin task names and short Notes.
- Do not write generic AI business copy.
- Do not mutate Notion unless I explicitly ask you to use the Notion tool/plugin.

Raw input:
[PASTE RAW THOUGHT, LINK, GOAL, JOB, PROPOSAL, OR IDEA HERE]
```

## Example: Passive Shortcut Idea

Input:

```text
I already have a shortcut that downloads Twitter, YouTube, and internet videos
through the share link. Later I want a mobile-friendly way to get transcripts
from those videos using shell or another route.
```

Expected route:

```text
Route:
Obsidian

Why:
Valuable future shortcut idea, but not immediate income work.

Obsidian Capture:
Suggested Obsidian folder: Command Ops
Suggested note title: Mobile video transcript shortcut
Cleaned note: Explore a mobile-friendly transcript step for the existing share-sheet video download shortcut. Possible future portfolio of small practical automations. Keep parked until cash-path work is moving.

Do Not:
Do not create an Opportunity HQ task yet unless I explicitly decide to build it this week.
```

## Visual Prompt

Use this to generate a fresh Excalidraw-style visual after the project/task
refinement:

```text
Create a clean Excalidraw-style architecture sketch for a personal operating system called Opportunity HQ.

Show four surfaces:
1. Obsidian _Inbox
2. Opportunity HQ in Notion
3. Eagle Portfolio Library
4. Raycast / Codex Actions

Obsidian _Inbox:
- label as Raw Capture
- include: unclear thoughts, later ideas, passive shortcut ideas, ChatGPT/Codex questions, someday experiments
- say: Obsidian is raw. No durable queue here.

Opportunity HQ:
- label as Durable Truth
- show two related databases:
  - Opportunity Projects
  - Opportunity Tasks
- show task fields: Task, Project, Status, Duration, Money Priority, Work Date, Shift, Link, Notes
- show views, not databases: Focus Board, Daily Blocks, Work Calendar, Applications, Freelance, Singleton, Portfolio
- show five project lanes: Cash Jobs, Career Jobs, Freelance, Offer, Portfolio
- say: Projects are the lanes. Tasks are executable work. No second lane property.

Eagle Portfolio Library:
- label as Portfolio / Evidence
- include: screenshots, videos, docs, references, examples
- connect to Portfolio and Offer.

Raycast / Codex Actions:
- label as Action Layer
- include: Create, Open, Update, Clarify, Rewrite, Route
- connect to Opportunity HQ and Eagle.

Show two capture paths:
- Quick Thought -> Obsidian
- Log Task -> Opportunity HQ

Show a human-in-the-loop promotion path:
- Obsidian later idea -> Review -> Opportunity HQ task/project only when it has task weight, money relevance, portfolio value, or a real next action.

Keep it simple, notebook style, black/white with small red, green, purple, and blue accents. Avoid gradients and decorative clutter.
```
