#!/usr/bin/env python3
"""
Josh Sayre IWMC VSL - deterministic bad-take cutter.

Source of truth for WHICH take is bad: the transcript decision table below,
adjudicated against the locked script.
Source of truth for WHERE to cut: the RMS envelope, so every cut lands in the
quietest point available and never clips a word.

This is the prototype of Plugin 1's engine. Decisions are anchored to transcript
text, never to cue indices, so the table survives a re-transcribe.
"""
import re, sys, json, subprocess
from pathlib import Path

HERE = Path(__file__).parent
MEDIA = "/Volumes/MediaSSD/05_FINISHED/2026-07-29_josh-sayer_vsl_Descript.mp4"
DURATION = 1571.836938

# ---------------------------------------------------------------- tuning
BREATH_PAD   = 0.28   # dead air kept between kept segments
SNAP_WINDOW  = 0.30   # +/- seconds searched for the quietest cut point
MIN_GAP_CUT  = 0.70   # inter-cue gaps longer than this get tightened
EDGE_GUARD   = 0.045  # never cut closer than this to a transcribed word edge

# ---------------------------------------------------------------- decisions
# Whole cue is a false start, stutter, or a duplicate take superseded later.
DROP_CUE = [
    "Here's, here's the problem.",
    "They, they really don't, I promise you.",
    '"Well, Facebook ads, they just don\'t work.',
    "The setup failed.",
    "It starts with one simple video.",
    "Motivated sellers will price",
    "Mobile homes and commercial properties, uh, get filtered out.",
    "Are you…",
    "You know, that could be an ethics lawsuit.",
    "There could be issues there, right?",
    "At question three, the person who answers",
    "numbers and Mickey Mouse.",
    'He said, "If I answer all those call…"',
    "And then, and then you need all these other tools to work those leads for you.",
    "And your ad account keeps that intelligence.",
    "I say on camera that I'll go over every option.",
    "So nobody feels switched.",
    ("So understand what you have", 0),      # truncated attempt; full line follows
    ("No matter which door they need.", 0),   # first of two identical takes
    "With one move in your business, you've now raised your compensation 60%.",
    "Now here's what ex- now here's exactly what I do for you",
    "the cash offer and the listing option.",
    "On the split option, half of my payment",
    "Eric in Las Vega- Here it is.",
    ("in about three days", 0),          # bare duplicate; full line follows
    "My refund r- my refund rate across every single client is three point three…",
    "My refund rate across every single client I've ever had is three point three six",
    "percent, is three point six three percent.",
    "Now, the-- for the or waiting in the future.",
    "It happened with, it happened with home valuation ads.",
    "Right now, right now, almost nobody in your market is-- why",
    "my leads cost what they cost.",
    "And tactic.",
    "If you're tired of renting leads and ready to own…",
    "That's a, that's a return most agents won't believe until I show them the ad",
]

