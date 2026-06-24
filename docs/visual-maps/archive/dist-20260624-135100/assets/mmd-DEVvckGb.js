var e=e=>{switch(e){case`index`:return`---
title: "Landscape view"
---
graph TB
  Operator@{ shape: rectangle, label: "Operator" }
  Proof@{ shape: rectangle, label: "Eagle Proof Library" }
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
  Proof -. "\`attach\`" .-> Durable
  Publishing -. "\`update\`" .-> Durable
  Actions -. "\`capture\`" .-> Proof
`;case`opportunity_hq_container_map`:return`---
title: "Opportunity HQ Container Map"
---
graph TB
  Operator@{ icon: "fa:user", shape: rounded, label: "Operator" }
  ActionsLogTask@{ shape: rectangle, label: "Log Task" }
  ActionsUpdateTask@{ shape: rectangle, label: "Update Task" }
  ActionsPlanToday@{ shape: rectangle, label: "Plan Today" }
  ActionsStartApplication@{ shape: rectangle, label: "Start Application" }
  ActionsDraftProposal@{ shape: rectangle, label: "Draft Proposal" }
  ActionsCaptureProof@{ shape: rectangle, label: "Capture Proof" }
  Proof@{ shape: disk, label: "Eagle Proof Library" }
  subgraph Capture["\`Capture Surfaces\`"]
    Capture.Bear@{ shape: doc, label: "Bear Inbox" }
    Capture.MobileForm@{ shape: rounded, label: "Mobile Task Form" }
  end
  subgraph Durable["\`Opportunity HQ\`"]
    Durable.Projects@{ shape: disk, label: "Opportunity Projects" }
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
  Proof -. "\`attach\`" .-> Durable.Tasks
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
    Durable.Tasks@{ shape: horizontal-cylinder, label: "Opportunity Tasks" }
    Durable.TaskViews@{ shape: rounded, label: "Task Views" }
  end
  ActionsLogTask@{ shape: rectangle, label: "Log Task" }
  ActionsUpdateTask@{ shape: rectangle, label: "Update Task" }
  ActionsPlanToday@{ shape: rectangle, label: "Plan Today" }
  Operator -. "\`capture\`" .-> Capture.Bear
  Operator -. "\`log\`" .-> Capture.MobileForm
  Capture.Bear -. "\`promote\`" .-> Durable.Tasks
  Capture.MobileForm -. "\`create\`" .-> Durable.Tasks
  Durable.Tasks -. "\`render\`" .-> Durable.TaskViews
`;case`proof_capture_flow`:return`---
title: "Proof Capture Flow"
---
graph TB
  Operator@{ icon: "fa:user", shape: rounded, label: "Operator" }
  ActionsCaptureProof@{ shape: rectangle, label: "Capture Proof" }
  Proof@{ shape: disk, label: "Eagle Proof Library" }
  subgraph Durable["\`Opportunity HQ\`"]
    Durable.Projects@{ shape: disk, label: "Opportunity Projects" }
    Durable.Tasks@{ shape: horizontal-cylinder, label: "Opportunity Tasks" }
  end
  subgraph Publishing["\`Publishing Surfaces\`"]
    Publishing.Website@{ shape: rounded, label: "Singleton Website" }
    Publishing.Proposals@{ shape: doc, label: "Applications / Proposals" }
  end
  Durable.Projects -. "\`group\`" .-> Durable.Tasks
  Proof -. "\`attach\`" .-> Durable.Tasks
  Durable.Tasks -. "\`package\`" .-> Publishing.Website
  Durable.Tasks -. "\`submit\`" .-> Publishing.Proposals
  Publishing.Proposals -. "\`update\`" .-> Durable.Tasks
`;default:throw Error(`Unknown viewId: `+e)}};export{e as mmdSource};