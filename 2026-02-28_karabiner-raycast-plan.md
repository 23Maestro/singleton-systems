# Plan: Stabilize Premiere `L` Label Mode and Design Raycast Group-Based Mod Builder

## Summary
This plan handles three outcomes in order:

1. Lock a non-ghost strategy for Premiere label mode while preserving your chosen **sticky/latch** behavior.
2. Keep a concise inventory of active Default Folder X (DFX) folder mods as current baseline.
3. Define a Raycast workflow that helps create new group-based mods (template/form flow), writing directly to Karabiner TS and validating automatically.

Current DFX active baseline (source: `/Users/singleton23/Documents/Development/karabiner-ts/karabiner-config/src/index.ts`):
- Mode toggle: `d+f`
- Active keys while `dfx_mode=1`: `1 2 3 4 5 6 7 8 9 0 d x`
- Exit: `escape`

## Scope
In scope:
- Premiere `L` latch safety design (no behavior flip to momentary-only)
- DFX active-mod inventory baseline for expansion
- Raycast extension architecture for adding new group mods (e.g., `i`, `m` under DFX)
- Output flow: patch `index.ts` directly, run build, show diff

Out of scope:
- Executing edits in this step (Plan Mode)
- Direct “executor” behavior from Raycast to fire live Karabiner actions

## Design Decisions (Locked)
- `L` behavior: **Keep current latch style**, add guardrails.
- Raycast source-of-truth: **Parse Karabiner TS** (`index.ts`) initially.
- Raycast default UX: **List + Toggle Action** (optional grid command).
- Raycast v1 role: **Template/form builder for new mods**, not action executor.
- Write target: **Patch `/karabiner-config/src/index.ts` directly**.
- Validation: **Auto-build + show diff** after generation.

## Implementation Plan

### 1) Premiere `L` Ghost-State Safeguards (Latch Preserved)
Target rule: `Premiere Pro: Label Mode (hold L)` in `/Users/singleton23/Documents/Development/karabiner-ts/karabiner-config/src/index.ts`.

Changes to implement:
1. Keep latch semantics (`toIfHeldDown(toSetVar('pp_label_mode', 1))`).
2. Raise/confirm hold threshold in safe band (`~420ms`, adjust from current value only once).
3. Add auto-disarm mapping for non-label keys while `pp_label_mode=1` (first accidental key exits mode).
4. Keep `escape` as explicit kill switch.
5. Add visual state cue on arm/disarm (reuse KM script signaling pattern already used in file).

Why this is compatible:
- Preserves your sticky workflow.
- Reduces accidental long-press arms and lingering hidden states.
- Gives immediate feedback when mode is active.

### 2) DFX Active-Mod Inventory as Expansion Baseline
Use current group (`Global: DFX one-shot mode (d+f)`) as canonical baseline in `index.ts`.

Baseline active triggers to carry forward:
- Action keys: `1..0`, `d`, `x`
- Planned additions example: `i`, `m`

Generation contract for new DFX entries:
- Each new key:
  - Only active under `ifVar('dfx_mode', 1)`
  - Sends intended key with modifiers `['left_command', 'left_option', 'left_control']`
  - Immediately resets `dfx_mode` to `0`
  - Triggers existing KM reset/status script (same style as current entries)

### 3) Raycast Extension: Group-Based Mod Template Builder

#### Command Set (v1)
1. `Karabiner Groups` (List command)
- Parses `index.ts`
- Displays groups/rules and current active keys
- Action to open optional Grid command

2. `Add Group Mod` (Form command)
- Field 1: Group selector (e.g., `Default Folder X`, `Premiere Pro`)
- Field 2: Trigger key capture (shortcut watcher style)
- Field 3: Output key selector (or literal key)
- Field 4: Modifier preset selector (default prefilled by group; for DFX use ctrl+opt+cmd)
- Field 5: Post-action behavior (for DFX default: one-shot reset)

3. Optional: `Groups Grid` (visual scan of groups + counts)

#### Data/Parsing Strategy
- Parse `index.ts` AST (TypeScript parser) for:
  - `rule('...')` blocks
  - `ifVar('...')`-scoped mappings
  - Existing map entries for duplicate detection
- Avoid fragile regex-only parsing for writes; use AST-aware transform or guarded anchor insertion.

#### Write Strategy
- Write directly to `/Users/singleton23/Documents/Development/karabiner-ts/karabiner-config/src/index.ts`.
- Insert new mapping lines in the relevant rule block in stable sorted order (numeric keys first, alpha second).
- Preserve existing chaining pattern (`.condition(...).to(...).to(toSetVar(...)).to$(...)`).

#### Validation + Feedback
After write:
1. Run: `npm --prefix /Users/singleton23/Documents/Development/karabiner-ts/karabiner-config run build`
2. Capture success/failure and display in Raycast toast.
3. Show git diff preview in Raycast detail or quick-open in editor.

## Important Interfaces / Types (Public to Extension Internals)
Define internal interfaces for deterministic behavior:

- `KarabinerGroup`
  - `id: string`
  - `name: string`
  - `ruleTitle: string`
  - `modeVar?: string`
  - `appScope?: string[]`
  - `activeKeys: string[]`
  - `modifierPreset?: string[]`

- `ModTemplateInput`
  - `groupId: string`
  - `triggerKey: string`
  - `outputKey: string`
  - `modifiers: string[]`
  - `resetModeVar?: string`
  - `postActionScript?: string`

- `PatchResult`
  - `filePath: string`
  - `insertedSnippet: string`
  - `buildPassed: boolean`
  - `diffSummary: string`

## Test Cases and Scenarios

### Premiere `L` Safeguards
1. Fast tap `l` in Premiere text/timeline: always emits `l`.
2. Intentional hold `l`: enters label mode reliably.
3. While in label mode, press valid label key (`1..0,-,=`): executes label action.
4. While in label mode, press unrelated key: mode auto-disarms.
5. `escape` always disarms.

### DFX Expansion
1. Existing DFX keys still function unchanged after adding `i` and `m`.
2. New keys `i` and `m` fire expected modified chord and reset one-shot mode.
3. Duplicate key insertion attempt is blocked with clear message.

### Raycast Flow
1. Group list accurately reflects current `index.ts` groups and active keys.
2. Form submission generates valid map entry in correct group.
3. Build auto-runs and reports pass/fail.
4. Diff preview includes only intended changes.

## Risks and Mitigations
- Risk: Parser mismatch due custom chaining style.
  - Mitigation: AST parse + fallback guarded string anchors per rule title.
- Risk: False duplicate detection on similar keys in other groups.
  - Mitigation: Scope duplicate checks to selected group + mode var.
- Risk: Latch still feels sticky.
  - Mitigation: Add visible state indicator and non-label auto-disarm.

## Assumptions and Defaults
- Repo remains at `/Users/singleton23/Documents/Development/karabiner-ts`.
- `index.ts` remains primary editable Karabiner source.
- DFX modifier chord default remains `ctrl+opt+cmd`.
- Auto-build command remains `npm --prefix karabiner-config run build`.
- Because this step is in Plan Mode, creation of `2026-02-28_karabiner-raycast-plan.md` is deferred to implementation mode; this plan is the exact content baseline for that file.
