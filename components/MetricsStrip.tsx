export type MetricsStripProps = {
  metrics: readonly [string, string, string];
};

export default function MetricsStrip({ metrics }: MetricsStripProps) {
  return (
    <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
      {metrics.map((metric) => (
        <p
          key={metric}
          className="rounded-lg border border-white/5 bg-zinc-950 px-4 py-3 text-sm font-semibold text-zinc-400 shadow-2xl"
        >
          {metric}
        </p>
      ))}
    </div>
  );
}
