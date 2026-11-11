"""Lane 5 Value Metrics family in Blender: related values that support one point (the Seattle 20 / 3 / 0 graphic).

Usage: Blender -b --factory-startup --python-exit-code 1 -P value_metrics.py -- <data.json> <out_dir> [still F,F,.. | anim] [half]

Layout (from the finished Figma comp, 1920x1080, 25 fps): team name top left in its accent colour, a title,
the team logo on the left, and 2-4 rows of LABEL, bar, VALUE on the right. Each row lands on its own cue frame.
Bars compare only rows that share a unit: points against points, trips against trips. A zero has no bar.
This is not a year table; years, if any, go in the labels.
"""
import bpy, sys, os, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import scene3d as k

args = sys.argv[sys.argv.index("--") + 1:]
D = json.load(open(args[0])); OUT = args[1]; os.makedirs(OUT, exist_ok=True)
MODE = args[2] if len(args) > 2 else "still"
N, rows = D["frames"], D["rows"]

# ---------------------------------------------------------------- contract
for f in ("team", "title", "logo", "accent", "bar_color"): assert D.get(f), f"value metrics needs {f}"
assert os.path.exists(D["logo"]), f"missing logo {D['logo']}"
assert 2 <= len(rows) <= 4, "2 to 4 rows"
for r in rows:
    for f in ("label", "value", "unit", "frame"): assert r.get(f) not in (None, ""), f"row needs {f}"
    assert isinstance(r["value"], (int, float)) and r["value"] >= 0, f"{r['label']} value must be a number >= 0"
    assert 15 <= r["frame"] <= N
assert [r["frame"] for r in rows] == sorted(r["frame"] for r in rows), "cue frames run in order"

k.setup(N, half="half" in args)
FOCUS = D.get("focus_team", D["team"])
STADIUM = k.stadium(FOCUS)
if STADIUM:
    # rows sit straight on the photo, so darken the photo itself (a dimming sheet would cut across the 3D turf)
    plate = k.plate(STADIUM["filePath"], STADIUM["depthPath"], OUT, glow=0.35, dark=0.6)
else:
    plate = None; print(f"FLAG Stadium photo needed: {FOCUS}")

Z_HEAD, Z_LOGO, Z_ROW, Z_VAL = 24.0, 21.0, 22.0, 21.7
F_TEAM, F_NUM = k.TEAM_FONT, k.SAIRA      # Antonio SemiBold for the team name; Saira for the title, labels and numbers
U0, U1 = 790, 1840                         # the rows block; the team name and title centre over it
CU = (U0 + U1) / 2

def glow_mat(hexc, n):
    """Bar fill: the team colour glowing hot enough to bloom, with a slow sparkle drifting through it."""
    m = k.flat_mat("Bar", hexc, glow=3.0, rough=0.3); nt = m.node_tree; p = nt.nodes["Principled BSDF"]
    tc = nt.nodes.new("ShaderNodeTexCoord"); nz = nt.nodes.new("ShaderNodeTexNoise"); nz.noise_dimensions = "4D"
    nz.inputs["Scale"].default_value = 3.0; nz.inputs["Detail"].default_value = 4
    nt.links.new(tc.outputs["Object"], nz.inputs["Vector"])
    nz.inputs["W"].default_value = 0.0; nz.inputs["W"].keyframe_insert("default_value", frame=1)
    nz.inputs["W"].default_value = n / 25 * 0.8; nz.inputs["W"].keyframe_insert("default_value", frame=n)
    for fc in k._fcurves(nt.animation_data.action):
        for kp in fc.keyframe_points: kp.interpolation = "LINEAR"
    rp = nt.nodes.new("ShaderNodeMapRange"); rp.inputs["From Min"].default_value = 0.45; rp.inputs["From Max"].default_value = 0.75
    rp.inputs["To Min"].default_value = 2.4; rp.inputs["To Max"].default_value = 5.5
    nt.links.new(nz.outputs["Fac"], rp.inputs["Value"]); nt.links.new(rp.outputs["Result"], p.inputs["Emission Strength"])
    return m

