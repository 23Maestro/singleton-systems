"""Structural discovery freshness checks; editorial reasoning still needs review."""

import hashlib
import json
import math
from pathlib import Path

LANES = ('quick action photo', 'quick stat', 'stat breakdown', 'comparison',
         'year-by-year', 'asset swap', 'recurring board')


def validate_discovery(root, episode_id, transcript_path, discovery_path):
    if not transcript_path or not discovery_path:
        raise ValueError('Lineups discovery requires transcriptPath and discoveryPath')
    root = Path(root)
    transcript = (root / transcript_path).resolve()
    ledger = json.loads((root / discovery_path).read_text())
    digest = hashlib.sha256(transcript.read_bytes()).hexdigest()
    if ledger.get('schemaVersion') != 1 or ledger.get('episodeId') != episode_id:
        raise ValueError('discovery identifies a different episode or schema')
    if ledger.get('transcriptSha256') != digest:
        raise ValueError('discovery is stale for the transcript revision')
    if ledger.get('fullTranscriptReviewed') is not True:
        raise ValueError('discovery requires full-transcript review coverage')
    rows = ledger.get('lanes') or []
    if len(rows) != 7 or {row.get('lane') for row in rows} != set(LANES):
        raise ValueError('discovery must consider all seven lanes exactly once')
    segments = json.loads(transcript.read_text()).get('transcription')
    if not isinstance(segments, list) or not segments:
        raise ValueError('discovery requires a nonempty timestamped Whisper transcription')
    for row in rows:
        if row.get('reviewedSegmentIds') != list(range(len(segments))):
            raise ValueError('discovery coverage must include every transcript segment in every lane')
        findings = row.get('findings')
        if not isinstance(findings, list) or not findings:
            raise ValueError('discovery requires an outcome for every lane')
        for finding in findings:
            if finding.get('outcome') not in ('candidate', 'rejected', 'no-fit') or not str(finding.get('reason') or '').strip():
                raise ValueError('discovery requires candidate, rejected or no-fit outcomes with reasons')
            if finding['outcome'] == 'no-fit':
                if len(findings) != 1:
                    raise ValueError('discovery no-fit cannot accompany candidates or rejections')
                continue
            ids = finding.get('segmentIds')
            excerpt = finding.get('excerpt')
            start, end = finding.get('start'), finding.get('end')
            if (not isinstance(ids, list) or not ids or any(type(i) is not int or not 0 <= i < len(segments) for i in ids)
                    or ids != list(range(ids[0], ids[-1] + 1))
                    or not isinstance(excerpt, str) or not excerpt.strip()
                    or excerpt.strip() not in ' '.join(segments[i]['text'].strip() for i in ids)
                    or any(type(t) not in (int, float) or not math.isfinite(t) for t in (start, end))
                    or not segments[ids[0]]['offsets']['from'] / 1000 <= start < end <= segments[ids[-1]]['offsets']['to'] / 1000):
                raise ValueError('discovery requires actual source excerpts and timestamps within their segments')
            if finding['outcome'] == 'candidate':
                search = finding.get('assetSearch') or {}
                if search.get('status') not in ('needed', 'verified', 'not-required') or not search.get('evidence'):
                    raise ValueError('discovery candidates require explicit asset search work or evidence')
    return ledger


def validate_scene_discovery(root, manifest):
    scene = manifest['scene']
    ledger = validate_discovery(root, scene['episodeId'], manifest.get('timing', {}).get('transcriptPath'),
                                manifest.get('discoveryPath'))
    candidates = [finding for row in ledger['lanes'] if row['lane'] == scene['lane']
                  for finding in row['findings'] if finding['outcome'] == 'candidate'
                  and finding.get('candidateId') == scene['sceneId']]
    if len(candidates) != 1:
        raise ValueError('selected scene must identify exactly one discovered candidate in its lane')
    candidate = candidates[0]
    anchor = manifest['timing']['verifiedAnchorTimestamp']
    if not candidate['start'] <= anchor < candidate['end']:
        raise ValueError('selected scene anchor falls outside its discovered source passage')
    return ledger


if __name__ == '__main__':
    import sys
    try:
        record = json.loads(sys.stdin.read())
        if record.get('scene'):
            validate_scene_discovery(Path.cwd(), record)
        else:
            validate_discovery(Path.cwd(), record.get('episodeId') or record.get('episodeSlug'),
                               record.get('transcriptPath'), record.get('discoveryPath'))
    except (ValueError, OSError, TypeError, KeyError, AttributeError) as error:
        sys.exit(f'Lineups discovery: {error}')
    print('Lineups discovery structure and freshness passed; editorial review remains human.')
