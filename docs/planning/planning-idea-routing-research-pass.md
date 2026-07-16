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
  Stronger for system/portfolio/offer work that compounds. Weakness: more jargon.

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
  portfolio, website, workflows, systems, and client-ready assets.

Later
  Real idea, not fake-urgent, no current commitment.
```

The long-term target is not merely "get a job." A job or client project can be
important money relief, but the system's strategic north star is active
Singleton Systems offer work with paying clients.

Current reality as of June 24, 2026:

```text
Critical = cash-path execution first
Strategic = website, offer, portfolio, workflow hub, and system hardening
Later = real ideas that should not steal this week
```

Default project-lane priority:

```text
Cash Jobs -> Critical
Career Jobs -> Critical
Freelance -> Critical
Offer -> Strategic
Portfolio -> Strategic
System Cleanup -> Strategic or Later, depending on whether it unblocks execution
```

## Goal Horizon Rules

Use goal horizons before scheduling Work Dates. Work Date is for scheduled
completion by end of that date; avoid separate due dates unless an external
deadline or commitment truly exists.

```text
End of W1
  Finish by 11:59pm at the first week boundary.

End of W2
  Finish by 11:59pm at the second week boundary.

End of W3
  Finish by 11:59pm at the third week boundary.

End of Month
  Finish by 11:59pm on the last day of this month.

Next Month
  Finish by 11:59pm on the last day of next month.

6 Months
  Medium-range operating bet.

Long Term
  Singleton Systems managing paying offer clients.
```

Long-term parked note:

```text
Finance/debt cleanup matters after money starts moving. Keep it as a later
coding/cleanup goal for the existing Notion finance/debt database, not an
active Money Clock operating project yet.
```

Later research note:

```text
Casual Calvin / voice cadence system:
  Explore a lightweight way to keep outreach, proposals, and proof copy closer
  to the user's natural speaking style without creating fake persona bloat.
  Possible inputs: accepted drafts, rejected lines, before/after rewrites, and
  short examples of "I would say this / I would not say this."
  Park as research until repeated copy work proves the shape.
```

Do not overbuild the long-term layer yet. Keep it as the north star until the
near-term system is stable.

## Planning Prompt

When planning a week or month, ask for counts before Work Dates:

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

## 2026-07-02 Social API And Supabase Spine Note

This idea belongs in planning and routing first, not in a new app or database
yet.

Signal from the focus reference images:

```text
Clarity: pick the smallest useful next question.
Importance: this supports money, offer portfolio, and future content distribution.
Urgency: research now, automate only after posting behavior repeats.
Flow: keep the task just above current skill level.
Lever-moving work: one to three concrete actions, not a giant system pass.
```

Current user intent, stripped down:

```text
Research the official posting APIs for LinkedIn, X, Instagram, and TikTok.
Use the findings to shape a soft content-posting plan.
Evaluate whether Supabase should become the structured log for important
outreach attempts, references, experiments, and content-distribution attempts.
Keep Singleton Systems professional and centralized without forcing Supabase or
creating more folders just because the idea is connected.
```

Official API research snapshot, checked July 2, 2026:

```text
LinkedIn
  Source: https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/posts-api
  Relevant finding: Posts API supports creation/retrieval of organic and
  sponsored posts, with versioned headers and permission gates. Treat this as
  possible but permission-sensitive.

X
  Source: https://docs.x.com/x-api/posts/create-post
  Relevant finding: POST /2/tweets can create or edit posts for the
  authenticated user. X positions the API as pay-per-use, so cost and access
  tier matter before any build.

Instagram
  Source: https://developers.facebook.com/documentation/instagram-platform/content-publishing
  Relevant finding: Meta's content publishing path is through the Instagram
  platform / Graph API and supports publishing media posts, but it requires
  eligible account/app permissions. Treat as official but account-gated.

TikTok
  Source: https://developers.tiktok.com/doc/content-posting-api-get-started
  Source: https://developers.tiktok.com/doc/content-sharing-guidelines
  Relevant finding: Content Posting API supports direct posting, including
  photos, but requires a registered app, Content Posting API product, publish
  scope approval, user authorization, and audit before public visibility is
  unrestricted.
```

Routing decision:

```text
Obsidian
  Raw social/content thoughts, screenshots, creator references, and messy
  "what if" captures.

