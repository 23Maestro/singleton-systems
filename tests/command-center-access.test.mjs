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
      assert.deepEqual(await result.json(),{error:'Open your private Studio bookmark, then return here.'});
    }
  }
});
