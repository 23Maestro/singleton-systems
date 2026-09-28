export const AI_WORKFLOW_OFFERS = [
  { value: "start-with-one-thing", label: "First Problem Solved Free", notionLabel: "First Problem Solved Free" },
  { value: "build-it-for-me", label: "One More Workflow — $500 one-time", notionLabel: "One More Workflow — $500 one-time" },
  { value: "keep-it-working", label: "Keep It Working — $1,500/month", notionLabel: "Keep It Working — $1,500/month" },
  { value: "build-my-ai-system", label: "Build My AI System — $2,500", notionLabel: "Build My AI System — $2.5K" },
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

export function notionAiWorkflowOfferLabel(value: AiWorkflowOffer): string {
  return AI_WORKFLOW_OFFERS.find((offer) => offer.value === value)?.notionLabel ?? value;
}
