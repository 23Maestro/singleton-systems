import {
  privateHeaders as headers,
  sameOrigin,
} from "@/lib/fitness/http";
import { commandSchema } from "@/lib/fitness/model";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
async function proxy(req: Request) {
  const site = process.env.NEXT_PUBLIC_CONVEX_SITE_URL,
    token = process.env.FITNESS_BACKEND_TOKEN;
  if (!site || !token)
    return Response.json(
      { error: "Your workout log is not connected yet." },
      { status: 503, headers },
    );
  let body: string | undefined;
  if (req.method === "POST") {
    if (!sameOrigin(req))
      return Response.json(
        { error: "Invalid origin." },
        { status: 403, headers },
      );
    const raw = await req.text();
    if (raw.length > 12000)
      return Response.json(
        { error: "Request too large." },
        { status: 413, headers },
      );
    let parsed;
    try {
      parsed = commandSchema.safeParse(JSON.parse(raw));
    } catch {
      return Response.json(
        { error: "Invalid change." },
        { status: 400, headers },
      );
    }
    if (!parsed.success)
      return Response.json(
        { error: "Check the reps and weight." },
        { status: 400, headers },
      );
    body = JSON.stringify(parsed.data);
  }
  try {
    const response = await fetch(`${site}/fitness`, {
      method: req.method,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body,
      cache: "no-store",
      signal: AbortSignal.timeout(12000),
    });
    const data = await response.json();
    return Response.json(data, { status: response.status, headers });
  } catch {
    return Response.json(
      {
        error:
          "Could not reach your log. Your last saved sets are safe. Try again.",
      },
      { status: 503, headers },
    );
  }
}
export const GET = proxy;
export const POST = proxy;
