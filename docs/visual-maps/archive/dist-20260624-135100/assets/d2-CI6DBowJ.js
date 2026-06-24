var e=e=>{switch(e){case`index`:return`direction: down

Operator: {
  label: "Operator"
}
Proof: {
  label: "Eagle Proof Library"
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
Proof -> Durable: "attach"
Publishing -> Durable: "update"
Actions -> Proof: "capture"
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
ActionsPlanToday: {
  label: "Plan Today"
}
ActionsStartApplication: {
  label: "Start Application"
}
ActionsDraftProposal: {
  label: "Draft Proposal"
}
ActionsCaptureProof: {
  label: "Capture Proof"
}
Proof: {
  label: "Eagle Proof Library"
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
Proof -> Durable.Tasks: "attach"
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
ActionsPlanToday: {
  label: "Plan Today"
}

Operator -> Capture.Bear: "capture"
Operator -> Capture.MobileForm: "log"
Capture.Bear -> Durable.Tasks: "promote"
Capture.MobileForm -> Durable.Tasks: "create"
Durable.Tasks -> Durable.TaskViews: "render"
`;case`proof_capture_flow`:return`direction: down

Operator: {
  label: "Operator"
  shape: c4-person
}
ActionsCaptureProof: {
  label: "Capture Proof"
}
Proof: {
  label: "Eagle Proof Library"
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
Proof -> Durable.Tasks: "attach"
Durable.Tasks -> Publishing.Website: "package"
Durable.Tasks -> Publishing.Proposals: "submit"
Publishing.Proposals -> Durable.Tasks: "update"
`;default:throw Error(`Unknown viewId: `+e)}};export{e as d2Source};