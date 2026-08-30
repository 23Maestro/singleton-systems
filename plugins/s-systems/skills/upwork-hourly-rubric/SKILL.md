---
name: upwork-hourly-rubric
description: Estimate Catena Media Lineups hours when Jerami provides one or more finished video runtimes. Use the stored Mark runtime bands; do not use them for another client.
---

# Upwork hourly rubric

For Mark's Catena Media Lineups videos, finished runtime is the required input.
Do not ask for the rate, footage volume, contract length, edit density, or Work
Diary settings when Jerami only wants the estimate.

Run:

```bash
node scripts/estimate-catena-hours.mjs 13:41 15:36
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
cover it and ask Jerami to set the estimate. If the estimated total plus known
logged hours exceeds the 30-hour weekly limit, state the overflow. Do not lower
the individual estimates to fit the limit.

This skill estimates workload. It never submits time or invents completed work.