Eagle
  Reference screenshots, examples, portfolio assets, clips, and source visuals.

Opportunity HQ
  Durable tasks such as "Social API docs research pass", "10-post content
  test", "Outreach attempt log design", or "Supabase read-only schema review".

Docs
  API research summaries, posting rules, naming decisions, and the operating
  contract for what gets logged.

Supabase
  Candidate structured spine only after a read-only design pass. Do not create
  tables until the log shape repeats in real outreach/content work.
```

Supabase candidate shape:

```text
content_references
  platform
  reference_set
  source_url
  direct_style
  post_format
  attack_type
  notes

outreach_attempts
  target
  platform
  attempt_type
  message_summary
  reference_set
  status
  attempted_at
  next_action_at

content_posts
  platform
  post_format
  direct_style
  attack_type
  source_asset
  status
  published_url
  published_at
```

These are candidate concepts, not approved schema. Keep them in docs/page
content until real repetition proves which fields matter.

Soft plan:

```text
1. Research the four official API paths and write the constraints in this memo.
2. Create one Opportunity HQ task under Offer or Portfolio for a 10-post manual
   content test before building any publishing automation.
3. If important outreach/content attempts repeat, run a read-only Supabase
   design pass: current repo surfaces, proposed tables, writers, readers,
   verification path, and first safe migration slice.
```

Do not do yet:

```text
No new folders.
No new social scheduler.
No browser automation for posting.
No Supabase schema until the read-only contract is approved.
No platform API implementation until the manual posting/logging rhythm proves
the repeated shape.
```

## Goal Log Shape

If this becomes a Raycast action or local file later, keep the data shape this
small:

```text
Horizon
Project Lane
Target
Priority
Daily implication
Block
Evidence
```

Example:

```text
Horizon: End of W1
Project Lane: Cash Jobs
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

End of W1
  Set realistic Critical action counts by project lane, starting with blue-collar,
  career/white-collar, freelance, and follow-up actions.

End of W2 / End of W3
  Hold near-month commitments that are real but not scheduled for a specific
  Work Date yet.

End of Month
  Check whether money-path volume, website/request flow, and portfolio packaging
  are actually moving.

Next Month
  Hold commitments that belong to the next monthly operating window.

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
  depends on website/request flow, portfolio, outreach, and client-ready process.

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

Do not use `Waiting` for ideas that simply are not urgent. Use `Parked` or Obsidian.

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
Obsidian = inbox
Opportunity HQ = planned work and durable projects
Work Date = scheduled completion date
Block = rough time slot
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
Obsidian is not the durable planner.
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

Upwork consultation portfolio capture
  Dependency only if another task cannot happen until the portfolio capture exists.

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
Repo ideas -> Obsidian first, then research memo or skill only if repeated
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
Raw link or transcript -> Obsidian
Repeated pattern worth studying -> research memo
Portfolio-backed post idea -> offer-proof-content
Platform-specific post -> offer-proof-content; an explicitly requested specialist wrapper may be used only when its focused workflow is needed
Durable business task -> Opportunity HQ
```

Do not make a content database yet.

## Warm Offer Lead Vetting

For the first 10-15 offer leads, run a short pre-vet before logging or
messaging. This is the repeatable "automation" for now; do not build a new tool
until the pattern proves itself.

Use it when a lead has at least one strong signal:

```text
personal hook
local relevance
visible pricing or services
team or multi-location signal
existing media/portfolio/social assets
obvious handoff, intake, follow-up, or content gap
```

Pre-vet shape:

```text
Confirm services, pricing, team, locations, audience paths, portfolio/media assets,
likely workflow gaps, and one simple value-math reason the audit could pay off.
```

Routing:

```text
Good lead -> Opportunity HQ task under Singleton portfolio + website
Offer/social angle -> offer-proof-content
Direct B2B outreach copy -> agency-growth
Raw maybe -> Obsidian
```

Task rule:

```text
Use a thin task name, blank Notes, and page content for lead context. Do not
bury reusable rules in an individual Notion task.
```

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
Plan from End of W1 / End of W2 / End of W3 / End of Month before setting Work Date.
```

Do later, only if repeated:

```text
Add Notion dependency relations.
Add a Raycast quick-capture command for Planning + Idea Routing.
Create a source-scouting/content lane skill.
```
