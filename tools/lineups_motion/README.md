# Premiere edit checks

Read tools can inspect a new project while an old episode is still bound.
A failed read check clears cached write proof. It does not block discovery.

Writes still check the project path and sequence together. Reused clip IDs
alone cannot grant access. Clip placement also checks the source file, track,
time and overlap with existing clips.

For motion transitions, use a fresh sequence read to find the clip's current
edges. Jerami can trim the clip without a timing-plan rewrite. The clip ID,
name, track, transition and requested side must still match the approved plan.

A successful reply with the right transition name, sides and measured frame
counts completes the check. Older MCP builds need no extra status flags.
An unclear reply stays pending. Save the project and read the full sequence
to check that transition in the saved project before retrying.

After Jerami closes an episode, set its binding status to `closed` and record
his closeout in `closedReason`. Reads stay open. Bind the next project before
editing it. Keep the old approval and edit proof for reference.

Run the guard tests:

```sh
python3 -m unittest tools.lineups_motion.tests.test_premiere_delivery tools.lineups_motion.tests.test_premiere_motion_placement tools.lineups_motion.tests.test_premiere_title_timing
```
