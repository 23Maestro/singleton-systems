/** Premiere-only adapter. Preset math lives in presets.js. */
import { focalPosition, positionPlan } from "./presets.js";

let ppro = null;
try { ppro = require("premierepro"); } catch { ppro = null; }

export function available() { return !!ppro; }

function describe(value) {
  if (typeof value === "function") return "function";
  if (value == null) return String(value);
  if (typeof value === "object") return `object{${Object.keys(value).slice(0, 7).join(",")}}`;
  return String(value);
}

export async function probe() {
  const rows = [];
  const check = async (label, fn) => {
    try { const value = await fn(); rows.push({ label, ok: value != null, detail: describe(value) }); }
    catch (error) { rows.push({ label, ok: false, detail: error.message }); }
  };
  if (!ppro) return [{ label: 'require("premierepro")', ok: false, detail: "not available" }];
  await check('require("premierepro")', () => "loaded");
  await check("Project.getActiveProject", () => ppro.Project?.getActiveProject);
  await check("TickTime.createWithFrameAndFrameRate", () => ppro.TickTime?.createWithFrameAndFrameRate);
  await check("PointF", () => ppro.PointF);
  await check("Constants.InterpolationMode.BEZIER", () => ppro.Constants?.InterpolationMode?.BEZIER);
  await check("VideoFilterFactory.createComponent", () => ppro.VideoFilterFactory?.createComponent);
  const ctx = await activeContext();
  await check("active project lockedAccess", () => ctx.project?.lockedAccess);
  await check("sequence.getSelection", () => ctx.sequence?.getSelection);
  await check("sequence frame size", () =>
    Number.isFinite(ctx.frameSize?.width) && Number.isFinite(ctx.frameSize?.height)
      ? `${ctx.frameSize.width}x${ctx.frameSize.height}` : null
  );
  await check("sequence video frame rate", () => ctx.frameRate);
  const targetContext = ctx.error ? ctx : await getTargets();
  const target = targetContext.targets?.[0];
  await check("video target at selection/playhead", () => target?.item);
  const component = target ? await findTransform(target.item) : null;
  const prepared = component ? await transformParams(component) : null;
  await check("Transform filter match name", () => resolveTransformMatchName());
  await check("existing Transform component (apply can add it)", () => component || "not present");
  await check("Transform Scale Height parameter", () =>
    component ? (prepared?.error ?? prepared?.scaleParams?.[0]) : "available after insert");
  await check("Transform Scale Width parameter", () =>
    component ? (prepared?.error ?? prepared?.scaleParams?.[1]) : "available after insert");
  await check("Transform Position parameter", () =>
    component ? (prepared?.error ?? prepared?.positionParam) : "available after insert");
  return rows;
}

function seconds(value) {
  if (typeof value === "number") return value;
  if (typeof value?.seconds === "number") return value.seconds;
  if (typeof value?.ticksNumber === "number") return value.ticksNumber / 254016000000;
  if (typeof value?.ticks === "number") return value.ticks / 254016000000;
  return null;
}

async function activeContext() {
  if (!ppro) return { error: "Premiere UXP API is unavailable." };
  try {
    const project = await ppro.Project.getActiveProject();
    if (!project) return { error: "Open a Premiere project first." };
    const sequence = await project.getActiveSequence();
    if (!sequence) return { error: "Open a sequence first." };
    const settings = await sequence.getSettings();
    const frameRate = await settings.getVideoFrameRate();
    const rect = await sequence.getFrameSize();
    const frameSize = {
      width: Number(rect?.width ?? rect?.right - rect?.left),
      height: Number(rect?.height ?? rect?.bottom - rect?.top),
    };
    return { project, sequence, frameRate, frameSize };
  } catch (error) { return { error: error.message }; }
}

async function videoItems(sequence) {
  const out = [];
  const count = await sequence.getVideoTrackCount();
  for (let index = 0; index < count; index++) {
    const track = await sequence.getVideoTrack(index);
    const items = await track.getTrackItems(ppro.Constants.TrackItemType.CLIP, false);
    out.push(...items);
  }
  return out;
}

