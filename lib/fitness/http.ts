export const privateHeaders = {
  "Cache-Control": "private, no-store",
  "X-Robots-Tag": "noindex, nofollow",
};
export function sameOrigin(req: Request) {
  return req.headers.get("origin") === new URL(req.url).origin;
}
