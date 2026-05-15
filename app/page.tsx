import CapabilitiesStrip from "@/components/CapabilitiesStrip";
import CaseStudy from "@/components/CaseStudy";

const capabilities = [
  "Workflow State",
  "Operator Shortcuts",
  "Legacy Software",
  "Follow-Up Loops",
  "Systems Briefs",
] as const;

const painPoints = [
  "Too many clicks",
  "No shared workflow state",
  "Follow-up depends on memory",
  "Growth creates cleanup",
] as const;

const auditDeliverables = [
  "Workflow map",
  "Friction report",
  "Quick-win recommendations",
  "Systems roadmap",
] as const;

const methodSteps = [
  "Map the workflow",
  "Find the drag",
  "Define the source of truth",
  "Design the cleaner path",
  "Package the build brief",
] as const;

const bestFits = [
  "service businesses",
  "media teams",
  "education teams",
  "sports organizations",
  "small teams using legacy software",
  "operators buried in manual follow-up",
  "businesses scaling faster than their workflows",
] as const;

export default function Page() {
  return (
    <main className="relative overflow-hidden bg-black">
      <section className="py-16 sm:py-20" aria-labelledby="hero-heading">
        <div className="mx-auto w-full max-w-6xl px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-zinc-950 p-8 shadow-2xl sm:p-12">
            <div aria-hidden className="pointer-events-none absolute -left-16 top-0 h-56 w-56 rounded-full bg-indigo-500/10 blur-[100px]" />
            <div aria-hidden className="pointer-events-none absolute -right-24 bottom-0 h-64 w-64 rounded-full bg-emerald-500/10 blur-[110px]" />
            <h1
              id="hero-heading"
              className="fade-up max-w-5xl text-4xl font-bold tracking-tight text-white sm:text-6xl"
            >
              Your team is not slow. Your workflow is.
            </h1>
            <p className="fade-up fade-up-delay-1 mt-5 max-w-3xl text-xl leading-relaxed text-zinc-200 sm:text-2xl">
              I help operational teams find where work gets stuck, repeated, forgotten, or manually patched, then design cleaner systems around the tools they already use.
            </p>
            <div className="fade-up fade-up-delay-2 mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="#beta-audit"
                className="inline-flex items-center justify-center rounded-lg bg-emerald-400 px-5 py-3 text-sm font-bold text-black transition hover:bg-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:ring-offset-2 focus:ring-offset-zinc-950"
              >
                Request a Workflow Audit
              </a>
              <a
                href="#case-study-1"
                className="inline-flex items-center justify-center rounded-lg border border-sky-400/40 px-5 py-3 text-sm font-bold text-sky-100 transition hover:border-sky-300 hover:bg-sky-400/10 focus:outline-none focus:ring-2 focus:ring-sky-300 focus:ring-offset-2 focus:ring-offset-zinc-950"
              >
                See Proof
              </a>
            </div>
            <div className="fade-up fade-up-delay-2 mt-9 grid gap-3 sm:grid-cols-3">
              {[
                ["Manual drag", "Repeated work hiding in normal days"],
                ["Visibility gaps", "No clear answer for what is done"],
                ["Scaling cleanup", "Growth turns small misses into backlog"],
              ].map(([title, copy]) => (
                <div key={title} className="rounded-lg border border-white/10 bg-black/30 p-4">
                  <p className="text-sm font-bold uppercase tracking-[0.12em] text-fuchsia-300">{title}</p>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-300">{copy}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16" aria-labelledby="pain-heading">
        <div className="mx-auto w-full max-w-6xl px-6 lg:px-8">
          <h2 id="pain-heading" className="max-w-3xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
            The pain is usually hiding in the handoffs.
          </h2>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {painPoints.map((point, index) => (
              <article key={point} className="rounded-lg border border-white/5 bg-zinc-950 p-5">
                <p className="metric-highlight text-3xl">{String(index + 1).padStart(2, "0")}</p>
                <h3 className="mt-4 text-xl font-bold text-white">{point}</h3>
              </article>
            ))}
          </div>
        </div>
      </section>

      <CaseStudy
        kind="youtube"
        id="case-study-1"
        name="YouTube Migration"
        outcomeHeadline="180+ education videos migrated without turning every edit into a one-off."
        subtitle={<>The YouTube migration had repeat export steps and too much room for cleanup. I turned the repeat work into a cleaner production lane.</>}
        before={{
          title: "Manual Workflow",
          label: "Before",
          bullets: [
            "Each lesson handled as a separate edit",
            "Titles and files checked by hand",
            "Exports repeated one at a time",
            "Small misses created rework",
          ],
          indicators: [
            { icon: "🕐", label: "Time", value: "High", color: "status-high" },
            { icon: "⚠️", label: "Error rate", value: "Moderate", color: "status-moderate" },
            { icon: "📊", label: "Scalability", value: "Low", color: "status-low" },
          ],
        }}
        after={{
          title: "Cleaner Production Lane",
          label: "After",
          bullets: [
            "Lessons followed the same path",
            "File names stayed consistent",
            "Transcripts and exports moved together",
            "Review focused on quality, not cleanup",
          ],
          indicators: [
            { icon: "🕐", label: "Time", value: "Reduced", color: "status-reduced" },
            { icon: "✅", label: "Error rate", value: "Minimal", color: "status-minimal" },
            { icon: "📊", label: "Scalability", value: "High", color: "status-green" },
          ],
        }}
        metrics={[
          "180+ education videos migrated",
          "40+ hours organized",
          "Repeat work made consistent",
        ]}
      />

      <CaseStudy
        kind="sport"
        id="case-study-2"
        name="Sport Recruiting Pipeline"
        outcomeHeadline="140+ sport highlights delivered over 6 weeks."
        subtitle={<>Legacy workflow drag showed up in video status, athlete lookup, and repeated operator steps. The fix was clearer state and faster shortcuts.</>}
        before={{
          title: "Manual Workflow",
          label: "Before",
          bullets: [
            "Manual athlete lookup",
            "Unclear video status",
            "Repeated navigation",
            "Follow-up tracked by memory",
          ],
          indicators: [
            { icon: "🕐", label: "Time", value: "High", color: "status-high" },
            { icon: "⚠️", label: "Error rate", value: "High", color: "status-high" },
            { icon: "📊", label: "Scalability", value: "Low", color: "status-low" },
          ],
        }}
        after={{
          title: "Cleaner Operator Workflow",
          label: "After",
          bullets: [
            "Faster athlete search",
            "More visible video status",
            "Operator shortcuts",
            "Cleaner handoff points",
          ],
          indicators: [
            { icon: "🕐", label: "Time", value: "Minimal", color: "status-minimal" },
            { icon: "✅", label: "Error rate", value: "Near zero", color: "status-green" },
            { icon: "📊", label: "Scalability", value: "High", color: "status-green" },
          ],
        }}
        metrics={[
          "140+ highlights delivered",
          "6-week delivery window",
          "Legacy drag reduced",
        ]}
      />

      <section className="py-16 sm:py-20" aria-labelledby="audit-heading">
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
          <div>
            <h2 id="audit-heading" className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              The Workflow Audit
            </h2>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-zinc-300">
              A short, practical review of where work slows down, loses state, or creates cleanup.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {auditDeliverables.map((item) => (
              <article key={item} className="rounded-lg border border-white/10 bg-zinc-950 p-5 transition hover:border-emerald-400/50">
                <h3 className="text-xl font-bold text-white">{item}</h3>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20" aria-labelledby="positioning-heading">
        <div className="mx-auto w-full max-w-6xl px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(140deg,#071827_0%,#102348_46%,#2a1239_100%)] p-8 sm:p-12">
            <div aria-hidden className="pointer-events-none absolute -right-12 top-0 h-48 w-48 rounded-full bg-fuchsia-500/10 blur-[90px]" />
            <h2 id="positioning-heading" className="max-w-4xl text-3xl font-bold tracking-tight text-white sm:text-5xl">
              You do not need another dashboard. You need your workflow to tell the truth.
            </h2>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20" aria-labelledby="method-heading">
        <div className="mx-auto w-full max-w-6xl px-6 lg:px-8">
          <h2 id="method-heading" className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Method
          </h2>
          <div className="mt-8 grid gap-3 lg:grid-cols-5">
            {methodSteps.map((step, index) => (
              <article key={step} className="rounded-lg border border-white/5 bg-zinc-950 p-5">
                <p className="text-sm font-bold text-emerald-300">Step {index + 1}</p>
                <h3 className="mt-3 text-lg font-bold leading-snug text-white">{step}</h3>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="beta-audit" className="py-16 sm:py-20" aria-labelledby="beta-heading">
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <div>
            <h2 id="beta-heading" className="green-glow text-3xl font-bold tracking-tight text-white sm:text-5xl">
              Beta audits open.
            </h2>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-zinc-300">
              I am taking a limited number of discounted workflow audits while building public case studies.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-zinc-950 p-6">
            <h3 className="text-xl font-bold text-white">Best fit</h3>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
              {bestFits.map((fit) => (
                <li key={fit} className="rounded-lg border border-white/5 bg-black/30 px-4 py-3 text-sm font-semibold text-zinc-200">
                  {fit}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <CapabilitiesStrip capabilities={capabilities} />

      <section className="pb-20 pt-8 sm:pb-24" aria-labelledby="final-cta-heading">
        <div className="mx-auto w-full max-w-6xl px-6 lg:px-8">
          <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400 p-8 text-black sm:p-10">
            <h2 id="final-cta-heading" className="max-w-4xl text-3xl font-black tracking-tight sm:text-5xl">
              Stop asking your team to remember what the workflow should know.
            </h2>
            <a
              href="#beta-audit"
              className="mt-8 inline-flex items-center justify-center rounded-lg bg-black px-5 py-3 text-sm font-bold text-white transition hover:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 focus:ring-offset-emerald-400"
            >
              Request a Workflow Audit
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
