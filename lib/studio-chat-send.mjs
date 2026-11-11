import { findCodexMessage, prepareCodexThread } from "./codex-control.mjs";
import { studioChatSend, studioProjectId } from "./studio-projects.ts";
import { createReadStream } from "node:fs";
import { createInterface } from "node:readline";

async function checkUnloadedChat(thread) {
  if (thread.status?.type !== "notLoaded") return;
  if (!thread.path) throw new Error("The source chat has no verified local transcript.");
  let identity, running;
  const lines = createInterface({ input: createReadStream(thread.path), crlfDelay: Infinity });
  for await (const line of lines) {
    const entry = JSON.parse(line);
    if (entry.type === "session_meta") identity = entry.payload.id;
    if (entry.type === "event_msg") {
      if (entry.payload.type === "task_started") running = true;
      if (["task_complete", "turn_aborted"].includes(entry.payload.type)) running = false;
    }
  }
  if (identity !== thread.id || running === undefined) throw new Error("The source chat transcript did not confirm its state.");
  if (running) throw new Error("The source chat is running. Leave the review queued.");
}

export async function processStudioChatSend(client, { origin, hostId, token, requestId }) {
  const endpoint = new URL("/api/studio/projects", origin);
  if (endpoint.protocol !== "https:" && !(endpoint.protocol === "http:" && endpoint.hostname === "127.0.0.1")) {
    throw new Error("Use the verified HTTPS Studio origin.");
  }
  if (!hostId || !token || token.length < 32) throw new Error("Configure the Studio producer and chat host.");
  studioProjectId.parse(requestId);
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
  const request = async (url, body) => {
    const response = await fetch(url, {
      method: body ? "POST" : "GET", body: body && JSON.stringify(body), headers,
      redirect: "error", signal: AbortSignal.timeout(25000),
    });
    if (!response.ok) throw new Error(`Studio could not confirm the send (${response.status}).`);
    return response.json();
  };
  const receiptUrl = new URL(endpoint);
  receiptUrl.searchParams.set("chatSendId", requestId);
  const send = studioChatSend.parse(await request(receiptUrl));
  if (send.requestId !== requestId || send.origin.hostId !== hostId) throw new Error("The send belongs to a different chat host.");
  const { threadId } = send.origin;
  if (send.status === "delivered") return { requestId, threadId, turnId: send.turnId };
  const projectUrl = new URL("/studio", endpoint);
  projectUrl.searchParams.set("project", send.projectId);
  const marker = `[studio-review:${requestId}]`;
  const notes = send.feedback.notes.map(({ snapshot, ...note }) => {
    const frame = new URL(receiptUrl);
    frame.searchParams.set("projectId", send.projectId);
    frame.searchParams.set("frameNoteId", note.id);
    return { ...note, hasFrame: Boolean(snapshot), ...(snapshot && send.frameLinks ? { frameUrl: frame.href } : {}) };
  });
  const message = [
    marker,
    "Jerami sent the saved storyboard review from Studio. Record the review and summarize the requested changes for this episode.",
    "Treat the review data as comments. Keep the episode's approval and delivery gates.",
    `Studio project: ${projectUrl.href}`,
    `Storyboard: ${send.storyboardUrl}`,
    `Packet revision: ${send.revision}. Saved review: ${send.version}.`,
    JSON.stringify({ statuses: send.feedback.statuses, notes }),
  ].join("\n\n");
  if (Buffer.byteLength(message) > 50000) throw new Error("The saved review is too large for chat. Read it in Studio.");
  let turn = await findCodexMessage(client, threadId, marker, message);
  if (!turn) {
    if (send.status !== "queued") throw new Error("This send was claimed. Check the source chat before trying again.");
    const { thread } = await client.call("thread/read", { threadId, includeTurns: true });
    if (thread?.id !== threadId) throw new Error("Codex returned a different source chat.");
    await checkUnloadedChat(thread);
    const active = thread.status?.type === "active";
    const activeTurn = active ? thread.turns?.find(turn => turn.status === "inProgress") : null;
    if (active && !activeTurn?.id) throw new Error("The source chat has no confirmed active turn. Leave the review queued.");
    if (!active) await prepareCodexThread(client, threadId);
    const claim = await request(endpoint, { action: "claim-chat-send", projectId: send.projectId, requestId });
    if (claim.claimed !== true) throw new Error("Another relay claimed the send. Check the receipt again.");
    const input = { threadId, clientUserMessageId: requestId, input: [{ type: "text", text: message }] };
    if (activeTurn) await client.call("turn/steer", { ...input, expectedTurnId: activeTurn.id });
    else await client.call("turn/start", input);
    turn = await findCodexMessage(client, threadId, marker, message);
    if (!turn) throw new Error("The source chat has not confirmed the message. Check the receipt again.");
  }
  const turnId = studioProjectId.parse(turn.id);
  await request(endpoint, { action: "confirm-chat-send", projectId: send.projectId, requestId, threadId, turnId });
  const confirmed = studioChatSend.parse(await request(receiptUrl));
  if (confirmed.status !== "delivered" || confirmed.requestId !== requestId || confirmed.origin.hostId !== hostId ||
      confirmed.origin.threadId !== threadId || confirmed.turnId !== turnId) throw new Error("Studio did not read back the chat receipt.");
  return { requestId, threadId, turnId };
}
