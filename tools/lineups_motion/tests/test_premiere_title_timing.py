import copy
import json
import tempfile
import unittest
from pathlib import Path

from tools.lineups_motion import premiere_delivery as gate


class TitleTimingTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.binding = dict(schemaVersion=1, scope='native-title-timing', fps=25,
            projectPath='/week10.prproj', sequenceId='reused', statePath=str(self.root/'state.json'),
            clips=[dict(clipId='reused-clip', name='Graphic', trackIndex=2,
                        beforeStartFrame=250, beforeEndFrame=500, startFrame=125, endFrame=275)])
        self.sign()
        self.sequence = dict(id='reused', videoTracks=[dict(index=2, clips=[dict(
            nodeId='reused-clip', name='Graphic', start=10, end=20, duration=10)])])
        self.context()
        self.readback()

    def sign(self):
        self.binding.pop('approval', None)
        self.binding['approval'] = dict(reviewer='Jerami', status='approved', source='explicit chat approval',
                                        bindingSha256=gate.digest(self.binding))

    def call(self, tool, args=None, response=None, event='PreToolUse'):
        return gate.handle_locked(self.root, dict(tool_name=gate.PREFIX+tool,
            tool_input=args or {}, tool_response=response, hook_event_name=event), self.binding)

    def context(self, path='/week10.prproj', sequence='reused'):
        self.call('get_project_info', response=dict(success=True, path=path, activeSequence=dict(id=sequence)), event='PostToolUse')

    def readback(self):
        self.call('get_full_sequence_info', response=dict(success=True, data=self.sequence), event='PostToolUse')

    def test_move_and_trim_require_current_readback(self):
        args=dict(clipId='reused-clip', newTime=5)
        self.assertTrue(self.call('move_clip', args))
        self.call('move_clip', args, dict(success=True), 'PostToolUse')
        with self.assertRaisesRegex(ValueError, 'read back'):
            self.call('trim_clip', dict(clipId='reused-clip', duration=6))
        self.sequence['videoTracks'][0]['clips'][0].update(start=5,end=15)
        self.readback()
        self.assertTrue(self.call('trim_clip', dict(clipId='reused-clip',duration=6)))

    def test_reused_ids_in_another_project_are_rejected(self):
        self.context('/lamar.prproj')
        with self.assertRaisesRegex(ValueError, 'exact project'):
            self.call('move_clip', dict(clipId='reused-clip',newTime=5))

    def test_wrong_active_sequence_is_rejected(self):
        self.context(sequence='other')
        with self.assertRaisesRegex(ValueError, 'exact project'):
            self.readback()

    def test_stale_approval_is_rejected(self):
        self.binding['clips'][0]['startFrame']=100
        with self.assertRaisesRegex(ValueError, 'approval'):
            self.call('move_clip', dict(clipId='reused-clip',newTime=4))

    def test_wrong_clip_track_or_time_is_rejected(self):
        for args in (dict(clipId='other',newTime=5), dict(clipId='reused-clip',newTime=6),
                     dict(clipId='reused-clip',newTime=5,newTrackIndex=3)):
            with self.subTest(args=args), self.assertRaises(ValueError):
                self.call('move_clip',args)

    def test_live_user_edits_are_preserved(self):
        self.sequence['videoTracks'][0]['clips'][0]['start']=11
        self.readback()
        with self.assertRaisesRegex(ValueError, 'changed since binding'):
            self.call('move_clip',dict(clipId='reused-clip',newTime=5))

    def test_changed_track_or_name_rejected(self):
        for key, value in (('index',3), ('name','footage.mp4')):
            with self.subTest(key=key):
                sequence=copy.deepcopy(self.sequence)
                if key=='index': self.sequence['videoTracks'][0]['index']=value
                else: self.sequence['videoTracks'][0]['clips'][0]['name']=value
                self.readback()
                with self.assertRaisesRegex(ValueError, 'identity or track'):
                    self.call('move_clip',dict(clipId='reused-clip',newTime=5))
                self.sequence=sequence

    def test_no_ingest_or_transition_permission(self):
        for tool in ('add_to_timeline','add_transition_to_clip'):
            with self.subTest(tool=tool), self.assertRaisesRegex(ValueError, 'only move and duration'):
                self.call(tool,dict(clipId='reused-clip'))

    def test_failed_or_pending_write_blocks_retry(self):
        args=dict(clipId='reused-clip',newTime=5)
        self.call('move_clip',args)
        with self.assertRaisesRegex(ValueError, 'failed'):
            self.call('move_clip',args,dict(success=False),'PostToolUse')
        with self.assertRaisesRegex(ValueError, 'previous title edit'):
            self.call('move_clip',args)

    def test_refresh_project_invalidates_previous_sequence(self):
        self.context()
        with self.assertRaisesRegex(ValueError,'read back'):
            self.call('move_clip',dict(clipId='reused-clip',newTime=5))

    def test_move_without_post_hook_recovers_only_from_measured_result(self):
        self.call('move_clip',dict(clipId='reused-clip',newTime=5))
        with self.assertRaisesRegex(ValueError,'pending title edit'):
            self.readback()
        self.sequence['videoTracks'][0]['clips'][0].update(start=5,end=15)
        self.readback()
        self.assertTrue(self.call('trim_clip',dict(clipId='reused-clip',duration=6)))


if __name__ == '__main__':
    unittest.main()
