import { z } from "zod";
import {
  commandCenterSnapshot,
  createLinearTask,
  updateLinearStatus,
  updateNotionStatus,
} from "@/lib/command-center";
import { supabaseRest } from "@/lib/supabase-rest";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const headers = {
  "Cache-Control": "private, no-store",
  "X-Robots-Tag": "noindex, nofollow",
};
const lane = z.enum(["AI Consultant", "Content Editor", "Development"]);
const contactFields = z.object({
  name: z.string().trim().min(1).max(160),
  company: z.string().trim().max(160).nullable(),
  email: z.email().nullable(),
  phone: z.string().trim().max(50).nullable(),
  lane,
  status: z.enum([
    "lead",
    "conversation",
    "proposal",
    "active",
    "paused",
    "closed",
  ]),
  relationship_context: z.string().trim().max(1000).nullable(),
  notes: z.string().trim().max(2000).nullable(),
  next_action: z.string().trim().max(300).nullable(),
  next_action_at: z.iso.datetime({ offset: true }).nullable(),
  linear_project_id: z.string().uuid().nullable(),
  invoice_url: z.url().startsWith("https://").nullable(),
  payment_note: z.string().trim().max(500).nullable(),
  source_url: z.url().startsWith("https://").nullable(),
});
const actionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("contactCreate"), contact: contactFields }),
  z.object({
    action: z.literal("contactUpdate"),
    id: z.number().int().positive(),
    contact: contactFields.partial(),
  }),
  z.object({
    action: z.literal("interactionCreate"),
    contactId: z.number().int().positive(),
    channel: z.enum(["email", "call", "message", "meeting", "other"]),
    summary: z.string().trim().min(1).max(1000),
    occurredAt: z.iso.datetime({ offset: true }),
    externalUrl: z.url().nullable(),
  }),
  z.object({
    action: z.literal("blockSave"),
    id: z.uuid().optional(),
    owner: z.enum(["linear", "notion", "home", "crm"]),
    ownerId: z.string().trim().min(1).max(160),
    selectedDate: z.iso.date(),
    startsAt: z.iso.datetime({ offset: true }).nullable(),
    endsAt: z.iso.datetime({ offset: true }).nullable(),
  }),
  z.object({ action: z.literal("blockDelete"), id: z.uuid() }),
  z.object({
    action: z.literal("draftSave"),
    id: z.uuid().optional(),
    title: z.string().trim().min(1).max(80),
    lane,
    subject: z.string().trim().max(160),
    body: z.string().trim().max(4000),
  }),
  z.object({
    action: z.literal("linearStatus"),
    issueId: z.string().uuid(),
    state: z.enum(["Todo", "In Progress", "In Review", "Done"]),
  }),
  z.object({
    action: z.literal("linearCreate"),
    title: z.string().trim().min(1).max(255),
    dueDate: z.iso.date().nullable(),
    lane,
  }),
  z.object({
    action: z.literal("notionStatus"),
    pageId: z.string().uuid(),
    state: z.enum(["Today", "Queued", "In Motion", "Waiting", "Done"]),
  }),
  z.object({
    action: z.literal("laneSave"),
    owner: z.enum(["linear", "notion"]),
    ownerId: z.string().uuid(),
    lane,
  }),
]);

export async function GET() {
  return Response.json(await commandCenterSnapshot(), { headers });
}