# Remove a span inside an otherwise good cue. (cue_anchor, span_to_remove)
DROP_SPAN = [
    ("Here's the p- here's the problem that I built this to solve",  "Here's the p- "),
    ("everything s- everything stops.",                    "everything s- "),
    ("close a lead into a deal, close a lead into a deal",  "close a lead into a deal, "),
    ("of dialing to produce one listing, to produce one qualified real listing.",
                                                           ", to produce one qualified real listing"),
    ("before and, and they were",                          "and, "),
    ("back- with a branded backdrop.",                     "back- "),
    ("to film them casually, so he did so.",               ", so he did so"),
    ("a house that needs work that they don't, a house",    "a house that needs work that they don't, "),
    ("So m- so I'm gonna actually teach it to you.",        "So m- "),
    ("If they're not, if they're not the owner",            "If they're not, "),
    ("What-- If their timeline is more than six months",    "What-- "),
    ("quit at question thr- quit at question three.",       "quit at question thr- "),
    ("you already n- you already know they own",            "you already n- "),
    ("it's a property type you can sell, it's a property type",
                                                           "it's a property type you can sell, "),
    ("it's worth more than everything else I'll say, and it's worth more",
                                                           "it's worth more than everything else I'll say, and "),
    ("Every unqualified person who get-- every unqualified person who gets",
                                                           "Every unqualified person who get-- "),
    ("This is c- this is called pixel conditioning.",       "This is c- "),
    ("although you will get",                              ", although you will get"),
    ("quality cheap leads often.",                          "quality cheap leads often."),
    ("You have four ways to s- you have four ways to serve them",
                                                           "You have four ways to s- "),
    ("You can wholesale it, put it or put it under contract",  "put it or "),
    ("and earned the money that you get ma-- and earn the money that you make.",
                                                           "and earned the money that you get ma-- "),
    ("That posi- that position commands a premium",         "That posi- "),
    ("need to nearly double their transaction count, would need to double their",
                                                           "need to nearly double their transaction count, would "),
    ("your ad, your ad campaign inside your own ad account", "your ad, "),
    ("your nine-question, your nine-question application with the phone validation",
                                                           "your nine-question, "),
    ("if you want it, with phone validation, your CRM with automated follow,",
                                                           ", your CRM with automated follow,"),
    ("your CRM with automated follow-up, every integra- every integration.",
                                                           "every integra- "),
    ("If you already run, if you already have a favorite CRM",  "If you already run, "),
    ("My AI role play bot with 22-- with 60 plus scenarios",    "with 22-- "),
    ("My library of, my library of over 80",                "My library of, "),
    ("A weekly, a weekly group coaching call",              "A weekly, "),
    ("a private Slack channel with a d- a private",         "a private Slack channel with a d- "),
    ("The ad account, the page, the pixel, the ad account, the page, the pixel data.",
                                                           "The ad account, the page, the pixel, "),
    ("Brandy in Dallas-Fort Worth set-- Brandy in Dallas-Fort",
                                                           "Brandy in Dallas-Fort Worth set-- "),
    ("Or three thousand dollars to get started a- and three thousand",  " a-"),
    ("close or not There are no monthly f- there are no monthly fees, no",
                                                           "There are no monthly f- "),
    ("You-- Your ad spend, usually $30 to $35 a day, goes straight",  "You-- "),
    ("and you'll keep, and you'll keep everything that I've given you thus far",
                                                           "and you'll keep, "),
    ("Not because of some, not because of some fake countdown timer",
                                                           "Not because of some, "),
    ("The same lay-- the same way, the same way Zillow leads went from gold",
                                                           "The same lay-- the same way, "),
    ("Your choice is, your choice is not whether this gets copied,",  "Your choice is, "),
    ("It asks about your-- It will ask you about your market,",       "It asks about your-- "),
    ("And it takes, uh, and it takes about two minutes to fill out.", "And it takes, uh, "),
    ("call with, a forty-fi- a forty-five minute call with us on Zoom.",
                                                           "call with, a forty-fi- a "),
    ("We'll pull up my real a- we'll pull up, we'll pull up my real",
                                                           "We'll pull up my real a- we'll pull up, "),
]

# ---------------------------------------------------------------- load
def parse_ts(s):
    h, m, rest = s.split(":")
    sec, ms = rest.split(",")
    return int(h)*3600 + int(m)*60 + int(sec) + int(ms)/1000.0

cues = []
for line in (HERE/"transcript.tsv").read_text().splitlines():
    if not line.strip():
        continue
    a, b, text = line.split("\t", 2)
    cues.append({"start": parse_ts(a), "end": parse_ts(b), "text": text})

# RMS envelope -> parallel arrays
times, levels = [], []
t = None
for line in (HERE/"rms.txt").read_text().splitlines():
    m = re.match(r"frame:\d+\s+pts:\d+\s+pts_time:([\d.]+)", line)
    if m:
        t = float(m.group(1)); continue
    m = re.match(r"lavfi\.astats\.Overall\.RMS_level=(-?[\d.]+|-inf)", line)
    if m and t is not None:
        times.append(t)
        levels.append(-120.0 if m.group(1) == "-inf" else float(m.group(1)))
        t = None

def quietest(center, radius=SNAP_WINDOW):
    """Return the time of the lowest-RMS frame within +/-radius of center."""
    lo, hi = center - radius, center + radius
    best, best_lv = center, 1e9
    for tt, lv in zip(times, levels):
        if tt < lo: continue
        if tt > hi: break
        if lv < best_lv:
            best_lv, best = lv, tt
    return best

