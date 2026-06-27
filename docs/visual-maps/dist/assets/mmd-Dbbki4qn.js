var e=e=>{switch(e){case`index`:return`---
title: "Landscape view"
---
graph TB
  Operator@{ shape: rectangle, label: "Operator" }
  PortfolioStore@{ shape: rectangle, label: "Eagle Portfolio Library" }
  Capture@{ shape: rectangle, label: "Capture Surfaces" }
  Durable@{ shape: rectangle, label: "Opportunity HQ" }
  Actions@{ shape: rectangle, label: "Raycast / Codex Actions" }
  Publishing@{ shape: rectangle, label: "Publishing Surfaces" }
  Operator -. "\`[...]\`" .-> Capture
  Operator -. "\`trigger\`" .-> Actions
  Capture -. "\`[...]\`" .-> Durable
  Durable -. "\`drive\`" .-> Actions
  Durable -. "\`[...]\`" .-> Publishing
  Actions -. "\`create/update\`" .-> Durable
  PortfolioStore -. "\`attach\`" .-> Durable
  Publishing -. "\`update\`" .-> Durable
  Actions -. "\`capture\`" .-> PortfolioStore
`;case`opportunity_hq_container_map`:return`---
title: "Opportunity HQ Container Map"
---
graph TB
  Operator@{ icon: "fa:user", shape: rounded, label: "Operator" }
  ActionsLogTask@{ shape: rectangle, label: "Log Task" }
  ActionsUpdateTask@{ shape: rectangle, label: "Update Task" }
  ActionsSearchRun@{ shape: rectangle, label: "Opportunity Search Run" }
  ActionsExportBlocks@{ shape: rectangle, label: "Export Focus Blocks" }
  ActionsGoalCheckIn@{ shape: rectangle, label: "Goal Check-In" }
  ActionsStartApplication@{ shape: rectangle, label: "Start Application" }
  ActionsDraftProposal@{ shape: rectangle, label: "Draft Proposal" }
  ActionsCapturePortfolio@{ shape: rectangle, label: "Capture Portfolio" }
  PortfolioStore@{ shape: disk, label: "Eagle Portfolio Library" }
  subgraph Capture["\`Capture Surfaces\`"]
    Capture.Bear@{ shape: doc, label: "Bear Inbox" }
    Capture.MobileForm@{ shape: rounded, label: "Mobile Task Form" }
  end
  subgraph Durable["\`Opportunity HQ\`"]
    Durable.Projects@{ shape: disk, label: "Opportunity Projects" }
    Durable.Dependencies@{ shape: rectangle, label: "Dependencies" }
    Durable.Tasks@{ shape: horizontal-cylinder, label: "Opportunity Tasks" }
    Durable.TaskViews@{ shape: rounded, label: "Task Views" }
  end
  subgraph Publishing["\`Publishing Surfaces\`"]
    Publishing.Website@{ shape: rounded, label: "Singleton Website" }
    Publishing.Proposals@{ shape: doc, label: "Applications / Proposals" }
  end
  Operator -. "\`capture\`" .-> Capture.Bear
  Operator -. "\`log\`" .-> Capture.MobileForm
  Capture.Bear -. "\`promote\`" .-> Durable.Tasks
  Capture.MobileForm -. "\`create\`" .-> Durable.Tasks
  Durable.Projects -. "\`group\`" .-> Durable.Tasks
  Durable.Tasks -. "\`render\`" .-> Durable.TaskViews
  Durable.Dependencies -. "\`block\`" .-> Durable.Tasks
  PortfolioStore -. "\`attach\`" .-> Durable.Tasks
  Durable.Tasks -. "\`package\`" .-> Publishing.Website
  Durable.Tasks -. "\`submit\`" .-> Publishing.Proposals
  Publishing.Proposals -. "\`update\`" .-> Durable.Tasks
`;case`opportunity_hq_intake_contract`:return`---
title: "Opportunity HQ Intake Contract"
---
graph TB
  Operator@{ icon: "fa:user", shape: rounded, label: "Operator" }
  subgraph Capture["\`Capture Surfaces\`"]
    Capture.Bear@{ shape: doc, label: "Bear Inbox" }
    Capture.MobileForm@{ shape: rounded, label: "Mobile Task Form" }
  end
  subgraph Durable["\`Opportunity HQ\`"]
    Durable.Dependencies@{ shape: rectangle, label: "Dependencies" }
    Durable.Tasks@{ shape: horizontal-cylinder, label: "Opportunity Tasks" }
    Durable.TaskViews@{ shape: rounded, label: "Task Views" }
  end
  ActionsLogTask@{ shape: rectangle, label: "Log Task" }
  ActionsUpdateTask@{ shape: rectangle, label: "Update Task" }
  ActionsSearchRun@{ shape: rectangle, label: "Opportunity Search Run" }
  ActionsExportBlocks@{ shape: rectangle, label: "Export Focus Blocks" }
  ActionsGoalCheckIn@{ shape: rectangle, label: "Goal Check-In" }
  Operator -. "\`capture\`" .-> Capture.Bear
  Operator -. "\`log\`" .-> Capture.MobileForm
  Capture.Bear -. "\`promote\`" .-> Durable.Tasks
  Capture.MobileForm -. "\`create\`" .-> Durable.Tasks
  Durable.Tasks -. "\`render\`" .-> Durable.TaskViews
  Durable.Dependencies -. "\`block\`" .-> Durable.Tasks
`;case`proof_capture_flow`:return`---
title: "Portfolio Capture Flow"
---
graph TB
  Operator@{ icon: "fa:user", shape: rounded, label: "Operator" }
  ActionsCapturePortfolio@{ shape: rectangle, label: "Capture Portfolio" }
  PortfolioStore@{ shape: disk, label: "Eagle Portfolio Library" }
  subgraph Durable["\`Opportunity HQ\`"]
    Durable.Projects@{ shape: disk, label: "Opportunity Projects" }
    Durable.Tasks@{ shape: horizontal-cylinder, label: "Opportunity Tasks" }
  end
  subgraph Publishing["\`Publishing Surfaces\`"]
    Publishing.Website@{ shape: rounded, label: "Singleton Website" }
    Publishing.Proposals@{ shape: doc, label: "Applications / Proposals" }
  end
  Durable.Projects -. "\`group\`" .-> Durable.Tasks
  PortfolioStore -. "\`attach\`" .-> Durable.Tasks
  Durable.Tasks -. "\`package\`" .-> Publishing.Website
  Durable.Tasks -. "\`submit\`" .-> Publishing.Proposals
  Publishing.Proposals -. "\`update\`" .-> Durable.Tasks
`;default:throw Error(`Unknown viewId: `+e)}};export{e as mmdSource};