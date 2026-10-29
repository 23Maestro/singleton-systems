"""The canonical panel expands a team cue without loosening rank source guards."""
import copy
import importlib.util
import unittest
from pathlib import Path

root=Path(__file__).resolve().parents[3]
spec=importlib.util.spec_from_file_location('rank_guard',root/'.codex/hooks/lineups_enforcement.py')
guard=importlib.util.module_from_spec(spec);spec.loader.exec_module(guard)

class RankPanelTests(unittest.TestCase):
    def setUp(self):
        self.manifest={'scene':{'lane':'recurring board','approvedOption':'Rank Reveal'},
            'motion':{'engine':'figma','engineVersion':'figma-motion','timingValidator':'manim'},
            'figma':{'fileKey':guard.LINEUPS_FIGMA_FILE_KEY,'sourceComponentId':'1277:558',
                'rankReveal':{'canonicalSourceComponentId':'1277:558','canonicalSourceName':guard.RANK_REVEAL_SOURCE_NAME,
                    'stateOrder':'10-to-1-cumulative','boardEntranceOrder':list(range(10,0,-1)),
                    'logoWrapperDimensions':{'width':96,'height':78},'motionWorkingCopyMode':'detached-from-canonical-instance',
                    'revealedRank':9,'visibleRanks':[10,9],
                    'logoAssignments':[{'rank':i,'team':f'Team {i}','componentId':f'logo-{i}',
                        'componentName':f'Asset/Team Logo/Normalized/Team {i}'}for i in range(1,11)]}}}
        self.cues=[{'action':'reveal-rank-9-content','cueId':'team'}]
        self.tracks=[{'nodeId':r,'role':r,'property':'opacity','cueId':'team'}for r in
            ['team-text','team-logo','current-highlight','current-team-panel']]

    def test_canonical_four_roles_and_legacy_pair_pass(self):
        guard.validate_rank_reveal(self.manifest,self.cues,self.tracks,.04)
        guard.validate_rank_reveal(self.manifest,self.cues,self.tracks[:2],.04)

    def test_extra_missing_duplicate_or_unrelated_panel_roles_fail(self):
        variants=[self.tracks[:3],self.tracks+[{'nodeId':'extra','role':'extra','property':'opacity','cueId':'team'}]]
        bad=copy.deepcopy(self.tracks);bad[-1]['role']='unrelated-layer';variants.append(bad)
        bad=copy.deepcopy(self.tracks);bad[-1]['nodeId']=bad[0]['nodeId'];variants.append(bad)
        for tracks in variants:
            with self.assertRaises(guard.EnforcementError):guard.validate_rank_reveal(self.manifest,self.cues,tracks,.04)

    def test_source_and_cumulative_order_remain_required(self):
        for mutate in [lambda m:m['figma'].update(sourceComponentId='episode'),
                       lambda m:m['figma']['rankReveal'].update(visibleRanks=[9])]:
            m=copy.deepcopy(self.manifest);mutate(m)
            with self.assertRaises(guard.EnforcementError):guard.validate_rank_reveal(m,self.cues,self.tracks,.04)
