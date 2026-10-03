# Lineups template system

Figma holds the editable designs. The registry holds their exact addresses and
supported settings. JSON measurements check whether an episode preserves the
approved design.

| Place | Purpose |
| --- | --- |
| Foundations | Brand assets and measured references |
| Components | Approved reusable sources, grouped by the 7 lanes |
| Episode pages | Copy, photos, logos, and native motion for each episode |
| Legacy | Old examples and ideas; excluded from template retrieval |

Page count does not decide which design code retrieves. Each template has a
stable registry key, a Figma file and source ID, supported counts, and a direct
source link. Renaming a page or source does not change those IDs. Recreating a
source creates a new ID and requires a registry update.

For a new template, use 1 master in Components. Create count variants when
structure changes. Expose replaceable copy and asset slots. Record protected
geometry and styling, then register its exact source. Keep episode examples
linked as proof, separate from that authority.

The build order is:

1. Record transcript evidence and the visual purpose.
2. Test the candidate's counts and asset requirements against registered looks.
3. Retrieve the exact approved source and verify it exists in Components.
4. Create the episode copy and replace allowed content.
5. Compare actual measurements against the source and inspect the finished frame.

A team matchup with 2 records fits Simple comparison with team logos. A direct
player comparison needs player art and verified alpha. An unclear passage
returns a review reason and eligible choices. Missing capacity returns a
reference gap.

The registry currently binds 20 sources across all 7 lanes. Quick Stat has the
new detailed style and geometry comparison. Other lanes retain their existing
checks and require visual review; they do not yet have complete style snapshots.
Simple board and some Asset Swap counts still need source registration.

Run `npm run check:lineups:templates` to test retrieval, candidate fit, canonical
source measurements, and a generic callout fixture. Fetch fresh Figma properties
after each mutation and before delivery. Passing an old JSON file does not prove
the current canvas.

The shared workflow starts with no active episode. Bind the current scene through
`LINEUPS_MANIFEST_PATH`, or create `config/lineups/active-scene.json` for the current
edit only. Verify the episode, Figma nodes, and Premiere sequence against live
readback before binding. Keep manifests and receipts under that episode's folder.
Clear the environment override and remove the temporary active file when the
scene finishes or work switches projects. Episode history never supplies the
default binding. The no-enrollment guard still requires a scene manifest before
mutating or exporting the shared Lineups Figma file.
