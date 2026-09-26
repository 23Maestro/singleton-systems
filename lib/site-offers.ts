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

export const FIRST_BUILD_CREDIT_LINE = "Choose any package within 14 days and the $75 comes off the price.";

export const START_WITH_ONE_THING: SiteOffer = {
  value: "start-with-one-thing",
  name: "Start With One Thing",
  price: 75,
  display: "$75",
  cadence: "one-time",
  summary: `Your first task built and tested on 2 real examples. ${FIRST_BUILD_CREDIT_LINE}`,
};

export const BUILD_IT_FOR_ME: SiteOffer = {
  value: "build-it-for-me",
  name: "Build It for Me",
  price: 500,
  display: "$500",
  cadence: "one-time",
  summary: "Turn 1 repeated task into a tested workflow you can keep using.",
};

export const KEEP_IT_WORKING: SiteOffer = {
  value: "keep-it-working",
  name: "Keep It Working",
  price: 500,
  display: "$500",
  cadence: "month",
  summary: "Keep expanding the working foundation as your business changes.",
};

export const BUILD_MY_AI_SYSTEM: SiteOffer = {
  value: "build-my-ai-system",
  name: "Build My AI System",
  price: 1500,
  display: "$1,500",
  cadence: "one-time",
  summary: "Put your business knowledge into a working foundation, then build the 3 repeated workflows costing you the most time.",
};

export const SITE_OFFERS = [START_WITH_ONE_THING, BUILD_IT_FOR_ME, BUILD_MY_AI_SYSTEM, KEEP_IT_WORKING] as const;

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
