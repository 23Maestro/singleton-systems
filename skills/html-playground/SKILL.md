---
name: html-playground
description: Create OpenCode Playground-style interactive HTML playgrounds: self-contained single-file explorers with controls, live preview, sensible presets, and natural-language prompt output. Use when the user asks for an HTML playground, interactive explorer, design playground, data explorer, concept map, document critique, diff review, or code map.
---

# HTML Playground

## Purpose

Use this skill to create an OpenCode Playground-style HTML file. The file lets
the user configure something visually, see the preview update instantly, and
copy a natural-language prompt or review summary back into Codex.

This skill is only for playgrounds. For long static plans, reports, research
briefs, or printable HTML reviews, use the separate `html-reports` plugin/skill
instead.

## Approved Comp

Use the local OpenCode Playground port as the only comp for this skill:

```text
/Users/singleton23/plugins/opencode-playground
https://github.com/rosschambers/opencode-playground
```

The Codex plugin flow for this comp is:

```text
/Users/singleton23/plugins/opencode-playground/.codex-plugin/plugin.json
/Users/singleton23/plugins/opencode-playground/skills/playground/SKILL.md
/Users/singleton23/plugins/opencode-playground/skills/playground/templates/*/SKILL.md
```

After adding or changing the plugin, restart/reload Codex so the plugin skill
index can pick up the local plugin.

## Core Shape

Every playground should be:

```text
single self-contained HTML file
inline CSS and JavaScript
no external runtime dependencies
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

## Template Routing

Load the closest OpenCode Playground template before building:

```text
skills/playground/templates/design-playground/SKILL.md
  Visual design decisions: components, layouts, spacing, color, typography.

skills/playground/templates/data-explorer/SKILL.md
  SQL builders, API designers, regex builders, cron schedules, pipelines.

skills/playground/templates/concept-map/SKILL.md
  Concept maps, knowledge gaps, scope maps, task decomposition.

skills/playground/templates/document-critique/SKILL.md
  READMEs, specs, proposals, skill docs, approve/reject/comment workflows.

skills/playground/templates/diff-review/SKILL.md
  Git diffs, commits, PRs, line-by-line comments.

skills/playground/templates/code-map/SKILL.md
  Codebase architecture, component relationships, data flow, layer diagrams.
```

If a request does not fit one template cleanly, pick the closest template and
adapt it while preserving the core shape.

## State Pattern

Use one state object. Every control writes to it. Every render reads from it.

```javascript
const state = { /* configurable values */ };
const defaults = { /* first-load values */ };

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

2. Load the matching template from:

```text
/Users/singleton23/plugins/opencode-playground/skills/playground/templates
```

3. Find the real input data.
   - Use repo files, diffs, Markdown, JSON, CSV, database readback, or
     user-provided notes when available.
   - Preserve exact names, labels, routes, shortcuts, statuses, and source
     wording from the input.
   - If no structured data exists, create a small explicit data object at the
     top of the HTML.

4. Build the single HTML file.
   - Use a controls panel and live preview for configurable playgrounds.
   - Use click-to-comment, approve/reject, filters, or canvas interaction when
     the selected template calls for it.
   - Keep advanced controls grouped or collapsible.

5. Verify before handoff.
   - Open the file in a browser or use Playwright when available.
   - Check that controls update the preview immediately.
   - Check that presets update controls, preview, and prompt output together.
   - Check that the copy button works or report if clipboard access is blocked.
   - Check text fit and first-viewport readability.

## Repo Placement

Follow the repo's existing folder convention when one exists.

Singleton Systems default:

```text
docs/diagrams/YYYY-MM-DD-topic-playground.html
```

For quick non-repo work, create one HTML file in a sensible local output folder
and report the path.

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
