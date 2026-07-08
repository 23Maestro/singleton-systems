import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";

const subjects = Array.from({ length: 36 }, (_, index) => index + 1);

const palette = {
  paper: "#cfc1a4",
  paperLight: "#ded2b9",
  ink: "#16191b",
  charcoal: "#252a2d",
  slate: "#4b5356",
  slateSoft: "rgba(55, 62, 65, 0.5)",
  red: "#d51f1f",
};

const styles: Record<string, React.CSSProperties> = {
  frame: {
    backgroundColor: palette.paper,
    color: palette.ink,
    fontFamily:
      '"Courier New", "American Typewriter", ui-monospace, SFMono-Regular, Menlo, monospace',
    overflow: "hidden",
  },
  texture: {
    position: "absolute",
    inset: 0,
    backgroundImage: [
      "radial-gradient(circle at 16% 22%, rgba(255,255,255,0.24), transparent 17%)",
      "radial-gradient(circle at 74% 18%, rgba(35,31,26,0.09), transparent 21%)",
      "radial-gradient(circle at 48% 78%, rgba(71,59,45,0.12), transparent 23%)",
      "linear-gradient(90deg, rgba(0,0,0,0.035) 1px, transparent 1px)",
      "linear-gradient(0deg, rgba(0,0,0,0.025) 1px, transparent 1px)",
    ].join(", "),
    backgroundSize: "auto, auto, auto, 18px 18px, 18px 18px",
    opacity: 0.72,
  },
  vignette: {
    position: "absolute",
    inset: 0,
    background:
      "radial-gradient(circle at center, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.04) 48%, rgba(38,31,22,0.18) 100%)",
  },
  composition: {
    position: "absolute",
    inset: "28px 20px 18px",
  },
  frameOverlay: {
    position: "absolute",
    inset: 0,
    border: `2px solid rgba(32, 36, 38, 0.42)`,
    boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.24)",
  },
  titleBlock: {
    position: "absolute",
    top: 64,
    left: 0,
    right: 0,
    textAlign: "center",
    letterSpacing: 0,
    color: palette.ink,
  },
  title: {
    margin: 0,
    fontSize: 40,
    lineHeight: 1.08,
    fontWeight: 700,
  },
  subtitle: {
    margin: "18px 0 0",
    fontSize: 26,
    lineHeight: 1.15,
    fontWeight: 700,
  },
  study: {
    margin: "10px 0 0",
    fontSize: 21,
    lineHeight: 1.2,
    fontWeight: 700,
    color: palette.charcoal,
  },
  grid: {
    position: "absolute",
    left: "50%",
    top: 262,
    width: 1254,
    height: 686,
    transform: "translateX(-50%)",
    display: "grid",
    gridTemplateColumns: "repeat(6, 1fr)",
    gridTemplateRows: "repeat(6, 1fr)",
    borderTop: `2px solid ${palette.slate}`,
    borderLeft: `2px solid ${palette.slate}`,
    background: "rgba(196, 184, 157, 0.15)",
  },
  cell: {
    position: "relative",
    borderRight: `2px solid ${palette.slate}`,
    borderBottom: `2px solid ${palette.slate}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  number: {
    position: "absolute",
    top: 10,
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 18,
    lineHeight: 1,
    fontWeight: 700,
    color: palette.charcoal,
  },
  subjectCard: {
    position: "relative",
    width: 88,
    height: 76,
    marginTop: 14,
    border: `1px solid ${palette.slateSoft}`,
    background: "rgba(58, 63, 65, 0.08)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  head: {
    position: "absolute",
    top: 12,
    width: 24,
    height: 24,
    borderRadius: "50%",
    background: palette.charcoal,
  },
  neck: {
    position: "absolute",
    top: 34,
    width: 16,
    height: 12,
    background: palette.charcoal,
  },
  shoulders: {
    position: "absolute",
    top: 46,
    width: 56,
    height: 26,
    borderRadius: "28px 28px 3px 3px",
    background: palette.charcoal,
  },
  stamp: {
    position: "absolute",
    top: 42,
    right: 64,
    width: 224,
    height: 64,
    transform: "rotate(-7deg)",
    border: `4px solid ${palette.red}`,
    color: palette.red,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    fontSize: 21,
    lineHeight: 1.05,
    fontWeight: 700,
    letterSpacing: 0,
    opacity: 1,
    mixBlendMode: "multiply",
    filter: "saturate(0.92) brightness(1.05)",
    boxShadow: "0 0 0 1px rgba(207, 193, 164, 0.16), inset 0 0 18px rgba(207, 193, 164, 0.18)",
  },
  stampWash: {
    position: "absolute",
    inset: -3,
    background:
      "linear-gradient(90deg, rgba(207,193,164,0.2), rgba(255,255,255,0.12) 45%, rgba(207,193,164,0.18))",
    opacity: 0.26,
    pointerEvents: "none",
    mixBlendMode: "screen",
  },
  registrationMark: {
    position: "absolute",
    width: 34,
    height: 34,
    borderColor: "rgba(28, 31, 32, 0.55)",
  },
};

const fade = (frame: number, start: number, duration: number) => {
  return interpolate(frame, [start, start + duration], [0, 1], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
};

const Subject = ({ index, frame }: { index: number; frame: number }) => {
  const subjectOpacity = fade(frame, 52 + (index - 1) * 1.25, 7);
  const subjectLift = interpolate(subjectOpacity, [0, 1], [6, 0]);

  return (
    <div style={styles.cell}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: subjectOpacity,
          transform: `translateY(${subjectLift}px)`,
        }}
      >
        <div style={styles.number}>{String(index).padStart(2, "0")}</div>
        <div style={styles.subjectCard}>
          <div style={styles.head} />
          <div style={styles.neck} />
          <div style={styles.shoulders} />
        </div>
      </div>
    </div>
  );
};

export const ClinicalSetup1944 = () => {
  const frame = useCurrentFrame();
  const titleOpacity = fade(frame, 8, 24);
  const titleY = interpolate(titleOpacity, [0, 1], [-8, 0]);
  const frameOpacity = fade(frame, 20, 24);
  const gridOpacity = fade(frame, 36, 18);
  const stampOpacity = fade(frame, 44, 14);

  return (
    <AbsoluteFill style={styles.frame}>
      <div style={styles.texture} />
      <div style={styles.vignette} />
      <div style={styles.composition}>
        <div style={{ ...styles.frameOverlay, opacity: frameOpacity }} />
        <div
          style={{
            ...styles.registrationMark,
            opacity: frameOpacity,
            top: 22,
            left: 22,
            borderTop: "2px solid rgba(28, 31, 32, 0.55)",
            borderLeft: "2px solid rgba(28, 31, 32, 0.55)",
          }}
        />
        <div
          style={{
            ...styles.registrationMark,
            opacity: frameOpacity,
            right: 22,
            bottom: 36,
            borderRight: "2px solid rgba(28, 31, 32, 0.55)",
            borderBottom: "2px solid rgba(28, 31, 32, 0.55)",
          }}
        />
        <div
          style={{
            ...styles.titleBlock,
            opacity: titleOpacity,
            transform: `translateY(${titleY}px)`,
          }}
        >
          <h1 style={styles.title}>THE MINNESOTA STARVATION EXPERIMENT: 1944</h1>
          <p style={styles.subtitle}>36 VOLUNTEERS (CONTROL GROUP)</p>
          <p style={styles.study}>MINNESOTA UNIVERSITY STUDY</p>
        </div>
        <div style={{ ...styles.stamp, opacity: stampOpacity }}>
          APPROVED - 1944
          <div style={styles.stampWash} />
        </div>
        <div style={{ ...styles.grid, opacity: gridOpacity }}>
          {subjects.map((subject) => (
            <Subject key={subject} index={subject} frame={frame} />
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};
