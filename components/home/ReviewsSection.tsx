import RevealText from "@/components/home/RevealText";
import ReviewsCarousel, { type Review } from "@/components/home/ReviewsCarousel";

// Exact review text only (23M-160). Upwork reviews carry the email-signature Upwork mark.
const reviews: Review[] = [
  {
    quote:
      "Jerami is a very organized and efficient videographer. He always brought unique ideas and solutions, and his creativity showed me he always had a passion to get better. He worked with us for a few years and made 100’s of high quality highlight and skills videos for high school athletes. Very pleased we hired and worked closely with Jerami.",
    name: "James Holcomb",
    role: "Prospect ID",
    upwork: false,
  },
  {
    quote:
      "Jerami was a joy to work with. He was very communicative on deadlines, his schedule and questions regarding the project. He took individual feedback incredibly quick and head on. Jerami created educational course videos for our company and we are very grateful for his work!",
    name: "Alex Hollis",
    role: "CEO, NurseHub",
    upwork: true,
  },
  {
    quote:
      "Jerami was very quick to respond, personable and easy to work with. He was happy to make edits quickly and with little direction. He showed good initiative. Overall I am really happy with what he produced for me.",
    name: "Upwork Client",
    role: null,
    upwork: true,
  },
  {
    quote: "Very efficient work, done very well. Couldn't ask for anything more!",
    name: "Upwork Client",
    role: null,
    upwork: true,
  },
  {
    quote: "Quick Response. Great Work. Very professional. Will recommend his servicess",
    name: "Upwork Client",
    role: null,
    upwork: true,
  },
];

export default function ReviewsSection() {
  return (
    <section id="reviews" className="py-16 sm:py-20" aria-labelledby="reviews-heading">
      <div className="mx-auto max-w-6xl px-6 sm:px-8 lg:px-10">
        <h2 id="reviews-heading" className="text-center text-4xl font-semibold tracking-normal sm:text-5xl">
          <RevealText as="span">What People Say</RevealText>
        </h2>
      </div>
      <ReviewsCarousel reviews={reviews} />
    </section>
  );
}
