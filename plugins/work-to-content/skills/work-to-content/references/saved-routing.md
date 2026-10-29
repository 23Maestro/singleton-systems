# Saved social routing

Use the repository helper from the repository root. Private workflow state
lives in `~/.local/state/singleton-systems/social-media-engine/workflow.json`.
Asana still owns content task status. Linear owns this implementation.

```bash
python3 plugins/work-to-content/skills/work-to-content/scripts/social_engine.py status
python3 plugins/work-to-content/skills/work-to-content/scripts/social_engine.py claims --ids prospect-stage-clock
python3 plugins/work-to-content/skills/work-to-content/scripts/social_engine.py apply --event /absolute/private/event.json
```

An event has `event_id`, `expected_revision`, `session_id`, `post_id`, `op`
and `data`. Read the revision before each change. Reuse an event ID only for
an exact retry. A stale write fails. Save event files privately; they may
contain draft words. Never place interview text in Git.

```json
{
  "event_id": "select-idea-1",
  "expected_revision": 0,
  "session_id": "CURRENT-SESSION-ID",
  "post_id": "chosen-post",
  "op": "start",
  "data": {"origin": {"kind": "craft", "reference": "craft://actual-idea"}}
}
```

## Steps

1. `start` binds a Craft or `selected_work` reference. `resume` binds the
   active post to a new session without changing its choices.
2. Before shaping the story, render `intake_question` with
   `request_user_input_async`. It offers Short form, Long form, or Storyboards
   for both. The app supplies the write-in field. If Jerami already chose in
   this chat, save that choice without asking again. `scope` takes `value`
   (`short`, `long`, `both`, or `custom`) and `user_evidence`. A custom answer
   also needs `detail`. Resume keeps the choice. Older posts with no choice
   need it before advancing; their saved work stays intact.
3. `link` takes `claim_ids` from the private JSONL. Inspect each linked source.
   `proof` records `claim_id`, `status`, `reference`, `finding` and
   `draft_treatment`. Preserve attribution, estimates and public-use limits.
4. `choose` takes `field`, `value`, `status` and `basis`. Select `attack_type`
   first, then `content_lane`. Use the existing 8 lane IDs. Proposed choices
   remain open until selected. `advance` checks each stage.
5. `assets` takes an `assets` list. Each asset needs `id`, `state` and `visual`.
   Existing assets need `reference`. Videos also need `media_kind: video`,
   `source_revision` and original `source_range_seconds`.
6. Select `platform`, `post_format`, `opening_hook`, `reference_set` and
   `direct_style`. An empty reference list is valid. Read the platform skill
   when choosing the format.
7. `storyboard` takes `beats`. Each beat needs `id`, `claim_ids`, `asset_id`,
   `point`, `visual`, `start_seconds` and `end_seconds`. For both, send
   `version: short` and `version: long` in separate events. Each has its own clock. Both must exist before routes. Each route keeps its version.
   Platform and format fields describe the whole plan; each storyboard owns
   its shots and timing. To change length later, rewind to evidence first.
8. `tools` records each needed tool's `status` and inspection `evidence`.
   Advancing routes returns per-beat skills and blockers. Read only the
   selected independent skills. Figma supports adaptation and new builds.
9. `assembly` requires `value` and `user_evidence`. Keep it unset until Jerami
   chooses `assembled_review_draft` or `asset_kit`. `review` requires a verdict
   and user evidence; approval also binds exact local artifact hashes. For both,
   `artifact_versions` maps `short` and `long` to their reviewed artifact
   paths. Each path must also be in `artifacts`.

Use `rewind` with an earlier `stage` to revise choices. Prior values stay
visible, downstream selections reopen, and the storyboard must be rebuilt.

`budget` records a distinct `id`, Monday `week`, `route` and `minutes`.
`max_edits` and `jerami_demos` share 120 planned attention minutes weekly.
Keep this ledger internal. It does not measure actual time.
For Intent Solutions, set `origin.client` to `INTENT_SOLUTIONS` and supply
`budget_week` at start. Link its reservation with the budget entry's `post_id`.

Missing proof and unavailable tools stay visible at review. Review approval
permits the next post; it never grants publication permission. Recording,
Devin, account setup and media production retain their separate gates.
