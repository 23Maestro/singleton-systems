/** Premiere UXP adapter. All Premiere API calls live here. */

let ppro = null;
try {
  // eslint-disable-next-line no-undef
  ppro = require("premierepro");
} catch (e) {
  ppro = null;
}

export function available() {
  return !!ppro;
}

/** Report which APIs this Premiere build exposes. Read-only, safe to call. */
export async function probe() {
  const rows = [];
  const check = async (label, fn) => {
    try {
      const v = await fn();
      rows.push({ label, ok: v !== undefined && v !== null, detail: describe(v) });
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
  await check("sequence editor remove action", () =>
    ppro.SequenceEditor.getEditor(sequence)?.createRemoveItemsAction
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
    ppro.TrackItemSelection.createEmptySelection((created) => { selection = created; });
    return selection?.addItem;
  });
  return rows;
}

function describe(v) {
  if (typeof v === "function") return "function";
  if (v === undefined) return "undefined";
  if (v === null) return "null";
  if (typeof v === "object") return `object{${Object.keys(v).slice(0, 6).join(",")}}`;
  return String(v);
}

/** Active sequence plus the numbers the planner needs. Returns {error} on failure. */
export async function getSequenceInfo() {
  if (!ppro) return { error: "Premiere UXP API not available in this context." };
  try {
    const project = await ppro.Project.getActiveProject();
    if (!project) return { error: "No project open." };
    const sequence = await project.getActiveSequence();
    if (!sequence) return { error: "No active sequence. Open one and retry." };

    const name = (await safe(() => sequence.name)) ?? "(unnamed)";
    // Duration comes back as a TickTime on current builds; older ones returned
    // seconds directly. Accept either.
    const raw = await safe(() => sequence.getEndTime?.() ?? sequence.end);
    const duration = toSeconds(raw);

    return { project, sequence, name, duration };
  } catch (e) {
    return { error: `Reading sequence failed: ${e.message}` };
  }
}

/** TickTime | {seconds} | number -> seconds. */
export function toSeconds(v) {
  if (v == null) return null;
  if (typeof v === "number") return v;
  if (typeof v.seconds === "number") return v.seconds;
  if (typeof v.ticks === "number") return v.ticks / 254016000000;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

/** Apply removals as ripple deletes. One transaction per cut. */
export async function applyPlan(plan, ctx, onProgress = () => {}) {
  const result = { done: 0, failed: [], unsupported: null };

  if (!ppro) {
    result.unsupported = "Premiere UXP API not available.";
    return result;
  }
  const getEditor = ppro.SequenceEditor?.getEditor;
  if (typeof getEditor !== "function") {
    result.unsupported =
      "SequenceEditor.getEditor is missing in this Premiere " +
      "build. Run Probe API to see what is available.";
    return result;
  }

  const editor = getEditor(ctx.sequence);
  if (!editor || typeof editor.createRemoveItemsAction !== "function") {
    result.unsupported =
      "The active sequence editor has no createRemoveItemsAction method. " +
      "Run Probe API to see what is available.";
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
            /* ripple */ true,
            /* mediaType */ ppro.Constants?.MediaType?.VIDEO,
            /* shiftOverLapping */ true
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

/** TrackItemSelection covering [start, end) across all tracks. */
async function selectRange(sequence, start, end) {
  const picked = [];

  const vCount = (await safe(() => sequence.getVideoTrackCount?.())) ?? 0;
  const aCount = (await safe(() => sequence.getAudioTrackCount?.())) ?? 0;

  for (const [count, getter] of [
    [vCount, "getVideoTrack"],
    [aCount, "getAudioTrack"],
  ]) {
    for (let t = 0; t < count; t++) {
      const track = await safe(() => sequence[getter]?.(t));
      if (!track) continue;
      const items = (await safe(() => track.getTrackItems?.(
        ppro.Constants?.TrackItemType?.CLIP ?? 1, false
      ))) ?? [];
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
    create((created) => { selection = created; });
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
    return undefined;
  }
}
