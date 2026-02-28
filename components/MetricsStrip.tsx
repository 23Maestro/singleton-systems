export type MetricsStripProps = {
  metrics: readonly [string, string, string];
};

export default function MetricsStrip({ metrics }: MetricsStripProps) {
  return (
    <div className="mt-6 grid grid-cols-1 gap-3 border-t border-zinc-800 pt-4 sm:grid-cols-3">
      {metrics.map((metric) => (
        <p
          key={metric}
          className="rounded-md border border-zinc-800 bg-zinc-900/70 px-3 py-2 text-xs font-medium text-zinc-200"
        >
          {metric}
        </p>
      ))}
    </div>
  );
}
