# Client Video Storyboard — DIY Smart Code / Bionic Short Re-Edit

Use this packet for a client edit or test edit. Keep Eagle as the asset library,
Premiere as the timeline owner, and the checklist as the human approval gate.

## Diagnosis (from reference frames)

Reviewed actual frames from two of Thomas's shorts (the Bionic video and a
Gemini 3.5 Flash-Lite video). Same template, both videos:

```text
What's already working — keep it:
  - Serif-headline / mono-tag type pairing reads clean and on-brand
  - Structure is genuinely good: cold hook -> open-loop question -> answer
    beats -> payoff -> engagement CTA. Don't rewrite the script, rebuild
    the visual layer under it.
  - Real screen-capture footage (the actual Bionic UI editing snake_game.py)
    is his strongest asset and barely gets used — one static hold, no
    push-in, no hero treatment.

What's actually slow — this is the fix:
  - Almost everything on screen is a flat, code-rendered text/card
    template: solid-color card, headline drops in, hold, cut. No card
    ever moves once it's on screen. That's the "waiting on artificial
    timing" feeling — the eye has nothing to track during the hold, so
    every beat feels like dead air even when the copy is tight.
  - The "device mockups" (the Bionic app card, the fake terminal block in
    IMG_2359) aren't real screen recordings — they're flat vector
    approximations with no bezel, no reflection, no depth. They read as
    illustrations of software, not proof of software.
  - Transitions are either a hard cut or a code-generated glitch effect,
    and the glitch effect stutters/tears (his own words: "clunky").
  - Backgrounds are a static repeating icon texture with zero parallax —
    another source of the "nothing is moving" stillness.
```

The pitch thesis: keep his structure and his real screen-capture footage,
replace every static code-rendered card with a real Envato Elements asset
(mockup frame, textured motion background, tactile B-roll) under simple,
reliable Premiere-native transitions (whip pan, push-in, masked wipe) cut
to the beat of the VO instead of held on a fixed timer. Nothing about the
message changes — only whether it feels built by hand or rendered by a
template.

## Client Brief

```text
Project: Unsolicited test re-edit of Thomas's (@DIYSmartCode) short
         "This Local AI Agent Runs Entirely on Your Machine" (buhA8sYVgRY),
         built to prove editing value and open a paid working relationship.
Client: Thomas / DIY Smart Code (info@smartcode.diy) — prospect, not yet
        engaged. This edit IS the pitch. No more emails until it's attached.
Source media: Original YouTube short, video ID buhA8sYVgRY (confirmed via
        5 reference frames — title card, Bionic screen-record of
        snake_game.py, "not a new tab" card, "edits your local code" fake
        terminal card, hybrid toggle diagram). Marked "Paid promotion" —
        this is sponsored LM Studio work, which is a real service line to
        speak to when we finally reach out (he already does brand
        integrations; he needs the craft to match the deal size).
        Not yet pulled into Eagle — needs sourcing (see Open questions).
Reference video: buhA8sYVgRY is the baseline to beat, and his Gemini
        3.5 Flash-Lite short (also reviewed) confirms this is a repeatable
        template, not a one-off — so the fix should read as a system he
        could apply going forward, not a one-time favor.
Transcript/script: Full VO transcript mapped below in Transcript Decisions.
        Keep his structure and pacing intent; this is a visual rebuild, not
        a script rewrite.
Target runtime and aspect ratio: 9:16 vertical, YouTube Shorts. Original
        reads long for a short (~140s at natural pace); target recut 55-65s
        by tightening the transcript per the decisions table below.
Caption and delivery rules: Burned-in kinetic captions matching his channel
        norm (word-by-word or short-phrase reveal), high-contrast style,
        safe-margin for Shorts UI (avoid bottom ~220px / right-side icons).
Open questions:
  - Can he supply the original project file / raw VO stems + real screen
    capture footage, or only the published MP4? Re-cutting a published MP4
    caps quality (no separate audio stems, no clean plates to push in on).
    For the pitch sample, plan to work from the published MP4 plus fresh
    Envato assets rather than wait on this.
  - Is the voice-cloned ElevenLabs audio reusable as a separate WAV, or do
    we work from the muxed export?
  - Does he want this positioned as "here's a free improved cut of your
    video" or "here's what I'd do differently, want to talk"? Recommend
    the latter — leads with respect, not a rewrite of his channel.
```

## Asset Layout

```text
Eagle / Video Projects / 2026-07-22 DIY Smart Code Bionic Recut
  00 Admin
  01 Source
  02 Transcript Selects
  03 Premiere
  04 Motion Assets
  05 Envato Elements
  06 Exports Delivery
```

Premiere bins:

