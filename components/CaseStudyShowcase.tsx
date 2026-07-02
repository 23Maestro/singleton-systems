"use client";

import { useMemo, useState } from "react";

export type CaseStudyPane = {
  id: "before" | "after" | "portfolio";
  label: string;
  dotClassName: string;
  eyebrow: string;
  title: string;
  body: string;
  bullets: readonly string[];
  signals: readonly { label: string; value: string; tone: "red" | "amber" | "green" | "blue" | "violet" }[];
};

export type CaseStudyShowcaseProps = {
  name: string;
  context: string;
  outcome: string;
  accentClassName: string;
  panes: readonly CaseStudyPane[];
};

const toneClasses = {
  red: "bg-neutral-50 text-neutral-800 ring-neutral-200",
  amber: "bg-neutral-50 text-neutral-800 ring-neutral-200",
  green: "bg-neutral-50 text-neutral-800 ring-neutral-200",
  blue: "bg-neutral-50 text-neutral-800 ring-neutral-200",
  violet: "bg-neutral-50 text-neutral-800 ring-neutral-200",
} as const;

const toneDotClasses = {
  red: "bg-rose-400",
  amber: "bg-amber-400",
  green: "bg-emerald-400",
  blue: "bg-sky-400",
  violet: "bg-violet-400",
} as const;

export default function CaseStudyShowcase({
  name,
  context,
  outcome,
  accentClassName,
  panes,
}: CaseStudyShowcaseProps) {
  const [activePaneId, setActivePaneId] = useState<CaseStudyPane["id"]>("before");
  const activePane = useMemo(
    () => panes.find((pane) => pane.id === activePaneId) ?? panes[0],
    [activePaneId, panes],
  );

  return (
    <article className="overflow-hidden rounded-[1.5rem] border border-neutral-200/80 bg-white/90 shadow-[0_14px_36px_rgba(15,23,42,0.065)] backdrop-blur">
      <div className="grid gap-0 lg:grid-cols-[0.92fr_1.08fr]">
        <div className="border-b border-neutral-200 p-5 sm:p-6 lg:border-b-0 lg:border-r">
          <div className="flex items-center gap-3">
            <span className={`h-2.5 w-2.5 rounded-full ${accentClassName}`} />
            <p className="text-xs font-semibold text-neutral-500">Case Study</p>
          </div>
          <h3 className="mt-4 text-2xl font-semibold leading-tight tracking-[-0.04em] text-neutral-950 sm:text-3xl">
            {name}
          </h3>
          <p className="mt-3 text-sm font-medium leading-relaxed text-neutral-600 sm:text-base">
            {context}
          </p>
          <div className="mt-6 rounded-[1.15rem] border border-neutral-200/80 bg-[#f8f8f7] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-500">Outcome</p>
            <p className="mt-2 text-xl font-semibold leading-tight tracking-[-0.04em] text-neutral-950 sm:text-2xl">
              {outcome}
            </p>
          </div>
        </div>

        <div className="bg-[#f5f5f5] p-2.5 sm:p-3">
          <div className="grid grid-cols-3 gap-1.5 rounded-[1.15rem] border border-white/70 bg-white/45 p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.75),0_8px_22px_rgba(15,23,42,0.04)] backdrop-blur-md">
            {panes.map((pane) => {
              const isActive = pane.id === activePane.id;

              return (
                <button
                  key={pane.id}
                  type="button"
                  onClick={() => setActivePaneId(pane.id)}
                  className={`flex min-h-10 items-center justify-center gap-2 rounded-[0.85rem] px-3 text-xs font-medium transition ${
                    isActive
                      ? "bg-white/95 text-neutral-950 shadow-[0_7px_16px_rgba(15,23,42,0.08)] ring-1 ring-black/5"
                      : "text-neutral-500 hover:bg-white/55 hover:text-neutral-900"
                  }`}
                  aria-pressed={isActive}
                >
                  <span className={`h-2 w-2 rounded-full ${pane.dotClassName}`} />
                  <span>{pane.label}</span>
                </button>
              );
            })}
          </div>

          <div className="relative mt-2.5 overflow-hidden rounded-[1.15rem] border border-neutral-200/80 bg-white/92 p-5 shadow-[0_8px_24px_rgba(15,23,42,0.045)] backdrop-blur sm:p-6">
            <div className="relative">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
                {activePane.eyebrow}
              </p>
              <h4 className="mt-3 text-2xl font-semibold leading-tight tracking-[-0.05em] text-neutral-950 sm:text-3xl">
                {activePane.title}
              </h4>
              <p className="mt-3 max-w-2xl text-sm font-medium leading-relaxed text-neutral-600 sm:text-base">
                {activePane.body}
              </p>

              <ul className="mt-5 grid gap-2.5 sm:grid-cols-2">
                {activePane.bullets.map((bullet) => (
                  <li key={bullet} className="rounded-[1rem] border border-neutral-200/80 bg-white/65 p-3 text-xs font-medium leading-relaxed text-neutral-700 sm:text-sm">
                    {bullet}
                  </li>
                ))}
              </ul>

              <div className="mt-5 grid gap-2 sm:grid-cols-3">
                {activePane.signals.map((signal) => (
                  <div
                    key={`${signal.label}-${signal.value}`}
                    className={`rounded-[1rem] px-3 py-2.5 text-xs font-semibold ring-1 sm:text-sm ${toneClasses[signal.tone]}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${toneDotClasses[signal.tone]}`} />
                      <p className="text-[11px] uppercase tracking-[0.14em] text-neutral-500">{signal.label}</p>
                    </div>
                    <p className="mt-2 text-neutral-900">{signal.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
