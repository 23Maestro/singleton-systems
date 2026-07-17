# Visual System Contract

## Locked Surface Names

```text
1. Obsidian + Excalidraw - Preview & Thinking
2. LikeC4 - System Map
3A. Miro - Active Week
3B. Linear - Command Ops
```

Each surface has one job. Links may cross surfaces, but state ownership does not.

## 1. Obsidian + Excalidraw - Preview & Thinking

Intent: catch and shape work before it becomes a commitment.

Allowed inputs:

- `S.System Inbox` captures for `_Inbox`, `Business Ops`, `Production Ops`, and `Personal Ops`
- mobile and desktop share-sheet context
- screenshots, source links, rough notes, sketches, and relationships
- preview, loading, passive, and early thinking states

Promotion path:

```text
capture -> review or sketch -> decide the owner -> link or promote
```

Promote actionable command work to `Linear - Command Ops`. Promote durable
business tasks to Opportunity HQ. Promote architecture truth to LikeC4.

Default views and templates:

- `Break It Down`
- `How It Works`
- `Make a Choice`
- `Daily Planning` only for a temporary thinking pass, not the active weekly calendar

What stays out:

- durable task status
- active weekly time blocking
- command bugs and implementation commitments
- canonical repo architecture

## 2. LikeC4 - System Map

Intent: make the repo and its connected systems understandable as durable visual truth.

Allowed inputs:

- repos, apps, skills, hooks, commands, APIs, Supabase, Vercel, Notion, and external systems
- direct links to files, docs, domains, dashboards, and owner surfaces
- short plain-language descriptions of purpose and relationships

Promotion path:

```text
reviewed architecture fact -> LikeC4 source -> validate -> publish static map
```

Default views:

- `Ecosystem`
- `Repo and Skills`
- `Data and Integrations`
- `Commands and Intake`
- `Deploy and Publish`

What stays out:

- daily planning
- passive captures
- speculative relationships presented as fact
- full file inventories with no operator value

## 3A. Miro - Active Week

Intent: run the active week as movable time blocks without becoming another task database.

Allowed inputs:

- Opportunity HQ tasks with Status `Today` or `In Motion`
- all active Personal Ops home tasks from Apps Script while the list remains small
- duration, weekly count goals, and cue-based placement

Promotion path:

```text
Raycast: Queued -> Today
Miro: place and move the active block
owner system: confirm status or completion
```

Default views:

- `Day`
- `3 Day`
- `Week`
- `Home Tasks`

The same task identity and time placement should persist when changing views.
`Queued` remains in Opportunity HQ by default. A non-default queue panel may be
added later only if promotion from Miro proves necessary.

What stays out:

- passive ideas
- architecture truth
- the full Opportunity HQ backlog
- command implementation packets

## 3B. Linear - Command Ops

Intent: hold concise, assignable command and tooling work that is ready for Codex.

Exact Linear placement:

```text
Team: 23Maestro
Project: Command Ops
Default issue status: Backlog
```

Allowed inputs:

- Hammerspoon
- Keyboard Maestro
- Karabiner
- Apple Shortcuts
- Hazel
- Raycast
- shell scripts and related operating-system workflows
- links, posts, transcripts, or examples that imply a specific command-system change

Issue template:

```markdown
## Intent
[one sentence]

## Context
[app, link, error, or behavior]

## Done when
[one observable result]
```

Promotion path:

```text
S.System Inbox: New -> Command Ops
  -> prefilled Linear draft
  -> human review
  -> create in Project: Command Ops / Status: Backlog
  -> assign to Codex when ready
```

`S.System Inbox: Update` does not offer `Command Ops`. Existing command work is
updated on its Linear issue.

What stays out:

- vague visual thinking with no requested change
- weekly time blocks
- architecture diagrams
- duplicate notes that merely restate an existing issue

## Project Colors

Reuse these colors wherever a surface represents Opportunity HQ project lanes:

```text
Cash Jobs   = yellow
Career Jobs = blue
Offer       = red
Freelance   = green
Portfolio   = gray
```

Surface colors remain separate:

```text
Red    = raw capture or risk
Purple = durable Opportunity HQ / Notion truth
Green  = proof or evidence
Blue   = action and command layers
Amber  = human review or ambiguity
Slate  = passive reference or UI shell
```

## Review Rhythm

```text
During capture  -> Obsidian + Excalidraw
During the week -> Miro active blocks
Command review  -> Linear Command Ops backlog
System changes  -> LikeC4 validation and publish
Weekly closeout -> clear stale visual copies and confirm owner-system state
```
