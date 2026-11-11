import { newSession, sessionCookie, STUDIO_COOKIE_SECONDS, studioBrowserHost, verifyAccessLink } from '@/lib/studio-session';
import { reviewHeaders, reviewSameOrigin } from '@/lib/video-review-server';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function POST(request: Request) {
  if (!studioBrowserHost(request) || !reviewSameOrigin(request)) return new Response('Invalid origin', { status: 403, headers: reviewHeaders });
  try {
    const raw = await request.text();
    if (raw.length > 1024) return new Response('Invalid access link', { status: 400, headers: reviewHeaders });
    const value = JSON.parse(raw);
    if (typeof value.access !== 'string' || !verifyAccessLink(value.access)) return new Response('Invalid access link', { status: 401, headers: reviewHeaders });
    return Response.json({ authenticated: true }, { headers: { ...reviewHeaders, 'Set-Cookie': sessionCookie(newSession(), STUDIO_COOKIE_SECONDS) } });
  } catch { return new Response('Invalid request', { status: 400, headers: reviewHeaders }); }
}
export function DELETE(request: Request) {
  if (!reviewSameOrigin(request)) return new Response('Invalid origin', { status: 403, headers: reviewHeaders });
  return Response.json({ authenticated: false }, { headers: { ...reviewHeaders, 'Set-Cookie': sessionCookie('', 0) } });
}
