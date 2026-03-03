export type MetricsStripProps = {
  metrics: readonly [string, string, string];
};

export default function MetricsStrip({ metrics }: MetricsStripProps) {
  return (
    <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
      {metrics.map((metric) => (
        <p
          key={metric}
          className="rounded-lg border border-emerald-400/35 bg-zinc-950 px-4 py-3 text-sm font-semibold text-white shadow-[0_0_0_1px_rgba(16,185,129,0.2),0_0_20px_rgba(16,185,129,0.2)]"
        >
          {metric}
        </p>
      ))}
    </div>
  );
}
