# Source-linked evidence

Reviewed October 15, 2026. Source facts and hashes are in [review.source.json](review.source.json).

## Scope

The reviewed system is the FastAPI/Python and Raycast/TypeScript bridge around the company backend. Jerami describes the backend as about 15 years old. Preserved local development history runs from October 2025 to July 2026. No original PHP implementation was found in the reviewed tracked files.

The source repository is at:

/Users/singleton23/Library/Mobile Documents/com~apple~CloudDocs/ARCHIVE/CODE_PROJECTS/prospect-pipeline

## Authorship and company records

Jerami states that he designed and built the system, used AI throughout the work, and created or pitched the video progress page. The company supplied the custom backend and operating records. Jerami reports an independent-contractor arrangement with no code ownership clause. Treat his original software as his contribution. Company-derived records have a separate licensing scope. See [contribution and deal decision](ownership-and-split.md).

<a id="case-1"></a>

## Case 1: laravel video form repair

Date: 2025-11-25. Commit: `3ef15c442e089346b6a93f8579f11e6dafbc87fc`.

Problem: The video submission path could treat an HTTP response as success without checking the business result.

Repair: The patch uses the expected legacy fields, including both approval controls, and checks the returned result.

Assessment use: A task could ask an AI to repair a form adapter and prove the expected fields and result checks. That training task has not been built or replayed.

Historical file: `src/python/npid_api_client.py`. Current implementation: `npid-api-layer/app/translators/legacy.py`, lines 696-817; 975-1034.

Before blob: `c2921dc3fc689011de00b23de75e1a9bdebb109d`. After blob: `015c5a8495520d2ab4d6f0b19ed8c8c7070be4db`.

Inspect the actual change from the source repository:

```sh
git show 3ef15c442e089346b6a93f8579f11e6dafbc87fc -- src/python/npid_api_client.py
```

This is a summary of a real patch. It is not a recorded AI session.

<a id="case-2"></a>

## Case 2: sales stage readback

Date: 2026-05-01. Commit: `1daf9a7d7a4d3ed8720802c81dcd06ce1c3a5fe8`.

Problem: A stage update could appear accepted while the source still showed a different stage.

Repair: The patch fetches the selected stage after the write and rejects an empty or mismatched result.

Assessment use: A task could require an AI to prove that a write persisted. Nine existing sales-stage fixture tests passed, including exact field mapping and response parsing. This check used saved inputs.

Historical file: `npid-api-layer/app/routers/sales.py`. Current implementation: `npid-api-layer/app/routers/sales.py`, lines 192-246; 490-611.

Before blob: `884b65e3dc344765fb90b75943d5dd090ce69996`. After blob: `af00a55cf37a6a22877b5b084a0a3ca4e9a46224`.

Inspect the actual change from the source repository:

```sh
git show 1daf9a7d7a4d3ed8720802c81dcd06ce1c3a5fe8 -- npid-api-layer/app/routers/sales.py
```

This is a summary of a real patch. It is not a recorded AI session.

<a id="case-3"></a>

## Case 3: merge manual and server video tasks

Date: 2026-02-20. Commit: `5fe6c2d4a1429fea62e8cebef820c8ede242c3dc`.

Problem: Manual video tasks and server tasks could refer to the same person while keeping different local state.

Repair: The patch merges the manual task into the server task and preserves useful local completion and override fields.

Assessment use: A task could test a merge without losing operator state. The patch was inspected; no production cache was changed.

Historical file: `src/lib/video-progress-cache.ts`. Current implementation: `src/lib/video-progress-cache.ts`, lines 246-477.

Before blob: `7d4926dc1fed34aba1c5d09f4189b606b43eebe6`. After blob: `636320d5f80dabc3e08d20e969b423722f3d82f4`.

Inspect the actual change from the source repository:

```sh
git show 5fe6c2d4a1429fea62e8cebef820c8ede242c3dc -- src/lib/video-progress-cache.ts
```

This is a summary of a real patch. It is not a recorded AI session.

## AI evidence

22 commits reachable from HEAD include AI co-author trailers. All commit IDs are in the source JSON. These markers establish recorded attribution. They do not measure model performance.

- `.codex/INVARIANT-ENFORCEMENT-TASK.md`: Saved Codex implementation brief with ten rules for the legacy bridge. The brief includes proposed checks; it does not prove every check was enforced.

- `src/lib/inbox-ai-draft.ts`: Code sends a workflow-specific prompt to Raycast AI and returns a parsed reply draft. Current execution was not tested.

- `docs/api-specs/legacy-assignment-debug-template.md`: Sanitized troubleshooting note records the browser-form comparison and readback approach. It is a later summary, not a raw session recording.


The repository offer consists of saved AI instructions, repair notes, code changes, and tests. No raw conversation-format archive was found in the scanned repository text. Separately stored AI chats are outside this repo census.

## Workflow coverage

### Make old forms work

Translate clean tool requests into the exact forms the Laravel backend accepts. Check the returned state before claiming success.

