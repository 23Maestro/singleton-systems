import copy
import json
import types
import unittest
from unittest.mock import patch

from tools.lineups_motion.engine_choice import engine_route, routing_contract
from tools.lineups_motion.variant_suggest import decision, suggest


class BlenderVariantTests(unittest.TestCase):
    def setUp(self):
        self.ledger = {'episodeId': 'ep', 'transcriptSha256': 'a' * 64, 'lanes': [
            {'lane': 'stat breakdown', 'findings': [{'outcome': 'candidate', 'candidateId': 'S01'}]}]}
        self.manifest = {'scene': {'episodeId': 'ep', 'sceneId': 'S01', 'lane': 'stat breakdown',
                                   'approvedOption': 'stat breakdown'}, 'motion': {'engine': 'blender'}}

    def test_registry_names_variants_and_their_approval(self):
        rows = {v['id']: v for v in routing_contract()['blenderVariants']}
        self.assertEqual(set(rows), {'3A', '3B', '4A'})
        self.assertEqual((rows['3A']['status'], rows['3B']['status'], rows['4A']['status']),
                         ('parked', 'approved', 'approved'))
        for v in rows.values():
            self.assertRegex(v['id'], r'^[1-7][A-Z]$')

    def test_unapproved_or_unnamed_variant_cannot_build(self):
        manifest = copy.deepcopy(self.manifest)
        manifest['scene']['blenderVariant'] = '3A'
        self.assertEqual(engine_route(manifest, self.ledger)['status'], 'reference-gap')
        with self.assertRaisesRegex(ValueError, '3A .* is parked, not approved'):
            engine_route(manifest, self.ledger, enforce_engine=True)
        manifest['scene']['blenderVariant'] = '3B'
        with patch('tools.lineups_motion.blender_source.verify_source', return_value={}):
            route = engine_route(manifest, self.ledger, enforce_engine=True)
        self.assertEqual((route['status'], route['templateKeys']), ('selected', ['stat-breakdown.blender.card']))
        self.assertTrue(route['productionReady'])
        with self.assertRaisesRegex(ValueError, 'needs a named variant'):
            engine_route(self.manifest, self.ledger, enforce_engine=True)
        manifest = copy.deepcopy(self.manifest)
        manifest['scene']['blenderVariant'] = '4A'
        with self.assertRaisesRegex(ValueError, 'not registered for this lane'):
            engine_route(manifest, self.ledger)
        manifest['scene']['blenderVariant'] = '3B'
        manifest['motion']['engine'] = 'figma'
        with self.assertRaisesRegex(ValueError, 'do not substitute engines'):
            engine_route(manifest, self.ledger, enforce_engine=True)

    def test_jev_suggests_without_binding(self):
        candidate = {'id': 'S01', 'lane': 'stat breakdown', 'option': 'stat breakdown', 'excerpt': 'won 35 to 12',
                     'cues': [{'word': '35'}], 'reason': 'One game.'}
        payload = decision(candidate)
        ids = [o['id'] for o in payload['options']]
        self.assertEqual(ids, ['3A', '3B', 'figma', 'needs_review'])
        before = copy.deepcopy(candidate)
        fake = lambda body: types.SimpleNamespace(returncode=0, stderr='', stdout=json.dumps(
            {'selected_option_id': '3B', 'option_ids': ids, 'probabilities': [0.1, 0.7, 0.15, 0.05]}))
        result = suggest(candidate, fake)
        self.assertEqual((result['suggested'], result['bound']), ('3B', False))
        self.assertEqual(candidate, before)
        bad = lambda body: types.SimpleNamespace(returncode=0, stderr='', stdout=json.dumps(
            {'selected_option_id': 'invented', 'option_ids': ids, 'probabilities': [0.25] * 4}))
        with self.assertRaises(RuntimeError):
            suggest(candidate, bad)
        self.assertIsNone(decision({**candidate, 'lane': 'quick stat', 'option': 'Team callout'}))


if __name__ == '__main__':
    unittest.main()
