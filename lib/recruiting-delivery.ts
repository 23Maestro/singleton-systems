import type { RecruitingInquiry } from "@/lib/recruiting-intake";
import { recordClientInquiry } from "@/lib/client-inquiries";

export async function deliverRecruitingInquiry(input: RecruitingInquiry & { requestId?: string }) {
  return recordClientInquiry({
    requestId: input.requestId,
    form: "recruiting", name: input.name,
    email: input.contact.includes("@") ? input.contact : null,
    phone: input.contact.includes("@") ? null : input.contact,
    offer: "recruiting-highlights",
    details: { sport: input.sport, purpose: input.purpose, footage: input.footage, deadline: input.deadline || null },
  });
}
