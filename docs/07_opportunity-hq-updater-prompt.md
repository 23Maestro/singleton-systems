# Opportunity HQ Updater Prompt

## Purpose

Use this prompt when a raw thought, goal, link, job, Upwork lead, proof idea, or
shortcut idea needs to be routed into the current Singleton Systems operating
model.

The model is:

```text
Bear = raw capture and later/passive ideas
Opportunity HQ = durable projects, tasks, focus, and time blocks
Eagle = proof/assets/evidence
Raycast/Codex = actions and routing
```

## Copy/Paste Prompt

```text
Analyze my raw input and route it into my Opportunity HQ system.

Current operating model:
- Bear is for raw capture, unclear thoughts, later ideas, passive shortcut ideas, ChatGPT/Codex questions, and things I might want to process later.
- Opportunity HQ is Notion. It owns durable projects, tasks, status, time estimates, money priority, daily focus, and time blocks.
- Eagle stores proof/assets/evidence.
- Raycast/Codex are the action layer for creating, opening, updating, clarifying, rewriting, and routing.

Opportunity HQ has two durable databases:
1. Opportunity Projects
2. Opportunity Tasks

Do not create a separate Focus Board database. Focus Board, Daily Blocks, Work Calendar, Applications, Upwork, Singleton, and Proof are views of Opportunity Tasks.

Task buckets:
- Cash Jobs
- Career Jobs
- Upwork
- Offer
- Proof

Task fields:
- Task
- Bucket
- Status
- Time
- Money Priority
- Project
- Work Date
- Block
- Link
- Asset / Proof Link
- Notes

Status options:
- Queued
- Today
- In Motion
- Waiting
- Done
- Parked

Time options:
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
- Useful
- Later

Block options:
- Morning
- Midday
- Afternoon
- Evening
- Late

Default priority:
- Cash Jobs = Critical
- Career Jobs = Critical
- Upwork = Critical unless clearly optional/later
- Offer = Useful unless tied to immediate income
- Proof = Useful unless needed for an application/proposal
- Passive shortcut/system ideas = Later unless they directly help immediate work

Decide first:
1. Should this stay in Bear, become an Opportunity HQ task, become an Opportunity HQ project, or become an Eagle proof item?
2. If it belongs in Opportunity HQ, is it a project or a task?
3. If it is a task, what bucket, status, time, money priority, project, link/proof link, and notes should it have?
4. If it is a project, what outcome does it represent and what 2-6 tasks should belong under it?

Project rule:
- Buckets are not projects.
- A project is an outcome that needs multiple tasks, proof, or time planning.
- If a subtask needs its own time estimate, make it a separate task.
- Use page/body checkboxes only for tiny checklists.

Bear rule:
- Keep raw, unclear, emotional, exploratory, someday, or passive shortcut ideas in Bear.
- Examples: shortcut ideas, future automation ideas, later ChatGPT/Codex questions, experiments, reference thoughts.
- If a Bear idea later gets task weight, money relevance, proof value, or a real next action, suggest pushing it into Opportunity HQ.

Shortcut/passive idea rule:
- If the idea is useful but not needed for immediate income, classify it as Bear first.
- If it could later become proof or a reusable system, mark it as a future candidate.
- If it is quick and likely under 30 minutes, estimate it honestly but keep priority Later unless it directly supports the current week.

Output in this exact format:

Route:
Bear / Opportunity Task / Opportunity Project / Eagle Proof / Split

Why:
One short explanation.

Opportunity Project:
Only include if needed.

Opportunity Task:
Task:
Bucket:
Status:
Time:
Money Priority:
Project:
Work Date:
Block:
Link:
Asset / Proof Link:
Notes:

Suggested Subtasks:
Only include if needed. If any subtask needs its own time estimate, mark it as a separate task.

Bear Capture:
Only include if this should stay raw or later.
Suggested Bear tag:
Suggested note title:
Cleaned note:

Eagle Proof:
Only include if there is proof/evidence to capture.
Folder:
Tags:
Asset idea:

Do Not:
List anything that should not be overbuilt, added yet, or confused with another bucket.

Rules:
- Treat me as one person, not an agency.
- Do not use "we."
- Do not invent proof, clients, metrics, or scale.
- Keep video editing and workflow cleanup separate unless I explicitly connect them.
- Prioritize blue collar jobs, white collar applications, Upwork, and immediate income before website polish.
- Keep language concise and usable.
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
Bear

Why:
Useful future shortcut idea, but not immediate income work.

Bear Capture:
Suggested Bear tag: #commands/shortcuts
Suggested note title: Mobile video transcript shortcut
Cleaned note: Explore a mobile-friendly transcript step for the existing share-sheet video download shortcut. Possible future proof of small practical automations. Keep parked until cash-path work is moving.

Do Not:
Do not create an Opportunity HQ task yet unless I explicitly decide to build it this week.
```

## Visual Prompt

Use this to generate a fresh Excalidraw-style visual after the project/task
refinement:

```text
Create a clean Excalidraw-style architecture sketch for a personal operating system called Opportunity HQ.

Show four surfaces:
1. Bear Inbox
2. Opportunity HQ in Notion
3. Eagle Proof Library
4. Raycast / Codex Actions

Bear Inbox:
- label as Raw Capture
- include: unclear thoughts, later ideas, passive shortcut ideas, ChatGPT/Codex questions, someday experiments
- say: Bear is raw. No durable queue here.

Opportunity HQ:
- label as Durable Truth
- show two related databases:
  - Opportunity Projects
  - Opportunity Tasks
- show task fields: Task, Bucket, Status, Time, Money Priority, Project, Work Date, Block, Link, Asset / Proof Link, Notes
- show views, not databases: Focus Board, Daily Blocks, Work Calendar, Applications, Upwork, Singleton, Proof
- show five buckets: Cash Jobs, Career Jobs, Upwork, Offer, Proof
- say: Projects are outcomes. Tasks are executable work. Buckets are lanes.

Eagle Proof Library:
- label as Proof / Evidence
- include: screenshots, videos, docs, references, examples
- connect to Proof and Offer.

Raycast / Codex Actions:
- label as Action Layer
- include: Create, Open, Update, Clarify, Rewrite, Route
- connect to Opportunity HQ and Eagle.

Show two capture paths:
- Quick Thought -> Bear
- Log Task -> Opportunity HQ

Show a human-in-the-loop promotion path:
- Bear later idea -> Review -> Opportunity HQ task/project only when it has task weight, money relevance, proof value, or a real next action.

Keep it simple, notebook style, black/white with small red, green, purple, and blue accents. Avoid gradients and decorative clutter.
```
