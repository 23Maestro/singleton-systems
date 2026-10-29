# John Bold Beliefs: cuts and captions

Date: 2026-10-17. Owner: Jerami. Client: 745 Creative, Pastor John. Lane: Bold Beliefs.
Asana: Edit Pastor John → Cut Bold Beliefs.

## Problem statement

John has 6 Bold Beliefs talks. They are raw iPhone takes. Each has dead air,
a false start or a spoken aside, and no captions. Jerami needs them cut tight
without clipping a single word, then captioned in the style he just approved
for John's Prayer videos.

Earlier cut passes trimmed every pause hard. That pace risks cutting the tail
of a word or splitting a sentence. Jerami wants smooth cuts: words land whole,
and long pauses keep a short, even breath.

## Solution

Find the 6 sources, transcribe them, and build a cut plan from word timing.
The plan removes outtakes and shortens each long pause to exactly 0.6 seconds.
It never cuts inside a word and never touches a short pause inside a sentence.

Premiere assembles the cuts in a new project for the 6 videos. It converts the
iPhone HDR footage to Rec.709 SDR with its automatic tone map, as it did for
Prayer, and exports clean 1080×1920 masters. The John caption lane then adds
Opus-style captions with Soft Lavender `#D6C7F7` on every video.

## User stories

1. As Jerami, I want all 6 Bold Beliefs sources found and checked before work starts, so that I know nothing is missing.
2. As Jerami, I want missing sources downloaded from the intake map's Drive links, so that the batch is complete.
3. As Jerami, I want each source matched to its Drive file and title, so that names stay consistent across the batch.
4. As Jerami, I want every take transcribed, so that cuts and captions use the same words.
5. As Jerami, I want word timing taken from the audio itself, so that cuts and captions do not drift.
6. As Jerami, I want doubtful words listed with both transcript readings, so that I can decide the ones that matter.
7. As Jerami, I want my word decisions saved with the lane, so that a rebuild keeps them.
8. As Jerami, I want false starts at the head removed, so that each video opens on John's first real line.
9. As Jerami, I want John's own asides removed, so that "I think that was a little too robotic" never airs.
10. As Jerami, I want every pause longer than 0.6 seconds shortened to exactly 0.6 seconds, so that the pace feels even.
11. As Jerami, I want shorter pauses inside a sentence left alone, so that John's phrasing stays natural.
12. As Jerami, I want no cut to land inside a word or before its final sound ends, so that no word is clipped.
13. As Jerami, I want audio cuts free of clicks, so that the edits sound smooth.
14. As Jerami, I want the cut list shown before anything renders, so that I can check what goes.
15. As Jerami, I want the cuts built in Premiere, so that I can open the project and adjust any cut by hand.
16. As Jerami, I want one new Premiere project holding the 6 sequences, so that the batch lives in one place.
17. As Jerami, I want the agent to start Premiere's MCP panel itself, so that I do not have to set it up.
18. As Jerami, I want the HDR footage converted to Rec.709 SDR, so that color matches the Prayer videos.
19. As Jerami, I want 1080×1920 vertical output at the source frame rate, so that it matches the 745 delivery defaults.
20. As Jerami, I want clean masters with no captions burned in, so that the captions can be redone without a re-edit.
21. As Jerami, I want captions in the approved John Prayer style, so that both series look like one system.
22. As Jerami, I want Soft Lavender `#D6C7F7` as the spoken-word color on all 6 videos, so that Bold Beliefs has one consistent accent.
23. As Jerami, I want caption phrases to follow John's pauses and punctuation, so that they read the way he speaks.
24. As Jerami, I want captions timed to the cut video, so that no word appears before John says it.
25. As Jerami, I want each export checked for whole words, pause length, format and color, so that I review only finished work.
26. As Jerami, I want small review copies I can play on my phone, so that I can approve from anywhere.
27. As Jerami, I want the earlier pause-trim plan replaced by the 0.6-second rule, so that one rule governs the batch.
28. As Jerami, I want Compassion's audio peak checked, so that its +0.1 dBTP source peak does not clip in the export.
29. As Jerami, I want the batch recorded in the 745 contract and Asana, so that the next session picks up the state.
30. As a later agent, I want the lane rerunnable from one command, so that a fix means one rerun.

