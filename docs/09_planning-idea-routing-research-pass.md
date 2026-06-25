# Planning + Idea Routing Research Pass

## Purpose

This memo hardens how Singleton Systems captures ideas, plans work, handles
dependencies, and decides what becomes a task, skill, command, or later
research.

It is not a new app, database, or automation layer.

## Current Decision

Use these Opportunity HQ constants going forward:

```text
Money Priority: Critical | Strategic | Later
Status: Queued | Today | In Motion | Waiting | Done | Parked
```

This is a docs-level decision first. Do not rename live Notion or Raycast values
until the migration is intentional and easy to verify.

## Label Options Reviewed

`Critical` stays. It correctly signals money, deadline, or survival pressure.

Middle-lane options:

```text
Useful
  Plain and calm. Weakness: can feel gray.

Leverage
  Stronger for system/proof/offer work that compounds. Weakness: more jargon.

Builder
  Fits the current build mode. Weakness: less obvious outside this system.

Strategic
  Best current fit. It says the work serves the long-term offer even when it is
  not today's cash path.
```

Recommendation: rename `Useful` to `Strategic` when the live surface is ready.
Do not churn the other values.

## Money Priority Meanings

```text
Critical
  Work tied to immediate money, income pressure, deadlines, applications,
  proposals, follow-ups, survival jobs, or external blockers.

Strategic
  Work that compounds toward the real long-term goal: Singleton Systems offer,
  proof, website, workflows, systems, and client-ready assets.

Later
  Real idea, not fake-urgent, no current commitment.
```

The long-term target is not merely "get a job." A job or client project can be
important money relief, but the system's strategic north star is active
Singleton Systems offer work with paying clients.

Current reality as of June 24, 2026:

```text
Critical = cash-path execution first
Strategic = website, offer, proof, workflow hub, and system hardening
Later = real ideas that should not steal this week
```

Default bucket priority:

```text
Cash Jobs -> Critical
Career Jobs -> Critical
Upwork -> Critical
Offer -> Strategic
Proof -> Strategic
System Cleanup -> Strategic or Later, depending on whether it unblocks execution
```

## Goal Horizon Rules

Use goal horizons before due dates. Due dates are only for real external dates
or commitments; otherwise they can create fake failure.

```text
Today
  The small count or block that must move before the day is allowed to drift.

This Week
  A realistic target count per critical bucket.

End Of Month
  A short checkpoint for what must be true by the calendar boundary.

August Horizon
  The first larger operating target: money coming in, website live enough, and
  offer/outreach moving.

Long Term
  Singleton Systems managing paying offer clients.
```

Long-term parked note:

```text
Finance/debt cleanup matters after money starts moving. Keep it as a later
coding/cleanup goal for the existing Notion finance/debt database, not an
active Money Clock operating project yet.
```

Do not overbuild the long-term layer yet. Keep it as the north star until the
near-term system is stable.

## Planning Prompt

When planning a week or month, ask for counts before due dates:

```text
What must be true by the end of this week?
How many Critical actions does that imply?
Which Strategic work cannot be ignored?
What is allowed to stay Later?
What is blocked by another person, platform, response, or unfinished surface?
```

Example:

```text
Weekly goal: 10-12 blue-collar applications.
Daily implication: 1-2 applications before deep Strategic work.
Priority: Critical.
Block: Money Clock.
```

The output is a small daily block suggestion, not a giant plan.

## Goal Log Shape

If this becomes a Raycast action or local file later, keep the data shape this
small:

```text
Horizon
Bucket
Target
Priority
Daily implication
Block
Evidence
```

Example:

```text
Horizon: This Week
Bucket: Cash Jobs
Target: 10-12 blue-collar applications
Priority: Critical
Daily implication: 1-2 applications before deep Strategic work
Block: Money Clock
Evidence: application links, confirmations, or Opportunity HQ tasks
```

Use one row per real target. Do not make a separate goal database until this log
has repeated enough to justify one.

Current target tiers:

```text
Today
  Move at least one Critical cash-path action before deep Strategic work.

This Week
  Set realistic Critical action counts by bucket, starting with blue-collar,
  career/white-collar, Upwork, and follow-up actions.

End Of Month
  Check whether money-path volume, website/request flow, and proof packaging
  are actually moving.

August Horizon
  Money coming in through job, contract, client, or Upwork path.
  Singleton Systems website live enough to receive real requests.
  Offer/outreach process active enough to produce conversations.

Long Term
  Singleton Systems managing paying offer clients.
```

## Dependency And Goal Hierarchy

Use dependencies to protect real sequence, not to decorate project plans:

```text
Goal depends on project.
Project depends on task.
Task depends on external response or finished surface.
```

Examples:

```text
August money relief
  depends on Critical applications, proposals, follow-ups, or paid work.

Singleton Systems offer traction
  depends on website/request flow, proof, outreach, and client-ready process.

Website/request flow
  depends on Tally intake, Notion response handling, and a clear CTA.
```

