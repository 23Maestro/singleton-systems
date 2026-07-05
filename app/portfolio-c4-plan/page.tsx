import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Portfolio C4 Plan",
  description: "Implementation plan for the AI Workflow Portfolio C4 map and source image framing cleanup.",
  alternates: {
    canonical: "/portfolio-c4-plan/",
  },
};

const steps = [
  {
    title: "C4 source",
    body: "Add a simple LikeC4 source for the README map: Operator, Raycast Commands, Local FastAPI Bridge, Legacy Laravel, Supabase, and Prospect Web.",
  },
  {
    title: "Export path",
    body: "Keep static LikeC4 builds working, then fix PNG export through local Playwright or the LikeC4 Docker fallback.",
  },
  {
    title: "One image frame",
    body: "Replace nested cards with one source artifact frame. Use fit, position, scale, and frame type as data.",
  },
  {
    title: "API images",
    body: "Use contain-first framing for code and API artifacts so mobile does not crop important lines.",
  },
  {
    title: "Prospect Web",
    body: "Treat Prospect Web as a product screenshot and adjust object-position before changing scale again.",
  },
  {
    title: "Publish check",
    body: "Build, inspect desktop and mobile, then deploy preview unless production is explicitly requested.",
  },
];

const c4Items = [
  ["Person", "Operator", "Triggers workflow actions."],
  ["System", "Prospect ID Workflow System", "Command UI, adapter work, source-of-truth cleanup, and audit tests."],
  ["Container", "Raycast Commands", "Command surface. Commands are buttons."],
  ["Container", "Local FastAPI Bridge", "Translates legacy dashboard behavior into repeatable request shapes."],
  ["Container", "Legacy Laravel Dashboard", "Existing system that still owns old dashboard behavior."],
  ["Container", "Supabase PostgreSQL", "Durable workflow facts and reporting truth."],
  ["Container", "Vercel / Prospect Web", "Readable workflow surface outside Raycast."],
];

const sourceLinks = [
  ["MDN object-fit", "https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/object-fit"],
  ["MDN object-position", "https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/object-position"],
  ["Next.js Image", "https://nextjs.org/docs/pages/api-reference/components/image"],
  ["LikeC4 CLI", "https://likec4.dev/tooling/cli/"],
  ["LikeC4 Docker", "https://likec4.dev/tooling/docker/"],
];

export default function PortfolioC4PlanPage() {
  return (
    <main className="min-h-dvh bg-[#f5f7fb] px-5 py-8 text-[#111827] md:px-10 md:py-12">
      <section className="mx-auto max-w-6xl overflow-hidden rounded-[18px] border border-[#dbe3ee] bg-white shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
        <header className="border-b border-[#e4e9f1] px-6 py-7 md:px-10">
          <p className="text-[12px] font-bold uppercase tracking-[0.26em] text-[#64748b]">AI Workflow Portfolio</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold leading-tight tracking-[-0.03em] md:text-5xl">
            C4 map and image framing plan
          </h1>
          <p className="mt-4 max-w-3xl text-[17px] leading-8 text-[#5f6c80]">
            Move the Source Map visuals toward a cleaner C4-style system map and one consistent artifact frame.
            Keep the practical case-study feel, but remove nested image cards and awkward mobile crops.
          </p>
        </header>

        <section className="grid gap-0 border-b border-[#e4e9f1] lg:grid-cols-[0.95fr_1.05fr]">
          <div className="border-b border-[#e4e9f1] p-6 md:p-10 lg:border-b-0 lg:border-r">
            <h2 className="text-2xl font-bold tracking-[-0.02em]">C4 language</h2>
            <div className="mt-5 space-y-3">
              {c4Items.map(([kind, label, body]) => (
                <div key={label} className="rounded-[10px] border border-[#dfe6ef] bg-[#fbfdff] p-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#2f80ed]">{kind}</p>
                  <h3 className="mt-1 text-[17px] font-bold">{label}</h3>
                  <p className="mt-1 text-[14px] leading-6 text-[#627086]">{body}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 md:p-10">
            <h2 className="text-2xl font-bold tracking-[-0.02em]">Implementation steps</h2>
            <div className="mt-5 grid gap-3">
              {steps.map((step, index) => (
                <article key={step.title} className="grid grid-cols-[44px_1fr] gap-4 rounded-[10px] border border-[#dfe6ef] bg-white p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-[#e8f1ff] text-sm font-bold text-[#1f7aec]">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="text-[16px] font-bold">{step.title}</h3>
                    <p className="mt-1 text-[14px] leading-6 text-[#627086]">{step.body}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-0 lg:grid-cols-2">
          <div className="border-b border-[#e4e9f1] p-6 md:p-10 lg:border-b-0 lg:border-r">
            <h2 className="text-2xl font-bold tracking-[-0.02em]">Image frame contract</h2>
            <ul className="mt-5 space-y-3 text-[15px] leading-7 text-[#536176]">
              <li>Use one silhouette frame per selected source image.</li>
              <li>Use fixed aspect-ratio parents on desktop and mobile.</li>
              <li>Use contain when the whole artifact matters.</li>
              <li>Use cover only when the crop is intentional.</li>
              <li>Use object-position before another scale change.</li>
              <li>Keep links on top source cards; bottom images should not navigate.</li>
            </ul>
          </div>

          <div className="p-6 md:p-10">
            <h2 className="text-2xl font-bold tracking-[-0.02em]">Research links</h2>
            <div className="mt-5 grid gap-3">
              {sourceLinks.map(([label, href]) => (
                <a
                  key={href}
                  href={href}
                  className="rounded-[10px] border border-[#dfe6ef] bg-[#fbfdff] px-4 py-3 text-[15px] font-bold text-[#1f2937] transition hover:border-[#2f80ed] hover:text-[#2f80ed]"
                >
                  {label}
                </a>
              ))}
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
