"""Behavior checks at the reviewed comparison request boundary."""

import os
import unittest

from tools.lineups_unreal.comparison import ComparisonError, build_comparison


class ComparisonRequestTests(unittest.TestCase):
    def test_stat_card_rejects_text_below_the_approved_36_pixel_floor(self):
        request = {
            "mode": "statistics",
            "headline": "2025 STATS",
            "card": {
                "fontSize": 35,
                "rows": [{"label": "GAMES", "left": "14", "right": "17",
                          "source": "https://www.nfl.com/players/josh-allen/stats/"}],
            },
        }
        with self.assertRaisesRegex(ComparisonError, "36"):
            build_comparison(request)

    def test_statistics_request_cannot_overfill_the_five_row_card(self):
        request = {"mode": "statistics", "card": {"fontSize": 44, "rows": [
            {"label": "EXTRA", "left": "1", "right": "2", "source": "NFL.com"}
            for _ in range(6)
        ]}}
        with self.assertRaisesRegex(ComparisonError, "1 to 5"):
            build_comparison(request)

    def test_statistics_without_a_source_are_rejected(self):
        request = stats_request()
        request["card"]["rows"][0]["source"] = ""
        with self.assertRaisesRegex(ComparisonError, "source"):
            build_comparison(request)


@unittest.skipUnless(os.environ.get("LINEUPS_UNREAL_LIVE") == "1", "needs the live Unreal trial")
class ComparisonEditorTests(unittest.TestCase):
    def test_conceptual_comparison_saves_one_scene_with_the_card_collapsed(self):
        result = build_comparison({
            "mode": "conceptual", "headline": "COMPARISON TITLE",
            "assetName": "WBP_BoundaryCheck",
            "players": ["PATRICK MAHOMES", "JOSH ALLEN"],
        })
        self.assertEqual(result["assetPath"], "/Game/Lineups/Trials/TwoUp/WBP_BoundaryCheck")
        self.assertEqual(result["cardVisibility"], "Collapsed")
        self.assertEqual(result["rowCount"], 0)
        self.assertTrue(result["saved"])

    def test_statistics_request_saves_readable_sourced_rows_in_the_same_scene(self):
        result = build_comparison(stats_request())
        self.assertEqual(result["assetPath"], "/Game/Lineups/Trials/TwoUp/WBP_BoundaryCheck")
        self.assertEqual(result["cardVisibility"], "Visible")
        self.assertEqual(result["rowCount"], 4)
        self.assertEqual(result["rows"][1]["left"], "3,587")
        self.assertEqual(result["rows"][1]["right"], "3,668")
        self.assertTrue(all(row["minimumFontSize"] >= 36 for row in result["rows"]))
        self.assertAlmostEqual(result["logoCenters"][0], result["logoCenters"][1], places=2)

    def test_switching_to_conceptual_preserves_the_scene_and_artwork(self):
        request = stats_request()
        statistical = build_comparison(request)
        request["mode"] = "conceptual"
        conceptual = build_comparison(request)
        self.assertEqual(conceptual["assetPath"], statistical["assetPath"])
        self.assertEqual(conceptual["artworkSignature"], statistical["artworkSignature"])
        self.assertEqual(conceptual["cardVisibility"], "Collapsed")
        self.assertEqual(conceptual["rowCount"], 0)

    def test_a_shorter_breakdown_does_not_leave_old_rows_on_screen(self):
        request = stats_request()
        build_comparison(request)
        request["card"]["rows"] = request["card"]["rows"][:1]
        result = build_comparison(request)
        self.assertEqual(result["visibleLabels"], ["GAMES"])


def stats_request():
    source = "https://www.nfl.com/players/patrick-mahomes/stats/ ; https://www.nfl.com/players/josh-allen/stats/"
    return {"mode": "statistics", "headline": "2025 STATS", "assetName": "WBP_BoundaryCheck",
            "players": ["PATRICK MAHOMES", "JOSH ALLEN"], "card": {"fontSize": 44, "rows": [
                {"label": label, "left": left, "right": right, "source": source}
                for label, left, right in [("GAMES", "14", "17"), ("PASS YDS", "3,587", "3,668"),
                                            ("PASS TD", "22", "25"), ("INT", "11", "10")]]}}


if __name__ == "__main__":
    unittest.main()
