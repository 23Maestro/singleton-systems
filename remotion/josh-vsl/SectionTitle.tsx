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
  weights: ["500", "700", "800"],
  subsets: ["latin"],
});

export type SectionTitleProps = {
  number: string;
  title: string;
};

const ACCENT = "#E01F26";

const enterSpring = (frame: number, fps: number, delay: number) =>
  spring({
    frame: frame - delay,
    fps,
    config: { damping: 18, stiffness: 150, mass: 0.72 },
    durationInFrames: 34,
  });

export const SectionTitle = ({ number, title }: SectionTitleProps) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const words = title.split(" ");
  const displayNumber = String(Number(number));

  const badgeIn = enterSpring(frame, fps, 0);
  const ruleIn = interpolate(frame, [8, 25], [0, 1], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const eyebrowIn = enterSpring(frame, fps, 7);
  const exit = interpolate(frame, [durationInFrames - 13, durationInFrames - 1], [1, 0], {
    easing: Easing.in(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const exitY = interpolate(exit, [0, 1], [10, 0]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "transparent",
        fontFamily,
        color: "white",
        opacity: exit,
        transform: `translateY(${exitY}px)`,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 96,
          top: 610,
          width: 1220,
          display: "flex",
          alignItems: "flex-start",
          gap: 26,
        }}
      >
        <div
          style={{
            width: 74,
            height: 74,
            flex: "0 0 auto",
            borderRadius: 999,
            background: ACCENT,
            display: "grid",
            placeItems: "center",
            fontSize: 31,
            fontWeight: 800,
            letterSpacing: "-0.04em",
            lineHeight: 1,
            boxShadow:
              "0 14px 34px rgba(224,31,38,.28), inset 0 1px 0 rgba(255,255,255,.24), 0 0 0 1px rgba(0,0,0,.28)",
            transform: `translateY(${interpolate(badgeIn, [0, 1], [22, 0])}px) scale(${interpolate(
              badgeIn,
              [0, 1],
              [0.86, 1],
            )})`,
            opacity: badgeIn,
          }}
        >
          {displayNumber}
        </div>

        <div style={{ flex: 1, paddingTop: 2 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              marginBottom: 16,
              opacity: eyebrowIn,
              transform: `translateY(${interpolate(eyebrowIn, [0, 1], [10, 0])}px)`,
            }}
          >
            <div
              style={{
                color: "rgba(255,255,255,.82)",
                fontSize: 22,
                fontWeight: 700,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                textShadow: "0 2px 10px rgba(0,0,0,.85)",
              }}
            >
              Section {displayNumber}:
            </div>
            <div
              style={{
                width: 260 * ruleIn,
                height: 4,
                borderRadius: 99,
                background: ACCENT,
                transformOrigin: "left center",
                boxShadow: "0 3px 14px rgba(224,31,38,.34)",
              }}
            />
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              columnGap: 18,
              rowGap: 2,
              maxWidth: 1180,
              fontSize: title.length > 46 ? 62 : title.length > 32 ? 70 : 78,
              fontWeight: 800,
              letterSpacing: "-0.045em",
              lineHeight: 0.98,
              textTransform: "uppercase",
              textWrap: "balance",
              WebkitTextStroke: "1px rgba(0,0,0,.22)",
              textShadow: "0 4px 7px rgba(0,0,0,.9), 0 16px 36px rgba(0,0,0,.56)",
            }}
          >
            {words.map((word, index) => {
              const wordIn = enterSpring(frame, fps, 14 + index * 2.4);
              return (
                <span
                  key={`${word}-${index}`}
                  style={{
                    display: "inline-block",
                    opacity: wordIn,
                    filter: `blur(${interpolate(wordIn, [0, 1], [7, 0])}px)`,
                    transform: `translateY(${interpolate(wordIn, [0, 1], [24, 0])}px)`,
                  }}
                >
                  {word}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
