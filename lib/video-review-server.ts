import { timingSafeEqual } from "node:crypto";
import type { VideoReview, ReviewRender } from "./video-review";

export const reviewHeaders = { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow" };
function equal(left: string, right: string) {
  const a = Buffer.from(left), b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}
export function reviewConfigured() {
  const values = [process.env.VIDEO_REVIEW_PRODUCER_TOKEN, process.env.VIDEO_REVIEW_BACKEND_TOKEN];
  return values.every(value => value && value.length >= 32) && new Set(values).size === 2;
}
export function producer(request: Request) {
  return reviewConfigured() && equal(request.headers.get("authorization") ?? "", `Bearer ${process.env.VIDEO_REVIEW_PRODUCER_TOKEN}`);
}
export function reviewSameOrigin(request: Request) {
  const origin = request.headers.get("origin"), host = request.headers.get("host");
  if (!origin || !host) return false;
  // Next may use localhost in request.url while the browser uses the listening IP.
  try {
    return origin === new URL(`${new URL(request.url).protocol}//${host}`).origin;
  } catch { return false; }
}
export async function reviewBackend(reviewId?: string, body?: string | FormData, path = "/video-reviews") {
  const site = process.env.VIDEO_REVIEW_SITE_URL, token = process.env.VIDEO_REVIEW_BACKEND_TOKEN;
  if (!site || !token) throw new Error("Review storage is not configured.");
  const url = new URL(path, site);
  if (reviewId) url.searchParams.set("reviewId", reviewId);
  return fetch(url, {
    method: body === undefined ? "GET" : "POST",
    headers: { Authorization: `Bearer ${token}`, ...(typeof body === "string" ? { "Content-Type": "application/json" } : {}) },
    body, cache: "no-store", signal: AbortSignal.timeout(20000),
  });
}
export async function readVideoReview(id: string): Promise<VideoReview> {
  const response = await reviewBackend(id);
  if (!response.ok) throw new Error("Review storage could not be reached.");
  const data = await response.json() as { renders: ReviewRender[]; notes: VideoReview["notes"] };
  return { renders: data.renders.map(({ origin: _origin, ...render }) => render), notes: data.notes };
}
