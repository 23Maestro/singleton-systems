import MetricsStrip from "./MetricsStrip";

export type SplitCardData = {
  title: string;
  label: string;
  bullets: readonly string[];
};

export type SplitCardsProps = {
  before: SplitCardData;
  after: SplitCardData;
  metrics: readonly [string, string, string];
};

function DetailCard({ data }: { data: SplitCardData }) {
  return (
    <article className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-6">
      <p className="text-xs uppercase tracking-wide text-zinc-500">{data.label}</p>
      <h4 className="mt-2 text-lg font-semibold text-zinc-100">{data.title}</h4>
      <ul className="mt-4 space-y-2 text-sm text-zinc-300">
        {data.bullets.map((bullet) => (
          <li key={bullet} className="flex items-start gap-2">
            <span aria-hidden className="mt-1.5 h-1.5 w-1.5 rounded-full bg-zinc-500" />
            <span>{bullet}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}

export default function SplitCards({ before, after, metrics }: SplitCardsProps) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-4 sm:p-6">
      <div className="grid gap-4 lg:grid-cols-2">
        <DetailCard data={before} />
        <DetailCard data={after} />
      </div>
      <MetricsStrip metrics={metrics} />
    </div>
  );
}
