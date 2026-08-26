# 2026-07-28 — Homepage Fix List

## The one insight

**The site is already about video. Only the top of it refuses to say so.**

"What I Fix" is raw footage, edit notes, timestamps, export specs, B-roll,
timeline. Both case studies are video. The body tells the truth. The hero says
"operators and small teams" and hides it.

Fix the top to match the body. That's the whole thing.

## What's doing too much

| | |
|---|---|
| Page height | 8 screens |
| First portfolio appears | screen 4 (48% down) |
| Sections that say "here's what's messy" | 3 |
| Audiences named in the hero | 5 |
| Panels built for the folder exhibit | 3 (visitor sees 1) |

---

## To do — in order

### 1. Hero says video
`app/page.tsx:808`
> Current: "I help operators and small teams clean up the stuff that slows work
> down: scattered notes, follow ups, files, and repeat steps."

Name video. Name one audience, not five.

### 2. Kill "CEO of Singleton Systems"
`app/page.tsx` — under the name in the hero.
Solo operator with a CEO title, talking to people who are the CEO because
there's nobody else. Replace with what you actually do.

### 3. Fix the five-segment hedge — 3 places
- `app/page.tsx:70` — "creators, coaches, course teams, small teams, and service businesses"
- `app/page.tsx:83` — same list, inside the FAQ (this one is schema.org, Google reads it)
- `app/page.tsx:88` — "Does Singleton Systems work with video teams?"

### 4. Footer still says "teams"
`app/page.tsx:1118` — "Workflow sessions for teams that need less repeated work."

### 5. Collapse 3 setup sections into 1
- "How It Starts" / Where the Work Gets Stuck
- "What I Fix" (4 cards)
- "Where I Can Help" (4 cards)

All three say the same thing. Keep the strongest, cut two.
**Moves portfolio from screen 4 to ~screen 2.**

### 6. Move the workflow video up
`/portfolio-2-ssystems.mp4` — currently ~screen 5.
Real screen recording, "140+ Videos. 6 weeks. One Operator." Best asset on the
page. A video guy shouldn't make people read 4 screens before seeing video.

### 7. Shrink case study scaffolding — keep the claims
Keep both. Keep "200+ course video files" and "140+ highlights in 6 weeks" —
only numbered portfolio you have.
Cut the Before / Build Path / Ship Ready tab machinery around them.

### 8. Trim nav
Three process items — What I Fix, How It Works, plus How It Starts on the page.
Too much methodology for someone who hasn't decided they care.

### 9. Later — real screenshot over mockup
The `Course_Videos (messy)` folder is built, not captured. A blurred real
screenshot beats a designed one. You did this work for real. Low priority.

---

## Not doing

- Not building a portfolio "part 2" — `/ai-workflow-portfolio` already exists
- Not cutting case studies before new portfolio exists
- Not a rebuild. All of the above is reversible.

## Guard

`npm run check:brand` runs in `npm test` and `prebuild`. Don't point anything at
a logo outside the approved list. Don't edit the wordmark SVGs.
