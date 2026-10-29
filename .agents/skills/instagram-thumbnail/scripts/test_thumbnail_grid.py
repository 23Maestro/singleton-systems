import copy
import json
from pathlib import Path
import unittest
from thumbnail_grid import contains, plan


class CropPlanTests(unittest.TestCase):
    def setUp(self):
        self.layout = json.loads((Path(__file__).parents[1] / "references/layout.example.json").read_text())

    def test_john_block_leaves_80_pixels_without_resizing(self):
        r = plan(self.layout)
        g = r["groups"][0]
        self.assertEqual((g["dx"], g["dy"]), (0, -256))
        for key in ("width", "height"):
            self.assertEqual(g["before"][key], g["after"][key])
        self.assertEqual(1680 - g["after"]["y"] - g["after"]["height"], 80)

    def test_fitted_copy_does_not_move(self):
        self.layout["groups"][0]["bounds"]["y"] = 1076
        self.assertEqual(plan(self.layout)["groups"][0]["dy"], 0)

    def test_top_clipping_moves_down(self):
        self.layout["groups"][0]["bounds"]["y"] = 200
        self.assertEqual(plan(self.layout)["groups"][0]["dy"], 120)

    def test_oversized_copy_needs_layout_change(self):
        self.layout["groups"][0]["bounds"]["height"] = 1500
        g = plan(self.layout)["groups"][0]
        self.assertFalse(g["fits"])
        self.assertIsNone(g["dy"])

    def test_invalid_crop_and_unknown_evidence_fail(self):
        for edit in ({"source": ""}, {"height": 2000}, {"status": "verified-everywhere"}, {"y": float("nan")}):
            layout = copy.deepcopy(self.layout)
            layout["crop"].update(edit)
            with self.assertRaises(ValueError):
                plan(layout)

    def test_moves_fit_multiple_edges_and_leave_input_intact(self):
        for x, y in ((-30, -10), (100, 1700), (400, 1800), (64, 1000)):
            layout = copy.deepcopy(self.layout)
            layout["groups"][0]["bounds"].update(x=x, y=y)
            original = copy.deepcopy(layout)
            r = plan(layout)
            self.assertTrue(contains(r["safe"], r["groups"][0]["after"]))
            self.assertEqual(layout, original)


if __name__ == "__main__":
    unittest.main()
