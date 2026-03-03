import CapabilitiesStrip from "@/components/CapabilitiesStrip";
import CaseStudy from "@/components/CaseStudy";

const capabilities = [
  "Video Editing & Post",
  "Custom Automation",
  "API-Powered Workflows",
  "Programmatic Video",
  "Systems Design",
] as const;

export default function Page() {
  return (
    <main className="relative overflow-hidden bg-black">
      <section className="py-16 sm:py-20" aria-labelledby="hero-heading">
        <div className="mx-auto w-full max-w-6xl px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-zinc-950 p-8 shadow-2xl sm:p-12">
            <div aria-hidden className="pointer-events-none absolute -left-16 top-0 h-56 w-56 rounded-full bg-indigo-500/10 blur-[100px]" />
            <h1
              id="hero-heading"
              className="fade-up max-w-4xl text-4xl font-bold tracking-tight text-white sm:text-5xl"
            >
              Video Production, Engineered.
            </h1>
            <p className="fade-up fade-up-delay-1 mt-5 max-w-3xl text-xl leading-relaxed text-zinc-200 sm:text-2xl">
              High-volume post-production scaled <span className="green-glow font-semibold text-emerald-300">3x</span> by custom code.
            </p>
            <p className="fade-up fade-up-delay-2 mt-4 text-base text-zinc-300 sm:text-lg">
              Video editor and systems builder for education, sports, and media teams.
            </p>
          </div>
        </div>
      </section>

      <CaseStudy
        kind="youtube"
        id="case-study-1"
        name="YouTube Migration"
        outcomeHeadline="180+ videos migrated. Driven by Automation."
        subtitle={<>I turned <span className="green-glow font-semibold text-emerald-300">40+</span> hours of long-form lessons into an automated system.</>}
        before={{
          title: "Manual Workflow",
          label: "Before",
          bullets: [
            "Open lesson",
            "Drag into timeline",
            "Rename manually",
            "Re-export",
          ],
          indicators: [
            { icon: "🕐", label: "Time", value: "High", color: "status-high" },
            { icon: "⚠️", label: "Error rate", value: "Moderate", color: "status-moderate" },
            { icon: "📊", label: "Scalability", value: "Low", color: "status-low" },
          ],
        }}
        after={{
          title: "Automated Workflow",
          label: "After",
          bullets: [
            "FFmpeg concat script",
            "Structured naming schema",
            "Transcript merge automation",
            "Batch export",
          ],
          indicators: [
            { icon: "🕐", label: "Time", value: "Reduced", color: "status-reduced" },
            { icon: "✅", label: "Error rate", value: "Minimal", color: "status-minimal" },
            { icon: "📊", label: "Scalability", value: "High", color: "status-green" },
          ],
        }}
        metrics={[
          "80% of migration automated",
          "3x faster turnaround",
          "Zero export errors",
        ]}
      />

      <CaseStudy
        kind="sport"
        id="case-study-2"
        name="Sport Recruiting Pipeline"
        outcomeHeadline="140+ sport highlights delivered over 6 weeks."
        subtitle={<>I modernized a legacy intake system to handle <span className="green-glow font-semibold text-emerald-300">2x</span> enrollment growth.</>}
        before={{
          title: "Manual Workflow",
          label: "Before",
          bullets: [
            "Manual data lookups",
            "Copy-paste formatting",
            "Inconsistent file naming",
            "Constant QC by hand",
          ],
          indicators: [
            { icon: "🕐", label: "Time", value: "High", color: "status-high" },
            { icon: "⚠️", label: "Error rate", value: "High", color: "status-high" },
            { icon: "📊", label: "Scalability", value: "Low", color: "status-low" },
          ],
        }}
        after={{
          title: "Automated Workflow",
          label: "After",
          bullets: [
            "API-powered intake",
            "Auto-formatted profiles",
            "Validated naming conventions",
            "Hands-off routing",
          ],
          indicators: [
            { icon: "🕐", label: "Time", value: "Minimal", color: "status-minimal" },
            { icon: "✅", label: "Error rate", value: "Near zero", color: "status-green" },
            { icon: "📊", label: "Scalability", value: "High", color: "status-green" },
          ],
        }}
        metrics={[
          "Scaled from 30 to 70+ month",
          "140 outputs in 6 weeks",
          "Eliminated manual data entry",
        ]}
      />

      <CapabilitiesStrip capabilities={capabilities} />
    </main>
  );
}
