import SplitCards, { type SplitCardData } from "./SplitCards";

export type CaseStudyProps = {
  id: string;
  outcomeHeadline: string;
  subtitle: string;
  before: SplitCardData;
  after: SplitCardData;
  metrics: readonly [string, string, string];
};

export default function CaseStudy({
  id,
  outcomeHeadline,
  subtitle,
  before,
  after,
  metrics,
}: CaseStudyProps) {
  return (
    <section className="py-16 sm:py-20" aria-labelledby={id}>
      <div className="mx-auto w-full max-w-6xl px-6 lg:px-8">
        <header className="mb-8 max-w-4xl">
          <h2 id={id} className="text-3xl font-semibold tracking-tight text-zinc-100 sm:text-4xl">
            {outcomeHeadline}
          </h2>
          <p className="mt-3 text-base text-zinc-400 sm:text-lg">{subtitle}</p>
        </header>
        <SplitCards before={before} after={after} metrics={metrics} />
      </div>
    </section>
  );
}
