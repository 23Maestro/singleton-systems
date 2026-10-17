# CAD component review

15 October 2026. Linear FlowZone owns Development task state. Editable CAD,
source bindings and review evidence live in the component project. CAD owns
geometry; Blender may finish materials and lighting after geometry review.

## Approval boundary

Passing geometry checks proves only the named requirements those checks test.
It cannot establish whole-part visual similarity. Test counts, valid solids,
successful downloads and roof-only comparisons cannot approve a component.

Keep these results separate: source coverage, saved geometry, visual likeness,
installed relationships and physical fit. A failed or unverified required detail
blocks component approval. Jerami approves the reviewed artifact revision.

The shared review module is currently a design, not executable enforcement.
[23M-252](https://linear.app/23maestro/issue/23M-252/build-component-review)
owns that implementation. This document is an operating contract. It does not
claim that software can detect every omitted detail today.

## Source and angle review

1. Record vehicle identity, component role, vehicle-front direction and the
   installed coordinate transform. Separate a service drawing's exploded pose
   from the installed pose.
2. Inventory visible contours, seams, openings, fasteners, ribs and connections.
   Bind each observation to an original image region, URL and SHA-256. Include
   an explicit record for hidden surfaces and unresolved details. A second
   source-led audit checks omissions before model review.
3. Freeze a camera for each source view. Fit it from datums independent of the
   scored details. Keep fitting landmarks out of validation. Record expected
   visibility and occlusion. Do not stretch a render or hide disputed geometry.
4. Compare every inventoried detail, then the entire silhouette and depth.
   Record passed, failed or unverified for each. No whole-part percentage is
   assigned without an agreed measurement method and coverage boundary.
5. Reopen the saved CAD and test sourced relationships at the approved seams.
   Keep inferred dimensions explicit. Check installation without changing the
   accepted vehicle mold. Bind results to source, model, STEP and camera hashes.

## Evidence recovery

A missing view or uncertain connection triggers immediate targeted LEMON
retrieval, including the mating component. Follow real leaf links in the saved
index. Inspect originals and deduplicate by content hash. HTTP success alone
does not resolve a detail.

Test normal HTTP access first. Use Firecrawl for access failure on the known
source. Use GM for a remaining gap, then outside sources only for that gap.
Adequate evidence with mismatched CAD requires geometry repair.

Use `.agents/skills/firecrawl-research/SKILL.md` and its LEMON access notes.
Keep credentials out of commands, logs and handoffs. Route replaceable assets
through the 3D HomeSSD gate.

## Current pilot

[23M-253](https://linear.app/23maestro/issue/23M-253/audit-intake-likeness)
owns the independent air-cleaner audit. No next component starts before the
pilot review. The handoff is in
`DIY-car-maintenance/cad/malibu-2015/handoff/claude-start-here.md`.
