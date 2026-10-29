import copy
import importlib.util
import json
import os
import runpy
from pathlib import Path
import subprocess
import tempfile
import unittest
from unittest.mock import patch

SCRIPT = Path(__file__).resolve().parents[1] / 'skills/work-to-content/scripts/social_engine.py'
spec = importlib.util.spec_from_file_location('social_engine', SCRIPT)
engine = importlib.util.module_from_spec(spec)
spec.loader.exec_module(engine)


class RoutingTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.file = self.root / 'workflow.json'
        self.story = {'id': 'sample-story', 'source': {'path': 'sample-interview.jsonl', 'line': 1},
                      'text': 'Synthetic account for routing tests', 'publication_status': 'private_source_only'}
        self.claim = {'id': 'sample-claim', 'story_id': self.story['id'], 'claim': 'Sample estimate',
                      'status': 'estimate_not_control_run', 'public_use': 'label_estimate', 'time_basis': 'hands_on_not_elapsed'}
        self.write_sources()
        self.count = 0
        self.send('start', {'origin': {'kind': 'craft', 'reference': 'craft://sample-idea'}})
        self.send('scope', {'value': 'short', 'user_evidence': 'Synthetic user choice'})

    def write_sources(self):
        (self.root / 'story-source.jsonl').write_text(json.dumps(self.story) + '\n')
        (self.root / 'story-claims.jsonl').write_text(json.dumps(self.claim) + '\n')

    def send(self, op, data=None, **extra):
        self.count += 1
        event = {'event_id': 'e' + str(self.count), 'session_id': 'session-a', 'post_id': 'post-a',
                 'expected_revision': engine.load_state(self.file)['revision'], 'op': op, 'data': data or {}, **extra}
        return engine.apply_event(self.file, event, self.root)

    def post(self):
        return engine.load_state(self.file)['posts']['post-a']

    def choose(self, field, value, status='selected'):
        return self.send('choose', {'field': field, 'value': value, 'status': status, 'basis': 'Synthetic test selection'})

    def to_assets(self):
        self.send('link', {'claim_ids': ['sample-claim']})
        self.send('advance')
        self.choose('attack_type', 'feint')
        self.send('advance')
        self.choose('content_lane', 'exceptional')
        self.send('advance')

    def to_routes(self, assets=None):
        self.to_assets()
        assets = assets or [{'id': 'clip', 'state': 'ready', 'visual': 'Sample clip', 'reference': 'sample://clip'}]
        self.send('assets', {'assets': assets})
        self.send('advance')
        for field, value in {'platform': 'Instagram', 'post_format': 'Reel', 'opening_hook': 'A sample opening',
                             'reference_set': [], 'direct_style': 'Plain explanation'}.items():
            self.choose(field, value)
        self.send('advance')
        beats = [{'id': 'beat-' + a['id'], 'claim_ids': ['sample-claim'], 'asset_id': a['id'],
                  'point': 'Sample claim with estimate label', 'visual': a['visual'],
                  'start_seconds': i * 5, 'end_seconds': (i + 1) * 5} for i, a in enumerate(assets)]
        self.send('storyboard', {'beats': beats})
        self.send('advance')

    def test_intake_new_post_and_legacy_resume(self):
        state = engine.load_state(self.file)
        post = state['posts']['post-a']
        del post['length_scope']
        self.file.write_text(json.dumps(state))
        question = engine.intake_question(self.post())
        self.assertEqual(len(question['options']), 3)
        self.assertNotIn('Other', question['options'])
        with self.assertRaisesRegex(ValueError, 'Choose short form'):
            self.send('advance')
        hint = engine.hook_context({'hook_event_name': 'SessionStart', 'session_id': 'session-a'}, self.file)
        self.assertIn('request_user_input_async', hint)
        self.send('scope', {'value': 'both', 'user_evidence': 'Both requested'})
        self.send('resume', session_id='session-b')
        self.assertIsNone(engine.intake_question(self.post()))
        hint = engine.hook_context({'hook_event_name': 'SessionStart', 'session_id': 'session-b'}, self.file)
        self.assertNotIn('request_user_input_async', hint)
        self.assertIn('Length is saved', hint)

    def test_both_keeps_independent_timelines_and_routes(self):
        self.to_routes()
        beat = self.post()['beats'][0]
        self.send('rewind', {'stage': 'evidence'})
        self.send('scope', {'value': 'both', 'user_evidence': 'Both requested'})
        self.to_assets()
        self.send('assets', {'assets': [{'id': 'clip', 'state': 'ready', 'visual': 'Sample', 'reference': 'sample://clip'}]})
        self.send('advance')
        for field in ['platform', 'post_format', 'opening_hook', 'reference_set', 'direct_style']:
            self.choose(field, self.post()['choices'][field]['value'])
        self.send('advance')
        with self.assertRaisesRegex(ValueError, 'Name the short or long'):
            self.send('storyboard', {'beats': [beat]})
        self.send('storyboard', {'version': 'short', 'beats': [beat]})
        with self.assertRaisesRegex(ValueError, 'separate storyboard'):
            self.send('advance')
        self.send('storyboard', {'version': 'long', 'beats': [{**beat, 'end_seconds': 180}]})
        self.assertEqual(self.post()['storyboards']['short'][0]['end_seconds'], 5)
        self.send('advance')
        self.send('advance')
        self.assertEqual([r['version'] for r in self.post()['routes']], ['short', 'long'])
        self.send('proof', {'claim_id': 'sample-claim', 'status': 'checked', 'reference': 'sample://proof',
                            'finding': 'Account only', 'draft_treatment': 'Label estimate'})
        self.send('assembly', {'value': 'asset_kit', 'user_evidence': 'Synthetic choice'})
        artifact = self.root / 'both.txt'
        artifact.write_text('Both synthetic storyboards')
        with self.assertRaisesRegex(ValueError, 'artifacts for both'):
            self.send('review', {'verdict': 'approved', 'user_evidence': 'Synthetic approval', 'artifacts': [str(artifact)]})
        approved = engine.transition(engine.load_state(self.file), {
            'op': 'review', 'session_id': 'session-a', 'post_id': 'post-a', 'data': {
                'verdict': 'approved', 'user_evidence': 'Both reviewed', 'artifacts': [str(artifact)],
                'artifact_versions': {'short': [str(artifact)], 'long': [str(artifact)]}}}, self.root)
        self.assertIsNone(approved['active_post'])
        self.assertEqual(set(approved['posts']['post-a']['review']['artifact_versions']), {'short', 'long'})
        self.send('rewind', {'stage': 'storyboard'})
        self.assertEqual(self.post()['storyboards'], {})
        self.assertEqual(self.post()['length_scope']['value'], 'both')

    def test_write_in_is_preserved_and_requires_evidence(self):
        for data in [{'value': 'both'}, {'value': 'custom', 'user_evidence': 'Custom requested'}]:
            with self.assertRaises(ValueError):
                self.send('scope', data)
        self.send('scope', {'value': 'custom', 'detail': 'A slide deck first', 'user_evidence': 'Typed request'})
        self.assertEqual(self.post()['length_scope']['detail'], 'A slide deck first')
        self.assertEqual(engine.storyboard_versions(self.post()), ['custom'])

    def test_source_links_preserve_labels_and_detect_drift(self):
        self.send('link', {'claim_ids': ['sample-claim']})
        linked = self.post()['claims'][0]
        self.assertEqual(linked['claim'], self.claim)
        self.assertEqual(linked['source'], self.story['source'])
        self.story['text'] = 'Changed account'
        self.write_sources()
        with self.assertRaisesRegex(ValueError, 'Source changed'):
            self.send('advance')

    def test_missing_and_superseded_claims(self):
        with self.assertRaisesRegex(ValueError, 'Missing or superseded'):
            self.send('link', {'claim_ids': ['not-there']})
        replacement = {**self.claim, 'id': 'correction', 'supersedes': 'sample-claim'}
        with (self.root / 'story-claims.jsonl').open('a') as f:
            f.write(json.dumps(replacement) + '\n')
        with self.assertRaisesRegex(ValueError, 'superseded'):
            self.send('link', {'claim_ids': ['sample-claim']})

    def test_no_stage_skips_or_choice_conflation(self):
        with self.assertRaisesRegex(ValueError, 'Link source'):
            self.send('advance')
        with self.assertRaisesRegex(ValueError, 'another stage'):
            self.choose('post_format', 'Reel')
        self.send('link', {'claim_ids': ['sample-claim']})
        self.send('advance')
        self.choose('attack_type', 'jab', 'proposed')
        with self.assertRaisesRegex(ValueError, 'Select the proposed'):
            self.send('advance')
        with self.assertRaisesRegex(ValueError, 'Choose jab'):
            self.choose('attack_type', 'origins')

    def test_eight_lanes_match_existing_taxonomy(self):
        taxonomy = Path(__file__).resolve().parents[2] / 'social-content/skills/social-content-map/references/content-lanes.json'
        self.assertEqual(engine.LANES, [x['id'] for x in json.loads(taxonomy.read_text())['lanes']])
        self.assertEqual(len(engine.LANES), 8)

    def test_power_rankings_and_prospect_id_mixed_routes(self):
        assets = [
            {'id': 'host', 'state': 'ready', 'reference': 'sample://host-and-transcript', 'visual': 'Mark speaking'},
            {'id': 'ranks', 'state': 'needs_adaptation', 'reference': 'sample://figma-master', 'editable_design': True,
             'visual': 'Rank reveals', 'case': 'power_rankings', 'constraints': {'host_position': 'below', 'rank_position': 'above',
              'preserve_rank_order': True, 'preserve_master': True, 'caption_safe_area': True}},
            {'id': 'board', 'state': 'needs_creation', 'visual': 'Sample progress board', 'case': 'prospect_id',
             'constraints': {'label': 'Reconstruction — sample data', 'sample_data': True, 'sequence': ['On Hold', 'In Queue', 'deadline']}},
            {'id': 'capture', 'state': 'needs_screen_capture', 'visual': 'Existing workflow'},
            {'id': 'voice', 'state': 'needs_recording', 'visual': 'Jerami narration'},
        ]
        self.to_routes(assets)
        self.send('tools', {'figma': {'status': 'available', 'evidence': 'Fixture readback'},
                            'openscreen-demo': {'status': 'unavailable', 'evidence': 'No capture tool exposed'}})
        self.send('advance')
        post = self.post()
        self.assertEqual([r['route'] for r in post['routes']], ['reuse', 'figma_adaptation', 'new_visual', 'screen_capture', 'jerami_recording'])
        self.assertEqual(post['routes'][0]['skills'], [])
        self.assertEqual(post['routes'][2]['constraints']['sequence'], ['On Hold', 'In Queue', 'deadline'])
        self.assertIn('Verify tool: openscreen-demo', engine.review_blockers(post, self.root))
        self.assertTrue(all(r['execution'] == 'not_started' for r in post['routes']))

    def test_case_constraints_cannot_be_dropped(self):
        for case in ['power_rankings', 'prospect_id']:
            with self.subTest(case=case), self.assertRaises(ValueError):
                engine.check_assets([{'id': 'a', 'state': 'needs_creation', 'visual': 'Sample', 'case': case}])

    def test_missing_proof_and_open_assembly_remain_visible(self):
        self.to_routes()
        self.send('advance')
        blockers = engine.review_blockers(self.post(), self.root)
        self.assertIn('Check proof: sample-claim', blockers)
        self.assertIn('Choose assembled_review_draft or asset_kit', blockers)
        self.assertEqual(self.post()['review']['human'], 'pending')
        self.assertEqual(self.post()['recommendation']['status'], 'for_review')
        self.assertEqual(self.post()['recommendation']['personal_youtube_cadence'], 'deferred')

    def test_proof_is_an_observation_not_source_status_upgrade(self):
        self.send('link', {'claim_ids': ['sample-claim']})
        self.send('proof', {'claim_id': 'sample-claim', 'status': 'checked', 'reference': 'sample://proof',
                            'finding': 'Supports account only', 'draft_treatment': 'Label as estimate, hands-on time'})
        self.assertEqual(self.post()['claims'][0]['claim']['status'], 'estimate_not_control_run')
        with self.assertRaisesRegex(ValueError, 'needs a reference'):
            self.send('proof', {'claim_id': 'sample-claim', 'status': 'checked'})

    def test_restart_resume_new_session_and_one_active_post(self):
        self.to_routes()
        before = self.post()
        self.send('resume', session_id='session-b')
        self.assertEqual(self.post(), before)
        output = subprocess.check_output(['python3', str(SCRIPT), 'status', '--state', str(self.file), '--sources', str(self.root)], text=True)
        self.assertEqual(json.loads(output)['state']['posts']['post-a'], before)
        with self.assertRaisesRegex(ValueError, 'Resume the active post'):
            self.send('start', {'origin': {'kind': 'craft', 'reference': 'craft://next'}}, post_id='post-b')
        with self.assertRaisesRegex(ValueError, 'current session'):
            self.send('advance', session_id='unbound')

    def test_rewind_preserves_values_requires_selection_and_rebuild(self):
        self.to_routes()
        self.send('advance')
        self.send('rewind', {'stage': 'attack'})
        self.assertEqual(self.post()['choices']['attack_type']['value'], 'feint')
        self.assertEqual(self.post()['choices']['attack_type']['status'], 'proposed')
        self.assertEqual(self.post()['beats'], [])
        self.assertEqual(self.post()['routes'], [])
        with self.assertRaisesRegex(ValueError, 'Select the proposed'):
            self.send('advance')

    def test_idempotency_revision_and_atomic_failure(self):
        event = {'event_id': 'retry', 'expected_revision': engine.load_state(self.file)['revision'], 'session_id': 'session-a', 'post_id': 'post-a', 'op': 'link', 'data': {'claim_ids': ['sample-claim']}}
        first = engine.apply_event(self.file, event, self.root)
        self.assertEqual(engine.apply_event(self.file, event, self.root), first)
        with self.assertRaisesRegex(ValueError, 'different contents'):
            engine.apply_event(self.file, {**event, 'op': 'advance'}, self.root)
        with self.assertRaisesRegex(ValueError, 'Stale revision'):
            engine.apply_event(self.file, {**event, 'event_id': 'stale'}, self.root)
        before = self.file.read_bytes()
        with patch.object(engine.os, 'replace', side_effect=OSError('interrupted')), self.assertRaises(OSError):
            self.send('advance')
        self.assertEqual(self.file.read_bytes(), before)
        self.assertEqual(list(self.root.glob('.workflow-*')), [])
        self.send('advance')
        self.assertEqual(self.post()['stage'], 'attack')
        self.assertEqual(os.stat(self.file).st_mode & 0o777, 0o600)

    def test_corrupt_state_never_silently_starts_over(self):
        self.file.write_text('{broken')
        with self.assertRaises(ValueError):
            self.send('start')
        hint = engine.hook_context({'hook_event_name': 'SessionStart', 'session_id': 'session-a'}, self.file)
        self.assertIn('unreadable', hint)

    def test_shared_internal_budget_across_both_routes_and_weeks(self):
        self.send('budget', {'id': 'max-1', 'route': 'max_edits', 'week': '2026-10-26', 'minutes': 90})
        self.send('budget', {'id': 'demo-1', 'route': 'jerami_demos', 'week': '2026-10-26', 'minutes': 30})
        with self.assertRaisesRegex(ValueError, 'combined weekly cap'):
            self.send('budget', {'id': 'extra', 'route': 'jerami_demos', 'week': '2026-10-26', 'minutes': 1})
        self.send('budget', {'id': 'next-week', 'route': 'max_edits', 'week': '2026-11-02', 'minutes': 120})
        self.assertTrue(all(x['visibility'] == 'internal' for x in engine.load_state(self.file)['budget_entries'].values()))

    def test_intent_solutions_post_requires_shared_reservation(self):
        state = engine.new_state()
        started = engine.transition(state, {'op': 'start', 'session_id': 'session-a', 'post_id': 'post-a',
            'data': {'origin': {'kind': 'selected_work', 'reference': 'sample://intent', 'client': 'INTENT_SOLUTIONS'},
                     'budget_week': '2026-10-26'}}, self.root)
        self.to_routes()
        state = engine.load_state(self.file)
        state['posts']['post-a']['budget'] = started['posts']['post-a']['budget']
        event = {'op': 'advance', 'session_id': 'session-a', 'post_id': 'post-a'}
        with self.assertRaisesRegex(ValueError, 'Reserve this post'):
            engine.transition(state, event, self.root)
        state = engine.transition(state, {'op': 'budget', 'session_id': 'session-a', 'data': {
            'id': 'reserved', 'week': '2026-10-26', 'minutes': 30, 'route': 'jerami_demos', 'post_id': 'post-a'}}, self.root)
        self.assertEqual(engine.transition(state, event, self.root)['posts']['post-a']['stage'], 'review')

    def test_positive_negative_mixed_triggers(self):
        positive = ['Resume the Social Media Engine', 'Turn my resume story into a LinkedIn post',
                    'Make an Instagram Reel from the Prospect ID board', 'Continue the work-to-content plan']
        negative = ['Tailor my resume for this job', 'Fix the API request hook', 'Resume the server',
                    'Change the Lineups edit', 'Check the Instagram account connection', 'Read the social media API docs',
                    'Write a LinkedIn post about AI hooks.']
        for prompt in positive:
            self.assertTrue(engine.social_intent(prompt), prompt)
        for prompt in negative:
            self.assertFalse(engine.social_intent(prompt), prompt)

    def test_hook_resume_only_bound_session_no_private_prose(self):
        self.to_routes()
        for event, prompt in [('SessionStart', ''), ('UserPromptSubmit', 'Continue the saved post')]:
            hint = engine.hook_context({'hook_event_name': event, 'prompt': prompt, 'session_id': 'session-a'}, self.file)
            self.assertIn('stage routes', hint)
            self.assertNotIn('Sample estimate', hint)
            self.assertNotIn('120', hint)
        self.assertEqual(engine.hook_context({'hook_event_name': 'SessionStart', 'session_id': 'other'}, self.file), '')
        self.assertEqual(engine.hook_context({'hook_event_name': 'UserPromptSubmit', 'prompt': 'Fix my calendar', 'session_id': 'session-a'}, self.file), '')
        self.assertEqual(engine.hook_context({'hook_event_name': 'UserPromptSubmit', 'prompt': 'Resume my job application', 'session_id': 'session-a'}, self.file), '')

    def test_cerebral_reads_saved_stage_without_overriding_disabled_route(self):
        self.to_routes()
        repo = Path(__file__).resolve().parents[3]
        hook = runpy.run_path(str(repo / '.codex/hooks/cerebral_singleton_guard.py'))
        context = hook['context']
        globals_ = context.__globals__
        route = {'route_key': 'work-to-content', 'enabled': True, 'priority': 40, 'trigger_patterns': []}
        payload = {'hook_event_name': 'SessionStart', 'session_id': 'session-a'}
        with patch.dict(globals_, {'routes_for_prompt': lambda: ([route], 'test'),
                                  'social_engine_context': lambda p: engine.hook_context(p, self.file)}):
            packet = context('test resume', '', payload)
            self.assertIn('[route] work-to-content', packet)
            self.assertIn('stage routes', packet)
            route['enabled'] = False
            packet = context('test disabled', '', payload)
            self.assertNotIn('[route] work-to-content', packet)
            self.assertNotIn('Use plugins/', packet)
            self.assertIn('[social-engine-unavailable]', packet)

    def test_unlinked_beats_and_invalid_timing_rejected(self):
        self.to_routes()
        beat = copy.deepcopy(self.post()['beats'][0])
        for update in [{'claim_ids': ['unknown']}, {'asset_id': 'unknown'}, {'end_seconds': float('inf')}, {'start_seconds': -1}]:
            with self.subTest(update=update), self.assertRaises(ValueError):
                engine.check_beats(self.post(), [{**beat, **update}])

    def test_review_requires_exact_artifact_and_does_not_publish(self):
        self.to_routes()
        self.send('advance')
        with self.assertRaisesRegex(ValueError, 'Resolve routing'):
            self.send('review', {'verdict': 'approved', 'user_evidence': 'Synthetic approval'})
        self.send('proof', {'claim_id': 'sample-claim', 'status': 'checked', 'reference': 'sample://proof',
                            'finding': 'Account only', 'draft_treatment': 'Label estimate'})
        self.send('assembly', {'value': 'asset_kit', 'user_evidence': 'Synthetic choice'})
        artifact = self.root / 'sample-kit.txt'
        artifact.write_text('Synthetic review artifact')
        self.send('review', {'verdict': 'approved', 'user_evidence': 'Synthetic approval', 'artifacts': [str(artifact)]})
        self.assertIsNone(engine.load_state(self.file)['active_post'])
        self.assertEqual(self.post()['review']['publication'], 'not_authorized')
        self.assertEqual(len(self.post()['review']['artifacts'][0]['sha256']), 64)
        self.send('start', {'origin': {'kind': 'selected_work', 'reference': 'sample://next'}}, post_id='next-post')

    def test_video_source_time_is_distinct_from_storyboard_time(self):
        asset = {'id': 'clip', 'visual': 'Sample', 'state': 'ready', 'reference': 'sample://video', 'media_kind': 'video'}
        with self.assertRaisesRegex(ValueError, 'source revision'):
            engine.check_assets([asset])
        engine.check_assets([{**asset, 'source_revision': 'revision-1', 'source_range_seconds': [123, 128]}])


if __name__ == '__main__':
    unittest.main()
