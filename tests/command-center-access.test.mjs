import assert from 'node:assert/strict';
import test from 'node:test';
import {build} from 'esbuild';

test('dashboard reads, writes and mail reject guests before accessing records', async () => {
  for (const entry of ['app/api/command-center/route.ts','app/api/command-center/mail/[contactId]/route.ts']) {
    const {outputFiles}=await build({entryPoints:[entry],bundle:true,platform:'node',format:'cjs',write:false,packages:'external'});
    const loaded={exports:{}};
    const {createRequire}=await import('node:module');
    new Function('require','module','exports',outputFiles[0].text)(createRequire(import.meta.url),loaded,loaded.exports);
    for (const method of ['GET','POST']) {
      if(!loaded.exports[method]) continue;
      const result=await loaded.exports[method](new Request('https://www.singleton-systems.com/api/command-center',{method}),{params:Promise.resolve({contactId:'1'})});
      assert.equal(result.status,401,`${entry} ${method}`);
      assert.deepEqual(await result.json(),{error:'Sign in to your dashboard.'});
    }
  }
});

test('only the verified owner Google identity can enter', async () => {
  const {outputFiles}=await build({entryPoints:['lib/dashboard-auth.ts'],bundle:true,platform:'node',format:'cjs',write:false,packages:'external'});
  const loaded={exports:{}};
  const {createRequire}=await import('node:module');
  new Function('require','module','exports',outputFiles[0].text)(createRequire(import.meta.url),loaded,loaded.exports);
  const {isDashboardUser}=loaded.exports;
  const google={email:'owner@example.test',email_confirmed_at:'2026-01-01',identities:[{provider:'google'}]};
  assert.equal(isDashboardUser(google,'OWNER@example.test'),true);
  assert.equal(isDashboardUser(google,'stranger@example.test'),false);
  assert.equal(isDashboardUser({...google,email_confirmed_at:undefined},'owner@example.test'),false);
  assert.equal(isDashboardUser({...google,identities:[{provider:'email'}]},'owner@example.test'),false);
  assert.equal(isDashboardUser(google,undefined),false);
});
