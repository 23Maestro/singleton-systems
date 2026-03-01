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
    <main>
      <section className="py-16 sm:py-20" aria-labelledby="hero-heading">
        <div className="mx-auto w-full max-w-6xl px-6 lg:px-8">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-8 sm:p-12">
            <h1
              id="hero-heading"
              className="fade-up max-w-4xl text-4xl font-bold tracking-tight text-zinc-50 sm:text-5xl"
            >
              I produce the edits. I code the workflow.
            </h1>
            <p className="fade-up fade-up-delay-1 mt-5 max-w-3xl text-lg leading-relaxed text-gray-400 sm:text-xl">
              Video editing. <span className="font-semibold text-emerald-400">Scaled 3x</span> by automation.
            </p>
            <p className="fade-up fade-up-delay-2 mt-4 text-sm text-zinc-500">
              Video editor and systems builder for education, sports, and media teams.
            </p>
          </div>
        </div>
      </section>

      <CaseStudy
        id="case-study-1"
        name="YouTube Migration"
        outcomeHeadline="180+ videos migrated. Zero timeline babysitting."
        subtitle="I turned 38 hours of long-form lessons into a rapid-publish system — reducing timespent in Premiere."
        before={{
          title: "Manual Workflow",
          label: "Before",
          bullets: [
            "Open lesson",
            "Drag into timeline",
            "Concatenate",
            "Rename manually",
            "Stitch transcript",
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
        id="case-study-2"
        name="Sport Recruiting Pipeline"
        outcomeHeadline="140+ recruiting videos delivered in 6 weeks. No hand-holding."
        subtitle="I modernized a broken intake system to handle 4x enrollment growth — on autopilot."
        before={{
          title: "Manual Workflow",
          label: "Before",
          bullets: [
            "Manual data lookups",
            "Copy-paste formatting",
            "Inconsistent file naming",
            "Constant QC by hand",
            "Maxed at 30/month",
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
          "Scaled from 30 to 70+/month",
          "140 outputs in 6 weeks",
          "Eliminated manual data entry",
        ]}
      />

      <CapabilitiesStrip capabilities={capabilities} />
    </main>
  );
}
