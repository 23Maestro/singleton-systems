import { recruitingInquirySchema } from "@/lib/recruiting-intake";
import { deliverRecruitingInquiry } from "@/lib/recruiting-delivery";
import { delivered } from "@/lib/delivery-outcome";

export async function POST(request: Request) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return Response.json({ error: "Please send the highlight request form." }, { status: 400 });
  }

  const fields = ["name", "contact", "sport", "purpose", "footage", "deadline", "company"];
  const result = recruitingInquirySchema.safeParse(
    {requestId: form.get("requestId") ?? undefined, ...Object.fromEntries(fields.map((key) => [key, form.get(key) ?? ""]))},
  );
  if (!result.success) {
    return Response.json(
      {
        error:
          "Check your name, email or mobile number, sport, reel purpose, and footage. Use a valid date or leave it blank.",
      },
      { status: 400 },
    );
  }

  try {
    const record = await deliverRecruitingInquiry(result.data);
    return Response.json(
      { ok: true, delivery: delivered({ owner: "Supabase", ...record }) },
      { status: 201 },
    );
  } catch {
    return Response.json(
      { error: "Your request could not be sent. Your answers are still here. Please try again." },
      { status: 502 },
    );
  }
}
