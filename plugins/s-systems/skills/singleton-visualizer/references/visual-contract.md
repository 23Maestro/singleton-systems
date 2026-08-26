# Visual Contract

Create a visual only when ownership, sequence, or three or more handoffs are
harder to understand in prose.

## Owner Semantics

- Linear: active decision, priority, owner, due date, next move.
- GitHub: branches, commits, pull requests, and implementation evidence.
- Supabase: queryable runtime facts and routing registry.
- Eagle: portfolio and client assets.
- Next/Vercel: active-week review surfaces.
- LikeC4: reviewed system architecture.

## Review Shape

Use 5-9 meaningful nodes, short edge labels, current owner names, large readable
type, and explicit uncertainty. A dated HTML comp is for human review; LikeC4
is for durable architecture. Never turn either into another task database.

Use a dated interactive HTML comp when Jerami's review would exceed 500 words.
Publish it under `public/decision-maps/<date>-<slug>/index.html` and add its
preview to the Decision Maps page. Keep the page intuitive for a tired reader.
Reveal one step at a time. Do not bury the same long document inside cards.

Validate the source and visible output. Check mobile readability, text overflow,
and generated artifacts before calling the map complete.
