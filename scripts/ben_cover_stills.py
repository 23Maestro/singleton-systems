"""Ben cover still checks: duplicate stills and eye-contact ranking."""
from pathlib import Path

import cv2
import numpy as np

# Calibrated 2026-10-20 on the 13 Ben stills: Courage 16.42s vs Carry 26.00s read as identical
# (color 5.5, IoU 0.86); different-outfit pairs sit at color >= 7.7.
MAX_COLOR_DIFF = 7.0
MIN_SILHOUETTE_IOU = 0.85
_THUMB = (54, 96)

# Still placed on each Ben cover in Figma (file H6qeI4wk4w3bqv5mBeb4PL, page "Ben / Teaching")
PICKS = {
    "02": "02-COURAGE DOESNT MEAN YOURE NOT AFRAID-16.417s.png",
    "14": "14-YOU WERENT MEANT TO CARRY IT ALL-19.667s.png",
}


def _load(still):
    still = Path(still)
    lab = cv2.cvtColor(cv2.resize(cv2.imread(str(still)), _THUMB, interpolation=cv2.INTER_AREA), cv2.COLOR_BGR2LAB)
    matte = cv2.imread(str(still.with_name("alpha-" + still.name)), cv2.IMREAD_UNCHANGED)[..., 3]
    return lab.astype(float), cv2.resize(matte, _THUMB, interpolation=cv2.INTER_AREA) > 128


def eye_contact_score(row):
    """Lower is closer to the lens. Row holds MediaPipe eyeLook* blendshapes and jaw."""
    down = (row["eyeLookDownLeft"] + row["eyeLookDownRight"] - row["eyeLookUpLeft"] - row["eyeLookUpRight"]) / 2
    side = (row["eyeLookInRight"] + row["eyeLookOutLeft"] - row["eyeLookInLeft"] - row["eyeLookOutRight"]) / 2
    return down + abs(side) + 0.15 * row["jaw"]


# Ben cutout only (Figma image filters, -1..1). Jerami tuned Carry Reel to +0.05 exposure / +0.08 saturation
# and asked for every cover except Gifted to match. Background stays as shot.
EXPOSURE_RANGE = (0.03, 0.07)
SATURATION_RANGE = (0.03, 0.2)
# Jerami: brighten every background except Gifted; exposure only, no recolor
BACKGROUND_EXPOSURE_RANGE = (0.03, 0.15)


def grade_problems(covers):
    """Covers are Figma readbacks: {frame, foreground: filters, background: filters}. Returns problem strings."""
    problems = []
    for c in covers:
        fg, bg = c.get("foreground") or {}, c.get("background") or {}
        for key, (lo, hi) in (("exposure", EXPOSURE_RANGE), ("saturation", SATURATION_RANGE)):
            if not lo <= fg.get(key, 0) <= hi:
                problems.append(f"{c['frame']}: foreground {key} {fg.get(key, 0)} outside {lo}..{hi}")
        lo, hi = BACKGROUND_EXPOSURE_RANGE
        if not lo <= bg.get("exposure", 0) <= hi:
            problems.append(f"{c['frame']}: background exposure {bg.get('exposure', 0)} outside {lo}..{hi}")
        if any(v for k, v in bg.items() if k != "exposure"):
            problems.append(f"{c['frame']}: background has non-exposure filters {bg}")
    return problems


def too_similar(still_a, still_b):
    """True when two stills show Ben in the same outfit and the same pose."""
    lab_a, mask_a = _load(still_a)
    lab_b, mask_b = _load(still_b)
    both = mask_a & mask_b
    iou = both.sum() / (mask_a | mask_b).sum()
    color = np.abs(lab_a[both] - lab_b[both]).mean()
    return bool(color < MAX_COLOR_DIFF and iou > MIN_SILHOUETTE_IOU)
