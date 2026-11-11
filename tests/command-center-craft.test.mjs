import { newSession } from "../lib/studio-session.ts";
process.env.STUDIO_OWNER_KEY = "test-dashboard-owner-key-at-least-32-characters";
const ownerCookie = "studio_owner=" + newSession();
import {test, beforeEach} from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {pathToFileURL} from 'node:url';

Object.assign(process.env, {SUPABASE_URL:'https://craft-storage.test', SUPABASE_SERVICE_ROLE_KEY:'test', LINEAR_API_KEY:'test', ASANA_ACCESS_TOKEN:'test', COMMAND_CENTER_CRAFT_API_URL:'https://connect.craft.do/links/test-only/api/v1'});
await build({entryPoints:['app/api/command-center/route.ts'],bundle:true,platform:'node',format:'esm',packages:'external',outfile:'.scratch/craft-route.mjs',tsconfig:'tsconfig.json'});
const {POST,GET}=await import(pathToFileURL(process.cwd()+'/.scratch/craft-route.mjs'));
const spaceId='f5b0a75f-1553-cc83-3804-f83592a53df1';
const taskId='B5552310-8AD3-45DF-BB90-14C0AF7A99ED';
let rows,plans,blocks,craftFail,wrongSpace,title,deadline,craftPaths,craftState,craftWrites;
beforeEach(()=>{
 rows=new Map(); plans=new Map(); blocks=[]; craftFail=false; wrongSpace=false;
 craftState='todo'; craftWrites=0;
 process.env.COMMAND_CENTER_CRAFT_WRITEBACK='1';
 title='Test For API Dashboard'; deadline='2026-11-06'; craftPaths=[];
 globalThis.fetch=async(input,init={})=>{
  const u=new URL(input);
  if(u.hostname==='connect.craft.do'){
   craftPaths.push(u.pathname.split('/').at(-1));
   if(craftFail)throw Error('secret transport detail '+process.env.COMMAND_CENTER_CRAFT_API_URL);
   if(u.pathname.endsWith('/connection'))return Response.json({space:{id:wrongSpace?'family-space':spaceId}});
   const task={id:taskId,markdown:'- [ ] '+title,taskInfo:{state:craftState,deadlineDate:deadline},location:{type:craftState==='todo'?'inbox':'logbook'}};
   if(u.pathname.endsWith('/blocks'))return Response.json(task);
   if(init.method==='PUT'){
    const [update]=JSON.parse(init.body).tasksToUpdate;
    assert.equal(update.id,taskId);
    craftState=update.taskInfo.state;
    craftWrites++;
    return Response.json({items:[]});
   }
   const scope=u.searchParams.get('scope');
   return Response.json({items:[task].filter(t=>t.location.type===scope)});
  }
  if(u.hostname==='craft-storage.test'){
   if(u.pathname.endsWith('/rpc/command_center_craft_import')){
    const {p_tasks}=JSON.parse(init.body);
    for(const task of p_tasks){
     const old=rows.get(task.id);
     rows.set(task.id,{description:'',lane:null,status:'Todo',parent_id:null,project_id:null,project_name:null,...old,...task,updated_at:'2026-11-02T20:00:00Z'});
    }
    return Response.json(p_tasks.map(t=>rows.get(t.id)));
   }
   if(u.pathname.endsWith('/command_center_inbox')){
    let selected=[...rows.values()];
    if(u.searchParams.has('id'))selected=selected.filter(r=>r.id===u.searchParams.get('id').slice(3));
    if(u.searchParams.has('source->>provider'))selected=selected.filter(r=>r.source?.provider==='craft');
    if(u.searchParams.has('updated_at'))selected=selected.filter(r=>r.updated_at===u.searchParams.get('updated_at').slice(3));
    if(init.method==='PATCH'&&selected.length){Object.assign(selected[0],JSON.parse(init.body));}
    return Response.json(selected);
   }
   if(u.pathname.endsWith('/command_center_task_plans')){
    if(init.method==='POST'){const row=JSON.parse(init.body);plans.set(row.owner+':'+row.owner_id,row);return Response.json([row]);}
    return Response.json([...plans.values()]);
   }
   if(u.pathname.endsWith('/command_center_blocks')){
    if(init.method==='POST'){const row={id:'5439c6ec-67ce-4d91-9419-abc0449d62ea',...JSON.parse(init.body)};blocks.push(row);return Response.json([row]);}
    return Response.json(blocks);
   }
   return Response.json([]);
  }
  if(u.hostname==='app.asana.com')return Response.json({data:[],next_page:null});
  if(u.hostname==='api.linear.app')return Response.json({data:{issues:{nodes:[],pageInfo:{hasNextPage:false}}}});
  throw Error('Unexpected HTTP host');
 };
});
const post=(body,origin='https://dashboard.test')=>POST(new Request('https://dashboard.test/api/command-center',{method:'POST',headers:{cookie:ownerCookie,origin,'content-type':'application/json'},body:JSON.stringify(body)}));
const snapshot=async()=> (await GET(new Request("https://dashboard.test/api/command-center", {headers:{cookie:ownerCookie}}))).json();

