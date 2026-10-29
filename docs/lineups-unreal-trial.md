# Lineups Unreal trial

Use the same Lineups lane and transcript review. This first Unreal option is
Lane 4: one two-player comparison with an optional stat card.

## Template 1: Comparison

Jerami approved the full-body, smooth-motion version as the first template.
[The approved manifest](../config/unreal/comparison-template-01.json) pins the
native map and sequence, review export, verification and recovery backup by
checksum. Future copies use this baseline and preserve the approved master.

The approved example is 1920 × 1080 at 60 fps. It runs for eight seconds as a
visual demo. The current demo cutouts have a one-time approval; production
uses mask-only extraction. Episode dialogue and same-revision Manim cues set
the hold and exit. Automation code review remains separate.

## Approved motion contract

Jerami approved [comparison-motion-contract.json](../config/unreal/comparison-motion-contract.json)
on 2026-10-18. Each build and review must follow these treatments:

| Element | Required treatment |
| --- | --- |
| Lighting | Team-colored edge lights against dark, textured surfaces |
| Logos | Solid depth, beveled edges and restrained reflections |
| Camera | One small push through the shallow set |
| Entrance | Background settles, players enter, then the card |
| Hold | Card stays readable; Mark and Manim cues determine the exit |

Sports Broadcast supplies the editable base. RedefineFX's 5.7 studio examples
guide the lighting and motion. The old Hype Chamber package is optional.
Its acquisition or repair does not block this build.

Mark's dialogue and Manim cues from that same revision own the hold and exit.
No fixed demo duration may replace them. Export handles stay separate. Missing
cues allow a labeled visual demo, but block timing approval and production
handoff. Automated motion checks remain to be built within a confirmed test
boundary.

## Locked photo and motion rules

Use mask-only background removal. Keep the original photo and preserve its
foreground pixels, face, uniform, pose, colors and equipment. Check the alpha
and compare the cutout with its source before importing it.

Choose sources with enough body to retain the legs and feet. Preserve that
framing through the entrance. Nameplates enter with their players so a waist
edge never floats before a plate appears. Keep helmet tops near the previous
review placement; they may rise no more than 10 px.

Motion stays smooth and restrained: short travel, continuous easing, soft
opacity ramps, one small camera push, and a static readable hold. Do not add
flashes, whips, bounce or overshoot. Mark and same-revision Manim cues still
own the production hold and exit.

Jerami accepted the two generated full-body cutouts for this visual demo only.
That exception does not change the mask-only production workflow.

## Build the comparison

1. Read the transcript and review the comparison's meaning.
2. Set `mode` to `conceptual` when the speaker compares players without a
   numeric breakdown. Set it to `statistics` for a sourced breakdown.
3. Supply the speaker-led headline and two player names. The conceptual
   example's `[SPEAKER POINT]` is a placeholder, not finished client copy.
4. Build the named working scene. Both modes use the same source family,
   background, players, logos and geometry. Conceptual mode collapses the card.
5. Review the actual Unreal output before any Premiere handoff.

```sh
python3 scripts/lineups-unreal.py config/unreal/comparison-statistics-trial.json
python3 scripts/lineups-unreal.py config/unreal/comparison-conceptual-trial.json
```

The examples update one trial source. Give an episode working copy its own
`WBP_` asset name. The builder refuses to replace a widget it does not own.
Artwork is imported by content hash, so a new player cannot overwrite an older
scene's texture. A separate internal source backup precedes each build.

The card accepts 1–5 sourced rows. Card text below 36 is rejected; the current
four-row example reads back at 44 or larger. Values, labels and the card remain
editable Unreal widgets. The logos' visible centers share one horizontal line.
Player names use 64-point text inside opaque team-color lower thirds. These
plates overlap the cutouts' lower edges in both modes to anchor the players.

```sh
python3 -m unittest tools.lineups_unreal.test_comparison -v
LINEUPS_UNREAL_LIVE=1 python3 -m unittest tools.lineups_unreal.test_comparison -v
```

Jerami confirmed the request-to-scene TDD boundary in this chat. The live tests
check card visibility, sourced rows, readable type, aligned logos and unchanged
artwork across modes. They do not establish narration interpretation or visual
approval.

