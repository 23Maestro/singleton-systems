# FaithTalk social ending

Use this source for each new social video. The ending has the official animated
FaithTalk logo on black, the current episode schedule, Greater Love TV and the
watch URL. Keep the native sting audio. Added holds stay silent.

The [template](template.json) records the source sting, assets and prior export.
The [registry](../../config/745-creative/faithtalk/template-registry.json) links
Eagle, Figma and the current render. Figma's static green cards remain graphic
references. The animated ending is 231 frames at 30000/1001 fps.

Copy [the Episode 5 inputs](../../config/745-creative/faithtalk/episode-5-social.json)
for the next episode. Set the episode, ISO air date, airtime, selected source and
SHA-256, final video frame, audio endpoint and a fresh external output directory.
Use a real weekday from the air date. Confirm these values from the new brief.

```bash
python3 videos/faithtalk-social-ending/build.py --config config/745-creative/faithtalk/episode-5-social.json --prepare-only
python3 videos/faithtalk-social-ending/build.py --config config/745-creative/faithtalk/episode-5-social.json
```

The builder checks HomeSSD and source hashes. It requires a 1080x1920, 29.97 fps
Opus source and the retained HyperFrames 0.8.70 CLI. Set
`FAITHTALK_HYPERFRAMES_CLI` only to that reviewed version if its cache path changes.
Source templates stay in Git. Generated episode HTML is ignored. Linked assets,
renders and audio stay external. Use a fresh output directory for each render;
the builder refuses existing output so a changed date cannot reuse stale media.

After rendering, decode the whole export. Check the last source caption and
first ending frame. Transcribe the cut speech to catch partial next words.
Check the full date treatment and listen through the native sting. Save the
checks beside `assembly-record.json`. Jerami's review and client delivery are
separate from these technical checks.
