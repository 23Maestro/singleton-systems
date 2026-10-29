import { createRoot } from "react-dom/client";
import CommandCenterApp from "../../app/command-center/CommandCenterApp";
import type { WorkItem, Block, TaskPlan } from "../../lib/command-center";

// This entry is used only by the isolated visual review Site. No credentials or owner writes.
const date = (offset = 0) => {
  const day = new Date();
  day.setDate(day.getDate() + offset);
  return `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`;
};
const tasks: WorkItem[] = [
  { id: "sample-rankings", title: "Weekly power rankings", sectionId: "sample-northstar", dueDate: date(), description: "Sample deliverable for visual review. Build the story, review the first cut, then export the final video.", children: [
    { id: "sample-script", title: "Review the script", status: "Done", url: "#" },
    { id: "sample-first-cut", title: "Build the first cut", status: "To Do", url: "#" },
    { id: "sample-final", title: "Export the final video", status: "To Do", url: "#" },
  ] },
  { id: "sample-recap", title: "Season recap video", sectionId: "sample-northstar", dueDate: date(2) },
  { id: "sample-interview", title: "Founder interview clips", sectionId: "sample-juniper", dueDate: date(1) },
  { id: "sample-story", title: "Customer story edit", sectionId: "sample-juniper", dueDate: date(4) },
  { id: "sample-launch", title: "Product launch cut", sectionId: "sample-field", dueDate: date(3) },
].map((task) => ({ owner: "asana", lane: "Content Editor", status: "To Do", blocked: false,
  url: "#", projectId: "1218890014545436", projectName: "Content Editor", states: ["To Do", "Done"], ...task } as WorkItem));
const blocks: Block[] = [
  { id: "sample-block-1", owner: "asana", owner_id: "sample-rankings", selected_date: date(), starts_at: new Date(`${date()}T09:00:00`).toISOString(), ends_at: new Date(`${date()}T11:00:00`).toISOString() },
  { id: "sample-block-2", owner: "asana", owner_id: "sample-interview", selected_date: date(1), starts_at: new Date(`${date(1)}T10:00:00`).toISOString(), ends_at: new Date(`${date(1)}T11:30:00`).toISOString() },
  { id: "sample-block-3", owner: "asana", owner_id: "sample-recap", selected_date: date(2), starts_at: new Date(`${date(2)}T13:00:00`).toISOString(), ends_at: new Date(`${date(2)}T15:00:00`).toISOString() },
];
const inboxSamples: WorkItem[] = [
 {id:"sample-inbox-1",owner:"dashboard",title:"Clean the kitchen",description:"- [ ] Clear the counter\n- [ ] Load the dishwasher",lane:"Unassigned",status:"Todo",url:"/dashboard",dueDate:null,blocked:false,updatedAt:"2026-10-25T10:00:00Z",children:[]},
 {id:"sample-inbox-2",owner:"dashboard",title:"Idea for the next client video",description:"",lane:"Unassigned",status:"Todo",url:"/dashboard",dueDate:null,blocked:false,updatedAt:"2026-10-25T10:00:00Z",children:[]},
];
const snapshot = { plans: [] as TaskPlan[], work: [...tasks,...inboxSamples], blocks, contacts: [], interactions: [], drafts: [], failures: [], asanaProjects: [
  { id: "1218890014545436", name: "Content Editor", lane: "Content Editor", sections: [
    { id: "sample-northstar", name: "Northstar Media" },
    { id: "sample-juniper", name: "Studio Juniper" },
    { id: "sample-field", name: "Fieldwork Co." },
  ] },
] };
const reply = (value: unknown, status = 200) => Promise.resolve(new Response(JSON.stringify(value), { status, headers: { "Content-Type": "application/json" } }));
window.fetch = (input, init) => {
  const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
  const method = init?.method ?? (input instanceof Request ? input.method : "GET");
  if (url === "/api/command-center" && method === "GET") return reply(snapshot);
  if (url === "/api/command-center" && method === "POST") {
    const command = JSON.parse(String(init?.body ?? "{}"));
    const persist = () => { try { localStorage.setItem("singleton-inbox-preview-v1",JSON.stringify(snapshot)); } catch { /* Browser-only review remains usable. */ } };
    if(command.action === "inboxCreate") {
      let item = snapshot.work.find(item => item.id === command.id);
      if(!item) { item={id:command.id,owner:"dashboard",title:command.title,description:command.description??"",lane:"Unassigned",status:"Todo",url:"/dashboard",blocked:false,dueDate:null,updatedAt:new Date().toISOString(),children:[]}; snapshot.work.unshift(item); }
      persist(); return reply({result:item});
    }
    if(command.action === "inboxUpdate") {
      const parent=snapshot.work.find(item => item.owner === "dashboard" && item.id === command.id);
      const child=snapshot.work.flatMap(item => item.children??[]).find(item => item.id === command.id);
      const item=parent??child;
      if(!item || (item.updatedAt && item.updatedAt!==command.expectedUpdatedAt))return reply({error:"This task changed. Reopen it before editing."},409);
      Object.assign(item,command.task,{updatedAt:new Date().toISOString()});
      if(parent) {
        if("lane" in command.task)parent.lane=command.task.lane??"Unassigned";
        if("due_date" in command.task)parent.dueDate=command.task.due_date;
        if("project_id" in command.task)parent.projectId=command.task.project_id;
        if("project_name" in command.task)parent.projectName=command.task.project_name;
        for(const child of command.children??[])if(!parent.children?.some(item=>item.id===child.id))parent.children=[...(parent.children??[]),{...child,status:"Todo",url:"/dashboard",updatedAt:new Date().toISOString()}];
      }
      persist();return reply({result:item});
    }
    if(command.owner === "dashboard" && command.action === "taskPlanSave") {
      snapshot.plans=snapshot.plans.filter(plan=>!(plan.owner===command.owner && plan.owner_id===command.ownerId));
      snapshot.plans.push({owner:command.owner,owner_id:command.ownerId,period:command.period,planned_date:command.plannedDate,duration_minutes:command.durationMinutes});persist();return reply({result:snapshot.plans});
    }
    if(command.owner === "dashboard" && command.action === "blockSave") {
      const block={id:command.id??crypto.randomUUID(),owner:command.owner,owner_id:command.ownerId,selected_date:command.selectedDate,starts_at:command.startsAt,ends_at:command.endsAt};
      snapshot.blocks=snapshot.blocks.filter(item=>item.id!==block.id);snapshot.blocks.push(block);persist();return reply({result:[block]});
    }
    if(command.action === "blockDelete") {
      const block=snapshot.blocks.find(item=>item.id===command.id);
      if(block?.owner === "dashboard"){snapshot.blocks=snapshot.blocks.filter(item=>item.id!==command.id);persist();return reply({result:[block]});}
    }
  }
  return reply({ error: "Visual review only. Changes are not saved or sent." }, 409);
};
try { const saved=localStorage.getItem("singleton-inbox-preview-v1"); if(saved) { const data=JSON.parse(saved); if(Array.isArray(data.work)&&Array.isArray(data.blocks)&&Array.isArray(data.plans))Object.assign(snapshot,data); } } catch { /* Ignore invalid local preview data. */ }
try { if (!localStorage.getItem("singleton-command-center-theme")) localStorage.setItem("singleton-command-center-theme", "light"); } catch { /* System preference remains usable. */ }

createRoot(document.getElementById("root")!).render(<><div className="preview-banner">VISUAL REVIEW <span>Sample records · Inbox edits stay in this browser</span></div><CommandCenterApp /></>);