The engine and complete project stay on verified UnrealSSD. Each build checks
the active project and loopback agent connection. Native build receipts live
in the project's `Saved/LineupsComparison/` folder.

This is an editable trial, separate from the installed Epic package's original
scenes. The current review export uses the separate native map and sequence under
`/Game/Lineups/ReviewV1` in `LineupsSportsTrial.uproject`. It retains editable
UMG type, separate player planes, solid beveled logo meshes and four native
lights. Its approved eight-second visual window ends during the hold. It does not set
Mark or Manim timing.

The render receipt is `source/unreal/receipts/lineups-review-export.json` under
the client UnrealSSD route. Frames and the MP4 review copy use the client
HomeSSD renders route. Authored binary assets have a verified internal backup
under `~/.local/state/singleton-systems/unreal-setup/authored-backups/`.

The visual template review is approved. Episode timing and automation review
remain open. Existing production Figma hooks and renderer choices stay in place.


## Template 2: Stat Breakdown

This review copy stays in Lane 3: Stat Breakdown. It adapts the installed
`FS_PlayerStats` scene, which matches Jerami's supplied one-player card reference.
The flexing Mahomes photo is the chosen demo source. Its background removal
changes alpha only; the original RGB pixels remain unchanged.

[The source configuration](../config/unreal/stat-breakdown-template.json) keeps
three and four points as explicit variants. Both retain the same large stat
and label scales. The four-point variant redistributes columns inside the
card. A full-frame Field Night background replaces the sample's transparent
surround. Name, number, position, team colors, logo and stats remain editable.
The original Epic scene and approved Comparison master stay separate.

The native assets live under `/Game/Lineups/StatBreakdownV1` in
`LineupsSportsTrial.uproject`: `LV_MahomesStat3` / `LS_MahomesStat3` and
`LV_MahomesStat4` / `LS_MahomesStat4`. The scripts in `tools/lineups_unreal/`
operate on these owned copies. Standalone sequence copies need explicit actor
bindings. Reopen a saved map directly before final render verification: an
off-screen map copy can retain stale Material Designer mask state.

These are eight-second visual demos at the sample's native 60000/1001 frame
rate. The source entrance is retained; the added fourth stat uses the same
entrance with a six-frame stagger. The demo ends during a readable hold.
Mark's dialogue and same-revision Manim cues still own production hold and
exit. Visual approval, episode timing and production routing remain separate.


### Stat Breakdown readability revision 2

The settled output must show complete letters and the full team mark. Raise
the inherited stat-label mask to contain the enlarged labels. Normalize the
logo texture tiling to 1×1. Enlarge the QB text and its tag mask together; use
Bold for the season line. These controls are pinned in the source configuration.

The export check projects glyphs against their actual mask bounds and rejects
clipped text. It checks the QB and season line as well as the stats, with a
36 px minimum. Regression cases cover the original clipped labels, clipped
large QB text, tiny QB text and the previous season typeface. Actual output
frames still require visual review.

### Stat Breakdown layout revision 3

Treat the value and label as one centered stat group. Measure the native
glyphs after Text3D rebuild and sequence evaluation. Use equal columns when
the widest group fits; this puts PASS TD in the true middle of the three-point
card. Otherwise hug each group's wider value or label and distribute equal
gaps. Keep 32 px outside padding and at least 16 px between groups. Reject
overflow instead of shrinking type below the established scales.

The season slot is the speaker talking point, matching the Figma callout.
Its bold text sits over a separate black rectangle with 20 px horizontal and
10 px vertical padding. The rectangle grows with the measured text and follows
the source entrance. The red panel uses 90% opacity.

Run `refine_stat_breakdown.py` after building or changing each copy, with that
map open in the editor. It evaluates the settled geometry before applying layout.
It also removes
the inherited soccer highlight actors and their bindings from the standalone
and embedded sequences. Export requires this refinement and checks every
sampled game state for unexpected text or remaining highlight actors. Native
readback must pass glyph containment, group centering and callout padding.
Review the entrance, former highlight interval and hold in the encoded video.
