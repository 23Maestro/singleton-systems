import { connectCodexControl } from "../lib/codex-control.mjs";
import { processStudioChatSend } from "../lib/studio-chat-send.mjs";
import { mkdir, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";

try {
  const requestId = process.argv[2];
  if (!requestId || process.argv.length !== 3) throw new Error("Supply a Studio send ID or --pending.");
  const origin = process.env.STUDIO_ORIGIN;
  const token = process.env.VIDEO_REVIEW_PRODUCER_TOKEN;
  const hostId = process.env.VIDEO_REVIEW_PRODUCER_HOST_ID;
  let requests = [requestId];
  if (requestId === "--pending") {
    if (!token || token.length < 32 || !hostId) throw new Error("Studio producer access is not configured.");
    const url = new URL("/api/studio/projects", origin);
    if (url.protocol !== "https:") throw new Error("Use the verified HTTPS Studio origin.");
    url.searchParams.set("pendingChatHost", hostId);
    const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` }, redirect: "error", signal: AbortSignal.timeout(20000) });
    if (!response.ok) throw new Error(`Studio queue could not be read (${response.status}).`);
    requests = await response.json();
    if (!Array.isArray(requests) || requests.length > 50) throw new Error("Studio returned an invalid queue.");
  }
  const results = [];
  if (requests.length) {
    const client = await connectCodexControl();
    try {
      for (const id of requests) {
        try {
          results.push(await processStudioChatSend(client, { origin, token, hostId, requestId: id }));
        } catch (error) {
          results.push({ requestId: id, error: error.message });
        }
      }
    } finally {
      client.close();
    }
  }
  if (requestId === "--pending") {
    const directory = join(homedir(), "Library/Application Support/Singleton Systems/studio-relay");
    await mkdir(directory, { recursive: true, mode: 0o700 });
    await writeFile(join(directory, "status.json"), JSON.stringify({ checkedAt: new Date().toISOString(), results }), { mode: 0o600 });
  }
  console.log(JSON.stringify(results));
  if (results.some(result => result.error)) process.exitCode = 1;
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
