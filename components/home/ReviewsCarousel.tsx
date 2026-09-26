"use client";

import Image from "next/image";
import { useReducedMotion } from "motion/react";
import { InfiniteSlider } from "@/components/motion-primitives/infinite-slider";

export type Review = {
  quote: string;
  name: string;
  role: string | null;
  upwork: boolean;
};

function ReviewCard({ review }: { review: Review }) {
  return (
    <figure
      data-review-card
      className="flex w-[19rem] shrink-0 flex-col self-stretch rounded-[2rem] border border-neutral-200/80 bg-white p-7 shadow-[0_16px_42px_rgba(15,23,42,0.07)] sm:w-[23rem] sm:p-8"
    >
      <blockquote className="text-lg font-medium leading-relaxed text-neutral-800">{`“${review.quote}”`}</blockquote>
      <figcaption className="mt-auto flex flex-col items-center gap-2 border-t border-neutral-200/80 pt-6 text-center">
        <span className="flex h-8 items-center justify-center" aria-hidden={!review.upwork}>
          {review.upwork ? (
            <Image src="/email-signatures/upwork-50.png" alt="Upwork" width={32} height={32} className="h-8 w-8 rounded-lg" />
          ) : null}
        </span>
        <span className="text-lg font-bold tracking-[-0.01em] text-neutral-950">{review.name}</span>
        <span className="min-h-6 text-base font-semibold text-neutral-500">{review.role ?? ""}</span>
      </figcaption>
    </figure>
  );
}

// Auto-scrolling review cards using the motion-primitives InfiniteSlider.
// Reduced-motion visitors get a static grid. Screen readers get one clean list.
export default function ReviewsCarousel({ reviews }: { reviews: Review[] }) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return (
      <ul className="mx-auto mt-10 flex max-w-6xl flex-wrap justify-center gap-5 px-6 sm:px-8 lg:px-10">
        {reviews.map((review) => (
          <li key={review.quote} className="flex">
            <ReviewCard review={review} />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="mt-10">
      <ul className="sr-only">
        {reviews.map((review) => (
          <li key={review.quote}>
            {review.quote} {review.name}
            {review.role ? `, ${review.role}` : ""}
          </li>
        ))}
      </ul>
      <div aria-hidden="true" className="[mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]">
        <InfiniteSlider gap={20} speed={32} speedOnHover={8} className="py-4">
          {reviews.map((review) => (
            <ReviewCard key={review.quote} review={review} />
          ))}
        </InfiniteSlider>
      </div>
    </div>
  );
}
