# Commands

## Purpose

Commands are the hands of the system. They create, open, update, or clarify
owner-owned work without becoming another planning app.

```text
Linear           -> system capture, commands, decisions, active next moves
Opportunity HQ   -> career and job workflow state
GitHub           -> research, specs, implementation evidence
Supabase         -> queryable facts and live Cerebral registry
Raycast          -> desktop action surface
Apple Shortcuts  -> mobile and share-sheet action surface
Codex            -> routing, drafting, implementation, and review
```

## Command Contract

Every action client uses the same route packet and owner names:

```text
trigger -> Cerebral route -> approved owner action -> owner URL -> readback
```

The trigger changes by device. The owner and field names do not.

```text
Phone / share sheet -> Shortcut
Mac                 -> Raycast
Reasoning / build   -> Codex
```

## System Capture

Use `Command + Ideas` for small system capture and `Singleton Systems` for
larger dashboard, integration, or architecture work.

```markdown
## Intent
<one sentence>

## Context
<link, app, error, screenshot note, or source>

## Done
<one observable result>
```

The authenticated Linear GraphQL gateway in `23M-89` is the planned shared
write path for Shortcuts, Raycast, and Codex. It returns the owner URL after a
reviewed create or update. It must keep credentials server-side.

Shortcut Playground remains pending until that gateway's endpoint,
authentication, and create/update payload are reviewed. No shortcut should
store a personal Linear API key.

## Career and Outreach Commands

Career-related actions continue to use the career owner for durable workflow
state and Supabase for queryable event facts. The dashboard is a reader:

```text
log / update career event -> owner state + queryable event
dashboard refresh         -> current owner links and follow-up cues
follow-up action          -> open Gmail, LinkedIn, Linear, or job source
```

Do not create mobile-only names, desktop-only statuses, or a parallel dashboard
backlog. `Cash Jobs`, `Career Jobs`, `Queued`, `Today`, and `In Motion` retain
their owner-system meaning.
