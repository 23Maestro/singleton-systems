import { PRESETS, resolvePreset, samplePreset, positionKeyFrames } from "./presets.js";
import * as ppro from "./ppro.js";

const el = (id) => document.getElementById(id);
let mode = "selection";
let busy = false;

function log(message, kind = "") {
  const row = document.createElement("div");
  row.className = kind;
  row.textContent = message;
  el("log").appendChild(row);
  el("log").scrollTop = el("log").scrollHeight;
}

function rgba(hex, alpha) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
}

function add(parent, tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  parent.appendChild(node);
  return node;
}

/** Scale curve as div bars. UXP does not render SVG injected at runtime. */
function addSparkline(parent, name, color) {
  const { samples } = samplePreset(name, 16);
  const values = samples.map((s) => s.scale);
  const min = Math.min(...values, 100);
  const max = Math.max(...values, 100);
  const range = Math.max(0.5, max - min);
  const strip = add(parent, "div", "spark");
  for (const value of values) {
    const bar = add(strip, "div", "sb");
    bar.style.height = `${3 + ((value - min) / range) * 13}px`;
    bar.style.backgroundColor = color;
  }
}

function buildCard(preset) {
  const { preset: resolved } = resolvePreset(preset.name);
  const keys = resolved.scaleKeys.length + positionKeyFrames(resolved).length;

  const card = document.createElement("div");
  card.className = "p";
  card.style.borderLeftColor = preset.color;

  add(card, "div", "kf", `${keys} kf`);
  add(card, "div", "name", preset.label);
  addSparkline(card, preset.name, preset.color);

  const badge = add(card, "div", "badge", preset.badge);
  badge.style.color = preset.color;
  badge.style.backgroundColor = rgba(preset.color, 0.16);
  badge.style.borderColor = rgba(preset.color, 0.4);

  card.onclick = () => apply(preset.name);
  return card;
}

function renderGrid() {
  const grid = el("grid");
  grid.textContent = "";
  try {
    for (const preset of PRESETS) grid.appendChild(buildCard(preset));
  } catch (error) {
    log(`Preset grid failed: ${error.message}`, "err");
    el("status").textContent = `Preset grid failed: ${error.message}`;
  }
}

function setBusy(state) {
  busy = state;
  el("grid").className = state ? "grid busy" : "grid";
}

async function apply(name) {
  if (busy) return;
  setBusy(true);
  const base = PRESETS.find((preset) => preset.name === name);
  el("status").textContent = `Applying ${base.label}…`;
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

    [...new Set(warnings)].forEach((warning) => log(warning, "warn"));
    ctx.skipped.forEach((skip) => log(`Skipped: ${skip.reason}`, "warn"));
    result.failed.forEach((failure) =>
      log(`Clip ${failure.index + 1}: ${failure.reason}`, "warn"));
    if (result.error) throw new Error(result.error);

    const plural = result.applied === 1 ? "" : "s";
    log(`${base.label} → ${result.applied} clip${plural}` +
      (result.addedEffects ? ` (added Transform to ${result.addedEffects})` : ""), "ok");
    el("status").textContent = `${base.label} applied to ${result.applied} clip${plural}.`;
  } catch (error) {
    const message = error.message || String(error);
    log(message, "err");
    el("status").textContent = message;
  } finally {
    setBusy(false);
  }
}

el("scope").querySelectorAll("button").forEach((button) => {
  button.onclick = () => {
    mode = button.dataset.mode;
    el("scope").querySelectorAll("button").forEach((b) => b.classList.remove("on"));
    button.classList.add("on");
    el("status").textContent = mode === "all"
      ? "Will apply to every video clip in the sequence."
      : "Will apply to the selected clip, or the one under the playhead.";
  };
});

el("probe").onclick = async () => {
  log("— API probe —", "dim");
  const rows = await ppro.probe();
  rows.forEach((row) => log(`${row.ok ? "✓" : "✗"} ${row.label}: ${row.detail}`, row.ok ? "ok" : "err"));
  const failed = rows.filter((row) => !row.ok);
  el("status").textContent = failed.length
    ? `Probe ${rows.length - failed.length}/${rows.length} — failed: ${failed.map((r) => r.label).join(", ")}`
    : `Probe ${rows.length}/${rows.length} — all good.`;
};

el("clear").onclick = () => { el("log").textContent = ""; };

renderGrid();
