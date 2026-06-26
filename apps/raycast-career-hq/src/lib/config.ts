export const EAGLE_HOST = "127.0.0.1";
export const EAGLE_PORT = 41595;
export const EAGLE_LIBRARY_PATH_FRAGMENT = "Workflow Docs.library";

export const OPPORTUNITY_TASKS_DATA_SOURCE_ID =
  "625c153d-4dad-41f9-b328-9b67e7479782";

export const OPPORTUNITY_PROJECTS_DATA_SOURCE_ID =
  "f8999c09-6aa3-4c27-b573-d7bb7cc1b101";

export const OPPORTUNITY_ASSIGNEE_USER_ID =
  "b76e5292-4604-4fa0-9220-fd4fe23b5c3a";

export const PROJECT_LANES = [
  "Cash Jobs",
  "Career Jobs",
  "Freelance",
  "Offer",
  "Proof",
] as const;

export const STATUSES = [
  "Queued",
  "Today",
  "In Motion",
  "Waiting",
  "Done",
  "Parked",
] as const;

export const ACTIVE_STATUSES = [
  "Queued",
  "Today",
  "In Motion",
  "Waiting",
] as const;

export const TIME_OPTIONS = [
  "5m",
  "15m",
  "30m",
  "45m",
  "60m",
  "90m",
  "2h",
  "4h+",
] as const;

export const MONEY_PRIORITIES = ["Critical", "Strategic", "Later"] as const;

export const BLOCKS = [
  "Morning",
  "Midday",
  "Afternoon",
  "Evening",
  "Late",
] as const;

export const GOAL_HORIZONS = [
  "End of W1",
  "End of W2",
  "End of W3",
  "End of Month",
  "Next Month",
  "6 Months",
  "Long Term",
] as const;

export const PROJECT_STAGES = ["To Do", "In Progress", "Done"] as const;

export type ProjectLane = (typeof PROJECT_LANES)[number];
export type Status = (typeof STATUSES)[number];
export type TimeOption = (typeof TIME_OPTIONS)[number];
export type MoneyPriority = (typeof MONEY_PRIORITIES)[number];
export type WorkBlock = (typeof BLOCKS)[number];
export type GoalHorizon = (typeof GOAL_HORIZONS)[number];

export const SOURCE_FOLDERS = [
  { id: "MQK5L9QNILT9D", label: "00 Inbox" },
  { id: "MQK5L9HLS99O3", label: "01 Video Proof" },
  { id: "MQK5L9KNPGJYA", label: "02 Workflow Proof" },
  { id: "MQK5L9P1YVOB2", label: "03 Website Assets" },
  { id: "MQK5L9NN39EUH", label: "04 Personal Systems" },
  { id: "MQK5L9G3EWQ6N", label: "99 Archive" },
] as const;

export const UNIVERSAL_TAGS = [
  "video",
  "workflow",
  "website",
  "codex",
  "proof",
  "npid",
  "freelance",
  "career",
] as const;

export function isProjectLane(value: string): value is ProjectLane {
  return (PROJECT_LANES as readonly string[]).includes(value);
}

export function defaultMoneyPriority(projectName: string): MoneyPriority {
  return projectName === "Cash Jobs" ||
    projectName === "Career Jobs" ||
    projectName === "Freelance"
    ? "Critical"
    : "Strategic";
}
