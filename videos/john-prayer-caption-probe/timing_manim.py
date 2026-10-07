"""Validate Premiere-to-caption timing, then draw the same schedule with Manim."""
import json
from pathlib import Path
from manim import Scene, Text, Rectangle, Line, WHITE

BASE = Path(__file__).resolve().parent
D = json.loads((BASE / "timing.json").read_text())
FPS = D["fps"]
seen = []
max_error = 0
for cue in D["cues"]:
    words = D["words"][cue["firstWord"]:cue["lastWord"] + 1]
    assert words
    assert cue["startFrame"] == round(words[0]["start"] * FPS)
    assert cue["endFrame"] == min(round(words[-1]["end"] * FPS), round(D["duration"] * FPS))
    assert cue["endFrame"] - cue["startFrame"] >= .5 * FPS
    assert 0 <= cue["startFrame"] < cue["endFrame"] <= D["duration"] * FPS
    assert len(cue["text"].splitlines()) <= 2
    actual = " ".join(cue["text"].replace("’", "'").split())
    expected = " ".join(w["text"] for w in words)
    assert actual == expected, (actual, expected)
    seen.extend(range(cue["firstWord"], cue["lastWord"] + 1))
    max_error = max(max_error, abs(cue["startFrame"] / FPS - words[0]["start"]),
                    abs(cue["endFrame"] / FPS - min(D["duration"], words[-1]["end"])))
assert seen == list(range(len(D["words"])))
for a, b in zip(D["cues"], D["cues"][1:]):
    assert a["endFrame"] <= b["startFrame"]
for word in D["words"]:
    placement = next(p for p in D["placements"] if p["clipId"] == word["placementClipId"])
    # Premiere returns the source and edit positions. Check both sides of the map.
    timeline_start = placement.get("timelineStart", placement.get("start"))
    source_start = placement.get("sourceIn", placement.get("inPoint"))
    if timeline_start is not None and source_start is not None:
        assert abs(timeline_start + word["sourceStart"] - source_start - word["start"]) < .002
assert max_error <= .5 / FPS + .000001
print(f"PASS: {len(D['words'])} mapped words; {len(D['cues'])} phrase windows; max frame rounding {max_error*1000:.3f} ms")

class TimingMap(Scene):
    def construct(self):
        self.camera.background_color = "#11121a"
        self.add(Text("JOHN PRAYER / 10s caption timing", font_size=26, color=WHITE).to_edge([0,1,0], buff=.3))
        x0, x1 = -3.7, 6.3
        X = lambda t: x0 + (x1-x0)*t/D["duration"]
        for sec in range(11):
            self.add(Line([X(sec),2.65,0],[X(sec),-2.6,0], stroke_width=1,color="#343847"))
            self.add(Text(str(sec),font_size=14,color="#b9bed0").move_to([X(sec),2.9,0]))
        for i,cue in enumerate(D["cues"]):
            y=2.15-i*(4.7/max(1,len(D["cues"])-1))
            label=Text(cue["text"].replace("\n"," "),font_size=13,color=WHITE)
            if label.width > 3.6: label.scale_to_fit_width(3.6)
            label.move_to([-5.7,y,0])
            start,end=cue["startFrame"]/FPS,cue["endFrame"]/FPS
            self.add(label)
            self.add(Rectangle(width=X(end)-X(start),height=.36,stroke_width=0,fill_color="#ac6aff",fill_opacity=.95).move_to([(X(start)+X(end))/2,y,0]))
        self.add(Text(f"Premiere word times → frame grid / maximum rounding {max_error*1000:.2f}ms",font_size=16,color="#cbd0df").to_edge([0,-1,0],buff=.25))
