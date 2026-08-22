import { loadFont } from "@remotion/google-fonts/Geist";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { SOCIAL_CALLOUT_STYLE } from "../social/socialCalloutStyle";

const { fontFamily } = loadFont("normal", {
  weights: ["700", "800", "900"],
  subsets: ["latin"],
});

export type TranscriptCalloutToken = {
  text: string;
  highlighted?: boolean;
  appearFrame: number;
};

export type TranscriptCalloutRow = {
  tokens: TranscriptCalloutToken[];
  scale?: number;
  opacity?: number;
};

export type TranscriptCalloutProps = {
  rows: TranscriptCalloutRow[];
  fontSize?: number;
  accentColor?: string;
  highContrastAccent?: boolean;
  rowGap?: number;
};

export const TranscriptCallout = ({
  rows,
  fontSize = 112,
  accentColor = SOCIAL_CALLOUT_STYLE.text.accentColor,
  highContrastAccent = true,
  rowGap = 0,
}: TranscriptCalloutProps) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const exit = interpolate(
    frame,
    [durationInFrames - 9, durationInFrames - 1],
    [1, 0],
    {
      easing: Easing.in(Easing.cubic),
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );

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
          top: "50%",
          left: "50%",
          width: SOCIAL_CALLOUT_STYLE.text.maxWidth,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 0,
          transform: "translate(-50%, -50%)",
          textAlign: "center",
        }}
      >
        {rows.map((row, rowIndex) => (
          <div
            key={`row-${rowIndex}`}
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "baseline",
              flexWrap: "nowrap",
              gap: 15,
              marginTop: rowIndex === 0 ? 0 : rowGap,
              opacity: row.opacity ?? 1,
              whiteSpace: "nowrap",
              zIndex: rows.length - rowIndex,
            }}
          >
            {row.tokens.map((token, tokenIndex) => {
              const entrance = spring({
                frame: frame - token.appearFrame,
                fps,
                config: { damping: 19, stiffness: 190, mass: 0.54 },
                durationInFrames: 18,
              });
              const opacity = interpolate(entrance, [0, 0.35, 1], [0, 1, 1]);
              const y = interpolate(entrance, [0, 1], [28, 0]);
              const scale = interpolate(entrance, [0, 1], [0.91, 1]);

              return (
                <span
                  key={`${token.text}-${tokenIndex}`}
                  style={{
                    display: "inline-block",
                    color: token.highlighted
                      ? accentColor
                      : SOCIAL_CALLOUT_STYLE.text.bodyColor,
                    fontSize: fontSize * (row.scale ?? 1),
                    fontWeight: token.highlighted
                      ? SOCIAL_CALLOUT_STYLE.text.accentWeight
                      : SOCIAL_CALLOUT_STYLE.text.bodyWeight,
                    lineHeight: SOCIAL_CALLOUT_STYLE.text.lineHeight,
                    letterSpacing: SOCIAL_CALLOUT_STYLE.text.letterSpacing,
                    opacity,
                    transform: `translateY(${y}px) scale(${scale})`,
                    transformOrigin: "center bottom",
                    textShadow:
                      token.highlighted && highContrastAccent
                        ? SOCIAL_CALLOUT_STYLE.shadow.accent
                        : SOCIAL_CALLOUT_STYLE.shadow.standard,
                  }}
                >
                  {token.text}
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
