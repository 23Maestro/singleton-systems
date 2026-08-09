import type { Metadata } from "next";
import CopyBlock from "./CopyBlock";

export const metadata: Metadata = {
  title: "Rouse and Holder — Setup Guide",
  description: "Seven steps to set up the brief pipeline. Copy, paste, done.",
};

const steps: { title: string; label: string; code: string }[] = [
  {
    title: "Install Claude Code",
    label: "TERMINAL",
    code: "npm install -g @anthropic-ai/claude-code",
  },
  {
    title: "Make the project folder",
    label: "TERMINAL",
    code: "mkdir -p ~/Documents/rouse-and-holder\ncd ~/Documents/rouse-and-holder\ngit init",
  },
  {
    title: "Start Claude Code",
    label: "TERMINAL",
    code: "claude",
  },
  {
    title: "Paste the setup prompt",
    label: "PASTE INTO CLAUDE",
    code: `Set up this repo for a brief-generation project.

Create .claude/settings.json with a UserPromptSubmit hook that runs:
  cat .claude/writing-rules.md

Create .claude/writing-rules.md from the file I am attaching.

Do not add anything else. No README, no scaffolding, no extra folders.
Confirm both files exist when done.`,
  },
  {
    title: "Install Grill Me and Wayfinder",
    label: "TERMINAL",
    code: "npx -y skills add mattpocock/skills --skill wayfinder --agent claude-code\nnpx -y skills add mattpocock/skills --skill grill-me --agent claude-code",
  },
  {
    title: "Run the interview",
    label: "PASTE INTO CLAUDE",
    code: `I need to nail down the exact spec for an AI pipeline that generates
sales briefs, before it gets built. Interview me until you have:

1. My current prompts, in full.
2. 2-3 full session transcripts, including bad first drafts and
   every correction I made, in order.
3. How I target accounts — clustered by industry, or scattershot.
4. What separates a finished brief from an early draft. Name the
   specific, recurring corrections — not "made it better."

Write the findings clean enough to hand an engineer with zero
follow-up questions.`,
  },
  {
    title: "Turn it into a build plan",
    label: "PASTE INTO CLAUDE",
    code: `Turn the interview findings into a phased build plan: URL in,
sales brief out. Stack is Firecrawl (scrape), Claude (generate),
Vercel (host the HTML brief).`,
  },
];

const accessItems = [
  "A Firecrawl account and API key, or a card to start one.",
  "A Claude (Anthropic) API key, or a card to start one.",
  "A Vercel account to host the brief pages.",
  "3-5 real client URLs you target now — the pipeline gets tested against these, not a stranger's site.",
];

export default function RouseAndHolderPage() {
  return (
    <main className="min-h-dvh bg-neutral-50 text-neutral-950">
      <header className="bg-neutral-950 px-6 py-16 sm:px-10 sm:py-20">
        <div className="mx-auto max-w-3xl">
          <p className="text-xs font-semibold tracking-[0.14em] text-brand-blue">ROUSE AND HOLDER</p>
          <h1 className="mt-3 text-4xl font-bold leading-tight text-white sm:text-5xl">
            Set up your brief pipeline
          </h1>
        </div>
      </header>

      <div className="border-b border-neutral-200 bg-white px-6 py-6 sm:px-10">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-end gap-3">
          <a
            href="/rouse-and-holder/writing-rules.md"
            download
            className="rounded-lg bg-brand-blue px-5 py-3 text-sm font-semibold text-white hover:bg-brand-text-blue"
          >
            Download writing-rules.md
          </a>
          <a
            href="/rouse-and-holder/interview-prompt.md"
            download
            className="rounded-lg border border-neutral-300 px-5 py-3 text-sm font-semibold text-brand-text-blue hover:border-brand-blue"
          >
            Download interview prompt
          </a>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-6 py-12 sm:px-10">
        <ol className="flex flex-col gap-5">
          {steps.map((step, i) => (
            <li key={step.title} className="flex gap-5 rounded-2xl border border-neutral-200 bg-white p-7">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-blue text-lg font-bold text-white">
                {i + 1}
              </span>
              <div className="flex flex-1 flex-col gap-2.5">
                <h2 className="text-xl font-semibold">{step.title}</h2>
                <div className="mt-1">
                  <CopyBlock label={step.label} code={step.code} />
                </div>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-5 flex gap-5 rounded-2xl border border-neutral-200 bg-white p-7">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-blue text-lg font-bold text-white">
            8
          </span>
          <div className="flex flex-1 flex-col gap-2.5">
            <h2 className="text-xl font-semibold">Gather access before you send everything back</h2>
            <ul className="flex flex-col gap-1.5 text-[15px] leading-relaxed text-neutral-700">
              {accessItems.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="text-brand-text-blue">-</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