export async function POST(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin)
    return Response.json(
      { error: "Invalid origin." },
      { status: 403, headers },
    );
  if (!request.headers.get("content-type")?.startsWith("application/json"))
    return Response.json({ error: "Expected JSON." }, { status: 415, headers });
  const parsed = actionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return Response.json(
      { error: "Invalid command.", details: parsed.error.flatten() },
      { status: 400, headers },
    );
  const command = parsed.data;
  try {
    let result: unknown;
    switch (command.action) {
      case "contactCreate":
        result = await supabaseRest("contacts?select=*", {
          method: "POST",
          headers: { Prefer: "return=representation" },
          body: JSON.stringify(command.contact),
        });
        break;
      case "contactUpdate":
        result = await supabaseRest(`contacts?id=eq.${command.id}&select=*`, {
          method: "PATCH",
          headers: { Prefer: "return=representation" },
          body: JSON.stringify({
            ...command.contact,
            updated_at: new Date().toISOString(),
          }),
        });
        if (!Array.isArray(result) || result.length !== 1)
          throw new Error("Client update was not confirmed.");
        break;
      case "interactionCreate":
        result = await supabaseRest("crm_interactions?select=*", {
          method: "POST",
          headers: { Prefer: "return=representation" },
          body: JSON.stringify({
            contact_id: command.contactId,
            channel: command.channel,
            summary: command.summary,
            occurred_at: command.occurredAt,
            external_url: command.externalUrl,
          }),
        });
        break;
      case "blockSave": {
        if ((command.startsAt === null) !== (command.endsAt === null))
          throw new Error("A timed block needs both start and end.");
        if (
          command.startsAt &&
          command.endsAt &&
          command.endsAt <= command.startsAt
        )
          throw new Error("Block end must follow start.");
        const row = {
          owner: command.owner,
          owner_id: command.ownerId,
          selected_date: command.selectedDate,
          starts_at: command.startsAt,
          ends_at: command.endsAt,
          updated_at: new Date().toISOString(),
        };
        result = await supabaseRest(
          command.id
            ? `command_center_blocks?id=eq.${command.id}&select=*`
            : "command_center_blocks?select=*",
          {
            method: command.id ? "PATCH" : "POST",
            headers: { Prefer: "return=representation" },
            body: JSON.stringify(row),
          },
        );
        if (!Array.isArray(result) || result.length !== 1)
          throw new Error("Planner block was not confirmed.");
        break;
      }
      case "blockDelete":
        result = await supabaseRest(
          `command_center_blocks?id=eq.${command.id}&select=id`,
          { method: "DELETE", headers: { Prefer: "return=representation" } },
        );
        if (!Array.isArray(result) || result.length !== 1)
          throw new Error("Planner block removal was not confirmed.");
        break;
      case "draftSave": {
        const row = {
          title: command.title,
          lane: command.lane,
          subject: command.subject,
          body: command.body,
          updated_at: new Date().toISOString(),
        };
        result = await supabaseRest(
          command.id
            ? `crm_message_drafts?id=eq.${command.id}&select=*`
            : "crm_message_drafts?select=*",
          {
            method: command.id ? "PATCH" : "POST",
            headers: { Prefer: "return=representation" },
            body: JSON.stringify(row),
          },
        );
        if (!Array.isArray(result) || result.length !== 1)
          throw new Error("Draft was not confirmed.");
        break;
      }
      case "linearStatus":
        result = await updateLinearStatus(command.issueId, command.state);
        break;
      case "linearCreate": {
        const task = await createLinearTask(command.title, command.dueDate);
        const mapping = await supabaseRest(
          "command_center_work_lanes?on_conflict=owner,owner_id&select=*",
          {
            method: "POST",
            headers: {
              Prefer: "resolution=merge-duplicates,return=representation",
            },
            body: JSON.stringify({
              owner: "linear",
              owner_id: task.id,
              lane: command.lane,
              updated_at: new Date().toISOString(),
            }),
          },
        );
        if (!Array.isArray(mapping) || mapping.length !== 1)
          throw new Error(
            `Linear task ${task.identifier} exists, but its lane was not confirmed.`,
          );
        result = task;
        break;
      }
      case "notionStatus":
        result = await updateNotionStatus(command.pageId, command.state);
        break;
      case "laneSave":
        result = await supabaseRest(
          "command_center_work_lanes?on_conflict=owner,owner_id&select=*",
          {
            method: "POST",
            headers: {
              Prefer: "resolution=merge-duplicates,return=representation",
            },
            body: JSON.stringify({
              owner: command.owner,
              owner_id: command.ownerId,
              lane: command.lane,
              updated_at: new Date().toISOString(),
            }),
          },
        );
        if (!Array.isArray(result) || result.length !== 1)
          throw new Error("Lane change was not confirmed.");
        break;
    }
    return Response.json({ result }, { headers });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Command failed." },
      { status: 502, headers },
    );
  }
}