Status: code and repair history checked against the archived sources. Parser fixtures were exercised offline.

- `npid-api-layer/app/translators/legacy.py`, lines 696-817; 897-1034; 3156-3315; 4887-5004.

- `npid-api-layer/app/session.py`, lines 158-305; 312-489.

- `npid-api-layer/app/routers/inbox.py`, lines 141-195.

- `docs/api-specs/legacy-assignment-debug-template.md`.



### Match the right person

Keep the contact ID and profile ID together. Use more than a matching name before marking another profile as a repeat.

Status: identity and workflow tests passed; duplicate-profile tests inspected but not run.

- `src/domain/athlete-identity.ts`.

- `src/lib/scout-duplicate-profiles.ts`.

- `src/domain/workflow-context.ts`.



### Finish video work

Upload a video, send the right notice, update the stage, and complete the right editing task. Track each step and its failures.

Status: code and database snapshots verified; live video tests were not run.

- `src/lib/video-post-upload.ts`, lines 193-374.

- `src/lib/video-progress-cache.ts`, lines 246-345; 350-477.

- `npid-api-layer/app/routers/video.py`, lines 163-266; 453-610.



### Count the sales work once

Keep call activity, meeting bookings, and outcomes as separate facts. Preserve the event time and prevent duplicate counts.

Status: local business tests passed. All 723 saved SQL rows were parsed. The separately saved event contract contains 928 distinct event keys.

- `src/domain/call-tracker-facts.ts`.

- `src/lib/supabase-lifecycle.ts`.

- `supabase/migrations/20260602090000_call_log_canonical_ledger.sql`.

- `.tmp/call_log_backfill.sql`.



### Move a meeting correctly

Choose a new slot, preserve the previous meeting link, and keep a pending result out of the active meeting list.

Status: local business tests passed; live booking untested.

- `src/domain/appointment-truth.ts`.

- `src/domain/parent-reschedule-slot-selection.ts`.

- `src/domain/meeting-set-contract.ts`.

- `npid-api-layer/app/routers/sales.py`, lines 192-246; 612-879.



### Choose the next reply action

Distinguish a reply needing action from a client waiting on proposed times. Keep the evidence and proposed action in separate records.

Status: local tests passed; saved audit reports 566 messages processed; complete raw thread archive not established.

- `src/lib/client-message-reply-themes.ts`.

- `src/lib/client-message-action-proposals.ts`.

- `src/lib/client-message-evidence-receipts.ts`.

- `tmp/10x-communications-evidence-audit.json`.

- `tmp/client-message-inbox-export.json`.



## Record counts and scope

| Source | Observed | Limit |
| --- | --- | --- |
| Git database history | 34 snapshots; 1,163 distinct task IDs; 3,113 business row versions | Versions are saved states, not action recordings |
| Larger local backup | 1,781 video-task rows | Overlap with Git history is unmeasured |
| Sales backfill | 723 rows; 362 distinct athlete keys | Saved SQL, not proof of executed writes |
| Message audit | 566 messages processed; five proposed actions | Saved audit says review; full raw threads not established |
| Portfolio database | 141 video-task rows | Current demo includes synthetic records |

## Public and private history

Repository availability is recorded in the source facts for buyer diligence. The brief makes no claim of exclusivity. Availability is not used to infer a price penalty or prior model training.

## Buyer sources

- [Turing program and FAQ](https://lazarus.turing.com/)
- [Turing intake and authority requirement](https://lazarus.turing.com/get-in-touch)
- [Turing published codebase figures](https://www.turing.com/blog/agi-advance-newsletter-57)
- [Mercor data program](https://www.mercor.com/data/)
- [Defined.ai data partners](https://defined.ai/partnership-programs)
- [GitHub public access and license rights](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/licensing-a-repository)

Turing currently quotes after sampling. Its newsletter lists legacy codebases at $10,000–$100,000+, modern codebases at $1,000 per PR up to $10,000, and supporting artifacts at $50 each when bundled. The newsletter dates conflict, and current applicability is unconfirmed. The current $1 million headline is an upper limit for company archives. No buyer quote or payment date exists for this package.

## Extended inventory check

The complete saved event contract has 928 rows and 928 distinct dedupe keys: 725 call activities, 116 meeting sets, 72 post-meeting outcomes, and 15 enrollment/payment records. Its wrapper is Jerami-created code and schema; its operating rows derive from company work.

Eight local weekly JSON exports were parsed completely. Their row counts are 117, 164, 103, 160, 138, 109, 69, and zero. Overlapping keys are recorded in the source JSON. They are not added to the event-contract total.

The file-role census covers 5,031 historical paths. It excludes 4,021 compiler/dependency paths from the 1,010-path composition denominator. All eligible text blob versions were scanned in memory. [Audit and method](composition-audit.json).

Python checks used existing fixture tests and a compatible pre-1.0 parser dependency. Of 35 checks, 29 passed and six owner/calendar fixture checks failed against the demo configuration. The archive was not patched to make those checks pass. [Results](python-test-receipt.json).
