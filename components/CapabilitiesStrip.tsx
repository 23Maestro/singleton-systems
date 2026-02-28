export type CapabilitiesStripProps = {
  capabilities: readonly string[];
};

export default function CapabilitiesStrip({
  capabilities,
}: CapabilitiesStripProps) {
  return (
    <section className="py-16 sm:py-20" aria-labelledby="capabilities-heading">
      <div className="mx-auto w-full max-w-6xl px-6 lg:px-8">
        <h2 id="capabilities-heading" className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-400">
          What I Work With
        </h2>
        <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {capabilities.map((capability) => (
            <li
              key={capability}
              className="rounded-lg border border-zinc-700/60 bg-zinc-800/50 px-4 py-3 text-sm font-medium text-zinc-200 transition-colors hover:border-violet-500/30 hover:bg-violet-950/20"
            >
              {capability}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
