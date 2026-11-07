import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch
from types import SimpleNamespace

from tools.lineups_motion import CueContract, CueContractError


def manifest(transcript_path):
    return {
        "schemaVersion": 2,
        "motion": {
            "engine": "figma",
            "engineVersion": "figma-motion",
            "timingValidator": "manim",
            "frameRate": {"numerator": 24000, "denominator": 1001},
            "sourcePath": None,
            "sceneClass": None,
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
        "timing": {"verifiedAnchorTimestamp": 632.5, "transcriptSource": "whisper",
                   "timestampResolution": "word", "transcriptPath": str(transcript_path)},
        "export": {"dimensions": {"width": 1920, "height": 1080}},
    }


class CueContractTests(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory()
        self.addCleanup(self.directory.cleanup)
        self.root = Path(self.directory.name)
        self.transcript_path = self.root / "transcript.json"
        self.write_tokens([
            {"text": "yards", "offsets": {"from": 634050, "to": 634500}},
            {"text": " yards", "offsets": {"from": 640000, "to": 640500}},
        ])

    def write_tokens(self, tokens):
        self.transcript_path.write_text(json.dumps({"transcription": [{"tokens": tokens}]}))

    def manifest(self):
        return manifest(self.transcript_path)

    def test_reads_exact_cue_math(self):
        contract = CueContract(self.manifest())
        self.assertAlmostEqual(float(contract.frame_rate), 24000 / 1001)
        self.assertAlmostEqual(contract.cue("yards").scene_time, 1.55)
        self.assertAlmostEqual(contract.delay_until("yards", 0), 1.55)

    def test_rejects_anchor_drift(self):
        value = self.manifest()
        value["motion"]["cues"][0]["sceneTime"] = 1.6
        with self.assertRaisesRegex(CueContractError, "verified transcript anchor"):
            CueContract(value)

    def test_rejects_scene_that_passed_a_cue(self):
        contract = CueContract(self.manifest())
        with self.assertRaisesRegex(CueContractError, "passed cue"):
            contract.delay_until("yards", 1.7)

    def test_loads_from_disk(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "manifest.json"
            path.write_text(json.dumps(self.manifest()), encoding="utf-8")
            self.assertEqual(CueContract.from_path(path).cue("yards").trigger_text, "yards")

    def test_validates_figma_motion_with_manim_timing_authority(self):
        contract = CueContract(self.manifest())
        self.assertEqual(contract.engine, "figma")
        self.assertEqual(contract.timing_validator, "manim")

    def test_never_uses_manim_as_the_figma_motion_renderer(self):
        value = self.manifest()
        value["motion"]["engine"] = "manim"
        with self.assertRaisesRegex(CueContractError, "Figma Motion"):
            CueContract(value)

    def test_rejects_wrong_words_even_when_all_cue_math_matches(self):
        value = self.manifest()
        value['motion']['cues'][0]['triggerText'] = 'not spoken'
        with self.assertRaisesRegex(CueContractError, 'Whisper words'):
            CueContract(value)

    def test_rejects_shifted_schedule_even_when_relative_math_matches(self):
        value = self.manifest()
        value['timing']['verifiedAnchorTimestamp'] += 2
        value['motion']['cues'][0]['transcriptTimestamp'] += 2
        with self.assertRaisesRegex(CueContractError, 'Whisper words'):
            CueContract(value)

    def test_checks_repeated_word_at_the_selected_occurrence(self):
        value = self.manifest()
        cue = value['motion']['cues'][0]
        cue.update(transcriptTimestamp=640, sceneTime=7.5)
        CueContract(value)
        cue.update(transcriptTimestamp=638, sceneTime=5.5)
        with self.assertRaisesRegex(CueContractError, 'Whisper words'):
            CueContract(value)

    def test_reassembles_whisper_subwords_numbers_and_punctuation(self):
        self.write_tokens([
            {'text': ' Ky', 'offsets': {'from': 634050, 'to': 634100}},
            {'text': 'ler', 'offsets': {'from': 634100, 'to': 634150}},
            {'text': ' Murray', 'offsets': {'from': 634150, 'to': 634200}},
            {'text': ', 20', 'offsets': {'from': 634200, 'to': 634250}},
            {'text': '27', 'offsets': {'from': 634250, 'to': 634300}},
            {'text': '.', 'offsets': {'from': 634300, 'to': 634350}},
        ])
        value = self.manifest()
        value['motion']['cues'][0].update(triggerType='PHRASE', triggerText='Kyler Murray, 2027')
        CueContract(value)
        value['motion']['cues'][0]['triggerText'] = 'Ky'
        with self.assertRaisesRegex(CueContractError, 'Whisper words'):
            CueContract(value)
        value['motion']['cues'][0].update(triggerText='ler', transcriptTimestamp=634.1, sceneTime=1.6)
        with self.assertRaisesRegex(CueContractError, 'Whisper words'):
            CueContract(value)

    def test_rejects_missing_malformed_or_segment_only_transcripts(self):
        value = self.manifest()
        for contents in ('{', '[]', '{}', '{"transcription":[{"text":"yards"}]}'):
            with self.subTest(contents=contents):
                self.transcript_path.write_text(contents)
                with self.assertRaises(CueContractError):
                    CueContract(value)
        self.transcript_path.unlink()
        with self.assertRaisesRegex(CueContractError, 'could not be read'):
            CueContract(value)

    def test_unknown_trigger_type_cannot_skip_speech_validation(self):
        value = self.manifest()
        value['motion']['cues'][0]['triggerType'] = 'SPEECH'
        with self.assertRaisesRegex(CueContractError, 'WORD, PHRASE or EDIT'):
            CueContract(value)

    def test_edit_cues_need_no_spoken_phrase_but_speech_cues_still_do(self):
        value = self.manifest()
        value['motion']['cues'].insert(0, dict(value['motion']['cues'][0],
            cueId='background', triggerType='EDIT', triggerText='scene start',
            sceneTime=0, transcriptTimestamp=632.5))
        CueContract(value)
        value['motion']['cues'][1]['triggerText'] = 'not spoken'
        with self.assertRaisesRegex(CueContractError, 'Whisper words'):
            CueContract(value)

    def test_direct_manim_loader_uses_the_same_word_check(self):
        with patch.dict('sys.modules', {'manim': SimpleNamespace(config=SimpleNamespace())}):
            from tools.lineups_motion.manim_scene import validate_manim_timing_from_manifest
            path = self.root / 'scene.json'
            value = self.manifest()
            value['motion']['cues'][0]['triggerText'] = 'not spoken'
            path.write_text(json.dumps(value))
            with self.assertRaisesRegex(CueContractError, 'Whisper words'):
                validate_manim_timing_from_manifest(path)

    def test_relative_transcript_paths_use_explicit_root(self):
        value = self.manifest()
        value['timing']['transcriptPath'] = 'transcript.json'
        CueContract(value, root=self.root)

    def test_valid_receipt_hash_does_not_bypass_word_validation(self):
        from tools.lineups_motion.timing_evidence import source_state, value_hash, validate_timing_receipt
        value = self.manifest()
        value['scene'] = {'episodeId': 'test', 'sceneId': 'S01'}
        value['motion']['cues'][0]['triggerText'] = 'not spoken'
        discovery = self.root / 'discovery.json'
        discovery.write_text('{}')
        value['discoveryPath'] = str(discovery)
        receipt_path = self.root / 'receipt.json'
        value['timing']['proofPath'] = str(receipt_path)
        receipt = {'schemaVersion': 1, 'stage': 'manim-timing', 'validator': 'manim',
            'result': 'passed', 'episodeId': 'test', 'sceneId': 'S01',
            'validatorVersion': '0.19.0', 'validatedAt': '2026-11-06', **source_state(self.root, value)}
        receipt['receiptSha256'] = value_hash(receipt)
        receipt_path.write_text(json.dumps(receipt))
        with self.assertRaisesRegex(CueContractError, 'Whisper words'):
            validate_timing_receipt(self.root, value, require_approval=False)


if __name__ == "__main__":
    unittest.main()