```text
_ADMIN_REF
01_SOURCE
02_SELECTS
03_TIMELINES
04_GRAPHICS_MOTION
05_ENVATO_ASSETS
06_AUDIO
07_EXPORTS
```

## Pacing & Transition Rules

```text
- No static hold longer than ~1.2s unless it's a hero proof beat (the
  running-game cutaway, the inline-diff cutaway) — those can breathe to
  2-3s because there's real motion on screen to track.
- Every card-to-card cut carries a small camera move: push-in, whip pan,
  or masked wipe — never a locked-off static frame sitting still while
  text animates on top of it. This is the single biggest fix for the
  "artificial timing" feeling.
- Transitions: whip pan blur (~4-6 frames) for same-topic beat changes,
  quick zoom-cut for hero-beat entries, masked slide/wipe for the
  local-vs-cloud toggle beat specifically (wipe direction should follow
  the toggle's own motion, not fight it). No glitch-style transitions —
  that's the effect he flagged as clunky/stuttering.
- Cut to the VO, not to a template timer: land the cut on the stressed
  word in each sentence, not X frames after the card enters.
- Backgrounds get real parallax — Envato motion-texture loops or subtle
  Ken Burns drift, never the flat static icon-pattern fill.
```

## Envato Elements Shopping List

```text
- Realistic laptop/monitor device mockup frames (with bezel + soft
  reflection) to house every screen-capture and fake-terminal beat —
  replaces the flat vector app-window cards
- Circuit-board / server-room motion B-roll (subtle, desaturated, for
  background loops behind text-only beats — replaces the static icon
  texture)
- Hands-on-keyboard / desk-setup B-roll for the cold open and the "runs
  on your machine" beat — grounds "local" in something physical instead
  of just typography
- Data-flow / network-transfer motion graphic (short animated line or
  particle-stream asset) to drive the local-to-cloud toggle beat instead
  of a static diagram card
- Lock / shield icon animation (already has the right idea in his
  "Zero Data Retention" card — swap the flat icon for an animated one)
- Whip-pan and light-leak/transition SFX pack for audio-matched transition
  whooshes (subtle, not glitch)
```

## Transcript Decisions

```text
KEEP = use as-is
TRIM = tighten
SCRAP = remove
CHECK = compare against source
MOTION = needs a graphic, animation, callout, or sourced visual
```

