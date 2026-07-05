"use client";

import Image from "next/image";
import Script from "next/script";
import { createElement } from "react";
import type { CSSProperties, ReactNode } from "react";

export type PortfolioTabTarget = "System" | "Evidence" | "AI Specialist" | "Resume" | "Source Map";
export type PortfolioSlice = "Top" | "Bottom";
export type PortfolioVisualType = "Cards" | "Data Table" | "Flowchart" | "Review Panel" | "Diff View" | "Code Map";
export type SliceElementKind = "section" | "card" | "row" | "detail" | "action";

export type SliceElement = {
  id: string;
  label: string;
  eyebrow: string;
  body: string;
  before: string;
  after: string;
  route: string;
  kind: SliceElementKind;
};

export type EvidenceItem = {
  key: string;
  title: string;
  summary: string;
  problem: string;
  solution: string;
  result: string;
};

export type ProcessItem = {
  title: string;
  problem: string;
  solution: string;
  result: string;
};

export type SourceRouteItem = {
  key: string;
  title: string;
  source: string;
  inspect: string;
  result: string;
  href: string;
  previewImageSrc: string;
  previewImageAlt: string;
  previewImageWidth: number;
  previewImageHeight: number;
  previewFit?: "cover" | "contain";
  previewPosition?: "center" | "top" | "left-top";
  previewFrame?: "diagram" | "code" | "product";
  likec4ViewId?: string;
};

const likec4EmbedStyle: CSSProperties = {
  display: "block",
  width: "100%",
  height: "100%",
  minHeight: "100%",
};

export const tabTargets: PortfolioTabTarget[] = ["System", "Evidence", "AI Specialist", "Resume", "Source Map"];
export const visualTypes: PortfolioVisualType[] = ["Cards", "Data Table", "Flowchart", "Review Panel", "Diff View", "Code Map"];

export const sliceOptionsByTab: Record<PortfolioTabTarget, PortfolioSlice[]> = {
  System: ["Top"],
  Evidence: ["Top", "Bottom"],
  "AI Specialist": ["Top", "Bottom"],
  Resume: ["Bottom"],
  "Source Map": ["Top", "Bottom"],
};

export const defaultSliceByTab: Record<PortfolioTabTarget, PortfolioSlice> = {
  System: "Top",
  Evidence: "Top",
  "AI Specialist": "Top",
  Resume: "Bottom",
  "Source Map": "Top",
};

export const sliceTitles: Record<PortfolioTabTarget, Record<PortfolioSlice, { title: string; lead: string; route: string }>> = {
  System: {
    Top: {
      title: "System view cards",
      lead: "The three portfolio system cards above the divider: command surface, adapter, and reporting layer.",
      route: "components/AIWorkflowPortfolioCommand.tsx:SystemPanel > SystemTopSlice",
    },
    Bottom: {
      title: "System workflow panel",
      lead: "Locked out in the lab. System focuses on the top cards only.",
      route: "components/AIWorkflowPortfolioCommand.tsx:SystemPanel",
    },
  },
  Evidence: {
    Top: {
      title: "Evidence diff surface",
      lead: "The evidence list and git-diff readback area above the reporting divider.",
      route: "components/AIWorkflowPortfolioCommand.tsx:EvidencePanel > EvidenceTopSlice",
    },
    Bottom: {
      title: "Reporting truth layer",
      lead: "The Supabase reporting table below the divider.",
      route: "components/AIWorkflowPortfolioCommand.tsx:EvidencePanel > EvidenceBottomSlice",
    },
  },
  "AI Specialist": {
    Top: {
      title: "AI Specialist cards",
      lead: "The data preparation, output review, and implementation support cards above the divider.",
      route: "components/AIWorkflowPortfolioCommand.tsx:FitPanel > AISpecialistTopSlice",
    },
    Bottom: {
      title: "Review-first implementation loop",
      lead: "The Gather, Classify, Draft, Review, Verify loop below the divider.",
      route: "components/AIWorkflowPortfolioCommand.tsx:FitPanel > AISpecialistBottomSlice",
    },
  },
  Resume: {
    Top: {
      title: "Resume top cards",
      lead: "Locked out in the lab. Resume focuses on the verification stack only.",
      route: "components/AIWorkflowPortfolioCommand.tsx:ResumePanel",
    },
    Bottom: {
      title: "Resume verification stack",
      lead: "The selectable resume verification stack below the divider.",
      route: "components/AIWorkflowPortfolioCommand.tsx:ResumePanel > ResumeBottomSlice",
    },
  },
  "Source Map": {
    Top: {
      title: "Source map cards",
      lead: "The source cards above the divider.",
      route: "components/AIWorkflowPortfolioCommand.tsx:ProofMapPanel > SourceMapTopSlice",
    },
    Bottom: {
      title: "Review route panel",
      lead: "The route list and readback panel below the divider.",
      route: "components/AIWorkflowPortfolioCommand.tsx:ProofMapPanel > SourceMapBottomSlice",
    },
  },
};

