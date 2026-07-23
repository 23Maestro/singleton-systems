import { NextResponse } from "next/server";
import { z } from "zod";
import { linearInboxProjectNames, linearInboxProjects } from "@/lib/linear-inbox-projects";
import { getLinearInboxDraft } from "@/lib/linear-inbox-drafts";
import { recordLinearInboxSubmission } from "@/lib/linear-inbox-submissions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const projectNames = linearInboxProjectNames;
const templateIds = ["quick_task", "mini_project", "working_brief"] as const;
const actionIds = ["new", "update"] as const;

const templateScaffolds: Record<(typeof templateIds)[number], string[]> = {
  quick_task: [],
  mini_project: ["", "## Shape", "One durable next action, one owner surface."],
  working_brief: ["", "## Constraints", "None noted.", "", "## Done", "One observable result."],
};

const sourceSchema = z.object({
  webLink: z.union([
    z.object({
      present: z.literal(true),
      url: z.string().url(),
      title: z.string().optional(),
    }),
    z.object({ present: z.literal(false) }),
  ]),
  image: z.union([
    z.object({
      present: z.literal(true),
      name: z.string().optional(),
      path: z.string().optional(),
      kind: z.string().optional(),
    }),
    z.object({ present: z.literal(false) }),
  ]),
});

const inboxEntrySchema = z
  .object({
    action: z.enum(actionIds),
    project: z.enum(projectNames),
    template: z.enum(templateIds),
    title: z.string().trim().min(1),
    context: z.string().trim().optional().default(""),
    status: z.string().trim().min(1).optional().default("Backlog"),
    dueDate: z.string().date().nullable().optional().default(null),
    delegateToAgent: z.boolean().optional().default(true),
    issue: z.string().trim().optional(),
    labelIds: z.array(z.string()).optional().default([]),
    draftId: z.string().trim().optional(),
    sources: sourceSchema,
  })
  .superRefine((entry, context) => {
    if (entry.action === "update" && !entry.issue) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Issue is required for updates.",
        path: ["issue"],
      });
    }
  });

type InboxEntry = z.infer<typeof inboxEntrySchema>;

type LinearIssue = {
  id: string;
  identifier: string;
  title: string;
  url: string;
};

type LinearTeam = {
  id: string;
  key: string;
  name: string;
  states: { nodes: { id: string; name: string; type?: string | null }[] };
  labels?: { nodes: { id: string; name: string; color: string }[] };
};

type LinearProject = {
  id: string;
  name: string;
  teams: { nodes: LinearTeam[] };
  initiatives: { nodes: { id: string; name: string }[] };
};

type LinearLookup = {
  teams: { nodes: LinearTeam[] };
  projects: { nodes: LinearProject[] };
};

