import copy
import importlib.util
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
SPEC = importlib.util.spec_from_file_location(
    "lineups_focal_guard", ROOT / ".codex/hooks/lineups_enforcement.py"
)
GUARD = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(GUARD)


class FocalPositionTests(unittest.TestCase):
    def setUp(self):
        self.assets = [
            {"nodeId": role, "layoutRole": role, "kind": kind, "centerX": center}
            for role, kind, center in [
                ("left", "photo", 320), ("center", "photo", 960),
                ("right", "photo", 1600), ("logo", "logo", 960),
            ]
        ]
        self.manifest = {"scene": {"lane": "asset swap"},
                         "figma": {"focalAssets": self.assets}}

    def readback(self, center=960, logo=960):
        rows = copy.deepcopy(self.assets)
        for row in rows:
            x = center if row["layoutRole"] == "center" else row["centerX"]
            if row["layoutRole"] == "logo":
                x = logo
            row["opaqueBounds"] = {"x": x - 100, "width": 200}
        return {"focalAssets": rows}

    def approve_center(self):
        self.assets[1].update(centerX=927.23, approvedException={
            "reviewer": "Jerami", "status": "approved",
            "source": "I made edits to the Figma source. You can export now.",
        })

    def test_default_centerline_still_passes(self):
        GUARD.validate_focal_asset_readback(self.manifest, self.readback())

    def test_unapproved_offset_still_fails(self):
        with self.assertRaises(GUARD.EnforcementError):
            GUARD.validate_focal_asset_readback(self.manifest, self.readback(927.23))

    def test_approved_user_position_passes(self):
        self.approve_center()
        GUARD.validate_focal_asset_readback(self.manifest, self.readback(927.23))

    def test_later_drift_from_user_position_fails(self):
        self.approve_center()
        with self.assertRaises(GUARD.EnforcementError):
            GUARD.validate_focal_asset_readback(self.manifest, self.readback(960))

    def test_incomplete_exception_does_not_approve_position(self):
        self.approve_center()
        del self.assets[1]["approvedException"]["reviewer"]
        with self.assertRaises(GUARD.EnforcementError):
            GUARD.validate_focal_asset_readback(self.manifest, self.readback(927.23))

    def test_center_exception_does_not_move_logo(self):
        self.approve_center()
        with self.assertRaises(GUARD.EnforcementError):
            GUARD.validate_focal_asset_readback(self.manifest, self.readback(927.23, 927.23))


if __name__ == "__main__":
    unittest.main()
