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
skinparam rectangle<<AiWorkflowSystem>>{
  BackgroundColor #3b82f6
  FontColor #eff6ff
  BorderColor #2563eb
}
rectangle "==Operator\\n\\nThe working user. Uses the command surface to move practical operations\\nworkflow steps without repeatedly clicking through scattered dashboard\\nscreens." <<PortfolioOperator>> as PortfolioOperator
rectangle "==Prospect ID Workflow System\\n\\nCommand UI, legacy-system adapter work, source-of-truth cleanup, and audit\\ntests for a practical operations workflow." <<AiWorkflowSystem>> as AiWorkflowSystem

PortfolioOperator .[#8D8D8D,thickness=2].> AiWorkflowSystem : <color:#8D8D8D>triggers workflow action
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
skinparam component<<AiWorkflowSystemRaycastCommands>>{
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
  BackgroundColor #0284c7
  FontColor #f0f9ff
  BorderColor #0369a1
}
skinparam rectangle<<AiWorkflowSystemLegacyLaravel>>{
  BackgroundColor #A35829
  FontColor #FFE0C2
  BorderColor #7E451D
}
skinparam database<<AiWorkflowSystemSupabaseTruth>>{
  BackgroundColor #428a4f
  FontColor #f8fafc
  BorderColor #2d5d39
}
person "==Operator\\n\\nThe working user. Uses the command surface to move practical operations\\nworkflow steps without repeatedly clicking through scattered dashboard\\nscreens." <<PortfolioOperator>> as PortfolioOperator
rectangle "Prospect ID Workflow System" <<AiWorkflowSystem>> as AiWorkflowSystem {
  skinparam RectangleBorderColor<<AiWorkflowSystem>> #64748b
  skinparam RectangleFontColor<<AiWorkflowSystem>> #64748b
  skinparam RectangleBorderStyle<<AiWorkflowSystem>> dashed

  component "==Raycast Commands\\n\\nCommand UI for Scout Prep, Set Meetings, Client Messages, and video\\nworkflow commands. Commands are buttons." <<AiWorkflowSystemRaycastCommands>> as AiWorkflowSystemRaycastCommands
  rectangle "==Vercel / Prospect Web\\n\\nPublic and mobile review surface that reads cleaned workflow data outside\\nthe Raycast command window." <<AiWorkflowSystemProspectWeb>> as AiWorkflowSystemProspectWeb
  rectangle "==Local FastAPI Bridge\\n\\nAdapter layer that turns legacy dashboard form behavior into repeatable\\nrequest shapes and readback checks." <<AiWorkflowSystemFastApiBridge>> as AiWorkflowSystemFastApiBridge
  rectangle "==Legacy Laravel Dashboard\\n\\nExisting dashboard surface. The bridge translates behavior here instead\\nof pretending the old system disappeared." <<AiWorkflowSystemLegacyLaravel>> as AiWorkflowSystemLegacyLaravel
  database "==Supabase PostgreSQL\\n\\nSource-of-truth layer for appointments, lifecycle events, call log rows,\\nand reporting facts." <<AiWorkflowSystemSupabaseTruth>> as AiWorkflowSystemSupabaseTruth
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

skinparam person<<AiWorkflowSystemScoutingCoordinatorBucket1>>{
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
person "==1. Meetings\\n\\nScheduling and confirmation" <<AiWorkflowSystemScoutingCoordinatorBucket1>> as AiWorkflowSystemScoutingCoordinatorBucket1
rectangle "==2. Prep\\n\\nPre-meeting work" <<AiWorkflowSystemScoutingCoordinatorBucket2>> as AiWorkflowSystemScoutingCoordinatorBucket2
rectangle "==3. Client Comms\\n\\nMessages and calls" <<AiWorkflowSystemScoutingCoordinatorBucket3>> as AiWorkflowSystemScoutingCoordinatorBucket3
rectangle "==4. Lifecycle\\n\\nStage and reporting truth" <<AiWorkflowSystemScoutingCoordinatorBucket4>> as AiWorkflowSystemScoutingCoordinatorBucket4
rectangle "==5. Outcomes\\n\\nEnrollments and follow-up" <<AiWorkflowSystemScoutingCoordinatorBucket5>> as AiWorkflowSystemScoutingCoordinatorBucket5

AiWorkflowSystemScoutingCoordinatorBucket1 .[#8D8D8D,thickness=2].> AiWorkflowSystemScoutingCoordinatorBucket2
AiWorkflowSystemScoutingCoordinatorBucket2 .[#8D8D8D,thickness=2].> AiWorkflowSystemScoutingCoordinatorBucket3
AiWorkflowSystemScoutingCoordinatorBucket3 .[#8D8D8D,thickness=2].> AiWorkflowSystemScoutingCoordinatorBucket4
AiWorkflowSystemScoutingCoordinatorBucket4 .[#8D8D8D,thickness=2].> AiWorkflowSystemScoutingCoordinatorBucket5
@enduml
`;case`resume_timeline_map`:return`@startuml
title "Resume Timeline Map"
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

skinparam rectangle<<AiWorkflowSystemResumeTimelineStetsonStart>>{
  BackgroundColor #3b82f6
  FontColor #eff6ff
  BorderColor #2563eb
}
skinparam person<<AiWorkflowSystemResumeTimelineStetsonGrad>>{
  BackgroundColor #428a4f
  FontColor #f8fafc
  BorderColor #2d5d39
}
skinparam rectangle<<AiWorkflowSystemResumeTimelineSpcIt>>{
  BackgroundColor #0284c7
  FontColor #f0f9ff
  BorderColor #0369a1
}
skinparam rectangle<<AiWorkflowSystemResumeTimelineProductionSystems>>{
  BackgroundColor #A35829
  FontColor #FFE0C2
  BorderColor #7E451D
}
skinparam component<<AiWorkflowSystemResumeTimelineAiSpecialistFit>>{
  BackgroundColor #AC4D39
  FontColor #FBD3CB
  BorderColor #853A2D
}
rectangle "==2012 Stetson\\n\\nStarted the communications path at Stetson." <<AiWorkflowSystemResumeTimelineStetsonStart>> as AiWorkflowSystemResumeTimelineStetsonStart
person "==2016 Graduated\\n\\nFinished the Stetson degree." <<AiWorkflowSystemResumeTimelineStetsonGrad>> as AiWorkflowSystemResumeTimelineStetsonGrad
rectangle "==2021 SPC / IT\\n\\nAdded computer programming and IT coursework." <<AiWorkflowSystemResumeTimelineSpcIt>> as AiWorkflowSystemResumeTimelineSpcIt
rectangle "==2024 Production Systems\\n\\nBuilt repeatable video, course, and workflow systems." <<AiWorkflowSystemResumeTimelineProductionSystems>> as AiWorkflowSystemResumeTimelineProductionSystems
component "==2026 AI Specialist Fit\\n\\nPositioned practical AI workflow support around prep, review, and implementation." <<AiWorkflowSystemResumeTimelineAiSpecialistFit>> as AiWorkflowSystemResumeTimelineAiSpecialistFit

AiWorkflowSystemResumeTimelineStetsonStart .[#8D8D8D,thickness=2].> AiWorkflowSystemResumeTimelineStetsonGrad : <color:#8D8D8D>advance
AiWorkflowSystemResumeTimelineStetsonGrad .[#8D8D8D,thickness=2].> AiWorkflowSystemResumeTimelineSpcIt : <color:#8D8D8D>add
AiWorkflowSystemResumeTimelineSpcIt .[#8D8D8D,thickness=2].> AiWorkflowSystemResumeTimelineProductionSystems : <color:#8D8D8D>build
AiWorkflowSystemResumeTimelineProductionSystems .[#8D8D8D,thickness=2].> AiWorkflowSystemResumeTimelineAiSpecialistFit : <color:#8D8D8D>fit
@enduml
`;case`review_first_implementation_loop`:return`@startuml
title "Review-first Implementation Loop"
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

skinparam queue<<AiWorkflowSystemImplementationLoopVerify>>{
  BackgroundColor #428a4f
  FontColor #f8fafc
  BorderColor #2d5d39
}
skinparam rectangle<<AiWorkflowSystemImplementationLoopGather>>{
  BackgroundColor #AC4D39
  FontColor #FBD3CB
  BorderColor #853A2D
}
skinparam person<<AiWorkflowSystemImplementationLoopClassify>>{
  BackgroundColor #0284c7
  FontColor #f0f9ff
  BorderColor #0369a1
}
skinparam rectangle<<AiWorkflowSystemImplementationLoopDraft>>{
  BackgroundColor #3b82f6
  FontColor #eff6ff
  BorderColor #2563eb
}
skinparam component<<AiWorkflowSystemImplementationLoopReview>>{
  BackgroundColor #A35829
  FontColor #FFE0C2
  BorderColor #7E451D
}
queue "==Verify\\n\\nUse readback, tests, or source review before calling it real." <<AiWorkflowSystemImplementationLoopVerify>> as AiWorkflowSystemImplementationLoopVerify
rectangle "==Gather\\n\\nCollect the real workflow and source evidence." <<AiWorkflowSystemImplementationLoopGather>> as AiWorkflowSystemImplementationLoopGather
person "==Classify\\n\\nSeparate owners, facts, support state, and commands." <<AiWorkflowSystemImplementationLoopClassify>> as AiWorkflowSystemImplementationLoopClassify
rectangle "==Draft\\n\\nTurn the classified workflow into useful working material." <<AiWorkflowSystemImplementationLoopDraft>> as AiWorkflowSystemImplementationLoopDraft
component "==Review\\n\\nKeep human judgment before mutation, sending, or publishing." <<AiWorkflowSystemImplementationLoopReview>> as AiWorkflowSystemImplementationLoopReview

AiWorkflowSystemImplementationLoopGather .[#8D8D8D,thickness=2].> AiWorkflowSystemImplementationLoopClassify : <color:#8D8D8D>collect
AiWorkflowSystemImplementationLoopVerify .[#8D8D8D,thickness=2].> AiWorkflowSystemImplementationLoopGather : <color:#8D8D8D>verify
AiWorkflowSystemImplementationLoopClassify .[#8D8D8D,thickness=2].> AiWorkflowSystemImplementationLoopDraft : <color:#8D8D8D>separate
AiWorkflowSystemImplementationLoopDraft .[#8D8D8D,thickness=2].> AiWorkflowSystemImplementationLoopReview : <color:#8D8D8D>draft
AiWorkflowSystemImplementationLoopReview .[#8D8D8D,thickness=2].> AiWorkflowSystemImplementationLoopVerify : <color:#8D8D8D>review
@enduml
`;default:throw Error(`Unknown viewId: `+e)}};export{e as pumlSource};