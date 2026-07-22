# Client Video Storyboard

Use this packet for a client edit or test edit. Keep Eagle as the asset library,
Premiere as the timeline owner, and the checklist as the human approval gate.

## Client Brief

```text
Project:
Client:
Source media:
Reference video:
Transcript/script:
Target runtime and aspect ratio:
Caption and delivery rules:
Open questions:
```

## Asset Layout

```text
Eagle / Video Projects / YYYY-MM-DD Project Name
  00 Admin
  01 Source
  02 Transcript Selects
  03 Premiere
  04 Motion Assets
  05 Exports Delivery
```

Premiere bins:

```text
_ADMIN_REF
01_SOURCE
02_SELECTS
03_TIMELINES
04_GRAPHICS_MOTION
05_AUDIO
06_EXPORTS
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
| 00:00 |  |  |  |  |

## Storyboard

For a 60-90 second test edit, use 8-15 rows. One row is one meaningful screen
change.

| Timecode | Reference frame | Transcript | Edit move | Asset needed | Source task | Premiere bin |
| --- | --- | --- | --- | --- | --- |
| 00:00-00:07 |  |  |  |  |  |  |

## Review Gate

```text
[ ] Client notes and references understood
[ ] Transcript mapped
[ ] Asset paths verified
[ ] B-roll and motion needs marked
[ ] Premiere state inspected read-only
[ ] Timeline mutation approved
[ ] Export naming and delivery direction clear
```

Use `YYYY-MM-DD_project-slug_v01_review` and
`YYYY-MM-DD_project-slug_final` until the client supplies another convention.
