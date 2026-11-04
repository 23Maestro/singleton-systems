// Server route only: the connection URL is a credential, never source metadata.
import {execFile} from "node:child_process";
import {promisify} from "node:util";
import {createHash} from "node:crypto";
import {z} from "zod";
import {supabaseRest} from "./supabase-rest";

const SPACE_ID = "f5b0a75f-1553-cc83-3804-f83592a53df1";
const run = promisify(execFile);
const taskSchema = z.object({
  id: z.uuid(), markdown: z.string().max(10000),
  taskInfo: z.object({state: z.enum(["todo", "done", "canceled"]), deadlineDate: z.iso.date().optional(), scheduleDate: z.iso.date().optional()}),
  location: z.object({type: z.literal("inbox")}),
});

export type CraftSource = {
  provider: "craft"; spaceId: string; taskId: string; title: string;
  markdown: string; url: string; deadlineDate: string | null; scheduleDate: string | null;
};

async function connectionUrl() {
  let value = process.env.COMMAND_CENTER_CRAFT_API_URL?.trim();
  if (!value && process.platform === "darwin" && !process.env.VERCEL) {
    try {
      const result = await run("/usr/bin/security", ["find-generic-password", "-s", "com.singleton-systems.craft-inbox.23space", "-a", "singleton23", "-w"], {timeout: 10000, maxBuffer: 4096});
      value = result.stdout.trim();
    } catch {
      throw new Error("Craft connection is unavailable. Saved tasks and plans are unchanged.");
    }
  }
  if (!value) throw new Error("Craft needs a server connection. Saved tasks and plans are unchanged.");
  value = value.replace(/\/$/, "");
  if (!/^https:\/\/connect\.craft\.do\/links\/[A-Za-z0-9_-]+\/api\/v1$/.test(value))
    throw new Error("Craft server connection is invalid. Saved tasks and plans are unchanged.");
  return value;
}

async function requestCraft(base: string, path: string, body?: unknown): Promise<unknown> {
  // Never propagate fetch errors: they may contain the credential-bearing URL.
  try {
    const response = await fetch(base + path, {
      cache: "no-store", redirect: "error", signal: AbortSignal.timeout(15000),
      headers: body ? {Accept: "application/json", "Content-Type": "application/json"} : {Accept: "application/json"},
      ...(body ? {method: "PUT", body: JSON.stringify(body)} : {}),
    });
    if (!response.ok) throw new Error();
    return await response.json();
  } catch {
    throw new Error("Craft refresh failed. Saved tasks and plans are unchanged. Try Refresh again.");
  }
}

function captureId(taskId: string) {
  const hash = createHash("sha256").update(`command-center:craft:${SPACE_ID}:${taskId}`).digest("hex");
  return `${hash.slice(0,8)}-${hash.slice(8,12)}-4${hash.slice(13,16)}-a${hash.slice(17,20)}-${hash.slice(20,32)}`;
}

async function verifiedConnection() {
  const base = await connectionUrl();
  const connection = z.object({space: z.object({id: z.literal(SPACE_ID)})}).safeParse(await requestCraft(base, "/connection"));
  if (!connection.success) throw new Error("Craft connection must use 23Space. Saved tasks and plans are unchanged.");
  return base;
}

export async function setCraftCompletion(source: CraftSource, completed: boolean) {
  if (source.spaceId !== SPACE_ID || !z.uuid().safeParse(source.taskId).success)
    throw new Error("This task is outside the connected Craft Inbox.");
  const base = await verifiedConnection();
  const id = new URL(source.url).searchParams.get("blockId") ?? source.taskId;
  if (id.toLowerCase() !== source.taskId) throw new Error("Craft task identity changed. Refresh first.");
  const readState = async () => {
    const block = await requestCraft(base, `/blocks?id=${encodeURIComponent(id)}&maxDepth=0`);
    const parsed = taskSchema.pick({id: true, taskInfo: true}).safeParse(block);
    if (!parsed.success || parsed.data.id.toLowerCase() !== source.taskId)
      throw new Error("Craft task identity could not be confirmed.");
    return parsed.data.taskInfo.state;
  };
  const desired = completed ? "done" : "todo";
  const current = await readState();
  if (current === "canceled") throw new Error("This task was canceled in Craft.");
  if (current === desired) return;
  try {
    await requestCraft(base, "/tasks", {
      tasksToUpdate: [{id, taskInfo: {state: desired}, ...(completed ? {} : {location: {type: "inbox"}})}],
    });
  } catch {
    // Craft may have applied the change before the response was lost.
  }
  if (await readState() !== desired)
    throw new Error("Craft did not confirm the status change. Refresh and try again.");
}

