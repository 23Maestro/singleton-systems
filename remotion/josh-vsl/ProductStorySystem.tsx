import {loadFont as loadRoboto} from "@remotion/google-fonts/Roboto";
import {loadFont as loadRobotoMono} from "@remotion/google-fonts/RobotoMono";
import type {CSSProperties, ReactNode} from "react";
import {AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from "remotion";

export const COLORS = {
  bg: "#070809",
  panel: "rgba(14,16,18,.97)",
  panelRaised: "#121518",
  line: "rgba(255,255,255,.10)",
  lineStrong: "rgba(255,255,255,.18)",
  red: "#E01F26",
  green: "#22C55E",
  white: "#FFFFFF",
  body: "rgba(255,255,255,.88)",
  dim: "rgba(255,255,255,.66)",
} as const;

export const {fontFamily: ROBOTO} = loadRoboto("normal", {
  weights: ["400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
});

export const {fontFamily: MONO} = loadRobotoMono("normal", {
  weights: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

export const clamp = (frame: number, input: number[], output: number[]) =>
  interpolate(frame, input, output, {extrapolateLeft: "clamp", extrapolateRight: "clamp"});

export const enter = (frame: number, fps: number, delay = 0) =>
  spring({
    frame: frame - delay,
    fps,
    config: {damping: 19, stiffness: 135, mass: 0.7},
    durationInFrames: 34,
  });

export const MetaIcon = ({size = 40}: {size?: number}) => (
  <Img src={staticFile("remotion-assets/meta.svg")} style={{width: size, height: size, objectFit: "contain"}} alt="Meta"/>
);

export const Check = ({size = 28, color = COLORS.green}: {size?: number; color?: string}) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <circle cx="16" cy="16" r="13" fill={`${color}1F`} stroke={color} strokeWidth="2"/>
    <path d="m9.5 16.4 4.1 4.1 8.9-9" stroke={color} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const XMark = ({size = 28}: {size?: number}) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <circle cx="16" cy="16" r="13" fill="rgba(224,31,38,.12)" stroke={COLORS.red} strokeWidth="2"/>
    <path d="m11 11 10 10m0-10L11 21" stroke={COLORS.red} strokeWidth="2.6" strokeLinecap="round"/>
  </svg>
);

export const ProductShell = ({
  path,
  status,
  children,
  footerLeft,
  footerRight,
}: {
  path: string;
  status: string;
  children: ReactNode;
  footerLeft: string;
  footerRight: string;
}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const shell = enter(frame, fps);
  const exit = clamp(frame, [durationInFrames - 12, durationInFrames - 1], [1, 0]);
  const ambient = 1 + Math.sin(frame / 34) * 0.035;
  return (
    <AbsoluteFill style={{background: COLORS.bg, color: COLORS.white, fontFamily: ROBOTO, opacity: exit}}>
      <div style={{position: "absolute", inset: "54px 64px", overflow: "hidden", borderRadius: 30, border: `1px solid ${COLORS.line}`, background: COLORS.panel, boxShadow: "0 34px 100px rgba(0,0,0,.58), inset 0 1px 0 rgba(255,255,255,.06)", opacity: shell, transform: `translateY(${clamp(shell, [0, 1], [24, 0])}px) scale(${clamp(shell, [0, 1], [.98, 1])})`}}>
        <div style={{position: "absolute", inset: 0, background: "linear-gradient(rgba(255,255,255,.022) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.022) 1px, transparent 1px)", backgroundSize: "42px 42px"}}/>
        <div style={{position: "absolute", left: -170, top: -190, width: 620, height: 620, borderRadius: "50%", background: "rgba(224,31,38,.14)", filter: "blur(92px)", transform: `scale(${ambient})`, opacity: .72}}/>
        <div style={{position: "absolute", left: 0, right: 0, top: 0, height: 2, background: "linear-gradient(90deg, transparent, rgba(224,31,38,.56), transparent)", opacity: .55}}/>
        <header style={{position: "relative", height: 76, padding: "0 30px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${COLORS.line}`, background: "rgba(255,255,255,.018)"}}>
          <div style={{display: "flex", alignItems: "center", gap: 13}}><span style={{width: 11, height: 11, borderRadius: 99, background: COLORS.red, boxShadow: "0 0 18px rgba(224,31,38,.65)"}}/><span style={{fontFamily: MONO, fontSize: 18, fontWeight: 600, letterSpacing: ".03em"}}>SELLER SYSTEM&nbsp; / &nbsp;{path.toUpperCase()}</span></div>
          <span style={{fontFamily: MONO, fontSize: 17, color: COLORS.body}}>{status}</span>
        </header>
        <main style={{position: "absolute", left: 0, right: 0, top: 76, bottom: 68}}>{children}</main>
        <footer style={{position: "absolute", left: 30, right: 30, bottom: 0, height: 68, borderTop: `1px solid ${COLORS.line}`, display: "flex", alignItems: "center", justifyContent: "space-between"}}>
          <span style={{color: COLORS.red, fontSize: 17, fontWeight: 800, letterSpacing: ".15em"}}>{footerLeft}</span>
          <span style={{fontSize: 22, fontWeight: 650, color: COLORS.body}}>{footerRight}</span>
        </footer>
      </div>
    </AbsoluteFill>
  );
};

export const Panel = ({children, style}: {children: ReactNode; style?: CSSProperties}) => (
  <div style={{border: `1px solid ${COLORS.line}`, borderRadius: 20, background: "rgba(0,0,0,.30)", boxShadow: "0 16px 38px rgba(0,0,0,.16), inset 0 1px 0 rgba(255,255,255,.055), inset 0 -1px 0 rgba(0,0,0,.30)", ...style}}>{children}</div>
);

export const Eyebrow = ({children, tone = "red"}: {children: ReactNode; tone?: "red" | "green" | "dim"}) => (
  <div style={{fontFamily: MONO, fontSize: 17, lineHeight: 1, fontWeight: 700, letterSpacing: ".13em", color: tone === "green" ? COLORS.green : tone === "dim" ? COLORS.body : COLORS.red}}>{children}</div>
);
