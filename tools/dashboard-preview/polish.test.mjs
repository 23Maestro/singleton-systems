import {test,expect} from '@playwright/test';
const url=process.env.DASHBOARD_OWNER_TEST_URL;
const task={id:'ab6ad6ca-1ea2-4f50-9dad-4213aa146bd7',owner:'dashboard',title:'Edit proof',description:'First note\n\n&nbsp;\n\nSecond note',lane:'Unassigned',status:'Todo',url:'/dashboard',blocked:false,updatedAt:'2026-10-25T10:00:00Z'};
async function setup(page){
 await page.setViewportSize({width:390,height:844});
 const snapshot={work:[{...task}],blocks:[],plans:[],contacts:[],interactions:[],drafts:[],failures:[],asanaProjects:[]};
 await page.route('**/api/command-center',async route=>{
  if(route.request().method()==='GET')return route.fulfill({json:snapshot});
  const c=route.request().postDataJSON();
  if(c.action==='inboxCreate'){snapshot.work.push({ ...task,id:c.id,title:c.title,description:c.description,lane:'Unassigned'});return route.fulfill({json:{result:snapshot.work.at(-1)}});}
  if(c.action==='inboxUpdate'){const item=snapshot.work.find(t=>t.id===c.id);Object.assign(item,c.task,{lane:c.task.lane??'Unassigned',projectId:c.task.project_id,projectName:c.task.project_name,updatedAt:'2026-10-25T11:00:00Z'});return route.fulfill({json:{result:item}});}
  if(c.action==='taskPlanSave')return route.fulfill({json:{result:[]}});
  return route.fulfill({status:400,json:{error:'Unexpected action'}});
 });
 await page.goto(url);await page.getByRole('button',{name:'Inbox',exact:true}).click();
 return snapshot;
}
test('blank description paragraphs show no HTML entities in the task or editor',async({page})=>{
 await setup(page);await page.getByRole('button',{name:'Open Edit proof',exact:true}).click();
 await expect(page.getByRole('button',{name:'Edit description',exact:true})).not.toContainText('&nbsp;');
 await page.getByRole('button',{name:'Edit description',exact:true}).click();
 await expect(page.getByRole('textbox',{name:'Description text',exact:true})).not.toContainText('&nbsp;');
 await page.getByRole('textbox',{name:'Description text',exact:true}).press('End');
 await page.getByRole('textbox',{name:'Description text',exact:true}).press('Enter');
 await page.getByRole('button',{name:'Back to task',exact:true}).click();
 await expect(page.getByRole('button',{name:'Edit description',exact:true})).not.toContainText('&nbsp;');
});
async function scheduled(page,width=390){
 await page.setViewportSize({width,height:844});
 await page.clock.install({time:new Date('2026-10-25T12:00:00Z')});
 const snapshot={work:[{...task,lane:'Content Editor'}],blocks:[{id:'proof-block',owner:'dashboard',owner_id:task.id,selected_date:'2026-10-25',starts_at:'2026-10-25T09:00:00Z',ends_at:'2026-10-25T11:00:00Z'}],plans:[],contacts:[],interactions:[],drafts:[],failures:[],asanaProjects:[]};
 await page.route('**/api/command-center',async route=>{
  if(route.request().method()==='GET')return route.fulfill({json:snapshot});
  const c=route.request().postDataJSON();
  if(c.action==='blockDelete'){snapshot.blocks=[];return route.fulfill({json:{result:[]}});}
  return route.fulfill({status:400,json:{error:'Unexpected write'}});
 });
 await page.goto(url);await page.getByRole('button',{name:'Planner',exact:true}).click();
 return page.getByRole('button',{name:/Edit proof, .*Arrow keys move/});
}
for(const width of [390,1440])test(`task menu labels stay on one line and close and remove actions work at ${width}px`,async({page})=>{
 const block=await scheduled(page,width);await block.press('Enter');
 await page.getByRole('button',{name:'Task menu',exact:true}).click();
 const remove=page.getByRole('button',{name:'Remove time block',exact:true});
 for(const button of [remove,page.getByRole('button',{name:'Close',exact:true})]){
  await expect(button).toBeVisible();
  expect(await button.evaluate(el=>{const r=document.createRange();r.selectNodeContents(el);return r.getClientRects().length;})).toBe(1);
  expect((await button.boundingBox()).height).toBeGreaterThanOrEqual(40);
 }
 await page.getByRole('button',{name:'Close',exact:true}).click();await expect(page.getByRole('dialog')).toHaveCount(0);
 await block.press('Enter');await page.getByRole('button',{name:'Task menu',exact:true}).click();await remove.click();
 await expect(page.getByRole('dialog')).toHaveCount(0);await expect(block).toHaveCount(0);
});
test('calendar keeps its blue project fill and uses only a yellow selection stroke',async({page})=>{
 const block=await scheduled(page);
 const fill=await block.evaluate(el=>getComputedStyle(el).backgroundColor);
 expect(fill).not.toBe('rgb(255, 200, 61)');
 await block.click();
 await expect(block).toHaveCSS('outline-color','rgb(255, 200, 61)');
 await expect(block).toHaveCSS('background-color',fill);
 const channels=(await block.evaluate(el=>getComputedStyle(el).backgroundColor)).match(/[\d.]+/g).map(Number);
 expect(channels[2]).toBeGreaterThan(channels[0]);
 await page.getByRole('button',{name:'Inbox',exact:true}).click();
 await page.getByRole('button',{name:'Planner',exact:true}).click();
 await expect(block).toHaveCSS('background-color',fill);
});
test('Home Admin captures stay dashboard owned and keep their project after reload',async({page})=>{
 await setup(page);
 await page.getByRole('button',{name:'Add task',exact:true}).click();
 await page.getByRole('textbox',{name:'Task name',exact:true}).fill('Kitchen break');
 await page.getByRole('combobox',{name:'Task project',exact:true}).selectOption({label:'Home Admin · Dashboard'});
 await page.getByRole('button',{name:'Save changes',exact:true}).click();
 await expect(page.getByRole('dialog')).toHaveCount(0);await page.reload();
 await page.getByRole('button',{name:'Open Kitchen break',exact:true}).click();
 await expect(page.getByRole('combobox',{name:'Client context',exact:true})).toHaveValue('home-admin');
 await expect(page.getByRole('combobox',{name:'Task lane',exact:true})).toHaveValue('Home Admin');
 await page.getByRole('combobox',{name:'Client context',exact:true}).selectOption('dashboard');
 await page.getByRole('button',{name:'Save changes',exact:true}).click();await expect(page.getByRole('dialog')).toHaveCount(0);await page.reload();
 await page.getByRole('button',{name:'Open Kitchen break',exact:true}).click();
 await expect(page.getByRole('combobox',{name:'Client context',exact:true})).toHaveValue('dashboard');
});
test('Home Admin is the orange fourth queue option after Dev Ops and filters only home tasks',async({page})=>{
 const snapshot=await setup(page);
 snapshot.work.push({...task,id:'home-proof',title:'Home break',projectId:'home-admin',projectName:'Home Admin'});
 await page.reload();await page.getByRole('button',{name:'Planner',exact:true}).click();await page.getByRole('button',{name:'Show task queue',exact:true}).click();
 const dev=page.getByRole('button',{name:'Dev Ops',exact:true});const home=page.getByRole('button',{name:'Home Admin',exact:true});
 await expect(home).toBeVisible();await expect(dev).toBeVisible();
 expect(await home.evaluate(el=>el.previousElementSibling.textContent.trim())).toBe('Dev Ops');
 expect(await home.evaluate(el=>getComputedStyle(el.querySelector('i')).backgroundColor)).toBe('rgb(245, 139, 50)');
 await expect(page.getByRole('button',{name:'Open Home break',exact:true})).toBeVisible();
 await home.click();await expect(page.getByRole('button',{name:'Open Home break',exact:true})).toHaveCount(0);
 await expect(page.getByRole('button',{name:'Open Edit proof',exact:true})).toBeVisible();
 await home.click();await page.getByRole('button',{name:'Open Home break',exact:true}).click();
 await expect(page.getByRole('combobox',{name:'Client context',exact:true})).toHaveValue('home-admin');
});
