import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

// Exercise the public audit command against HTTP and a real browser.
const run = promisify(execFile);
async function audit({ title = 'Video Editing Services | Jerami Singleton', heading = 'Your Next Episode, Already on Brand', canonical = 'https://singleton-systems.com/' } = {}) {
  const server = createServer((request, response) => {
    response.setHeader('Content-Type', 'text/html');
    if (request.url === '/robots.txt') return response.end('Sitemap: https://singleton-systems.com/sitemap.xml');
    if (request.url === '/sitemap.xml') return response.end('<loc>https://singleton-systems.com</loc>');
    response.end(`<!doctype html><html><head><title>${title}</title><meta name="description" content="Video editing"><link rel="canonical" href="${canonical}"><meta property="og:title" content="${title}"><meta name="twitter:card" content="summary_large_image"><script type="application/ld+json">[{"@type":"Service"},{"@type":"FAQPage"}]</script><script data-sdkn="speed-insights"></script></head><body><h1>${heading}</h1></body></html>`);
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  try {
    return await run(process.execPath, ['scripts/seo-aeo-live-check.mjs', `http://127.0.0.1:${server.address().port}`], { timeout: 30000 });
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
}

test('SEO audit accepts the approved editing homepage', async () => {
  const { stdout } = await audit();
  const result = JSON.parse(stdout);
  assert.equal(result.runtime.title, 'Video Editing Services | Jerami Singleton');
  assert.equal(result.runtime.h1Text, 'Your Next Episode, Already on Brand');
});

test('SEO audit rejects the old consulting identity on the homepage', async () => {
  await assert.rejects(audit({ title: 'Jerami Singleton | AI Workflow Consultant', heading: 'Take the Busy Work off Your Team' }), /Missing required snippet|title mismatch/);
});

test('SEO audit still rejects a wrong headline and preview canonical', async () => {
  await assert.rejects(audit({ heading: 'Take the Busy Work off Your Team' }), /H1 mismatch/);
  await assert.rejects(audit({ canonical: 'https://preview.example/' }), /canonical mismatch/);
});
