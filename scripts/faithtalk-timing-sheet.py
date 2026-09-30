"""Manim timing sheet: voiceover phrases vs picture events on one timeline, with a playhead.
Render: manim -qh --fps 30 -o <name> scripts/faithtalk-timing-sheet.py TimingSheet
Data comes from FT_SHEET (path to a JSON: {title, duration, rows:[{label,color,events:[[start,end,text],...]}]})."""
import json, os
from manim import *

D = json.load(open(os.environ["FT_SHEET"]))

class TimingSheet(Scene):
    def construct(self):
        self.camera.background_color = "#0d0f0e"
        dur = D["duration"]; x0, x1 = -6.3, 6.6
        X = lambda t: x0 + (x1 - x0) * t / dur
        self.add(Text(D["title"], font="Geist", font_size=26, color=WHITE).to_corner(UL, buff=0.35))
        rows = D["rows"]; top = 2.3; gap = 1.35
        for s in range(int(dur) + 1):                       # second ticks
            self.add(Line([X(s), top + 0.55, 0], [X(s), top - gap * (len(rows) - 1) - 0.6, 0], stroke_width=1, color="#2a2f2c"))
            self.add(Text(str(s), font="Geist", font_size=14, color="#7d8781").move_to([X(s), top + 0.75, 0]))
        for i, r in enumerate(rows):
            y = top - gap * i
            self.add(Text(r["label"], font="Geist", font_size=16, color="#aab3ad").move_to([x0 - 0.1, y + 0.5, 0], aligned_edge=LEFT))
            for j, (a, b, txt) in enumerate(r["events"]):
                w = max(X(b) - X(a), 0.03)
                self.add(Rectangle(width=w, height=0.34, stroke_width=0, fill_color=r["color"], fill_opacity=0.9).move_to([X(a) + w / 2, y, 0]))
                lab = Text(txt, font="Geist", font_size=13, color=WHITE)
                lab.move_to([X(a), y - 0.32 - 0.2 * (j % 2), 0], aligned_edge=LEFT)
                self.add(lab)
        t = ValueTracker(0)
        head = always_redraw(lambda: Line([X(t.get_value()), top + 0.6, 0], [X(t.get_value()), top - gap * (len(rows) - 1) - 0.65, 0], stroke_width=3, color="#f2c14e"))
        clock = always_redraw(lambda: Text(f"{t.get_value():05.2f} s", font="Geist", font_size=24, color="#f2c14e").to_corner(UR, buff=0.35))
        self.add(head, clock)
        self.play(t.animate.set_value(dur), run_time=dur, rate_func=linear)
