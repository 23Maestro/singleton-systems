"""Make the per-team stadium depth source once, with DepthFlow's Depth Anything V2 estimator.

Run with DepthFlow's own environment:
  ~/.local/share/depthflow-runtime/.venv/bin/python tools/broadcast_engine/stadium_depth.py [TEAM ...]

For each registered stadium photo (config/lineups/team-stadiums.json) it writes a 16-bit depth map
(white = near) beside a copy of the photo, then records both checksums in
config/lineups/team-stadium-depth.json. Blender builds displace the stadium plate with this map, so
camera moves get real parallax. A team whose source photo checksum changed is rebuilt; others are kept.
"""
import hashlib, json, os, sys
import numpy as np
from PIL import Image
from depthflow.estimators.anything import DepthAnythingV2

REPO = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
STADIUMS = os.path.join(REPO, "config/lineups/team-stadiums.json")
REGISTRY = os.path.join(REPO, "config/lineups/team-stadium-depth.json")
ROOT = "/Volumes/HomeSSD/Active Work/CATENA_MEDIA/references/team-stadium-depth"
MODEL = "base"

def sha(path): return hashlib.sha256(open(path, "rb").read()).hexdigest()
def slug(team): return team.lower().replace(" ", "-")

def main(only):
    teams = json.load(open(STADIUMS))["teams"]
    reg = json.load(open(REGISTRY)) if os.path.exists(REGISTRY) else {"schemaVersion": 1, "teams": []}
    done = {t["team"]: t for t in reg["teams"]}
    est = DepthAnythingV2(model=MODEL)
    for t in teams:
        if only and t["team"] not in only: continue
        assert sha(t["filePath"]) == t["sha256"], f"{t['team']} stadium photo checksum changed"
        prev = done.get(t["team"])
        if prev and prev["sourceSha256"] == t["sha256"] and os.path.exists(prev["depthPath"]): continue
        out = os.path.join(ROOT, slug(t["team"])); os.makedirs(out, exist_ok=True)
        rgb = np.asarray(Image.open(t["filePath"]).convert("RGB"))
        depth = np.asarray(est.estimate(rgb), dtype=np.float32)
        depth = (depth - depth.min()) / max(float(depth.max() - depth.min()), 1e-6)       # 0 far, 1 near
        depth = np.asarray(Image.fromarray(depth).resize((rgb.shape[1], rgb.shape[0]), Image.BICUBIC))
        dpath = os.path.join(out, "depth.png")
        Image.fromarray(np.clip(depth * 65535, 0, 65535).astype(np.uint16)).save(dpath)
        done[t["team"]] = {"team": t["team"], "eagleItemId": t["eagleItemId"], "sourcePath": t["filePath"],
                           "sourceSha256": t["sha256"], "depthPath": dpath, "depthSha256": sha(dpath),
                           "estimator": f"depthflow da2 {MODEL}"}
        print("depth", t["team"], dpath)
    reg["teams"] = sorted(done.values(), key=lambda x: x["team"])
    reg["rule"] = ("One depth map per team stadium, made once with DepthFlow. Blender builds displace the "
                   "stadium plate with it. Rebuild only when the registered photo changes.")
    json.dump(reg, open(REGISTRY, "w"), indent=2); open(REGISTRY, "a").write("\n")

if __name__ == "__main__":
    main(set(sys.argv[1:]))
