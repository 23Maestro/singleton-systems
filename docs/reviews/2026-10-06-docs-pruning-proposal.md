# Docs pruning proposal

This proposal sorts docs/ against the October 6 direction: short-form video editing first for Tampa service businesses, AI workflow consulting as the upsell after paid delivery. It covers offer, planning, reviews, handoffs, archive, every date-prefixed file, the root docs, and the undated docs that carry offer positioning.

Classes: current, superseded, misaligned, dead. "Pinned" means `scripts/check-cerebral-drift.mjs` (or another check script, where named) reads the file; keep it or update the check in the same change.

## docs/

| path | class | reason | proposed action |
| --- | --- | --- | --- |
| docs/745-creative-visual-contract.md | current | CLAUDE.md names it as the 745 edit contract. | keep |
| docs/commands.md | pinned | Drift check requires its contract lines. | keep or update check |
| docs/integration-map.md | pinned | Drift check requires its contract lines. | keep or update check |
| docs/truth-matrix.md | pinned | Drift check requires its contract lines. | keep or update check |
| docs/visual-system-contract.md | pinned | Drift check requires its contract lines. | keep or update check |
| docs/video-storage-workflow.md | pinned | Drift check reads it and checks that CODEX.md links it. | keep or update check |
| docs/faithtalk-workflows.md | current | FaithTalk compositions for 745 work, updated Oct 3. | keep |
| docs/fitness.md, fitness-image-sources.json | current | Describes the live /fitness app. | keep |
| docs/home-hub.md | superseded | CODEX.md and integration-map.md now hold repo purpose and owners. | archive to docs/archive |
| docs/lineups-template-system.md | current | Live Lineups Figma registry contract. | keep |
| docs/personal-endpoints.md | current | Lists live personal routes, Sept 25. | keep |

## docs/offer

| path | class | reason | proposed action |
| --- | --- | --- | --- |
| 2026-07-28_Ginain Clean up.md | current | Source transcript for the Ginain cohort talk, the top warm lead. | keep (rename without spaces) |
| 2026-07-28_Homepage Fix List.md | superseded | Line fixes target copy that is gone; live copy is in app/site.ts. | archive to docs/archive after its "say video in the hero" point moves into confirmed-copy.md |
| 2026-09-11-paid-content-plan.md | misaligned | Positions Jerami as an AI consultant at a 70/30 AI-to-video split; Oct 1 target passed. | archive to docs/archive |
| 2026-09-17-creator-review-pilot.md, research/2026-09-17-profile-sample.json | misaligned | AI-creator references picked for the AI-consultant brand. | archive to docs/archive |
| 2026-09-22-purple-cow-handoff.md | misaligned | Through-line is general problem solving with no video lead; proof order is still useful. | merge proof order into confirmed-copy.md, then archive |
| 2026-10-03-diy-smartcode-sonnet-handoff.md | current | Live paid-style editing test with Oct 4 asset status. | keep |
| confirmed-copy.md | misaligned | "Workflow cleanup" for five audiences, no video lead; proposal contract still reads it. | keep and rewrite video-first for Tampa service businesses |
| freelance-proposal-contract.md | current | Proposal shape still holds; depends on confirmed-copy.md. | keep |
| portfolio-content-playbook.md | superseded | Older copy of the playbook in plugins/s-systems/skills/offer-portfolio-content/references. | delete |
| upwork-pending-projects-2026-07-17.md, upwork-reference-screenshots/2026-07-17/ (5 PNG) | dead | July Upwork catalog at $28/hr; the lane is now local Tampa clients. | archive to docs/archive |
| upwork-project-assets/2026-09-10/ (3 PNG) | dead | No doc or skill links these grids. | archive to docs/archive |

## docs/planning

