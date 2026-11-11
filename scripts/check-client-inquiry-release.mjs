import { pathToFileURL } from 'node:url';

export async function checkClientInquiryRelease(env = process.env, request = fetch) {
  if (env.VERCEL !== '1') return 'local';
  const url = env.SUPABASE_URL?.replace(/\/$/, '');
  const key = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Client intake release needs Supabase credentials. See 23M-407.');
  // The first RPC guard rejects these null fields before any contact or inquiry write.
  const response = await request(`${url}/rest/v1/rpc/record_client_inquiry`, {
    method: 'POST', redirect: 'error', signal: AbortSignal.timeout(15000),
    headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ p_request_id: null, p_form: null, p_name: null, p_email: null, p_phone: null, p_offer: null, p_details: null }),
  });
  const body = await response.json();
  if (response.status !== 400 || body.code !== '23514' || body.message !== 'Missing inquiry fields') {
    throw new Error('Client intake release blocked: verify migration 20261111180912 and the live cutover in 23M-407.');
  }
  return 'ready';
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const result = await checkClientInquiryRelease();
    console.log(result === 'local' ? 'Local build: live client cutover is checked on Vercel.' : 'Client intake schema is ready for this deployment.');
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
