export type CapabilitiesStripProps = {
  capabilities: readonly [string, string, string, string, string];
};

export default function CapabilitiesStrip({
  capabilities,
}: CapabilitiesStripProps) {
  return (
    <section className="py-16 sm:py-20" aria-labelledby="capabilities-heading">
      <div className="mx-auto w-full max-w-6xl px-6 lg:px-8">
        <h2 id="capabilities-heading" className="text-sm font-semibold uppercase tracking-[0.14em] text-zinc-500">
          Capabilities
        </h2>
        <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {capabilities.map((capability) => (
            <li
              key={capability}
              className="rounded-lg border border-zinc-800 bg-zinc-900/70 px-4 py-3 text-sm font-medium text-zinc-200"
            >
              {capability}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
