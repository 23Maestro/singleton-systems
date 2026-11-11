"""Exercise the public gate and its production callers with independent evidence."""
import copy
import hashlib
import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

from tools.lineups_motion.tests.contract_fixture import ContractEvidence

ROOT = Path(__file__).resolve().parents[3]
CLI = ROOT / 'scripts/lineups-contract-gate.py'


def digest(value):
    return hashlib.sha256(json.dumps(value, sort_keys=True, separators=(',', ':'),
                                     ensure_ascii=False, allow_nan=False).encode()).hexdigest()


class ContractGateTests(unittest.TestCase, ContractEvidence):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name)
        self.initialize(self.root)

    def run_gate(self, stage='source', manifest=None):
        return subprocess.run([sys.executable, str(CLI), stage],
                              input=json.dumps({'root': str(self.root), 'manifest': manifest or self.manifest}),
                              capture_output=True, text=True, cwd=ROOT)

    def bind_figma_template(self, key):
        self.design()
        template = next(t for t in json.loads((ROOT / 'config/lineups/template-registry.json').read_text())['templates']
                        if t['key'] == key)
        self.manifest['scene'].update(lane=template['lane'], approvedOption=template['option'])
        self.manifest['figma'].update(sourceComponentId=template['source']['componentId'],
            templateBinding={'key': key, 'templateSha256': digest(template)})
        self.spec['templateSha256'] = digest(template)
        self.use_template_roles(template)
        self.timing_proof()
        self.save_spec()
        self.measured['specSha256'] = self.manifest['contractGate']['spec']['sha256']
        self.save_measurement()

    def test_background_and_focus_roles_cannot_be_omitted(self):
        for key, roles in [('quick-stat.logo', ['team-background']),
                           ('recurring.rank-reveal.10', ['focus.panel', 'focus.logo', 'focus.text'])]:
            self.bind_figma_template(key)
            good = self.run_gate('after-build')
            self.assertEqual(good.returncode, 0, good.stderr)
            for role in roles:
                with self.subTest(template=key, role=role):
                    original_spec, original_measured = copy.deepcopy(self.spec), copy.deepcopy(self.measured)
                    self.spec['roles'].pop(role, None)
                    self.measured['roles'].pop(role, None)
                    self.save_spec()
                    self.measured['specSha256'] = self.manifest['contractGate']['spec']['sha256']
                    self.save_measurement()
                    failed = self.run_gate('after-build')
                    self.assertNotEqual(failed.returncode, 0, failed.stdout)
                    self.assertIn(role + ': missing or misclassified required role', failed.stderr)
                    self.spec, self.measured = original_spec, original_measured

    def test_background_and_focus_reject_wrong_paint_copy_and_visible_art(self):
        from PIL import Image, ImageDraw
        for key, role, field, bad in [
                ('quick-stat.logo', 'team-background', 'fills', ['#0B162A']),
                ('recurring.rank-reveal.10', 'focus.panel', 'fills', ['#0B162A']),
                ('recurring.rank-reveal.10', 'focus.text', 'characters', 'Chiefs')]:
            with self.subTest(template=key, role=role):
                self.bind_figma_template(key)
                self.measured['roles'][role][field] = bad
                self.save_measurement()
                failed = self.run_gate('after-build')
                self.assertNotEqual(failed.returncode, 0, failed.stdout)
                self.assertIn(field, failed.stderr)
        self.bind_figma_template('recurring.rank-reveal.10')
        path = self.root / 'focus-logo.png'
        for box in [(108, 108, 131, 131), (0, 24, 191, 215)]:
            with self.subTest(artwork=box):
                image = Image.new('RGBA', (240, 240))
                ImageDraw.Draw(image).rectangle(box, fill='white')
                image.save(path)
                self.measured['roles']['focus.logo']['pixels'] = {
                    'path': str(path), 'sha256': hashlib.sha256(path.read_bytes()).hexdigest()}
                self.save_measurement()
                failed = self.run_gate('after-build')
                self.assertNotEqual(failed.returncode, 0, failed.stdout)
                self.assertIn('logo visible artwork', failed.stderr)

    def test_measured_styles_reject_repeated_team_colors_and_text_drift(self):
        self.design()
        good = self.run_gate('after-build')
        self.assertEqual(good.returncode, 0, good.stderr)
        for role, field, bad in [('bears-card', 'fills', ['#E31837']),
                                 ('bears-card', 'corners', [0, 0, 0, 0]),
                                 ('bears-card', 'effects', []),
                                 ('bears-name', 'characters', 'Bears'),
                                 ('bears-name', 'fontSize', 36),
                                 ('bears-name', 'letterSpacing', 3)]:
            original = copy.deepcopy(self.measured)
            self.measured['roles'][role][field] = bad
            self.save_measurement()
            failed = self.run_gate('after-build')
            self.assertEqual(failed.returncode, 1, failed.stdout)
            self.assertIn(field, failed.stderr)
            self.measured = original
        self.save_measurement()

    def test_native_build_and_handoff_require_current_manim_proof(self):
        from tools.lineups_motion.tests.contract_fixture import delivery_contract
        ref = delivery_contract(self.root, self.root / 'native.mp4')
        manifest = json.loads(Path(ref['path']).read_text())
        good = self.run_gate('before-handoff', manifest)
        self.assertEqual(good.returncode, 0, good.stderr)
        receipt_path = Path(manifest['timing']['proofPath'])
        receipt_bytes = receipt_path.read_bytes()
        receipt = json.loads(receipt_bytes)
        receipt['timingSha256'] = '0' * 64
        receipt_path.write_text(json.dumps(receipt))
        stale = self.run_gate('before-build', manifest)
        self.assertNotEqual(stale.returncode, 0)
        self.assertIn('Manim timing receipt', stale.stderr)
        receipt_path.write_bytes(receipt_bytes)
        manifest['timing'].pop('proofPath', None)
        for stage in ('before-build', 'before-handoff'):
            result = self.run_gate(stage, manifest)
            self.assertNotEqual(result.returncode, 0, result.stdout)
            self.assertIn('Manim timing receipt', result.stderr)

    def test_required_logo_card_and_copy_roles_cannot_be_removed_or_retyped(self):
        self.design()
        for role in ('logo', 'logoBlock', 'subjectPanel', 'subject', 'text', 'photo'):
            original = copy.deepcopy(self.spec['roles'][role])
            for replacement in (None, {'kind': 'frame', 'expected': {'width': 1920, 'height': 1080}}):
                with self.subTest(role=role, replacement=replacement):
                    if replacement is None:
                        del self.spec['roles'][role]
                    else:
                        self.spec['roles'][role] = replacement
                    self.save_spec()
                    result = self.run_gate('before-build')
                    self.assertNotEqual(result.returncode, 0, result.stdout)
                    self.assertIn('required role', result.stderr)
                    self.spec['roles'][role] = copy.deepcopy(original)
        del self.spec['roles']['logoBlock']['teamId']
        self.save_spec()
        self.assertIn('team identity', self.run_gate('before-build').stderr)

    def test_native_timing_issuer_checks_spoken_words_and_anchor_math(self):
        self.design()
        self.manifest['motion'].update(engine='unreal', engineVersion='unreal-sequencer')
        for field, value in (('triggerText', 'not spoken'), ('sceneTime', 2)):
            manifest = copy.deepcopy(self.manifest)
            manifest['motion']['cues'][0][field] = value
            result = subprocess.run([sys.executable, '-m', 'tools.lineups_motion.timing_evidence', '--issue'],
                input=json.dumps({'root': str(self.root), 'manifest': manifest}),
                capture_output=True, text=True, cwd=ROOT)
            self.assertNotEqual(result.returncode, 0, result.stdout)
            self.assertRegex(result.stderr, 'Whisper words|verified transcript anchor')

    def test_partial_role_roster_cannot_skip_visual_checks(self):
        self.design()
        self.spec['roles'] = {'root': {'kind': 'frame', 'expected': {'width': 1920, 'height': 1080}}}
        self.save_spec()
        self.measured['specSha256'] = self.manifest['contractGate']['spec']['sha256']
        self.measured['roles'] = {'root': {'nodeId': 'scene', 'width': 1920, 'height': 1080}}
        self.save_measurement()
        result = self.run_gate('after-build')
        self.assertNotEqual(result.returncode, 0, result.stdout)
        self.assertIn('required role', result.stderr)

    def test_logo_checks_pixels_inside_the_container(self):
        from PIL import Image, ImageDraw
        self.design()
        self.spec['roles']['logo'] = {'kind': 'logo', 'teamId': 'KC', 'expected': {'bounds': [0, 0, 240, 240]},
                                      'artwork': {'minOccupancy': 0.7, 'maxOccupancy': 0.95,
                                                  'centerTolerance': 2, 'alphaThreshold': 16}}
        self.save_spec()
        self.measured['specSha256'] = self.manifest['contractGate']['spec']['sha256']
        path = self.root / 'logo.png'
        for box, okay in [((24, 24, 215, 215), True), ((108, 108, 131, 131), False),
                          ((0, 24, 191, 215), False)]:
            image = Image.new('RGBA', (240, 240))
            ImageDraw.Draw(image).rectangle(box, fill=(255, 255, 255, 255))
            image.save(path)
            self.measured['roles']['logo'] = {'nodeId': 'logo', 'bounds': [0, 0, 240, 240],
                                              'imageBounds': [0, 0, 240, 240], 'pixelMapping': 'axis-aligned',
                                              'pixels': {'path': str(path), 'sha256': hashlib.sha256(path.read_bytes()).hexdigest()}}
            self.save_measurement()
            result = self.run_gate('after-build')
            self.assertEqual(result.returncode, 0 if okay else 1, result.stdout + result.stderr)

    def test_build_requires_locked_cues_and_figma_exports_before_unreal(self):
        self.design()
        self.assertEqual(self.run_gate('before-build').returncode, 0)
        self.manifest['motion']['cues'][0]['sceneTime'] = 2
        self.assertEqual(self.run_gate('before-build').returncode, 1)
        self.manifest['motion']['cues'][0]['sceneTime'] = 1.2
        self.template = next(t for t in json.loads((ROOT / 'config/lineups/template-registry.json').read_text())['templates']
                             if t['key'] == 'stat-breakdown.unreal.player.3')
        self.manifest['scene'].update(sceneId='U01', lane=self.template['lane'], approvedOption=self.template['option'])
        self.manifest['motion']['engine'] = 'unreal'
        self.manifest['unreal'] = {'source': self.template['source'], 'sourceRevision': 'revision-1',
                                   'templateBinding': {'key': self.template['key'], 'templateSha256': digest(self.template),
                                                       **({'nativeManifestSha256': hashlib.sha256((ROOT / self.template['source']['manifestPath']).read_bytes()).hexdigest()} if self.template['source'].get('engine') == 'unreal' else {})}}
        self.spec.update(scene=self.manifest['scene'], templateSha256=digest(self.template))
        self.use_template_roles(self.template)
        self.timing_proof()
        self.spec['cueLock']['motionSha256'] = digest(self.manifest['motion'])
        self.save_spec()
        self.assertEqual(self.run_gate('before-build').returncode, 1)
        self.manifest['contractGate']['figmaExports'] = [self.artifact('figma-export.json', {
            'episodeId': 'test-episode', 'sceneId': 'A01', 'engine': 'figma', 'status': 'exported',
            'export': self.artifact('figma-media.fixture', {'fixture': 'export bytes'})})]
        retired = self.run_gate('before-build')
        self.assertNotEqual(retired.returncode, 0, retired.stdout)
        self.assertIn('Unreal is retired', retired.stderr)
        (self.root / 'figma-media.fixture').write_text('changed')
        self.assertIn('evidence file changed', self.run_gate('before-build').stderr)

    def test_handoff_requires_current_visual_review_of_actual_export_frames(self):
        self.design()
        self.export()
        self.assertEqual(self.run_gate('before-handoff').returncode, 1)
        self.review()
        result = self.run_gate('before-handoff')
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(json.loads(result.stdout)['visualApproval'], 'recorded')
        self.manifest['figma']['sourceRevision'] = 'revision-2'
        self.assertEqual(self.run_gate('before-handoff').returncode, 1)
        self.manifest['figma']['sourceRevision'] = 'revision-1'
        Path(self.manifest['export']['path']).write_bytes(b'different render')
        self.assertEqual(self.run_gate('before-handoff').returncode, 1)

    def test_handoff_media_cli_does_not_accept_timing_only_proof(self):
        self.design()
        self.export()
        result = subprocess.run([sys.executable, '-m', 'tools.lineups_motion.media_evidence'],
                                input=json.dumps({'root': str(self.root), 'manifest': self.manifest}),
                                capture_output=True, text=True, cwd=ROOT)
        self.assertNotEqual(result.returncode, 0, result.stdout)

    def test_pending_native_surface_cannot_pass_production_build(self):
        from unittest.mock import patch
        from tools.lineups_motion.contract_gate import check
        from tools.lineups_motion.designs import resolve_design
        self.design()
        template = next(t for t in json.loads((ROOT / 'config/lineups/template-registry.json').read_text())['templates']
                        if t['key'] == 'comparison.rank-movement.2')
        self.manifest['motion']['engine'] = 'unreal'
        self.manifest['scene'].update(lane=template['lane'], approvedOption=template['option'], comparisonKind='periods', subjectCount=2)
        self.manifest['unreal'] = {'source': template['source'],
            'templateBinding': {'key': template['key'], 'templateSha256': digest(template),
                                'nativeManifestSha256': hashlib.sha256((Path(__file__).resolve().parents[3] / template['source']['manifestPath']).read_bytes()).hexdigest()}}
        self.spec.update(templateSha256=digest(template))
        self.use_template_roles(template)
        self.timing_proof()
        self.spec['cueLock']['motionSha256'] = digest(self.manifest['motion'])
        self.spec['workflow']['figmaScenes'] = []
        self.save_spec()
        result = self.run_gate('before-build')
        self.assertNotEqual(result.returncode, 0, result.stdout)
        self.assertIn('Figma or Blender', result.stderr)
        pending = copy.deepcopy(resolve_design(template))
        pending['implementation']['productionReady'] = False
        with patch('tools.lineups_motion.designs.resolve_design', return_value=pending):
            with self.assertRaisesRegex(ValueError, 'native surface'):
                check(self.root, self.manifest, 'before-build')

    def test_transcript_cannot_change_under_locked_spec(self):
        self.design()
        self.manifest['timing'] = {'transcriptPath': self.artifact('other.json', {'text': 'other'})['path']}
        result = self.run_gate('before-build')
        self.assertNotEqual(result.returncode, 0, result.stdout)
        self.assertIn('transcript', result.stderr)

    def test_retired_unreal_fails_and_blender_waits_for_a_registered_master(self):
        from tools.lineups_motion.engine_choice import record_engine_choice, record_episode_engine_choice
        self.design()
        registry = json.loads((ROOT / 'config/lineups/template-registry.json').read_text())
        scene = self.manifest['scene']
        scene.update(lane='comparison', approvedOption='Cinematic 2-up', subjectCount=2, comparisonKind='players')
        self.timing_proof()
        ledger = json.loads(Path(self.manifest['discoveryPath']).read_text())
        ledger['transcriptSha256'] = 'a'*64
        self.manifest['discoveryPath'] = self.artifact('discovery.json', ledger)['path']
        with self.assertRaisesRegex(ValueError, 'Unreal is retired'):
            record_engine_choice(self.manifest, ledger, 'unreal', 'Unreal for this player scene')
        record_engine_choice(self.manifest, ledger, 'blender', 'Blender for this player scene')
        self.manifest['motion']['engine'] = 'blender'
        from tools.lineups_motion.engine_choice import engine_route
        # Approved route, but no template registry row or production runner yet: the gate must stop.
        self.assertEqual(engine_route(self.manifest, ledger, require_choice=True, enforce_engine=True)['status'], 'selected')
        for stage in ('before-build', 'before-handoff'):
            result = self.run_gate(stage)
            self.assertNotEqual(result.returncode, 0, result.stdout)
            self.assertIn('unregistered or duplicate template key', result.stderr)
        template = next(t for t in registry['templates'] if t['key'] == 'comparison.logo-stat-cards.2')
        scene.update(approvedOption='Logo stat cards', comparisonKind='teams')
        self.manifest['motion']['engine'] = 'figma'
        self.manifest['figma'].update(sourceComponentId=template['legacyFigmaSource']['componentId'], templateKey=template['key'],
            templateBinding={'key': template['key'], 'templateSha256': digest(template)})
        record_episode_engine_choice(self.manifest, ledger, 'Use the saved Figma source this episode')
        result = self.run_gate()
        self.assertEqual(result.returncode, 0, result.stderr)
        self.manifest['engineChoice']['answer'] = ''
        self.assertNotEqual(self.run_gate().returncode, 0)

    def test_source_gate_accepts_current_callout_and_rejects_retired_source_or_version(self):
        good = self.run_gate()
        self.assertEqual(good.returncode, 0, good.stderr)
        for field, value in [('sourceComponentId', '653:184'), ('sourceComponentId', 'unregistered')]:
            changed = copy.deepcopy(self.manifest)
            changed['figma'][field] = value
            result = self.run_gate(manifest=changed)
            self.assertEqual(result.returncode, 1, result.stdout)

        for field, value in [('key', 'quick-stat.single'), ('templateSha256', 'old')]:
            changed = copy.deepcopy(self.manifest)
            changed['figma']['templateBinding'][field] = value
            result = self.run_gate(manifest=changed)
            self.assertEqual(result.returncode, 1, result.stdout)


if __name__ == '__main__':
    unittest.main()
