# Akiflow clone implementation plan

Jerami's target is an Akiflow clone, visually and functionally, adapted to Singleton Systems. This plan replaces the earlier cosmetic revision sequence. Hosted revisions 1–4 are rejected baselines. Existing code and passing tests still need to meet this target.

One responsive website serves desktop, tablet and phone. The 6 supplied mobile photos and signed-in desktop observations define the reference workflows. Keep Asana for Content Editor tasks, Linear for Development, Supabase for active-client records and the Sheet for outreach.

## Build order

| Step | Existing tickets | Required result |
| --- | --- | --- |
| 1. Define parity | 23M-273, 23M-297 | Map every reference screen and action to a build requirement. Observe missing slot/keyboard behavior only. Keep sync research parked. |
| 2. Rebuild the shell | 23M-274, 23M-275, 23M-299 | Free shadcn controls, desktop sidebar, bottom mobile dock and separate add action. Calendar-first phone layout, compact headers, named views and remembered preferences. |
| 3. Build complete task flows | 23M-276–279, 23M-300, 23M-284 | Capture, task sheets, Plan quick choices, mobile duration dial, desktop presets/search, untimed/timed planning, commands, repeat and multi-task slots. Verify saved results. |
| 4. Fit Singleton work | 23M-280–283, 23M-298 | Company-column client work, shared parent/subtask details, attention/background estimates, short contact forms, work updates, unsent drafts and authorized calendar availability. |
| 5. Review the integrated clone | 23M-285 | Compare reference and actual screens at 390, 430, 834 and 1440 px. Walk the complete flows. Obtain Jerami's visual and behavior review. |
| 6. Review and deliver code | 23M-285 | Finish scoped checks and separate Standards/Spec reviews. Commit and merge the approved patch. Verify exact refs. Then begin grill-with-docs for current clients and outreach. |

## TDD contract

Keep the approved public seams: visible dashboard controls and public owner routes. For each vertical slice, record its ticket, reference, expected visible result and save/reload result. Run 1 failing behavior test, implement the slice, then prove it through that same interface before starting another slice. Use boundary stubs locally and selected real records for integration proof.

Visual acceptance compares layout and interaction with Akiflow. Subtitle removal, generic focus checks and a successful build cannot substitute for it. Keep those checks as regression coverage.

## Required distinctions

- Planned day, deadline, duration and effort estimate remain separate. A 5-minute duration must stay 5 minutes. Start-time snapping is a separate rule.
- Task and Slot controls need real persisted behavior. Repeat and estimates need a declared storage/write owner before schema changes.
- Mobile navigation stays at the bottom with safe-area clearance. Task details open as a mobile sheet. The task queue appears on demand.
- Client business rules and outreach details remain for the later interview. Preserve confirmed Active behavior and existing records while building their shared interface.

No new ticket duplicates are needed. 23M-273 is the reference contract; 23M-297 gates slot behavior still unobserved. Production deployment and new account grants retain their separate gates.
