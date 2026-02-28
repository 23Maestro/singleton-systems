export type MetricsStripProps = {
  metrics: readonly [string, string, string];
};

export default function MetricsStrip({ metrics }: MetricsStripProps) {
  return (
    <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
      {metrics.map((metric) => (
        <p
          key={metric}
          className="rounded-lg border border-violet-500/20 bg-violet-950/30 px-4 py-3 text-sm font-semibold text-violet-200 backdrop-blur-sm"
        >
          {metric}
        </p>
      ))}
    </div>
  );
}
