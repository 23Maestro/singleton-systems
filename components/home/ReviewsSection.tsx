import Image from "next/image";
import RevealText from "@/components/home/RevealText";

// Exact review text only (23M-160). Prospect ID review is from James Holcomb.
// Upwork reviews carry the email-signature Upwork mark. Unnamed ones are credited as "Upwork client".
const reviews = [
  {
    quote:
      "Jerami is a very organized and efficient videographer. He always brought unique ideas and solutions, and his creativity showed me he always had a passion to get better. He worked with us for a few years and made 100’s of high quality highlight and skills videos for high school athletes. Very pleased we hired and worked closely with Jerami.",
    name: "James Holcomb",
    source: "Prospect ID",
    upwork: false,
  },
  {
    quote:
      "Jerami was a joy to work with. He was very communicative on deadlines, his schedule and questions regarding the project. He took individual feedback incredibly quick and head on. Jerami created educational course videos for our company and we are very grateful for his work!",
    name: "Alex Hollis",
    source: "CEO, NurseHub",
    upwork: true,
  },
  {
    quote:
      "Jerami was very quick to respond, personable and easy to work with. He was happy to make edits quickly and with little direction. He showed good initiative. Overall I am really happy with what he produced for me.",
    name: "Upwork client",
    source: "Upwork",
    upwork: true,
  },
  {
    quote: "Very efficient work, done very well. Couldn't ask for anything more!",
    name: "Upwork client",
    source: "Upwork",
    upwork: true,
  },
  {
    quote: "Quick Response. Great Work. Very professional. Will recommend his servicess",
    name: "Upwork client",
    source: "Upwork",
    upwork: true,
  },
];

export default function ReviewsSection() {
  return (
    <section id="reviews" className="px-6 py-16 sm:px-8 sm:py-20 lg:px-10" aria-labelledby="reviews-heading">
      <div className="mx-auto max-w-6xl">
        <h2 id="reviews-heading" className="text-center text-4xl font-semibold tracking-normal sm:text-5xl">
          What People Say
        </h2>
        <ul className="mt-10 flex flex-wrap justify-center gap-5">
          {reviews.map((review) => (
            <li
              key={review.quote}
              className="flex w-full flex-col justify-between rounded-[2rem] border border-neutral-200/80 bg-white p-7 shadow-[0_16px_42px_rgba(15,23,42,0.06)] md:w-[calc(50%-0.625rem)] lg:w-[calc(33.333%-0.834rem)]"
            >
              <figure className="flex h-full flex-col">
                <RevealText as="blockquote" className="text-lg font-medium leading-relaxed text-neutral-800">
                  {`“${review.quote}”`}
                </RevealText>
                <figcaption className="mt-auto flex items-center pt-5 gap-2.5 text-sm font-semibold text-neutral-600">
                  {review.upwork ? (
                    <Image src="/email-signatures/upwork-50.png" alt="Upwork" width={22} height={22} className="h-[22px] w-[22px] rounded-md" />
                  ) : null}
                  <span>
                    <span className="text-neutral-950">{review.name}</span>
                    {review.source === "Upwork" ? null : <span>, {review.source}</span>}
                  </span>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
