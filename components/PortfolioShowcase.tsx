"use client";

import { useMemo, useState } from "react";

export type PortfolioTab = {
  id: "before" | "build" | "ready";
  label: string;
  eyebrow: string;
  subtitle: string;
  gemClassName: string;
};

export type PortfolioShowcaseProps = {
  title: string;
  tabs: readonly PortfolioTab[];
};

type IconTone = "warning" | "process" | "ready";

const beforeRows = [
  ["lesson-final.mov", "??"],
  ["module 3 export.mp4", "??"],
  ["zoom_recording_12.mp4", "19h 12m"],
  ["part two revised.mp4", "??"],
  ["new upload final FINAL.mp4", "??"],
  ["random_clip_7.mov", "00:42"],
  ["screen-recording (1).mp4", "??"],
  ["lecture capture 05-12.mp4", "1:03:11"],
] as const;

const buildSteps = [
  "Confirm lesson order",
  "Rename files",
  "Generate ffmpeg export map",
  "Assemble without Premiere",
  "Mark upload-ready",
] as const;

const buildRows = [
  ["lesson-final.mov", "01_foundations.mp4", "Renamed"],
  ["module 3 export.mp4", "02_patient_intake.mp4", "Renamed"],
  ["zoom_recording_12.mp4", "03_case_review.mp4", "Processing"],
  ["part two revised.mp4", "04_exam_prep.mp4", "Queued"],
] as const;

const readyRows = [
  ["01", "Foundations", "18:42", "Ready"],
  ["02", "Patient Intake", "22:15", "Ready"],
  ["03", "Case Review", "31:08", "Ready"],
  ["04", "Exam Prep", "27:33", "Ready"],
  ["05", "Treatment Plan", "24:11", "Ready"],
  ["06", "Informed Consent", "19:05", "Ready"],
  ["07", "Documentation", "16:47", "Ready"],
  ["08", "Risk Assessment", "21:13", "Ready"],
  ["09", "Communication", "17:58", "Ready"],
  ["10", "Follow-Up Care", "23:44", "Ready"],
] as const;

