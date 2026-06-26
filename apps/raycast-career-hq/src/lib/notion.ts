import { Client } from "@notionhq/client";
import { getPreferenceValues } from "@raycast/api";

import {
  ACTIVE_STATUSES,
  defaultMoneyPriority,
  isProjectLane,
  MoneyPriority,
  OPPORTUNITY_ASSIGNEE_USER_ID,
  OPPORTUNITY_PROJECTS_DATA_SOURCE_ID,
  OPPORTUNITY_TASKS_DATA_SOURCE_ID,
  Status,
  TimeOption,
  WorkBlock,
} from "./config";

type Preferences = {
  notionToken: string;
};

type SelectProperty = { select?: { name: string } | null };
type StatusProperty = { status?: { name: string } | null };
type TitleProperty = { title?: Array<{ plain_text: string }> };
type UrlProperty = { url?: string | null };
type DateProperty = { date?: { start?: string | null } | null };
type RelationProperty = { relation?: Array<{ id: string }> };

type OpportunityTaskProperties = {
  Task?: TitleProperty;
  Status?: StatusProperty;
  Time?: SelectProperty;
  "Money Priority"?: SelectProperty;
  Project?: RelationProperty;
  "Goal Horizon"?: SelectProperty;
  "Work Date"?: DateProperty;
  Block?: SelectProperty;
  Link?: UrlProperty;
  "Asset / Proof Link"?: UrlProperty;
};

type OpportunityProjectProperties = {
  Project?: TitleProperty;
  Stage?: SelectProperty;
};

export type OpportunityProjectSummary = {
  id: string;
  title: string;
  stage: string;
  url: string;
};

export type OpportunityTaskSummary = {
  id: string;
  title: string;
  status: string;
  time: string;
  moneyPriority: string;
  goalHorizon: string;
  projectIds: string[];
  projectTitle: string;
  workDate: string;
  block: string;
  link: string;
  assetProofLink: string;
  url: string;
};

export type CreateOpportunityTaskInput = {
  task: string;
  time: TimeOption;
  projectId: string;
  projectTitle: string;
  link?: string;
};

export type UpdateOpportunityTaskInput = {
  pageId: string;
  status?: Status;
  time?: TimeOption;
  moneyPriority?: MoneyPriority;
  projectId?: string;
  workDate?: string;
  block?: WorkBlock;
  link?: string;
  assetProofLink?: string;
};

function getNotion() {
  const preferences = getPreferenceValues<Preferences>();
  return new Client({ auth: preferences.notionToken });
}

export async function listOpportunityProjects() {
  const notion = getNotion();
  const response = await notion.dataSources.query({
    data_source_id: OPPORTUNITY_PROJECTS_DATA_SOURCE_ID,
    sorts: [{ timestamp: "last_edited_time", direction: "descending" }],
    page_size: 100,
  });

  const projects = response.results.map((page) => {
    const item = page as {
      id: string;
      url: string;
      properties: OpportunityProjectProperties;
    };

    return {
      id: item.id,
      title: titleText(item.properties.Project) || "Untitled",
      stage: selectName(item.properties.Stage),
      url: item.url,
    } satisfies OpportunityProjectSummary;
  });

  return projects.filter((project) => isProjectLane(project.title));
}

export async function createOpportunityTask(input: CreateOpportunityTaskInput) {
  const notion = getNotion();
  const properties: Record<string, unknown> = {
    Task: { title: [{ text: { content: input.task } }] },
    Status: { status: { name: "Queued" } },
    Assignee: { people: [{ id: OPPORTUNITY_ASSIGNEE_USER_ID }] },
    Time: { select: { name: input.time } },
    "Money Priority": {
      select: { name: defaultMoneyPriority(input.projectTitle) },
    },
    Project: { relation: [{ id: input.projectId }] },
  };

  if (input.link) {
    properties.Link = { url: input.link };
  }

  return notion.pages.create({
    parent: { data_source_id: OPPORTUNITY_TASKS_DATA_SOURCE_ID },
    properties,
  });
}

export async function listOpportunityTasks(
  options: { includeDone?: boolean } = {},
) {
  const projects = await listOpportunityProjects();
  const projectTitles = new Map(
    projects.map((project) => [project.id, project.title]),
  );
  const notion = getNotion();
  const response = await notion.dataSources.query({
    data_source_id: OPPORTUNITY_TASKS_DATA_SOURCE_ID,
    sorts: [{ timestamp: "last_edited_time", direction: "descending" }],
    page_size: 100,
  });

  return response.results
    .map((page) => {
      const item = page as {
        id: string;
        url: string;
        properties: OpportunityTaskProperties;
      };

      const projectIds =
        item.properties.Project?.relation?.map((relation) => relation.id) || [];
      const firstProjectId = projectIds[0] || "";

      return {
        id: item.id,
        title: titleText(item.properties.Task) || "Untitled",
        status: selectName(item.properties.Status),
        time: selectName(item.properties.Time),
        moneyPriority: selectName(item.properties["Money Priority"]),
        goalHorizon: selectName(item.properties["Goal Horizon"]),
        projectIds,
        projectTitle: firstProjectId
          ? projectTitles.get(firstProjectId) || ""
          : "",
        workDate: item.properties["Work Date"]?.date?.start || "",
        block: selectName(item.properties.Block),
        link: item.properties.Link?.url || "",
        assetProofLink: item.properties["Asset / Proof Link"]?.url || "",
        url: item.url,
      } satisfies OpportunityTaskSummary;
    })
    .filter(
      (task) =>
        options.includeDone || !["Done", "Parked"].includes(task.status),
    );
}

export async function listProofTasks() {
  const tasks = await listOpportunityTasks();
  return tasks.filter((task) => task.projectTitle === "Proof");
}

export async function updateOpportunityTask(input: UpdateOpportunityTaskInput) {
  const notion = getNotion();
  const properties: Record<string, unknown> = {};

  if (input.status) {
    properties.Status = { status: { name: input.status } };
  }
  if (input.time) {
    properties.Time = { select: { name: input.time } };
  }
  if (input.moneyPriority) {
    properties["Money Priority"] = { select: { name: input.moneyPriority } };
  }
  if (input.projectId !== undefined) {
    properties.Project = input.projectId
      ? { relation: [{ id: input.projectId }] }
      : { relation: [] };
  }
  if (input.workDate !== undefined) {
    properties["Work Date"] = input.workDate
      ? { date: { start: input.workDate } }
      : { date: null };
  }
  if (input.block) {
    properties.Block = { select: { name: input.block } };
  }
  if (input.link !== undefined) {
    properties.Link = { url: input.link || null };
  }
  if (input.assetProofLink !== undefined) {
    properties["Asset / Proof Link"] = { url: input.assetProofLink || null };
  }
  if (Object.keys(properties).length === 0) {
    return;
  }

  await notion.pages.update({ page_id: input.pageId, properties });
}

export async function appendOpportunityTaskBodyText(
  task: OpportunityTaskSummary,
  text: string,
) {
  const notion = getNotion();
  await notion.blocks.children.append({
    block_id: task.id,
    children: [{ paragraph: { rich_text: [{ text: { content: text } }] } }],
  });
}

export function isActiveStatus(status: string) {
  return (ACTIVE_STATUSES as readonly string[]).includes(status);
}

function titleText(property?: TitleProperty) {
  return property?.title?.map((part) => part.plain_text).join("") || "";
}

function selectName(property?: SelectProperty | StatusProperty) {
  if (!property) {
    return "";
  }
  if ("select" in property) {
    return property.select?.name || "";
  }
  return property.status?.name || "";
}
