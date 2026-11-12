"""Lane 4 Team Cards family in Blender: two satin cards with real depth and camera parallax.

Usage: Blender -b --factory-startup --python-exit-code 1 -P team_cards.py -- <data.json> <out_dir> [still F,F,.. | anim] [half]

Layouts (from the finished Unreal comps, 1920x1080, 25 fps):
  pair  - two teams side by side: VS / result / separate talking points. Card value is a record, score or word;
          the footer names the team. Centre mark is optional ("VS", "FINAL" or none).
  rank  - the same team at two points in time: team-name title, "#4 / LAST WEEK" -> "#10 / THIS WEEK",
          an up or down arrow and a "DOWN 6" line.
Every card lands on its own cue frame (absolute, 25 fps, from the episode's spoken cues).
The stadium is the focus team's registered photo; a missing one is flagged, never swapped for another.
"""
import bpy, sys, os, json, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import scene3d as k
from mathutils import Vector

args = sys.argv[sys.argv.index("--") + 1:]
D = json.load(open(args[0])); OUT = args[1]; os.makedirs(OUT, exist_ok=True)
MODE = args[2] if len(args) > 2 else "still"
N, LAYOUT, cards = D["frames"], D["layout"], D["cards"]

# ---------------------------------------------------------------- per-episode timing
# A card's "cue" is the spoken frame its value must be readable on (scene frame 1 = scene time zero).
# The stack needs 30 frames (12-frame swing, value 18 after the card), so an early cue gets a pre-roll:
# the render starts PRE frames before the scene and the editor places it that much earlier.
for c in cards:
    if "cue" in c: c["frame"] = c["cue"] - 18
PRE = max(0, 13 - min(c["frame"] for c in cards))
for c in cards: c["frame"] += PRE
for key in ("center", "rank", "line"):
    if D.get(key) and "frame" in D[key]: D[key]["frame"] += PRE
N += PRE

# ---------------------------------------------------------------- contract
assert LAYOUT in ("pair", "rank"), "layout is pair or rank"
assert len(cards) == 2, "team cards come in twos"
for c in cards:
    for f in ("team", "logo", "color", "value", "label", "frame"): assert c.get(f) not in (None, ""), f"card needs {f}"
    assert os.path.exists(c["logo"]), f"missing logo {c['logo']}"
    assert 13 <= c["frame"] <= N, f"{c['team']} cue {c['frame']} outside 13..{N}"
if LAYOUT == "rank":
    assert cards[0]["team"] == cards[1]["team"], "rank cards show one team at two points in time"
    assert D["rank"]["direction"] in ("up", "down") and D["rank"]["text"] and D["rank"]["frame"] <= N
assert cards[0]["frame"] <= cards[1]["frame"], "cue frames run in order"

k.setup(N, half="half" in args)
FOCUS = D.get("focus_team", cards[0]["team"])
STADIUM = k.stadium(FOCUS)
plate = k.plate(STADIUM["filePath"], STADIUM["depthPath"], OUT) if STADIUM else None
if not STADIUM: print(f"FLAG Stadium photo needed: {FOCUS}")

F_TEAM, F_NUM = k.TEAM_FONT, k.SAIRA      # Antonio SemiBold for team names; Saira for numbers and supporting words
Z_TITLE, Z_FRAME, Z_FACE, Z_ON, Z_MARK = 24.0, 22.08, 22.0, 21.85, 20.0

# ---------------------------------------------------------------- one card: metal rim, satin face, dark footer, logo, value, label
if LAYOUT == "pair":
    BOXES = [(100, 188, 840, 848), (1080, 188, 1820, 848)]
    LOGO_BOX, VAL, FOOT_H, VAL_CAP, FOOT_CAP = (70, 24, 670, 360), 462, 112, 140, 52
else:
    BOXES = [(52, 328, 684, 888), (1236, 328, 1868, 888)]
    LOGO_BOX, VAL, FOOT_H, VAL_CAP, FOOT_CAP = (110, 18, 522, 236), 348, 88, 128, 46   # number sits low so the logo has room

def card(c, box, side):
    u0, v0, u1, v1 = box
    # card surface: brushed team metal by default (approved Nov 11); "satin" keeps the older satin v2 face
    surf = k.satin_mat(f"Satin {side}", c["color"]) if D.get("surface") == "satin" else k.brushed_mat(f"Metal {side}", c["color"], sweep_at=c["frame"] + 2)
    face = k.slab(f"Face {side}", u0, v0, u1, v1, Z_FACE, surf, thick=0.14, bevel=0.035,
                  origin="LEFT" if side == 0 else "RIGHT")
    rim = k.slab(f"Rim {side}", u0 - 7, v0 - 7, u1 + 7, v1 + 7, Z_FRAME, k.flat_mat("Rim", "#B9C0C8", glow=0.25, rough=0.3, metal=0.9),
                 thick=0.1, bevel=0.03)
    foot = k.slab(f"Foot {side}", u0, v1 - FOOT_H, u1, v1, Z_FACE - 0.03, k.flat_mat("Foot", "#0B0D10", glow=0.0, rough=0.55),
                  thick=0.05, bevel=0.01)
    lu0, lv0, lu1, lv1 = LOGO_BOX
    logo, lim = k.image_plane(f"Logo {side}", c["logo"], Z_ON, glow=0.95)
    k.fit_image(logo, lim, u0 + lu0, v0 + lv0, u0 + lu1, v0 + lv1, Z_ON)   # LOGO_BOX is in card pixels, centred on the card
    val = k.text(c["value"].upper(), F_NUM, "#FFFFFF", VAL_CAP, Z_ON, tier="flat")
    k.shrink_to(val, (u1 - u0) - 90); k.put(val, (u0 + u1) / 2, v0 + VAL, "CENTER", "CENTER")
    is_team = c["label"].upper() == c["team"].upper()
    lab = k.text(c["label"].upper(), F_TEAM if is_team else F_NUM, "#FFFFFF", FOOT_CAP, Z_ON, tier="team" if is_team else "mid")
    k.shrink_to(lab, (u1 - u0) - 60); k.put(lab, (u0 + u1) / 2, v1 - FOOT_H / 2, "CENTER", "CENTER")
    floor = k.floor_shadow(u0, u1, v1, Z_FACE)
    for o in (rim, foot, logo, val, lab, floor): k.parent(o, face)
    # land on the cue: the card swings in on its outer edge, then logo, value and footer settle on it
    f = c["frame"]
    # layer cake: the card lands on the cue, then logo, value and footer stack on in turn
    k.pop(face, f - 12, 12, "EXPO", axis=(0,)); k.turn(face, f - 12, 12, -70 if side == 0 else 70)
    k.dust_in(logo, lim, f + 2, 16) if D.get("logo_in", "dust") == "dust" else k.block_dissolve(logo, f + 2, 6)
    k.rise(val, f + 10, 8)
    k.wipe(lab, f + 15, 7)
    return face, logo, val, lab

