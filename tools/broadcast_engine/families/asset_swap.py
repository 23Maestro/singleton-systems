"""Lane 6 Asset Swap (named group) in Blender: 2-3 true-alpha people arrive by name and stay, on the team stadium.

Usage: Blender -b --factory-startup --python-exit-code 1 -P asset_swap.py -- <data.json> <out_dir> [still F,F,.. | anim] [half]

Layout (1920x1080, 25 fps): the team logo on the 960 px centreline at the top, then one column per person.
The first-named person stands in the centre and nearest the camera; the others stand either side, a step back,
so the camera move separates the layers. Each name sits centred above its person. Nobody replaces anybody.
Every person lands on the spoken cue of their name (scene frame 1 = scene time zero); an early cue gets a pre-roll.
This is a review proof family: not registered until Jerami approves it.
"""
import bpy, sys, os, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import scene3d as k

args = sys.argv[sys.argv.index("--") + 1:]
D = json.load(open(args[0])); OUT = args[1]; os.makedirs(OUT, exist_ok=True)
MODE = args[2] if len(args) > 2 else "still"
N, people = D["frames"], D["people"]

assert 2 <= len(people) <= 3, "2 or 3 people"
for p in people:
    for f in ("name", "cutout", "cue"): assert p.get(f) not in (None, ""), f"person needs {f}"
    assert os.path.exists(p["cutout"]), f"missing cutout {p['cutout']}"
assert [p["cue"] for p in people] == sorted(p["cue"] for p in people), "cues run in order"
assert os.path.exists(D["logo"]), "missing team logo"

PRE = max(0, 14 - people[0]["cue"])          # each person needs 13 frames to arrive
for p in people: p["frame"] = p["cue"] + PRE
N += PRE

k.setup(N, half="half" in args)
FOCUS = D["focus_team"]
STADIUM = k.stadium(FOCUS)
plate = k.plate(STADIUM["filePath"], STADIUM["depthPath"], OUT) if STADIUM else None
if not STADIUM: print(f"FLAG Stadium photo needed: {FOCUS}")

Z_LOGO, Z_NAME = 26.0, 21.0
# centre first, then left, then right; side people a step back from the camera
COLS = [(640, 1280, 20.0), (60, 700, 23.0), (1220, 1860, 23.0)][:len(people)]
if len(people) == 2: COLS = [(260, 900, 21.0), (1020, 1660, 21.0)]
TOP, FLOOR = 350, 1060

logo, lim = k.image_plane("Logo", D["logo"], Z_LOGO, glow=0.95); k.fit_image(logo, lim, 875, 80, 1045, 230, Z_LOGO)
if D.get("logo_in", "dust") == "dust": k.dust_in(logo, lim, 2, 16)
else: k.block_dissolve(logo, 2, 6)

built = []
for p, (u0, u1, z) in zip(people, COLS):
    ph, pim = k.image_plane(f"Person {p['name']}", p["cutout"], z, glow=1.0)
    k.fit_image(ph, pim, u0, TOP, u1, FLOOR, z)
    cu = (u0 + u1) / 2
    nm = k.text(p["name"].upper(), k.TEAM_FONT, "#FFFFFF", 64, Z_NAME, tier="team")
    k.shrink_to(nm, u1 - u0); k.put(nm, cu, TOP - 46, "CENTER", "CENTER")
    fl = k.floor_shadow(u0 + 60, u1 - 60, FLOOR, z, strength=0.6)
    f = p["frame"]
    k.rise(ph, f - 12, 12, dv=60)                 # steps up into place on the name
    k.pop(fl, f - 12, 12, "CUBIC")
    k.wipe(nm, f - 7, 7)
    built.append((p, ph, nm))

k.key_light()
k.hide_until_open(N)
k.camera(N, 21.0, move=(0.9, -0.8, -0.25))

for p, ph, nm in built:
    k.check_on_cue(ph, p["frame"], f"{p['name']} person", lead=13)
    k.check_on_cue(nm, p["frame"], f"{p['name']} name", lead=7)
k.check_in_frame([logo] + [o for b in built for o in b[1:]], (k.HOME, min(N, k.MOVE_END), N))
if plate: k.check_plate_cover(plate, N)
print("PASS people land on their names; PASS frame check; PASS stadium covers every frame")

json.dump({"focusTeam": FOCUS, "stadium": STADIUM, "flags": [] if STADIUM else [f"Stadium photo needed: {FOCUS}"],
           "preRoll": PRE, "sceneFrameOne": 1 + PRE,
           "cues": {p["name"]: p["frame"] for p in people},
           "dustFrames": [4] if D.get("logo_in", "dust") == "dust" else []},
          open(os.path.join(OUT, "scene-binding.json"), "w"), indent=1)
still = [int(x) for x in args[3].split(",")] if MODE == "still" and len(args) > 3 and args[3][0].isdigit() else [N]
k.finish(os.path.join(OUT, "asset-swap.blend"), OUT, MODE, still)
print("DONE", OUT)
