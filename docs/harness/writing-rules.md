# Writing Rules

Canonical source. Generated copies live in `CLAUDE.md`, skill files, and client
repo hooks. Never hand-edit a copy.

## Scope

Applies strictly to artifacts that leave the chat:

Linear issues and docs, GitHub commits and PR bodies, Notion, memory files,
emails, proposals, site copy, client handoffs.

Applies as judgment, not checker output, to internal repo documents:

planning notes, skill instructions, harness docs, examples, review boards,
visual maps, source notes, and files that explain or quote the rules.

Does not apply to conversation. Talk normally in chat.

## Edit instructions

- Correction = edit instruction. A correction fixes the artifact silently. Never log, quote, or restate the correction itself in output.
- No process commentary in deliverables. State facts and results only.
- No preamble, no summary of what you are about to write, no closing recap.
- Deliver the artifact. Nothing wrapped around it.

## Voice

Caveman brevity, full grammar. Short sentences. Plain verbs. Concrete numbers.
Second person when addressing a reader.

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
Writing rules — apply to every artifact leaving this chat (docs, issues,
commits, emails, code comments, filenames). Not to conversation.

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
```

## Sources

- https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing
- https://www.aidetectors.io/blog/how-to-tell-if-text-is-ai-written

Model-specific: ChatGPT overuses em dashes. Claude over-qualifies and adds
caveats. Gemini over-structures into lists.
