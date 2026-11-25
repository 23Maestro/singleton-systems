---
name: nathan-review
description: Review Nathan Onn's emails against current code, draw clear marker-and-pencil diagrams, or continue Jerami's illustrated repo explorer. Use for Nathan reviews, drawing requests, and the Singleton Systems docs canvas with plain explanations and expandable source details.
---

# Learn and draw

Nathan Onn is a trusted learning source for Jerami. Treat each claim as a lead to
check against current source and real work. Keep the author's claim, our finding,
and a proposed change separate.

For authored text, follow the repository's `docs/harness/writing-rules.md`.
Use plain names and short explanations. Keep technical detail behind a source
link or an expandable section. Preserve original source text when showing it.

## Continue the repo page

Use [the repo page guide](references/repo-page.md) when Jerami asks to continue
the docs canvas or explore more folders. Keep the current page and its working
links. The goal is a friendly map of the repo that opens to show real contents.
The drawing guide's page rules are required unless Jerami changes them.

This is a selected build task. The weekly email review cannot start it.

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
