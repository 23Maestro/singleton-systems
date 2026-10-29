# Work to Content

Turn real client work into 1 useful clip for Jerami to review.

Start with Lineups: script cue → timed graphic → verified Premiere placement.
Show the editing and the system behind it. Keep claims tied to visible proof.

## Use

- “Turn this Lineups work into one proof clip.”
- “Pick up my content capture plan.”
- “Record this workflow and cut the useful parts for my review.”

Planning is the default. Recording needs a requested take. Posting needs
approval of the exact clip, copy and destination. No action starts delegation.

## Resume

Social Media Engine routing now has a private, revision-checked state file.
Read [the saved-routing commands](skills/work-to-content/references/saved-routing.md).
The helper retains claim links and choices through interruption. Each beat gets
its own production route. It keeps missing proof and tools visible at review.
The assembly choice remains open until Jerami selects it.

Read [the HomeSSD working note](/Volumes/HomeSSD/Generated/SINGLETON_SYSTEMS/references/work-to-content.md).
It holds the next step, capture log and draft links. The repository's startup
and resume hook repeats the link, even when live routing is unavailable.
Content requests repeat it after this route is enabled.

Recordings and exports use the paths in `references/content-plan.json` under
the router skill. Run the storage gate before writing. If HomeSSD is offline,
wait for it. Plugin source, Git and small project manifests stay in this repo.

## Package

- `work-to-content`: intent, source work, useful moments and review.
- `openscreen-demo`: capture, cuts, zooms, export and output checks.
- `mcp.json`: OpenScreen's local agent server.

The OpenScreen recipe is pinned to v2.1.1. Its license and source hashes are
kept in the package. Local storage, browser and review rules take precedence.

## Activation

Release and live routing need Jerami's approval. The Mac app install and the
recording/export pilot remain separate.

After approval, add the repository marketplace and install
`work-to-content@singleton-content`. Seed only this plugin's registry rows
with `node scripts/activate-work-to-content.mjs --apply`, then read them back.
Apply the canonical-path migration before a later full registry seed. The
activation script defaults to a preview and changes no other routes. It writes
the route only after its skills and capability pass readback.
