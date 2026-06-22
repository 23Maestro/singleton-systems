"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

const words = [
  {
    text: "vanishes",
    className: "from-[#23364f] via-[#3f6c93] to-[#152033]",
    glow: "rgba(63,108,147,0.075)",
    exitKind: "lift",
  },
  {
    text: "dissolves",
    className: "from-[#8f2f1f] via-[#c76532] to-[#4a1d17]",
    glow: "rgba(199,101,50,0.075)",
    exitKind: "fade",
  },
  {
    text: "unravels",
    className: "from-[#3b315e] via-[#6d5a9c] to-[#211b34]",
    glow: "rgba(109,90,156,0.075)",
    exitKind: "unravel",
  },
] as const;

export default function RotatingHeroHeadline() {
  const [activeIndex, setActiveIndex] = useState(0);
  const shouldReduceMotion = useReducedMotion();
  const activeWord = words[activeIndex];

  useEffect(() => {
    if (shouldReduceMotion) return;

    const interval = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % words.length);
    }, 2600);

    return () => window.clearInterval(interval);
  }, [shouldReduceMotion]);

  if (shouldReduceMotion) {
    return (
      <h1 className="mx-auto w-full max-w-[22rem] text-center text-[2.34rem] font-semibold leading-[1.05] tracking-[-0.052em] sm:max-w-[24rem] lg:max-w-2xl lg:text-[3.5rem] [@media_(orientation:landscape)_and_(max-height:500px)]:max-w-[21rem] [@media_(orientation:landscape)_and_(max-height:500px)]:text-[2.04rem]">
        Time disappears before the edit ships.
      </h1>
    );
  }

  return (
    <h1
      className="mx-auto w-full max-w-[22rem] text-center text-[2.34rem] font-semibold leading-[1.05] tracking-[-0.052em] sm:max-w-[24rem] lg:max-w-2xl lg:text-[3.5rem] [@media_(orientation:landscape)_and_(max-height:500px)]:max-w-[21rem] [@media_(orientation:landscape)_and_(max-height:500px)]:text-[2.04rem]"
      aria-label="Time disappears before the edit ships."
    >
      <motion.span
        aria-hidden="true"
        className="inline-grid grid-cols-[max-content_9.2ch] items-baseline gap-x-[0.28em] whitespace-nowrap text-left"
        style={{ position: "relative", left: "0.7em" }}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        <span>Time</span>
        <span className="relative inline-block align-baseline">
          <span className="invisible inline-block pr-[0.16em] font-semibold tracking-[-0.025em]" aria-hidden="true">
            vanishes
          </span>
          <span className="pointer-events-none absolute left-0 top-0 h-[1.48em] w-full overflow-hidden" aria-hidden="true">
            <AnimatePresence mode="wait">
              <motion.span
                key={activeWord.text}
                className={`absolute left-0 top-0 inline-block bg-gradient-to-r bg-clip-text pr-[0.16em] font-semibold tracking-[-0.025em] text-transparent ${activeWord.className}`}
                style={{ textShadow: `0 6px 18px ${activeWord.glow}`, willChange: "opacity, filter, clip-path, transform" }}
                initial={{ clipPath: "inset(0 100% 0 0)", opacity: 0.72, filter: "blur(1.2px)" }}
                animate={{ clipPath: "inset(0 0% 0 0)", opacity: 1, x: 0, scaleX: 1, filter: "blur(0px)" }}
                exit={
                  activeWord.exitKind === "lift"
                    ? {
                        clipPath: "inset(0 0 0 100%)",
                        opacity: 0,
                        filter: "blur(2.4px)",
                        transition: { duration: 0.5, ease: [0.55, 0, 1, 0.45] },
                      }
                    : activeWord.exitKind === "unravel"
                      ? {
                          opacity: [1, 0.92, 0.28, 0],
                          x: [0, 0.5, 2, 4],
                          scaleX: [1, 1.006, 1.018, 1.03],
                          letterSpacing: ["-0.025em", "-0.018em", "0.004em", "0.018em"],
                          filter: ["blur(0px)", "blur(0.35px)", "blur(1.2px)", "blur(2.4px)"],
                          transformOrigin: "left center",
                          transition: { duration: 0.39, ease: [0.55, 0, 1, 0.45], times: [0, 0.35, 0.76, 1] },
                        }
                      : {
                          opacity: [1, 0.82, 0.36, 0],
                          scale: [1, 1.004, 0.998, 0.992],
                          filter: ["blur(0px)", "blur(0.8px) contrast(1.08)", "blur(2.4px) contrast(1.22)", "blur(4.8px) contrast(1.35)"],
                          transition: { duration: 0.52, ease: [0.55, 0, 1, 0.45], times: [0, 0.28, 0.72, 1] },
                        }
                }
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              >
                {activeWord.text}
              </motion.span>
            </AnimatePresence>
          </span>
        </span>
      </motion.span>
      <motion.span
        aria-hidden="true"
        className="block text-center"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        before the edit
      </motion.span>
      <motion.span
        aria-hidden="true"
        className="block text-center"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.22, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        ships.
      </motion.span>
    </h1>
  );
}
