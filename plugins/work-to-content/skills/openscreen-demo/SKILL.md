---
name: openscreen-demo
description: Record and edit a chosen workflow with OpenScreen for the Work to Content plan. Capture a requested window, cut useful moments and return a verified draft for Jerami's review.
---

# OpenScreen for Work to Content

Use the `work-to-content` skill to bind the content intent and source work.
These local rules govern the bundled [upstream API recipe](references/upstream-SKILL.md).
Read its setup and record/edit/export sections when needed. Its PR and X
delivery recipes are outside this plugin's default capture task.

## Set up

Check the app's `help` command for `mcp`, then the available MCP tools. The app
path is `/Applications/Openscreen.app/Contents/MacOS/Openscreen`. The plugin
bundles its stdio server. Missing app, MCP tools and screen permissions are
separate states; report the one that is missing. Keep the tested app version
fixed until an update is checked. Add no paid provider or account for capture.

## Before capture

Name the requested action, source work, chosen window and stop condition.
Planning, installing a skill and configuring tools start no recording.
Use camera or microphone only when the requested take needs them.

Verify HomeSSD is mounted, writable, has at least 50 GiB free and has volume
UUID `0EB7E204-D359-47B2-B9B1-89B2DC77BC5A`. Stop if the gate fails; do not use
the internal SSD as a media fallback. Use the existing video-storage gate when
available. Configure OpenScreen's recording folder before capture.

Store working media under `/Volumes/HomeSSD/Generated/<CLIENT>/<TYPE>/`.
Use upper snake case for clients and `_INBOX` when unknown. Types are `source`,
`audio`, `renders`, `previews` and `references`. Keep reusable source and small
project manifests in the repository. Preserve irreplaceable raw source in
Eagle or MediaSSD. Wait for Jerami before any Eagle write.

## Capture and cut

Use `listSources`, `startRecording` and `stopRecording` for the selected take.
Keep project/checkpoint IDs, file path, capture start and useful source times.
Log visible actions as markers. Scripted actions may not move the real cursor;
use `setPointerTrack` only from the actions actually recorded. Do not invent
clicks. Prefer the in-app browser. No temporary Chrome profile or localhost
preview is needed for an ordinary capture.

Inspect the take before editing. Save a checkpoint. Cut waits, keep the result
readable and add zooms only where they help. Keep source times separate from
the edited playback times. Export to the chosen HomeSSD path.

Verify the output exists, its duration is plausible and frames show the right
window and beats. Check playback before calling it ready. Return the draft,
selected ranges and remaining review. A passed file check does not grant
Jerami's visual approval. Publishing and sending stay separate actions.
