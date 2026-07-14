# Excalidraw Setup Pass

## Purpose

Human-facing decision path for what the Excalidraw setup unlocked and what must
be decided next. GitHub issue #3 remains the task record.

## What Changed

- Added `Set Grid` from the current official Excalidraw script list.
- Added `Auto Draw for Pen` from official Excalidraw repository history.
- Confirmed downloaded Excalidraw script commands through the Obsidian CLI.
- Added a guarded Templater startup template in the existing `Templates` folder.
- Wired Templater startup to install an Excalidraw on-file-open hook.
- Verified the hook exists in runtime and logs for the Production Ops map.

## Current Script Surface

- `Add Link to Existing File and Open`
- `Auto Draw for Pen`
- `Capture Note`
- `Repeat Texts`
- `Scribble Helper`
- `Set Grid`
- `Set Text Alignment`

## Decision Flow

1. Setup is ready: scripts, commands, and guarded startup hook exist.
2. Manual iPad test comes next: draw, align, link an existing file, confirm feel.
3. Daily board contract follows: choose what belongs on the global board.
4. Capture Note stays limited: one manual production note, no routing.
5. Automation waits: no Notion or Google writeback until the visual contract is
   trusted.

## Why It Matters

- iPad drawing gets better pencil ergonomics without adding another drawing
  plugin.
- Visual links can point at real vault files.
- Blocks can be aligned and made more readable while planning.
- Startup wiring is now available for future planner behavior, but does not yet
  mutate Notion, Google, or Obsidian task state.

## Guardrails

- No automatic task writeback.
- No automatic Notion or Google updates.
- No new Obsidian task database.
- Excalidraw remains visual review, sequencing, and promotion surface.

## Verification

- Excalidraw plugin enabled: `2.25.3`.
- Templater plugin enabled: `2.20.6`.
- Script commands visible through Obsidian CLI.
- Runtime hook type: `function`.
- Production Ops map hook log verified through Obsidian CLI debugger.
- Obsidian errors: none captured.

## Next Decision

Should the first planner board show only today's active lanes plus weekly
application counters, or also show queued/admin pull-forward items?

## Next Action

- Run a 20-minute manual Excalidraw test.
- Use the result to lock the first daily-board contract.
- Then update the static planner prototype.
