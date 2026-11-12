"""Lane 6 Asset Swap (named group) in Blender: 2-3 true-alpha people arrive on their names and stay, on the team stadium.

Usage: Blender -b --factory-startup --python-exit-code 1 -P asset_swap.py -- <data.json> <out_dir> [still F,F,.. | anim] [half]

Layout (1920x1080, 25 fps): the team logo on the 960 px centreline at the top, the people on rule-of-thirds columns.
Every cutout shares one framing (head to thigh or knee) and a matched head size; its cut edge sits below the frame,
so each person stands up through the picture. No name labels. Each person carries a soft drop shadow.
The first-named person stands in the centre, nearest the camera. Nobody replaces anybody.
Every person lands on the spoken cue of their name (scene frame 1 = scene time zero); an early cue gets a pre-roll.
This is a review proof family: not registered until Jerami approves it.

Data per person: name, cutout (trimmed alpha PNG), cue, height (px on screen), x (centre px). Optional "bottom" (default 1130).
People never touch: the nearest visible pixels of any two people stay at least "min_gap" px apart (default 60).
"""
import bpy, sys, os, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import scene3d as k
from mathutils import Vector

args = sys.argv[sys.argv.index("--") + 1:]
D = json.load(open(args[0])); OUT = args[1]; os.makedirs(OUT, exist_ok=True)
MODE = args[2] if len(args) > 2 else "still"
N, people = D["frames"], D["people"]

assert 2 <= len(people) <= 3, "2 or 3 people"
for p in people:
    for f in ("name", "cutout", "cue", "height", "x"): assert p.get(f) not in (None, ""), f"person needs {f}"
    assert os.path.exists(p["cutout"]), f"missing cutout {p['cutout']}"
    assert p.get("bottom", 1130) > 1080, f"{p['name']} must exit the bottom of the frame, never float"
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

Z_LOGO = 26.0
logo, lim = k.image_plane("Logo", D["logo"], Z_LOGO, glow=0.95); k.fit_image(logo, lim, 835, 40, 1085, 290, Z_LOGO)   # 250 px box
if D.get("logo_in", "dust") == "dust": k.dust_in(logo, lim, 2, 18)
else: k.block_dissolve(logo, 2, 6)

def alpha_shadow(o, im, du=16, dv=12, strength=0.55):
    """Soft drop shadow that follows the cutout's own alpha, just behind it."""
    sh = o.copy(); sh.data = o.data.copy(); bpy.context.scene.collection.objects.link(sh); sh.name = "Shadow " + o.name
    m = bpy.data.materials.new("Shadow " + o.name); m.use_nodes = True; nt = m.node_tree; pb = nt.nodes["Principled BSDF"]
    t = nt.nodes.new("ShaderNodeTexImage"); t.image = im
    mul = nt.nodes.new("ShaderNodeMath"); mul.operation = "MULTIPLY"; mul.inputs[1].default_value = strength
    nt.links.new(t.outputs["Alpha"], mul.inputs[0]); nt.links.new(mul.outputs[0], pb.inputs["Alpha"])
    pb.inputs["Base Color"].default_value = (0, 0, 0, 1); pb.inputs["Emission Strength"].default_value = 0.0
    pb.inputs["Roughness"].default_value = 1.0; m.surface_render_method = "BLENDED"
    sh.data.materials.clear(); sh.data.materials.append(m); sh.visible_shadow = False
    s_ = k.pscale(o.location.y); sh.location = o.location + Vector((du * s_, 0.05, -dv * s_))
    k.parent(sh, o); return sh

import numpy as np
def check_spacing(people, gap):
    """Paint each person's visible pixels on a quarter-scale 1920x1080 grid, grow them by gap/2, and fail on any overlap."""
    q, masks = 4, []
    for p in people:
        im = bpy.data.images.load(p["cutout"], check_existing=True); w0, h0 = im.size
        a = np.array(im.pixels[:]).reshape(h0, w0, 4)[::-1, :, 3] > 0.3
        h = p["height"]; w = h * w0 / h0; u0, v0 = p["x"] - w / 2, p.get("bottom", 1130) - h
        grid = np.zeros((1600 // q, 2400 // q), bool)              # room for people that exit the frame
        gh, gw = int(h / q), int(w / q)
        small = a[(np.arange(gh) * h0 / gh).astype(int)][:, (np.arange(gw) * w0 / gw).astype(int)]
        y0, x0 = int(v0 / q) + 100, int(u0 / q) + 100
        grid[y0:y0 + gh, x0:x0 + gw] |= small[:max(0, grid.shape[0] - y0), :max(0, grid.shape[1] - x0)]
        r = max(1, gap // (2 * q))
        for _ in range(r):                                            # grow by r cells (cross dilation)
            g = grid.copy(); g[1:] |= grid[:-1]; g[:-1] |= grid[1:]; g[:, 1:] |= grid[:, :-1]; g[:, :-1] |= grid[:, 1:]; grid = g
        masks.append((p["name"], grid))
    for i in range(len(masks)):
        for j in range(i + 1, len(masks)):
            assert not (masks[i][1] & masks[j][1]).any(), f"{masks[i][0]} and {masks[j][0]} are closer than {gap} px"
check_spacing(people, D.get("min_gap", 60))

built = []
for i, p in enumerate(people):
    z = 20.0 if i == 0 else 22.5          # first-named stands nearest
    ph, pim = k.image_plane(f"Person {p['name']}", p["cutout"], z, glow=1.0)
    h = p["height"]; w = h * pim.size[0] / pim.size[1]; b = p.get("bottom", 1130)
    k.fit_image(ph, pim, p["x"] - w / 2, b - h, p["x"] + w / 2, b, z)
    alpha_shadow(ph, pim)
    k.rise(ph, p["frame"] - 12, 12, dv=80)          # rises up through the bottom of the frame onto the name
    built.append((p, ph))

k.key_light()
k.hide_until_open(N)
k.camera(N, 21.0, move=(0.9, -0.8, -0.25))

for p, ph in built: k.check_on_cue(ph, p["frame"], f"{p['name']} person", lead=13)
k.check_in_frame([logo], (k.HOME, min(N, k.MOVE_END), N))      # people exit the bottom on purpose
if plate: k.check_plate_cover(plate, N)
print("PASS people land on their names; PASS logo in frame; PASS stadium covers every frame")

json.dump({"focusTeam": FOCUS, "stadium": STADIUM, "flags": [] if STADIUM else [f"Stadium photo needed: {FOCUS}"],
           "preRoll": PRE, "sceneFrameOne": 1 + PRE,
           "cues": {p["name"]: p["frame"] for p in people},
           "dustFrames": [4] if D.get("logo_in", "dust") == "dust" else []},
          open(os.path.join(OUT, "scene-binding.json"), "w"), indent=1)
still = [int(x) for x in args[3].split(",")] if MODE == "still" and len(args) > 3 and args[3][0].isdigit() else [N]
k.finish(os.path.join(OUT, "asset-swap.blend"), OUT, MODE, still)
print("DONE", OUT)
