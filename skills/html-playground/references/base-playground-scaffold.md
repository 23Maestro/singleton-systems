# Base Playground Scaffold

Use one HTML file with inline CSS and JavaScript and no runtime dependencies.
Use a dark, high-contrast theme, system UI fonts, and a responsive layout.

## Required DOM

```html
<main data-playground data-playground-lane="design-playground">
  <section data-controls-panel>
    <button data-preset="balanced">Balanced</button>
    <input data-control="density" type="range" />
  </section>
  <section data-preview-panel><div data-preview></div></section>
  <section data-prompt-panel>
    <pre data-prompt-output></pre>
    <button data-copy-prompt>Copy Prompt</button>
  </section>
</main>
```

## Behavior

- Start with useful defaults and 3-5 named presets.
- Keep `defaults`, `state`, and `presets` as the single data path.
- Every control and preset calls `updateAll()`.
- `updateAll()` refreshes controls, live preview, and prompt output.
- Write prompt output as an actionable instruction, not a value dump.
- Mention non-default choices and include enough context to act without the UI.
- Copy the prompt to the clipboard and show brief `Copied` feedback.
- Stack controls, preview, and prompt vertically on narrow screens.
- Prevent visible text overflow in controls, cards, and preview blocks.

## JavaScript Shape

```javascript
const defaults = { density: 2, focus: "balanced" };
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

function updateAll() {
  renderControls();
  renderPreview();
  updatePrompt();
}
```

For a dated review artifact, use `YYYY-MM-DD-topic.html` and make the first
screen explain the decision, current status, and exact review request.
