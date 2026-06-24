var e=e=>{switch(e){case`index`:return`@startuml
title "Landscape view"
top to bottom direction

hide stereotype
skinparam ranksep 60
skinparam nodesep 30
skinparam {
  arrowFontSize 10
  defaultTextAlignment center
  wrapWidth 200
  maxMessageSize 100
  shadowing false
}

skinparam rectangle<<Operator>>{
  BackgroundColor #3b82f6
  FontColor #eff6ff
  BorderColor #2563eb
}
skinparam rectangle<<Proof>>{
  BackgroundColor #3b82f6
  FontColor #eff6ff
  BorderColor #2563eb
}
skinparam rectangle<<Capture>>{
  BackgroundColor #3b82f6
  FontColor #eff6ff
  BorderColor #2563eb
}
skinparam rectangle<<Durable>>{
  BackgroundColor #3b82f6
  FontColor #eff6ff
  BorderColor #2563eb
}
skinparam rectangle<<Actions>>{
  BackgroundColor #3b82f6
  FontColor #eff6ff
  BorderColor #2563eb
}
skinparam rectangle<<Publishing>>{
  BackgroundColor #3b82f6
  FontColor #eff6ff
  BorderColor #2563eb
}
rectangle "==Operator\\n\\nThe working user. Uses mobile, desktop, Raycast, Codex, Notion, Bear, and\\nEagle to move job search, Upwork, Singleton offer, and proof work without\\nrepeatedly deciding where each item belongs." <<Operator>> as Operator
rectangle "==Eagle Proof Library\\n\\nEvidence store. Holds screenshots, videos, PDFs, reels, examples, and proof\\nassets. Eagle does not own task status; Opportunity HQ does." <<Proof>> as Proof
rectangle "==Capture Surfaces" <<Capture>> as Capture
rectangle "==Opportunity HQ\\n\\nNotion is durable truth. It owns projects, tasks, status, time estimates,\\ndaily work blocks, links, notes, and proof attachments. Views are not new\\ndatabases." <<Durable>> as Durable
rectangle "==Raycast / Codex Actions\\n\\nAction layer. It creates, updates, plans, opens, drafts, and attaches. It\\nshould not invent a second task model." <<Actions>> as Actions
rectangle "==Publishing Surfaces" <<Publishing>> as Publishing

Operator .[#8D8D8D,thickness=2].> Capture : <color:#8D8D8D>[...]
Operator .[#8D8D8D,thickness=2].> Actions : <color:#8D8D8D>trigger
Capture .[#8D8D8D,thickness=2].> Durable : <color:#8D8D8D>[...]
Durable .[#8D8D8D,thickness=2].> Actions : <color:#8D8D8D>drive
Durable .[#8D8D8D,thickness=2].> Publishing : <color:#8D8D8D>[...]
Actions .[#8D8D8D,thickness=2].> Durable : <color:#8D8D8D>create/update
Proof .[#8D8D8D,thickness=2].> Durable : <color:#8D8D8D>attach
Publishing .[#8D8D8D,thickness=2].> Durable : <color:#8D8D8D>update
Actions .[#8D8D8D,thickness=2].> Proof : <color:#8D8D8D>capture
@enduml
`;case`opportunity_hq_container_map`:return`@startuml
title "Opportunity HQ Container Map"
top to bottom direction

hide stereotype
skinparam ranksep 60
skinparam nodesep 30
skinparam {
  arrowFontSize 10
  defaultTextAlignment center
  wrapWidth 200
  maxMessageSize 100
  shadowing false
}

skinparam person<<Operator>>{
  BackgroundColor #A35829
  FontColor #FFE0C2
  BorderColor #7E451D
}
skinparam rectangle<<ActionsLogTask>>{
  BackgroundColor #3b82f6
  FontColor #eff6ff
  BorderColor #2563eb
}
skinparam rectangle<<ActionsUpdateTask>>{
  BackgroundColor #3b82f6
  FontColor #eff6ff
  BorderColor #2563eb
}
skinparam rectangle<<ActionsPlanToday>>{
  BackgroundColor #3b82f6
  FontColor #eff6ff
  BorderColor #2563eb
}
skinparam rectangle<<ActionsStartApplication>>{
  BackgroundColor #3b82f6
  FontColor #eff6ff
  BorderColor #2563eb
}
skinparam rectangle<<ActionsDraftProposal>>{
  BackgroundColor #3b82f6
  FontColor #eff6ff
  BorderColor #2563eb
}
skinparam rectangle<<ActionsCaptureProof>>{
  BackgroundColor #3b82f6
  FontColor #eff6ff
  BorderColor #2563eb
}
skinparam database<<Proof>>{
  BackgroundColor #428a4f
  FontColor #f8fafc
  BorderColor #2d5d39
}
skinparam rectangle<<CaptureBear>>{
  BackgroundColor #AC4D39
  FontColor #FBD3CB
  BorderColor #853A2D
}
skinparam rectangle<<CaptureMobileForm>>{
  BackgroundColor #3b82f6
  FontColor #eff6ff
  BorderColor #2563eb
}
skinparam database<<DurableProjects>>{
  BackgroundColor #0284c7
  FontColor #f0f9ff
  BorderColor #0369a1
}
skinparam queue<<DurableTasks>>{
  BackgroundColor #0284c7
  FontColor #f0f9ff
  BorderColor #0369a1
}
skinparam rectangle<<DurableTaskViews>>{
  BackgroundColor #3b82f6
  FontColor #eff6ff
  BorderColor #2563eb
}
skinparam rectangle<<PublishingWebsite>>{
  BackgroundColor #3b82f6
  FontColor #eff6ff
  BorderColor #2563eb
}
skinparam rectangle<<PublishingProposals>>{
  BackgroundColor #A35829
  FontColor #FFE0C2
  BorderColor #7E451D
}
person "==Operator\\n\\nThe working user. Uses mobile, desktop, Raycast, Codex, Notion, Bear, and\\nEagle to move job search, Upwork, Singleton offer, and proof work without\\nrepeatedly deciding where each item belongs." <<Operator>> as Operator
rectangle "==Log Task\\n\\nCreate an Opportunity Task from selected text, clipboard link, manual\\nform input, or mobile/share context. Default Status: Queued." <<ActionsLogTask>> as ActionsLogTask
rectangle "==Update Task\\n\\nUpdate Status, Next, Work Date, Block, Money Priority, Project, Link, or\\nNotes on an existing Opportunity Task." <<ActionsUpdateTask>> as ActionsUpdateTask
rectangle "==Plan Today\\n\\nAssign Work Date and Block. Moves selected queue items into Today without\\nchanging their real bucket or project." <<ActionsPlanToday>> as ActionsPlanToday
rectangle "==Start Application\\n\\nOpen a job link and resume path from the selected task. Move the task to\\nIn Motion while work is active." <<ActionsStartApplication>> as ActionsStartApplication
rectangle "==Draft Proposal\\n\\nTurn a copied Upwork post into a proposal draft and log the follow-up\\nstate back to Opportunity HQ." <<ActionsDraftProposal>> as ActionsDraftProposal
rectangle "==Capture Proof\\n\\nImport the selected asset to Eagle, attach the proof link or note to the\\nselected Opportunity Task, then mark that task Done when the proof item is\\ncomplete." <<ActionsCaptureProof>> as ActionsCaptureProof
database "==Eagle Proof Library\\n\\nEvidence store. Holds screenshots, videos, PDFs, reels, examples, and proof\\nassets. Eagle does not own task status; Opportunity HQ does." <<Proof>> as Proof
rectangle "Capture Surfaces" <<Capture>> as Capture {
  skinparam RectangleBorderColor<<Capture>> #64748b
  skinparam RectangleFontColor<<Capture>> #64748b
  skinparam RectangleBorderStyle<<Capture>> dashed

  rectangle "==Bear Inbox\\n\\nRaw capture only. Use for unclear thoughts, offload notes, passive\\nshortcut ideas, and anything that is not yet a real task. Promote only\\nwhen the item has money weight, deadline, follow-up, proof value, or a\\nclear next action." <<CaptureBear>> as CaptureBear
  rectangle "==Mobile Task Form\\n\\nFast durable capture path for task-shaped work. Minimum fields: Task,\\nBucket, Time, and Link/Notes. Default Status should be Queued." <<CaptureMobileForm>> as CaptureMobileForm
}
rectangle "Opportunity HQ" <<Durable>> as Durable {
  skinparam RectangleBorderColor<<Durable>> #0284c7
  skinparam RectangleFontColor<<Durable>> #0284c7
  skinparam RectangleBorderStyle<<Durable>> dashed

  database "==Opportunity Projects\\n\\nOutcomes that need multiple tasks, proof, or time planning. Buckets are\\nnot projects. Example: Upwork consultation / proposals." <<DurableProjects>> as DurableProjects
  queue "==Opportunity Tasks\\n\\nExecutable work. Fields: Task, Bucket, Status, Time, Money Priority,\\nProject, Work Date, Block, Link, Asset / Proof Link, Next, Notes.\\nStatus contract: Queued, Today, In Motion, Waiting, Done, Parked." <<DurableTasks>> as DurableTasks
  rectangle "==Task Views\\n\\nViews over Opportunity Tasks: Focus Board, Daily Blocks, Work Calendar,\\nApplications, Upwork, Singleton, and Proof. These are lenses, not sources\\nof truth." <<DurableTaskViews>> as DurableTaskViews
}
rectangle "Publishing Surfaces" <<Publishing>> as Publishing {
  skinparam RectangleBorderColor<<Publishing>> #64748b
  skinparam RectangleFontColor<<Publishing>> #64748b
  skinparam RectangleBorderStyle<<Publishing>> dashed

  rectangle "==Singleton Website\\n\\nPublic proof and offer surface. Pulls from packaged proof and clear offer\\nwork, not from raw capture." <<PublishingWebsite>> as PublishingWebsite
  rectangle "==Applications / Proposals\\n\\nOutbound artifacts: job applications, Upwork proposals, direct outreach,\\ncover notes, and follow-ups. Their state returns to Opportunity HQ." <<PublishingProposals>> as PublishingProposals
}

Operator .[#8D8D8D,thickness=2].> CaptureBear : <color:#8D8D8D>capture
Operator .[#8D8D8D,thickness=2].> CaptureMobileForm : <color:#8D8D8D>log
CaptureBear .[#8D8D8D,thickness=2].> DurableTasks : <color:#8D8D8D>promote
CaptureMobileForm .[#8D8D8D,thickness=2].> DurableTasks : <color:#8D8D8D>create
DurableProjects .[#8D8D8D,thickness=2].> DurableTasks : <color:#8D8D8D>group
DurableTasks .[#8D8D8D,thickness=2].> DurableTaskViews : <color:#8D8D8D>render
Proof .[#8D8D8D,thickness=2].> DurableTasks : <color:#8D8D8D>attach
DurableTasks .[#8D8D8D,thickness=2].> PublishingWebsite : <color:#8D8D8D>package
DurableTasks .[#8D8D8D,thickness=2].> PublishingProposals : <color:#8D8D8D>submit
PublishingProposals .[#8D8D8D,thickness=2].> DurableTasks : <color:#8D8D8D>update
@enduml
`;case`opportunity_hq_intake_contract`:return`@startuml
title "Opportunity HQ Intake Contract"
top to bottom direction

hide stereotype
skinparam ranksep 60
skinparam nodesep 30
skinparam {
  arrowFontSize 10
  defaultTextAlignment center
  wrapWidth 200
  maxMessageSize 100
  shadowing false
}

skinparam person<<Operator>>{
  BackgroundColor #A35829
  FontColor #FFE0C2
  BorderColor #7E451D
}
skinparam rectangle<<CaptureBear>>{
  BackgroundColor #AC4D39
  FontColor #FBD3CB
  BorderColor #853A2D
}
skinparam rectangle<<CaptureMobileForm>>{
  BackgroundColor #3b82f6
  FontColor #eff6ff
  BorderColor #2563eb
}
skinparam queue<<DurableTasks>>{
  BackgroundColor #0284c7
  FontColor #f0f9ff
  BorderColor #0369a1
}
skinparam rectangle<<DurableTaskViews>>{
  BackgroundColor #3b82f6
  FontColor #eff6ff
  BorderColor #2563eb
}
skinparam rectangle<<ActionsLogTask>>{
  BackgroundColor #3b82f6
  FontColor #eff6ff
  BorderColor #2563eb
}
skinparam rectangle<<ActionsUpdateTask>>{
  BackgroundColor #3b82f6
  FontColor #eff6ff
  BorderColor #2563eb
}
skinparam rectangle<<ActionsPlanToday>>{
  BackgroundColor #3b82f6
  FontColor #eff6ff
  BorderColor #2563eb
}
person "==Operator\\n\\nThe working user. Uses mobile, desktop, Raycast, Codex, Notion, Bear, and\\nEagle to move job search, Upwork, Singleton offer, and proof work without\\nrepeatedly deciding where each item belongs." <<Operator>> as Operator
rectangle "Capture Surfaces" <<Capture>> as Capture {
  skinparam RectangleBorderColor<<Capture>> #64748b
  skinparam RectangleFontColor<<Capture>> #64748b
  skinparam RectangleBorderStyle<<Capture>> dashed

  rectangle "==Bear Inbox\\n\\nRaw capture only. Use for unclear thoughts, offload notes, passive\\nshortcut ideas, and anything that is not yet a real task. Promote only\\nwhen the item has money weight, deadline, follow-up, proof value, or a\\nclear next action." <<CaptureBear>> as CaptureBear
  rectangle "==Mobile Task Form\\n\\nFast durable capture path for task-shaped work. Minimum fields: Task,\\nBucket, Time, and Link/Notes. Default Status should be Queued." <<CaptureMobileForm>> as CaptureMobileForm
}
rectangle "Opportunity HQ" <<Durable>> as Durable {
  skinparam RectangleBorderColor<<Durable>> #64748b
  skinparam RectangleFontColor<<Durable>> #64748b
  skinparam RectangleBorderStyle<<Durable>> dashed

  queue "==Opportunity Tasks\\n\\nExecutable work. Fields: Task, Bucket, Status, Time, Money Priority,\\nProject, Work Date, Block, Link, Asset / Proof Link, Next, Notes.\\nStatus contract: Queued, Today, In Motion, Waiting, Done, Parked." <<DurableTasks>> as DurableTasks
  rectangle "==Task Views\\n\\nViews over Opportunity Tasks: Focus Board, Daily Blocks, Work Calendar,\\nApplications, Upwork, Singleton, and Proof. These are lenses, not sources\\nof truth." <<DurableTaskViews>> as DurableTaskViews
}
rectangle "==Log Task\\n\\nCreate an Opportunity Task from selected text, clipboard link, manual\\nform input, or mobile/share context. Default Status: Queued." <<ActionsLogTask>> as ActionsLogTask
rectangle "==Update Task\\n\\nUpdate Status, Next, Work Date, Block, Money Priority, Project, Link, or\\nNotes on an existing Opportunity Task." <<ActionsUpdateTask>> as ActionsUpdateTask
rectangle "==Plan Today\\n\\nAssign Work Date and Block. Moves selected queue items into Today without\\nchanging their real bucket or project." <<ActionsPlanToday>> as ActionsPlanToday

Operator .[#8D8D8D,thickness=2].> CaptureBear : <color:#8D8D8D>capture
Operator .[#8D8D8D,thickness=2].> CaptureMobileForm : <color:#8D8D8D>log
CaptureBear .[#8D8D8D,thickness=2].> DurableTasks : <color:#8D8D8D>promote
CaptureMobileForm .[#8D8D8D,thickness=2].> DurableTasks : <color:#8D8D8D>create
DurableTasks .[#8D8D8D,thickness=2].> DurableTaskViews : <color:#8D8D8D>render
@enduml
`;case`proof_capture_flow`:return`@startuml
title "Proof Capture Flow"
top to bottom direction

hide stereotype
skinparam ranksep 60
skinparam nodesep 30
skinparam {
  arrowFontSize 10
  defaultTextAlignment center
  wrapWidth 200
  maxMessageSize 100
  shadowing false
}

skinparam person<<Operator>>{
  BackgroundColor #A35829
  FontColor #FFE0C2
  BorderColor #7E451D
}
skinparam rectangle<<ActionsCaptureProof>>{
  BackgroundColor #3b82f6
  FontColor #eff6ff
  BorderColor #2563eb
}
skinparam database<<Proof>>{
  BackgroundColor #428a4f
  FontColor #f8fafc
  BorderColor #2d5d39
}
skinparam database<<DurableProjects>>{
  BackgroundColor #0284c7
  FontColor #f0f9ff
  BorderColor #0369a1
}
skinparam queue<<DurableTasks>>{
  BackgroundColor #0284c7
  FontColor #f0f9ff
  BorderColor #0369a1
}
skinparam rectangle<<PublishingWebsite>>{
  BackgroundColor #428a4f
  FontColor #f8fafc
  BorderColor #2d5d39
}
skinparam rectangle<<PublishingProposals>>{
  BackgroundColor #A35829
  FontColor #FFE0C2
  BorderColor #7E451D
}
person "==Operator\\n\\nThe working user. Uses mobile, desktop, Raycast, Codex, Notion, Bear, and\\nEagle to move job search, Upwork, Singleton offer, and proof work without\\nrepeatedly deciding where each item belongs." <<Operator>> as Operator
rectangle "==Capture Proof\\n\\nImport the selected asset to Eagle, attach the proof link or note to the\\nselected Opportunity Task, then mark that task Done when the proof item is\\ncomplete." <<ActionsCaptureProof>> as ActionsCaptureProof
database "==Eagle Proof Library\\n\\nEvidence store. Holds screenshots, videos, PDFs, reels, examples, and proof\\nassets. Eagle does not own task status; Opportunity HQ does." <<Proof>> as Proof
rectangle "Opportunity HQ" <<Durable>> as Durable {
  skinparam RectangleBorderColor<<Durable>> #64748b
  skinparam RectangleFontColor<<Durable>> #64748b
  skinparam RectangleBorderStyle<<Durable>> dashed

  database "==Opportunity Projects\\n\\nOutcomes that need multiple tasks, proof, or time planning. Buckets are\\nnot projects. Example: Upwork consultation / proposals." <<DurableProjects>> as DurableProjects
  queue "==Opportunity Tasks\\n\\nExecutable work. Fields: Task, Bucket, Status, Time, Money Priority,\\nProject, Work Date, Block, Link, Asset / Proof Link, Next, Notes.\\nStatus contract: Queued, Today, In Motion, Waiting, Done, Parked." <<DurableTasks>> as DurableTasks
}
rectangle "Publishing Surfaces" <<Publishing>> as Publishing {
  skinparam RectangleBorderColor<<Publishing>> #64748b
  skinparam RectangleFontColor<<Publishing>> #64748b
  skinparam RectangleBorderStyle<<Publishing>> dashed

  rectangle "==Singleton Website\\n\\nPublic proof and offer surface. Pulls from packaged proof and clear offer\\nwork, not from raw capture." <<PublishingWebsite>> as PublishingWebsite
  rectangle "==Applications / Proposals\\n\\nOutbound artifacts: job applications, Upwork proposals, direct outreach,\\ncover notes, and follow-ups. Their state returns to Opportunity HQ." <<PublishingProposals>> as PublishingProposals
}

DurableProjects .[#8D8D8D,thickness=2].> DurableTasks : <color:#8D8D8D>group
Proof .[#8D8D8D,thickness=2].> DurableTasks : <color:#8D8D8D>attach
DurableTasks .[#8D8D8D,thickness=2].> PublishingWebsite : <color:#8D8D8D>package
DurableTasks .[#8D8D8D,thickness=2].> PublishingProposals : <color:#8D8D8D>submit
PublishingProposals .[#8D8D8D,thickness=2].> DurableTasks : <color:#8D8D8D>update
@enduml
`;default:throw Error(`Unknown viewId: `+e)}};export{e as pumlSource};