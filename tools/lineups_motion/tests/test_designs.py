import copy
import json
import unittest
from tools.lineups_motion.designs import DesignError, REGISTRY_PATH, resolve_design, surface_request
from tools.lineups_motion.templates import resolve


class DesignTests(unittest.TestCase):
    def setUp(self):
        self.template = resolve('comparison.rank-movement.2')
        self.registry = json.loads(REGISTRY_PATH.read_text())
        self.inputs = dict(episodeId='2026-week9', teamId='KC', primaryColor='#E31837',
                           colorSource='test fixture; not a production palette claim')

    def test_teams_and_episodes_share_exact_design(self):
        first = surface_request(self.template, self.inputs)
        second = surface_request(self.template, dict(self.inputs, episodeId='2026-week10',
                                 teamId='MIN', primaryColor='#4F2683'))
        self.assertEqual(first['surfaceDesign'], second['surfaceDesign'])
        self.assertEqual(first['protected'], second['protected'])
        self.assertNotEqual(first['teamInputs'], second['teamInputs'])
        self.assertEqual(first['implementation'], second['implementation'])

    def test_style_overrides_and_unsourced_colors_fail(self):
        for data in [dict(self.inputs, pattern='stripes'), dict(self.inputs, primaryColor='red'),
                     dict(self.inputs, colorSource=''), {'teamId': 'KC'}]:
            with self.subTest(data=data), self.assertRaises(DesignError):
                surface_request(self.template, data)

    def test_edited_and_duplicate_designs_fail(self):
        altered = copy.deepcopy(self.registry)
        bound = next(d for d in altered['designs'] if d['id'] == self.template['surfaceDesign']['id']
                     and d['version'] == self.template['surfaceDesign']['version'])
        bound['protected']['pattern'] = 'yellow stripes'
        with self.assertRaisesRegex(DesignError, 'changed'):
            resolve_design(self.template, altered)
        altered['designs'] = self.registry['designs'] * 2
        with self.assertRaisesRegex(DesignError, 'duplicate'):
            resolve_design(self.template, altered)

    def test_rank_manifest_and_template_bind_same_design(self):
        from tools.lineups_motion.designs import ROOT
        manifest = json.loads((ROOT / self.template['source']['manifestPath']).read_text())
        self.assertEqual(manifest['surfaceDesign'], self.template['surfaceDesign'])
        for key in ('comparison.team-matchup.2', 'comparison.logo-stat-cards.2'):
            self.assertEqual(resolve(key)['surfaceDesign'], self.template['surfaceDesign'])
            self.assertEqual(resolve_design(resolve(key)), resolve_design(self.template))
        other = dict(self.template, key='quick-stat.team-callout')
        with self.assertRaisesRegex(DesignError, 'not approved'):
            resolve_design(other)
