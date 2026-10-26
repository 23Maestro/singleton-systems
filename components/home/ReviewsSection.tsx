import RevealText from "@/components/home/RevealText";
import ReviewsCarousel, { type Review } from "@/components/home/ReviewsCarousel";
import YouTubeSample from "@/components/home/YouTubeSample";
import { CLIENT_TESTIMONIAL } from "@/lib/video-portfolio";

// Exact review text only (23M-160). Upwork reviews carry the email-signature Upwork mark.
const reviews: Review[] = [
  {
    quote:
      "Jerami is a very organized and efficient videographer. He always brought unique ideas and solutions, and his creativity showed me he always had a passion to get better. He worked with us for a few years and made 100’s of high quality highlight and skills videos for high school athletes. Very pleased we hired and worked closely with Jerami.",
    name: "James Holcomb",
    role: "CEO, Prospect ID",
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
    quote: "Quick Response. Great Work. Very professional. Will recommend his services",
    name: "Upwork Client",
    role: null,
    upwork: true,
  },
];

export default function ReviewsSection({ videoTestimonial = false }: { videoTestimonial?: boolean }) {
  return (
    <section id="reviews" className="py-16 sm:py-20" aria-labelledby="reviews-heading">
      <div className="mx-auto max-w-6xl px-6 sm:px-8 lg:px-10">
        <h2 id="reviews-heading" className="text-center text-4xl font-semibold tracking-normal sm:text-5xl">
          <RevealText as="span">What People Say</RevealText>
        </h2>
        {videoTestimonial && <dl className="mx-auto mt-10 grid max-w-4xl grid-cols-1 gap-7 text-center sm:grid-cols-3">
          <div><dt className="text-base font-medium text-neutral-600">Clients across platforms</dt><dd className="mt-2 text-4xl font-bold">20+</dd></div>
          <div><dt className="text-base font-medium text-neutral-600">Earned on Upwork</dt><dd className="mt-2 text-4xl font-bold">$30K+</dd></div>
          <div><dt className="text-base font-medium text-neutral-600">Upwork rating</dt><dd className="mt-2 text-4xl font-bold">4.9/5</dd></div>
        </dl>}
        {videoTestimonial && <p className="mx-auto mt-6 max-w-3xl text-center text-lg leading-relaxed text-neutral-700">At Prospect ID, I increased my output from 30 to 70 athlete videos a month, working solo.</p>}
      </div>
      <ReviewsCarousel reviews={reviews} />
      {videoTestimonial && <div className="mx-auto mt-10 max-w-2xl px-6 sm:px-8"><YouTubeSample sample={CLIENT_TESTIMONIAL} /></div>}
    </section>
  );
}
