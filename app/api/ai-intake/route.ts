import { NextResponse } from "next/server";
import { z } from "zod";
import { createAiIntakeRequest, createNotionAiIntakePage, saveAiIntakeAudio, updateAiIntakeAudio, updateAiIntakeNotionDelivery } from "@/lib/ai-intake";
import { delivered, deliveryFailed, deliveryHttpStatus, recordedReceipt, type DeliveryOutcome } from "@/lib/delivery-outcome";

const MAX_AUDIO_BYTES = 25 * 1024 * 1024;

const intakeSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(320),
  aiWish: z.string().trim().max(5000),
  helpfulContext: z.string().trim().max(5000),
  company: z.string().trim().max(0),
});

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const input = intakeSchema.parse({
      name: form.get("name") ?? "",
      email: form.get("email") ?? "",
      aiWish: form.get("aiWish") ?? "",
      helpfulContext: form.get("helpfulContext") ?? "",
      company: form.get("company") ?? "",
    });
    const audioEntry = form.get("audio");
    const audio = audioEntry instanceof File && audioEntry.size > 0 ? audioEntry : null;
    if (audio && (!audio.type.startsWith("audio/") || audio.size > MAX_AUDIO_BYTES)) {
      return NextResponse.json({ error: "Attach an audio file up to 25 MB." }, { status: 400 });
    }
    if (!input.aiWish && !audio) {
      return NextResponse.json({ error: "Add a link or notes, or attach a voice memo." }, { status: 400 });
    }

    const draft = await createAiIntakeRequest({
      name: input.name,
      email: input.email,
      ai_wish: input.aiWish || "Voice memo attached.",
      helpful_context: input.helpfulContext || null,
      audio_object_path: null,
      audio_file_name: null,
      audio_content_type: null,
    });
    const audioObjectPath = audio ? await saveAiIntakeAudio(draft.id, audio) : null;
    const saved = audioObjectPath && audio
      ? { ...draft, audio_object_path: audioObjectPath, audio_file_name: audio.name, audio_content_type: audio.type || null }
      : draft;

    if (audioObjectPath && audio) {
      await updateAiIntakeAudio(draft.id, { audio_object_path: audioObjectPath, audio_file_name: audio.name, audio_content_type: audio.type || null });
    }

    let delivery: DeliveryOutcome;
    try {
      const notionPageId = await createNotionAiIntakePage(saved);
      await updateAiIntakeNotionDelivery(draft.id, { notion_page_id: notionPageId, notion_delivery_state: "delivered", notion_delivery_error: null });
      delivery = delivered({
        owner: "Notion",
        recordId: notionPageId,
        recordUrl: `https://app.notion.com/p/${notionPageId.replaceAll("-", "")}`,
        receipt: recordedReceipt(draft.id),
      });
    } catch (error) {
      const notionDeliveryError = error instanceof Error ? error.message.slice(0, 500) : "Unknown Notion delivery error.";
      console.error("[ai-intake] Notion delivery failed", { requestId: draft.id, error: notionDeliveryError });
      await updateAiIntakeNotionDelivery(draft.id, {
        notion_page_id: null,
        notion_delivery_state: "failed",
        notion_delivery_error: notionDeliveryError,
      });
      delivery = deliveryFailed({
        owner: "Notion",
        error: notionDeliveryError,
        receipt: recordedReceipt(draft.id),
      });
    }

    return NextResponse.json(
      { ok: true, deliveryState: delivery.state, delivery },
      { status: deliveryHttpStatus(delivery) },
    );
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Please complete the required fields with a valid email." }, { status: 400 });
    console.error("[ai-intake] failed", error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
