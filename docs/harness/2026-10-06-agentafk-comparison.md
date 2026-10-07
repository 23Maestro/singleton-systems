# AgentAFK comparison

Reviewed 2026-10-06. Upstream source pinned to [09cab784](https://github.com/griffinwork40/agent-afk/tree/09cab784dcf1232a55f41b7ddf54c1988221fce1). Scope: harden Singleton Systems in place. This is a source review; AFK was not executed.

The [coverage ledger](/Users/singleton23/Documents/Development/singleton-systems/docs/harness/2026-10-06-agentafk-ledger.json) credits 16 of 24 controls: 66.7% demonstrated, 20.8% missing and 12.5% not established. Uncredited coverage is 33.3% on this equal-point rubric.

## Already in place

Cerebral loads live routing and rejects unavailable registry data. Codex Rabbit binds two review passes and human approval to the repository scope. Its receipts reject tampering and stale approvals. Shared transactions checkpoint before writes, recover uncertain outcomes through readback, and invalidate dependent owners.

Current checks passed: `check:codex-rabbit`, `check:transactions`, `check:cerebral:registry`, and `check:cerebral:hook-routing`.

## Useful gaps

| Priority | Current evidence | Smallest useful addition |
| --- | --- | --- |
| 1. Completion enforcement | `.codex/hooks/cerebral_singleton_guard.py:1050` checks writing and Git-temp cleanup at Stop. It does not inspect review or transaction completion. | Bind a code-delivery claim to its run ID. Read existing receipts against a fresh scope. Missing or stale evidence leaves delivery incomplete. Research and progress replies can still end. Keep implementation readiness separate from release approval. |
| 2. Process ownership | Review and transaction command adapters have timeouts. No shared task-owned process registry was found in the inspected harness. Git-temp cleanup covers a separate, narrow case. | Record only processes launched through an owned runner, with task ID, process identity and deadline. Stop their process groups on cancellation or teardown; verify exit. Preserve unrelated services. Test descendants and PID reuse. |
| 3. Finding verification | `lib/reviews/contract.mjs:42` validates proof and verification as strings. The runner executes configured checks; a finding's verification text is not an executable, scope-bound result. | Extend the existing finding record with a relevant check or readback reference, result hash and scope. Check the affected caller and consumer before accepting a consequential claim. Preserve human review. |
| 4. Failure feedback | Existing suites cover synthetic failure and recovery cases. No harness scanner for recurring session failures was found. | Add an on-demand, read-only scan of existing receipts and selected, redacted traces. Flag unchanged failing retries and interrupted closure. Convert selected incidents into small regression fixtures after review. Avoid copying full histories. |

Codex Rabbit defaults to OS temporary storage (`scripts/codex-rabbit-review.mjs:43`). Persistent runs need an explicit durable state path; atomic writes alone do not establish retention.

## Upstream patterns and limits

[Process jobs](https://github.com/griffinwork40/agent-afk/blob/09cab784dcf1232a55f41b7ddf54c1988221fce1/src/agent/shell-jobs/process-jobs.ts) track ownership, deadlines and teardown. [Shadow verification](https://docs.agentafk.com/guides/verification) and [failure analysis](https://docs.agentafk.com/guides/self-improvement) supply useful patterns.

AFK's [completion gate](https://github.com/griffinwork40/agent-afk/blob/09cab784dcf1232a55f41b7ddf54c1988221fce1/src/agent/terminal-state-gate.ts) is opt-in, autonomous-mode-only and fails open after its correction cap. Borrow evidence checking while retaining Singleton Systems' incomplete state.

Start with priorities 1 and 2 inside the existing harness. The proposed hosted video review should use the same receipt IDs and source adapters.
