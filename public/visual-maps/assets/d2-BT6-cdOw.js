var e=e=>{switch(e){case`index`:return`direction: down

PortfolioOperator: {
  label: "Operator"
}
AiWorkflowSystem: {
  label: "Prospect ID Workflow System"
}

PortfolioOperator -> AiWorkflowSystem: "triggers workflow action"
`;case`ai_workflow_readme_map`:return`direction: down

PortfolioOperator: {
  label: "Operator"
  shape: c4-person
}
AiWorkflowSystem: {
  label: "Prospect ID Workflow System"

  RaycastCommands: {
    label: "Raycast Commands"
  }
  ProspectWeb: {
    label: "Vercel / Prospect Web"
  }
  FastApiBridge: {
    label: "Local FastAPI Bridge"
  }
  LegacyLaravel: {
    label: "Legacy Laravel Dashboard"
  }
  SupabaseTruth: {
    label: "Supabase PostgreSQL"
    shape: stored_data
  }
}

PortfolioOperator -> AiWorkflowSystem.RaycastCommands: "triggers workflow action"
AiWorkflowSystem.RaycastCommands -> AiWorkflowSystem.FastApiBridge: "sends command payload"
AiWorkflowSystem.FastApiBridge -> AiWorkflowSystem.LegacyLaravel: "translates dashboard behavior"
AiWorkflowSystem.FastApiBridge -> AiWorkflowSystem.SupabaseTruth: "writes durable facts"
AiWorkflowSystem.ProspectWeb -> AiWorkflowSystem.SupabaseTruth: "reads cleaned data"
`;case`scouting_coordinator_bucket_map`:return`direction: right

AiWorkflowSystemScoutingCoordinatorBucket1: {
  label: "1. Meetings"
  shape: c4-person
}
AiWorkflowSystemScoutingCoordinatorBucket2: {
  label: "2. Prep"
}
AiWorkflowSystemScoutingCoordinatorBucket3: {
  label: "3. Client Comms"
}
AiWorkflowSystemScoutingCoordinatorBucket4: {
  label: "4. Lifecycle"
}
AiWorkflowSystemScoutingCoordinatorBucket5: {
  label: "5. Outcomes"
}

AiWorkflowSystemScoutingCoordinatorBucket1 -> AiWorkflowSystemScoutingCoordinatorBucket2
AiWorkflowSystemScoutingCoordinatorBucket2 -> AiWorkflowSystemScoutingCoordinatorBucket3
AiWorkflowSystemScoutingCoordinatorBucket3 -> AiWorkflowSystemScoutingCoordinatorBucket4
AiWorkflowSystemScoutingCoordinatorBucket4 -> AiWorkflowSystemScoutingCoordinatorBucket5
`;case`resume_timeline_map`:return`direction: right

AiWorkflowSystemResumeTimelineStetsonStart: {
  label: "2012 Stetson"
  shape: document
}
AiWorkflowSystemResumeTimelineStetsonGrad: {
  label: "2016 Graduated"
  shape: c4-person
}
AiWorkflowSystemResumeTimelineSpcIt: {
  label: "2021 SPC / IT"
}
AiWorkflowSystemResumeTimelineProductionSystems: {
  label: "2024 Production Systems"
}
AiWorkflowSystemResumeTimelineAiSpecialistFit: {
  label: "2026 AI Specialist Fit"
}

AiWorkflowSystemResumeTimelineStetsonStart -> AiWorkflowSystemResumeTimelineStetsonGrad: "advance"
AiWorkflowSystemResumeTimelineStetsonGrad -> AiWorkflowSystemResumeTimelineSpcIt: "add"
AiWorkflowSystemResumeTimelineSpcIt -> AiWorkflowSystemResumeTimelineProductionSystems: "build"
AiWorkflowSystemResumeTimelineProductionSystems -> AiWorkflowSystemResumeTimelineAiSpecialistFit: "fit"
`;case`review_first_implementation_loop`:return`direction: right

AiWorkflowSystemImplementationLoopVerify: {
  label: "Verify"
  shape: queue
}
AiWorkflowSystemImplementationLoopGather: {
  label: "Gather"
}
AiWorkflowSystemImplementationLoopClassify: {
  label: "Classify"
  shape: c4-person
}
AiWorkflowSystemImplementationLoopDraft: {
  label: "Draft"
  shape: document
}
AiWorkflowSystemImplementationLoopReview: {
  label: "Review"
}

AiWorkflowSystemImplementationLoopGather -> AiWorkflowSystemImplementationLoopClassify: "collect"
AiWorkflowSystemImplementationLoopVerify -> AiWorkflowSystemImplementationLoopGather: "verify"
AiWorkflowSystemImplementationLoopClassify -> AiWorkflowSystemImplementationLoopDraft: "separate"
AiWorkflowSystemImplementationLoopDraft -> AiWorkflowSystemImplementationLoopReview: "draft"
AiWorkflowSystemImplementationLoopReview -> AiWorkflowSystemImplementationLoopVerify: "review"
`;default:throw Error(`Unknown viewId: `+e)}};export{e as d2Source};