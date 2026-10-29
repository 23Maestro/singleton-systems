import {test,expect} from '@playwright/test';
const url=process.env.DASHBOARD_OWNER_TEST_URL;
for(const width of [390,1440])test(`Inbox captures unassigned thoughts and reopens them at ${width}px`,async({page})=>{
 await page.setViewportSize({width,height:844});
 const snapshot={work:[],blocks:[],plans:[],contacts:[],interactions:[],drafts:[],failures:[],asanaProjects:[]};
 await page.route('**/api/command-center',async route=>{
  if(route.request().method()==='GET')return route.fulfill({json:snapshot});
  const c=route.request().postDataJSON();
  if(c.action!=='inboxCreate')return route.fulfill({status:400,json:{error:'Unexpected routing'}});
  const task={id:c.id,owner:'dashboard',title:c.title,description:'',lane:'Unassigned',status:'Todo',url:'/dashboard',blocked:false,updatedAt:'2026-10-25T10:00:00Z'};
  if(!snapshot.work.some(t=>t.id===c.id))snapshot.work.push(task);
  return route.fulfill({json:{result:task}});
 });
 await page.goto(url);
 const nav=page.getByRole('navigation',{name:'Primary navigation'});
 await expect(nav.getByRole('button').first()).toHaveAccessibleName('Inbox');
 await expect(nav.getByRole('button',{name:'Inbox',exact:true})).toHaveCount(1);
 await nav.getByRole('button').first().click();
 await expect(page.getByRole('heading',{name:'Inbox',exact:true})).toBeVisible();
 await page.getByRole('textbox',{name:'Add to Inbox',exact:true}).fill('Clean kitchen');
 await page.getByRole('textbox',{name:'Add to Inbox',exact:true}).press('Enter');
 await expect(page.getByRole('button',{name:'Open Clean kitchen',exact:true})).toBeVisible();
 await page.reload();
 await page.getByRole('button',{name:'Open Clean kitchen',exact:true}).click();
 await expect(page.getByRole('textbox',{name:'Task name',exact:true})).toHaveValue('Clean kitchen');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test('an Inbox thought can be assigned a lane and planned without changing owner',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 const task={id:'ab6ad6ca-1ea2-4f50-9dad-4213aa146bd7',owner:'dashboard',title:'Kitchen plan',description:'',lane:'Unassigned',status:'Todo',url:'/dashboard',blocked:false,updatedAt:'2026-10-25T10:00:00Z'};
 const snapshot={work:[task],blocks:[],plans:[],contacts:[],interactions:[],drafts:[],failures:[],asanaProjects:[]};
 await page.route('**/api/command-center',async route=>{
  if(route.request().method()==='GET')return route.fulfill({json:snapshot});
  const c=route.request().postDataJSON();
  if(c.action==='inboxUpdate') {Object.assign(task,c.task,{lane:c.task.lane??'Unassigned',updatedAt:'2026-10-25T11:00:00Z'});return route.fulfill({json:{result:task}});}
  if(c.action==='taskPlanSave'){snapshot.plans=[{owner:c.owner,owner_id:c.ownerId,period:c.period,planned_date:c.plannedDate,duration_minutes:c.durationMinutes}];return route.fulfill({json:{result:snapshot.plans}});}
  return route.fulfill({status:400,json:{error:'Unexpected routing'}});
 });
 await page.goto(url);await page.getByRole('navigation',{name:'Primary navigation'}).getByRole('button').first().click();
 await page.getByRole('button',{name:'Open Kitchen plan',exact:true}).click();
 await page.getByRole('combobox',{name:'Task lane',exact:true}).selectOption('Development');
 await page.getByRole('button',{name:'Scheduled date',exact:true}).click();
 await page.getByRole('button',{name:'This week',exact:true}).click();
 await page.getByRole('button',{name:'Save changes',exact:true}).click();
 await expect(page.getByRole('dialog')).toHaveCount(0);
 await page.reload();
 await page.getByRole('button',{name:'Planner',exact:true}).click();
 await page.getByRole('button',{name:'Show task queue',exact:true}).click();
 await page.getByRole('combobox',{name:'Task view',exact:true}).selectOption('week');
 await page.getByRole('button',{name:'Dev Ops',exact:true}).click();
 await page.getByRole('button',{name:'Open Kitchen plan',exact:true}).click();
 await expect(page.getByRole('combobox',{name:'Task lane',exact:true})).toHaveValue('Development');
});

test('description formatting and checklist notes survive task save and reload',async({page})=>{
 const task={id:'ab6ad6ca-1ea2-4f50-9dad-4213aa146bd7',owner:'dashboard',title:'Notes proof',description:'',lane:'Unassigned',status:'Todo',url:'/dashboard',blocked:false,updatedAt:'2026-10-25T10:00:00Z'};
 const snapshot={work:[task],blocks:[],plans:[],contacts:[],interactions:[],drafts:[],failures:[],asanaProjects:[]};
 await page.setViewportSize({width:390,height:844});
 await page.route('**/api/command-center',async route=>{
  if(route.request().method()==='GET')return route.fulfill({json:snapshot});
  const c=route.request().postDataJSON();
  if(c.action==='inboxUpdate'){Object.assign(task,c.task,{lane:c.task.lane??'Unassigned',updatedAt:'2026-10-25T11:00:00Z'});return route.fulfill({json:{result:task}});}
  if(c.action==='taskPlanSave')return route.fulfill({json:{result:[]}});
  return route.fulfill({status:400,json:{error:'Unexpected command'}});
 });
 await page.goto(url);await page.getByRole('navigation',{name:'Primary navigation'}).getByRole('button').first().click();
 await page.getByRole('button',{name:'Open Notes proof',exact:true}).click();
 await page.getByRole('button',{name:'Edit description',exact:true}).click();
 await expect(page.getByRole('button',{name:'Make checklist item a subtask',exact:true})).toHaveCount(0);
 await page.getByRole('button',{name:'Bold',exact:true}).click();
 await page.getByRole('textbox',{name:'Description text',exact:true}).pressSequentially('Important note');
 await page.getByRole('button',{name:'Heading 1',exact:true}).click();
 await page.getByRole('textbox',{name:'Description text',exact:true}).press('Enter');
 await page.getByRole('button',{name:'Bold',exact:true}).click();
 await page.getByRole('button',{name:'Heading 2',exact:true}).click();
 await page.getByRole('textbox',{name:'Description text',exact:true}).pressSequentially('Section notes');
 await page.getByRole('textbox',{name:'Description text',exact:true}).press('Enter');
 await page.getByRole('button',{name:'Underline',exact:true}).click();
 await page.getByRole('textbox',{name:'Description text',exact:true}).pressSequentially('Underlined note');
 await page.getByRole('button',{name:'Underline',exact:true}).click();
 await page.getByRole('textbox',{name:'Description text',exact:true}).press('Enter');
 await page.getByRole('button',{name:'Numbered list',exact:true}).click();
 await page.getByRole('textbox',{name:'Description text',exact:true}).pressSequentially('Numbered step');
 await page.getByRole('textbox',{name:'Description text',exact:true}).press('Enter');
 await page.getByRole('textbox',{name:'Description text',exact:true}).press('Enter');
 await page.getByRole('button',{name:'Bulleted list',exact:true}).click();
 await page.getByRole('textbox',{name:'Description text',exact:true}).pressSequentially('Bullet step');
 await page.getByRole('textbox',{name:'Description text',exact:true}).press('Enter');
 await page.getByRole('textbox',{name:'Description text',exact:true}).press('Enter');
 await page.getByRole('button',{name:'Checklist',exact:true}).click();
 await page.getByRole('textbox',{name:'Description text',exact:true}).pressSequentially('Bring supplies');
 await page.getByRole('checkbox',{name:'Task item checkbox for Bring supplies',exact:true}).check();
 await page.getByRole('button',{name:'Back to task',exact:true}).click();
 await page.getByRole('button',{name:'Save changes',exact:true}).click();
 await expect(page.getByRole('dialog')).toHaveCount(0);
 await page.reload();await page.getByRole('button',{name:'Open Notes proof',exact:true}).click();
 await page.getByRole('button',{name:'Edit description',exact:true}).click();
 await expect(page.getByRole('checkbox',{name:'Task item checkbox for Bring supplies',exact:true})).toBeChecked();
 await expect(page.getByRole('textbox',{name:'Description text',exact:true})).toContainText('Important note');
 await expect(page.getByRole('heading',{level:1,name:'Important note',exact:true})).toBeVisible();
 await expect(page.getByRole('heading',{level:2,name:'Section notes',exact:true})).toBeVisible();
 await expect(page.getByText('Underlined note',{exact:true})).toHaveCSS('text-decoration-line','underline');
 expect(task.description).toContain('**Important note**');
 expect(task.description).toContain('1. Numbered step');
 expect(task.description).toContain('- Bullet step');
 expect(task.description).toContain('- [x] Bring supplies');
});

test('duration uses two scrollable wheels in one compact box and stays a draft until Save',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.route('**/api/command-center',route=>route.fulfill({json:{work:[],blocks:[],plans:[],contacts:[],interactions:[],drafts:[],failures:[],asanaProjects:[]}}));
 await page.goto(url);await page.getByRole('button',{name:'Add task',exact:true}).click();
 await page.getByRole('button',{name:'Duration',exact:true}).click();
 const hours=page.getByRole('listbox',{name:'Duration hours',exact:true});
 await hours.focus();await page.keyboard.press('ArrowDown');
 await expect(page.getByRole('button',{name:'Duration',exact:true})).toHaveText('1h');
 const minutes=page.getByRole('listbox',{name:'Duration minutes',exact:true});
 await minutes.focus();await page.keyboard.press('ArrowDown');
 await expect(page.getByRole('button',{name:'Duration',exact:true})).toHaveText('1h 5m');
 expect(await hours.evaluate(el=>el.scrollHeight>el.clientHeight)).toBe(true);
 await page.mouse.click(24,650);
 await expect(hours).toHaveCount(0);
 await page.getByRole('button',{name:'Close editor',exact:true}).click();
 await page.getByRole('button',{name:'Add task',exact:true}).click();
 await expect(page.getByRole('button',{name:'Duration',exact:true})).toHaveText('Duration');
});

