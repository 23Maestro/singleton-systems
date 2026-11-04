import hashlib
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

from tools.review_workspace.build import build


class PreviewBuildTest(unittest.TestCase):
    def packet(self, root):
        packet = root / 'packet'
        (packet / 'evidence').mkdir(parents=True)
        (packet / 'assets').mkdir()
        cue = packet / 'evidence/cue-map.json'
        cue.write_text(json.dumps({'frameRate': {'numerator': 25, 'denominator': 1}}))
        sha = hashlib.sha256(cue.read_bytes()).hexdigest()
        proof = {'result': 'passed', 'cueMapSha256': sha, 'scenes': [{'sceneId': 'P01', 'result': 'passed'}]}
        (packet / 'evidence/cue-proof-receipt.json').write_text(json.dumps(proof))
        candidate = {'id': 'P01', 'title': 'Source scene', 'lane': 'quick action photo',
                     'option': 'quick action photo', 'duration': 4.52, 'anchor': 1,
                     'time': '00:01–00:05.52', 'reason': 'Original plan', 'setting': '1920 × 1080',
                     'primaryEngine': 'Figma Motion'}
        data = {'episodeId': '2026-11-03-nfl-week-9-power-rankings', 'cueMapSha256': sha,
                'candidates': [candidate], 'postScenes': []}
        (packet / 'index.html').write_text('<script>const reviewData=' + json.dumps(data) + ';</script>')
        return packet, data

    @patch('tools.review_workspace.build.subprocess.run')
    def test_w9_packet_keeps_identity_and_uses_verified_frame_rate(self, _gate):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            packet, _ = self.packet(root)
            result = build(packet, root / 'dist')
            published = json.loads((root / 'dist/packet.json').read_text())
            self.assertEqual(published['episodeId'], result['episodeId'])
            self.assertEqual(published['scenes'][0]['id'], 'P01')
            self.assertEqual(published['fps'], 25)
            self.assertEqual(published['referenceLabel'], 'Week 9')
            self.assertEqual(published['intake'], 'W9 review')

    @patch('tools.review_workspace.build.subprocess.run')
    def test_studio_base_path_keeps_relative_assets_under_the_public_route(self, _gate):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            packet, _ = self.packet(root)
            build(packet, root / 'dist', '/studio/')
            self.assertIn('<base href="/studio/">', (root / 'dist/index.html').read_text())
            with self.assertRaisesRegex(ValueError, 'base path'):
                build(packet, root / 'invalid', 'https://example.com/')
            self.assertFalse((root / 'invalid').exists())

    @patch('tools.review_workspace.build.subprocess.run')
    def test_stale_receipt_and_changed_media_block_publication(self, _gate):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            packet, data = self.packet(root)
            cue = packet / 'evidence/cue-map.json'
            before = cue.read_bytes()
            cue.write_text('{}')
            with self.assertRaisesRegex(ValueError, 'cue map'):
                build(packet, root / 'dist')
            self.assertFalse((root / 'dist').exists())
            cue.write_bytes(before)
            (packet / 'assets/render.mp4').write_bytes(b'changed media')
            data['postScenes'] = [{'id': 'P01', 'preview': {'image': 'assets/render.mp4',
                                  'kind': 'video', 'sha256': 'a' * 64}}]
            (packet / 'index.html').write_text('<script>const reviewData=' + json.dumps(data) + ';</script>')
            with self.assertRaisesRegex(ValueError, 'Media bytes'):
                build(packet, root / 'dist')
            self.assertFalse((root / 'dist/packet.json').exists())


if __name__ == '__main__':
    unittest.main()
