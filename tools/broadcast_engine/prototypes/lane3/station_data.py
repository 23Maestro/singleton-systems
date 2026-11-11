"""Lane 3 station data contract (23M-397). One JSON file fills one station. No bpy, so it tests in plain Python.

Required: photo, colors.glow, colors.accent, stats (3 or 4 of value/label/frame), frames.
Player cards add position, number, name; kicker and title default to "QB 9" and "JOE BURROW".
Optional: kicker, title, total (value/label/frame, the hero number), tagline + tagline_frame, photo_center_x (0-1).
Frames are absolute at 25 fps, copied from the cue schedule of the source card.
"""
import json, re

GLYPHS = set("0123456789,+%.")          # must match lane3.GLYPHS
HEX = re.compile(r"^#[0-9A-Fa-f]{6}$")

def check(d):
    def need(cond, msg):
        if not cond: raise ValueError(msg)
    need(isinstance(d.get("photo"), str) and d["photo"], "photo is required")
    c = d.get("colors") or {}
    for k in ("glow", "accent"):
        need(isinstance(c.get(k), str) and HEX.match(c[k]), f"colors.{k} must be #RRGGBB")
    need(isinstance(d.get("frames"), int) and d["frames"] > 0, "frames must be a positive int")
    if "kicker" not in d or "title" not in d:
        for k in ("position", "number", "name"):
            need(d.get(k), f"{k} is required when kicker or title is missing")
        d.setdefault("kicker", f"{d['position']} {d['number']}".upper())
        d.setdefault("title", d["name"].upper())
    s = d.get("stats")
    need(isinstance(s, list) and 3 <= len(s) <= 4, "stats needs 3 or 4 entries")
    hits = list(s) + ([d["total"]] if d.get("total") else [])
    for x in hits:
        need(x.get("label"), "every stat needs a label")
        need(x.get("value") and set(x["value"]) <= GLYPHS, f"value {x.get('value')!r} uses a glyph the number kit lacks")
        need(isinstance(x.get("frame"), int) and 1 <= x["frame"] <= d["frames"], f"cue {x.get('frame')} is outside 1..frames")
    fr = [x["frame"] for x in hits]
    need(fr == sorted(fr), "cue frames must rise in order")
    if d.get("tagline"):
        need(isinstance(d.get("tagline_frame"), int) and 1 <= d["tagline_frame"] <= d["frames"], "tagline needs tagline_frame inside 1..frames")
    return d

def load(path):
    with open(path) as f:
        return check(json.load(f))
