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
    ? "bg-[#1a2740]"
    : "bg-[#1e2d47]";

  return (
    <article
      className={`relative rounded-xl border border-white/10 p-6 shadow-[0_18px_40px_rgba(0,0,0,0.42)] transition-all duration-300 ease-out hover:-translate-y-1 hover:border-white/20 hover:shadow-[0_30px_70px_rgba(0,0,0,0.62)] ${bg} ${revealClassName}`}
    >
      {/* macOS window chrome */}
      <div className="mac-dots">
        <span></span>
        <span></span>
        <span></span>
      </div>

      <h4 className="text-xl font-bold text-white">{data.title}</h4>

      <ul className="mt-5 space-y-3 text-[15px] leading-relaxed text-zinc-200">
        {data.bullets.map((bullet, index) => (
          <li
            key={bullet}
            className="list-fade-up flex items-start gap-2.5 py-0.5"
            style={{ animationDelay: `${120 + (index * 60)}ms` }}
          >
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
    ? "card-fade-up is-visible motion-reduce:opacity-100"
    : "card-fade-up motion-reduce:opacity-100 motion-reduce:translate-y-0";

  const afterRevealClass = isVisible
    ? "card-fade-up card-fade-delay is-visible motion-reduce:opacity-100"
    : "card-fade-up card-fade-delay motion-reduce:opacity-100 motion-reduce:translate-y-0";

  return (
    <div ref={containerRef} className="premium-surface relative overflow-hidden rounded-2xl p-4 sm:p-8">
      <div aria-hidden className="pointer-events-none absolute -left-24 top-8 h-64 w-64 rounded-full bg-indigo-500/10 blur-[100px]" />
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
