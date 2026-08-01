/** Panel wiring. */
import { parseCutList, planCuts, summarize, fmt } from "./cutlist.js";
import * as ppro from "./ppro.js";

const el = (id) => document.getElementById(id);
const state = { cutList: null, ctx: null, plan: [] };

function log(msg, cls = "") {
  const d = document.createElement("div");
  if (cls) d.className = cls;
  d.textContent = msg;
  el("log").appendChild(d);
  el("log").scrollTop = el("log").scrollHeight;
}
function clearLog() {
  el("log").textContent = "";
}

// ---------------------------------------------------------------- sequence
async function readSequence() {
  if (!ppro.available()) {
    log("Premiere UXP API not reachable. Probe API for detail.", "warn");
    state.ctx = null;
    return;
  }
  const info = await ppro.getSequenceInfo();
  if (info.error) {
    state.ctx = null;
    log(info.error, "err");
    return;
  }
  state.ctx = info;
  el("stats").style.display = "";
  el("seqName").textContent = info.name;
  el("seqDur").textContent =
    info.duration == null ? "unknown" : fmt(info.duration);
  log(`Sequence "${info.name}" — ${info.duration == null ? "length unknown" : fmt(info.duration)}`, "ok");
  replan();
}

// ---------------------------------------------------------------- planning
function replan() {
  if (!state.cutList) {
    el("apply").disabled = true;
    return;
  }
  const seqDur = state.ctx?.duration ?? null;
  const { plan, report } = planCuts(state.cutList, seqDur);
  state.plan = plan;

  el("stats").style.display = "";
  el("nCuts").textContent = String(report.applied);
  el("toRemove").textContent =
    report.totalRemoved != null ? fmt(report.totalRemoved) : "—";
  el("projected").textContent =
    report.projectedDuration != null ? fmt(report.projectedDuration) : "—";
  el("skipped").textContent = `${report.skipped.length} / ${report.clamped.length}`;

  report.warnings.forEach((w) => log(w, "warn"));
  report.clamped.forEach((c) =>
    log(`clamped ${fmt(c.start)}–${fmt(c.from)} → ends at ${fmt(c.to)}`, "warn")
  );
  report.skipped.forEach((s) =>
    log(`skipped ${fmt(s.start)}–${fmt(s.end)}: ${s.reason}`, "warn")
  );
  log(summarize(report), "ok");

  el("apply").disabled = plan.length === 0 || !state.ctx;
  if (plan.length && !state.ctx)
    log("Plan ready, but no sequence is readable yet.", "warn");
}

// ---------------------------------------------------------------- file load
el("pick").onclick = () => el("file").click();

el("file").onchange = async (ev) => {
  const f = ev.target.files?.[0];
  if (!f) return;
  el("fileName").textContent = f.name;
  let text;
  try {
    text = await f.text();
  } catch (e) {
    log(`Could not read ${f.name}: ${e.message}`, "err");
    return;
  }
  const { cutList, report } = parseCutList(text);
  report.errors.forEach((e) => log(e, "err"));
  report.warnings.forEach((w) => log(w, "warn"));
  if (!cutList) {
    state.cutList = null;
    el("apply").disabled = true;
    return;
  }
  state.cutList = cutList;
  log(
    `Loaded ${cutList.removals.length} removals` +
      (cutList.source.name ? ` for ${cutList.source.name}` : "") +
      (cutList.source.duration ? ` (${fmt(cutList.source.duration)} source)` : ""),
    "ok"
  );
  replan();
};

// ---------------------------------------------------------------- apply
el("apply").onclick = async () => {
  if (!state.plan.length || !state.ctx) return;
  el("apply").disabled = true;
  const total = state.plan.length;
  log(`Applying ${total} cuts, last to first…`);

  const res = await ppro.applyPlan(state.plan, state.ctx, (done, t, err) => {
    el("prog").style.width = `${Math.round((done / t) * 100)}%`;
    if (err) log(`  ${err}`, "err");
  });

  if (res.unsupported) {
    log(res.unsupported, "err");
    el("apply").disabled = false;
    return;
  }
  log(`Applied ${res.done}/${total} cuts.`, res.done === total ? "ok" : "warn");
  if (res.failed.length) {
    log(`${res.failed.length} could not be applied:`, "warn");
    res.failed.forEach((f) =>
      log(`  ${fmt(f.cut.start)}–${fmt(f.cut.end)}: ${f.reason}`, "warn")
    );
    log("Cuts that succeeded are still applied - nothing was rolled back.", "dim");
  }
  await readSequence();
};

// ---------------------------------------------------------------- misc
el("probe").onclick = async () => {
  log("— API probe —", "dim");
  const rows = await ppro.probe();
  for (const r of rows)
    log(`${r.ok ? "✓" : "✗"} ${r.label}: ${r.detail}`, r.ok ? "ok" : "err");
  const failed = rows.filter((row) => !row.ok);
  el("fileName").textContent = failed.length
    ? `API probe: ${rows.length - failed.length}/${rows.length}; failed: ${failed.map((row) => row.label).join(", ")}`
    : `API probe: ${rows.length}/${rows.length} checks available.`;
};
el("refresh").onclick = readSequence;
el("clear").onclick = clearLog;

readSequence();
