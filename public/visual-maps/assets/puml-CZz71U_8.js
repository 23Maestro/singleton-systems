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

skinparam rectangle<<PortfolioOperator>>{
  BackgroundColor #3b82f6
  FontColor #eff6ff
  BorderColor #2563eb
}
skinparam rectangle<<Operator>>{
  BackgroundColor #3b82f6
  FontColor #eff6ff
  BorderColor #2563eb
}
skinparam rectangle<<PortfolioStore>>{
  BackgroundColor #3b82f6
  FontColor #eff6ff
  BorderColor #2563eb
}
skinparam rectangle<<AiWorkflowSystem>>{
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
rectangle "==Operator\\n\\nThe working user. Uses the command surface to move practical operations\\nworkflow steps without repeatedly clicking through scattered dashboard\\nscreens." <<PortfolioOperator>> as PortfolioOperator
rectangle "==Operator\\n\\nThe working user. Uses mobile, desktop, Raycast, Codex, Notion, Obsidian, and\\nEagle to move job search, Upwork, Singleton offer, and portfolio work without\\nrepeatedly deciding where each item belongs." <<Operator>> as Operator
rectangle "==Eagle Portfolio Library\\n\\nPortfolio/evidence store. Holds screenshots, videos, PDFs, reels, examples, and portfolio\\nassets. Eagle does not own task status; Opportunity HQ does." <<PortfolioStore>> as PortfolioStore
rectangle "==Prospect ID Workflow System\\n\\nCommand UI, legacy-system adapter work, source-of-truth cleanup, and audit\\ntests for a practical operations workflow." <<AiWorkflowSystem>> as AiWorkflowSystem
rectangle "==Capture Surfaces" <<Capture>> as Capture
rectangle "==Opportunity HQ\\n\\nNotion is durable truth. It owns projects, tasks, status, duration estimates,\\ndaily work shifts, links, and notes. Views are not new\\ndatabases." <<Durable>> as Durable
rectangle "==Raycast / Codex Actions\\n\\nAction layer. It creates, updates, opens, drafts, and attaches. It\\nshould not invent a second task model." <<Actions>> as Actions
rectangle "==Publishing Surfaces" <<Publishing>> as Publishing

PortfolioOperator .[#8D8D8D,thickness=2].> AiWorkflowSystem : <color:#8D8D8D>triggers workflow action
Operator .[#8D8D8D,thickness=2].> Capture : <color:#8D8D8D>[...]
Operator .[#8D8D8D,thickness=2].> Actions : <color:#8D8D8D>trigger
Capture .[#8D8D8D,thickness=2].> Durable : <color:#8D8D8D>[...]
Durable .[#8D8D8D,thickness=2].> Actions : <color:#8D8D8D>drive
Durable .[#8D8D8D,thickness=2].> Publishing : <color:#8D8D8D>[...]
Actions .[#8D8D8D,thickness=2].> Durable : <color:#8D8D8D>create/update
PortfolioStore .[#8D8D8D,thickness=2].> Durable : <color:#8D8D8D>attach
Publishing .[#8D8D8D,thickness=2].> Durable : <color:#8D8D8D>update
Actions .[#8D8D8D,thickness=2].> PortfolioStore : <color:#8D8D8D>capture
@enduml
`;case`ai_workflow_readme_map`:return`@startuml
title "AI Workflow Portfolio README Map"
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

skinparam person<<PortfolioOperator>>{
  BackgroundColor #A35829
  FontColor #FFE0C2
  BorderColor #7E451D
}
skinparam rectangle<<AiWorkflowSystemRaycastCommands>>{
  BackgroundColor #AC4D39
  FontColor #FBD3CB
  BorderColor #853A2D
}
skinparam rectangle<<AiWorkflowSystemProspectWeb>>{
  BackgroundColor #3b82f6
  FontColor #eff6ff
  BorderColor #2563eb
}
skinparam rectangle<<AiWorkflowSystemFastApiBridge>>{
  BackgroundColor #A35829
  FontColor #FFE0C2
  BorderColor #7E451D
}
skinparam rectangle<<AiWorkflowSystemLegacyLaravel>>{
  BackgroundColor #AC4D39
  FontColor #FBD3CB
  BorderColor #853A2D
}
skinparam rectangle<<AiWorkflowSystemSupabaseTruth>>{
  BackgroundColor #428a4f
  FontColor #f8fafc
  BorderColor #2d5d39
}
person "==Operator\\n\\nThe working user. Uses the command surface to move practical operations\\nworkflow steps without repeatedly clicking through scattered dashboard\\nscreens." <<PortfolioOperator>> as PortfolioOperator
rectangle "Prospect ID Workflow System" <<AiWorkflowSystem>> as AiWorkflowSystem {
  skinparam RectangleBorderColor<<AiWorkflowSystem>> #64748b
  skinparam RectangleFontColor<<AiWorkflowSystem>> #64748b
  skinparam RectangleBorderStyle<<AiWorkflowSystem>> dashed

  rectangle "==Raycast Commands\\n\\nCommand UI for Scout Prep, Set Meetings, Client Messages, and video\\nworkflow commands. Commands are buttons." <<AiWorkflowSystemRaycastCommands>> as AiWorkflowSystemRaycastCommands
  rectangle "==Vercel / Prospect Web\\n\\nPublic and mobile review surface that reads cleaned workflow data outside\\nthe Raycast command window." <<AiWorkflowSystemProspectWeb>> as AiWorkflowSystemProspectWeb
  rectangle "==Local FastAPI Bridge\\n\\nAdapter layer that turns legacy dashboard form behavior into repeatable\\nrequest shapes and readback checks." <<AiWorkflowSystemFastApiBridge>> as AiWorkflowSystemFastApiBridge
  rectangle "==Legacy Laravel Dashboard\\n\\nExisting dashboard surface. The bridge translates behavior here instead\\nof pretending the old system disappeared." <<AiWorkflowSystemLegacyLaravel>> as AiWorkflowSystemLegacyLaravel
  rectangle "==Supabase PostgreSQL\\n\\nSource-of-truth layer for appointments, lifecycle events, call log rows,\\nand reporting facts." <<AiWorkflowSystemSupabaseTruth>> as AiWorkflowSystemSupabaseTruth
}

PortfolioOperator .[#8D8D8D,thickness=2].> AiWorkflowSystemRaycastCommands : <color:#8D8D8D>triggers workflow action
AiWorkflowSystemRaycastCommands .[#8D8D8D,thickness=2].> AiWorkflowSystemFastApiBridge : <color:#8D8D8D>sends command payload
AiWorkflowSystemFastApiBridge .[#8D8D8D,thickness=2].> AiWorkflowSystemLegacyLaravel : <color:#8D8D8D>translates dashboard behavior
AiWorkflowSystemFastApiBridge .[#8D8D8D,thickness=2].> AiWorkflowSystemSupabaseTruth : <color:#8D8D8D>writes durable facts
AiWorkflowSystemProspectWeb .[#8D8D8D,thickness=2].> AiWorkflowSystemSupabaseTruth : <color:#8D8D8D>reads cleaned data
@enduml
`;case`scouting_coordinator_bucket_map`:return`@startuml
title "Scouting Coordinator System Map"
left to right direction

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

skinparam rectangle<<AiWorkflowSystemScoutingCoordinatorBucket1>>{
  BackgroundColor #3b82f6
  FontColor #eff6ff
  BorderColor #2563eb
}
skinparam rectangle<<AiWorkflowSystemScoutingCoordinatorBucket2>>{
  BackgroundColor #A35829
  FontColor #FFE0C2
  BorderColor #7E451D
}
skinparam rectangle<<AiWorkflowSystemScoutingCoordinatorBucket3>>{
  BackgroundColor #428a4f
  FontColor #f8fafc
  BorderColor #2d5d39
}
skinparam rectangle<<AiWorkflowSystemScoutingCoordinatorBucket4>>{
  BackgroundColor #0284c7
  FontColor #f0f9ff
  BorderColor #0369a1
}
skinparam rectangle<<AiWorkflowSystemScoutingCoordinatorBucket5>>{
  BackgroundColor #AC4D39
  FontColor #FBD3CB
  BorderColor #853A2D
}
rectangle "==1. Meetings\\n\\nScheduling and confirmation" <<AiWorkflowSystemScoutingCoordinatorBucket1>> as AiWorkflowSystemScoutingCoordinatorBucket1
rectangle "==2. Prep\\n\\nPre-meeting work" <<AiWorkflowSystemScoutingCoordinatorBucket2>> as AiWorkflowSystemScoutingCoordinatorBucket2
rectangle "==3. Client Comms\\n\\nMessages and calls" <<AiWorkflowSystemScoutingCoordinatorBucket3>> as AiWorkflowSystemScoutingCoordinatorBucket3
rectangle "==4. Lifecycle\\n\\nStage and reporting truth" <<AiWorkflowSystemScoutingCoordinatorBucket4>> as AiWorkflowSystemScoutingCoordinatorBucket4
rectangle "==5. Outcomes\\n\\nEnrollments and follow-up" <<AiWorkflowSystemScoutingCoordinatorBucket5>> as AiWorkflowSystemScoutingCoordinatorBucket5

AiWorkflowSystemScoutingCoordinatorBucket1 .[#8D8D8D,thickness=2].> AiWorkflowSystemScoutingCoordinatorBucket2
AiWorkflowSystemScoutingCoordinatorBucket2 .[#8D8D8D,thickness=2].> AiWorkflowSystemScoutingCoordinatorBucket3
AiWorkflowSystemScoutingCoordinatorBucket3 .[#8D8D8D,thickness=2].> AiWorkflowSystemScoutingCoordinatorBucket4
AiWorkflowSystemScoutingCoordinatorBucket4 .[#8D8D8D,thickness=2].> AiWorkflowSystemScoutingCoordinatorBucket5
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
skinparam rectangle<<ActionsSearchRun>>{
  BackgroundColor #3b82f6
  FontColor #eff6ff
  BorderColor #2563eb
}
skinparam rectangle<<ActionsExportBlocks>>{
  BackgroundColor #3b82f6
  FontColor #eff6ff
  BorderColor #2563eb
}
skinparam rectangle<<ActionsGoalCheckIn>>{
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
skinparam rectangle<<ActionsCapturePortfolio>>{
  BackgroundColor #3b82f6
  FontColor #eff6ff
  BorderColor #2563eb
}
skinparam database<<PortfolioStore>>{
  BackgroundColor #428a4f
  FontColor #f8fafc
  BorderColor #2d5d39
}
skinparam rectangle<<CaptureObsidian>>{
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
skinparam rectangle<<DurableDependencies>>{
  BackgroundColor #64748b
  FontColor #f8fafc
  BorderColor #475569
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
person "==Operator\\n\\nThe working user. Uses mobile, desktop, Raycast, Codex, Notion, Obsidian, and\\nEagle to move job search, Upwork, Singleton offer, and portfolio work without\\nrepeatedly deciding where each item belongs." <<Operator>> as Operator
rectangle "==Log Task\\n\\nCreate an Opportunity Task from selected text, clipboard link, manual\\nform input, or mobile/share context. Default Status: Queued." <<ActionsLogTask>> as ActionsLogTask
rectangle "==Update Task\\n\\nUpdate Status, Money Priority, Project, Link, or Notes\\non an existing Opportunity Task." <<ActionsUpdateTask>> as ActionsUpdateTask
rectangle "==Opportunity Search Run\\n\\nCodex-owned manual workflow. Search current jobs or leads, return winners\\nfor approval, then log approved tasks to Opportunity HQ." <<ActionsSearchRun>> as ActionsSearchRun
rectangle "==Export Focus Blocks\\n\\nCodex-owned manual workflow. Read approved Opportunity Tasks, build 3-5\\nrealistic time blocks, export .ics, and ask before Notion updates." <<ActionsExportBlocks>> as ActionsExportBlocks
rectangle "==Goal Check-In\\n\\nFuture small command. Ask count/result questions for applications,\\nfreelance proposals, Strategic work, and real blockers. Output one or two\\ndaily implications, not a full plan or new database." <<ActionsGoalCheckIn>> as ActionsGoalCheckIn
rectangle "==Start Application\\n\\nOpen a job link and resume path from the selected task. Move the task to\\nIn Motion while work is active." <<ActionsStartApplication>> as ActionsStartApplication
rectangle "==Draft Proposal\\n\\nTurn a copied Upwork post into a proposal draft and log the follow-up\\nstate back to Opportunity HQ." <<ActionsDraftProposal>> as ActionsDraftProposal
rectangle "==Capture Portfolio\\n\\nImport the selected asset to Eagle, append an Added to Eagle note to the\\nselected Portfolio task, then mark that task Done." <<ActionsCapturePortfolio>> as ActionsCapturePortfolio
database "==Eagle Portfolio Library\\n\\nPortfolio/evidence store. Holds screenshots, videos, PDFs, reels, examples, and portfolio\\nassets. Eagle does not own task status; Opportunity HQ does." <<PortfolioStore>> as PortfolioStore
rectangle "Capture Surfaces" <<Capture>> as Capture {
  skinparam RectangleBorderColor<<Capture>> #64748b
  skinparam RectangleFontColor<<Capture>> #64748b
  skinparam RectangleBorderStyle<<Capture>> dashed

  rectangle "==Obsidian _Inbox\\n\\nRaw capture only. Use for unclear thoughts, offload notes, passive\\nshortcut ideas, and anything that is not yet a real task. Promote only\\nwhen the item has money weight, deadline, follow-up, portfolio value, or a\\nclear next action." <<CaptureObsidian>> as CaptureObsidian
  rectangle "==Mobile Task Form\\n\\nFast durable capture path for task-shaped work. Minimum fields: Task,\\nProject, Duration, and Link/Notes. Default Status should be Queued." <<CaptureMobileForm>> as CaptureMobileForm
}
rectangle "Opportunity HQ" <<Durable>> as Durable {
  skinparam RectangleBorderColor<<Durable>> #0284c7
  skinparam RectangleFontColor<<Durable>> #0284c7
  skinparam RectangleBorderStyle<<Durable>> dashed

  database "==Opportunity Projects\\n\\nDurable project lanes: Cash Jobs, Career Jobs, Freelance, Offer, Portfolio.\\nFinishable deliverables belong as tasks/goals under these rows." <<DurableProjects>> as DurableProjects
  rectangle "==Dependencies\\n\\nReal blockers only: application work can depend on resume/snippet prep;\\nwebsite request flow depends on Tally and Notion intake; offer traction\\ndepends on website, portfolio, outreach, and a client-ready process." <<DurableDependencies>> as DurableDependencies
  queue "==Opportunity Tasks\\n\\nExecutable work. Fields: Task, Project, Status, Duration, Money Priority,\\nWork Date, Shift, Link, Notes.\\nStatus contract: Queued, Today, In Motion, Waiting, Done, Parked.\\nMoney Priority contract: Critical, Strategic, Later." <<DurableTasks>> as DurableTasks
  rectangle "==Task Views\\n\\nViews over Opportunity Tasks: Focus Board, Daily Blocks, Work Calendar,\\nApplications, Freelance, Singleton, and Portfolio. These are lenses, not sources\\nof truth." <<DurableTaskViews>> as DurableTaskViews
}
rectangle "Publishing Surfaces" <<Publishing>> as Publishing {
  skinparam RectangleBorderColor<<Publishing>> #64748b
  skinparam RectangleFontColor<<Publishing>> #64748b
  skinparam RectangleBorderStyle<<Publishing>> dashed

  rectangle "==Singleton Website\\n\\nPublic portfolio and offer surface. Pulls from packaged portfolio and clear offer\\nwork, not from raw capture." <<PublishingWebsite>> as PublishingWebsite
  rectangle "==Applications / Proposals\\n\\nOutbound artifacts: job applications, Upwork proposals, direct outreach,\\ncover notes, and follow-ups. Their state returns to Opportunity HQ." <<PublishingProposals>> as PublishingProposals
}

Operator .[#8D8D8D,thickness=2].> CaptureObsidian : <color:#8D8D8D>capture
Operator .[#8D8D8D,thickness=2].> CaptureMobileForm : <color:#8D8D8D>log
CaptureObsidian .[#8D8D8D,thickness=2].> DurableTasks : <color:#8D8D8D>promote
CaptureMobileForm .[#8D8D8D,thickness=2].> DurableTasks : <color:#8D8D8D>create
DurableProjects .[#8D8D8D,thickness=2].> DurableTasks : <color:#8D8D8D>group
DurableTasks .[#8D8D8D,thickness=2].> DurableTaskViews : <color:#8D8D8D>render
DurableDependencies .[#8D8D8D,thickness=2].> DurableTasks : <color:#8D8D8D>block
PortfolioStore .[#8D8D8D,thickness=2].> DurableTasks : <color:#8D8D8D>attach
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
skinparam rectangle<<CaptureObsidian>>{
  BackgroundColor #AC4D39
  FontColor #FBD3CB
  BorderColor #853A2D
}
skinparam rectangle<<CaptureMobileForm>>{
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
skinparam rectangle<<ActionsSearchRun>>{
  BackgroundColor #3b82f6
  FontColor #eff6ff
  BorderColor #2563eb
}
skinparam rectangle<<ActionsExportBlocks>>{
  BackgroundColor #3b82f6
  FontColor #eff6ff
  BorderColor #2563eb
}
skinparam rectangle<<ActionsGoalCheckIn>>{
  BackgroundColor #3b82f6
  FontColor #eff6ff
  BorderColor #2563eb
}
skinparam rectangle<<DurableDependencies>>{
  BackgroundColor #64748b
  FontColor #f8fafc
  BorderColor #475569
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
person "==Operator\\n\\nThe working user. Uses mobile, desktop, Raycast, Codex, Notion, Obsidian, and\\nEagle to move job search, Upwork, Singleton offer, and portfolio work without\\nrepeatedly deciding where each item belongs." <<Operator>> as Operator
rectangle "Capture Surfaces" <<Capture>> as Capture {
  skinparam RectangleBorderColor<<Capture>> #64748b
  skinparam RectangleFontColor<<Capture>> #64748b
  skinparam RectangleBorderStyle<<Capture>> dashed

  rectangle "==Obsidian _Inbox\\n\\nRaw capture only. Use for unclear thoughts, offload notes, passive\\nshortcut ideas, and anything that is not yet a real task. Promote only\\nwhen the item has money weight, deadline, follow-up, portfolio value, or a\\nclear next action." <<CaptureObsidian>> as CaptureObsidian
  rectangle "==Mobile Task Form\\n\\nFast durable capture path for task-shaped work. Minimum fields: Task,\\nProject, Duration, and Link/Notes. Default Status should be Queued." <<CaptureMobileForm>> as CaptureMobileForm
}
rectangle "Opportunity HQ" <<Durable>> as Durable {
  skinparam RectangleBorderColor<<Durable>> #64748b
  skinparam RectangleFontColor<<Durable>> #64748b
  skinparam RectangleBorderStyle<<Durable>> dashed

  rectangle "==Dependencies\\n\\nReal blockers only: application work can depend on resume/snippet prep;\\nwebsite request flow depends on Tally and Notion intake; offer traction\\ndepends on website, portfolio, outreach, and a client-ready process." <<DurableDependencies>> as DurableDependencies
  queue "==Opportunity Tasks\\n\\nExecutable work. Fields: Task, Project, Status, Duration, Money Priority,\\nWork Date, Shift, Link, Notes.\\nStatus contract: Queued, Today, In Motion, Waiting, Done, Parked.\\nMoney Priority contract: Critical, Strategic, Later." <<DurableTasks>> as DurableTasks
  rectangle "==Task Views\\n\\nViews over Opportunity Tasks: Focus Board, Daily Blocks, Work Calendar,\\nApplications, Freelance, Singleton, and Portfolio. These are lenses, not sources\\nof truth." <<DurableTaskViews>> as DurableTaskViews
}
rectangle "==Log Task\\n\\nCreate an Opportunity Task from selected text, clipboard link, manual\\nform input, or mobile/share context. Default Status: Queued." <<ActionsLogTask>> as ActionsLogTask
rectangle "==Update Task\\n\\nUpdate Status, Money Priority, Project, Link, or Notes\\non an existing Opportunity Task." <<ActionsUpdateTask>> as ActionsUpdateTask
rectangle "==Opportunity Search Run\\n\\nCodex-owned manual workflow. Search current jobs or leads, return winners\\nfor approval, then log approved tasks to Opportunity HQ." <<ActionsSearchRun>> as ActionsSearchRun
rectangle "==Export Focus Blocks\\n\\nCodex-owned manual workflow. Read approved Opportunity Tasks, build 3-5\\nrealistic time blocks, export .ics, and ask before Notion updates." <<ActionsExportBlocks>> as ActionsExportBlocks
rectangle "==Goal Check-In\\n\\nFuture small command. Ask count/result questions for applications,\\nfreelance proposals, Strategic work, and real blockers. Output one or two\\ndaily implications, not a full plan or new database." <<ActionsGoalCheckIn>> as ActionsGoalCheckIn

Operator .[#8D8D8D,thickness=2].> CaptureObsidian : <color:#8D8D8D>capture
Operator .[#8D8D8D,thickness=2].> CaptureMobileForm : <color:#8D8D8D>log
CaptureObsidian .[#8D8D8D,thickness=2].> DurableTasks : <color:#8D8D8D>promote
CaptureMobileForm .[#8D8D8D,thickness=2].> DurableTasks : <color:#8D8D8D>create
DurableTasks .[#8D8D8D,thickness=2].> DurableTaskViews : <color:#8D8D8D>render
DurableDependencies .[#8D8D8D,thickness=2].> DurableTasks : <color:#8D8D8D>block
@enduml
`;case`portfolio_capture_flow`:return`@startuml
title "Portfolio Capture Flow"
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
skinparam rectangle<<ActionsCapturePortfolio>>{
  BackgroundColor #3b82f6
  FontColor #eff6ff
  BorderColor #2563eb
}
skinparam database<<PortfolioStore>>{
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
person "==Operator\\n\\nThe working user. Uses mobile, desktop, Raycast, Codex, Notion, Obsidian, and\\nEagle to move job search, Upwork, Singleton offer, and portfolio work without\\nrepeatedly deciding where each item belongs." <<Operator>> as Operator
rectangle "==Capture Portfolio\\n\\nImport the selected asset to Eagle, append an Added to Eagle note to the\\nselected Portfolio task, then mark that task Done." <<ActionsCapturePortfolio>> as ActionsCapturePortfolio
database "==Eagle Portfolio Library\\n\\nPortfolio/evidence store. Holds screenshots, videos, PDFs, reels, examples, and portfolio\\nassets. Eagle does not own task status; Opportunity HQ does." <<PortfolioStore>> as PortfolioStore
rectangle "Opportunity HQ" <<Durable>> as Durable {
  skinparam RectangleBorderColor<<Durable>> #64748b
  skinparam RectangleFontColor<<Durable>> #64748b
  skinparam RectangleBorderStyle<<Durable>> dashed

  database "==Opportunity Projects\\n\\nDurable project lanes: Cash Jobs, Career Jobs, Freelance, Offer, Portfolio.\\nFinishable deliverables belong as tasks/goals under these rows." <<DurableProjects>> as DurableProjects
  queue "==Opportunity Tasks\\n\\nExecutable work. Fields: Task, Project, Status, Duration, Money Priority,\\nWork Date, Shift, Link, Notes.\\nStatus contract: Queued, Today, In Motion, Waiting, Done, Parked.\\nMoney Priority contract: Critical, Strategic, Later." <<DurableTasks>> as DurableTasks
}
rectangle "Publishing Surfaces" <<Publishing>> as Publishing {
  skinparam RectangleBorderColor<<Publishing>> #64748b
  skinparam RectangleFontColor<<Publishing>> #64748b
  skinparam RectangleBorderStyle<<Publishing>> dashed

  rectangle "==Singleton Website\\n\\nPublic portfolio and offer surface. Pulls from packaged portfolio and clear offer\\nwork, not from raw capture." <<PublishingWebsite>> as PublishingWebsite
  rectangle "==Applications / Proposals\\n\\nOutbound artifacts: job applications, Upwork proposals, direct outreach,\\ncover notes, and follow-ups. Their state returns to Opportunity HQ." <<PublishingProposals>> as PublishingProposals
}

DurableProjects .[#8D8D8D,thickness=2].> DurableTasks : <color:#8D8D8D>group
PortfolioStore .[#8D8D8D,thickness=2].> DurableTasks : <color:#8D8D8D>attach
DurableTasks .[#8D8D8D,thickness=2].> PublishingWebsite : <color:#8D8D8D>package
DurableTasks .[#8D8D8D,thickness=2].> PublishingProposals : <color:#8D8D8D>submit
PublishingProposals .[#8D8D8D,thickness=2].> DurableTasks : <color:#8D8D8D>update
@enduml
`;default:throw Error(`Unknown viewId: `+e)}};export{e as pumlSource};