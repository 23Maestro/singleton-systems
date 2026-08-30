# Lineups enforcement proof — 2026-08-27

## owner and intent

Docs and skills own the policy. Figma owns scene geometry. Eagle owns the final render. Premiere owns edit placement. Jerami owns review. This proof gates one enrolled Lineups scene across all four owners.

## enforced path

The scene manifest records the approved lane, option, setting, Figma IDs, exposed slots, timing, render path, Eagle path, Premiere target, and Jerami review. A SHA-256 hash pins the exact approved Figma tool input. Chained receipts pin the manifest and exported file.

PreToolUse denies an enrolled call when the manifest is missing data, the input hash differs, a receipt is missing or stale, or a policy check fails. PostToolUse checks returned IDs and readback data. A failed readback blocks the result from authorizing the next stage.

The narrow matchers cover these current fully qualified paths:

- Figma write: `mcp__codex_apps__figma_use_figma`.
- Figma bypass denial: `mcp__codex_apps__figma_weave_run_tool`.
- Figma render: `mcp__codex_apps__figma_export_video`.
- Premiere import, placement, movement, trim, replacement, transition, effect, LUT, opacity, and destructive calls named in `.codex/hooks.json`.
- Premiere project-item and sequence readback calls named in `.codex/hooks.json`.

Tests send synthetic hook payloads. They do not touch an open Figma file or Premiere project.

`lib/transactions/lineups-adapter.mjs` turns the same manifest and stage receipts into the shared transaction envelope. The adapter runs in readback mode. It cannot mutate Figma, Eagle, or Premiere. Completion requires four verified owners and a valid shared receipt chain. A stale stage marks every dependent owner stale.

## boundaries

Enrollment requires `config/lineups/active-scene.json`, or `LINEUPS_MANIFEST_PATH` plus `LINEUPS_RECEIPT_DIR`. A missing active manifest leaves unrelated work alone. That also means a new Lineups file is outside this proof until enrolled.

The Figma gate trusts a reviewed input hash. It does not parse arbitrary JavaScript. PostToolUse cannot undo a completed mutation. Codex also permits some tool paths to skip normal hooks. These limits match the current [OpenAI Hooks documentation](https://learn.chatgpt.com/docs/hooks).

Project hook changes need trust review through `/hooks` before Codex runs the new hash. The repository has no readable persisted trust record for this new definition, so Jerami must review it at the next session start.

## review loop

`review-correction.schema.json` holds the payload needed by Linear `23M-144`: decision, component ID, instance ID, exposed slot, allowed replacement, and requested value. This task does not build the HTML review surface.

This adapter is approved for the Lineups proof only. Wider client-video enrollment needs Jerami review.
