"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "motion/react";
import { TextEffect } from "@/components/motion-primitives/text-effect";

type RevealTextProps = {
  children: string;
  as?: "p" | "h2" | "blockquote";
  className?: string;
  per?: "word" | "line";
};

// The server renders plain, visible text, so it reads fine with JavaScript off and for
// search engines. After hydration, text waits offscreen and plays the motion-primitives
// TextEffect when it scrolls into view. Reduced-motion visitors always get plain text.
export default function RevealText({ children, as = "p", className, per = "word" }: RevealTextProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -15% 0px" });
  const reduceMotion = useReducedMotion();
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  const Tag = as;

  if (!hydrated || reduceMotion) {
    return (
      <div ref={ref}>
        <Tag className={className}>{children}</Tag>
      </div>
    );
  }

  return (
    <div ref={ref}>
      {inView ? (
        <TextEffect as={as} per={per} preset="fade-in-blur" speedReveal={2} className={className}>
          {children}
        </TextEffect>
      ) : (
        <Tag className={`${className ?? ""} opacity-0`}>{children}</Tag>
      )}
    </div>
  );
}
