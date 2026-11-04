---
name: upwork-hourly-rubric
description: Estimate Catena Media Lineups hours from runtimes or weekly final exports. Upwork is standard; direct Catena invoices are an optional secondary path. Use Mark's stored runtime bands only for this client.
---

# Upwork hourly rubric

For Mark's Catena Media Lineups videos, finished runtime is the required input.
Do not ask for the rate, footage volume, contract length, edit density, or Work
Diary settings when Jerami only wants the estimate.

## Billing path

Upwork is the standard billing path. The Catena invoice and email process is
secondary. Use it only when Jerami chooses direct invoicing for that pass.
Keep each edit on 1 billing path; do not bill the same work through both.

For a direct invoice, read `references/catena-invoice.md`. Keep Jerami's
approved hours separate from the runtime estimate. A change to 1 edit's hours
does not change the stored rubric bands.

## Weekly review

Jerami runs this review on Sunday night or Monday morning before 8:00 AM
Eastern. Use `America/New_York` and state the dates for each pass. The window
runs from the previous Monday at 8:00 AM, inclusive, to the upcoming Monday
at 8:00 AM, exclusive. Before 8:00 AM on Monday, that morning is the cutoff.
Resolve each endpoint in local time so daylight saving changes are handled.
If the cutoff is still ahead, report the results as of the current check.

Use the Google Drive skill and Jerami's `jerami@singleton-systems.com` account.
Find `Lineups Final Exports`, folder ID
`1YCqTWoK2MsHiW7-CiYpfZ0edzSZppnk-`.
Review all videos with upload or revision activity in the window. Do not stop
at 2 videos or use dates in filenames as the only proof. Check file creation
and revision records; a viewed date alone does not qualify an edit. Count each
edit once. Flag an older edit revised this week so it is not charged again
without checking prior billing.

Read each final video's duration from Drive metadata when available. If the
connector omits it, try the Drive API. If needed, measure an existing local
export with `ffprobe`; check its name and exact byte size against Drive and
state that the runtime came from the local copy. Keep fractional seconds in
the report. Pass `mm:ss` to the calculator; do not round across a band boundary.
Leave an unverified duration open instead of guessing.

For this review, return the window, each export link, upload or revision date,
runtime, matched band, estimated hours, and total. Show the addition and
decimal-hour conversion. Separate the total estimate from hours still to log.
Subtract only confirmed time entries for the same edits. Do not count those
entries again when checking the weekly limit. If entries are unknown, state
the pending total as conditional and keep other known logged work separate.

Run:

```bash
node plugins/s-systems/skills/upwork-hourly-rubric/scripts/estimate-catena-hours.mjs 13:41 15:36
```

The calculator reads the canonical bands from
`references/catena-lineups-rubric.json`. Do not estimate from memory or apply
these bands to another client.

## Figma motion

Normal use of the existing Figma motion comps is included in each runtime
estimate. The initial six-hour template build has been charged. Never add it
again automatically.

Treat a new visual package, a new template family, or a major system revision
as separate work only when Catena assigns it. Do not infer those hours from the
video runtime.

## Return

When Jerami provides runtimes, return only each runtime, its estimated hours,
and the total unless he asks for more.

```text
13:41 -> 9:00
15:36 -> 9:30
Total -> 18:30
```

If a runtime falls outside 10:00 through 20:00, say the Catena rubric does not
cover it and ask Jerami to set the estimate. For the weekly limit, add hours
still to log to known logged hours. Count each edit once. If that sum exceeds
30 hours, state the overflow. Do not lower the individual estimates to fit.

This skill estimates workload. It never submits time or invents completed work.
