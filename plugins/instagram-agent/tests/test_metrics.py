import importlib.util
from pathlib import Path
import unittest

SOURCE = Path(__file__).resolve().parents[1] / "skills/ig-viral/swipe.py"
spec = importlib.util.spec_from_file_location("instagram_swipe", SOURCE)
swipe = importlib.util.module_from_spec(spec)
spec.loader.exec_module(swipe)


class MedianTests(unittest.TestCase):
    def test_outlier_uses_account_views_and_excludes_missing_baseline(self):
        rows = [
            {"account": "known", "followers": 1000, "median": 20, "views": 100, "hook": "I built this workflow"},
            {"account": "unknown", "followers": 10, "median": None, "views": 10000, "hook": "I built this too"},
        ]
        result = swipe.analyse(rows, [])
        known = next(r for r in result["reels"] if r["account"] == "known")
        unknown = next(r for r in result["reels"] if r["account"] == "unknown")
        self.assertEqual(known["outlier"], 5)
        self.assertIsNone(unknown["outlier"])
        self.assertIsNone(unknown["baseline"])
        self.assertEqual(result["ranked_n"], 1)

    def test_missing_all_medians_does_not_infer_a_winning_formula(self):
        result = swipe.analyse([{"account": "unknown", "followers": 10, "median": None, "views": 10000, "hook": "I built this"}], [])
        self.assertEqual(result["ranked_n"], 0)
        self.assertEqual(result["top_formulas"], [])
        self.assertIn("baseline: unknown", swipe.to_markdown(result))


if __name__ == "__main__":
    unittest.main()
