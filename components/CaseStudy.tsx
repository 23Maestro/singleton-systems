import SplitCards, { type SplitCardData } from "./SplitCards";
import CaseStudyAccordions from "./CaseStudyAccordions";

export type CaseStudyProps = {
  id: string;
  name: string;
  outcomeHeadline: string;
  subtitle: string;
  before: SplitCardData;
  after: SplitCardData;
  metrics: readonly [string, string, string];
  kind: "youtube" | "sport";
};

export default function CaseStudy({
  id,
  name,
  outcomeHeadline,
  subtitle,
  before,
  after,
  metrics,
  kind,
}: CaseStudyProps) {
  return (
    <section className="relative py-16 sm:py-20" aria-labelledby={id}>
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-28 h-64 w-64 -translate-x-1/2 rounded-full bg-indigo-500/10 blur-[100px]" />
      <div className="mx-auto w-full max-w-6xl px-6 lg:px-8">
        <header className="fade-up mb-8 max-w-4xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-400">
            Case Study — {name}
          </p>
          <h2 id={id} className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {outcomeHeadline}
          </h2>
          <p className="mt-3 text-base text-zinc-400 sm:text-lg">{subtitle}</p>
        </header>
        <CaseStudyAccordions
          kind={kind}
          mainContent={<SplitCards before={before} after={after} metrics={metrics} />}
        />
      </div>
    </section>
  );
}
