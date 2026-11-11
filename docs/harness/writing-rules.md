# Writing Rules

Canonical source for writing across apps. Repository guides and skills link here.
Keep app-specific rules here until an app needs a longer reference of its own.
Generated client-repo hook payloads must come from this file; never hand-edit them.

## Scope

Applies by default to all client-facing and internal prose we author or rewrite
for a reader:

Markdown and MDX, Linear issues and docs, Asana projects and tasks, Craft blocks, Google Sheets
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

For service copy, write as Jerami, a solo operator. Name the client's work and
next step. Separate what Jerami did from what the client did. Use the matching
[operations Lane](../operations/README.md) for offers and audiences. Internal
tests do not prove client results.

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

Jerami's review entry point should stay under 500 words. Most updates need far
less. This limit applies to what Jerami must read to act or decide. It does not
cap technical ticket details, test plans or linked evidence used for execution.

If a review artifact truly needs more than 500 words, keep its written entry
point short and create a dated interactive HTML map under
`public/decision-maps/<date>-<slug>/index.html`. Add it to the Decision Maps
page for preview. Use large type, few nodes, and step-by-step disclosure. The
map must compress the work. Do not hide a long memo inside panels.

Raw transcripts, source records, and machine contracts may stay long. Keep
them behind links. Jerami should see the decision, current truth, next action,
and review gate first.

For Linear, keep the title and opening summary easy to scan. Put needed build
details below that summary or behind a clear link. Store reusable workflows in
their owning skills. Keep each ticket's exact tests, blockers and finish checks.

For Asana, names stay short. A project name is one to three words. A task name
is two to four words, a verb plus the object (Book pilot call, Rank spec lanes).
Parent tasks follow the same limit. Put context, links, dates, and the next
action in the description. The Linear link goes in the description, never the
name.

## Writing for Jerami

Use this rule on every surface Jerami reads, including the dashboard. Match the
app's own layout and text tools. A Linear example is not a template for all apps.

- Give tasks and tickets short, plain names. Prefer a verb and its object.
  Keep product and client names exact. Put implementation terms in the body.
- Start with the result, decision or next action. Add only the context needed
  to understand it. Make the current state clear without repeating the history.
- Use short sections and space between blocks. Put one fact in each bullet.
  Number steps that must happen in order. Aim for 5 or fewer items per section.
- Use bold for a key name, result or action when it helps scanning. Use italics
  for brief secondary context. Keep critical actions visible in normal text.
  Formatting must help the reader find meaning; do not decorate every sentence.
- Keep deeper sources behind named links. Show an attention estimate when it
  helps planning; label estimates and unknowns. Never invent times or deadlines.

Technical tickets still need enough detail to execute. TDD, tracer-bullet and
ticket-driven skills keep their test seams, first slice, acceptance checks,
blockers and completion signals. Use a simple name and opening summary for
Jerami, then keep those details in the ticket or its linked source. Do not
remove needed detail to hit a reading-level or word-count target.

## Operational format

Use the native text and block tools supported by the chosen app connection.
Read its current tool schema or saved API reference before a write. These are
app choices, not one universal Markdown template.

| Surface | Write and verify |
| --- | --- |
| Linear | CommonMark headings, lists, links and selective emphasis. Keep the short name and summary above technical details. Read back the saved body. |
| Asana | Supported HTML in `html_notes`, with a `<body>` root. Use sections, lists, links and emphasis. Read back both `notes` and `html_notes`. |
| Craft | Use its blocks, headings, lists and links. Use supported Markdown within blocks or the documented Markdown input. Preserve block IDs; read back changed blocks. |
| Notion | Use supported native blocks and rich text. Use headings, lists, links or toggles when they help. Read back the changed blocks; do not paste markup into plain text. |
| Dashboard | Use existing UI sections, task links and details views. Keep labels and action text short. Check the rendered view when changing it. |
| Sheets and other apps | Use the supported cells, links, fields and text tools. Keep short labels and clear rows. Plain text fields must stay readable without markup. |

Readback proves saved content. Check the rendered view when available before
claiming visual proof. If a writer only accepts plain text, use clear lines or
a supported rich-text writer. Do not send formatting markers as visible text.

- Draft valid CommonMark. Linear accepts it directly. A standalone document
  gets one `#` title. Use `##` for sections; omit the title when the native
  task title already owns the page.
- Convert Asana drafts to supported HTML before writing `html_notes`. Wrap
  the content in `<body>`, escape text, and close every tag. Use `<h2>` for
  sections, `<strong>` and `<em>` for emphasis, `<ul>/<li>` for lists, `<a>` for
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

**Formatting.** `**Thing**: explanation` as a list header. Decorative boldface
scattered through body text; useful emphasis follows Writing for Jerami above.
Title Case In Headings. Em dashes on more than ~30% of
sentences.

## Hook payload

Copy this block verbatim into a client repo at `.claude/writing-rules.md`.
Fires on `UserPromptSubmit` via `cat`. Keep it focused on the rules needed at entry.

```text
Writing rules — apply by default to client-facing and internal prose we author
or rewrite for a reader: Markdown, Linear docs, Asana tasks, Google Sheets and
other spreadsheet cell text, Craft blocks, documents, GitHub and Notion copy, memory, emails,
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
Jerami's surfaces: simple names, a clear result or next action, short sections.
Use each app's own blocks, lists, links and text tools. Use bold for key names
or actions and italics for brief secondary context when useful. Avoid decoration.
Technical tickets keep the build detail, TDD seams, tests, blockers and finish
checks needed to execute. The short title and summary are for Jerami; deeper
details belong below them or in linked sources. Do not flatten technical tickets.
Linear: CommonMark headings, bullets, fenced code, and blank lines.
Asana: convert drafts to supported HTML in `html_notes`, wrapped in `<body>`.
`notes` is plain text. Read back both fields. Emit real line breaks.
Craft: use supported blocks and Markdown; preserve IDs and read back changes.
Notion: use supported blocks and rich text; read back changes.
Dashboard and other apps: use native fields and layout. Keep plain text readable
without markup. Saved content alone does not prove the rendered layout.
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
This caps the review entry point, not required technical ticket details.
If more is needed, create a dated interactive Decision Map and keep the written
entry point short. Do not paste an operating manual into Linear.
```

## Sources

- https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing
- https://www.aidetectors.io/blog/how-to-tell-if-text-is-ai-written

Model-specific: ChatGPT overuses em dashes. Claude over-qualifies and adds
caveats. Gemini over-structures into lists.
