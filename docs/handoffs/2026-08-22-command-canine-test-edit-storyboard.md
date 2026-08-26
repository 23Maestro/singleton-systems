# Command Canine test-edit storyboard

## Goal

Build a 48–52 second kitchen-safety sample from `Raw Clips.mp4`. Match the
reference's medical tone and visual cadence. The sample is for review only.

Reference profile: `2026-08-24-command-k9-reference-edit-profile.md`
Full ledger: `2026-08-24-command-k9-reference-edit-ledger.csv`

## Delivery envelope

- 1920×1080, 16:9, 24 fps.
- H.264 review MP4 with 48 kHz stereo audio.
- Selective text. No full burned captions.
- Figma defines approved component states. Figma Motion owns repeated graphic
  scenes. Premiere owns dialogue, pacing, B-roll, sound, assembly, and export.

## Source decisions

| Raw time | Decision | Use |
| --- | --- | --- |
| 01:33.360–02:07.340 | KEEP / TRIM | Main kitchen-safety explanation. |
| 02:07.340–02:20.660 | SCRAP | False checklist start. |
| 02:20.660–02:27.920 | KEEP | Clean checklist close. |

## Target pattern map

| Edit time | Raw source | Reference pattern | Action | Screen change | Primary engine |
| --- | --- | --- | --- | --- | --- |
| 00:00–00:03 | 01:33 dialogue | Claim card, 00:53–00:59 | Adapt | White contour field and black bar: `DOG-PORTFOLIO YOUR HOME`. | Figma Motion |
| 00:03–00:12 | 01:33–01:42 | Trust rhythm, 00:14–00:41 | Preserve | Kitchen speaker shot. One restrained punch-in at the claim turn. | Premiere |
| 00:12–00:18 | 01:42–01:47 | Labeled cause, 05:48–06:01 | Adapt | `MEDICATIONS` / `UP + OUT OF REACH`. Keep the bottles visible. | Figma Motion |
| 00:18–00:27 | 01:47–01:59 | Labeled cause, 05:48–06:01 | Improve | `FOOD` / `CLEAR THE COUNTERS`. Track the label to the counter without covering her hands. | Figma Motion |
| 00:27–00:31 | Source edit | Evidence bridge, 00:41–00:50 | Preserve | One serious dog-at-counter insert. No comic reaction shot. | Premiere |
| 00:31–00:39 | 01:59–02:07 | Speaker-side list, 02:54–02:59 | Adapt | `HOUSEHOLD CLEANERS` / `LOCK LOWER CABINETS`. Add a simple lock state. | Figma Motion |
| 00:39–00:43 | Removed false start | Full-screen system, 06:15–06:23 | Adapt | `PILLARS OF A DOG-SAFE HOME`: `MEDICATIONS`, `FOOD`, `CLEANERS`. | Figma Motion |
| 00:43–00:52 | 02:20–02:28 | Progressive recap, 07:50–08:44 | Adapt | Return to the kitchen. `HOME-SAFETY CHECKLIST` / `Linked below`. | Premiere |

## Build rules

- Use black, white, gray, and the sampled reference blue.
- Keep labels short. Use direct slides, fades, and modest scale changes.
- Let the speaker carry trust. Graphics should explain a claim or hide a cut.
- Add sound accents only after the reference audio receives an ear-check pass.

## Review gate

- [x] Full visual reference profile and quantified ledger complete.
- [x] Target transcript beats mapped to named reference families.
- [x] Delivery envelope and one primary engine recorded for every beat.
- [ ] Confirm the revised pattern map.
- [ ] Source one licensed dog-at-counter clip.
- [ ] Inspect Premiere project state and bins read-only.
- [ ] Approve timeline mutation.

Review export: `2026-08-22_command-canine_test-edit_v01_review.mp4`
