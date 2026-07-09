import React from "react";
import { AbsoluteFill, Easing, interpolate, staticFile, useCurrentFrame } from "remotion";

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

const numberFont = '"Georgia", "Times New Roman", Times, serif';
const humanIconSrc = staticFile("remotion-assets/human-reference-icon.png");

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
      "radial-gradient(ellipse at 35% 38%, rgba(255,255,255,0.12), transparent 34%)",
      "linear-gradient(92deg, rgba(0,0,0,0.034) 1px, transparent 1px)",
      "linear-gradient(2deg, rgba(0,0,0,0.024) 1px, transparent 1px)",
      "linear-gradient(115deg, transparent 0%, rgba(72,61,45,0.055) 42%, transparent 55%)",
    ].join(", "),
    backgroundSize: "auto, auto, auto, auto, 18px 18px, 18px 18px, auto",
    opacity: 0.8,
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
    fontSize: 43,
    lineHeight: 1.08,
    fontWeight: 700,
    textShadow: "0 1px 0 rgba(255,255,255,0.24), 1px 2px 2px rgba(0,0,0,0.16)",
  },
  subtitle: {
    margin: "18px 0 0",
    fontSize: 29,
    lineHeight: 1.15,
    fontWeight: 700,
    textShadow: "0 1px 0 rgba(255,255,255,0.22), 1px 2px 2px rgba(0,0,0,0.14)",
  },
  study: {
    margin: "10px 0 0",
    fontSize: 24,
    lineHeight: 1.2,
    fontWeight: 700,
    color: palette.charcoal,
    textShadow: "0 1px 0 rgba(255,255,255,0.22), 1px 2px 2px rgba(0,0,0,0.12)",
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
  },
  subjectCard: {
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
  },
  stamp: {
    position: "absolute",
    top: 34,
    right: 58,
    width: 252,
    height: 82,
    transform: "rotate(-7deg)",
    opacity: 1,
    mixBlendMode: "multiply",
    filter: "saturate(0.9) brightness(1.02)",
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

const stampDistress = Array.from({ length: 95 }, (_, index) => {
  const x = (index * 37) % 250;
  const y = (index * 53) % 78;
  const width = 2 + ((index * 11) % 12);
  const height = 1.5 + ((index * 7) % 5);
  const rotate = ((index * 17) % 32) - 16;

  return { x, y, width, height, rotate };
});

const DistressedApprovedStamp = ({ opacity }: { opacity: number }) => (
  <svg viewBox="0 0 260 86" style={{ ...styles.stamp, opacity }}>
    <defs>
      <mask id="approved-stamp-wear">
        <rect x="0" y="0" width="260" height="86" fill="white" />
        {stampDistress.map((mark, index) => (
          <rect
            key={index}
            x={mark.x}
            y={mark.y}
            width={mark.width}
            height={mark.height}
            rx="1"
            fill="black"
            opacity={index % 3 === 0 ? 0.72 : 0.48}
            transform={`rotate(${mark.rotate} ${mark.x + mark.width / 2} ${mark.y + mark.height / 2})`}
          />
        ))}
        {stampDistress.slice(0, 28).map((mark, index) => (
          <circle
            key={`dot-${index}`}
            cx={(mark.x * 1.7) % 256}
            cy={(mark.y * 1.9) % 82}
            r={1 + (index % 3)}
            fill="black"
            opacity="0.5"
          />
        ))}
      </mask>
      <filter id="approved-stamp-soften">
        <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="19" result="noise" />
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="0.8" />
      </filter>
    </defs>
    <g
      mask="url(#approved-stamp-wear)"
      filter="url(#approved-stamp-soften)"
      stroke={palette.red}
      fill={palette.red}
      opacity="0.95"
    >
      <rect x="12" y="14" width="236" height="56" fill="none" strokeWidth="6" />
      <rect x="18" y="20" width="224" height="44" fill="none" strokeWidth="1.5" opacity="0.72" />
      <text
        x="130"
        y="47"
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily={'"Georgia", "Times New Roman", serif'}
        fontSize="28"
        fontWeight="900"
        letterSpacing="2.4"
      >
        APPROVED
      </text>
      <text
        x="130"
        y="65"
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily={'"Courier New", ui-monospace, monospace'}
        fontSize="12"
        fontWeight="900"
        letterSpacing="2"
      >
        1944
      </text>
    </g>
  </svg>
);

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
        <DistressedApprovedStamp opacity={stampOpacity} />
        <div style={{ ...styles.grid, opacity: gridOpacity }}>
          {subjects.map((subject) => (
            <Subject key={subject} index={subject} frame={frame} />
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};
