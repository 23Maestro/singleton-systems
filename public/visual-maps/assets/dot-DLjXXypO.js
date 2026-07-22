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
`;default:throw Error(`Unknown viewId: `+e)}},t=e=>{switch(e){case`index`:return`<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN"
 "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<!-- Generated by graphviz version 14.1.5 (0)
 -->
<!-- Pages: 1 -->
<svg width="393pt" height="533pt"
 viewBox="0.00 0.00 393.00 533.00" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
<g id="graph0" class="graph" transform="scale(1 1) rotate(0) translate(15.05 517.85)">
<!-- portfoliooperator -->
<g id="node1" class="node">
<title>portfoliooperator</title>
<polygon fill="#3b82f6" stroke="#2563eb" stroke-width="0" points="362.75,-502.8 0,-502.8 0,-322.8 362.75,-322.8 362.75,-502.8"/>
<text xml:space="preserve" text-anchor="start" x="141.91" y="-451.8" font-family="Arial" font-size="20.00" fill="#eff6ff">Operator</text>
<text xml:space="preserve" text-anchor="start" x="20.06" y="-428.8" font-family="Arial" font-size="15.00" fill="#bfdbfe">The working user. Uses the command surface to</text>
<text xml:space="preserve" text-anchor="start" x="95.92" y="-410.8" font-family="Arial" font-size="15.00" fill="#bfdbfe">move practical operations</text>
<text xml:space="preserve" text-anchor="start" x="42.56" y="-392.8" font-family="Arial" font-size="15.00" fill="#bfdbfe">workflow steps without repeatedly clicking</text>
<text xml:space="preserve" text-anchor="start" x="85.48" y="-374.8" font-family="Arial" font-size="15.00" fill="#bfdbfe">through scattered dashboard</text>
<text xml:space="preserve" text-anchor="start" x="153.03" y="-356.8" font-family="Arial" font-size="15.00" fill="#bfdbfe">screens.</text>
</g>
<!-- aiworkflowsystem -->
<g id="node2" class="node">
<title>aiworkflowsystem</title>
<polygon fill="#3b82f6" stroke="#2563eb" stroke-width="0" points="345.23,-180 17.52,-180 17.52,0 345.23,0 345.23,-180"/>
<text xml:space="preserve" text-anchor="start" x="49.12" y="-111" font-family="Arial" font-size="20.00" fill="#eff6ff">Prospect ID Workflow System</text>
<text xml:space="preserve" text-anchor="start" x="37.58" y="-88" font-family="Arial" font-size="15.00" fill="#bfdbfe">Command UI, legacy&#45;system adapter work,</text>
<text xml:space="preserve" text-anchor="start" x="69.22" y="-70" font-family="Arial" font-size="15.00" fill="#bfdbfe">source&#45;of&#45;truth cleanup, and audit</text>
<text xml:space="preserve" text-anchor="start" x="47.99" y="-52" font-family="Arial" font-size="15.00" fill="#bfdbfe">tests for a practical operations workflow.</text>
</g>
<!-- portfoliooperator&#45;&gt;aiworkflowsystem -->
<g id="edge1" class="edge">
<title>portfoliooperator&#45;&gt;aiworkflowsystem</title>
<path fill="none" stroke="#8d8d8d" stroke-width="2" stroke-dasharray="5,2" d="M181.38,-322.87C181.38,-281.67 181.38,-232.56 181.38,-190.17"/>
<polygon fill="#8d8d8d" stroke="#8d8d8d" stroke-width="2" points="184,-190.36 181.38,-182.86 178.75,-190.36 184,-190.36"/>
<polygon fill="#18191b" fill-opacity="0.627451" stroke="none" points="181.38,-240 181.38,-262.8 333.65,-262.8 333.65,-240 181.38,-240"/>
<text xml:space="preserve" text-anchor="start" x="184.38" y="-245.8" font-family="Arial" font-size="14.00" fill="#c9c9c9">triggers workflow action</text>
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
`;default:throw Error(`Unknown viewId: `+e)}};export{e as dotSource,t as svgSource};