# Writing Rules

Canonical source. Generated copies live in `CODEX.md`, `CLAUDE.md`, skill files, and client
repo hooks. Never hand-edit a copy.

## Scope

Applies to every reviewable non-code artifact created here:

Markdown and MDX, Linear issues and docs, GitHub commit and PR bodies, Notion,
memory files, emails, cover letters, proposals, briefs, client handoffs,
captions, site copy, public HTML/pages, visual/source notes, and review docs.

The checker scans Markdown everywhere, plus plain-text, email, and HTML review
artifacts. It does not scan source code, generated bundles, code blocks, or
conversation. Talk normally in chat.

## Edit instructions

- Correction = edit instruction. A correction fixes the artifact silently. Never log, quote, or restate the correction itself in output.
- No process commentary in deliverables. State facts and results only.
- No preamble, no summary of what you are about to write, no closing recap.
- Deliver the artifact. Nothing wrapped around it.

## Voice

Caveman brevity, full grammar. Short sentences. Plain verbs. Concrete numbers.
Second person when addressing a reader.

## Human review limit

Jerami's review surface should usually stay between 300 and 500 words. This is
a judgment check, not a word-filling target. Use fewer words when the decision
is simple.

If a review artifact truly needs more than 500 words, keep its written entry
point short and create a dated interactive HTML map under
`public/decision-maps/<date>-<slug>/index.html`. Add it to the Decision Maps
page for preview. Use large type, few nodes, and step-by-step disclosure. The
map must compress the work. Do not hide a long memo inside panels.

Raw transcripts, source records, and machine contracts may stay long. Keep
them behind links. Jerami should see the decision, current truth, next action,
and review gate first.

For Linear, keep an issue body short enough to scan without scrolling when
possible. Store the workflow in its owning skill or linked proof. Do not copy
an operating manual into a task.

Rhythm target, from the Ginain transcript:

- "You go to school, you get one job, you work at that company forever."
- "I could ask a 15-word question and it gives me 300 words back."
- "It's only as good as the person driving the machine."

No tells in any of those.

## Banned

**Words.** delve, tapestry, testament, underscore, pivotal, crucial,
meticulous, intricate, showcase, foster, garner, landscape, vibrant, robust,
seamless, unlock, empower, elevate, streamline, leverage, utilize, facilitate,
commence, demonstrate, additionally, enhance.

**Negative parallelism.** "not just X but Y", "not X but Y", "X rather than Y".

**Copula dodging.** Write *is* and *has*. Never "serves as", "features".

**Hedging.** Every claim qualified reads machine-made. Take the stance.

**Three-item rhythm.** Stacked adjectives and rhythmic triples.

**Vague attribution.** "experts argue", "reports suggest", "efforts are ongoing".

**Puffery.** "marking a pivotal moment", "nestled in the heart of".

**Formatting.** `**Thing**: explanation` as a list header. Boldface scattered
through body text. Title Case In Headings. Em dashes on more than ~30% of
sentences.

## Hook payload

Copy this block verbatim into a client repo at `.claude/writing-rules.md`.
Fires on `UserPromptSubmit` via `cat`. Keep it near 150 tokens.

```text
Writing rules — apply to every reviewable non-code artifact created here:
Markdown, Linear docs, GitHub and Notion copy, memory, emails, cover letters,
proposals, briefs, handoffs, captions, site copy, public HTML/pages, and
visual/source notes. Not to source code, generated bundles, code blocks, or
conversation.

Correction = edit instruction. Fix the artifact silently. Never restate the
correction.
No process commentary. No preamble, no recap. Deliver the artifact only.

Banned: delve, tapestry, testament, underscore, pivotal, crucial, meticulous,
intricate, showcase, foster, garner, landscape, vibrant, robust, seamless,
unlock, empower, elevate, streamline, leverage, utilize, facilitate, commence,
demonstrate, additionally, enhance.
Banned: "not just X but Y", "not X but Y", "X rather than Y".
Banned: "serves as", "features" — write is, has.
Banned: hedging, three-item rhythm lists, vague attribution, `**Bold**:` list
headers, Title Case Headings.

Short sentences. Plain verbs. Concrete numbers. Take the stance.
Jerami review: aim for 300-500 words maximum. Use fewer when possible.
If more is needed, create a dated interactive Decision Map and keep the written
entry point short. Do not paste an operating manual into Linear.
```

## Sources

- https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing
- https://www.aidetectors.io/blog/how-to-tell-if-text-is-ai-written

Model-specific: ChatGPT overuses em dashes. Claude over-qualifies and adds
caveats. Gemini over-structures into lists.