test('completion shows a glowing confirmation and Undo restores the task after reload',async({page})=>{
 const task={id:'ab6ad6ca-1ea2-4f50-9dad-4213aa146bd7',owner:'dashboard',title:'Undo proof',description:'',lane:'Unassigned',status:'Todo',url:'/dashboard',blocked:false,updatedAt:'2026-10-25T10:00:00Z'};
 const snapshot={work:[task],blocks:[],plans:[],contacts:[],interactions:[],drafts:[],failures:[],asanaProjects:[]};
 await page.route('**/api/command-center',async route=>{
  if(route.request().method()==='GET')return route.fulfill({json:{...snapshot,work:task.status==='Done'?[]:[task]}});
  const c=route.request().postDataJSON();
  if(c.action!=='inboxUpdate')return route.fulfill({status:400,json:{error:'Wrong owner'}});
  Object.assign(task,c.task,{updatedAt:task.updatedAt==='2026-10-25T10:00:00Z'?'2026-10-25T11:00:00Z':'2026-10-25T12:00:00Z'});
  return route.fulfill({json:{result:task}});
 });
 await page.goto(url);await page.getByRole('navigation',{name:'Primary navigation'}).getByRole('button').first().click();
 await page.getByRole('button',{name:'Complete Undo proof',exact:true}).click();
 await expect(page.getByRole('status')).toContainText('Task completed');
 await expect(page.getByRole('status')).not.toHaveCSS('box-shadow','none');
 await page.getByRole('button',{name:'Undo',exact:true}).click();
 await page.reload();await expect(page.getByRole('button',{name:'Open Undo proof',exact:true})).toBeVisible();
});

