import { loadFont } from "@remotion/google-fonts/Geist";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const { fontFamily } = loadFont("normal", {
  weights: ["500", "600", "700", "800"],
  subsets: ["latin"],
});

export type EmphasisCalloutProps = {
  value: string;
  label: string;
  kicker?: string;
  tone?: "red" | "green" | "ink";
  side?: "left" | "right";
  compact?: boolean;
};

const tones = {
  red: { accent: "#E01F26", soft: "rgba(224,31,38,.12)" },
  green: { accent: "#22C55E", soft: "rgba(34,197,94,.12)" },
  ink: { accent: "#111318", soft: "rgba(17,19,24,.08)" },
};

export const EmphasisCallout = ({
  value,
  label,
  kicker = "KEY POINT",
  tone = "red",
  side = "left",
  compact = false,
}: EmphasisCalloutProps) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const palette = tones[tone];

  const cardIn = spring({
    frame,
    fps,
    config: { damping: 17, stiffness: 145, mass: 0.74 },
    durationInFrames: 31,
  });
  const badgeIn = spring({
    frame: frame - 6,
    fps,
    config: { damping: 14, stiffness: 190, mass: 0.56 },
    durationInFrames: 28,
  });
  const copyIn = spring({
    frame: frame - 10,
    fps,
    config: { damping: 19, stiffness: 150, mass: 0.7 },
    durationInFrames: 30,
  });
  const exit = interpolate(frame, [durationInFrames - 12, durationInFrames - 1], [1, 0], {
    easing: Easing.in(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const direction = side === "left" ? -1 : 1;
  const iconRotation = interpolate(badgeIn, [0, 1], [direction * 16, 0]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "transparent",
        fontFamily,
        opacity: exit,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 128,
          ...(side === "left" ? { left: 96 } : { right: 96 }),
          width: compact ? 540 : 620,
          minHeight: compact ? 146 : 176,
          boxSizing: "border-box",
          display: "flex",
          alignItems: "center",
          gap: 24,
          padding: compact ? "24px 30px" : "28px 34px",
          borderRadius: 30,
          background:
            "linear-gradient(145deg, rgba(255,255,255,.99), rgba(245,245,246,.97))",
          border: "1px solid rgba(255,255,255,.9)",
          boxShadow:
            "0 26px 70px rgba(0,0,0,.34), 0 5px 18px rgba(0,0,0,.2), inset 0 1px 0 white",
          transform: `translateX(${interpolate(cardIn, [0, 1], [direction * 92, 0])}px) scale(${interpolate(
            cardIn,
            [0, 1],
            [0.94, 1],
          )})`,
          transformOrigin: side === "left" ? "left center" : "right center",
          opacity: cardIn,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(circle at ${side === "left" ? "0%" : "100%"} 0%, ${palette.soft}, transparent 58%)`,
          }}
        />

        <div
          style={{
            position: "relative",
            width: compact ? 70 : 82,
            height: compact ? 70 : 82,
            flex: "0 0 auto",
            borderRadius: 999,
            display: "grid",
            placeItems: "center",
            background: palette.accent,
            color: "white",
            boxShadow: `0 12px 28px ${palette.soft}, inset 0 1px 0 rgba(255,255,255,.35)`,
            transform: `scale(${interpolate(badgeIn, [0, 1], [0.6, 1])}) rotate(${iconRotation}deg)`,
            opacity: badgeIn,
          }}
        >
          <svg width={compact ? 32 : 38} height={compact ? 32 : 38} viewBox="0 0 40 40">
            <path
              d="M10 21.4 17 28l13-16"
              fill="none"
              stroke="currentColor"
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              pathLength="1"
              strokeDasharray="1"
              strokeDashoffset={interpolate(badgeIn, [0, 1], [1, 0])}
            />
          </svg>
        </div>

        <div
          style={{
            position: "relative",
            minWidth: 0,
            opacity: copyIn,
            filter: `blur(${interpolate(copyIn, [0, 1], [6, 0])}px)`,
            transform: `translateY(${interpolate(copyIn, [0, 1], [18, 0])}px)`,
          }}
        >
          <div
            style={{
              marginBottom: 6,
              color: palette.accent,
              fontSize: 17,
              lineHeight: 1,
              fontWeight: 800,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
            }}
          >
            {kicker}
          </div>
          <div
            style={{
              color: palette.accent,
              fontSize: compact ? 52 : value.length > 13 ? 53 : 64,
              lineHeight: 0.96,
              fontWeight: 800,
              letterSpacing: "-0.055em",
              whiteSpace: "nowrap",
            }}
          >
            {value}
          </div>
          <div
            style={{
              marginTop: 7,
              color: "#15171C",
              fontSize: compact ? 23 : 25,
              lineHeight: 1.08,
              fontWeight: 700,
              letterSpacing: "-0.025em",
              textTransform: "uppercase",
            }}
          >
            {label}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

