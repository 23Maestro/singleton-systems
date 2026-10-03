# FaithTalk TV context

## Media locations — September 30 (s-systems:video-storage, HomeSSD contract)

- Canonical masters live in Eagle (Content Editor library) under 745 Productions / FaithTalk TV / Episode 1 / FINISHED: v3_FaithTalkTV_INTRO (MUOJ6LGUYW6J9), v3_FaithTalkTV_Outro_A (MUOJ6LMCJSURZ), v3_FaithTalkTV_Outro_B (MUOJ6LQHF1NBR). Checksums match the renders.
- Generated media lives flat under /Volumes/HomeSSD/Generated/FAITHTALK/: renders/ (intro v23 4K-pass picture, milestones/, outro-r3-passes/{black,white,source-figma-*}, outro-r2-connect-seed.mp4, outro-r2-connect-soil-push-4k.mp4, MIGRATION-2026-09-30.txt with SHA-256 per file), previews/ (intro review MP4, outro r3 A/B previews, timing sheets), audio/ (VO stems, final intro and outro mixes).
- scripts/faithtalk-outro-r3-assemble.sh reads passes from and writes its build to HomeSSD (override with FAITHTALK_MEDIA). New HyperFrames renders: `-o /Volumes/HomeSSD/Generated/FAITHTALK/renders/…`; extracted-frame cache /Volumes/HomeSSD/Generated/hyperframes/cache/extracted-frames.
- Internal SSD now holds only the project (compositions, notes, tests) and assets/ (composition-linked sources incl. Envato, kept for swaps). Internal renders/ and snapshots/ were deleted 2026-09-30 after scripts/faithtalk-media-links-check.py passed a simulated delete (293 links, 0 offline) and a negative control (18 offline when needed files were withheld). Run that check after any move or delete.

## Intro v23 and outro r3 timing — September 29

