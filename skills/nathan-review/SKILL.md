---
name: nathan-review
description: Review Nathan Onn's Art of Vibe Coding emails, compare useful ideas with our current code through Graphify, or draw diagrams in the newsletter's whiteboard and colored-pencil style. Use for the weekly Nathan review, requests to draw for Jerami, and hand-drawn flowcharts or concept maps.
---

# Learn and draw

Nathan Onn is a trusted learning source for Jerami. Treat each claim as a lead to
check against current source and real work. Keep the author's claim, our finding,
and a proposed change separate.

## Read an email

Use [the review guide](references/review.md). Read the full message and useful
linked sources. Search all mail, including read and archived mail. Review new
issues first, then any old issues still marked pending. A fetched message is not
a completed review.

Use Graphify on a small set of relevant code, schema, and config files. Read the
matching source too. Keep email text out of the code graph. Report the fit as
already used, worth a test, not a fit, or needs proof. Link the exact source.

The weekly run may read mail and code, build a scoped graph, and save its review
and deduplication record. It does not send mail, change inbox labels, install
tools, edit projects, or start agents. Suggest useful changes for Jerami to pick.

## Draw for Jerami

Use [the drawing guide](references/drawing.md). Start from exact nodes, edges,
labels, or data. Save the source map beside the image. Use Mermaid for a simple
flow and the existing LikeC4 source for reviewed system architecture.

Write the image prompt in the current session. Use the installed `codex-imagegen`
skill to send that prompt through Luna. The machine image profile owns the model
default. Check the resolved model before a real run. Use ChatGPT login; do not
switch to API billing on a failed run.

On this Mac the upstream shell script needs `/opt/homebrew/bin/bash`. Apple's
`/bin/bash` lacks the associative arrays it uses. Always give the script the
explicit external destination returned by the current storage gate. Never run
its `--sweep` command during a drawing task.

Inspect the final image. Check every label and arrow against the source. Correct
one clear fault at a time. A generated file is ready for review, not approved art.
Do not claim a measured cost saving from model names or API price ratios.

## Find the local records

Run the repo storage gate for client `SINGLETON_SYSTEMS` and kind `references`.
The `nathan-newsletter` folder holds `inventory.json` and reviews. Use kind
`renders` for new art. Stop if HomeSSD is absent or the gate fails.

The schedule is a Codex thread heartbeat. Its saved config owns the next run.
Read it before changing it; do not create a second schedule for this skill.
The setup task is [Learn from Nathan](https://linear.app/23maestro/issue/23M-453/learn-from-nathan).
