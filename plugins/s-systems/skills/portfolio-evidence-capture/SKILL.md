---
name: portfolio-evidence-capture
description: Capture reviewable project proof at meaningful workflow gates, propose a lean evidence packet, and save only approved visuals and facts to Eagle. Use for portfolio checkpoints, project closeouts, proof logging, or a manual portfolio sweep.
---

# Portfolio evidence capture

Capture useful proof while project context is still available. Eagle owns the
approved visual packet. This skill prepares evidence for
`career-portfolio-packager`; it does not write portfolio copy or publish posts.

## Modes

- `portfolio checkpoint`: review the meaningful gate that just finished.
- `portfolio closeout`: reconcile the approved checkpoints for one project.
- `portfolio sweep`: recover candidates from a named project or time period.

A sweep is manual recovery. Do not schedule a recurring sweep unless Jerami
asks for one.

## Checkpoint rule

At the end of a meaningful review gate, propose a checkpoint only when the work
produced visible proof or a verified result. Ignore routine tool calls and
intermediate screenshots that do not explain the work.

Use the workflow's own stage names. When none exist, use the smallest useful
subset of `Intake`, `Analysis`, `Build`, and `Delivery/Result`.

Propose no more than two visuals for one gate. Reuse strong screenshots already
created during the work before capturing new ones. Prefer before-and-after
pairs, visible app state, final artifacts, or concise process evidence.

Before any Eagle write, show:

```text
Portfolio checkpoint available: <project> / <stage>
Proposed visuals: <1-2 candidates>
Verified facts: <facts supported by the work>
Missing proof: <none or one useful gap>
Decision: save, revise, or skip
```

Wait for Jerami's decision. Approval of the project work is not approval to
save its portfolio packet. Do not silently import, move, rename, tag, redact,
or delete Eagle items.

## Evidence rules

- Asset first, claim second. Do not invent results, timing, praise, or metrics.
- Use Codex UI screenshots only when they explain an important system behavior.
- Exclude secrets, private messages, client links, personal data, and unrelated
  desktop content. Propose a redacted replacement when the useful proof is
  unsafe to save.
- Record source paths or app locations so each claim can be checked later.
- Mark missing evidence as missing. Do not recreate a false before state.

## Approved Eagle packet

Choose the existing portfolio root by project type:

```text
01 Video Portfolio
02 Workflow Portfolio
03 Website Assets
04 Personal Systems
```

Create one flat project folder under that root. Keep at most 12 approved
visuals. Use ordered names such as `01-intake-before`, `02-intake-after`, and
`03-transcript-map`. Do not create stage subfolders.

Include one `evidence-receipt.md` with:

- project and capture date;
- approved stage names and visual filenames;
- verified facts and their source locations;
- Jerami's checkpoint decisions;
- missing proof or privacy edits;
- closeout status.

Read back the Eagle folder, item count, ordered names, and receipt after an
approved save. Report mismatches as incomplete.

## Handoff

After closeout, offer the approved packet to `career-portfolio-packager`. Use
`offer-portfolio-content` only when Jerami asks for social content. Never
publish during evidence capture.