built = [card(c, b, i) for i, (c, b) in enumerate(zip(cards, BOXES))]
extra = []

# ---------------------------------------------------------------- centre: VS / FINAL, or the rank arrow and its line
if LAYOUT == "pair" and D.get("center"):
    vs = D["center"]["text"].upper() == "VS"           # VS sits between the cards; FINAL and other marks sit under them
    m = k.text(D["center"]["text"].upper(), F_NUM, "#FFFFFF", 96, Z_MARK, tier="flat")
    if vs: k.shrink_to(m, 190)
    k.put(m, 960, 508 if vs else 958, "CENTER", "CENTER")
    f = max(D["center"]["frame"], cards[1]["frame"] + 30)     # after both card stacks finish
    k.pop(m, f - 8, 8, "BACK"); extra.append(m)
if LAYOUT == "pair" and D.get("line"):                 # a spoken line under the cards, e.g. MARK'S PICK
    ln = k.text(D["line"]["text"].upper(), F_NUM, "#FFFFFF", 64, Z_FACE - 0.4, tier="flat")
    k.shrink_to(ln, 1700); k.put(ln, 960, 958, "CENTER", "CENTER")
    k.wipe(ln, D["line"]["frame"] - 8, 8); extra.append(ln)
if LAYOUT == "rank":
    t = k.text(cards[0]["team"].upper(), F_TEAM, "#FFFFFF", 100, Z_TITLE, tier="team"); k.put(t, 960, 150, "CENTER", "TOP")
    k.wipe(t, 4, 10); extra.append(t)
    r = D["rank"]; up = r["direction"] == "up"; col = "#3DDC84" if up else "#F26B6B"
    shaft = [(0.32, 0), (0.68, 0), (0.68, 0.58), (1, 0.58), (0.5, 1), (0, 0.58), (0.32, 0.58)]
    if up: shaft = [(x, 1 - y) for x, y in shaft]
    arrow = k.slab("Arrow", 880, 440, 1040, 700, Z_MARK, k.flat_mat("Arrow", col, glow=0.9, rough=0.35), thick=0.5, bevel=0.06, pts=shaft)
    f = max(r["frame"], cards[1]["frame"] + 30); key_from = 260 if up else -260     # after both card stacks
    k.slide(arrow, f - 10, dv=key_from, dur=10, interp="BACK"); k.turn(arrow, f - 10, 10, 90)
    afl = k.floor_shadow(880, 1040, BOXES[0][3], Z_MARK, strength=0.5); k.pop(afl, f - 10, 10, "CUBIC")   # pool grows as it lands
    ln = k.text(r["text"].upper(), F_NUM, "#FFFFFF", 92, Z_FACE - 0.4, tier="flat"); k.put(ln, 960, 980, "CENTER", "CENTER")
    k.wipe(ln, f + 3, 8); extra += [arrow, ln]

k.key_light()
k.hide_until_open(N)
k.camera(N, Z_FACE, move=(0.9, -1.2, -0.25))   # wide layout: truck right while easing back so the outer cards keep their margin

# ---------------------------------------------------------------- checks
for c, (face, logo, val, lab) in zip(cards, built):
    k.check_on_cue(face, c["frame"], f"{c['team']} card", lead=13)
    k.check_on_cue(val, c["frame"] + 18, f"{c['team']} value", lead=9)   # stacks on after the card
if LAYOUT == "pair" and D.get("line"): k.check_on_cue(ln, D["line"]["frame"], "line", lead=8)
k.check_in_frame([o for b in built for o in b] + extra, (k.HOME, min(N, k.MOVE_END), N))
if plate: k.check_plate_cover(plate, N)
print("PASS cards land on their cues; PASS frame check; PASS stadium covers every frame")

json.dump({"layout": LAYOUT, "focusTeam": FOCUS, "stadium": STADIUM,
           "flags": [] if STADIUM else [f"Stadium photo needed: {FOCUS}"],
           "preRoll": PRE, "sceneFrameOne": 1 + PRE,     # render frame that is scene time zero
           "cues": {c["team"] + " / " + c["label"]: c["frame"] for c in cards},
           "dustFrames": [c["frame"] + 2 for c in cards] if D.get("logo_in", "dust") == "dust" else []},
          open(os.path.join(OUT, "scene-binding.json"), "w"), indent=1)
still = [int(x) for x in args[3].split(",")] if MODE == "still" and len(args) > 3 and args[3][0].isdigit() else [N]
k.finish(D.get("master") or os.path.join(OUT, "team-cards.blend"), OUT, MODE, still)
print("DONE", OUT)
