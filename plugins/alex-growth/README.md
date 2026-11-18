# Alex growth

Choose 1 next step for video editing or AI consulting. Keep the business stage
apart from each lead's sales stage. Use the current offer and real client facts.

**Source package.** Installation and release are separate steps.

## Read first

- [Use the guide](skills/alex-growth/SKILL.md).
- [Check the sources](SOURCE-COVERAGE.md).
- [Review the cases](REVIEW.md).

## What is checked

The source map has 66 rules and source leads. It links to 19 original PDFs
(297 pages recovered) and 10 videos from Alex's channel. 9 videos have captions.
Only the listed pages and caption windows were read. Audio was not checked.

15 rows have a PDF and a checked video window. 22 have a PDF only. 20 have
a video only. 9 have an original lesson link whose teaching is still unchecked.
These counts cover this map; they do not measure all of Alex's work.

Stage 1–9 PDFs are saved. Stage 0 and stage-specific video matches still have
gaps. 13 named paid playbooks were not recovered. The map names each gap.

## How it fits

Gift owns sample copy. Outreach owns history and dates. The current repository
guide owns offers and record homes. This package keeps no client database.
It does not start the shelved AI outbound path.

Raw PDFs and captions stay in the HomeSSD research archive. The package has
source links, page numbers, time windows and file hashes. It has no credentials.

## Build notes

The portable root manifest follows the current
[Codex plugin guide](https://developers.openai.com/plugins/build/plugins).
The skill follows the [skill guide](https://developers.openai.com/plugins/build/skills).
Codex finds the skill under `skills/`. Gift and Outreach are workflow links,
not invented package dependencies. There is no MCP server or hook.

Run from the repository root:

```sh
PYTHONDONTWRITEBYTECODE=1 python3 plugins/alex-growth/scripts/check_sources.py
PYTHONDONTWRITEBYTECODE=1 python3 -m unittest discover -s plugins/alex-growth/scripts -p 'test_*.py'
```

Add `--archive PATH` to the first command to check the recovered source bytes
and caption ranges. These checks validate evidence pointers. They do not prove
the guide will always give sound advice. The case review records that limit.