export const evidenceData: EvidenceItem[] = [
  {
    key: "commands",
    title: "Commands are buttons",
    summary: "Repeated dashboard actions start from Raycast, while domain modules keep the workflow meaning.",
    problem: "Operators had to remember where the right athlete, task, message, and status lived inside the dashboard.",
    solution: "Raycast became the command surface. It starts the workflow, then domain modules decide what the action means.",
    result: "Repeated clicks became a smaller set of reviewable actions: Scout Prep, Set Meetings, Client Messages, and video workflow commands.",
  },
  {
    key: "adapter",
    title: "Legacy adapter",
    summary: "Browser form behavior becomes stable local API calls with repeatable request shapes.",
    problem: "The source system worked through browser forms and session-bound dashboard behavior.",
    solution: "FastAPI translated that behavior into stable local calls with normalized IDs, payload handling, and readback checks.",
    result: "The workflow could be tested and repeated without rebuilding the same form mutation by hand.",
  },
  {
    key: "supabase",
    title: "Supabase ownership",
    summary: "appointments, lifecycle_events, and call_log carry the durable workflow facts.",
    problem: "Useful facts were mixed with UI state, support caches, and one-off reporting projections.",
    solution: "appointments, lifecycle_events, and call_log became the durable places for meeting, stage, and reporting truth.",
    result: "Prospect Web and audits could read the same reporting facts instead of trusting whatever a screen happened to show.",
  },
  {
    key: "audit",
    title: "Audit before cleanup",
    summary: "Parity checks prove the reporting shape before cleanup changes what counts as truth.",
    problem: "Cleanup could break reporting if old projections were deleted before the new shape was proven.",
    solution: "Parity tests checked the projected call_log shape and read-only behavior before cleanup became real.",
    result: "The repo shows cleanup as a verified migration path, not a blind delete.",
  },
  {
    key: "repo",
    title: "Public repo",
    summary: "400+ commits show one sustained workflow system, not a throwaway sample.",
    problem: "A resume line alone cannot prove sustained system thinking.",
    solution: "The public repo shows one workflow system built through 400+ commits, docs, tests, and app surfaces.",
    result: "Reviewers can inspect the work instead of taking the claim on faith.",
  },
  {
    key: "web",
    title: "Prospect Web",
    summary: "Mobile and reporting surfaces let cleaned data support review outside Raycast.",
    problem: "Raycast handled operator action, but reporting and mobile review needed a separate readable surface.",
    solution: "Prospect Web added mobile command views, call tracking, visual maps, and reporting screens on top of cleaned data.",
    result: "The workflow became reviewable outside the desktop command window.",
  },
  {
    key: "debug",
    title: "Debug template",
    summary: "Legacy repair work is documented as a repeatable verification checklist.",
    problem: "Legacy dashboard repairs can turn into one-off troubleshooting with no repeatable path.",
    solution: "The debug template captured request shape, IDs, browser constraints, and verification steps.",
    result: "Repair work became easier to repeat, review, and sanitize for public reference.",
  },
  {
    key: "tests",
    title: "Tests",
    summary: "Source-of-truth checks prevent UI-local fixes from becoming business truth.",
    problem: "UI-local fixes can look correct while corrupting the source-of-truth contract.",
    solution: "Source-of-truth and parity checks lock the expected behavior around lifecycle, call-log, and cleanup paths.",
    result: "Changes have verification before they become business truth.",
  },
];

export const processData: ProcessItem[] = [
  {
    title: "Gather",
    problem: "The workflow starts as scattered dashboard steps, notes, and operator memory.",
    solution: "Collect the current command path, repo evidence, and source-system behavior before changing anything.",
    result: "The AI work starts from the real workflow, not from a generic automation idea.",
  },
  {
    title: "Classify",
    problem: "Everything looks connected until ownership is named.",
    solution: "Separate command UI, lifecycle truth, support cache, adapter behavior, and reporting facts.",
    result: "Each change has a clear owner and less chance of drifting into the wrong table or helper.",
  },
  {
    title: "Draft",
    problem: "AI output can be fast but vague if it is not tied to the system shape.",
    solution: "Use AI to draft prompts, mappings, message support, and implementation options against the classified workflow.",
    result: "Drafts become useful working material instead of loose copy.",
  },
  {
    title: "Review",
    problem: "A generated answer can sound right while missing operator context.",
    solution: "Keep human review before mutation, sending, source-of-truth writes, or public-facing reference.",
    result: "The workflow stays responsible and business-relevant.",
  },
  {
    title: "Verify",
    problem: "A screen working once is not the same as a system being correct.",
    solution: "Use parity checks, readback, UI tests, or source review before treating the change as real.",
    result: "The final claim has evidence behind it.",
  },
];

export const resumeData = [
  ["Lead evidence", "Prospect ID", "Built a workflow system connecting Raycast commands, FastAPI middleware, Supabase reporting tables, web views, audit scripts, and AI-assisted operator workflows."],
  ["Throughput evidence", "NurseHub", "Restructured 60+ hours of course content, processed 180-200 lesson assets, and used deterministic FFmpeg workflows to increase assembly throughput 2-3x."],
  ["Education", "Stetson + SPC", "Bachelor of Communications, Stetson University; 1.5 years Computer Programming / Information Technology coursework, St. Petersburg College."],
  ["Role match", "AI Specialist", "Hands-on AI workflow specialist focused on legacy systems, data organization, automation support, documentation, and practical implementation."],
] as const;