- Timing is transcript-led: each super starts on its trigger word in the VO v1 stem. A Manim timing sheet checks sync; HyperFrames stays the picture engine.
- Mountain holds to 22.0 s so "they must get out of the way" finishes over it.
- Supers run about 2 s each: Real People 22.0 (Ep 1 STORIES, tighter angle), Real Faith 24.0 (stock), Real Stories 26.0 (original worship stock), The Real Embrace 28.1 (Ep 1 prayer, close angle only, no internal cut), Of Jesus 30.1–32.0.
- Logo starts 32.0 s and runs 4.5 s. The approved v6.1 animation lands at +3.96 s; only its final hold is trimmed. It must fully land before 36.5 s.
- Intro stays 36.5 s. Ep 1 wide seg4 stays behind the logo. No Singleton Systems mark on any client render.
- Outro r3: Story 16.5165–28.495 s (12 s), Prayer 28.495–36.5365 s (8 s). Next Week unchanged until the Episode 2 teaser arrives.
- Outro r3 is on hold until Episode 2 arrives. Then do it in one pass: Figma retime (Story 12 s, Prayer 8 s, Prayer entrances re-paced so the URL holds 2–3 s), black/white exports keyed in, Ep 2 teaser under Next Week, final mix.
- Figma r3 retime done 2026-09-29. Story A 135:1091 / B 175:1150: timeline 11.978633 s (359 fr), keyframes untouched. Prayer A 135:1148 / B 175:1244: timeline 8.041367 s (241 fr), every keyframe remapped old→new: 0→0, 1.0→0.75, 3.6→2.8, 4.5→3.2, 5.4→4.0, 6.3→4.4, 7.3→5.3, 10.01→8.041 (piecewise linear; invert to restore r2).
- Story/Prayer frames restored 2026-09-30 after white export (empty fill, photo visible). Black pass was: frame fill solid black, "Photo · replaceable" hidden (Story 135:1092, 175:1151; Prayer 135:1149, 175:1245). Original frame fills were empty. White pass = white fill; restore after = empty fill + photo visible.
- Figma export_video fails on 12 s at 4K; Story exports at 10.01 s then holds the last frame locally (nothing animates after 7.45 s). Exports conform 30→29.97 frame-for-frame. Superseded 2026-09-30: Jerami exported all four black passes from Figma desktop at full length (Story 12.03 s). Sources in renders/outro-r3/source-figma-desktop/, conformed masters in renders/outro-r3/black/{storyA,storyB,prayerA,prayerB}.mov (359/241 fr, 29.97, ProRes HQ). White pass still to export.
- Connect r3 retime (Figma 127:1139) done 2026-09-30, transcript-led. Seed plays ×1.25 (5.0→4.004 s, 120 fr) at composite time; cards start outro frame 120; cards timeline 12.5125 s (375 fr). Cards-time shifts vs r2: Headline 0.80–1.80→0.40–1.20; Detail +0.60 (@MyFaithTalk rises on "on our", outro 6.85–7.75); Facebook +1.85; Instagram +1.65; TikTok +1.75; YouTube +2.47; Destination +1.89; host lower thirds +1.53 / +1.24; photo push spans 12.5125 s. Animation-style offsets shifted the same. VO triggers (outro s): stay connected 3.98, Facebook 9.39, Instagram 10.15, TikTok 11.38, YouTube 13.41. Timing sheet: renders/timing-sheets/outro-connect-timing-sheet.mp4 (scripts/faithtalk-timing-sheet.py). Connect black/white 4K exports still needed.
- Connect host row 2026-09-30: three host cards at 0.82 scale in an auto-layout row "Credits · 3 hosts" (127:1178: x96 y842, 1728×184, centred, 146 px gaps set and approved by Jerami 2026-09-30; cards span x 56–1864, so card borders and the first emblem sit up to 40 px outside the 96 px title-safe inset while all names and roles stay inside it); old Credit position 1/2/4 placeholders removed: Bishop Coffman 151:1436 (in 10.50), Amanda Crabb 151:1470 (10.85), Aaron Crabb 247:1222 (11.20, lands 12.09 of 12.5125). All sit directly in Credits frame 127:1178. Connect black exported 2026-09-30 (renders/outro-r3/black/connect.mov, 375 fr). First Connect black/white exports had soft host cards (moved to renders/outro-r3/superseded-soft-cards/): rescale() on the card instances hides and strands their focus-in LAYER_BLUR track, so cards held blur 6. Fixed by writing an explicit effects track on each card (LAYER_BLUR index 2: 6→0 across its own entrance); verified sharp in a 1080 export. Readback of effect tracks on rescaled instances is unreliable — verify blur by render. Re-exported 2026-09-30 (blk2/white2): renders/outro-r3/{black,white}/connect.mov, 375 fr, cards sharp, key test clean. All r3 Figma passes complete; every Figma frame restored (empty fill, photo visible). Remaining for Episode 2: seed ×1.25 + key all scenes over footage, Ep 2 teaser under Next Week, outro VO/music mix, 4K A/B masters.
- Transcript alignment pass 2026-09-30 (Manim sheet renders/timing-sheets/outro-story-prayer-nextweek-timing-sheet.mp4): Prayer already on its words. Story A/B: "your story" underline −0.90 s (lands on "story" ~19.5), "Submit your story:" +0.35 s (on "Send it to" 22.0). Next Week 135:1224: "Next Week on" +0.72 s (37.9, on "next week"), FaithTalk lockup +1.12 s (38.99–39.70, on "Faith Talk"). Story/Next Week passes re-exported via API (renders/outro-r3/source-figma-api; Story B white at medium quality after 3 high-quality server failures).
- r2 backgrounds were the source clips ungraded; r2 froze Prayer/Next Week backgrounds on their last frame. r3 stretches each background to fill its scene instead. Assembly: scripts/faithtalk-outro-r3-assemble.sh [nextweek_bg] (Ep 2 teaser = first arg). Outro mix r3: renders/vo/faithtalk-outro-r3-mix-atsc-24lkfs.wav (phrase duck, bed −30).
- Outro r3 4K masters built 2026-09-30: renders/faithtalk-outro-r3-A-4k.mov and -B-4k.mov (1395 fr, 46.5465 s, H.264 CRF 14 + 24-bit PCM BE, mix −24.0 LKFS). Next Week still uses the placeholder preview clip (04-nextweek-intro-logo-scene) until Episode 2; swap with scripts/faithtalk-outro-r3-assemble.sh <ep2.mp4>, then re-mux the mix.
- Episode 2 plan (Jerami 2026-09-30): Prayer scene in outros A and B swaps the misty stock for episode angles: Bishop Coffman close-up praying, then cut to the wide three-shot. Ready: PRAYER_CLOSE=<clip> PRAYER_CLOSE_IN=<s> PRAYER_WIDE=<clip> PRAYER_WIDE_IN=<s> [PRAYER_CUT=120] scripts/faithtalk-outro-r3-assemble.sh <ep2-teaser.mp4>. Shots play at real speed, Lanczos 4K. Default cut = frame 120 (outro 32.5 s, "and we want to agree with you"). Tested with Ep 1 seg3 (close-up from 23.0 s) + seg5 (wide): keys clean. Framing: pick a close-up where the face sits above the quote line (quote sits at ~40% height).
- Client notes 2026-09-30: Amanda Crabb is HOST; Bishop Coffman (JC) and Aaron Crabb are CO-HOST; order JC, Amanda, Aaron. Connect extended to 13.621 s in Figma (conformed 408 fr, +33 fr = +1.101 s) so the host cards hold ~1.5 s. New cuts: Story 17.62, Prayer 29.60, Next Week 37.64; Amanda's last word 40.85. VO stem: HomeSSD audio/faithtalk-outro-vo-r4-connect-plus1.wav (1.101 s silence inserted at 15.4 s).
- Outro ending plan (Darzell + Jerami): two teaser versions sent, Family Man Affair (8.74 s, 4K) and Despair to Revelation (11.01 s, 1080p→4K). Clip audio from 40.85; 36.54→Next Week cut until then holds the clip's first frame; music keeps playing under the clip, lowered; then 0.5 s fade to black, approved logo animates on black (lands +3.96 s), 0.5 s hold, 0.5 s fade to black. Totals ≈ 55.0 s (Family Man) and 57.3 s (Despair). Waiting on: Connect white export, Adobe Podcast audio for both clips, Suno tracks at those lengths, Darzell's confirmation.
- Intro v23 approved by Jerami ("butter").

