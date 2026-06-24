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
        label=<<TABLE BORDER="0" CELLPADDING="0" CELLSPACING="4"><TR><TD><FONT POINT-SIZE="20">Raycast / Codex Actions</FONT></TD></TR><TR><TD><FONT POINT-SIZE="15" COLOR="#bfdbfe">Action layer. It creates, updates, plans,<BR/>opens, drafts, and attaches. It<BR/>should not invent a second task model.</FONT></TD></TR></TABLE>>,
        likec4_id=actions,
        likec4_level=0,
        margin="0.223,0.223",
        width=4.445];
    operator -> actions [arrowhead=normal,
        label=<<TABLE BORDER="0" CELLPADDING="3" CELLSPACING="0" BGCOLOR="#18191BA0"><TR><TD ALIGN="TEXT" BALIGN="LEFT"><FONT POINT-SIZE="14">trigger</FONT></TD></TR></TABLE>>,
        likec4_id="5lllyf",
        style=dashed];
    proof [height=2.5,
        label=<<TABLE BORDER="0" CELLPADDING="0" CELLSPACING="4"><TR><TD><FONT POINT-SIZE="20">Eagle Proof Library</FONT></TD></TR><TR><TD><FONT POINT-SIZE="15" COLOR="#bfdbfe">Evidence store. Holds screenshots, videos,<BR/>PDFs, reels, examples, and proof<BR/>assets. Eagle does not own task status;<BR/>Opportunity HQ does.</FONT></TD></TR></TABLE>>,
        likec4_id=proof,
        likec4_level=0,
        margin="0.223,0.223",
        width=4.445];
    durable [height=2.5,
        label=<<TABLE BORDER="0" CELLPADDING="0" CELLSPACING="4"><TR><TD><FONT POINT-SIZE="20">Opportunity HQ</FONT></TD></TR><TR><TD><FONT POINT-SIZE="15" COLOR="#bfdbfe">Notion is durable truth. It owns projects,<BR/>tasks, status, time estimates,<BR/>daily work blocks, links, notes, and proof<BR/>attachments. Views are not new<BR/>databases.</FONT></TD></TR></TABLE>>,
        likec4_id=durable,
        likec4_level=0,
        margin="0.223,0.223",
        width=4.445];
    proof -> durable [arrowhead=normal,
        label=<<TABLE BORDER="0" CELLPADDING="3" CELLSPACING="0" BGCOLOR="#18191BA0"><TR><TD ALIGN="TEXT" BALIGN="LEFT"><FONT POINT-SIZE="14">attach</FONT></TD></TR></TABLE>>,
        likec4_id="1fdqtgn",
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
    actions -> proof [arrowhead=normal,
        label=<<TABLE BORDER="0" CELLPADDING="3" CELLSPACING="0" BGCOLOR="#18191BA0"><TR><TD ALIGN="TEXT" BALIGN="LEFT"><FONT POINT-SIZE="14">capture</FONT></TD></TR></TABLE>>,
        likec4_id="1enagrn",
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
            label=<<TABLE BORDER="0" CELLPADDING="0" CELLSPACING="4"><TR><TD><FONT POINT-SIZE="20">Mobile Task Form</FONT></TD></TR><TR><TD><FONT POINT-SIZE="15" COLOR="#bfdbfe">Fast durable capture path for task-shaped<BR/>work. Minimum fields: Task,<BR/>Bucket, Time, and Link/Notes. Default Status<BR/>should be Queued.</FONT></TD></TR></TABLE>>,
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
            label=<<TABLE BORDER="0" CELLPADDING="0" CELLSPACING="4"><TR><TD><FONT POINT-SIZE="20">Opportunity Projects</FONT></TD></TR><TR><TD><FONT POINT-SIZE="15" COLOR="#B6ECF7">Outcomes that need multiple tasks, proof, or<BR/>time planning. Buckets are<BR/>not projects. Example: Upwork consultation /<BR/>proposals.</FONT></TD></TR></TABLE>>,
            likec4_id="durable.projects",
            likec4_level=1,
            margin="0.223,0",
            penwidth=2,
            shape=cylinder,
            width=4.445];
        tasks [color="#0369a1",
            fillcolor="#0284c7",
            fontcolor="#f0f9ff",
            group=durable,
            height=2.389,
            label=<<TABLE BORDER="0" CELLPADDING="0" CELLSPACING="4"><TR><TD><FONT POINT-SIZE="20">Opportunity Tasks</FONT></TD></TR><TR><TD><FONT POINT-SIZE="15" COLOR="#B6ECF7">Executable work. Fields: Task, Bucket,<BR/>Status, Time, Money Priority,<BR/>Project, Work Date, Block, Link, Asset /<BR/>Proof Link, Notes.<BR/>Status contract: Queued, Today, In Motion,</FONT></TD></TR></TABLE>>,
            likec4_id="durable.tasks",
            likec4_level=1,
            margin="0.278,0.223",
            width=4.445];
        taskviews [group=durable,
            height=2.5,
            label=<<TABLE BORDER="0" CELLPADDING="0" CELLSPACING="4"><TR><TD><FONT POINT-SIZE="20">Task Views</FONT></TD></TR><TR><TD><FONT POINT-SIZE="15" COLOR="#bfdbfe">Views over Opportunity Tasks: Focus Board,<BR/>Daily Blocks, Work Calendar,<BR/>Applications, Upwork, Singleton, and Proof.<BR/>These are lenses, not sources<BR/>of truth.</FONT></TD></TR></TABLE>>,
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
        label=<<TABLE BORDER="0" CELLPADDING="0" CELLSPACING="4"><TR><TD><FONT POINT-SIZE="20">Update Task</FONT></TD></TR><TR><TD><FONT POINT-SIZE="15" COLOR="#bfdbfe">Update Status, Work Date, Block, Money<BR/>Priority, Project, Link, Notes, or<BR/>proof reference on an existing Opportunity<BR/>Task.</FONT></TD></TR></TABLE>>,
        likec4_id="actions.updateTask",
        likec4_level=0,
        margin="0.223,0.223",
        width=4.445];
    logtask -> updatetask [style=invis];
    plantoday [height=2.5,
        label=<<TABLE BORDER="0" CELLPADDING="0" CELLSPACING="4"><TR><TD><FONT POINT-SIZE="20">Plan Today</FONT></TD></TR><TR><TD><FONT POINT-SIZE="15" COLOR="#bfdbfe">Assign Work Date and Block. Moves selected<BR/>queue items into Today without<BR/>changing their real bucket or project.</FONT></TD></TR></TABLE>>,
        likec4_id="actions.planToday",
        likec4_level=0,
        margin="0.223,0.223",
        width=4.445];
    updatetask -> plantoday [style=invis];
    startapplication [height=2.5,
        label=<<TABLE BORDER="0" CELLPADDING="0" CELLSPACING="4"><TR><TD><FONT POINT-SIZE="20">Start Application</FONT></TD></TR><TR><TD><FONT POINT-SIZE="15" COLOR="#bfdbfe">Open a job link and resume path from the<BR/>selected task. Move the task to<BR/>In Motion while work is active.</FONT></TD></TR></TABLE>>,
        likec4_id="actions.startApplication",
        likec4_level=0,
        margin="0.223,0.223",
        width=4.445];
    plantoday -> startapplication [style=invis];
    draftproposal [height=2.5,
        label=<<TABLE BORDER="0" CELLPADDING="0" CELLSPACING="4"><TR><TD><FONT POINT-SIZE="20">Draft Proposal</FONT></TD></TR><TR><TD><FONT POINT-SIZE="15" COLOR="#bfdbfe">Turn a copied Upwork post into a proposal<BR/>draft and log the follow-up<BR/>state back to Opportunity HQ.</FONT></TD></TR></TABLE>>,
        likec4_id="actions.draftProposal",
        likec4_level=0,
        margin="0.223,0.223",
        width=4.445];
    captureproof [height=2.5,
        label=<<TABLE BORDER="0" CELLPADDING="0" CELLSPACING="4"><TR><TD><FONT POINT-SIZE="20">Capture Proof</FONT></TD></TR><TR><TD><FONT POINT-SIZE="15" COLOR="#bfdbfe">Import the selected asset to Eagle, attach<BR/>the proof link or note to the<BR/>selected Opportunity Task, then mark that<BR/>task Done when the proof item is<BR/>complete.</FONT></TD></TR></TABLE>>,
        likec4_id="actions.captureProof",
        likec4_level=0,
        margin="0.223,0.223",
        width=4.445];
    draftproposal -> captureproof [style=invis];
    proof [color="#2d5d39",
        fillcolor="#428a4f",
        fontcolor="#f8fafc",
        height=2.5,
        label=<<TABLE BORDER="0" CELLPADDING="0" CELLSPACING="4"><TR><TD><FONT POINT-SIZE="20">Eagle Proof Library</FONT></TD></TR><TR><TD><FONT POINT-SIZE="15" COLOR="#c2f0c2">Evidence store. Holds screenshots, videos,<BR/>PDFs, reels, examples, and proof<BR/>assets. Eagle does not own task status;<BR/>Opportunity HQ does.</FONT></TD></TR></TABLE>>,
        likec4_id=proof,
        likec4_level=0,
        margin="0.223,0",
        penwidth=2,
        shape=cylinder,
        width=4.445];
    proof -> tasks [arrowhead=normal,
        label=<<TABLE BORDER="0" CELLPADDING="3" CELLSPACING="0" BGCOLOR="#18191BA0"><TR><TD ALIGN="TEXT" BALIGN="LEFT"><FONT POINT-SIZE="14">attach</FONT></TD></TR></TABLE>>,
        likec4_id="10587cn",
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
            label=<<TABLE BORDER="0" CELLPADDING="0" CELLSPACING="4"><TR><TD><FONT POINT-SIZE="20">Mobile Task Form</FONT></TD></TR><TR><TD><FONT POINT-SIZE="15" COLOR="#bfdbfe">Fast durable capture path for task-shaped<BR/>work. Minimum fields: Task,<BR/>Bucket, Time, and Link/Notes. Default Status<BR/>should be Queued.</FONT></TD></TR></TABLE>>,
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
        tasks [color="#0369a1",
            fillcolor="#0284c7",
            fontcolor="#f0f9ff",
            height=2.389,
            label=<<TABLE BORDER="0" CELLPADDING="0" CELLSPACING="4"><TR><TD><FONT POINT-SIZE="20">Opportunity Tasks</FONT></TD></TR><TR><TD><FONT POINT-SIZE="15" COLOR="#B6ECF7">Executable work. Fields: Task, Bucket,<BR/>Status, Time, Money Priority,<BR/>Project, Work Date, Block, Link, Asset /<BR/>Proof Link, Notes.<BR/>Status contract: Queued, Today, In Motion,</FONT></TD></TR></TABLE>>,
            likec4_id="durable.tasks",
            likec4_level=1,
            margin="0.278,0.223",
            width=4.445];
        taskviews [height=2.5,
            label=<<TABLE BORDER="0" CELLPADDING="0" CELLSPACING="4"><TR><TD><FONT POINT-SIZE="20">Task Views</FONT></TD></TR><TR><TD><FONT POINT-SIZE="15" COLOR="#bfdbfe">Views over Opportunity Tasks: Focus Board,<BR/>Daily Blocks, Work Calendar,<BR/>Applications, Upwork, Singleton, and Proof.<BR/>These are lenses, not sources<BR/>of truth.</FONT></TD></TR></TABLE>>,
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
    tasks -> taskviews [arrowhead=normal,
        label=<<TABLE BORDER="0" CELLPADDING="3" CELLSPACING="0" BGCOLOR="#18191BA0"><TR><TD ALIGN="TEXT" BALIGN="LEFT"><FONT POINT-SIZE="14">render</FONT></TD></TR></TABLE>>,
        likec4_id=x3g4vb,
        minlen=0,
        style=dashed,
        weight=3];
    logtask [height=2.5,
        label=<<TABLE BORDER="0" CELLPADDING="0" CELLSPACING="4"><TR><TD><FONT POINT-SIZE="20">Log Task</FONT></TD></TR><TR><TD><FONT POINT-SIZE="15" COLOR="#bfdbfe">Create an Opportunity Task from selected<BR/>text, clipboard link, manual<BR/>form input, or mobile/share context. Default<BR/>Status: Queued.</FONT></TD></TR></TABLE>>,
        likec4_id="actions.logTask",
        likec4_level=0,
        margin="0.223,0.223",
        width=4.445];
    updatetask [height=2.5,
        label=<<TABLE BORDER="0" CELLPADDING="0" CELLSPACING="4"><TR><TD><FONT POINT-SIZE="20">Update Task</FONT></TD></TR><TR><TD><FONT POINT-SIZE="15" COLOR="#bfdbfe">Update Status, Work Date, Block, Money<BR/>Priority, Project, Link, Notes, or<BR/>proof reference on an existing Opportunity<BR/>Task.</FONT></TD></TR></TABLE>>,
        likec4_id="actions.updateTask",
        likec4_level=0,
        margin="0.223,0.223",
        width=4.445];
    logtask -> updatetask [style=invis];
    plantoday [height=2.5,
        label=<<TABLE BORDER="0" CELLPADDING="0" CELLSPACING="4"><TR><TD><FONT POINT-SIZE="20">Plan Today</FONT></TD></TR><TR><TD><FONT POINT-SIZE="15" COLOR="#bfdbfe">Assign Work Date and Block. Moves selected<BR/>queue items into Today without<BR/>changing their real bucket or project.</FONT></TD></TR></TABLE>>,
        likec4_id="actions.planToday",
        likec4_level=0,
        margin="0.223,0.223",
        width=4.445];
    updatetask -> plantoday [style=invis];
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
            label=<<TABLE BORDER="0" CELLPADDING="0" CELLSPACING="4"><TR><TD><FONT POINT-SIZE="20">Opportunity Projects</FONT></TD></TR><TR><TD><FONT POINT-SIZE="15" COLOR="#B6ECF7">Outcomes that need multiple tasks, proof, or<BR/>time planning. Buckets are<BR/>not projects. Example: Upwork consultation /<BR/>proposals.</FONT></TD></TR></TABLE>>,
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
            label=<<TABLE BORDER="0" CELLPADDING="0" CELLSPACING="4"><TR><TD><FONT POINT-SIZE="20">Opportunity Tasks</FONT></TD></TR><TR><TD><FONT POINT-SIZE="15" COLOR="#B6ECF7">Executable work. Fields: Task, Bucket,<BR/>Status, Time, Money Priority,<BR/>Project, Work Date, Block, Link, Asset /<BR/>Proof Link, Notes.<BR/>Status contract: Queued, Today, In Motion,</FONT></TD></TR></TABLE>>,
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
    captureproof [height=2.5,
        label=<<TABLE BORDER="0" CELLPADDING="0" CELLSPACING="4"><TR><TD><FONT POINT-SIZE="20">Capture Proof</FONT></TD></TR><TR><TD><FONT POINT-SIZE="15" COLOR="#bfdbfe">Import the selected asset to Eagle, attach<BR/>the proof link or note to the<BR/>selected Opportunity Task, then mark that<BR/>task Done when the proof item is<BR/>complete.</FONT></TD></TR></TABLE>>,
        likec4_id="actions.captureProof",
        likec4_level=0,
        margin="0.223,0.223",
        width=4.445];
    operator -> captureproof [style=invis];
    proof [color="#2d5d39",
        fillcolor="#428a4f",
        fontcolor="#f8fafc",
        height=2.5,
        label=<<TABLE BORDER="0" CELLPADDING="0" CELLSPACING="4"><TR><TD><FONT POINT-SIZE="20">Eagle Proof Library</FONT></TD></TR><TR><TD><FONT POINT-SIZE="15" COLOR="#c2f0c2">Evidence store. Holds screenshots, videos,<BR/>PDFs, reels, examples, and proof<BR/>assets. Eagle does not own task status;<BR/>Opportunity HQ does.</FONT></TD></TR></TABLE>>,
        likec4_id=proof,
        likec4_level=0,
        margin="0.223,0",
        penwidth=2,
        shape=cylinder,
        width=4.445];
    proof -> tasks [arrowhead=normal,
        label=<<TABLE BORDER="0" CELLPADDING="3" CELLSPACING="0" BGCOLOR="#18191BA0"><TR><TD ALIGN="TEXT" BALIGN="LEFT"><FONT POINT-SIZE="14">attach</FONT></TD></TR></TABLE>>,
        likec4_id="10587cn",
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
<svg width="1013pt" height="1501pt"
 viewBox="0.00 0.00 1013.00 1501.00" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
<g id="graph0" class="graph" transform="scale(1 1) rotate(0) translate(15.05 1486.25)">
<!-- operator -->
<g id="node1" class="node">
<title>operator</title>
<polygon fill="#3b82f6" stroke="#2563eb" stroke-width="0" points="899.11,-1471.2 553.81,-1471.2 553.81,-1291.2 899.11,-1291.2 899.11,-1471.2"/>
<text xml:space="preserve" text-anchor="start" x="687" y="-1420.2" font-family="Arial" font-size="20.00" fill="#eff6ff">Operator</text>
<text xml:space="preserve" text-anchor="start" x="590.98" y="-1397.2" font-family="Arial" font-size="15.00" fill="#bfdbfe">The working user. Uses mobile, desktop,</text>
<text xml:space="preserve" text-anchor="start" x="610.98" y="-1379.2" font-family="Arial" font-size="15.00" fill="#bfdbfe">Raycast, Codex, Notion, Bear, and</text>
<text xml:space="preserve" text-anchor="start" x="576.8" y="-1361.2" font-family="Arial" font-size="15.00" fill="#bfdbfe">Eagle to move job search, Upwork, Singleton</text>
<text xml:space="preserve" text-anchor="start" x="631.83" y="-1343.2" font-family="Arial" font-size="15.00" fill="#bfdbfe">offer, and proof work without</text>
<text xml:space="preserve" text-anchor="start" x="573.86" y="-1325.2" font-family="Arial" font-size="15.00" fill="#bfdbfe">repeatedly deciding where each item belongs.</text>
</g>
<!-- capture -->
<g id="node2" class="node">
<title>capture</title>
<polygon fill="#3b82f6" stroke="#2563eb" stroke-width="0" points="723.48,-1148.4 403.44,-1148.4 403.44,-968.4 723.48,-968.4 723.48,-1148.4"/>
<text xml:space="preserve" text-anchor="start" x="485.64" y="-1050.4" font-family="Arial" font-size="20.00" fill="#eff6ff">Capture Surfaces</text>
</g>
<!-- actions -->
<g id="node3" class="node">
<title>actions</title>
<polygon fill="#3b82f6" stroke="#2563eb" stroke-width="0" points="982.48,-502.8 662.44,-502.8 662.44,-322.8 982.48,-322.8 982.48,-502.8"/>
<text xml:space="preserve" text-anchor="start" x="713.52" y="-433.8" font-family="Arial" font-size="20.00" fill="#eff6ff">Raycast / Codex Actions</text>
<text xml:space="preserve" text-anchor="start" x="693.22" y="-410.8" font-family="Arial" font-size="15.00" fill="#bfdbfe">Action layer. It creates, updates, plans,</text>
<text xml:space="preserve" text-anchor="start" x="723.65" y="-392.8" font-family="Arial" font-size="15.00" fill="#bfdbfe">opens, drafts, and attaches. It</text>
<text xml:space="preserve" text-anchor="start" x="692.8" y="-374.8" font-family="Arial" font-size="15.00" fill="#bfdbfe">should not invent a second task model.</text>
</g>
<!-- proof -->
<g id="node4" class="node">
<title>proof</title>
<polygon fill="#3b82f6" stroke="#2563eb" stroke-width="0" points="326.92,-180 0,-180 0,0 326.92,0 326.92,-180"/>
<text xml:space="preserve" text-anchor="start" x="77.86" y="-120" font-family="Arial" font-size="20.00" fill="#eff6ff">Eagle Proof Library</text>
<text xml:space="preserve" text-anchor="start" x="20.06" y="-97" font-family="Arial" font-size="15.00" fill="#bfdbfe">Evidence store. Holds screenshots, videos,</text>
<text xml:space="preserve" text-anchor="start" x="52.16" y="-79" font-family="Arial" font-size="15.00" fill="#bfdbfe">PDFs, reels, examples, and proof</text>
<text xml:space="preserve" text-anchor="start" x="31.72" y="-61" font-family="Arial" font-size="15.00" fill="#bfdbfe">assets. Eagle does not own task status;</text>
<text xml:space="preserve" text-anchor="start" x="90.93" y="-43" font-family="Arial" font-size="15.00" fill="#bfdbfe">Opportunity HQ does.</text>
</g>
<!-- durable -->
<g id="node5" class="node">
<title>durable</title>
<polygon fill="#3b82f6" stroke="#2563eb" stroke-width="0" points="652.48,-825.6 332.44,-825.6 332.44,-645.6 652.48,-645.6 652.48,-825.6"/>
<text xml:space="preserve" text-anchor="start" x="422.99" y="-774.6" font-family="Arial" font-size="20.00" fill="#eff6ff">Opportunity HQ</text>
<text xml:space="preserve" text-anchor="start" x="360.73" y="-751.6" font-family="Arial" font-size="15.00" fill="#bfdbfe">Notion is durable truth. It owns projects,</text>
<text xml:space="preserve" text-anchor="start" x="396.18" y="-733.6" font-family="Arial" font-size="15.00" fill="#bfdbfe">tasks, status, time estimates,</text>
<text xml:space="preserve" text-anchor="start" x="358.23" y="-715.6" font-family="Arial" font-size="15.00" fill="#bfdbfe">daily work blocks, links, notes, and proof</text>
<text xml:space="preserve" text-anchor="start" x="386.16" y="-697.6" font-family="Arial" font-size="15.00" fill="#bfdbfe">attachments. Views are not new</text>
<text xml:space="preserve" text-anchor="start" x="455.77" y="-679.6" font-family="Arial" font-size="15.00" fill="#bfdbfe">databases.</text>
</g>
<!-- publishing -->
<g id="node6" class="node">
<title>publishing</title>
<polygon fill="#3b82f6" stroke="#2563eb" stroke-width="0" points="552.48,-502.8 232.44,-502.8 232.44,-322.8 552.48,-322.8 552.48,-502.8"/>
<text xml:space="preserve" text-anchor="start" x="304.08" y="-404.8" font-family="Arial" font-size="20.00" fill="#eff6ff">Publishing Surfaces</text>
</g>
<!-- operator&#45;&gt;capture -->
<g id="edge1" class="edge">
<title>operator&#45;&gt;capture</title>
<path fill="none" stroke="#8d8d8d" stroke-width="2" stroke-dasharray="5,2" d="M681.27,-1291.27C660.16,-1249.72 634.97,-1200.13 613.3,-1157.5"/>
<polygon fill="#8d8d8d" stroke="#8d8d8d" stroke-width="2" points="615.7,-1156.43 609.97,-1150.93 611.02,-1158.8 615.7,-1156.43"/>
<polygon fill="#18191b" fill-opacity="0.627451" stroke="none" points="649.85,-1208.4 649.85,-1231.2 676.84,-1231.2 676.84,-1208.4 649.85,-1208.4"/>
<text xml:space="preserve" text-anchor="start" x="652.85" y="-1216.6" font-family="Arial" font-weight="bold" font-size="14.00" fill="#c9c9c9">[...]</text>
</g>
<!-- operator&#45;&gt;actions -->
<g id="edge2" class="edge">
<title>operator&#45;&gt;actions</title>
<path fill="none" stroke="#8d8d8d" stroke-width="2" stroke-dasharray="5,2" d="M749.9,-1291.38C760.32,-1248.48 771.73,-1196.08 778.46,-1148.4 810.33,-922.7 819.15,-654.8 821.57,-513.14"/>
<polygon fill="#8d8d8d" stroke="#8d8d8d" stroke-width="2" points="824.19,-513.31 821.69,-505.77 818.94,-513.22 824.19,-513.31"/>
<polygon fill="#18191b" fill-opacity="0.627451" stroke="none" points="804.91,-885.6 804.91,-908.4 850.6,-908.4 850.6,-885.6 804.91,-885.6"/>
<text xml:space="preserve" text-anchor="start" x="807.91" y="-891.4" font-family="Arial" font-size="14.00" fill="#c9c9c9">trigger</text>
</g>
<!-- capture&#45;&gt;durable -->
<g id="edge4" class="edge">
<title>capture&#45;&gt;durable</title>
<path fill="none" stroke="#8d8d8d" stroke-width="2" stroke-dasharray="5,2" d="M543.78,-968.47C534.64,-927.18 523.75,-877.95 514.35,-835.5"/>
<polygon fill="#8d8d8d" stroke="#8d8d8d" stroke-width="2" points="516.96,-835.14 512.77,-828.39 511.83,-836.28 516.96,-835.14"/>
<polygon fill="#18191b" fill-opacity="0.627451" stroke="none" points="530.09,-885.6 530.09,-908.4 557.08,-908.4 557.08,-885.6 530.09,-885.6"/>
<text xml:space="preserve" text-anchor="start" x="533.09" y="-893.8" font-family="Arial" font-weight="bold" font-size="14.00" fill="#c9c9c9">[...]</text>
</g>
<!-- actions&#45;&gt;proof -->
<g id="edge7" class="edge">
<title>actions&#45;&gt;proof</title>
<path fill="none" stroke="#8d8d8d" stroke-width="2" stroke-dasharray="5,2" d="M662.51,-333.94C563.79,-285.88 437.14,-224.23 336.14,-175.06"/>
<polygon fill="#8d8d8d" stroke="#8d8d8d" stroke-width="2" points="337.37,-172.74 329.48,-171.82 335.07,-177.46 337.37,-172.74"/>
<polygon fill="#18191b" fill-opacity="0.627451" stroke="none" points="512.72,-240 512.72,-262.8 565.42,-262.8 565.42,-240 512.72,-240"/>
<text xml:space="preserve" text-anchor="start" x="515.72" y="-245.8" font-family="Arial" font-size="14.00" fill="#c9c9c9">capture</text>
</g>
<!-- actions&#45;&gt;durable -->
<g id="edge8" class="edge">
<title>actions&#45;&gt;durable</title>
<path fill="none" stroke="#8d8d8d" stroke-width="2" stroke-dasharray="5,2" d="M662.78,-481.52C625.29,-503.2 588.08,-530.22 559.84,-562.8 541.7,-583.73 528.12,-610.12 518.1,-635.89"/>
<polygon fill="#8d8d8d" stroke="#8d8d8d" stroke-width="2" points="515.65,-634.94 515.49,-642.89 520.57,-636.78 515.65,-634.94"/>
<polygon fill="#18191b" fill-opacity="0.627451" stroke="none" points="559.84,-562.8 559.84,-585.6 651.46,-585.6 651.46,-562.8 559.84,-562.8"/>
<text xml:space="preserve" text-anchor="start" x="562.84" y="-568.6" font-family="Arial" font-size="14.00" fill="#c9c9c9">create/update</text>
</g>
<!-- proof&#45;&gt;durable -->
<g id="edge3" class="edge">
<title>proof&#45;&gt;durable</title>
<path fill="none" stroke="#8d8d8d" stroke-width="2" stroke-dasharray="5,2" d="M133.19,-179.7C109.01,-266.18 86.24,-399.4 133.32,-502.8 169.6,-582.46 248.69,-637.93 323.44,-674.58"/>
<polygon fill="#8d8d8d" stroke="#8d8d8d" stroke-width="2" points="321.91,-676.75 329.81,-677.64 324.19,-672.02 321.91,-676.75"/>
<polygon fill="#18191b" fill-opacity="0.627451" stroke="none" points="133.32,-401.4 133.32,-424.2 177.46,-424.2 177.46,-401.4 133.32,-401.4"/>
<text xml:space="preserve" text-anchor="start" x="136.32" y="-407.2" font-family="Arial" font-size="14.00" fill="#c9c9c9">attach</text>
</g>
<!-- durable&#45;&gt;actions -->
<g id="edge5" class="edge">
<title>durable&#45;&gt;actions</title>
<path fill="none" stroke="#8d8d8d" stroke-width="2" stroke-dasharray="5,2" d="M610.57,-645.81C633.8,-626.75 657.46,-606.14 678.46,-585.6 702.16,-562.42 726.04,-535.64 747.34,-510.23"/>
<polygon fill="#8d8d8d" stroke="#8d8d8d" stroke-width="2" points="749.15,-512.16 751.93,-504.72 745.11,-508.8 749.15,-512.16"/>
<polygon fill="#18191b" fill-opacity="0.627451" stroke="none" points="699.8,-562.8 699.8,-585.6 736.15,-585.6 736.15,-562.8 699.8,-562.8"/>
<text xml:space="preserve" text-anchor="start" x="702.8" y="-568.6" font-family="Arial" font-size="14.00" fill="#c9c9c9">drive</text>
</g>
<!-- durable&#45;&gt;publishing -->
<g id="edge6" class="edge">
<title>durable&#45;&gt;publishing</title>
<path fill="none" stroke="#8d8d8d" stroke-width="2" stroke-dasharray="5,2" d="M332.46,-661.18C304.36,-640.82 278.89,-615.8 262.47,-585.6 248.7,-560.28 255,-534.65 270.52,-511.17"/>
<polygon fill="#8d8d8d" stroke="#8d8d8d" stroke-width="2" points="272.65,-512.72 274.88,-505.09 268.38,-509.66 272.65,-512.72"/>
<polygon fill="#18191b" fill-opacity="0.627451" stroke="none" points="262.47,-562.8 262.47,-585.6 289.46,-585.6 289.46,-562.8 262.47,-562.8"/>
<text xml:space="preserve" text-anchor="start" x="265.47" y="-571" font-family="Arial" font-weight="bold" font-size="14.00" fill="#c9c9c9">[...]</text>
</g>
<!-- publishing&#45;&gt;durable -->
<g id="edge9" class="edge">
<title>publishing&#45;&gt;durable</title>
<path fill="none" stroke="#8d8d8d" stroke-width="2" stroke-dasharray="5,2" d="M387.55,-502.67C388.33,-529.79 391.54,-559.36 399.64,-585.6 404.99,-602.92 412.86,-620.24 421.8,-636.62"/>
<polygon fill="#8d8d8d" stroke="#8d8d8d" stroke-width="2" points="419.41,-637.73 425.38,-642.98 423.99,-635.15 419.41,-637.73"/>
<polygon fill="#18191b" fill-opacity="0.627451" stroke="none" points="399.64,-562.8 399.64,-585.6 448.46,-585.6 448.46,-562.8 399.64,-562.8"/>
<text xml:space="preserve" text-anchor="start" x="402.64" y="-568.6" font-family="Arial" font-size="14.00" fill="#c9c9c9">update</text>
</g>
</g>
</svg>
`;case`opportunity_hq_container_map`:return`<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN"
 "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<!-- Generated by graphviz version 14.1.5 (0)
 -->
<!-- Pages: 1 -->
<svg width="2619pt" height="1245pt"
 viewBox="0.00 0.00 2619.00 1245.00" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
<g id="graph0" class="graph" transform="scale(1 1) rotate(0) translate(15.05 1229.85)">
<g id="clust1" class="cluster">
<title>cluster_capture</title>
<polygon fill="#3e4651" stroke="#2d333d" points="895,-662.8 895,-944 1763,-944 1763,-662.8 895,-662.8"/>
<text xml:space="preserve" text-anchor="start" x="903" y="-931.1" font-family="Arial" font-weight="bold" font-size="11.00" fill="#cbd5e1" fill-opacity="0.701961">CAPTURE SURFACES</text>
</g>
<g id="clust2" class="cluster">
<title>cluster_durable</title>
<polygon fill="#0d4b6c" stroke="#0b3c57" points="8,-8 8,-944 432,-944 432,-8 8,-8"/>
<text xml:space="preserve" text-anchor="start" x="16" y="-931.1" font-family="Arial" font-weight="bold" font-size="11.00" fill="#b6ecf7" fill-opacity="0.701961">OPPORTUNITY HQ</text>
</g>
<g id="clust3" class="cluster">
<title>cluster_publishing</title>
<polygon fill="#3e4651" stroke="#2d333d" points="462,-8 462,-289.2 1306,-289.2 1306,-8 462,-8"/>
<text xml:space="preserve" text-anchor="start" x="470" y="-276.3" font-family="Arial" font-weight="bold" font-size="11.00" fill="#cbd5e1" fill-opacity="0.701961">PUBLISHING SURFACES</text>
</g>
<!-- bear -->
<g id="node1" class="node">
<title>bear</title>
<polygon fill="#ac4d39" stroke="#853a2d" stroke-width="0" points="1266.97,-882.8 935.03,-882.8 935.03,-702.8 1266.97,-702.8 1266.97,-882.8"/>
<text xml:space="preserve" text-anchor="start" x="1052.64" y="-831.8" font-family="Arial" font-size="20.00" fill="#fbd3cb">Bear Inbox</text>
<text xml:space="preserve" text-anchor="start" x="955.09" y="-808.8" font-family="Arial" font-size="15.00" fill="#f5b2a3">Raw capture only. Use for unclear thoughts,</text>
<text xml:space="preserve" text-anchor="start" x="1028.45" y="-790.8" font-family="Arial" font-size="15.00" fill="#f5b2a3">offload notes, passive</text>
<text xml:space="preserve" text-anchor="start" x="960.5" y="-772.8" font-family="Arial" font-size="15.00" fill="#f5b2a3">shortcut ideas, and anything that is not yet</text>
<text xml:space="preserve" text-anchor="start" x="1018.05" y="-754.8" font-family="Arial" font-size="15.00" fill="#f5b2a3">a real task. Promote only</text>
<text xml:space="preserve" text-anchor="start" x="957.16" y="-736.8" font-family="Arial" font-size="15.00" fill="#f5b2a3">when the item has money weight, deadline,</text>
</g>
<!-- mobileform -->
<g id="node2" class="node">
<title>mobileform</title>
<polygon fill="#3b82f6" stroke="#2563eb" stroke-width="0" points="1723.25,-882.8 1376.75,-882.8 1376.75,-702.8 1723.25,-702.8 1723.25,-882.8"/>
<text xml:space="preserve" text-anchor="start" x="1469.99" y="-822.8" font-family="Arial" font-size="20.00" fill="#eff6ff">Mobile Task Form</text>
<text xml:space="preserve" text-anchor="start" x="1410.75" y="-799.8" font-family="Arial" font-size="15.00" fill="#bfdbfe">Fast durable capture path for task&#45;shaped</text>
<text xml:space="preserve" text-anchor="start" x="1457.48" y="-781.8" font-family="Arial" font-size="15.00" fill="#bfdbfe">work. Minimum fields: Task,</text>
<text xml:space="preserve" text-anchor="start" x="1400.76" y="-763.8" font-family="Arial" font-size="15.00" fill="#bfdbfe">Bucket, Time, and Link/Notes. Default Status</text>
<text xml:space="preserve" text-anchor="start" x="1486.62" y="-745.8" font-family="Arial" font-size="15.00" fill="#bfdbfe">should be Queued.</text>
</g>
<!-- projects -->
<g id="node3" class="node">
<title>projects</title>
<path fill="#0284c7" stroke="#0369a1" stroke-width="2" d="M388.04,-866.44C388.04,-875.47 312.72,-882.8 220,-882.8 127.28,-882.8 51.96,-875.47 51.96,-866.44 51.96,-866.44 51.96,-719.16 51.96,-719.16 51.96,-710.13 127.28,-702.8 220,-702.8 312.72,-702.8 388.04,-710.13 388.04,-719.16 388.04,-719.16 388.04,-866.44 388.04,-866.44"/>
<path fill="none" stroke="#0369a1" stroke-width="2" d="M388.04,-866.44C388.04,-857.41 312.72,-850.07 220,-850.07 127.28,-850.07 51.96,-857.41 51.96,-866.44"/>
<text xml:space="preserve" text-anchor="start" x="129.4" y="-822.8" font-family="Arial" font-size="20.00" fill="#f0f9ff">Opportunity Projects</text>
<text xml:space="preserve" text-anchor="start" x="72.85" y="-799.8" font-family="Arial" font-size="15.00" fill="#b6ecf7">Outcomes that need multiple tasks, proof, or</text>
<text xml:space="preserve" text-anchor="start" x="131.62" y="-781.8" font-family="Arial" font-size="15.00" fill="#b6ecf7">time planning. Buckets are</text>
<text xml:space="preserve" text-anchor="start" x="72.01" y="-763.8" font-family="Arial" font-size="15.00" fill="#b6ecf7">not projects. Example: Upwork consultation /</text>
<text xml:space="preserve" text-anchor="start" x="185.4" y="-745.8" font-family="Arial" font-size="15.00" fill="#b6ecf7">proposals.</text>
</g>
<!-- tasks -->
<g id="node4" class="node">
<title>tasks</title>
<polygon fill="#0284c7" stroke="#0369a1" stroke-width="0" points="387.01,-556 52.99,-556 52.99,-384 387.01,-384 387.01,-556"/>
<text xml:space="preserve" text-anchor="start" x="138.86" y="-509" font-family="Arial" font-size="20.00" fill="#f0f9ff">Opportunity Tasks</text>
<text xml:space="preserve" text-anchor="start" x="91.2" y="-486" font-family="Arial" font-size="15.00" fill="#b6ecf7">Executable work. Fields: Task, Bucket,</text>
<text xml:space="preserve" text-anchor="start" x="123.72" y="-468" font-family="Arial" font-size="15.00" fill="#b6ecf7">Status, Time, Money Priority,</text>
<text xml:space="preserve" text-anchor="start" x="89.54" y="-450" font-family="Arial" font-size="15.00" fill="#b6ecf7">Project, Work Date, Block, Link, Asset /</text>
<text xml:space="preserve" text-anchor="start" x="160.39" y="-432" font-family="Arial" font-size="15.00" fill="#b6ecf7">Proof Link, Notes.</text>
<text xml:space="preserve" text-anchor="start" x="77.01" y="-414" font-family="Arial" font-size="15.00" fill="#b6ecf7">Status contract: Queued, Today, In Motion,</text>
</g>
<!-- taskviews -->
<g id="node5" class="node">
<title>taskviews</title>
<polygon fill="#3b82f6" stroke="#2563eb" stroke-width="0" points="392.41,-228 47.59,-228 47.59,-48 392.41,-48 392.41,-228"/>
<text xml:space="preserve" text-anchor="start" x="168.88" y="-177" font-family="Arial" font-size="20.00" fill="#eff6ff">Task Views</text>
<text xml:space="preserve" text-anchor="start" x="71.61" y="-154" font-family="Arial" font-size="15.00" fill="#bfdbfe">Views over Opportunity Tasks: Focus Board,</text>
<text xml:space="preserve" text-anchor="start" x="122.89" y="-136" font-family="Arial" font-size="15.00" fill="#bfdbfe">Daily Blocks, Work Calendar,</text>
<text xml:space="preserve" text-anchor="start" x="75.75" y="-118" font-family="Arial" font-size="15.00" fill="#bfdbfe">Applications, Upwork, Singleton, and Proof.</text>
<text xml:space="preserve" text-anchor="start" x="119.53" y="-100" font-family="Arial" font-size="15.00" fill="#bfdbfe">These are lenses, not sources</text>
<text xml:space="preserve" text-anchor="start" x="194.57" y="-82" font-family="Arial" font-size="15.00" fill="#bfdbfe">of truth.</text>
</g>
<!-- website -->
<g id="node6" class="node">
<title>website</title>
<polygon fill="#3b82f6" stroke="#2563eb" stroke-width="0" points="822.02,-228 501.98,-228 501.98,-48 822.02,-48 822.02,-228"/>
<text xml:space="preserve" text-anchor="start" x="581.4" y="-159" font-family="Arial" font-size="20.00" fill="#eff6ff">Singleton Website</text>
<text xml:space="preserve" text-anchor="start" x="526.52" y="-136" font-family="Arial" font-size="15.00" fill="#bfdbfe">Public proof and offer surface. Pulls from</text>
<text xml:space="preserve" text-anchor="start" x="560.27" y="-118" font-family="Arial" font-size="15.00" fill="#bfdbfe">packaged proof and clear offer</text>
<text xml:space="preserve" text-anchor="start" x="571.14" y="-100" font-family="Arial" font-size="15.00" fill="#bfdbfe">work, not from raw capture.</text>
</g>
<!-- proposals -->
<g id="node7" class="node">
<title>proposals</title>
<polygon fill="#a35829" stroke="#7e451d" stroke-width="0" points="1265.8,-228 932.2,-228 932.2,-48 1265.8,-48 1265.8,-228"/>
<text xml:space="preserve" text-anchor="start" x="992.28" y="-168" font-family="Arial" font-size="20.00" fill="#ffe0c2">Applications / Proposals</text>
<text xml:space="preserve" text-anchor="start" x="952.26" y="-145" font-family="Arial" font-size="15.00" fill="#f9b27c">Outbound artifacts: job applications, Upwork</text>
<text xml:space="preserve" text-anchor="start" x="1010.62" y="-127" font-family="Arial" font-size="15.00" fill="#f9b27c">proposals, direct outreach,</text>
<text xml:space="preserve" text-anchor="start" x="968.1" y="-109" font-family="Arial" font-size="15.00" fill="#f9b27c">cover notes, and follow&#45;ups. Their state</text>
<text xml:space="preserve" text-anchor="start" x="1011.05" y="-91" font-family="Arial" font-size="15.00" fill="#f9b27c">returns to Opportunity HQ.</text>
</g>
<!-- operator -->
<g id="node8" class="node">
<title>operator</title>
<polygon fill="#a35829" stroke="#7e451d" stroke-width="0" points="1567.65,-1214.8 1222.35,-1214.8 1222.35,-1034.8 1567.65,-1034.8 1567.65,-1214.8"/>
<text xml:space="preserve" text-anchor="start" x="1355.54" y="-1163.8" font-family="Arial" font-size="20.00" fill="#ffe0c2">Operator</text>
<text xml:space="preserve" text-anchor="start" x="1259.52" y="-1140.8" font-family="Arial" font-size="15.00" fill="#f9b27c">The working user. Uses mobile, desktop,</text>
<text xml:space="preserve" text-anchor="start" x="1279.52" y="-1122.8" font-family="Arial" font-size="15.00" fill="#f9b27c">Raycast, Codex, Notion, Bear, and</text>
<text xml:space="preserve" text-anchor="start" x="1245.34" y="-1104.8" font-family="Arial" font-size="15.00" fill="#f9b27c">Eagle to move job search, Upwork, Singleton</text>
<text xml:space="preserve" text-anchor="start" x="1300.37" y="-1086.8" font-family="Arial" font-size="15.00" fill="#f9b27c">offer, and proof work without</text>
<text xml:space="preserve" text-anchor="start" x="1242.4" y="-1068.8" font-family="Arial" font-size="15.00" fill="#f9b27c">repeatedly deciding where each item belongs.</text>
</g>
<!-- logtask -->
<g id="node9" class="node">
<title>logtask</title>
<polygon fill="#3b82f6" stroke="#2563eb" stroke-width="0" points="2157.46,-1214.8 1830.54,-1214.8 1830.54,-1034.8 2157.46,-1034.8 2157.46,-1214.8"/>
<text xml:space="preserve" text-anchor="start" x="1952.87" y="-1154.8" font-family="Arial" font-size="20.00" fill="#eff6ff">Log Task</text>
<text xml:space="preserve" text-anchor="start" x="1854.77" y="-1131.8" font-family="Arial" font-size="15.00" fill="#bfdbfe">Create an Opportunity Task from selected</text>
<text xml:space="preserve" text-anchor="start" x="1905.2" y="-1113.8" font-family="Arial" font-size="15.00" fill="#bfdbfe">text, clipboard link, manual</text>
<text xml:space="preserve" text-anchor="start" x="1850.6" y="-1095.8" font-family="Arial" font-size="15.00" fill="#bfdbfe">form input, or mobile/share context. Default</text>
<text xml:space="preserve" text-anchor="start" x="1939.8" y="-1077.8" font-family="Arial" font-size="15.00" fill="#bfdbfe">Status: Queued.</text>
</g>
<!-- updatetask -->
<g id="node10" class="node">
<title>updatetask</title>
<polygon fill="#3b82f6" stroke="#2563eb" stroke-width="0" points="2154.14,-882.8 1833.86,-882.8 1833.86,-702.8 2154.14,-702.8 2154.14,-882.8"/>
<text xml:space="preserve" text-anchor="start" x="1937.31" y="-822.8" font-family="Arial" font-size="20.00" fill="#eff6ff">Update Task</text>
<text xml:space="preserve" text-anchor="start" x="1857.69" y="-799.8" font-family="Arial" font-size="15.00" fill="#bfdbfe">Update Status, Work Date, Block, Money</text>
<text xml:space="preserve" text-anchor="start" x="1890.63" y="-781.8" font-family="Arial" font-size="15.00" fill="#bfdbfe">Priority, Project, Link, Notes, or</text>
<text xml:space="preserve" text-anchor="start" x="1853.92" y="-763.8" font-family="Arial" font-size="15.00" fill="#bfdbfe">proof reference on an existing Opportunity</text>
<text xml:space="preserve" text-anchor="start" x="1975.66" y="-745.8" font-family="Arial" font-size="15.00" fill="#bfdbfe">Task.</text>
</g>
<!-- plantoday -->
<g id="node11" class="node">
<title>plantoday</title>
<polygon fill="#3b82f6" stroke="#2563eb" stroke-width="0" points="2165.37,-560 1822.63,-560 1822.63,-380 2165.37,-380 2165.37,-560"/>
<text xml:space="preserve" text-anchor="start" x="1943.41" y="-491" font-family="Arial" font-size="20.00" fill="#eff6ff">Plan Today</text>
<text xml:space="preserve" text-anchor="start" x="1842.69" y="-468" font-family="Arial" font-size="15.00" fill="#bfdbfe">Assign Work Date and Block. Moves selected</text>
<text xml:space="preserve" text-anchor="start" x="1890.19" y="-450" font-family="Arial" font-size="15.00" fill="#bfdbfe">queue items into Today without</text>
<text xml:space="preserve" text-anchor="start" x="1872.68" y="-432" font-family="Arial" font-size="15.00" fill="#bfdbfe">changing their real bucket or project.</text>
</g>
<!-- startapplication -->
<g id="node12" class="node">
<title>startapplication</title>
<polygon fill="#3b82f6" stroke="#2563eb" stroke-width="0" points="2154.02,-228 1833.98,-228 1833.98,-48 2154.02,-48 2154.02,-228"/>
<text xml:space="preserve" text-anchor="start" x="1921.18" y="-159" font-family="Arial" font-size="20.00" fill="#eff6ff">Start Application</text>
<text xml:space="preserve" text-anchor="start" x="1856" y="-136" font-family="Arial" font-size="15.00" fill="#bfdbfe">Open a job link and resume path from the</text>
<text xml:space="preserve" text-anchor="start" x="1891.03" y="-118" font-family="Arial" font-size="15.00" fill="#bfdbfe">selected task. Move the task to</text>
<text xml:space="preserve" text-anchor="start" x="1894.8" y="-100" font-family="Arial" font-size="15.00" fill="#bfdbfe">In Motion while work is active.</text>
</g>
<!-- draftproposal -->
<g id="node13" class="node">
<title>draftproposal</title>
<polygon fill="#3b82f6" stroke="#2563eb" stroke-width="0" points="2588.97,-1214.8 2267.03,-1214.8 2267.03,-1034.8 2588.97,-1034.8 2588.97,-1214.8"/>
<text xml:space="preserve" text-anchor="start" x="2364.08" y="-1145.8" font-family="Arial" font-size="20.00" fill="#eff6ff">Draft Proposal</text>
<text xml:space="preserve" text-anchor="start" x="2287.09" y="-1122.8" font-family="Arial" font-size="15.00" fill="#bfdbfe">Turn a copied Upwork post into a proposal</text>
<text xml:space="preserve" text-anchor="start" x="2341.7" y="-1104.8" font-family="Arial" font-size="15.00" fill="#bfdbfe">draft and log the follow&#45;up</text>
<text xml:space="preserve" text-anchor="start" x="2329.2" y="-1086.8" font-family="Arial" font-size="15.00" fill="#bfdbfe">state back to Opportunity HQ.</text>
</g>
<!-- captureproof -->
<g id="node14" class="node">
<title>captureproof</title>
<polygon fill="#3b82f6" stroke="#2563eb" stroke-width="0" points="2588.02,-882.8 2267.98,-882.8 2267.98,-702.8 2588.02,-702.8 2588.02,-882.8"/>
<text xml:space="preserve" text-anchor="start" x="2365.74" y="-831.8" font-family="Arial" font-size="20.00" fill="#eff6ff">Capture Proof</text>
<text xml:space="preserve" text-anchor="start" x="2290" y="-808.8" font-family="Arial" font-size="15.00" fill="#bfdbfe">Import the selected asset to Eagle, attach</text>
<text xml:space="preserve" text-anchor="start" x="2338.78" y="-790.8" font-family="Arial" font-size="15.00" fill="#bfdbfe">the proof link or note to the</text>
<text xml:space="preserve" text-anchor="start" x="2288.77" y="-772.8" font-family="Arial" font-size="15.00" fill="#bfdbfe">selected Opportunity Task, then mark that</text>
<text xml:space="preserve" text-anchor="start" x="2318.78" y="-754.8" font-family="Arial" font-size="15.00" fill="#bfdbfe">task Done when the proof item is</text>
<text xml:space="preserve" text-anchor="start" x="2395.48" y="-736.8" font-family="Arial" font-size="15.00" fill="#bfdbfe">complete.</text>
</g>
<!-- proof -->
<g id="node15" class="node">
<title>proof</title>
<path fill="#428a4f" stroke="#2d5d39" stroke-width="2" d="M825.46,-866.44C825.46,-875.47 752.19,-882.8 662,-882.8 571.81,-882.8 498.54,-875.47 498.54,-866.44 498.54,-866.44 498.54,-719.16 498.54,-719.16 498.54,-710.13 571.81,-702.8 662,-702.8 752.19,-702.8 825.46,-710.13 825.46,-719.16 825.46,-719.16 825.46,-866.44 825.46,-866.44"/>
<path fill="none" stroke="#2d5d39" stroke-width="2" d="M825.46,-866.44C825.46,-857.41 752.19,-850.07 662,-850.07 571.81,-850.07 498.54,-857.41 498.54,-866.44"/>
<text xml:space="preserve" text-anchor="start" x="576.4" y="-822.8" font-family="Arial" font-size="20.00" fill="#f8fafc">Eagle Proof Library</text>
<text xml:space="preserve" text-anchor="start" x="518.6" y="-799.8" font-family="Arial" font-size="15.00" fill="#c2f0c2">Evidence store. Holds screenshots, videos,</text>
<text xml:space="preserve" text-anchor="start" x="550.7" y="-781.8" font-family="Arial" font-size="15.00" fill="#c2f0c2">PDFs, reels, examples, and proof</text>
<text xml:space="preserve" text-anchor="start" x="530.26" y="-763.8" font-family="Arial" font-size="15.00" fill="#c2f0c2">assets. Eagle does not own task status;</text>
<text xml:space="preserve" text-anchor="start" x="589.46" y="-745.8" font-family="Arial" font-size="15.00" fill="#c2f0c2">Opportunity HQ does.</text>
</g>
<!-- bear&#45;&gt;tasks -->
<g id="edge8" class="edge">
<title>bear&#45;&gt;tasks</title>
<path fill="none" stroke="#8d8d8d" stroke-width="2" stroke-dasharray="5,2" d="M960.42,-702.89C934.26,-688.33 906.74,-674.28 880,-662.8 721.82,-594.88 532.33,-542.6 397.04,-509.9"/>
<polygon fill="#8d8d8d" stroke="#8d8d8d" stroke-width="2" points="397.84,-507.39 389.93,-508.19 396.61,-512.5 397.84,-507.39"/>
<polygon fill="#18191b" fill-opacity="0.627451" stroke="none" points="828.51,-620 828.51,-642.8 885.87,-642.8 885.87,-620 828.51,-620"/>
<text xml:space="preserve" text-anchor="start" x="831.51" y="-625.8" font-family="Arial" font-size="14.00" fill="#c9c9c9">promote</text>
</g>
<!-- mobileform&#45;&gt;tasks -->
<g id="edge9" class="edge">
<title>mobileform&#45;&gt;tasks</title>
<path fill="none" stroke="#8d8d8d" stroke-width="2" stroke-dasharray="5,2" d="M1410.37,-702.95C1381.95,-687.72 1351.65,-673.41 1322,-662.8 1007.92,-550.42 619.18,-502.5 397.38,-483.13"/>
<polygon fill="#8d8d8d" stroke="#8d8d8d" stroke-width="2" points="397.66,-480.52 389.96,-482.49 397.2,-485.75 397.66,-480.52"/>
<polygon fill="#18191b" fill-opacity="0.627451" stroke="none" points="1236.13,-620 1236.13,-642.8 1281.04,-642.8 1281.04,-620 1236.13,-620"/>
<text xml:space="preserve" text-anchor="start" x="1239.13" y="-625.8" font-family="Arial" font-size="14.00" fill="#c9c9c9">create</text>
</g>
<!-- projects&#45;&gt;tasks -->
<g id="edge10" class="edge">
<title>projects&#45;&gt;tasks</title>
<path fill="none" stroke="#8d8d8d" stroke-width="2" stroke-dasharray="5,2" d="M220,-702.01C220,-659.72 220,-609.24 220,-566.27"/>
<polygon fill="#8d8d8d" stroke="#8d8d8d" stroke-width="2" points="222.63,-566.33 220,-558.83 217.38,-566.33 222.63,-566.33"/>
<polygon fill="#18191b" fill-opacity="0.627451" stroke="none" points="220,-620 220,-642.8 261.81,-642.8 261.81,-620 220,-620"/>
<text xml:space="preserve" text-anchor="start" x="223" y="-625.8" font-family="Arial" font-size="14.00" fill="#c9c9c9">group</text>
</g>
<!-- tasks&#45;&gt;taskviews -->
<g id="edge11" class="edge">
<title>tasks&#45;&gt;taskviews</title>
<path fill="none" stroke="#8d8d8d" stroke-width="2" stroke-dasharray="5,2" d="M220,-384.02C220,-339.45 220,-284.62 220,-238.13"/>
<polygon fill="#8d8d8d" stroke="#8d8d8d" stroke-width="2" points="222.63,-238.26 220,-230.76 217.38,-238.26 222.63,-238.26"/>
<polygon fill="#18191b" fill-opacity="0.627451" stroke="none" points="220,-297.2 220,-320 266.47,-320 266.47,-297.2 220,-297.2"/>
<text xml:space="preserve" text-anchor="start" x="223" y="-303" font-family="Arial" font-size="14.00" fill="#c9c9c9">render</text>
</g>
<!-- tasks&#45;&gt;website -->
<g id="edge12" class="edge">
<title>tasks&#45;&gt;website</title>
<path fill="none" stroke="#8d8d8d" stroke-width="2" stroke-dasharray="5,2" d="M333.83,-384.02C395.39,-338.05 471.61,-281.15 535.08,-233.76"/>
<polygon fill="#8d8d8d" stroke="#8d8d8d" stroke-width="2" points="536.29,-236.13 540.73,-229.54 533.15,-231.92 536.29,-236.13"/>
<polygon fill="#18191b" fill-opacity="0.627451" stroke="none" points="441,-297.2 441,-320 499.93,-320 499.93,-297.2 441,-297.2"/>
<text xml:space="preserve" text-anchor="start" x="444" y="-303" font-family="Arial" font-size="14.00" fill="#c9c9c9">package</text>
</g>
<!-- tasks&#45;&gt;proposals -->
<g id="edge13" class="edge">
<title>tasks&#45;&gt;proposals</title>
<path fill="none" stroke="#8d8d8d" stroke-width="2" stroke-dasharray="5,2" d="M386.98,-409.74C500.55,-371.77 655.01,-324.62 794.77,-297.2 830.8,-290.13 842.45,-301.65 877,-289.2 913.57,-276.02 949.91,-255.45 982.28,-233.71"/>
<polygon fill="#8d8d8d" stroke="#8d8d8d" stroke-width="2" points="983.64,-235.96 988.36,-229.57 980.68,-231.62 983.64,-235.96"/>
<polygon fill="#18191b" fill-opacity="0.627451" stroke="none" points="794.77,-297.2 794.77,-320 842,-320 842,-297.2 794.77,-297.2"/>
<text xml:space="preserve" text-anchor="start" x="797.77" y="-303" font-family="Arial" font-size="14.00" fill="#c9c9c9">submit</text>
</g>
<!-- proposals&#45;&gt;tasks -->
<g id="edge14" class="edge">
<title>proposals&#45;&gt;tasks</title>
<path fill="none" stroke="#8d8d8d" stroke-width="2" stroke-dasharray="5,2" d="M1003.65,-227.88C963.45,-261.14 914.54,-296.51 865,-320 715.71,-390.77 530.7,-429.05 397.16,-449"/>
<polygon fill="#8d8d8d" stroke="#8d8d8d" stroke-width="2" points="396.86,-446.39 389.82,-450.08 397.63,-451.59 396.86,-446.39"/>
<polygon fill="#18191b" fill-opacity="0.627451" stroke="none" points="900.42,-297.2 900.42,-320 949.24,-320 949.24,-297.2 900.42,-297.2"/>
<text xml:space="preserve" text-anchor="start" x="903.42" y="-303" font-family="Arial" font-size="14.00" fill="#c9c9c9">update</text>
</g>
<!-- operator&#45;&gt;bear -->
<g id="edge1" class="edge">
<title>operator&#45;&gt;bear</title>
<path fill="none" stroke="#8d8d8d" stroke-width="2" stroke-dasharray="5,2" d="M1315.83,-1034.93C1276.04,-990.27 1227.75,-936.07 1187.05,-890.38"/>
<polygon fill="#8d8d8d" stroke="#8d8d8d" stroke-width="2" points="1189.02,-888.65 1182.07,-884.8 1185.1,-892.15 1189.02,-888.65"/>
<polygon fill="#18191b" fill-opacity="0.627451" stroke="none" points="1256.82,-952 1256.82,-974.8 1309.51,-974.8 1309.51,-952 1256.82,-952"/>
<text xml:space="preserve" text-anchor="start" x="1259.82" y="-957.8" font-family="Arial" font-size="14.00" fill="#c9c9c9">capture</text>
</g>
<!-- operator&#45;&gt;mobileform -->
<g id="edge2" class="edge">
<title>operator&#45;&gt;mobileform</title>
<path fill="none" stroke="#8d8d8d" stroke-width="2" stroke-dasharray="5,2" d="M1436.74,-1034.93C1457.5,-990.73 1482.65,-937.19 1503.97,-891.8"/>
<polygon fill="#8d8d8d" stroke="#8d8d8d" stroke-width="2" points="1506.22,-893.18 1507.03,-885.28 1501.47,-890.95 1506.22,-893.18"/>
<polygon fill="#18191b" fill-opacity="0.627451" stroke="none" points="1472.5,-952 1472.5,-974.8 1497.18,-974.8 1497.18,-952 1472.5,-952"/>
<text xml:space="preserve" text-anchor="start" x="1475.5" y="-957.8" font-family="Arial" font-size="14.00" fill="#c9c9c9">log</text>
</g>
<!-- logtask&#45;&gt;updatetask -->
<!-- updatetask&#45;&gt;plantoday -->
<!-- plantoday&#45;&gt;startapplication -->
<!-- draftproposal&#45;&gt;captureproof -->
<!-- proof&#45;&gt;tasks -->
<g id="edge7" class="edge">
<title>proof&#45;&gt;tasks</title>
<path fill="none" stroke="#8d8d8d" stroke-width="2" stroke-dasharray="5,2" d="M542.1,-704.78C481.05,-660.47 406.89,-606.64 345.12,-561.81"/>
<polygon fill="#8d8d8d" stroke="#8d8d8d" stroke-width="2" points="346.94,-559.89 339.33,-557.61 343.86,-564.14 346.94,-559.89"/>
<polygon fill="#18191b" fill-opacity="0.627451" stroke="none" points="454.25,-620 454.25,-642.8 498.39,-642.8 498.39,-620 454.25,-620"/>
<text xml:space="preserve" text-anchor="start" x="457.25" y="-625.8" font-family="Arial" font-size="14.00" fill="#c9c9c9">attach</text>
</g>
</g>
</svg>
`;case`opportunity_hq_intake_contract`:return`<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN"
 "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<!-- Generated by graphviz version 14.1.5 (0)
 -->
<!-- Pages: 1 -->
<svg width="1365pt" height="922pt"
 viewBox="0.00 0.00 1365.00 922.00" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
<g id="graph0" class="graph" transform="scale(1 1) rotate(0) translate(15.05 907.05)">
<g id="clust1" class="cluster">
<title>cluster_capture</title>
<polygon fill="#3e4651" stroke="#2d333d" points="9,-340 9,-621.2 877,-621.2 877,-340 9,-340"/>
<text xml:space="preserve" text-anchor="start" x="17" y="-608.3" font-family="Arial" font-weight="bold" font-size="11.00" fill="#cbd5e1" fill-opacity="0.701961">CAPTURE SURFACES</text>
</g>
<g id="clust2" class="cluster">
<title>cluster_durable</title>
<polygon fill="#3e4651" stroke="#2d333d" points="8,-8 8,-289.2 922,-289.2 922,-8 8,-8"/>
<text xml:space="preserve" text-anchor="start" x="16" y="-276.3" font-family="Arial" font-weight="bold" font-size="11.00" fill="#cbd5e1" fill-opacity="0.701961">OPPORTUNITY HQ</text>
</g>
<!-- bear -->
<g id="node1" class="node">
<title>bear</title>
<polygon fill="#ac4d39" stroke="#853a2d" stroke-width="0" points="380.97,-560 49.03,-560 49.03,-380 380.97,-380 380.97,-560"/>
<text xml:space="preserve" text-anchor="start" x="166.64" y="-509" font-family="Arial" font-size="20.00" fill="#fbd3cb">Bear Inbox</text>
<text xml:space="preserve" text-anchor="start" x="69.09" y="-486" font-family="Arial" font-size="15.00" fill="#f5b2a3">Raw capture only. Use for unclear thoughts,</text>
<text xml:space="preserve" text-anchor="start" x="142.45" y="-468" font-family="Arial" font-size="15.00" fill="#f5b2a3">offload notes, passive</text>
<text xml:space="preserve" text-anchor="start" x="74.5" y="-450" font-family="Arial" font-size="15.00" fill="#f5b2a3">shortcut ideas, and anything that is not yet</text>
<text xml:space="preserve" text-anchor="start" x="132.05" y="-432" font-family="Arial" font-size="15.00" fill="#f5b2a3">a real task. Promote only</text>
<text xml:space="preserve" text-anchor="start" x="71.16" y="-414" font-family="Arial" font-size="15.00" fill="#f5b2a3">when the item has money weight, deadline,</text>
</g>
<!-- mobileform -->
<g id="node2" class="node">
<title>mobileform</title>
<polygon fill="#3b82f6" stroke="#2563eb" stroke-width="0" points="837.25,-560 490.75,-560 490.75,-380 837.25,-380 837.25,-560"/>
<text xml:space="preserve" text-anchor="start" x="583.99" y="-500" font-family="Arial" font-size="20.00" fill="#eff6ff">Mobile Task Form</text>
<text xml:space="preserve" text-anchor="start" x="524.75" y="-477" font-family="Arial" font-size="15.00" fill="#bfdbfe">Fast durable capture path for task&#45;shaped</text>
<text xml:space="preserve" text-anchor="start" x="571.48" y="-459" font-family="Arial" font-size="15.00" fill="#bfdbfe">work. Minimum fields: Task,</text>
<text xml:space="preserve" text-anchor="start" x="514.76" y="-441" font-family="Arial" font-size="15.00" fill="#bfdbfe">Bucket, Time, and Link/Notes. Default Status</text>
<text xml:space="preserve" text-anchor="start" x="600.62" y="-423" font-family="Arial" font-size="15.00" fill="#bfdbfe">should be Queued.</text>
</g>
<!-- tasks -->
<g id="node3" class="node">
<title>tasks</title>
<polygon fill="#0284c7" stroke="#0369a1" stroke-width="0" points="382.01,-224 47.99,-224 47.99,-52 382.01,-52 382.01,-224"/>
<text xml:space="preserve" text-anchor="start" x="133.86" y="-177" font-family="Arial" font-size="20.00" fill="#f0f9ff">Opportunity Tasks</text>
<text xml:space="preserve" text-anchor="start" x="86.2" y="-154" font-family="Arial" font-size="15.00" fill="#b6ecf7">Executable work. Fields: Task, Bucket,</text>
<text xml:space="preserve" text-anchor="start" x="118.72" y="-136" font-family="Arial" font-size="15.00" fill="#b6ecf7">Status, Time, Money Priority,</text>
<text xml:space="preserve" text-anchor="start" x="84.54" y="-118" font-family="Arial" font-size="15.00" fill="#b6ecf7">Project, Work Date, Block, Link, Asset /</text>
<text xml:space="preserve" text-anchor="start" x="155.39" y="-100" font-family="Arial" font-size="15.00" fill="#b6ecf7">Proof Link, Notes.</text>
<text xml:space="preserve" text-anchor="start" x="72.01" y="-82" font-family="Arial" font-size="15.00" fill="#b6ecf7">Status contract: Queued, Today, In Motion,</text>
</g>
<!-- taskviews -->
<g id="node4" class="node">
<title>taskviews</title>
<polygon fill="#3b82f6" stroke="#2563eb" stroke-width="0" points="882.41,-228 537.59,-228 537.59,-48 882.41,-48 882.41,-228"/>
<text xml:space="preserve" text-anchor="start" x="658.88" y="-177" font-family="Arial" font-size="20.00" fill="#eff6ff">Task Views</text>
<text xml:space="preserve" text-anchor="start" x="561.61" y="-154" font-family="Arial" font-size="15.00" fill="#bfdbfe">Views over Opportunity Tasks: Focus Board,</text>
<text xml:space="preserve" text-anchor="start" x="612.89" y="-136" font-family="Arial" font-size="15.00" fill="#bfdbfe">Daily Blocks, Work Calendar,</text>
<text xml:space="preserve" text-anchor="start" x="565.75" y="-118" font-family="Arial" font-size="15.00" fill="#bfdbfe">Applications, Upwork, Singleton, and Proof.</text>
<text xml:space="preserve" text-anchor="start" x="609.53" y="-100" font-family="Arial" font-size="15.00" fill="#bfdbfe">These are lenses, not sources</text>
<text xml:space="preserve" text-anchor="start" x="684.57" y="-82" font-family="Arial" font-size="15.00" fill="#bfdbfe">of truth.</text>
</g>
<!-- operator -->
<g id="node5" class="node">
<title>operator</title>
<polygon fill="#a35829" stroke="#7e451d" stroke-width="0" points="577.65,-892 232.35,-892 232.35,-712 577.65,-712 577.65,-892"/>
<text xml:space="preserve" text-anchor="start" x="365.54" y="-841" font-family="Arial" font-size="20.00" fill="#ffe0c2">Operator</text>
<text xml:space="preserve" text-anchor="start" x="269.52" y="-818" font-family="Arial" font-size="15.00" fill="#f9b27c">The working user. Uses mobile, desktop,</text>
<text xml:space="preserve" text-anchor="start" x="289.52" y="-800" font-family="Arial" font-size="15.00" fill="#f9b27c">Raycast, Codex, Notion, Bear, and</text>
<text xml:space="preserve" text-anchor="start" x="255.34" y="-782" font-family="Arial" font-size="15.00" fill="#f9b27c">Eagle to move job search, Upwork, Singleton</text>
<text xml:space="preserve" text-anchor="start" x="310.37" y="-764" font-family="Arial" font-size="15.00" fill="#f9b27c">offer, and proof work without</text>
<text xml:space="preserve" text-anchor="start" x="252.4" y="-746" font-family="Arial" font-size="15.00" fill="#f9b27c">repeatedly deciding where each item belongs.</text>
</g>
<!-- logtask -->
<g id="node6" class="node">
<title>logtask</title>
<polygon fill="#3b82f6" stroke="#2563eb" stroke-width="0" points="1327.46,-892 1000.54,-892 1000.54,-712 1327.46,-712 1327.46,-892"/>
<text xml:space="preserve" text-anchor="start" x="1122.87" y="-832" font-family="Arial" font-size="20.00" fill="#eff6ff">Log Task</text>
<text xml:space="preserve" text-anchor="start" x="1024.77" y="-809" font-family="Arial" font-size="15.00" fill="#bfdbfe">Create an Opportunity Task from selected</text>
<text xml:space="preserve" text-anchor="start" x="1075.2" y="-791" font-family="Arial" font-size="15.00" fill="#bfdbfe">text, clipboard link, manual</text>
<text xml:space="preserve" text-anchor="start" x="1020.6" y="-773" font-family="Arial" font-size="15.00" fill="#bfdbfe">form input, or mobile/share context. Default</text>
<text xml:space="preserve" text-anchor="start" x="1109.8" y="-755" font-family="Arial" font-size="15.00" fill="#bfdbfe">Status: Queued.</text>
</g>
<!-- updatetask -->
<g id="node7" class="node">
<title>updatetask</title>
<polygon fill="#3b82f6" stroke="#2563eb" stroke-width="0" points="1324.14,-560 1003.86,-560 1003.86,-380 1324.14,-380 1324.14,-560"/>
<text xml:space="preserve" text-anchor="start" x="1107.31" y="-500" font-family="Arial" font-size="20.00" fill="#eff6ff">Update Task</text>
<text xml:space="preserve" text-anchor="start" x="1027.69" y="-477" font-family="Arial" font-size="15.00" fill="#bfdbfe">Update Status, Work Date, Block, Money</text>
<text xml:space="preserve" text-anchor="start" x="1060.63" y="-459" font-family="Arial" font-size="15.00" fill="#bfdbfe">Priority, Project, Link, Notes, or</text>
<text xml:space="preserve" text-anchor="start" x="1023.92" y="-441" font-family="Arial" font-size="15.00" fill="#bfdbfe">proof reference on an existing Opportunity</text>
<text xml:space="preserve" text-anchor="start" x="1145.66" y="-423" font-family="Arial" font-size="15.00" fill="#bfdbfe">Task.</text>
</g>
<!-- plantoday -->
<g id="node8" class="node">
<title>plantoday</title>
<polygon fill="#3b82f6" stroke="#2563eb" stroke-width="0" points="1335.37,-228 992.63,-228 992.63,-48 1335.37,-48 1335.37,-228"/>
<text xml:space="preserve" text-anchor="start" x="1113.41" y="-159" font-family="Arial" font-size="20.00" fill="#eff6ff">Plan Today</text>
<text xml:space="preserve" text-anchor="start" x="1012.69" y="-136" font-family="Arial" font-size="15.00" fill="#bfdbfe">Assign Work Date and Block. Moves selected</text>
<text xml:space="preserve" text-anchor="start" x="1060.19" y="-118" font-family="Arial" font-size="15.00" fill="#bfdbfe">queue items into Today without</text>
<text xml:space="preserve" text-anchor="start" x="1042.68" y="-100" font-family="Arial" font-size="15.00" fill="#bfdbfe">changing their real bucket or project.</text>
</g>
<!-- bear&#45;&gt;tasks -->
<g id="edge3" class="edge">
<title>bear&#45;&gt;tasks</title>
<path fill="none" stroke="#8d8d8d" stroke-width="2" stroke-dasharray="5,2" d="M215,-380.13C215,-334.96 215,-280.05 215,-234.04"/>
<polygon fill="#8d8d8d" stroke="#8d8d8d" stroke-width="2" points="217.63,-234.29 215,-226.79 212.38,-234.29 217.63,-234.29"/>
<polygon fill="#18191b" fill-opacity="0.627451" stroke="none" points="215,-297.2 215,-320 272.36,-320 272.36,-297.2 215,-297.2"/>
<text xml:space="preserve" text-anchor="start" x="218" y="-303" font-family="Arial" font-size="14.00" fill="#c9c9c9">promote</text>
</g>
<!-- mobileform&#45;&gt;tasks -->
<g id="edge4" class="edge">
<title>mobileform&#45;&gt;tasks</title>
<path fill="none" stroke="#8d8d8d" stroke-width="2" stroke-dasharray="5,2" d="M543.09,-380.13C479.69,-333.54 402.19,-276.58 338.43,-229.71"/>
<polygon fill="#8d8d8d" stroke="#8d8d8d" stroke-width="2" points="340.36,-227.88 332.76,-225.55 337.25,-232.11 340.36,-227.88"/>
<polygon fill="#18191b" fill-opacity="0.627451" stroke="none" points="452.96,-297.2 452.96,-320 497.87,-320 497.87,-297.2 452.96,-297.2"/>
<text xml:space="preserve" text-anchor="start" x="455.96" y="-303" font-family="Arial" font-size="14.00" fill="#c9c9c9">create</text>
</g>
<!-- tasks&#45;&gt;taskviews -->
<g id="edge5" class="edge">
<title>tasks&#45;&gt;taskviews</title>
<path fill="none" stroke="#8d8d8d" stroke-width="2" stroke-dasharray="5,2" d="M381.89,-138C428.7,-138 479.82,-138 527.49,-138"/>
<polygon fill="#8d8d8d" stroke="#8d8d8d" stroke-width="2" points="527.39,-140.63 534.89,-138 527.39,-135.38 527.39,-140.63"/>
<polygon fill="#18191b" fill-opacity="0.627451" stroke="none" points="436.57,-141 436.57,-163.8 483.04,-163.8 483.04,-141 436.57,-141"/>
<text xml:space="preserve" text-anchor="start" x="439.57" y="-146.8" font-family="Arial" font-size="14.00" fill="#c9c9c9">render</text>
</g>
<!-- operator&#45;&gt;bear -->
<g id="edge1" class="edge">
<title>operator&#45;&gt;bear</title>
<path fill="none" stroke="#8d8d8d" stroke-width="2" stroke-dasharray="5,2" d="M353.83,-712.13C328.33,-667.84 297.43,-614.17 271.26,-568.72"/>
<polygon fill="#8d8d8d" stroke="#8d8d8d" stroke-width="2" points="273.62,-567.55 267.6,-562.36 269.07,-570.17 273.62,-567.55"/>
<polygon fill="#18191b" fill-opacity="0.627451" stroke="none" points="315.7,-629.2 315.7,-652 368.39,-652 368.39,-629.2 315.7,-629.2"/>
<text xml:space="preserve" text-anchor="start" x="318.7" y="-635" font-family="Arial" font-size="14.00" fill="#c9c9c9">capture</text>
</g>
<!-- operator&#45;&gt;mobileform -->
<g id="edge2" class="edge">
<title>operator&#45;&gt;mobileform</title>
<path fill="none" stroke="#8d8d8d" stroke-width="2" stroke-dasharray="5,2" d="M474.75,-712.13C509.73,-667.56 552.16,-613.5 587.98,-567.86"/>
<polygon fill="#8d8d8d" stroke="#8d8d8d" stroke-width="2" points="589.92,-569.64 592.48,-562.12 585.79,-566.4 589.92,-569.64"/>
<polygon fill="#18191b" fill-opacity="0.627451" stroke="none" points="534.5,-629.2 534.5,-652 559.18,-652 559.18,-629.2 534.5,-629.2"/>
<text xml:space="preserve" text-anchor="start" x="537.5" y="-635" font-family="Arial" font-size="14.00" fill="#c9c9c9">log</text>
</g>
<!-- logtask&#45;&gt;updatetask -->
<!-- updatetask&#45;&gt;plantoday -->
</g>
</svg>
`;case`proof_capture_flow`:return`<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN"
 "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<!-- Generated by graphviz version 14.1.5 (0)
 -->
<!-- Pages: 1 -->
<svg width="1352pt" height="922pt"
 viewBox="0.00 0.00 1352.00 922.00" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
<g id="graph0" class="graph" transform="scale(1 1) rotate(0) translate(15.05 907.05)">
<g id="clust1" class="cluster">
<title>cluster_durable</title>
<polygon fill="#3e4651" stroke="#2d333d" points="8,-340 8,-621.2 910,-621.2 910,-340 8,-340"/>
<text xml:space="preserve" text-anchor="start" x="16" y="-608.3" font-family="Arial" font-weight="bold" font-size="11.00" fill="#cbd5e1" fill-opacity="0.701961">OPPORTUNITY HQ</text>
</g>
<g id="clust2" class="cluster">
<title>cluster_publishing</title>
<polygon fill="#3e4651" stroke="#2d333d" points="228,-8 228,-289.2 1072,-289.2 1072,-8 228,-8"/>
<text xml:space="preserve" text-anchor="start" x="236" y="-276.3" font-family="Arial" font-weight="bold" font-size="11.00" fill="#cbd5e1" fill-opacity="0.701961">PUBLISHING SURFACES</text>
</g>
<!-- projects -->
<g id="node1" class="node">
<title>projects</title>
<path fill="#0284c7" stroke="#0369a1" stroke-width="2" d="M384.04,-543.64C384.04,-552.67 308.72,-560 216,-560 123.28,-560 47.96,-552.67 47.96,-543.64 47.96,-543.64 47.96,-396.36 47.96,-396.36 47.96,-387.33 123.28,-380 216,-380 308.72,-380 384.04,-387.33 384.04,-396.36 384.04,-396.36 384.04,-543.64 384.04,-543.64"/>
<path fill="none" stroke="#0369a1" stroke-width="2" d="M384.04,-543.64C384.04,-534.61 308.72,-527.27 216,-527.27 123.28,-527.27 47.96,-534.61 47.96,-543.64"/>
<text xml:space="preserve" text-anchor="start" x="125.4" y="-500" font-family="Arial" font-size="20.00" fill="#f0f9ff">Opportunity Projects</text>
<text xml:space="preserve" text-anchor="start" x="68.85" y="-477" font-family="Arial" font-size="15.00" fill="#b6ecf7">Outcomes that need multiple tasks, proof, or</text>
<text xml:space="preserve" text-anchor="start" x="127.62" y="-459" font-family="Arial" font-size="15.00" fill="#b6ecf7">time planning. Buckets are</text>
<text xml:space="preserve" text-anchor="start" x="68.01" y="-441" font-family="Arial" font-size="15.00" fill="#b6ecf7">not projects. Example: Upwork consultation /</text>
<text xml:space="preserve" text-anchor="start" x="181.4" y="-423" font-family="Arial" font-size="15.00" fill="#b6ecf7">proposals.</text>
</g>
<!-- tasks -->
<g id="node2" class="node">
<title>tasks</title>
<polygon fill="#0284c7" stroke="#0369a1" stroke-width="0" points="870.01,-556 535.99,-556 535.99,-384 870.01,-384 870.01,-556"/>
<text xml:space="preserve" text-anchor="start" x="621.86" y="-509" font-family="Arial" font-size="20.00" fill="#f0f9ff">Opportunity Tasks</text>
<text xml:space="preserve" text-anchor="start" x="574.2" y="-486" font-family="Arial" font-size="15.00" fill="#b6ecf7">Executable work. Fields: Task, Bucket,</text>
<text xml:space="preserve" text-anchor="start" x="606.72" y="-468" font-family="Arial" font-size="15.00" fill="#b6ecf7">Status, Time, Money Priority,</text>
<text xml:space="preserve" text-anchor="start" x="572.54" y="-450" font-family="Arial" font-size="15.00" fill="#b6ecf7">Project, Work Date, Block, Link, Asset /</text>
<text xml:space="preserve" text-anchor="start" x="643.39" y="-432" font-family="Arial" font-size="15.00" fill="#b6ecf7">Proof Link, Notes.</text>
<text xml:space="preserve" text-anchor="start" x="560.01" y="-414" font-family="Arial" font-size="15.00" fill="#b6ecf7">Status contract: Queued, Today, In Motion,</text>
</g>
<!-- website -->
<g id="node3" class="node">
<title>website</title>
<polygon fill="#428a4f" stroke="#2d5d39" stroke-width="0" points="588.02,-228 267.98,-228 267.98,-48 588.02,-48 588.02,-228"/>
<text xml:space="preserve" text-anchor="start" x="347.4" y="-159" font-family="Arial" font-size="20.00" fill="#f8fafc">Singleton Website</text>
<text xml:space="preserve" text-anchor="start" x="292.52" y="-136" font-family="Arial" font-size="15.00" fill="#c2f0c2">Public proof and offer surface. Pulls from</text>
<text xml:space="preserve" text-anchor="start" x="326.27" y="-118" font-family="Arial" font-size="15.00" fill="#c2f0c2">packaged proof and clear offer</text>
<text xml:space="preserve" text-anchor="start" x="337.14" y="-100" font-family="Arial" font-size="15.00" fill="#c2f0c2">work, not from raw capture.</text>
</g>
<!-- proposals -->
<g id="node4" class="node">
<title>proposals</title>
<polygon fill="#a35829" stroke="#7e451d" stroke-width="0" points="1031.8,-228 698.2,-228 698.2,-48 1031.8,-48 1031.8,-228"/>
<text xml:space="preserve" text-anchor="start" x="758.28" y="-168" font-family="Arial" font-size="20.00" fill="#ffe0c2">Applications / Proposals</text>
<text xml:space="preserve" text-anchor="start" x="718.26" y="-145" font-family="Arial" font-size="15.00" fill="#f9b27c">Outbound artifacts: job applications, Upwork</text>
<text xml:space="preserve" text-anchor="start" x="776.62" y="-127" font-family="Arial" font-size="15.00" fill="#f9b27c">proposals, direct outreach,</text>
<text xml:space="preserve" text-anchor="start" x="734.1" y="-109" font-family="Arial" font-size="15.00" fill="#f9b27c">cover notes, and follow&#45;ups. Their state</text>
<text xml:space="preserve" text-anchor="start" x="777.05" y="-91" font-family="Arial" font-size="15.00" fill="#f9b27c">returns to Opportunity HQ.</text>
</g>
<!-- operator -->
<g id="node5" class="node">
<title>operator</title>
<polygon fill="#a35829" stroke="#7e451d" stroke-width="0" points="1321.65,-892 976.35,-892 976.35,-712 1321.65,-712 1321.65,-892"/>
<text xml:space="preserve" text-anchor="start" x="1109.54" y="-841" font-family="Arial" font-size="20.00" fill="#ffe0c2">Operator</text>
<text xml:space="preserve" text-anchor="start" x="1013.52" y="-818" font-family="Arial" font-size="15.00" fill="#f9b27c">The working user. Uses mobile, desktop,</text>
<text xml:space="preserve" text-anchor="start" x="1033.52" y="-800" font-family="Arial" font-size="15.00" fill="#f9b27c">Raycast, Codex, Notion, Bear, and</text>
<text xml:space="preserve" text-anchor="start" x="999.34" y="-782" font-family="Arial" font-size="15.00" fill="#f9b27c">Eagle to move job search, Upwork, Singleton</text>
<text xml:space="preserve" text-anchor="start" x="1054.37" y="-764" font-family="Arial" font-size="15.00" fill="#f9b27c">offer, and proof work without</text>
<text xml:space="preserve" text-anchor="start" x="996.4" y="-746" font-family="Arial" font-size="15.00" fill="#f9b27c">repeatedly deciding where each item belongs.</text>
</g>
<!-- captureproof -->
<g id="node6" class="node">
<title>captureproof</title>
<polygon fill="#3b82f6" stroke="#2563eb" stroke-width="0" points="1309.02,-560 988.98,-560 988.98,-380 1309.02,-380 1309.02,-560"/>
<text xml:space="preserve" text-anchor="start" x="1086.74" y="-509" font-family="Arial" font-size="20.00" fill="#eff6ff">Capture Proof</text>
<text xml:space="preserve" text-anchor="start" x="1011" y="-486" font-family="Arial" font-size="15.00" fill="#bfdbfe">Import the selected asset to Eagle, attach</text>
<text xml:space="preserve" text-anchor="start" x="1059.78" y="-468" font-family="Arial" font-size="15.00" fill="#bfdbfe">the proof link or note to the</text>
<text xml:space="preserve" text-anchor="start" x="1009.77" y="-450" font-family="Arial" font-size="15.00" fill="#bfdbfe">selected Opportunity Task, then mark that</text>
<text xml:space="preserve" text-anchor="start" x="1039.78" y="-432" font-family="Arial" font-size="15.00" fill="#bfdbfe">task Done when the proof item is</text>
<text xml:space="preserve" text-anchor="start" x="1116.48" y="-414" font-family="Arial" font-size="15.00" fill="#bfdbfe">complete.</text>
</g>
<!-- proof -->
<g id="node7" class="node">
<title>proof</title>
<path fill="#428a4f" stroke="#2d5d39" stroke-width="2" d="M866.46,-875.64C866.46,-884.67 793.19,-892 703,-892 612.81,-892 539.54,-884.67 539.54,-875.64 539.54,-875.64 539.54,-728.36 539.54,-728.36 539.54,-719.33 612.81,-712 703,-712 793.19,-712 866.46,-719.33 866.46,-728.36 866.46,-728.36 866.46,-875.64 866.46,-875.64"/>
<path fill="none" stroke="#2d5d39" stroke-width="2" d="M866.46,-875.64C866.46,-866.61 793.19,-859.27 703,-859.27 612.81,-859.27 539.54,-866.61 539.54,-875.64"/>
<text xml:space="preserve" text-anchor="start" x="617.4" y="-832" font-family="Arial" font-size="20.00" fill="#f8fafc">Eagle Proof Library</text>
<text xml:space="preserve" text-anchor="start" x="559.6" y="-809" font-family="Arial" font-size="15.00" fill="#c2f0c2">Evidence store. Holds screenshots, videos,</text>
<text xml:space="preserve" text-anchor="start" x="591.7" y="-791" font-family="Arial" font-size="15.00" fill="#c2f0c2">PDFs, reels, examples, and proof</text>
<text xml:space="preserve" text-anchor="start" x="571.26" y="-773" font-family="Arial" font-size="15.00" fill="#c2f0c2">assets. Eagle does not own task status;</text>
<text xml:space="preserve" text-anchor="start" x="630.46" y="-755" font-family="Arial" font-size="15.00" fill="#c2f0c2">Opportunity HQ does.</text>
</g>
<!-- projects&#45;&gt;tasks -->
<g id="edge3" class="edge">
<title>projects&#45;&gt;tasks</title>
<path fill="none" stroke="#8d8d8d" stroke-width="2" stroke-dasharray="5,2" d="M384.96,-470C430.55,-470 480,-470 526.02,-470"/>
<polygon fill="#8d8d8d" stroke="#8d8d8d" stroke-width="2" points="525.87,-472.63 533.37,-470 525.87,-467.38 525.87,-472.63"/>
<polygon fill="#18191b" fill-opacity="0.627451" stroke="none" points="439.11,-473 439.11,-495.8 480.92,-495.8 480.92,-473 439.11,-473"/>
<text xml:space="preserve" text-anchor="start" x="442.11" y="-478.8" font-family="Arial" font-size="14.00" fill="#c9c9c9">group</text>
</g>
<!-- tasks&#45;&gt;website -->
<g id="edge4" class="edge">
<title>tasks&#45;&gt;website</title>
<path fill="none" stroke="#8d8d8d" stroke-width="2" stroke-dasharray="5,2" d="M632.18,-384.02C594.42,-338.7 547.81,-282.77 508.66,-235.79"/>
<polygon fill="#8d8d8d" stroke="#8d8d8d" stroke-width="2" points="510.7,-234.14 503.88,-230.05 506.66,-237.5 510.7,-234.14"/>
<polygon fill="#18191b" fill-opacity="0.627451" stroke="none" points="573.75,-297.2 573.75,-320 632.68,-320 632.68,-297.2 573.75,-297.2"/>
<text xml:space="preserve" text-anchor="start" x="576.75" y="-303" font-family="Arial" font-size="14.00" fill="#c9c9c9">package</text>
</g>
<!-- tasks&#45;&gt;proposals -->
<g id="edge5" class="edge">
<title>tasks&#45;&gt;proposals</title>
<path fill="none" stroke="#8d8d8d" stroke-width="2" stroke-dasharray="5,2" d="M673.99,-384.06C668.84,-355.44 668.46,-323.98 680.77,-297.2 691.25,-274.37 706.84,-253.6 724.59,-235.16"/>
<polygon fill="#8d8d8d" stroke="#8d8d8d" stroke-width="2" points="726.2,-237.26 729.63,-230.09 722.48,-233.56 726.2,-237.26"/>
<polygon fill="#18191b" fill-opacity="0.627451" stroke="none" points="680.77,-297.2 680.77,-320 728,-320 728,-297.2 680.77,-297.2"/>
<text xml:space="preserve" text-anchor="start" x="683.77" y="-303" font-family="Arial" font-size="14.00" fill="#c9c9c9">submit</text>
</g>
<!-- proposals&#45;&gt;tasks -->
<g id="edge6" class="edge">
<title>proposals&#45;&gt;tasks</title>
<path fill="none" stroke="#8d8d8d" stroke-width="2" stroke-dasharray="5,2" d="M821.44,-227.73C799.15,-273.13 772.01,-328.42 749.34,-374.61"/>
<polygon fill="#8d8d8d" stroke="#8d8d8d" stroke-width="2" points="747,-373.41 746.05,-381.3 751.71,-375.72 747,-373.41"/>
<polygon fill="#18191b" fill-opacity="0.627451" stroke="none" points="784,-297.2 784,-320 832.82,-320 832.82,-297.2 784,-297.2"/>
<text xml:space="preserve" text-anchor="start" x="787" y="-303" font-family="Arial" font-size="14.00" fill="#c9c9c9">update</text>
</g>
<!-- operator&#45;&gt;captureproof -->
<!-- proof&#45;&gt;tasks -->
<g id="edge2" class="edge">
<title>proof&#45;&gt;tasks</title>
<path fill="none" stroke="#8d8d8d" stroke-width="2" stroke-dasharray="5,2" d="M703,-711.26C703,-666.38 703,-612.03 703,-566.39"/>
<polygon fill="#8d8d8d" stroke="#8d8d8d" stroke-width="2" points="705.63,-566.42 703,-558.92 700.38,-566.42 705.63,-566.42"/>
<polygon fill="#18191b" fill-opacity="0.627451" stroke="none" points="703,-629.2 703,-652 747.14,-652 747.14,-629.2 703,-629.2"/>
<text xml:space="preserve" text-anchor="start" x="706" y="-635" font-family="Arial" font-size="14.00" fill="#c9c9c9">attach</text>
</g>
</g>
</svg>
`;default:throw Error(`Unknown viewId: `+e)}};export{e as dotSource,t as svgSource};