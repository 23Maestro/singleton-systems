var e=e=>{switch(e){case`index`:return`direction: down

PortfolioOperator: {
  label: "Operator"
}
Operator: {
  label: "Operator"
}
PortfolioStore: {
  label: "Eagle Portfolio Library"
}
AiWorkflowSystem: {
  label: "Prospect ID Workflow System"
}
Capture: {
  label: "Capture Surfaces"
}
Durable: {
  label: "Opportunity HQ"
}
Actions: {
  label: "Raycast / Codex Actions"
}
Publishing: {
  label: "Publishing Surfaces"
}

PortfolioOperator -> AiWorkflowSystem: "triggers workflow action"
Operator -> Capture: "[...]"
Operator -> Actions: "trigger"
Capture -> Durable: "[...]"
Durable -> Actions: "drive"
Durable -> Publishing: "[...]"
Actions -> Durable: "create/update"
PortfolioStore -> Durable: "attach"
Publishing -> Durable: "update"
Actions -> PortfolioStore: "capture"
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
`;case`opportunity_hq_container_map`:return`direction: down

Operator: {
  label: "Operator"
  shape: c4-person
}
ActionsLogTask: {
  label: "Log Task"
}
ActionsUpdateTask: {
  label: "Update Task"
}
ActionsSearchRun: {
  label: "Opportunity Search Run"
}
ActionsExportBlocks: {
  label: "Export Focus Blocks"
}
ActionsGoalCheckIn: {
  label: "Goal Check-In"
}
ActionsStartApplication: {
  label: "Start Application"
}
ActionsDraftProposal: {
  label: "Draft Proposal"
}
ActionsCapturePortfolio: {
  label: "Capture Portfolio"
}
PortfolioStore: {
  label: "Eagle Portfolio Library"
  shape: stored_data
}
Capture: {
  label: "Capture Surfaces"

  Obsidian: {
    label: "Obsidian _Inbox"
    shape: document
  }
  MobileForm: {
    label: "Mobile Task Form"
  }
}
Durable: {
  label: "Opportunity HQ"
  shape: stored_data

  Projects: {
    label: "Opportunity Projects"
    shape: stored_data
  }
  Dependencies: {
    label: "Dependencies"
  }
  Tasks: {
    label: "Opportunity Tasks"
    shape: queue
  }
  TaskViews: {
    label: "Task Views"
  }
}
Publishing: {
  label: "Publishing Surfaces"

  Website: {
    label: "Singleton Website"
  }
  Proposals: {
    label: "Applications / Proposals"
    shape: document
  }
}

Operator -> Capture.Obsidian: "capture"
Operator -> Capture.MobileForm: "log"
Capture.Obsidian -> Durable.Tasks: "promote"
Capture.MobileForm -> Durable.Tasks: "create"
Durable.Projects -> Durable.Tasks: "group"
Durable.Tasks -> Durable.TaskViews: "render"
Durable.Dependencies -> Durable.Tasks: "block"
PortfolioStore -> Durable.Tasks: "attach"
Durable.Tasks -> Publishing.Website: "package"
Durable.Tasks -> Publishing.Proposals: "submit"
Publishing.Proposals -> Durable.Tasks: "update"
`;case`opportunity_hq_intake_contract`:return`direction: down

Operator: {
  label: "Operator"
  shape: c4-person
}
Capture: {
  label: "Capture Surfaces"

  Obsidian: {
    label: "Obsidian _Inbox"
    shape: document
  }
  MobileForm: {
    label: "Mobile Task Form"
  }
}
Durable: {
  label: "Opportunity HQ"

  Dependencies: {
    label: "Dependencies"
  }
  Tasks: {
    label: "Opportunity Tasks"
    shape: queue
  }
  TaskViews: {
    label: "Task Views"
  }
}
ActionsLogTask: {
  label: "Log Task"
}
ActionsUpdateTask: {
  label: "Update Task"
}
ActionsSearchRun: {
  label: "Opportunity Search Run"
}
ActionsExportBlocks: {
  label: "Export Focus Blocks"
}
ActionsGoalCheckIn: {
  label: "Goal Check-In"
}

Operator -> Capture.Obsidian: "capture"
Operator -> Capture.MobileForm: "log"
Capture.Obsidian -> Durable.Tasks: "promote"
Capture.MobileForm -> Durable.Tasks: "create"
Durable.Tasks -> Durable.TaskViews: "render"
Durable.Dependencies -> Durable.Tasks: "block"
`;case`portfolio_capture_flow`:return`direction: down

Operator: {
  label: "Operator"
  shape: c4-person
}
ActionsCapturePortfolio: {
  label: "Capture Portfolio"
}
PortfolioStore: {
  label: "Eagle Portfolio Library"
  shape: stored_data
}
Durable: {
  label: "Opportunity HQ"

  Projects: {
    label: "Opportunity Projects"
    shape: stored_data
  }
  Tasks: {
    label: "Opportunity Tasks"
    shape: queue
  }
}
Publishing: {
  label: "Publishing Surfaces"

  Website: {
    label: "Singleton Website"
  }
  Proposals: {
    label: "Applications / Proposals"
    shape: document
  }
}

Durable.Projects -> Durable.Tasks: "group"
PortfolioStore -> Durable.Tasks: "attach"
Durable.Tasks -> Publishing.Website: "package"
Durable.Tasks -> Publishing.Proposals: "submit"
Publishing.Proposals -> Durable.Tasks: "update"
`;default:throw Error(`Unknown viewId: `+e)}};export{e as d2Source};