test('official subtasks stay separate from checklist notes and save with their parent',async({page})=>{
 const task={id:'ab6ad6ca-1ea2-4f50-9dad-4213aa146bd7',owner:'dashboard',title:'Parent proof',description:'- [ ] Note only',lane:'Unassigned',status:'Todo',url:'/dashboard',blocked:false,updatedAt:'2026-10-25T10:00:00Z',children:[]};
 const snapshot={work:[task],blocks:[],plans:[],contacts:[],interactions:[],drafts:[],failures:[],asanaProjects:[]};
 await page.route('**/api/command-center',async route=>{
  if(route.request().method()==='GET')return route.fulfill({json:snapshot});
  const c=route.request().postDataJSON();
  if(c.action==='inboxUpdate'){task.children.push(...(c.children??[]).map(child=>({...child,status:'Todo',url:'/dashboard'})));Object.assign(task,c.task,{lane:c.task.lane??'Unassigned',updatedAt:'2026-10-25T11:00:00Z'});return route.fulfill({json:{result:task}});}
  if(c.action==='taskPlanSave')return route.fulfill({json:{result:[]}});
  return route.fulfill({status:400,json:{error:'Unexpected command'}});
 });
 await page.goto(url);await page.getByRole('navigation',{name:'Primary navigation'}).getByRole('button').first().click();
 await page.getByRole('button',{name:'Open Parent proof',exact:true}).click();
 await page.getByRole('button',{name:'Add subtasks',exact:true}).click();
 await page.getByRole('textbox',{name:'Subtask name',exact:true}).fill('Real child');
 await page.getByRole('button',{name:'Add',exact:true}).click();
 await expect(page.getByText('Real child',{exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Edit description',exact:true}).click();
 await page.getByRole('textbox',{name:'Description text',exact:true}).getByText('Note only',{exact:true}).click();
 await page.getByRole('button',{name:'Back to task',exact:true}).click();
 await page.getByRole('button',{name:'Task menu',exact:true}).click();
 await page.getByRole('button',{name:'Make Note only a subtask',exact:true}).click();
 expect(task.children).toHaveLength(0);
 await page.getByRole('button',{name:'Save changes',exact:true}).click();
 await expect(page.getByRole('dialog')).toHaveCount(0);
 await page.reload();await page.getByRole('button',{name:'Open Parent proof',exact:true}).click();
 await expect(page.getByText('Real child',{exact:true})).toBeVisible();
 expect(task.description).not.toContain('Note only');
 expect(task.children).toHaveLength(2);
});

test('description has the full reference toolbar and no Subtask control while creating',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.route('**/api/command-center',route=>route.fulfill({json:{work:[],blocks:[],plans:[],contacts:[],interactions:[],drafts:[],failures:[],asanaProjects:[]}}));
 await page.goto(url);await page.getByRole('button',{name:'Add task',exact:true}).click();
 await page.getByRole('button',{name:'Edit description',exact:true}).click();
 await expect(page.getByRole('textbox',{name:'Description text',exact:true})).toBeFocused();
 for(const name of ['Bold','Italic','Underline','Strikethrough','Heading 1','Heading 2','Numbered list','Bulleted list','Checklist','Dismiss keyboard'])await expect(page.getByRole('button',{name,exact:true})).toBeVisible();
 await expect(page.getByRole('button',{name:'Make checklist item a subtask',exact:true})).toHaveCount(0);
 await page.getByRole('button',{name:'Heading 1',exact:true}).click();
 await page.getByRole('textbox',{name:'Description text',exact:true}).pressSequentially('Main heading');
 await expect(page.getByRole('heading',{level:1,name:'Main heading',exact:true})).toBeVisible();
 await page.setViewportSize({width:390,height:420});
 await page.getByRole('button',{name:'Dismiss keyboard',exact:true}).click();
 await expect(page.getByRole('textbox',{name:'Description text',exact:true})).not.toBeFocused();
 const bounds=await page.getByRole('button',{name:'Dismiss keyboard',exact:true}).boundingBox();
 expect(bounds.y+bounds.height).toBeLessThanOrEqual(420);
});

test('Plan shows dated shortcut rows and its calendar changes the planned day',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.clock.setFixedTime(new Date('2026-10-25T05:10:00-04:00'));
 await page.route('**/api/command-center',route=>route.fulfill({json:{work:[],blocks:[],plans:[],contacts:[],interactions:[],drafts:[],failures:[],asanaProjects:[]}}));
 await page.goto(url);await page.getByRole('button',{name:'Add task',exact:true}).click();
 await page.getByRole('button',{name:'Scheduled date',exact:true}).click();
 await expect(page.getByRole('dialog').getByRole('button',{name:'Today',exact:true})).toContainText('Sun');
 await expect(page.getByRole('button',{name:'Tomorrow',exact:true})).toContainText('Mon');
 await expect(page.getByRole('button',{name:'Next week',exact:true})).toContainText('26 Oct–1 Nov');
 await expect(page.getByRole('button',{name:'Later today',exact:true})).toContainText('8:00 AM');
 await expect(page.getByRole('searchbox',{name:'Plan date and time',exact:true})).toHaveAttribute('placeholder','Type date and time or Time Slot');
 await page.getByRole('button',{name:'Choose date',exact:true}).click();
 await expect(page.getByRole('group',{name:'Calendar date picker',exact:true})).toBeVisible();
 await page.getByRole('button',{name:/Tuesday, October 27th, 2026|Tuesday, October 27, 2026/}).click();
 await page.getByRole('button',{name:'Done',exact:true}).click();
 await expect(page.getByRole('button',{name:'Scheduled date',exact:true})).toContainText('27');
});

test('Plan can add a clock time directly from an unplanned task',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.clock.setFixedTime(new Date('2026-10-25T05:10:00-04:00'));
 await page.route('**/api/command-center',route=>route.fulfill({json:{work:[],blocks:[],plans:[],contacts:[],interactions:[],drafts:[],failures:[],asanaProjects:[]}}));
 await page.goto(url);await page.getByRole('button',{name:'Add task',exact:true}).click();
 await page.getByRole('button',{name:'Scheduled date',exact:true}).click();
 await expect(page.getByRole('button',{name:'Plan time',exact:true})).toBeEnabled();
 await page.getByRole('button',{name:'Plan time',exact:true}).click();
 await page.getByRole('textbox',{name:'Start time',exact:true}).fill('09:00');
 await page.getByRole('button',{name:'Back to Plan',exact:true}).click();
 await page.getByRole('button',{name:'Done',exact:true}).click();
 await expect(page.getByRole('button',{name:'Start time',exact:true})).toHaveText('9:00 AM');
 await expect(page.getByRole('button',{name:'Scheduled date',exact:true})).toContainText('25');
});
