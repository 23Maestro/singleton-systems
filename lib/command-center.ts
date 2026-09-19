import { supabaseRest } from "@/lib/supabase-rest";

export const LANES = [
  "AI Consultant",
  "Content Editor",
  "Development",
] as const;
export type Lane = (typeof LANES)[number];
export type Contact = {
  id: number;
  name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  lane: Lane;
  status: string;
  relationship_context: string | null;
  notes: string | null;
  next_action: string | null;
  next_action_at: string | null;
  updated_at: string;
  linear_project_id: string | null;
  invoice_url: string | null;
  payment_note: string | null;
  source_url: string | null;
};
export type Interaction = {
  id: string;
  contact_id: number;
  channel: string;
  summary: string;
  occurred_at: string;
  external_url: string | null;
};
export type Block = {
  id: string;
  owner: "linear" | "notion" | "home" | "crm";
  owner_id: string;
  selected_date: string;
  starts_at: string | null;
  ends_at: string | null;
};
export type Draft = {
  id: string;
  title: string;
  lane: Lane;
  subject: string;
  body: string;
};
export type WorkItem = {
  id: string;
  owner: "linear" | "notion";
  title: string;
  url: string;
  dueDate: string | null;
  status: string;
  lane: Lane;
  blocked: boolean;
  projectId?: string | null;
  projectName?: string | null;
};

const linearIssuesQuery = `query CommandCenterIssues($after: String) {
  issues(first: 100, after: $after, filter: { state: { name: { in: ["Todo", "In Progress", "In Review"] } } }) {
    nodes {
      id identifier title url dueDate
      state { name }
      team { key }
      project { id name }
      labels { nodes { name } }
      inverseRelations { nodes { type issue { state { type } } } }
    }
    pageInfo { hasNextPage endCursor }
  }
}`;

type LinearIssue = {
  id: string;
  identifier: string;
  title: string;
  url: string;
  dueDate: string | null;
  state: { name: string };
  team: { key: string };
  project: { id: string; name: string } | null;
  labels: { nodes: { name: string }[] };
  inverseRelations: {
    nodes: { type: string; issue: { state: { type: string } } }[];
  };
};

export async function linearGraphql<T>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  const key = process.env.LINEAR_API_KEY;
  if (!key) throw new Error("Linear is not configured.");
  const response = await fetch("https://api.linear.app/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: key },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });
  const payload = (await response.json()) as {
    data?: T;
    errors?: { message: string }[];
  };
  if (!response.ok || payload.errors?.length || !payload.data) {
    throw new Error(
      payload.errors?.map((error) => error.message).join("; ") ||
        `Linear request failed: ${response.status}`,
    );
  }
  return payload.data;
}

function issueLane(issue: LinearIssue): Lane {
  const labels = issue.labels.nodes.map(({ name }) => name.toLowerCase());
  if (labels.some((name) => name === "ai consultant")) return "AI Consultant";
  if (labels.some((name) => name === "content editor")) return "Content Editor";
  if (issue.project?.name === "Outreach") return "AI Consultant";
  if (["Catena Media", "Jacob Hill"].includes(issue.project?.name ?? ""))
    return "Content Editor";
  // Unknown projects remain available through the Development toggle.
  return "Development";
}

type NotionPage = {
  id: string;
  url: string;
  last_edited_time: string;
  properties: Record<
    string,
    {
      type?: string;
      title?: { plain_text: string }[];
      status?: { name: string } | null;
      date?: { start: string } | null;
      select?: { name: string } | null;
      relation?: { id: string }[];
    }
  >;
};

