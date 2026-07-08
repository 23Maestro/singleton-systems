import React from "react";
import {
  AbsoluteFill,
  cancelRender,
  continueRender,
  delayRender,
  Easing,
  interpolate,
  random,
  useCurrentFrame,
} from "remotion";

const typekitUrl = "https://use.typekit.net/gff5tng.css";
const fontStack = '"gotham", "Gotham", "Arial Black", "Helvetica Neue", Arial, sans-serif';

const words = [
  { text: "HOARDED", top: 96, left: 58, size: 178, rotate: -5, delay: 0 },
  { text: "HID", top: 372, left: 438, size: 236, rotate: 7, delay: 9 },
  { text: "RECIPES", top: 654, left: 86, size: 190, rotate: -2, delay: 18 },
];

const clamp = (value: number) => Math.max(0, Math.min(1, value));

function ManiaWord({
  text,
  top,
  left,
  size,
  rotate,
  delay,
}: {
  text: string;
  top: number;
  left: number;
  size: number;
  rotate: number;
  delay: number;
}) {
  const frame = useCurrentFrame();
  const entrance = interpolate(frame, [delay, delay + 6], [0, 1], {
    easing: Easing.out(Easing.back(1.8)),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const pulse = Math.sin((frame + delay) * 1.7) * 0.045;
  const snap = random(`${text}-${Math.floor(frame / 3)}`) > 0.8 ? 0.12 : 0;
  const jitterX = (random(`${text}-x-${frame}`) - 0.5) * 18;
  const jitterY = (random(`${text}-y-${frame}`) - 0.5) * 12;
  const opacity = clamp(entrance * (0.72 + random(`${text}-o-${Math.floor(frame / 2)}`) * 0.38));
  const scale = entrance * (1 + pulse + snap);

  return (
    <div
      style={{
        position: "absolute",
        top,
        left,
        fontFamily: fontStack,
        fontSize: size,
        fontWeight: 700,
        lineHeight: 0.84,
        letterSpacing: 0,
        color: "#101112",
        opacity,
        transform: `translate(${jitterX}px, ${jitterY}px) rotate(${rotate + jitterX * 0.12}deg) scale(${scale})`,
        transformOrigin: "50% 50%",
        textShadow: "9px 8px 0 rgba(128, 35, 22, 0.32)",
        mixBlendMode: "multiply",
      }}
    >
      {text}
    </div>
  );
}

export function FoodManiaTextLayer() {
  const frame = useCurrentFrame();
  const flash = random(`flash-${Math.floor(frame / 2)}`) > 0.86 ? 0.28 : 0;
  const wash = Math.sin(frame * 0.31) * 0.04;
  const [fontHandle] = React.useState(() => delayRender("Loading Gotham Typekit font"));

  React.useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = typekitUrl;
    document.head.appendChild(link);

    document.fonts
      .load(`700 120px "gotham"`)
      .then(() => document.fonts.ready)
      .then(() => continueRender(fontHandle))
      .catch((error) => cancelRender(error));

    return () => {
      link.remove();
    };
  }, [fontHandle]);

  return (
    <AbsoluteFill
      style={{
        background: "transparent",
        overflow: "hidden",
        opacity: 0.95 + wash,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `rgba(255, 255, 255, ${flash})`,
          mixBlendMode: "overlay",
        }}
      />
      {words.map((word) => (
        <ManiaWord key={word.text} {...word} />
      ))}
    </AbsoluteFill>
  );
}
