var e=e=>{switch(e){case`index`:return`---
title: "Landscape view"
---
graph TB
  PortfolioOperator@{ shape: rectangle, label: "Operator" }
  Operator@{ shape: rectangle, label: "Operator" }
  PortfolioStore@{ shape: rectangle, label: "Eagle Portfolio Library" }
  AiWorkflowSystem@{ shape: rectangle, label: "Prospect ID Workflow System" }
  Capture@{ shape: rectangle, label: "Capture Surfaces" }
  Durable@{ shape: rectangle, label: "Opportunity HQ" }
  Actions@{ shape: rectangle, label: "Raycast / Codex Actions" }
  Publishing@{ shape: rectangle, label: "Publishing Surfaces" }
  PortfolioOperator -. "\`triggers workflow action\`" .-> AiWorkflowSystem
  Operator -. "\`[...]\`" .-> Capture
  Operator -. "\`trigger\`" .-> Actions
  Capture -. "\`[...]\`" .-> Durable
  Durable -. "\`drive\`" .-> Actions
  Durable -. "\`[...]\`" .-> Publishing
  Actions -. "\`create/update\`" .-> Durable
  PortfolioStore -. "\`attach\`" .-> Durable
  Publishing -. "\`update\`" .-> Durable
  Actions -. "\`capture\`" .-> PortfolioStore
`;case`ai_workflow_readme_map`:return`---
title: "AI Workflow Portfolio README Map"
---
graph TB
  PortfolioOperator@{ icon: "fa:user", shape: rounded, label: "Operator" }
  subgraph AiWorkflowSystem["\`Prospect ID Workflow System\`"]
    AiWorkflowSystem.RaycastCommands@{ shape: rectangle, label: "Raycast Commands" }
    AiWorkflowSystem.ProspectWeb@{ shape: rectangle, label: "Vercel / Prospect Web" }
    AiWorkflowSystem.FastApiBridge@{ shape: rectangle, label: "Local FastAPI Bridge" }
    AiWorkflowSystem.LegacyLaravel@{ shape: rectangle, label: "Legacy Laravel Dashboard" }
    AiWorkflowSystem.SupabaseTruth@{ shape: rectangle, label: "Supabase PostgreSQL" }
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
  AiWorkflowSystemScoutingCoordinatorBucket1@{ shape: rectangle, label: "1. Meetings" }
  AiWorkflowSystemScoutingCoordinatorBucket2@{ shape: rectangle, label: "2. Prep" }
  AiWorkflowSystemScoutingCoordinatorBucket3@{ shape: rectangle, label: "3. Client Comms" }
  AiWorkflowSystemScoutingCoordinatorBucket4@{ shape: rectangle, label: "4. Lifecycle" }
  AiWorkflowSystemScoutingCoordinatorBucket5@{ shape: rectangle, label: "5. Outcomes" }
  AiWorkflowSystemScoutingCoordinatorBucket1 -.-> AiWorkflowSystemScoutingCoordinatorBucket2
  AiWorkflowSystemScoutingCoordinatorBucket2 -.-> AiWorkflowSystemScoutingCoordinatorBucket3
  AiWorkflowSystemScoutingCoordinatorBucket3 -.-> AiWorkflowSystemScoutingCoordinatorBucket4
  AiWorkflowSystemScoutingCoordinatorBucket4 -.-> AiWorkflowSystemScoutingCoordinatorBucket5
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
    Capture.Obsidian@{ shape: doc, label: "Obsidian _Inbox" }
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
  Operator -. "\`capture\`" .-> Capture.Obsidian
  Operator -. "\`log\`" .-> Capture.MobileForm
  Capture.Obsidian -. "\`promote\`" .-> Durable.Tasks
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
    Capture.Obsidian@{ shape: doc, label: "Obsidian _Inbox" }
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
  Operator -. "\`capture\`" .-> Capture.Obsidian
  Operator -. "\`log\`" .-> Capture.MobileForm
  Capture.Obsidian -. "\`promote\`" .-> Durable.Tasks
  Capture.MobileForm -. "\`create\`" .-> Durable.Tasks
  Durable.Tasks -. "\`render\`" .-> Durable.TaskViews
  Durable.Dependencies -. "\`block\`" .-> Durable.Tasks
`;case`portfolio_capture_flow`:return`---
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