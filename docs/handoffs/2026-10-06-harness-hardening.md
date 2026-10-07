# Enforce completion evidence

Jerami requested an evidence ledger and Jev priority decision, followed by a separate implementation task. This handoff authorizes the first local hardening slice: H10 completion enforcement and H18 retained review state. The remaining controls stay in the ledger for later slices.

## Coverage

| Audit result | Controls | Share |
| --- | --- | --- |
| Demonstrated | 16 | 66.7% |
| Missing implementation | 5 | 20.8% |
| Process controls not established | 3 | 12.5% |

The score uses 24 equally weighted repository-owned requirements. Uncredited coverage is 33.3%. The earlier 25% estimate had no denominator. This rubric counts controls; it does not measure their relative risk or all AFK functionality.

The [ledger](/Users/singleton23/Documents/Development/singleton-systems/docs/harness/2026-10-06-agentafk-ledger.json) contains every criterion, evidence pointer and ten drift corrections. The [source snapshot](/Users/singleton23/Documents/Development/singleton-systems/docs/harness/2026-10-06-agentafk-source-snapshot.json) records HEAD, 18 file hashes and the dirty inventory. Recheck touched sources before implementation.

## Decision

[Jev selected completion](/Users/singleton23/Documents/Development/singleton-systems/docs/harness/2026-10-06-agentafk-jev.json). Its comparative scores are uncalibrated. Our assessment: the existing review engine already validates evidence; the Stop hook does not consult it. Connect those components first.

## First slice

- Read CODEX.md, its startup references and the active Cerebral/Codex Rabbit contracts. Inspect actual Codex hook payloads and supported integration before choosing a bridge.
- Reuse `lib/reviews`, `lib/transactions` and the existing hook. Bind a declared code-delivery claim to its task/run and current scope. Missing evidence, stale receipts or failed checks must produce an accurate incomplete result. Avoid text-only guesses and unlimited correction loops. Research and progress replies must remain able to end. Separate implementation readiness from human release approval.
- Replace the review CLI's temporary default with a retained, private state location. Preserve explicit `--state`, state locking, atomic writes and receipt chains. Preserve legacy state; no automatic deletion or migration.
- Test missing/tampered/stale evidence, scope changes after checks, cancellation, retained restart, explicit state paths, ordinary research exits and readiness versus release approval. Verify the real integration or report that layer unverified.

## Boundaries and proof

Preserve unrelated dirty 745, Lineups, website, video, Glaze and dependency work. Add no AFK runtime, daemon, subagents, deployment, live connector write or broad cleanup. Do not implement H11 or H19–H24 in this slice. Existing CodeRabbit-derived fixtures remain useful.

Fresh checks passed: Codex Rabbit, transactions, registry and hook routing. These exercise fixtures; live Supabase and production Stop delivery were not audited. Historical Glaze typecheck failures and dependency advisories require fresh verification before reuse.

Deliver a scoped diff, tests, readback and updated ledger. Keep commit, push, release and external writes pending Jerami's approval.
