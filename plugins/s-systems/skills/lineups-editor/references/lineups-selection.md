# select the scenes

## plain language

- **Lane** names the type of visual the transcript needs.
- **Option** names the approved look inside that lane.
- **Setting** changes content capacity, such as subject count, season count, or
  stat count.
- **Engine** names the authoring tool: Figma or Unreal. It never renames a lane.

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

## automatic routing

```text
0 data points                          -> quick action photo
1-2 data points                        -> quick stat
3-4 data points about one subject      -> stat breakdown
2 subjects and a visual argument       -> cinematic 2-up
2-4 subjects or periods, one value     -> simple comparison
2-4 subjects, several shared values    -> full comparison
period trend or related value metrics  -> year-by-year
named recurring premise                -> recurring board
progression that needs movement        -> asset swap
```

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
master at 6.5 seconds. In a Two-photo Quick Stat, reset the push for each
five-second photo state. Keep text inside the safe area. Preserve available
headroom at the initial frame; the inherited push's final frame does not add a
separate headroom requirement.
Do not apply this global push to Asset Swap, Comparison, or other motion comps.