## Outro round 2 — client notes, September 27

Client: the outro feels too fast and "too PowerPoint". Longer, closer to the intro's pace. Voiceover will run under the outro.

- Runtime: Connect 15 s, Story 10 s, Prayer 10 s, Next Week 10 s. About 45 s total.
- Connect opens with intro scene 1 (0–5 s): seed rise, gold-led trace, white outline. The outline fades plainly 4.4–5.0 s into empty soil; no shell morph, no crossfade to scene 2. Connect cards animate from 5 s over the same soil plate.
- Pacing: each element takes about 0.9–1.1 s to enter, then 0.5–0.6 s before the next. Everything lands by 7.5–8 s of a 10 s scene; about 2 s full-copy hold. Text still waits until its backing has passed it. Hard cuts between scenes.
- Premium touches: slow background push on the soil scene only, starting after the seed fades. Soft focus-in text on every line in both variants. Word-by-word headline reveal on Prayer only. A gold hairline is held until the Envato preview motion study; if used, Prayer and Story only.
- Connect: add the YouTube emblem (red play button, white wordmark, sized to match the other icons). Host lower thirds replace the credits; role lines ("HOST OF FAITHTALK", "BISHOP") set italic.
- URLs: faithtalktv.com is the official domain (Darzell).
- Next Week: animation unchanged; extend to 10 s.

### Variant A and Variant B

- Variant A: the first-pass Story and Prayer, unchanged apart from the round-2 pacing.
- Variant B: Story and Prayer only. No top gradient; clean band top at y789. Yellow field full width under the band. Green solid 100% from x0 to 360, then an eased fade to clear by x900 (stops 100/92/70/40/15/0%). Chosen to read as light across the panel, not two blocks.
- Delivery: two full outros, A and B, identical except Story and Prayer.

## Latest correction: reference-first alignment

