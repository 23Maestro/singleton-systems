# Consulting website

Help people see which work problem Jerami can help them solve.

## Offer and audience

Use the [consulting offer](../../operations/ai-consulting/offers.md),
[audience](../../operations/ai-consulting/audience.md) and
[growth rules](../../operations/ai-consulting/growth.md). Use the
[client index](../../operations/ai-consulting/clients.md) for record links.

Workflow-cleanup outreach is shelved until its process is reviewed. Existing
website copy does not restart that campaign. Describe the actual problem and
checked result. Label internal examples as internal work. Use the
[shared brand](../brand.md) and [writing rules](../../harness/writing-rules.md).

## Page and code map

| Page | Source | Offer source |
| --- | --- | --- |
| `/AI-consultant` | [Consulting page](../../../app/AI-consultant/page.tsx) | [Display and price data](../../../lib/site-offers.ts) |
| `/tampa-ai-consultant` | [Local page](../../../app/tampa-ai-consultant/page.tsx) | Same display and price data |
| `/ai-workflow-session` | [Session page](../../../app/ai-workflow-session/page.tsx) | [Intake values and labels](../../../lib/ai-workflow-offers.ts) |

Keep display prices, intake labels and JSON-LD in agreement. Do not copy a price
list into these docs. A local source is not proof of a production release.

## Search intent

These pages serve consulting and local workflow-help searches. Each page owns
its metadata and structured data. Keep the editing homepage focused on editing.
Use the [search checks](../seo-aeo-search-instrumentation.md) and
[form map](../forms-and-records.md).

Technical changes go to Website Growth. The short service outcome stays in
Asana AI Consulting. Use the [website owner rules](../README.md#who-owns-the-work).