const resumeTimelineData = [
  {
    year: "2012",
    title: "Stetson University",
    meta: "Started at Stetson",
    body: "Started at Stetson University.",
  },
  {
    year: "2016",
    title: "Stetson University",
    meta: "Graduated",
    body: "Graduated from Stetson University.",
  },
  {
    year: "2021",
    title: "St. Petersburg College",
    meta: "Programming / IT",
    body: "Started computer programming and information technology coursework.",
  },
  {
    year: "2024",
    title: "Production systems",
    meta: "NurseHub + Prospect ID",
    body: "Scaled repeatable video, course, and workflow delivery systems.",
  },
  {
    year: "2026",
    title: "AI Specialist fit",
    meta: "Data prep / review / support",
    body: "Positioned practical AI workflow work around preparation, review, and implementation support.",
  },
] as const;

export const sourceRouteData: SourceRouteItem[] = [
  {
    key: "readme",
    title: "Command UI",
    source: "README",
    inspect: "Raycast commands, workflow entry points, and how operator actions start.",
    result: "Shows that commands were built as a practical control surface, not just described in prose.",
    href: "https://github.com/23Maestro/prospect-pipeline/blob/main/README.md",
    previewImageSrc: "/portfolio/source-map/readme-c4.png",
    previewImageAlt: "README C4 architecture map",
    previewImageWidth: 1200,
    previewImageHeight: 760,
    previewFit: "contain",
    previewPosition: "center",
    previewFrame: "diagram",
    likec4ViewId: "ai_workflow_readme_map",
  },
  {
    key: "map",
    title: "System map",
    source: "Architecture",
    inspect: "Buckets for meetings, pre-meeting tasks, client communication, lifecycle truth, outcomes, and contacts.",
    result: "Shows where workflow meaning lives before code or cleanup changes are made.",
    href: "https://github.com/23Maestro/prospect-pipeline/blob/main/docs/architecture/scouting-coordinator-system-map.md",
    previewImageSrc: "/portfolio/source-map/system-map-c4.png",
    previewImageAlt: "Scouting coordinator C4 bucket map",
    previewImageWidth: 1200,
    previewImageHeight: 760,
    previewFit: "contain",
    previewPosition: "center",
    previewFrame: "diagram",
    likec4ViewId: "scouting_coordinator_bucket_map",
  },
  {
    key: "supabase",
    title: "Source-of-truth",
    source: "Supabase contract",
    inspect: "Allowed writers for appointments, lifecycle_events, call_log, and confirmation support cache.",
    result: "Shows how durable reporting truth was separated from support state.",
    href: "https://github.com/23Maestro/prospect-pipeline/blob/main/docs/architecture/scout-prep-supabase-source-of-truth.md",
    previewImageSrc: "/portfolio/source-map/supabase-contract.png",
    previewImageAlt: "Supabase contract code artifact",
    previewImageWidth: 3680,
    previewImageHeight: 3656,
    previewFit: "contain",
    previewPosition: "top",
    previewFrame: "code",
  },
  {
    key: "adapter",
    title: "Legacy adapter",
    source: "API template",
    inspect: "Browser-compatible payload shape, legacy IDs, request constraints, and readback.",
    result: "Shows the old dashboard workflow becoming repeatable adapter work.",
    href: "https://github.com/23Maestro/prospect-pipeline/blob/main/docs/api-specs/legacy-assignment-debug-template.md",
    previewImageSrc: "/portfolio/source-map/legacy-api.svg",
    previewImageAlt: "Legacy API JSON adapter artifact",
    previewImageWidth: 1200,
    previewImageHeight: 760,
    previewFit: "contain",
    previewPosition: "top",
    previewFrame: "code",
  },
  {
    key: "audit",
    title: "Audit evidence",
    source: "Parity test",
    inspect: "Read-only assertions that prove call_log/reporting shape before cleanup.",
    result: "Shows cleanup protected by verification instead of broad deletion.",
    href: "https://github.com/23Maestro/prospect-pipeline/blob/main/scripts/audit-call-tracker-live-parity.test.mjs",
    previewImageSrc: "/portfolio/source-map/live-parity-test.svg",
    previewImageAlt: "Live parity test code artifact",
    previewImageWidth: 852,
    previewImageHeight: 644,
    previewFit: "contain",
    previewPosition: "top",
    previewFrame: "code",
  },
  {
    key: "web",
    title: "Web support",
    source: "Prospect Web",
    inspect: "Mobile command surface, call tracker, reporting views, and visual maps.",
    result: "Shows the workflow becoming readable outside Raycast.",
    href: "https://github.com/23Maestro/prospect-pipeline/tree/main/apps/prospect-web",
    previewImageSrc: "/portfolio/source-map/prospect-web-enhanced.png",
    previewImageAlt: "Prospect Web command surface artifact",
    previewImageWidth: 1280,
    previewImageHeight: 1280,
    previewFit: "cover",
    previewPosition: "top",
    previewFrame: "product",
  },
];

const reportingRows = [
  ["Table", "Owner", "Write path", "What it verifies"],
  ["appointments", "Meeting workflow", "Set Meetings", "Booked meeting lookup and confirmation readback"],
  ["athlete_lifecycle_events", "Stage truth", "Post-call updates", "Lifecycle changes are not hidden in UI state"],
  ["call_log", "Reporting", "Audit checks", "Projected shape checked before cleanup"],
  ["confirmation_cache", "Support cache", "Message support", "Useful for drafting, not durable lifecycle truth"],
];

