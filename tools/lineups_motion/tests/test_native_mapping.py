import copy
import importlib.util
import json
import tempfile
import unittest
from unittest.mock import patch
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
SPEC = importlib.util.spec_from_file_location('lineups_gate', ROOT / '.codex/hooks/lineups_enforcement.py')
gate = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(gate)


class NativeMappingTests(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory()
        self.addCleanup(self.directory.cleanup)
        self.path = Path(self.directory.name) / 'native.json'
        self.transcript = {'success': True, 'sequenceId': 'seq', 'timebase': 'sequence',
            'provenance': {'provider': 'Adobe Premiere Pro', 'reTranscribed': False},
            'placements': [{'clipId': 'source', 'trackType': 'video', 'timelineStart': 0,
                            'sourceIn': 3.2, 'sourceOut': 100}],
            'words': [{'text': 'Milwaukee', 'sourceStart': 43.62, 'start': 40.42},
                      {'text': 'Brewers', 'sourceStart': 44, 'start': 40.8}]}
        self.manifest = {'timing': {'verifiedAnchorTimestamp': 44.1},
            'motion': {'frameRate': {'numerator': 25, 'denominator': 1}},
            'premiere': {'sequenceId': 'seq', 'timelineMapping': {
                'transcriptPath': str(self.path), 'sourceClipId': 'source',
                'sourceAnchor': 43.62, 'phrase': 'Milwaukee Brewers'}}}
        self.write_transcript()

    def write_transcript(self):
        self.path.write_text(json.dumps(self.transcript))
        self.manifest['premiere']['timelineMapping']['transcriptSha256'] = gate.sha256_file(self.path)

    def test_half_frame_rounds_up_after_source_trim(self):
        self.assertEqual(gate.premiere_anchor(self.manifest), 40.44)

    def test_legacy_anchor_is_preserved(self):
        del self.manifest['premiere']['timelineMapping']
        self.assertEqual(gate.premiere_anchor(self.manifest), 44.1)

    def test_changed_transcript_is_rejected(self):
        self.path.write_text('{}')
        with self.assertRaises(gate.EnforcementError): gate.premiere_anchor(self.manifest)

    def test_wrong_sequence_is_rejected(self):
        self.transcript['sequenceId'] = 'other'; self.write_transcript()
        with self.assertRaises(gate.EnforcementError): gate.premiere_anchor(self.manifest)

    def test_retranscription_is_rejected(self):
        self.transcript['provenance']['reTranscribed'] = True; self.write_transcript()
        with self.assertRaises(gate.EnforcementError): gate.premiere_anchor(self.manifest)

    def test_phrase_and_timestamp_must_match(self):
        self.manifest['premiere']['timelineMapping']['phrase'] = 'Los Angeles'
        with self.assertRaises(gate.EnforcementError): gate.premiere_anchor(self.manifest)

    def test_trimmed_word_is_rejected(self):
        self.transcript['placements'][0]['sourceIn'] = 50; self.write_transcript()
        with self.assertRaises(gate.EnforcementError): gate.premiere_anchor(self.manifest)

    def test_ambiguous_source_placement_is_rejected(self):
        self.transcript['placements'] *= 2; self.write_transcript()
        with self.assertRaises(gate.EnforcementError): gate.premiere_anchor(self.manifest)

    def test_word_timeline_must_match_source_placement(self):
        self.transcript['words'][0]['start'] = 99; self.write_transcript()
        with self.assertRaises(gate.EnforcementError): gate.premiere_anchor(self.manifest)

    def test_static_requires_explicit_approved_choice(self):
        m = {'figma': {'staticByUserRequest': True},
             'review': {'status': 'approved', 'reviewer': 'Jerami'},
             'motion': {'cues': [{'duration': 0}]}}
        self.assertTrue(gate.approved_static_scene(m))
        for key in ('figma', 'review'):
            changed = copy.deepcopy(m); changed[key] = {}
            self.assertFalse(gate.approved_static_scene(changed))
        m['motion']['cues'][0]['duration'] = .4
        self.assertFalse(gate.approved_static_scene(m))


class WhisperPlacementTests(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory()
        self.addCleanup(self.directory.cleanup)
        root = Path(self.directory.name)
        self.media = root / 'source.mp4'; self.media.write_bytes(b'verified-source')
        self.path = root / 'placement.json'
        self.placement = {'success': True, 'sequenceId': 'seq', 'clipId': 'clip',
                          'projectItemId': 'source', 'mediaPath': str(self.media),
                          'start': .24, 'end': 100.24, 'inPoint': 0, 'outPoint': 100, 'speed': 1}
        self.manifest = {'timing': {'verifiedAnchorTimestamp': 28.26},
                         'motion': {'frameRate': {'numerator': 25, 'denominator': 1}},
                         'premiere': {'sequenceId': 'seq', 'timelineMapping': {
                             'provider': 'approved-whisper-source-placement',
                             'readbackPath': str(self.path), 'sourceClipId': 'clip',
                             'sourceProjectItemId': 'source', 'sourceMediaPath': str(self.media),
                             'sourceMediaSha256': gate.sha256_file(self.media)}}}
        self.write()
        mocked = patch.object(gate, 'validate_timing_receipt')
        self.timing = mocked.start(); self.addCleanup(mocked.stop)

    def write(self):
        self.path.write_text(json.dumps(self.placement))
        self.manifest['premiere']['timelineMapping']['readbackSha256'] = gate.sha256_file(self.path)

    def test_source_offset_is_frame_rounded_and_requires_manim_receipt(self):
        self.assertEqual(gate.premiere_anchor(self.manifest), 28.52)
        self.timing.assert_called_once_with(gate.SOURCE_ROOT, self.manifest)

    def test_changed_media_and_stale_readback_fail(self):
        self.media.write_bytes(b'wrong-source')
        with self.assertRaises(gate.EnforcementError): gate.premiere_anchor(self.manifest)
        self.media.write_bytes(b'verified-source'); self.path.write_text('{}')
        with self.assertRaises(gate.EnforcementError): gate.premiere_anchor(self.manifest)

    def test_native_identity_trim_and_speed_must_match(self):
        for key, value in [('sequenceId', 'wrong'), ('projectItemId', 'wrong'),
                           ('mediaPath', '/wrong'), ('speed', 2), ('inPoint', 30), ('end', 99)]:
            with self.subTest(key=key):
                original = self.placement[key]; self.placement[key] = value; self.write()
                with self.assertRaises(gate.EnforcementError): gate.premiere_anchor(self.manifest)
                self.placement[key] = original; self.write()

    def test_failed_timing_receipt_cannot_be_bypassed(self):
        self.timing.side_effect = ValueError('stale timing')
        with self.assertRaisesRegex(ValueError, 'stale timing'): gate.premiere_anchor(self.manifest)


if __name__ == '__main__': unittest.main()
