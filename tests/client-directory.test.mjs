import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { build } from 'esbuild';
import { chromium } from 'playwright';

test('client link opens the right record, inquiry and Lane views', async () => {
  const contacts=[
    {id:1,name:'Current editor',lane:'Content Editor',service_lanes:['Content Editor'],relationship_type:'current_client',status:'active'},
    {id:2,name:'Seasonal family',lane:'Content Editor',service_lanes:['Content Editor'],relationship_type:'returning_client',status:'paused'},
    {id:3,name:'Shared collaboration',lane:'Content Editor',service_lanes:['Content Editor','AI Consultant'],relationship_type:'unpaid_collaboration',status:'conversation',asana_url:'https://app.asana.com/0/123/456',outreach_url:'https://docs.google.com/spreadsheets/d/fixture'},
    {id:4,name:'New prospect',lane:'AI Consultant',service_lanes:['AI Consultant'],relationship_type:'new_prospect',status:'lead'},
  ];
  const snapshot={contacts,interactions:[],blocks:[],plans:[],drafts:[],work:[],failures:[],asanaProjects:[],inquiries:[{id:'11111111-2222-4333-8444-555555555555',contact_id:3,form:'video',offer:'free-test-edit',delivery_state:'delivered',created_at:'2026-11-11T12:00:00Z',submitted:{name:'Shared collaboration',details:{footage:'Weekly series brief',offerLabel:'Video test edit — $0'}}}]};
  const bundle=await build({stdin:{contents:`import React from 'react'; import {createRoot} from 'react-dom/client'; import App from './app/command-center/CommandCenterApp'; createRoot(document.getElementById('root')).render(<App/>);`,loader:'tsx',resolveDir:process.cwd()},bundle:true,write:false,format:'iife',jsx:'automatic',define:{'process.env.NODE_ENV':'"production"'}});
  const server=createServer((req,res)=>{
    res.setHeader('Content-Type',req.url?.startsWith('/api/')?'application/json':req.url==='/bundle.js'?'application/javascript':'text/html');
    res.end(req.url==='/api/command-center'?JSON.stringify(snapshot):req.url?.startsWith('/api/')?JSON.stringify({configured:false,messages:[]}):req.url==='/bundle.js'?bundle.outputFiles[0].contents:'<!doctype html><div id="root"></div><script src="/bundle.js"></script>');
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const browser=await chromium.launch();
  try {
    const page=await browser.newPage();
    const errors=[]; page.on("pageerror",error=>errors.push(error.message));
    await page.goto(`http://127.0.0.1:${server.address().port}/command-center?contact=3`);
    await page.getByRole('heading',{name:'Shared collaboration',exact:true}).waitFor({timeout:3000});
    assert.equal(await page.getByRole('link',{name:'Asana next action'}).getAttribute('href'),'https://app.asana.com/0/123/456');
    assert.equal(await page.getByText('Weekly series brief',{exact:true}).count(),1);
    await page.getByLabel('Client Lane').selectOption('AI Consultant');
    await page.getByLabel('Client group').selectOption('unpaid_collaboration');
    assert.equal(await page.locator('.cc-client-row').count(),1);
    assert.match(await page.locator('.cc-client-row').innerText(),/Shared collaboration/);
    await page.getByLabel('Client Lane').selectOption('all');
    await page.getByLabel('Client group').selectOption('returning_client');
    assert.equal(await page.locator('.cc-client-row').count(),1);
    assert.match(await page.locator('.cc-client-row').innerText(),/Seasonal family/);
    assert.deepEqual(errors,[]);
  } finally { await browser.close(); await new Promise(resolve=>server.close(resolve)); }
});
