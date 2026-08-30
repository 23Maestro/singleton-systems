# cross-surface transaction proof

## completion contract

One approved intent follows this path:

`route -> declare owners -> plan mutations -> apply -> read back -> verify -> receipt -> done`

The envelope records the intent, Lane, route, owners, expected mutations, preconditions, review gates, and status. Each owner gets one ledger entry with its URI, operation, input hash, before state, after state, readback evidence, and current result.

`completed` is valid only when every required owner is verified, every required review is approved, and the full receipt chain passes its hash check. A missing adapter, failed write, stale dependency, readback mismatch, interrupted run, or changed receipt leaves the transaction incomplete.

Retries use a delivery key derived from the transaction idempotency key, owner ID, and planned input. A verified duplicate does not call `apply` again. Durable runners save a `prepared` checkpoint before any live apply. An interrupted or uncertain owner resumes at readback. A failed readback leaves it incomplete and refuses an automatic replay. A changed upstream input marks every dependent owner stale before repair.

Repair plans are evidence for a later decision. They never execute on their own. Cross-app writes have no ACID promise. Each repair step is best effort and keeps human review in control.

## two passes

Pass one owns delivery. It requires an envelope, one ledger row per declared owner, direct readback, verification, and a chained receipt.

Pass two owns freshness. It reads the canonical owner graph again, marks direct drift, invalidates dependent owners, and writes a repair plan. A dependent owner whose own readback passes is queued for re-verification after its dependency is repaired. It is not mislabeled as broken.

## owner boundaries

The machine-readable map is in `config/transactions/owner-map.json`.

| state | owner |
| --- | --- |
| Task state | Linear |
| Implementation evidence | GitHub and the repository |
| Client and opportunity truth | Notion, when used |
| Integration receipts and temporary drafts | Supabase, when required |

## lane adoption map

| Lane | current use | next boundary |
| --- | --- | --- |
| System Maintenance | Repository contract delivery now declares policy, packaging, the repository registry, its Supabase deployment, checks, and final readback. | Live Supabase mutation needs Jerami approval and must pass parity readback. |
| AI Consultant | The Notion client record plus Linear next action flow is proven with synthetic adapters. | Live connector mutation needs Jerami approval. |
| Development | Linear gateway work can adopt the envelope and receipt chain. | Add API readback adapters before any status claim. |
| Content Editor | Lineups uses its hook for live mutation gates and the shared core for owner readback, staleness, and completion. | Each new scene needs enrollment and Jerami review. Other clients still need adapters. |
| Portfolio | Application work can use receipts for task and repository evidence. | Resume claims keep a human source check. |
| Writing Review | Reviewed artifacts can declare their durable owner and readback rule. | Final human review stays required. |

## system and tool-harness flow

The first real read-only flow declares ten owners:

1. Clean, attached, pushed Git checkout
2. Repository policy
3. Plugin source
4. Cerebral registry source
5. Installed Codex plugin runtime
6. Home plugin mirror
7. Claude plugin runtime
8. Supabase registry replica
9. Active task plugin catalog
10. Repository contract checks

Run the readback with:

```bash
npm run transactions:reconcile -- \
  --task-plugin-version <version> \
  --allow-incomplete
```

State is written atomically outside the repository with owner-only file permissions. The same state file resumes an interrupted or incomplete run. `--apply` is rejected because no live mutation adapter is approved.

The checkout proof found two direct blockers before commit: Git was dirty and detached, and the live Supabase registry could not be verified. Repository files, all three plugin mirrors, the active task catalog, and repository checks passed direct readback. They stayed incomplete because their declared dependencies were not verified.

## first live review gate

Read live Linear issue descriptions only. Exclude Linear documents and intentional deep briefs such as `23M-96`. Show Jerami the current word count, compact draft, and facts that must remain. Write nothing until he approves each issue. Review Notion later as its own owner pass.

The proof does not publish a plugin, call a live connector, or change Linear state. The approved Lineups adapter is fixture-backed and readback-only.
