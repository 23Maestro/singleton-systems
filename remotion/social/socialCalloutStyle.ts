export const SOCIAL_CALLOUT_STYLE = {
  canvas: {
    width: 1080,
    height: 1920,
    fps: 30,
  },
  text: {
    bodyColor: "#FFFFFF",
    accentColor: "#04ACEC",
    bodyWeight: 800,
    accentWeight: 900,
    lineHeight: 0.88,
    letterSpacing: "-0.055em",
    maxWidth: 940,
  },
  shadow: {
    standard: "0 7px 12px rgba(0,0,0,.46), 0 18px 32px rgba(0,0,0,.28)",
    accent: "0 5px 10px rgba(0,0,0,.64), 0 16px 30px rgba(0,0,0,.36)",
  },
  guidance: {
    maximumLines: 2,
    minimumRowGap: 18,
    accentWordsPerCard: 1,
    payoffScaleMinimum: 0.72,
    shadowTreatment: "medium-soft",
  },
} as const;
