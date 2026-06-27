var e=e=>{switch(e){case`index`:return`direction: down

Operator: {
  label: "Operator"
}
PortfolioStore: {
  label: "Eagle Portfolio Library"
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

Operator -> Capture: "[...]"
Operator -> Actions: "trigger"
Capture -> Durable: "[...]"
Durable -> Actions: "drive"
Durable -> Publishing: "[...]"
Actions -> Durable: "create/update"
PortfolioStore -> Durable: "attach"
Publishing -> Durable: "update"
Actions -> PortfolioStore: "capture"
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

  Bear: {
    label: "Bear Inbox"
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

Operator -> Capture.Bear: "capture"
Operator -> Capture.MobileForm: "log"
Capture.Bear -> Durable.Tasks: "promote"
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

  Bear: {
    label: "Bear Inbox"
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

Operator -> Capture.Bear: "capture"
Operator -> Capture.MobileForm: "log"
Capture.Bear -> Durable.Tasks: "promote"
Capture.MobileForm -> Durable.Tasks: "create"
Durable.Tasks -> Durable.TaskViews: "render"
Durable.Dependencies -> Durable.Tasks: "block"
`;case`proof_capture_flow`:return`direction: down

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