export async function GET() {
  try {
    const lookup = await linearGraphql<LinearLookup>(lookupQuery, { names: linearInboxProjectNames });
    const projects = linearInboxProjects.map((configured) => {
      const project = lookup.projects.nodes.find((candidate) => candidate.name === configured.name);
      const team = project?.teams.nodes[0];
      return {
        name: configured.name,
        icon: configured.icon,
        states: team?.states.nodes.map((state) => state.name) || [],
        labels: team?.labels?.nodes.map((label) => ({ id: label.id, name: label.name, color: label.color })) || [],
        initiatives: project?.initiatives.nodes.map((initiative) => initiative.name) || [],
      };
    });

    return NextResponse.json({
      projects,
      templates: templateIds.map((id) => ({ id, label: templateLabel(id) })),
      actions: actionIds,
    });
  } catch (error) {
    return NextResponse.json({ error: messageFrom(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    let entry = inboxEntrySchema.parse(await request.json());
    if (entry.draftId) {
      const draft = await getLinearInboxDraft(entry.draftId);
      if (draft) entry = { ...entry, sources: mergeSources(entry.sources, draft.sources) };
    }

    const lookup = await linearGraphql<LinearLookup>(lookupQuery, { names: linearInboxProjectNames });
    const target = resolveTarget(lookup, entry.project, entry.status);

    const result =
      entry.action === "new"
        ? await createLinearIssue(entry, target)
        : await updateLinearIssue(entry, target);

    return NextResponse.json(result, { status: entry.action === "new" ? 201 : 200 });
  } catch (error) {
    const message = messageFrom(error);
    return NextResponse.json({ error: message }, { status: message.includes("required") ? 400 : 500 });
  }
}

function templateLabel(id: (typeof templateIds)[number]) {
  if (id === "quick_task") return "Quick task";
  if (id === "mini_project") return "Mini project";
  return "Working brief";
}

function mergeSources(entrySources: InboxEntry["sources"], draftSources: InboxEntry["sources"]) {
  return {
    webLink: entrySources.webLink.present ? entrySources.webLink : draftSources.webLink,
    image: entrySources.image.present ? entrySources.image : draftSources.image,
  };
}

// Filtered to the curated project names — an unfiltered projects(first: 100)
// with this much nested depth exceeds Linear's query complexity cap (10000).
const lookupQuery = `
  query LinearInboxLookup($names: [String!]) {
    teams(first: 25) {
      nodes {
        id
        key
        name
        states(first: 20) {
          nodes {
            id
            name
            type
          }
        }
      }
    }
    projects(filter: { name: { in: $names } }, first: 10) {
      nodes {
        id
        name
        initiatives(first: 3) {
          nodes {
            id
            name
          }
        }
        teams(first: 3) {
          nodes {
            id
            key
            name
            states(first: 20) {
              nodes {
                id
                name
                type
              }
            }
            labels(first: 30) {
              nodes {
                id
                name
                color
              }
            }
          }
        }
      }
    }
  }
`;

async function createLinearIssue(entry: InboxEntry, target: ResolvedTarget) {
  const input = stripUndefined({
    teamId: target.team.id,
    projectId: target.project?.id,
    title: entry.title,
    description: renderEntryMarkdown(entry, "new"),
    stateId: target.stateId,
    dueDate: entry.dueDate,
    labelIds: entry.labelIds.length > 0 ? entry.labelIds : undefined,
  });

  const data = await linearGraphql<{ issueCreate: { success: boolean; issue: LinearIssue } }>(
    `
      mutation LinearInboxCreate($input: IssueCreateInput!) {
        issueCreate(input: $input) {
          success
          issue {
            id
            identifier
            title
            url
          }
        }
      }
    `,
    { input },
  );

  await trackSubmission(data.issueCreate.issue);

  return {
    action: "new",
    updateShape: "issue",
    issue: data.issueCreate.issue,
    url: data.issueCreate.issue.url,
  };
}

async function trackSubmission(issue: LinearIssue) {
  try {
    await recordLinearInboxSubmission(issue);
  } catch (error) {
    console.error("linear-inbox: failed to record submission for status tracking", error);
  }
}

async function updateLinearIssue(entry: InboxEntry, target: ResolvedTarget) {
  const issueId = normalizeIssueReference(entry.issue || "");
  const updateInput = stripUndefined({
    stateId: target.stateId,
    dueDate: entry.dueDate,
    labelIds: entry.labelIds.length > 0 ? entry.labelIds : undefined,
  });

  if (Object.keys(updateInput).length > 0) {
    await linearGraphql<{ issueUpdate: { success: boolean; issue: LinearIssue } }>(
      `
        mutation LinearInboxUpdateIssue($id: String!, $input: IssueUpdateInput!) {
          issueUpdate(id: $id, input: $input) {
            success
            issue {
              id
              identifier
              title
              url
            }
          }
        }
      `,
      { id: issueId, input: updateInput },
    );
  }

  const updateShape = chooseUpdateShape(entry);

  if (updateShape === "subissue") {
    const data = await linearGraphql<{ issueCreate: { success: boolean; issue: LinearIssue } }>(
      `
        mutation LinearInboxCreateSubissue($input: IssueCreateInput!) {
          issueCreate(input: $input) {
            success
            issue {
              id
              identifier
              title
              url
            }
          }
        }
      `,
      {
        input: stripUndefined({
          teamId: target.team.id,
          projectId: target.project?.id,
          parentId: issueId,
          title: entry.title,
          description: renderEntryMarkdown(entry, "update"),
          stateId: target.stateId,
          dueDate: entry.dueDate,
          labelIds: entry.labelIds.length > 0 ? entry.labelIds : undefined,
        }),
      },
    );

    await trackSubmission(data.issueCreate.issue);

    return {
      action: "update",
      updateShape,
      issue: data.issueCreate.issue,
      url: data.issueCreate.issue.url,
    };
  }

  const data = await linearGraphql<{ commentCreate: { success: boolean; comment: { id: string; url: string } } }>(
    `
      mutation LinearInboxComment($input: CommentCreateInput!) {
        commentCreate(input: $input) {
          success
          comment {
            id
            url
          }
        }
      }
    `,
    {
      input: {
        issueId,
        body: renderEntryMarkdown(entry, "update"),
      },
    },
  );

  return {
    action: "update",
    updateShape,
    comment: data.commentCreate.comment,
    url: data.commentCreate.comment.url,
  };
}

type ResolvedTarget = {
  project?: LinearProject;
  team: LinearTeam;
  stateId?: string;
};

function resolveTarget(lookup: LinearLookup, projectName: InboxEntry["project"], status: string): ResolvedTarget {
  const project = lookup.projects.nodes.find((candidate) => candidate.name === projectName);
  const configuredTeamKey = process.env.LINEAR_INBOX_TEAM_KEY || "23M";
  const configuredTeamId = process.env.LINEAR_INBOX_TEAM_ID;
  const projectTeam = project?.teams.nodes[0];
  const configuredTeam = lookup.teams.nodes.find(
    (team) => team.id === configuredTeamId || team.key === configuredTeamKey || team.name === configuredTeamKey,
  );
  const team = projectTeam || configuredTeam;

  if (!team) {
    throw new Error("Linear team is required. Set LINEAR_INBOX_TEAM_ID or LINEAR_INBOX_TEAM_KEY.");
  }

  return {
    project,
    team,
    stateId: findStateId(team, status),
  };
}

function findStateId(team: LinearTeam, status: string) {
  const normalized = normalizeLabel(status);
  const exact = team.states.nodes.find((state) => normalizeLabel(state.name) === normalized);
  if (exact) return exact.id;

  if (normalized === "backlog") {
    return team.states.nodes.find((state) => state.type === "backlog")?.id;
  }

  return undefined;
}

function chooseUpdateShape(entry: InboxEntry): "comment" | "subissue" {
  const context = entry.context.trim();
  const actionableSignals = /\b(build|create|add|fix|ship|implement|wire|update|test|verify|write|draft)\b/i;
  if (context.length > 260 && actionableSignals.test(`${entry.title} ${context}`)) return "subissue";
  return "comment";
}

function isAmbiguousUpdate(entry: InboxEntry) {
  const text = `${entry.title} ${entry.context}`.trim();
  return /\?|maybe|unclear|unsure|not sure|decide|figure out|needs review/i.test(text);
}

function renderEntryMarkdown(entry: InboxEntry, mode: "new" | "update") {
  const context = compactWords(entry.context || entry.title, 75);
  const lines = [
    "## Goal",
    entry.title,
    "",
    "## Context",
    context || entry.title,
    ...templateScaffolds[entry.template],
  ];

  const sources = renderSources(entry.sources);
  if (sources.length > 0) {
    lines.push("", "## Sources", ...sources);
  }

  if (mode === "update" && chooseUpdateShape(entry) === "comment" && isAmbiguousUpdate(entry)) {
    lines.push("", "Next: Review and decide whether this needs separate scope.");
  }

  if (entry.delegateToAgent) {
    lines.push("", "<!-- Linear Agent: use project context to suggest labels; do not invent owners, dates, blockers, subtasks, or scope. -->");
  }

  return lines.join("\n");
}

function renderSources(sources: InboxEntry["sources"]) {
  const lines: string[] = [];
  if (sources.webLink.present) {
    lines.push(`- Web Link: ${sources.webLink.title ? `${sources.webLink.title} ` : ""}${sources.webLink.url}`);
  }
  if (sources.image.present) {
    lines.push(`- Image: ${sources.image.name || sources.image.kind || "Clipboard image"}`);
  }
  return lines;
}

function compactWords(value: string, maxWords: number) {
  const words = value.trim().split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return value.trim();
  return `${words.slice(0, maxWords).join(" ")}...`;
}

async function linearGraphql<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const apiKey = process.env.LINEAR_API_KEY || process.env.LINEAR_DEVELOPER_TOKEN;
  if (!apiKey) throw new Error("LINEAR_API_KEY or LINEAR_DEVELOPER_TOKEN is required.");

  const response = await fetch("https://api.linear.app/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: apiKey.startsWith("Bearer ") ? apiKey : `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ query, variables }),
  });

  const payload = (await response.json()) as { data?: T; errors?: { message: string }[] };
  if (!response.ok || payload.errors?.length) {
    throw new Error(payload.errors?.map((error) => error.message).join("; ") || `Linear request failed: ${response.status}`);
  }

  if (!payload.data) throw new Error("Linear returned no data.");
  return payload.data;
}

function normalizeIssueReference(value: string) {
  const trimmed = value.trim();
  const urlMatch = trimmed.match(/([A-Z][A-Z0-9]+-\d+)/);
  return urlMatch?.[1] || trimmed;
}

function normalizeLabel(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function stripUndefined<T extends Record<string, unknown>>(value: T) {
  return Object.fromEntries(Object.entries(value).filter(([, entryValue]) => entryValue !== undefined && entryValue !== null));
}

function messageFrom(error: unknown) {
  if (error instanceof z.ZodError) return error.issues.map((issue) => issue.message).join(" ");
  return error instanceof Error ? error.message : "Unknown error";
}
