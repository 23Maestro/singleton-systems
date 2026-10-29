# Akiflow mobile findings — October 24, 2026

Build against [the Akiflow clone plan](2026-10-24-akiflow-clone-plan.md). It selects the mobile navigation, task-sheet and duration-dial patterns for implementation. The observations and evidence limits below remain useful; earlier proposal boundaries are historical.

Source: 6 supplied photos, saved as Resources on Linear 23M-273. These are still images. They prove visible layout, not gestures, save behavior or storage. Jerami requested the same uncluttered direction on desktop.

## Design to carry forward

| Photo | Observed | Dashboard direction |
| --- | --- | --- |
| 1 — task | Task/Slot switch, Plan and Duration chips, large title, quiet description area, bottom metadata tools | Put the task name first. Reveal planning controls on demand. Keep client work title and due date on board cards. |
| 2 — slot | Hours/minutes wheel in a small floating panel; selected value has a pale band; neighboring values fade | Use a compact duration chip that opens an hours/minutes picker. This photo shows the wheel in Slot mode; a per-task wheel is a proposed dashboard choice until observed. |
| 3 — repeat | Separate sheet with plain choices and one checkmark | Keep repeat choices outside the task’s main view. Recurrence remains outside the approved build slice. |
| 4 — plan | One sheet lists Today through Someday; date/time and duration sit at the bottom | Offer quick date choices, then disclose time and duration. Do not show a full calendar by default. Exact choices await desktop review. |
| 5 — navigation | Short named destinations, wide spacing, bottom navigation, separate add action | Keep primary navigation brief. The screenshot also contains empty-state help; do not copy that clutter into loaded views. |
| 6 — calendar | Single-day grid, light rules, thin current-time line, small toolbar | Give the schedule the space. Use one clear day heading and restrained controls. Day-first mobile behavior is a design proposal. |

Whitespace, light dividers and one purple accent carry the hierarchy. The selected control gets emphasis; repeated help text does not. Keep accessible names for icon controls. The photos also show stacked sheets and a keyboard beneath Repeat; do not assume that keyboard behavior is desirable.

## Duration choice

The official shadcn date-picker guide composes a calendar and popover and shows a time input. It does not document this exact hours/minutes duration wheel. Use shadcn for the surrounding popover/dialog and form styling. An exact wheel needs a vetted registry module or a small local implementation with keyboard and direct-entry support. No new dependency is selected or installed.

Source: https://ui.shadcn.com/docs/components/radix/date-picker#time-picker

Photo 2 shows neighboring minute values in 5-minute steps. Existing dashboard controls enforce 15-minute timed intervals. Do not silently round a chosen 5-minute duration to 15. Resolve this through desktop observation and review. A duration is an elapsed amount; a start time is a clock time. A task effort estimate remains a separate concept.

## Source findings

- TaskEditor has date, clock and duration state. SchedulePicker independently holds the same planning concepts. Their preset sets differ.
- CommandCenterApp.saveTask only calls blockSave when edit.start is present. Choosing a new date without a start can close the editor without persisting that placement. Clearing an existing start also skips the write.
- The public blockSave route already accepts a selected date with both timestamps null. Source inspection establishes a client-path gap; it is not live owner proof.
- Pure scheduling math already has locality in command-center-schedule. Keep that useful module. Avoid a broad rewrite of owner adapters.

## Prepared TDD order for 23M-300

1. Through the approved public UI seam, select Today with no time, save, reload and reopen the same task. Prove the selected date survives.
2. Set a timed block, save, reload and reopen. Prove its start and duration survive.
3. Clear its time, save and reload. Prove it returns to an untimed plan without stale timestamps.
4. Exercise the chosen duration control with keyboard/direct entry and touch. Failed saves keep edits; cancel does not write. Use one red → green cycle at a time.

These are prepared behaviors. No new tests or application implementation were written in this review. The real owner record is selected before the integration proof.

## Architecture review

Inspect the planning-save journey first, then the duplicated planning controls. These are candidates for deepening, not new approved interfaces or a broad refactor. Read the HTML report before choosing a candidate.

## REA scope and open questions

Static REA inspected only publish/main.js and publish/preload.js from Akiflow 2.83.8 app.asar. Parent Evidence: ev_bb4e54178af5003f0668f4ccb9f1f0e1b67fc02d634adff1b6529f00182700c0. Artifact SHA-256: d260758a445284e6e71eea620786619079f62358a2aac8de76e4a85b7484e43a.

Coverage is partial: 3000 inventoried files were unselected and semantic limits were reached. REA reported an integrity mismatch for an unpacked NativeExtension.node. Analysis continued in record-and-continue mode, retaining the mismatch and treating those observed bytes as untrusted. No target code was executed by the analysis. This evidence does not establish picker behavior or account state.

After Jerami hands back the signed-in desktop app, observe: task versus slot duration, allowed steps, unset/zero duration, untimed planning and reopen, clearing a time, save/cancel behavior, keyboard focus and wheel interaction. Keep recurrence, natural-language input and slots outside implementation until selected.
