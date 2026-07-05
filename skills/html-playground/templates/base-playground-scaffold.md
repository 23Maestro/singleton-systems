# Base Playground Scaffold

Use this scaffold for every `html-playground` output unless the user gives a
stronger local pattern.

## Required DOM Contract

Every generated playground must expose these hooks so it can be verified:

```html
<main data-playground data-playground-lane="design-playground">
  <section data-controls-panel>
    <button data-preset="compact">Compact</button>
    <input data-control="density" type="range" />
  </section>

  <section data-preview-panel>
    <div data-preview></div>
  </section>

  <section data-prompt-panel>
    <pre data-prompt-output></pre>
    <button data-copy-prompt>Copy Prompt</button>
  </section>
</main>
```

## Required Behavior

- Use one HTML file with inline CSS and JavaScript.
- Use no external runtime dependencies for the baseline playground.
- Use a dark theme with readable contrast and system UI fonts.
- Keep one `state` object and one `defaults` object.
- Every control writes into `state`.
- Every preset replaces a cohesive set of state values.
- `updateAll()` must call `renderControls()`, `renderPreview()`, and
  `updatePrompt()`.
- Preview and prompt output must update immediately after every control change.
- Include 3-5 named presets when the playground has controls.
- The copy button must copy `data-prompt-output` and show copied feedback.
- Keep first-load defaults useful; no empty preview.
- Keep text inside controls, cards, and preview blocks from overflowing on
  mobile or desktop.

## Minimal JavaScript Shape

```javascript
const defaults = {
  density: 2,
  focus: "balanced"
};

const state = { ...defaults };

const presets = [
  { name: "Balanced", values: { ...defaults } },
  { name: "Compact", values: { density: 1, focus: "fast scan" } },
  { name: "Detailed", values: { density: 3, focus: "deep review" } }
];

function applyPreset(index) {
  Object.assign(state, presets[index].values);
  updateAll();
}

function renderControls() {
  // Keep controls synchronized with state.
}

function renderPreview() {
  // Render a visual preview from state.
}

function updatePrompt() {
  const parts = [];
  if (state.density !== defaults.density) {
    parts.push(`use ${state.density === 1 ? "compact" : "expanded"} density`);
  }
  promptOutput.textContent = parts.length
    ? `Update the playground direction to ${parts.join(", ")}.`
    : "Keep the balanced default direction.";
}

function copyPrompt() {
  const text = promptOutput.textContent.trim();
  navigator.clipboard?.writeText(text);
  copyButton.textContent = "Copied";
  setTimeout(() => { copyButton.textContent = "Copy Prompt"; }, 1200);
}
```

## Layout

Use a three-part layout:

```text
controls panel | live preview
prompt output panel across the bottom
```

On small screens, stack controls, preview, and prompt vertically.

## Lane Adaptation

- `design-playground`: controls tune spacing, radius, density, colors, type,
  layout, and interactions; preview is a component or screen fragment.
- `data-explorer`: controls select sources, fields, filters, limits, and
  ordering; preview is formatted query/config output or a pipeline diagram.
- `concept-map`: controls tune knowledge level, focus area, visibility, and
  relationship type; preview is a node/edge map.
- `document-critique`: controls/filter cards approve, reject, comment, or focus
  suggestions; preview is a marked document or suggestion queue.
- `diff-review`: controls/filter changed files and comments; preview is a diff
  with line-level feedback.
- `code-map`: controls toggle layers, connection types, focus views, and
  component comments; preview is an architecture map.

## Verification

Before handoff, run:

```bash
node scripts/verify-html-playgrounds.mjs <path-to-playground.html>
```

For multiple samples, pass all paths or run the script with no arguments to
check the default sample folder.
