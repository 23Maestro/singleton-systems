// Homepage buyer story, ordered from the "hard to explain service" homepage sequence:
// what they tried (alternatives), the real problem (reframe + cost), and proof from real work.
// Copy follows docs/harness/writing-rules.md and is checked by tests/homepage-copy.test.mjs.

const alternatives = [
  {
    title: "Hiring More Help",
    body: "More people doing the same clicks. The cost goes up and the steps stay the same.",
  },
  {
    title: "Buying a New App",
    body: "Another login your team avoids. The work still lives in the old system.",
  },
  {
    title: "Trying ChatGPT on Your Own",
    body: "Good answers in a chat window. Nothing changed in how the work actually gets done.",
  },
];

export function TriedSection() {
  return (
    <section id="tried" className="px-6 py-16 sm:px-8 sm:py-20 lg:px-10" aria-labelledby="tried-heading">
      <div className="mx-auto max-w-5xl">
        <h2 id="tried-heading" className="text-center text-4xl font-semibold tracking-normal sm:text-5xl">
          You Have Probably Tried This Already
        </h2>
        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          {alternatives.map((item) => (
            <article key={item.title} className="rounded-[2rem] border border-neutral-200/80 bg-white p-7 shadow-[0_16px_42px_rgba(15,23,42,0.06)]">
              <h3 className="text-xl font-bold tracking-[-0.02em]">{item.title}</h3>
              <p className="mt-3 text-base font-medium leading-relaxed text-neutral-600">{item.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function RealProblemSection() {
  return (
    <section id="real-problem" className="px-6 py-16 sm:px-8 sm:py-20 lg:px-10" aria-labelledby="real-problem-heading">
      <div className="mx-auto max-w-3xl text-center">
        <h2 id="real-problem-heading" className="text-4xl font-semibold tracking-normal sm:text-5xl">
          Your Software Is Fine. The Steps Around It Are the Problem.
        </h2>
        <p className="mt-6 text-balance text-xl font-medium leading-relaxed text-neutral-700">
          Every week those steps stay, you pay for them in hours. I find them and build a way around them that your team can run.
        </p>
      </div>
    </section>
  );
}

export function ProofSection() {
  return (
    <section id="proof" className="px-6 py-16 sm:px-8 sm:py-20 lg:px-10" aria-labelledby="proof-heading">
      <div className="mx-auto max-w-5xl">
        <h2 id="proof-heading" className="text-center text-4xl font-semibold tracking-normal sm:text-5xl">
          Proof From Real Work
        </h2>
        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          <article className="flex flex-col rounded-[2rem] border-2 border-black bg-white p-7 sm:p-8">
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-[#075985]">Prospect ID</p>
            <h3 className="mt-3 text-3xl font-bold tracking-[-0.035em]">An Old System That Got Fast</h3>
            <p className="mt-4 text-lg font-medium leading-relaxed text-neutral-700">
              Prospect ID ran on a website more than 15 years old. Every highlight video meant a long list of manual clicks. I got the computer to do the clicking.
            </p>
            <p className="mt-4 text-lg font-bold leading-relaxed">
              My output went from 30 videos a month to 70, by myself.
            </p>
          </article>
          <article className="flex flex-col rounded-[2rem] border border-neutral-200/80 bg-white p-7 sm:p-8">
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-[#126f39]">Catena Media</p>
            <h3 className="mt-3 text-3xl font-bold tracking-[-0.035em]">The Same Thinking, Used on Video</h3>
            <p className="mt-4 text-lg font-medium leading-relaxed text-neutral-700">
              Before I start editing, I know what footage I have, what is missing, and which graphics need building.
            </p>
            <p className="mt-4 text-base font-medium leading-relaxed text-neutral-600">
              Transcripts, footage checks, and review pages happen first. The edit goes faster because nothing surprises me halfway through.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
