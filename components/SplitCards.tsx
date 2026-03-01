"use client";

import { useEffect, useRef, useState } from "react";
import MetricsStrip from "./MetricsStrip";

export type SplitCardData = {
  title: string;
  label: string;
  bullets: readonly string[];
  indicators: readonly { icon: string; label: string; value: string; color: string }[];
};

export type SplitCardsProps = {
  before: SplitCardData;
  after: SplitCardData;
  metrics: readonly [string, string, string];
};

function DetailCard({
  data,
  variant,
  revealClassName,
}: {
  data: SplitCardData;
  variant: "before" | "after";
  revealClassName: string;
}) {
  const bg = variant === "before"
    ? "bg-[#1c2333]/90"
    : "bg-[#1e2a3d]/90";

  return (
    <article
      className={`relative rounded-xl border border-white/10 p-6 backdrop-blur-sm transition-all duration-500 ease-out hover:-translate-y-1 hover:border-white/20 ${bg} ${revealClassName}`}
    >
      {/* macOS window chrome */}
      <div className="mac-dots">
        <span></span>
        <span></span>
        <span></span>
      </div>

      <h4 className="text-xl font-bold text-zinc-50">{data.title}</h4>

      <ul className="mt-5 space-y-3 text-[15px] leading-relaxed text-zinc-200">
        {data.bullets.map((bullet) => (
          <li key={bullet} className="flex items-start gap-2.5 py-0.5">
            <span aria-hidden className="mt-1.5 text-indigo-400">•</span>
            <span>{bullet}</span>
          </li>
        ))}
      </ul>

      {/* separator */}
      <div className="my-5 border-t border-zinc-600/40"></div>

      {/* arrow */}
      <p className="mb-4 text-center text-lg text-indigo-400">↓</p>

      {/* status indicators */}
      <div className="space-y-2.5">
        {data.indicators.map((ind) => (
          <div key={ind.label} className="status-row">
            <span className="icon">{ind.icon}</span>
            <span className="text-zinc-300">{ind.label}:</span>
            <span className={ind.color}>{ind.value}</span>
          </div>
        ))}
      </div>
    </article>
  );
}

export default function SplitCards({ before, after, metrics }: SplitCardsProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25, rootMargin: "0px 0px -10% 0px" },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  const beforeRevealClass = isVisible
    ? "opacity-100 translate-x-0 motion-reduce:opacity-100"
    : "opacity-0 -translate-x-6 motion-reduce:opacity-100 motion-reduce:translate-x-0";

  const afterRevealClass = isVisible
    ? "opacity-100 translate-x-0 delay-100 motion-reduce:opacity-100"
    : "opacity-0 translate-x-6 motion-reduce:opacity-100 motion-reduce:translate-x-0";

  return (
    <div ref={containerRef} className="case-gradient rounded-2xl p-4 sm:p-8">
      <div className="relative z-10 grid gap-5 lg:grid-cols-2">
        <DetailCard data={before} variant="before" revealClassName={beforeRevealClass} />
        <DetailCard data={after} variant="after" revealClassName={afterRevealClass} />
      </div>
      <div className="relative z-10">
        <MetricsStrip metrics={metrics} />
      </div>
    </div>
  );
}
