import { videoOffer, type VideoOffer } from "@/lib/video-offers";
import { recordClientInquiry } from "@/lib/client-inquiries";

export type VideoInquiry = { name: string; email: string; footage: string; offer: VideoOffer; requestId?: string };

export async function deliverVideoInquiry(input: VideoInquiry) {
  return recordClientInquiry({
    requestId: input.requestId,
    form: "video", name: input.name, email: input.email, offer: input.offer,
    details: { offerLabel: videoOffer(input.offer).label, footage: input.footage },
  });
}
