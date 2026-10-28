import copy
import hashlib
import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

from tools.lineups_motion.discovery import LANES, validate_scene_discovery
from tools.lineups_motion.engine_choice import engine_route, record_engine_choice, routing_contract, record_episode_engine_choice

ROOT = Path(__file__).resolve().parents[3]


class EngineChoiceTests(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory()
        self.addCleanup(self.directory.cleanup)
        self.root = Path(self.directory.name)
        self.transcript = self.root / 'transcript.json'
        self.transcript.write_text(json.dumps({'transcription': [
            {'text': 'Compare Mahomes and Allen', 'offsets': {'from': 1000, 'to': 5000}}]}))
        candidate = {'outcome': 'candidate', 'candidateId': 'S04', 'reason': 'Direct comparison',
                     'segmentIds': [0], 'excerpt': 'Compare Mahomes and Allen', 'start': 1, 'end': 5,
                     'assetSearch': {'status': 'needed', 'evidence': 'Find both action photos'}}
        self.ledger = {'schemaVersion': 1, 'episodeId': 'pilot', 'fullTranscriptReviewed': True,
                       'transcriptSha256': hashlib.sha256(self.transcript.read_bytes()).hexdigest(),
                       'lanes': [{'lane': lane, 'reviewedSegmentIds': [0], 'findings':
                                  [candidate] if lane == 'comparison' else
                                  [{'outcome': 'no-fit', 'reason': 'No source argument'}]} for lane in LANES]}
        self.ledger_path = self.root / 'discovery.json'
        self.ledger_path.write_text(json.dumps(self.ledger))
        self.manifest = {'scene': {'episodeId': 'pilot', 'sceneId': 'S04', 'lane': 'comparison',
                                  'approvedOption': 'Cinematic 2-up', 'setting': '2 players',
                                  'subjectCount': 2, 'comparisonKind': 'players'},
                         'motion': {'engine': 'figma'}, 'discoveryPath': str(self.ledger_path),
                         'timing': {'transcriptPath': str(self.transcript), 'verifiedAnchorTimestamp': 1}}

    def test_selected_candidate_asks_without_silent_default_and_blocks_build(self):
        result = engine_route(self.manifest, self.ledger)
        self.assertEqual(result['question'], 'Figma or Unreal?')
        self.assertEqual(result['label'], 'Lane 4 / Comparison / 2-up')
        self.assertEqual(result['status'], 'needs-engine-choice')
        self.assertIsNone(routing_contract()['defaultEngine'])
        self.assertEqual([row['key'] for row in routing_contract()['lanes']], list(LANES))
        self.assertEqual([row['number'] for row in routing_contract()['lanes']], list(range(1, 8)))
        # Transcript/timing review must remain available before the engine question.
        validate_scene_discovery(self.root, self.manifest)
        with self.assertRaisesRegex(ValueError, 'Figma or Unreal'):
            validate_scene_discovery(self.root, self.manifest, require_engine_choice=True)

    def test_both_answers_persist_but_unreal_does_not_pass_production(self):
        for engine in ('figma', 'unreal'):
            with self.subTest(engine=engine):
                manifest = copy.deepcopy(self.manifest)
                route = record_engine_choice(manifest, self.ledger, engine, engine.title())
                self.assertEqual(manifest['engineChoice']['engine'], engine)
                if engine == 'figma':
                    self.assertEqual(route['templateKeys'], ['comparison.cinematic.2'])
                    validate_scene_discovery(self.root, manifest, require_engine_choice=True)
                else:
                    self.assertEqual(route['templateManifest'], 'config/unreal/comparison-template-01.json')
                    self.assertFalse(route['productionReady'])
                    with self.assertRaisesRegex(ValueError, 'do not substitute engines'):
                        validate_scene_discovery(self.root, manifest, require_engine_choice=True)
                    manifest['motion']['engine'] = 'unreal'
                    validate_scene_discovery(self.root, manifest, require_engine_choice=True)

    def test_answer_cannot_leak_to_changed_candidate_option_or_revision(self):
        record_engine_choice(self.manifest, self.ledger, 'figma', 'Figma')
        mutations = [lambda m, l: m['scene'].update(setting='new content'),
                     lambda m, l: m['scene'].update(approvedOption='Simple comparison'),
                     lambda m, l: m['scene'].update(sceneId='another-scene'),
                     lambda m, l: l.update(transcriptSha256='b' * 64),
                     lambda m, l: l['lanes'][3]['findings'][0].update(excerpt='A changed passage')]
        for mutate in mutations:
            manifest, ledger = copy.deepcopy(self.manifest), copy.deepcopy(self.ledger)
            mutate(manifest, ledger)
            with self.assertRaises(ValueError):
                engine_route(manifest, ledger, require_choice=True)
        self.assertEqual(engine_route(self.manifest, self.ledger)['engine'], 'figma')
        self.transcript.write_text(self.transcript.read_text() + '\n')
        with self.assertRaisesRegex(ValueError, 'stale for the transcript'):
            validate_scene_discovery(self.root, self.manifest, require_engine_choice=True)

    def test_scope_and_unsupported_unreal_sources_stay_explicit(self):
        for option, count in [('Full comparison: 3', 3), ('Full comparison: 4', 4)]:
            manifest = copy.deepcopy(self.manifest)
            manifest['scene'].update(approvedOption=option, subjectCount=count)
            self.assertEqual(engine_route(manifest, self.ledger)['status'], 'not-required')
        manifest = copy.deepcopy(self.manifest)
        manifest['scene'].update(lane='quick stat')
        self.assertEqual(engine_route(manifest, self.ledger)['status'], 'not-required')
        self.manifest['scene'].update(approvedOption='Cinematic 2-up', comparisonKind='teams')
        with self.assertRaisesRegex(ValueError, 'players'):
            engine_route(self.manifest, self.ledger)

    def test_cli_period_comparison_reuses_registered_figma_without_engine_question(self):
        self.manifest['scene'].update(approvedOption='Simple comparison', comparisonKind='periods', setting='last week to this week')
        path = self.root / 'period.json'
        path.write_text(json.dumps(self.manifest))
        before = path.read_bytes()
        command = [sys.executable, str(ROOT / 'scripts/lineups-templates.py'), 'engine-choice', str(path)]
        result = subprocess.run(command, capture_output=True, text=True)
        self.assertEqual(result.returncode, 0, result.stderr)
        route = json.loads(result.stdout)
        self.assertEqual(route['status'], 'reuse-source')
        self.assertEqual(route['engine'], 'figma')
        self.assertEqual(route['templateKeys'], ['comparison.simple.2'])
        self.assertNotIn('question', route)
        self.assertEqual(path.read_bytes(), before)
        validate_scene_discovery(self.root, self.manifest, require_engine_choice=True)
        # The player-only command must not silently change a reused period source.
        result = subprocess.run(command + ['--engine', 'unreal', '--answer', 'Unreal'], capture_output=True, text=True)
        self.assertNotEqual(result.returncode, 0)
        self.assertEqual(path.read_bytes(), before)
        self.manifest['motion']['engine'] = 'unreal'
        with self.assertRaisesRegex(ValueError, 'registered Figma'):
            validate_scene_discovery(self.root, self.manifest, require_engine_choice=True)

    def test_invalid_choice_and_ambiguous_shape_are_rejected(self):
        for engine, answer in [('auto', 'choose for me'), ('figma', ''), (None, 'Figma')]:
            with self.assertRaises(ValueError):
                record_engine_choice(self.manifest, self.ledger, engine, answer)
        record_engine_choice(self.manifest, self.ledger, 'figma', 'Figma')
        self.manifest['engineChoice']['reviewer'] = 'Agent'
        with self.assertRaises(ValueError):
            engine_route(self.manifest, self.ledger)

    def test_team_options_have_explicit_unreal_routes_without_asking_again(self):
        for option in ('Team matchup', 'Logo stat cards'):
            manifest = copy.deepcopy(self.manifest)
            manifest['scene'].update(approvedOption=option, comparisonKind='teams')
            result = engine_route(manifest, self.ledger)
            self.assertEqual(result['engine'], 'unreal')
            self.assertEqual(result['status'], 'pending-unreal-review')
            self.assertFalse(result['productionReady'])
            self.assertNotIn('question', result)
            with self.assertRaisesRegex(ValueError, 'fixed option route'):
                engine_route(manifest, self.ledger, enforce_engine=True)
            with self.assertRaisesRegex(ValueError, 'fixed engine route'):
                record_engine_choice(manifest, self.ledger, 'figma', 'Figma')
            manifest['motion']['engine'] = 'unreal'
            engine_route(manifest, self.ledger, enforce_engine=True)
            manifest['scene']['sceneId'] = 'missing'
            with self.assertRaisesRegex(ValueError, 'selected transcript candidate'):
                engine_route(manifest, self.ledger)

    def test_explicit_episode_override_binds_candidate_and_preserved_source(self):
        for option, key, component in [('Team matchup', 'comparison.team-matchup.2', '1413:664'),
                                       ('Logo stat cards', 'comparison.logo-stat-cards.2', '1812:4542')]:
            manifest = copy.deepcopy(self.manifest)
            manifest['scene'].update(approvedOption=option, comparisonKind='teams')
            manifest['figma'] = {'fileKey': 'o7E24iymIT80MTXGYIogVH', 'templateKey': key,
                                 'sourceComponentId': component}
            answer = 'lets just do all figma this go round'
            result = record_episode_engine_choice(manifest, self.ledger, answer)
            self.assertEqual(result['status'], 'episode-override')
            self.assertFalse(result['productionReady'])
            engine_route(manifest, self.ledger, enforce_engine=True)
            for mutate in [lambda m: m['engineChoice'].update(episodeId='other'),
                           lambda m: m['engineChoice'].update(reviewer='Agent'),
                           lambda m: m['engineChoice'].update(answer=''),
                           lambda m: m['scene'].update(setting='changed'),
                           lambda m: m['figma'].update(sourceComponentId='arbitrary-frame'),
                           lambda m: m['figma'].update(templateKey='comparison.simple.2'),
                           lambda m: m['motion'].update(engine='unreal'),
                           lambda m: m['engineChoice'].pop('scope')]:
                changed = copy.deepcopy(manifest)
                mutate(changed)
                with self.assertRaises(ValueError):
                    engine_route(changed, self.ledger, enforce_engine=True)
            ledger = copy.deepcopy(self.ledger)
            ledger['transcriptSha256'] = 'b' * 64
            with self.assertRaisesRegex(ValueError, 'stale'):
                engine_route(manifest, ledger, enforce_engine=True)

    def test_team_callout_stays_figma_and_pending_review(self):
        manifest, ledger = copy.deepcopy(self.manifest), copy.deepcopy(self.ledger)
        manifest['scene'].update(lane='quick stat', approvedOption='Team callout')
        ledger['lanes'][1]['findings'] = ledger['lanes'][3]['findings']
        result = engine_route(manifest, ledger, enforce_engine=True)
        self.assertEqual(result['engine'], 'figma')
        self.assertEqual(result['templateKeys'], ['quick-stat.team-callout'])
        self.assertFalse(result['productionReady'])
        self.manifest['scene'].update(approvedOption='Simple comparison', subjectCount=True)
        with self.assertRaises(ValueError):
            engine_route(self.manifest, self.ledger)

    def test_cli_reads_question_then_saves_answer_without_changing_motion_engine(self):
        path = self.root / 'manifest.json'
        path.write_text(json.dumps(self.manifest))
        base = [sys.executable, str(ROOT / 'scripts/lineups-templates.py'), 'engine-choice', str(path)]
        before = path.read_bytes()
        result = subprocess.run(base, capture_output=True, text=True)
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(json.loads(result.stdout)['status'], 'needs-engine-choice')
        self.assertEqual(before, path.read_bytes())
        result = subprocess.run(base + ['--engine', 'unreal', '--answer', 'Unreal for this one'], capture_output=True, text=True)
        self.assertEqual(result.returncode, 0, result.stderr)
        saved = json.loads(path.read_text())
        self.assertEqual(saved['engineChoice']['engine'], 'unreal')
        self.assertEqual(saved['motion']['engine'], 'figma')
        self.assertEqual(json.loads(result.stdout)['status'], 'review-template')
        self.transcript.write_text('{}')
        before = path.read_bytes()
        result = subprocess.run(base + ['--engine', 'figma', '--answer', 'Figma'], capture_output=True, text=True)
        self.assertNotEqual(result.returncode, 0)
        self.assertEqual(before, path.read_bytes())


if __name__ == '__main__':
    unittest.main()