const systemCards = [
  {
    id: "raycast-card",
    kicker: "Command surface",
    pill: "Action",
    title: "Raycast command UI",
    body: "Front-end command surface for repeated operator workflows.",
    accent: "#2383e2",
    icon: "R",
    facts: ["Scout Prep", "Set Meetings", "Client Messages", "Video workflow commands"],
  },
  {
    id: "adapter-card",
    kicker: "Workflow support",
    pill: "Adapter",
    title: "FastAPI legacy adapter",
    body: "Local API layer that translated dashboard forms into repeatable request shapes.",
    accent: "#b86013",
    icon: "A",
    facts: ["Shared local session path", "Form payload handling", "Legacy ID normalization", "Live source-system readback"],
  },
  {
    id: "truth-card",
    kicker: "Reporting layer",
    pill: "Source",
    title: "Supabase truth layer",
    body: "Durable workflow facts separated from UI state and support caches.",
    accent: "#25c266",
    icon: "S",
    facts: ["appointments", "lifecycle_events", "call_log", "confirmation support cache"],
  },
];

const aiCards = [
  {
    id: "data-prep-card",
    kicker: "Data preparation",
    pill: "Gather",
    title: "Data preparation",
    body: "Turned scattered workflow facts into source-of-truth contracts that people and AI tools could both follow.",
    accent: "#2383e2",
    icon: "D",
    facts: ["Validation gates", "Migration checks", "Reporting cleanup"],
  },
  {
    id: "output-review-card",
    kicker: "Output review",
    pill: "Evaluate",
    title: "Output evaluation",
    body: "Used AI-assisted drafts, then checked outputs against repo evidence, operator needs, and source readback.",
    accent: "#25c266",
    icon: "O",
    facts: ["Draft helpers", "Human review", "Source readback"],
  },
  {
    id: "implementation-card",
    kicker: "Implementation",
    pill: "Support",
    title: "Implementation support",
    body: "Built around the operator workflow so pilots could be tested, explained, and improved without guessing.",
    accent: "#b86013",
    icon: "I",
    facts: ["Workflow mapping", "Command UI testing", "Architecture docs"],
  },
];

function cx(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

function PortfolioCard({
  kicker,
  pill,
  title,
  body,
  accent,
  icon,
  facts,
  selected,
  onClick,
}: {
  kicker: string;
  pill: string;
  title: string;
  body: string;
  accent: string;
  icon: string;
  facts: string[];
  selected?: boolean;
  onClick?: () => void;
}) {
  const panelBackground = `linear-gradient(135deg, ${accent}12 0%, #ffffff 42%, #f8fafc 100%)`;
  const content = (
    <>
      <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-10 blur-xl" style={{ backgroundColor: accent }} />
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-lg border border-black/10 text-[11px] font-black text-white shadow-sm" style={{ backgroundColor: accent }}>
            {icon}
          </span>
          <p className="m-0 text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: accent }}>
            {kicker}
          </p>
        </div>
        <span className="rounded-full border border-[#d8e0ea] bg-white/80 px-2 py-0.5 text-[10px] font-black text-[#1f2937] shadow-sm">{pill}</span>
      </div>
      <h3 className="m-0 text-[20px] font-black leading-tight text-[#111318]">{title}</h3>
      <p className="mt-2 line-clamp-3 text-[14px] font-semibold leading-5 text-[#5f6b7f]">{body}</p>
      <ul className="mt-4 list-disc space-y-1.5 border-t border-[#dfe6ef] pl-5 pt-3 text-[12px] font-bold leading-5 text-[#2f3746]">
        {facts.map((fact) => (
          <li key={fact}>
            {fact}
          </li>
        ))}
      </ul>
    </>
  );

  const className = cx(
    "group relative flex min-h-[300px] w-full max-w-[400px] flex-col overflow-hidden rounded-[16px] border p-5 text-left shadow-[0_10px_20px_rgba(15,23,42,0.04)] transition duration-200",
    selected ? "border-[#2383e2] ring-2 ring-[#2383e2]/20" : "border-[#dde3ec] hover:-translate-y-0.5 hover:border-[#c8d3e2] hover:shadow-[0_16px_32px_rgba(15,23,42,0.08)]",
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} aria-pressed={selected} className={className} style={{ background: panelBackground }}>
        {content}
      </button>
    );
  }

  return (
    <section className={className} style={{ background: panelBackground }}>
      {content}
    </section>
  );
}

export function SystemTopSlice({ selectedId, onSelect }: { selectedId?: string; onSelect?: (id: string) => void }) {
  return (
    <div className="grid justify-items-center gap-5 sm:grid-cols-2 lg:flex lg:justify-center lg:gap-8">
      {systemCards.map((card) => (
        <PortfolioCard key={card.id} {...card} selected={selectedId === card.id} onClick={onSelect ? () => onSelect(card.id) : undefined} />
      ))}
    </div>
  );
}

export function EvidenceTopSlice({ selectedKey, onSelect }: { selectedKey: string; onSelect: (key: string) => void }) {
  const selected = evidenceData.find((item) => item.key === selectedKey) ?? evidenceData[0];

  return (
    <div className="grid items-stretch gap-4 lg:grid-cols-[minmax(0,680px)_minmax(0,1fr)]">
      <div className="overflow-hidden bg-white p-2">
        <div className="grid gap-2 sm:grid-cols-2">
          {evidenceData.map((item) => (
            <button
              key={item.key}
              type="button"
              aria-pressed={item.key === selectedKey}
              onClick={() => onSelect(item.key)}
              className={cx(
                "grid min-h-[92px] w-full gap-1 rounded-[11px] border px-3 py-2.5 text-left text-[12px] transition-colors",
                item.key === selectedKey ? "border-[#2383e2] bg-[#f1f6ff]" : "border-[#e1e5eb] bg-white hover:bg-[#f8fafc]",
              )}
            >
              <strong className="font-black leading-tight text-[#1e2736]">{item.title}</strong>
              <span className="line-clamp-3 leading-5 text-[#667085]">{item.summary}</span>
            </button>
          ))}
        </div>
      </div>

      <GitDiffPanel selected={selected} />
    </div>
  );
}