# ---------------------------------------------------------------- resolve
def find_cue(anchor, which=0):
    """Resolve a text anchor to a cue. `which` disambiguates repeated lines --
    the duplicate-take case, where we always want the earlier attempt."""
    hits = [c for c in cues if anchor in c["text"]]
    if not hits or which >= len(hits):
        return None, len(hits)
    return hits[which], 1

removals = []   # (start, end, kind, note)
problems = []

for entry in DROP_CUE:
    anchor, which = entry if isinstance(entry, tuple) else (entry, 0)
    cue, n = find_cue(anchor, which)
    if cue is None:
        problems.append(("DROP_CUE", anchor, n)); continue
    # Transcript timestamps mark word ONSET, so cutting exactly at cue["start"]
    # slices the attack of a syllable. Snap outward into the surrounding quiet.
    s = quietest(cue["start"] - 0.10, 0.22)
    e = quietest(cue["end"]   + 0.10, 0.22)
    removals.append((min(s, cue["start"]), max(e, cue["end"]), "cue", cue["text"][:70]))

for anchor, span in DROP_SPAN:
    cue, n = find_cue(anchor)
    if cue is None:
        problems.append(("DROP_SPAN", anchor, n)); continue
    txt = cue["text"]
    i = txt.find(span)
    if i < 0:
        problems.append(("SPAN_TEXT", f"{span!r} not in {txt[:50]!r}", 0)); continue
    L = len(txt)
    dur = cue["end"] - cue["start"]
    s = cue["start"] + (i / L) * dur
    e = cue["start"] + ((i + len(span)) / L) * dur
    # Snap to the quietest nearby frame so cuts land between words. Radius must
    # never exceed a third of the span, or short spans collapse to nothing.
    r = min(SNAP_WINDOW, max(0.04, (e - s) / 3.0))
    # A span at the very start (or end) of a cue must be allowed to snap OUTSIDE
    # the cue - clamping it to the cue edge puts the cut back on the word onset
    # the snap was trying to avoid. Interior spans stay clamped so they cannot
    # eat neighbouring words.
    at_head = (i == 0)
    at_tail = (i + len(span) >= len(txt.rstrip()))
    sq, eq = quietest(s, r), quietest(e, r)
    s = sq if at_head else max(cue["start"], sq)
    e = eq if at_tail else min(cue["end"],   eq)
    if e - s > 0.05:
        removals.append((s, e, "span", f"{span.strip()[:50]} | in: {txt[:40]}"))
    else:
        problems.append(("SPAN_DEGENERATE", span, 0))

# Inter-cue dead air. Pad graduates with the original gap: a long gap was a
# take break or a section boundary and still deserves a beat, so collapsing
# everything to one flat pad reads breathless in a talking-head VSL.
def pad_for(gap):
    if gap < 2.0:  return 0.34
    if gap < 6.0:  return 0.55
    return 0.78

for a, b in zip(cues, cues[1:]):
    gap = b["start"] - a["end"]
    if gap > MIN_GAP_CUT:
        pad = pad_for(gap)
        if gap - pad < 0.12:
            continue
        s = a["end"] + pad / 2
        e = b["start"] - pad / 2
        if e - s > 0.1:
            removals.append((s, e, "gap", f"dead air {gap:.2f}s -> {pad:.2f}s"))

# leading slate / trailing tail
if cues[0]["start"] > 0.5:
    removals.append((0.0, max(0.0, cues[0]["start"] - BREATH_PAD), "head", "pre-roll"))
if DURATION - cues[-1]["end"] > 0.8:
    removals.append((cues[-1]["end"] + BREATH_PAD, DURATION, "tail", "post-roll"))

# ---------------------------------------------------------------- merge + invert
removals.sort()
merged = []
for s, e, kind, note in removals:
    if merged and s <= merged[-1][1] + 0.01:
        prev = merged[-1]
        merged[-1] = (prev[0], max(prev[1], e), prev[2] + "+" + kind, prev[3])
    else:
        merged.append((s, e, kind, note))

keeps, cursor = [], 0.0
for s, e, _, _ in merged:
    if s > cursor + 0.05:
        keeps.append((cursor, s))
    cursor = max(cursor, e)
