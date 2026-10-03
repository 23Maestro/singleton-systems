import type { Lane, WorkItem } from "@/lib/command-center";

export const ASANA_PROJECTS = [
  {
    id: "1218884867598641",
    name: "AI Consulting",
    lane: "AI Consultant" as Lane,
  },
  {
    id: "1218890014545436",
    name: "Content Editor",
    lane: "Content Editor" as Lane,
  },
  { id: "1218913626827109", name: "Portfolio", lane: "Content Editor" as Lane },
];
export type AsanaProject = (typeof ASANA_PROJECTS)[number] & {
  sections: { id: string; name: string }[];
};
type Task = {
  gid: string;
  name: string;
  notes: string;
  html_notes: string;
  completed: boolean;
  due_on: string | null;
  permalink_url: string;
  parent?: { gid: string } | null;
  num_subtasks?: number;
  memberships: {
    project: { gid: string };
    section: { gid: string; name: string } | null;
  }[];
};
const fields =
  "name,notes,html_notes,completed,due_on,permalink_url,parent.gid,num_subtasks,memberships.project.gid,memberships.section.gid,memberships.section.name";

export async function asanaRequest<T>(
  path: string,
  method = "GET",
  data?: unknown,
): Promise<T> {
  const endpoint = `https://app.asana.com/api/1.0/${path}`;
  const token = process.env.ASANA_ACCESS_TOKEN;
  let response: Response;
  if (token) {
    response = await fetch(endpoint, {
      method,
      cache: "no-store",
      signal: AbortSignal.timeout(20000),
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      ...(data ? { body: JSON.stringify({ data }) } : {}),
    });
  } else {
    const key = process.env.COMPOSIO_API_KEY;
    const account = process.env.COMMAND_CENTER_ASANA_CONNECTION_ID;
    if (!key || !account) throw new Error("Asana needs a website connection.");
    response = await fetch(
      "https://backend.composio.dev/api/v3/tools/execute/proxy",
      {
        method: "POST",
        cache: "no-store",
        signal: AbortSignal.timeout(20000),
        headers: { "x-api-key": key, "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint,
          method,
          connected_account_id: account,
          parameters: [
            { name: "Content-Type", type: "header", value: "application/json" },
          ],
          ...(data ? { body: { data } } : {}),
        }),
      },
    );
    if (!response.ok)
      throw new Error(`Asana connection request failed (${response.status}).`);
    const proxy = await response.json();
    if (
      typeof proxy.status !== "number" ||
      proxy.status < 200 ||
      proxy.status >= 300
    )
      throw new Error(`Asana request failed (${proxy.status}).`);
    return proxy.data as T;
  }
  if (!response.ok)
    throw new Error(`Asana request failed (${response.status}).`);
  return response.json() as Promise<T>;
}
async function pages<T>(path: string): Promise<T[]> {
  const rows: T[] = [];
  let offset: string | undefined;
  do {
    const result: { data: T[]; next_page?: { offset: string } | null } =
      await asanaRequest(
        `${path}${path.includes("?") ? "&" : "?"}limit=100${offset ? `&offset=${encodeURIComponent(offset)}` : ""}`,
      );
    rows.push(...result.data);
    offset = result.next_page?.offset;
  } while (offset);
  return rows;
}
export async function listAsanaProjects(): Promise<AsanaProject[]> {
  return Promise.all(
    ASANA_PROJECTS.map(async (project) => ({
      ...project,
      sections: (
        await pages<{ gid: string; name: string }>(
          `projects/${project.id}/sections?opt_fields=name`,
        )
      ).map((s) => ({ id: s.gid, name: s.name })),
    })),
  );
}
function projectFor(task: Task) {
  const project = ASANA_PROJECTS.find((p) =>
    task.memberships.some((m) => m.project.gid === p.id),
  );
  if (!project)
    throw new Error("That task is outside the configured Asana projects.");
  return project;
}
function item(task: Task, project = projectFor(task)): WorkItem {
  const section = task.memberships.find(
    (m) => m.project.gid === project.id,
  )?.section;
  return {
    id: task.gid,
    owner: "asana",
    title: task.name,
    description: task.notes,
    url: task.permalink_url,
    dueDate: task.due_on,
    status: task.completed
      ? "Done"
      : ["In Progress", "Review"].includes(section?.name ?? "")
        ? section!.name
        : "To Do",
    lane: project.lane,
    blocked: false,
    projectId: project.id,
    projectName: project.name,
    sectionId: section?.gid,
    states:
      project.name === "Content Editor"
        ? ["To Do", "Done"]
        : project.name === "Portfolio"
          ? ["To Do", "In Progress", "Review", "Done"]
          : ["To Do", "In Progress", "Done"],
  };
}
async function read(id: string): Promise<Task> {
  if (!/^\d+$/.test(id)) throw new Error("Invalid Asana task.");
  return (
    await asanaRequest<{ data: Task }>(`tasks/${id}?opt_fields=${fields}`)
  ).data;
}
export async function listAsanaWork(): Promise<WorkItem[]> {
  const groups = await Promise.all(
    ASANA_PROJECTS.map(async (project) => {
      const tasks = await pages<Task>(
        `projects/${project.id}/tasks?completed_since=now&opt_fields=${fields}`,
      );
      return Promise.all(
        tasks
          .filter((t) => !t.completed && !t.parent)
          .map(async (task) => ({
            ...item(task, project),
            children: task.num_subtasks
              ? (
                  await pages<Task>(
                    `tasks/${task.gid}/subtasks?opt_fields=${fields}`,
                  )
                ).map((t) => ({
                  id: t.gid,
                  title: t.name,
                  url: t.permalink_url,
                  status: t.completed ? "Done" : "To Do",
                  dueDate: t.due_on,
                }))
              : [],
          })),
      );
    }),
  );
  return [...new Map(groups.flat().map((t) => [t.id, t])).values()];
}
function html(text: string) {
  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return `<body>${escaped}</body>`;
}
export async function updateAsanaTask(
  id: string,
  edit: { title?: string; description?: string; dueDate?: string | null },
) {
  const before = await read(id);
  projectFor(before);
  const data = {
    ...(edit.title !== undefined ? { name: edit.title } : {}),
    ...(edit.description !== undefined
      ? { html_notes: html(edit.description) }
      : {}),
    ...(edit.dueDate !== undefined ? { due_on: edit.dueDate } : {}),
  };
  await asanaRequest(`tasks/${id}`, "PUT", data);
  const after = await read(id);
  if (
    (edit.title !== undefined && after.name !== edit.title) ||
    (edit.dueDate !== undefined && after.due_on !== edit.dueDate) ||
    (edit.description !== undefined &&
      (after.notes.trim() !== edit.description.trim() || !after.html_notes))
  )
    throw new Error("Asana did not confirm the task update.");
  return item(after);
}
export async function updateAsanaStatus(id: string, state: string) {
  const before = await read(id);
  const project = projectFor(before);
  if (!item(before).states?.includes(state))
    throw new Error("That state is not available in this Asana project.");
  if (project.name !== "Content Editor") {
    const sections = (await listAsanaProjects()).find(
      (p) => p.id === project.id,
    )!.sections;
    const target = sections.find((s) => s.name === state);
    if (!target) throw new Error("The Asana section is unavailable.");
    await asanaRequest(`sections/${target.id}/addTask`, "POST", { task: id });
  }
  await asanaRequest(`tasks/${id}`, "PUT", { completed: state === "Done" });
  const after = item(await read(id));
  if (after.status !== state)
    throw new Error("Asana did not confirm the status change.");
  return after;
}
export async function createAsanaTask(
  title: string,
  description: string,
  dueDate: string | null,
  projectId: string,
  sectionId?: string,
) {
  const project = (await listAsanaProjects()).find((p) => p.id === projectId);
  if (!project) throw new Error("Choose a configured Asana project.");
  const section =
    project.sections.find((s) => s.id === sectionId) ??
    (!sectionId && project.name !== "Content Editor"
      ? project.sections.find((s) => s.name === "To Do")
      : undefined);
  if (!section) throw new Error("Choose a section in that project.");
  const created = await asanaRequest<{ data: { gid: string } }>(
    "tasks",
    "POST",
    {
      name: title,
      html_notes: html(description),
      due_on: dueDate,
      memberships: [{ project: projectId, section: section.id }],
    },
  );
  const after = await read(created.data.gid);
  if (
    after.name !== title ||
    after.due_on !== dueDate ||
    after.notes.trim() !== description.trim() ||
    !after.html_notes ||
    !after.memberships.some(
      (m) => m.project.gid === projectId && m.section?.gid === section.id,
    )
  )
    throw new Error(
      `Asana task ${created.data.gid} exists, but readback was not confirmed. Refresh before retrying.`,
    );
  return item(after);
}
export async function createAsanaSubtask(parentId: string, title: string) {
  const parent = await read(parentId);
  projectFor(parent);
  const created = await asanaRequest<{ data: { gid: string } }>(
    `tasks/${parentId}/subtasks`,
    "POST",
    { name: title },
  );
  const after = await read(created.data.gid);
  if (after.parent?.gid !== parentId || after.name !== title)
    throw new Error(
      `Asana subtask ${created.data.gid} exists, but readback was not confirmed. Refresh before retrying.`,
    );
  return child(after);
}
function child(task: Task) {
  return {
    id: task.gid,
    title: task.name,
    url: task.permalink_url,
    status: task.completed ? "Done" : "To Do",
    dueDate: task.due_on,
  };
}
// Subtasks inherit ownership from the parent. Validate the parent's project,
// confirm the parent link, then complete only the child. Never move sections.
export async function completeAsanaSubtask(parentId: string, childId: string) {
  const parent = await read(parentId);
  projectFor(parent);
  const before = await read(childId);
  if (before.parent?.gid !== parentId)
    throw new Error("That task is not a subtask of this parent.");
  if (!before.completed)
    await asanaRequest(`tasks/${childId}`, "PUT", { completed: true });
  const after = await read(childId);
  if (!after.completed || after.parent?.gid !== parentId)
    throw new Error("Asana did not confirm the subtask completion.");
  return child(after);
}
