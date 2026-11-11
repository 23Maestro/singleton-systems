# select the scenes

## plain language

- **Lane** names the type of visual the transcript needs.
- **Option** names the approved look inside that lane.
- **Setting** changes content capacity, such as subject count, season count, or
  stat count.
- **Engine** names the authoring tool: Figma or Blender. It never renames a lane.
  Unreal records stay as history; new builds do not use it.

Keep component, variant, instance, and property language inside the Figma
implementation notes.

## full-transcript discovery

After obvious rankings and Quick Action opportunities, attempt the complete
transcript against all seven lanes before pacing or scene selection. Record
supported candidates, rejected possibilities with reasons, or genuine no-fit
outcomes. No scene quota creates filler. Missing assets remain explicit search
work; lack of an asset does not erase a supported passage.

The ledger records `schemaVersion: 1`, `episodeId`, the exact transcript file's
`transcriptSha256`, `fullTranscriptReviewed: true`, and seven `lanes` rows. Each
row records `lane`, all zero-based Whisper `reviewedSegmentIds` in source order,
and `findings`. Every finding records `outcome` and `reason`. Candidates and
rejections also record contiguous `segmentIds`, an actual `excerpt`, and `start`
and `end` in seconds within those segments. Candidates record `assetSearch`
with `status` (`needed`, `verified`, or `not-required`) and `evidence` naming
search work or source IDs. A no-fit row explains the lack of transcript support.

Bind `discoveryPath` and `transcriptPath` in the review-stage registry. Bind
`discoveryPath` and `timing.transcriptPath` in scene manifests. Run
`npm run check:lineups:framing` before advancing the review. Scoped mutation and
review-export preflight consume the same ledger. Missing, incomplete or stale
evidence blocks progression. Timing proof cannot satisfy discovery. These
checks establish structure, excerpts, coverage and freshness; human review
judges editorial reasoning.

## check the episode's themes

Before the first Studio candidate review, open the episode's JSON discovery ledger
and read it against the full timed transcript. Mark the main claims, changes in
the argument, comparisons, and steps in a sequence. Use spoken order. Record
the segment IDs, time range, and source words for each theme.

For each theme, ask what a viewer should see change as the speaker talks.
Consider an approved comparison, reveal, or swap where it helps explain the
point. Match each theme to its scene IDs or give the reason to stay on the
speaker. Recheck long stretches without a scene and passages covered only by
photos or quick stats. Keep strong motion ideas in the review even if a photo
or engine choice is pending. Mark that need on the card.

Use the local `jev` skill to classify what the speaker's words ask the viewer to see.
When the chosen lane has Blender variants, run
`python3 -m tools.lineups_motion.variant_suggest CUE_MAP SCENE_IDS` to have Jev
suggest a variant from the spoken passage. A season or multi-stage arc points
to 3A; one game's stat line points to 3B. Save the result as a suggestion and
show it on the card. Jev never binds a variant; Jerami chooses.
Start with the repeatable patterns below and use examples from past episodes
with build or placement proof. Offer distinct choices supported by the spoken
passage. Include `needs_review` if the words may support none of them.

| Pattern ID | What the speaker says | What the graphic shows |
| --- | --- | --- |
| `rank_reveal` | Names a current rank | Reveal the team on the running board |
| `rank_change` | Compares one team's ranks across weeks | Show the old rank, new rank, and direction |
| `direct_comparison` | Puts subjects or periods in direct contrast | Put the subjects or values side by side |
| `stepwise_reveal` | Walks through a sequence, era change, or lineup | Reveal or swap each state on its spoken cue |
| `metric_breakdown` | Builds one case with several facts | Reveal each fact in spoken order |
| `value_metrics` | Uses related quantities to explain a result | Show their relationship with labeled values; compare bars only on a shared unit and basis |
| `numeric_takeaway` | Lands a result or one or two values | Show the score or key numbers |
| `spoken_takeaway` | Makes a short claim or asks a pointed question | Show the point with its attribution |
| `visual_reference` | Names a person, team, or moment worth seeing | Show the matching photo |
| `trend` | Gives comparable values across several periods | Show how the values change |
| `recurring_premise` | Returns to a named show topic | Update the established board |

Save each match in `storyboard/theme-audit.json`. Keep the exact words and
time range, theme ID, scene ID, lane, option, the reason the graphic helps,
and Jev's result. Mark the reason as inferred when the episode record has no
editorial reason. Bind the audit to the transcript, discovery ledger, and
cue map hashes. Keep any failed or unclear classification open for review.

Record a proposed scene as proposed. After build, add the actual graphic
and its scene-level receipt. Record Premiere placement separately when there
is a placement receipt. Match evidence to the same episode, scene, and cue
revision. Keep excerpt bounds separate from the verified build anchor. Link
superseded draft IDs to their built replacements; count only the active version.
Add evidence-backed speech-to-graphic matches to the cross-episode reference
at `CATENA_MEDIA/references/lineups-speech-to-graphic/speech-to-graphic-classifications.json`
under the Video Storage root. For example, Week 7's S01 turns “number three”
and “number 10” into a two-period Ravens comparison. This lets the viewer see
the size and direction of the drop as Mark explains it.

