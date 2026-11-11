# Website search checks

Use the [website guide](README.md) and choose the page's Lane before changing SEO.

## Page intent

| Page | Search purpose | Source |
| --- | --- | --- |
| `/` | Editing services | [Editing page map](content-editor/README.md) and [site keywords](../../app/site.ts) |
| `/recruiting-highlights` | Sports highlights for parents | [Editing page map](content-editor/README.md) |
| `/AI-consultant` and `/tampa-ai-consultant` | Workflow and AI help | [Consulting page map](ai-consulting/README.md) |

Each page owns its title, description, canonical URL and structured data in code.
Keep offer prices and claims aligned with the same Lane's approved source.
Keyword research and content tasks stay in Asana. Technical changes use Website Growth.

## Indexing and proof

[Site identity](../../app/site.ts) owns the production origin.
[Sitemap](../../app/sitemap.ts) owns listed pages; [robots](../../app/robots.ts)
owns crawler instructions. Check rendered URLs after deployment.
Google Search Console and Bing Webmaster Tools own indexing and search metrics.
Submit the production `/sitemap.xml` there.

[Layout](../../app/layout.tsx) reads `GOOGLE_SITE_VERIFICATION` and
`BING_SITE_VERIFICATION`. These must be set in the target deployment environment.
A local file does not prove account verification or a deployed tag.

Track each Lane's pages and queries separately. Use impressions, clicks,
position and visits to the right inquiry page. Lighthouse measures technical
health; it does not prove search rank, leads or sales.

## Checks

- `npm run audit:seo-aeo` runs the [live contract check](../../scripts/seo-aeo-live-check.mjs).
- `npm run audit:lighthouse` checks the deployed site's technical health.
- `npm run audit:seo-stack` runs both.

The live contract checks the approved editing title and headline.
Its browser tests accept the editing page and reject the old consulting title,
a wrong headline and a preview canonical URL. Run `check:client-intake` for
those regression checks.
The current script checks the homepage and shared search files; it does not
prove each Lane page's metadata. Check those pages too when they change.

The recorded July 2, 2026 Lighthouse scores were 98 performance and 100 for
accessibility, best practices and SEO. Those are historical results, not a fresh audit.
Keep new results linked from the owning task with the checked URL and date.
