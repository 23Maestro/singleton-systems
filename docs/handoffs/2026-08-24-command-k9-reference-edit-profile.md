# Command K9 Edit Style Profile

Source: `Addressing Physical and Emotional Health - Youtube.mp4`  
Runtime: 08:51.605  
Audit: full-runtime transcript, one-second contact sheets, scene candidates, and exact boundary frames

## Quantified profile

Base visual categories are mutually exclusive. Overlays are counted separately.

| Measure | Result |
| --- | ---: |
| Speaker visible | 53.8% / 285.955 s |
| Speaker only | 47.0% / 250.023 s |
| Speaker plus graphics | 6.8% / 35.932 s |
| B-roll | 10.9% / 57.802 s |
| Full-screen graphics | 16.8% / 89.457 s |
| Vertical footage | 14.4% / 76.462 s |
| Still images | 2.7% / 14.514 s |
| End card | 1.4% / 7.415 s |

- 22 content-graphic occurrences. Their average visible hold is 9.66 seconds.
- 7 punch-ins. One every 75.9 seconds, or 0.79 per minute.
- 7 editorial B-roll inserts after the branded opener. One every 75.9 seconds.
- 1 full-screen claim card, 6 explainer or recap sequences, 11 lower-third or evidence-label occurrences, and 1 end card.
- 64 meaningful state changes. The average interval is 8.31 seconds.

Graphic counts exclude the opening logo, end card, and transition-only shapes.
Repeated labels count once per continuous appearance. Punch-ins count only a
wide-to-close speaker reframe.

## Reusable families

| Family | Reference ranges | Rule | Downstream owner |
| --- | --- | --- | --- |
| Trust rhythm | 00:14–00:41; 01:40–02:32 | Hold the speaker, then punch in at a claim turn. | Premiere |
| Labeled evidence | 01:23–01:40; 03:39–04:30; 07:09–07:21 | Use client footage with blurred side fill and one label or statistic. | Premiere |
| Claim card | 00:53–00:59 | Black header on a white contour field. Keep the statement short. | Figma Motion |
| Speaker-side list | 02:54–02:59 | Reveal two or three scanable points beside the speaker. | Figma Motion |
| Full-screen system | 06:15–06:36 | Build a relationship in stages, then hold the completed state. | Figma Motion |
| Progressive recap | 07:50–08:44 | Keep one full-screen canvas and add numbered rows over voice-over. | Figma Motion |
| Evidence bridge | 00:41–00:50; 07:21–07:31 | Cut to evidence when a claim can be shown. Return to the speaker for interpretation. | Premiere |

Figma should define the contour field, black title bar, blue label cards,
supporting caption bed, and numbered recap rows as approved component states.
Figma Motion should own timing for the claim card, list, system, and recap families.
Premiere should own speaker reframes, evidence selection, pacing, and final sound.

## Confidence boundary

Visual timing and percentages are complete. Transcript timing is confirmed by
local Whisper. Audio notes identify where music or effect review is required.
Exact sound-effect hits and music changes still need one ear-check pass before
the profile becomes an audio reference.

Full ledger: `2026-08-24-command-k9-reference-edit-ledger.csv`