export function GitDiffPanel({ selected }: { selected: EvidenceItem }) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[16px] border border-[#d8e2ef] bg-[#0d1117] text-[#c9d1d9] shadow-[0_20px_40px_rgba(15,23,42,0.12)]">
      <div className="flex items-center gap-3 border-b border-[#30363d] bg-[#161b22] px-4 py-2.5">
        <span className="text-[12px] font-mono font-medium text-[#8b949e]">a/{selected.key}.ts b/{selected.key}.ts</span>
      </div>
      <div className="flex-1 p-4 text-[13px] font-mono leading-6">
        <div className="mb-2 text-[#8b949e]">@@ -1,3 +1,3 @@</div>
        <DiffLine marker="-" tone="remove">{selected.problem}</DiffLine>
        <DiffLine marker="+" tone="add">{selected.solution}</DiffLine>
        <DiffLine marker="+" tone="add">{selected.result}</DiffLine>
      </div>
      <div className="flex items-center justify-between border-t border-[#30363d] bg-[#161b22] px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-[#8b949e]">
        <span>Verification: {selected.title}</span>
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#3fb950]" /> Verified</span>
      </div>
    </div>
  );
}

function DiffLine({ marker, tone, children }: { marker: string; tone: "add" | "remove"; children: ReactNode }) {
  return (
    <div className={cx("mb-1 flex rounded-sm px-2 py-0.5 text-[#24292f]", tone === "add" ? "bg-[#e6ffec]" : "bg-[#ffebe9]")}>
      <span className={cx("w-6 shrink-0 select-none", tone === "add" ? "text-[#1a7f37]" : "text-[#cf222e]")}>{marker}</span>
      <span>{children}</span>
    </div>
  );
}

function LikeC4Preview({ viewId, dynamicVariant }: { viewId: string; dynamicVariant?: "diagram" | "sequence" }) {
  return (
    <>
      <Script id="likec4-views-script" src="/visual-maps/likec4-views.js" type="module" strategy="afterInteractive" />
      {createElement("likec4-view", {
        "view-id": viewId,
        browser: "true",
        ...(dynamicVariant ? { "dynamic-variant": dynamicVariant } : {}),
        style: likec4EmbedStyle,
      })}
    </>
  );
}

