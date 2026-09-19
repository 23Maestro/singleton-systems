import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
const http = httpRouter();
const route = httpAction(async (ctx, request) => {
  const token = process.env.FITNESS_BACKEND_TOKEN;
  if (!token || request.headers.get("authorization") !== `Bearer ${token}`)
    return new Response("Unauthorized", { status: 401 });
  try {
    if (request.method === "GET")
      return Response.json(await ctx.runQuery(internal.fitness.read, {}), {
        headers: { "Cache-Control": "no-store" },
      });
    const body = await request.text();
    if (body.length > 12000)
      return new Response("Request too large", { status: 413 });
    return Response.json(
      await ctx.runMutation(internal.fitness.update, { command: body }),
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to save.";
    const conflict = message.includes("another device");
    return Response.json(
      {
        error: conflict
          ? "This workout changed on another device. Refreshed; try again."
          : "Could not save this change. Refresh and try again.",
      },
      { status: conflict ? 409 : 400 },
    );
  }
});
http.route({ path: "/fitness", method: "GET", handler: route });
http.route({ path: "/fitness", method: "POST", handler: route });
export default http;
