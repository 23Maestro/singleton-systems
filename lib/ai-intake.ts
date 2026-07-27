import { supabaseRest, supabaseStorageUpload } from "@/lib/supabase-rest";

const AUDIO_BUCKET = "ai-intake-voice-memos";

export type AiIntakeRequest = {
  id: string;
  name: string;
  email: string;
  ai_wish: string;
  helpful_context: string | null;
  audio_object_path: string | null;
  audio_file_name: string | null;
  audio_content_type: string | null;
  notion_page_id: string | null;
  notion_delivery_state: "pending" | "delivered" | "failed";
  notion_delivery_error: string | null;
};

type AiIntakeInsert = Pick<AiIntakeRequest, "name" | "email" | "ai_wish" | "helpful_context" | "audio_object_path" | "audio_file_name" | "audio_content_type">;

export async function saveAiIntakeAudio(id: string, file: File) {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-").slice(-120) || "voice-memo";
  const objectPath = `${id}/${safeName}`;
  await supabaseStorageUpload(AUDIO_BUCKET, objectPath, file, file.type || "application/octet-stream");
  return objectPath;
}

export async function createAiIntakeRequest(input: AiIntakeInsert) {
  const [row] = await supabaseRest("ai_intake_requests", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify(input),
  });
  return row as AiIntakeRequest;
}

export async function updateAiIntakeAudio(id: string, audio: Pick<AiIntakeRequest, "audio_object_path" | "audio_file_name" | "audio_content_type">) {
  await supabaseRest(`ai_intake_requests?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify(audio),
  });
}

export async function updateAiIntakeNotionDelivery(id: string, delivery: Pick<AiIntakeRequest, "notion_page_id" | "notion_delivery_state" | "notion_delivery_error">) {
  await supabaseRest(`ai_intake_requests?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({ ...delivery, delivered_at: delivery.notion_delivery_state === "delivered" ? new Date().toISOString() : null }),
  });
}

function notionEnv() {
  const token = process.env.NOTION_API_KEY;
  const dataSourceId = process.env.NOTION_AI_INTAKE_DATA_SOURCE_ID;
  if (!token || !dataSourceId) return null;
  return { token, dataSourceId };
}

export async function createNotionAiIntakePage(request: AiIntakeRequest) {
  const config = notionEnv();
  if (!config) throw new Error("Notion delivery is not configured.");

  const audioNote = request.audio_object_path
    ? `Voice memo saved privately: ${request.audio_file_name ?? "audio file"} (${request.audio_object_path})`
    : "No voice memo attached.";
  const response = await fetch("https://api.notion.com/v1/pages", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.token}`,
      "Content-Type": "application/json",
      "Notion-Version": "2025-09-03",
    },
    body: JSON.stringify({
      parent: { data_source_id: config.dataSourceId },
      properties: {
        Name: { title: [{ text: { content: request.name } }] },
        Email: { email: request.email },
        "AI wish": { rich_text: [{ text: { content: request.ai_wish } }] },
        "Helpful context": { rich_text: request.helpful_context ? [{ text: { content: request.helpful_context } }] : [] },
      },
      children: [
        {
          object: "block",
          type: "paragraph",
          paragraph: { rich_text: [{ type: "text", text: { content: audioNote } }] },
        },
      ],
    }),
  });
  const body = (await response.json()) as { id?: string; message?: string };
  if (!response.ok || !body.id) throw new Error(body.message || `Notion delivery failed (${response.status}).`);
  return body.id;
}
