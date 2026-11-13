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
        data = {'episodeId': '2026-11-10-nfl-week-10-power-rankings', 'cueMapSha256': sha,
                'candidates': [candidate], 'postScenes': []}
        (packet / 'index.html').write_text('<script>const reviewData=' + json.dumps(data) + ';</script>')
        return packet, data

    @patch('tools.review_workspace.build.subprocess.run')
    def test_packet_keeps_identity_and_uses_verified_frame_rate(self, _gate):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            packet, _ = self.packet(root)
            result = build(packet, root / 'dist', title='Week 10 Power Rankings')
            published = json.loads((root / 'dist/packet.json').read_text())
            self.assertEqual(published['episodeId'], result['episodeId'])
            self.assertEqual(published['scenes'][0]['id'], 'P01')
            self.assertEqual(published['fps'], 25)
            self.assertEqual(published['referenceLabel'], 'Week 10')
            self.assertEqual(published['title'], 'Week 10 Power Rankings')
            self.assertNotIn('intake', published)

    @patch('tools.review_workspace.build.subprocess.run')
    def test_finished_still_is_artwork_and_empty_source_link_is_omitted(self, _gate):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            packet, data = self.packet(root)
            still = packet / 'assets/final.jpg'
            still.write_bytes(b'review still')
            data['postScenes'] = [{'id': 'P01', 'sourceUrl': '', 'preview': {
                'image': 'assets/final.jpg', 'kind': 'image', 'sha256': hashlib.sha256(still.read_bytes()).hexdigest(),
            }}]
            (packet / 'index.html').write_text('<script>const reviewData=' + json.dumps(data) + ';</script>')
            scene = build(packet, root / 'dist')['scenes'][0]
            self.assertIsNone(scene['sourceUrl'])
            self.assertEqual(scene['versions'][-1]['stage'], 'Artwork')

    @patch('tools.review_workspace.build.subprocess.run')
    def test_rank_plan_and_source_photo_are_distinct_versions(self, _gate):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            packet, data = self.packet(root)
            photo = packet / 'assets/photo.jpg'
            photo.write_bytes(b'source photo')
            data['candidates'][0].update({'title':'#8 Cincinnati Bengals','lane':'recurring board',
                'copy':'8. CINCINNATI BENGALS','images':[{'image':'assets/photo.jpg'}]})
            (packet / 'index.html').write_text('<script>const reviewData=' + json.dumps(data) + ';</script>')
            scene = build(packet, root / 'dist')['scenes'][0]
            self.assertEqual(scene['presentation']['headline'], 'Cincinnati Bengals')
            self.assertEqual(scene['presentation']['background'], '#fb4f14')
            self.assertEqual(scene['versions'][-1]['kind'], 'plan')
            self.assertEqual(scene['versions'][0]['label'], 'Source photo')
            self.assertNotEqual(scene['thumbnail'], scene['versions'][0]['url'])

    @patch('tools.review_workspace.build.subprocess.run')
    def test_new_render_comes_first_and_earlier_versions_stay(self, _gate):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            packet, data = self.packet(root)
            video = packet / 'assets/final.mp4'
            video.write_bytes(b'final video')
            data['postScenes'] = [{'id': 'P01', 'preview': {
                'image': 'assets/final.mp4', 'kind': 'video', 'sha256': hashlib.sha256(video.read_bytes()).hexdigest()}}]
            (packet / 'index.html').write_text('<script>const reviewData=' + json.dumps(data) + ';</script>')
            earlier = {'id': 'render-earlier', 'label': 'Motion preview', 'stage': 'Motion', 'kind': 'video',
                       'url': '/api/studio/assets?projectId=p&sha256=' + 'a' * 64, 'sha256': 'a' * 64}
            previous = {'scenes': [{'id': 'P01', 'versions': [earlier]}]}
            versions = build(packet, root / 'dist', previous=previous)['scenes'][0]['versions']
            ids = [v['sha256'] for v in versions]
            newest = ids.index(hashlib.sha256(b'final video').hexdigest())
            self.assertEqual(ids.index('a' * 64), newest + 1)
            self.assertEqual(len([v for v in versions if v['id'] == 'render-earlier']), 1)

    @patch('tools.review_workspace.build.subprocess.run')
    def test_studio_base_path_keeps_relative_assets_under_the_public_route(self, _gate):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            packet, _ = self.packet(root)
            build(packet, root / 'dist', '/studio/')
            self.assertIn('<base href="/studio/">', (root / 'dist/index.html').read_text())
            self.assertIn('Opening Studio', (root / 'dist/index.html').read_text())
            self.assertNotIn('type="password"', (root / 'dist/index.html').read_text())
            self.assertIn('Opening review', (root / 'dist/review.html').read_text())
            for client in ['Catena Media', 'Intent Solutions', 'Singleton Systems']:
                self.assertIn(client, (root / 'dist/index.html').read_text())
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
