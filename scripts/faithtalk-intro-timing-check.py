#!/usr/bin/env python3
"""Transcript-led timing check for the FaithTalk intro composition.

Usage: scripts/faithtalk-intro-timing-check.py [index.html]
Asserts the locked v23 timeline in videos/faithtalk-drawn-seed-preview/CONTEXT.md:
each super holds its trigger word, supers run about 2 s, the logo fully lands
before 36.5 s, Ep 1 windows avoid internal cuts, and no studio mark ships.
"""
import json, re, sys
from pathlib import Path

PROJECT = Path("/Users/singleton23/Documents/Development/singleton-systems/videos/faithtalk-drawn-seed-preview")
HTML = Path(sys.argv[1]) if len(sys.argv) > 1 else PROJECT / ".hyperframes/review-v23-project/index.html"
DTW = Path("/Volumes/HomeSSD/Generated/FAITHTALK/audio/transcripts-2026-09-29/faithtalk-intro-enhanced-dtw.json")
STEM_OFFSET = 0.75      # VO stem = source 0.750-37.250
LOGO_LANDS = 3.963      # last tween end in compositions/logo-approved-v6-1.html
END = 36.5

def words():
    d = json.loads(DTW.read_text())
    return [(k["text"].strip().strip(".,").lower(), k["t_dtw"] / 100 - STEM_OFFSET)
            for s in d["transcription"] for k in s["tokens"] if not k["text"].startswith("[_")]

def clip(s, cid):
    m = re.search(r'<[^>]*id="%s"[^>]*>' % cid, s)
    assert m, f"missing #{cid}"
    tag = m.group(0)
    get = lambda a, d=None: (re.search(r'%s="([^"]*)"' % a, tag) or [None, d])[1]
    return dict(start=float(get("data-start")), dur=float(get("data-duration")),
                media=float(get("data-media-start", 0)), rate=float(get("data-playback-rate", 1)), src=get("src"))

def main():
    s = HTML.read_text()
    fails = []
    def check(ok, msg):
        if not ok: fails.append(msg)

    w = words()
    at = lambda word: next(t for x, t in w if x == word)
    way = max(t for x, t in w if x == "way")

    supers = dict((k, (a, b)) for k, a, b in re.findall(r"\['#t-(\w+)',([\d.]+),([\d.]+)\]",
                   re.search(r"const supers=\[(.*?)\];", s).group(1)))
    supers = {k: (float(a), float(b)) for k, (a, b) in supers.items()}
    triggers = {"people": "people", "faith": "faith", "stories": "stories", "embrace": "embrace", "jesus": "jesus"}
    for k, word in triggers.items():
        a, b = supers[k]; t = at(word)
        check(a <= t <= b, f"{k}: trigger '{word}' at {t:.2f}s outside super {a}-{b}")

    order = ["people", "faith", "stories", "embrace", "jesus"]
    clips = {k: clip(s, f"super-{k}") for k in order}
    # Real People crossfades in over the drawing; count it from the end of that fade.
    m = re.search(r"tl\.fromTo\('#super-people',\{opacity:0\},\{opacity:1,duration:([\d.]+)[^}]*\},([\d.]+)\)", s)
    people_full = float(m.group(2)) + float(m.group(1))
    check(abs(people_full - 22.0) < 0.05, f"Real People fully visible at {people_full}, want 22.0")
    for k in order:
        c = clips[k]
        shown = c["start"] + c["dur"] - (people_full if k == "people" else c["start"])
        check(1.8 <= shown <= 2.3, f"{k}: on screen {shown:.2f}s, want about 2 s")
    for a, b in zip(order, order[1:]):
        check(abs(clips[a]["start"] + clips[a]["dur"] - clips[b]["start"]) < 0.01, f"gap/overlap {a}->{b}")

    mountain = clip(s, "mountain")
    check(mountain["start"] + mountain["dur"] >= 22.0, "mountain ends before 22.0")
    fade = float(re.search(r"tl\.to\('#drawing-scene',\{opacity:0[^}]*\},([\d.]+)\)", s).group(1))
    check(fade >= way, f"drawing fades at {fade}s before 'way' ends ({way:.2f}s)")

    logo = clip(s, "logo")
    check(abs(logo["start"] - (clips["jesus"]["start"] + clips["jesus"]["dur"])) < 0.01, "logo does not start as Of Jesus ends")
    check(logo["start"] + LOGO_LANDS <= END - 0.3, f"logo lands at {logo['start'] + LOGO_LANDS:.2f}s, needs >=0.3 s hold before {END}")
    env = float(re.search(r"tl\.fromTo\('#logo-environment'.*?\},([\d.]+)\)", s).group(1))
    check(abs(env - (logo["start"] - 0.5)) < 0.01, f"logo environment fades in at {env}, want logo-0.5")

    check("ep1-stories" in clips["people"]["src"], "Real People must use Ep 1 STORIES")
    check("hand-raised-worship" in clips["stories"]["src"], "Real Stories must use the original worship stock")
    check("ep1-prayer" in clips["embrace"]["src"], "Embrace must use Ep 1 prayer")
    for k, lo, hi in [("people", 0.63, 7.33), ("embrace", 1.49, 17.74)]:   # single-angle windows
        c = clips[k]
        check(lo <= c["media"] and c["media"] + c["dur"] * c["rate"] <= hi, f"{k}: media window crosses a cut")
    check("studio-mark\"" not in s and "singleton-systems-wordmark" not in s, "Singleton Systems mark present")

    for f in fails: print("FAIL", f)
    print(f"{HTML.name}: {'PASS' if not fails else f'{len(fails)} failing'}")
    sys.exit(1 if fails else 0)

if __name__ == "__main__":
    main()
