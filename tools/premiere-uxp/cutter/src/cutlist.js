/** Cut list ingestion, validation, and planning. No Premiere APIs. */

const KINDS = new Set(["cue", "span", "gap", "head", "tail", "manual"]);

/** Parse a cut list from a JSON string or object. Never throws on bad data. */
export function parseCutList(input) {
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

  // Accept either {removals:[...]} or a bare array, and tolerate {cuts:[...]}.
  const list = Array.isArray(raw) ? raw : raw.removals || raw.cuts;
  if (!Array.isArray(list)) {
    report.errors.push('Cut list has no "removals" array.');
    return { cutList: null, report };
  }

  const source = raw.source && typeof raw.source === "object" ? raw.source : {};
  const removals = [];

  list.forEach((r, i) => {
    // Tolerate array-form entries: [start, end, kind, note]
    const rec = Array.isArray(r)
      ? { start: r[0], end: r[1], kind: r[2], note: r[3] }
      : r;
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
      index: i,
    });
  });

  if (!removals.length) report.errors.push("No usable removals in cut list.");

  return {
    cutList: {
      version: Number(raw.version) || 1,
      source: {
        name: typeof source.name === "string" ? source.name : null,
        duration: Number.isFinite(Number(source.duration))
          ? Number(source.duration)
          : null,
        fps: Number.isFinite(Number(source.fps)) ? Number(source.fps) : null,
      },
      removals,
    },
    report,
  };
}

/** Merge overlapping/adjacent removals so we never double-cut the same frames. */
export function mergeRemovals(removals, epsilon = 0.001) {
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

/** Build an execution plan against a sequence duration. Removals are ordered last-first. */
export function planCuts(cutList, sequenceDuration, opts = {}) {
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
    if (drift > 1.0) {
      report.warnings.push(
        `Cut list was built against a ${srcDur.toFixed(2)}s source but this ` +
          `sequence is ${seqDur.toFixed(2)}s (${drift.toFixed(2)}s drift). ` +
          `Ranges past the end will be skipped.`
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
          reason: `starts at ${start.toFixed(2)}s, past sequence end ${seqDur.toFixed(2)}s`,
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
        reason: `shorter than ${minDuration}s after clamping`,
      });
      continue;
    }
    plan.push({ ...r, start, end });
  }

  plan.sort((a, b) => b.start - a.start);
  report.applied = plan.length;
  report.totalRemoved = plan.reduce((s, r) => s + (r.end - r.start), 0);
  report.projectedDuration = Number.isFinite(seqDur)
    ? seqDur - report.totalRemoved
    : null;

  return { plan, report };
}

/** Human-readable summary for the panel. */
export function summarize(report) {
  const L = [];
  L.push(`${report.applied} cuts planned`);
  if (report.totalRemoved != null)
    L.push(`${fmt(report.totalRemoved)} to remove`);
  if (report.projectedDuration != null)
    L.push(`result ~${fmt(report.projectedDuration)}`);
  if (report.clamped?.length) L.push(`${report.clamped.length} clamped`);
  if (report.skipped?.length) L.push(`${report.skipped.length} skipped`);
  return L.join(" · ");
}

export function fmt(sec) {
  if (!Number.isFinite(sec)) return "--:--";
  const s = Math.max(0, sec);
  const m = Math.floor(s / 60);
  return `${String(m).padStart(2, "0")}:${(s % 60).toFixed(2).padStart(5, "0")}`;
}
