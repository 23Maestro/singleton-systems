import { z } from "zod";
import { deliverVideoInquiry } from "@/lib/video-intake";
import { VIDEO_OFFER_VALUES, videoOffer } from "@/lib/video-offers";
import { delivered } from "@/lib/delivery-outcome";

const inquirySchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(320),
  footage: z.string().trim().min(1).max(5000),
  offer: z.enum(VIDEO_OFFER_VALUES),
  company: z.string().trim().max(0),
});

export async function POST(request: Request) {
  let form: FormData;
  try { form = await request.formData(); }
  catch { return Response.json({ error: "Please send the inquiry form." }, { status: 400 }); }
  const result = inquirySchema.safeParse(Object.fromEntries(["name", "email", "footage", "offer", "company"].map((key) => [key, form.get(key) ?? ""])));
  if (!result.success) return Response.json({ error: "Add your name, a valid email, a recording link or brief, and a video offer." }, { status: 400 });
  try {
    const record = await deliverVideoInquiry(result.data);
    const selected = videoOffer(result.data.offer);
    return Response.json({ ok: true, offer: { value: selected.value, label: selected.label }, delivery: delivered({ owner: "Notion", ...record }) }, { status: 201 });
  } catch {
    return Response.json({ error: "Your inquiry could not be delivered. Please try again." }, { status: 502 });
  }
}
