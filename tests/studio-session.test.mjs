import assert from 'node:assert/strict';
import test from 'node:test';
import { createHmac } from 'node:crypto';
import { build } from 'esbuild';
import { newAccessLink, newSession, owner } from '../lib/studio-session.ts';

test('the bookmark and browser session survive time and are revoked when the owner key changes', async t => {
  const before = process.env.STUDIO_OWNER_KEY;
  const environment = process.env.NODE_ENV;
  const key = 'test-key-that-is-at-least-32-characters-long';
  process.env.STUDIO_OWNER_KEY = key;
  t.after(() => {
    if (before === undefined) delete process.env.STUDIO_OWNER_KEY; else process.env.STUDIO_OWNER_KEY = before;
    if (environment === undefined) delete process.env.NODE_ENV; else process.env.NODE_ENV = environment;
  });
  const { outputFiles } = await build({
    entryPoints: ['app/api/studio/session/route.ts'],
    bundle: true, platform: 'node', format: 'esm', write: false,
  });
  const { POST } = await import('data:text/javascript;base64,' + Buffer.from(outputFiles[0].contents).toString('base64'));
  const url = 'https://example.com';
  const redeem = (value, origin = url) => POST(new Request(url + '/api/studio/session', {
    method: 'POST', headers: { Origin: origin, Host: 'example.com' }, body: JSON.stringify(value),
  }));
  const withCookie = cookie => new Request(url, { headers: { cookie } });
  const access = newAccessLink();
  assert.equal(owner(withCookie(`studio_owner=${access}`)), false);
  assert.equal((await redeem({ access }, 'https://other.example')).status, 403);
  assert.equal((await redeem({ key })).status, 401);
  assert.equal((await redeem({ access: access + 'x' })).status, 401);
  assert.equal((await redeem({ access: newSession() })).status, 401);
  const previousExpiry = Date.now() + 60_000;
  const legacyCookie = 'studio_owner=' + previousExpiry + '.' + createHmac('sha256', key).update(String(previousExpiry)).digest('hex');
  const previousLink = previousExpiry + '.' + createHmac('sha256', key).update(`link:${previousExpiry}`).digest('hex');
  assert.equal(owner(withCookie(legacyCookie)), true);
  assert.equal((await redeem({ access: previousLink })).status, 401);
  const response = await redeem({ access });
  assert.equal(response.status, 200);
  const cookie = response.headers.get('set-cookie');
  assert.match(cookie, /HttpOnly; Path=\/; SameSite=Strict; Max-Age=34560000/);
  assert.equal(owner(withCookie(cookie)), true);
  const later = Date.now() + 730 * 24 * 60 * 60 * 1000;
  t.mock.method(Date, 'now', () => later);
  assert.equal(newAccessLink(), access);
  assert.equal((await redeem({ access })).status, 200);
  assert.equal(owner(withCookie(cookie)), true);
  assert.equal(owner(withCookie(legacyCookie)), false);
  process.env.STUDIO_OWNER_KEY = 'replacement-key-that-is-at-least-32-characters-long';
  assert.equal(owner(withCookie(cookie)), false);
  assert.equal((await redeem({ access })).status, 401);
  const replacement = newAccessLink();
  assert.equal((await redeem({ access: replacement })).status, 200);
  process.env.NODE_ENV = 'production';
  assert.equal((await redeem({ access: replacement })).status, 403);
  const canonical = 'https://www.singleton-systems.com';
  const live = await POST(new Request(canonical + '/api/studio/session', {
    method: 'POST', headers: { Origin: canonical, Host: 'www.singleton-systems.com' },
    body: JSON.stringify({ access: replacement }),
  }));
  assert.equal(live.status, 200);
  const liveCookie = live.headers.get('set-cookie');
  assert.match(liveCookie, /; Secure$/);
  assert.equal(owner(withCookie(liveCookie)), false);
  assert.equal(owner(new Request(canonical, { headers: { Host: 'www.singleton-systems.com', Cookie: liveCookie } })), true);
  process.env.STUDIO_OWNER_KEY = 'short';
  assert.equal(owner(withCookie(cookie)), false);
  assert.throws(newAccessLink, /unavailable/);
});
