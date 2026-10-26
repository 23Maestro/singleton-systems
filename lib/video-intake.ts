import { videoOffer, type VideoOffer } from "@/lib/video-offers";

export type VideoInquiry = { name: string; email: string; footage: string; offer: VideoOffer };

// The existing private inquiry queue owns leads. No client credentials or schema changes.
export async function deliverVideoInquiry(input: VideoInquiry) {
  const token = process.env.NOTION_API_KEY;
  const dataSourceId = process.env.NOTION_AI_INTAKE_DATA_SOURCE_ID;
  if (!token || !dataSourceId) throw new Error("Video inquiry delivery is not configured.");
  const selectedOffer = videoOffer(input.offer);
  const richText = (content: string) => (content.match(/[\s\S]{1,1900}/g) ?? []).map((chunk) => ({ type: "text", text: { content: chunk } }));
  const response = await fetch("https://api.notion.com/v1/pages", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", "Notion-Version": "2025-09-03" },
    body: JSON.stringify({
      parent: { data_source_id: dataSourceId },
      properties: {
        Name: { title: richText(`${input.name} — ${selectedOffer.label}`) },
        Email: { email: input.email },
        "Helpful context": { rich_text: richText(`${selectedOffer.label}\n${input.footage}`) },
        Stage: { select: { name: "New" } },
      },
      children: [
        { object: "block", type: "heading_2", heading_2: { rich_text: richText("Selected video offer") } },
        { object: "block", type: "paragraph", paragraph: { rich_text: richText(selectedOffer.label) } },
        { object: "block", type: "heading_2", heading_2: { rich_text: richText("Recording and series brief") } },
        { object: "block", type: "paragraph", paragraph: { rich_text: richText(input.footage) } },
      ],
    }),
  });
  const body = await response.json() as { id?: string };
  if (!response.ok || !body.id) throw new Error(`Video inquiry delivery failed (${response.status}).`);
  return { recordId: body.id, recordUrl: `https://app.notion.com/p/${body.id.replaceAll("-", "")}` };
}
