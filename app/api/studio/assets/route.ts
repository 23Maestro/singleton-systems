import { issueStudioAssetTicket, studioAssetKey, studioAssetUpload } from "@/lib/studio-assets";
import { owner } from "@/lib/studio-session";
import { producer, reviewHeaders } from "@/lib/video-review-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!producer(request)) return new Response("Unauthorized", { status: 401, headers: reviewHeaders });
  const site = process.env.VIDEO_REVIEW_SITE_URL, token = process.env.VIDEO_REVIEW_BACKEND_TOKEN;
  if (!site || !token || token.length < 32) return new Response("Storage unavailable", { status: 503, headers: reviewHeaders });
  try {
    const asset = studioAssetUpload.parse(await request.json());
    return Response.json({
      url: new URL("/studio-assets", site).href,
      ticket: await issueStudioAssetTicket(asset, token),
    }, { headers: reviewHeaders });
  } catch {
    return new Response("Invalid asset upload", { status: 400, headers: reviewHeaders });
  }
}

export async function GET(request: Request) {
  if (!owner(request) && !producer(request)) return new Response("Unauthorized", { status: 401, headers: reviewHeaders });
  const site = process.env.VIDEO_REVIEW_SITE_URL, token = process.env.VIDEO_REVIEW_BACKEND_TOKEN;
  if (!site || !token) return new Response("Storage unavailable", { status: 503, headers: reviewHeaders });
  const asset = studioAssetKey.safeParse(Object.fromEntries(new URL(request.url).searchParams));
  if (!asset.success) return new Response("Invalid asset", { status: 400, headers: reviewHeaders });
  try {
    const url = new URL("/studio-assets", site);
    url.search = new URLSearchParams(asset.data).toString();
    const range = request.headers.get("range");
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}`, "Accept-Encoding": "identity", ...(range ? { Range: range } : {}) }, cache: "no-store",
      redirect: "error", signal: AbortSignal.timeout(90_000),
    });
    const headers = new Headers({
      ...reviewHeaders, "Content-Type": response.headers.get("content-type") ?? "application/octet-stream",
      "X-Content-Type-Options": "nosniff",
    });
    for (const name of ["accept-ranges", "content-range", "content-length"]) {
      const value = response.headers.get(name);
      if (value) headers.set(name, value);
    }
    return new Response(response.body, { status: response.status, headers });
  } catch {
    return new Response("Storage unavailable", { status: 503, headers: reviewHeaders });
  }
}
