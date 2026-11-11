# Website routing and checks

Start at the [website guide](README.md), then choose the page's Lane.
Cerebral selects tools. The Lane guide and task record decide the work's owner.
Both general editing and recruiting-page requests use Content Editor.
Recruiting is a focused offer within that Lane.

## Source chain

[CODEX](../../CODEX.md) and [Claude](../../CLAUDE.md) point here.
The `website-editing` route selects Content Editor, including recruiting.
The `website-consulting` route selects AI Consultant. Both use
`s-systems:singleton-systems`, which reads CODEX's operations links.
The broad `website-offer` route uses Writing Review until the page is clear.

The [registry contract](../../config/cerebral-registry.json) supplies seed data.
The [runtime hook](../../.codex/hooks/cerebral_singleton_guard.py) reads Supabase.
It has no local registry fallback. A local fixture pass and live parity are
separate checks. Plugin source parity is a third check.

## Check map

| Change | Check and limit |
| --- | --- |
| Route or hook | `check:cerebral`, `check:cerebral:hook-routing`, `check:cerebral:registry`; exercises local source and fixtures |
| Live registry | `verify:cerebral:registry`; compares Supabase rows and source revision |
| Skill source | `check:skills`; installed parity requires `check:skills:installed` and the approved release flow |
| Logo assets | `check:brand`; checks approved files and references |
| Public offer | `check:public-offers` and `test:video-launch`; check their inputs and current build first |
| Consulting page | `test:pages`; covers page and delivery contracts |
| Search | [Search checks](seo-aeo-search-instrumentation.md); live metrics remain in search tools |
| Preview | [Preview config](../../config/website-preview.json); verify hosted pages and each form's mode |

Run these through `npm run`. Use the [review contract](../harness/codex-rabbit.md)
for code changes. Read the relevant Next.js guide before changing website code.
A passing test does not approve a publish, client record move or deletion.

## Finish the alignment

Use the owning tasks for dated findings and fixes:
[client records](https://linear.app/23maestro/issue/23M-407),
[guide and source links](https://linear.app/23maestro/issue/23M-408), and
[closeout integration](https://linear.app/23maestro/issue/23M-330).
[Website SEO](https://linear.app/23maestro/issue/23M-380) owns search-gate fixes.
[System alignment](https://linear.app/23maestro/issue/23M-328) holds live registry gaps.
Check live registry rows after each sync. Test editing, recruiting, consulting
and shared website prompts. A shared request must not assume consulting.
