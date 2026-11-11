import { producer, reviewHeaders, reviewSameOrigin } from "@/lib/video-review-server";
import { owner } from "@/lib/studio-session";
import { STUDIO_REQUEST_BYTES, studioChatSend, studioCommand, studioReviewRevision } from "@/lib/studio-projects";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function proxy(request: Request) {
  if (!producer(request) && !owner(request)) return Response.json({ error: "Open your private Studio link." }, { status: 401, headers: reviewHeaders });
  if (request.method !== "GET" && !producer(request) && !reviewSameOrigin(request)) return new Response("Invalid origin", { status: 403, headers: reviewHeaders });
  try {
    const site = process.env.VIDEO_REVIEW_SITE_URL, token = process.env.VIDEO_REVIEW_BACKEND_TOKEN;
    if (!site || !token) return Response.json({ error: "Studio storage is not configured." }, { status: 503, headers: reviewHeaders });
    const url = new URL("/studio-projects", site);
    const params = new URL(request.url).searchParams;
    const id = params.get("projectId");
    const revision = params.get("reviewRevision");
    const sendId = params.get("chatSendId");
    const frameNoteId = params.get("frameNoteId");
    if (frameNoteId !== null && (!id || !sendId || request.method !== "GET" || !z.uuid().safeParse(frameNoteId).success)) {
      return new Response("Choose a saved review frame.", { status: 400, headers: reviewHeaders });
    }
    const pendingHost = params.get("pendingChatHost");
    if (pendingHost !== null) {
      if (!producer(request) || pendingHost !== process.env.VIDEO_REVIEW_PRODUCER_HOST_ID) {
        return Response.json({ error: "This producer cannot read that chat host." }, { status: 403, headers: reviewHeaders });
      }
      url.searchParams.set("pendingChatHost", pendingHost);
    }
    if (sendId !== null) {
      if (!producer(request) && !id) return Response.json({ error: "Choose the review project." }, { status: 403, headers: reviewHeaders });
      url.searchParams.set("chatSendId", z.uuid().parse(sendId));
    }
    if (id) url.searchParams.set("projectId", z.uuid().parse(id));
    if (revision !== null) url.searchParams.set("reviewRevision", studioReviewRevision.parse(revision));
    let body: string | undefined;
    if (request.method === "POST") {
      const bytes = await request.arrayBuffer();
      if (bytes.byteLength > STUDIO_REQUEST_BYTES) return new Response("Project data too large.", { status: 413, headers: reviewHeaders });
      const parsed = studioCommand.safeParse(JSON.parse(new TextDecoder().decode(bytes)));
      if (!parsed.success) return Response.json({ error: "Invalid Studio command." }, { status: 400, headers: reviewHeaders });
      const command = parsed.data;
      if (command.action === "queue-chat-send" && !producer(request) && process.env.STUDIO_CHAT_SEND_ENABLED !== "1") {
        return Response.json({ error: "Chat sending is unavailable." }, { status: 503, headers: reviewHeaders });
      }
      if (["start-lineups", "packet", "claim-chat-send", "confirm-chat-send", "close-linked"].includes(command.action) && !producer(request)) {
        return Response.json({ error: "Producer access is required." }, { status: 403, headers: reviewHeaders });
      }
      if (command.action === "start-lineups" && command.handoff &&
          command.handoff.origin.hostId !== process.env.VIDEO_REVIEW_PRODUCER_HOST_ID) {
        return Response.json({ error: "This producer cannot bind that chat host." }, { status: 403, headers: reviewHeaders });
      }
      body = JSON.stringify(command);
    }
    const response = await fetch(url, { method: request.method, headers: { Authorization: `Bearer ${token}`, ...(body ? { "Content-Type": "application/json" } : {}) }, body, cache: "no-store", signal: AbortSignal.timeout(20000) });
    const result = await response.json();
    if (response.ok && frameNoteId) {
      const send = studioChatSend.parse(result);
      const snapshot = send.projectId === id && send.feedback.notes.find(note => note.id === frameNoteId)?.snapshot;
      if (!snapshot) return new Response("Saved frame not found.", { status: 404, headers: reviewHeaders });
      return new Response(new Uint8Array(Buffer.from(snapshot.split(",")[1], "base64")), {
        headers: { ...reviewHeaders, "Content-Type": "image/jpeg", "X-Content-Type-Options": "nosniff" },
      });
    }
    if (response.ok && sendId && !producer(request)) {
      if (result.projectId !== id) return Response.json({ error: "Review send not found." }, { status: 404, headers: reviewHeaders });
      return Response.json({ requestId: result.requestId, status: result.status, turnId: result.turnId }, { headers: reviewHeaders });
    }
    if (response.ok && request.method === "GET" && id && !revision && !sendId && result) {
      result.chatSendEnabled = process.env.STUDIO_CHAT_SEND_ENABLED === "1" && result.status === "active" &&
        Boolean(result.sourceChatId) && result.sourceHostId === process.env.VIDEO_REVIEW_PRODUCER_HOST_ID;
    }
    return Response.json(result, { status: response.status, headers: reviewHeaders });
  } catch {
    return Response.json({ error: "Studio could not reach project storage." }, { status: 503, headers: reviewHeaders });
  }
}
export const GET = proxy;
export const POST = proxy;