## Implementation decisions

- Sources. The 6 takes are already on MediaSSD in John's Bold Beliefs incoming folder: Compassion, Freedom, Grace vs Willpower, Resistance, Shame + Forgiveness and Starting Over. The intake map's Drive IDs stay the fallback for any missing file. Each is HEVC, HLG BT.2020 HDR, about 60 fps with a variable average, recorded with a −90° rotation tag and 23 to 34 seconds long.
- Words. Whisper medium.en is the text source. Transcripts from 2026-09-30 already exist beside the sources. The earlier edit map's CHECK rows become listened text decisions in the lane.
- Timing. MMS CTC forced alignment places the final text on the audio, as in the approved Prayer batch. Whisper attention timing is not used for cuts or captions.
- Cut planner. A new lane module turns aligned words, outtake ranges and the pause rule into a keep list. A gap between a word's speech end and the next word's start is long when it exceeds 0.6 seconds. A long gap keeps 0.3 seconds after the last word and 0.3 seconds before the next. Shorter gaps stay whole. Every cut sits in silence between two words. A guard after each word's speech end protects trailing sounds. The guard length is tuned on the first proof.
- Outtakes. Head false starts, spoken asides and tails after the last line come from the transcript and the earlier edit map's SCRAP rows. They are listed in the lane config, not inferred silently.
- Assembly. A new Premiere project holds one 1080×1920 sequence per take. The agent opens Premiere by computer use, opens the MCP panel, scrolls down and clicks start. It then places each keep range through the MCP using tick timebase, not rounded seconds, and reads every write back. MCP undo is not trusted.
- Color. Each sequence uses Rec.709 with Premiere's automatic tone map, matching the Prayer sequences' recorded settings.
- Audio. Premiere applies a short audio crossfade at every cut. No other mixing is in scope beyond keeping peaks below 0 dBTP.
- Export. H.264 masters with no captions, named `745_PJ_BoldBeliefs_<Title>_CLEAN_HD_<date>.mp4`. Review exports go to HomeSSD through the storage gate. Jerami moves approved masters to MediaSSD's finished folder.
- Captions. The John caption lane in motion-studio becomes multi-lane. A Bold Beliefs lane config reuses the `opus-poppins-shadow` profile, John's Poppins SemiBold font and the Prayer layout and phrase rules. Its accent is Soft Lavender `#D6C7F7` on all 6 videos.
- Records. The 745 contract gains `clients.pastor_john.lanes.bold_beliefs.captions`, mirroring Prayer. Asana tracks review state.

## Testing decisions

- A good test checks what Jerami would hear or see. It checks whole words, pause length and output format. It ignores internal names and intermediate files.
- Seam 1 is the cut plan. A unit test feeds aligned words and outtake ranges to the planner. It asserts that no cut falls inside a word or its guard, that every gap over 0.6 seconds becomes exactly 0.6 seconds, that shorter gaps stay unchanged, and that listed outtakes are gone.
- Seam 2 is each finished export. The batch check forced-aligns the exported audio against the kept text. It asserts that every kept word aligns whole and in order, and that no inter-word gap exceeds 0.6 seconds plus one frame. It also asserts 1080×1920, Rec.709 tags, source frame rate, peaks below 0 dBTP, and captioned frame and audio identity with the clean master.
- Prior art: the Opus caption template's unit test, and the Prayer lane's per-video check, which compares frame counts and audio correlation and saves a contact sheet.

## Out of scope

- Bold Beliefs cover, opening title and series label. The Build John templates task owns those.
- Loudness normalisation, noise reduction and music.
- Ben, Eric, Marquee Walk and any other John series.
- Uploading, client messages and delivery.
- Changing the approved Prayer captions or exports.

## Further notes

- The 745 contract assigns captions to Opus Clip except John's Prayer caption lane. This spec extends that exception to Bold Beliefs on Jerami's 2026-10-17 instruction.
- The 2026-09-30 edit map trimmed pauses to 0.15 seconds. Jerami's 0.6-second rule replaces it.
- Compassion's source peaks at +0.1 dBTP. Check the export waveform there.
- Compassion's hook line has a CHECK on "compassion" versus "compassions". Listen before captioning.
