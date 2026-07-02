# SEO/AEO Search Instrumentation

## Owner Surface

Singleton Systems website code owns the technical hooks.

Google Search Console and Bing Webmaster Tools own account-side verification,
indexing status, impressions, clicks, average position, and sitemap submission.

## Live Site

```text
https://singleton-systems.com
```

## Verification Hooks

The site emits verification meta tags during build when these Vercel environment
variables are present:

```text
GOOGLE_SITE_VERIFICATION
BING_SITE_VERIFICATION
```

Use Vercel production env vars for these tokens, then redeploy production.

## Submit

Submit this sitemap in both tools:

```text
https://singleton-systems.com/sitemap.xml
```

## Track

Use Google Search Console and Bing Webmaster Tools to track:

```text
indexed pages
impressions
clicks
average position
queries
Core Web Vitals
```

Primary query lane:

```text
workflow cleanup consultant
AI workflow consultant
video workflow consultant
Premiere Pro workflow systems
Notion workflow dashboards
creator operations systems
course video migration workflow
sports recruiting video production workflow
```

Do not treat Lighthouse as ranking portfolio. Lighthouse proves technical health.
Search Console and Bing Webmaster Tools prove search visibility over time.

## Repeatable Audit

Run the live SEO/AEO contract check:

```bash
npm run audit:seo-aeo
```

Run Lighthouse against production:

```bash
npm run audit:lighthouse
```

Run both:

```bash
npm run audit:seo-stack
```

Current production Lighthouse evidence from July 2, 2026:

```text
Performance: 98
Accessibility: 100
Best Practices: 100
SEO: 100
```

The SEO/AEO live check verifies:

```text
metadata
canonical
Open Graph
Twitter card
JSON-LD
visible AEO content
robots.txt
sitemap.xml
favicon/icon routes
no initial Cal.com embed
hydrated Vercel Speed Insights script
```
