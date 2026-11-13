#!/usr/bin/env python3
"""Project a verified Lineups packet into the review-preview shell. No routing writes."""
import argparse
import hashlib
import json
from pathlib import Path
import re
import shutil
import subprocess

try:
    from .presentation import prepare_plan, thumbnail as plan_thumbnail
except ImportError:
    from presentation import prepare_plan, thumbnail as plan_thumbnail


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def build(packet, output, base_path=None, title=None, previous=None):
    if base_path is not None and not re.fullmatch(r'/[A-Za-z0-9_/-]*/', base_path):
        raise ValueError('The base path must be an absolute directory path ending in /.')
    source = Path(__file__).parent
    packet, output = Path(packet).resolve(), Path(output).resolve()
    markup = (packet / 'index.html').read_text()
    match = re.search(r'const reviewData\s*=\s*', markup)
    if not match:
        raise ValueError('A generated Lineups review packet is required.')
    data, _ = json.JSONDecoder().raw_decode(markup[match.end():])
    proof = json.loads((packet / 'evidence/cue-proof-receipt.json').read_text())
    if proof['result'] != 'passed' or proof['cueMapSha256'] != data['cueMapSha256']:
        raise ValueError('The packet timing receipt is stale.')
    cue = packet / 'evidence/cue-map.json'
    if not cue.exists() or digest(cue) != data['cueMapSha256']:
        raise ValueError('The current cue map must match its timing receipt.')
    rate = json.loads(cue.read_text())['frameRate']
    if not isinstance(rate, dict) or not isinstance(rate.get('numerator'), int) or not isinstance(rate.get('denominator'), int) or rate['denominator'] <= 0:
        raise ValueError('A verified rational frame rate is required.')
    frame_rate = rate['numerator'] / rate['denominator']
    if not frame_rate.is_integer() or not 1 <= frame_rate <= 120:
        raise ValueError('This pilot requires a verified integer frame rate.')
    frame_rate = int(frame_rate)
    if len({c['id'] for c in data['candidates']}) != len(data['candidates']):
        raise ValueError('Scene IDs must be unique.')
    if not all(re.fullmatch(r'[A-Za-z0-9_-]+', c['id']) for c in data['candidates']):
        raise ValueError('Scene IDs must contain only letters, numbers, underscores or hyphens.')
    subprocess.run(['node', str(source.parents[1] / 'scripts/developer-storage/storage-gate.mjs'),
                    'route', '--client', 'CATENA_MEDIA', '--kind', 'previews'], check=True, capture_output=True)
    output.mkdir(parents=True, exist_ok=True)
    (output / 'assets').mkdir(exist_ok=True)
    (output / 'evidence').mkdir(exist_ok=True)

    def asset(relative, expected=None):
        original = (packet / relative).resolve()
        if not original.is_relative_to(packet / 'assets') or not original.is_file():
            raise ValueError('Media must be a file within the selected packet assets.')
        sha = digest(original)
        if expected and sha != expected:
            raise ValueError('Media bytes do not match this version.')
        if original.stat().st_size > 25 * 1024 * 1024:
            raise ValueError('This preview needs a smaller delivery asset or an approved CDN.')
        target = 'assets/' + sha[:16] + original.suffix
        shutil.copy2(original, output / target)
        return target, sha

    built = {c['id']: c for c in data['postScenes']}
    earlier = {c['id']: c.get('versions', []) for c in (previous or {}).get('scenes', [])}
    scenes = []
    for candidate in data['candidates']:
        c = candidate
        versions = [{'id': 'plan-' + data['cueMapSha256'][:12], 'label': 'Build Storyboard',
                     'stage': 'Plan', 'kind': 'plan', 'sha256': data['cueMapSha256']}]
        thumbnail = None
        for image in c.get('images', [])[:1]:
            url, sha = asset(image['image'])
            thumbnail = url
            versions.append({'id': 'art-' + sha[:12], 'label': 'Source photo', 'stage': 'Artwork',
                             'kind': 'image', 'url': url, 'sha256': sha})
        post = built.get(c['id'])
        if post:
            preview = post['preview']
            url, sha = asset(preview['image'], preview['sha256'])
            is_motion = preview['kind'] == 'video'
            if preview.get('poster'):
                thumbnail, _ = asset(preview['poster'])
            elif not is_motion:
                thumbnail = url
            versions.append({'id': 'render-' + sha[:12], 'label': 'Scene Ready' if is_motion else 'Final artwork',
                             'stage': 'Motion' if is_motion else 'Artwork',
                             'kind': preview['kind'], 'url': url, 'poster': thumbnail, 'sha256': sha})
        source_url = (post or {}).get('sourceUrl') or c.get('sourceUrl')
        presentation = prepare_plan(c)
        if not post:
            versions = versions[1:] + versions[:1]
        # Earlier Studio renders stay, right after the newest render, so the scene still opens on the newest.
        known = {v['sha256'] for v in versions}
        kept = [v for v in earlier.get(c['id'], []) if v.get('kind') != 'plan' and v['sha256'] not in known]
        at = next((i + 1 for i, v in enumerate(versions) if v['id'].startswith('render-')), len(versions))
        versions = versions[:at] + kept + versions[at:]
        thumbnail = plan_thumbnail(presentation, output)
        scenes.append({'id': c['id'], 'title': c['title'], 'lane': c['lane'], 'option': c['option'],
                       'duration': c['duration'], 'anchor': c['anchor'], 'sourceTime': c['time'],
                       'plan': c['reason'], 'planCopy': c.get('copy', c['title']), 'presentation': presentation,
                       'sourcePhotos': [a['name'] for a in c.get('assets', [])],
                       'setting': c['setting'], 'excerpt': c.get('excerpt', ''),
                       'cues': c.get('cues', []), 'engine': c['primaryEngine'], 'thumbnail': thumbnail,
                       'sourceUrl': source_url if source_url and source_url.startswith('https://') else None,
                       'missingAssets': [a['name'] for a in c.get('assetRequests', []) if a.get('status') != 'verified'],
                       'versions': versions})
    week = re.search(r'week-(\d+)', data['episodeId'])
    title = title or data['episodeId'].replace('-', ' ').title()
    reference_label = 'Week ' + week[1] if week else title
    result = {'episodeId': data['episodeId'], 'revision': data['cueMapSha256'], 'title': title,
              'referenceLabel': reference_label, 'client': 'Catena Media', 'fps': frame_rate, 'scenes': scenes,
              'initialScene': next((c['id'] for c in scenes if any(v['kind'] == 'video' for v in c['versions'])), scenes[0]['id'])}
    (output / 'packet.json').write_text(json.dumps(result, ensure_ascii=False, indent=2))
    shutil.copy2(packet / 'evidence/cue-proof-receipt.json', output / 'evidence/timing.json')
    for name in ['index.html', 'app.mjs', 'model.mjs', 'presentation.mjs', 'review.css']:
        shutil.copy2(source / name, output / name)
    if base_path:
        shutil.copy2(source / 'studio-home.mjs', output / 'studio-home.mjs')
        index = output / 'index.html'
        review = output / 'review.html'
        review.write_text(index.read_text().replace('<head>', f'<head>\n  <base href="{base_path}">', 1))
        index.write_text((source / 'studio-home.html').read_text().replace('<head>', f'<head>\n  <base href="{base_path}">', 1))
    return result


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--packet', required=True)
    parser.add_argument('--output', required=True)
    parser.add_argument('--title', help='Episode title shown in Studio.')
    parser.add_argument('--base-path', help='Public directory URL, for example /studio/.')
    parser.add_argument('--previous', help='The current Studio packet.json, so earlier versions stay.')
    args = parser.parse_args()
    previous = json.loads(Path(args.previous).read_text()) if args.previous else None
    result = build(args.packet, args.output, args.base_path, args.title, previous)
    print(json.dumps({'episodeId': result['episodeId'], 'sceneCount': len(result['scenes']), 'output': args.output}))