team = k.text(D["team"].upper(), F_TEAM, D["accent"], 58, Z_HEAD, tier="team"); k.put(team, 80, 62, "LEFT", "TOP")
title = k.text(D["title"].upper(), F_NUM, "#FFFFFF", 74, Z_HEAD, tier="flat"); k.put(title, CU, 168, "CENTER", "TOP")
logo, lim = k.image_plane("Logo", D["logo"], Z_LOGO, glow=0.95); k.fit_image(logo, lim, 90, 330, 720, 820, Z_LOGO)
logo_floor = k.floor_shadow(130, 680, 880, Z_LOGO, strength=0.55)

ys = {2: (480, 680), 3: (410, 590, 770), 4: (380, 520, 660, 800)}[len(rows)]
BAR_U0, BAR_MAX, BAR_H = 1330, 250, 40      # ends by 1580 so the widest number keeps clear air
peak = {}
for r in rows: peak[r["unit"]] = max(peak.get(r["unit"], 0), r["value"])
built = []
for r, y in zip(rows, ys):
    lab = k.text(r["label"].upper(), F_NUM, "#FFFFFF", 44, Z_ROW, tier="mid"); k.shrink_to(lab, BAR_U0 - U0 - 40)
    k.put(lab, U0, y, "LEFT", "CENTER")
    bar = None
    if r["value"] > 0:
        w = BAR_MAX * r["value"] / peak[r["unit"]]
        bar = k.slab(f"Bar {r['label']}", BAR_U0, y - BAR_H / 2, BAR_U0 + max(w, 16), y + BAR_H / 2, Z_ROW,
                     glow_mat(D["bar_color"], N), thick=0.12, bevel=0.05, origin="LEFT")
    shown = str(int(r["value"])) if float(r["value"]).is_integer() else str(r["value"])
    val = k.text(shown, F_NUM, "#FFFFFF", 112, Z_VAL, tier="flat"); k.put(val, U1, y, "RIGHT", "CENTER")
    f = r["frame"]
    # layer cake per row: label wipes on, the bar fills, then the number rises onto the cue
    k.wipe(lab, f - 16, 7)
    if bar: k.pop(bar, f - 12, 12, "CUBIC", axis=(0,))         # fills left to right and stops on the cue
    k.rise(val, f - 8, 8)
    built.append((r, lab, bar, val))

k.wipe(team, 4, 8)
k.rise(title, 10, 8)
if D.get("logo_in") == "dust": k.dust_in(logo, lim, 16, 16); k.pop(logo_floor, 26, 8, "CUBIC")
else: k.block_dissolve(logo, 16, 6); k.pop(logo_floor, 16, 6, "CUBIC")

k.key_light()
k.hide_until_open(N)
k.camera(N, Z_ROW, move=(0.9, -0.6, -0.2))

for r, lab, bar, val in built:
    k.check_on_cue(val, r["frame"], f"{r['label']} value", lead=9)
    if bar: k.check_on_cue(bar, r["frame"], f"{r['label']} bar", lead=13)
k.check_in_frame([team, title, logo] + [o for b in built for o in b[1:] if o], (k.HOME, min(N, k.MOVE_END), N))
if plate: k.check_plate_cover(plate, N)
print("PASS rows land on their cues; PASS frame check; PASS stadium covers every frame")

json.dump({"focusTeam": FOCUS, "stadium": STADIUM, "flags": [] if STADIUM else [f"Stadium photo needed: {FOCUS}"],
           "barScale": peak, "cues": {r["label"]: r["frame"] for r in rows}},
          open(os.path.join(OUT, "scene-binding.json"), "w"), indent=1)
still = [int(x) for x in args[3].split(",")] if MODE == "still" and len(args) > 3 and args[3][0].isdigit() else [N]
k.finish(D.get("master") or os.path.join(OUT, "value-metrics.blend"), OUT, MODE, still, bloom=0.4)
print("DONE", OUT)
