var e=e=>{switch(e){case`index`:return`---
title: "Landscape view"
---
graph TB
  PortfolioOperator@{ shape: rectangle, label: "Operator" }
  AiWorkflowSystem@{ shape: rectangle, label: "Prospect ID Workflow System" }
  PortfolioOperator -. "\`triggers workflow action\`" .-> AiWorkflowSystem
`;case`ai_workflow_readme_map`:return`---
title: "AI Workflow Portfolio README Map"
---
graph TB
  PortfolioOperator@{ icon: "fa:user", shape: rounded, label: "Operator" }
  subgraph AiWorkflowSystem["\`Prospect ID Workflow System\`"]
    AiWorkflowSystem.RaycastCommands@{ shape: rectangle, label: "Raycast Commands" }
    AiWorkflowSystem.ProspectWeb@{ shape: rounded, label: "Vercel / Prospect Web" }
    AiWorkflowSystem.FastApiBridge@{ shape: rounded, label: "Local FastAPI Bridge" }
    AiWorkflowSystem.LegacyLaravel@{ shape: rounded, label: "Legacy Laravel Dashboard" }
    AiWorkflowSystem.SupabaseTruth@{ shape: disk, label: "Supabase PostgreSQL" }
  end
  PortfolioOperator -. "\`triggers workflow action\`" .-> AiWorkflowSystem.RaycastCommands
  AiWorkflowSystem.RaycastCommands -. "\`sends command payload\`" .-> AiWorkflowSystem.FastApiBridge
  AiWorkflowSystem.FastApiBridge -. "\`translates dashboard behavior\`" .-> AiWorkflowSystem.LegacyLaravel
  AiWorkflowSystem.FastApiBridge -. "\`writes durable facts\`" .-> AiWorkflowSystem.SupabaseTruth
  AiWorkflowSystem.ProspectWeb -. "\`reads cleaned data\`" .-> AiWorkflowSystem.SupabaseTruth
`;case`scouting_coordinator_bucket_map`:return`---
title: "Scouting Coordinator System Map"
---
graph LR
  AiWorkflowSystemScoutingCoordinatorBucket1@{ icon: "fa:user", shape: rounded, label: "1. Meetings" }
  AiWorkflowSystemScoutingCoordinatorBucket2@{ shape: rectangle, label: "2. Prep" }
  AiWorkflowSystemScoutingCoordinatorBucket3@{ shape: rectangle, label: "3. Client Comms" }
  AiWorkflowSystemScoutingCoordinatorBucket4@{ shape: rectangle, label: "4. Lifecycle" }
  AiWorkflowSystemScoutingCoordinatorBucket5@{ shape: rectangle, label: "5. Outcomes" }
  AiWorkflowSystemScoutingCoordinatorBucket1 -.-> AiWorkflowSystemScoutingCoordinatorBucket2
  AiWorkflowSystemScoutingCoordinatorBucket2 -.-> AiWorkflowSystemScoutingCoordinatorBucket3
  AiWorkflowSystemScoutingCoordinatorBucket3 -.-> AiWorkflowSystemScoutingCoordinatorBucket4
  AiWorkflowSystemScoutingCoordinatorBucket4 -.-> AiWorkflowSystemScoutingCoordinatorBucket5
`;case`resume_timeline_map`:return`---
title: "Resume Timeline Map"
---
graph LR
  AiWorkflowSystemResumeTimelineStetsonStart@{ shape: doc, label: "2012 Stetson" }
  AiWorkflowSystemResumeTimelineStetsonGrad@{ icon: "fa:user", shape: rounded, label: "2016 Graduated" }
  AiWorkflowSystemResumeTimelineSpcIt@{ shape: rounded, label: "2021 SPC / IT" }
  AiWorkflowSystemResumeTimelineProductionSystems@{ shape: rounded, label: "2024 Production Systems" }
  AiWorkflowSystemResumeTimelineAiSpecialistFit@{ shape: rectangle, label: "2026 AI Specialist Fit" }
  AiWorkflowSystemResumeTimelineStetsonStart -. "\`advance\`" .-> AiWorkflowSystemResumeTimelineStetsonGrad
  AiWorkflowSystemResumeTimelineStetsonGrad -. "\`add\`" .-> AiWorkflowSystemResumeTimelineSpcIt
  AiWorkflowSystemResumeTimelineSpcIt -. "\`build\`" .-> AiWorkflowSystemResumeTimelineProductionSystems
  AiWorkflowSystemResumeTimelineProductionSystems -. "\`fit\`" .-> AiWorkflowSystemResumeTimelineAiSpecialistFit
`;case`review_first_implementation_loop`:return`---
title: "Review-first Implementation Loop"
---
graph LR
  AiWorkflowSystemImplementationLoopVerify@{ shape: horizontal-cylinder, label: "Verify" }
  AiWorkflowSystemImplementationLoopGather@{ shape: trap-t, label: "Gather" }
  AiWorkflowSystemImplementationLoopClassify@{ icon: "fa:user", shape: rounded, label: "Classify" }
  AiWorkflowSystemImplementationLoopDraft@{ shape: doc, label: "Draft" }
  AiWorkflowSystemImplementationLoopReview@{ shape: rectangle, label: "Review" }
  AiWorkflowSystemImplementationLoopGather -. "\`collect\`" .-> AiWorkflowSystemImplementationLoopClassify
  AiWorkflowSystemImplementationLoopVerify -. "\`verify\`" .-> AiWorkflowSystemImplementationLoopGather
  AiWorkflowSystemImplementationLoopClassify -. "\`separate\`" .-> AiWorkflowSystemImplementationLoopDraft
  AiWorkflowSystemImplementationLoopDraft -. "\`draft\`" .-> AiWorkflowSystemImplementationLoopReview
  AiWorkflowSystemImplementationLoopReview -. "\`review\`" .-> AiWorkflowSystemImplementationLoopVerify
`;default:throw Error(`Unknown viewId: `+e)}};export{e as mmdSource};