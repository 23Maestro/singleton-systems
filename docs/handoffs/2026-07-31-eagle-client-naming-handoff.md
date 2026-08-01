# Eagle client naming cleanup — Claude handoff

Paste the prompt below into Claude. The folder structure has already received its first safe cleanup pass; the next task is item-level naming and verification, one client at a time.

## Current verified state

- Eagle library: `/Volumes/HomeSSD/Video Jobs.library`
- Eagle CLI (canonical workspace copy): `/Users/singleton23/Documents/Development/singleton-systems/plugins/s-systems/skills/eagle-skill/scripts/eagle-api-cli.js`
- Eagle skill: `/Users/singleton23/Documents/Development/singleton-systems/plugins/s-systems/skills/eagle-skill/SKILL.md`
- Google Workspace CLI: `/Users/singleton23/Documents/Development/singleton-systems/scripts/google-workspace-cli.mjs`
- Josh ingest contract: `/Users/singleton23/Documents/Development/singleton-systems/docs/portfolio/2026-07-30_josh-thank-you-ingest-handoff.md`
- Tag recovery snapshot: `/Users/singleton23/Documents/Development/singleton-systems/docs/handoffs/2026-07-31-eagle-tag-recovery.md`
- Eagle 4.0.0 is live at `127.0.0.1:41596`.
- All 253 items are untagged. `/Volumes/HomeSSD/Video Jobs.library/tags.json` has empty `historyTags` and `starredTags`. Do not add tags.
- No item, folder, or source file was deleted.
- Thirteen items remain unfiled. Most appear to be shared music/SFX, but several
  are ambiguous (`unn 1`, `BRoll_VSL`, a Robinhood logo, and a screenshot). They
  were deliberately not moved without visual/client verification.

```text
Content Editor
  Shared SFX
  Jacob Hill
    Bulldog Brawl
    Delivery
  Josh Sayre
    Admin
    Source
    Transcript
    Premiere
    04_GRAPHICS_MOTION
      01_FULL_SCREEN_STORY
      02_NUMERIC_PROOF
      03_UI_AND_CALLOUTS
      04_TEXTURE_AND_TRANSITIONS
    Delivery
    ACV_02 Transcript Selects
  LegalProSports

AI Consultant
  Super Senses
    Docs
    Transcripts
    Source
    References
    Links

Portfolio
  Wemby Test Edit
    Planning
    Footage
    Brand
    NBA Assets
    Motion + SFX
    Review
```

`ACV_02 Transcript Selects` is empty. It is deliberately retained for Jerami to inspect and delete later. Do not delete it.

## Naming contract

Use obvious nouns a busy editor can understand without remembering a taxonomy.

- Every filename stays under 45 characters, including its extension.
- Prefer `<client>_<job>_<asset>_v##.ext`.
- For timeline-ordered clips, add a two-digit order after the job: `<client>_<job>01_<topic>_v01.ext`.
- Keep topics to 2–4 plain words taken from the real event, script, or footage.
- Use letters, numbers, underscores, and hyphens only.
- Version only deliverables or changing work. Do not invent versions for immutable source footage.
- No `Selects`, `Inbox`, `final-final`, camera-generated dates, or unexplained IDs.
- Number folders only when order carries meaning. Josh's `04_GRAPHICS_MOTION` tree is the approved exception and reusable model.
- Client language wins. Sports use event/play names; talking heads use transcript topics; consulting uses deliverable names.
- Never rename or mutate a client-owned Google Drive source. Stage local/Eagle names separately.
- Never add tags.

Examples, not mandatory templates:

```text
JS_TY01_cold-calling_v01.mp4
JH_BB01_off-ball-footwork.mov
LPS_WC01_final-whistle.mov
WEMBY_block-replay.mov
SS_brand-style-guide.url
SFX_keyboard-typing.wav
```

## Current cleanup signal

| Folder | Items | Over 45 chars | Obvious noise |
|---|---:|---:|---:|
| Shared SFX | 25 | 7 | 4 |
| Jacob Hill | 24 | 0 | 2 |
| Josh Sayre | 69 | 7 | 1 |
| LegalProSports | 18 | 7 | 0 |
| Super Senses | 10 | 1 | 1 |
| Wemby Test Edit | 95 | 12 | 5 |

## Claude execution prompt

> Continue the Eagle cleanup using the verified state and naming contract in this handoff. Stay inside `/Volumes/HomeSSD/Video Jobs.library`; do not redesign the system or create another taxonomy.
>
> Use the Eagle CLI at `/Users/singleton23/Documents/Development/singleton-systems/plugins/s-systems/skills/eagle-skill/scripts/eagle-api-cli.js`. Confirm `get_app_info` reports the exact library before every mutation session.
>
> Process one client at a time in this order: Josh Sayre, Jacob Hill, LegalProSports, Super Senses, Wemby Test Edit, Shared SFX.
>
> For each client:
>
> 1. Read the actual folder hierarchy and item metadata through the CLI.
> 2. Identify names over 45 characters, camera/download names, duplicates, ambiguous IDs, and files whose current folder does not match their role.
> 3. Return a compact table: `item_id | current | proposed | reason | folder`.
> 4. Keep the proposal human and client-specific. Compress each reason to 8–12 words.
> 5. Wait for Jerami's approval before item renames or moves. Do not infer file contents from a vague filename alone; inspect metadata or preview when needed.
> 6. After approval, mutate only the listed IDs. Re-query every changed ID and verify its exact name, folder membership, extension, and item count.
> 7. If replacing a folder structure, move and verify its items first, then rename the emptied old folder `ACV_<old-name>`. Never delete an `ACV_` folder; list it for Jerami's review.
>
> Preserve this Josh motion design exactly:
>
> ```text
> 04_GRAPHICS_MOTION
>   01_FULL_SCREEN_STORY
>   02_NUMERIC_PROOF
>   03_UI_AND_CALLOUTS
>   04_TEXTURE_AND_TRANSITIONS
> ```
>
> This tree classifies reusable visual function, not project status. Do not flatten it, rename its numbered children, or replace it with tags.
>
> Google Drive is source intake, not the naming authority. Use `/Users/singleton23/Documents/Development/singleton-systems/scripts/google-workspace-cli.mjs` only to inspect linked Drive context; do not rename, move, overwrite, or download large client files unless Jerami explicitly asks.
>
> Stop after each client with: verified changes, unchanged exceptions, and every `ACV_` folder awaiting review. Do not delete assets, folders, Drive files, Premiere projects, or tag-recovery evidence.
>
> After all six folders, audit the 13 unfiled items as a separate queue. Preview
> before classifying them; never route an ambiguous asset from its filename alone.

## Status of automation

This is a locked convention plus a pending automation, not a finished ingest-naming skill. The current Eagle skill provides safe API access and ownership boundaries. The Josh handoff proves one repeatable ingest contract. Harden a dedicated skill only after this client-by-client audit exposes the few naming decisions that actually repeat.
