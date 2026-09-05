import json
import tempfile
import unittest
from pathlib import Path

from tools.lineups_motion import CueContract, CueContractError


def manifest():
    return {
        "schemaVersion": 2,
        "motion": {
            "engine": "manim",
            "engineVersion": "0.19.0",
            "frameRate": {"numerator": 24000, "denominator": 1001},
            "sourcePath": "scene.py",
            "sceneClass": "ProofScene",
            "cues": [
                {
                    "cueId": "yards",
                    "elementId": "rush-yards",
                    "triggerType": "WORD",
                    "triggerText": "yards",
                    "transcriptTimestamp": 634.05,
                    "sceneTime": 1.55,
                    "action": "reveal",
                    "duration": 0.45,
                }
            ],
        },
        "timing": {"verifiedAnchorTimestamp": 632.5},
        "export": {"dimensions": {"width": 1920, "height": 1080}},
    }


class CueContractTests(unittest.TestCase):
    def test_reads_exact_cue_math(self):
        contract = CueContract(manifest())
        self.assertAlmostEqual(float(contract.frame_rate), 24000 / 1001)
        self.assertAlmostEqual(contract.cue("yards").scene_time, 1.55)
        self.assertAlmostEqual(contract.delay_until("yards", 0), 1.55)

    def test_rejects_anchor_drift(self):
        value = manifest()
        value["motion"]["cues"][0]["sceneTime"] = 1.6
        with self.assertRaisesRegex(CueContractError, "verified transcript anchor"):
            CueContract(value)

    def test_rejects_scene_that_passed_a_cue(self):
        contract = CueContract(manifest())
        with self.assertRaisesRegex(CueContractError, "passed cue"):
            contract.delay_until("yards", 1.7)

    def test_loads_from_disk(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "manifest.json"
            path.write_text(json.dumps(manifest()), encoding="utf-8")
            self.assertEqual(CueContract.from_path(path).cue("yards").trigger_text, "yards")


if __name__ == "__main__":
    unittest.main()
