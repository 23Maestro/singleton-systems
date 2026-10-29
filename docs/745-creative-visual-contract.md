# 745 visual contract

[Source visual direction](https://docs.google.com/document/d/1AmoyonXDcWnqPpYkCecxGnOVVxBk1dJbpdMSaRLkaSc/edit)
governs the content lanes. `config/745-creative/visual-contract.json` owns the
machine-readable treatments. `active-edit.json` binds one exact Premiere
sequence, client, lane, source, and headline.

Ben and Eric each have a `visual-contract.json` under
`config/745-creative/pastor-ben/` and `config/745-creative/eric-miller/`.
The shared contract indexes these files. The hook resolves them before loading
rules, so there is one definition per client. Jev selected this file structure;
the source documents govern the treatments.

Ben uses Modern Earth with gray-blue and Cambria/Calibri. His cover has a clear,
bold headline; his teaching video stays minimal. Cambria remains pending.
Eric uses After Hours with the daytime warm base and Roboto/Arial. His later
brand direction supplies the palette missing from the estimate brief.

Eric's static thumbnails also follow `client.thumbnailSystem` in his contract.
Jerami authorized four type treatments on 2026-10-13: light/regular Roboto, bold Roboto,
heavy Playfair Display, and italic Playfair Display. These are close matches to
his supplied Kantor screenshots. The After Hours palette stays active. Phrase
layers can sit behind a foreground copy of the same real Eric photo, cut out
with native Figma Remove background. Reduce excess headroom and omit outlined
boxes. East of the River covers include “with Eric.” Jerami accepted his revised
Reel layout on 2026-10-13. Its measured thumbnail baseline is recorded in Eric’s
`thumbnail-reference-baseline.json`. Grid review remains open before batch reuse. Trim each cutout to its visible alpha bounds, preserve its
source alignment, and lock image/fade layers. Text phrases keep tight, unlocked
boxes for direct selection. This revision applies only to static thumbnails.

Each client file records framing, color, opening treatment, on-screen text,
cover direction, source links, and review checks for all four listed lanes.
There is no invented mandatory intro or universal series label. Family/music
and property reference lanes do not add work to the requested 14 Ben and 16
Eric videos. Their Premiere templates remain unbuilt. Eric’s thumbnail baseline
applies only to the revised Local Reel.

John Prayer uses the supplied reference: John prominent, violet “A Prayer For”
label, short white/violet headline, dark lower fade, and breathing room. The
preview is 178×222; the output remains 1080×1920. The reference is stored on
MediaSSD and checked by SHA-256. Jerami approved the larger title and native
Premiere opening fade on 2026-10-06. Reuse it across the 18 Prayer sources.
The 17 remaining review sequences now have trimmed heads and tails, native
fades and Figma titles. They use completed Premiere transcripts only. Sound
finishing and full playback review remain open. The 6 Bold Beliefs clips keep
their own treatment. `config/745-creative/john-prayer-batch.json` records each
source, sequence, title, draft cover and pending checks.

`clients.pastor_john.lanes.prayer.productionMaster` indexes the approved
measured record at `config/745-creative/figma-masters/pastor-john-prayer.json`.
The editable graphic-only project is
`config/745-creative/premiere-masters/john-prayer-native-fade-v1.prproj`.
Copy its native Graphic clip above footage; do not nest the sequence.
Ramp uses a white-to-black gradient with Multiply blending. The title-only
Figma PNG sits above it. Set PNG export `contentsOnly: true` on the title frame.
Check actual transparent pixels; an alpha channel alone does not prove this.
The opening hold is 3 seconds. Each video's own
headline, crop and cover frame still need inspection. Full-edit review and
export remain with Jerami. The Anxiety video was captioned in Opus Clip. On
2026-10-17 Jerami moved the other 17 Prayer captions to a John caption lane in
motion-studio. It burns Opus-matched captions into the CLEAN exports and keeps
Premiere native captions blocked. The lane is recorded under
`clients.pastor_john.lanes.prayer.captions`.

## FaithTalk

FaithTalk has its own [visual contract](../config/745-creative/faithtalk/visual-contract.json)
and [source index](../config/745-creative/faithtalk/references.jsonl). Read both
before a FaithTalk job. Jerami adopted Marco's supplied social kit on October
28, 2026. Eagle keeps its masters, photos, layout samples and complete source
archive under FaithTalk TV / Social Brand - 2026-10.

Use separate carousel, Story, Reel and broadcast-outro lanes. The social
artboards do not replace the locked broadcast outro. Episode 2 labels and
airtimes in the samples are old copy. The current brief sets each episode's
details. Include the episode and part in task and export titles.

## Locked and adjustable

Client, content lane, font family, palette, required label, hierarchy, graphic
density, and caption ownership are fixed. Jerami allows up to ±10% changes in
size, spacing, position, crop scale, and opening hold within the lane treatment.
Headline, line breaks, and source frame are per-video content slots.

The percentage is relative to a measured template baseline. John Prayer's
`approvedBaseline` records the approved 112 px headline, 39 px label and native
fade geometry. Other lanes still need baselines. This policy is not a visual
similarity score.

Figma authors reusable lane masters and covers. HyperFrames + GSAP is an optional
renderer when the native export or motion handoff cannot meet the requirement.
Review designs and batch cover contact sheets in Figma. Test each lane's first
opening over real footage in Premiere, which owns footage and final assembly.
Opus Clip owns captions, except the motion-studio caption lanes for John
Prayer, John Bold Beliefs and Pastor Ben. Asana owns task state. The JSON contract does not mark
videos done or send client messages.

Role-matched UI components can replace plain label containers or accents.
Keep fonts, palette, wording, hierarchy, density and face clearance. Record the
component source and reuse permission; review the first choice before reuse.
The ±10% limit applies to measured geometry. Shape substitution has no numerical
visual-similarity score. The FigJam intake map is not a production master.

## Talking-head cut and color in Premiere

This covers the direct-to-camera batches: John Bold Beliefs, Pastor Ben and
Eric Miller. The order is transcript, forced alignment, cut plan, Premiere cut
and color, Premiere export, then captions on the export. Jerami reviews and
exports in Premiere. The motion-studio lanes hold the scripts and the cut plans.

Import the raw `.mov` with the MCP `import_media`. iPhone takes carry a −90°
rotation tag, and a native import keeps it. Never use FCP XML or
`import_fcp_xml`. XML import drops the tag and the picture lands sideways.
Do not call `create_sequence`. It opens a modal dialog and hangs the MCP.
Duplicate a finished sequence from the same batch, rename it, then replace its
footage.

Before each write, call `set_active_sequence` and read the name back. Most
tools act on the active sequence, and Jerami may switch it. Overwrite the
source at 0 with `add_to_timeline`. Razor every planned time, then check the
piece count and in points. Remove pause pieces from last to first: the video
piece, then the audio piece, each with ripple. Removing only the video leaves a
gap. Do not use `trim_clip`, `ripple_delete`, `set_source_in_out`,
`set_effect_property` or `execute_extendscript`. Their parameters do not reach
Premiere, or they corrupt in and out points. MCP undo is unreliable. Do not edit
while Jerami works in the project, and leave his sequences alone.

Set every sequence to Rec.709 in Sequence Settings. The working color space is
BT.709, 8-bit, display-referred, and Auto Tone Map Media is on. The source is
BT.2100 HLG. The saved project records this as `OutputColorSpace` BT.709 with
`autoToneMapEnabled: true`. The MCP cannot read or set this. Set it on the
first sequence before duplicating, then check each copy in the dialog. Apply
Lumetri with `apply_effect` and a parameters map, only on the active sequence
and only with the grade Jerami names. Read the values back.

`export_sequence` queues Adobe Media Encoder. On 2026-10-20 the queued
Compassion export started the picture late while its audio was right. Jerami's
direct Premiere exports were correct. Check every export's opening frames
against its audio. Probe each file for 1080×1920, 60 fps, bt709 transfer and
the sequence's duration.

## Thumbnail color preparation

Before background removal, check every selected photo's source color space and
existing grade. Normalize unconverted HDR footage to SDR with Rec.709 primaries.
Use a color-managed sRGB PNG in Figma. Review exposure and skin color before
making the cutout. Preserve correct baked grading and existing Figma adjustments;
check them separately so the image does not receive the same correction twice.
Both photo layers must come from the same graded image. Keep source tags, frame
time, image hashes and grade decisions in the image record.

## Graphics handoff

The shared `workflow.graphics` policy applies to all three clients.
Its `editableLayerBounds` rule requires tight cutout, background and text bounds
in Figma. Lock completed image/fade layers and keep text directly selectable.
Preserve the source crop alignment and inspect the result after trimming. Build only
lanes represented in the current batch. John has Prayer and Bold Beliefs.
Ben and Eric still require source inspection before lane selection. Reference
lanes add no deliverables. Cambria remains pending.

`graphics-plan` prints per-video variables from the current binding and resolved
contract. It checks source/project presence and keeps the reference hash.
It records the source's nominal frame rate separately from its VFR average.
Confirm that rate against the bound Premiere sequence before rendering.

```bash
python3 .codex/hooks/creative_745.py graphics-plan --opening overlay --opening-seconds 3
python3 .codex/hooks/creative_745.py graphics-plan --renderer hyperframes --opening overlay --opening-seconds 3
python3 .codex/hooks/creative_745.py graphics-plan --opening none
python3 .codex/hooks/creative_745.py graphics-check --plan <plan-path> --cover <cover-path> --opening <opening-path>
```

Three seconds is an example working hold, not a client requirement. Prayer
carries its required opening treatment over footage. Other current lanes can
omit a title when their treatment calls for it. No universal intro card is added.

Save the plan at its printed `planPath`. Each sequence gets one job directory
under `/Volumes/HomeSSD/Generated/745_CREATIVE/renders/`, with `cover.png` and,
when selected, `opening.png` by default. Hold or fade the transparent PNG in
Premiere. For a verified animated alpha handoff, select `--opening-format mov`;
the explicit HyperFrames fallback defaults to MOV. Native Figma video export is
not assumed to produce ProRes 4444. Verify storage through `storage:gate` before
creating media. Keep code and small manifests in the repository; the generated
job plan is a replaceable handoff copy.

Scoped HyperFrames render calls require a fallback plan through `--variables-file`,
MOV format and the bound output path. Technical checks require a 1080×1920 PNG
cover and either an alpha-capable PNG opening or an audio-free ProRes 4444 overlay
with alpha-capable pixel format, matching nominal rate and planned duration.
Static PNG duration is a Premiere placement decision. An explicit Premiere graphics import
checks the adjacent plan and exported pair again. A normal project save does not
invalidate the plan; changing the binding, source identity or contract does.

These checks do not prove that a composition consumed every style variable,
that alpha pixels are actually transparent, or that a cover uses the correct
source frame. No template is built or approved by these commands. Review the
first cover/opening against the approved Figma master, test the opening over
real footage in Premiere, and record the measured baseline before reuse.
Technical checks leave visual approval pending.

## Commands

```bash
python3 .codex/hooks/creative_745.py show
python3 .codex/hooks/creative_745.py show --client pastor_john --lane bold_beliefs
python3 .codex/hooks/creative_745.py show --client pastor_ben --lane teaching
python3 .codex/hooks/creative_745.py show --client eric_miller --lane market
python3 .codex/hooks/creative_745.py suggest --client pastor_john --state 'John addresses the viewer in a complete prayer.'
npm run check:745:visual
```

For the next video, inspect its source and sequence first. Bind the verified
values with `bind --client ID --lane ID --sequence UUID --project ABS_PATH
--source ABS_PATH --headline TEXT`. Optional `--adjustments-json` accepts only
the listed percentage fields, each within ±10. Binding resets visual completion
to unverified. Jev suggests only; it never binds or edits automatically.

## Hooks and limits

Matching prompts load the correct lane. Ambiguous prompts show the lane menu;
they do not inherit Prayer by default. Scoped Premiere mutations validate the
binding, reference hash, caption owner, and declared adjustment allowance.
Native-caption creation is blocked for the enrolled sequence, including static
calls inside `functions.exec`. Other explicit sequences are unaffected.

Shell and nested-exec guards recognize literal HyperFrames render calls naming
745 Creative. Dynamic JavaScript, aliases and wrappers can escape detection.
Direct Premiere imports and static nested calls with literal generated paths
get pair checks. Run `graphics-check` manually for dynamic imports and UI placement.

Scoped Figma calls receive the graphics policy and component-refinement reminder.
This does not enforce node-level styling or approved master identity. John
Prayer's master IDs and approved geometry are recorded in its indexed master.
The PNG-pair check does not certify the native Ramp/Multiply backing; verify
the effect values and actual Premiere composite for that path.

Native UI calls receive reminders. Hooks cannot determine the selected UI
sequence, parse arbitrary dynamic JavaScript, or certify rendered typography,
position, color, or thumbnail appearance. Inspect actual output before claiming
visual alignment. Unscoped calls are not treated as enrolled writes.

Project hook configuration is wired in `.codex/hooks.json`. Runner discovery
must be verified separately; a subprocess test does not prove a current app
session has reloaded that configuration. Approve new hooks through the app's
normal trust prompt when shown. Do not edit global trusted hashes to bypass it.
