# Writing Rules

Canonical source. Generated copies live in `CODEX.md`, `CLAUDE.md`, skill files, and client
repo hooks. Never hand-edit a copy.

## Scope

Applies by default to all client-facing and internal prose we author or rewrite
for a reader:

Markdown and MDX, Linear issues and docs, Asana projects and tasks, Google Sheets
and other spreadsheet cell text, documents, GitHub commit and PR bodies, Notion,
memory files, emails, cover letters, proposals, briefs, client handoffs,
captions, site copy, public HTML/pages, visual/source notes, and review docs.

Keep emails, Upwork proposals, documentation, reviews, and Asana or Linear
updates short and plain. These rules apply before sharing or writing them.
Source code, schemas, generated bundles, code blocks and conversation stay outside
this prose gate. Preserve machine timestamps, durations and video timecodes.
Talk normally in chat.

Client-supplied text, verbatim quotations and speech transcriptions are source
material. Creating a transcript file does not make its words our writing.
Preserve those words. Summaries, recommendations and rewritten copy we author
from that source still receive the writing pass.

When capturing supplied text, the agent records its origin in
`<file>.writing-origin.json` before the text-writing tool returns. Use
`origin: "client-source"`, a `source` description, and `contentSha256` for the
exact bytes. The checker excludes that source while the hash matches. Changed
content needs a fresh source record or classification as authored copy. The
agent owns this record; Jerami does not maintain it. Unmarked prose is checked.
For source excerpts inside an authored resource, wrap only the supplied passage
with `<!-- writing-source:start -->` and `<!-- writing-source:end -->`.
Do not mark our own analysis or rewrites as source material.

## Edit instructions

- Correction = edit instruction. A correction fixes the artifact silently. Never log, quote, or restate the correction itself in output.
- No process commentary in deliverables. State facts and results only.
- No preamble, no summary of what you are about to write, no closing recap.
- Deliver the artifact. Nothing wrapped around it.

## Voice

Caveman brevity, full grammar. Short sentences. Plain verbs. Concrete numbers.
Second person when addressing a reader.

## Human pass

- Use plain, brief writing at about a third-grade reading level by default.
  Use common words, short sentences, and one clear action at a time. Cut words
  the reader does not need. Keep full grammar and required technical precision.
  Example: "Wait for Sam’s call. Offer 4 short clips for $250."
- Use numerals in authored copy, including counts, fractions and compound terms.
  Write `3-peat`, `3-run`, `1/3` and `1 year`. Preserve verbatim source speech.
- Show human clock times in 12-hour format with AM/PM, such as `2:04 PM`.
  Omit needless seconds. Keep the same date, time, and time zone. Do not guess
  a missing AM/PM or time zone. Preserve exact machine timestamps, durations,
  video timecodes, quotes and source capture; a video timecode is not a clock time.
- Rewrite a supplied draft only when requested. Preserve verified facts, scope, attribution,
  causal ownership, sequence, dates and names. Preserve quotes and client speech.
  Do not replace source-backed writing with a generic reconstruction.
- Run the swap test on hooks, landing pages, proposals, and portfolio copy. If
  another company could use the line unchanged, make it specific or delete it.
- Review in this order: truth and attribution, swap test, plain-language
  compression, AI-tell scan, audience and next action.

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
possible. Store the workflow in its owning skill or linked portfolio. Do not copy
an operating manual into a task.

For Asana, names stay short. A project name is one to three words. A task name
is two to four words, a verb plus the object (Book pilot call, Rank spec lanes).
Parent tasks follow the same limit. Put context, links, dates, and the next
action in the description. The Linear link goes in the description, never the
name.

## Operational format

Linear and Asana descriptions should read like polished CLI help: clear title,
grouped sections, short facts, and visible whitespace.

- Draft valid CommonMark. Linear accepts it directly. A standalone document
  gets one `#` title. Use `##` for sections; omit the title when the native
  task title already owns the page.
- Convert Asana drafts to supported HTML before writing `html_notes`. Wrap
  the content in `<body>`, escape text, and close every tag. Use `<h2>` for
  sections, `<strong>` for smaller labels, `<ul>/<li>` for lists, `<a>` for
  links, and `<pre>` for code. `notes` is plain text, not a Markdown renderer.
  Send only one description field. Read back both fields after writing.
  Use subtasks for actionable work; literal `- [ ]` is not a task control.
- Put a blank line after every heading and before and after lists or fenced code
  blocks. Emit real line breaks. Never print a visible escaped `\n` sequence.
- Use bullets for facts, changes, blockers, and next actions. Use fenced code
  blocks for commands, payloads, or exact machine output that benefits from
  fixed-width text.
- Operational updates use `What changed`, `Blocked`, and `Next` when those
  sections contain useful information. Omit empty sections and status theater.
  Do not open with "Successfully" or an emoji wall.

````markdown
# Repair video storage

The storage route now separates repository source from working media.

## What changed

- Added the MediaSSD route.
- Kept source and manifests in Git.

## Blocked

- Browser policy still needs a separate review.

## Next

- Verify the mounted volume before the next render.

```bash
npm run check:cerebral
```
````

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
Writing rules — apply by default to client-facing and internal prose we author
or rewrite for a reader: Markdown, Linear docs, Asana tasks, Google Sheets and
other spreadsheet cell text, documents, GitHub and Notion copy, memory, emails,
cover letters, proposals, briefs, handoffs, captions, site copy, public HTML/pages,
and visual/source notes. Not to source code, schemas, generated bundles, code
blocks, or conversation.

Use plain, brief writing at about a third-grade reading level. Use common words,
short sentences, full grammar, and one clear action at a time. Cut needless words.
Keep required technical precision. Example: Wait for Sam’s call. Offer 4 short
clips for $250.
Use numerals in authored copy, including counts, fractions and compound terms.
Write 3-peat, 3-run, 1/3 and 1 year. Preserve verbatim source speech.
Human clock times: use 12-hour format with AM/PM, such as 2:04 PM, without needless
seconds. Keep dates, the same time and time zone; do not guess missing AM/PM or
zones. Preserve machine timestamps, durations, video timecodes, quotes and source
capture. Never turn video timecodes into clock times.

Preserve client-supplied words and verbatim transcriptions. Creating a file from
client speech is source capture, not authored copy. Exclude supplied passages;
check our summaries, recommendations and rewrites. The agent records source
origin and its content hash for file checks. Keep code outside this prose gate.

Correction = edit instruction. Fix the artifact silently. Never restate the
correction.
No process commentary. No preamble, no recap. Deliver the artifact only.

Rewrite drafts only when requested; preserve facts, scope, attribution, sequence,
dates and names.
Swap test hooks and site copy: if another company could reuse a line unchanged,
make it specific or delete it.
Linear: CommonMark headings, bullets, fenced code, and blank lines.
Asana: convert drafts to supported HTML in `html_notes`, wrapped in `<body>`.
`notes` is plain text. Read back both fields. Emit real line breaks.
Updates state what changed, what is blocked or failed, and what comes next.

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
