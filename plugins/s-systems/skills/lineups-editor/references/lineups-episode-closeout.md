# Lineups episode closeout

The Codex heartbeat **Lineups episode closeout** checks this repository daily at
2:05 PM local time. Episode intake records the exact Asana task ID, delivery date,
stable slug, and optional final-export filename in `config/lineups/review-gates.json`.
Date-only deadlines mean 10 AM America/New_York. A fresh Asana `due_at` takes
precedence, including postponements. The checker handles daylight saving time.

After **more than four hours** past the deadline, treat an unfinished task as
`assumed-submitted`. Clear that enrollment and only its matching active scene.
Ask Jerami: “Are you still editing? If so, provide the revised deadline.”
This assumption does not complete the Asana task or prove client delivery.
Completed Asana tasks close as `completed-in-asana`.

An exact video filename in the bound Drive folder can close as
`confirmed-submitted`. Bind `finalExport` during intake:

```json
{"folderId":"1YCqTWoK2MsHiW7-CiYpfZ0edzSZppnk-","name":"exact-episode-final.mp4","notBefore":"2026-10-13T12:00:00Z"}
```

That folder is the shared business Drive **Lineups Final Exports**. Check file
metadata only. A similar filename, another folder, a trashed file, or a non-video
cannot confirm submission. Set `notBefore` to the episode intake timestamp and
require Drive `modifiedTime` at or after it; an older same-named export cannot
confirm this week. Missing timestamps leave delivery unverified. Do not download
footage for this check.

## run the checker

Preview with `node scripts/check-lineups-episodes.mjs`.
Apply with `node scripts/check-lineups-episodes.mjs --observations /tmp/lineups-observations.json --apply`.

The scheduler reads Asana and optional Drive metadata, then supplies observations:

```json
{
  "checkedAt": "2026-10-13T18:05:00Z",
  "episodes": {
    "episode-slug": {
      "asana": {"gid":"exact-task-id","completed":false,"due_at":"2026-10-13T14:00:00Z"},
      "driveFiles": [
        {"id":"exact-file-id","name":"exact-episode-final.mp4","mimeType":"video/mp4",
         "parents":["1YCqTWoK2MsHiW7-CiYpfZ0edzSZppnk-"],"trashed":false,"modifiedTime":"2026-10-13T17:00:00Z"}
      ]
    }
  }
}
```

Omit unavailable connector facts. Without observations, repository dates still
apply the deadline assumption. Supplied observations older than one hour, wrong
task IDs, or malformed values fail before any closeout. `--now` accepts an ISO
timestamp for deterministic tests.

Each closeout saves the prior enrollment and matching active manifest under
`config/lineups/closeouts/<episode-slug>/<snapshot-hash>.json` before clearing
activation. Receipts, transcripts, episode files, review pages, and client media
remain intact. Repeated checks preserve the original snapshot. Another active
episode remains active.

The lock `config/lineups/.episode-check.lock` prevents concurrent changes. After a
crash, check that no checker process is running before removing that exact lock
and rerunning. Clear task-local `LINEUPS_MANIFEST_PATH` overrides when an episode
closes; they can point at an old manifest independently of the active-scene file.

If Jerami is still editing, update the same Asana task to his revised deadline
and restore the archived enrollment with that date. Validate current scene
evidence before restoring its active manifest. Never overwrite another active
scene or reuse approval after changing its evidence. An orphan active manifest
without a dated enrollment requires explicit repair; the checker cannot infer a
deadline from a team name.

The heartbeat runs when Codex is available. Its first future execution remains
a scheduler check, separate from the CLI behavior covered by automated tests.