async function notionRequest(
  path: string,
  init?: RequestInit,
): Promise<unknown> {
  const token = process.env.NOTION_API_KEY;
  if (!token) throw new Error("Notion is not connected.");
  const response = await fetch(`https://api.notion.com/v1/${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${token}`,
      "Notion-Version": "2026-03-11",
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  const payload = (await response.json()) as { message?: string };
  if (!response.ok)
    throw new Error(
      payload.message || `Notion request failed: ${response.status}`,
    );
  return payload;
}

export async function listNotionWork(): Promise<WorkItem[]> {
  const sourceId =
    process.env.COMMAND_CENTER_NOTION_TASKS_SOURCE_ID ||
    "625c153d-4dad-41f9-b328-9b67e7479782";
  const pages: NotionPage[] = [];
  let cursor: string | undefined;
  for (let page = 0; page < 5; page += 1) {
    const result = (await notionRequest(`data_sources/${sourceId}/query`, {
      method: "POST",
      body: JSON.stringify({
        page_size: 100,
        ...(cursor ? { start_cursor: cursor } : {}),
      }),
    })) as {
      results: NotionPage[];
      has_more: boolean;
      next_cursor: string | null;
    };
    pages.push(...result.results);
    if (!result.has_more || !result.next_cursor) break;
    cursor = result.next_cursor;
  }
  return pages.flatMap((page) => {
    const title = page.properties.Task?.title
      ?.map((item) => item.plain_text)
      .join("")
      .trim();
    const status =
      page.properties.Status?.status?.name ??
      page.properties.Status?.select?.name ??
      "";
    const recentlyEdited =
      Date.now() - new Date(page.last_edited_time).getTime() < 30 * 86400000;
    if (
      !title ||
      !["Today", "Queued", "In Motion", "Waiting"].includes(status) ||
      (["Queued", "Waiting"].includes(status) && !recentlyEdited) ||
      (status === "Queued" &&
        Boolean(page.properties["Sub-tasks"]?.relation?.length))
    )
      return [];
    const explicitLane = page.properties.Lane?.select?.name;
    const portfolioProject = page.properties.Project?.relation?.some(
      (item) => item.id === "38b4c8bd-6c26-816c-a26c-f6b3fd022bba",
    );
    const lane: Lane = LANES.includes(explicitLane as Lane)
      ? (explicitLane as Lane)
      : portfolioProject
        ? "Content Editor"
        : "Development";
    return [
      {
        id: page.id,
        owner: "notion" as const,
        title,
        url: page.url,
        dueDate: page.properties.Due?.date?.start ?? null,
        status,
        lane,
        blocked: status === "Waiting",
        projectName: portfolioProject ? "Portfolio" : null,
      },
    ];
  });
}

export async function updateNotionStatus(
  pageId: string,
  stateName: "Today" | "Queued" | "In Motion" | "Waiting" | "Done",
) {
  const before = (await notionRequest(`pages/${pageId}`)) as NotionPage;
  const sourceId =
    process.env.COMMAND_CENTER_NOTION_TASKS_SOURCE_ID ||
    "625c153d-4dad-41f9-b328-9b67e7479782";
  const parent = before as NotionPage & {
    parent?: { data_source_id?: string };
  };
  if (parent.parent?.data_source_id !== sourceId)
    throw new Error("That task is outside the configured Notion source.");
  await notionRequest(`pages/${pageId}`, {
    method: "PATCH",
    body: JSON.stringify({
      properties: { Status: { status: { name: stateName } } },
    }),
  });
  const page = (await notionRequest(`pages/${pageId}`)) as NotionPage;
  if (page.properties.Status?.status?.name !== stateName)
    throw new Error("Notion did not confirm the status change.");
  return { id: page.id, status: stateName };
}

export async function listLinearWork(): Promise<WorkItem[]> {
  const issues: LinearIssue[] = [];
  let after: string | null = null;
  for (let page = 0; page < 5; page += 1) {
    const data: {
      issues: {
        nodes: LinearIssue[];
        pageInfo: { hasNextPage: boolean; endCursor: string | null };
      };
    } = await linearGraphql(linearIssuesQuery, { after });
    issues.push(...data.issues.nodes);
    if (!data.issues.pageInfo.hasNextPage) break;
    after = data.issues.pageInfo.endCursor;
  }
  return issues
    .filter((issue) => issue.team.key === "23M")
    .map((issue) => ({
      id: issue.id,
      owner: "linear" as const,
      title: issue.title,
      url: issue.url,
      dueDate: issue.dueDate,
      status: issue.state.name,
      lane: issueLane(issue),
      projectId: issue.project?.id,
      projectName: issue.project?.name,
      blocked: issue.inverseRelations.nodes.some(
        (relation) =>
          relation.type === "blocks" &&
          relation.issue.state.type !== "completed",
      ),
    }));
}

export async function commandCenterSnapshot() {
  const [
    contacts,
    interactions,
    blocks,
    drafts,
    linear,
    notion,
    laneOverrides,
  ] = await Promise.allSettled([
    supabaseRest(
      "contacts?select=id,name,company,email,phone,lane,status,relationship_context,notes,next_action,next_action_at,linear_project_id,invoice_url,payment_note,source_url,updated_at&order=name.asc",
    ),
    supabaseRest(
      "crm_interactions?select=id,contact_id,channel,summary,occurred_at,external_url&order=occurred_at.desc&limit=200",
    ),
    supabaseRest(
      "command_center_blocks?select=id,owner,owner_id,selected_date,starts_at,ends_at&order=selected_date.asc",
    ),
    supabaseRest(
      "crm_message_drafts?select=id,title,lane,subject,body&order=title.asc",
    ),
    listLinearWork(),
    listNotionWork(),
    supabaseRest("command_center_work_lanes?select=owner,owner_id,lane"),
  ]);
  const failures: string[] = [];
  const take = <T>(
    result: PromiseSettledResult<T>,
    name: string,
    fallback: T,
  ): T => {
    if (result.status === "fulfilled") return result.value;
    console.error(`[command-center] ${name} read failed`, result.reason);
    const message =
      name === "Notion"
        ? "Notion tasks need a connection."
        : name === "Linear"
          ? "Linear work is unavailable."
          : "Client and planner storage needs setup.";
    if (!failures.includes(message)) failures.push(message);
    return fallback;
  };
  const mappedLanes: { owner: string; owner_id: string; lane: Lane }[] = take(
    laneOverrides,
    "Lane choices",
    [] as { owner: string; owner_id: string; lane: Lane }[],
  );
  const allWork = [
    ...take(linear, "Linear", [] as WorkItem[]),
    ...take(notion, "Notion", [] as WorkItem[]),
  ];
  return {
    contacts: take(contacts, "Clients", [] as Contact[]) as Contact[],
    interactions: take(
      interactions,
      "Interactions",
      [] as Interaction[],
    ) as Interaction[],
    blocks: take(blocks, "Planner", [] as Block[]) as Block[],
    drafts: take(drafts, "Drafts", [] as Draft[]) as Draft[],
    work: allWork.map((item) => ({
      ...item,
      lane:
        mappedLanes.find(
          (mapping) =>
            mapping.owner === item.owner && mapping.owner_id === item.id,
        )?.lane ?? item.lane,
    })),
    failures,
  };
}

export async function updateLinearStatus(
  issueId: string,
  stateName: "Todo" | "In Progress" | "In Review" | "Done",
) {
  const lookup = await linearGraphql<{
    issue: {
      id: string;
      team: { key: string; states: { nodes: { id: string; name: string }[] } };
    } | null;
  }>(
    `query ($id: String!) { issue(id: $id) { id team { key states { nodes { id name } } } } }`,
    { id: issueId },
  );
  if (lookup.issue?.team.key !== "23M")
    throw new Error("That issue is outside Singleton Systems.");
  const state = lookup.issue.team.states.nodes.find(
    (item) => item.name === stateName,
  );
  if (!state) throw new Error("That Linear status is unavailable.");
  const mutation = await linearGraphql<{ issueUpdate: { success: boolean } }>(
    `mutation ($id: String!, $input: IssueUpdateInput!) { issueUpdate(id: $id, input: $input) { success } }`,
    {
      id: issueId,
      input: { stateId: state.id },
    },
  );
  if (!mutation.issueUpdate.success)
    throw new Error("Linear rejected the status change.");
  const readback = await linearGraphql<{
    issue: { id: string; state: { name: string } };
  }>(`query ($id: String!) { issue(id: $id) { id state { name } } }`, {
    id: issueId,
  });
  if (readback.issue.state.name !== stateName)
    throw new Error("Linear did not confirm the status change.");
  return readback.issue;
}

export async function createLinearTask(title: string, dueDate: string | null) {
  const teamLookup = await linearGraphql<{
    teams: { nodes: { id: string; key: string }[] };
  }>(`query { teams(filter: { key: { eq: "23M" } }) { nodes { id key } } }`);
  const team = teamLookup.teams.nodes.find((item) => item.key === "23M");
  if (!team) throw new Error("Singleton Systems team was not found.");

  const created = await linearGraphql<{
    issueCreate: {
      success: boolean;
      issue: {
        id: string;
        identifier: string;
        title: string;
        url: string;
        dueDate: string | null;
      } | null;
    };
  }>(
    `mutation ($input: IssueCreateInput!) {
      issueCreate(input: $input) { success issue { id identifier title url dueDate } }
    }`,
    { input: { teamId: team.id, title, ...(dueDate ? { dueDate } : {}) } },
  );
  const task = created.issueCreate.issue;
  if (!created.issueCreate.success || !task)
    throw new Error("Linear rejected the task.");

  const readback = await linearGraphql<{
    issue: {
      id: string;
      title: string;
      dueDate: string | null;
      team: { key: string };
    } | null;
  }>(
    `query ($id: String!) { issue(id: $id) { id title dueDate team { key } } }`,
    { id: task.id },
  );
  if (
    !readback.issue ||
    readback.issue.team.key !== "23M" ||
    readback.issue.title !== title ||
    readback.issue.dueDate !== dueDate
  ) {
    throw new Error(
      `Linear task ${task.identifier} was created but readback did not match.`,
    );
  }
  return task;
}
