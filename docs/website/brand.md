# Shared website brand

Use **Singleton Systems** for the brand and **Jerami Singleton** for the person.
[Site identity](../../app/site.ts) owns the coded name, origin and public profile
links. [Writing rules](../harness/writing-rules.md) own voice and app formatting.

## Brand by Lane

- [Content Editor](content-editor/README.md): show the edit, what Jerami did and the next step.
- [AI Consulting](ai-consulting/README.md): show the work problem, the checked fix and its limits.

Both use the same approved identity. A page's look can serve its audience without
creating a second logo system. An internal tool test is not a client case study.

## Asset source

[Brand checks](../../scripts/check-brand-assets.mjs) own the approved asset list.
The wordmark uses outlined paths. Keep the SVG view box and glyph count intact.
The reference render is [the black wordmark](../../public/brand/ssystems-logo-wordmark-black-2640x1040.png).
The [favicon source](../../public/brand/singleton-systems-favicon.svg) owns app icons.
Run `npm run check:brand` after an asset or logo-reference change.

Use [shared layout](../../app/layout.tsx), [global styles](../../app/globals.css)
and each page's current styles to find rendered design rules. Do not infer a new
brand system from the [earlier design plan](../harness/2026-07-22-app-design-brand-plan.md).
That note is historical and says it does not set the brand system.

## Change check

Check the affected pages at desktop and phone widths. Keep approved source art
and proof linked. A file check proves asset rules; a rendered check proves layout.

## Story source

Use [Story and career](../story-and-career/README.md) for identity claims.
Visual research can start while facts are checked. Final brand claims need
verified sources. The planned guide and 4 S* icon concepts do not replace
the approved assets until reviewed.
