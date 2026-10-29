# Lineups stat breakdown

Lane 3 uses the installed Epic `FS_PlayerStats` scene. Mahomes is the review
subject. The source config supports 3 or 4 stats. The native maps and sequences
live under `/Game/Lineups/StatBreakdownV1` in `LineupsSportsTrial.uproject`.

## Layout

The 3-stat row uses the wider value or label to size each group. Distribute the free
space evenly between groups and at both visible white rectangle edges.
Center each number over its label. The 4-stat version retains its measured
content widths and even gaps across the card. Type stays the same size for both
counts. Reject overflow instead of shrinking it.

Keep the established camera position, rotation and lens from `reviewCamera`
before measuring layout. Editor pilot changes must not alter the export frame.

The panel is 90% opaque with a subtle 16 px corner radius. The bold speaker callout has a black rectangle with
20 px horizontal and 10 px vertical padding. The rectangle follows the text's
entrance and stays behind the glyphs through its own sort-priority modifier.
Remove inherited soccer highlight actors and their sequence bindings.

## Source and output

- [Source config](../config/unreal/stat-breakdown-template.json)
- [Native assets, backups and render checks](../config/unreal/stat-breakdown-template-02.json)
- Figma sources: `591:105` and `591:123` in `o7E24iymIT80MTXGYIogVH`.

Keep photo RGB pixels unchanged; background removal changes alpha only. Keep
the Field Night background, player, logo, text and stat card separately editable.
Store native assets in the complete external Unreal project. Keep an internal
authored backup. Generated frames and videos stay on verified HomeSSD.

## Build and review

Open the owned map in Unreal. Run `refine_stat_breakdown.py` through the native
Python console after text geometry has rebuilt. It evaluates the settled frame,
then measures and saves the layout. `render_stat_breakdown.py` reads the native
receipt directory's `stat-render-request.json` and runs Movie Render Queue.

Export checks cover expected text, complete glyphs inside masks, stat centers,
callout padding and draw order. Inspect the encoded entrance and reading hold.
The demo is 1920×1080 at 60000/1001 fps for 480 frames. Mark's dialogue and
same-revision Manim cues set the entrances. Hold a static scene after entrance.
There is no animation out. Premiere owns the cut or transition. The demo's
duration does not set editorial timing. Jerami approved this visual template on Oct 20, 2026. Episode timing remains open.
