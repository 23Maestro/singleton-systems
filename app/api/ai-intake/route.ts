import { NextResponse } from "next/server";
import { z } from "zod";
import { createHash } from "node:crypto";
import { saveAiIntakeAudio, updateAiInquiryDelivery } from "@/lib/ai-intake";
import { recordClientInquiry } from "@/lib/client-inquiries";
import { delivered, deliveryFailed, deliveryHttpStatus, recordedReceipt, type DeliveryOutcome } from "@/lib/delivery-outcome";
import { AI_WORKFLOW_OFFER_VALUES } from "@/lib/ai-workflow-offers";

const MAX_AUDIO_BYTES = 25 * 1024 * 1024;

const intakeSchema = z.object({
  requestId: z.string().uuid().optional(),
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(320),
  aiWish: z.string().trim().max(5000),
  helpfulContext: z.string().trim().max(5000),
  offer: z.enum(AI_WORKFLOW_OFFER_VALUES),
  company: z.string().trim().max(0),
});

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const input = intakeSchema.parse({
      requestId: form.get("requestId") ?? undefined,
      name: form.get("name") ?? "",
      email: form.get("email") ?? "",
      aiWish: form.get("aiWish") ?? "",
      helpfulContext: form.get("helpfulContext") ?? "",
      offer: form.get("offer") ?? "",
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

    const record = await recordClientInquiry({
      requestId: input.requestId, form: "ai", name: input.name, email: input.email, offer: input.offer,
      details: {
        aiWish: input.aiWish || "Voice memo attached.",
        helpfulContext: input.helpfulContext || null,
        hasAudio: Boolean(audio),
        ...(audio ? { audioName: audio.name, audioType: audio.type, audioBytes: audio.size,
          audioSha256: createHash("sha256").update(Buffer.from(await audio.arrayBuffer())).digest("hex") } : {}),
      },
    });
    let delivery: DeliveryOutcome = delivered({ owner: "Supabase", ...record, receipt: recordedReceipt(record.recordId) });
    if (audio) {
      try {
        const objectPath = await saveAiIntakeAudio(record.recordId, audio);
        await updateAiInquiryDelivery(record.recordId, {
          delivery_state: "delivered", delivery_error: null,
          audio_object_path: objectPath, audio_file_name: audio.name, audio_content_type: audio.type,
        });
      } catch {
        const message = "Your notes were saved, but the voice memo is not ready. Please try again.";
        try { await updateAiInquiryDelivery(record.recordId, { delivery_state: "failed", delivery_error: message }); }
        catch { console.error("[ai-intake] Could not save attachment failure state", { requestId: record.recordId }); }
        delivery = deliveryFailed({ owner: "Supabase", error: message, receipt: recordedReceipt(record.recordId) });
      }
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