type SavedCraftRow = {id: string; status: string; updated_at: string; source: CraftSource};

export async function refreshCraftInbox() {
  const base = await verifiedConnection();
  const existing = await supabaseRest("command_center_inbox?source->>provider=eq.craft&select=id,status,updated_at,source") as SavedCraftRow[];
  const result = z.object({items: z.array(taskSchema).max(1000)}).safeParse(await requestCraft(base, "/tasks?scope=inbox"));
  if (!result.success) throw new Error("Craft returned unreadable inbox tasks. Saved tasks and plans are unchanged.");
  const completedIds = new Set<string>();
  if (existing.length) {
    const logbook = z.object({items: z.array(taskSchema.pick({id: true, taskInfo: true}))}).safeParse(
      await requestCraft(base, "/tasks?scope=logbook"),
    );
    if (!logbook.success) throw new Error("Craft returned an unreadable Logbook. Saved tasks and plans are unchanged.");
    for (const item of logbook.data.items) {
      if (item.taskInfo.state === "done") completedIds.add(item.id.toLowerCase());
    }
  }
  const tasks = result.data.items.filter(task => task.taskInfo.state === "todo").map(task => {
    const taskId = task.id.toLowerCase();
    const title = task.markdown.replace(/^\s*[-*]\s+\[[ xX]\]\s*/, "").trim();
    if (!title || title.length > 255) throw new Error("A Craft task needs a title of 1–255 characters. Saved tasks and plans are unchanged.");
    const source: CraftSource = {
      provider: "craft", spaceId: SPACE_ID, taskId, title, markdown: task.markdown,
      // Format verified from GET /blocks metadata for the real inbox task.
      url: `craftdocs://open?spaceId=${SPACE_ID}&blockId=${task.id}`,
      deadlineDate: task.taskInfo.deadlineDate ?? null, scheduleDate: task.taskInfo.scheduleDate ?? null,
    };
    return {id: captureId(taskId), title, due_date: source.deadlineDate, source};
  });
  const inboxIds = new Set(tasks.map(task => task.source.taskId));
  try {
    // Reconcile against the saved version read before the source refresh.
    for (const row of existing) {
      const taskId = row.source.taskId;
      const inInbox = inboxIds.has(taskId);
      const inLogbook = completedIds.has(taskId);
      if (inInbox === inLogbook) continue;
      const status = inLogbook ? "Done" : row.status === "Done" ? "Todo" : row.status;
      if (status === row.status) continue;
      await supabaseRest(
        `command_center_inbox?id=eq.${row.id}&updated_at=eq.${encodeURIComponent(row.updated_at)}`,
        {method: "PATCH", body: JSON.stringify({status, updated_at: new Date().toISOString()})},
      );
    }
    let rows: SavedCraftRow[] = [];
    if (tasks.length) {
      const imported = await supabaseRest("rpc/command_center_craft_import", {method: "POST", body: JSON.stringify({p_tasks: tasks})});
      if (!Array.isArray(imported) || imported.length !== tasks.length || tasks.some(task => !imported.some(row => row.id === task.id && row.title === task.title && row.due_date === task.due_date && row.source?.taskId === task.source.taskId))) throw new Error();
      rows = imported;
    }
    return {imported: rows.length};
  } catch {
    // A timed-out write may have succeeded; stable IDs make retry safe.
    throw new Error("Craft import was not confirmed. Keep your saved plans and try Refresh again.");
  }
}
