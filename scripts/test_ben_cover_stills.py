"""Ben cover still checks. Run: <venv>/bin/python -m unittest scripts/test_ben_cover_stills.py
Needs opencv + numpy and the generated stills on HomeSSD; skips when the drive is absent."""
from pathlib import Path
import unittest

import json

from ben_cover_stills import PICKS, eye_contact_score, grade_problems, too_similar

READBACK = Path(__file__).with_name("fixtures") / "ben-cover-grade-readback.json"

STILLS = Path("/Volumes/HomeSSD/Generated/745_CREATIVE/previews/2026-10-20-ben-eye-contact-opening")
COURAGE = STILLS / "02-COURAGE DOESNT MEAN YOURE NOT AFRAID-16.417s.png"
CARRY_DUPLICATE = STILLS / "14-YOU WERENT MEANT TO CARRY IT ALL-26.0s.png"
WAITING = STILLS / "09-WAITING ISNT DOING NOTHING-11.417s.png"


@unittest.skipUnless(STILLS.exists(), "HomeSSD stills not mounted")
class DistinctStillsTests(unittest.TestCase):
    def test_same_session_same_pose_reads_as_duplicate(self):
        # Jerami: Carry 26.00s and Courage 16.42s "still look identical"
        self.assertTrue(too_similar(COURAGE, CARRY_DUPLICATE))

    def test_different_outfit_is_distinct(self):
        self.assertFalse(too_similar(COURAGE, WAITING))

    def test_carry_cover_is_distinct_from_courage_cover(self):
        self.assertFalse(too_similar(STILLS / PICKS["02"], STILLS / PICKS["14"]))


# Measured MediaPipe rows (12 fps scan, 2026-10-20). Jerami's calibration pair:
# Don't Quit 4.33s has eye contact; Courage 0.75s looks low and off to the side.
DONT_QUIT_4_33 = {"eyeLookUpLeft": 0.061, "eyeLookUpRight": 0.06, "eyeLookDownLeft": 0.151, "eyeLookDownRight": 0.151,
                  "eyeLookInLeft": 0.02, "eyeLookInRight": 0.154, "eyeLookOutLeft": 0.148, "eyeLookOutRight": 0.03,
                  "jaw": 0.162}
COURAGE_0_75 = {"eyeLookUpLeft": 0.055, "eyeLookUpRight": 0.048, "eyeLookDownLeft": 0.14, "eyeLookDownRight": 0.168,
                "eyeLookInLeft": 0.014, "eyeLookInRight": 0.171, "eyeLookOutLeft": 0.205, "eyeLookOutRight": 0.03,
                "jaw": 0.028}


class EyeContactRankingTests(unittest.TestCase):
    def test_approved_eye_contact_outranks_rejected_frame(self):
        # Lower score = closer to the lens
        self.assertLess(eye_contact_score(DONT_QUIT_4_33), eye_contact_score(COURAGE_0_75))


class ForegroundGradeTests(unittest.TestCase):
    """Jerami tuned Carry Reel to +0.05 exposure / +0.08 saturation: "i think this is what they all need
    NOT INCLUDING gifted". Background stays as shot. Gifted keeps its approved grade and is not read back."""

    def cover(self, fg, bg=None, section="Seasons & purpose"):
        return {"frame": "test", "section": section, "foreground": fg, "background": {"exposure": 0.08} if bg is None else bg}

    def test_carry_touch_passes_in_every_section(self):
        for section in ("Growth & maturity", "Courage & perseverance", "Seasons & purpose", "Peace & relationships"):
            self.assertEqual(grade_problems([self.cover({"exposure": 0.05, "saturation": 0.08}, section=section)]), [])

    def test_earlier_drop_fails(self):
        self.assertTrue(grade_problems([self.cover({"exposure": -0.10, "saturation": 0.08})]))

    def test_strong_lift_fails(self):
        self.assertTrue(grade_problems([self.cover({"exposure": 0.12, "saturation": 0.08})]))

    def test_ungraded_foreground_fails(self):
        self.assertTrue(grade_problems([self.cover({})]))

    def test_heavy_saturation_fails(self):
        self.assertTrue(grade_problems([self.cover({"exposure": 0.05, "saturation": 0.5})]))

    def test_unbrightened_background_fails(self):
        # Jerami: "brighten the background of all of the other stills" (Gifted excluded)
        self.assertTrue(grade_problems([self.cover({"exposure": 0.05, "saturation": 0.08}, {})]))

    def test_slightly_brightened_background_passes(self):
        self.assertEqual(grade_problems([self.cover({"exposure": 0.05, "saturation": 0.08}, {"exposure": 0.08})]), [])

    def test_background_recolor_fails(self):
        self.assertTrue(grade_problems([self.cover({"exposure": 0.05, "saturation": 0.08}, {"exposure": 0.08, "saturation": 0.2})]))

    @unittest.skipUnless(READBACK.exists(), "no Figma readback saved")
    def test_every_live_ben_cover_is_graded(self):
        self.assertEqual(grade_problems(json.loads(READBACK.read_text())), [])


if __name__ == "__main__":
    unittest.main()
