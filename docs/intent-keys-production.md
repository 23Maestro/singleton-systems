# Intent Keys production

Start with Max’s brief and the [series treatment](../config/intent-solutions/intent-keys/treatment.json).
Use the episode’s own words, artwork, quiz roster and cue times. A brief that asks for a style change needs its exact line and Jerami’s approval in the episode plan.

| Scene | Locked treatment |
| --- | --- |
| Screen lesson | Max in the small upper-right orange frame. Use the E01 helper below and Max’s Manrope captions. |
| Counter | Use E01 Flubs by default. Use E03 Flubs + Keys when the brief asks for keys. Light up the flub count when it goes up. |
| Sheet | Use Max’s actual sheet in the E01 rounded paper frame on the warm gradient. Put Max in the 480 × 400 lower-right frame. Peak the light leak at the spoken cut. Step through the cut to check for an old-shot flash. |
| Quiz | Map every question and answer beat. Use the E02 Pause & Think card and question. Hold 04, 03, 02 and 01 for 30 frames each. Check 3 ticks and the chime. |

## Before motion

Save a versioned `treatment-plan.json` next to the episode builder. The plan binds
the brief bytes and the selected scene treatments. Start from E03’s plan and
supply the new episode’s inputs. The Codex hook and E03 builder check the plan
before building the page. Use the `comps/intent-keys-eNN/` folder and the
`build.py page`, `check`, `render` and `delivery` stages for new episodes.
The hook also checks the named HyperFrames render and Frame.io upload paths.

## Before render

Force-align words to the cut audio. Check the full measured word interval.
Listen when confidence is low. Record every speech gap of 25 frames or more on
the final 30 fps clock. A moving cursor or paper shuffle can still be a speech
gap. Check each join and account for every timer hold. For E03, keep the
measured 5 ms edge fades. A cut through protected material needs the exact
approved frame range. Use the same clock for picture, sound, captions and cards.

From Motion Studio, with HomeSSD checked:

```sh
.venv/bin/python comps/intent-keys-e03/build.py page
.venv/bin/python comps/intent-keys-e03/build.py check
.venv/bin/python comps/intent-keys-e03/build.py render
.venv/bin/python comps/intent-keys-e03/build.py delivery
.venv/bin/python comps/intent-keys-e03/verify_delivery.py
```

A preflight permits a review render. Changed inputs invalidate it. Each
reused render part needs its current inputs, frame count and file hash.

## Before client handoff

Save fresh frame proof and record playback checks against the exact export.
Check each flagged gap and join. Check the reveal, camera, counters, all timer
states and sound. Review the Short’s crop at the top card and keep the terminal
and taught keys visible. Follow the YouTube Short caption plan. E03 uses a
2 px rise with the existing caption treatment.

From Singleton Systems, run `python3 -m tools.intent_keys.production
check-short SHORT_FOLDER` before Short rendering and `measure-short SHORT_FOLDER
EXPORT` with the same module after export.

In HomeSSD’s Intent Solutions `references` folder, save
`<export-stem>-handoff.json` with the versioned preflight, measurements and
fresh frame files as `path` and `sha256` pairs. Add a playback note for each
required check, a decision for each flagged gap and a playback result for each
join. Record Jerami’s approval with its source and the review record’s hash
using the shared approval format. Run `before-handoff EXPORT` with the same
module. Keep past Frame.io shares in the job’s separate delivery record.
