import hashlib
import json
import re
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch
import sys

sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from tools.lineups_review.render import excerpt_rows, fill, render_episode, sha, template_lock, verified_preview_directory


class ReviewTests(unittest.TestCase):
    def test_preview_volume_gate_rejects_internal_paths_before_calling_tools(self):
        with patch('tools.lineups_review.render.subprocess.run') as run:
            with self.assertRaisesRegex(ValueError, 'HomeSSD'):
                verified_preview_directory('/tmp/lineups-previews')
            run.assert_not_called()

    def test_preview_volume_gate_failure_stops_output(self):
        import subprocess
        with patch('tools.lineups_review.render.subprocess.run', side_effect=subprocess.CalledProcessError(1, 'storage-gate')):
            with self.assertRaises(subprocess.CalledProcessError):
                verified_preview_directory('/Volumes/HomeSSD/Generated/CATENA_MEDIA/previews/test')

    def test_missing_preview_drive_fails_before_packet_creation(self):
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp);ep=self.fixture(root)
            cue_path=ep/'storyboard/cue-map.json';cue=json.loads(cue_path.read_text())
            cue['candidates'][0]['assets']=[{'eagleItemId':'source'}]
            cue_path.write_text(json.dumps(cue))
            proof_path=ep/'storyboard/cue-proof-receipt.json';proof=json.loads(proof_path.read_text());proof['cueMapSha256']=sha(cue_path);proof_path.write_text(json.dumps(proof))
            meta_path=ep/'review.json';meta=json.loads(meta_path.read_text());meta['previewDirectory']='/Volumes/HomeSSD/Generated/CATENA_MEDIA/previews/test';meta_path.write_text(json.dumps(meta))
            with patch('tools.lineups_review.render.verified_preview_directory', side_effect=ValueError('missing drive')):
                with self.assertRaisesRegex(ValueError, 'missing drive'):render_episode(ep,root/'public')
            self.assertFalse((root/'public').exists())

    def fixture(self,root):
        ep=root/'episode';(ep/'storyboard').mkdir(parents=True);(ep/'transcript').mkdir()
        def write(name,value):
            p=ep/name;p.write_text(json.dumps(value));return p
        write('review.json',{'title':'Another episode','clientLabel':'Client / Lineups','dueLabel':'Confirmed deadline','sourceLabel':'One second','postScenes':[]})
        words=[{'start':0.2,'end':0.4,'word':' Short'},{'start':0.5,'end':0.8,'word':' words'}]
        write('transcript/whisper.json',{'segments':[{'text':' Short words','words':words}]})
        write('transcript/words.json',words)
        lanes=['quick action photo','quick stat','stat breakdown','comparison','year-by-year','asset swap','recurring board']
        write('storyboard/lane-discovery.json',{'transcriptSha256':sha(ep/'transcript/whisper.json'),'fullTranscriptReviewed':True,'lanes':[{'lane':l,'findings':[]} for l in lanes]})
        write('storyboard/lane-marked-transcript.json',{'rows':[]})
        write('storyboard/cue-map.json',{'episodeId':'another-episode','sourceRuntime':2,'primaryInsertSeconds':1,'primarySceneCount':1,'candidates':[{'id':'S01','anchor':0,'duration':1,'lane':'quick stat','option':'Single-frame statement','assets':[]}]})
        write('storyboard/cue-proof-receipt.json',{'result':'passed','cueMapSha256':sha(ep/'storyboard/cue-map.json'),'transcriptSha256':sha(ep/'transcript/whisper.json'),'discoverySha256':sha(ep/'storyboard/lane-discovery.json')})
        return ep

    def test_long_context_cannot_replace_timed_excerpt(self):
        scenes=[{'id':'S','anchor':1,'duration':1,'excerpt':'A whole team passage with many words'}]
        words=[{'start':0.9,'end':1.2,'word':' excluded'},{'start':1.2,'end':1.6,'word':' Actual'},{'start':1.7,'end':2.1,'word':' excluded'}]
        excerpt_rows(scenes,words)
        self.assertEqual(scenes[0]['reviewExcerpt'],'Actual')

    def test_missing_words_fail_closed(self):
        with self.assertRaises(ValueError):excerpt_rows([{'id':'S','anchor':1,'duration':1}],[])

    def test_shared_scripts_use_the_current_template_version(self):
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp);out=render_episode(self.fixture(root),root/'public')
            for page,script in [('index.html','pre.js'),('post-figma.html','post.js')]:
                self.assertIn(f'assets/{script}?v={template_lock()["version"]}',(out/page).read_text())

    def test_assets_needed_excludes_photos_already_assigned_to_scenes(self):
        from PIL import Image
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp);ep=self.fixture(root)
            original=root/'supplied.jpg';Image.new('RGB',(1280,900),'blue').save(original)
            meta=json.loads((ep/'review.json').read_text());meta['previewDirectory']=str(root/'previews')
            (ep/'review.json').write_text(json.dumps(meta))
            cue_path=ep/'storyboard/cue-map.json';cm=json.loads(cue_path.read_text())
            cm['candidates'][0].update({'assetRequests':[{'name':'Supplied player','query':'player','status':'verified','eagleItemId':'OWN'}],
                'assets':[{'eagleItemId':'OWN','eagleMediaPath':str(original),'sha256':sha(original),'name':'Supplied player'}]})
            cm['candidates'].append({'id':'S02','anchor':0,'duration':1,'lane':'quick action photo','option':'Full-frame',
                'assets':[],'assetRequests':[{'name':'Missing player','query':'missing player','status':'needed','eagleItemId':None}]})
            cue_path.write_text(json.dumps(cm))
            proof_path=ep/'storyboard/cue-proof-receipt.json';proof=json.loads(proof_path.read_text());proof['cueMapSha256']=sha(cue_path);proof_path.write_text(json.dumps(proof))
            (ep/'storyboard/asset-proposals.json').write_text(json.dumps({'episodeId':'another-episode','cueMapSha256':sha(cue_path),'slots':[
                {'sceneId':'S01','assetIndex':0,'asset':'Supplied player','options':[]},
                {'sceneId':'S02','assetIndex':0,'asset':'Missing player','options':[]}] }))
            with patch('tools.lineups_review.render.verified_preview_directory', return_value=root/'previews'):
                out=render_episode(ep,root/'public')
            data=json.loads(re.search(r'const reviewData=(.*?);const reviewerPhotoChoices=',(out/'index.html').read_text()).group(1))
            self.assertEqual([(s['sceneId'],s['assetIndex']) for s in data['assetProposals']['slots']],[('S02',0)])
            self.assertEqual([s['id'] for s in data['candidates']],['S01','S02'])

    def test_both_hosts_receive_identical_stage_assets(self):
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp);ep=self.fixture(root);out=render_episode(ep,root/'public',root/'sites')
            preview=root/'sites/decision-maps/another-episode-pre-figma-review'
            for name in ['index.html','post-figma.html','assets/asset-selection.css','assets/pre.js','assets/post.js']:
                self.assertEqual((out/name).read_bytes(),(preview/name).read_bytes())
            self.assertIn('Another episode',(out/'post-figma.html').read_text())

    def test_changed_transcript_rejects_old_timing(self):
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp);ep=self.fixture(root)
            (ep/'transcript/whisper.json').write_text('{"segments":[]}')
            with self.assertRaisesRegex(ValueError,'stale'):render_episode(ep,root/'public')
            self.assertFalse((root/'public').exists())

    def test_template_is_current_and_missing_fields_fail(self):
        self.assertEqual(template_lock()['approvedBy'],'Jerami')
        with self.assertRaises(ValueError):fill('{{missing}}',{})

    def test_word_timing_cannot_drift_from_whisper(self):
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp);ep=self.fixture(root)
            words=json.loads((ep/'transcript/words.json').read_text());words[0]['start']=0.3
            (ep/'transcript/words.json').write_text(json.dumps(words))
            with self.assertRaisesRegex(ValueError,'Word timing'):render_episode(ep,root/'public')


if __name__=='__main__':unittest.main()