For old examples, read `currentMatch` first. It names today's treatment, what
to show, why it fits, and when an alternative helps. Keep `graphic` and
`actualGraphic` as history. A new recommendation adds no build evidence.
Resolve the current template and engine; retired callouts and stripes stay
retired. A sampled Jev decision does
not classify every row: label propagated matches and review mixed cases on
their own. Scores are relative, not confidence. Check source hashes before reuse;
ID-only receipts and missing transcript bindings remain explicit limits.

Review the audit before sharing the first scene list. Every major theme needs
a scene, an open choice in the review, or a reason to stay on the speaker.
Recheck the audit after a transcript or scene-list revision. This check has no
scene quota. Keep it separate from Manim timing and scene approval.

## choose what the words need

Name the spoken point first. Choose what viewers must see to understand it.
Count fields only after choosing the lane; numbers alone do not choose it.

| Spoken point | Current treatment | Fit check |
| --- | --- | --- |
| One result, claim or punch line | Quick Stat: Team callout or Logo statement | Can one short statement carry the point? Keep opinions attributed. |
| One subject or argument, several supporting facts | Stat Breakdown | Use 3 or 4 distinct points, or a registered grouped layout. Text reasons count; filler does not. |
| Related values explain control, efficiency or scale | Year-by-Year + Value Metrics: value treatment | Years are optional. Label units and samples. Only like-for-like values share a bar scale. |
| One measure changes over time | Year-by-Year: trend table | Require one subject and at least 3 comparable periods. A date or combined span is not a series. |
| Subjects or periods must be seen together | Comparison | Choose photo-led, one-value or multi-value layout from the actual contrast. |
| One team moves between 2 weekly ranks | Comparison: Rank Movement | Show old rank, new rank and direction using the current satin cards. |
| Order or replacement explains the point | Asset Swap | Reveal the states on speech; verify the registered subject capacity. |
| A named show premise returns | Recurring Board | Use Rank Reveal only in ranked episodes. |
| A person or moment needs a visual reference | Quick Action Photo | Stay on the speaker if the photo adds no meaning. |

For each candidate, write: **spoken point → what appears → why this lane**.
Name the strongest alternative and when it would help. For example:

- Harrison: 3 catches, 34 yards, all first downs → `3 CATCHES. 3 FIRST DOWNS.`
  in a callout. The first downs are the point; the full stat line is an alternative.
- Burrow: 400+ yards, 5 TD, 3 INT → a 3-point Stat Breakdown. Production and
  mistakes explain the same player's game.
- Seattle: 20 scored, 3 allowed, 0 red-zone trips → Value Metrics. Compare
  points; show red-zone trips separately. A result-only beat can use a callout.

Recover the current reusable value/bar source before build. The Seattle
example in [the lane guide](lineups-lanes.md) shows the intent; its episode
node is not a master. A missing registry binding stays source work and does
not erase the candidate or send it back to Quick Stat. Never invent values,
use unequal sample lengths as a trend, or fill period slots with unrelated metrics.

Choose the lightest lane that proves the passage. When two options fit equally,
avoid repeating the same look in consecutive scenes. The system cannot invent
a new option during an edit. A new design stays experimental until Jerami
promotes it.

The seven lanes stay fixed. Approved patterns live as named options inside a
lane. An episode chooses an existing option and changes its settings. A new
pattern requires review before it joins the option menu; it does not become an
eighth lane.

## transcript-to-graphic copy

Preserve the speaker's meaning, attribution, causal ownership, and spoken
order. Compress or closely paraphrase the transcript. Do not invent a new
editorial angle. When the transcript says the defense created four takeaways
and the offense remained inefficient, the graphic may say `4 DEFENSIVE
TAKEAWAYS WEREN'T ENOUGH`. It must not imply that Arch committed four turnovers.

## pacing

Use 80–84% Mark as a loose guide, following Jerami's clarification. It is not
a threshold that blocks a good candidate. Short videos may differ. Review the
full transcript and gaps for stronger lane choices before trimming the pool.
Do not reduce 17 candidates to 13 merely to hit a ratio; neither count is a quota.
The delivered profile remains useful context: a typical five-second insert,
75% at eight seconds or less, 90% at twelve seconds or less, and about one
insert every 41 seconds. These observations do not replace editorial judgment.

Photo-led Quick Stat and Stat Breakdown scenes use a full-clip push from 100%
on the first frame to 102.5% on the final frame. Build the standard single-photo
master at 6.5 seconds. Two-photo Quick Stat is retired for new builds; use the
current speech match to choose its replacement. Keep text inside the safe area. Preserve available
headroom at the initial frame; the inherited push's final frame does not add a
separate headroom requirement.
Do not apply this global push to Asset Swap, Comparison, or other motion comps.
