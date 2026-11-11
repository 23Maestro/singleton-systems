import { studioCommand } from "./studio-projects.ts";

export async function closeStudioProject(closeout, { projectId, owner, origin, token }) {
  if (closeout.outcome !== "complete" || !closeout.tasks?.length || closeout.tasks.some(task => !task.completed)) {
    throw new Error("Studio needs the task owner's completed readback.");
  }
  const command = studioCommand.parse({
    action: "close-linked", projectId, task: { owner, id: closeout.tasks[0].id },
  });
  const endpoint = new URL("/api/studio/projects", origin);
  if (endpoint.protocol !== "https:" && !(endpoint.protocol === "http:" && endpoint.hostname === "127.0.0.1")) {
    throw new Error("Use the verified HTTPS Studio origin.");
  }
  if (!token || token.length < 32) throw new Error("Studio producer access is not configured.");
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
  const request = (url, options) => fetch(url, { ...options, headers, redirect: "error", signal: AbortSignal.timeout(25000) });
  const response = await request(endpoint, { method: "POST", body: JSON.stringify(command) });
  if (!response.ok) throw new Error(`Studio could not close the linked project (${response.status}).`);
  endpoint.searchParams.set("projectId", projectId);
  const readback = await request(endpoint);
  const project = readback.ok ? await readback.json() : null;
  if (project?.projectId !== projectId || project.taskId !== command.task.id ||
      project.taskOwner !== owner || project.status !== "closed") throw new Error("Studio did not confirm the linked project closed.");
  return { projectId, status: "closed" };
}
