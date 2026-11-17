import copy
import tempfile
import time
import unittest
from unittest.mock import patch
from pathlib import Path

from tools.lineups_motion.premiere_delivery import digest, file_digest, read, save, handle
from tools.lineups_motion.premiere_motion_placement import handle_locked, validate, verify_saved_transition


class MotionPlacementTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        root = Path(self.tmp.name)
        media = root / 'eagle.info' / 'S01.mp4'
        media.parent.mkdir()
        media.write_bytes(b'approved render')
        scene = dict(id='C01', eagleName='S01', motionSha256=file_digest(media), timelineIn=44.861, duration=10.84, hasAudio=True)
        manifest = root / 'manifest.json'
        save(manifest, dict(episode='episode', approvedBy='Jerami', scenes=[scene]))
        self.row = dict(sceneId='C01', projectItemId='item', eagleItemId='eagle', eaglePath=str(media),
                        name='S01.mp4', sha256=scene['motionSha256'], time=44.861, duration=10.84, hasAudio=True)
        self.b = dict(schemaVersion=1, fps=25, episodeId='episode', projectPath='/week10.prproj', sequenceId='seq',
                      trackIndex=4, statePath=str(root / 'state.json'), manifest=dict(path=str(manifest), sha256=file_digest(manifest)), scenes=[self.row])
        self.b['approval'] = dict(reviewer='Jerami', status='approved', source='explicit chat', bindingSha256=digest(self.b))
        self.args = dict(projectItemId='item', sequenceId='seq', trackIndex=4, time=44.861, insertMode='overwrite', linkAudio=True)
        self.seq = dict(id='seq', videoTracks=[dict(index=4, clips=[])])
        self.state = dict(bindingSha256=self.b['approval']['bindingSha256'], project=dict(path='/week10.prproj', sequenceId='seq', at=time.time()),
                          itemsAt=time.time(), sequence=dict(data=self.seq, at=time.time()))
        save(self.b['statePath'], self.state)

    def call(self, tool='add_to_timeline', args=None, response=None):
        return handle_locked(dict(tool_name='mcp__premiere_pro__' + tool, tool_input=self.args if args is None else args,
                                  hook_event_name='PostToolUse' if response is not None else 'PreToolUse', tool_response=response), self.b)

    def test_approved_placement_needs_readback(self):
        self.assertTrue(self.call())
        with self.assertRaisesRegex(ValueError, 'previous'):
            self.call()
        self.seq['videoTracks'][0]['clips'] = [dict(name='S01.mp4', start=44.88, duration=10.84, end=55.72)]
        self.call('get_full_sequence_info', {}, self.seq)
        self.assertNotIn('pending', read(self.b['statePath']))
        with self.assertRaisesRegex(ValueError, 'already placed'):
            self.call()

    def test_wrong_project_reused_ids(self):
        self.state['project']['path'] = '/lamar.prproj'
        save(self.b['statePath'], self.state)
        with self.assertRaisesRegex(ValueError, 'exact motion project'):
            self.call()

    def test_wrong_args(self):
        for key, value in [('trackIndex', 3), ('time', 45), ('linkAudio', False), ('sequenceId', 'other'), ('insertMode', 'insert')]:
            with self.subTest(key=key), self.assertRaises(ValueError):
                self.call(args={**self.args, key: value})

    def test_changed_media(self):
        Path(self.row['eaglePath']).write_bytes(b'new render')
        with self.assertRaisesRegex(ValueError, 'render changed'):
            self.call()

    def test_protect_unrelated_clip(self):
        self.seq['videoTracks'][0]['clips'] = [dict(name='user edit', start=40, end=60)]
        save(self.b['statePath'], self.state)
        with self.assertRaisesRegex(ValueError, 'unapproved V5 overwrite'):
            self.call()

    def test_stale_approval_and_reads(self):
        altered = copy.deepcopy(self.b)
        altered['trackIndex'] = 3
        with self.assertRaisesRegex(ValueError, 'approval changed'):
            validate(altered)
        self.state['itemsAt'] = 0
        save(self.b['statePath'], self.state)
        with self.assertRaisesRegex(ValueError, 'refresh sequence'):
            self.call()

    def test_no_native_or_transition_edits(self):
        for tool in ['move_clip', 'trim_clip', 'add_transition_to_clip']:
            with self.subTest(tool=tool), self.assertRaisesRegex(ValueError, 'placement only'):
                self.call(tool)

    def test_failed_or_wrong_readback_stays_pending(self):
        self.call()
        with self.assertRaisesRegex(ValueError, 'failed'):
            self.call(response={'success': False})
        with self.assertRaisesRegex(ValueError, 'does not match'):
            self.call('get_full_sequence_info', {}, self.seq)
        self.assertIn('pending', read(self.b['statePath']))

    def test_individual_item_readback_supports_older_clients(self):
        self.state['itemsAt'] = 0
        save(self.b['statePath'], self.state)
        item = dict(nodeId='item', mediaPath=self.row['eaglePath'], treePath='\\week10.prproj\\06 Motion Renders\\S01.mp4')
        self.call('get_project_item_info', {'projectItemId': 'item'}, item)
        self.assertTrue(self.call())

    def test_individual_item_rejects_other_project(self):
        item = dict(nodeId='item', mediaPath=self.row['eaglePath'], treePath='\\lamar.prproj\\06 Motion Renders\\S01.mp4')
        with self.assertRaisesRegex(ValueError, 'another project'):
            self.call('get_project_item_info', {'projectItemId': 'item'}, item)

    def transition_plan(self):
        args = dict(clipId='abc', transitionName='Light Leak', position='end', durationFrames=10)
        plan = dict(args=args, name='S01.mp4', trackIndex=4, start=44.88, end=55.72)
        self.b['transitions'] = [plan]
        self.b['approval']['bindingSha256'] = digest({k: v for k, v in self.b.items() if k != 'approval'})
        self.state['bindingSha256'] = self.b['approval']['bindingSha256']
        self.seq['videoTracks'][0]['clips'] = [dict(nodeId='abc', name='S01.mp4', start=44.88, end=55.72)]
        save(self.b['statePath'], self.state)
        return args, plan

    def test_older_measured_result_needs_no_save(self):
        args, plan = self.transition_plan()
        self.call('add_transition_to_clip', args)
        self.call('add_transition_to_clip', args, dict(success=True, frames=10, transitionName='Light Leak',
                  placed=[dict(side='end', requestedFrames=10, actualFrames=10)]))
        self.assertNotIn('pendingTransition', read(self.b['statePath']))
        with self.assertRaisesRegex(ValueError, 'pending'):
            self.call('add_transition_to_clip', args)

    def test_uncertain_transition_still_needs_recovery(self):
        args, plan = self.transition_plan()
        self.call('add_transition_to_clip', args)
        self.call('add_transition_to_clip', args, dict(success=True))
        with self.assertRaisesRegex(ValueError, 'pending'):
            self.call('add_transition_to_clip', args)
        with patch('tools.lineups_motion.premiere_motion_placement.verify_saved_transition') as verify:
            self.call('save_project', {}, dict(success=True))
            verify.assert_called_once_with(self.b, plan)
        self.assertNotIn('pendingTransition', read(self.b['statePath']))

    def test_live_trim_uses_current_edges_without_rebinding(self):
        args, plan = self.transition_plan()
        self.seq['videoTracks'][0]['clips'][0]['end'] = 51
        save(self.b['statePath'], self.state)
        self.call('add_transition_to_clip', args)
        self.assertEqual(read(self.b['statePath'])['transitionAttemptPlan']['end'], 51)

    def test_bad_measurements_keep_transition_pending(self):
        for side, frames in [('start', 10), ('end', 100), ('end', None)]:
            args, _ = self.transition_plan()
            self.call('add_transition_to_clip', args)
            self.call('add_transition_to_clip', args, dict(success=True, transitionName='Light Leak',
                      placed=[dict(side=side, actualFrames=frames)]))
            self.assertIn('pendingTransition', read(self.b['statePath']))

    def through_hook(self, tool, response=None):
        root = Path(self.tmp.name)
        save(root / 'config/lineups/active-premiere-delivery.json', self.b)
        return handle(root, dict(tool_name='mcp__premiere_pro__' + tool, tool_input={},
                                hook_event_name='PostToolUse' if response is not None else 'PreToolUse',
                                tool_response=response))

    def test_stale_binding_does_not_block_discovery_or_authorize_writes(self):
        self.b['approval']['bindingSha256'] = 'stale'
        self.assertTrue(self.through_hook('get_full_sequence_info'))
        self.assertTrue(self.through_hook('get_project_info', dict(success=True, path='/packers.prproj')))
        state = read(self.b['statePath'])
        self.assertNotIn('project', state)
        self.assertNotIn('sequence', state)
        with self.assertRaises(ValueError):
            self.call()

    def test_closed_episode_allows_reads_but_blocks_old_writes(self):
        self.b['status'] = 'closed'
        self.assertTrue(self.through_hook('get_full_sequence_info', self.seq))
        with self.assertRaisesRegex(ValueError, 'episode is closed'):
            self.through_hook('add_transition_to_clip')

    def test_unbound_item_can_be_inspected_without_granting_write_access(self):
        self.assertTrue(self.call('get_project_item_info', dict(projectItemId='new-item')))
        with self.assertRaisesRegex(ValueError, 'unbound motion'):
            self.call(args={**self.args, 'projectItemId': 'new-item'})

    def test_saved_transition_rejects_wrong_name_edge_or_length(self):
        plan = dict(args=dict(transitionName='Light Leak', position='end', durationFrames=10), end=10)
        for row in [dict(name='Grunge', start=9.6, end=10), dict(name='Light Leak', start=9.5, end=9.9),
                    dict(name='Light Leak', start=9.4, end=10)]:
            with patch('tools.lineups_motion.premiere_motion_placement.saved_transitions', return_value=[row]):
                with self.assertRaisesRegex(ValueError, 'name, edge or frame'):
                    verify_saved_transition(self.b, plan)
        with patch('tools.lineups_motion.premiere_motion_placement.saved_transitions',
                   return_value=[dict(name='Light Leak', start=9.6, end=10)]):
            verify_saved_transition(self.b, plan)
