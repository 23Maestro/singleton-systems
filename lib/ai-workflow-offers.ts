export const AI_WORKFLOW_OFFERS = [
  { value: "start-with-one-thing", label: "Start With One Thing — $75" },
  { value: "build-it-for-me", label: "Build It for Me — $500 one-time" },
  { value: "keep-it-working", label: "Keep It Working — $500/month" },
  { value: "build-my-ai-system", label: "Build My AI System — $1,500" },
] as const;

export type AiWorkflowOffer = (typeof AI_WORKFLOW_OFFERS)[number]["value"];

export const AI_WORKFLOW_OFFER_VALUES = AI_WORKFLOW_OFFERS.map(({ value }) => value) as [
  AiWorkflowOffer,
  ...AiWorkflowOffer[],
];

export function isAiWorkflowOffer(value: unknown): value is AiWorkflowOffer {
  return typeof value === "string" && AI_WORKFLOW_OFFER_VALUES.includes(value as AiWorkflowOffer);
}

export function aiWorkflowOfferLabel(value: AiWorkflowOffer): string {
  return AI_WORKFLOW_OFFERS.find((offer) => offer.value === value)?.label ?? value;
}