if cursor < DURATION - 0.05:
    keeps.append((cursor, DURATION))

removed = sum(e - s for s, e, _, _ in merged)
kept    = sum(e - s for s, e in keeps)

def tc(x):
    return f"{int(x//60):02d}:{x%60:06.3f}"

print(f"source        {tc(DURATION)}  ({DURATION:.2f}s)")
print(f"removals      {len(merged)} spans")
print(f"  whole-cue   {sum(1 for r in merged if 'cue'  in r[2])}")
print(f"  intra-cue   {sum(1 for r in merged if 'span' in r[2])}")
print(f"  dead air    {sum(1 for r in merged if 'gap'  in r[2])}")
print(f"removed       {tc(removed)}  ({removed/DURATION*100:.1f}% of this file)")
print(f"kept          {tc(kept)}   in {len(keeps)} segments")
print(f"vs 33:24 raw  {(1 - kept/2004.0)*100:.1f}% total cut")
if problems:
    print(f"\n!! {len(problems)} unresolved decisions:")
    for kind, a, n in problems:
        print(f"   [{kind}] matches={n}  {a[:80]}")
else:
    print("\nall decisions resolved cleanly")

json.dump({"keeps": keeps, "removals": [list(r) for r in merged],
           "kept": kept, "removed": removed},
          open(HERE/"cutlist.json", "w"), indent=1)

# Portable cut list for the Premiere UXP panel (tools/premiere-uxp/cutter).
# This is the handoff format: the Whisper/FFmpeg pass decides the cuts, the
# panel applies them. Source duration is included so the panel can detect that
# it is being pointed at a differently-conformed sequence.
json.dump({
    "version": 1,
    "source": {"name": Path(MEDIA).name, "duration": DURATION, "fps": 30000/1001},
    "removals": [
        {"start": round(s, 4), "end": round(e, 4),
         "kind": k.split("+")[0], "note": n}
        for s, e, k, n in merged
    ],
}, open(HERE/"cutlist.plugin.json", "w"), indent=1)

# ------------------------------------------------- conformed transcript
# Word-for-word text of the rendered cut, timed on the OUTPUT timeline.
# Generated from the same decision table as the cut, so the two cannot drift.
dropped_cues = set()
for entry in DROP_CUE:
    anchor, which = entry if isinstance(entry, tuple) else (entry, 0)
    cue, _ = find_cue(anchor, which)
    if cue: dropped_cues.add(id(cue))

span_edits = {}
for anchor, span in DROP_SPAN:
    cue, _ = find_cue(anchor)
    if cue: span_edits.setdefault(id(cue), []).append(span)

def out_time(src_t):
    """Map a source time onto the rendered output timeline."""
    acc = 0.0
    for s, e in keeps:
        if src_t < s:   return acc
        if src_t <= e:  return acc + (src_t - s)
        acc += e - s
    return acc

lines, conformed_words = [], 0
for c in cues:
    if id(c) in dropped_cues:
        continue
    txt = c["text"]
    for span in span_edits.get(id(c), []):
        txt = txt.replace(span, "", 1)
    txt = re.sub(r"\s{2,}", " ", txt).strip()
    txt = re.sub(r"^[,;]\s*", "", txt)
    if not txt:
        continue
    conformed_words += len(txt.split())
    lines.append((out_time(c["start"]), txt))

with open(HERE/"conformed_transcript.md", "w") as f:
    f.write("# Josh Sayre - IWMC Direct VSL\n")
    f.write("## Conformed transcript - matches preview cut v1 word for word\n\n")
    f.write(f"- Runtime **{tc(kept)}** from a {tc(DURATION)} source\n")
    f.write(f"- {conformed_words:,} spoken words in {len(lines)} lines\n")
    f.write(f"- Locked script is 2,934 words; this cut is {conformed_words-2934:+,}\n")
    f.write("- Timecodes are on the **rendered preview**, not the source\n\n---\n\n")
    for t, txt in lines:
        f.write(f"`{tc(t)}`  {txt}\n\n")

print(f"conformed     {conformed_words:,} words, {len(lines)} lines "
      f"(script is 2,934 -> {conformed_words-2934:+,})")
