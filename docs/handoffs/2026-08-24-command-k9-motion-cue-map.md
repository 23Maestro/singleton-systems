# Command K9 Motion Cue Map

Source: `Raw Clips.mp4`  
Client profile: `2026-08-24-command-k9-reference-edit-profile.md`  
Delivery: 1920 x 1080, 24 fps; alpha overlays stay 1120 x 220

## profile targets

- Full-screen graphics: 16.8 percent of runtime.
- Average meaningful visual change: 8.31 seconds.
- Average graphic hold: 9.66 seconds.
- Speaker visible: 53.8 percent.

These values set the Command K9 rhythm. The target footage still decides which
passages earn a graphic.

## cue map

| ID | Raw range | Trigger | Visual response | Reference family | Engine |
| --- | --- | --- | --- | --- | --- |
| `K9-01` | 00:00.000–00:05.000 | `PHRASE` · “The first four weeks in your home” | Reveal `THE FIRST`, then `FOUR WEEKS`, then the support card. | Claim card · 00:53–00:59 | Figma Motion |
| `K9-02` | 00:13.440–00:22.740 | `WORD` · decompress 00:15.750; space 00:17.750; safe 00:19.180; pace 00:22.160 | Build the system header and shared foundation. Raise `SPACE`, `FEEL SAFE`, and `THEIR OWN PACE` as three supports on the spoken cues. | Pillar system · 06:15–06:23 | Figma Motion |
| `K9-03` | 00:31.375–00:34.375 | `EDIT` · silent gap start | Reveal `YOU SAVED`, then `THEIR LIFE`, then the subtitle. | Claim card · 00:53–00:59 | Figma Motion |
| `K9-04` | 01:23.125–01:30.292 | `EDIT` · silent gap start | Reveal `DOG-PORTFOLIO`, then `YOUR HOME`, then the support card. | Claim card · 00:53–00:59 | Figma Motion |
| `K9-05` | 01:42.890 | `WORD` · medicine | Run the six-second logo-first sweep, land the Medications message, hold, then fade. | Labeled evidence · 05:48–06:01 | Figma Motion |
| `K9-06` | 01:48.020 | `WORD` · food | Run the six-second logo-first sweep, land the Food message, hold, then fade. | Labeled evidence · 05:48–06:01 | Figma Motion |
| `K9-07` | 02:00.160 | `WORD` · cleaners | Run the six-second logo-first sweep, land the Cleaners message, hold, then fade. | Speaker-side list · 02:54–02:59 | Figma Motion |
| `K9-08` | 02:11.083–02:18.167 | `EDIT` · false-start gap | Keep the kitchen action visible. Reserve this beat for a more detailed speaker-side supporting callout. | Speaker-side list · 02:54–02:59 | Figma Motion |
| `K9-09` | 02:29.583–02:36.417 | `EDIT` · silent gap start | Reveal `ADVOCATE`, then `FOR THEM`, then the two-sentence subtitle. | Claim card · 00:53–00:59 | Figma Motion |
| `K9-10` | 03:10.090 | `WORD` · training | Run the six-second logo-first sweep, land the Training message, hold, then fade. | Labeled evidence · 07:09–07:21 | Figma Motion |

## timing boundary

Whisper medium.en with DTW confirms the word cues used above. Keep the full
word-timestamp JSON with the source transcript in Eagle.

Premiere owns dialogue timing, sound, assembly, and export. No timeline change
is approved by this map.
