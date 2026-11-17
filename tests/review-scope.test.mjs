import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {createRepositoryAdapter} from '../lib/reviews/repository-adapter.mjs';
import {scopeHash, completionBlockers, selectReviewScope} from '../lib/reviews/contract.mjs';
import {runRepositoryReview} from '../lib/reviews/engine.mjs';
import {completionStop} from '../lib/reviews/completion.mjs';

function fixture(t) {
 const root=fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(),'selected-review-')));
 t.after(()=>fs.rmSync(root,{recursive:true,force:true}));
 const git=(...args)=>execFileSync('git',args,{cwd:root,stdio:'pipe'});
 git('init','-q');git('config','user.name','Fixture');git('config','user.email','fixture@example.invalid');
 for(const [file,text] of Object.entries({'AGENTS.md':'contract','owned.mjs':'source','other.mjs':'other','package.json':'{}'}))fs.writeFileSync(path.join(root,file),text);
 fs.mkdirSync(path.join(root,'tests'));fs.writeFileSync(path.join(root,'tests/owned.test.mjs'),'test');git('add','.');git('commit','-qm','fixture');
 const config={schemaVersion:1,reviewId:'scope',intent:'Check selected work',baseRef:'HEAD',requiredPasses:['initial','verification'],contractFiles:['AGENTS.md'],checks:[{checkId:'test',command:process.execPath,args:['-e','process.exit(0)']}],humanApproval:{required:true},scope:{name:'slice',paths:['owned.mjs'],inputs:['package.json','tests','.env.local']}};
 return {root,git,config,adapter:createRepositoryAdapter(),write:(file,text)=>fs.writeFileSync(path.join(root,file),text)};
}

test('selected review stays fresh through unrelated files and commits, but tracks source, tests, contracts and environment inputs',t=>{
 const f=fixture(t);const read=()=>scopeHash(f.adapter.snapshot(f.root,f.config));const original=read();
 f.write('other.mjs','changed');f.write('unrelated.txt','new');assert.equal(read(),original);
 f.git('add','other.mjs');f.git('commit','-qm','other work');assert.equal(read(),original);
 for(const [file,originalText] of [['owned.mjs','source'],['package.json','{}'],['AGENTS.md','contract'],['tests/owned.test.mjs','test']]){
  f.write(file,'changed');assert.notEqual(read(),original,file);f.write(file,originalText);assert.equal(read(),original);
 }
 f.write('tests/new.test.mjs','new');assert.notEqual(read(),original);fs.unlinkSync(path.join(f.root,'tests/new.test.mjs'));
 f.write('.env.local','PRIVATE_FIXTURE=changed');assert.notEqual(read(),original);fs.unlinkSync(path.join(f.root,'.env.local'));
 fs.chmodSync(path.join(f.root,'owned.mjs'),0o755);assert.notEqual(read(),original);fs.chmodSync(path.join(f.root,'owned.mjs'),0o644);assert.equal(read(),original);
 fs.unlinkSync(path.join(f.root,'owned.mjs'));assert.notEqual(read(),original);
 fs.symlinkSync('missing-target',path.join(f.root,'owned.mjs'));assert.throws(read,/not a regular repository file/);
});

test('scoped review retains failed checks and refuses relevant changes during a check',async t=>{
 const f=fixture(t);let mutate=()=>f.write('other.mjs','unrelated');
 const adapter=createRepositoryAdapter({commandRunner:()=>{mutate();return {status:0,stdoutHash:'x',stderrHash:'x',output:'ok'};}});
 const statePath=path.join(f.root,'.git/review.json');
 await runRepositoryReview({root:f.root,config:f.config,statePath,passId:'initial',adapter});
 const good=await runRepositoryReview({root:f.root,config:f.config,statePath,passId:'verification',adapter});assert.equal(good.status,'awaiting_human');
 mutate=()=>f.write('owned.mjs','changed');
 const stale=await runRepositoryReview({root:f.root,config:f.config,statePath,passId:'verification',adapter});assert.equal(stale.status,'incomplete');assert.match(stale.error,/stale/);
 const failed=createRepositoryAdapter({commandRunner:()=>({status:1,stdoutHash:'x',stderrHash:'x',output:'failure'})});
 const result=await runRepositoryReview({root:f.root,config:f.config,statePath,passId:'verification',adapter:failed});assert.equal(result.passes.at(-1).checks[0].status,'failed');assert.ok(completionBlockers(result,f.config,failed.snapshot(f.root,f.config)).length);
});

test('Stop uses the canonical named profile and keeps check, config and receipt binding', async t => {
  const f = fixture(t);
  const { scope, ...base } = f.config;
  const canonical = { ...base, scopeProfiles: { slice: { paths: scope.paths, inputs: scope.inputs } } };
  fs.mkdirSync(path.join(f.root, 'config/reviews'), { recursive: true });
  const configPath = path.join(f.root, 'config/reviews/singleton-systems.json');
  fs.writeFileSync(configPath, JSON.stringify(canonical));
  const completionBinding = { taskId: 'TASK', sessionId: 'session', runId: 'run' };
  const config = selectReviewScope({ ...canonical, completionBinding }, 'slice');
  assert.deepEqual(config.checks, base.checks);
  assert.throws(() => selectReviewScope(canonical, 'unknown'), /unknown review scope/);
  const statePath = path.join(f.root, '.git/scoped.json');
  for (const passId of config.requiredPasses) await runRepositoryReview({ root: f.root, config, statePath, passId });
  const payload = (extra = {}) => ({ cwd: f.root, session_id: 'session', turn_id: 'run', last_assistant_message: '[code-delivery] ' + JSON.stringify({ ...completionBinding, outcome: 'ready', scope: 'slice', statePath, ...extra }) });
  const ready = async () => assert.match((await completionStop(payload())).systemMessage, /readiness verified/);
  await ready();
  f.write('other.mjs', 'other work');
  await ready();
  assert.match((await completionStop(payload({ scope: 'unknown' }))).reason, /unknown review scope/);
  assert.match((await completionStop(payload({ scope: null }))).reason, /config binding does not match/);
  f.write('owned.mjs', 'changed');
  assert.match((await completionStop(payload())).reason, /stale/);
  f.write('owned.mjs', 'source');
  const original = fs.readFileSync(statePath, 'utf8');
  const tampered = JSON.parse(original);
  tampered.passes.at(-1).workspaceHash = '0'.repeat(64);
  fs.writeFileSync(statePath, JSON.stringify(tampered));
  assert.match((await completionStop(payload())).reason, /matching receipt/);
  fs.writeFileSync(statePath, original);
  fs.writeFileSync(configPath, JSON.stringify({ ...canonical, checks: [] }));
  assert.match((await completionStop(payload())).reason, /checks|config/);
});
