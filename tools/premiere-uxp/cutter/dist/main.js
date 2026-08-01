"use strict";
(() => {
  var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
    get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
  }) : x)(function(x) {
    if (typeof require !== "undefined") return require.apply(this, arguments);
    throw Error('Dynamic require of "' + x + '" is not supported');
  });

  // src/cutlist.js
  var KINDS = /* @__PURE__ */ new Set(["cue", "span", "gap", "head", "tail", "manual"]);
  function parseCutList(input) {
    const report = { errors: [], warnings: [] };
    let raw = input;
    if (typeof input === "string") {
      try {
        raw = JSON.parse(input);
      } catch (e) {
        report.errors.push(`Not valid JSON: ${e.message}`);
        return { cutList: null, report };
      }
    }
    if (!raw || typeof raw !== "object") {
      report.errors.push("Cut list must be a JSON object.");
      return { cutList: null, report };
    }
    const list = Array.isArray(raw) ? raw : raw.removals || raw.cuts;
    if (!Array.isArray(list)) {
      report.errors.push('Cut list has no "removals" array.');
      return { cutList: null, report };
    }
    const source = raw.source && typeof raw.source === "object" ? raw.source : {};
    const removals = [];
    list.forEach((r, i) => {
      const rec = Array.isArray(r) ? { start: r[0], end: r[1], kind: r[2], note: r[3] } : r;
      if (!rec || typeof rec !== "object") {
        report.warnings.push(`#${i}: not an object, skipped.`);
        return;
      }
      const start = Number(rec.start);
      const end = Number(rec.end);
      if (!Number.isFinite(start) || !Number.isFinite(end)) {
        report.warnings.push(`#${i}: non-numeric start/end, skipped.`);
        return;
      }
      if (end <= start) {
        report.warnings.push(`#${i}: end <= start (${start}, ${end}), skipped.`);
        return;
      }
      if (start < 0) {
        report.warnings.push(`#${i}: negative start, clamped to 0.`);
      }
      removals.push({
        start: Math.max(0, start),
        end,
        kind: KINDS.has(rec.kind) ? rec.kind : "manual",
        note: typeof rec.note === "string" ? rec.note : "",
        index: i
      });
    });
    if (!removals.length) report.errors.push("No usable removals in cut list.");
    return {
      cutList: {
        version: Number(raw.version) || 1,
        source: {
          name: typeof source.name === "string" ? source.name : null,
          duration: Number.isFinite(Number(source.duration)) ? Number(source.duration) : null,
          fps: Number.isFinite(Number(source.fps)) ? Number(source.fps) : null
        },
        removals
      },
      report
    };
  }
  function mergeRemovals(removals, epsilon = 1e-3) {
    const sorted = [...removals].sort((a, b) => a.start - b.start);
    const out = [];
    for (const r of sorted) {
      const prev = out[out.length - 1];
      if (prev && r.start <= prev.end + epsilon) {
        prev.end = Math.max(prev.end, r.end);
        prev.merged = (prev.merged || 1) + 1;
        if (r.note && prev.note !== r.note) prev.note = `${prev.note}; ${r.note}`;
      } else {
        out.push({ ...r });
      }
    }
    return out;
  }
  function planCuts(cutList, sequenceDuration, opts = {}) {
    const minDuration = opts.minDuration ?? 0.02;
    const report = { applied: 0, skipped: [], clamped: [], warnings: [] };
    if (!cutList || !cutList.removals?.length) {
      report.warnings.push("Nothing to do: empty cut list.");
      return { plan: [], report };
    }
    const seqDur = Number(sequenceDuration);
    if (!Number.isFinite(seqDur) || seqDur <= 0) {
      report.warnings.push(
        "Sequence duration unknown; applying cut list unclamped."
      );
    }
    const srcDur = cutList.source?.duration;
    if (Number.isFinite(seqDur) && Number.isFinite(srcDur)) {
      const drift = Math.abs(srcDur - seqDur);
      if (drift > 1) {
        report.warnings.push(
          `Cut list was built against a ${srcDur.toFixed(2)}s source but this sequence is ${seqDur.toFixed(2)}s (${drift.toFixed(2)}s drift). Ranges past the end will be skipped.`
        );
      }
    }
    const merged = mergeRemovals(cutList.removals);
    const plan = [];
    for (const r of merged) {
      let { start, end } = r;
      if (Number.isFinite(seqDur)) {
        if (start >= seqDur) {
          report.skipped.push({
            ...r,
            reason: `starts at ${start.toFixed(2)}s, past sequence end ${seqDur.toFixed(2)}s`
          });
          continue;
        }
        if (end > seqDur) {
          report.clamped.push({ ...r, from: end, to: seqDur });
          end = seqDur;
        }
      }
      if (end - start < minDuration) {
        report.skipped.push({
          ...r,
          reason: `shorter than ${minDuration}s after clamping`
        });
        continue;
      }
      plan.push({ ...r, start, end });
    }
    plan.sort((a, b) => b.start - a.start);
    report.applied = plan.length;
    report.totalRemoved = plan.reduce((s, r) => s + (r.end - r.start), 0);
    report.projectedDuration = Number.isFinite(seqDur) ? seqDur - report.totalRemoved : null;
    return { plan, report };
  }
  function summarize(report) {
    const L = [];
    L.push(`${report.applied} cuts planned`);
    if (report.totalRemoved != null)
      L.push(`${fmt(report.totalRemoved)} to remove`);
    if (report.projectedDuration != null)
      L.push(`result ~${fmt(report.projectedDuration)}`);
    if (report.clamped?.length) L.push(`${report.clamped.length} clamped`);
    if (report.skipped?.length) L.push(`${report.skipped.length} skipped`);
    return L.join(" \xB7 ");
  }
  function fmt(sec) {
    if (!Number.isFinite(sec)) return "--:--";
    const s = Math.max(0, sec);
    const m = Math.floor(s / 60);
    return `${String(m).padStart(2, "0")}:${(s % 60).toFixed(2).padStart(5, "0")}`;
  }

  // src/ppro.js
  var ppro = null;
  try {
    ppro = __require("premierepro");
  } catch (e) {
    ppro = null;
  }
  function available() {
    return !!ppro;
  }
  async function probe() {
    const rows = [];
    const check = async (label, fn) => {
      try {
        const v = await fn();
        rows.push({ label, ok: v !== void 0 && v !== null, detail: describe(v) });
      } catch (e) {
        rows.push({ label, ok: false, detail: e.message });
      }
    };
    if (!ppro) {
      return [{ label: 'require("premierepro")', ok: false, detail: "not available" }];
    }
    await check('require("premierepro")', () => "loaded");
    await check("Project.getActiveProject", () => ppro.Project?.getActiveProject);
    await check("SequenceEditor.getEditor", () => ppro.SequenceEditor?.getEditor);
    await check("TrackItemSelection.createEmptySelection", () => ppro.TrackItemSelection?.createEmptySelection);
    await check("Constants.MediaType.VIDEO", () => ppro.Constants?.MediaType?.VIDEO);
    await check("Constants.TrackItemType.CLIP", () => ppro.Constants?.TrackItemType?.CLIP);
    const project = await safe(() => ppro.Project.getActiveProject());
    const sequence = await safe(() => project?.getActiveSequence());
    await check("active project lockedAccess", () => project?.lockedAccess);
    await check("active sequence", () => sequence?.name);
    await check(
      "sequence editor remove action",
      () => ppro.SequenceEditor.getEditor(sequence)?.createRemoveItemsAction
    );
    await check("sequence.getVideoTrackCount", () => sequence?.getVideoTrackCount());
    await check("videoTrack.getTrackItems", async () => {
      const track = await sequence?.getVideoTrack(0);
      return track?.getTrackItems;
    });
    await check("sequence.getEndTime TickTime", async () => {
      const end = await sequence?.getEndTime();
      return end ? `${describe(end)} -> ${toSeconds(end)}s` : null;
    });
    await check("empty TrackItemSelection", () => {
      let selection = null;
      ppro.TrackItemSelection.createEmptySelection((created) => {
        selection = created;
      });
      return selection?.addItem;
    });
    return rows;
  }
  function describe(v) {
    if (typeof v === "function") return "function";
    if (v === void 0) return "undefined";
    if (v === null) return "null";
    if (typeof v === "object") return `object{${Object.keys(v).slice(0, 6).join(",")}}`;
    return String(v);
  }
  async function getSequenceInfo() {
    if (!ppro) return { error: "Premiere UXP API not available in this context." };
    try {
      const project = await ppro.Project.getActiveProject();
      if (!project) return { error: "No project open." };
      const sequence = await project.getActiveSequence();
      if (!sequence) return { error: "No active sequence. Open one and retry." };
      const name = await safe(() => sequence.name) ?? "(unnamed)";
      const raw = await safe(() => sequence.getEndTime?.() ?? sequence.end);
      const duration = toSeconds(raw);
      return { project, sequence, name, duration };
    } catch (e) {
      return { error: `Reading sequence failed: ${e.message}` };
    }
  }
  function toSeconds(v) {
    if (v == null) return null;
    if (typeof v === "number") return v;
    if (typeof v.seconds === "number") return v.seconds;
    if (typeof v.ticks === "number") return v.ticks / 254016e6;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  async function applyPlan(plan, ctx, onProgress = () => {
  }) {
    const result = { done: 0, failed: [], unsupported: null };
    if (!ppro) {
      result.unsupported = "Premiere UXP API not available.";
      return result;
    }
    const getEditor = ppro.SequenceEditor?.getEditor;
    if (typeof getEditor !== "function") {
      result.unsupported = "SequenceEditor.getEditor is missing in this Premiere build. Run Probe API to see what is available.";
      return result;
    }
    const editor = getEditor(ctx.sequence);
    if (!editor || typeof editor.createRemoveItemsAction !== "function") {
      result.unsupported = "The active sequence editor has no createRemoveItemsAction method. Run Probe API to see what is available.";
      return result;
    }
    for (let i = 0; i < plan.length; i++) {
      const cut = plan[i];
      try {
        const selection = await selectRange(ctx.sequence, cut.start, cut.end);
        if (!selection || selection.empty) {
          result.failed.push({ cut, reason: "no track items in range" });
          onProgress(result.done, plan.length, null);
          continue;
        }
        let accepted = false;
        ctx.project.lockedAccess(() => {
          accepted = ctx.project.executeTransaction((compound) => {
            const action = editor.createRemoveItemsAction(
              selection.value,
              /* ripple */
              true,
              /* mediaType */
              ppro.Constants?.MediaType?.VIDEO,
              /* shiftOverLapping */
              true
            );
            compound.addAction(action);
          }, `Bad Take Remover: ${cut.start.toFixed(2)}-${cut.end.toFixed(2)}`);
        });
        if (!accepted) throw new Error("Premiere rejected the remove transaction");
        result.done++;
        onProgress(result.done, plan.length, null);
      } catch (e) {
        result.failed.push({ cut, reason: e.message });
        onProgress(result.done, plan.length, e.message);
      }
    }
    return result;
  }
  async function selectRange(sequence, start, end) {
    const picked = [];
    const vCount = await safe(() => sequence.getVideoTrackCount?.()) ?? 0;
    const aCount = await safe(() => sequence.getAudioTrackCount?.()) ?? 0;
    for (const [count, getter] of [
      [vCount, "getVideoTrack"],
      [aCount, "getAudioTrack"]
    ]) {
      for (let t = 0; t < count; t++) {
        const track = await safe(() => sequence[getter]?.(t));
        if (!track) continue;
        const items = await safe(() => track.getTrackItems?.(
          ppro.Constants?.TrackItemType?.CLIP ?? 1,
          false
        )) ?? [];
        for (const item of items) {
          const s = toSeconds(await safe(() => item.getStartTime?.() ?? item.start));
          const e = toSeconds(await safe(() => item.getEndTime?.() ?? item.end));
          if (s == null || e == null) continue;
          if (e > start && s < end) picked.push(item);
        }
      }
    }
    if (!picked.length) return { value: null, empty: true };
    let selection = null;
    const create = ppro.TrackItemSelection?.createEmptySelection;
    if (typeof create === "function") {
      create((created) => {
        selection = created;
      });
    }
    if (!selection || typeof selection.addItem !== "function") {
      return { value: null, empty: true };
    }
    for (const item of picked) selection.addItem(item, false);
    return { value: selection, empty: false };
  }
  async function safe(fn) {
    try {
      return await fn();
    } catch {
      return void 0;
    }
  }

  // src/main.js
  var el = (id) => document.getElementById(id);
  var state = { cutList: null, ctx: null, plan: [] };
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
  async function readSequence() {
    if (!available()) {
      log("Premiere UXP API not reachable. Probe API for detail.", "warn");
      state.ctx = null;
      return;
    }
    const info = await getSequenceInfo();
    if (info.error) {
      state.ctx = null;
      log(info.error, "err");
      return;
    }
    state.ctx = info;
    el("stats").style.display = "";
    el("seqName").textContent = info.name;
    el("seqDur").textContent = info.duration == null ? "unknown" : fmt(info.duration);
    log(`Sequence "${info.name}" \u2014 ${info.duration == null ? "length unknown" : fmt(info.duration)}`, "ok");
    replan();
  }
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
    el("toRemove").textContent = report.totalRemoved != null ? fmt(report.totalRemoved) : "\u2014";
    el("projected").textContent = report.projectedDuration != null ? fmt(report.projectedDuration) : "\u2014";
    el("skipped").textContent = `${report.skipped.length} / ${report.clamped.length}`;
    report.warnings.forEach((w) => log(w, "warn"));
    report.clamped.forEach(
      (c) => log(`clamped ${fmt(c.start)}\u2013${fmt(c.from)} \u2192 ends at ${fmt(c.to)}`, "warn")
    );
    report.skipped.forEach(
      (s) => log(`skipped ${fmt(s.start)}\u2013${fmt(s.end)}: ${s.reason}`, "warn")
    );
    log(summarize(report), "ok");
    el("apply").disabled = plan.length === 0 || !state.ctx;
    if (plan.length && !state.ctx)
      log("Plan ready, but no sequence is readable yet.", "warn");
  }
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
      `Loaded ${cutList.removals.length} removals` + (cutList.source.name ? ` for ${cutList.source.name}` : "") + (cutList.source.duration ? ` (${fmt(cutList.source.duration)} source)` : ""),
      "ok"
    );
    replan();
  };
  el("apply").onclick = async () => {
    if (!state.plan.length || !state.ctx) return;
    el("apply").disabled = true;
    const total = state.plan.length;
    log(`Applying ${total} cuts, last to first\u2026`);
    const res = await applyPlan(state.plan, state.ctx, (done, t, err) => {
      el("prog").style.width = `${Math.round(done / t * 100)}%`;
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
      res.failed.forEach(
        (f) => log(`  ${fmt(f.cut.start)}\u2013${fmt(f.cut.end)}: ${f.reason}`, "warn")
      );
      log("Cuts that succeeded are still applied - nothing was rolled back.", "dim");
    }
    await readSequence();
  };
  el("probe").onclick = async () => {
    log("\u2014 API probe \u2014", "dim");
    const rows = await probe();
    for (const r of rows)
      log(`${r.ok ? "\u2713" : "\u2717"} ${r.label}: ${r.detail}`, r.ok ? "ok" : "err");
    const failed = rows.filter((row) => !row.ok);
    el("fileName").textContent = failed.length ? `API probe: ${rows.length - failed.length}/${rows.length}; failed: ${failed.map((row) => row.label).join(", ")}` : `API probe: ${rows.length}/${rows.length} checks available.`;
  };
  el("refresh").onclick = readSequence;
  el("clear").onclick = clearLog;
  readSequence();
})();