If everything is a dependency, nothing is. Only mark the blocker when another
meaningful task cannot proceed without it.

## Status Meanings

```text
Queued
  Real task, not selected for today.

Today
  Selected for today's work.

In Motion
  Actively being worked.

Waiting
  Blocked by a person, platform, response, submission, approval, or external event.

Done
  Complete.

Parked
  Saved intentionally with no current commitment.
```

`Waiting` and `Parked` are allowed to coexist because they trigger different
behavior:

```text
Waiting = check back, follow up, or unblock.
Parked = leave alone until review.
```

Do not use `Waiting` for ideas that simply are not urgent. Use `Parked` or Bear.

## What Akiflow Gets Right

Sources:

- Akiflow Inbox: https://product.akiflow.com/help/articles/5284502-your-inbox
- Akiflow Time Blocking: https://product.akiflow.com/help/articles/3677363-time-blocking-101
- Akiflow Time Slots: https://product.akiflow.com/en/help/articles/3089241-time-slots

Patterns to steal:

```text
Inbox first
  Capture quickly before planning.

Plan second
  Decide whether the item is now, scheduled, this week, later, or done.

Calendar/time block third
  Work earns time only after it is clear enough to act on.

Time slots as containers
  Blocks can hold multiple tasks without turning the block itself into a task.
```

Singleton translation:

```text
Bear = inbox
Opportunity HQ = planned work and durable projects
Work Date + Block = lightweight time slots
Raycast / Shortcuts = capture and update buttons after repetition is obvious
```

Do not clone Akiflow. Use its pattern: capture, clarify, plan, block.

## ADHD Planning Guardrails

Sources:

- CHADD To-Do Lists: https://chadd.org/for-adults/time-management-and-adhd-to-do-lists/
- CHADD Day Planners: https://chadd.org/for-adults/time-management-planner/

Patterns to protect:

```text
Separate short-term from long-term lists.
Make time visible.
Review the planner repeatedly.
Do not rely on memory.
Break large work into visible next actions.
```

Singleton translation:

```text
Today is not the same as Later.
Queued is not the same as Parked.
Bear is not the durable planner.
Opportunity HQ must show the next move, not just the project name.
```

## Notion Dependency Rule

Sources:

- Notion Sub-items & Dependencies: https://www.notion.com/help/tasks-and-dependencies
- Notion dependency guide: https://www.notion.com/help/guides/tasks-manageable-steps-sub-tasks-dependencies

Use dependencies only when order actually matters:

```text
Task A blocks Task B.
Project A blocks Project B.
External response blocks the next action.
Published/connected surface blocks launch.
```

Do not mark normal subtasks as dependencies just because they belong to the
same project.

Examples:

```text
Tally -> Notion intake connection
  Dependency for a cleaner Singleton Systems landing-page/request workflow.

Upwork consultation proof capture
  Dependency only if another task cannot happen until the proof capture exists.

Screenshot cleanup inside one project
  Usually subtasks, not dependencies.
```

## Sean Kochel / Repo Discovery Lane

Current reference:

- Sean Kochel, "5 NEW Vibe Coding Repos You Haven't Heard of Yet": https://www.youtube.com/watch?v=UnzD_bwylWs

Pattern to steal:

```text
Use trusted creators and repos as scouts for useful operating patterns.
Compress what is useful into Singleton's existing surfaces.
Do not chase every tool they mention.
```

Singleton translation:

```text
Draw.io / LikeC4 ideas -> singleton-visualizer
Ponytail ideas -> already active as the build restraint
Repo ideas -> Bear first, then research memo or skill only if repeated
```

## Content And Source Scouting Lane

This is a later lane, but it is real.

Use it for:

```text
YouTube videos
Twitter/X accounts
Instagram accounts
creator style references
offer positioning references
AI workflow examples
```

Default route:

```text
Raw link or transcript -> Bear
Repeated pattern worth studying -> research memo
Proof-backed post idea -> offer-proof-content
Platform-specific post -> LinkedIn / Instagram skill
Durable business task -> Opportunity HQ
```

Do not make a content database yet.

## Skill Created

The routing skill is:

```text
planning-idea-routing
Display: SS: Planning + Idea Routing
```

Its job is to decide:

```text
what the idea is
which surface owns it
whether it is a task, research lead, content lead, dependency, command, or skill idea
the next smallest action
what not to do yet
```

## Next Changes

Do now:

```text
Use the new skill for mixed planning / idea-routing requests.
Prepare to migrate Useful -> Strategic in live Opportunity HQ.
Use `Waiting` only for real external blockers.
Use `Parked` for intentionally saved, no-commitment items.
Plan from Today / This Week / End Of Month / August before adding due dates.
```

Do later, only if repeated:

```text
Add Notion dependency relations.
Add a Raycast quick-capture command for Planning + Idea Routing.
Create a source-scouting/content lane skill.
```
