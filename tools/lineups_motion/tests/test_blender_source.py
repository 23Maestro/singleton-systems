import copy
import hashlib
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

from tools.lineups_motion.blender_source import verify_source
from tools.lineups_motion.contract_gate import source_binding
from tools.lineups_motion.templates import resolve
from tools.broadcast_engine.production_data import validate_cue_frames
from tools.broadcast_engine.player_comparison_data import check


class BlenderSourceTests(unittest.TestCase):
    def test_both_variants_pass_before_build_with_current_timing_and_approved_spec(self):
        from tools.lineups_motion.tests.contract_fixture import ContractEvidence, synthetic_roles
        from tools.lineups_motion.contract_gate import check as gate_check, digest
        from tools.lineups_motion.timing_evidence import issue_receipt
        for variant, key in [('3B', 'stat-breakdown.blender.card'), ('4A', 'comparison.blender.player.2')]:
            with self.subTest(variant=variant), tempfile.TemporaryDirectory() as tmp:
                root = Path(tmp)
                case = ContractEvidence(root)
                case.design()
                template = resolve(key)
                scene = case.manifest['scene']
                scene.update(lane=template['lane'], approvedOption=template['option'], blenderVariant=variant)
                if variant == '4A':
                    scene.update(subjectCount=2, comparisonKind='players')
                case.manifest['motion'].update(engine='blender', engineVersion='blender-cli')
                source_hash = hashlib.sha256((Path(__file__).resolve().parents[3] / template['source']['manifestPath']).read_bytes()).hexdigest()
                case.manifest['blender'] = {'source': template['source']}
                case.manifest['contractGate']['templateBinding'] = {'key': key, 'templateSha256': digest(template), 'nativeManifestSha256': source_hash}
                ledger_path = Path(case.manifest['discoveryPath'])
                ledger = json.loads(ledger_path.read_text())
                finding = next(r['findings'][0] for r in ledger['lanes'] if r['lane'] == 'quick stat')
                for row in ledger['lanes']:
                    row['findings'] = [finding if row['lane'] == scene['lane'] else {'outcome': 'no-fit', 'reason': 'Synthetic fixture'}]
                ledger_path.write_text(json.dumps(ledger))
                case.artifact('timing.json', issue_receipt(root, case.manifest))
                case.spec.update(scene=scene, templateSha256=digest(template), nativeManifestSha256=source_hash,
                                 workflow={'order': ['blender'], 'figmaScenes': []})
                case.spec['cueLock']['motionSha256'] = digest(case.manifest['motion'])
                case.spec['roles'], _ = synthetic_roles(root, template)
                case.save_spec()
                with patch('tools.lineups_motion.blender_source.verify_source', return_value={}):
                    self.assertEqual(gate_check(root, case.manifest, 'before-build')['status'], 'passed')
                    case.spec['workflow']['order'] = ['figma', 'unreal']
                    case.save_spec()
                    with self.assertRaisesRegex(ValueError, 'Figma/Blender build order'):
                        gate_check(root, case.manifest, 'before-build')

    def test_registered_sources_verify_master_and_all_runner_dependencies(self):
        for key in ('stat-breakdown.blender.card', 'comparison.blender.player.2'):
            template = resolve(key)
            native = json.loads((Path(__file__).resolve().parents[3] / template['source']['manifestPath']).read_text())
            self.assertTrue(native['master']['path'].endswith('.blend'))
            self.assertEqual(set(native['files']) & {'builder', 'dataContract', 'runner'}, {'builder', 'dataContract', 'runner'})

    def test_public_source_gate_rejects_changed_master_and_runner(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            def ref(name):
                p = root / name
                p.write_bytes(b'fixture')
                return {'path': name, 'sha256': hashlib.sha256(p.read_bytes()).hexdigest()}
            native = {'schemaVersion': 1, 'templateKey': 'fixture', 'variant': '4A', 'master': ref('master.blend'),
                      'files': {k: ref(k+'.py') for k in ('builder', 'dataContract', 'runner')}}
            p = root / 'native.json'
            p.write_text(json.dumps(native))
            template = {'key': 'fixture', 'lane': 'comparison', 'option': 'Full comparison: 2',
                        'source': {'engine': 'blender', 'variant': '4A', 'manifestPath': 'native.json'}}
            from tools.lineups_motion.contract_gate import digest
            manifest = {'motion': {'engine': 'blender'}, 'scene': {'lane': 'comparison', 'approvedOption': 'Full comparison: 2'},
                        'blender': {'source': template['source']}, 'contractGate': {'templateBinding': {
                            'key': 'fixture', 'templateSha256': digest(template),
                            'nativeManifestSha256': hashlib.sha256(p.read_bytes()).hexdigest()}}}
            with patch('tools.lineups_motion.contract_gate.resolve', return_value=template), \
                 patch('tools.lineups_motion.contract_gate.ROOT', root), \
                 patch('tools.lineups_motion.blender_source.ROOT', root):
                # Explicit root below is passed by the gate for isolated integration checks.
                with patch('tools.lineups_motion.blender_source.verify_source', side_effect=lambda t: verify_source(t, root)):
                    source_binding(root, manifest)
                    for name in ('master.blend', 'runner.py'):
                        f = root / name
                        f.write_bytes(b'changed')
                        with self.assertRaisesRegex(ValueError, 'missing or changed'):
                            source_binding(root, manifest)
                        f.write_bytes(b'fixture')
                    (root / 'master.blend').unlink()
                    with self.assertRaisesRegex(ValueError, 'missing or changed'):
                        source_binding(root, manifest)

    def test_data_cannot_change_timing_after_manim(self):
        manifest = {'motion': {'frameRate': {'numerator': 25, 'denominator': 1},
                    'cues': [{'sceneTime': 3.16, 'triggerType': 'WORD'}]}}
        self.assertEqual(validate_cue_frames({'stats': [{'frame': 80}]}, manifest), [80])
        with self.assertRaisesRegex(ValueError, 'landing frame'):
            validate_cue_frames({'stats': [{'frame': 81}]}, manifest)

    def test_data_rejects_missing_subjects_and_rows(self):
        with self.assertRaises(ValueError):
            check({'title': 'STATS', 'frames': 300, 'players': []})


if __name__ == '__main__':
    unittest.main()
