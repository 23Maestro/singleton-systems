"use strict";
(() => {
  var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
    get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
  }) : x)(function(x) {
    if (typeof require !== "undefined") return require.apply(this, arguments);
    throw Error('Dynamic require of "' + x + '" is not supported');
  });

  // src/presets.js
  var DEFAULT_FOCAL = Object.freeze({ x: 0.5, y: 0.38 });
  var MAX_SCALE_1080 = 112;
  var focal = (frame, x = DEFAULT_FOCAL.x, y = DEFAULT_FOCAL.y, ease = "linear") => ({ frame, x, y, ease });
  var scale = (frame, value, ease = "linear") => ({ frame, value, ease });
  var PRESETS = Object.freeze([
    {
      name: "push-soft",
      label: "Soft Push",
      color: "#4C8DFF",
      badge: "104%",
      description: "Default soft push across a hard cut mid-sentence.",
      duration: 14,
      scaleKeys: [scale(0, 100), scale(14, 104, "out-expo")],
      focalKeys: [focal(0), focal(14)],
      maxScale: MAX_SCALE_1080
    },
    {
      name: "push-punch",
      label: "Punch",
      color: "#E01F26",
      badge: "112%",
      description: "Fast emphasis for a number or a claim.",
      duration: 8,
      scaleKeys: [scale(0, 100), scale(8, 112, "out-quint")],
      focalKeys: [focal(0), focal(8)],
      maxScale: MAX_SCALE_1080
    },
    {
      name: "push-settle",
      label: "Settle",
      color: "#E0B467",
      badge: "109\u2192106",
      description: "Premium overshoot and settle for the three biggest claims.",
      duration: 16,
      scaleKeys: [scale(0, 100), scale(10, 109, "out-back"), scale(16, 106.5, "in-out-sine")],
      focalKeys: [focal(0), focal(16)],
      maxScale: MAX_SCALE_1080
    },
    {
      name: "push-recompose-R",
      label: "Recompose \u2192",
      color: "#2BC4A8",
      badge: "107% right",
      description: "Pushes right while clearing the left third for a graphic.",
      duration: 18,
      scaleKeys: [scale(0, 100), scale(18, 107, "out-quart")],
      focalKeys: [focal(0, 0.5, 0.38), focal(18, 0.72, 0.38, "out-quart")],
      maxScale: MAX_SCALE_1080
    },
    {
      name: "push-recompose-L",
      label: "\u2190 Recompose",
      color: "#A97BFF",
      badge: "107% left",
      description: "Pushes left while clearing the right third for a graphic.",
      duration: 18,
      scaleKeys: [scale(0, 100), scale(18, 107, "out-quart")],
      focalKeys: [focal(0, 0.5, 0.38), focal(18, 0.28, 0.38, "out-quart")],
      maxScale: MAX_SCALE_1080
    },
    {
      name: "drift",
      label: "Drift",
      color: "#6BB7EE",
      badge: "105% hold",
      description: "Long 105% hold with a quiet horizontal focal drift.",
      duration: 90,
      scaleKeys: [scale(0, 105), scale(90, 105)],
      focalKeys: [focal(0, 0.46, 0.38), focal(90, 0.54, 0.38)],
      maxScale: MAX_SCALE_1080
    },
    {
      name: "pull-drama-slow",
      label: "Slow Pull",
      color: "#22C55E",
      badge: "108\u2192100",
      description: "Barely perceptible slow release under a serious line.",
      duration: 120,
      scaleKeys: [scale(0, 108), scale(120, 100, "in-out-sine")],
      focalKeys: [focal(0), focal(120)],
      maxScale: MAX_SCALE_1080
    },
    {
      name: "pull-drama-snap",
      label: "Snap Back",
      color: "#F0803C",
      badge: "112\u2192104",
      description: "Quick reverse reset after a punchline or section turn.",
      duration: 12,
      scaleKeys: [scale(0, 112), scale(9, 103.4, "out-back"), scale(12, 104, "in-out-sine")],
      focalKeys: [focal(0), focal(12)],
      maxScale: MAX_SCALE_1080
    }
  ]);
  function getPreset(name) {
    return PRESETS.find((preset) => preset.name === name) || null;
  }
  function focalPosition(focalPoint, scaleValue, frameSize) {
    const fx = Number(focalPoint?.x);
    const fy = Number(focalPoint?.y);
    const s = Number(scaleValue);
    const width = Number(frameSize?.width ?? frameSize?.w);
    const height = Number(frameSize?.height ?? frameSize?.h);
    if (![fx, fy, s, width, height].every(Number.isFinite) || width <= 0 || height <= 0) {
      return null;
    }
    return {
      x: width / 2 + (width / 2 - fx * width) * (s - 1),
      y: height / 2 + (height / 2 - fy * height) * (s - 1)
    };
  }
  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }
  function resolvePreset(presetOrName, options = {}) {
    const source = typeof presetOrName === "string" ? getPreset(presetOrName) : presetOrName;
    if (!source) return { preset: null, warnings: ["Unknown preset."] };
    const intensity = clamp(Number(options.intensity) || 1, 0.5, 1.5);
    const direction = String(options.direction || "R").toUpperCase() === "L" ? "L" : "R";
    const warnings = [];
    const scaleKeys = source.scaleKeys.map((key) => {
      const requested = 100 + (key.value - 100) * intensity;
      const value = Math.min(source.maxScale, requested);
      if (value !== requested) warnings.push(`${source.name}: ${requested.toFixed(1)}% capped at ${source.maxScale}%.`);
      return { ...key, value };
    });
    let focalKeys = source.focalKeys.map((key) => ({ ...key }));
    if (source.name === "drift" && direction === "L") {
      focalKeys = focalKeys.map((key) => ({ ...key, x: Number((1 - key.x).toFixed(6)) }));
    }
    return { preset: { ...source, scaleKeys, focalKeys }, warnings: [...new Set(warnings)] };
  }
  function valueAt(keys, frame, fields) {
    if (frame <= keys[0].frame) return Object.fromEntries(fields.map((field) => [field, keys[0][field]]));
    if (frame >= keys[keys.length - 1].frame) {
      const last = keys[keys.length - 1];
      return Object.fromEntries(fields.map((field) => [field, last[field]]));
    }
    const rightIndex = keys.findIndex((key) => key.frame >= frame);
    const left = keys[rightIndex - 1];
    const right = keys[rightIndex];
    const t = (frame - left.frame) / (right.frame - left.frame);
    return Object.fromEntries(fields.map((field) => [field, left[field] + (right[field] - left[field]) * t]));
  }
  var REFERENCE_FRAME = Object.freeze({ width: 1920, height: 1080 });
  var DEFAULT_TOLERANCE_PX = 1;
  function scaleAtFrame(preset, frame) {
    return valueAt(preset.scaleKeys, frame, ["value"]).value;
  }
  function truePosition(preset, frame, frameSize) {
    return focalPosition(
      valueAt(preset.focalKeys, frame, ["x", "y"]),
      scaleAtFrame(preset, frame) / 100,
      frameSize
    );
  }
  function interpolatedPosition(preset, a, b, frame, frameSize) {
    const pa = truePosition(preset, a, frameSize);
    const pb = truePosition(preset, b, frameSize);
    if (!pa || !pb) return null;
    const sa = scaleAtFrame(preset, a);
    const sb = scaleAtFrame(preset, b);
    const t = Math.abs(sb - sa) > 1e-9 ? (scaleAtFrame(preset, frame) - sa) / (sb - sa) : (frame - a) / (b - a || 1);
    return { x: pa.x + (pb.x - pa.x) * t, y: pa.y + (pb.y - pa.y) * t };
  }
  function easeAtFrame(preset, frame) {
    const next = preset.scaleKeys.find((key) => key.frame >= frame);
    return (next || preset.scaleKeys[preset.scaleKeys.length - 1]).ease || "linear";
  }
  function positionKeyFrames(preset, options = {}) {
    if (!preset?.scaleKeys?.length || !preset?.focalKeys?.length) return [];
    const tolerance = Number(options.tolerancePx ?? DEFAULT_TOLERANCE_PX);
    const frameSize = options.frameSize || REFERENCE_FRAME;
    const maxKeys = Math.max(2, Number(options.maxKeys ?? 24));
    const frames = [.../* @__PURE__ */ new Set([
      ...preset.scaleKeys.map((key) => key.frame),
      ...preset.focalKeys.map((key) => key.frame)
    ])].sort((a, b) => a - b);
    while (frames.length < maxKeys) {
      let worstError = 0;
      let worstFrame = null;
      for (let i = 0; i < frames.length - 1; i++) {
        const a = frames[i];
        const b = frames[i + 1];
        for (let f = Math.ceil(a) + 1; f < b; f++) {
          const truth = truePosition(preset, f, frameSize);
          const approx = interpolatedPosition(preset, a, b, f, frameSize);
          if (!truth || !approx) continue;
          const error = Math.max(Math.abs(truth.x - approx.x), Math.abs(truth.y - approx.y));
          if (error > worstError) {
            worstError = error;
            worstFrame = f;
          }
        }
      }
      if (worstFrame === null || worstError <= tolerance) break;
      frames.push(worstFrame);
      frames.sort((a, b) => a - b);
    }
    return frames;
  }
  function positionPlan(preset, frameSize, options = {}) {
    return positionKeyFrames(preset, { ...options, frameSize }).map((frame) => ({
      frame,
      ease: easeAtFrame(preset, frame),
      pixels: truePosition(preset, frame, frameSize)
    }));
  }
  function samplePreset(presetOrName, samples = 24, options = {}) {
    const { preset, warnings } = resolvePreset(presetOrName, options);
    if (!preset) return { samples: [], warnings };
    const count = Math.max(2, Math.floor(samples));
    return {
      warnings,
      samples: Array.from({ length: count }, (_, index) => {
        const frame = preset.duration * index / (count - 1);
        return {
          frame,
          scale: valueAt(preset.scaleKeys, frame, ["value"]).value,
          focal: valueAt(preset.focalKeys, frame, ["x", "y"])
        };
      })
    };
  }

  // src/ppro.js
  var ppro = null;
  try {
    ppro = __require("premierepro");
  } catch {
    ppro = null;
  }
  function seconds(value) {
    if (typeof value === "number") return value;
    if (typeof value?.seconds === "number") return value.seconds;
    if (typeof value?.ticksNumber === "number") return value.ticksNumber / 254016e6;
    if (typeof value?.ticks === "number") return value.ticks / 254016e6;
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
        height: Number(rect?.height ?? rect?.bottom - rect?.top)
      };
      return { project, sequence, frameRate, frameSize };
    } catch (error) {
      return { error: error.message };
    }
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
    } catch {
    }
    return false;
  }
  async function getTargets(mode2 = "selection") {
    const ctx = await activeContext();
    if (ctx.error) return ctx;
    const skipped = [];
    const targets = [];
    if (mode2 === "all") {
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
  var TRANSFORM_MATCH_NAME = "AE.ADBE Geometry2";
  var transformMatchName = null;
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
    const displayNames = await ppro.VideoFilterFactory.getDisplayNames();
    const index = displayNames.findIndex((name) => name === "Transform");
    if (index < 0 || !matchNames[index]) throw new Error("Premiere Transform effect is unavailable");
    transformMatchName = matchNames[index];
    return transformMatchName;
  }
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
      const found = [
        scaleHeightParam && "Scale Height",
        scaleWidthParam && "Scale Width",
        positionParam && "Position"
      ].filter(Boolean).join(", ") || "none";
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
            component: await ppro.VideoFilterFactory.createComponent(await resolveTransformMatchName())
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
    const sequenceRelative = nativeStart != null && target.at != null && Math.abs(nativeStart - target.at) < 1e-3;
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
  async function applyPreset(ctx, presetForTarget) {
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
            for (const param of params.scaleParams) {
              const scaleFrame = param.createKeyframe(value);
              scaleFrame.position = scaleTime;
              compound.addAction(param.createAddKeyframeAction(scaleFrame));
            }
          }
          for (const key of positionPlan(preset, ctx.frameSize)) {
            const positionFrame = params.positionParam.createKeyframe(
              pointForParam(key.pixels, startValue(positionStart), ctx.frameSize)
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
                at,
                interpolation(scaleKey.ease),
                true
              ));
            }
          }
          for (const key of positionPlan(preset, ctx.frameSize)) {
            compound.addAction(params.positionParam.createSetInterpolationAtKeyframeAction(
              keyTime(target, positionStart, key.frame, ctx.frameRate),
              interpolation(key.ease),
              true
            ));
          }
        }
      });
    } catch (error) {
      return { applied: 0, failed, error: error.message };
    }
    return {
      applied: prepared.length,
      addedEffects,
      failed,
      error: null
    };
  }

  // src/main.js
  var el = (id) => document.getElementById(id);
  var mode = "selection";
  var busy = false;
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
  function addSparkline(parent, name, color) {
    const { samples } = samplePreset(name, 14);
    const values = samples.map((sample) => sample.scale);
    const min = Math.min(...values, 100);
    const max = Math.max(...values, 100);
    const range = Math.max(0.5, max - min);
    const strip = add(parent, "div", "spark");
    for (const value of values) {
      const bar = add(strip, "div", "bar");
      bar.style.height = `${2 + (value - min) / range * 15}px`;
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
    say(`Applying ${base.label}\u2026`);
    try {
      const ctx = await getTargets(mode);
      if (ctx.error) throw new Error(ctx.error);
      if (!ctx.targets.length) {
        throw new Error(mode === "all" ? "No video clips in this sequence." : "Nothing selected and no clip under the playhead.");
      }
      const warnings = [];
      const result = await applyPreset(ctx, (_target, index) => {
        const resolved = resolvePreset(base, {
          direction: index % 2 === 0 ? "R" : "L"
        });
        warnings.push(...resolved.warnings);
        return resolved.preset;
      });
      if (result.error) throw new Error(result.error);
      const plural = result.applied === 1 ? "" : "s";
      const skipped = ctx.skipped.length + result.failed.length;
      let message = `${base.label} \u2192 ${result.applied} clip${plural}`;
      if (result.addedEffects) message += `, Transform added to ${result.addedEffects}`;
      if (skipped) message += ` \xB7 ${skipped} skipped`;
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
      say(mode === "all" ? "Will apply to every video clip in the sequence." : "Will apply to the selected clip, or the one under the playhead.");
    };
  });
  renderList();
})();
