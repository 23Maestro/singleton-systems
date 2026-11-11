# Editing website

Help people see Jerami's editing work and choose the next step.

Recruiting highlights are a focused Content Editor offer. Their page, SEO and
intake belong to this Lane. Service outcomes stay in Asana Content Editor.

## Offer and audience

Use the [editing offer](../../operations/content-editor/offers.md),
[audience](../../operations/content-editor/audience.md) and
[growth rules](../../operations/content-editor/growth.md). Use the
[client index](../../operations/content-editor/clients.md) for record links.

Brand copy should name the footage, finished edit and review process. Link proof
of Jerami's role. Keep sports work separate from claims about recurring income.
Use the [shared brand](../brand.md) and [writing rules](../../harness/writing-rules.md).

## Page and code map

| Page | Source | Offer source |
| --- | --- | --- |
| `/` | [Homepage](../../../app/page.tsx) and [site metadata](../../../app/site.ts) | [Video offers](../../../lib/video-offers.ts) |
| `/video-inquiry` | [Inquiry page](../../../app/video-inquiry/page.tsx) | Same video offer values |
| `/recruiting-highlights` | [Recruiting page](../../../app/recruiting-highlights/page.tsx) | Page copy and [intake rules](../../../lib/recruiting-intake.ts) |

Code owns the values the page renders. Change prices, labels, form values and
structured data together after the offer is agreed. A local page may differ
from production; verify the deployed version before quoting it as live.

## Search intent

The homepage serves editing searches. [Site keywords](../../../app/site.ts)
are the coded source. Recruiting pages serve parents seeking sports highlights.
Keep consulting search terms on consulting pages. Use the
[search checks](../seo-aeo-search-instrumentation.md) and [form map](../forms-and-records.md).

Technical changes go to Website Growth. The short service outcome stays in
Asana Content Editor. Use the [website owner rules](../README.md#who-owns-the-work).