function PortfolioIcon({ tone }: { tone: IconTone }) {
  const toneClass = {
    warning: "bg-[#ffc83d]",
    process: "bg-[#2383e2]",
    ready: "bg-[#25c266]",
  }[tone];

  return (
    <span className={`inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-black ${toneClass}`}>
      {tone === "warning" ? (
        <svg viewBox="0 0 36 36" className="h-11 w-11" fill="none" aria-hidden="true">
          <path d="M18 7.3 30 28.1H6L18 7.3Z" fill="#fff8d6" stroke="#050505" strokeWidth="2.2" strokeLinejoin="round" />
          <path d="M18 14.4v7.2" stroke="#050505" strokeWidth="2.4" strokeLinecap="round" />
          <circle cx="18" cy="25.1" r="1.45" fill="#050505" />
        </svg>
      ) : tone === "process" ? (
        <svg viewBox="0 0 36 36" className="h-11 w-11" fill="none" aria-hidden="true">
          <circle cx="18" cy="18" r="6.1" fill="#f8fbff" stroke="#050505" strokeWidth="2.1" />
          <path d="M18 6.4v4M18 25.6v4M6.4 18h4M25.6 18h4M9.8 9.8l2.8 2.8M23.4 23.4l2.8 2.8M26.2 9.8l-2.8 2.8M12.6 23.4l-2.8 2.8" stroke="#050505" strokeWidth="2" strokeLinecap="round" />
          <path d="m15.5 18.2 1.7 1.8 3.5-4" stroke="#2383e2" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : (
        <svg viewBox="0 0 36 36" className="h-11 w-11" fill="none" aria-hidden="true">
          <circle cx="18" cy="18" r="11.4" fill="#f4fff7" stroke="#050505" strokeWidth="2.2" />
          <path d="m12.8 18.4 3.6 3.8 7.2-8.1" stroke="#25c266" strokeWidth="3.1" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </span>
  );
}

function Chip({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "warning" | "blue" | "green" }) {
  const toneClass = {
    neutral: "border-neutral-200 bg-white text-neutral-700",
    warning: "border-amber-200 bg-amber-50 text-amber-900",
    blue: "border-blue-200 bg-blue-50 text-blue-900",
    green: "border-green-200 bg-green-50 text-green-900",
  }[tone];

  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold ${toneClass}`}>
      {children}
    </span>
  );
}

function SectionHeader({ tab, tone }: { tab: PortfolioTab; tone: IconTone }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
      <PortfolioIcon tone={tone} />
      <div className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-neutral-600">{tab.eyebrow}</p>
        <h4 className="mt-2 text-2xl font-bold tracking-[-0.025em] text-neutral-950 sm:text-3xl">{tab.label === "Before" ? "Unordered Source Folder" : tab.label === "Build Path" ? "Structured Processing Lane" : "Upload-Ready Library"}</h4>
        <p className="mt-3 max-w-3xl text-base font-semibold leading-relaxed text-neutral-600">{tab.subtitle}</p>
      </div>
    </div>
  );
}

function BeforeState({ tab }: { tab: PortfolioTab }) {
  return (
    <section className="bg-white p-5 sm:p-7 lg:p-8">
      <SectionHeader tab={tab} tone="warning" />
      <div className="mt-7 rounded-[1.35rem] border border-neutral-200 bg-[#f7f7f5] p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 pb-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-600">Folder</p>
            <p className="mt-1 text-lg font-bold text-neutral-950">Course_Videos (messy)</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Chip tone="warning">Order unclear</Chip>
            <Chip tone="warning">Long videos</Chip>
          </div>
        </div>
        <div className="mt-4 overflow-hidden rounded-2xl border border-neutral-200 bg-white">
          <div className="grid grid-cols-[minmax(0,1fr)_5.5rem] bg-neutral-950 px-4 py-3 text-xs font-bold uppercase tracking-[0.12em] text-white">
            <span>File name</span>
            <span className="text-right">Duration</span>
          </div>
          {beforeRows.map(([file, duration]) => (
            <div key={file} className="grid grid-cols-[minmax(0,1fr)_5.5rem] gap-3 border-t border-neutral-100 px-4 py-3 text-sm font-semibold text-neutral-800">
              <span className="min-w-0 break-words">{file}</span>
              <span className="text-right text-neutral-600">{duration}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-base font-bold text-amber-950">YouTube limit: split required</p>
          <p className="mt-1 text-sm font-semibold leading-relaxed text-amber-900">Long lessons must be broken apart before upload.</p>
        </div>
        <div className="mt-4 rounded-2xl border border-neutral-200 bg-white p-4">
          <p className="text-base font-bold text-neutral-950">Hard to ship manually</p>
          <p className="mt-1 text-sm font-semibold leading-relaxed text-neutral-600">Inconsistent names, unknown order, and very long files.</p>
        </div>
      </div>
    </section>
  );
}

function BuildState({ tab }: { tab: PortfolioTab }) {
  return (
    <section className="bg-white p-5 sm:p-7 lg:p-8">
      <SectionHeader tab={tab} tone="process" />
      <div className="mt-7 rounded-[1.35rem] border border-neutral-200 bg-[#f7f7f5] p-4 sm:p-5">
        <Chip tone="blue">AI helped convert the order list into an ffmpeg-ready export path</Chip>
        <div className="mt-5 space-y-3">
          {buildSteps.map((step, index) => (
            <div key={step} className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white px-4 py-3">
              <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-black bg-[#2383e2] text-sm font-black text-white">
                {index + 1}
              </span>
              <p className="min-w-0 flex-1 text-sm font-bold text-neutral-950 sm:text-base">{step}</p>
              <Chip tone="green">Complete</Chip>
            </div>
          ))}
        </div>
        <div className="mt-5 overflow-hidden rounded-2xl border border-neutral-200 bg-white">
          <div className="hidden grid-cols-[minmax(0,1fr)_minmax(0,1fr)_5.8rem] gap-3 bg-neutral-950 px-4 py-3 text-xs font-bold uppercase tracking-[0.12em] text-white sm:grid">
            <span>Source file</span>
            <span>Output file</span>
            <span>Status</span>
          </div>
          {buildRows.map(([source, output, status]) => (
            <div key={source} className="grid gap-3 border-t border-neutral-100 px-4 py-4 text-sm font-semibold text-neutral-800 first:border-t-0 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_5.8rem] sm:py-3">
              <div className="min-w-0">
                <p className="mb-1 text-[0.68rem] font-black uppercase tracking-[0.12em] text-neutral-400 sm:hidden">Source</p>
                <p className="min-w-0 break-words">{source}</p>
              </div>
              <div className="min-w-0">
                <p className="mb-1 text-[0.68rem] font-black uppercase tracking-[0.12em] text-neutral-400 sm:hidden">Output</p>
                <p className="min-w-0 break-words text-neutral-950">{output}</p>
              </div>
              <div>
                <p className="mb-1 text-[0.68rem] font-black uppercase tracking-[0.12em] text-neutral-400 sm:hidden">Status</p>
                <p className="text-neutral-600">{status}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {[
            ["Export path complete", "Ordered clips became one ready render"],
            ["Course library mapped and named", "Lesson order, names, and files aligned"],
            ["Premiere skipped", "ffmpeg handled the assembly path"],
          ].map(([headline, copy]) => (
            <div key={headline} className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
              <p className="text-base font-bold text-blue-950">{headline}</p>
              <p className="mt-1 text-sm font-semibold leading-relaxed text-blue-900/75">{copy}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ReadyState({ tab }: { tab: PortfolioTab }) {
  return (
    <section className="bg-white p-5 sm:p-7 lg:p-8">
      <SectionHeader tab={tab} tone="ready" />
      <div className="mt-7 rounded-[1.35rem] border border-neutral-200 bg-[#f7f7f5] p-4 sm:p-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-green-100 bg-green-50 p-4">
            <p className="text-xl font-black tracking-[-0.02em] text-green-950">200+ files organized</p>
            <p className="mt-2 text-sm font-semibold leading-relaxed text-green-900">Course libraries mapped, named, ordered, and validated.</p>
          </div>
          <div className="rounded-2xl border border-green-100 bg-green-50 p-4">
            <p className="text-xl font-black tracking-[-0.02em] text-green-950">Multiple courses ready</p>
            <p className="mt-2 text-sm font-semibold leading-relaxed text-green-900">Repeated migration runs prepared full courses for upload.</p>
          </div>
        </div>
        <div className="mt-5 overflow-hidden rounded-2xl border border-neutral-200 bg-white">
          <div className="hidden grid-cols-[3rem_minmax(0,1fr)_5.5rem_5rem] gap-2 bg-neutral-950 px-4 py-3 text-xs font-bold uppercase tracking-[0.1em] text-white sm:grid">
            <span>#</span>
            <span>Lesson Title</span>
            <span>Duration</span>
            <span>Status</span>
          </div>
          {readyRows.map(([number, lesson, duration, status]) => (
            <div key={number} className="grid gap-2 border-t border-neutral-100 px-4 py-4 text-sm font-semibold text-neutral-800 first:border-t-0 sm:grid-cols-[3rem_minmax(0,1fr)_5.5rem_5rem] sm:py-3">
              <span className="hidden font-black text-neutral-400 sm:block">{number}</span>
              <div className="min-w-0">
                <p className="text-[0.68rem] font-black uppercase tracking-[0.12em] text-neutral-400 sm:hidden">Lesson {number}</p>
                <p className="min-w-0 break-words text-base font-bold text-neutral-950 sm:text-sm">{lesson}</p>
              </div>
              <div className="flex items-center justify-between gap-4 sm:block">
                <span className="text-[0.68rem] font-black uppercase tracking-[0.12em] text-neutral-400 sm:hidden">Duration</span>
                <span className="text-neutral-600">{duration}</span>
              </div>
              <div className="flex items-center justify-between gap-4 sm:block">
                <span className="text-[0.68rem] font-black uppercase tracking-[0.12em] text-neutral-400 sm:hidden">Status</span>
                <span className="font-bold text-green-700">{status}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-5 flex min-h-36 flex-col items-center justify-center rounded-2xl border border-green-200 bg-green-50 p-5 text-center sm:p-7">
          <p className="text-base font-bold text-green-950">Ready for YouTube upload</p>
          <p className="mt-2 max-w-2xl text-sm font-semibold leading-relaxed text-green-900 sm:text-base">
            60+ hours of YouTube content uploaded across repeated course migrations.
          </p>
          <p className="mt-4 max-w-2xl text-lg font-black tracking-[-0.02em] text-green-950 sm:text-xl">
            Multiple full courses. Hundreds of files. In the right order.
          </p>
        </div>
      </div>
    </section>
  );
}

export default function PortfolioShowcase({ title, tabs }: PortfolioShowcaseProps) {
  const [activeTabId, setActiveTabId] = useState<PortfolioTab["id"]>("before");
  const summary =
    "200+ course video files became ordered upload paths with cleaner names, mapped course libraries, and ready-to-ship structure.";
  const activeTab = useMemo(
    () => tabs.find((tab) => tab.id === activeTabId) ?? tabs[0],
    [activeTabId, tabs],
  );

  return (
    <article className="overflow-hidden rounded-[2rem] border border-neutral-200/80 bg-[#f7f7f5] shadow-[0_18px_52px_rgba(15,23,42,0.08)]">
      <div className="p-5 sm:p-7 lg:p-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-start">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-neutral-600">Portfolio System</p>
            <h3 className="mt-3 text-3xl font-semibold leading-tight tracking-[-0.045em] text-neutral-950 sm:text-4xl">
              {title}
            </h3>
            <p className="mt-3 max-w-3xl text-base font-medium leading-relaxed text-neutral-600 sm:text-lg">
              {summary}
            </p>
          </div>

          <div
            className="grid grid-cols-3 gap-2 rounded-[1.45rem] border border-black/5 bg-neutral-200/60 p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] sm:min-w-[25rem]"
            role="tablist"
            aria-label="Course video migration portfolio states"
          >
            {tabs.map((tab) => {
              const isActive = tab.id === activeTab.id;

              return (
                <button
                  key={tab.id}
                  id={`portfolio-tab-${tab.id}`}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-controls="portfolio-panel"
                  onClick={() => setActiveTabId(tab.id)}
                  className={`flex min-h-11 items-center justify-center gap-1.5 rounded-[1rem] px-2 text-xs font-semibold transition sm:gap-2 sm:px-3 sm:text-sm ${
                    isActive
                      ? "bg-white text-neutral-950 shadow-[0_9px_20px_rgba(15,23,42,0.13)] ring-1 ring-black/5"
                      : "text-neutral-600 hover:bg-white/55 hover:text-neutral-900"
                  }`}
                >
                  <span className={`h-3 w-3 rounded-full ${tab.gemClassName}`} aria-hidden="true" />
                  <span className="whitespace-nowrap">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div
        id="portfolio-panel"
        role="tabpanel"
        aria-labelledby={`portfolio-tab-${activeTab.id}`}
        className="border-t border-neutral-200/80"
      >
        {activeTab.id === "before" ? (
          <BeforeState tab={activeTab} />
        ) : activeTab.id === "build" ? (
          <BuildState tab={activeTab} />
        ) : (
          <ReadyState tab={activeTab} />
        )}
      </div>
    </article>
  );
}
