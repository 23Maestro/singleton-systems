export type CapabilitiesStripProps = {
  capabilities: readonly string[];
};

export default function CapabilitiesStrip({
  capabilities,
}: CapabilitiesStripProps) {
  return (
    <section className="py-16 sm:py-20" aria-labelledby="capabilities-heading">
      <div className="mx-auto w-full max-w-6xl px-6 lg:px-8">
        <h2 id="capabilities-heading" className="blue-glow text-sm font-semibold uppercase tracking-[0.14em] text-sky-400 sm:text-base">
          Workflow Signals
        </h2>
        <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {capabilities.map((capability) => (
            <li
              key={capability}
              className="flex min-h-24 items-center justify-center rounded-lg border border-white/5 bg-zinc-950 p-5 text-center text-sm font-medium text-white transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-emerald-400/60 hover:shadow-2xl"
            >
              {capability}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