Jerami reviewed the Concept 02 pass and rejected treating it as a completed reference match. Follow [OUTRO-ALIGNMENT-PLAN.md](OUTRO-ALIGNMENT-PLAN.md) and [FaithTalk TV in Linear](https://linear.app/23maestro/project/faithtalk-tv-f713f2b595e0). The production board is a draft. Measure the PDF source, fix and visually verify one scene at a time, then animate. Page 7 has four directional cards; studio alternatives, masters and motion studies are separate. Preserve the approved intro seed and locked TV typography. Earlier structural/safe-area checks do not establish visual fidelity. Start with 23M-197, then Connect 23M-198. No whole-board redesign.

## Current client direction — after September 24 call

Source of truth: [call notes](CALL-NOTES-2026-09-24.md), dictated by Jerami after meeting Darzell and Marco.

- Intro: Concept 01. Preserve the praised seed/drawing sequence. Revise the music toward a happier inspirational lift, replace white-background hands with a natural human/prayer moment, replace empty mountains with a person ascending or at the summit without a hiking-backpack look, and add the supplied closing logo. Script and voiceover may change.
- Outro: Concept 02, following the client-approved PDF with a green bottom gradient and centered text. This supersedes the modern, neutral-overlay Figma direction below for the production outro.
- Preserve modern Figma concepts for future use. Maintain existing large broadcast typography and editable CTA/next-week requirements. Polish the approved direction through restrained motion.
- Marco plans to provide logos, exact colors and Illustrator source files later today. Upwork details and final script/voiceover are pending. Client confidence was confirmed verbally; contract receipt is not confirmed.
- Final website and social destinations may change after client confirmation. Current card copy remains draft. Jerami requires all replacement footage and final delivery to be 4K.
- Production Figma page: [Concept 02 Production](https://www.figma.com/design/v6sFPJsZp0u3CqyjYy50yV?node-id=24-745). Three sections: approved reference, production sequence, reusable masters. Four independent editable CTA components plus closing and studio frames; the modern page remains intact.
- [Client revision review board](references/client-revisions/index.html): two mountain choices, two natural-hands choices and the selected `Soaring Strings (Fade Out)` music direction. Native 4K listing specs are checked. Footage review is sampled. No replacement footage or music has been inserted into the intro yet.
- [Story-card motion study](https://www.figma.com/design/v6sFPJsZp0u3CqyjYy50yV?node-id=26-911): isolated animated copy; editable production masters remain separate. A 960×540, 10 fps diagnostic was rendered and sampled at 0 / 0.4 / 0.8 / 1.4 seconds. This is not a delivery master or a completed outro.
- Follow-up selection: Jerami favors the sunrise silhouette with open arms above the clouds (Envato XYRV92T). Preserve the warm cinematic treatment; the clearly visible daylight summit figure is not the preferred direction. The natural dinner-table hands close-up remains viable. Search next for a warmer church or congregation setting with joined hands. Envato broadcast reference screenshots received positive feedback.

## Preserved modern Figma exploration — before client call

Before the client call, Jerami requested less green wash and fewer boxes while preserving the larger broadcast typography. The resulting exploration is preserved for future work. It is no longer the production direction for this client's outro.

- Active `FT_CMP_OutroFrame` (8:544): eight Action × Tone variants retained. Band uses a soft neutral gradient. Field uses a translucent left column over full-frame imagery. Next Week has no outer video border or corner box.
- URL pills became plain destination lines. Prayer and story line breaks were balanced without changing the words.
- Font sizes, fonts, line heights and text styles were unchanged across 202 text nodes. The 80/56/52/40 px sizes remain at the 1080 master scale.
- Lower thirds, studio backdrop and legacy LAB designs remain intact. Brand-screen wash is neutral.
- All 57 visible text nodes across 15 active scenes were checked inside the 96 × 54 px graphics-safe inset. This is a design check; final motion and network delivery validation remain separate.
- Figma scene lab: https://www.figma.com/design/v6sFPJsZp0u3CqyjYy50yV?node-id=3-60
- Safe-area reference: https://tech.ebu.ch/publications/r095. BCAP guidance concerns advertising supers, not a universal show-title font size: https://www.asa.org.uk/resource/superimposed-text.html. Retain Jerami's agreed type sizes.

## Glossary

- Timing sheet: a Manim-rendered review video of the edit timeline: voiceover words, scene lengths and transcript-led triggers on one track, played against the VO. Timing reference only; picture stays in HyperFrames.
- Trigger: the spoken word that starts a scene or super (e.g. "people" starts Real People).
- Lane: the FaithTalk TV Figma file at figma.com/design/v6sFPJsZp0u3CqyjYy50yV. Concept 02 Production is current; Client Lane preserves the earlier modern exploration.
- Super: white intro title over footage ("Real People", "Of Jesus"). Words pop in one at a time.
- CTA card: outro directional card. Types: Connect, Story, Prayer, Next Week.
- Lower third: host or guest name plate. Host carries the FaithTalk emblem.
- Backdrop card: in-studio screen with the FaithTalk lockup and network bug.
- Brand screen: FaithTalk lockup over the congregation with the emerald wash.
- Network bug: Greater Love TV mark. Client supplies the file.
- Outro frame: the one fixed outro screen. Superseded: the outro is now four timed scenes, about 45 s.
- Action: one step in the Outro frame: Connect, Pray, Share Your Story, Coming Up Next Week.
- Video frame: the window in Coming Up Next Week that plays the next-episode clip.
- Tone: CTA variant axis. Band = text on footage over an emerald band. Field = text on a full emerald area with a photo.
- Cinematic / Branded: FT Theme modes. Cinematic follows storyboard Concept 01, Branded follows Concept 02.

## Historical decisions — superseded where they conflict with the client call above

- 2026-09-24: Lower thirds are approved as built (glass plate, thin gold edge, gold divider).
- 2026-09-24: Too many boxed cards. Non-lower-third graphics move toward broadcast packages such as The Minimal (type on footage, gradient bands, hairlines).
- 2026-09-24: Reduce the dark look. Add emerald variants across the card families.
- 2026-09-24: "Broadcast ready" means both the technical spec and the network look. Technical: 90% title-safe, broadcast-legal white #EBEBEB and black #101010, on-air type sized to the BCAP HD rule (see the type-size decision). Look: full-bleed emerald fields, a persistent corner bug, bands instead of boxes. Jerami: this takes the lane from 7/10 to 10/10.
- 2026-09-24: CTA cards get a Tone variant axis. Band = photo-led with an emerald gradient band behind type. Field = full-bleed emerald with a gold hairline and a photo window. Every card type ships in both tones.

## Client brief (Intro + Outro Project Brief)

- Team: Marco (brand direction), video/edit role open. Network: Greater Love TV (GLTV), shown small but required.
- Timing: first drafts September 21, first episode airs October 5, 2026.
- Broadcast: 16:9, 29.97 fps, 4K preferred, 1080p minimum.
- Idea: mustard seed faith. Seed → Growth → Life → Mountains → Impact. The seed begins the story; it is not a one-off graphic.
- Voiceover pairs with picture. Working lines, not final: "One seed of faith has the ability to move mountains." "Real stories. Real faith. Real people embracing Jesus."
- System: faith emerald, gold, black, warm neutrals. Brand pillars: Connect. Grow. Give. Cinematic, clean, premium broadcast. Avoid dated church TV, sermon bumpers and stock inspiration clichés.
- Reference ecosystem: current faith talk shows for pacing and lower thirds; K-LOVE as a functional reference for prayer and story sharing, not a visual template.
- Intro: about 30 s, strong hook, seed into real people, few lines, land on FaithTalk TV with GLTV.
- Outro: 60–120 s. The next step after the show, not a credits roll. Social channels and landing page, prayer action (phone line and online request), testimony action ("Let Your Faith Talk"), editable Coming Up Next Week, clean brand end with GLTV. Cards and contact details update per episode.
- On-set screen: complementary backdrop behind the hosts; subtle mountain, sunrise or growth elements; restrained motion; never competes with the people on camera.
- Guardrails: premium, warm, human; no science-animation seed; light on copy; authentic ministry footage first, stock must blend; intro, outro, on-set screen, lower thirds and CTAs form one visual system.
- Starting point: 1–2 creative directions with visual world, seed behaviour, sample frames, voiceover approach and the nature-to-people transition.
- 2026-09-24: The outro is one Outro frame (Option A). The footage or emerald area stays for the full outro. Only the Action text changes: Connect, Pray, Share Your Story, Coming Up Next Week. "Connect. Grow. Give." stays at the bottom. The FaithTalk lockup and the Network bug stay in the corner. Figma: one component with an Action variant.
- 2026-09-24: Coming Up Next Week shows a Video frame with the next-episode clip, as in the Envato broadcast example.
- 2026-09-24: Coming Up Next Week follows Envato broadcast-053. The clip fills almost all of the screen with a thin emerald border. A translucent emerald column holds a gold "COMING UP NEXT WEEK" kicker, a white guest or topic headline, and a day-and-time line.
- 2026-09-24: On-set screen is 80% the current Backdrop card (centered FaithTalk lockup and Network bug) and 20% brief-driven restraint: mountain sunrise imagery with only a slow mist drift. It stays quiet behind the hosts.
- 2026-09-24: On-air type follows the BCAP HD text-height rule: 30 TV lines standard, 26 minimum, measured on letter height at 1080. With Geist (x-height 0.53, cap height 0.71): mixed case 56 px standard, 48 px minimum; all caps 42 px standard, 37 px minimum. Styles: Super 112, Card Headline 80, Destination 56, Card Body 48, Card Label 42 (caps), L3 Name 56, L3 Role 40 (caps). Title-safe stays at 90% (96 x 54 px).
- 2026-09-24: Client wants 4K. Type uses the 28-line midpoint of the BCAP range (26 minimum, 30 standard), measured at 1080 lines and doubled for 3840 x 2160. Sizes at 1080 / 4K: Super 112/224, Card Headline 80/160, Destination 56/112, Card Body 52/104, Card Label 40/80 (caps), L3 Name 56/112, L3 Role 40/80 (caps). Figma keeps the 1920 x 1080 master and exports at 2x; HyperFrames renders at 3840 x 2160 with the 4K values.
- 2026-09-24: v2 built in the Lane. FT_CMP_OutroFrame (8:544) has 8 variants (Action x Tone). The v1 CTA cards live in LAB until approval.
