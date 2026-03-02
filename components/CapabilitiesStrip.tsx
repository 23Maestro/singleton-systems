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
              className="rounded-lg border border-white/5 bg-zinc-950 px-4 py-3 text-sm font-medium text-zinc-400 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-white/15 hover:shadow-2xl"
            >
              {capability}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
