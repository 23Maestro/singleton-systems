# AI Workflow Session Intake

## Live path

The public entry point is the native `/ai-workflow-session` page, not Tally.

```text
AI Workflow Session
```

It is a no-cost first conversation to understand the friction, present a
practical solution, and decide together whether a build makes sense.

## Visitor input

Required:

```text
What are one or two things you’d like AI to make easier?
Name
Email
```

Optional context lane:

```text
Add a Loom or audio link, attach a voice memo, or paste a transcript.
```

## Delivery contract

1. The server stores a durable request row in `ai_intake_requests`.
2. Voice memos live in the private `ai-intake-voice-memos` Supabase bucket.
3. The server creates a matching Notion page in `AI Intake Requests`.
4. A Notion delivery failure is recorded on the Supabase row for retry; it
   never discards the visitor request.

Required server-only configuration:

```text
NOTION_API_KEY
NOTION_AI_INTAKE_DATA_SOURCE_ID
```

The Notion data-source ID is `3aa4c8bd-6c26-80e0-8bc1-000b198a7db7`.

## Later

Use a local watcher to retrieve a private voice memo, run `whisper-cli`, and
append the resulting transcript to the matching Notion page. Do not add hosted
transcription as part of intake.
