import MetricsStrip from "./MetricsStrip";

export type SplitCardData = {
  title: string;
  label: string;
  bullets: readonly string[];
  indicators: readonly { icon: string; label: string; value: string; color: string }[];
};

export type SplitCardsProps = {
  before: SplitCardData;
  after: SplitCardData;
  metrics: readonly [string, string, string];
};

function DetailCard({ data, variant }: { data: SplitCardData; variant: "before" | "after" }) {
  const bg = variant === "before"
    ? "bg-[#1c2333]/90 border-[#2a3444]"
    : "bg-[#1e2a3d]/90 border-[#2d3f55]";

  return (
    <article className={`relative rounded-xl border p-6 backdrop-blur-sm ${bg}`}>
      {/* macOS window chrome */}
      <div className="mac-dots">
        <span></span>
        <span></span>
        <span></span>
      </div>

      <h4 className="text-xl font-bold text-zinc-50">{data.title}</h4>

      <ul className="mt-5 space-y-2.5 text-[15px] text-zinc-200">
        {data.bullets.map((bullet) => (
          <li key={bullet} className="flex items-start gap-2.5">
            <span aria-hidden className="mt-1.5 text-zinc-400">•</span>
            <span>{bullet}</span>
          </li>
        ))}
      </ul>

      {/* separator */}
      <div className="my-5 border-t border-zinc-600/40"></div>

      {/* arrow */}
      <p className="mb-4 text-center text-lg text-zinc-400">↓</p>

      {/* status indicators */}
      <div className="space-y-2.5">
        {data.indicators.map((ind) => (
          <div key={ind.label} className="status-row">
            <span className="icon">{ind.icon}</span>
            <span className="text-zinc-300">{ind.label}:</span>
            <span className={ind.color}>{ind.value}</span>
          </div>
        ))}
      </div>
    </article>
  );
}

export default function SplitCards({ before, after, metrics }: SplitCardsProps) {
  return (
    <div className="case-gradient rounded-2xl p-4 sm:p-8">
      <div className="relative z-10 grid gap-5 lg:grid-cols-2">
        <DetailCard data={before} variant="before" />
        <DetailCard data={after} variant="after" />
      </div>
      <div className="relative z-10">
        <MetricsStrip metrics={metrics} />
      </div>
    </div>
  );
}
