"""Lane 3 card data contract (23M-397/398). Plain Python: python3 test_card_data.py"""
import copy, glob, os
from card_data import load, check

HERE = os.path.dirname(os.path.abspath(__file__))
files = sorted(glob.glob(os.path.join(HERE, "cards", "*.json")))
assert any(f.endswith("simmons-w9.json") for f in files), files
for f in files:
    d = load(f)
    for k in ("cutout", "logo"): assert os.path.isfile(d[k]), f"{f}: {k} missing on disk: {d[k]}"
print("PASS", len(files), "card files load and their art exists")

good = load(os.path.join(HERE, "cards", "simmons-w9.json"))
assert good["name_lines"] == ["JEFFERY", "SIMMONS"], good["name_lines"]

def refused(mutate, why):
    d = copy.deepcopy(good); mutate(d)
    try: check(d)
    except ValueError: return
    raise AssertionError(f"accepted a card with {why}")

refused(lambda d: d.pop("cutout"), "no cutout")
refused(lambda d: d.pop("logo"), "no logo")
refused(lambda d: d.pop("position"), "no position")
refused(lambda d: d["colors"].pop("panel"), "no panel color")
refused(lambda d: d["colors"].update(tag="orange"), "a non-hex color")
refused(lambda d: d.update(stats=d["stats"][:2]), "2 stats")
refused(lambda d: d.update(stats=d["stats"] * 2), "6 stats")
refused(lambda d: d["stats"][0].update(value=""), "an empty stat value")
refused(lambda d: d["stats"][2].update(frame=d["frames"] + 1), "a cue after the last frame")
refused(lambda d: d["stats"][1].update(frame=1), "cues out of order")
refused(lambda d: d.update(tagline_frame=None), "a tagline with no cue")
print("PASS contract refuses bad cards")
