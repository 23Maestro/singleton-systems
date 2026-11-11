import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkClientInquiryRelease } from '../scripts/check-client-inquiry-release.mjs';

const env = { VERCEL: '1', SUPABASE_URL: 'https://fixture.invalid', SUPABASE_SERVICE_ROLE_KEY: 'fixture' };

test('local checks do not require a live client cutover', async () => {
  assert.equal(await checkClientInquiryRelease({}, () => { throw Error('unexpected request'); }), 'local');
});

test('deployment stops for missing credentials or migration', async () => {
  await assert.rejects(checkClientInquiryRelease({ VERCEL: '1' }), /credentials/);
  await assert.rejects(checkClientInquiryRelease(env, async () => Response.json({ code: 'PGRST202' }, { status: 404 })), /23M-407/);
});

test('deployment verifies RPC validation without creating a record', async () => {
  let calls = 0;
  const result = await checkClientInquiryRelease(env, async (url, init) => {
    calls++;
    assert.equal(url, 'https://fixture.invalid/rest/v1/rpc/record_client_inquiry');
    assert.equal(init.redirect, 'error');
    assert.deepEqual(JSON.parse(init.body), { p_request_id: null, p_form: null, p_name: null, p_email: null, p_phone: null, p_offer: null, p_details: null });
    return Response.json({ code: '23514', message: 'Missing inquiry fields' }, { status: 400 });
  });
  assert.equal(result, 'ready');
  assert.equal(calls, 1);
});

test('unexpected success and database errors do not pass the release check', async () => {
  await assert.rejects(checkClientInquiryRelease(env, async () => Response.json([])), /23M-407/);
  await assert.rejects(checkClientInquiryRelease(env, async () => Response.json({ code: '23514', message: 'different failure' }, { status: 400 })), /23M-407/);
});
