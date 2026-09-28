// Display and pricing data shared by the homepage and landing pages.
// Offer values match lib/ai-workflow-offers.ts, which owns intake and Notion labels.
import type { AiWorkflowOffer } from "@/lib/ai-workflow-offers";
import { AI_WORKFLOW_SESSION_URL } from "@/app/site";

export type SiteOffer = {
  value: AiWorkflowOffer;
  name: string;
  price: number;
  display: string;
  cadence: "one-time" | "month";
  summary: string;
};

export const FIRST_FIX_LIMIT_LINE = "One simple task, built in your own AI account. Bigger jobs use the options below.";

export const START_WITH_ONE_THING: SiteOffer = {
  value: "start-with-one-thing",
  name: "First Problem Solved Free",
  price: 0,
  display: "Free",
  cadence: "one-time",
  summary: "On a free call we pick one simple task that eats your week. I build the fix and hand it over with written steps.",
};

export const BUILD_IT_FOR_ME: SiteOffer = {
  value: "build-it-for-me",
  name: "One More Workflow",
  price: 500,
  display: "$500",
  cadence: "one-time",
  summary: "Liked the first one? I build 1 more repeated task, test it on your real examples, and write it up so your team can run it. One payment and we're done.",
};

export const KEEP_IT_WORKING: SiteOffer = {
  value: "keep-it-working",
  name: "Keep It Working",
  price: 1500,
  display: "$1,500",
  cadence: "month",
  summary: "2 new workflows every month, and I keep everything we built running as your business changes.",
};

export const BUILD_MY_AI_SYSTEM: SiteOffer = {
  value: "build-my-ai-system",
  name: "Build My AI System",
  price: 2500,
  display: "$2,500",
  cadence: "one-time",
  summary: "For businesses that need 3 or more workflows now. I set up a foundation with your business knowledge, then build the workflows costing you the most time over 60 days.",
};

export const SITE_OFFERS = [START_WITH_ONE_THING, BUILD_IT_FOR_ME, KEEP_IT_WORKING, BUILD_MY_AI_SYSTEM] as const;

export function offerUrl(offer: AiWorkflowOffer) {
  return `${AI_WORKFLOW_SESSION_URL}?offer=${offer}`;
}

// schema.org Offer with a monthly unit when the price recurs.
export function offerJsonLd(offer: SiteOffer) {
  const base = { "@type": "Offer", name: offer.name, description: offer.summary, priceCurrency: "USD" };
  if (offer.cadence === "month") {
    return {
      ...base,
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: offer.price,
        priceCurrency: "USD",
        unitText: "MONTH",
      },
    };
  }
  return { ...base, price: offer.price };
}
