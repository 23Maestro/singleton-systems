---
name: html-playground
description: "Create OpenCode Playground-style interactive HTML playgrounds: self-contained single-file explorers with controls, live preview, sensible presets, and natural-language prompt output. Use when the user asks for an HTML playground, interactive explorer, design playground, data explorer, concept map, document critique, diff review, or code map."
---

# HTML Playground

## Purpose

Use this skill to create an OpenCode Playground-style HTML file. The file lets
the user configure something visually, see the preview update instantly, and
copy a natural-language prompt or review summary back into Codex.

This skill is only for playgrounds. It must not become the long-form report
lane. For static plans, research briefs, printable reviews, or prose-first HTML
documents, route to the separate reporting skill instead.

## Approved Comp

Use the local OpenCode Playground port as the primary comp for this skill:

```text
/Users/singleton23/plugins/opencode-playground
https://github.com/rosschambers/opencode-playground
```

The OpenCode port is based on the official playground plugin:

```text
https://github.com/anthropics/claude-plugins-official/tree/main/plugins/playground
```

Use the official source only as research/reference when comparing behavior. The
Codex output should stay branded as `html-playground` and should copy prompts
back into Codex or the current reviewer, not into another assistant by name.

## Required Local Files

Before generating a playground, load:

```text
/Users/singleton23/.codex/skills/html-playground/SKILL.md
/Users/singleton23/.codex/skills/html-playground/templates/base-playground-scaffold.md
```

Then load the closest OpenCode lane template from:

```text
/Users/singleton23/plugins/opencode-playground/skills/playground/templates
```

The repo-local copy mirrors this skill at:

```text
/Users/singleton23/Documents/Development/singleton-systems/skills/html-playground
```

Keep the global skill and repo-local copy synchronized when changing this skill.

## Core Shape

Every playground must be:

```text
single self-contained HTML file
inline CSS and JavaScript
no external runtime dependencies for the baseline version
dark theme
controls panel
live preview
natural-language prompt output
copy button with copied feedback
sensible first-load defaults
3-5 named presets when controls are present
```

The live preview updates on every control change. Do not require an Apply
button.

## DOM Contract

Use the base scaffold contract so generated files can be verified:

```html
<main data-playground data-playground-lane="design-playground">
  <section data-controls-panel>...</section>
  <section data-preview-panel>
    <div data-preview></div>
  </section>
  <section data-prompt-panel>
    <pre data-prompt-output></pre>
    <button data-copy-prompt>Copy Prompt</button>
  </section>
</main>
```

Each control needs a `data-control` attribute. Each preset needs a
`data-preset` attribute.

## Template Routing

Load the closest OpenCode Playground template before building:

```text
design-playground/SKILL.md
  Visual design decisions: components, layouts, spacing, color, typography.

data-explorer/SKILL.md
  SQL builders, API designers, regex builders, cron schedules, pipelines.

concept-map/SKILL.md
  Concept maps, knowledge gaps, scope maps, task decomposition.

document-critique/SKILL.md
  READMEs, specs, proposals, skill docs, approve/reject/comment workflows.

diff-review/SKILL.md
  Git diffs, commits, PRs, line-by-line comments.

code-map/SKILL.md
  Codebase architecture, component relationships, data flow, layer diagrams.
```

If a request does not fit one template cleanly, pick the closest template and
adapt it while preserving the core shape and DOM contract.

## Research Comparison Notes

The local OpenCode port mostly preserves the official plugin. Keep these details
in mind because they are easy to lose:

- Document critique playgrounds should render document lines with line numbers,
  suggestion highlights, status filters, approve/reject/comment actions, and a
  prompt made only from approved items or user comments.
- Diff review playgrounds should support click-to-comment lines, comment
  indicators, edit/delete behavior where useful, file/line metadata in prompt
  output, and dark-mode addition/deletion colors.