| Time | Transcript | Decision | Clean edit line | Visual or asset note |
| --- | --- | --- | --- | --- |
| 00:00 | "Local models finally got good enough to code for real and LM Studio shipped the agent that gives them hands on your machine." | TRIM + MOTION | "Local models just got hands." | Cold open on the line. Envato hands-on-keyboard B-roll, quick push-in, cut on "hands" — not a title card sitting still. |
| — | "That's Gemma 4 12B writing a working game, zero cloud." | KEEP + MOTION | (same) | His strongest asset — the real Bionic screen-record of snake_game.py running. Push in slowly over the full 2-3s hold instead of a static frame; this is the one beat that earns a long hold because there's real motion (the game) to watch. |
| — | "But the community fired back with four questions the blog won't answer." | KEEP + MOTION | (same) | Same checklist device he already uses well conceptually — rebuild it as a card inside an Envato device-mockup frame with a subtle parallax background instead of the flat icon-texture fill, boxes animate in with a real ease-out, not a snap. |
| — | "So, what is it? Not a new tab in LM Studio. Bionic is a separate app, the agent made for open models. You keep your model runner and you run the agent right beside it." | TRIM | "Not a tab. Bionic's a separate app that sits next to your model runner." | Two sentences collapse into one. Whip-pan from the checklist card into a realistic two-window device mockup (LM Studio + Bionic side by side) — replaces his flat "Bionic / RUN BESIDE IT" card. |
| — | "So, what can it do? It scans your local code base and writes changes you review in line. On open code models like GLM 5.2 and Kimika 2.7 code. Think cursor, but your repo never leaves the laptop." | TRIM + CHECK | "It scans your codebase and writes changes you review inline — think Cursor, but your repo never leaves the laptop." | Confirmed on-screen text reads "GLM 5.2 / Z.AI" and "Kimi K2.7 Code / OPEN WEIGHTS" — use those exact names, not the mumbled transcript guess. His "code" fake-terminal card gets replaced with the real inline-diff screen-record if he can supply it, or a realistic code-editor device mockup with real syntax highlighting if not. |
| — | "And because letting an agent touch your files scares people, it runs in a sandbox safely handling PDFs, slides, and spreadsheets. Every step gets a checkpoint, so one bad edit is one click to undo." | TRIM + MOTION | "It runs sandboxed, and every step gets a checkpoint — one bad edit, one click to undo." | Trust/safety beat. Animated shield/lock icon (Envato) stamps in on "sandbox," undo-arrow animates on "one click" — motion on the icon itself, not just the text. |
| — | "Plus there's an offline voice keyboard, it runs Whisper from Mistral AI on device, so you can dictate into any app in several languages with zero cloud calls." | TRIM | "There's also an offline voice keyboard — on-device Whisper, dictate into anything, zero cloud." | Secondary feature, keep short so it doesn't compete with the two hero features. Quick whip-pan in and out, no new device mockup needed. |
| — | "Here's the part people argue about. Bionic is hybrid, local models run free, and one toggle sends the hard jobs to frontier open models in secure cloud. Those requests aren't retained or trained on. That's zero data retention. Being honest, the cloud side still needs an account with billing." | TRIM + MOTION | "Here's the debated part: it's hybrid. Local runs free; one toggle sends hard jobs to cloud models — zero data retention, but that side needs a billed account." | His existing "This Machine -> Bionic -> Secure Cloud" diagram is conceptually the strongest graphic in the video — keep the structure, replace the static line-connectors with an animated data-flow/particle-stream asset so the toggle actually reads as motion, not a frozen flowchart. Split the "zero retention / billing required" tags into two staggered beats. |
| — | "So, where does that leave us? Answered: separate app, run both, native tools, zero data retention." | KEEP + MOTION | (same) | First payoff to the open-loop checklist — check off items 1-2, real checkmark animation (draw-on, not a snap-in). |
| — | "Still open. Nobody's confirmed if it's open source, if it runs on Linux, if it has sub agents, or what the cloud actually costs." | KEEP + MOTION | (same) | Second payoff — items 3-4 pulse/grey instead of checking. Loop-closer, don't rush the hold here even though the pacing rule says keep it tight — this is the other hero beat. |
| — | "It's on Windows and Apple silicon Macs today, so Linux is the one to watch." | KEEP | (same) | Simple icon row (Windows, Apple, Linux greyed/dimmed on "watch"), quick beat. |
| — | "Download it today at lmstudio.ai." | SCRAP | — | Drop the direct download CTA from the recut — for a pitch sample we're not doing his affiliate/promo work, and it's the weakest visual beat in the original. Replace with the engagement CTA below. |
| — | "A local artificial intelligence agent that edits your files offline. Must have, or would you never let artificial intelligence touch your code unsupervised? Tell me in the comments and subscribe for more local artificial intelligence news." | TRIM | "Would you let an AI agent touch your code unsupervised? Tell me below." | Cut the recap sentence and the generic "subscribe" tag — end on the question over the hands-on-keyboard B-roll from the open, bringing the visual full circle. |

## Storyboard

For a 55-65 second test edit, use 8-15 rows. One row is one meaningful screen
change.

