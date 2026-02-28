import CapabilitiesStrip from "@/components/CapabilitiesStrip";
import CaseStudy from "@/components/CaseStudy";

const capabilities = [
  "Creative Post-Production",
  "Workflow Automation (Python/Node)",
  "API Integrations",
  "FFmpeg / Headless Rendering",
  "Process Architecture",
] as const;

export default function Page() {
  return (
    <main>
      <section className="py-16 sm:py-20" aria-labelledby="hero-heading">
        <div className="mx-auto w-full max-w-6xl px-6 lg:px-8">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-8 sm:p-12">
            <h1 id="hero-heading" className="max-w-4xl text-4xl font-semibold tracking-tight text-zinc-50 sm:text-6xl">
              Scale Video Production. Eliminate Bottlenecks.
            </h1>
            <p className="mt-5 max-w-3xl text-lg text-zinc-300 sm:text-xl">
              I design and automate high-volume multimedia workflows that remove operational ceilings and multiply output by 2–3x.
            </p>
            <p className="mt-4 text-sm text-zinc-500">
              Hybrid creative + systems operator for education platforms, SaaS teams, and enterprise media.
            </p>
          </div>
        </div>
      </section>

      <CaseStudy
        id="case-study-1"
        outcomeHeadline="Unlocking capacity for a 180+ video curriculum migration."
        subtitle="Converted 38 hours of long-form educational content into a rapid-publishing system, bypassing traditional NLE bottlenecks."
        before={{
          title: "Before",
          label: "The Bottleneck",
          bullets: [
            "Manual timeline assembly",
            "Hand-stitched transcripts",
            "Tedious renaming",
            "Repetitive re-exports",
            "Throughput capped by human hours",
          ],
        }}
        after={{
          title: "After",
          label: "The Engine",
          bullets: [
            "Scripted FFmpeg concatenation",
            "Strict naming schemas",
            "Automated transcript merging",
            "Headless batch exports",
            "Standardized archive structure",
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
        outcomeHeadline="Stabilizing video delivery under 4x enrollment growth."
        subtitle="Rebuilt a fragile ingestion pipeline to sustain 140+ videos delivered over 6 weeks with zero manual debugging."
        before={{
          title: "Before",
          label: "The Bottleneck",
          bullets: [
            "Fragile profile parsing",
            "Legacy backend constraints",
            "Inconsistent HTML formatting",
            "Constant manual QC",
            "Capacity broke past 30/month",
          ],
        }}
        after={{
          title: "After",
          label: "The Engine",
          bullets: [
            "Deterministic API ingestion",
            "Data normalization layers",
            "Structured validation",
            "Automated routing",
            "Reduced failure points",
          ],
        }}
        metrics={[
          "Scaled from 30 to 70+/month",
          "Sustained 140 outputs in 6 weeks",
          "Eliminated manual data entry",
        ]}
      />

      <CapabilitiesStrip capabilities={capabilities} />
    </main>
  );
}
