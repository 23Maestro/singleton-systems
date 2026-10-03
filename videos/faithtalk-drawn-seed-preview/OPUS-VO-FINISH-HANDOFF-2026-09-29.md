# FaithTalk VO finish handoff — 2026-09-29

## Objective

Picture-lock the latest 4K exports and finish the processed intro/outro voiceover against them. Do not rebuild the motion, rewrite the recorded copy, time-stretch the speaker, or overwrite the source WAVs. Create new edited VO stems, then use Premiere as the single finishing engine for sync, music ducking, mix, and final export.

## Verified picture masters

- Intro: `renders/faithtalk-intro-v21-36_5s-4k.mp4` — 3840×2160, 30 fps, **36.500 s**.
- Outro A: `renders/faithtalk-outro-r2-A-46_5s-4k.mp4` — 3840×2160, 30000/1001 fps, **46.5465 s**.
- Outro B: `renders/faithtalk-outro-r2-B-46_5s-4k.mp4` — same timing; only the lower-panel treatment differs. Build one outro VO edit and apply it unchanged to both variants.
- Outro picture boundaries: **16.5165 / 26.5265 / 36.5365 s**. These are Connect → Story → Prayer → Next Week.

## Verified VO sources

- Intro: `/Users/singleton23/Downloads/Faith talk intro-esv2-speech-80p.wav` — 48 kHz mono PCM, 39.820771 s, SHA-256 `03a2e9d08a6db6e1285bcddb4c26af597b6a04a780de594d969eb1027595775a`.
- Outro: `/Users/singleton23/Downloads/Faith talk outro -esv2-speech-80p.wav` — 48 kHz mono PCM, 45.602542 s, SHA-256 `6d08de1a0fc40aa93f5876bd109b524bd1050db27e1b775ee0949107f74f70f2`.
- Local Whisper medium.en transcript set: `/Volumes/HomeSSD/Generated/FAITHTALK/audio/transcripts-2026-09-29/`. Use the `*-dtw.json` files for word timing and the matching SRT/TXT files for review. Transcript wording is a timing guide; the recording is authoritative.

## Edit plan

**Intro:** use source **00:00.750–00:37.250** for an exact 36.500-second stem. This removes only outer padding, preserves every spoken word, avoids speed change, and leaves roughly 0.275 s after the final spoken word. Adjusted phrase endpoints are approximately **11.69 harvest / 22.67 way / 28.55 stories / 33.17 Jesus / 36.25 Faith Talk**. Check those against the existing picture; do not move the picture unless a spoken keyword visibly misses its matching state.

**Outro:** preserve the intentional long holds; they support graphic reveals. Ripple-delete a total of approximately **3.7874 s before “Here’s a look…”** so that phrase begins at the locked Next Week cut, **36.5365 s**. Start by retaining 0.5 s of the 1.915-second head pad, then shorten the 3.734-second Connect→Story gap until “We want your faith to talk” lands at **16.5165 s**. Tighten only remaining dead air—not syllables—to bring the Prayer copy into the **26.5265–36.5365 s** window. Keep at least 0.10–0.20 s between spoken thoughts. Let the finished stem hold silence through 46.5465 s.

## Review gate

Export VO-only WAVs first and play them against all three picture masters. Verify first/last words, the three outro cuts, URL intelligibility, no clipped breaths, and identical sync on A/B. Then add music/ducking. Do not apply a final loudness target until Greater Love TV’s delivery spec is confirmed; keep true peaks below -1 dBTP for review.