export function EvidenceBottomSlice() {
  return (
    <section className="mx-auto w-full overflow-hidden rounded-[14px] border border-[#e1e5eb] bg-white shadow-[0_18px_48px_rgba(23,33,52,0.16)]">
      <div className="flex items-baseline justify-between gap-3 border-b border-[#e1e5eb] bg-[#fbfdff] px-4 py-3">
        <strong className="text-[17px] font-black text-[#111318]">Supabase reporting shape</strong>
        <span className="text-[13px] font-bold text-[#667085]">Durable facts stay separate from command state and support caches.</span>
      </div>
      <div className="p-3.5">
        <div className="overflow-hidden rounded-[9px] border border-[#e1e5eb]">
          {reportingRows.map((row, index) => (
            <div key={row[0]} className={cx("grid grid-cols-[1fr_1fr_1fr_1.5fr] gap-3 border-t border-[#e1e5eb] px-3 py-2.5 text-[13px] first:border-t-0 max-md:grid-cols-1", index === 0 ? "bg-[#eef4fc] font-black text-[#20304a]" : "text-[#303746]")}>
              {row.map((cell, cellIndex) => (
                <span key={cell} className={cellIndex === 0 && index > 0 ? "font-black text-[#172033]" : ""}>{cell}</span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function AISpecialistTopSlice({ selectedId, onSelect }: { selectedId?: string; onSelect?: (id: string) => void }) {
  return (
    <div className="grid justify-items-center gap-5 sm:grid-cols-2 lg:flex lg:justify-center lg:gap-8">
      {aiCards.map((card) => (
        <PortfolioCard key={card.id} {...card} selected={selectedId === card.id} onClick={onSelect ? () => onSelect(card.id) : undefined} />
      ))}
    </div>
  );
}

export function AISpecialistBottomSlice({ selectedIndex, onSelect }: { selectedIndex: number; onSelect: (index: number) => void }) {
  const selected = processData[selectedIndex] ?? processData[0];

  return (
    <section className="mx-auto w-full max-w-[1080px] overflow-hidden rounded-[14px] border border-[#e1e5eb] bg-white shadow-[0_18px_48px_rgba(23,33,52,0.16)]">
      <div className="flex items-baseline justify-between gap-3 border-b border-[#e1e5eb] bg-[#fbfdff] px-4 py-3">
        <strong className="text-[17px] font-black text-[#111318]">Review-first implementation loop</strong>
        <span className="text-[13px] font-bold text-[#667085]">Click a step to see the operating rule.</span>
      </div>
      <div className="p-3.5">
        <div className="grid gap-2.5 lg:grid-cols-5">
          {processData.map((step, index) => (
            <button
              key={step.title}
              type="button"
              aria-pressed={selectedIndex === index}
              onClick={() => onSelect(index)}
              className={cx(
                "min-h-[126px] rounded-[9px] border p-3 text-left transition",
                selectedIndex === index ? "border-[#98abd2] bg-[#eef4ff]" : "border-[#e1e5eb] bg-[#f8f9fb] hover:bg-white",
              )}
            >
              <span className="mb-2 inline-grid min-h-[26px] min-w-[26px] place-items-center rounded-full bg-[#2383e2] text-xs font-black text-white">{index + 1}</span>
              <strong className="mb-1 block text-sm font-black text-[#172033]">{step.title}</strong>
              <p className="m-0 text-xs leading-5 text-[#667085]">{step.solution}</p>
            </button>
          ))}
        </div>
        <div className="mt-2.5 rounded-[9px] border border-[#cfd8e7] bg-white p-3">
          <div className="grid gap-2.5 md:grid-cols-3">
            {[
              ["Problem", selected.problem],
              ["AI support", selected.solution],
              ["Result", selected.result],
            ].map(([label, body]) => (
              <div key={label} className="min-h-[94px] rounded-[13px] border border-[#dce4ef] bg-white p-3">
                <span className="mb-2 block text-[11px] font-black uppercase tracking-[0.08em] text-[#667284]">{label}</span>
                <p className="m-0 text-sm font-bold leading-5 text-[#1f2937]">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function ResumeBottomSlice({ selectedIndex, onSelect }: { selectedIndex: number; onSelect: (index: number) => void }) {
  return (
    <section className="mx-auto w-full max-w-[1120px] overflow-hidden rounded-[14px] border border-[#e1e5eb] bg-white shadow-[0_18px_48px_rgba(23,33,52,0.14)]">
      <style jsx>{`
        @keyframes beallsTimelineFade {
          from {
            opacity: 0;
            transform: translate(-50%, 8px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0) scale(1);
          }
        }
      `}</style>
      <div className="flex items-baseline justify-between gap-3 border-b border-[#e1e5eb] bg-[#fbfdff] px-4 py-3">
        <strong className="text-[17px] font-black text-[#111318]">Resume timeline</strong>
        <span className="text-[13px] font-bold text-[#667085]">Work history and education, not repeated proof cards.</span>
      </div>
      <div className="p-3.5">
        <div className="relative grid gap-3">
          <div className="absolute bottom-8 left-1/2 top-8 hidden w-px -translate-x-1/2 bg-[#cfd8e7] lg:block" aria-hidden="true" />
          {resumeTimelineData.map((item, index) => {
            const isBeallsStop = item.year === "2026";
            const isActive = selectedIndex === index;
            const accent = isBeallsStop ? "#c60c35" : "#2383e2";

            return (
              <button
                key={`${item.year}-${item.title}`}
                type="button"
                aria-pressed={isActive}
                onClick={() => onSelect(index)}
                className={cx(
                  "relative grid min-h-[92px] gap-3 rounded-[12px] border p-3 text-left transition lg:w-[calc(50%-28px)]",
                  index % 2 === 0 ? "lg:justify-self-start" : "lg:justify-self-end",
                  isActive
                    ? isBeallsStop
                      ? "border-[#c60c35] bg-[#fff1f3]"
                      : "border-[#2383e2] bg-[#eef4ff]"
                    : isBeallsStop
                      ? "border-[#c60c35]/50 bg-white hover:bg-[#fff7f8]"
                      : "border-[#d8e2ef] bg-[#f8f9fb] hover:bg-white",
                )}
              >
                {isBeallsStop ? (
                  <span
                    className="pointer-events-none absolute left-1/2 top-[-34px] z-20 inline-flex h-7 min-w-[92px] items-center justify-center rounded-full border border-[#c60c35]/20 bg-white px-3 text-[18px] font-black leading-none text-[#c60c35] shadow-[0_8px_18px_rgba(198,12,53,0.14)]"
                    style={{ animation: "beallsTimelineFade 650ms ease-out 180ms both" }}
                    aria-hidden="true"
                  >
                    bealls
                  </span>
                ) : null}
                <span className={cx("absolute top-5 hidden h-px w-7 lg:block", isBeallsStop ? "bg-[#c60c35]/45" : "bg-[#cfd8e7]")} style={index % 2 === 0 ? { right: "-28px" } : { left: "-28px" }} />
                <span className={cx("absolute top-3 hidden h-4 w-4 rounded-full border-[3px] bg-white lg:block", isActive ? (isBeallsStop ? "border-[#c60c35]" : "border-[#2383e2]") : (isBeallsStop ? "border-[#c60c35]/60" : "border-[#a9b7cc]"), index % 2 === 0 ? "right-[-36px]" : "left-[-36px]")} />
                <span className="grid gap-2 sm:grid-cols-[88px_minmax(0,1fr)]">
                  <span
                    className={cx("grid h-14 place-items-center rounded-[10px] border text-xl font-black", isActive ? "text-white" : "bg-white")}
                    style={{
                      borderColor: isActive || isBeallsStop ? accent : "#c9d7eb",
                      backgroundColor: isActive ? accent : "#ffffff",
                      color: isActive ? "#ffffff" : accent,
                    }}
                  >
                    {item.year}
                  </span>
                  <span className="min-w-0">
                    <strong className="block text-[16px] font-black leading-tight text-[#172033]">{item.title}</strong>
                    <span className="mt-1 block text-[11px] font-black uppercase tracking-[0.12em]" style={{ color: accent }}>{item.meta}</span>
                    <span className="mt-1.5 block text-[12px] font-semibold leading-5 text-[#667085]">{item.body}</span>
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function SourceMapTopSlice({ selectedId, onSelect }: { selectedId?: string; onSelect?: (id: string) => void }) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {sourceRouteData.map((route) => {
        const className = cx(
          "relative rounded-[22px] border bg-white p-[17px] text-left shadow-[0_18px_42px_rgba(15,23,42,0.07)] transition",
          selectedId === route.key ? "border-[#2383e2] ring-2 ring-[#2383e2]/20" : "border-[#e4e5e7]",
        );
        const content = (
          <>
            <p className="mb-3 text-xs font-black uppercase tracking-[0.16em] text-[#2383e2]">{route.source}</p>
            <h3 className="m-0 mb-2 text-[22px] font-black leading-tight text-[#111318]">{route.title}</h3>
            <p className="m-0 text-[15px] leading-6 text-[#667085]">{route.inspect}</p>
          </>
        );

        if (onSelect) {
          return (
            <section key={route.key} className={className}>
              <button type="button" aria-pressed={selectedId === route.key} onClick={() => onSelect(route.key)} className="block w-full text-left">
                {content}
              </button>
              <a className="mt-2 inline-flex min-h-[30px] items-center text-[13px] font-extrabold text-[#2383e2] hover:underline" href={route.href}>
                Open {route.source}
              </a>
            </section>
          );
        }

        return (
          <section key={route.key} className={className}>
            {content}
            <a className="mt-2 inline-flex min-h-[30px] items-center text-[13px] font-extrabold text-[#2383e2] hover:underline" href={route.href}>
              Open {route.source}
            </a>
          </section>
        );
      })}
    </div>
  );
}

export function SourceMapBottomSlice({ selectedKey }: { selectedKey: string; onSelect?: (key: string) => void }) {
  const selected = sourceRouteData.find((route) => route.key === selectedKey) ?? sourceRouteData[0];
  const isSystemBucketMap = selected.likec4ViewId === "scouting_coordinator_bucket_map";
  const frameClass = cx(
    "source-map-preview-frame relative mx-auto w-full overflow-hidden rounded-[18px] border border-[#dfe7f1] bg-white shadow-[0_18px_44px_rgba(15,23,42,0.08)]",
    isSystemBucketMap
      ? "max-w-[1240px] h-[190px] md:h-[180px]"
      : selected.likec4ViewId
      ? "max-w-[1120px] aspect-[1.58/1] min-h-[520px]"
      : selected.previewFrame === "product"
      ? "max-w-[900px] aspect-[1.2/1] md:aspect-[1.42/1]"
      : selected.previewFrame === "diagram"
        ? "max-w-[860px] aspect-[1.58/1]"
        : "max-w-[820px] aspect-[1.34/1] md:aspect-[1.54/1]",
  );
  const imagePositionClass =
    selected.previewPosition === "left-top" ? "object-left-top" : selected.previewPosition === "top" ? "object-top" : "object-center";

  return (
    <section className={frameClass} aria-live="polite">
      <div key={selected.key} className="absolute inset-0 origin-center">
        {selected.likec4ViewId ? (
          <div
            className={cx(
              "h-full w-full animate-[sourceMapPreviewFade_240ms_ease-out]",
              isSystemBucketMap ? "source-map-likec4-system" : "p-2",
            )}
          >
            <LikeC4Preview viewId={selected.likec4ViewId} dynamicVariant={isSystemBucketMap ? "sequence" : undefined} />
          </div>
        ) : (
          <Image
            src={selected.previewImageSrc}
            alt={selected.previewImageAlt}
            width={selected.previewImageWidth}
            height={selected.previewImageHeight}
            sizes="(min-width: 900px) 900px, 100vw"
            className={cx(
              "h-full w-full animate-[sourceMapPreviewFade_240ms_ease-out]",
              selected.previewFit === "cover" ? "object-cover" : "object-contain",
              imagePositionClass,
            )}
          />
        )}
      </div>
      {selected.likec4ViewId ? null : <div className="source-map-preview-blur" aria-hidden="true" />}
      <style jsx>{`
        .source-map-likec4-system {
          position: absolute;
          inset: 0;
          overflow: hidden;
        }
        .source-map-likec4-system :global(likec4-view) {
          display: block;
          width: 120% !important;
          height: 120% !important;
          min-height: 120% !important;
          transform: translate(-8%, -4%);
          transform-origin: top center;
        }
        @media (max-width: 768px) {
          .source-map-likec4-system :global(likec4-view) {
            width: 150% !important;
            height: 150% !important;
            min-height: 150% !important;
            transform: translate(-16%, -5%);
          }
        }
        .source-map-preview-blur {
          position: absolute;
          inset: auto 0 0;
          height: 10%;
          pointer-events: none;
          background: linear-gradient(to top, rgba(255, 255, 255, 0.82), rgba(255, 255, 255, 0));
          -webkit-backdrop-filter: blur(8px);
          backdrop-filter: blur(8px);
          -webkit-mask-image: linear-gradient(to top, #000 8%, transparent 100%);
          mask-image: linear-gradient(to top, #000 8%, transparent 100%);
        }
        @keyframes sourceMapPreviewFade {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </section>
  );
}

export function getSliceElements(tab: PortfolioTabTarget, slice: PortfolioSlice): SliceElement[] {
  if (tab === "System") {
    return systemCards.map((card) => ({
      id: card.id,
      label: card.title,
      eyebrow: card.kicker,
      body: card.body,
      before: "The lab used mock cards instead of the real system card section.",
      after: `Render the real ${card.title} card from the portfolio top slice.`,
      route: "components/AIWorkflowPortfolioCommand.tsx:SystemPanel > SystemTopSlice",
      kind: "card" as const,
    }));
  }

  if (tab === "Evidence" && slice === "Top") {
    return evidenceData.map((item) => ({
      id: item.key,
      label: item.title,
      eyebrow: "Evidence diff",
      body: item.summary,
      before: item.problem,
      after: `${item.solution} ${item.result}`,
      route: "components/AIWorkflowPortfolioCommand.tsx:EvidencePanel > EvidenceTopSlice",
      kind: "row" as const,
    }));
  }

  if (tab === "Evidence") {
    return reportingRows.slice(1).map((row) => ({
      id: row[0],
      label: row[0],
      eyebrow: row[1],
      body: row[3],
      before: "Command state, support cache, and reporting truth were blended in one preview.",
      after: `Use ${row[0]} as a separate reporting truth row with owner ${row[1]}.`,
      route: "components/AIWorkflowPortfolioCommand.tsx:EvidencePanel > EvidenceBottomSlice",
      kind: "row" as const,
    }));
  }

  if (tab === "AI Specialist" && slice === "Top") {
    return aiCards.map((card) => ({
      id: card.id,
      label: card.title,
      eyebrow: card.kicker,
      body: card.body,
      before: "AI role fit appeared as generic AI surface language.",
      after: `Keep the real ${card.title} card and tune only this visual treatment.`,
      route: "components/AIWorkflowPortfolioCommand.tsx:FitPanel > AISpecialistTopSlice",
      kind: "card" as const,
    }));
  }

  if (tab === "AI Specialist") {
    return processData.map((step) => ({
      id: step.title.toLowerCase(),
      label: step.title,
      eyebrow: "Implementation loop",
      body: step.solution,
      before: step.problem,
      after: step.result,
      route: "components/AIWorkflowPortfolioCommand.tsx:FitPanel > AISpecialistBottomSlice",
      kind: "row" as const,
    }));
  }

  if (tab === "Resume") {
    return resumeData.map(([eyebrow, title, body]) => ({
      id: title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      label: title,
      eyebrow,
      body,
      before: "Resume support repeated the same evidence without a focused selection path.",
      after: `Use the verification stack to focus ${title} as the selected resume angle.`,
      route: "components/AIWorkflowPortfolioCommand.tsx:ResumePanel > ResumeBottomSlice",
      kind: "card" as const,
    }));
  }

  if (tab === "Source Map" && slice === "Top") {
    return sourceRouteData.map((route) => ({
      id: route.key,
      label: route.title,
      eyebrow: route.source,
      body: route.inspect,
      before: "Portfolio claim routing was represented by a mock map instead of the source cards.",
      after: `Render the real ${route.title} source card and route it to ${route.source}.`,
      route: "components/AIWorkflowPortfolioCommand.tsx:ProofMapPanel > SourceMapTopSlice",
      kind: "card" as const,
    }));
  }

  return sourceRouteData.map((route) => ({
    id: route.key,
    label: route.title,
    eyebrow: "Review route",
    body: route.inspect,
    before: "Claim copy was detached from the reviewable source readback.",
    after: route.result,
    route: "components/AIWorkflowPortfolioCommand.tsx:ProofMapPanel > SourceMapBottomSlice",
    kind: "detail" as const,
  }));
}

export function SliceRawPreview({
  tab,
  slice,
  selectedId,
  onSelect,
}: {
  tab: PortfolioTabTarget;
  slice: PortfolioSlice;
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  if (tab === "System") return <SystemTopSlice selectedId={selectedId} onSelect={onSelect} />;
  if (tab === "Evidence" && slice === "Top") return <EvidenceTopSlice selectedKey={selectedId} onSelect={onSelect} />;
  if (tab === "Evidence") return <EvidenceBottomSlice />;
  if (tab === "AI Specialist" && slice === "Top") return <AISpecialistTopSlice selectedId={selectedId} onSelect={onSelect} />;
  if (tab === "AI Specialist") return <AISpecialistBottomSlice selectedIndex={Math.max(0, processData.findIndex((step) => step.title.toLowerCase() === selectedId))} onSelect={(index) => onSelect(processData[index].title.toLowerCase())} />;
  if (tab === "Resume") {
    const index = Math.max(0, resumeData.findIndex(([, title]) => title.toLowerCase().replace(/[^a-z0-9]+/g, "-") === selectedId));
    return <ResumeBottomSlice selectedIndex={index} onSelect={(nextIndex) => onSelect(resumeData[nextIndex][1].toLowerCase().replace(/[^a-z0-9]+/g, "-"))} />;
  }
  if (tab === "Source Map" && slice === "Top") return <SourceMapTopSlice selectedId={selectedId} onSelect={onSelect} />;
  return <SourceMapBottomSlice selectedKey={selectedId} onSelect={onSelect} />;
}
