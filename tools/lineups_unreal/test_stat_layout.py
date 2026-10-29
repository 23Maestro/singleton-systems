import unittest
from tools.lineups_unreal.stat_layout import distribute_stats, hug_callout, check_stat_layout, check_callout


class StatLayoutTests(unittest.TestCase):
    def test_three_stats_have_true_middle_and_equal_columns(self):
        row = distribute_stats([{'value': 316, 'label': 316}, {'value': 140, 'label': 270}, {'value': 91, 'label': 108}], 734, 1808)
        self.assertEqual(row['mode'], 'equal-columns')
        self.assertAlmostEqual(row['groups'][1]['center'], (734+1808)/2)
        self.assertAlmostEqual(row['groups'][0]['left'], 766)
        self.assertAlmostEqual(row['groups'][-1]['right'], 1776)

    def test_four_stats_hug_wider_value_or_label_with_equal_gaps(self):
        row = distribute_stats([{'value': 316, 'label': 300}, {'value': 140, 'label': 270}, {'value': 91, 'label': 108}, {'value': 124, 'label': 230}], 734, 1808)
        self.assertEqual(row['mode'], 'content-width')
        for a, b in zip(row['groups'], row['groups'][1:]):
            self.assertAlmostEqual(b['left']-a['right'], row['gapPx'])
        self.assertAlmostEqual(row['groups'][-1]['right'], 1776)

    def test_changed_data_reflows_without_changing_type(self):
        original = [{'value': 100, 'label': 240}, {'value': 280, 'label': 90}, {'value': 60, 'label': 75}, {'value': 120, 'label': 220}]
        changed = [dict(r) for r in original]; changed[0]['value'] = 350
        a = distribute_stats(original, 100, 1200); b = distribute_stats(changed, 100, 1200)
        self.assertNotEqual(a['groups'], b['groups'])
        self.assertEqual(b['glyphWidthsPx'][0], 350)

    def test_overflow_or_unbuilt_geometry_is_rejected(self):
        for measurements in ([{'value': 400, 'label': 300}]*4, [{'value': 0, 'label': 0}]*3):
            with self.assertRaises(ValueError): distribute_stats(measurements, 734, 1808)

    def test_callout_grows_with_text_and_keeps_padding(self):
        self.assertEqual(hug_callout([665, 904, 1389, 951]), [645, 894, 1409, 961])
        self.assertEqual(hug_callout([800, 904, 1000, 951]), [780, 894, 1020, 961])

    def test_compact_three_point_row_has_equal_visible_outer_padding_and_inner_gaps(self):
        sizes=[{'value':316,'label':316},{'value':140,'label':270},{'value':91,'label':108}]
        row=distribute_stats(sizes,734,1808,gap_px=48)
        self.assertEqual(row['mode'],'packed-content')
        self.assertAlmostEqual(row['groups'][0]['left']-734,1808-row['groups'][-1]['right'])
        for a,b in zip(row['groups'],row['groups'][1:]):
            self.assertAlmostEqual(b['left']-a['right'],48)
        self.assertEqual(row['glyphWidthsPx'],[316,270,108])

    def test_space_evenly_moves_outer_stats_toward_edges_by_same_amount(self):
        sizes=[{'value':316,'label':316},{'value':140,'label':270},{'value':91,'label':108}]
        compact=distribute_stats(sizes,734,1808,gap_px=48)
        row=distribute_stats(sizes,734,1808,space_evenly=True)
        groups=row['groups'];gap=row['gapPx']
        self.assertGreater(gap,48)
        self.assertAlmostEqual(groups[0]['left']-734,gap)
        self.assertAlmostEqual(1808-groups[-1]['right'],gap)
        for a,b in zip(groups,groups[1:]):self.assertAlmostEqual(b['left']-a['right'],gap)
        self.assertAlmostEqual(compact['groups'][0]['center']-groups[0]['center'],groups[-1]['center']-compact['groups'][-1]['center'])
        self.assertAlmostEqual(groups[1]['center'],compact['groups'][1]['center'])
        self.assertEqual(row['glyphWidthsPx'],[316,270,108])

    def test_compact_row_rejects_shift_outside_card(self):
        with self.assertRaises(ValueError):
            distribute_stats([{'value':316,'label':316},{'value':140,'label':270},{'value':91,'label':108}],734,1808,gap_px=48,offset_x=500)

    def test_native_padding_check_rejects_uniform_right_shift(self):
        sizes=[{'value':316,'label':316},{'value':140,'label':270},{'value':91,'label':108}]
        layout=distribute_stats(sizes,734,1808,gap_px=48)
        rows=[{k:{'pixelBounds':[g['center']-size[k]/2,0,g['center']+size[k]/2,100]} for k in ('value','label')} for size,g in zip(sizes,layout['groups'])]
        data={'cardBoundsPx':[734,0,1808,300],'controls':{'MASK_Stats_Box':{'boundsPx':[734,0,1808,300]}},'stats':rows}
        settings={'paddingPx':32,'minimumGapPx':16,'gapPx':48,'equalOuterPadding':True}
        self.assertTrue(check_stat_layout(data,settings)['passed'])
        for row in rows:
            for kind in ('value','label'):
                row[kind]['pixelBounds'][0]+=48;row[kind]['pixelBounds'][2]+=48
        self.assertIn('left and right visible padding differ',check_stat_layout(data,settings)['errors'])

    def test_readback_rejects_number_not_centered_over_label(self):
        measurements=[{'value':100,'label':100}]*3
        expected=distribute_stats(measurements,100,1000)
        rows=[{k:{'pixelBounds':[g['center']-50,0,g['center']+50,50]} for k in ('value','label')} for g in expected['groups']]
        data={'cardBoundsPx':[100,0,1000,300],'controls':{'MASK_Stats_Box':{'boundsPx':[100,0,1000,300]}},'stats':rows}
        settings={'paddingPx':32,'minimumGapPx':16}
        self.assertTrue(check_stat_layout(data,settings)['passed'])
        data['stats'][1]['value']['pixelBounds'][0]+=10
        self.assertFalse(check_stat_layout(data,settings)['passed'])

    def test_hugging_plate_must_remain_behind_text_after_native_auto_sort(self):
        controls={'Text_Asterisk':{'boundsPx':[665,904,1389,951],'sortPriorities':[5]*20},
                  'LineupsStat_SpeakerCallout':{'boundsPx':[645,894,1409,961],'sortPriorities':[4]}}
        settings={'paddingXPx':20,'paddingYPx':10}
        self.assertTrue(check_callout(controls,settings)['passed'])
        controls['LineupsStat_SpeakerCallout']['sortPriorities']=[6]
        self.assertFalse(check_callout(controls,settings)['passed'])
