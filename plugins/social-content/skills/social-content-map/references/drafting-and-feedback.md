# Drafting and feedback

## Load the right context

Read the operations guide linked by the Singleton Systems CODEX.md. Use the
matching service Lane's offers and audience, plus the shared writing rules.

Private voice files live under
`~/.local/share/singleton-systems/social-media-engine/`:

- `instagram/voice.md` is the shared voice guide for personal social drafts.
  Its existing location does not limit it to Instagram.
- `voice-feedback.jsonl` keeps edits, their sources and their scope.

Use the latest accepted feedback for the relevant post or format. Keep candidates open.
The latest explicit instruction from Jerami wins. Missing polished posts do
not block drafting: use his interview and current corrections as voice samples.
Keep private speech out of Git. Do not copy business facts into a new context file.

## Shape and draft

Resume the selected story and saved length through Work to Content when present.
Reuse choices already made. Keep the existing claim and source JSONL as evidence.

Choose 1 buyer problem and useful lesson. Keep the boxing purpose and the
8 story lanes distinct. Inventory assets before selecting the platform format.
For video, pair each beat with narration, screen action, asset/proof source and
any missing visual. Route that gap to reuse, Figma adaptation or a new visual,
OpenScreen capture, Video Workflows or Jerami recording as needed. Check tool
access and the production budget before promising a build.

Write the body and its payoff before offering up to 3 new opening options.
Keep an opening Jerami already chose. Return 1 draft by default. For both
lengths, retain separate timelines. Use concrete steps and the same visible
example where it helps the viewer follow the change.

Keep humor optional. A real mismatch can support a dry aside or a short
hypothetical scene. Mark invented scenes as illustrations in the beat plan;
introduce them clearly in speech. Do not add them to career claims. Creator
references guide a teaching method, not Jerami's voice. Read only the relevant
record from the saved reference library when a method is useful.

## Review and retain feedback

Check facts, credit and proof first. Then check the script as speech for voice,
clarity, humor and the payoff. Show each missing asset and its next action.
Do not infer results or require a joke in every post.

After an edit, keep the prior and revised artifacts with their hashes. Compare
the changed passage. Record only a useful, scoped lesson in `voice-feedback.jsonl`:

```text
id, post_id, scope, status, source_reference, user_evidence, lesson, supersedes,
before {path, sha256}, after {path, sha256}
```

Use `accepted` for a direct preference Jerami stated or a lesson he accepted;
use `candidate` for an inference and `rejected` for one he declined. Evidence
must identify his instruction and its context. A post-specific edit stays
post-specific unless he asks for wider use. Retain prior records. To change or
reject a lesson, append a new record with `supersedes` set to its earlier ID.
Only the latest unsuperseded accepted record applies. Never promote an assistant draft because
Jerami approved the workflow or moved to another topic.

For an explicitly approved draft, bind the exact artifact through the saved
engine review. Keep publication permission separate. Adapt to another platform
only when requested or already selected. Scheduling needs its own authorized
destination and action. This guide starts no publisher or background process.

## Source

Adapted from Maja Voje's GTM Strategist skills, revision
`a5ead26b9c1f5481bba76f4f7aaea676979910a9`: [voice and content work](https://github.com/GTM-Strategist/gtm-strategist-skills/blob/a5ead26b9c1f5481bba76f4f7aaea676979910a9/.claude/skills/running-marketing/SKILL.md),
[demo scripts](https://github.com/GTM-Strategist/gtm-strategist-skills/blob/a5ead26b9c1f5481bba76f4f7aaea676979910a9/.claude/skills/preparing-launch-assets/SKILL.md)
and [proof records](https://github.com/GTM-Strategist/gtm-strategist-skills/blob/a5ead26b9c1f5481bba76f4f7aaea676979910a9/.claude/skills/building-communication-engine/SKILL.md).
[License notice](../../../LICENSE.gtm-strategist).
