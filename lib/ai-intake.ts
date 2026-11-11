import { supabaseRest, supabaseStorageUpload } from "@/lib/supabase-rest";

const AUDIO_BUCKET = "ai-intake-voice-memos";

export async function saveAiIntakeAudio(id: string, file: File) {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-").slice(-120) || "voice-memo";
  const objectPath = `${id}/${safeName}`;
  await supabaseStorageUpload(AUDIO_BUCKET, objectPath, file, file.type || "application/octet-stream");
  return objectPath;
}

export async function updateAiInquiryDelivery(id: string, update: {
  delivery_state: "delivered" | "failed";
  delivery_error: string | null;
  audio_object_path?: string;
  audio_file_name?: string;
  audio_content_type?: string;
}) {
  const rows = await supabaseRest(`client_inquiries?id=eq.${encodeURIComponent(id)}&form=eq.ai`, {
    method: "PATCH", headers: { Prefer: "return=representation" }, body: JSON.stringify(update),
  });
  if (rows?.length !== 1 || rows[0].id !== id) throw new Error("Inquiry attachment receipt was not saved.");
}
