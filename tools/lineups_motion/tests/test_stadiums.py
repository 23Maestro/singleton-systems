import copy
import importlib.util
import json
from pathlib import Path
import subprocess
import sys
import unittest

from tools.lineups_motion.stadiums import ROOT, REGISTRY, resolve_stadium, validate_binding


class StadiumTests(unittest.TestCase):
    def test_spoken_subject_owns_matchup_stadium(self):
        result = resolve_stadium({'lane': 'comparison', 'option': 'Team matchup',
                                  'title': 'The Steelers beat the Ravens 39-8'})
        self.assertEqual(result['focusTeam'], 'Pittsburgh Steelers')
        self.assertEqual(result['eagleItemId'], 'MWCF3QSEECA1M')

    def test_unknown_photo_never_borrows_the_other_teams_stadium(self):
        result = resolve_stadium({'lane': 'comparison', 'title': 'Ravens beat Steelers 39-8'})
        self.assertEqual(result['status'], 'missing')
        self.assertEqual(result['flag'], 'Stadium photo needed: Baltimore Ravens')

    def test_explicit_focus_wins_over_mention_order(self):
        result = resolve_stadium({'lane': 'comparison', 'focusTeam': 'Packers',
                                  'title': 'Steelers versus Packers'})
        self.assertEqual(result['focusTeam'], 'Green Bay Packers')

    def test_two_teams_without_a_focus_are_flagged(self):
        self.assertEqual(resolve_stadium({'lane': 'comparison', 'title': 'Bills versus Chiefs'})['status'], 'needs-focus')

    def test_photo_and_solid_card_treatments_are_not_replaced(self):
        for row in [{'lane': 'comparison', 'option': 'Cinematic 2-up'},
                    {'lane': 'quick stat', 'option': 'Team callout'}]:
            self.assertEqual(resolve_stadium({**row, 'focusTeam': 'Bills'})['status'], 'not-applicable')
        self.assertEqual(resolve_stadium({'lane': 'quick stat', 'setting': 'Field Night', 'focusTeam': 'Bills'})['status'], 'ready')

    def test_batch_keeps_available_candidates_when_one_photo_is_missing(self):
        rows = [{'id': 'A', 'lane': 'asset swap', 'team': 'Bengals'},
                {'id': 'B', 'lane': 'asset swap', 'team': 'Ravens'}]
        run = subprocess.run([sys.executable, str(ROOT / 'scripts/prepare-lineups-stadiums.py')],
                             input=json.dumps(rows), text=True, capture_output=True, check=True)
        self.assertEqual([r['status'] for r in json.loads(run.stdout)], ['ready', 'missing'])

    def test_wrong_team_provenance_and_generic_image_are_rejected(self):
        rows = json.loads(REGISTRY.read_text())['teams']
        row = rows[0]
        binding = {'setting': 'Team Stadium', 'focusTeam': row['team'], 'eagleItemId': row['eagleItemId'],
                   'sourceSha256': row['sha256'], 'imageHash': 'a' * 40, 'locked': True,
                   'nodeId': 'background', 'separateFromArtwork': True}
        validate_binding(binding)
        for key, value in [('eagleItemId', rows[1]['eagleItemId']),
                           ('sourceSha256', '0' * 64),
                           ('imageHash', '6c84d05a7f038c5e3f9f14a4103cd9b533251e70')]:
            with self.assertRaises(ValueError):
                validate_binding({**binding, key: value})
        spec = importlib.util.spec_from_file_location('stadium_hook', ROOT / '.codex/hooks/lineups_enforcement.py')
        hook = importlib.util.module_from_spec(spec); spec.loader.exec_module(hook)
        hook.validate_data_background({'scene': {'lane': 'asset swap'}, 'figma': {'background': binding}})

    def test_all_eagle_originals_have_the_expected_checksum(self):
        for row in json.loads(REGISTRY.read_text())['teams']:
            with self.subTest(team=row['team']):
                self.assertEqual(resolve_stadium({'focusTeam': row['team']}, required=True, verify_file=True)['status'], 'ready')


if __name__ == '__main__':
    unittest.main()
