# Intent Keys timing map

This tool reads Max's storyboard, the clean-selects cut map and existing Whisper
words. It maps cues through retained cuts at 30 fps. Manim checks timing only.
It renders no artwork and changes no timeline.

```sh
python3 -m unittest tools.intent_keys.test_plan -v
python3 -m tools.intent_keys.plan \
  --request config/intent-solutions/intent-keys/e01/review.json \
  --output /Volumes/HomeSSD/Generated/INTENT_SOLUTIONS/references/2026-10-23-e01-flow/plan.json
```

The output includes source hashes, source-to-cut ranges, 13 spoken-word card
cues, the flub counter and proposed additions. The proof binds the generated
plan and its input files. A changed source needs a new proof.

The request records corrections to the old working cue list. Raw client speech
stays unchanged. Phrase cues use existing segment boundaries. Flub updates use
Max's supplied edit points. Neither is presented as word-level timing.

This is a review plan. Listen and watch at each cue before assembly. Actual
command presses can land after their spoken names. Check every trim, privacy
crop, caption and asset. HyperFrames owns proposed overlay motion; Figma owns
the reusable card design. B-roll stays optional. VEED testing is tabled.
