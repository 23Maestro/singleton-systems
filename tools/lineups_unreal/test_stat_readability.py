"""Regression coverage for masks that crop otherwise large native text."""
import copy
import unittest
from tools.lineups_unreal.stat_readability import check_readability


def settled():
    return {'stats':[{'value':{'pixelBounds':[790,589,1106,695]},
                      'label':{'pixelBounds':[790,721,1106,770]}}],
            'controls':{'MASK_Stats_Box':{'boundsPx':[734,482,1850,838]},
                        'MASK_Stat_Titles':{'boundsPx':[-28,694,1985,1060]},
                        'Text_Position':{'boundsPx':[873,164,958,207]},
                        'MASK_Text_Position':{'boundsPx':[852,153,979,218]},
                        'Text_Asterisk':{'boundsPx':[665,904,1389,951],'typeface':'Bold'},
                        'MASK_Main_Box':{'boundsPx':[142,145,1420,978]}}}


class StatReadabilityTests(unittest.TestCase):
    def test_full_glyphs_inside_masks_pass(self):
        self.assertTrue(check_readability(settled())['passed'])

    def test_large_geometry_cropped_by_original_label_mask_fails(self):
        data=settled();data['controls']['MASK_Stat_Titles']['boundsPx'][1]=734
        result=check_readability(data)
        self.assertFalse(result['passed'])
        self.assertIn('stat 1 label is clipped by its mask',result['errors'])

    def test_enlarged_qb_cropped_by_original_mask_fails(self):
        data=settled();data['controls']['Text_Position']['boundsPx']=[864,136,968,189]
        data['controls']['MASK_Text_Position']['boundsPx']=[852,177,979,216]
        self.assertIn('QB is clipped by its mask',check_readability(data)['errors'])

    def test_tiny_qb_and_nonbold_season_fail(self):
        data=copy.deepcopy(settled());data['controls']['Text_Position']['boundsPx']=[900,180,930,199]
        data['controls']['Text_Asterisk']['typeface']='Semi Bold Italic'
        result=check_readability(data)
        self.assertIn('QB is below 36 px',result['errors'])
        self.assertIn('season line is not the requested Bold face',result['errors'])


if __name__=='__main__':unittest.main()
