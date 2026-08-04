import { PRESETS, resolvePreset, samplePreset } from "./presets.js";
import * as ppro from "./ppro.js";

const el = (id) => document.getElementById(id);
let mode = "selection";
let busy = false;

function say(message, kind = "") {
  const node = el("status");
  node.className = kind;
  node.textContent = message;
}

function add(parent, tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  parent.appendChild(node);
  return node;
}

/** Scale curve as flex bars. UXP does not render SVG injected at runtime. */
function addSparkline(parent, name, color) {
  const { samples } = samplePreset(name, 14);
  const values = samples.map((sample) => sample.scale);
  const min = Math.min(...values, 100);
  const max = Math.max(...values, 100);
  const range = Math.max(0.5, max - min);
  const strip = add(parent, "div", "spark");
  for (const value of values) {
    const bar = add(strip, "div", "bar");
    bar.style.height = `${2 + ((value - min) / range) * 15}px`;
    bar.style.backgroundColor = color;
  }
}

function buildRow(preset) {
  const row = document.createElement("div");
  row.className = "row";
  row.style.borderLeftColor = preset.color;

  const copy = add(row, "div", "copy");
  add(copy, "div", "name", preset.label);
  add(copy, "div", "desc", preset.description);

  addSparkline(row, preset.name, preset.color);
  add(row, "div", "badge", preset.badge);

  row.onclick = () => apply(preset.name);
  return row;
}

function renderList() {
  const list = el("list");
  list.textContent = "";
  try {
    for (const preset of PRESETS) list.appendChild(buildRow(preset));
  } catch (error) {
    say(`Preset list failed: ${error.message}`, "err");
  }
}

function setBusy(state) {
  busy = state;
  el("list").className = state ? "list busy" : "list";
}

async function apply(name) {
  if (busy) return;
  setBusy(true);
  const base = PRESETS.find((preset) => preset.name === name);
  say(`Applying ${base.label}…`);
  try {
    const ctx = await ppro.getTargets(mode);
    if (ctx.error) throw new Error(ctx.error);
    if (!ctx.targets.length) {
      throw new Error(mode === "all"
        ? "No video clips in this sequence."
        : "Nothing selected and no clip under the playhead.");
    }
    const warnings = [];
    const result = await ppro.applyPreset(ctx, (_target, index) => {
      const resolved = resolvePreset(base, {
        direction: index % 2 === 0 ? "R" : "L",
      });
      warnings.push(...resolved.warnings);
      return resolved.preset;
    });
    if (result.error) throw new Error(result.error);

    const plural = result.applied === 1 ? "" : "s";
    const skipped = ctx.skipped.length + result.failed.length;
    let message = `${base.label} → ${result.applied} clip${plural}`;
    if (result.addedEffects) message += `, Transform added to ${result.addedEffects}`;
    if (skipped) message += ` · ${skipped} skipped`;
    say(message, skipped || warnings.length ? "warn" : "");
  } catch (error) {
    say(error.message || String(error), "err");
  } finally {
    setBusy(false);
  }
}

el("scope").querySelectorAll(".opt").forEach((option) => {
  option.onclick = () => {
    mode = option.dataset.mode;
    el("scope").querySelectorAll(".opt").forEach((other) => other.classList.remove("on"));
    option.classList.add("on");
    say(mode === "all"
      ? "Will apply to every video clip in the sequence."
      : "Will apply to the selected clip, or the one under the playhead.");
  };
});

renderList();
