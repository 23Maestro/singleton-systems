import {test} from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {pathToFileURL} from 'node:url';
Object.assign(process.env,{SUPABASE_URL:'https://inbox.test',SUPABASE_SERVICE_ROLE_KEY:'test',ASANA_ACCESS_TOKEN:'test',LINEAR_API_KEY:'test'});
await build({entryPoints:['app/api/command-center/route.ts'],bundle:true,platform:'node',format:'esm',packages:'external',outfile:'.scratch/inbox-route.mjs',tsconfig:'tsconfig.json'});
const {POST,GET}=await import(pathToFileURL(process.cwd()+'/.scratch/inbox-route.mjs'));
const rows=new Map();
globalThis.fetch=async(input,init={})=>{
 const u=new URL(input);
 if(u.host==='inbox.test'){
  if(u.pathname.endsWith('/command_center_inbox')){
   if(init.method==='PATCH'){const row=rows.get(u.searchParams.get('id')?.slice(3));if(!row||row.updated_at!==u.searchParams.get('updated_at')?.slice(3))return Response.json([]);Object.assign(row,JSON.parse(init.body));return Response.json([row]);}
   if(init.method==='POST'){const row=JSON.parse(init.body);if(!rows.has(row.id)) rows.set(row.id,{description:'',lane:null,status:'Todo',parent_id:null,project_id:null,project_name:null,updated_at:'2026-10-25T10:00:00Z',...row});return Response.json([rows.get(row.id)]);}
   return Response.json(u.searchParams.has('id') ? [...rows.values()].filter(row => row.id === u.searchParams.get('id').slice(3)) : [...rows.values()]);
  } return Response.json([]);
 }
 if(u.host==='app.asana.com')return Response.json({data:[],next_page:null});
 if(u.host==='api.linear.app'){if(JSON.parse(init.body).query.includes('mutation'))throw Error('A capture must not write to Linear');return Response.json({data:{issues:{nodes:[],pageInfo:{hasNextPage:false}}}});}
 throw Error('Unexpected HTTP');
};
const post=(body)=>POST(new Request('https://dashboard.test/api/command-center',{method:'POST',headers:{origin:'https://dashboard.test','content-type':'application/json'},body:JSON.stringify(body)}));
test('a title-only Inbox capture survives readback and retry without an owner destination',async()=>{
 const body={action:'inboxCreate',id:'ab6ad6ca-1ea2-4f50-9dad-4213aa146bd7',title:'Clean kitchen'};
 assert.equal((await post(body)).status,200);
 assert.equal((await post(body)).status,200);
 const snapshot=await(await GET()).json();
 const captures=snapshot.work.filter(t=>t.owner==='dashboard');
 assert.equal(captures.length,1);
 assert.equal(captures[0].title,'Clean kitchen');
 assert.equal(captures[0].lane,'Unassigned');
});

test('an Inbox edit rejects stale versions rather than overwriting a newer task',async()=>{
 const id='ac6ad6ca-1ea2-4f50-9dad-4213aa146bd7';
 assert.equal((await post({action:'inboxCreate',id,title:'Original'})).status,200);
 assert.equal((await post({action:'inboxUpdate',id,expectedUpdatedAt:'2026-10-24T10:00:00Z',task:{title:'Stale'}})).status,409);
});
