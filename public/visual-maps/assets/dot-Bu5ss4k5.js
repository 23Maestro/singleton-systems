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
    portfoliooperator [height=2.5,
        label=<<TABLE BORDER="0" CELLPADDING="0" CELLSPACING="4"><TR><TD><FONT POINT-SIZE="20">Operator</FONT></TD></TR><TR><TD><FONT POINT-SIZE="15" COLOR="#bfdbfe">The working user. Uses the command surface to<BR/>move practical operations<BR/>workflow steps without repeatedly clicking<BR/>through scattered dashboard<BR/>screens.</FONT></TD></TR></TABLE>>,
        likec4_id=portfolioOperator,
        likec4_level=0,
        margin="0.223,0.223",
        width=4.445];
    aiworkflowsystem [height=2.5,
        label=<<TABLE BORDER="0" CELLPADDING="0" CELLSPACING="4"><TR><TD><FONT POINT-SIZE="20">Prospect ID Workflow System</FONT></TD></TR><TR><TD><FONT POINT-SIZE="15" COLOR="#bfdbfe">Command UI, legacy-system adapter work,<BR/>source-of-truth cleanup, and audit<BR/>tests for a practical operations workflow.</FONT></TD></TR></TABLE>>,
        likec4_id=aiWorkflowSystem,
        likec4_level=0,
        margin="0.223,0.223",
        width=4.445];
    portfoliooperator -> aiworkflowsystem [arrowhead=normal,
        label=<<TABLE BORDER="0" CELLPADDING="3" CELLSPACING="0" BGCOLOR="#18191BA0"><TR><TD ALIGN="TEXT" BALIGN="LEFT"><FONT POINT-SIZE="14">triggers workflow action</FONT></TD></TR></TABLE>>,
        likec4_id=of10xa,
        style=dashed];
    operator [height=2.5,
        label=<<TABLE BORDER="0" CELLPADDING="0" CELLSPACING="4"><TR><TD><FONT POINT-SIZE="20">Operator</FONT></TD></TR><TR><TD><FONT POINT-SIZE="15" COLOR="#bfdbfe">The working user. Uses mobile, desktop,<BR/>Raycast, Codex, Notion, Obsidian, and<BR/>Eagle to move job search, Upwork, Singleton<BR/>offer, and portfolio work without<BR/>repeatedly deciding where each item belongs.</FONT></TD></TR></TABLE>>,
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
        label=<<TABLE BORDER="0" CELLPADDING="0" CELLSPACING="4"><TR><TD><FONT POINT-SIZE="20">Eagle Portfolio Library</FONT></TD></TR><TR><TD><FONT POINT-SIZE="15" COLOR="#bfdbfe">Portfolio/evidence store. Holds screenshots,<BR/>videos, PDFs, reels, examples, and portfolio<BR/>assets. Eagle does not own task status;<BR/>Opportunity HQ does.</FONT></TD></TR></TABLE>>,
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
`;case`ai_workflow_readme_map`:return`digraph {
    graph [TBbalance=min,
        bgcolor=transparent,
        compound=true,
        fontname=Arial,
        fontsize=20,
        labeljust=l,
        labelloc=t,
        layout=dot,
        likec4_viewId=ai_workflow_readme_map,
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
    subgraph cluster_aiworkflowsystem {
        graph [color="#2d333d",
            fillcolor="#3e4651",
            label=<<FONT POINT-SIZE="11" COLOR="#cbd5e1b3"><B>PROSPECT ID WORKFLOW SYSTEM</B></FONT>>,
            likec4_depth=1,
            likec4_id=aiWorkflowSystem,
            likec4_level=0,
            margin=40,
            style=filled
        ];
        raycastcommands [color="#853A2D",
            fillcolor="#AC4D39",
            fontcolor="#FBD3CB",
            group=aiWorkflowSystem,
            height=2.5,
            label=<<TABLE BORDER="0" CELLPADDING="0" CELLSPACING="4"><TR><TD><FONT POINT-SIZE="20">Raycast Commands</FONT></TD></TR><TR><TD><FONT POINT-SIZE="15" COLOR="#f5b2a3">Command UI for Scout Prep, Set Meetings,<BR/>Client Messages, and video<BR/>workflow commands. Commands are buttons.</FONT></TD></TR></TABLE>>,
            likec4_id="aiWorkflowSystem.raycastCommands",
            likec4_level=1,
            margin="0.5,0.223",
            width=4.584];
        prospectweb [group=aiWorkflowSystem,
            height=2.5,
            label=<<TABLE BORDER="0" CELLPADDING="0" CELLSPACING="4"><TR><TD><FONT POINT-SIZE="20">Vercel / Prospect Web</FONT></TD></TR><TR><TD><FONT POINT-SIZE="15" COLOR="#bfdbfe">Public and mobile review surface that reads<BR/>cleaned workflow data outside<BR/>the Raycast command window.</FONT></TD></TR></TABLE>>,
            likec4_id="aiWorkflowSystem.prospectWeb",
            likec4_level=1,
            margin="0.278,0.306",
            width=4.445];
        fastapibridge [color="#0369a1",
            fillcolor="#0284c7",
            fontcolor="#f0f9ff",
            group=aiWorkflowSystem,
            height=2.5,
            label=<<TABLE BORDER="0" CELLPADDING="0" CELLSPACING="4"><TR><TD><FONT POINT-SIZE="20">Local FastAPI Bridge</FONT></TD></TR><TR><TD><FONT POINT-SIZE="15" COLOR="#B6ECF7">Adapter layer that turns legacy dashboard<BR/>form behavior into repeatable<BR/>request shapes and readback checks.</FONT></TD></TR></TABLE>>,
            likec4_id="aiWorkflowSystem.fastApiBridge",
            likec4_level=1,
            margin="0.278,0.306",
            width=4.445];
        legacylaravel [color="#7E451D",
            fillcolor="#A35829",
            fontcolor="#FFE0C2",
            group=aiWorkflowSystem,
            height=2.5,
            label=<<TABLE BORDER="0" CELLPADDING="0" CELLSPACING="4"><TR><TD><FONT POINT-SIZE="20">Legacy Laravel Dashboard</FONT></TD></TR><TR><TD><FONT POINT-SIZE="15" COLOR="#f9b27c">Existing dashboard surface. The bridge<BR/>translates behavior here instead<BR/>of pretending the old system disappeared.</FONT></TD></TR></TABLE>>,
            likec4_id="aiWorkflowSystem.legacyLaravel",
            likec4_level=1,
            margin="0.278,0.223",
            width=4.445];
        supabasetruth [color="#2d5d39",
            fillcolor="#428a4f",
            fontcolor="#f8fafc",
            group=aiWorkflowSystem,
            height=2.5,
            label=<<TABLE BORDER="0" CELLPADDING="0" CELLSPACING="4"><TR><TD><FONT POINT-SIZE="20">Supabase PostgreSQL</FONT></TD></TR><TR><TD><FONT POINT-SIZE="15" COLOR="#c2f0c2">Source-of-truth layer for appointments,<BR/>lifecycle events, call log rows,<BR/>and reporting facts.</FONT></TD></TR></TABLE>>,
            likec4_id="aiWorkflowSystem.supabaseTruth",
            likec4_level=1,
            margin="0.223,0",
            penwidth=2,
            shape=cylinder,
            width=4.445];
    }
    portfoliooperator [color="#7E451D",
        fillcolor="#A35829",
        fontcolor="#FFE0C2",
        height=2.5,
        label=<<TABLE BORDER="0" CELLPADDING="0" CELLSPACING="4"><TR><TD><FONT POINT-SIZE="20">Operator</FONT></TD></TR><TR><TD><FONT POINT-SIZE="15" COLOR="#f9b27c">The working user. Uses the command surface to<BR/>move practical operations<BR/>workflow steps without repeatedly clicking<BR/>through scattered dashboard<BR/>screens.</FONT></TD></TR></TABLE>>,
        likec4_id=portfolioOperator,
        likec4_level=0,
        margin="0.223,0.223",
        width=4.445];
    portfoliooperator -> raycastcommands [arrowhead=normal,
        label=<<TABLE BORDER="0" CELLPADDING="3" CELLSPACING="0" BGCOLOR="#18191BA0"><TR><TD ALIGN="TEXT" BALIGN="LEFT"><FONT POINT-SIZE="14">triggers workflow action</FONT></TD></TR></TABLE>>,
        likec4_id="135j7yz",
        minlen=1,
        style=dashed];
    raycastcommands -> fastapibridge [arrowhead=normal,
        label=<<TABLE BORDER="0" CELLPADDING="3" CELLSPACING="0" BGCOLOR="#18191BA0"><TR><TD ALIGN="TEXT" BALIGN="LEFT"><FONT POINT-SIZE="14">sends command payload</FONT></TD></TR></TABLE>>,
        likec4_id=pbl48m,
        style=dashed,
        weight=2];
    prospectweb -> supabasetruth [arrowhead=normal,
        label=<<TABLE BORDER="0" CELLPADDING="3" CELLSPACING="0" BGCOLOR="#18191BA0"><TR><TD ALIGN="TEXT" BALIGN="LEFT"><FONT POINT-SIZE="14">reads cleaned data</FONT></TD></TR></TABLE>>,
        likec4_id=wrky97,
        minlen=1,
        style=dashed];
    fastapibridge -> legacylaravel [arrowhead=normal,
        label=<<TABLE BORDER="0" CELLPADDING="3" CELLSPACING="0" BGCOLOR="#18191BA0"><TR><TD ALIGN="TEXT" BALIGN="LEFT"><FONT POINT-SIZE="14">translates dashboard behavior</FONT></TD></TR></TABLE>>,
        likec4_id=yw6nqx,
        minlen=1,
        style=dashed];
    fastapibridge -> supabasetruth [arrowhead=normal,
        label=<<TABLE BORDER="0" CELLPADDING="3" CELLSPACING="0" BGCOLOR="#18191BA0"><TR><TD ALIGN="TEXT" BALIGN="LEFT"><FONT POINT-SIZE="14">writes durable facts</FONT></TD></TR></TABLE>>,
        likec4_id="1eml5b4",
        style=dashed];
}
`;case`scouting_coordinator_bucket_map`:return`digraph {
    graph [TBbalance=min,
        bgcolor=transparent,
        compound=true,
        fontname=Arial,
        fontsize=20,
        labeljust=l,
        labelloc=t,
        layout=dot,
        likec4_viewId=scouting_coordinator_bucket_map,
        nodesep=0.445,
        outputorder=nodesfirst,
        pad=0.209,
        rankdir=LR,
        ranksep=0.556,
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
    bucket1 [height=2.5,
        label=<<TABLE BORDER="0" CELLPADDING="0" CELLSPACING="4"><TR><TD ROWSPAN="2" WIDTH="106"> </TD><TD ALIGN="TEXT" BALIGN="LEFT"><FONT POINT-SIZE="20">1. Meetings</FONT></TD><TD ROWSPAN="2" WIDTH="16"> </TD></TR><TR><TD ALIGN="TEXT" BALIGN="LEFT"><FONT POINT-SIZE="15" COLOR="#bfdbfe">Scheduling and confirmation</FONT></TD></TR></TABLE>>,
        likec4_id="aiWorkflowSystem.scoutingCoordinator.bucket1",
        likec4_level=0,
        margin="0.112,0.223",
        width=4.445];
    bucket2 [color="#7E451D",
        fillcolor="#A35829",
        fontcolor="#FFE0C2",
        height=2.5,
        label=<<TABLE BORDER="0" CELLPADDING="0" CELLSPACING="4"><TR><TD ROWSPAN="2" WIDTH="106"> </TD><TD ALIGN="TEXT" BALIGN="LEFT"><FONT POINT-SIZE="20">2. Prep</FONT></TD><TD ROWSPAN="2" WIDTH="16"> </TD></TR><TR><TD ALIGN="TEXT" BALIGN="LEFT"><FONT POINT-SIZE="15" COLOR="#f9b27c">Pre-meeting work</FONT></TD></TR></TABLE>>,
        likec4_id="aiWorkflowSystem.scoutingCoordinator.bucket2",
        likec4_level=0,
        margin="0.112,0.223",
        width=4.445];
    bucket1 -> bucket2 [arrowhead=normal,
        likec4_id=j1k9d5,
        minlen=1,
        style=dashed];
    bucket3 [color="#2d5d39",
        fillcolor="#428a4f",
        fontcolor="#f8fafc",
        height=2.5,
        label=<<TABLE BORDER="0" CELLPADDING="0" CELLSPACING="4"><TR><TD ROWSPAN="2" WIDTH="106"> </TD><TD ALIGN="TEXT" BALIGN="LEFT"><FONT POINT-SIZE="20">3. Client Comms</FONT></TD><TD ROWSPAN="2" WIDTH="16"> </TD></TR><TR><TD ALIGN="TEXT" BALIGN="LEFT"><FONT POINT-SIZE="15" COLOR="#c2f0c2">Messages and calls</FONT></TD></TR></TABLE>>,
        likec4_id="aiWorkflowSystem.scoutingCoordinator.bucket3",
        likec4_level=0,
        margin="0.112,0.223",
        width=4.445];
    bucket2 -> bucket3 [arrowhead=normal,
        likec4_id="1wzvdaj",
        style=dashed];
    bucket4 [color="#0369a1",
        fillcolor="#0284c7",
        fontcolor="#f0f9ff",
        height=2.5,
        label=<<TABLE BORDER="0" CELLPADDING="0" CELLSPACING="4"><TR><TD ROWSPAN="2" WIDTH="106"> </TD><TD ALIGN="TEXT" BALIGN="LEFT"><FONT POINT-SIZE="20">4. Lifecycle</FONT></TD><TD ROWSPAN="2" WIDTH="16"> </TD></TR><TR><TD ALIGN="TEXT" BALIGN="LEFT"><FONT POINT-SIZE="15" COLOR="#B6ECF7">Stage and reporting truth</FONT></TD></TR></TABLE>>,
        likec4_id="aiWorkflowSystem.scoutingCoordinator.bucket4",
        likec4_level=0,
        margin="0.112,0.223",
        width=4.445];
    bucket3 -> bucket4 [arrowhead=normal,
        likec4_id="1qm3ei5",
        style=dashed];
    bucket5 [color="#853A2D",
        fillcolor="#AC4D39",
        fontcolor="#FBD3CB",
        height=2.5,
        label=<<TABLE BORDER="0" CELLPADDING="0" CELLSPACING="4"><TR><TD ROWSPAN="2" WIDTH="106"> </TD><TD ALIGN="TEXT" BALIGN="LEFT"><FONT POINT-SIZE="20">5. Outcomes</FONT></TD><TD ROWSPAN="2" WIDTH="16"> </TD></TR><TR><TD ALIGN="TEXT" BALIGN="LEFT"><FONT POINT-SIZE="15" COLOR="#f5b2a3">Enrollments and follow-up</FONT></TD></TR></TABLE>>,
        likec4_id="aiWorkflowSystem.scoutingCoordinator.bucket5",
        likec4_level=0,
        margin="0.112,0.223",
        width=4.445];
    bucket4 -> bucket5 [arrowhead=normal,
        likec4_id=ua0w5n,
        minlen=1,
        style=dashed];
}
`;case`resume_timeline_map`:return`digraph {
    graph [TBbalance=min,
        bgcolor=transparent,
        compound=true,
        fontname=Arial,
        fontsize=20,
        labeljust=l,
        labelloc=t,
        layout=dot,
        likec4_viewId=resume_timeline_map,
        nodesep=0.445,
        outputorder=nodesfirst,
        pad=0.209,
        rankdir=LR,
        ranksep=0.556,
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
    stetsonstart [height=2.5,
        label=<<TABLE BORDER="0" CELLPADDING="0" CELLSPACING="4"><TR><TD ROWSPAN="2" WIDTH="106"> </TD><TD ALIGN="TEXT" BALIGN="LEFT"><FONT POINT-SIZE="20">2012 Stetson</FONT></TD><TD ROWSPAN="2" WIDTH="16"> </TD></TR><TR><TD ALIGN="TEXT" BALIGN="LEFT"><FONT POINT-SIZE="15" COLOR="#bfdbfe">Started the communications path at<BR/>Stetson.</FONT></TD></TR></TABLE>>,
        likec4_id="aiWorkflowSystem.resumeTimeline.stetsonStart",
        likec4_level=0,
        margin="0.112,0.223",
        width=4.445];
    stetsongrad [color="#2d5d39",
        fillcolor="#428a4f",
        fontcolor="#f8fafc",
        height=2.5,
        label=<<TABLE BORDER="0" CELLPADDING="0" CELLSPACING="4"><TR><TD ROWSPAN="2" WIDTH="106"> </TD><TD ALIGN="TEXT" BALIGN="LEFT"><FONT POINT-SIZE="20">2016 Graduated</FONT></TD><TD ROWSPAN="2" WIDTH="16"> </TD></TR><TR><TD ALIGN="TEXT" BALIGN="LEFT"><FONT POINT-SIZE="15" COLOR="#c2f0c2">Finished the Stetson degree.</FONT></TD></TR></TABLE>>,
        likec4_id="aiWorkflowSystem.resumeTimeline.stetsonGrad",
        likec4_level=0,
        margin="0.112,0.223",
        width=4.445];
    stetsonstart -> stetsongrad [arrowhead=normal,
        label=<<TABLE BORDER="0" CELLPADDING="3" CELLSPACING="0" BGCOLOR="#18191BA0"><TR><TD ALIGN="TEXT" BALIGN="LEFT"><FONT POINT-SIZE="14">advance</FONT></TD></TR></TABLE>>,
        likec4_id=u6n4l6,
        minlen=1,
        style=dashed];
    spcit [color="#0369a1",
        fillcolor="#0284c7",
        fontcolor="#f0f9ff",
        height=2.5,
        label=<<TABLE BORDER="0" CELLPADDING="0" CELLSPACING="4"><TR><TD ROWSPAN="2" WIDTH="106"> </TD><TD ALIGN="TEXT" BALIGN="LEFT"><FONT POINT-SIZE="20">2021 SPC / IT</FONT></TD><TD ROWSPAN="2" WIDTH="16"> </TD></TR><TR><TD ALIGN="TEXT" BALIGN="LEFT"><FONT POINT-SIZE="15" COLOR="#B6ECF7">Added computer programming and IT<BR/>coursework.</FONT></TD></TR></TABLE>>,
        likec4_id="aiWorkflowSystem.resumeTimeline.spcIt",
        likec4_level=0,
        margin="0.112,0.306",
        width=4.445];
    stetsongrad -> spcit [arrowhead=normal,
        label=<<TABLE BORDER="0" CELLPADDING="3" CELLSPACING="0" BGCOLOR="#18191BA0"><TR><TD ALIGN="TEXT" BALIGN="LEFT"><FONT POINT-SIZE="14">add</FONT></TD></TR></TABLE>>,
        likec4_id="1altczn",
        style=dashed];
    productionsystems [color="#7E451D",
        fillcolor="#A35829",
        fontcolor="#FFE0C2",
        height=2.5,
        label=<<TABLE BORDER="0" CELLPADDING="0" CELLSPACING="4"><TR><TD ROWSPAN="2" WIDTH="126"> </TD><TD ALIGN="TEXT" BALIGN="LEFT"><FONT POINT-SIZE="20">2024 Production Systems</FONT></TD><TD ROWSPAN="2" WIDTH="16"> </TD></TR><TR><TD ALIGN="TEXT" BALIGN="LEFT"><FONT POINT-SIZE="15" COLOR="#f9b27c">Built repeatable video, course, and<BR/>workflow systems.</FONT></TD></TR></TABLE>>,
        likec4_id="aiWorkflowSystem.resumeTimeline.productionSystems",
        likec4_level=0,
        margin="0.112,0.223",
        width=4.445];
    spcit -> productionsystems [arrowhead=normal,
        label=<<TABLE BORDER="0" CELLPADDING="3" CELLSPACING="0" BGCOLOR="#18191BA0"><TR><TD ALIGN="TEXT" BALIGN="LEFT"><FONT POINT-SIZE="14">build</FONT></TD></TR></TABLE>>,
        likec4_id=ct9x0i,
        style=dashed];
    aispecialistfit [color="#853A2D",
        fillcolor="#AC4D39",
        fontcolor="#FBD3CB",
        height=2.5,
        label=<<TABLE BORDER="0" CELLPADDING="0" CELLSPACING="4"><TR><TD ROWSPAN="2" WIDTH="106"> </TD><TD ALIGN="TEXT" BALIGN="LEFT"><FONT POINT-SIZE="20">2026 AI Specialist Fit</FONT></TD><TD ROWSPAN="2" WIDTH="16"> </TD></TR><TR><TD ALIGN="TEXT" BALIGN="LEFT"><FONT POINT-SIZE="15" COLOR="#f5b2a3">Positioned practical AI workflow<BR/>support around prep, review, and<BR/>implementation.</FONT></TD></TR></TABLE>>,
        likec4_id="aiWorkflowSystem.resumeTimeline.aiSpecialistFit",
        likec4_level=0,
        margin="0.389,0.223",
        width=4.584];
    productionsystems -> aispecialistfit [arrowhead=normal,
        label=<<TABLE BORDER="0" CELLPADDING="3" CELLSPACING="0" BGCOLOR="#18191BA0"><TR><TD ALIGN="TEXT" BALIGN="LEFT"><FONT POINT-SIZE="14">fit</FONT></TD></TR></TABLE>>,
        likec4_id="1ur30cj",
        minlen=1,
        style=dashed];
}
`;case`review_first_implementation_loop`:return`digraph {
    graph [TBbalance=min,
        bgcolor=transparent,
        compound=true,
        fontname=Arial,
        fontsize=20,
        labeljust=l,
        labelloc=t,
        layout=dot,
        likec4_viewId=review_first_implementation_loop,
        nodesep=1.667,
        outputorder=nodesfirst,
        pad=0.209,
        rankdir=LR,
        ranksep=1.112,
        splines=spline
    ];
    node [color="#2563eb",
        fillcolor="#3b82f6",
        fontcolor="#eff6ff",
        fontname=Arial,
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
    verify [color="#2d5d39",
        fillcolor="#428a4f",
        fontcolor="#f8fafc",
        height=2.389,
        label=<<TABLE BORDER="0" CELLPADDING="0" CELLSPACING="4"><TR><TD ROWSPAN="2" WIDTH="126"> </TD><TD ALIGN="TEXT" BALIGN="LEFT"><FONT POINT-SIZE="20">Verify</FONT></TD><TD ROWSPAN="2" WIDTH="16"> </TD></TR><TR><TD ALIGN="TEXT" BALIGN="LEFT"><FONT POINT-SIZE="15" COLOR="#c2f0c2">Use readback, tests, or source<BR/>review before calling it real.</FONT></TD></TR></TABLE>>,
        likec4_id="aiWorkflowSystem.implementationLoop.verify",
        likec4_level=0,
        margin="0.112,0.223",
        width=4.445];
    gather [color="#853A2D",
        fillcolor="#AC4D39",
        fontcolor="#FBD3CB",
        height=2.5,
        label=<<TABLE BORDER="0" CELLPADDING="0" CELLSPACING="4"><TR><TD ROWSPAN="2" WIDTH="106"> </TD><TD ALIGN="TEXT" BALIGN="LEFT"><FONT POINT-SIZE="20">Gather</FONT></TD><TD ROWSPAN="2" WIDTH="16"> </TD></TR><TR><TD ALIGN="TEXT" BALIGN="LEFT"><FONT POINT-SIZE="15" COLOR="#f5b2a3">Collect the real workflow and<BR/>source evidence.</FONT></TD></TR></TABLE>>,
        likec4_id="aiWorkflowSystem.implementationLoop.gather",
        likec4_level=0,
        margin="0.112,0.223",
        width=4.445];
    verify -> gather [arrowhead=normal,
        label=<<TABLE BORDER="0" CELLPADDING="3" CELLSPACING="0" BGCOLOR="#18191BA0"><TR><TD ALIGN="TEXT" BALIGN="LEFT"><FONT POINT-SIZE="14">verify</FONT></TD></TR></TABLE>>,
        likec4_id=n8h3ow,
        style=dashed];
    classify [color="#0369a1",
        fillcolor="#0284c7",
        fontcolor="#f0f9ff",
        height=2.5,
        label=<<TABLE BORDER="0" CELLPADDING="0" CELLSPACING="4"><TR><TD ROWSPAN="2" WIDTH="106"> </TD><TD ALIGN="TEXT" BALIGN="LEFT"><FONT POINT-SIZE="20">Classify</FONT></TD><TD ROWSPAN="2" WIDTH="16"> </TD></TR><TR><TD ALIGN="TEXT" BALIGN="LEFT"><FONT POINT-SIZE="15" COLOR="#B6ECF7">Separate owners, facts, support<BR/>state, and commands.</FONT></TD></TR></TABLE>>,
        likec4_id="aiWorkflowSystem.implementationLoop.classify",
        likec4_level=0,
        margin="0.112,0.223",
        width=4.445];
    gather -> classify [arrowhead=normal,
        label=<<TABLE BORDER="0" CELLPADDING="3" CELLSPACING="0" BGCOLOR="#18191BA0"><TR><TD ALIGN="TEXT" BALIGN="LEFT"><FONT POINT-SIZE="14">collect</FONT></TD></TR></TABLE>>,
        likec4_id="14ybpnj",
        style=dashed];
    draft [height=2.5,
        label=<<TABLE BORDER="0" CELLPADDING="0" CELLSPACING="4"><TR><TD ROWSPAN="2" WIDTH="106"> </TD><TD ALIGN="TEXT" BALIGN="LEFT"><FONT POINT-SIZE="20">Draft</FONT></TD><TD ROWSPAN="2" WIDTH="16"> </TD></TR><TR><TD ALIGN="TEXT" BALIGN="LEFT"><FONT POINT-SIZE="15" COLOR="#bfdbfe">Turn the classified workflow into<BR/>useful working material.</FONT></TD></TR></TABLE>>,
        likec4_id="aiWorkflowSystem.implementationLoop.draft",
        likec4_level=0,
        margin="0.112,0.223",
        width=4.445];
    classify -> draft [arrowhead=normal,
        label=<<TABLE BORDER="0" CELLPADDING="3" CELLSPACING="0" BGCOLOR="#18191BA0"><TR><TD ALIGN="TEXT" BALIGN="LEFT"><FONT POINT-SIZE="14">separate</FONT></TD></TR></TABLE>>,
        likec4_id=p4vntj,
        style=dashed];
    review [color="#7E451D",
        fillcolor="#A35829",
        fontcolor="#FFE0C2",
        height=2.5,
        label=<<TABLE BORDER="0" CELLPADDING="0" CELLSPACING="4"><TR><TD ROWSPAN="2" WIDTH="106"> </TD><TD ALIGN="TEXT" BALIGN="LEFT"><FONT POINT-SIZE="20">Review</FONT></TD><TD ROWSPAN="2" WIDTH="16"> </TD></TR><TR><TD ALIGN="TEXT" BALIGN="LEFT"><FONT POINT-SIZE="15" COLOR="#f9b27c">Keep human judgment before<BR/>mutation, sending, or publishing.</FONT></TD></TR></TABLE>>,
        likec4_id="aiWorkflowSystem.implementationLoop.review",
        likec4_level=0,
        margin="0.389,0.223",
        width=4.584];
    draft -> review [arrowhead=normal,
        label=<<TABLE BORDER="0" CELLPADDING="3" CELLSPACING="0" BGCOLOR="#18191BA0"><TR><TD ALIGN="TEXT" BALIGN="LEFT"><FONT POINT-SIZE="14">draft</FONT></TD></TR></TABLE>>,
        likec4_id=njuomt,
        style=dashed];
    review -> verify [arrowhead=normal,
        label=<<TABLE BORDER="0" CELLPADDING="3" CELLSPACING="0" BGCOLOR="#18191BA0"><TR><TD ALIGN="TEXT" BALIGN="LEFT"><FONT POINT-SIZE="14">review</FONT></TD></TR></TABLE>>,
        likec4_id=zk46sn,
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
        obsidian [color="#853A2D",
            fillcolor="#AC4D39",
            fontcolor="#FBD3CB",
            height=2.5,
            label=<<TABLE BORDER="0" CELLPADDING="0" CELLSPACING="4"><TR><TD><FONT POINT-SIZE="20">Obsidian _Inbox</FONT></TD></TR><TR><TD><FONT POINT-SIZE="15" COLOR="#f5b2a3">Raw capture only. Use for unclear thoughts,<BR/>offload notes, passive<BR/>shortcut ideas, and anything that is not yet<BR/>a real task. Promote only<BR/>when the item has money weight, deadline,</FONT></TD></TR></TABLE>>,
            likec4_id="capture.obsidian",
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
            label=<<TABLE BORDER="0" CELLPADDING="0" CELLSPACING="4"><TR><TD><FONT POINT-SIZE="20">Dependencies</FONT></TD></TR><TR><TD><FONT POINT-SIZE="15" COLOR="#cbd5e1">Real blockers only: application work can<BR/>depend on resume/snippet prep;<BR/>website request flow depends on Tally and<BR/>Notion intake; offer traction<BR/>depends on website, portfolio, outreach, and</FONT></TD></TR></TABLE>>,
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
            label=<<TABLE BORDER="0" CELLPADDING="0" CELLSPACING="4"><TR><TD><FONT POINT-SIZE="20">Singleton Website</FONT></TD></TR><TR><TD><FONT POINT-SIZE="15" COLOR="#bfdbfe">Public portfolio and offer surface. Pulls<BR/>from packaged portfolio and clear offer<BR/>work, not from raw capture.</FONT></TD></TR></TABLE>>,
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
        label=<<TABLE BORDER="0" CELLPADDING="0" CELLSPACING="4"><TR><TD><FONT POINT-SIZE="20">Operator</FONT></TD></TR><TR><TD><FONT POINT-SIZE="15" COLOR="#f9b27c">The working user. Uses mobile, desktop,<BR/>Raycast, Codex, Notion, Obsidian, and<BR/>Eagle to move job search, Upwork, Singleton<BR/>offer, and portfolio work without<BR/>repeatedly deciding where each item belongs.</FONT></TD></TR></TABLE>>,
        likec4_id=operator,
        likec4_level=0,
        margin="0.223,0.223",
        width=4.445];
    operator -> obsidian [arrowhead=normal,
        label=<<TABLE BORDER="0" CELLPADDING="3" CELLSPACING="0" BGCOLOR="#18191BA0"><TR><TD ALIGN="TEXT" BALIGN="LEFT"><FONT POINT-SIZE="14">capture</FONT></TD></TR></TABLE>>,
        likec4_id="1wvgtn9",
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
        label=<<TABLE BORDER="0" CELLPADDING="0" CELLSPACING="4"><TR><TD><FONT POINT-SIZE="20">Eagle Portfolio Library</FONT></TD></TR><TR><TD><FONT POINT-SIZE="15" COLOR="#c2f0c2">Portfolio/evidence store. Holds screenshots,<BR/>videos, PDFs, reels, examples, and portfolio<BR/>assets. Eagle does not own task status;<BR/>Opportunity HQ does.</FONT></TD></TR></TABLE>>,
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
    obsidian -> tasks [arrowhead=normal,
        label=<<TABLE BORDER="0" CELLPADDING="3" CELLSPACING="0" BGCOLOR="#18191BA0"><TR><TD ALIGN="TEXT" BALIGN="LEFT"><FONT POINT-SIZE="14">promote</FONT></TD></TR></TABLE>>,
        likec4_id="1epeung",
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
        obsidian [color="#853A2D",
            fillcolor="#AC4D39",
            fontcolor="#FBD3CB",
            height=2.5,
            label=<<TABLE BORDER="0" CELLPADDING="0" CELLSPACING="4"><TR><TD><FONT POINT-SIZE="20">Obsidian _Inbox</FONT></TD></TR><TR><TD><FONT POINT-SIZE="15" COLOR="#f5b2a3">Raw capture only. Use for unclear thoughts,<BR/>offload notes, passive<BR/>shortcut ideas, and anything that is not yet<BR/>a real task. Promote only<BR/>when the item has money weight, deadline,</FONT></TD></TR></TABLE>>,
            likec4_id="capture.obsidian",
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
            label=<<TABLE BORDER="0" CELLPADDING="0" CELLSPACING="4"><TR><TD><FONT POINT-SIZE="20">Dependencies</FONT></TD></TR><TR><TD><FONT POINT-SIZE="15" COLOR="#cbd5e1">Real blockers only: application work can<BR/>depend on resume/snippet prep;<BR/>website request flow depends on Tally and<BR/>Notion intake; offer traction<BR/>depends on website, portfolio, outreach, and</FONT></TD></TR></TABLE>>,
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
        label=<<TABLE BORDER="0" CELLPADDING="0" CELLSPACING="4"><TR><TD><FONT POINT-SIZE="20">Operator</FONT></TD></TR><TR><TD><FONT POINT-SIZE="15" COLOR="#f9b27c">The working user. Uses mobile, desktop,<BR/>Raycast, Codex, Notion, Obsidian, and<BR/>Eagle to move job search, Upwork, Singleton<BR/>offer, and portfolio work without<BR/>repeatedly deciding where each item belongs.</FONT></TD></TR></TABLE>>,
        likec4_id=operator,
        likec4_level=0,
        margin="0.223,0.223",
        width=4.445];
    operator -> obsidian [arrowhead=normal,
        label=<<TABLE BORDER="0" CELLPADDING="3" CELLSPACING="0" BGCOLOR="#18191BA0"><TR><TD ALIGN="TEXT" BALIGN="LEFT"><FONT POINT-SIZE="14">capture</FONT></TD></TR></TABLE>>,
        likec4_id="1wvgtn9",
        style=dashed,
        weight=2];
    operator -> mobileform [arrowhead=normal,
        label=<<TABLE BORDER="0" CELLPADDING="3" CELLSPACING="0" BGCOLOR="#18191BA0"><TR><TD ALIGN="TEXT" BALIGN="LEFT"><FONT POINT-SIZE="14">log</FONT></TD></TR></TABLE>>,
        likec4_id=tdf01i,
        style=dashed,
        weight=2];
    obsidian -> tasks [arrowhead=normal,
        label=<<TABLE BORDER="0" CELLPADDING="3" CELLSPACING="0" BGCOLOR="#18191BA0"><TR><TD ALIGN="TEXT" BALIGN="LEFT"><FONT POINT-SIZE="14">promote</FONT></TD></TR></TABLE>>,
        likec4_id="1epeung",
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
`;case`portfolio_capture_flow`:return`digraph {
    graph [TBbalance=min,
        bgcolor=transparent,
        compound=true,
        fontname=Arial,
        fontsize=20,
        labeljust=l,
        labelloc=t,
        layout=dot,
        likec4_viewId=portfolio_capture_flow,
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
            label=<<TABLE BORDER="0" CELLPADDING="0" CELLSPACING="4"><TR><TD><FONT POINT-SIZE="20">Singleton Website</FONT></TD></TR><TR><TD><FONT POINT-SIZE="15" COLOR="#c2f0c2">Public portfolio and offer surface. Pulls<BR/>from packaged portfolio and clear offer<BR/>work, not from raw capture.</FONT></TD></TR></TABLE>>,
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
        label=<<TABLE BORDER="0" CELLPADDING="0" CELLSPACING="4"><TR><TD><FONT POINT-SIZE="20">Operator</FONT></TD></TR><TR><TD><FONT POINT-SIZE="15" COLOR="#f9b27c">The working user. Uses mobile, desktop,<BR/>Raycast, Codex, Notion, Obsidian, and<BR/>Eagle to move job search, Upwork, Singleton<BR/>offer, and portfolio work without<BR/>repeatedly deciding where each item belongs.</FONT></TD></TR></TABLE>>,
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
        label=<<TABLE BORDER="0" CELLPADDING="0" CELLSPACING="4"><TR><TD><FONT POINT-SIZE="20">Eagle Portfolio Library</FONT></TD></TR><TR><TD><FONT POINT-SIZE="15" COLOR="#c2f0c2">Portfolio/evidence store. Holds screenshots,<BR/>videos, PDFs, reels, examples, and portfolio<BR/>assets. Eagle does not own task status;<BR/>Opportunity HQ does.</FONT></TD></TR></TABLE>>,
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
<svg width="1099pt" height="1501pt"
 viewBox="0.00 0.00 1099.00 1501.00" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
<g id="graph0" class="graph" transform="scale(1 1) rotate(0) translate(15.05 1486.25)">
<!-- portfoliooperator -->
<g id="node1" class="node">
<title>portfoliooperator</title>
<polygon fill="#3b82f6" stroke="#2563eb" stroke-width="0" points="362.75,-1471.2 0,-1471.2 0,-1291.2 362.75,-1291.2 362.75,-1471.2"/>
<text xml:space="preserve" text-anchor="start" x="141.91" y="-1420.2" font-family="Arial" font-size="20.00" fill="#eff6ff">Operator</text>
<text xml:space="preserve" text-anchor="start" x="20.06" y="-1397.2" font-family="Arial" font-size="15.00" fill="#bfdbfe">The working user. Uses the command surface to</text>
<text xml:space="preserve" text-anchor="start" x="95.92" y="-1379.2" font-family="Arial" font-size="15.00" fill="#bfdbfe">move practical operations</text>
<text xml:space="preserve" text-anchor="start" x="42.56" y="-1361.2" font-family="Arial" font-size="15.00" fill="#bfdbfe">workflow steps without repeatedly clicking</text>
<text xml:space="preserve" text-anchor="start" x="85.48" y="-1343.2" font-family="Arial" font-size="15.00" fill="#bfdbfe">through scattered dashboard</text>
<text xml:space="preserve" text-anchor="start" x="153.03" y="-1325.2" font-family="Arial" font-size="15.00" fill="#bfdbfe">screens.</text>
</g>
<!-- aiworkflowsystem -->
<g id="node2" class="node">
<title>aiworkflowsystem</title>
<polygon fill="#3b82f6" stroke="#2563eb" stroke-width="0" points="345.23,-1148.4 17.52,-1148.4 17.52,-968.4 345.23,-968.4 345.23,-1148.4"/>
<text xml:space="preserve" text-anchor="start" x="49.12" y="-1079.4" font-family="Arial" font-size="20.00" fill="#eff6ff">Prospect ID Workflow System</text>
<text xml:space="preserve" text-anchor="start" x="37.58" y="-1056.4" font-family="Arial" font-size="15.00" fill="#bfdbfe">Command UI, legacy&#45;system adapter work,</text>
<text xml:space="preserve" text-anchor="start" x="69.22" y="-1038.4" font-family="Arial" font-size="15.00" fill="#bfdbfe">source&#45;of&#45;truth cleanup, and audit</text>
<text xml:space="preserve" text-anchor="start" x="47.99" y="-1020.4" font-family="Arial" font-size="15.00" fill="#bfdbfe">tests for a practical operations workflow.</text>
</g>
<!-- operator -->
<g id="node3" class="node">
<title>operator</title>
<polygon fill="#3b82f6" stroke="#2563eb" stroke-width="0" points="984.03,-1471.2 638.72,-1471.2 638.72,-1291.2 984.03,-1291.2 984.03,-1471.2"/>
<text xml:space="preserve" text-anchor="start" x="771.91" y="-1420.2" font-family="Arial" font-size="20.00" fill="#eff6ff">Operator</text>
<text xml:space="preserve" text-anchor="start" x="675.9" y="-1397.2" font-family="Arial" font-size="15.00" fill="#bfdbfe">The working user. Uses mobile, desktop,</text>
<text xml:space="preserve" text-anchor="start" x="682.14" y="-1379.2" font-family="Arial" font-size="15.00" fill="#bfdbfe">Raycast, Codex, Notion, Obsidian, and</text>
<text xml:space="preserve" text-anchor="start" x="661.71" y="-1361.2" font-family="Arial" font-size="15.00" fill="#bfdbfe">Eagle to move job search, Upwork, Singleton</text>
<text xml:space="preserve" text-anchor="start" x="707.16" y="-1343.2" font-family="Arial" font-size="15.00" fill="#bfdbfe">offer, and portfolio work without</text>
<text xml:space="preserve" text-anchor="start" x="658.78" y="-1325.2" font-family="Arial" font-size="15.00" fill="#bfdbfe">repeatedly deciding where each item belongs.</text>
</g>
<!-- capture -->
<g id="node4" class="node">
<title>capture</title>
<polygon fill="#3b82f6" stroke="#2563eb" stroke-width="0" points="775.4,-1148.4 455.36,-1148.4 455.36,-968.4 775.4,-968.4 775.4,-1148.4"/>
<text xml:space="preserve" text-anchor="start" x="537.56" y="-1050.4" font-family="Arial" font-size="20.00" fill="#eff6ff">Capture Surfaces</text>
</g>
<!-- actions -->
<g id="node5" class="node">
<title>actions</title>
<polygon fill="#3b82f6" stroke="#2563eb" stroke-width="0" points="1069.4,-502.8 749.36,-502.8 749.36,-322.8 1069.4,-322.8 1069.4,-502.8"/>
<text xml:space="preserve" text-anchor="start" x="800.44" y="-433.8" font-family="Arial" font-size="20.00" fill="#eff6ff">Raycast / Codex Actions</text>
<text xml:space="preserve" text-anchor="start" x="777.63" y="-410.8" font-family="Arial" font-size="15.00" fill="#bfdbfe">Action layer. It creates, updates, opens,</text>
<text xml:space="preserve" text-anchor="start" x="835.17" y="-392.8" font-family="Arial" font-size="15.00" fill="#bfdbfe">drafts, and attaches. It</text>
<text xml:space="preserve" text-anchor="start" x="779.71" y="-374.8" font-family="Arial" font-size="15.00" fill="#bfdbfe">should not invent a second task model.</text>
</g>
<!-- portfoliostore -->
<g id="node6" class="node">
<title>portfoliostore</title>
<polygon fill="#3b82f6" stroke="#2563eb" stroke-width="0" points="417.16,-180 83.59,-180 83.59,0 417.16,0 417.16,-180"/>
<text xml:space="preserve" text-anchor="start" x="151.99" y="-120" font-family="Arial" font-size="20.00" fill="#eff6ff">Eagle Portfolio Library</text>
<text xml:space="preserve" text-anchor="start" x="104.05" y="-97" font-family="Arial" font-size="15.00" fill="#bfdbfe">Portfolio/evidence store. Holds screenshots,</text>
<text xml:space="preserve" text-anchor="start" x="103.64" y="-79" font-family="Arial" font-size="15.00" fill="#bfdbfe">videos, PDFs, reels, examples, and portfolio</text>
<text xml:space="preserve" text-anchor="start" x="118.63" y="-61" font-family="Arial" font-size="15.00" fill="#bfdbfe">assets. Eagle does not own task status;</text>
<text xml:space="preserve" text-anchor="start" x="177.84" y="-43" font-family="Arial" font-size="15.00" fill="#bfdbfe">Opportunity HQ does.</text>
</g>
<!-- durable -->
<g id="node7" class="node">
<title>durable</title>
<polygon fill="#3b82f6" stroke="#2563eb" stroke-width="0" points="739.4,-825.6 419.36,-825.6 419.36,-645.6 739.4,-645.6 739.4,-825.6"/>
<text xml:space="preserve" text-anchor="start" x="509.9" y="-774.6" font-family="Arial" font-size="20.00" fill="#eff6ff">Opportunity HQ</text>
<text xml:space="preserve" text-anchor="start" x="447.65" y="-751.6" font-family="Arial" font-size="15.00" fill="#bfdbfe">Notion is durable truth. It owns projects,</text>
<text xml:space="preserve" text-anchor="start" x="470.16" y="-733.6" font-family="Arial" font-size="15.00" fill="#bfdbfe">tasks, status, duration estimates,</text>
<text xml:space="preserve" text-anchor="start" x="445.99" y="-715.6" font-family="Arial" font-size="15.00" fill="#bfdbfe">daily work shifts, links, and notes. Views</text>
<text xml:space="preserve" text-anchor="start" x="540.18" y="-697.6" font-family="Arial" font-size="15.00" fill="#bfdbfe">are not new</text>
<text xml:space="preserve" text-anchor="start" x="542.68" y="-679.6" font-family="Arial" font-size="15.00" fill="#bfdbfe">databases.</text>
</g>
<!-- publishing -->
<g id="node8" class="node">
<title>publishing</title>
<polygon fill="#3b82f6" stroke="#2563eb" stroke-width="0" points="639.4,-502.8 319.36,-502.8 319.36,-322.8 639.4,-322.8 639.4,-502.8"/>
<text xml:space="preserve" text-anchor="start" x="390.99" y="-404.8" font-family="Arial" font-size="20.00" fill="#eff6ff">Publishing Surfaces</text>
</g>
<!-- portfoliooperator&#45;&gt;aiworkflowsystem -->
<g id="edge1" class="edge">
<title>portfoliooperator&#45;&gt;aiworkflowsystem</title>
<path fill="none" stroke="#8d8d8d" stroke-width="2" stroke-dasharray="5,2" d="M181.38,-1291.27C181.38,-1250.07 181.38,-1200.96 181.38,-1158.57"/>
<polygon fill="#8d8d8d" stroke="#8d8d8d" stroke-width="2" points="184,-1158.76 181.38,-1151.26 178.75,-1158.76 184,-1158.76"/>
<polygon fill="#18191b" fill-opacity="0.627451" stroke="none" points="181.38,-1208.4 181.38,-1231.2 333.65,-1231.2 333.65,-1208.4 181.38,-1208.4"/>
<text xml:space="preserve" text-anchor="start" x="184.38" y="-1214.2" font-family="Arial" font-size="14.00" fill="#c9c9c9">triggers workflow action</text>
</g>
<!-- operator&#45;&gt;capture -->
<g id="edge2" class="edge">
<title>operator&#45;&gt;capture</title>
<path fill="none" stroke="#8d8d8d" stroke-width="2" stroke-dasharray="5,2" d="M757.04,-1291.27C731.55,-1249.54 701.1,-1199.71 674.98,-1156.96"/>
<polygon fill="#8d8d8d" stroke="#8d8d8d" stroke-width="2" points="677.38,-1155.84 671.23,-1150.81 672.9,-1158.58 677.38,-1155.84"/>
<polygon fill="#18191b" fill-opacity="0.627451" stroke="none" points="719.25,-1208.4 719.25,-1231.2 746.25,-1231.2 746.25,-1208.4 719.25,-1208.4"/>
<text xml:space="preserve" text-anchor="start" x="722.25" y="-1216.6" font-family="Arial" font-weight="bold" font-size="14.00" fill="#c9c9c9">[...]</text>
</g>
<!-- operator&#45;&gt;actions -->
<g id="edge3" class="edge">
<title>operator&#45;&gt;actions</title>
<path fill="none" stroke="#8d8d8d" stroke-width="2" stroke-dasharray="5,2" d="M820.38,-1291.45C838.69,-1110.81 880.19,-701.58 899.34,-512.72"/>
<polygon fill="#8d8d8d" stroke="#8d8d8d" stroke-width="2" points="901.93,-513.26 900.07,-505.53 896.71,-512.73 901.93,-513.26"/>
<polygon fill="#18191b" fill-opacity="0.627451" stroke="none" points="861.51,-885.6 861.51,-908.4 907.19,-908.4 907.19,-885.6 861.51,-885.6"/>
<text xml:space="preserve" text-anchor="start" x="864.51" y="-891.4" font-family="Arial" font-size="14.00" fill="#c9c9c9">trigger</text>
</g>
<!-- capture&#45;&gt;durable -->
<g id="edge5" class="edge">
<title>capture&#45;&gt;durable</title>
<path fill="none" stroke="#8d8d8d" stroke-width="2" stroke-dasharray="5,2" d="M605.4,-968.47C600.77,-927.27 595.26,-878.16 590.5,-835.77"/>
<polygon fill="#8d8d8d" stroke="#8d8d8d" stroke-width="2" points="593.13,-835.6 589.68,-828.44 587.91,-836.18 593.13,-835.6"/>
<polygon fill="#18191b" fill-opacity="0.627451" stroke="none" points="598.46,-885.6 598.46,-908.4 625.45,-908.4 625.45,-885.6 598.46,-885.6"/>
<text xml:space="preserve" text-anchor="start" x="601.46" y="-893.8" font-family="Arial" font-weight="bold" font-size="14.00" fill="#c9c9c9">[...]</text>
</g>
<!-- actions&#45;&gt;portfoliostore -->
<g id="edge8" class="edge">
<title>actions&#45;&gt;portfoliostore</title>
<path fill="none" stroke="#8d8d8d" stroke-width="2" stroke-dasharray="5,2" d="M749.43,-333.94C651.81,-286.42 526.9,-225.61 426.46,-176.72"/>
<polygon fill="#8d8d8d" stroke="#8d8d8d" stroke-width="2" points="427.75,-174.42 419.85,-173.5 425.45,-179.14 427.75,-174.42"/>
<polygon fill="#18191b" fill-opacity="0.627451" stroke="none" points="599.64,-240 599.64,-262.8 652.33,-262.8 652.33,-240 599.64,-240"/>
<text xml:space="preserve" text-anchor="start" x="602.64" y="-245.8" font-family="Arial" font-size="14.00" fill="#c9c9c9">capture</text>
</g>
<!-- actions&#45;&gt;durable -->
<g id="edge9" class="edge">
<title>actions&#45;&gt;durable</title>
<path fill="none" stroke="#8d8d8d" stroke-width="2" stroke-dasharray="5,2" d="M749.69,-481.52C712.2,-503.2 675,-530.22 646.76,-562.8 628.61,-583.73 615.04,-610.12 605.02,-635.89"/>
<polygon fill="#8d8d8d" stroke="#8d8d8d" stroke-width="2" points="602.57,-634.94 602.41,-642.89 607.49,-636.78 602.57,-634.94"/>
<polygon fill="#18191b" fill-opacity="0.627451" stroke="none" points="646.76,-562.8 646.76,-585.6 738.38,-585.6 738.38,-562.8 646.76,-562.8"/>
<text xml:space="preserve" text-anchor="start" x="649.76" y="-568.6" font-family="Arial" font-size="14.00" fill="#c9c9c9">create/update</text>
</g>
<!-- portfoliostore&#45;&gt;durable -->
<g id="edge4" class="edge">
<title>portfoliostore&#45;&gt;durable</title>
<path fill="none" stroke="#8d8d8d" stroke-width="2" stroke-dasharray="5,2" d="M220.1,-179.7C195.92,-266.18 173.15,-399.4 220.24,-502.8 256.51,-582.46 335.61,-637.93 410.36,-674.58"/>
<polygon fill="#8d8d8d" stroke="#8d8d8d" stroke-width="2" points="408.82,-676.75 416.72,-677.64 411.1,-672.02 408.82,-676.75"/>
<polygon fill="#18191b" fill-opacity="0.627451" stroke="none" points="220.24,-401.4 220.24,-424.2 264.38,-424.2 264.38,-401.4 220.24,-401.4"/>
<text xml:space="preserve" text-anchor="start" x="223.24" y="-407.2" font-family="Arial" font-size="14.00" fill="#c9c9c9">attach</text>
</g>
<!-- durable&#45;&gt;actions -->
<g id="edge6" class="edge">
<title>durable&#45;&gt;actions</title>
<path fill="none" stroke="#8d8d8d" stroke-width="2" stroke-dasharray="5,2" d="M697.49,-645.81C720.71,-626.75 744.37,-606.14 765.38,-585.6 789.08,-562.42 812.95,-535.64 834.26,-510.23"/>
<polygon fill="#8d8d8d" stroke="#8d8d8d" stroke-width="2" points="836.06,-512.16 838.85,-504.72 832.03,-508.8 836.06,-512.16"/>
<polygon fill="#18191b" fill-opacity="0.627451" stroke="none" points="786.72,-562.8 786.72,-585.6 823.06,-585.6 823.06,-562.8 786.72,-562.8"/>
<text xml:space="preserve" text-anchor="start" x="789.72" y="-568.6" font-family="Arial" font-size="14.00" fill="#c9c9c9">drive</text>
</g>
<!-- durable&#45;&gt;publishing -->
<g id="edge7" class="edge">
<title>durable&#45;&gt;publishing</title>
<path fill="none" stroke="#8d8d8d" stroke-width="2" stroke-dasharray="5,2" d="M419.38,-661.18C391.27,-640.82 365.8,-615.8 349.38,-585.6 335.62,-560.28 341.91,-534.65 357.44,-511.17"/>
<polygon fill="#8d8d8d" stroke="#8d8d8d" stroke-width="2" points="359.56,-512.72 361.79,-505.09 355.29,-509.66 359.56,-512.72"/>
<polygon fill="#18191b" fill-opacity="0.627451" stroke="none" points="349.38,-562.8 349.38,-585.6 376.38,-585.6 376.38,-562.8 349.38,-562.8"/>
<text xml:space="preserve" text-anchor="start" x="352.38" y="-571" font-family="Arial" font-weight="bold" font-size="14.00" fill="#c9c9c9">[...]</text>
</g>
<!-- publishing&#45;&gt;durable -->
<g id="edge10" class="edge">
<title>publishing&#45;&gt;durable</title>
<path fill="none" stroke="#8d8d8d" stroke-width="2" stroke-dasharray="5,2" d="M474.47,-502.67C475.25,-529.79 478.45,-559.36 486.56,-585.6 491.9,-602.92 499.78,-620.24 508.71,-636.62"/>
<polygon fill="#8d8d8d" stroke="#8d8d8d" stroke-width="2" points="506.33,-637.73 512.3,-642.98 510.9,-635.15 506.33,-637.73"/>
<polygon fill="#18191b" fill-opacity="0.627451" stroke="none" points="486.56,-562.8 486.56,-585.6 535.38,-585.6 535.38,-562.8 486.56,-562.8"/>
<text xml:space="preserve" text-anchor="start" x="489.56" y="-568.6" font-family="Arial" font-size="14.00" fill="#c9c9c9">update</text>
</g>
</g>
</svg>
`;case`ai_workflow_readme_map`:return`<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN"
 "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<!-- Generated by graphviz version 14.1.5 (0)
 -->
<!-- Pages: 1 -->
<svg width="958pt" height="1236pt"
 viewBox="0.00 0.00 958.00 1236.00" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
<g id="graph0" class="graph" transform="scale(1 1) rotate(0) translate(15.05 1220.65)">
<g id="clust1" class="cluster">
<title>cluster_aiworkflowsystem</title>
<polygon fill="#3e4651" stroke="#2d333d" points="8,-8 8,-934.8 920,-934.8 920,-8 8,-8"/>
<text xml:space="preserve" text-anchor="start" x="16" y="-921.9" font-family="Arial" font-weight="bold" font-size="11.00" fill="#cbd5e1" fill-opacity="0.701961">PROSPECT ID WORKFLOW SYSTEM</text>
</g>
<!-- raycastcommands -->
<g id="node1" class="node">
<title>raycastcommands</title>
<polygon fill="#ac4d39" stroke="#853a2d" stroke-width="0" points="432.14,-873.6 47.86,-873.6 47.86,-693.6 432.14,-693.6 432.14,-873.6"/>
<text xml:space="preserve" text-anchor="start" x="149.97" y="-804.6" font-family="Arial" font-size="20.00" fill="#fbd3cb">Raycast Commands</text>
<text xml:space="preserve" text-anchor="start" x="95.77" y="-781.6" font-family="Arial" font-size="15.00" fill="#f5b2a3">Command UI for Scout Prep, Set Meetings,</text>
<text xml:space="preserve" text-anchor="start" x="147.86" y="-763.6" font-family="Arial" font-size="15.00" fill="#f5b2a3">Client Messages, and video</text>
<text xml:space="preserve" text-anchor="start" x="87.86" y="-745.6" font-family="Arial" font-size="15.00" fill="#f5b2a3">workflow commands. Commands are buttons.</text>
</g>
<!-- prospectweb -->
<g id="node2" class="node">
<title>prospectweb</title>
<polygon fill="#3b82f6" stroke="#2563eb" stroke-width="0" points="880.09,-873.6 541.91,-873.6 541.91,-693.6 880.09,-693.6 880.09,-873.6"/>
<text xml:space="preserve" text-anchor="start" x="611.52" y="-804.6" font-family="Arial" font-size="20.00" fill="#eff6ff">Vercel / Prospect Web</text>
<text xml:space="preserve" text-anchor="start" x="565.93" y="-781.6" font-family="Arial" font-size="15.00" fill="#bfdbfe">Public and mobile review surface that reads</text>
<text xml:space="preserve" text-anchor="start" x="610.52" y="-763.6" font-family="Arial" font-size="15.00" fill="#bfdbfe">cleaned workflow data outside</text>
<text xml:space="preserve" text-anchor="start" x="607.2" y="-745.6" font-family="Arial" font-size="15.00" fill="#bfdbfe">the Raycast command window.</text>
</g>
<!-- fastapibridge -->
<g id="node3" class="node">
<title>fastapibridge</title>
<polygon fill="#0284c7" stroke="#0369a1" stroke-width="0" points="403.27,-550.8 76.73,-550.8 76.73,-370.8 403.27,-370.8 403.27,-550.8"/>
<text xml:space="preserve" text-anchor="start" x="146.06" y="-481.8" font-family="Arial" font-size="20.00" fill="#f0f9ff">Local FastAPI Bridge</text>
<text xml:space="preserve" text-anchor="start" x="100.75" y="-458.8" font-family="Arial" font-size="15.00" fill="#b6ecf7">Adapter layer that turns legacy dashboard</text>
<text xml:space="preserve" text-anchor="start" x="142.44" y="-440.8" font-family="Arial" font-size="15.00" fill="#b6ecf7">form behavior into repeatable</text>
<text xml:space="preserve" text-anchor="start" x="113.67" y="-422.8" font-family="Arial" font-size="15.00" fill="#b6ecf7">request shapes and readback checks.</text>
</g>
<!-- legacylaravel -->
<g id="node4" class="node">
<title>legacylaravel</title>
<polygon fill="#a35829" stroke="#7e451d" stroke-width="0" points="403.69,-228 76.31,-228 76.31,-48 403.69,-48 403.69,-228"/>
<text xml:space="preserve" text-anchor="start" x="120.48" y="-159" font-family="Arial" font-size="20.00" fill="#ffe0c2">Legacy Laravel Dashboard</text>
<text xml:space="preserve" text-anchor="start" x="109.51" y="-136" font-family="Arial" font-size="15.00" fill="#f9b27c">Existing dashboard surface. The bridge</text>
<text xml:space="preserve" text-anchor="start" x="133.27" y="-118" font-family="Arial" font-size="15.00" fill="#f9b27c">translates behavior here instead</text>
<text xml:space="preserve" text-anchor="start" x="100.33" y="-100" font-family="Arial" font-size="15.00" fill="#f9b27c">of pretending the old system disappeared.</text>
</g>
<!-- supabasetruth -->
<g id="node5" class="node">
<title>supabasetruth</title>
<path fill="#428a4f" stroke="#2d5d39" stroke-width="2" d="M849.02,-211.64C849.02,-220.67 777.3,-228 689,-228 600.7,-228 528.98,-220.67 528.98,-211.64 528.98,-211.64 528.98,-64.36 528.98,-64.36 528.98,-55.33 600.7,-48 689,-48 777.3,-48 849.02,-55.33 849.02,-64.36 849.02,-64.36 849.02,-211.64 849.02,-211.64"/>
<path fill="none" stroke="#2d5d39" stroke-width="2" d="M849.02,-211.64C849.02,-202.61 777.3,-195.27 689,-195.27 600.7,-195.27 528.98,-202.61 528.98,-211.64"/>
<text xml:space="preserve" text-anchor="start" x="586.71" y="-159" font-family="Arial" font-size="20.00" fill="#f8fafc">Supabase PostgreSQL</text>
<text xml:space="preserve" text-anchor="start" x="560.61" y="-136" font-family="Arial" font-size="15.00" fill="#c2f0c2">Source&#45;of&#45;truth layer for appointments,</text>
<text xml:space="preserve" text-anchor="start" x="590.63" y="-118" font-family="Arial" font-size="15.00" fill="#c2f0c2">lifecycle events, call log rows,</text>
<text xml:space="preserve" text-anchor="start" x="624.8" y="-100" font-family="Arial" font-size="15.00" fill="#c2f0c2">and reporting facts.</text>
</g>
<!-- portfoliooperator -->
<g id="node6" class="node">
<title>portfoliooperator</title>
<polygon fill="#a35829" stroke="#7e451d" stroke-width="0" points="421.38,-1205.6 58.62,-1205.6 58.62,-1025.6 421.38,-1025.6 421.38,-1205.6"/>
<text xml:space="preserve" text-anchor="start" x="200.54" y="-1154.6" font-family="Arial" font-size="20.00" fill="#ffe0c2">Operator</text>
<text xml:space="preserve" text-anchor="start" x="78.68" y="-1131.6" font-family="Arial" font-size="15.00" fill="#f9b27c">The working user. Uses the command surface to</text>
<text xml:space="preserve" text-anchor="start" x="154.54" y="-1113.6" font-family="Arial" font-size="15.00" fill="#f9b27c">move practical operations</text>
<text xml:space="preserve" text-anchor="start" x="101.19" y="-1095.6" font-family="Arial" font-size="15.00" fill="#f9b27c">workflow steps without repeatedly clicking</text>
<text xml:space="preserve" text-anchor="start" x="144.1" y="-1077.6" font-family="Arial" font-size="15.00" fill="#f9b27c">through scattered dashboard</text>
<text xml:space="preserve" text-anchor="start" x="211.66" y="-1059.6" font-family="Arial" font-size="15.00" fill="#f9b27c">screens.</text>
</g>
<!-- raycastcommands&#45;&gt;fastapibridge -->
<g id="edge2" class="edge">
<title>raycastcommands&#45;&gt;fastapibridge</title>
<path fill="none" stroke="#8d8d8d" stroke-width="2" stroke-dasharray="5,2" d="M240,-693.67C240,-652.47 240,-603.36 240,-560.97"/>
<polygon fill="#8d8d8d" stroke="#8d8d8d" stroke-width="2" points="242.63,-561.16 240,-553.66 237.38,-561.16 242.63,-561.16"/>
<polygon fill="#18191b" fill-opacity="0.627451" stroke="none" points="240,-610.8 240,-633.6 401.65,-633.6 401.65,-610.8 240,-610.8"/>
<text xml:space="preserve" text-anchor="start" x="243" y="-616.6" font-family="Arial" font-size="14.00" fill="#c9c9c9">sends command payload</text>
</g>
<!-- prospectweb&#45;&gt;supabasetruth -->
<g id="edge3" class="edge">
<title>prospectweb&#45;&gt;supabasetruth</title>
<path fill="none" stroke="#8d8d8d" stroke-width="2" stroke-dasharray="5,2" d="M707.96,-693.79C703.89,-574.72 696.69,-363.92 692.43,-239.28"/>
<polygon fill="#8d8d8d" stroke="#8d8d8d" stroke-width="2" points="695.06,-239.4 692.18,-232 689.81,-239.58 695.06,-239.4"/>
<polygon fill="#18191b" fill-opacity="0.627451" stroke="none" points="702.9,-449.4 702.9,-472.2 827.99,-472.2 827.99,-449.4 702.9,-449.4"/>
<text xml:space="preserve" text-anchor="start" x="705.9" y="-455.2" font-family="Arial" font-size="14.00" fill="#c9c9c9">reads cleaned data</text>
</g>
<!-- fastapibridge&#45;&gt;legacylaravel -->
<g id="edge4" class="edge">
<title>fastapibridge&#45;&gt;legacylaravel</title>
<path fill="none" stroke="#8d8d8d" stroke-width="2" stroke-dasharray="5,2" d="M233.1,-371.1C231.72,-344.4 230.9,-315.01 231.66,-288 232.11,-271.91 232.83,-254.86 233.67,-238.26"/>
<polygon fill="#8d8d8d" stroke="#8d8d8d" stroke-width="2" points="236.27,-238.65 234.04,-231.02 231.03,-238.37 236.27,-238.65"/>
<polygon fill="#18191b" fill-opacity="0.627451" stroke="none" points="231.66,-288 231.66,-310.8 426,-310.8 426,-288 231.66,-288"/>
<text xml:space="preserve" text-anchor="start" x="234.66" y="-293.8" font-family="Arial" font-size="14.00" fill="#c9c9c9">translates dashboard behavior</text>
</g>
<!-- fastapibridge&#45;&gt;supabasetruth -->
<g id="edge5" class="edge">
<title>fastapibridge&#45;&gt;supabasetruth</title>
<path fill="none" stroke="#8d8d8d" stroke-width="2" stroke-dasharray="5,2" d="M364.91,-370.81C392.61,-351.06 421.81,-330.23 449,-310.8 484.9,-285.15 523.8,-257.33 559.62,-231.69"/>
<polygon fill="#8d8d8d" stroke="#8d8d8d" stroke-width="2" points="561.14,-233.83 565.71,-227.33 558.08,-229.56 561.14,-233.83"/>
<polygon fill="#18191b" fill-opacity="0.627451" stroke="none" points="475.05,-288 475.05,-310.8 601.65,-310.8 601.65,-288 475.05,-288"/>
<text xml:space="preserve" text-anchor="start" x="478.05" y="-293.8" font-family="Arial" font-size="14.00" fill="#c9c9c9">writes durable facts</text>
</g>
<!-- portfoliooperator&#45;&gt;raycastcommands -->
<g id="edge1" class="edge">
<title>portfoliooperator&#45;&gt;raycastcommands</title>
<path fill="none" stroke="#8d8d8d" stroke-width="2" stroke-dasharray="5,2" d="M240,-1025.73C240,-981.9 240,-928.88 240,-883.74"/>
<polygon fill="#8d8d8d" stroke="#8d8d8d" stroke-width="2" points="242.63,-883.87 240,-876.37 237.38,-883.87 242.63,-883.87"/>
<polygon fill="#18191b" fill-opacity="0.627451" stroke="none" points="240,-942.8 240,-965.6 392.28,-965.6 392.28,-942.8 240,-942.8"/>
<text xml:space="preserve" text-anchor="start" x="243" y="-948.6" font-family="Arial" font-size="14.00" fill="#c9c9c9">triggers workflow action</text>
</g>
</g>
</svg>
`;case`scouting_coordinator_bucket_map`:return`<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN"
 "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<!-- Generated by graphviz version 14.1.5 (0)
 -->
<!-- Pages: 1 -->
<svg width="1820pt" height="210pt"
 viewBox="0.00 0.00 1820.00 210.00" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
<g id="graph0" class="graph" transform="scale(1 1) rotate(0) translate(15.05 195.05)">
<!-- bucket1 -->
<g id="node1" class="node">
<title>bucket1</title>
<polygon fill="#3b82f6" stroke="#2563eb" stroke-width="0" points="343.42,-180 0,-180 0,0 343.42,0 343.42,-180"/>
<text xml:space="preserve" text-anchor="start" x="63.12" y="-84.4" font-family="Arial" font-size="14.00" fill="#eff6ff"> </text>
<text xml:space="preserve" text-anchor="start" x="122.06" y="-93" font-family="Arial" font-size="20.00" fill="#eff6ff">1. Meetings</text>
<text xml:space="preserve" text-anchor="start" x="321.41" y="-84.4" font-family="Arial" font-size="14.00" fill="#eff6ff"> </text>
<text xml:space="preserve" text-anchor="start" x="122.06" y="-70" font-family="Arial" font-size="15.00" fill="#bfdbfe">Scheduling and confirmation</text>
</g>
<!-- bucket2 -->
<g id="node2" class="node">
<title>bucket2</title>
<polygon fill="#a35829" stroke="#7e451d" stroke-width="0" points="703.46,-180 383.42,-180 383.42,0 703.46,0 703.46,-180"/>
<text xml:space="preserve" text-anchor="start" x="470.72" y="-84.4" font-family="Arial" font-size="14.00" fill="#ffe0c2"> </text>
<text xml:space="preserve" text-anchor="start" x="529.67" y="-93" font-family="Arial" font-size="20.00" fill="#ffe0c2">2. Prep</text>
<text xml:space="preserve" text-anchor="start" x="657.26" y="-84.4" font-family="Arial" font-size="14.00" fill="#ffe0c2"> </text>
<text xml:space="preserve" text-anchor="start" x="529.67" y="-70" font-family="Arial" font-size="15.00" fill="#f9b27c">Pre&#45;meeting work</text>
</g>
<!-- bucket3 -->
<g id="node3" class="node">
<title>bucket3</title>
<polygon fill="#428a4f" stroke="#2d5d39" stroke-width="0" points="1063.5,-180 743.46,-180 743.46,0 1063.5,0 1063.5,-180"/>
<text xml:space="preserve" text-anchor="start" x="815.62" y="-84.4" font-family="Arial" font-size="14.00" fill="#f8fafc"> </text>
<text xml:space="preserve" text-anchor="start" x="874.57" y="-93" font-family="Arial" font-size="20.00" fill="#f8fafc">3. Client Comms</text>
<text xml:space="preserve" text-anchor="start" x="1032.44" y="-84.4" font-family="Arial" font-size="14.00" fill="#f8fafc"> </text>
<text xml:space="preserve" text-anchor="start" x="874.57" y="-70" font-family="Arial" font-size="15.00" fill="#c2f0c2">Messages and calls</text>
</g>
<!-- bucket4 -->
<g id="node4" class="node">
<title>bucket4</title>
<polygon fill="#0284c7" stroke="#0369a1" stroke-width="0" points="1423.57,-180 1103.5,-180 1103.5,0 1423.57,0 1423.57,-180"/>
<text xml:space="preserve" text-anchor="start" x="1166.61" y="-84.4" font-family="Arial" font-size="14.00" fill="#f0f9ff"> </text>
<text xml:space="preserve" text-anchor="start" x="1225.56" y="-93" font-family="Arial" font-size="20.00" fill="#f0f9ff">4. Lifecycle</text>
<text xml:space="preserve" text-anchor="start" x="1401.56" y="-84.4" font-family="Arial" font-size="14.00" fill="#f0f9ff"> </text>
<text xml:space="preserve" text-anchor="start" x="1225.56" y="-70" font-family="Arial" font-size="15.00" fill="#b6ecf7">Stage and reporting truth</text>
</g>
<!-- bucket5 -->
<g id="node5" class="node">
<title>bucket5</title>
<polygon fill="#ac4d39" stroke="#853a2d" stroke-width="0" points="1790.28,-180 1463.57,-180 1463.57,0 1790.28,0 1790.28,-180"/>
<text xml:space="preserve" text-anchor="start" x="1526.69" y="-84.4" font-family="Arial" font-size="14.00" fill="#fbd3cb"> </text>
<text xml:space="preserve" text-anchor="start" x="1585.63" y="-93" font-family="Arial" font-size="20.00" fill="#fbd3cb">5. Outcomes</text>
<text xml:space="preserve" text-anchor="start" x="1768.28" y="-84.4" font-family="Arial" font-size="14.00" fill="#fbd3cb"> </text>
<text xml:space="preserve" text-anchor="start" x="1585.63" y="-70" font-family="Arial" font-size="15.00" fill="#f5b2a3">Enrollments and follow&#45;up</text>
</g>
<!-- bucket1&#45;&gt;bucket2 -->
<g id="edge1" class="edge">
<title>bucket1&#45;&gt;bucket2</title>
<path fill="none" stroke="#8d8d8d" stroke-width="2" stroke-dasharray="5,2" d="M343.23,-90C353.21,-90 363.25,-90 373.22,-90"/>
<polygon fill="#8d8d8d" stroke="#8d8d8d" stroke-width="2" points="373.06,-92.63 380.56,-90 373.06,-87.38 373.06,-92.63"/>
</g>
<!-- bucket2&#45;&gt;bucket3 -->
<g id="edge2" class="edge">
<title>bucket2&#45;&gt;bucket3</title>
<path fill="none" stroke="#8d8d8d" stroke-width="2" stroke-dasharray="5,2" d="M703.3,-90C713.22,-90 723.22,-90 733.18,-90"/>
<polygon fill="#8d8d8d" stroke="#8d8d8d" stroke-width="2" points="733.02,-92.63 740.52,-90 733.02,-87.38 733.02,-92.63"/>
</g>
<!-- bucket3&#45;&gt;bucket4 -->
<g id="edge3" class="edge">
<title>bucket3&#45;&gt;bucket4</title>
<path fill="none" stroke="#8d8d8d" stroke-width="2" stroke-dasharray="5,2" d="M1063.35,-90C1073.27,-90 1083.27,-90 1093.23,-90"/>
<polygon fill="#8d8d8d" stroke="#8d8d8d" stroke-width="2" points="1093.07,-92.63 1100.57,-90 1093.07,-87.38 1093.07,-92.63"/>
</g>
<!-- bucket4&#45;&gt;bucket5 -->
<g id="edge4" class="edge">
<title>bucket4&#45;&gt;bucket5</title>
<path fill="none" stroke="#8d8d8d" stroke-width="2" stroke-dasharray="5,2" d="M1423.31,-90C1433.22,-90 1443.23,-90 1453.2,-90"/>
<polygon fill="#8d8d8d" stroke="#8d8d8d" stroke-width="2" points="1453.05,-92.63 1460.55,-90 1453.05,-87.38 1453.05,-92.63"/>
</g>
</g>
</svg>
`;case`resume_timeline_map`:return`<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN"
 "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<!-- Generated by graphviz version 14.1.5 (0)
 -->
<!-- Pages: 1 -->
<svg width="2290pt" height="210pt"
 viewBox="0.00 0.00 2290.00 210.00" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
<g id="graph0" class="graph" transform="scale(1 1) rotate(0) translate(15.05 195.05)">
<!-- stetsonstart -->
<g id="node1" class="node">
<title>stetsonstart</title>
<polygon fill="#3b82f6" stroke="#2563eb" stroke-width="0" points="390.09,-180 0,-180 0,0 390.09,0 390.09,-180"/>
<text xml:space="preserve" text-anchor="start" x="63.12" y="-84.4" font-family="Arial" font-size="14.00" fill="#eff6ff"> </text>
<text xml:space="preserve" text-anchor="start" x="122.06" y="-102" font-family="Arial" font-size="20.00" fill="#eff6ff">2012 Stetson</text>
<text xml:space="preserve" text-anchor="start" x="368.08" y="-84.4" font-family="Arial" font-size="14.00" fill="#eff6ff"> </text>
<text xml:space="preserve" text-anchor="start" x="122.06" y="-79" font-family="Arial" font-size="15.00" fill="#bfdbfe">Started the communications path at</text>
<text xml:space="preserve" text-anchor="start" x="122.06" y="-61" font-family="Arial" font-size="15.00" fill="#bfdbfe">Stetson.</text>
</g>
<!-- stetsongrad -->
<g id="node2" class="node">
<title>stetsongrad</title>
<polygon fill="#428a4f" stroke="#2d5d39" stroke-width="0" points="834.94,-180 489.02,-180 489.02,0 834.94,0 834.94,-180"/>
<text xml:space="preserve" text-anchor="start" x="552.14" y="-84.4" font-family="Arial" font-size="14.00" fill="#f8fafc"> </text>
<text xml:space="preserve" text-anchor="start" x="611.09" y="-93" font-family="Arial" font-size="20.00" fill="#f8fafc">2016 Graduated</text>
<text xml:space="preserve" text-anchor="start" x="812.93" y="-84.4" font-family="Arial" font-size="14.00" fill="#f8fafc"> </text>
<text xml:space="preserve" text-anchor="start" x="611.09" y="-70" font-family="Arial" font-size="15.00" fill="#c2f0c2">Finished the Stetson degree.</text>
</g>
<!-- spcit -->
<g id="node3" class="node">
<title>spcit</title>
<polygon fill="#0284c7" stroke="#0369a1" stroke-width="0" points="1307.72,-180 904.3,-180 904.3,0 1307.72,0 1307.72,-180"/>
<text xml:space="preserve" text-anchor="start" x="967.42" y="-84.4" font-family="Arial" font-size="14.00" fill="#f0f9ff"> </text>
<text xml:space="preserve" text-anchor="start" x="1026.37" y="-102" font-family="Arial" font-size="20.00" fill="#f0f9ff">2021 SPC / IT</text>
<text xml:space="preserve" text-anchor="start" x="1285.72" y="-84.4" font-family="Arial" font-size="14.00" fill="#f0f9ff"> </text>
<text xml:space="preserve" text-anchor="start" x="1026.37" y="-79" font-family="Arial" font-size="15.00" fill="#b6ecf7">Added computer programming and IT</text>
<text xml:space="preserve" text-anchor="start" x="1026.37" y="-61" font-family="Arial" font-size="15.00" fill="#b6ecf7">coursework.</text>
</g>
<!-- productionsystems -->
<g id="node4" class="node">
<title>productionsystems</title>
<polygon fill="#a35829" stroke="#7e451d" stroke-width="0" points="1788.41,-180 1383.3,-180 1383.3,0 1788.41,0 1788.41,-180"/>
<text xml:space="preserve" text-anchor="start" x="1456.42" y="-84.4" font-family="Arial" font-size="14.00" fill="#ffe0c2"> </text>
<text xml:space="preserve" text-anchor="start" x="1525.37" y="-102" font-family="Arial" font-size="20.00" fill="#ffe0c2">2024 Production Systems</text>
<text xml:space="preserve" text-anchor="start" x="1766.41" y="-84.4" font-family="Arial" font-size="14.00" fill="#ffe0c2"> </text>
<text xml:space="preserve" text-anchor="start" x="1525.37" y="-79" font-family="Arial" font-size="15.00" fill="#f9b27c">Built repeatable video, course, and</text>
<text xml:space="preserve" text-anchor="start" x="1525.37" y="-61" font-family="Arial" font-size="15.00" fill="#f9b27c">workflow systems.</text>
</g>
<!-- aispecialistfit -->
<g id="node5" class="node">
<title>aispecialistfit</title>
<polygon fill="#ac4d39" stroke="#853a2d" stroke-width="0" points="2259.46,-180 1845.3,-180 1845.3,0 2259.46,0 2259.46,-180"/>
<text xml:space="preserve" text-anchor="start" x="1928.37" y="-84.4" font-family="Arial" font-size="14.00" fill="#fbd3cb"> </text>
<text xml:space="preserve" text-anchor="start" x="1987.31" y="-111" font-family="Arial" font-size="20.00" fill="#fbd3cb">2026 AI Specialist Fit</text>
<text xml:space="preserve" text-anchor="start" x="2217.5" y="-84.4" font-family="Arial" font-size="14.00" fill="#fbd3cb"> </text>
<text xml:space="preserve" text-anchor="start" x="1987.31" y="-88" font-family="Arial" font-size="15.00" fill="#f5b2a3">Positioned practical AI workflow</text>
<text xml:space="preserve" text-anchor="start" x="1987.31" y="-70" font-family="Arial" font-size="15.00" fill="#f5b2a3">support around prep, review, and</text>
<text xml:space="preserve" text-anchor="start" x="1987.31" y="-52" font-family="Arial" font-size="15.00" fill="#f5b2a3">implementation.</text>
</g>
<!-- stetsonstart&#45;&gt;stetsongrad -->
<g id="edge1" class="edge">
<title>stetsonstart&#45;&gt;stetsongrad</title>
<path fill="none" stroke="#8d8d8d" stroke-width="2" stroke-dasharray="5,2" d="M389.85,-90C419.39,-90 449.78,-90 479.04,-90"/>
<polygon fill="#8d8d8d" stroke="#8d8d8d" stroke-width="2" points="478.82,-92.63 486.32,-90 478.82,-87.38 478.82,-92.63"/>
<polygon fill="#18191b" fill-opacity="0.627451" stroke="none" points="410.09,-90 410.09,-112.8 469.02,-112.8 469.02,-90 410.09,-90"/>
<text xml:space="preserve" text-anchor="start" x="413.09" y="-95.8" font-family="Arial" font-size="14.00" fill="#c9c9c9">advance</text>
</g>
<!-- stetsongrad&#45;&gt;spcit -->
<g id="edge2" class="edge">
<title>stetsongrad&#45;&gt;spcit</title>
<path fill="none" stroke="#8d8d8d" stroke-width="2" stroke-dasharray="5,2" d="M834.83,-90C854.25,-90 874.2,-90 894.04,-90"/>
<polygon fill="#8d8d8d" stroke="#8d8d8d" stroke-width="2" points="893.87,-92.63 901.37,-90 893.87,-87.38 893.87,-92.63"/>
<polygon fill="#18191b" fill-opacity="0.627451" stroke="none" points="854.94,-90 854.94,-112.8 884.3,-112.8 884.3,-90 854.94,-90"/>
<text xml:space="preserve" text-anchor="start" x="857.94" y="-95.8" font-family="Arial" font-size="14.00" fill="#c9c9c9">add</text>
</g>
<!-- spcit&#45;&gt;productionsystems -->
<g id="edge3" class="edge">
<title>spcit&#45;&gt;productionsystems</title>
<path fill="none" stroke="#8d8d8d" stroke-width="2" stroke-dasharray="5,2" d="M1307.59,-90C1329.3,-90 1351.46,-90 1373.3,-90"/>
<polygon fill="#8d8d8d" stroke="#8d8d8d" stroke-width="2" points="1373.12,-92.63 1380.62,-90 1373.12,-87.38 1373.12,-92.63"/>
<polygon fill="#18191b" fill-opacity="0.627451" stroke="none" points="1327.72,-90 1327.72,-112.8 1363.3,-112.8 1363.3,-90 1327.72,-90"/>
<text xml:space="preserve" text-anchor="start" x="1330.72" y="-95.8" font-family="Arial" font-size="14.00" fill="#c9c9c9">build</text>
</g>
<!-- productionsystems&#45;&gt;aispecialistfit -->
<g id="edge4" class="edge">
<title>productionsystems&#45;&gt;aispecialistfit</title>
<path fill="none" stroke="#8d8d8d" stroke-width="2" stroke-dasharray="5,2" d="M1788.24,-90C1803.82,-90 1819.58,-90 1835.25,-90"/>
<polygon fill="#8d8d8d" stroke="#8d8d8d" stroke-width="2" points="1835,-92.63 1842.5,-90 1835,-87.38 1835,-92.63"/>
<polygon fill="#18191b" fill-opacity="0.627451" stroke="none" points="1808.41,-90 1808.41,-112.8 1825.3,-112.8 1825.3,-90 1808.41,-90"/>
<text xml:space="preserve" text-anchor="start" x="1811.41" y="-95.8" font-family="Arial" font-size="14.00" fill="#c9c9c9">fit</text>
</g>
</g>
</svg>
`;case`review_first_implementation_loop`:return`<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN"
 "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<!-- Generated by graphviz version 14.1.5 (0)
 -->
<!-- Pages: 1 -->
<svg width="2396pt" height="391pt"
 viewBox="0.00 0.00 2396.00 391.00" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
<g id="graph0" class="graph" transform="scale(1 1) rotate(0) translate(15.05 376.05)">
<!-- verify -->
<g id="node1" class="node">
<title>verify</title>
<polygon fill="#428a4f" stroke="#2d5d39" stroke-width="0" points="377.55,-179 0,-179 0,-7 377.55,-7 377.55,-179"/>
<text xml:space="preserve" text-anchor="start" x="73.12" y="-87.4" font-family="Arial" font-size="14.00" fill="#f8fafc"> </text>
<text xml:space="preserve" text-anchor="start" x="142.06" y="-105" font-family="Arial" font-size="20.00" fill="#f8fafc">Verify</text>
<text xml:space="preserve" text-anchor="start" x="355.54" y="-87.4" font-family="Arial" font-size="14.00" fill="#f8fafc"> </text>
<text xml:space="preserve" text-anchor="start" x="142.06" y="-82" font-family="Arial" font-size="15.00" fill="#c2f0c2">Use readback, tests, or source</text>
<text xml:space="preserve" text-anchor="start" x="142.06" y="-64" font-family="Arial" font-size="15.00" fill="#c2f0c2">review before calling it real.</text>
</g>
<!-- gather -->
<g id="node2" class="node">
<title>gather</title>
<polygon fill="#ac4d39" stroke="#853a2d" stroke-width="0" points="842.88,-361 497,-361 497,-181 842.88,-181 842.88,-361"/>
<text xml:space="preserve" text-anchor="start" x="560.12" y="-265.4" font-family="Arial" font-size="14.00" fill="#fbd3cb"> </text>
<text xml:space="preserve" text-anchor="start" x="619.06" y="-283" font-family="Arial" font-size="20.00" fill="#fbd3cb">Gather</text>
<text xml:space="preserve" text-anchor="start" x="820.87" y="-265.4" font-family="Arial" font-size="14.00" fill="#fbd3cb"> </text>
<text xml:space="preserve" text-anchor="start" x="619.06" y="-260" font-family="Arial" font-size="15.00" fill="#f5b2a3">Collect the real workflow and</text>
<text xml:space="preserve" text-anchor="start" x="619.06" y="-242" font-family="Arial" font-size="15.00" fill="#f5b2a3">source evidence.</text>
</g>
<!-- classify -->
<g id="node3" class="node">
<title>classify</title>
<polygon fill="#0284c7" stroke="#0369a1" stroke-width="0" points="1334.47,-361 968.57,-361 968.57,-181 1334.47,-181 1334.47,-361"/>
<text xml:space="preserve" text-anchor="start" x="1031.68" y="-265.4" font-family="Arial" font-size="14.00" fill="#f0f9ff"> </text>
<text xml:space="preserve" text-anchor="start" x="1090.63" y="-283" font-family="Arial" font-size="20.00" fill="#f0f9ff">Classify</text>
<text xml:space="preserve" text-anchor="start" x="1312.46" y="-265.4" font-family="Arial" font-size="14.00" fill="#f0f9ff"> </text>
<text xml:space="preserve" text-anchor="start" x="1090.63" y="-260" font-family="Arial" font-size="15.00" fill="#b6ecf7">Separate owners, facts, support</text>
<text xml:space="preserve" text-anchor="start" x="1090.63" y="-242" font-family="Arial" font-size="15.00" fill="#b6ecf7">state, and commands.</text>
</g>
<!-- draft -->
<g id="node4" class="node">
<title>draft</title>
<polygon fill="#3b82f6" stroke="#2563eb" stroke-width="0" points="1841.67,-361 1474.96,-361 1474.96,-181 1841.67,-181 1841.67,-361"/>
<text xml:space="preserve" text-anchor="start" x="1538.07" y="-265.4" font-family="Arial" font-size="14.00" fill="#eff6ff"> </text>
<text xml:space="preserve" text-anchor="start" x="1597.02" y="-283" font-family="Arial" font-size="20.00" fill="#eff6ff">Draft</text>
<text xml:space="preserve" text-anchor="start" x="1819.66" y="-265.4" font-family="Arial" font-size="14.00" fill="#eff6ff"> </text>
<text xml:space="preserve" text-anchor="start" x="1597.02" y="-260" font-family="Arial" font-size="15.00" fill="#bfdbfe">Turn the classified workflow into</text>
<text xml:space="preserve" text-anchor="start" x="1597.02" y="-242" font-family="Arial" font-size="15.00" fill="#bfdbfe">useful working material.</text>
</g>
<!-- review -->
<g id="node5" class="node">
<title>review</title>
<polygon fill="#a35829" stroke="#7e451d" stroke-width="0" points="2365.67,-183 1955.68,-183 1955.68,-3 2365.67,-3 2365.67,-183"/>
<text xml:space="preserve" text-anchor="start" x="2038.75" y="-87.4" font-family="Arial" font-size="14.00" fill="#ffe0c2"> </text>
<text xml:space="preserve" text-anchor="start" x="2097.69" y="-105" font-family="Arial" font-size="20.00" fill="#ffe0c2">Review</text>
<text xml:space="preserve" text-anchor="start" x="2323.71" y="-87.4" font-family="Arial" font-size="14.00" fill="#ffe0c2"> </text>
<text xml:space="preserve" text-anchor="start" x="2097.69" y="-82" font-family="Arial" font-size="15.00" fill="#f9b27c">Keep human judgment before</text>
<text xml:space="preserve" text-anchor="start" x="2097.69" y="-64" font-family="Arial" font-size="15.00" fill="#f9b27c">mutation, sending, or publishing.</text>
</g>
<!-- verify&#45;&gt;gather -->
<g id="edge1" class="edge">
<title>verify&#45;&gt;gather</title>
<path fill="none" stroke="#8d8d8d" stroke-width="2" stroke-dasharray="5,2" d="M377.44,-162.71C413.68,-176.18 451.59,-190.26 487.62,-203.64"/>
<polygon fill="#8d8d8d" stroke="#8d8d8d" stroke-width="2" points="486.45,-206.01 494.4,-206.16 488.28,-201.09 486.45,-206.01"/>
<polygon fill="#18191b" fill-opacity="0.627451" stroke="none" points="417.55,-187.34 417.55,-210.14 457,-210.14 457,-187.34 417.55,-187.34"/>
<text xml:space="preserve" text-anchor="start" x="420.55" y="-193.14" font-family="Arial" font-size="14.00" fill="#c9c9c9">verify</text>
</g>
<!-- gather&#45;&gt;classify -->
<g id="edge2" class="edge">
<title>gather&#45;&gt;classify</title>
<path fill="none" stroke="#8d8d8d" stroke-width="2" stroke-dasharray="5,2" d="M842.72,-271C880.23,-271 920.15,-271 958.38,-271"/>
<polygon fill="#8d8d8d" stroke="#8d8d8d" stroke-width="2" points="958.06,-273.63 965.56,-271 958.06,-268.38 958.06,-273.63"/>
<polygon fill="#18191b" fill-opacity="0.627451" stroke="none" points="882.88,-271 882.88,-293.8 928.57,-293.8 928.57,-271 882.88,-271"/>
<text xml:space="preserve" text-anchor="start" x="885.88" y="-276.8" font-family="Arial" font-size="14.00" fill="#c9c9c9">collect</text>
</g>
<!-- classify&#45;&gt;draft -->
<g id="edge3" class="edge">
<title>classify&#45;&gt;draft</title>
<path fill="none" stroke="#8d8d8d" stroke-width="2" stroke-dasharray="5,2" d="M1334.4,-271C1376.69,-271 1421.84,-271 1464.58,-271"/>
<polygon fill="#8d8d8d" stroke="#8d8d8d" stroke-width="2" points="1464.57,-273.63 1472.07,-271 1464.57,-268.38 1464.57,-273.63"/>
<polygon fill="#18191b" fill-opacity="0.627451" stroke="none" points="1374.47,-271 1374.47,-293.8 1434.96,-293.8 1434.96,-271 1374.47,-271"/>
<text xml:space="preserve" text-anchor="start" x="1377.47" y="-276.8" font-family="Arial" font-size="14.00" fill="#c9c9c9">separate</text>
</g>
<!-- draft&#45;&gt;review -->
<g id="edge4" class="edge">
<title>draft&#45;&gt;review</title>
<path fill="none" stroke="#8d8d8d" stroke-width="2" stroke-dasharray="5,2" d="M1841.37,-206.23C1875.34,-194.15 1911.12,-181.42 1945.94,-169.03"/>
<polygon fill="#8d8d8d" stroke="#8d8d8d" stroke-width="2" points="1946.7,-171.55 1952.89,-166.56 1944.94,-166.6 1946.7,-171.55"/>
<polygon fill="#18191b" fill-opacity="0.627451" stroke="none" points="1881.67,-187.34 1881.67,-210.14 1915.68,-210.14 1915.68,-187.34 1881.67,-187.34"/>
<text xml:space="preserve" text-anchor="start" x="1884.67" y="-193.14" font-family="Arial" font-size="14.00" fill="#c9c9c9">draft</text>
</g>
<!-- review&#45;&gt;verify -->
<g id="edge5" class="edge">
<title>review&#45;&gt;verify</title>
<path fill="none" stroke="#8d8d8d" stroke-width="2" stroke-dasharray="5,2" d="M1955.85,-37.63C1865.69,-17.68 1757.94,0 1659.31,0 668.94,0 668.94,0 668.94,0 575.3,0 473.23,-17.33 387.44,-37.02"/>
<polygon fill="#8d8d8d" stroke="#8d8d8d" stroke-width="2" points="386.99,-34.43 380.28,-38.69 388.18,-39.55 386.99,-34.43"/>
<polygon fill="#18191b" fill-opacity="0.627451" stroke="none" points="1128.29,0 1128.29,-22.8 1174.75,-22.8 1174.75,0 1128.29,0"/>
<text xml:space="preserve" text-anchor="start" x="1131.29" y="-5.8" font-family="Arial" font-size="14.00" fill="#c9c9c9">review</text>
</g>
</g>
</svg>
`;case`opportunity_hq_container_map`:return`<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN"
 "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<!-- Generated by graphviz version 14.1.5 (0)
 -->
<!-- Pages: 1 -->
<svg width="3102pt" height="1245pt"
 viewBox="0.00 0.00 3102.00 1245.00" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
<g id="graph0" class="graph" transform="scale(1 1) rotate(0) translate(15.05 1229.85)">
<g id="clust1" class="cluster">
<title>cluster_capture</title>
<polygon fill="#3e4651" stroke="#2d333d" points="1348,-662.8 1348,-944 2196,-944 2196,-662.8 1348,-662.8"/>
<text xml:space="preserve" text-anchor="start" x="1356" y="-931.1" font-family="Arial" font-weight="bold" font-size="11.00" fill="#cbd5e1" fill-opacity="0.701961">CAPTURE SURFACES</text>
</g>
<g id="clust2" class="cluster">
<title>cluster_durable</title>
<polygon fill="#0d4b6c" stroke="#0b3c57" points="8,-8 8,-944 875,-944 875,-8 8,-8"/>
<text xml:space="preserve" text-anchor="start" x="16" y="-931.1" font-family="Arial" font-weight="bold" font-size="11.00" fill="#b6ecf7" fill-opacity="0.701961">OPPORTUNITY HQ</text>
</g>
<g id="clust3" class="cluster">
<title>cluster_publishing</title>
<polygon fill="#3e4651" stroke="#2d333d" points="905,-8 905,-289.2 1749,-289.2 1749,-8 905,-8"/>
<text xml:space="preserve" text-anchor="start" x="913" y="-276.3" font-family="Arial" font-weight="bold" font-size="11.00" fill="#cbd5e1" fill-opacity="0.701961">PUBLISHING SURFACES</text>
</g>
<!-- obsidian -->
<g id="node1" class="node">
<title>obsidian</title>
<polygon fill="#ac4d39" stroke="#853a2d" stroke-width="0" points="1719.97,-882.8 1388.03,-882.8 1388.03,-702.8 1719.97,-702.8 1719.97,-882.8"/>
<text xml:space="preserve" text-anchor="start" x="1481.73" y="-831.8" font-family="Arial" font-size="20.00" fill="#fbd3cb">Obsidian _Inbox</text>
<text xml:space="preserve" text-anchor="start" x="1408.09" y="-808.8" font-family="Arial" font-size="15.00" fill="#f5b2a3">Raw capture only. Use for unclear thoughts,</text>
<text xml:space="preserve" text-anchor="start" x="1481.45" y="-790.8" font-family="Arial" font-size="15.00" fill="#f5b2a3">offload notes, passive</text>
<text xml:space="preserve" text-anchor="start" x="1413.5" y="-772.8" font-family="Arial" font-size="15.00" fill="#f5b2a3">shortcut ideas, and anything that is not yet</text>
<text xml:space="preserve" text-anchor="start" x="1471.05" y="-754.8" font-family="Arial" font-size="15.00" fill="#f5b2a3">a real task. Promote only</text>
<text xml:space="preserve" text-anchor="start" x="1410.16" y="-736.8" font-family="Arial" font-size="15.00" fill="#f5b2a3">when the item has money weight, deadline,</text>
</g>
<!-- mobileform -->
<g id="node2" class="node">
<title>mobileform</title>
<polygon fill="#3b82f6" stroke="#2563eb" stroke-width="0" points="2156.26,-882.8 1829.74,-882.8 1829.74,-702.8 2156.26,-702.8 2156.26,-882.8"/>
<text xml:space="preserve" text-anchor="start" x="1912.99" y="-822.8" font-family="Arial" font-size="20.00" fill="#eff6ff">Mobile Task Form</text>
<text xml:space="preserve" text-anchor="start" x="1853.75" y="-799.8" font-family="Arial" font-size="15.00" fill="#bfdbfe">Fast durable capture path for task&#45;shaped</text>
<text xml:space="preserve" text-anchor="start" x="1900.48" y="-781.8" font-family="Arial" font-size="15.00" fill="#bfdbfe">work. Minimum fields: Task,</text>
<text xml:space="preserve" text-anchor="start" x="1855.01" y="-763.8" font-family="Arial" font-size="15.00" fill="#bfdbfe">Project, Duration, and Link/Notes. Default</text>
<text xml:space="preserve" text-anchor="start" x="1906.27" y="-745.8" font-family="Arial" font-size="15.00" fill="#bfdbfe">Status should be Queued.</text>
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
<polygon fill="#64748b" stroke="#475569" stroke-width="0" points="834.66,-882.8 499.34,-882.8 499.34,-702.8 834.66,-702.8 834.66,-882.8"/>
<text xml:space="preserve" text-anchor="start" x="603.06" y="-831.8" font-family="Arial" font-size="20.00" fill="#f8fafc">Dependencies</text>
<text xml:space="preserve" text-anchor="start" x="533.6" y="-808.8" font-family="Arial" font-size="15.00" fill="#cbd5e1">Real blockers only: application work can</text>
<text xml:space="preserve" text-anchor="start" x="559.01" y="-790.8" font-family="Arial" font-size="15.00" fill="#cbd5e1">depend on resume/snippet prep;</text>
<text xml:space="preserve" text-anchor="start" x="525.25" y="-772.8" font-family="Arial" font-size="15.00" fill="#cbd5e1">website request flow depends on Tally and</text>
<text xml:space="preserve" text-anchor="start" x="577.37" y="-754.8" font-family="Arial" font-size="15.00" fill="#cbd5e1">Notion intake; offer traction</text>
<text xml:space="preserve" text-anchor="start" x="519.4" y="-736.8" font-family="Arial" font-size="15.00" fill="#cbd5e1">depends on website, portfolio, outreach, and</text>
</g>
<!-- tasks -->
<g id="node5" class="node">
<title>tasks</title>
<polygon fill="#0284c7" stroke="#0369a1" stroke-width="0" points="830.01,-556 495.99,-556 495.99,-384 830.01,-384 830.01,-556"/>
<text xml:space="preserve" text-anchor="start" x="581.86" y="-509" font-family="Arial" font-size="20.00" fill="#f0f9ff">Opportunity Tasks</text>
<text xml:space="preserve" text-anchor="start" x="533.79" y="-486" font-family="Arial" font-size="15.00" fill="#b6ecf7">Executable work. Fields: Task, Project,</text>
<text xml:space="preserve" text-anchor="start" x="555.04" y="-468" font-family="Arial" font-size="15.00" fill="#b6ecf7">Status, Duration, Money Priority,</text>
<text xml:space="preserve" text-anchor="start" x="564.63" y="-450" font-family="Arial" font-size="15.00" fill="#b6ecf7">Work Date, Shift, Link, Notes.</text>
<text xml:space="preserve" text-anchor="start" x="520.01" y="-432" font-family="Arial" font-size="15.00" fill="#b6ecf7">Status contract: Queued, Today, In Motion,</text>
<text xml:space="preserve" text-anchor="start" x="585.88" y="-414" font-family="Arial" font-size="15.00" fill="#b6ecf7">Waiting, Done, Parked.</text>
</g>
<!-- taskviews -->
<g id="node6" class="node">
<title>taskviews</title>
<polygon fill="#3b82f6" stroke="#2563eb" stroke-width="0" points="835.41,-228 490.59,-228 490.59,-48 835.41,-48 835.41,-228"/>
<text xml:space="preserve" text-anchor="start" x="611.88" y="-177" font-family="Arial" font-size="20.00" fill="#eff6ff">Task Views</text>
<text xml:space="preserve" text-anchor="start" x="514.61" y="-154" font-family="Arial" font-size="15.00" fill="#bfdbfe">Views over Opportunity Tasks: Focus Board,</text>
<text xml:space="preserve" text-anchor="start" x="565.89" y="-136" font-family="Arial" font-size="15.00" fill="#bfdbfe">Daily Blocks, Work Calendar,</text>
<text xml:space="preserve" text-anchor="start" x="532.92" y="-118" font-family="Arial" font-size="15.00" fill="#bfdbfe">Applications, Freelance, Singleton, and</text>
<text xml:space="preserve" text-anchor="start" x="530.85" y="-100" font-family="Arial" font-size="15.00" fill="#bfdbfe">Portfolio. These are lenses, not sources</text>
<text xml:space="preserve" text-anchor="start" x="637.57" y="-82" font-family="Arial" font-size="15.00" fill="#bfdbfe">of truth.</text>
</g>
<!-- website -->
<g id="node7" class="node">
<title>website</title>
<polygon fill="#3b82f6" stroke="#2563eb" stroke-width="0" points="1265.02,-228 944.98,-228 944.98,-48 1265.02,-48 1265.02,-228"/>
<text xml:space="preserve" text-anchor="start" x="1024.4" y="-159" font-family="Arial" font-size="20.00" fill="#eff6ff">Singleton Website</text>
<text xml:space="preserve" text-anchor="start" x="977.02" y="-136" font-family="Arial" font-size="15.00" fill="#bfdbfe">Public portfolio and offer surface. Pulls</text>
<text xml:space="preserve" text-anchor="start" x="976.6" y="-118" font-family="Arial" font-size="15.00" fill="#bfdbfe">from packaged portfolio and clear offer</text>
<text xml:space="preserve" text-anchor="start" x="1014.14" y="-100" font-family="Arial" font-size="15.00" fill="#bfdbfe">work, not from raw capture.</text>
</g>
<!-- proposals -->
<g id="node8" class="node">
<title>proposals</title>
<polygon fill="#a35829" stroke="#7e451d" stroke-width="0" points="1708.8,-228 1375.2,-228 1375.2,-48 1708.8,-48 1708.8,-228"/>
<text xml:space="preserve" text-anchor="start" x="1435.28" y="-168" font-family="Arial" font-size="20.00" fill="#ffe0c2">Applications / Proposals</text>
<text xml:space="preserve" text-anchor="start" x="1395.26" y="-145" font-family="Arial" font-size="15.00" fill="#f9b27c">Outbound artifacts: job applications, Upwork</text>
<text xml:space="preserve" text-anchor="start" x="1453.62" y="-127" font-family="Arial" font-size="15.00" fill="#f9b27c">proposals, direct outreach,</text>
<text xml:space="preserve" text-anchor="start" x="1411.1" y="-109" font-family="Arial" font-size="15.00" fill="#f9b27c">cover notes, and follow&#45;ups. Their state</text>
<text xml:space="preserve" text-anchor="start" x="1454.05" y="-91" font-family="Arial" font-size="15.00" fill="#f9b27c">returns to Opportunity HQ.</text>
</g>
<!-- operator -->
<g id="node9" class="node">
<title>operator</title>
<polygon fill="#a35829" stroke="#7e451d" stroke-width="0" points="2012.65,-1214.8 1667.35,-1214.8 1667.35,-1034.8 2012.65,-1034.8 2012.65,-1214.8"/>
<text xml:space="preserve" text-anchor="start" x="1800.54" y="-1163.8" font-family="Arial" font-size="20.00" fill="#ffe0c2">Operator</text>
<text xml:space="preserve" text-anchor="start" x="1704.52" y="-1140.8" font-family="Arial" font-size="15.00" fill="#f9b27c">The working user. Uses mobile, desktop,</text>
<text xml:space="preserve" text-anchor="start" x="1710.76" y="-1122.8" font-family="Arial" font-size="15.00" fill="#f9b27c">Raycast, Codex, Notion, Obsidian, and</text>
<text xml:space="preserve" text-anchor="start" x="1690.34" y="-1104.8" font-family="Arial" font-size="15.00" fill="#f9b27c">Eagle to move job search, Upwork, Singleton</text>
<text xml:space="preserve" text-anchor="start" x="1735.78" y="-1086.8" font-family="Arial" font-size="15.00" fill="#f9b27c">offer, and portfolio work without</text>
<text xml:space="preserve" text-anchor="start" x="1687.4" y="-1068.8" font-family="Arial" font-size="15.00" fill="#f9b27c">repeatedly deciding where each item belongs.</text>
</g>
<!-- logtask -->
<g id="node10" class="node">
<title>logtask</title>
<polygon fill="#3b82f6" stroke="#2563eb" stroke-width="0" points="2599.46,-1214.8 2272.54,-1214.8 2272.54,-1034.8 2599.46,-1034.8 2599.46,-1214.8"/>
<text xml:space="preserve" text-anchor="start" x="2394.87" y="-1154.8" font-family="Arial" font-size="20.00" fill="#eff6ff">Log Task</text>
<text xml:space="preserve" text-anchor="start" x="2296.77" y="-1131.8" font-family="Arial" font-size="15.00" fill="#bfdbfe">Create an Opportunity Task from selected</text>
<text xml:space="preserve" text-anchor="start" x="2347.2" y="-1113.8" font-family="Arial" font-size="15.00" fill="#bfdbfe">text, clipboard link, manual</text>
<text xml:space="preserve" text-anchor="start" x="2292.6" y="-1095.8" font-family="Arial" font-size="15.00" fill="#bfdbfe">form input, or mobile/share context. Default</text>
<text xml:space="preserve" text-anchor="start" x="2381.8" y="-1077.8" font-family="Arial" font-size="15.00" fill="#bfdbfe">Status: Queued.</text>
</g>
<!-- updatetask -->
<g id="node11" class="node">
<title>updatetask</title>
<polygon fill="#3b82f6" stroke="#2563eb" stroke-width="0" points="2603.2,-882.8 2268.8,-882.8 2268.8,-702.8 2603.2,-702.8 2603.2,-882.8"/>
<text xml:space="preserve" text-anchor="start" x="2379.31" y="-813.8" font-family="Arial" font-size="20.00" fill="#eff6ff">Update Task</text>
<text xml:space="preserve" text-anchor="start" x="2288.85" y="-790.8" font-family="Arial" font-size="15.00" fill="#bfdbfe">Update Status, Money Priority, Project, Link,</text>
<text xml:space="preserve" text-anchor="start" x="2407.66" y="-772.8" font-family="Arial" font-size="15.00" fill="#bfdbfe">or Notes</text>
<text xml:space="preserve" text-anchor="start" x="2328.44" y="-754.8" font-family="Arial" font-size="15.00" fill="#bfdbfe">on an existing Opportunity Task.</text>
</g>
<!-- searchrun -->
<g id="node12" class="node">
<title>searchrun</title>
<polygon fill="#3b82f6" stroke="#2563eb" stroke-width="0" points="2613.63,-560 2258.37,-560 2258.37,-380 2613.63,-380 2613.63,-560"/>
<text xml:space="preserve" text-anchor="start" x="2328.72" y="-500" font-family="Arial" font-size="20.00" fill="#eff6ff">Opportunity Search Run</text>
<text xml:space="preserve" text-anchor="start" x="2278.43" y="-477" font-family="Arial" font-size="15.00" fill="#bfdbfe">Codex&#45;owned manual workflow. Search current</text>
<text xml:space="preserve" text-anchor="start" x="2341.79" y="-459" font-family="Arial" font-size="15.00" fill="#bfdbfe">jobs or leads, return winners</text>
<text xml:space="preserve" text-anchor="start" x="2304.25" y="-441" font-family="Arial" font-size="15.00" fill="#bfdbfe">for approval, then log approved tasks to</text>
<text xml:space="preserve" text-anchor="start" x="2381.81" y="-423" font-family="Arial" font-size="15.00" fill="#bfdbfe">Opportunity HQ.</text>
</g>
<!-- exportblocks -->
<g id="node13" class="node">
<title>exportblocks</title>
<polygon fill="#3b82f6" stroke="#2563eb" stroke-width="0" points="2615.73,-228 2256.27,-228 2256.27,-48 2615.73,-48 2615.73,-228"/>
<text xml:space="preserve" text-anchor="start" x="2344.86" y="-168" font-family="Arial" font-size="20.00" fill="#eff6ff">Export Focus Blocks</text>
<text xml:space="preserve" text-anchor="start" x="2276.33" y="-145" font-family="Arial" font-size="15.00" fill="#bfdbfe">Codex&#45;owned manual workflow. Read approved</text>
<text xml:space="preserve" text-anchor="start" x="2342.21" y="-127" font-family="Arial" font-size="15.00" fill="#bfdbfe">Opportunity Tasks, build 3&#45;5</text>
<text xml:space="preserve" text-anchor="start" x="2302.2" y="-109" font-family="Arial" font-size="15.00" fill="#bfdbfe">realistic time blocks, export .ics, and ask</text>
<text xml:space="preserve" text-anchor="start" x="2360.11" y="-91" font-family="Arial" font-size="15.00" fill="#bfdbfe">before Notion updates.</text>
</g>
<!-- goalcheckin -->
<g id="node14" class="node">
<title>goalcheckin</title>
<polygon fill="#3b82f6" stroke="#2563eb" stroke-width="0" points="3067.47,-1214.8 2730.53,-1214.8 2730.53,-1034.8 3067.47,-1034.8 3067.47,-1214.8"/>
<text xml:space="preserve" text-anchor="start" x="2835.08" y="-1163.8" font-family="Arial" font-size="20.00" fill="#eff6ff">Goal Check&#45;In</text>
<text xml:space="preserve" text-anchor="start" x="2765.2" y="-1140.8" font-family="Arial" font-size="15.00" fill="#bfdbfe">Future small command. Ask count/result</text>
<text xml:space="preserve" text-anchor="start" x="2812.28" y="-1122.8" font-family="Arial" font-size="15.00" fill="#bfdbfe">questions for applications,</text>
<text xml:space="preserve" text-anchor="start" x="2750.59" y="-1104.8" font-family="Arial" font-size="15.00" fill="#bfdbfe">freelance proposals, Strategic work, and real</text>
<text xml:space="preserve" text-anchor="start" x="2807.29" y="-1086.8" font-family="Arial" font-size="15.00" fill="#bfdbfe">blockers. Output one or two</text>
<text xml:space="preserve" text-anchor="start" x="2768.93" y="-1068.8" font-family="Arial" font-size="15.00" fill="#bfdbfe">daily implications, not a full plan or new</text>
</g>
<!-- startapplication -->
<g id="node15" class="node">
<title>startapplication</title>
<polygon fill="#3b82f6" stroke="#2563eb" stroke-width="0" points="3059.02,-882.8 2738.98,-882.8 2738.98,-702.8 3059.02,-702.8 3059.02,-882.8"/>
<text xml:space="preserve" text-anchor="start" x="2826.18" y="-813.8" font-family="Arial" font-size="20.00" fill="#eff6ff">Start Application</text>
<text xml:space="preserve" text-anchor="start" x="2761" y="-790.8" font-family="Arial" font-size="15.00" fill="#bfdbfe">Open a job link and resume path from the</text>
<text xml:space="preserve" text-anchor="start" x="2796.03" y="-772.8" font-family="Arial" font-size="15.00" fill="#bfdbfe">selected task. Move the task to</text>
<text xml:space="preserve" text-anchor="start" x="2799.8" y="-754.8" font-family="Arial" font-size="15.00" fill="#bfdbfe">In Motion while work is active.</text>
</g>
<!-- draftproposal -->
<g id="node16" class="node">
<title>draftproposal</title>
<polygon fill="#3b82f6" stroke="#2563eb" stroke-width="0" points="3059.97,-560 2738.03,-560 2738.03,-380 3059.97,-380 3059.97,-560"/>
<text xml:space="preserve" text-anchor="start" x="2835.08" y="-491" font-family="Arial" font-size="20.00" fill="#eff6ff">Draft Proposal</text>
<text xml:space="preserve" text-anchor="start" x="2758.09" y="-468" font-family="Arial" font-size="15.00" fill="#bfdbfe">Turn a copied Upwork post into a proposal</text>
<text xml:space="preserve" text-anchor="start" x="2812.7" y="-450" font-family="Arial" font-size="15.00" fill="#bfdbfe">draft and log the follow&#45;up</text>
<text xml:space="preserve" text-anchor="start" x="2800.2" y="-432" font-family="Arial" font-size="15.00" fill="#bfdbfe">state back to Opportunity HQ.</text>
</g>
<!-- captureportfolio -->
<g id="node17" class="node">
<title>captureportfolio</title>
<polygon fill="#3b82f6" stroke="#2563eb" stroke-width="0" points="3072.07,-228 2725.93,-228 2725.93,-48 3072.07,-48 3072.07,-228"/>
<text xml:space="preserve" text-anchor="start" x="2823.96" y="-168" font-family="Arial" font-size="20.00" fill="#eff6ff">Capture Portfolio</text>
<text xml:space="preserve" text-anchor="start" x="2745.98" y="-145" font-family="Arial" font-size="15.00" fill="#bfdbfe">Import the selected asset to Eagle, append an</text>
<text xml:space="preserve" text-anchor="start" x="2810.18" y="-127" font-family="Arial" font-size="15.00" fill="#bfdbfe">Added to Eagle note to the</text>
<text xml:space="preserve" text-anchor="start" x="2757.68" y="-109" font-family="Arial" font-size="15.00" fill="#bfdbfe">selected Portfolio task, then mark that task</text>
<text xml:space="preserve" text-anchor="start" x="2878.99" y="-91" font-family="Arial" font-size="15.00" fill="#bfdbfe">Done.</text>
</g>
<!-- portfoliostore -->
<g id="node18" class="node">
<title>portfoliostore</title>
<path fill="#428a4f" stroke="#2d5d39" stroke-width="2" d="M1277.79,-866.44C1277.79,-875.47 1203.03,-882.8 1111,-882.8 1018.97,-882.8 944.21,-875.47 944.21,-866.44 944.21,-866.44 944.21,-719.16 944.21,-719.16 944.21,-710.13 1018.97,-702.8 1111,-702.8 1203.03,-702.8 1277.79,-710.13 1277.79,-719.16 1277.79,-719.16 1277.79,-866.44 1277.79,-866.44"/>
<path fill="none" stroke="#2d5d39" stroke-width="2" d="M1277.79,-866.44C1277.79,-857.41 1203.03,-850.07 1111,-850.07 1018.97,-850.07 944.21,-857.41 944.21,-866.44"/>
<text xml:space="preserve" text-anchor="start" x="1012.62" y="-822.8" font-family="Arial" font-size="20.00" fill="#f8fafc">Eagle Portfolio Library</text>
<text xml:space="preserve" text-anchor="start" x="964.68" y="-799.8" font-family="Arial" font-size="15.00" fill="#c2f0c2">Portfolio/evidence store. Holds screenshots,</text>
<text xml:space="preserve" text-anchor="start" x="964.27" y="-781.8" font-family="Arial" font-size="15.00" fill="#c2f0c2">videos, PDFs, reels, examples, and portfolio</text>
<text xml:space="preserve" text-anchor="start" x="979.26" y="-763.8" font-family="Arial" font-size="15.00" fill="#c2f0c2">assets. Eagle does not own task status;</text>
<text xml:space="preserve" text-anchor="start" x="1038.46" y="-745.8" font-family="Arial" font-size="15.00" fill="#c2f0c2">Opportunity HQ does.</text>
</g>
<!-- obsidian&#45;&gt;tasks -->
<g id="edge10" class="edge">
<title>obsidian&#45;&gt;tasks</title>
<path fill="none" stroke="#8d8d8d" stroke-width="2" stroke-dasharray="5,2" d="M1413.76,-702.96C1387.51,-688.36 1359.86,-674.27 1333,-662.8 1171.39,-593.79 977.5,-541.35 839.97,-508.89"/>
<polygon fill="#8d8d8d" stroke="#8d8d8d" stroke-width="2" points="840.6,-506.34 832.7,-507.18 839.4,-511.45 840.6,-506.34"/>
<polygon fill="#18191b" fill-opacity="0.627451" stroke="none" points="1280.75,-620 1280.75,-642.8 1338.11,-642.8 1338.11,-620 1280.75,-620"/>
<text xml:space="preserve" text-anchor="start" x="1283.75" y="-625.8" font-family="Arial" font-size="14.00" fill="#c9c9c9">promote</text>
</g>
<!-- mobileform&#45;&gt;tasks -->
<g id="edge11" class="edge">
<title>mobileform&#45;&gt;tasks</title>
<path fill="none" stroke="#8d8d8d" stroke-width="2" stroke-dasharray="5,2" d="M1859.85,-702.8C1832.65,-687.58 1803.58,-673.32 1775,-662.8 1458.12,-546.21 1063.89,-499.67 840.09,-481.71"/>
<polygon fill="#8d8d8d" stroke="#8d8d8d" stroke-width="2" points="840.6,-479.11 832.91,-481.14 840.18,-484.35 840.6,-479.11"/>
<polygon fill="#18191b" fill-opacity="0.627451" stroke="none" points="1717.75,-620 1717.75,-642.8 1762.66,-642.8 1762.66,-620 1717.75,-620"/>
<text xml:space="preserve" text-anchor="start" x="1720.75" y="-625.8" font-family="Arial" font-size="14.00" fill="#c9c9c9">create</text>
</g>
<!-- projects&#45;&gt;tasks -->
<g id="edge12" class="edge">
<title>projects&#45;&gt;tasks</title>
<path fill="none" stroke="#8d8d8d" stroke-width="2" stroke-dasharray="5,2" d="M339.74,-704.56C400.93,-660.35 475.19,-606.7 537.09,-561.97"/>
<polygon fill="#8d8d8d" stroke="#8d8d8d" stroke-width="2" points="538.36,-564.29 542.9,-557.77 535.29,-560.04 538.36,-564.29"/>
<polygon fill="#18191b" fill-opacity="0.627451" stroke="none" points="454.31,-620 454.31,-642.8 496.12,-642.8 496.12,-620 454.31,-620"/>
<text xml:space="preserve" text-anchor="start" x="457.31" y="-625.8" font-family="Arial" font-size="14.00" fill="#c9c9c9">group</text>
</g>
<!-- dependencies&#45;&gt;tasks -->
<g id="edge13" class="edge">
<title>dependencies&#45;&gt;tasks</title>
<path fill="none" stroke="#8d8d8d" stroke-width="2" stroke-dasharray="5,2" d="M665.89,-702.87C665.36,-660.47 664.73,-609.7 664.19,-566.49"/>
<polygon fill="#8d8d8d" stroke="#8d8d8d" stroke-width="2" points="666.82,-566.45 664.1,-558.99 661.57,-566.52 666.82,-566.45"/>
<polygon fill="#18191b" fill-opacity="0.627451" stroke="none" points="665.12,-620 665.12,-642.8 703.8,-642.8 703.8,-620 665.12,-620"/>
<text xml:space="preserve" text-anchor="start" x="668.12" y="-625.8" font-family="Arial" font-size="14.00" fill="#c9c9c9">block</text>
</g>
<!-- tasks&#45;&gt;taskviews -->
<g id="edge14" class="edge">
<title>tasks&#45;&gt;taskviews</title>
<path fill="none" stroke="#8d8d8d" stroke-width="2" stroke-dasharray="5,2" d="M663,-384.02C663,-339.45 663,-284.62 663,-238.13"/>
<polygon fill="#8d8d8d" stroke="#8d8d8d" stroke-width="2" points="665.63,-238.26 663,-230.76 660.38,-238.26 665.63,-238.26"/>
<polygon fill="#18191b" fill-opacity="0.627451" stroke="none" points="663,-297.2 663,-320 709.47,-320 709.47,-297.2 663,-297.2"/>
<text xml:space="preserve" text-anchor="start" x="666" y="-303" font-family="Arial" font-size="14.00" fill="#c9c9c9">render</text>
</g>
<!-- tasks&#45;&gt;website -->
<g id="edge15" class="edge">
<title>tasks&#45;&gt;website</title>
<path fill="none" stroke="#8d8d8d" stroke-width="2" stroke-dasharray="5,2" d="M776.83,-384.02C838.39,-338.05 914.61,-281.15 978.08,-233.76"/>
<polygon fill="#8d8d8d" stroke="#8d8d8d" stroke-width="2" points="979.29,-236.13 983.73,-229.54 976.15,-231.92 979.29,-236.13"/>
<polygon fill="#18191b" fill-opacity="0.627451" stroke="none" points="884,-297.2 884,-320 942.93,-320 942.93,-297.2 884,-297.2"/>
<text xml:space="preserve" text-anchor="start" x="887" y="-303" font-family="Arial" font-size="14.00" fill="#c9c9c9">package</text>
</g>
<!-- tasks&#45;&gt;proposals -->
<g id="edge16" class="edge">
<title>tasks&#45;&gt;proposals</title>
<path fill="none" stroke="#8d8d8d" stroke-width="2" stroke-dasharray="5,2" d="M829.89,-439.11C965.91,-411.07 1160.85,-362.38 1320,-289.2 1353.14,-273.96 1386.8,-253.98 1417.55,-233.58"/>
<polygon fill="#8d8d8d" stroke="#8d8d8d" stroke-width="2" points="1418.86,-235.86 1423.63,-229.5 1415.94,-231.5 1418.86,-235.86"/>
<polygon fill="#18191b" fill-opacity="0.627451" stroke="none" points="1286.51,-297.2 1286.51,-320 1333.75,-320 1333.75,-297.2 1286.51,-297.2"/>
<text xml:space="preserve" text-anchor="start" x="1289.51" y="-303" font-family="Arial" font-size="14.00" fill="#c9c9c9">submit</text>
</g>
<!-- proposals&#45;&gt;tasks -->
<g id="edge17" class="edge">
<title>proposals&#45;&gt;tasks</title>
<path fill="none" stroke="#8d8d8d" stroke-width="2" stroke-dasharray="5,2" d="M1472.74,-227.56C1441.97,-261.29 1403.17,-297.08 1361,-320 1198.04,-408.57 987.01,-444.51 839.84,-459.08"/>
<polygon fill="#8d8d8d" stroke="#8d8d8d" stroke-width="2" points="840.03,-456.42 832.81,-459.76 840.53,-461.65 840.03,-456.42"/>
<polygon fill="#18191b" fill-opacity="0.627451" stroke="none" points="1396.06,-297.2 1396.06,-320 1444.88,-320 1444.88,-297.2 1396.06,-297.2"/>
<text xml:space="preserve" text-anchor="start" x="1399.06" y="-303" font-family="Arial" font-size="14.00" fill="#c9c9c9">update</text>
</g>
<!-- operator&#45;&gt;obsidian -->
<g id="edge1" class="edge">
<title>operator&#45;&gt;obsidian</title>
<path fill="none" stroke="#8d8d8d" stroke-width="2" stroke-dasharray="5,2" d="M1762.98,-1034.93C1724.27,-990.27 1677.3,-936.07 1637.7,-890.38"/>
<polygon fill="#8d8d8d" stroke="#8d8d8d" stroke-width="2" points="1639.79,-888.78 1632.89,-884.83 1635.82,-892.21 1639.79,-888.78"/>
<polygon fill="#18191b" fill-opacity="0.627451" stroke="none" points="1705.58,-952 1705.58,-974.8 1758.27,-974.8 1758.27,-952 1705.58,-952"/>
<text xml:space="preserve" text-anchor="start" x="1708.58" y="-957.8" font-family="Arial" font-size="14.00" fill="#c9c9c9">capture</text>
</g>
<!-- operator&#45;&gt;mobileform -->
<g id="edge2" class="edge">
<title>operator&#45;&gt;mobileform</title>
<path fill="none" stroke="#8d8d8d" stroke-width="2" stroke-dasharray="5,2" d="M1881.2,-1034.93C1901.65,-990.82 1926.42,-937.41 1947.43,-892.08"/>
<polygon fill="#8d8d8d" stroke="#8d8d8d" stroke-width="2" points="1949.81,-893.2 1950.58,-885.29 1945.05,-890.99 1949.81,-893.2"/>
<polygon fill="#18191b" fill-opacity="0.627451" stroke="none" points="1916.5,-952 1916.5,-974.8 1941.18,-974.8 1941.18,-952 1916.5,-952"/>
<text xml:space="preserve" text-anchor="start" x="1919.5" y="-957.8" font-family="Arial" font-size="14.00" fill="#c9c9c9">log</text>
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
<path fill="none" stroke="#8d8d8d" stroke-width="2" stroke-dasharray="5,2" d="M989.47,-704.78C927.6,-660.47 852.43,-606.64 789.82,-561.81"/>
<polygon fill="#8d8d8d" stroke="#8d8d8d" stroke-width="2" points="791.56,-559.83 783.93,-557.59 788.5,-564.1 791.56,-559.83"/>
<polygon fill="#18191b" fill-opacity="0.627451" stroke="none" points="900.43,-620 900.43,-642.8 944.57,-642.8 944.57,-620 900.43,-620"/>
<text xml:space="preserve" text-anchor="start" x="903.43" y="-625.8" font-family="Arial" font-size="14.00" fill="#c9c9c9">attach</text>
</g>
</g>
</svg>
`;case`opportunity_hq_intake_contract`:return`<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN"
 "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<!-- Generated by graphviz version 14.1.5 (0)
 -->
<!-- Pages: 1 -->
<svg width="2187pt" height="1236pt"
 viewBox="0.00 0.00 2187.00 1236.00" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
<g id="graph0" class="graph" transform="scale(1 1) rotate(0) translate(15.05 1220.65)">
<g id="clust1" class="cluster">
<title>cluster_capture</title>
<polygon fill="#3e4651" stroke="#2d333d" points="458,-653.6 458,-934.8 1306,-934.8 1306,-653.6 458,-653.6"/>
<text xml:space="preserve" text-anchor="start" x="466" y="-921.9" font-family="Arial" font-weight="bold" font-size="11.00" fill="#cbd5e1" fill-opacity="0.701961">CAPTURE SURFACES</text>
</g>
<g id="clust2" class="cluster">
<title>cluster_durable</title>
<polygon fill="#3e4651" stroke="#2d333d" points="8,-8 8,-934.8 432,-934.8 432,-8 8,-8"/>
<text xml:space="preserve" text-anchor="start" x="16" y="-921.9" font-family="Arial" font-weight="bold" font-size="11.00" fill="#cbd5e1" fill-opacity="0.701961">OPPORTUNITY HQ</text>
</g>
<!-- obsidian -->
<g id="node1" class="node">
<title>obsidian</title>
<polygon fill="#ac4d39" stroke="#853a2d" stroke-width="0" points="829.97,-873.6 498.03,-873.6 498.03,-693.6 829.97,-693.6 829.97,-873.6"/>
<text xml:space="preserve" text-anchor="start" x="591.73" y="-822.6" font-family="Arial" font-size="20.00" fill="#fbd3cb">Obsidian _Inbox</text>
<text xml:space="preserve" text-anchor="start" x="518.09" y="-799.6" font-family="Arial" font-size="15.00" fill="#f5b2a3">Raw capture only. Use for unclear thoughts,</text>
<text xml:space="preserve" text-anchor="start" x="591.45" y="-781.6" font-family="Arial" font-size="15.00" fill="#f5b2a3">offload notes, passive</text>
<text xml:space="preserve" text-anchor="start" x="523.5" y="-763.6" font-family="Arial" font-size="15.00" fill="#f5b2a3">shortcut ideas, and anything that is not yet</text>
<text xml:space="preserve" text-anchor="start" x="581.05" y="-745.6" font-family="Arial" font-size="15.00" fill="#f5b2a3">a real task. Promote only</text>
<text xml:space="preserve" text-anchor="start" x="520.16" y="-727.6" font-family="Arial" font-size="15.00" fill="#f5b2a3">when the item has money weight, deadline,</text>
</g>
<!-- mobileform -->
<g id="node2" class="node">
<title>mobileform</title>
<polygon fill="#3b82f6" stroke="#2563eb" stroke-width="0" points="1266.26,-873.6 939.74,-873.6 939.74,-693.6 1266.26,-693.6 1266.26,-873.6"/>
<text xml:space="preserve" text-anchor="start" x="1022.99" y="-813.6" font-family="Arial" font-size="20.00" fill="#eff6ff">Mobile Task Form</text>
<text xml:space="preserve" text-anchor="start" x="963.75" y="-790.6" font-family="Arial" font-size="15.00" fill="#bfdbfe">Fast durable capture path for task&#45;shaped</text>
<text xml:space="preserve" text-anchor="start" x="1010.48" y="-772.6" font-family="Arial" font-size="15.00" fill="#bfdbfe">work. Minimum fields: Task,</text>
<text xml:space="preserve" text-anchor="start" x="965.01" y="-754.6" font-family="Arial" font-size="15.00" fill="#bfdbfe">Project, Duration, and Link/Notes. Default</text>
<text xml:space="preserve" text-anchor="start" x="1016.27" y="-736.6" font-family="Arial" font-size="15.00" fill="#bfdbfe">Status should be Queued.</text>
</g>
<!-- dependencies -->
<g id="node3" class="node">
<title>dependencies</title>
<polygon fill="#64748b" stroke="#475569" stroke-width="0" points="387.66,-873.6 52.34,-873.6 52.34,-693.6 387.66,-693.6 387.66,-873.6"/>
<text xml:space="preserve" text-anchor="start" x="156.06" y="-822.6" font-family="Arial" font-size="20.00" fill="#f8fafc">Dependencies</text>
<text xml:space="preserve" text-anchor="start" x="86.6" y="-799.6" font-family="Arial" font-size="15.00" fill="#cbd5e1">Real blockers only: application work can</text>
<text xml:space="preserve" text-anchor="start" x="112.01" y="-781.6" font-family="Arial" font-size="15.00" fill="#cbd5e1">depend on resume/snippet prep;</text>
<text xml:space="preserve" text-anchor="start" x="78.25" y="-763.6" font-family="Arial" font-size="15.00" fill="#cbd5e1">website request flow depends on Tally and</text>
<text xml:space="preserve" text-anchor="start" x="130.37" y="-745.6" font-family="Arial" font-size="15.00" fill="#cbd5e1">Notion intake; offer traction</text>
<text xml:space="preserve" text-anchor="start" x="72.4" y="-727.6" font-family="Arial" font-size="15.00" fill="#cbd5e1">depends on website, portfolio, outreach, and</text>
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
<polygon fill="#a35829" stroke="#7e451d" stroke-width="0" points="1122.65,-1205.6 777.35,-1205.6 777.35,-1025.6 1122.65,-1025.6 1122.65,-1205.6"/>
<text xml:space="preserve" text-anchor="start" x="910.54" y="-1154.6" font-family="Arial" font-size="20.00" fill="#ffe0c2">Operator</text>
<text xml:space="preserve" text-anchor="start" x="814.52" y="-1131.6" font-family="Arial" font-size="15.00" fill="#f9b27c">The working user. Uses mobile, desktop,</text>
<text xml:space="preserve" text-anchor="start" x="820.76" y="-1113.6" font-family="Arial" font-size="15.00" fill="#f9b27c">Raycast, Codex, Notion, Obsidian, and</text>
<text xml:space="preserve" text-anchor="start" x="800.34" y="-1095.6" font-family="Arial" font-size="15.00" fill="#f9b27c">Eagle to move job search, Upwork, Singleton</text>
<text xml:space="preserve" text-anchor="start" x="845.78" y="-1077.6" font-family="Arial" font-size="15.00" fill="#f9b27c">offer, and portfolio work without</text>
<text xml:space="preserve" text-anchor="start" x="797.4" y="-1059.6" font-family="Arial" font-size="15.00" fill="#f9b27c">repeatedly deciding where each item belongs.</text>
</g>
<!-- logtask -->
<g id="node7" class="node">
<title>logtask</title>
<polygon fill="#3b82f6" stroke="#2563eb" stroke-width="0" points="1709.46,-1205.6 1382.54,-1205.6 1382.54,-1025.6 1709.46,-1025.6 1709.46,-1205.6"/>
<text xml:space="preserve" text-anchor="start" x="1504.87" y="-1145.6" font-family="Arial" font-size="20.00" fill="#eff6ff">Log Task</text>
<text xml:space="preserve" text-anchor="start" x="1406.77" y="-1122.6" font-family="Arial" font-size="15.00" fill="#bfdbfe">Create an Opportunity Task from selected</text>
<text xml:space="preserve" text-anchor="start" x="1457.2" y="-1104.6" font-family="Arial" font-size="15.00" fill="#bfdbfe">text, clipboard link, manual</text>
<text xml:space="preserve" text-anchor="start" x="1402.6" y="-1086.6" font-family="Arial" font-size="15.00" fill="#bfdbfe">form input, or mobile/share context. Default</text>
<text xml:space="preserve" text-anchor="start" x="1491.8" y="-1068.6" font-family="Arial" font-size="15.00" fill="#bfdbfe">Status: Queued.</text>
</g>
<!-- updatetask -->
<g id="node8" class="node">
<title>updatetask</title>
<polygon fill="#3b82f6" stroke="#2563eb" stroke-width="0" points="1713.2,-873.6 1378.8,-873.6 1378.8,-693.6 1713.2,-693.6 1713.2,-873.6"/>
<text xml:space="preserve" text-anchor="start" x="1489.31" y="-804.6" font-family="Arial" font-size="20.00" fill="#eff6ff">Update Task</text>
<text xml:space="preserve" text-anchor="start" x="1398.85" y="-781.6" font-family="Arial" font-size="15.00" fill="#bfdbfe">Update Status, Money Priority, Project, Link,</text>
<text xml:space="preserve" text-anchor="start" x="1517.66" y="-763.6" font-family="Arial" font-size="15.00" fill="#bfdbfe">or Notes</text>
<text xml:space="preserve" text-anchor="start" x="1438.44" y="-745.6" font-family="Arial" font-size="15.00" fill="#bfdbfe">on an existing Opportunity Task.</text>
</g>
<!-- searchrun -->
<g id="node9" class="node">
<title>searchrun</title>
<polygon fill="#3b82f6" stroke="#2563eb" stroke-width="0" points="1723.63,-550.8 1368.37,-550.8 1368.37,-370.8 1723.63,-370.8 1723.63,-550.8"/>
<text xml:space="preserve" text-anchor="start" x="1438.72" y="-490.8" font-family="Arial" font-size="20.00" fill="#eff6ff">Opportunity Search Run</text>
<text xml:space="preserve" text-anchor="start" x="1388.43" y="-467.8" font-family="Arial" font-size="15.00" fill="#bfdbfe">Codex&#45;owned manual workflow. Search current</text>
<text xml:space="preserve" text-anchor="start" x="1451.79" y="-449.8" font-family="Arial" font-size="15.00" fill="#bfdbfe">jobs or leads, return winners</text>
<text xml:space="preserve" text-anchor="start" x="1414.25" y="-431.8" font-family="Arial" font-size="15.00" fill="#bfdbfe">for approval, then log approved tasks to</text>
<text xml:space="preserve" text-anchor="start" x="1491.81" y="-413.8" font-family="Arial" font-size="15.00" fill="#bfdbfe">Opportunity HQ.</text>
</g>
<!-- exportblocks -->
<g id="node10" class="node">
<title>exportblocks</title>
<polygon fill="#3b82f6" stroke="#2563eb" stroke-width="0" points="1725.73,-228 1366.27,-228 1366.27,-48 1725.73,-48 1725.73,-228"/>
<text xml:space="preserve" text-anchor="start" x="1454.86" y="-168" font-family="Arial" font-size="20.00" fill="#eff6ff">Export Focus Blocks</text>
<text xml:space="preserve" text-anchor="start" x="1386.33" y="-145" font-family="Arial" font-size="15.00" fill="#bfdbfe">Codex&#45;owned manual workflow. Read approved</text>
<text xml:space="preserve" text-anchor="start" x="1452.21" y="-127" font-family="Arial" font-size="15.00" fill="#bfdbfe">Opportunity Tasks, build 3&#45;5</text>
<text xml:space="preserve" text-anchor="start" x="1412.2" y="-109" font-family="Arial" font-size="15.00" fill="#bfdbfe">realistic time blocks, export .ics, and ask</text>
<text xml:space="preserve" text-anchor="start" x="1470.11" y="-91" font-family="Arial" font-size="15.00" fill="#bfdbfe">before Notion updates.</text>
</g>
<!-- goalcheckin -->
<g id="node11" class="node">
<title>goalcheckin</title>
<polygon fill="#3b82f6" stroke="#2563eb" stroke-width="0" points="2156.47,-1205.6 1819.53,-1205.6 1819.53,-1025.6 2156.47,-1025.6 2156.47,-1205.6"/>
<text xml:space="preserve" text-anchor="start" x="1924.08" y="-1154.6" font-family="Arial" font-size="20.00" fill="#eff6ff">Goal Check&#45;In</text>
<text xml:space="preserve" text-anchor="start" x="1854.2" y="-1131.6" font-family="Arial" font-size="15.00" fill="#bfdbfe">Future small command. Ask count/result</text>
<text xml:space="preserve" text-anchor="start" x="1901.28" y="-1113.6" font-family="Arial" font-size="15.00" fill="#bfdbfe">questions for applications,</text>
<text xml:space="preserve" text-anchor="start" x="1839.59" y="-1095.6" font-family="Arial" font-size="15.00" fill="#bfdbfe">freelance proposals, Strategic work, and real</text>
<text xml:space="preserve" text-anchor="start" x="1896.29" y="-1077.6" font-family="Arial" font-size="15.00" fill="#bfdbfe">blockers. Output one or two</text>
<text xml:space="preserve" text-anchor="start" x="1857.93" y="-1059.6" font-family="Arial" font-size="15.00" fill="#bfdbfe">daily implications, not a full plan or new</text>
</g>
<!-- obsidian&#45;&gt;tasks -->
<g id="edge3" class="edge">
<title>obsidian&#45;&gt;tasks</title>
<path fill="none" stroke="#8d8d8d" stroke-width="2" stroke-dasharray="5,2" d="M540.91,-693.67C480.12,-649.74 406.9,-596.84 345.75,-552.66"/>
<polygon fill="#8d8d8d" stroke="#8d8d8d" stroke-width="2" points="347.66,-550.8 340.04,-548.53 344.58,-555.05 347.66,-550.8"/>
<polygon fill="#18191b" fill-opacity="0.627451" stroke="none" points="455.31,-610.8 455.31,-633.6 512.67,-633.6 512.67,-610.8 455.31,-610.8"/>
<text xml:space="preserve" text-anchor="start" x="458.31" y="-616.6" font-family="Arial" font-size="14.00" fill="#c9c9c9">promote</text>
</g>
<!-- mobileform&#45;&gt;tasks -->
<g id="edge4" class="edge">
<title>mobileform&#45;&gt;tasks</title>
<path fill="none" stroke="#8d8d8d" stroke-width="2" stroke-dasharray="5,2" d="M964.74,-693.75C938.84,-679.14 911.55,-665.06 885,-653.6 725.32,-584.66 533.6,-532.36 397.13,-499.92"/>
<polygon fill="#8d8d8d" stroke="#8d8d8d" stroke-width="2" points="397.84,-497.39 389.94,-498.22 396.63,-502.5 397.84,-497.39"/>
<polygon fill="#18191b" fill-opacity="0.627451" stroke="none" points="833.19,-610.8 833.19,-633.6 878.1,-633.6 878.1,-610.8 833.19,-610.8"/>
<text xml:space="preserve" text-anchor="start" x="836.19" y="-616.6" font-family="Arial" font-size="14.00" fill="#c9c9c9">create</text>
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
<!-- operator&#45;&gt;obsidian -->
<g id="edge1" class="edge">
<title>operator&#45;&gt;obsidian</title>
<path fill="none" stroke="#8d8d8d" stroke-width="2" stroke-dasharray="5,2" d="M872.98,-1025.73C834.27,-981.07 787.3,-926.87 747.7,-881.18"/>
<polygon fill="#8d8d8d" stroke="#8d8d8d" stroke-width="2" points="749.79,-879.58 742.89,-875.63 745.82,-883.01 749.79,-879.58"/>
<polygon fill="#18191b" fill-opacity="0.627451" stroke="none" points="815.58,-942.8 815.58,-965.6 868.27,-965.6 868.27,-942.8 815.58,-942.8"/>
<text xml:space="preserve" text-anchor="start" x="818.58" y="-948.6" font-family="Arial" font-size="14.00" fill="#c9c9c9">capture</text>
</g>
<!-- operator&#45;&gt;mobileform -->
<g id="edge2" class="edge">
<title>operator&#45;&gt;mobileform</title>
<path fill="none" stroke="#8d8d8d" stroke-width="2" stroke-dasharray="5,2" d="M991.2,-1025.73C1011.65,-981.62 1036.42,-928.21 1057.43,-882.88"/>
<polygon fill="#8d8d8d" stroke="#8d8d8d" stroke-width="2" points="1059.81,-884 1060.58,-876.09 1055.05,-881.79 1059.81,-884"/>
<polygon fill="#18191b" fill-opacity="0.627451" stroke="none" points="1026.5,-942.8 1026.5,-965.6 1051.18,-965.6 1051.18,-942.8 1026.5,-942.8"/>
<text xml:space="preserve" text-anchor="start" x="1029.5" y="-948.6" font-family="Arial" font-size="14.00" fill="#c9c9c9">log</text>
</g>
<!-- logtask&#45;&gt;updatetask -->
<!-- updatetask&#45;&gt;searchrun -->
<!-- searchrun&#45;&gt;exportblocks -->
</g>
</svg>
`;case`portfolio_capture_flow`:return`<?xml version="1.0" encoding="UTF-8" standalone="no"?>
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
<text xml:space="preserve" text-anchor="start" x="305.02" y="-136" font-family="Arial" font-size="15.00" fill="#c2f0c2">Public portfolio and offer surface. Pulls</text>
<text xml:space="preserve" text-anchor="start" x="304.6" y="-118" font-family="Arial" font-size="15.00" fill="#c2f0c2">from packaged portfolio and clear offer</text>
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
<text xml:space="preserve" text-anchor="start" x="1028.76" y="-800" font-family="Arial" font-size="15.00" fill="#f9b27c">Raycast, Codex, Notion, Obsidian, and</text>
<text xml:space="preserve" text-anchor="start" x="1008.34" y="-782" font-family="Arial" font-size="15.00" fill="#f9b27c">Eagle to move job search, Upwork, Singleton</text>
<text xml:space="preserve" text-anchor="start" x="1053.78" y="-764" font-family="Arial" font-size="15.00" fill="#f9b27c">offer, and portfolio work without</text>
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
<path fill="#428a4f" stroke="#2d5d39" stroke-width="2" d="M874.79,-875.64C874.79,-884.67 800.03,-892 708,-892 615.97,-892 541.21,-884.67 541.21,-875.64 541.21,-875.64 541.21,-728.36 541.21,-728.36 541.21,-719.33 615.97,-712 708,-712 800.03,-712 874.79,-719.33 874.79,-728.36 874.79,-728.36 874.79,-875.64 874.79,-875.64"/>
<path fill="none" stroke="#2d5d39" stroke-width="2" d="M874.79,-875.64C874.79,-866.61 800.03,-859.27 708,-859.27 615.97,-859.27 541.21,-866.61 541.21,-875.64"/>
<text xml:space="preserve" text-anchor="start" x="609.62" y="-832" font-family="Arial" font-size="20.00" fill="#f8fafc">Eagle Portfolio Library</text>
<text xml:space="preserve" text-anchor="start" x="561.68" y="-809" font-family="Arial" font-size="15.00" fill="#c2f0c2">Portfolio/evidence store. Holds screenshots,</text>
<text xml:space="preserve" text-anchor="start" x="561.27" y="-791" font-family="Arial" font-size="15.00" fill="#c2f0c2">videos, PDFs, reels, examples, and portfolio</text>
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