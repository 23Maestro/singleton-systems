import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { build } from 'esbuild';
import { chromium } from 'playwright';

test('voice memo failure keeps answers and reuses the same request on retry', async () => {
  const bundle = await build({ stdin: { contents: `import React from 'react'; import {createRoot} from 'react-dom/client'; import Form from './app/ai-workflow-session/AiWorkflowSessionForm'; createRoot(document.getElementById('root')).render(<Form initialOffer="build-it-for-me"/>);`, loader: 'tsx', resolveDir: process.cwd() }, bundle: true, write: false, format: 'iife', jsx: 'automatic', define: { 'process.env.NODE_ENV': '"production"' } });
  const server = createServer((req,res) => {
    res.setHeader('Content-Type', req.url === '/bundle.js' ? 'application/javascript' : 'text/html');
    res.end(req.url === '/bundle.js' ? bundle.outputFiles[0].contents : '<!doctype html><div id="root"></div><script src="/bundle.js"></script>');
  });
  await new Promise(resolve => server.listen(0,'127.0.0.1',resolve));
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    const requests=[];
    await page.route('**/api/ai-intake',async route => {
      const form = await new Request(route.request().url(),{method:'POST',headers:route.request().headers(),body:route.request().postDataBuffer()}).formData();
      requests.push(Object.fromEntries(form));
      await route.fulfill({status: requests.length===1 ? 202 : 201,contentType:'application/json',body:JSON.stringify(requests.length===1 ? {delivery:{state:'failed',error:'Your notes were saved, but the voice memo is not ready. Please try again.'}} : {delivery:{state:'delivered'}})});
    });
    await page.goto(`http://127.0.0.1:${server.address().port}`);
    await page.locator('[name=name]').fill('Casey');
    await page.locator('[name=email]').fill('casey@example.com');
    await page.locator('[name=aiWish]').fill('Weekly follow ups');
    await page.getByRole('button',{name:'Send it over'}).click();
    await page.getByRole('alert').waitFor({timeout:3000});
    assert.equal(await page.locator('[name=aiWish]').inputValue(),'Weekly follow ups');
    await page.getByRole('button',{name:'Send it over'}).click();
    await page.getByText('Got it.',{exact:true}).waitFor({timeout:3000});
    assert.match(requests[0].requestId,/^[0-9a-f-]{36}$/);
    assert.equal(requests[1].requestId,requests[0].requestId);
  } finally { await browser.close(); await new Promise(resolve=>server.close(resolve)); }
});
