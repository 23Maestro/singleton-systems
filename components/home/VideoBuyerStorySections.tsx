const alternatives = [
  { title: "Editing It Yourself", body: "You finish recording, then spend the evening cutting footage and rebuilding graphics." },
  { title: "Briefing a New Editor", body: "Each new editor needs time to learn your style before the videos start to feel like yours." },
  { title: "Buying Quick Clips", body: "You have a few clips to post, but the full episode is still waiting to be edited." },
];

export function VideoTriedSection() {
  return <section id="tried" className="px-6 py-16 sm:px-8 sm:py-20 lg:px-10" aria-labelledby="tried-heading"><div className="mx-auto max-w-5xl">
    <h2 id="tried-heading" className="text-center text-4xl font-semibold tracking-normal sm:text-5xl">The Editing Shouldn’t Take Over Your Week</h2>
    <div className="mt-10 grid gap-5 sm:grid-cols-3">{alternatives.map((item) => <article key={item.title} className="rounded-[2rem] border border-neutral-200/80 bg-white p-7 shadow-[0_16px_42px_rgba(15,23,42,0.06)]"><h3 className="text-xl font-bold tracking-[-0.02em]">{item.title}</h3><p className="mt-3 text-lg font-medium leading-relaxed text-neutral-600">{item.body}</p></article>)}</div>
  </div></section>;
}
export function VideoRealProblemSection() {
  return <section id="real-problem" className="px-6 py-16 sm:px-8 sm:py-20 lg:px-10" aria-labelledby="real-problem-heading"><div className="mx-auto max-w-3xl text-center">
    <h2 id="real-problem-heading" className="text-4xl font-semibold tracking-normal sm:text-5xl">The Next Video Should Already Feel Like Yours</h2>
    <p className="mt-6 text-balance text-xl font-medium leading-relaxed text-neutral-700">I build reusable Figma graphics for Lineups’ sports betting videos so each episode carries the same look. Once we lock in your style, I keep your fonts, colors and titles with the project, ready for your next recording.</p>
  </div>
    <div className="mx-auto mt-10 grid max-w-5xl gap-6 lg:grid-cols-2">
      <figure className="overflow-hidden rounded-[1.5rem] border border-neutral-200 bg-white">
        <video className="aspect-video w-full bg-[#1b1b1b]" src="/portfolio/video-offer/catena-figma-reel.mp4" poster="/portfolio/video-offer/catena-figma-reel-poster.jpg" aria-label="Lineups Figma Graphics" controls playsInline muted loop preload="none" />
        <figcaption className="px-6 py-5 text-lg font-semibold">Lineups Figma Graphics</figcaption>
      </figure>
      <figure className="overflow-hidden rounded-[1.5rem] border border-neutral-200 bg-white">
        <video className="aspect-video w-full bg-black" src="/portfolio/video-offer/jaguars-graphics.mp4" poster="/portfolio/video-offer/jaguars-graphics-poster.jpg" aria-label="Jaguars Finished Edit" controls playsInline muted loop preload="none" />
        <figcaption className="px-6 py-5 text-lg font-semibold">Jaguars Finished Edit</figcaption>
      </figure>
    </div>
  </section>;
}