| Timecode | Reference frame | Transcript | Edit move | Asset needed | Source task | Premiere bin |
| --- | --- | --- | --- | --- | --- | --- |
| 00:00-00:03 | Hands on keyboard, push-in, kinetic caption on "hands" | "Local models just got hands." | Cold open, no logo/intro card. Push-in over Envato B-roll, not a static title card. | Envato hands-on-keyboard/desk B-roll | License clip; trim to a clean 3s push-in | 05_ENVATO_ASSETS |
| 00:03-00:06 | Real Bionic screen-record, snake_game.py running, slow push-in | "Gemma 4 12B writing a working game, zero cloud." | Hero beat — hold the real footage, push in over the full 2-3s, no VO ducking | His real screen-capture footage (source from published MP4 if raw isn't available) | Confirm whether Thomas can supply raw capture; otherwise extract cleanest frame range from the MP4 | 01_SOURCE |
| 00:06-00:09 | Checklist card inside realistic device-mockup frame, subtle parallax bg | "Community fired back with four questions the blog won't answer." | Whip-pan in, boxes ease-in empty, title "STILL OPEN?" | Device mockup frame + motion-texture background (Envato) + checklist MOGRT (reused at 00:42/00:47) | Build reusable 4-item checklist MOGRT inside mockup frame | 04_GRAPHICS_MOTION |
| 00:09-00:14 | Two-window realistic mockup: LM Studio + Bionic side by side | "Not a tab. Bionic's a separate app that sits next to your model runner." | Whip-pan from checklist into the two-window mockup, lower-third tag on each | Realistic dual-window device mockup (Envato) | Build once, reuse style for all "app" beats | 05_ENVATO_ASSETS |
| 00:14-00:20 | Inline code diff, real footage if available / realistic editor mockup if not | "Scans your codebase, writes changes you review inline — think Cursor, but your repo never leaves the laptop." | Push-in on diff as VO says "review inline"; caption emphasizes "never leaves the laptop" | Real screen-record preferred; fallback realistic code-editor mockup with correct model tags (GLM 5.2 / Z.AI, Kimi K2.7 Code) | Confirm real footage availability before falling back to mockup | 01_SOURCE or 05_ENVATO_ASSETS |
| 00:20-00:25 | Animated shield/lock icon stamps "SANDBOXED," undo-arrow stamps "1 CLICK UNDO" | "Runs sandboxed, every step gets a checkpoint — one bad edit, one click to undo." | Two quick animated icon+tag beats, staggered not simultaneous | Animated lock/shield icon + undo-arrow icon (Envato) | Match icon style to the checklist MOGRT for consistency | 04_GRAPHICS_MOTION |
| 00:25-00:29 | Voice keyboard dictating into a text field | "Offline voice keyboard — on-device Whisper, dictate into anything, zero cloud." | Fast whip-pan in/out, single cutaway, no extra graphic | Real screen-record if available, else short device mockup | Secondary feature — keep tight, don't let it outrun the hero beats | 01_SOURCE |
| 00:29-00:36 | "This Machine -> Bionic -> Secure Cloud" diagram, animated data-flow line instead of static connector | "Hybrid — local runs free, one toggle sends hard jobs to cloud models." | Masked wipe transition following the toggle's own left-to-right motion; particle-stream animates along the connector on "toggle" | Animated data-flow/particle-stream asset (Envato) laid over his existing diagram concept | Rebuild the diagram with motion on the connectors | 04_GRAPHICS_MOTION |
| 00:36-00:40 | Two staggered tags: "ZERO DATA RETENTION" (animated lock) then "BILLING REQUIRED" | "Zero data retention, but that side needs a billed account." | Two-tag stack, second tag muted/secondary color, staggered entry | Animated lock icon (reuse from 00:20) | Same asset family as the sandbox beat | 04_GRAPHICS_MOTION |
| 00:40-00:44 | Checklist card, items 1-2 check in with draw-on checkmark | "Answered: separate app, run both, native tools, zero data retention." | Checkmarks draw on (not snap), reuse 00:06 checklist asset | Reuse 00:06 checklist MOGRT | None — same instance, new keyframes | 04_GRAPHICS_MOTION |
| 00:44-00:49 | Checklist card, items 3-4 pulse/grey | "Still open: open source, Linux, sub agents, cloud cost." | Items 3-4 pulse or grey-highlight, visually distinct from the answered pair | Reuse 00:06 checklist MOGRT | None | 04_GRAPHICS_MOTION |
| 00:49-00:52 | Windows + Apple icons solid, Linux icon dims/question-marks | "On Windows and Apple silicon Macs today — Linux is the one to watch." | Simple icon row, Linux icon dims in on "watch," subtle parallax bg (not flat) | Platform icon set + motion-texture background | Source clean platform icons | 05_ENVATO_ASSETS |
| 00:52-00:58 | Hands-on-keyboard B-roll returns (mirrors the open), text overlay | "Would you let an AI agent touch your code unsupervised? Tell me below." | End on the question over the same B-roll from 00:00 — visual bookend, no logo/subscribe card | Reuse 00:00 Envato clip | None | 05_ENVATO_ASSETS |

## Review Gate

```text
[x] Client notes and references understood — treated as a prospect pitch,
    not a live brief; assumptions flagged above under Open questions
[x] Transcript mapped
[x] Reference frames reviewed against two of his videos — confirms the
    static-card/glitch-transition pattern is a repeatable template, not a
    one-off, which sharpens the pitch angle
[ ] Asset paths verified — blocked until source media (published MP4, and
    raw capture/audio stems if he'll share them) is pulled into Eagle
[x] B-roll and motion needs marked, including Envato Elements shopping list
[ ] Premiere state inspected read-only — not yet started, do before any
    sequence work
[ ] Timeline mutation approved — do not build the sequence until source
    media is sourced and you've greenlit starting the cut
[ ] Export naming and delivery direction clear — default to the convention
    below unless you want a different one for a pitch piece
```

Use `2026-07-22_diy-smart-code-bionic-recut_v01_review` and
`2026-07-22_diy-smart-code-bionic-recut_final` until Thomas supplies another
convention (he won't — this never reaches him as a request, only as a
finished attachment).

## Next Action

1. Pull the published MP4 (buhA8sYVgRY) into Eagle under the asset layout
   above, and license the Envato Elements items on the shopping list.
2. Come back and I'll inspect Premiere state read-only, build the bins,
   and start assembling the timeline against this storyboard.
3. No outreach message goes out until the recut is cut, exported, and
   attached — per your instruction, this packet is the only thing that
   exists until then.
