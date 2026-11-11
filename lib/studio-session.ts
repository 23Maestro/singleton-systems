import { createHmac, timingSafeEqual } from 'node:crypto';

const cookie = 'studio_owner';
export const STUDIO_COOKIE_SECONDS = 400 * 24 * 60 * 60;
const legacyLifetime = 30 * 24 * 60 * 60 * 1000;
const productionHosts = new Set(['www.singleton-systems.com', 'singleton-systems.com']);
const sign = (value: string, key: string) => createHmac('sha256', key).update(value).digest('hex');
const token = (purpose: 'link' | 'session', key: string) => `v1.${sign(`studio:${purpose}:v1`, key)}`;
function equal(a: string, b: string) {
  const left = Buffer.from(a), right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}
function signingKey() {
  const key = process.env.STUDIO_OWNER_KEY;
  return key && key.length >= 32 ? key : null;
}
export function newAccessLink() {
  const key = signingKey();
  if (!key) throw new Error('Studio access is unavailable.');
  return token('link', key);
}
export function verifyAccessLink(value: string) {
  const key = signingKey();
  return key !== null && equal(value, token('link', key));
}
export function newSession() {
  const key = signingKey();
  if (!key) throw new Error('Studio access is unavailable.');
  return token('session', key);
}
export function studioBrowserHost(request: Pick<Request, 'headers'>) {
  return process.env.NODE_ENV !== 'production' || productionHosts.has(request.headers.get('host') ?? '');
}
export function owner(request: Pick<Request, 'headers'>) {
  const key = signingKey();
  if (!key || !studioBrowserHost(request)) return false;
  const raw = request.headers.get('cookie')?.split(';').map(v => v.trim()).find(v => v.startsWith(`${cookie}=`))?.slice(cookie.length + 1);
  if (!raw) return false;
  if (equal(raw, token('session', key))) return true;
  // Sessions issued before the bookmark was introduced retain their original expiry.
  const [expiry, signature, extra] = raw.split('.');
  return extra === undefined && /^\d+$/.test(expiry) && Number(expiry) > Date.now()
    && Number(expiry) <= Date.now() + legacyLifetime && !!signature && equal(signature, sign(expiry, key));
}
export function sessionCookie(value: string, maxAge: number) {
  return `${cookie}=${value}; HttpOnly; Path=/; SameSite=Strict; Max-Age=${maxAge}${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`;
}
