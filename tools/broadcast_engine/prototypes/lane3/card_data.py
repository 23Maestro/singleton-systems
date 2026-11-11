"""Lane 3 card contract. One JSON file per player per episode fills the card; the layout and motion never change.

Required: position, number, name, team, cutout (PNG with alpha, from Figma), logo (PNG with alpha),
colors {panel, tag, tag_text, badge} as #RRGGBB, stats (3 or 4 of value/label/frame), frames.
Optional: tagline + tagline_frame.
Frames are absolute at 25 fps and come from that episode's edit, so a new edit only changes the frame numbers.
"""
import json, re

HEX = re.compile(r"^#[0-9A-Fa-f]{6}$")

def check(d):
    def need(cond, msg):
        if not cond: raise ValueError(msg)
    for k in ("position", "number", "name", "team", "cutout", "logo"):
        need(isinstance(d.get(k), str) and d[k].strip(), f"{k} is required")
    c = d.get("colors") or {}
    for k in ("panel", "tag", "tag_text", "badge"):
        need(isinstance(c.get(k), str) and HEX.match(c[k]), f"colors.{k} must be #RRGGBB")
    need(isinstance(d.get("frames"), int) and d["frames"] > 0, "frames must be a positive int")
    s = d.get("stats")
    need(isinstance(s, list) and 3 <= len(s) <= 4, "stats needs 3 or 4 entries")
    for x in s:
        need(isinstance(x.get("value"), str) and x["value"].strip(), "every stat needs a value")
        need(isinstance(x.get("label"), str) and x["label"].strip(), "every stat needs a label")
        need(isinstance(x.get("frame"), int) and 1 <= x["frame"] <= d["frames"], f"cue {x.get('frame')} is outside 1..frames")
    fr = [x["frame"] for x in s]
    need(fr == sorted(fr), "cue frames must rise in order")
    if d.get("tagline"):
        tf = d.get("tagline_frame")
        need(isinstance(tf, int) and 1 <= tf <= d["frames"], "tagline needs tagline_frame inside 1..frames")
    d["name_lines"] = d["name"].upper().split(None, 1)
    return d

def load(path):
    with open(path) as f:
        return check(json.load(f))
