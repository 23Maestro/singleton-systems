#!/usr/bin/env python3
"""Codex-only Sunday source discovery. Does not publish or prescribe routines."""
import argparse,json,pathlib,urllib.request,datetime,sys
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1] / "tools/scrapecreators/scripts"))
from request import request as api
p=argparse.ArgumentParser()
p.add_argument('--handle',default='coachgreen.pt')
p.add_argument('--reel',help='Inspect one original Instagram reel URL')
p.add_argument('--download',action='store_true',help='Download that reel to the private review folder')
a=p.parse_args()
folder=pathlib.Path('output/fitness/sources')/str(datetime.date.today());folder.mkdir(parents=True,exist_ok=True)
if a.reel:
    if not a.reel.startswith('https://www.instagram.com/reel/'):p.error('Use an original https://www.instagram.com/reel/ URL')
    result=api('/v1/instagram/post',{'url':a.reel,'include_play_count':'false','cache_max_age':'7d'})
    media=result.get('data',{}).get('xdt_shortcode_media',{})
    code=media.get('shortcode') or a.reel.rstrip('/').split('/')[-1]
    caption='\n'.join(e.get('node',{}).get('text','') for e in media.get('edge_media_to_caption',{}).get('edges',[]))
    (folder/(code+'.json')).write_text(json.dumps(result,indent=2))
    print(json.dumps({'source':a.reel,'caption':caption,'review_file':str(folder/(code+'.json'))},indent=2))
    if a.download and media.get('video_url'):
        urllib.request.urlretrieve(media['video_url'],folder/(code+'.mp4'))
        print('Downloaded for local review:',folder/(code+'.mp4'))
else:
    result=api('/v1/instagram/user/reels',{'handle':a.handle,'trim':'true'})
    path=folder/(a.handle+'-reels.json');path.write_text(json.dumps(result,indent=2))
    print('Saved creator feed for Codex review:',path)
    print('Review captions and footage before assigning any movement. No plan was changed.')
