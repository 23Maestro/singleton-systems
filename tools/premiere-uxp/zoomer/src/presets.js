export const DEFAULT_FOCAL = Object.freeze({ x: 0.5, y: 0.38 });
export const MAX_SCALE_1080 = 112;

const focal = (frame, x = DEFAULT_FOCAL.x, y = DEFAULT_FOCAL.y, ease = "linear") =>
  ({ frame, x, y, ease });
const scale = (frame, value, ease = "linear") => ({ frame, value, ease });

export const PRESETS = Object.freeze([
  {
    name: "push-soft",
    label: "Soft Push",
    color: "#4C8DFF",
    badge: "104%",
    description: "Default soft push across a hard cut mid-sentence.",
    duration: 14,
    scaleKeys: [scale(0, 100), scale(14, 104, "out-expo")],
    focalKeys: [focal(0), focal(14)],
    maxScale: MAX_SCALE_1080,
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
    maxScale: MAX_SCALE_1080,
  },
  {
    name: "push-settle",
    label: "Settle",
    color: "#E0B467",
    badge: "109→106",
    description: "Premium overshoot and settle for the three biggest claims.",
    duration: 16,
    scaleKeys: [scale(0, 100), scale(10, 109, "out-back"), scale(16, 106.5, "in-out-sine")],
    focalKeys: [focal(0), focal(16)],
    maxScale: MAX_SCALE_1080,
  },
  {
    name: "push-recompose-R",
    label: "Recompose →",
    color: "#2BC4A8",
    badge: "107% right",
    description: "Pushes right while clearing the left third for a graphic.",
    duration: 18,
    scaleKeys: [scale(0, 100), scale(18, 107, "out-quart")],
    focalKeys: [focal(0, 0.5, 0.38), focal(18, 0.72, 0.38, "out-quart")],
    maxScale: MAX_SCALE_1080,
  },
  {
    name: "push-recompose-L",
    label: "← Recompose",
    color: "#A97BFF",
    badge: "107% left",
    description: "Pushes left while clearing the right third for a graphic.",
    duration: 18,
    scaleKeys: [scale(0, 100), scale(18, 107, "out-quart")],
    focalKeys: [focal(0, 0.5, 0.38), focal(18, 0.28, 0.38, "out-quart")],
    maxScale: MAX_SCALE_1080,
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
    maxScale: MAX_SCALE_1080,
  },
  {
    name: "pull-drama-slow",
    label: "Slow Pull",
    color: "#22C55E",
    badge: "108→100",
    description: "Barely perceptible slow release under a serious line.",
    duration: 120,
    scaleKeys: [scale(0, 108), scale(120, 100, "in-out-sine")],
    focalKeys: [focal(0), focal(120)],
    maxScale: MAX_SCALE_1080,
  },
  {
    name: "pull-drama-snap",
    label: "Snap Back",
    color: "#F0803C",
    badge: "112→104",
    description: "Quick reverse reset after a punchline or section turn.",
    duration: 12,
    scaleKeys: [scale(0, 112), scale(9, 103.4, "out-back"), scale(12, 104, "in-out-sine")],
    focalKeys: [focal(0), focal(12)],
    maxScale: MAX_SCALE_1080,
  },
]);

export function getPreset(name) {
  return PRESETS.find((preset) => preset.name === name) || null;
}

export function focalPosition(focalPoint, scaleValue, frameSize) {
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
    y: height / 2 + (height / 2 - fy * height) * (s - 1),
  };
}

function clamp(value, min, max) { return Math.min(max, Math.max(min, value)); }

export function resolvePreset(presetOrName, options = {}) {
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

const REFERENCE_FRAME = Object.freeze({ width: 1920, height: 1080 });
const DEFAULT_TOLERANCE_PX = 1.0;

function scaleAtFrame(preset, frame) {
  return valueAt(preset.scaleKeys, frame, ["value"]).value;
}

function truePosition(preset, frame, frameSize) {
  return focalPosition(
    valueAt(preset.focalKeys, frame, ["x", "y"]),
    scaleAtFrame(preset, frame) / 100,
    frameSize,
  );
}

function interpolatedPosition(preset, a, b, frame, frameSize) {
  const pa = truePosition(preset, a, frameSize);
  const pb = truePosition(preset, b, frameSize);
  if (!pa || !pb) return null;
  const sa = scaleAtFrame(preset, a);
  const sb = scaleAtFrame(preset, b);
  const t = Math.abs(sb - sa) > 1e-9
    ? (scaleAtFrame(preset, frame) - sa) / (sb - sa)
    : (frame - a) / ((b - a) || 1);
  return { x: pa.x + (pb.x - pa.x) * t, y: pa.y + (pb.y - pa.y) * t };
}

/** Ease for the segment containing `frame`. */
export function easeAtFrame(preset, frame) {
  const next = preset.scaleKeys.find((key) => key.frame >= frame);
  return (next || preset.scaleKeys[preset.scaleKeys.length - 1]).ease || "linear";
}

/** Position keyframe frames, ascending. Includes every scale- and focal-key frame. */
export function positionKeyFrames(preset, options = {}) {
  if (!preset?.scaleKeys?.length || !preset?.focalKeys?.length) return [];
  const tolerance = Number(options.tolerancePx ?? DEFAULT_TOLERANCE_PX);
  const frameSize = options.frameSize || REFERENCE_FRAME;
  const maxKeys = Math.max(2, Number(options.maxKeys ?? 24));

  const frames = [...new Set([
    ...preset.scaleKeys.map((key) => key.frame),
    ...preset.focalKeys.map((key) => key.frame),
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

/** Worst-case focal drift in px for a key set. */
export function positionError(preset, frames, frameSize = REFERENCE_FRAME) {
  let worst = 0;
  for (let i = 0; i < frames.length - 1; i++) {
    const a = frames[i];
    const b = frames[i + 1];
    for (let f = Math.ceil(a) + 1; f < b; f++) {
      const truth = truePosition(preset, f, frameSize);
      const approx = interpolatedPosition(preset, a, b, f, frameSize);
      if (!truth || !approx) continue;
      worst = Math.max(worst, Math.abs(truth.x - approx.x), Math.abs(truth.y - approx.y));
    }
  }
  return worst;
}

/** Position keyframes with resolved pixel values. */
export function positionPlan(preset, frameSize, options = {}) {
  return positionKeyFrames(preset, { ...options, frameSize }).map((frame) => ({
    frame,
    ease: easeAtFrame(preset, frame),
    pixels: truePosition(preset, frame, frameSize),
  }));
}

export function samplePreset(presetOrName, samples = 24, options = {}) {
  const { preset, warnings } = resolvePreset(presetOrName, options);
  if (!preset) return { samples: [], warnings };
  const count = Math.max(2, Math.floor(samples));
  return {
    warnings,
    samples: Array.from({ length: count }, (_, index) => {
      const frame = (preset.duration * index) / (count - 1);
      return {
        frame,
        scale: valueAt(preset.scaleKeys, frame, ["value"]).value,
        focal: valueAt(preset.focalKeys, frame, ["x", "y"]),
      };
    }),
  };
}
