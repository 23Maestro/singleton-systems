import { httpAction } from "./_generated/server.js";
import { internal } from "./_generated/api.js";
import { z } from "zod";

export const taskRequestHttp = httpAction(async (ctx, request) => {
  const backend = process.env.TASK_REQUEST_BACKEND_TOKEN;
  const relay = process.env.TASK_REQUEST_RELAY_TOKEN;
  if (!backend || !relay || backend === relay) return new Response("Task request queue is not configured.", { status: 503 });
  const auth = request.headers.get("authorization");
  const isBackend = auth === `Bearer ${backend}`, isRelay = auth === `Bearer ${relay}`;
  if (!isBackend && !isRelay) return new Response("Unauthorized", { status: 401 });
  const headers = { "Cache-Control": "private, no-store" };
  try {
    if (request.method === "GET") {
      const requestId = z.uuid().parse(new URL(request.url).searchParams.get("requestId"));
      return Response.json(await ctx.runQuery(internal.taskRequests.read, { requestId }), { headers });
    }
    if (request.method !== "POST" || !request.headers.get("content-type")?.startsWith("application/json")) return new Response("Expected JSON.", { status: 415 });
    const command = await request.text();
    if (command.length > 400000) return new Response("Request too large.", { status: 413 });
    const action = JSON.parse(command)?.action;
    if (action === "enqueue" ? !isBackend : !isRelay) return new Response("This token cannot perform that action.", { status: 403 });
    return Response.json(await ctx.runMutation(internal.taskRequests.update, { command }), { headers });
  } catch {
    return Response.json({ error: "Request rejected. Read its current state before retrying." }, { status: 409, headers });
  }
});
