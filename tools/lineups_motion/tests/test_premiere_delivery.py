import json
import os
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from tools.lineups_motion import premiere_delivery as gate


class DeliveryTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        media = self.root / 'approved.mov'
        from tools.lineups_motion.tests.contract_fixture import delivery_contract
        contract = delivery_contract(self.root, media)

        proof = self.root / 'unreal.json'
        self.row = dict(sceneId='C01', projectItemId='item', eaglePath=str(media),
                        sha256=gate.file_digest(media), labelIndex=3, engine='unreal',
                        eagleItemId='eagle', anchor=10, timelineStartFrame=256,
                        timelineEndFrame=556, durationFrames=300, trackIndex=4,
                        transitionFrames=15, transitionName='Blur Dissolve')
        proof.write_text(json.dumps(dict(humanReview='approved', approval='Jerami approved',
            eagleIntake='verified', scenes=[dict(sceneId='C01', status='checked',
            masterSha256=self.row['sha256'], eagleItemId='eagle', eagleManagedFile=str(media),
            fps=25, frames=300)])))
        self.row['contractManifest'] = contract
        self.row['sourceProof'] = dict(path=str(proof), sha256=gate.file_digest(proof))
        ingest = self.root / 'ingest.json'
        ingest.write_text(json.dumps(dict(project='/week8.prproj', count=1, items=[dict(
            id='item', path=str(media), label=3, treePath='\\06 Motion Renders\\clip.mov')])) )
        self.binding = dict(schemaVersion=1, episodeId='week8', projectPath='/week8.prproj',
            sequenceId='reused-sequence', fps=25, sourceOffsetFrames=6, scenes=[self.row],
            statePath=str(self.root/'state.json'),
            ingestProof=dict(path=str(ingest), sha256=gate.file_digest(ingest)))
        self.path = self.root / 'binding.json'
        self.sign()
        self.env = patch.dict(os.environ, LINEUPS_PREMIERE_DELIVERY_PATH=str(self.path))
        self.env.start()
        self.addCleanup(self.env.stop)
        self.context('/week8.prproj')

    def sign(self):
        self.binding.pop('approval', None)
        self.binding['approval'] = dict(reviewer='Jerami', status='approved', source='chat',
                                        bindingSha256=gate.digest(self.binding))
        self.path.write_text(json.dumps(self.binding))

    def call(self, tool, args=None, response=None, event='PreToolUse'):
        return gate.handle(self.root, dict(tool_name=gate.PREFIX+tool,
            tool_input=args or {}, tool_response=response, hook_event_name=event))

    def context(self, path):
        self.call('get_project_info', response=dict(success=True,path=path), event='PostToolUse')

    def add_args(self):
        return dict(sequenceId='reused-sequence', projectItemId='item', trackIndex=4,
                    time=10.24, insertMode='overwrite', linkAudio=False)

    def place(self):
        args=self.add_args()
        self.assertTrue(self.call('add_to_timeline', args))
        self.call('add_to_timeline',args,dict(success=True,clipId='clip'), 'PostToolUse')

    def test_reused_sequence_does_not_inherit_other_project(self):
        self.context('/last-week.prproj')
        with self.assertRaisesRegex(ValueError,'exact project'):
            self.call('add_to_timeline',self.add_args())

    def test_wrong_item_track_time_or_audio_rejected(self):
        for field,value in [('projectItemId','other'),('trackIndex',3),('time',10),
                            ('linkAudio',True),('insertMode','insert'),('sequenceId','other')]:
            args=self.add_args(); args[field]=value
            with self.subTest(field=field), self.assertRaises(ValueError):
                self.call('add_to_timeline',args)

    def test_timing_only_delivery_cannot_skip_visual_contract(self):
        del self.row['contractManifest']
        self.sign()
        (self.root/'state.json').unlink()
        self.context('/week8.prproj')
        with self.assertRaisesRegex(ValueError, 'evidence'):
            self.call('add_to_timeline', self.add_args())

    def test_native_delivery_rejects_stale_manim_receipt(self):
        manifest = json.loads(Path(self.row['contractManifest']['path']).read_text())
        Path(manifest['timing']['proofPath']).write_text('{}')
        with self.assertRaisesRegex(ValueError, 'Manim timing receipt'):
            self.place()

    def test_valid_unreal_can_place_but_cannot_duplicate(self):
        self.place()
        with self.assertRaisesRegex(ValueError,'already attempted'):
            self.call('add_to_timeline',self.add_args())

    def test_uncertain_result_cannot_be_retried(self):
        self.call('add_to_timeline',self.add_args())
        with self.assertRaises(ValueError):
            self.call('add_to_timeline',self.add_args(),dict(success=False),'PostToolUse')
        with self.assertRaisesRegex(ValueError,'already attempted'):
            self.call('add_to_timeline',self.add_args())

    def test_changed_render_denied(self):
        Path(self.row['eaglePath']).write_bytes(b'changed')
        with self.assertRaisesRegex(ValueError,'render changed'):
            self.call('add_to_timeline',self.add_args())

    def test_stale_approval_denied(self):
        self.binding['scenes'][0]['timelineStartFrame']=250
        self.path.write_text(json.dumps(self.binding))
        with self.assertRaisesRegex(ValueError,'approval'):
            self.call('add_to_timeline',self.add_args())

    def test_invalid_source_anchor_mapping_denied(self):
        self.binding['scenes'][0]['anchor']=9
        self.sign()
        (self.root/'state.json').unlink()
        self.context('/week8.prproj')
        with self.assertRaisesRegex(ValueError,'source anchor'):
            self.call('add_to_timeline',self.add_args())

    def test_transitions_require_measured_clip_and_matching_ends(self):
        self.place()
        args=dict(clipId='clip',position='both',transitionName='Blur Dissolve',durationFrames=15)
        with self.assertRaisesRegex(ValueError,'read back'):
            self.call('add_transition_to_clip',args)
        properties=dict(sequenceId='reused-sequence',trackIndex=4,start=10.24,end=22.24,inPoint=0,outPoint=12)
        self.call('get_clip_properties',dict(clipId='clip'),dict(success=True,properties=properties),'PostToolUse')
        wrong=dict(args,position='start')
        with self.assertRaisesRegex(ValueError,'head/tail'):
            self.call('add_transition_to_clip',wrong)
        self.call('add_transition_to_clip',args)
        with self.assertRaisesRegex(ValueError,'both transition measurements'):
            self.call('add_transition_to_clip',args,dict(success=True,placed=[dict(actualFrames=15),dict(actualFrames=10)]),'PostToolUse')

    def test_foreign_tools_unaffected(self):
        self.assertFalse(gate.handle(self.root,dict(tool_name='other',tool_input={})))
        self.assertFalse(self.call('get_clip_properties',dict(clipId='unrelated')))

    def test_figma_editorial_trim_keeps_full_render_proof(self):
        manifest_path = Path(self.row['contractManifest']['path'])
        manifest = json.loads(manifest_path.read_text())
        manifest['motion']['engine'] = 'figma'
        manifest['export'].update(validationStatus='passed', fileSha256=self.row['sha256'])
        manifest['premiere'] = {'editorialTiming': {
            'timelineStartFrame': 256, 'durationFrames': 100, 'sourceInFrame': 0}}
        self.row.update(engine='figma', durationFrames=100, timelineEndFrame=356)

        def write_source():
            manifest_path.write_text(json.dumps(manifest))
            proof = dict(path=str(manifest_path), sha256=gate.file_digest(manifest_path))
            self.row['contractManifest'] = proof
            self.row['sourceProof'] = proof

        with patch('tools.lineups_motion.contract_gate.check'), patch(
                'tools.lineups_motion.timing_evidence.validate_timing_receipt'):
            write_source()
            gate.validate_source(self.root, self.binding, self.row)
            manifest['premiere']['editorialTiming'].pop('durationFrames')
            write_source()
            with self.assertRaisesRegex(ValueError, 'media timing'):
                gate.validate_source(self.root, self.binding, self.row)

            manifest['premiere']['editorialTiming']['durationFrames'] = 301
            self.row['durationFrames'] = 301
            write_source()
            with self.assertRaisesRegex(ValueError, 'media timing'):
                gate.validate_source(self.root, self.binding, self.row)

    def test_quick_styles_cannot_use_padded_render_as_editorial_duration(self):
        from tools.lineups_motion.templates import quick_style_duration
        manifest_path = Path(self.row['contractManifest']['path'])
        manifest = json.loads(manifest_path.read_text())
        manifest['motion']['engine'] = 'figma'
        manifest['export'].update(validationStatus='passed', fileSha256=self.row['sha256'])
        manifest['premiere'] = {'editorialTiming': {
            'timelineStartFrame': 256, 'durationFrames': 138, 'sourceInFrame': 0}}
        manifest['scene']['editorialDuration'] = quick_style_duration(manifest['motion']['frameRate'])
        self.row.update(engine='figma', durationFrames=138, timelineEndFrame=394)

        def write_source():
            manifest_path.write_text(json.dumps(manifest))
            proof = dict(path=str(manifest_path), sha256=gate.file_digest(manifest_path))
            self.row['contractManifest'] = proof
            self.row['sourceProof'] = proof

        with patch('tools.lineups_motion.contract_gate.check'), patch(
                'tools.lineups_motion.timing_evidence.validate_timing_receipt'):
            for lane in ('quick action photo', 'quick stat'):
                manifest['scene']['lane'] = lane
                self.row['durationFrames'] = 138
                write_source()
                gate.validate_source(self.root, self.binding, self.row)
                self.row['durationFrames'] = 300
                write_source()
                with self.assertRaisesRegex(ValueError, '5.5 seconds'):
                    gate.validate_source(self.root, self.binding, self.row)


if __name__ == '__main__':
    unittest.main()
