var e=e=>{switch(e){case`index`:return`digraph {
    graph [TBbalance=min,
        bgcolor=transparent,
        compound=true,
        fontname=Arial,
        fontsize=20,
        labeljust=l,
        labelloc=t,
        layout=dot,
        likec4_viewId=index,
        nodesep=1.528,
        outputorder=nodesfirst,
        pad=0.209,
        rankdir=TB,
        ranksep=1.667,
        splines=spline
    ];
    node [color="#2563eb",
        fillcolor="#3b82f6",
        fontcolor="#eff6ff",
        fontname=Arial,
        label="\\N",
        penwidth=0,
        shape=rect,
        style=filled
    ];
    edge [arrowsize=0.75,
        color="#8D8D8D",
        fontcolor="#C9C9C9",
        fontname=Arial,
        fontsize=14,
        penwidth=2,
        style=""
    ];
    operator [height=2.5,
        label=<<TABLE BORDER="0" CELLPADDING="0" CELLSPACING="4"><TR><TD><FONT POINT-SIZE="20">Operator</FONT></TD></TR><TR><TD><FONT POINT-SIZE="15" COLOR="#bfdbfe">The working user. Uses mobile, desktop,<BR/>Raycast, Codex, Notion, Bear, and<BR/>Eagle to move job search, Upwork, Singleton<BR/>offer, and proof work without<BR/>repeatedly deciding where each item belongs.</FONT></TD></TR></TABLE>>,
        likec4_id=operator,
        likec4_level=0,
        margin="0.223,0.223",
        width=4.445];
    capture [height=2.5,
        label=<<FONT POINT-SIZE="20">Capture Surfaces</FONT>>,
        likec4_id=capture,
        likec4_level=0,
        margin="0.223,0.223",
        width=4.445];
    operator -> capture [arrowhead=normal,
        label=<<TABLE BORDER="0" CELLPADDING="3" CELLSPACING="0" BGCOLOR="#18191BA0"><TR><TD ALIGN="TEXT" BALIGN="LEFT"><FONT POINT-SIZE="14"><B>[...]</B></FONT></TD></TR></TABLE>>,
        likec4_id="18i7kcu",
        style=dashed];
    actions [height=2.5,
        label=<<TABLE BORDER="0" CELLPADDING="0" CELLSPACING="4"><TR><TD><FONT POINT-SIZE="20">Raycast / Codex Actions</FONT></TD></TR><TR><TD><FONT POINT-SIZE="15" COLOR="#bfdbfe">Action layer. It creates, updates, opens,<BR/>drafts, and attaches. It<BR/>should not invent a second task model.</FONT></TD></TR></TABLE>>,
        likec4_id=actions,
        likec4_level=0,
        margin="0.223,0.223",
        width=4.445];
    operator -> actions [arrowhead=normal,
        label=<<TABLE BORDER="0" CELLPADDING="3" CELLSPACING="0" BGCOLOR="#18191BA0"><TR><TD ALIGN="TEXT" BALIGN="LEFT"><FONT POINT-SIZE="14">trigger</FONT></TD></TR></TABLE>>,
        likec4_id="5lllyf",
        style=dashed];
    portfoliostore [height=2.5,
        label=<<TABLE BORDER="0" CELLPADDING="0" CELLSPACING="4"><TR><TD><FONT POINT-SIZE="20">Eagle Portfolio Library</FONT></TD></TR><TR><TD><FONT POINT-SIZE="15" COLOR="#bfdbfe">Portfolio/evidence store. Holds screenshots,<BR/>videos, PDFs, reels, examples, and proof<BR/>assets. Eagle does not own task status;<BR/>Opportunity HQ does.</FONT></TD></TR></TABLE>>,
        likec4_id=portfolioStore,
        likec4_level=0,
        margin="0.223,0.223",
        width=4.445];
    durable [height=2.5,
        label=<<TABLE BORDER="0" CELLPADDING="0" CELLSPACING="4"><TR><TD><FONT POINT-SIZE="20">Opportunity HQ</FONT></TD></TR><TR><TD><FONT POINT-SIZE="15" COLOR="#bfdbfe">Notion is durable truth. It owns projects,<BR/>tasks, status, duration estimates,<BR/>daily work shifts, links, and notes. Views<BR/>are not new<BR/>databases.</FONT></TD></TR></TABLE>>,
        likec4_id=durable,
        likec4_level=0,
        margin="0.223,0.223",
        width=4.445];
    portfoliostore -> durable [arrowhead=normal,
        label=<<TABLE BORDER="0" CELLPADDING="3" CELLSPACING="0" BGCOLOR="#18191BA0"><TR><TD ALIGN="TEXT" BALIGN="LEFT"><FONT POINT-SIZE="14">attach</FONT></TD></TR></TABLE>>,
        likec4_id=gqjhye,
        style=dashed];
    capture -> durable [arrowhead=normal,
        label=<<TABLE BORDER="0" CELLPADDING="3" CELLSPACING="0" BGCOLOR="#18191BA0"><TR><TD ALIGN="TEXT" BALIGN="LEFT"><FONT POINT-SIZE="14"><B>[...]</B></FONT></TD></TR></TABLE>>,
        likec4_id="1q7fu1z",
        style=dashed];
    durable -> actions [arrowhead=normal,
        label=<<TABLE BORDER="0" CELLPADDING="3" CELLSPACING="0" BGCOLOR="#18191BA0"><TR><TD ALIGN="TEXT" BALIGN="LEFT"><FONT POINT-SIZE="14">drive</FONT></TD></TR></TABLE>>,
        likec4_id=gtprbi,
        style=dashed];
    publishing [height=2.5,
        label=<<FONT POINT-SIZE="20">Publishing Surfaces</FONT>>,
        likec4_id=publishing,
        likec4_level=0,
        margin="0.223,0.223",
        width=4.445];
    durable -> publishing [arrowhead=normal,
        label=<<TABLE BORDER="0" CELLPADDING="3" CELLSPACING="0" BGCOLOR="#18191BA0"><TR><TD ALIGN="TEXT" BALIGN="LEFT"><FONT POINT-SIZE="14"><B>[...]</B></FONT></TD></TR></TABLE>>,
        likec4_id="1equ3ju",
        style=dashed];
    actions -> portfoliostore [arrowhead=normal,
        label=<<TABLE BORDER="0" CELLPADDING="3" CELLSPACING="0" BGCOLOR="#18191BA0"><TR><TD ALIGN="TEXT" BALIGN="LEFT"><FONT POINT-SIZE="14">capture</FONT></TD></TR></TABLE>>,
        likec4_id=sdq8ci,
        style=dashed];
    actions -> durable [arrowhead=normal,
        label=<<TABLE BORDER="0" CELLPADDING="3" CELLSPACING="0" BGCOLOR="#18191BA0"><TR><TD ALIGN="TEXT" BALIGN="LEFT"><FONT POINT-SIZE="14">create/update</FONT></TD></TR></TABLE>>,
        likec4_id="1js1i1a",
        style=dashed];
    publishing -> durable [arrowhead=normal,
        label=<<TABLE BORDER="0" CELLPADDING="3" CELLSPACING="0" BGCOLOR="#18191BA0"><TR><TD ALIGN="TEXT" BALIGN="LEFT"><FONT POINT-SIZE="14">update</FONT></TD></TR></TABLE>>,
        likec4_id=cro7x6,
        style=dashed];
}
`;case`opportunity_hq_container_map`:return`digraph {
    graph [TBbalance=min,
        bgcolor=transparent,
        compound=true,
        fontname=Arial,
        fontsize=20,
        labeljust=l,
        labelloc=t,
        layout=dot,
        likec4_viewId=opportunity_hq_container_map,
        nodesep=1.528,
        outputorder=nodesfirst,
        pad=0.209,
        rankdir=TB,
        ranksep=1.667,
        splines=spline
    ];
    node [color="#2563eb",
        fillcolor="#3b82f6",
        fontcolor="#eff6ff",
        fontname=Arial,
        label="\\N",
        penwidth=0,
        shape=rect,
        style=filled
    ];
    edge [arrowsize=0.75,
        color="#8D8D8D",
        fontcolor="#C9C9C9",
        fontname=Arial,
        fontsize=14,
        penwidth=2,
        style=""
    ];
    subgraph cluster_capture {
        graph [color="#2d333d",
            fillcolor="#3e4651",
            label=<<FONT POINT-SIZE="11" COLOR="#cbd5e1b3"><B>CAPTURE SURFACES</B></FONT>>,
            likec4_depth=1,
            likec4_id=capture,
            likec4_level=0,
            margin=40,
            style=filled
        ];
        bear [color="#853A2D",
            fillcolor="#AC4D39",
            fontcolor="#FBD3CB",
            height=2.5,
            label=<<TABLE BORDER="0" CELLPADDING="0" CELLSPACING="4"><TR><TD><FONT POINT-SIZE="20">Bear Inbox</FONT></TD></TR><TR><TD><FONT POINT-SIZE="15" COLOR="#f5b2a3">Raw capture only. Use for unclear thoughts,<BR/>offload notes, passive<BR/>shortcut ideas, and anything that is not yet<BR/>a real task. Promote only<BR/>when the item has money weight, deadline,</FONT></TD></TR></TABLE>>,
            likec4_id="capture.bear",
            likec4_level=1,
            margin="0.223,0.223",
            width=4.445];
        mobileform [height=2.5,
            label=<<TABLE BORDER="0" CELLPADDING="0" CELLSPACING="4"><TR><TD><FONT POINT-SIZE="20">Mobile Task Form</FONT></TD></TR><TR><TD><FONT POINT-SIZE="15" COLOR="#bfdbfe">Fast durable capture path for task-shaped<BR/>work. Minimum fields: Task,<BR/>Project, Duration, and Link/Notes. Default<BR/>Status should be Queued.</FONT></TD></TR></TABLE>>,
            likec4_id="capture.mobileForm",
            likec4_level=1,
            margin="0.278,0.306",
            width=4.445];
    }
    subgraph cluster_durable {
        graph [color="#0b3c57",
            fillcolor="#0d4b6c",
            label=<<FONT POINT-SIZE="11" COLOR="#b6ecf7b3"><B>OPPORTUNITY HQ</B></FONT>>,
            likec4_depth=1,
            likec4_id=durable,
            likec4_level=0,
            margin=40,
            style=filled
        ];
        projects [color="#0369a1",
            fillcolor="#0284c7",
            fontcolor="#f0f9ff",
            group=durable,
            height=2.5,
            label=<<TABLE BORDER="0" CELLPADDING="0" CELLSPACING="4"><TR><TD><FONT POINT-SIZE="20">Opportunity Projects</FONT></TD></TR><TR><TD><FONT POINT-SIZE="15" COLOR="#B6ECF7">Durable project lanes: Cash Jobs, Career<BR/>Jobs, Freelance, Offer, Portfolio.<BR/>Finishable deliverables belong as tasks/goals<BR/>under these rows.</FONT></TD></TR></TABLE>>,
            likec4_id="durable.projects",
            likec4_level=1,
            margin="0.223,0",
            penwidth=2,
            shape=cylinder,
            width=4.445];
        dependencies [color="#475569",
            fillcolor="#64748b",
            fontcolor="#f8fafc",
            group=durable,
            height=2.5,
            label=<<TABLE BORDER="0" CELLPADDING="0" CELLSPACING="4"><TR><TD><FONT POINT-SIZE="20">Dependencies</FONT></TD></TR><TR><TD><FONT POINT-SIZE="15" COLOR="#cbd5e1">Real blockers only: application work can<BR/>depend on resume/snippet prep;<BR/>website request flow depends on Tally and<BR/>Notion intake; offer traction<BR/>depends on website, proof, outreach, and a</FONT></TD></TR></TABLE>>,
            likec4_id="durable.dependencies",
            likec4_level=1,
            margin="0.223,0.223",
            width=4.445];
        tasks [color="#0369a1",
            fillcolor="#0284c7",
            fontcolor="#f0f9ff",
            group=durable,
            height=2.389,
            label=<<TABLE BORDER="0" CELLPADDING="0" CELLSPACING="4"><TR><TD><FONT POINT-SIZE="20">Opportunity Tasks</FONT></TD></TR><TR><TD><FONT POINT-SIZE="15" COLOR="#B6ECF7">Executable work. Fields: Task, Project,<BR/>Status, Duration, Money Priority,<BR/>Work Date, Shift, Link, Notes.<BR/>Status contract: Queued, Today, In Motion,<BR/>Waiting, Done, Parked.</FONT></TD></TR></TABLE>>,
            likec4_id="durable.tasks",
            likec4_level=1,
            margin="0.278,0.223",
            width=4.445];
        taskviews [group=durable,
            height=2.5,
            label=<<TABLE BORDER="0" CELLPADDING="0" CELLSPACING="4"><TR><TD><FONT POINT-SIZE="20">Task Views</FONT></TD></TR><TR><TD><FONT POINT-SIZE="15" COLOR="#bfdbfe">Views over Opportunity Tasks: Focus Board,<BR/>Daily Blocks, Work Calendar,<BR/>Applications, Freelance, Singleton, and<BR/>Portfolio. These are lenses, not sources<BR/>of truth.</FONT></TD></TR></TABLE>>,
            likec4_id="durable.taskViews",
            likec4_level=1,
            margin="0.278,0.306",
            width=4.445];
    }
    subgraph cluster_publishing {
        graph [color="#2d333d",
            fillcolor="#3e4651",
            label=<<FONT POINT-SIZE="11" COLOR="#cbd5e1b3"><B>PUBLISHING SURFACES</B></FONT>>,
            likec4_depth=1,
            likec4_id=publishing,
            likec4_level=0,
            margin=40,
            style=filled
        ];
        website [height=2.5,
            label=<<TABLE BORDER="0" CELLPADDING="0" CELLSPACING="4"><TR><TD><FONT POINT-SIZE="20">Singleton Website</FONT></TD></TR><TR><TD><FONT POINT-SIZE="15" COLOR="#bfdbfe">Public proof and offer surface. Pulls from<BR/>packaged proof and clear offer<BR/>work, not from raw capture.</FONT></TD></TR></TABLE>>,
            likec4_id="publishing.website",
            likec4_level=1,
            margin="0.278,0.306",
            width=4.445];
        proposals [color="#7E451D",
            fillcolor="#A35829",
            fontcolor="#FFE0C2",
            height=2.5,
            label=<<TABLE BORDER="0" CELLPADDING="0" CELLSPACING="4"><TR><TD><FONT POINT-SIZE="20">Applications / Proposals</FONT></TD></TR><TR><TD><FONT POINT-SIZE="15" COLOR="#f9b27c">Outbound artifacts: job applications, Upwork<BR/>proposals, direct outreach,<BR/>cover notes, and follow-ups. Their state<BR/>returns to Opportunity HQ.</FONT></TD></TR></TABLE>>,
            likec4_id="publishing.proposals",
            likec4_level=1,
            margin="0.223,0.223",
            width=4.445];
    }
    operator [color="#7E451D",
        fillcolor="#A35829",
        fontcolor="#FFE0C2",
        height=2.5,
        label=<<TABLE BORDER="0" CELLPADDING="0" CELLSPACING="4"><TR><TD><FONT POINT-SIZE="20">Operator</FONT></TD></TR><TR><TD><FONT POINT-SIZE="15" COLOR="#f9b27c">The working user. Uses mobile, desktop,<BR/>Raycast, Codex, Notion, Bear, and<BR/>Eagle to move job search, Upwork, Singleton<BR/>offer, and proof work without<BR/>repeatedly deciding where each item belongs.</FONT></TD></TR></TABLE>>,
        likec4_id=operator,
        likec4_level=0,
        margin="0.223,0.223",
        width=4.445];
    operator -> bear [arrowhead=normal,
        label=<<TABLE BORDER="0" CELLPADDING="3" CELLSPACING="0" BGCOLOR="#18191BA0"><TR><TD ALIGN="TEXT" BALIGN="LEFT"><FONT POINT-SIZE="14">capture</FONT></TD></TR></TABLE>>,
        likec4_id="12cjz4k",
        style=dashed,
        weight=2];
    operator -> mobileform [arrowhead=normal,
        label=<<TABLE BORDER="0" CELLPADDING="3" CELLSPACING="0" BGCOLOR="#18191BA0"><TR><TD ALIGN="TEXT" BALIGN="LEFT"><FONT POINT-SIZE="14">log</FONT></TD></TR></TABLE>>,
        likec4_id=tdf01i,
        style=dashed,
        weight=2];
    logtask [height=2.5,
        label=<<TABLE BORDER="0" CELLPADDING="0" CELLSPACING="4"><TR><TD><FONT POINT-SIZE="20">Log Task</FONT></TD></TR><TR><TD><FONT POINT-SIZE="15" COLOR="#bfdbfe">Create an Opportunity Task from selected<BR/>text, clipboard link, manual<BR/>form input, or mobile/share context. Default<BR/>Status: Queued.</FONT></TD></TR></TABLE>>,
        likec4_id="actions.logTask",
        likec4_level=0,
        margin="0.223,0.223",
        width=4.445];
    updatetask [height=2.5,
        label=<<TABLE BORDER="0" CELLPADDING="0" CELLSPACING="4"><TR><TD><FONT POINT-SIZE="20">Update Task</FONT></TD></TR><TR><TD><FONT POINT-SIZE="15" COLOR="#bfdbfe">Update Status, Money Priority, Project, Link,<BR/>or Notes<BR/>on an existing Opportunity Task.</FONT></TD></TR></TABLE>>,
        likec4_id="actions.updateTask",
        likec4_level=0,
        margin="0.223,0.223",
        width=4.445];
    logtask -> updatetask [style=invis];
    searchrun [height=2.5,
        label=<<TABLE BORDER="0" CELLPADDING="0" CELLSPACING="4"><TR><TD><FONT POINT-SIZE="20">Opportunity Search Run</FONT></TD></TR><TR><TD><FONT POINT-SIZE="15" COLOR="#bfdbfe">Codex-owned manual workflow. Search current<BR/>jobs or leads, return winners<BR/>for approval, then log approved tasks to<BR/>Opportunity HQ.</FONT></TD></TR></TABLE>>,
        likec4_id="actions.searchRun",
        likec4_level=0,
        margin="0.223,0.223",
        width=4.445];
    updatetask -> searchrun [style=invis];
    exportblocks [height=2.5,
        label=<<TABLE BORDER="0" CELLPADDING="0" CELLSPACING="4"><TR><TD><FONT POINT-SIZE="20">Export Focus Blocks</FONT></TD></TR><TR><TD><FONT POINT-SIZE="15" COLOR="#bfdbfe">Codex-owned manual workflow. Read approved<BR/>Opportunity Tasks, build 3-5<BR/>realistic time blocks, export .ics, and ask<BR/>before Notion updates.</FONT></TD></TR></TABLE>>,
        likec4_id="actions.exportBlocks",
        likec4_level=0,
        margin="0.223,0.223",
        width=4.445];
    searchrun -> exportblocks [style=invis];
    goalcheckin [height=2.5,
        label=<<TABLE BORDER="0" CELLPADDING="0" CELLSPACING="4"><TR><TD><FONT POINT-SIZE="20">Goal Check-In</FONT></TD></TR><TR><TD><FONT POINT-SIZE="15" COLOR="#bfdbfe">Future small command. Ask count/result<BR/>questions for applications,<BR/>freelance proposals, Strategic work, and real<BR/>blockers. Output one or two<BR/>daily implications, not a full plan or new</FONT></TD></TR></TABLE>>,
        likec4_id="actions.goalCheckIn",
        likec4_level=0,
        margin="0.223,0.223",
        width=4.445];
    startapplication [height=2.5,
        label=<<TABLE BORDER="0" CELLPADDING="0" CELLSPACING="4"><TR><TD><FONT POINT-SIZE="20">Start Application</FONT></TD></TR><TR><TD><FONT POINT-SIZE="15" COLOR="#bfdbfe">Open a job link and resume path from the<BR/>selected task. Move the task to<BR/>In Motion while work is active.</FONT></TD></TR></TABLE>>,
        likec4_id="actions.startApplication",
        likec4_level=0,
        margin="0.223,0.223",
        width=4.445];
    goalcheckin -> startapplication [style=invis];
    draftproposal [height=2.5,
        label=<<TABLE BORDER="0" CELLPADDING="0" CELLSPACING="4"><TR><TD><FONT POINT-SIZE="20">Draft Proposal</FONT></TD></TR><TR><TD><FONT POINT-SIZE="15" COLOR="#bfdbfe">Turn a copied Upwork post into a proposal<BR/>draft and log the follow-up<BR/>state back to Opportunity HQ.</FONT></TD></TR></TABLE>>,
        likec4_id="actions.draftProposal",
        likec4_level=0,
        margin="0.223,0.223",
        width=4.445];
    startapplication -> draftproposal [style=invis];
    captureportfolio [height=2.5,
        label=<<TABLE BORDER="0" CELLPADDING="0" CELLSPACING="4"><TR><TD><FONT POINT-SIZE="20">Capture Portfolio</FONT></TD></TR><TR><TD><FONT POINT-SIZE="15" COLOR="#bfdbfe">Import the selected asset to Eagle, append an<BR/>Added to Eagle note to the<BR/>selected Portfolio task, then mark that task<BR/>Done.</FONT></TD></TR></TABLE>>,
        likec4_id="actions.capturePortfolio",
        likec4_level=0,
        margin="0.223,0.223",
        width=4.445];
    draftproposal -> captureportfolio [style=invis];
    portfoliostore [color="#2d5d39",
        fillcolor="#428a4f",
        fontcolor="#f8fafc",
        height=2.5,
        label=<<TABLE BORDER="0" CELLPADDING="0" CELLSPACING="4"><TR><TD><FONT POINT-SIZE="20">Eagle Portfolio Library</FONT></TD></TR><TR><TD><FONT POINT-SIZE="15" COLOR="#c2f0c2">Portfolio/evidence store. Holds screenshots,<BR/>videos, PDFs, reels, examples, and proof<BR/>assets. Eagle does not own task status;<BR/>Opportunity HQ does.</FONT></TD></TR></TABLE>>,
        likec4_id=portfolioStore,
        likec4_level=0,
        margin="0.223,0",
        penwidth=2,
        shape=cylinder,
        width=4.445];
    portfoliostore -> tasks [arrowhead=normal,
        label=<<TABLE BORDER="0" CELLPADDING="3" CELLSPACING="0" BGCOLOR="#18191BA0"><TR><TD ALIGN="TEXT" BALIGN="LEFT"><FONT POINT-SIZE="14">attach</FONT></TD></TR></TABLE>>,
        likec4_id="143grhy",
        minlen=1,
        style=dashed,
        weight=2];
    bear -> tasks [arrowhead=normal,
        label=<<TABLE BORDER="0" CELLPADDING="3" CELLSPACING="0" BGCOLOR="#18191BA0"><TR><TD ALIGN="TEXT" BALIGN="LEFT"><FONT POINT-SIZE="14">promote</FONT></TD></TR></TABLE>>,
        likec4_id="11sadrh",
        style=dashed];
    mobileform -> tasks [arrowhead=normal,
        label=<<TABLE BORDER="0" CELLPADDING="3" CELLSPACING="0" BGCOLOR="#18191BA0"><TR><TD ALIGN="TEXT" BALIGN="LEFT"><FONT POINT-SIZE="14">create</FONT></TD></TR></TABLE>>,
        likec4_id=upzln3,
        style=dashed];
    projects -> tasks [arrowhead=normal,
        label=<<TABLE BORDER="0" CELLPADDING="3" CELLSPACING="0" BGCOLOR="#18191BA0"><TR><TD ALIGN="TEXT" BALIGN="LEFT"><FONT POINT-SIZE="14">group</FONT></TD></TR></TABLE>>,
        likec4_id="1ol3brm",
        minlen=1,
        style=dashed,
        weight=3];
    dependencies -> tasks [arrowhead=normal,
        label=<<TABLE BORDER="0" CELLPADDING="3" CELLSPACING="0" BGCOLOR="#18191BA0"><TR><TD ALIGN="TEXT" BALIGN="LEFT"><FONT POINT-SIZE="14">block</FONT></TD></TR></TABLE>>,
        likec4_id="1g17l6l",
        minlen=1,
        style=dashed,
        weight=3];
    tasks -> taskviews [arrowhead=normal,
        label=<<TABLE BORDER="0" CELLPADDING="3" CELLSPACING="0" BGCOLOR="#18191BA0"><TR><TD ALIGN="TEXT" BALIGN="LEFT"><FONT POINT-SIZE="14">render</FONT></TD></TR></TABLE>>,
        likec4_id=x3g4vb,
        minlen=1,
        style=dashed,
        weight=3];
    tasks -> website [arrowhead=normal,
        label=<<TABLE BORDER="0" CELLPADDING="3" CELLSPACING="0" BGCOLOR="#18191BA0"><TR><TD ALIGN="TEXT" BALIGN="LEFT"><FONT POINT-SIZE="14">package</FONT></TD></TR></TABLE>>,
        likec4_id="2jmqin",
        minlen=1,
        style=dashed];
    tasks -> proposals [arrowhead=normal,
        label=<<TABLE BORDER="0" CELLPADDING="3" CELLSPACING="0" BGCOLOR="#18191BA0"><TR><TD ALIGN="TEXT" BALIGN="LEFT"><FONT POINT-SIZE="14">submit</FONT></TD></TR></TABLE>>,
        likec4_id="14bvfx7",
        style=dashed];
    proposals -> tasks [arrowhead=normal,
        label=<<TABLE BORDER="0" CELLPADDING="3" CELLSPACING="0" BGCOLOR="#18191BA0"><TR><TD ALIGN="TEXT" BALIGN="LEFT"><FONT POINT-SIZE="14">update</FONT></TD></TR></TABLE>>,
        likec4_id=hiwiij,
        style=dashed];
}
`;case`opportunity_hq_intake_contract`:return`digraph {
    graph [TBbalance=min,
        bgcolor=transparent,
        compound=true,
        fontname=Arial,
        fontsize=20,
        labeljust=l,
        labelloc=t,
        layout=dot,
        likec4_viewId=opportunity_hq_intake_contract,
        nodesep=1.528,
        outputorder=nodesfirst,
        pad=0.209,
        rankdir=TB,
        ranksep=1.667,
        splines=spline
    ];
    node [color="#2563eb",
        fillcolor="#3b82f6",
        fontcolor="#eff6ff",
        fontname=Arial,
        label="\\N",
        penwidth=0,
        shape=rect,
        style=filled
    ];
    edge [arrowsize=0.75,
        color="#8D8D8D",
        fontcolor="#C9C9C9",
        fontname=Arial,
        fontsize=14,
        penwidth=2,
        style=""
    ];
    subgraph cluster_capture {
        graph [color="#2d333d",
            fillcolor="#3e4651",
            label=<<FONT POINT-SIZE="11" COLOR="#cbd5e1b3"><B>CAPTURE SURFACES</B></FONT>>,
            likec4_depth=1,
            likec4_id=capture,
            likec4_level=0,
            margin=40,
            style=filled
        ];
        bear [color="#853A2D",
            fillcolor="#AC4D39",
            fontcolor="#FBD3CB",
            height=2.5,
            label=<<TABLE BORDER="0" CELLPADDING="0" CELLSPACING="4"><TR><TD><FONT POINT-SIZE="20">Bear Inbox</FONT></TD></TR><TR><TD><FONT POINT-SIZE="15" COLOR="#f5b2a3">Raw capture only. Use for unclear thoughts,<BR/>offload notes, passive<BR/>shortcut ideas, and anything that is not yet<BR/>a real task. Promote only<BR/>when the item has money weight, deadline,</FONT></TD></TR></TABLE>>,
            likec4_id="capture.bear",
            likec4_level=1,
            margin="0.223,0.223",
            width=4.445];
        mobileform [height=2.5,
            label=<<TABLE BORDER="0" CELLPADDING="0" CELLSPACING="4"><TR><TD><FONT POINT-SIZE="20">Mobile Task Form</FONT></TD></TR><TR><TD><FONT POINT-SIZE="15" COLOR="#bfdbfe">Fast durable capture path for task-shaped<BR/>work. Minimum fields: Task,<BR/>Project, Duration, and Link/Notes. Default<BR/>Status should be Queued.</FONT></TD></TR></TABLE>>,
            likec4_id="capture.mobileForm",
            likec4_level=1,
            margin="0.278,0.306",
            width=4.445];
    }
    subgraph cluster_durable {
        graph [color="#2d333d",
            fillcolor="#3e4651",
            label=<<FONT POINT-SIZE="11" COLOR="#cbd5e1b3"><B>OPPORTUNITY HQ</B></FONT>>,
            likec4_depth=1,
            likec4_id=durable,
            likec4_level=0,
            margin=40,
            style=filled
        ];
        dependencies [color="#475569",
            fillcolor="#64748b",
            fontcolor="#f8fafc",
            group=durable,
            height=2.5,
            label=<<TABLE BORDER="0" CELLPADDING="0" CELLSPACING="4"><TR><TD><FONT POINT-SIZE="20">Dependencies</FONT></TD></TR><TR><TD><FONT POINT-SIZE="15" COLOR="#cbd5e1">Real blockers only: application work can<BR/>depend on resume/snippet prep;<BR/>website request flow depends on Tally and<BR/>Notion intake; offer traction<BR/>depends on website, proof, outreach, and a</FONT></TD></TR></TABLE>>,
            likec4_id="durable.dependencies",
            likec4_level=1,
            margin="0.223,0.223",
            width=4.445];
        tasks [color="#0369a1",
            fillcolor="#0284c7",
            fontcolor="#f0f9ff",
            group=durable,
            height=2.389,
            label=<<TABLE BORDER="0" CELLPADDING="0" CELLSPACING="4"><TR><TD><FONT POINT-SIZE="20">Opportunity Tasks</FONT></TD></TR><TR><TD><FONT POINT-SIZE="15" COLOR="#B6ECF7">Executable work. Fields: Task, Project,<BR/>Status, Duration, Money Priority,<BR/>Work Date, Shift, Link, Notes.<BR/>Status contract: Queued, Today, In Motion,<BR/>Waiting, Done, Parked.</FONT></TD></TR></TABLE>>,
            likec4_id="durable.tasks",
            likec4_level=1,
            margin="0.278,0.223",
            width=4.445];
        taskviews [group=durable,
            height=2.5,
            label=<<TABLE BORDER="0" CELLPADDING="0" CELLSPACING="4"><TR><TD><FONT POINT-SIZE="20">Task Views</FONT></TD></TR><TR><TD><FONT POINT-SIZE="15" COLOR="#bfdbfe">Views over Opportunity Tasks: Focus Board,<BR/>Daily Blocks, Work Calendar,<BR/>Applications, Freelance, Singleton, and<BR/>Portfolio. These are lenses, not sources<BR/>of truth.</FONT></TD></TR></TABLE>>,
            likec4_id="durable.taskViews",
            likec4_level=1,
            margin="0.278,0.306",
            width=4.445];
    }
    operator [color="#7E451D",
        fillcolor="#A35829",
        fontcolor="#FFE0C2",
        height=2.5,
        label=<<TABLE BORDER="0" CELLPADDING="0" CELLSPACING="4"><TR><TD><FONT POINT-SIZE="20">Operator</FONT></TD></TR><TR><TD><FONT POINT-SIZE="15" COLOR="#f9b27c">The working user. Uses mobile, desktop,<BR/>Raycast, Codex, Notion, Bear, and<BR/>Eagle to move job search, Upwork, Singleton<BR/>offer, and proof work without<BR/>repeatedly deciding where each item belongs.</FONT></TD></TR></TABLE>>,
        likec4_id=operator,
        likec4_level=0,
        margin="0.223,0.223",
        width=4.445];
    operator -> bear [arrowhead=normal,
        label=<<TABLE BORDER="0" CELLPADDING="3" CELLSPACING="0" BGCOLOR="#18191BA0"><TR><TD ALIGN="TEXT" BALIGN="LEFT"><FONT POINT-SIZE="14">capture</FONT></TD></TR></TABLE>>,
        likec4_id="12cjz4k",
        style=dashed,
        weight=2];
    operator -> mobileform [arrowhead=normal,
        label=<<TABLE BORDER="0" CELLPADDING="3" CELLSPACING="0" BGCOLOR="#18191BA0"><TR><TD ALIGN="TEXT" BALIGN="LEFT"><FONT POINT-SIZE="14">log</FONT></TD></TR></TABLE>>,
        likec4_id=tdf01i,
        style=dashed,
        weight=2];
    bear -> tasks [arrowhead=normal,
        label=<<TABLE BORDER="0" CELLPADDING="3" CELLSPACING="0" BGCOLOR="#18191BA0"><TR><TD ALIGN="TEXT" BALIGN="LEFT"><FONT POINT-SIZE="14">promote</FONT></TD></TR></TABLE>>,
        likec4_id="11sadrh",
        style=dashed];
    mobileform -> tasks [arrowhead=normal,
        label=<<TABLE BORDER="0" CELLPADDING="3" CELLSPACING="0" BGCOLOR="#18191BA0"><TR><TD ALIGN="TEXT" BALIGN="LEFT"><FONT POINT-SIZE="14">create</FONT></TD></TR></TABLE>>,
        likec4_id=upzln3,
        style=dashed];
    logtask [height=2.5,
        label=<<TABLE BORDER="0" CELLPADDING="0" CELLSPACING="4"><TR><TD><FONT POINT-SIZE="20">Log Task</FONT></TD></TR><TR><TD><FONT POINT-SIZE="15" COLOR="#bfdbfe">Create an Opportunity Task from selected<BR/>text, clipboard link, manual<BR/>form input, or mobile/share context. Default<BR/>Status: Queued.</FONT></TD></TR></TABLE>>,
        likec4_id="actions.logTask",
        likec4_level=0,
        margin="0.223,0.223",
        width=4.445];
    updatetask [height=2.5,
        label=<<TABLE BORDER="0" CELLPADDING="0" CELLSPACING="4"><TR><TD><FONT POINT-SIZE="20">Update Task</FONT></TD></TR><TR><TD><FONT POINT-SIZE="15" COLOR="#bfdbfe">Update Status, Money Priority, Project, Link,<BR/>or Notes<BR/>on an existing Opportunity Task.</FONT></TD></TR></TABLE>>,
        likec4_id="actions.updateTask",
        likec4_level=0,
        margin="0.223,0.223",
        width=4.445];
    logtask -> updatetask [style=invis];
    searchrun [height=2.5,
        label=<<TABLE BORDER="0" CELLPADDING="0" CELLSPACING="4"><TR><TD><FONT POINT-SIZE="20">Opportunity Search Run</FONT></TD></TR><TR><TD><FONT POINT-SIZE="15" COLOR="#bfdbfe">Codex-owned manual workflow. Search current<BR/>jobs or leads, return winners<BR/>for approval, then log approved tasks to<BR/>Opportunity HQ.</FONT></TD></TR></TABLE>>,
        likec4_id="actions.searchRun",
        likec4_level=0,
        margin="0.223,0.223",
        width=4.445];
    updatetask -> searchrun [style=invis];
    exportblocks [height=2.5,
        label=<<TABLE BORDER="0" CELLPADDING="0" CELLSPACING="4"><TR><TD><FONT POINT-SIZE="20">Export Focus Blocks</FONT></TD></TR><TR><TD><FONT POINT-SIZE="15" COLOR="#bfdbfe">Codex-owned manual workflow. Read approved<BR/>Opportunity Tasks, build 3-5<BR/>realistic time blocks, export .ics, and ask<BR/>before Notion updates.</FONT></TD></TR></TABLE>>,
        likec4_id="actions.exportBlocks",
        likec4_level=0,
        margin="0.223,0.223",
        width=4.445];
    searchrun -> exportblocks [style=invis];
    goalcheckin [height=2.5,
        label=<<TABLE BORDER="0" CELLPADDING="0" CELLSPACING="4"><TR><TD><FONT POINT-SIZE="20">Goal Check-In</FONT></TD></TR><TR><TD><FONT POINT-SIZE="15" COLOR="#bfdbfe">Future small command. Ask count/result<BR/>questions for applications,<BR/>freelance proposals, Strategic work, and real<BR/>blockers. Output one or two<BR/>daily implications, not a full plan or new</FONT></TD></TR></TABLE>>,
        likec4_id="actions.goalCheckIn",
        likec4_level=0,
        margin="0.223,0.223",
        width=4.445];
    dependencies -> tasks [arrowhead=normal,
        label=<<TABLE BORDER="0" CELLPADDING="3" CELLSPACING="0" BGCOLOR="#18191BA0"><TR><TD ALIGN="TEXT" BALIGN="LEFT"><FONT POINT-SIZE="14">block</FONT></TD></TR></TABLE>>,
        likec4_id="1g17l6l",
        minlen=1,
        style=dashed,
        weight=3];
    tasks -> taskviews [arrowhead=normal,
        label=<<TABLE BORDER="0" CELLPADDING="3" CELLSPACING="0" BGCOLOR="#18191BA0"><TR><TD ALIGN="TEXT" BALIGN="LEFT"><FONT POINT-SIZE="14">render</FONT></TD></TR></TABLE>>,
        likec4_id=x3g4vb,
        minlen=1,
        style=dashed,
        weight=3];
}
`;case`proof_capture_flow`:return`digraph {
    graph [TBbalance=min,
        bgcolor=transparent,
        compound=true,
        fontname=Arial,
        fontsize=20,
        labeljust=l,
        labelloc=t,
        layout=dot,
        likec4_viewId=proof_capture_flow,
        nodesep=1.528,
        outputorder=nodesfirst,
        pad=0.209,
        rankdir=TB,
        ranksep=1.667,
        splines=spline
    ];
    node [color="#2563eb",
        fillcolor="#3b82f6",
        fontcolor="#eff6ff",
        fontname=Arial,
        label="\\N",
        penwidth=0,
        shape=rect,
        style=filled
    ];
    edge [arrowsize=0.75,
        color="#8D8D8D",
        fontcolor="#C9C9C9",
        fontname=Arial,
        fontsize=14,
        penwidth=2,
        style=""
    ];
    subgraph cluster_durable {
        graph [color="#2d333d",
            fillcolor="#3e4651",
            label=<<FONT POINT-SIZE="11" COLOR="#cbd5e1b3"><B>OPPORTUNITY HQ</B></FONT>>,
            likec4_depth=1,
            likec4_id=durable,
            likec4_level=0,
            margin=40,
            style=filled
        ];
        projects [color="#0369a1",
            fillcolor="#0284c7",
            fontcolor="#f0f9ff",
            height=2.5,
            label=<<TABLE BORDER="0" CELLPADDING="0" CELLSPACING="4"><TR><TD><FONT POINT-SIZE="20">Opportunity Projects</FONT></TD></TR><TR><TD><FONT POINT-SIZE="15" COLOR="#B6ECF7">Durable project lanes: Cash Jobs, Career<BR/>Jobs, Freelance, Offer, Portfolio.<BR/>Finishable deliverables belong as tasks/goals<BR/>under these rows.</FONT></TD></TR></TABLE>>,
            likec4_id="durable.projects",
            likec4_level=1,
            margin="0.223,0",
            penwidth=2,
            shape=cylinder,
            width=4.445];
        tasks [color="#0369a1",
            fillcolor="#0284c7",
            fontcolor="#f0f9ff",
            height=2.389,
            label=<<TABLE BORDER="0" CELLPADDING="0" CELLSPACING="4"><TR><TD><FONT POINT-SIZE="20">Opportunity Tasks</FONT></TD></TR><TR><TD><FONT POINT-SIZE="15" COLOR="#B6ECF7">Executable work. Fields: Task, Project,<BR/>Status, Duration, Money Priority,<BR/>Work Date, Shift, Link, Notes.<BR/>Status contract: Queued, Today, In Motion,<BR/>Waiting, Done, Parked.</FONT></TD></TR></TABLE>>,
            likec4_id="durable.tasks",
            likec4_level=1,
            margin="0.278,0.223",
            width=4.445];
    }
    subgraph cluster_publishing {
        graph [color="#2d333d",
            fillcolor="#3e4651",
            label=<<FONT POINT-SIZE="11" COLOR="#cbd5e1b3"><B>PUBLISHING SURFACES</B></FONT>>,
            likec4_depth=1,
            likec4_id=publishing,
            likec4_level=0,
            margin=40,
            style=filled
        ];
        website [color="#2d5d39",
            fillcolor="#428a4f",
            fontcolor="#f8fafc",
            height=2.5,
            label=<<TABLE BORDER="0" CELLPADDING="0" CELLSPACING="4"><TR><TD><FONT POINT-SIZE="20">Singleton Website</FONT></TD></TR><TR><TD><FONT POINT-SIZE="15" COLOR="#c2f0c2">Public proof and offer surface. Pulls from<BR/>packaged proof and clear offer<BR/>work, not from raw capture.</FONT></TD></TR></TABLE>>,
            likec4_id="publishing.website",
            likec4_level=1,
            margin="0.278,0.306",
            width=4.445];
        proposals [color="#7E451D",
            fillcolor="#A35829",
            fontcolor="#FFE0C2",
            height=2.5,
            label=<<TABLE BORDER="0" CELLPADDING="0" CELLSPACING="4"><TR><TD><FONT POINT-SIZE="20">Applications / Proposals</FONT></TD></TR><TR><TD><FONT POINT-SIZE="15" COLOR="#f9b27c">Outbound artifacts: job applications, Upwork<BR/>proposals, direct outreach,<BR/>cover notes, and follow-ups. Their state<BR/>returns to Opportunity HQ.</FONT></TD></TR></TABLE>>,
            likec4_id="publishing.proposals",
            likec4_level=1,
            margin="0.223,0.223",
            width=4.445];
    }
    operator [color="#7E451D",
        fillcolor="#A35829",
        fontcolor="#FFE0C2",
        height=2.5,
        label=<<TABLE BORDER="0" CELLPADDING="0" CELLSPACING="4"><TR><TD><FONT POINT-SIZE="20">Operator</FONT></TD></TR><TR><TD><FONT POINT-SIZE="15" COLOR="#f9b27c">The working user. Uses mobile, desktop,<BR/>Raycast, Codex, Notion, Bear, and<BR/>Eagle to move job search, Upwork, Singleton<BR/>offer, and proof work without<BR/>repeatedly deciding where each item belongs.</FONT></TD></TR></TABLE>>,
        likec4_id=operator,
        likec4_level=0,
        margin="0.223,0.223",
        width=4.445];
    captureportfolio [height=2.5,
        label=<<TABLE BORDER="0" CELLPADDING="0" CELLSPACING="4"><TR><TD><FONT POINT-SIZE="20">Capture Portfolio</FONT></TD></TR><TR><TD><FONT POINT-SIZE="15" COLOR="#bfdbfe">Import the selected asset to Eagle, append an<BR/>Added to Eagle note to the<BR/>selected Portfolio task, then mark that task<BR/>Done.</FONT></TD></TR></TABLE>>,
        likec4_id="actions.capturePortfolio",
        likec4_level=0,
        margin="0.223,0.223",
        width=4.445];
    operator -> captureportfolio [style=invis];
    portfoliostore [color="#2d5d39",
        fillcolor="#428a4f",
        fontcolor="#f8fafc",
        height=2.5,
        label=<<TABLE BORDER="0" CELLPADDING="0" CELLSPACING="4"><TR><TD><FONT POINT-SIZE="20">Eagle Portfolio Library</FONT></TD></TR><TR><TD><FONT POINT-SIZE="15" COLOR="#c2f0c2">Portfolio/evidence store. Holds screenshots,<BR/>videos, PDFs, reels, examples, and proof<BR/>assets. Eagle does not own task status;<BR/>Opportunity HQ does.</FONT></TD></TR></TABLE>>,
        likec4_id=portfolioStore,
        likec4_level=0,
        margin="0.223,0",
        penwidth=2,
        shape=cylinder,
        width=4.445];
    portfoliostore -> tasks [arrowhead=normal,
        label=<<TABLE BORDER="0" CELLPADDING="3" CELLSPACING="0" BGCOLOR="#18191BA0"><TR><TD ALIGN="TEXT" BALIGN="LEFT"><FONT POINT-SIZE="14">attach</FONT></TD></TR></TABLE>>,
        likec4_id="143grhy",
        minlen=1,
        style=dashed,
        weight=2];
    projects -> tasks [arrowhead=normal,
        label=<<TABLE BORDER="0" CELLPADDING="3" CELLSPACING="0" BGCOLOR="#18191BA0"><TR><TD ALIGN="TEXT" BALIGN="LEFT"><FONT POINT-SIZE="14">group</FONT></TD></TR></TABLE>>,
        likec4_id="1ol3brm",
        minlen=0,
        style=dashed,
        weight=3];
    tasks -> website [arrowhead=normal,
        label=<<TABLE BORDER="0" CELLPADDING="3" CELLSPACING="0" BGCOLOR="#18191BA0"><TR><TD ALIGN="TEXT" BALIGN="LEFT"><FONT POINT-SIZE="14">package</FONT></TD></TR></TABLE>>,
        likec4_id="2jmqin",
        minlen=1,
        style=dashed];
    tasks -> proposals [arrowhead=normal,
        label=<<TABLE BORDER="0" CELLPADDING="3" CELLSPACING="0" BGCOLOR="#18191BA0"><TR><TD ALIGN="TEXT" BALIGN="LEFT"><FONT POINT-SIZE="14">submit</FONT></TD></TR></TABLE>>,
        likec4_id="14bvfx7",
        style=dashed];
    proposals -> tasks [arrowhead=normal,
        label=<<TABLE BORDER="0" CELLPADDING="3" CELLSPACING="0" BGCOLOR="#18191BA0"><TR><TD ALIGN="TEXT" BALIGN="LEFT"><FONT POINT-SIZE="14">update</FONT></TD></TR></TABLE>>,
        likec4_id=hiwiij,
        style=dashed];
}
`;default:throw Error(`Unknown viewId: `+e)}},t=e=>{switch(e){case`index`:return`<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN"
 "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<!-- Generated by graphviz version 14.1.5 (0)
 -->
<!-- Pages: 1 -->
<svg width="1015pt" height="1501pt"
 viewBox="0.00 0.00 1015.00 1501.00" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
<g id="graph0" class="graph" transform="scale(1 1) rotate(0) translate(15.05 1486.25)">
<!-- operator -->
<g id="node1" class="node">
<title>operator</title>
<polygon fill="#3b82f6" stroke="#2563eb" stroke-width="0" points="902.03,-1471.2 556.73,-1471.2 556.73,-1291.2 902.03,-1291.2 902.03,-1471.2"/>
<text xml:space="preserve" text-anchor="start" x="689.92" y="-1420.2" font-family="Arial" font-size="20.00" fill="#eff6ff">Operator</text>
<text xml:space="preserve" text-anchor="start" x="593.9" y="-1397.2" font-family="Arial" font-size="15.00" fill="#bfdbfe">The working user. Uses mobile, desktop,</text>
<text xml:space="preserve" text-anchor="start" x="613.9" y="-1379.2" font-family="Arial" font-size="15.00" fill="#bfdbfe">Raycast, Codex, Notion, Bear, and</text>
<text xml:space="preserve" text-anchor="start" x="579.72" y="-1361.2" font-family="Arial" font-size="15.00" fill="#bfdbfe">Eagle to move job search, Upwork, Singleton</text>
<text xml:space="preserve" text-anchor="start" x="634.75" y="-1343.2" font-family="Arial" font-size="15.00" fill="#bfdbfe">offer, and proof work without</text>
<text xml:space="preserve" text-anchor="start" x="576.78" y="-1325.2" font-family="Arial" font-size="15.00" fill="#bfdbfe">repeatedly deciding where each item belongs.</text>
</g>
<!-- capture -->
<g id="node2" class="node">
<title>capture</title>
<polygon fill="#3b82f6" stroke="#2563eb" stroke-width="0" points="726.4,-1148.4 406.36,-1148.4 406.36,-968.4 726.4,-968.4 726.4,-1148.4"/>
<text xml:space="preserve" text-anchor="start" x="488.56" y="-1050.4" font-family="Arial" font-size="20.00" fill="#eff6ff">Capture Surfaces</text>
</g>
<!-- actions -->
<g id="node3" class="node">
<title>actions</title>
<polygon fill="#3b82f6" stroke="#2563eb" stroke-width="0" points="985.4,-502.8 665.36,-502.8 665.36,-322.8 985.4,-322.8 985.4,-502.8"/>
<text xml:space="preserve" text-anchor="start" x="716.44" y="-433.8" font-family="Arial" font-size="20.00" fill="#eff6ff">Raycast / Codex Actions</text>
<text xml:space="preserve" text-anchor="start" x="693.64" y="-410.8" font-family="Arial" font-size="15.00" fill="#bfdbfe">Action layer. It creates, updates, opens,</text>
<text xml:space="preserve" text-anchor="start" x="751.17" y="-392.8" font-family="Arial" font-size="15.00" fill="#bfdbfe">drafts, and attaches. It</text>
<text xml:space="preserve" text-anchor="start" x="695.71" y="-374.8" font-family="Arial" font-size="15.00" fill="#bfdbfe">should not invent a second task model.</text>
</g>
<!-- portfoliostore -->
<g id="node4" class="node">
<title>portfoliostore</title>
<polygon fill="#3b82f6" stroke="#2563eb" stroke-width="0" points="332.76,-180 0,-180 0,0 332.76,0 332.76,-180"/>
<text xml:space="preserve" text-anchor="start" x="68" y="-120" font-family="Arial" font-size="20.00" fill="#eff6ff">Eagle Portfolio Library</text>
<text xml:space="preserve" text-anchor="start" x="20.06" y="-97" font-family="Arial" font-size="15.00" fill="#bfdbfe">Portfolio/evidence store. Holds screenshots,</text>
<text xml:space="preserve" text-anchor="start" x="29.23" y="-79" font-family="Arial" font-size="15.00" fill="#bfdbfe">videos, PDFs, reels, examples, and proof</text>
<text xml:space="preserve" text-anchor="start" x="34.64" y="-61" font-family="Arial" font-size="15.00" fill="#bfdbfe">assets. Eagle does not own task status;</text>
<text xml:space="preserve" text-anchor="start" x="93.84" y="-43" font-family="Arial" font-size="15.00" fill="#bfdbfe">Opportunity HQ does.</text>
</g>
<!-- durable -->
<g id="node5" class="node">
<title>durable</title>
<polygon fill="#3b82f6" stroke="#2563eb" stroke-width="0" points="655.4,-825.6 335.36,-825.6 335.36,-645.6 655.4,-645.6 655.4,-825.6"/>
<text xml:space="preserve" text-anchor="start" x="425.91" y="-774.6" font-family="Arial" font-size="20.00" fill="#eff6ff">Opportunity HQ</text>
<text xml:space="preserve" text-anchor="start" x="363.65" y="-751.6" font-family="Arial" font-size="15.00" fill="#bfdbfe">Notion is durable truth. It owns projects,</text>
<text xml:space="preserve" text-anchor="start" x="386.16" y="-733.6" font-family="Arial" font-size="15.00" fill="#bfdbfe">tasks, status, duration estimates,</text>
<text xml:space="preserve" text-anchor="start" x="361.99" y="-715.6" font-family="Arial" font-size="15.00" fill="#bfdbfe">daily work shifts, links, and notes. Views</text>
<text xml:space="preserve" text-anchor="start" x="456.19" y="-697.6" font-family="Arial" font-size="15.00" fill="#bfdbfe">are not new</text>
<text xml:space="preserve" text-anchor="start" x="458.68" y="-679.6" font-family="Arial" font-size="15.00" fill="#bfdbfe">databases.</text>
</g>
<!-- publishing -->
<g id="node6" class="node">
<title>publishing</title>
<polygon fill="#3b82f6" stroke="#2563eb" stroke-width="0" points="555.4,-502.8 235.36,-502.8 235.36,-322.8 555.4,-322.8 555.4,-502.8"/>
<text xml:space="preserve" text-anchor="start" x="307" y="-404.8" font-family="Arial" font-size="20.00" fill="#eff6ff">Publishing Surfaces</text>
</g>
<!-- operator&#45;&gt;capture -->
<g id="edge1" class="edge">
<title>operator&#45;&gt;capture</title>
<path fill="none" stroke="#8d8d8d" stroke-width="2" stroke-dasharray="5,2" d="M684.19,-1291.27C663.08,-1249.72 637.89,-1200.13 616.22,-1157.5"/>
<polygon fill="#8d8d8d" stroke="#8d8d8d" stroke-width="2" points="618.62,-1156.43 612.89,-1150.93 613.94,-1158.8 618.62,-1156.43"/>
<polygon fill="#18191b" fill-opacity="0.627451" stroke="none" points="652.77,-1208.4 652.77,-1231.2 679.76,-1231.2 679.76,-1208.4 652.77,-1208.4"/>
<text xml:space="preserve" text-anchor="start" x="655.77" y="-1216.6" font-family="Arial" font-weight="bold" font-size="14.00" fill="#c9c9c9">[...]</text>
</g>
<!-- operator&#45;&gt;actions -->
<g id="edge2" class="edge">
<title>operator&#45;&gt;actions</title>
<path fill="none" stroke="#8d8d8d" stroke-width="2" stroke-dasharray="5,2" d="M752.82,-1291.38C763.24,-1248.48 774.65,-1196.08 781.38,-1148.4 813.24,-922.7 822.06,-654.8 824.49,-513.14"/>
<polygon fill="#8d8d8d" stroke="#8d8d8d" stroke-width="2" points="827.11,-513.31 824.61,-505.77 821.86,-513.22 827.11,-513.31"/>
<polygon fill="#18191b" fill-opacity="0.627451" stroke="none" points="807.83,-885.6 807.83,-908.4 853.51,-908.4 853.51,-885.6 807.83,-885.6"/>
<text xml:space="preserve" text-anchor="start" x="810.83" y="-891.4" font-family="Arial" font-size="14.00" fill="#c9c9c9">trigger</text>
</g>
<!-- capture&#45;&gt;durable -->
<g id="edge4" class="edge">
<title>capture&#45;&gt;durable</title>
<path fill="none" stroke="#8d8d8d" stroke-width="2" stroke-dasharray="5,2" d="M546.7,-968.47C537.56,-927.18 526.66,-877.95 517.27,-835.5"/>
<polygon fill="#8d8d8d" stroke="#8d8d8d" stroke-width="2" points="519.88,-835.14 515.69,-828.39 514.75,-836.28 519.88,-835.14"/>
<polygon fill="#18191b" fill-opacity="0.627451" stroke="none" points="533.01,-885.6 533.01,-908.4 560,-908.4 560,-885.6 533.01,-885.6"/>
<text xml:space="preserve" text-anchor="start" x="536.01" y="-893.8" font-family="Arial" font-weight="bold" font-size="14.00" fill="#c9c9c9">[...]</text>
</g>
<!-- actions&#45;&gt;portfoliostore -->
<g id="edge7" class="edge">
<title>actions&#45;&gt;portfoliostore</title>
<path fill="none" stroke="#8d8d8d" stroke-width="2" stroke-dasharray="5,2" d="M665.43,-333.94C567.63,-286.33 442.43,-225.38 341.9,-176.44"/>
<polygon fill="#8d8d8d" stroke="#8d8d8d" stroke-width="2" points="343.17,-174.14 335.28,-173.22 340.87,-178.86 343.17,-174.14"/>
<polygon fill="#18191b" fill-opacity="0.627451" stroke="none" points="515.64,-240 515.64,-262.8 568.33,-262.8 568.33,-240 515.64,-240"/>
<text xml:space="preserve" text-anchor="start" x="518.64" y="-245.8" font-family="Arial" font-size="14.00" fill="#c9c9c9">capture</text>
</g>
<!-- actions&#45;&gt;durable -->
<g id="edge8" class="edge">
<title>actions&#45;&gt;durable</title>
<path fill="none" stroke="#8d8d8d" stroke-width="2" stroke-dasharray="5,2" d="M665.7,-481.52C628.21,-503.2 591,-530.22 562.76,-562.8 544.62,-583.73 531.04,-610.12 521.02,-635.89"/>
<polygon fill="#8d8d8d" stroke="#8d8d8d" stroke-width="2" points="518.57,-634.94 518.41,-642.89 523.49,-636.78 518.57,-634.94"/>
<polygon fill="#18191b" fill-opacity="0.627451" stroke="none" points="562.76,-562.8 562.76,-585.6 654.38,-585.6 654.38,-562.8 562.76,-562.8"/>
<text xml:space="preserve" text-anchor="start" x="565.76" y="-568.6" font-family="Arial" font-size="14.00" fill="#c9c9c9">create/update</text>
</g>
<!-- portfoliostore&#45;&gt;durable -->
<g id="edge3" class="edge">
<title>portfoliostore&#45;&gt;durable</title>
<path fill="none" stroke="#8d8d8d" stroke-width="2" stroke-dasharray="5,2" d="M136.1,-179.7C111.93,-266.18 89.15,-399.4 136.24,-502.8 172.52,-582.46 251.61,-637.93 326.36,-674.58"/>
<polygon fill="#8d8d8d" stroke="#8d8d8d" stroke-width="2" points="324.83,-676.75 332.72,-677.64 327.11,-672.02 324.83,-676.75"/>
<polygon fill="#18191b" fill-opacity="0.627451" stroke="none" points="136.24,-401.4 136.24,-424.2 180.38,-424.2 180.38,-401.4 136.24,-401.4"/>
<text xml:space="preserve" text-anchor="start" x="139.24" y="-407.2" font-family="Arial" font-size="14.00" fill="#c9c9c9">attach</text>
</g>
<!-- durable&#45;&gt;actions -->
<g id="edge5" class="edge">
<title>durable&#45;&gt;actions</title>
<path fill="none" stroke="#8d8d8d" stroke-width="2" stroke-dasharray="5,2" d="M613.49,-645.81C636.72,-626.75 660.38,-606.14 681.38,-585.6 705.08,-562.42 728.95,-535.64 750.26,-510.23"/>
<polygon fill="#8d8d8d" stroke="#8d8d8d" stroke-width="2" points="752.07,-512.16 754.85,-504.72 748.03,-508.8 752.07,-512.16"/>
<polygon fill="#18191b" fill-opacity="0.627451" stroke="none" points="702.72,-562.8 702.72,-585.6 739.06,-585.6 739.06,-562.8 702.72,-562.8"/>
<text xml:space="preserve" text-anchor="start" x="705.72" y="-568.6" font-family="Arial" font-size="14.00" fill="#c9c9c9">drive</text>
</g>
<!-- durable&#45;&gt;publishing -->
<g id="edge6" class="edge">
<title>durable&#45;&gt;publishing</title>
<path fill="none" stroke="#8d8d8d" stroke-width="2" stroke-dasharray="5,2" d="M335.38,-661.18C307.27,-640.82 281.8,-615.8 265.39,-585.6 251.62,-560.28 257.92,-534.65 273.44,-511.17"/>
<polygon fill="#8d8d8d" stroke="#8d8d8d" stroke-width="2" points="275.56,-512.72 277.8,-505.09 271.3,-509.66 275.56,-512.72"/>
<polygon fill="#18191b" fill-opacity="0.627451" stroke="none" points="265.39,-562.8 265.39,-585.6 292.38,-585.6 292.38,-562.8 265.39,-562.8"/>
<text xml:space="preserve" text-anchor="start" x="268.39" y="-571" font-family="Arial" font-weight="bold" font-size="14.00" fill="#c9c9c9">[...]</text>
</g>
<!-- publishing&#45;&gt;durable -->
<g id="edge9" class="edge">
<title>publishing&#45;&gt;durable</title>
<path fill="none" stroke="#8d8d8d" stroke-width="2" stroke-dasharray="5,2" d="M390.47,-502.67C391.25,-529.79 394.46,-559.36 402.56,-585.6 407.91,-602.92 415.78,-620.24 424.72,-636.62"/>
<polygon fill="#8d8d8d" stroke="#8d8d8d" stroke-width="2" points="422.33,-637.73 428.3,-642.98 426.91,-635.15 422.33,-637.73"/>
<polygon fill="#18191b" fill-opacity="0.627451" stroke="none" points="402.56,-562.8 402.56,-585.6 451.38,-585.6 451.38,-562.8 402.56,-562.8"/>
<text xml:space="preserve" text-anchor="start" x="405.56" y="-568.6" font-family="Arial" font-size="14.00" fill="#c9c9c9">update</text>
</g>
</g>
</svg>
`;case`opportunity_hq_container_map`:return`<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN"
 "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<!-- Generated by graphviz version 14.1.5 (0)
 -->
<!-- Pages: 1 -->
<svg width="3095pt" height="1245pt"
 viewBox="0.00 0.00 3095.00 1245.00" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
<g id="graph0" class="graph" transform="scale(1 1) rotate(0) translate(15.05 1229.85)">
<g id="clust1" class="cluster">
<title>cluster_capture</title>
<polygon fill="#3e4651" stroke="#2d333d" points="1341,-662.8 1341,-944 2189,-944 2189,-662.8 1341,-662.8"/>
<text xml:space="preserve" text-anchor="start" x="1349" y="-931.1" font-family="Arial" font-weight="bold" font-size="11.00" fill="#cbd5e1" fill-opacity="0.701961">CAPTURE SURFACES</text>
</g>
<g id="clust2" class="cluster">
<title>cluster_durable</title>
<polygon fill="#0d4b6c" stroke="#0b3c57" points="8,-8 8,-944 868,-944 868,-8 8,-8"/>
<text xml:space="preserve" text-anchor="start" x="16" y="-931.1" font-family="Arial" font-weight="bold" font-size="11.00" fill="#b6ecf7" fill-opacity="0.701961">OPPORTUNITY HQ</text>
</g>
<g id="clust3" class="cluster">
<title>cluster_publishing</title>
<polygon fill="#3e4651" stroke="#2d333d" points="898,-8 898,-289.2 1742,-289.2 1742,-8 898,-8"/>
<text xml:space="preserve" text-anchor="start" x="906" y="-276.3" font-family="Arial" font-weight="bold" font-size="11.00" fill="#cbd5e1" fill-opacity="0.701961">PUBLISHING SURFACES</text>
</g>
<!-- bear -->
<g id="node1" class="node">
<title>bear</title>
<polygon fill="#ac4d39" stroke="#853a2d" stroke-width="0" points="1712.97,-882.8 1381.03,-882.8 1381.03,-702.8 1712.97,-702.8 1712.97,-882.8"/>
<text xml:space="preserve" text-anchor="start" x="1498.64" y="-831.8" font-family="Arial" font-size="20.00" fill="#fbd3cb">Bear Inbox</text>
<text xml:space="preserve" text-anchor="start" x="1401.09" y="-808.8" font-family="Arial" font-size="15.00" fill="#f5b2a3">Raw capture only. Use for unclear thoughts,</text>
<text xml:space="preserve" text-anchor="start" x="1474.45" y="-790.8" font-family="Arial" font-size="15.00" fill="#f5b2a3">offload notes, passive</text>
<text xml:space="preserve" text-anchor="start" x="1406.5" y="-772.8" font-family="Arial" font-size="15.00" fill="#f5b2a3">shortcut ideas, and anything that is not yet</text>
<text xml:space="preserve" text-anchor="start" x="1464.05" y="-754.8" font-family="Arial" font-size="15.00" fill="#f5b2a3">a real task. Promote only</text>
<text xml:space="preserve" text-anchor="start" x="1403.16" y="-736.8" font-family="Arial" font-size="15.00" fill="#f5b2a3">when the item has money weight, deadline,</text>
</g>
<!-- mobileform -->
<g id="node2" class="node">
<title>mobileform</title>
<polygon fill="#3b82f6" stroke="#2563eb" stroke-width="0" points="2149.26,-882.8 1822.74,-882.8 1822.74,-702.8 2149.26,-702.8 2149.26,-882.8"/>
<text xml:space="preserve" text-anchor="start" x="1905.99" y="-822.8" font-family="Arial" font-size="20.00" fill="#eff6ff">Mobile Task Form</text>
<text xml:space="preserve" text-anchor="start" x="1846.75" y="-799.8" font-family="Arial" font-size="15.00" fill="#bfdbfe">Fast durable capture path for task&#45;shaped</text>
<text xml:space="preserve" text-anchor="start" x="1893.48" y="-781.8" font-family="Arial" font-size="15.00" fill="#bfdbfe">work. Minimum fields: Task,</text>
<text xml:space="preserve" text-anchor="start" x="1848.01" y="-763.8" font-family="Arial" font-size="15.00" fill="#bfdbfe">Project, Duration, and Link/Notes. Default</text>
<text xml:space="preserve" text-anchor="start" x="1899.27" y="-745.8" font-family="Arial" font-size="15.00" fill="#bfdbfe">Status should be Queued.</text>
</g>
<!-- projects -->
<g id="node3" class="node">
<title>projects</title>
<path fill="#0284c7" stroke="#0369a1" stroke-width="2" d="M389.56,-866.44C389.56,-875.47 313.11,-882.8 219,-882.8 124.89,-882.8 48.44,-875.47 48.44,-866.44 48.44,-866.44 48.44,-719.16 48.44,-719.16 48.44,-710.13 124.89,-702.8 219,-702.8 313.11,-702.8 389.56,-710.13 389.56,-719.16 389.56,-719.16 389.56,-866.44 389.56,-866.44"/>
<path fill="none" stroke="#0369a1" stroke-width="2" d="M389.56,-866.44C389.56,-857.41 313.11,-850.07 219,-850.07 124.89,-850.07 48.44,-857.41 48.44,-866.44"/>
<text xml:space="preserve" text-anchor="start" x="128.4" y="-822.8" font-family="Arial" font-size="20.00" fill="#f0f9ff">Opportunity Projects</text>
<text xml:space="preserve" text-anchor="start" x="81.43" y="-799.8" font-family="Arial" font-size="15.00" fill="#b6ecf7">Durable project lanes: Cash Jobs, Career</text>
<text xml:space="preserve" text-anchor="start" x="111.04" y="-781.8" font-family="Arial" font-size="15.00" fill="#b6ecf7">Jobs, Freelance, Offer, Portfolio.</text>
<text xml:space="preserve" text-anchor="start" x="68.49" y="-763.8" font-family="Arial" font-size="15.00" fill="#b6ecf7">Finishable deliverables belong as tasks/goals</text>
<text xml:space="preserve" text-anchor="start" x="159.38" y="-745.8" font-family="Arial" font-size="15.00" fill="#b6ecf7">under these rows.</text>
</g>
<!-- dependencies -->
<g id="node4" class="node">
<title>dependencies</title>
<polygon fill="#64748b" stroke="#475569" stroke-width="0" points="828.32,-882.8 499.68,-882.8 499.68,-702.8 828.32,-702.8 828.32,-882.8"/>
<text xml:space="preserve" text-anchor="start" x="600.06" y="-831.8" font-family="Arial" font-size="20.00" fill="#f8fafc">Dependencies</text>
<text xml:space="preserve" text-anchor="start" x="530.6" y="-808.8" font-family="Arial" font-size="15.00" fill="#cbd5e1">Real blockers only: application work can</text>
<text xml:space="preserve" text-anchor="start" x="556.01" y="-790.8" font-family="Arial" font-size="15.00" fill="#cbd5e1">depend on resume/snippet prep;</text>
<text xml:space="preserve" text-anchor="start" x="522.25" y="-772.8" font-family="Arial" font-size="15.00" fill="#cbd5e1">website request flow depends on Tally and</text>
<text xml:space="preserve" text-anchor="start" x="574.37" y="-754.8" font-family="Arial" font-size="15.00" fill="#cbd5e1">Notion intake; offer traction</text>
<text xml:space="preserve" text-anchor="start" x="519.73" y="-736.8" font-family="Arial" font-size="15.00" fill="#cbd5e1">depends on website, proof, outreach, and a</text>
</g>
<!-- tasks -->
<g id="node5" class="node">
<title>tasks</title>
<polygon fill="#0284c7" stroke="#0369a1" stroke-width="0" points="823.01,-556 488.99,-556 488.99,-384 823.01,-384 823.01,-556"/>
<text xml:space="preserve" text-anchor="start" x="574.86" y="-509" font-family="Arial" font-size="20.00" fill="#f0f9ff">Opportunity Tasks</text>
<text xml:space="preserve" text-anchor="start" x="526.79" y="-486" font-family="Arial" font-size="15.00" fill="#b6ecf7">Executable work. Fields: Task, Project,</text>
<text xml:space="preserve" text-anchor="start" x="548.04" y="-468" font-family="Arial" font-size="15.00" fill="#b6ecf7">Status, Duration, Money Priority,</text>
<text xml:space="preserve" text-anchor="start" x="557.63" y="-450" font-family="Arial" font-size="15.00" fill="#b6ecf7">Work Date, Shift, Link, Notes.</text>
<text xml:space="preserve" text-anchor="start" x="513.01" y="-432" font-family="Arial" font-size="15.00" fill="#b6ecf7">Status contract: Queued, Today, In Motion,</text>
<text xml:space="preserve" text-anchor="start" x="578.88" y="-414" font-family="Arial" font-size="15.00" fill="#b6ecf7">Waiting, Done, Parked.</text>
</g>
<!-- taskviews -->
<g id="node6" class="node">
<title>taskviews</title>
<polygon fill="#3b82f6" stroke="#2563eb" stroke-width="0" points="828.41,-228 483.59,-228 483.59,-48 828.41,-48 828.41,-228"/>
<text xml:space="preserve" text-anchor="start" x="604.88" y="-177" font-family="Arial" font-size="20.00" fill="#eff6ff">Task Views</text>
<text xml:space="preserve" text-anchor="start" x="507.61" y="-154" font-family="Arial" font-size="15.00" fill="#bfdbfe">Views over Opportunity Tasks: Focus Board,</text>
<text xml:space="preserve" text-anchor="start" x="558.89" y="-136" font-family="Arial" font-size="15.00" fill="#bfdbfe">Daily Blocks, Work Calendar,</text>
<text xml:space="preserve" text-anchor="start" x="525.92" y="-118" font-family="Arial" font-size="15.00" fill="#bfdbfe">Applications, Freelance, Singleton, and</text>
<text xml:space="preserve" text-anchor="start" x="523.85" y="-100" font-family="Arial" font-size="15.00" fill="#bfdbfe">Portfolio. These are lenses, not sources</text>
<text xml:space="preserve" text-anchor="start" x="630.57" y="-82" font-family="Arial" font-size="15.00" fill="#bfdbfe">of truth.</text>
</g>
<!-- website -->
<g id="node7" class="node">
<title>website</title>
<polygon fill="#3b82f6" stroke="#2563eb" stroke-width="0" points="1258.02,-228 937.98,-228 937.98,-48 1258.02,-48 1258.02,-228"/>
<text xml:space="preserve" text-anchor="start" x="1017.4" y="-159" font-family="Arial" font-size="20.00" fill="#eff6ff">Singleton Website</text>
<text xml:space="preserve" text-anchor="start" x="962.52" y="-136" font-family="Arial" font-size="15.00" fill="#bfdbfe">Public proof and offer surface. Pulls from</text>
<text xml:space="preserve" text-anchor="start" x="996.27" y="-118" font-family="Arial" font-size="15.00" fill="#bfdbfe">packaged proof and clear offer</text>
<text xml:space="preserve" text-anchor="start" x="1007.14" y="-100" font-family="Arial" font-size="15.00" fill="#bfdbfe">work, not from raw capture.</text>
</g>
<!-- proposals -->
<g id="node8" class="node">
<title>proposals</title>
<polygon fill="#a35829" stroke="#7e451d" stroke-width="0" points="1701.8,-228 1368.2,-228 1368.2,-48 1701.8,-48 1701.8,-228"/>
<text xml:space="preserve" text-anchor="start" x="1428.28" y="-168" font-family="Arial" font-size="20.00" fill="#ffe0c2">Applications / Proposals</text>
<text xml:space="preserve" text-anchor="start" x="1388.26" y="-145" font-family="Arial" font-size="15.00" fill="#f9b27c">Outbound artifacts: job applications, Upwork</text>
<text xml:space="preserve" text-anchor="start" x="1446.62" y="-127" font-family="Arial" font-size="15.00" fill="#f9b27c">proposals, direct outreach,</text>
<text xml:space="preserve" text-anchor="start" x="1404.1" y="-109" font-family="Arial" font-size="15.00" fill="#f9b27c">cover notes, and follow&#45;ups. Their state</text>
<text xml:space="preserve" text-anchor="start" x="1447.05" y="-91" font-family="Arial" font-size="15.00" fill="#f9b27c">returns to Opportunity HQ.</text>
</g>
<!-- operator -->
<g id="node9" class="node">
<title>operator</title>
<polygon fill="#a35829" stroke="#7e451d" stroke-width="0" points="2005.65,-1214.8 1660.35,-1214.8 1660.35,-1034.8 2005.65,-1034.8 2005.65,-1214.8"/>
<text xml:space="preserve" text-anchor="start" x="1793.54" y="-1163.8" font-family="Arial" font-size="20.00" fill="#ffe0c2">Operator</text>
<text xml:space="preserve" text-anchor="start" x="1697.52" y="-1140.8" font-family="Arial" font-size="15.00" fill="#f9b27c">The working user. Uses mobile, desktop,</text>
<text xml:space="preserve" text-anchor="start" x="1717.52" y="-1122.8" font-family="Arial" font-size="15.00" fill="#f9b27c">Raycast, Codex, Notion, Bear, and</text>
<text xml:space="preserve" text-anchor="start" x="1683.34" y="-1104.8" font-family="Arial" font-size="15.00" fill="#f9b27c">Eagle to move job search, Upwork, Singleton</text>
<text xml:space="preserve" text-anchor="start" x="1738.37" y="-1086.8" font-family="Arial" font-size="15.00" fill="#f9b27c">offer, and proof work without</text>
<text xml:space="preserve" text-anchor="start" x="1680.4" y="-1068.8" font-family="Arial" font-size="15.00" fill="#f9b27c">repeatedly deciding where each item belongs.</text>
</g>
<!-- logtask -->
<g id="node10" class="node">
<title>logtask</title>
<polygon fill="#3b82f6" stroke="#2563eb" stroke-width="0" points="2592.46,-1214.8 2265.54,-1214.8 2265.54,-1034.8 2592.46,-1034.8 2592.46,-1214.8"/>
<text xml:space="preserve" text-anchor="start" x="2387.87" y="-1154.8" font-family="Arial" font-size="20.00" fill="#eff6ff">Log Task</text>
<text xml:space="preserve" text-anchor="start" x="2289.77" y="-1131.8" font-family="Arial" font-size="15.00" fill="#bfdbfe">Create an Opportunity Task from selected</text>
<text xml:space="preserve" text-anchor="start" x="2340.2" y="-1113.8" font-family="Arial" font-size="15.00" fill="#bfdbfe">text, clipboard link, manual</text>
<text xml:space="preserve" text-anchor="start" x="2285.6" y="-1095.8" font-family="Arial" font-size="15.00" fill="#bfdbfe">form input, or mobile/share context. Default</text>
<text xml:space="preserve" text-anchor="start" x="2374.8" y="-1077.8" font-family="Arial" font-size="15.00" fill="#bfdbfe">Status: Queued.</text>
</g>
<!-- updatetask -->
<g id="node11" class="node">
<title>updatetask</title>
<polygon fill="#3b82f6" stroke="#2563eb" stroke-width="0" points="2596.2,-882.8 2261.8,-882.8 2261.8,-702.8 2596.2,-702.8 2596.2,-882.8"/>
<text xml:space="preserve" text-anchor="start" x="2372.31" y="-813.8" font-family="Arial" font-size="20.00" fill="#eff6ff">Update Task</text>
<text xml:space="preserve" text-anchor="start" x="2281.85" y="-790.8" font-family="Arial" font-size="15.00" fill="#bfdbfe">Update Status, Money Priority, Project, Link,</text>
<text xml:space="preserve" text-anchor="start" x="2400.66" y="-772.8" font-family="Arial" font-size="15.00" fill="#bfdbfe">or Notes</text>
<text xml:space="preserve" text-anchor="start" x="2321.44" y="-754.8" font-family="Arial" font-size="15.00" fill="#bfdbfe">on an existing Opportunity Task.</text>
</g>
<!-- searchrun -->
<g id="node12" class="node">
<title>searchrun</title>
<polygon fill="#3b82f6" stroke="#2563eb" stroke-width="0" points="2606.63,-560 2251.37,-560 2251.37,-380 2606.63,-380 2606.63,-560"/>
<text xml:space="preserve" text-anchor="start" x="2321.72" y="-500" font-family="Arial" font-size="20.00" fill="#eff6ff">Opportunity Search Run</text>
<text xml:space="preserve" text-anchor="start" x="2271.43" y="-477" font-family="Arial" font-size="15.00" fill="#bfdbfe">Codex&#45;owned manual workflow. Search current</text>
<text xml:space="preserve" text-anchor="start" x="2334.79" y="-459" font-family="Arial" font-size="15.00" fill="#bfdbfe">jobs or leads, return winners</text>
<text xml:space="preserve" text-anchor="start" x="2297.25" y="-441" font-family="Arial" font-size="15.00" fill="#bfdbfe">for approval, then log approved tasks to</text>
<text xml:space="preserve" text-anchor="start" x="2374.81" y="-423" font-family="Arial" font-size="15.00" fill="#bfdbfe">Opportunity HQ.</text>
</g>
<!-- exportblocks -->
<g id="node13" class="node">
<title>exportblocks</title>
<polygon fill="#3b82f6" stroke="#2563eb" stroke-width="0" points="2608.73,-228 2249.27,-228 2249.27,-48 2608.73,-48 2608.73,-228"/>
<text xml:space="preserve" text-anchor="start" x="2337.86" y="-168" font-family="Arial" font-size="20.00" fill="#eff6ff">Export Focus Blocks</text>
<text xml:space="preserve" text-anchor="start" x="2269.33" y="-145" font-family="Arial" font-size="15.00" fill="#bfdbfe">Codex&#45;owned manual workflow. Read approved</text>
<text xml:space="preserve" text-anchor="start" x="2335.21" y="-127" font-family="Arial" font-size="15.00" fill="#bfdbfe">Opportunity Tasks, build 3&#45;5</text>
<text xml:space="preserve" text-anchor="start" x="2295.2" y="-109" font-family="Arial" font-size="15.00" fill="#bfdbfe">realistic time blocks, export .ics, and ask</text>
<text xml:space="preserve" text-anchor="start" x="2353.11" y="-91" font-family="Arial" font-size="15.00" fill="#bfdbfe">before Notion updates.</text>
</g>
<!-- goalcheckin -->
<g id="node14" class="node">
<title>goalcheckin</title>
<polygon fill="#3b82f6" stroke="#2563eb" stroke-width="0" points="3060.47,-1214.8 2723.53,-1214.8 2723.53,-1034.8 3060.47,-1034.8 3060.47,-1214.8"/>
<text xml:space="preserve" text-anchor="start" x="2828.08" y="-1163.8" font-family="Arial" font-size="20.00" fill="#eff6ff">Goal Check&#45;In</text>
<text xml:space="preserve" text-anchor="start" x="2758.2" y="-1140.8" font-family="Arial" font-size="15.00" fill="#bfdbfe">Future small command. Ask count/result</text>
<text xml:space="preserve" text-anchor="start" x="2805.28" y="-1122.8" font-family="Arial" font-size="15.00" fill="#bfdbfe">questions for applications,</text>
<text xml:space="preserve" text-anchor="start" x="2743.59" y="-1104.8" font-family="Arial" font-size="15.00" fill="#bfdbfe">freelance proposals, Strategic work, and real</text>
<text xml:space="preserve" text-anchor="start" x="2800.29" y="-1086.8" font-family="Arial" font-size="15.00" fill="#bfdbfe">blockers. Output one or two</text>
<text xml:space="preserve" text-anchor="start" x="2761.93" y="-1068.8" font-family="Arial" font-size="15.00" fill="#bfdbfe">daily implications, not a full plan or new</text>
</g>
<!-- startapplication -->
<g id="node15" class="node">
<title>startapplication</title>
<polygon fill="#3b82f6" stroke="#2563eb" stroke-width="0" points="3052.02,-882.8 2731.98,-882.8 2731.98,-702.8 3052.02,-702.8 3052.02,-882.8"/>
<text xml:space="preserve" text-anchor="start" x="2819.18" y="-813.8" font-family="Arial" font-size="20.00" fill="#eff6ff">Start Application</text>
<text xml:space="preserve" text-anchor="start" x="2754" y="-790.8" font-family="Arial" font-size="15.00" fill="#bfdbfe">Open a job link and resume path from the</text>
<text xml:space="preserve" text-anchor="start" x="2789.03" y="-772.8" font-family="Arial" font-size="15.00" fill="#bfdbfe">selected task. Move the task to</text>
<text xml:space="preserve" text-anchor="start" x="2792.8" y="-754.8" font-family="Arial" font-size="15.00" fill="#bfdbfe">In Motion while work is active.</text>
</g>
<!-- draftproposal -->
<g id="node16" class="node">
<title>draftproposal</title>
<polygon fill="#3b82f6" stroke="#2563eb" stroke-width="0" points="3052.97,-560 2731.03,-560 2731.03,-380 3052.97,-380 3052.97,-560"/>
<text xml:space="preserve" text-anchor="start" x="2828.08" y="-491" font-family="Arial" font-size="20.00" fill="#eff6ff">Draft Proposal</text>
<text xml:space="preserve" text-anchor="start" x="2751.09" y="-468" font-family="Arial" font-size="15.00" fill="#bfdbfe">Turn a copied Upwork post into a proposal</text>
<text xml:space="preserve" text-anchor="start" x="2805.7" y="-450" font-family="Arial" font-size="15.00" fill="#bfdbfe">draft and log the follow&#45;up</text>
<text xml:space="preserve" text-anchor="start" x="2793.2" y="-432" font-family="Arial" font-size="15.00" fill="#bfdbfe">state back to Opportunity HQ.</text>
</g>
<!-- captureportfolio -->
<g id="node17" class="node">
<title>captureportfolio</title>
<polygon fill="#3b82f6" stroke="#2563eb" stroke-width="0" points="3065.07,-228 2718.93,-228 2718.93,-48 3065.07,-48 3065.07,-228"/>
<text xml:space="preserve" text-anchor="start" x="2816.96" y="-168" font-family="Arial" font-size="20.00" fill="#eff6ff">Capture Portfolio</text>
<text xml:space="preserve" text-anchor="start" x="2738.98" y="-145" font-family="Arial" font-size="15.00" fill="#bfdbfe">Import the selected asset to Eagle, append an</text>
<text xml:space="preserve" text-anchor="start" x="2803.18" y="-127" font-family="Arial" font-size="15.00" fill="#bfdbfe">Added to Eagle note to the</text>
<text xml:space="preserve" text-anchor="start" x="2750.68" y="-109" font-family="Arial" font-size="15.00" fill="#bfdbfe">selected Portfolio task, then mark that task</text>
<text xml:space="preserve" text-anchor="start" x="2871.99" y="-91" font-family="Arial" font-size="15.00" fill="#bfdbfe">Done.</text>
</g>
<!-- portfoliostore -->
<g id="node18" class="node">
<title>portfoliostore</title>
<path fill="#428a4f" stroke="#2d5d39" stroke-width="2" d="M1271.38,-866.44C1271.38,-875.47 1196.81,-882.8 1105,-882.8 1013.19,-882.8 938.62,-875.47 938.62,-866.44 938.62,-866.44 938.62,-719.16 938.62,-719.16 938.62,-710.13 1013.19,-702.8 1105,-702.8 1196.81,-702.8 1271.38,-710.13 1271.38,-719.16 1271.38,-719.16 1271.38,-866.44 1271.38,-866.44"/>
<path fill="none" stroke="#2d5d39" stroke-width="2" d="M1271.38,-866.44C1271.38,-857.41 1196.81,-850.07 1105,-850.07 1013.19,-850.07 938.62,-857.41 938.62,-866.44"/>
<text xml:space="preserve" text-anchor="start" x="1006.62" y="-822.8" font-family="Arial" font-size="20.00" fill="#f8fafc">Eagle Portfolio Library</text>
<text xml:space="preserve" text-anchor="start" x="958.68" y="-799.8" font-family="Arial" font-size="15.00" fill="#c2f0c2">Portfolio/evidence store. Holds screenshots,</text>
<text xml:space="preserve" text-anchor="start" x="967.85" y="-781.8" font-family="Arial" font-size="15.00" fill="#c2f0c2">videos, PDFs, reels, examples, and proof</text>
<text xml:space="preserve" text-anchor="start" x="973.26" y="-763.8" font-family="Arial" font-size="15.00" fill="#c2f0c2">assets. Eagle does not own task status;</text>
<text xml:space="preserve" text-anchor="start" x="1032.46" y="-745.8" font-family="Arial" font-size="15.00" fill="#c2f0c2">Opportunity HQ does.</text>
</g>
<!-- bear&#45;&gt;tasks -->
<g id="edge10" class="edge">
<title>bear&#45;&gt;tasks</title>
<path fill="none" stroke="#8d8d8d" stroke-width="2" stroke-dasharray="5,2" d="M1406.76,-702.96C1380.51,-688.36 1352.86,-674.27 1326,-662.8 1164.39,-593.79 970.5,-541.35 832.97,-508.89"/>
<polygon fill="#8d8d8d" stroke="#8d8d8d" stroke-width="2" points="833.6,-506.34 825.7,-507.18 832.4,-511.45 833.6,-506.34"/>
<polygon fill="#18191b" fill-opacity="0.627451" stroke="none" points="1273.75,-620 1273.75,-642.8 1331.11,-642.8 1331.11,-620 1273.75,-620"/>
<text xml:space="preserve" text-anchor="start" x="1276.75" y="-625.8" font-family="Arial" font-size="14.00" fill="#c9c9c9">promote</text>
</g>
<!-- mobileform&#45;&gt;tasks -->
<g id="edge11" class="edge">
<title>mobileform&#45;&gt;tasks</title>
<path fill="none" stroke="#8d8d8d" stroke-width="2" stroke-dasharray="5,2" d="M1852.85,-702.8C1825.65,-687.58 1796.58,-673.32 1768,-662.8 1451.12,-546.21 1056.89,-499.67 833.09,-481.71"/>
<polygon fill="#8d8d8d" stroke="#8d8d8d" stroke-width="2" points="833.6,-479.11 825.91,-481.14 833.18,-484.35 833.6,-479.11"/>
<polygon fill="#18191b" fill-opacity="0.627451" stroke="none" points="1710.75,-620 1710.75,-642.8 1755.66,-642.8 1755.66,-620 1710.75,-620"/>
<text xml:space="preserve" text-anchor="start" x="1713.75" y="-625.8" font-family="Arial" font-size="14.00" fill="#c9c9c9">create</text>
</g>
<!-- projects&#45;&gt;tasks -->
<g id="edge12" class="edge">
<title>projects&#45;&gt;tasks</title>
<path fill="none" stroke="#8d8d8d" stroke-width="2" stroke-dasharray="5,2" d="M338.12,-704.35C398.35,-660.14 471.37,-606.53 532.24,-561.86"/>
<polygon fill="#8d8d8d" stroke="#8d8d8d" stroke-width="2" points="533.42,-564.24 537.92,-557.68 530.32,-560.01 533.42,-564.24"/>
<polygon fill="#18191b" fill-opacity="0.627451" stroke="none" points="450.6,-620 450.6,-642.8 492.41,-642.8 492.41,-620 450.6,-620"/>
<text xml:space="preserve" text-anchor="start" x="453.6" y="-625.8" font-family="Arial" font-size="14.00" fill="#c9c9c9">group</text>
</g>
<!-- dependencies&#45;&gt;tasks -->
<g id="edge13" class="edge">
<title>dependencies&#45;&gt;tasks</title>
<path fill="none" stroke="#8d8d8d" stroke-width="2" stroke-dasharray="5,2" d="M661.78,-702.87C660.72,-660.38 659.45,-609.48 658.37,-566.21"/>
<polygon fill="#8d8d8d" stroke="#8d8d8d" stroke-width="2" points="661.01,-566.42 658.19,-558.99 655.76,-566.55 661.01,-566.42"/>
<polygon fill="#18191b" fill-opacity="0.627451" stroke="none" points="660.24,-620 660.24,-642.8 698.92,-642.8 698.92,-620 660.24,-620"/>
<text xml:space="preserve" text-anchor="start" x="663.24" y="-625.8" font-family="Arial" font-size="14.00" fill="#c9c9c9">block</text>
</g>
<!-- tasks&#45;&gt;taskviews -->
<g id="edge14" class="edge">
<title>tasks&#45;&gt;taskviews</title>
<path fill="none" stroke="#8d8d8d" stroke-width="2" stroke-dasharray="5,2" d="M656,-384.02C656,-339.45 656,-284.62 656,-238.13"/>
<polygon fill="#8d8d8d" stroke="#8d8d8d" stroke-width="2" points="658.63,-238.26 656,-230.76 653.38,-238.26 658.63,-238.26"/>
<polygon fill="#18191b" fill-opacity="0.627451" stroke="none" points="656,-297.2 656,-320 702.47,-320 702.47,-297.2 656,-297.2"/>
<text xml:space="preserve" text-anchor="start" x="659" y="-303" font-family="Arial" font-size="14.00" fill="#c9c9c9">render</text>
</g>
<!-- tasks&#45;&gt;website -->
<g id="edge15" class="edge">
<title>tasks&#45;&gt;website</title>
<path fill="none" stroke="#8d8d8d" stroke-width="2" stroke-dasharray="5,2" d="M769.83,-384.02C831.39,-338.05 907.61,-281.15 971.08,-233.76"/>
<polygon fill="#8d8d8d" stroke="#8d8d8d" stroke-width="2" points="972.29,-236.13 976.73,-229.54 969.15,-231.92 972.29,-236.13"/>
<polygon fill="#18191b" fill-opacity="0.627451" stroke="none" points="877,-297.2 877,-320 935.93,-320 935.93,-297.2 877,-297.2"/>
<text xml:space="preserve" text-anchor="start" x="880" y="-303" font-family="Arial" font-size="14.00" fill="#c9c9c9">package</text>
</g>
<!-- tasks&#45;&gt;proposals -->
<g id="edge16" class="edge">
<title>tasks&#45;&gt;proposals</title>
<path fill="none" stroke="#8d8d8d" stroke-width="2" stroke-dasharray="5,2" d="M822.89,-439.11C958.91,-411.07 1153.85,-362.38 1313,-289.2 1346.14,-273.96 1379.8,-253.98 1410.55,-233.58"/>
<polygon fill="#8d8d8d" stroke="#8d8d8d" stroke-width="2" points="1411.86,-235.86 1416.63,-229.5 1408.94,-231.5 1411.86,-235.86"/>
<polygon fill="#18191b" fill-opacity="0.627451" stroke="none" points="1279.51,-297.2 1279.51,-320 1326.75,-320 1326.75,-297.2 1279.51,-297.2"/>
<text xml:space="preserve" text-anchor="start" x="1282.51" y="-303" font-family="Arial" font-size="14.00" fill="#c9c9c9">submit</text>
</g>
<!-- proposals&#45;&gt;tasks -->
<g id="edge17" class="edge">
<title>proposals&#45;&gt;tasks</title>
<path fill="none" stroke="#8d8d8d" stroke-width="2" stroke-dasharray="5,2" d="M1465.74,-227.56C1434.97,-261.29 1396.17,-297.08 1354,-320 1191.04,-408.57 980.01,-444.51 832.84,-459.08"/>
<polygon fill="#8d8d8d" stroke="#8d8d8d" stroke-width="2" points="833.03,-456.42 825.81,-459.76 833.53,-461.65 833.03,-456.42"/>
<polygon fill="#18191b" fill-opacity="0.627451" stroke="none" points="1389.06,-297.2 1389.06,-320 1437.88,-320 1437.88,-297.2 1389.06,-297.2"/>
<text xml:space="preserve" text-anchor="start" x="1392.06" y="-303" font-family="Arial" font-size="14.00" fill="#c9c9c9">update</text>
</g>
<!-- operator&#45;&gt;bear -->
<g id="edge1" class="edge">
<title>operator&#45;&gt;bear</title>
<path fill="none" stroke="#8d8d8d" stroke-width="2" stroke-dasharray="5,2" d="M1755.98,-1034.93C1717.27,-990.27 1670.3,-936.07 1630.7,-890.38"/>
<polygon fill="#8d8d8d" stroke="#8d8d8d" stroke-width="2" points="1632.79,-888.78 1625.89,-884.83 1628.82,-892.21 1632.79,-888.78"/>
<polygon fill="#18191b" fill-opacity="0.627451" stroke="none" points="1698.58,-952 1698.58,-974.8 1751.27,-974.8 1751.27,-952 1698.58,-952"/>
<text xml:space="preserve" text-anchor="start" x="1701.58" y="-957.8" font-family="Arial" font-size="14.00" fill="#c9c9c9">capture</text>
</g>
<!-- operator&#45;&gt;mobileform -->
<g id="edge2" class="edge">
<title>operator&#45;&gt;mobileform</title>
<path fill="none" stroke="#8d8d8d" stroke-width="2" stroke-dasharray="5,2" d="M1874.2,-1034.93C1894.65,-990.82 1919.42,-937.41 1940.43,-892.08"/>
<polygon fill="#8d8d8d" stroke="#8d8d8d" stroke-width="2" points="1942.81,-893.2 1943.58,-885.29 1938.05,-890.99 1942.81,-893.2"/>
<polygon fill="#18191b" fill-opacity="0.627451" stroke="none" points="1909.5,-952 1909.5,-974.8 1934.18,-974.8 1934.18,-952 1909.5,-952"/>
<text xml:space="preserve" text-anchor="start" x="1912.5" y="-957.8" font-family="Arial" font-size="14.00" fill="#c9c9c9">log</text>
</g>
<!-- logtask&#45;&gt;updatetask -->
<!-- updatetask&#45;&gt;searchrun -->
<!-- searchrun&#45;&gt;exportblocks -->
<!-- goalcheckin&#45;&gt;startapplication -->
<!-- startapplication&#45;&gt;draftproposal -->
<!-- draftproposal&#45;&gt;captureportfolio -->
<!-- portfoliostore&#45;&gt;tasks -->
<g id="edge9" class="edge">
<title>portfoliostore&#45;&gt;tasks</title>
<path fill="none" stroke="#8d8d8d" stroke-width="2" stroke-dasharray="5,2" d="M983.2,-704.78C921.19,-660.47 845.85,-606.64 783.11,-561.81"/>
<polygon fill="#8d8d8d" stroke="#8d8d8d" stroke-width="2" points="784.82,-559.82 777.2,-557.59 781.77,-564.09 784.82,-559.82"/>
<polygon fill="#18191b" fill-opacity="0.627451" stroke="none" points="893.96,-620 893.96,-642.8 938.1,-642.8 938.1,-620 893.96,-620"/>
<text xml:space="preserve" text-anchor="start" x="896.96" y="-625.8" font-family="Arial" font-size="14.00" fill="#c9c9c9">attach</text>
</g>
</g>
</svg>
`;case`opportunity_hq_intake_contract`:return`<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN"
 "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<!-- Generated by graphviz version 14.1.5 (0)
 -->
<!-- Pages: 1 -->
<svg width="2183pt" height="1236pt"
 viewBox="0.00 0.00 2183.00 1236.00" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
<g id="graph0" class="graph" transform="scale(1 1) rotate(0) translate(15.05 1220.65)">
<g id="clust1" class="cluster">
<title>cluster_capture</title>
<polygon fill="#3e4651" stroke="#2d333d" points="454,-653.6 454,-934.8 1302,-934.8 1302,-653.6 454,-653.6"/>
<text xml:space="preserve" text-anchor="start" x="462" y="-921.9" font-family="Arial" font-weight="bold" font-size="11.00" fill="#cbd5e1" fill-opacity="0.701961">CAPTURE SURFACES</text>
</g>
<g id="clust2" class="cluster">
<title>cluster_durable</title>
<polygon fill="#3e4651" stroke="#2d333d" points="8,-8 8,-934.8 432,-934.8 432,-8 8,-8"/>
<text xml:space="preserve" text-anchor="start" x="16" y="-921.9" font-family="Arial" font-weight="bold" font-size="11.00" fill="#cbd5e1" fill-opacity="0.701961">OPPORTUNITY HQ</text>
</g>
<!-- bear -->
<g id="node1" class="node">
<title>bear</title>
<polygon fill="#ac4d39" stroke="#853a2d" stroke-width="0" points="825.97,-873.6 494.03,-873.6 494.03,-693.6 825.97,-693.6 825.97,-873.6"/>
<text xml:space="preserve" text-anchor="start" x="611.64" y="-822.6" font-family="Arial" font-size="20.00" fill="#fbd3cb">Bear Inbox</text>
<text xml:space="preserve" text-anchor="start" x="514.09" y="-799.6" font-family="Arial" font-size="15.00" fill="#f5b2a3">Raw capture only. Use for unclear thoughts,</text>
<text xml:space="preserve" text-anchor="start" x="587.45" y="-781.6" font-family="Arial" font-size="15.00" fill="#f5b2a3">offload notes, passive</text>
<text xml:space="preserve" text-anchor="start" x="519.5" y="-763.6" font-family="Arial" font-size="15.00" fill="#f5b2a3">shortcut ideas, and anything that is not yet</text>
<text xml:space="preserve" text-anchor="start" x="577.05" y="-745.6" font-family="Arial" font-size="15.00" fill="#f5b2a3">a real task. Promote only</text>
<text xml:space="preserve" text-anchor="start" x="516.16" y="-727.6" font-family="Arial" font-size="15.00" fill="#f5b2a3">when the item has money weight, deadline,</text>
</g>
<!-- mobileform -->
<g id="node2" class="node">
<title>mobileform</title>
<polygon fill="#3b82f6" stroke="#2563eb" stroke-width="0" points="1262.26,-873.6 935.74,-873.6 935.74,-693.6 1262.26,-693.6 1262.26,-873.6"/>
<text xml:space="preserve" text-anchor="start" x="1018.99" y="-813.6" font-family="Arial" font-size="20.00" fill="#eff6ff">Mobile Task Form</text>
<text xml:space="preserve" text-anchor="start" x="959.75" y="-790.6" font-family="Arial" font-size="15.00" fill="#bfdbfe">Fast durable capture path for task&#45;shaped</text>
<text xml:space="preserve" text-anchor="start" x="1006.48" y="-772.6" font-family="Arial" font-size="15.00" fill="#bfdbfe">work. Minimum fields: Task,</text>
<text xml:space="preserve" text-anchor="start" x="961.01" y="-754.6" font-family="Arial" font-size="15.00" fill="#bfdbfe">Project, Duration, and Link/Notes. Default</text>
<text xml:space="preserve" text-anchor="start" x="1012.27" y="-736.6" font-family="Arial" font-size="15.00" fill="#bfdbfe">Status should be Queued.</text>
</g>
<!-- dependencies -->
<g id="node3" class="node">
<title>dependencies</title>
<polygon fill="#64748b" stroke="#475569" stroke-width="0" points="384.32,-873.6 55.68,-873.6 55.68,-693.6 384.32,-693.6 384.32,-873.6"/>
<text xml:space="preserve" text-anchor="start" x="156.06" y="-822.6" font-family="Arial" font-size="20.00" fill="#f8fafc">Dependencies</text>
<text xml:space="preserve" text-anchor="start" x="86.6" y="-799.6" font-family="Arial" font-size="15.00" fill="#cbd5e1">Real blockers only: application work can</text>
<text xml:space="preserve" text-anchor="start" x="112.01" y="-781.6" font-family="Arial" font-size="15.00" fill="#cbd5e1">depend on resume/snippet prep;</text>
<text xml:space="preserve" text-anchor="start" x="78.25" y="-763.6" font-family="Arial" font-size="15.00" fill="#cbd5e1">website request flow depends on Tally and</text>
<text xml:space="preserve" text-anchor="start" x="130.37" y="-745.6" font-family="Arial" font-size="15.00" fill="#cbd5e1">Notion intake; offer traction</text>
<text xml:space="preserve" text-anchor="start" x="75.73" y="-727.6" font-family="Arial" font-size="15.00" fill="#cbd5e1">depends on website, proof, outreach, and a</text>
</g>
<!-- tasks -->
<g id="node4" class="node">
<title>tasks</title>
<polygon fill="#0284c7" stroke="#0369a1" stroke-width="0" points="387.01,-546.8 52.99,-546.8 52.99,-374.8 387.01,-374.8 387.01,-546.8"/>
<text xml:space="preserve" text-anchor="start" x="138.86" y="-499.8" font-family="Arial" font-size="20.00" fill="#f0f9ff">Opportunity Tasks</text>
<text xml:space="preserve" text-anchor="start" x="90.79" y="-476.8" font-family="Arial" font-size="15.00" fill="#b6ecf7">Executable work. Fields: Task, Project,</text>
<text xml:space="preserve" text-anchor="start" x="112.04" y="-458.8" font-family="Arial" font-size="15.00" fill="#b6ecf7">Status, Duration, Money Priority,</text>
<text xml:space="preserve" text-anchor="start" x="121.63" y="-440.8" font-family="Arial" font-size="15.00" fill="#b6ecf7">Work Date, Shift, Link, Notes.</text>
<text xml:space="preserve" text-anchor="start" x="77.01" y="-422.8" font-family="Arial" font-size="15.00" fill="#b6ecf7">Status contract: Queued, Today, In Motion,</text>
<text xml:space="preserve" text-anchor="start" x="142.88" y="-404.8" font-family="Arial" font-size="15.00" fill="#b6ecf7">Waiting, Done, Parked.</text>
</g>
<!-- taskviews -->
<g id="node5" class="node">
<title>taskviews</title>
<polygon fill="#3b82f6" stroke="#2563eb" stroke-width="0" points="392.41,-228 47.59,-228 47.59,-48 392.41,-48 392.41,-228"/>
<text xml:space="preserve" text-anchor="start" x="168.88" y="-177" font-family="Arial" font-size="20.00" fill="#eff6ff">Task Views</text>
<text xml:space="preserve" text-anchor="start" x="71.61" y="-154" font-family="Arial" font-size="15.00" fill="#bfdbfe">Views over Opportunity Tasks: Focus Board,</text>
<text xml:space="preserve" text-anchor="start" x="122.89" y="-136" font-family="Arial" font-size="15.00" fill="#bfdbfe">Daily Blocks, Work Calendar,</text>
<text xml:space="preserve" text-anchor="start" x="89.92" y="-118" font-family="Arial" font-size="15.00" fill="#bfdbfe">Applications, Freelance, Singleton, and</text>
<text xml:space="preserve" text-anchor="start" x="87.85" y="-100" font-family="Arial" font-size="15.00" fill="#bfdbfe">Portfolio. These are lenses, not sources</text>
<text xml:space="preserve" text-anchor="start" x="194.57" y="-82" font-family="Arial" font-size="15.00" fill="#bfdbfe">of truth.</text>
</g>
<!-- operator -->
<g id="node6" class="node">
<title>operator</title>
<polygon fill="#a35829" stroke="#7e451d" stroke-width="0" points="1118.65,-1205.6 773.35,-1205.6 773.35,-1025.6 1118.65,-1025.6 1118.65,-1205.6"/>
<text xml:space="preserve" text-anchor="start" x="906.54" y="-1154.6" font-family="Arial" font-size="20.00" fill="#ffe0c2">Operator</text>
<text xml:space="preserve" text-anchor="start" x="810.52" y="-1131.6" font-family="Arial" font-size="15.00" fill="#f9b27c">The working user. Uses mobile, desktop,</text>
<text xml:space="preserve" text-anchor="start" x="830.52" y="-1113.6" font-family="Arial" font-size="15.00" fill="#f9b27c">Raycast, Codex, Notion, Bear, and</text>
<text xml:space="preserve" text-anchor="start" x="796.34" y="-1095.6" font-family="Arial" font-size="15.00" fill="#f9b27c">Eagle to move job search, Upwork, Singleton</text>
<text xml:space="preserve" text-anchor="start" x="851.37" y="-1077.6" font-family="Arial" font-size="15.00" fill="#f9b27c">offer, and proof work without</text>
<text xml:space="preserve" text-anchor="start" x="793.4" y="-1059.6" font-family="Arial" font-size="15.00" fill="#f9b27c">repeatedly deciding where each item belongs.</text>
</g>
<!-- logtask -->
<g id="node7" class="node">
<title>logtask</title>
<polygon fill="#3b82f6" stroke="#2563eb" stroke-width="0" points="1705.46,-1205.6 1378.54,-1205.6 1378.54,-1025.6 1705.46,-1025.6 1705.46,-1205.6"/>
<text xml:space="preserve" text-anchor="start" x="1500.87" y="-1145.6" font-family="Arial" font-size="20.00" fill="#eff6ff">Log Task</text>
<text xml:space="preserve" text-anchor="start" x="1402.77" y="-1122.6" font-family="Arial" font-size="15.00" fill="#bfdbfe">Create an Opportunity Task from selected</text>
<text xml:space="preserve" text-anchor="start" x="1453.2" y="-1104.6" font-family="Arial" font-size="15.00" fill="#bfdbfe">text, clipboard link, manual</text>
<text xml:space="preserve" text-anchor="start" x="1398.6" y="-1086.6" font-family="Arial" font-size="15.00" fill="#bfdbfe">form input, or mobile/share context. Default</text>
<text xml:space="preserve" text-anchor="start" x="1487.8" y="-1068.6" font-family="Arial" font-size="15.00" fill="#bfdbfe">Status: Queued.</text>
</g>
<!-- updatetask -->
<g id="node8" class="node">
<title>updatetask</title>
<polygon fill="#3b82f6" stroke="#2563eb" stroke-width="0" points="1709.2,-873.6 1374.8,-873.6 1374.8,-693.6 1709.2,-693.6 1709.2,-873.6"/>
<text xml:space="preserve" text-anchor="start" x="1485.31" y="-804.6" font-family="Arial" font-size="20.00" fill="#eff6ff">Update Task</text>
<text xml:space="preserve" text-anchor="start" x="1394.85" y="-781.6" font-family="Arial" font-size="15.00" fill="#bfdbfe">Update Status, Money Priority, Project, Link,</text>
<text xml:space="preserve" text-anchor="start" x="1513.66" y="-763.6" font-family="Arial" font-size="15.00" fill="#bfdbfe">or Notes</text>
<text xml:space="preserve" text-anchor="start" x="1434.44" y="-745.6" font-family="Arial" font-size="15.00" fill="#bfdbfe">on an existing Opportunity Task.</text>
</g>
<!-- searchrun -->
<g id="node9" class="node">
<title>searchrun</title>
<polygon fill="#3b82f6" stroke="#2563eb" stroke-width="0" points="1719.63,-550.8 1364.37,-550.8 1364.37,-370.8 1719.63,-370.8 1719.63,-550.8"/>
<text xml:space="preserve" text-anchor="start" x="1434.72" y="-490.8" font-family="Arial" font-size="20.00" fill="#eff6ff">Opportunity Search Run</text>
<text xml:space="preserve" text-anchor="start" x="1384.43" y="-467.8" font-family="Arial" font-size="15.00" fill="#bfdbfe">Codex&#45;owned manual workflow. Search current</text>
<text xml:space="preserve" text-anchor="start" x="1447.79" y="-449.8" font-family="Arial" font-size="15.00" fill="#bfdbfe">jobs or leads, return winners</text>
<text xml:space="preserve" text-anchor="start" x="1410.25" y="-431.8" font-family="Arial" font-size="15.00" fill="#bfdbfe">for approval, then log approved tasks to</text>
<text xml:space="preserve" text-anchor="start" x="1487.81" y="-413.8" font-family="Arial" font-size="15.00" fill="#bfdbfe">Opportunity HQ.</text>
</g>
<!-- exportblocks -->
<g id="node10" class="node">
<title>exportblocks</title>
<polygon fill="#3b82f6" stroke="#2563eb" stroke-width="0" points="1721.73,-228 1362.27,-228 1362.27,-48 1721.73,-48 1721.73,-228"/>
<text xml:space="preserve" text-anchor="start" x="1450.86" y="-168" font-family="Arial" font-size="20.00" fill="#eff6ff">Export Focus Blocks</text>
<text xml:space="preserve" text-anchor="start" x="1382.33" y="-145" font-family="Arial" font-size="15.00" fill="#bfdbfe">Codex&#45;owned manual workflow. Read approved</text>
<text xml:space="preserve" text-anchor="start" x="1448.21" y="-127" font-family="Arial" font-size="15.00" fill="#bfdbfe">Opportunity Tasks, build 3&#45;5</text>
<text xml:space="preserve" text-anchor="start" x="1408.2" y="-109" font-family="Arial" font-size="15.00" fill="#bfdbfe">realistic time blocks, export .ics, and ask</text>
<text xml:space="preserve" text-anchor="start" x="1466.11" y="-91" font-family="Arial" font-size="15.00" fill="#bfdbfe">before Notion updates.</text>
</g>
<!-- goalcheckin -->
<g id="node11" class="node">
<title>goalcheckin</title>
<polygon fill="#3b82f6" stroke="#2563eb" stroke-width="0" points="2152.47,-1205.6 1815.53,-1205.6 1815.53,-1025.6 2152.47,-1025.6 2152.47,-1205.6"/>
<text xml:space="preserve" text-anchor="start" x="1920.08" y="-1154.6" font-family="Arial" font-size="20.00" fill="#eff6ff">Goal Check&#45;In</text>
<text xml:space="preserve" text-anchor="start" x="1850.2" y="-1131.6" font-family="Arial" font-size="15.00" fill="#bfdbfe">Future small command. Ask count/result</text>
<text xml:space="preserve" text-anchor="start" x="1897.28" y="-1113.6" font-family="Arial" font-size="15.00" fill="#bfdbfe">questions for applications,</text>
<text xml:space="preserve" text-anchor="start" x="1835.59" y="-1095.6" font-family="Arial" font-size="15.00" fill="#bfdbfe">freelance proposals, Strategic work, and real</text>
<text xml:space="preserve" text-anchor="start" x="1892.29" y="-1077.6" font-family="Arial" font-size="15.00" fill="#bfdbfe">blockers. Output one or two</text>
<text xml:space="preserve" text-anchor="start" x="1853.93" y="-1059.6" font-family="Arial" font-size="15.00" fill="#bfdbfe">daily implications, not a full plan or new</text>
</g>
<!-- bear&#45;&gt;tasks -->
<g id="edge3" class="edge">
<title>bear&#45;&gt;tasks</title>
<path fill="none" stroke="#8d8d8d" stroke-width="2" stroke-dasharray="5,2" d="M538.02,-693.67C477.9,-649.83 405.51,-597.05 344.99,-552.93"/>
<polygon fill="#8d8d8d" stroke="#8d8d8d" stroke-width="2" points="346.58,-550.84 338.98,-548.54 343.49,-555.08 346.58,-550.84"/>
<polygon fill="#18191b" fill-opacity="0.627451" stroke="none" points="453.19,-610.8 453.19,-633.6 510.55,-633.6 510.55,-610.8 453.19,-610.8"/>
<text xml:space="preserve" text-anchor="start" x="456.19" y="-616.6" font-family="Arial" font-size="14.00" fill="#c9c9c9">promote</text>
</g>
<!-- mobileform&#45;&gt;tasks -->
<g id="edge4" class="edge">
<title>mobileform&#45;&gt;tasks</title>
<path fill="none" stroke="#8d8d8d" stroke-width="2" stroke-dasharray="5,2" d="M960.43,-693.62C934.62,-679.07 907.44,-665.04 881,-653.6 722.66,-585.09 532.66,-532.84 397.08,-500.31"/>
<polygon fill="#8d8d8d" stroke="#8d8d8d" stroke-width="2" points="397.86,-497.8 389.95,-498.61 396.64,-502.91 397.86,-497.8"/>
<polygon fill="#18191b" fill-opacity="0.627451" stroke="none" points="829.5,-610.8 829.5,-633.6 874.41,-633.6 874.41,-610.8 829.5,-610.8"/>
<text xml:space="preserve" text-anchor="start" x="832.5" y="-616.6" font-family="Arial" font-size="14.00" fill="#c9c9c9">create</text>
</g>
<!-- dependencies&#45;&gt;tasks -->
<g id="edge8" class="edge">
<title>dependencies&#45;&gt;tasks</title>
<path fill="none" stroke="#8d8d8d" stroke-width="2" stroke-dasharray="5,2" d="M220,-693.67C220,-651.27 220,-600.5 220,-557.29"/>
<polygon fill="#8d8d8d" stroke="#8d8d8d" stroke-width="2" points="222.63,-557.29 220,-549.79 217.38,-557.29 222.63,-557.29"/>
<polygon fill="#18191b" fill-opacity="0.627451" stroke="none" points="220,-610.8 220,-633.6 258.68,-633.6 258.68,-610.8 220,-610.8"/>
<text xml:space="preserve" text-anchor="start" x="223" y="-616.6" font-family="Arial" font-size="14.00" fill="#c9c9c9">block</text>
</g>
<!-- tasks&#45;&gt;taskviews -->
<g id="edge9" class="edge">
<title>tasks&#45;&gt;taskviews</title>
<path fill="none" stroke="#8d8d8d" stroke-width="2" stroke-dasharray="5,2" d="M220,-375.09C220,-333.08 220,-282.06 220,-238.23"/>
<polygon fill="#8d8d8d" stroke="#8d8d8d" stroke-width="2" points="222.63,-238.36 220,-230.86 217.38,-238.36 222.63,-238.36"/>
<polygon fill="#18191b" fill-opacity="0.627451" stroke="none" points="220,-288 220,-310.8 266.47,-310.8 266.47,-288 220,-288"/>
<text xml:space="preserve" text-anchor="start" x="223" y="-293.8" font-family="Arial" font-size="14.00" fill="#c9c9c9">render</text>
</g>
<!-- operator&#45;&gt;bear -->
<g id="edge1" class="edge">
<title>operator&#45;&gt;bear</title>
<path fill="none" stroke="#8d8d8d" stroke-width="2" stroke-dasharray="5,2" d="M868.98,-1025.73C830.27,-981.07 783.3,-926.87 743.7,-881.18"/>
<polygon fill="#8d8d8d" stroke="#8d8d8d" stroke-width="2" points="745.79,-879.58 738.89,-875.63 741.82,-883.01 745.79,-879.58"/>
<polygon fill="#18191b" fill-opacity="0.627451" stroke="none" points="811.58,-942.8 811.58,-965.6 864.27,-965.6 864.27,-942.8 811.58,-942.8"/>
<text xml:space="preserve" text-anchor="start" x="814.58" y="-948.6" font-family="Arial" font-size="14.00" fill="#c9c9c9">capture</text>
</g>
<!-- operator&#45;&gt;mobileform -->
<g id="edge2" class="edge">
<title>operator&#45;&gt;mobileform</title>
<path fill="none" stroke="#8d8d8d" stroke-width="2" stroke-dasharray="5,2" d="M987.2,-1025.73C1007.65,-981.62 1032.42,-928.21 1053.43,-882.88"/>
<polygon fill="#8d8d8d" stroke="#8d8d8d" stroke-width="2" points="1055.81,-884 1056.58,-876.09 1051.05,-881.79 1055.81,-884"/>
<polygon fill="#18191b" fill-opacity="0.627451" stroke="none" points="1022.5,-942.8 1022.5,-965.6 1047.18,-965.6 1047.18,-942.8 1022.5,-942.8"/>
<text xml:space="preserve" text-anchor="start" x="1025.5" y="-948.6" font-family="Arial" font-size="14.00" fill="#c9c9c9">log</text>
</g>
<!-- logtask&#45;&gt;updatetask -->
<!-- updatetask&#45;&gt;searchrun -->
<!-- searchrun&#45;&gt;exportblocks -->
</g>
</svg>
`;case`proof_capture_flow`:return`<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN"
 "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<!-- Generated by graphviz version 14.1.5 (0)
 -->
<!-- Pages: 1 -->
<svg width="1361pt" height="922pt"
 viewBox="0.00 0.00 1361.00 922.00" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
<g id="graph0" class="graph" transform="scale(1 1) rotate(0) translate(15.05 907.05)">
<g id="clust1" class="cluster">
<title>cluster_durable</title>
<polygon fill="#3e4651" stroke="#2d333d" points="8,-340 8,-621.2 915,-621.2 915,-340 8,-340"/>
<text xml:space="preserve" text-anchor="start" x="16" y="-608.3" font-family="Arial" font-weight="bold" font-size="11.00" fill="#cbd5e1" fill-opacity="0.701961">OPPORTUNITY HQ</text>
</g>
<g id="clust2" class="cluster">
<title>cluster_publishing</title>
<polygon fill="#3e4651" stroke="#2d333d" points="233,-8 233,-289.2 1077,-289.2 1077,-8 233,-8"/>
<text xml:space="preserve" text-anchor="start" x="241" y="-276.3" font-family="Arial" font-weight="bold" font-size="11.00" fill="#cbd5e1" fill-opacity="0.701961">PUBLISHING SURFACES</text>
</g>
<!-- projects -->
<g id="node1" class="node">
<title>projects</title>
<path fill="#0284c7" stroke="#0369a1" stroke-width="2" d="M389.56,-543.64C389.56,-552.67 313.11,-560 219,-560 124.89,-560 48.44,-552.67 48.44,-543.64 48.44,-543.64 48.44,-396.36 48.44,-396.36 48.44,-387.33 124.89,-380 219,-380 313.11,-380 389.56,-387.33 389.56,-396.36 389.56,-396.36 389.56,-543.64 389.56,-543.64"/>
<path fill="none" stroke="#0369a1" stroke-width="2" d="M389.56,-543.64C389.56,-534.61 313.11,-527.27 219,-527.27 124.89,-527.27 48.44,-534.61 48.44,-543.64"/>
<text xml:space="preserve" text-anchor="start" x="128.4" y="-500" font-family="Arial" font-size="20.00" fill="#f0f9ff">Opportunity Projects</text>
<text xml:space="preserve" text-anchor="start" x="81.43" y="-477" font-family="Arial" font-size="15.00" fill="#b6ecf7">Durable project lanes: Cash Jobs, Career</text>
<text xml:space="preserve" text-anchor="start" x="111.04" y="-459" font-family="Arial" font-size="15.00" fill="#b6ecf7">Jobs, Freelance, Offer, Portfolio.</text>
<text xml:space="preserve" text-anchor="start" x="68.49" y="-441" font-family="Arial" font-size="15.00" fill="#b6ecf7">Finishable deliverables belong as tasks/goals</text>
<text xml:space="preserve" text-anchor="start" x="159.38" y="-423" font-family="Arial" font-size="15.00" fill="#b6ecf7">under these rows.</text>
</g>
<!-- tasks -->
<g id="node2" class="node">
<title>tasks</title>
<polygon fill="#0284c7" stroke="#0369a1" stroke-width="0" points="875.01,-556 540.99,-556 540.99,-384 875.01,-384 875.01,-556"/>
<text xml:space="preserve" text-anchor="start" x="626.86" y="-509" font-family="Arial" font-size="20.00" fill="#f0f9ff">Opportunity Tasks</text>
<text xml:space="preserve" text-anchor="start" x="578.79" y="-486" font-family="Arial" font-size="15.00" fill="#b6ecf7">Executable work. Fields: Task, Project,</text>
<text xml:space="preserve" text-anchor="start" x="600.04" y="-468" font-family="Arial" font-size="15.00" fill="#b6ecf7">Status, Duration, Money Priority,</text>
<text xml:space="preserve" text-anchor="start" x="609.63" y="-450" font-family="Arial" font-size="15.00" fill="#b6ecf7">Work Date, Shift, Link, Notes.</text>
<text xml:space="preserve" text-anchor="start" x="565.01" y="-432" font-family="Arial" font-size="15.00" fill="#b6ecf7">Status contract: Queued, Today, In Motion,</text>
<text xml:space="preserve" text-anchor="start" x="630.88" y="-414" font-family="Arial" font-size="15.00" fill="#b6ecf7">Waiting, Done, Parked.</text>
</g>
<!-- website -->
<g id="node3" class="node">
<title>website</title>
<polygon fill="#428a4f" stroke="#2d5d39" stroke-width="0" points="593.02,-228 272.98,-228 272.98,-48 593.02,-48 593.02,-228"/>
<text xml:space="preserve" text-anchor="start" x="352.4" y="-159" font-family="Arial" font-size="20.00" fill="#f8fafc">Singleton Website</text>
<text xml:space="preserve" text-anchor="start" x="297.52" y="-136" font-family="Arial" font-size="15.00" fill="#c2f0c2">Public proof and offer surface. Pulls from</text>
<text xml:space="preserve" text-anchor="start" x="331.27" y="-118" font-family="Arial" font-size="15.00" fill="#c2f0c2">packaged proof and clear offer</text>
<text xml:space="preserve" text-anchor="start" x="342.14" y="-100" font-family="Arial" font-size="15.00" fill="#c2f0c2">work, not from raw capture.</text>
</g>
<!-- proposals -->
<g id="node4" class="node">
<title>proposals</title>
<polygon fill="#a35829" stroke="#7e451d" stroke-width="0" points="1036.8,-228 703.2,-228 703.2,-48 1036.8,-48 1036.8,-228"/>
<text xml:space="preserve" text-anchor="start" x="763.28" y="-168" font-family="Arial" font-size="20.00" fill="#ffe0c2">Applications / Proposals</text>
<text xml:space="preserve" text-anchor="start" x="723.26" y="-145" font-family="Arial" font-size="15.00" fill="#f9b27c">Outbound artifacts: job applications, Upwork</text>
<text xml:space="preserve" text-anchor="start" x="781.62" y="-127" font-family="Arial" font-size="15.00" fill="#f9b27c">proposals, direct outreach,</text>
<text xml:space="preserve" text-anchor="start" x="739.1" y="-109" font-family="Arial" font-size="15.00" fill="#f9b27c">cover notes, and follow&#45;ups. Their state</text>
<text xml:space="preserve" text-anchor="start" x="782.05" y="-91" font-family="Arial" font-size="15.00" fill="#f9b27c">returns to Opportunity HQ.</text>
</g>
<!-- operator -->
<g id="node5" class="node">
<title>operator</title>
<polygon fill="#a35829" stroke="#7e451d" stroke-width="0" points="1330.65,-892 985.35,-892 985.35,-712 1330.65,-712 1330.65,-892"/>
<text xml:space="preserve" text-anchor="start" x="1118.54" y="-841" font-family="Arial" font-size="20.00" fill="#ffe0c2">Operator</text>
<text xml:space="preserve" text-anchor="start" x="1022.52" y="-818" font-family="Arial" font-size="15.00" fill="#f9b27c">The working user. Uses mobile, desktop,</text>
<text xml:space="preserve" text-anchor="start" x="1042.52" y="-800" font-family="Arial" font-size="15.00" fill="#f9b27c">Raycast, Codex, Notion, Bear, and</text>
<text xml:space="preserve" text-anchor="start" x="1008.34" y="-782" font-family="Arial" font-size="15.00" fill="#f9b27c">Eagle to move job search, Upwork, Singleton</text>
<text xml:space="preserve" text-anchor="start" x="1063.37" y="-764" font-family="Arial" font-size="15.00" fill="#f9b27c">offer, and proof work without</text>
<text xml:space="preserve" text-anchor="start" x="1005.4" y="-746" font-family="Arial" font-size="15.00" fill="#f9b27c">repeatedly deciding where each item belongs.</text>
</g>
<!-- captureportfolio -->
<g id="node6" class="node">
<title>captureportfolio</title>
<polygon fill="#3b82f6" stroke="#2563eb" stroke-width="0" points="1331.07,-560 984.93,-560 984.93,-380 1331.07,-380 1331.07,-560"/>
<text xml:space="preserve" text-anchor="start" x="1082.96" y="-500" font-family="Arial" font-size="20.00" fill="#eff6ff">Capture Portfolio</text>
<text xml:space="preserve" text-anchor="start" x="1004.98" y="-477" font-family="Arial" font-size="15.00" fill="#bfdbfe">Import the selected asset to Eagle, append an</text>
<text xml:space="preserve" text-anchor="start" x="1069.18" y="-459" font-family="Arial" font-size="15.00" fill="#bfdbfe">Added to Eagle note to the</text>
<text xml:space="preserve" text-anchor="start" x="1016.68" y="-441" font-family="Arial" font-size="15.00" fill="#bfdbfe">selected Portfolio task, then mark that task</text>
<text xml:space="preserve" text-anchor="start" x="1137.99" y="-423" font-family="Arial" font-size="15.00" fill="#bfdbfe">Done.</text>
</g>
<!-- portfoliostore -->
<g id="node7" class="node">
<title>portfoliostore</title>
<path fill="#428a4f" stroke="#2d5d39" stroke-width="2" d="M874.38,-875.64C874.38,-884.67 799.81,-892 708,-892 616.19,-892 541.62,-884.67 541.62,-875.64 541.62,-875.64 541.62,-728.36 541.62,-728.36 541.62,-719.33 616.19,-712 708,-712 799.81,-712 874.38,-719.33 874.38,-728.36 874.38,-728.36 874.38,-875.64 874.38,-875.64"/>
<path fill="none" stroke="#2d5d39" stroke-width="2" d="M874.38,-875.64C874.38,-866.61 799.81,-859.27 708,-859.27 616.19,-859.27 541.62,-866.61 541.62,-875.64"/>
<text xml:space="preserve" text-anchor="start" x="609.62" y="-832" font-family="Arial" font-size="20.00" fill="#f8fafc">Eagle Portfolio Library</text>
<text xml:space="preserve" text-anchor="start" x="561.68" y="-809" font-family="Arial" font-size="15.00" fill="#c2f0c2">Portfolio/evidence store. Holds screenshots,</text>
<text xml:space="preserve" text-anchor="start" x="570.85" y="-791" font-family="Arial" font-size="15.00" fill="#c2f0c2">videos, PDFs, reels, examples, and proof</text>
<text xml:space="preserve" text-anchor="start" x="576.26" y="-773" font-family="Arial" font-size="15.00" fill="#c2f0c2">assets. Eagle does not own task status;</text>
<text xml:space="preserve" text-anchor="start" x="635.46" y="-755" font-family="Arial" font-size="15.00" fill="#c2f0c2">Opportunity HQ does.</text>
</g>
<!-- projects&#45;&gt;tasks -->
<g id="edge3" class="edge">
<title>projects&#45;&gt;tasks</title>
<path fill="none" stroke="#8d8d8d" stroke-width="2" stroke-dasharray="5,2" d="M390.37,-470C435.8,-470 484.94,-470 530.68,-470"/>
<polygon fill="#8d8d8d" stroke="#8d8d8d" stroke-width="2" points="530.47,-472.63 537.97,-470 530.47,-467.38 530.47,-472.63"/>
<polygon fill="#18191b" fill-opacity="0.627451" stroke="none" points="444.37,-473 444.37,-495.8 486.18,-495.8 486.18,-473 444.37,-473"/>
<text xml:space="preserve" text-anchor="start" x="447.37" y="-478.8" font-family="Arial" font-size="14.00" fill="#c9c9c9">group</text>
</g>
<!-- tasks&#45;&gt;website -->
<g id="edge4" class="edge">
<title>tasks&#45;&gt;website</title>
<path fill="none" stroke="#8d8d8d" stroke-width="2" stroke-dasharray="5,2" d="M637.18,-384.02C599.42,-338.7 552.81,-282.77 513.66,-235.79"/>
<polygon fill="#8d8d8d" stroke="#8d8d8d" stroke-width="2" points="515.7,-234.14 508.88,-230.05 511.66,-237.5 515.7,-234.14"/>
<polygon fill="#18191b" fill-opacity="0.627451" stroke="none" points="578.75,-297.2 578.75,-320 637.68,-320 637.68,-297.2 578.75,-297.2"/>
<text xml:space="preserve" text-anchor="start" x="581.75" y="-303" font-family="Arial" font-size="14.00" fill="#c9c9c9">package</text>
</g>
<!-- tasks&#45;&gt;proposals -->
<g id="edge5" class="edge">
<title>tasks&#45;&gt;proposals</title>
<path fill="none" stroke="#8d8d8d" stroke-width="2" stroke-dasharray="5,2" d="M678.99,-384.06C673.84,-355.44 673.46,-323.98 685.77,-297.2 696.25,-274.37 711.84,-253.6 729.59,-235.16"/>
<polygon fill="#8d8d8d" stroke="#8d8d8d" stroke-width="2" points="731.2,-237.26 734.63,-230.09 727.48,-233.56 731.2,-237.26"/>
<polygon fill="#18191b" fill-opacity="0.627451" stroke="none" points="685.77,-297.2 685.77,-320 733,-320 733,-297.2 685.77,-297.2"/>
<text xml:space="preserve" text-anchor="start" x="688.77" y="-303" font-family="Arial" font-size="14.00" fill="#c9c9c9">submit</text>
</g>
<!-- proposals&#45;&gt;tasks -->
<g id="edge6" class="edge">
<title>proposals&#45;&gt;tasks</title>
<path fill="none" stroke="#8d8d8d" stroke-width="2" stroke-dasharray="5,2" d="M826.44,-227.73C804.15,-273.13 777.01,-328.42 754.34,-374.61"/>
<polygon fill="#8d8d8d" stroke="#8d8d8d" stroke-width="2" points="752,-373.41 751.05,-381.3 756.71,-375.72 752,-373.41"/>
<polygon fill="#18191b" fill-opacity="0.627451" stroke="none" points="789,-297.2 789,-320 837.82,-320 837.82,-297.2 789,-297.2"/>
<text xml:space="preserve" text-anchor="start" x="792" y="-303" font-family="Arial" font-size="14.00" fill="#c9c9c9">update</text>
</g>
<!-- operator&#45;&gt;captureportfolio -->
<!-- portfoliostore&#45;&gt;tasks -->
<g id="edge2" class="edge">
<title>portfoliostore&#45;&gt;tasks</title>
<path fill="none" stroke="#8d8d8d" stroke-width="2" stroke-dasharray="5,2" d="M708,-711.26C708,-666.38 708,-612.03 708,-566.39"/>
<polygon fill="#8d8d8d" stroke="#8d8d8d" stroke-width="2" points="710.63,-566.42 708,-558.92 705.38,-566.42 710.63,-566.42"/>
<polygon fill="#18191b" fill-opacity="0.627451" stroke="none" points="708,-629.2 708,-652 752.14,-652 752.14,-629.2 708,-629.2"/>
<text xml:space="preserve" text-anchor="start" x="711" y="-635" font-family="Arial" font-size="14.00" fill="#c9c9c9">attach</text>
</g>
</g>
</svg>
`;default:throw Error(`Unknown viewId: `+e)}};export{e as dotSource,t as svgSource};