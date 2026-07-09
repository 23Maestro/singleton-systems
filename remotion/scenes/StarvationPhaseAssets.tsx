import React from "react";
import { AbsoluteFill, Easing, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

const subjects = Array.from({ length: 36 }, (_, index) => index + 1);

const palette = {
  ink: "#16191b",
  charcoal: "#252a2d",
  slate: "#4b5356",
  slateSoft: "rgba(55, 62, 65, 0.5)",
  paper: "#cfc1a4",
  paperLight: "#ded2b9",
};

const numberFont = '"Georgia", "Times New Roman", Times, serif';
const humanIconSrc = staticFile("remotion-assets/human-reference-icon.png");

const fade = (frame: number, start: number, duration: number) =>
  interpolate(frame, [start, start + duration], [0, 1], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

function SubjectCard({ index }: { index: number }) {
  return (
    <div
      style={{
        position: "relative",
        borderRight: `2px solid ${palette.slate}`,
        borderBottom: `2px solid ${palette.slate}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 4,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: numberFont,
          fontSize: 27,
          lineHeight: 1,
          fontWeight: 500,
          color: "#070707",
          letterSpacing: 0,
          textShadow: [
            "0 1px 0 rgba(255,255,255,0.24)",
            "2px 3px 3px rgba(0,0,0,0.22)",
            "0 0 1px rgba(0,0,0,0.35)",
          ].join(", "),
        }}
      >
        {String(index).padStart(2, "0")}
      </div>
      <div
        style={{
          position: "absolute",
          top: 45,
          bottom: 0,
          left: "50%",
          width: 106,
          transform: "translateX(-50%)",
          borderTop: `1px solid ${palette.slateSoft}`,
          borderLeft: `1px solid ${palette.slateSoft}`,
          borderRight: `1px solid ${palette.slateSoft}`,
          borderBottom: 0,
          background: "rgba(58, 63, 65, 0.045)",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          paddingBottom: 1,
          boxShadow:
            "inset 1px 0 0 rgba(255,255,255,0.1), inset -1px 0 0 rgba(255,255,255,0.08), inset 0 1px 0 rgba(255,255,255,0.12)",
        }}
      >
        <img
          src={humanIconSrc}
          style={{
            width: 57,
            height: 56,
            objectFit: "contain",
            display: "block",
            transform: "translateY(2px)",
            filter: "drop-shadow(4px 5px 4px rgba(0, 0, 0, 0.24))",
          }}
        />
      </div>
    </div>
  );
}

export function StarvationGridLayer() {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const progress = interpolate(frame, [0, durationInFrames - 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const brightness = interpolate(progress, [0, 1], [1, 0.7]);
  const contrast = interpolate(progress, [0, 1], [1, 1.8]);
  const scale = interpolate(progress, [0, 1], [1, 0.85]);
  const opacity = fade(frame, 0, 12);

  return (
    <AbsoluteFill style={{ background: "transparent" }}>
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: 262,
          width: 1254,
          height: 686,
          transform: `translateX(-50%) scale(${scale})`,
          transformOrigin: "50% 50%",
          display: "grid",
          gridTemplateColumns: "repeat(6, 1fr)",
          gridTemplateRows: "repeat(6, 1fr)",
          borderTop: `2px solid ${palette.slate}`,
          borderLeft: `2px solid ${palette.slate}`,
          background: "rgba(196, 184, 157, 0.15)",
          opacity,
          filter: `brightness(${brightness}) contrast(${contrast})`,
        }}
      >
        {subjects.map((subject) => (
          <SubjectCard key={subject} index={subject} />
        ))}
      </div>
    </AbsoluteFill>
  );
}

export function CalendarMonthTexture({ month }: { month: number }) {
  return (
    <AbsoluteFill
      style={{
        background: "transparent",
        color: palette.ink,
        fontFamily:
          '"Courier New", "American Typewriter", ui-monospace, SFMono-Regular, Menlo, monospace',
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: 780,
          height: 460,
          border: "4px solid rgba(32, 36, 38, 0.5)",
          background: "rgba(207, 193, 164, 0.84)",
          boxShadow: "inset 0 0 0 2px rgba(255,255,255,0.16)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: [
              "linear-gradient(90deg, rgba(0,0,0,0.035) 1px, transparent 1px)",
              "linear-gradient(0deg, rgba(0,0,0,0.03) 1px, transparent 1px)",
              "radial-gradient(circle at 22% 20%, rgba(255,255,255,0.2), transparent 24%)",
            ].join(", "),
            backgroundSize: "24px 24px, 24px 24px, auto",
            opacity: 0.85,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 34,
            left: 46,
            right: 46,
            height: 7,
            background: palette.charcoal,
            opacity: 0.42,
          }}
        />
        <h2
          style={{
            position: "relative",
            margin: 0,
            fontSize: 82,
            lineHeight: 1,
            fontWeight: 800,
            letterSpacing: 0,
            color: palette.ink,
          }}
        >
          MONTH {month}
        </h2>
      </div>
    </AbsoluteFill>
  );
}
