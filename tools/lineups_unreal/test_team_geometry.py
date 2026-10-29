"""A silhouette extrudes to a closed colored solid; original pixels stay separate."""
import hashlib
import json
import tempfile
import unittest
from pathlib import Path
from PIL import Image
from tools.lineups_unreal.prepare_review_geometry import build_logo_geometry


class TeamGeometryTests(unittest.TestCase):
    def test_bevel_uses_alpha_preserves_input_and_records_actual_mesh(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            source = root / 'logo.png'
            picture = Image.new('RGBA', (16, 16), (0, 0, 0, 0))
            for x in range(4, 12):
                for y in range(4, 12):
                    picture.putpixel((x, y), (255, 60, 0, 255))
            picture.save(source)
            original = source.read_bytes()
            record = {'path': str(source), 'sha256': hashlib.sha256(original).hexdigest()}
            meshes = build_logo_geometry({'assets': {'leftLogo': record, 'rightLogo': record}}, root / 'geometry', n=16)
            self.assertEqual(source.read_bytes(), original)
            self.assertEqual(len(meshes), 2)
            for mesh in meshes:
                obj = Path(mesh['path']).read_text()
                self.assertIn('usemtl Face', obj)
                self.assertIn('usemtl Edge', obj)
                self.assertGreater(mesh['triangles'], 0)
                self.assertEqual(mesh['sha256'], hashlib.sha256(Path(mesh['path']).read_bytes()).hexdigest())
                self.assertEqual(mesh['sourceSha256'], record['sha256'])
            self.assertEqual(json.loads((root / 'geometry/geometry.json').read_text()), meshes)
            with self.assertRaises(AssertionError):
                build_logo_geometry({'assets': {'leftLogo': {**record, 'sha256': 'stale'}}}, root / 'bad', n=16)


if __name__ == '__main__':
    unittest.main()
