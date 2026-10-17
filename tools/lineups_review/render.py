"""Render both Lineups review stages from one locked UI bundle."""
from pathlib import Path, PurePosixPath
import copy
import hashlib
import html
import json
import re
import shutil
import subprocess
from urllib.parse import urlsplit

BUNDLE = Path(__file__).resolve().parent
ROOT = BUNDLE.parents[1]
LOCK = ROOT / 'config/lineups/review-template.json'


def read_json(path):
    return json.loads(Path(path).read_text())


def sha(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def template_lock():
    lock = read_json(LOCK)
    for name, digest in lock['files'].items():
        if sha(BUNDLE / name) != digest:
            raise ValueError(f'Locked review template changed: {name}')
    return lock


def verified_preview_directory(value):
    target = Path(value).expanduser().absolute()
    expected = Path('/Volumes/HomeSSD/Generated/CATENA_MEDIA/previews')
    if not target.resolve().is_relative_to(expected):
        raise ValueError('Lineups media previews must stay in CATENA_MEDIA/previews on HomeSSD')
    gate = ROOT / 'scripts/developer-storage/storage-gate.mjs'
    result = subprocess.run(['node', str(gate), 'route', '--client', 'CATENA_MEDIA',
                             '--kind', 'previews'], check=True, capture_output=True, text=True)
    routed = Path(result.stdout.strip()).resolve(strict=True)
    if not target.resolve().is_relative_to(routed):
        raise ValueError('Lineups media previews escape the verified directory')
    return target.resolve()


def relative_path(value):
    p = PurePosixPath(value)
    if p.is_absolute() or '..' in p.parts or '\\' in value:
        raise ValueError('Review asset path must stay inside its packet')
    return Path(value)


def safe_url(value):
    if urlsplit(value).scheme.lower() not in ['', 'http', 'https', 'eagle']:
        raise ValueError('Unsupported review link protocol')
    return value


def excerpt_rows(candidates, words):
    rows = []
    for c in candidates:
        start, end = c['anchor'], c['anchor'] + c['duration']
        matches = [(i, w) for i, w in enumerate(words) if w['start'] >= start and w['end'] <= end]
        if not matches:
            raise ValueError(f"No transcript words in scene interval: {c['id']}")
        c['reviewExcerpt'] = ''.join(w['word'] for _, w in matches).strip()
        rows.append({'sceneId': c['id'], 'sceneStart': start, 'sceneEnd': end,
                     'firstWordIndex': matches[0][0], 'lastWordIndex': matches[-1][0],
                     'excerptStart': matches[0][1]['start'], 'excerptEnd': matches[-1][1]['end'],
                     'text': c['reviewExcerpt']})
    return rows


def verify_word_source(transcript, words):
    if 'transcription' in transcript:
        expected = [(t['text'], t['offsets']['from'] / 1000, t['offsets']['to'] / 1000)
                    for segment in transcript['transcription'] for t in segment['tokens']
                    if not t['text'].startswith('[_')]
    else:
        expected = [(w['word'], w['start'], w['end'])
                    for segment in transcript.get('segments', []) for w in segment.get('words', [])]
    actual = [(w['word'], w['start'], w['end']) for w in words]
    if not expected or actual != expected:
        raise ValueError('Word timing does not match the bound Whisper transcript')


def fill(template, values):
    def replace(match):
        key = match.group(1)
        if key not in values:
            raise ValueError(f'Missing review field: {key}')
        return values[key]
    return re.sub(r'\{\{([a-zA-Z]+)\}\}', replace, template)


def render_episode(episode, destination, preview_root=None):
    episode, destination = Path(episode).resolve(), Path(destination).resolve()
    lock = template_lock()
    meta = read_json(episode / 'review.json')
    source = episode / 'storyboard'
    cm = read_json(source / 'cue-map.json')
    proof = read_json(source / 'cue-proof-receipt.json')
    discovery = read_json(source / 'lane-discovery.json')
    cue_hash = sha(source / 'cue-map.json')
    transcript_hash = sha(episode / 'transcript/whisper.json')
    if proof['result'] != 'passed' or proof['cueMapSha256'] != cue_hash:
        raise ValueError('Review requires a current passed timing receipt')
    if proof['transcriptSha256'] != transcript_hash or discovery['transcriptSha256'] != transcript_hash:
        raise ValueError('Review transcript evidence is stale')
    if proof['discoverySha256'] != sha(source / 'lane-discovery.json') or not discovery['fullTranscriptReviewed']:
        raise ValueError('Review discovery evidence is stale')
    approved_lanes = {'quick action photo', 'quick stat', 'stat breakdown', 'comparison', 'year-by-year', 'asset swap', 'recurring board'}
    if {l['lane'] for l in discovery['lanes']} != approved_lanes or len(discovery['lanes']) != 7:
        raise ValueError('Review requires discovery across all seven lanes')
    candidates = copy.deepcopy(cm['candidates'])
    if len({c['id'] for c in candidates}) != len(candidates):
        raise ValueError('Duplicate review scene ID')
    words = read_json(episode / 'transcript/words.json')
    verify_word_source(read_json(episode / 'transcript/whisper.json'), words)
    excerpts = excerpt_rows(candidates, words)
    proposals_path = source / 'asset-proposals.json'
    proposals = read_json(proposals_path) if proposals_path.exists() else {'episodeId': cm['episodeId'], 'cueMapSha256': cue_hash, 'slots': []}
    if proposals['cueMapSha256'] != cue_hash:
        raise ValueError('Photo proposals are stale')
    if any(len(s['options']) > 2 for s in proposals['slots']):
        raise ValueError('At most two photo options per asset')
    retrieval_slots = []
    for slot in proposals['slots']:
        scene = next(c for c in candidates if c['id'] == slot['sceneId'])
        request = scene['assetRequests'][slot['assetIndex']]
        assigned = request.get('status') == 'verified' and any(
            a['eagleItemId'] == request.get('eagleItemId') for a in scene['assets'])
        if not assigned:
            retrieval_slots.append(slot)
    proposals['slots'] = retrieval_slots
    slug = meta.get('reviewSlug', cm['episodeId'] + '-pre-figma-review')
    if not re.fullmatch(r'[a-z0-9][a-z0-9-]+', slug):
        raise ValueError('Invalid review slug')
    preview_dir = verified_preview_directory(meta['previewDirectory']) if any(c['assets'] for c in candidates) else None
    packet = destination / slug
    assets, evidence = packet / 'assets', packet / 'evidence'
    assets.mkdir(parents=True, exist_ok=True)
    evidence.mkdir(exist_ok=True)
    for name in lock['files']:
        if name.endswith(('.css', '.js')):
            shutil.copy2(BUNDLE / name, assets / name)
    for c in candidates:
        if not re.fullmatch(r'[A-Za-z0-9_-]+', c['id']):
            raise ValueError('Invalid review scene ID')
        if c.get('sourceUrl'):
            safe_url(c['sourceUrl'])
        c['images'] = []
        for a in c['assets']:
            original = Path(a['eagleMediaPath'])
            if sha(original) != a['sha256']:
                raise ValueError(f"Eagle source hash changed: {a['eagleItemId']}")
            from PIL import Image
            image = Image.open(original).convert('RGB')
            image.thumbnail((1600, 1100))
            name = a['eagleItemId'] + '.jpg'
            preview_dir.mkdir(parents=True, exist_ok=True)
            image.save(preview_dir / name, quality=90)
            shutil.copy2(preview_dir / name, assets / name)
            c['images'].append({'image': 'assets/' + name, 'label': a['name'], 'id': a['eagleItemId']})
    for slot in proposals['slots']:
        for option in slot['options']:
            original = Path(option['originalPath'])
            if sha(original) != option['sha256'] or option['height'] <= 740:
                raise ValueError('Photo option fails source or resolution verification')
            from PIL import Image
            with Image.open(original) as image:
                if image.size != (option['width'], option['height']):
                    raise ValueError('Photo option dimensions do not match the original')
            safe_url(option['sourceUrl'])
            target = packet / relative_path(option['image'])
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(original, target)
    choices_path = source / 'reviewer-photo-choices.json'
    choices = read_json(choices_path) if choices_path.exists() else {}
    post = []
    for built in meta.get('postScenes', []):
        matches = [c for c in candidates if c['id'] == built['sceneId']]
        if len(matches) != 1:
            raise ValueError('Post-Figma scene does not match current candidate')
        preview = built['preview']
        original = Path(preview['path'])
        if sha(original) != preview['sha256']:
            raise ValueError('Post-Figma preview hash is stale')
        if preview['kind'] not in ['image', 'video']:
            raise ValueError('Invalid Post-Figma preview kind')
        c = copy.deepcopy(matches[0])
        target = Path('assets') / ('post-' + c['id'] + '-' + preview['sha256'][:12] + original.suffix)
        shutil.copy2(original, packet / target)
        c['preview'] = {'image': str(target), 'kind': preview['kind'], 'sha256': preview['sha256']}
        c['proofUrl'] = safe_url(built.get('proofUrl', 'evidence/cue-proof-receipt.json'))
        c['sourceUrl'] = safe_url(built.get('sourceUrl', c.get('sourceUrl', '')))
        post.append(c)
    rows = read_json(source / 'lane-marked-transcript.json')['rows']
    lanes = [l['lane'] for l in discovery['lanes']]
    data = {'episodeId': cm['episodeId'], 'templateId': lock['templateId'], 'cueMapSha256': cue_hash,
            'sceneStorageKey': meta.get('sceneStorageKey', 'lineups-scenes-' + cm['episodeId'] + '-' + cue_hash[:16]),
            'assetProposals': proposals, 'assetProposalsSha256': sha(proposals_path) if proposals_path.exists() else None,
            'photoChoices': choices, 'presenterName': meta.get('presenterName', 'Mark'), 'assetSubjects': meta.get('assetSubjects', {}),
            'initialReviewSlot': meta.get('initialReviewSlot'), 'candidates': candidates,
            'transcriptRows': rows, 'lanes': lanes, 'postScenes': post,
            'postEvidenceSha256': hashlib.sha256(json.dumps({'cueMapSha256': cue_hash, 'scenes': meta.get('postScenes', [])}, sort_keys=True).encode()).hexdigest()}
    pct = cm['primaryInsertSeconds'] / cm['sourceRuntime'] * 100
    esc = html.escape
    lane_rows = ''.join('<tr><th scope="row">' + esc(l['lane']) + '</th><td>' + esc(' '.join(f['outcome'].upper() + ': ' + f['reason'] for f in l['findings'])) + '</td></tr>' for l in discovery['lanes'])
    cards = ''.join('<article class="asset"><h2>' + esc(c['title']) + '</h2><p>' + ' · '.join('<a href="' + esc(safe_url(link['href']), quote=True) + '">' + esc(link['label']) + '</a>' for link in c['links']) + '</p></article>' for c in meta.get('evidenceCards', []))
    values = {'presenterName': esc(meta.get('presenterName', 'Mark')), 'title': esc(meta['title']), 'clientLabel': esc(meta['clientLabel']), 'dueLabel': esc(meta['dueLabel']),
              'primaryCount': str(cm['primarySceneCount']), 'candidateCount': str(len(candidates)),
              'laneCount': str(len({c['lane'] for c in candidates if not c.get('alternative')})),
              'alternativeCount': str(sum(bool(c.get('alternative')) for c in candidates)),
              'insertPercent': f'{pct:.2f}', 'cameraPercent': f'{100-pct:.2f}',
              'insertSeconds': str(cm['primaryInsertSeconds']), 'sourceLabel': esc(meta['sourceLabel']),
              'laneRows': lane_rows, 'evidenceCards': cards, 'reviewData': json.dumps(data, ensure_ascii=False).replace('</', '<\\/')}
    for output, template in [('index.html', 'pre.html'), ('post-figma.html', 'post.html')]:
        markup = fill((BUNDLE / template).read_text(), values)
        markup = re.sub(r'src="(assets/([^"?]+\.js))"', lambda m: f'src="{m[1]}?v={lock["version"]}-{lock["files"][m[2]][:12]}"', markup)
        (packet / output).write_text(markup)
    for name in ['cue-map.json', 'cue-proof-receipt.json', 'lane-discovery.json', 'lane-marked-transcript.json', 'asset-ledger.json', 'asset-proposals.json', 'reviewer-photo-choices.json', 'packet.md']:
        if (source / name).exists():
            shutil.copy2(source / name, evidence / name)
    for name in ['words.json', 'whisper.json']:
        shutil.copy2(episode / 'transcript' / name, evidence / name)
    for name in ['google-asset-search.json', 'eagle-support-search.json']:
        if (episode / name).exists():
            shutil.copy2(episode / name, evidence / name)
    text = [meta['title'] + ' — transcript with proposed lanes', 'Original transcript wording.\n']
    for r in rows:
        tags = '; '.join(f"{x['id']} · {x['lane']} · {x['option']} [{x['start']:.2f}–{x['end']:.2f}]" for x in r.get('lanes', [])) or meta.get('presenterName', 'Mark') + ' on screen'
        optional = '; '.join(f"optional {x['id']} · {x['lane']}" for x in r.get('optionalLanes', []))
        text.extend([f"[{r['start']:.2f}–{r['end']:.2f}] {tags}" + (' | ' + optional if optional else ''), r['text'], ''])
    transcript_text = evidence / 'transcript-lanes.txt'
    transcript_text.write_text('\n'.join(text))
    (evidence / 'transcript-lanes.txt.writing-origin.json').write_text(json.dumps({'origin': 'client-source', 'source': 'Original client transcript with proposed lane labels', 'contentSha256': sha(transcript_text)}, indent=2) + '\n')
    (evidence / 'review-excerpts.json').write_text(json.dumps({'cueMapSha256': cue_hash, 'wordsSha256': sha(episode / 'transcript/words.json'), 'rows': excerpts}, indent=2) + '\n')
    receipt = {'templateId': lock['templateId'], 'version': lock['version'], 'files': lock['files'],
               'pages': {n: sha(packet / n) for n in ['index.html', 'post-figma.html']}}
    (packet / 'review-template.json').write_text(json.dumps(receipt, indent=2) + '\n')
    if preview_root:
        preview = Path(preview_root).resolve() / 'decision-maps' / slug
        shutil.copytree(packet, preview, dirs_exist_ok=True)
    return packet
