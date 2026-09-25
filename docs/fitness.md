# Fitness

Personal `/fitness` app. Next.js renders three layouts: phone below 700px,
iPad/tablet at 700–1199px, and desktop at 1200px and above. Convex stores
plans, exercise records, set logs, equipment, media sources, and morning check-ins.

## Session

Four scheduled days: Monday, Tuesday, Thursday, Saturday. Reserve 45 minutes,
including warming up and settling down. The initial return-to-training plan
has five movements with two working sets each; finishing earlier is fine.
Weights start unset and must be entered before logging a dumbbell set.
Reps on unilateral movements are per side.

Each tap records a completed set. Save succeeds before the check appears.
Undo is available until the session is finished. Skips earn no points.
The rest timer uses a saved deadline and survives refresh. Concurrent edits
are rejected using a workout revision; a failed request can be retried safely.

The next split follows the last finished session containing completed sets.
An interrupted session stays available to resume. After finishing, upcoming
unstarted sessions alternate from the actual log. No muscle recovery estimate
or physiological fatigue score is inferred. Codex reviews partial completion,
loads, reps, and spacing when preparing the next week.

## Sunday, in Codex

1. `npx convex run fitness:summary` — inspect actual completed work.
2. `python3 scripts/fitness-sources.py` — inspect coachgreen.pt's current feed.
   Use `--reel URL --download` for a selected source. Credentials are read from
   macOS Keychain, service `com.singleton-systems.scrapecreators`.
3. Review the caption and actual footage, required equipment, and relevance.
   Discovery alone is not medical vetting. Keep a stable plan and avoid
   replacing every movement just because a new reel exists.
4. `node scripts/fitness-week.mjs --week YYYY-MM-DD` — prepare a Monday-based
   preview in ignored `output/fitness/`. Inspect it alongside the logs.
5. Run again with `--publish` to save. Existing prepared sessions are preserved.
   To publish a deliberately edited draft, call `fitness:publish` with the
   draft's JSON payload and the current global revision.

Planning runs here in Codex, not in a Convex cron. No unattended Sunday job is
installed. The user participates in the weekly review.

## Access and media

Fitness, Finances, and Dashboard open without a passphrase or login cookie.
`FITNESS_BACKEND_TOKEN` still connects the server proxy to Convex HTTP actions;
backend credentials remain server-side. The browser does not need a token.
See `docs/personal-endpoints.md` for the shared deployment contract.

The morning stretch embeds the original Supple Warriors YouTube video above
the workout. Mobility groups the remaining videos into body-region cards using
each media record's `area`; additional videos appear in the matching card.
Players render inline and lazy-load, with a collapsed playback-help link.
Reel embeds can be blocked by Instagram or device privacy settings.
Video files downloaded for review remain local; they are not rehosted.
Illustrations are original orientation graphics, not form demonstrations.

## Check

`node --test tests/fitness/*.test.mjs`
`npm run typecheck`
`npm run lint`
`npm run build`

Test all three layouts and real saving/resuming through the browser.


## Exercise images — September 18, 2026

Visual-only mapping lives in `lib/fitness/images.ts`; local images are served through Next Image. Matched photos show Start and Finish together in the active session. Existing multi-position illustrations remain intact. Lineup thumbnails show one image. No external API calls, subscription, credits screen, source labels, or new navigation are added.

Current coverage: 10 of 12 exercise entries and 8 of 9 equipment entries. Standing band curl, mini-band lateral walk, and mini-band equipment have no verified matching asset; show the existing text cues. Exercise selection, logs, loads, and scheduling are unchanged.

Provenance and individual image licenses are recorded in `docs/fitness-image-sources.json`. The photo-library catalog currently contains 876 exercises, 873 with at least two image references; image pairs still require pose-order and equipment review before adding them.
