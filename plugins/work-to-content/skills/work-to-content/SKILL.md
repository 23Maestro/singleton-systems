---
name: work-to-content
description: Plan or prepare Jerami's social content from real client work, starting with Catena Lineups. Use for workflow proof clips, recording useful work and resuming this content plan. Client production stays in its own workflow.
---

# Work to Content

Read [the content plan](references/content-plan.json), then its HomeSSD
`workspace.notePath`. The startup hook repeats that link. Keep working notes,
capture logs and drafts there. If HomeSSD is offline, keep the pointer and stop
writes until the drive returns. Run `workspace.beforeWrite` before writing.
For media, run the storage gate with its matching type.
Start with the work already done. Keep the next step small.
For the Social Media Engine, use [saved routing](references/saved-routing.md).
Run `python3 plugins/work-to-content/skills/work-to-content/scripts/social_engine.py status` first.
Resume its active post before starting another. Before shaping a new story,
ask with `request_user_input_async`: **Short form**, **Long form**, or
**Storyboards for both**. The app adds the write-in field. Reuse an explicit
choice from this chat; do not ask again on resume. Save it with `scope`.
For both, draft 2 timed storyboards from the same facts. Keep each version
separate. A short table view can show 1 row at a time with large text.
Keep source claims, attack,
story lane, asset check, format and opening as separate fields. The helper
saves decisions and routes; it starts no production tool.
Resume the saved content calendar and creator references before collecting
more ideas. Keep the existing calendar and its source records.

## Choose the action

- **Plan or resume:** find 1 verified work example and return its next action.
- **Set up:** verify the OpenScreen app and tools. Setup starts no recording.
- **Record:** use the bundled `openscreen-demo` skill for the requested window
  and work segment. A content idea alone does not authorize capture.
- **Edit:** use that skill on the selected take. Return 1 short draft.
- **Publish:** show the exact clip, copy and destination for Jerami's approval.
  A review approval does not authorize a post or upload.

Creating this plugin grants no recording, delegation or background work.
Use the current session for work unless Jerami asks for another task.

## Keep the work bound

Use the existing content task when one exists. Asana owns content work; Linear
owns changes to this plugin. Keep production task state separate.

Update the HomeSSD note with the take and draft links. Include the intent, source task,
episode and scene IDs, source revision, requested action, window, clip paths,
useful source-time ranges, proof for each claim and the next review step.
Add the capture start time and OpenScreen project/checkpoint IDs when available.
Keep missing proof explicit. Do not turn a planned step into a finished result.
Keep plugin source, Git and small project manifests in the source repository.
Asana owns content task state; the note is the working plan and capture log.

For Lineups, the first story is: **script cue → timed graphic → Premiere
placement**. Use the final graphic first when it makes the point clearer.
Show the Premiere step only when its placement is verified. Use the actual
Pre-Figma and Post-Figma records. Keep episode, scene and cue identity intact.
Manim proves timing; Figma Motion owns the graphic; Premiere owns assembly.

Record visible work as it happens when it fits the requested task. API work
may show no action on screen. In that case, capture the resulting preview or
make a clearly named demo. Never present a replay as a live work session.
Viewing a production file does not authorize changing its masters or edit.

## Make the first draft

Aim for 1 useful clip of about 30 seconds and 3 clear beats. Adjust if the
example needs it. Cut setup and waits. Keep enough context to show the result.
Save marked ranges from the original take before cuts or speed changes.

Explain the editing problem, the system Jerami built and what he still chose.
This supports video editing now and workflow consulting through proof. Make
no claim about time saved, revenue or full automation without direct evidence.

Return the angle, short draft, selected ranges, proof and 1 next action.
Ask about platform only when it changes the current cut. Preserve saved creator
references as structure, with source links; do not copy their voice or claims.
Keep the final clip and copy open for Jerami's review.