| path | class | reason | proposed action |
| --- | --- | --- | --- |
| 2026-07-12-personal-ops-finance-followup.md | superseded | /finances shipped; see docs/harness/finances-ledger.md. | archive to docs/archive |
| 2026-07-25-schema-lock-skill-plan.md | dead | Foundation Pass skill was never built; nothing links it. | archive to docs/archive |
| 2026-09-05-business-planner-interview.md | current | Requirements behind the Command Center build. | keep |
| 2026-09-05-planner-candidates.md | dead | Sept 5 record snapshot; every state has moved. | delete |
| 2026-09-08-belong-together-capture.md | superseded | Same Notion page and Shortcut as docs/harness/belong-together-setup.md. | merge into docs/harness/belong-together-setup.md |
| 2026-10-04-business-time-intelligence-spec.md | current | Approved spec; banner points to the fork's build plan. | keep |
| business-time-intelligence/2026-10-04-github-comps.md | current | Research that picked TimeScribe. | keep |
| business-time-intelligence/layout-contract.md | current | Approved TimeScribe layout. | keep |
| business-time-intelligence/manual-workflow.md | current | Input contract holds; Glaze and Raycast lines predate the fork. | keep (drop Glaze lines) |
| business-time-intelligence/2026-10-04-fork-*.json | current | Sources for the Oct 4 decision maps. | keep |
| business-time-intelligence/standard-ui.jpeg | superseded | TimeScribe UI replaced it; layout contract calls it history. | archive to docs/archive |
| 2026-10-05-745-visual-intake-map.md | current | Live 745 reference board, Friday sample checkpoint. | keep |
| 2026-10-05-video-review-annotations.md | current | Destination for the hosted review viewer. | keep |
| 2026-10-06-video-review-proof.md, video-review/*.json | current | First Lineups review slice and its readback. | keep |
| planning-idea-routing-research-pass.md | superseded | The planning-idea-routing skill now owns this procedure. | archive to docs/archive |

## docs/reviews

| path | class | reason | proposed action |
| --- | --- | --- | --- |
| 2026-10-02-nylamaree-inventory/ (README, HTML, JSON) | current | Local service business rebuild; feeds public/nylamaree. | keep |

## docs/handoffs

| path | class | reason | proposed action |
| --- | --- | --- | --- |
| 2026-07-29-claude-notion-icon-system.md | dead | Opportunity HQ icon set; the skill never took the icon contract. | archive to docs/archive |
| 2026-08-14-future-voices-client-video-storyboard.md | dead | Future Voices work is retired per personal-endpoints.md. | archive to docs/archive |
| 2026-08-22-command-canine-test-edit-storyboard.md | current | Video test edit for a pending client. | keep |
| 2026-08-24-command-k9-motion-cue-map.md | current | Cue map for the same test edit. | keep |
| 2026-08-24-command-k9-reference-edit-profile.md, -ledger.csv | current | Measured style profile the cue map uses. | keep |

## docs/archive

| path | class | reason | proposed action |
| --- | --- | --- | --- |
| football-ai-assistant-revival-notes.md | dead | Product idea outside the video lane. | keep in archive |

## Dated files in other folders

| path | class | reason | proposed action |
| --- | --- | --- | --- |
| diagrams/2026-07-01-cerebral-system.html, .png | superseded | LikeC4 maps in docs/visual-maps replaced it. | archive to docs/archive |
| diagrams/2026-07-02-upwork-proposal-skill-playground.html | dead | One-time Upwork skill playground. | archive to docs/archive |
| diagrams/2026-07-03-ai-workflow-case-study-playground.html | misaligned | AI workflow case study framing, no video lead. | archive to docs/archive |
| diagrams/2026-07-05-source-map-flow-playground.html | dead | One-time playground. | archive to docs/archive |
| diagrams/2026-07-31-skill-packaging-contract-review.html | dead | Finished one-time review. | archive to docs/archive |
| diagrams/2026-08-06-mirage-karabiner-workaround-board.html | dead | Personal keyboard fix. | archive to docs/archive |
| diagrams/html-playground-samples/ (6 HTML) | dead | Plugin demo samples. | delete |
| harness/2026-07-22-app-design-brand-plan.md | dead | Due Jul 27; Command Center work overtook it. | archive to docs/archive |
| harness/2026-08-27-context-audit.md | dead | Point-in-time byte counts. | archive to docs/archive |
| harness/2026-08-27-cross-surface-transaction-proof.md | current | Contract for scripts/check-cross-surface-transactions.mjs. | keep |
| harness/2026-08-27-lineups-enforcement-proof.md | current | Contract for scripts/check-lineups-enforcement.mjs. | keep |
| harness/2026-09-02-ledger-integration.md | superseded | docs/harness/finances-ledger.md holds the ledger contract. | merge into docs/harness/finances-ledger.md |
| harness/2026-09-03-ledger-refinement.md | superseded | Same ledger, one preview later. | merge into docs/harness/finances-ledger.md |
| portfolio-evidence/2026-09-*-receipt.md (6) | current | Video proof receipts for Lineups, Catena, HNOC, Prospect ID. | keep |
| portfolio/2026-07-02-eagle-webinar-workflow-loom-script.md | dead | Griz Loom task with Canva SDK setup. | archive to docs/archive |
| portfolio/2026-07-02-portfolio-ledger-intent-and-content-plan.md | superseded | docs/portfolio-evidence receipts do this job. | archive to docs/archive |
| portfolio/2026-07-21-singletonsystemstory.md | current | Origin story with editing roots and Prospect ID. | keep |
| portfolio/2026-07-22-diy-smart-code-bionic-recut.md | superseded | docs/offer/2026-10-03-diy-smartcode-sonnet-handoff.md is the live DIY Smart Code test. | archive to docs/archive |
| refactors/2026-07-22-capture-surface-post-refactor.md | dead | 56-word note for a finished refactor. | delete |
| superpowers/plans/2026-08-21-personal-finance-ledger.md | dead | Plan executed; /finances shipped. | archive to docs/archive |
| superpowers/plans/2026-08-24-cowboys-expectations-alignment.md | dead | Plan executed; Lineups rules live in skill references. | archive to docs/archive |
| visuals/2026-07-07-video-projects-routing.html | pinned | Fixture path in scripts/check-cerebral-hook-routing.mjs. | keep or update check |
| visuals/2026-07-07-video-editing-helper-flow.html | dead | July flow sketch. | archive to docs/archive |
| visuals/2026-08-09-matt-pocock-skills-canvas.html | dead | Skill catalog sketch. | archive to docs/archive |

## Undated docs with offer positioning

| path | class | reason | proposed action |
| --- | --- | --- | --- |
| operating-system/phase-one-operating-system.md | misaligned | North star is workflow cleanup; links confirmed-copy.md. | archive to docs/archive |
| operating-system/singleton-systems-sprint.md | misaligned | June lanes; promise is workflow cleanup for small teams. | archive to docs/archive |
| outreach/pending-outreach-loom-pattern.md | misaligned | Outreach scripts pitch AI and workflow cleanup. | archive to docs/archive |
| outreach/video-editing-tutor-loom-talk-track.md | dead | Premiere tutoring pitch outside the current lane. | archive to docs/archive |
| content/recruiting-funnel-ad-creative-logic.md | misaligned | States "Core offer: workflow cleanup." | archive to docs/archive |
| opportunity-hq/ai-workflow-session-intake.md | misaligned | Documents /ai-workflow-session as the first entry point. | keep until that page becomes the upsell, then update |
| website/seo-aeo-search-instrumentation.md | misaligned | Target keywords are AI workflow consultant terms; hooks still valid. | keep (swap keywords to video editing terms) |
| portfolio/c4-image-framing-plan.md | misaligned | Plan for the AI-first /ai-workflow-portfolio route. | archive to docs/archive |
| portfolio/cavalry-motion-workflow.md | superseded | eagle-skill motion-engine-routing reference covers Cavalry. | archive to docs/archive |
| portfolio/client-video-storyboard.md | superseded | The s-systems:client-video-storyboard skill owns this packet. | delete |
| portfolio/eagle-client-edit.md | superseded | eagle-skill client-edit-boundaries reference covers it. | delete |

## Outside docs

The site still leads with AI consulting: `app/site.ts` sets `serviceName` to "AI Workflow Consulting for Established Operators", and `/tampa-ai-consultant` and `/ai-workflow-session` are live. docs/harness/finances-ledger.md requires a passphrase; docs/personal-endpoints.md says /finances needs none. Fix the one that is wrong.
