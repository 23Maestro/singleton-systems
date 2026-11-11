"""23M-397 data contract. Plain Python: python3 test_station_data.py"""
import copy, glob, os
from station_data import load, check

HERE = os.path.dirname(os.path.abspath(__file__))
files = sorted(glob.glob(os.path.join(HERE, "players", "*.json")))
assert {os.path.basename(f) for f in files} >= {"lawrence-full-season.json", "burrow-w9.json"}, files
for f in files:
    d = load(f)
    assert 3 <= len(d["stats"]) <= 4 and d["kicker"] and d["title"], f
print("PASS", len(files), "data files load")

good = load(os.path.join(HERE, "players", "burrow-w9.json"))
assert good["kicker"] == "QB 9" and good["title"] == "JOE BURROW", (good["kicker"], good["title"])

def refused(mutate, why):
    d = copy.deepcopy(good); mutate(d)
    try:
        check(d)
    except ValueError:
        return
    raise AssertionError(f"accepted a file with {why}")

refused(lambda d: d.pop("photo"), "no photo")
refused(lambda d: d["colors"].pop("glow"), "no glow color")
refused(lambda d: d["stats"].append(dict(d["stats"][0], frame=280)) or d["stats"].append(dict(d["stats"][0], frame=285)), "5 stats")
refused(lambda d: d.update(stats=d["stats"][:2]), "2 stats")
refused(lambda d: d["stats"][1].update(value="5A"), "a value the number kit cannot build")
refused(lambda d: d["stats"][2].update(frame=d["frames"] + 5), "a cue after the last frame")
refused(lambda d: d["stats"][1].update(frame=5), "cues out of order")
refused(lambda d: d["colors"].update(glow="orange"), "a color that is not hex")
print("PASS contract refuses bad files")