test('Craft import, plan, reload and refresh retain one capture and one block',async()=>{
 assert.equal((await post({action:'craftRefresh'})).status,200);
 let saved=await snapshot(); const item=saved.work[0];
 assert.equal(item.title,title); assert.equal(item.lane,'Unassigned'); assert.equal(item.dueDate,deadline);
 assert.equal(item.source.taskId,taskId.toLowerCase());
 assert.equal(item.source.url,`craftdocs://open?spaceId=${spaceId}&blockId=${taskId}`);
 assert.equal((await post({action:'taskPlanSave',owner:'dashboard',ownerId:item.id,period:'day',plannedDate:'2026-11-03',durationMinutes:40})).status,200);
 assert.equal((await post({action:'blockSave',owner:'dashboard',ownerId:item.id,selectedDate:'2026-11-03',startsAt:'2026-11-03T15:00:00Z',endsAt:'2026-11-03T15:40:00Z'})).status,200);
 rows.get(item.id).lane='Development'; rows.get(item.id).description='My local notes';
 assert.equal((await post({action:'craftRefresh'})).status,200);
 saved=await snapshot();
 assert.equal(saved.work.length,1); assert.equal(saved.work[0].id,item.id);
 assert.equal(saved.work[0].lane,'Development');assert.equal(saved.work[0].description,'My local notes');
 assert.equal(saved.plans[0].duration_minutes,40); assert.equal(saved.blocks.length,1);
 assert.equal(saved.blocks[0].starts_at,'2026-11-03T15:00:00Z');assert.equal(saved.work[0].dueDate,'2026-11-06');
});

test('source changes refresh the same capture without discarding local planning',async()=>{
 await post({action:'craftRefresh'});const id=(await snapshot()).work[0].id;
 title='Updated Craft title';deadline='2026-11-07';
 await post({action:'craftRefresh'});const saved=await snapshot();
 assert.equal(saved.work.length,1);assert.equal(saved.work[0].id,id);
 assert.equal(saved.work[0].title,title);assert.equal(saved.work[0].dueDate,deadline);
});

test('a failed Craft read leaves saved work and plans intact without leaking the private URL',async()=>{
 await post({action:'craftRefresh'});const item=(await snapshot()).work[0];
 await post({action:'taskPlanSave',owner:'dashboard',ownerId:item.id,period:'day',plannedDate:'2026-11-03',durationMinutes:40});
 craftFail=true;const response=await post({action:'craftRefresh'});
 assert.equal(response.status,502);const error=await response.text();assert.match(error,/Craft/);assert.doesNotMatch(error,/test-only|connect\.craft|secret transport/);
 const saved=await snapshot();assert.equal(saved.work[0].id,item.id);assert.equal(saved.plans.length,1);
});

test('wrong-space and cross-origin requests cannot import data',async()=>{
 assert.equal((await post({action:'craftRefresh'},'https://other.test')).status,403);
 assert.equal(craftPaths.length,0);
 wrongSpace=true;assert.equal((await post({action:'craftRefresh'})).status,502);
 assert.deepEqual(craftPaths,['connection']);assert.equal(rows.size,0);
});

test('dashboard edits cannot replace Craft title or deadline',async()=>{
 await post({action:'craftRefresh'});const item=(await snapshot()).work[0];
 for(const task of [{title:'Local replacement'},{due_date:'2026-11-10'}]){
  assert.equal((await post({action:'inboxUpdate',id:item.id,expectedUpdatedAt:item.updatedAt,task})).status,409);
 }
 assert.equal((await snapshot()).work[0].title,title);
});

test('local completion reaches Craft and a Craft reopen preserves the dashboard plan',async()=>{
 assert.equal((await post({action:'craftRefresh'})).status,200);
 const item=(await snapshot()).work[0];
 await post({action:'taskPlanSave',owner:'dashboard',ownerId:item.id,period:'day',plannedDate:'2026-11-03',durationMinutes:40});
 const command={action:'inboxUpdate',id:item.id,expectedUpdatedAt:item.updatedAt,task:{status:'Done'}};
 assert.equal((await post(command)).status,403);
 assert.equal(craftWrites,0);
 const local=body=>POST(new Request('http://localhost:3117/api/command-center',{method:'POST',headers:{cookie:ownerCookie,origin:'http://localhost:3117','content-type':'application/json'},body:JSON.stringify(body)}));
 assert.equal((await local({...command,expectedUpdatedAt:'2026-11-01T20:00:00Z'})).status,409);
 assert.equal(craftWrites,0);
 assert.equal((await local(command)).status,200);
 assert.equal(craftState,'done');
 assert.equal(craftWrites,1);
 assert.equal((await snapshot()).work[0].status,'Done');
 craftState='todo';
 assert.equal((await post({action:'craftRefresh'})).status,200);
 const saved=await snapshot();
 assert.equal(saved.work.length,1);
 assert.equal(saved.work[0].id,item.id);
 assert.equal(saved.work[0].status,'Todo');
 assert.equal(saved.plans[0].duration_minutes,40);
 assert.equal(craftWrites,1);
 craftState='done';
 assert.equal((await post({action:'craftRefresh'})).status,200);
 assert.equal((await snapshot()).work[0].status,'Done');
 assert.equal(craftWrites,1);
});