async function itemAt(sequence, atSeconds) {
  const items = await videoItems(sequence);
  for (let index = items.length - 1; index >= 0; index--) {
    const start = seconds(await items[index].getStartTime());
    const end = seconds(await items[index].getEndTime());
    if (start != null && end != null && atSeconds >= start && atSeconds < end) return items[index];
  }
  return null;
}

async function isVideoItem(item) {
  try {
    const chain = await item.getComponentChain();
    const count = await chain.getComponentCount();
    for (let index = 0; index < count; index++) {
      const component = await chain.getComponentAtIndex(index);
      const matchName = await component.getMatchName();
      if (matchName === "AE.ADBE Motion" || matchName === "AE.ADBE Opacity") return true;
    }
  } catch { /* not a clip with a readable video component chain */ }
  return false;
}

export async function getTargets(mode = "selection") {
  const ctx = await activeContext();
  if (ctx.error) return ctx;
  const skipped = [];
  const targets = [];
  if (mode === "all") {
    const items = await videoItems(ctx.sequence);
    for (const item of items) {
      const at = seconds(await item.getStartTime());
      if (at == null) skipped.push({ reason: "video clip has no readable start time" });
      else targets.push({ item, at });
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  } else {
    const selection = await ctx.sequence.getSelection();
    const selected = await selection.getTrackItems();
    for (const item of selected) {
      if (await isVideoItem(item)) targets.push({ item, at: seconds(await item.getStartTime()) });
      else skipped.push({ reason: "selected item is not a video clip" });
    }
    if (!targets.length && !selected.length) {
      const playhead = seconds(await ctx.sequence.getPlayerPosition());
      const item = playhead == null ? null : await itemAt(ctx.sequence, playhead);
      if (item) targets.push({ item, at: playhead });
    }
  }
  return { ...ctx, targets, skipped };
}

/**
 * Premiere 26.3 registers TWO effects whose display name is "Transform", so a
 * display-name lookup is a coin flip. The one we want is AE's Transform
 * (Anchor Point / Position / Uniform Scale / Scale Height / Scale Width / Skew
 * / Rotation / Opacity / Shutter Angle / Sampling) — verified against the
 * user's own .prfpset, which stores it as AE.ADBE Geometry2.
 */
const TRANSFORM_MATCH_NAME = "AE.ADBE Geometry2";

let transformMatchName = null;

/** displayName is a property on some builds and a getter on others. */
async function paramName(param) {
  if (!param) return null;
  if (typeof param.getDisplayName === "function") return await param.getDisplayName();
  return param.displayName ?? null;
}

async function resolveTransformMatchName() {
  if (transformMatchName) return transformMatchName;
  const matchNames = await ppro.VideoFilterFactory.getMatchNames();
  if (matchNames.includes(TRANSFORM_MATCH_NAME)) {
    transformMatchName = TRANSFORM_MATCH_NAME;
    return transformMatchName;
  }
  // Fall back to the display name only if this build renamed the match name.
  const displayNames = await ppro.VideoFilterFactory.getDisplayNames();
  const index = displayNames.findIndex((name) => name === "Transform");
  if (index < 0 || !matchNames[index]) throw new Error("Premiere Transform effect is unavailable");
  transformMatchName = matchNames[index];
  return transformMatchName;
}

/**
 * The Transform effect has no parameter called "Scale" — that name belongs to
 * the intrinsic Motion component. Transform scales through Scale Height and
 * Scale Width, and its Uniform Scale flag defaults to false. Rather than depend
 * on that flag linking the two, drive both axes with identical values.
 */
async function transformParams(component) {
  let scaleHeightParam = null;
  let scaleWidthParam = null;
  let positionParam = null;
  const count = await component.getParamCount();
  for (let index = 0; index < count; index++) {
    const param = await component.getParam(index);
    const name = await paramName(param);
    if (name === "Scale Height") scaleHeightParam = param;
    if (name === "Scale Width") scaleWidthParam = param;
    if (name === "Position") positionParam = param;
  }
  if (!scaleHeightParam || !scaleWidthParam || !positionParam) {
    const found = [scaleHeightParam && "Scale Height", scaleWidthParam && "Scale Width",
      positionParam && "Position"].filter(Boolean).join(", ") || "none";
    return { error: `Transform is missing Scale Height/Scale Width/Position (found: ${found})` };
  }
  return { scaleParams: [scaleHeightParam, scaleWidthParam], positionParam };
}

async function findTransform(item) {
  const wanted = await resolveTransformMatchName();
  const chain = await item.getComponentChain();
  const count = await chain.getComponentCount();
  for (let index = 0; index < count; index++) {
    const component = await chain.getComponentAtIndex(index);
    if (await component.getMatchName() === wanted) return component;
  }
  return null;
}

async function addMissingTransforms(ctx) {
  const missing = [];
  for (let index = 0; index < ctx.targets.length; index++) {
    const target = ctx.targets[index];
    try {
      if (!await findTransform(target.item)) {
        missing.push({
          chain: await target.item.getComponentChain(),
          component: await ppro.VideoFilterFactory.createComponent(await resolveTransformMatchName()),
        });
      }
    } catch (error) {
      throw new Error(`Prepare Transform target ${index + 1}: ${error.message || String(error)}`);
    }
  }
  if (!missing.length) return 0;

  execute(ctx, `Zoom Motion: add Transform to ${missing.length} clip${missing.length === 1 ? "" : "s"}`, (compound) => {
    for (const entry of missing) {
      compound.addAction(entry.chain.createInsertComponentAction(entry.component, 2));
    }
  });
  await new Promise((resolve) => setTimeout(resolve, 0));
  return missing.length;
}

function interpolation(ease) {
  if (ease === "linear") return ppro.Constants.InterpolationMode.LINEAR;
  return ppro.Constants.InterpolationMode.BEZIER;
}

function focalAt(keys, frame) {
  if (frame <= keys[0].frame) return keys[0];
  const last = keys[keys.length - 1];
  if (frame >= last.frame) return last;
  const index = keys.findIndex((key) => key.frame >= frame);
  const left = keys[index - 1];
  const right = keys[index];
  const t = (frame - left.frame) / (right.frame - left.frame);
  return { x: left.x + (right.x - left.x) * t, y: left.y + (right.y - left.y) * t };
}

function startValue(keyframe) {
  let value = keyframe;
  for (let depth = 0; depth < 4; depth++) {
    if (!value || typeof value !== "object" || !("value" in value)) break;
    value = value.value;
  }
  return value;
}

function scaleForParam(percent, nativeStart) {
  if (typeof nativeStart !== "number") throw new Error("Transform Scale is not numeric");
  return Math.abs(nativeStart) <= 10 ? percent / 100 : percent;
}

function pointForParam(pixelPoint, nativeStart, frameSize) {
  const nativeX = nativeStart?.x ?? nativeStart?.[0];
  const nativeY = nativeStart?.y ?? nativeStart?.[1];
  if (!Number.isFinite(nativeX) || !Number.isFinite(nativeY)) {
    const keys = nativeStart && typeof nativeStart === "object" ? Object.keys(nativeStart).join(",") : "none";
    throw new Error(`Transform Position native value is ${typeof nativeStart} (keys: ${keys})`);
  }
  const normalized = Math.abs(nativeX) <= 2 && Math.abs(nativeY) <= 2;
  const x = normalized ? pixelPoint.x / frameSize.width : pixelPoint.x;
  const y = normalized ? pixelPoint.y / frameSize.height : pixelPoint.y;
  const point = new ppro.PointF(x, y);
  point.x = x;
  point.y = y;
  return point;
}

function keyTime(target, startKeyframe, frame, frameRate) {
  const offset = seconds(ppro.TickTime.createWithFrameAndFrameRate(frame, frameRate));
  const nativeStart = seconds(startKeyframe?.position);
  const sequenceRelative = nativeStart != null && target.at != null && Math.abs(nativeStart - target.at) < 0.001;
  return ppro.TickTime.createWithSeconds((sequenceRelative ? target.at : 0) + offset);
}

function execute(ctx, label, addActions) {
  let accepted = false;
  try {
    ctx.project.lockedAccess(() => {
      accepted = ctx.project.executeTransaction((compound) => addActions(compound), label);
    });
  } catch (error) {
    throw new Error(`${label}: ${error.message || String(error)}`);
  }
  if (!accepted) throw new Error(`Premiere rejected: ${label}`);
}

export async function applyPreset(ctx, presetForTarget) {
  const prepared = [];
  const failed = [];
  let addedEffects = 0;
  try {
    addedEffects = await addMissingTransforms(ctx);
  } catch (error) {
    return { applied: 0, addedEffects: 0, failed, error: error.message };
  }

  for (let index = 0; index < ctx.targets.length; index++) {
    const target = ctx.targets[index];
    try {
      const component = await findTransform(target.item);
      if (!component) throw new Error("Transform was not available after insertion");
      const params = await transformParams(component);
      if (params.error) throw new Error(params.error);
      const scaleStart = await params.scaleParams[0].getStartValue();
      const positionStart = await params.positionParam.getStartValue();
      prepared.push({ target, params, scaleStart, positionStart, preset: presetForTarget(target, index) });
    } catch (error) {
      failed.push({ index, reason: error.message });
    }
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
  if (!prepared.length) return { applied: 0, failed, error: "No eligible clips." };

  try {
    execute(ctx, "Zoom Motion: reset Transform animation", (compound) => {
      for (const { params } of prepared) {
        for (const param of [...params.scaleParams, params.positionParam]) {
          if (param.isTimeVarying()) {
            for (const time of param.getKeyframeListAsTickTimes()) {
              compound.addAction(param.createRemoveKeyframeAction(time, true));
            }
          }
          compound.addAction(param.createSetTimeVaryingAction(true));
        }
      }
    });

    execute(ctx, `Zoom Motion: ${prepared[0].preset.name} keyframes`, (compound) => {
      for (const { target, params, preset, scaleStart, positionStart } of prepared) {
        for (const scaleKey of preset.scaleKeys) {
          const scaleTime = keyTime(target, scaleStart, scaleKey.frame, ctx.frameRate);
          const value = scaleForParam(scaleKey.value, startValue(scaleStart));
          // Both axes carry the same value, so the zoom stays uniform without
          // relying on the Uniform Scale flag to link them.
          for (const param of params.scaleParams) {
            const scaleFrame = param.createKeyframe(value);
            scaleFrame.position = scaleTime;
            compound.addAction(param.createAddKeyframeAction(scaleFrame));
          }
        }
        for (const key of positionPlan(preset, ctx.frameSize)) {
          const positionFrame = params.positionParam.createKeyframe(
            pointForParam(key.pixels, startValue(positionStart), ctx.frameSize),
          );
          positionFrame.position = keyTime(target, positionStart, key.frame, ctx.frameRate);
          compound.addAction(params.positionParam.createAddKeyframeAction(positionFrame));
        }
      }
    });

    execute(ctx, "Zoom Motion: keyframe interpolation", (compound) => {
      for (const { target, params, preset, scaleStart, positionStart } of prepared) {
        for (const scaleKey of preset.scaleKeys) {
          const at = keyTime(target, scaleStart, scaleKey.frame, ctx.frameRate);
          for (const param of params.scaleParams) {
            compound.addAction(param.createSetInterpolationAtKeyframeAction(
              at, interpolation(scaleKey.ease), true,
            ));
          }
        }
        for (const key of positionPlan(preset, ctx.frameSize)) {
          compound.addAction(params.positionParam.createSetInterpolationAtKeyframeAction(
            keyTime(target, positionStart, key.frame, ctx.frameRate), interpolation(key.ease), true,
          ));
        }
      }
    });
  } catch (error) { return { applied: 0, failed, error: error.message }; }
  return {
    applied: prepared.length,
    addedEffects,
    failed,
    error: null,
  };
}