- Code map playgrounds should use SVG or dependency-free DOM diagrams with
  layer toggles, connection filters, 3-5 connection styles, click-to-comment
  components, and prompt output that includes only user-added comments plus
  visible layer context.
- Concept and code maps can later become richer diagram surfaces, but baseline
  playgrounds stay dependency-free unless the user explicitly asks for a richer
  diagram library.

## State Pattern

Use one state object. Every control writes to it. Every render reads from it.

```javascript
const defaults = { /* first-load values */ };
const state = { ...defaults };

function updateAll() {
  renderControls();
  renderPreview();
  updatePrompt();
}
```

Presets should replace the relevant state values, then call `updateAll()`.

## Prompt Output Pattern

The prompt output is not a raw state dump. It should read like a useful
instruction to Codex or a reviewer.

Rules:

```text
mention only meaningful non-default choices
include enough context to act without seeing the playground
use qualitative language alongside numbers
group approved comments or selected options when reviewing
keep it copyable as one coherent prompt
```

Example shape:

```javascript
function updatePrompt() {
  const parts = [];

  if (state.radius !== defaults.radius) {
    parts.push(`use ${state.radius}px corners`);
  }

  if (state.shadow === "deep") {
    parts.push("make the surface feel more elevated");
  }

  promptOutput.textContent =
    parts.length === 0
      ? "Keep the default card style."
      : `Update the card to ${parts.join(", ")}.`;
}
```

## Workflow

1. Identify the playground type.
   - Design playground
   - Data explorer
   - Concept map
   - Document critique
   - Diff review
   - Code map

2. Load the base scaffold:

```text
/Users/singleton23/.codex/skills/html-playground/templates/base-playground-scaffold.md
```

3. Load the matching lane template from:

```text
/Users/singleton23/plugins/opencode-playground/skills/playground/templates
```

4. Find the real input data.
   - Use repo files, diffs, Markdown, JSON, CSV, database readback, or
     user-provided notes when available.
   - Preserve exact names, labels, routes, shortcuts, statuses, and source
     wording from the input.
   - If no structured data exists, create a small explicit data object at the
     top of the HTML.

5. Build the single HTML file.
   - Use the required DOM contract.
   - Use a controls panel and live preview for configurable playgrounds.
   - Use click-to-comment, approve/reject, filters, or canvas/SVG interaction
     when the selected template calls for it.
   - Keep advanced controls grouped or collapsible.

6. Verify before handoff.
   - Run `node scripts/verify-html-playgrounds.mjs <file.html>` when the repo
     verifier is available.
   - Check that controls update the preview immediately.
   - Check that controls update prompt output immediately.
   - Check that presets update controls, preview, and prompt output together.
   - Check that the copy button is wired and shows copied feedback.
   - Check text fit and first-viewport readability on desktop and mobile.
   - Report any blocked browser or clipboard behavior explicitly.

## Repo Placement

Follow the repo's existing folder convention when one exists.

Singleton Systems default:

```text
docs/diagrams/YYYY-MM-DD-topic-playground.html
```

Sample and golden playgrounds may live under:

```text
docs/diagrams/html-playground-samples/
```

Visual research screenshots for this skill live under:

```text
docs/ui-reference/playground-research/YYYY-MM-DD/
```

For quick non-repo work, create one HTML file in a sensible local output folder
and report the path.

## Verification Commands

For Singleton Systems skill changes, run fresh verification before claiming the
work is complete:

```bash
node scripts/verify-html-playgrounds.mjs
node scripts/check-cerebral-drift.mjs
```

Also run stale-name scans for the final skill package when touched. Mentions of
the official plugin, OpenCode, or richer diagram references are allowed only in
research/reference sections. The final skill must not use stale route names or
report-lane language as its own identity.

## Avoid

```text
static report pages
long plan documents
giant prose cards
HTML as a durable source of truth
external build systems
server requirements for one-off files
raw JSON/state dumps as prompt output
```
