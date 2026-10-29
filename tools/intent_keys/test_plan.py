"""Regression cases for trim-aware spoken-word graphics."""

import unittest
from fractions import Fraction

from tools.intent_keys.plan import (
    PlanError, build_timeline, map_point, map_cue, match_word_anchor,
    frame_number, validate_flubs, verify_bindings,
    build_plan, validate_manim,
)


class PlanTests(unittest.TestCase):
    def setUp(self):
        self.rows = [
            {"sourceFile": "a.mp4", "sourceIn": 0, "sourceOut": 1.2,
             "targetIn": 999, "targetOut": 999},
            {"sourceFile": "a.mp4", "sourceIn": 5.2, "sourceOut": 20.8},
            {"sourceFile": "b.mp4", "sourceIn": 10, "sourceOut": 15},
        ]
        self.timeline = build_timeline(self.rows, {"a.mp4": 20.8, "b.mp4": 15}, Fraction(30))

    def test_recomputes_targets_after_removed_arrow_hold(self):
        self.assertEqual(map_point(self.timeline, "a.mp4", 16), 360)
        self.assertEqual(self.timeline[-1]["targetOutFrame"], 654)

    def test_removed_material_and_exclusive_out_do_not_get_cues(self):
        for point in [1.2, 3, 20.8]:
            with self.subTest(point=point), self.assertRaises(PlanError):
                map_point(self.timeline, "a.mp4", point)

    def test_a_cut_boundary_is_assigned_to_next_retained_range(self):
        rows = [{"sourceFile": "x", "sourceIn": 0, "sourceOut": 1},
                {"sourceFile": "x", "sourceIn": 1, "sourceOut": 2}]
        timeline = build_timeline(rows, {"x": 2}, Fraction(30))
        self.assertEqual(map_point(timeline, "x", 1), 30)

    def test_rejects_overlapping_source_ranges(self):
        rows = [{"sourceFile": "x", "sourceIn": 0, "sourceOut": 2},
                {"sourceFile": "x", "sourceIn": 1, "sourceOut": 3}]
        with self.assertRaises(PlanError):
            build_timeline(rows, {"x": 3}, Fraction(30))

    def test_rejects_out_of_source_trim(self):
        with self.assertRaises(PlanError):
            build_timeline(self.rows, {"a.mp4": 19, "b.mp4": 15}, Fraction(30))

    def test_cue_hold_stops_at_editorial_cut(self):
        cue = {"sourceClip": "a.mp4", "sourceSeconds": 20, "durationSeconds": 3.2}
        result = map_cue(self.timeline, cue)
        self.assertEqual(result["durationFrames"], 24)
        self.assertTrue(result["holdClampedAtCut"])

    def test_frame_rounding_is_half_up_and_rational(self):
        self.assertEqual(frame_number("0.05", Fraction(30)), 2)
        self.assertEqual(frame_number("10.01", Fraction(30000, 1001)), 300)

    def test_word_window_offset_and_punctuation(self):
        tokens = [{"text": " Control,", "offsets": {"from": 400, "to": 900}},
                  {"text": " A.", "offsets": {"from": 900, "to": 1100}}]
        result = match_word_anchor(tokens, "15.4", "Control A", offset=15)
        self.assertEqual(result["sourceEndSeconds"], 16.1)

    def test_rejects_phrase_not_in_words_and_wrong_word_time(self):
        tokens = [{"text": " tab", "offsets": {"from": 16980, "to": 17630}},
                  {"text": " button", "offsets": {"from": 17630, "to": 18990}}]
        for phrase, seconds in [("tab tab", 254.98), ("tab", 255)]:
            with self.subTest(phrase=phrase), self.assertRaises(PlanError):
                match_word_anchor(tokens, seconds, phrase, offset=238)

    def test_flubs_cannot_be_silently_removed(self):
        flubs = [{"value": 0, "sourceFile": "a.mp4", "sourceSeconds": 0},
                 {"value": 1, "sourceFile": "a.mp4", "sourceSeconds": 3}]
        with self.assertRaises(PlanError):
            validate_flubs(self.timeline, flubs)

    def test_stale_transcript_binding_is_rejected(self):
        with self.assertRaises(PlanError):
            verify_bindings({"transcript": "old"}, {"transcript": "new"})

    def test_zero_frame_cue_is_rejected(self):
        with self.assertRaises(PlanError):
            map_cue(self.timeline, {"sourceClip": "a.mp4", "sourceSeconds": 16,
                                    "durationSeconds": 0})

    def test_manim_rejects_a_graphic_that_runs_across_a_cut(self):
        plan = {"fps": {"numerator": 30, "denominator": 1}, "ranges": self.timeline,
                "wordCues": [], "sourceBindings": {}, "candidates": [
                    {"row": 0, "targetFrame": 20, "targetSeconds": 20 / 30,
                     "durationFrames": 40}]}
        with self.assertRaises(PlanError):
            validate_manim(plan)


if __name__ == "__main__":
    unittest.main()
