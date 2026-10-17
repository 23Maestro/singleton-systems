"""Issue timing-only Manim evidence and verify its source and schedule binding."""

import hashlib
import json
import re
from datetime import datetime, timezone
from pathlib import Path

from .cue_contract import CueContract, CueContractError
from .discovery import validate_scene_discovery


def value_hash(value):
    return hashlib.sha256(json.dumps(value, sort_keys=True, separators=(',', ':'), ensure_ascii=False).encode()).hexdigest()


def file_hash(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def timing_state(manifest):
    timing = {key: value for key, value in manifest['timing'].items()
              if key not in {'proofPath', 'manimTimingValidated'}}
    return {'episodeId': manifest['scene']['episodeId'], 'sceneId': manifest['scene']['sceneId'],
            'motion': manifest['motion'], 'timing': timing, 'dimensions': manifest['export']['dimensions']}


def source_state(root, manifest):
    root = Path(root)
    transcript = root / manifest['timing']['transcriptPath']
    discovery = root / manifest['discoveryPath']
    return {'transcriptSha256': file_hash(transcript), 'discoverySha256': file_hash(discovery),
            'timingSha256': value_hash(timing_state(manifest))}


def approval_state(manifest, receipt):
    state = {'scene': manifest['scene'], 'figma': manifest['figma'], 'motion': manifest['motion'],
            'policy': manifest['policy'], 'premiereIntent': {key: manifest['premiere'].get(key) for key in
                ('sequenceId', 'trackIndex', 'approvedStartTime', 'approvedDuration', 'approvedEndTime', 'editorialTiming')},
            'timingSha256': receipt['timingSha256'], 'timingReceiptSha256': receipt['receiptSha256'],
            'approvedToolInputSha256': manifest['enforcement']['approvedToolInputSha256']}
    if 'timelineMapping' in manifest['premiere']:
        state['premiereIntent']['timelineMapping'] = manifest['premiere']['timelineMapping']
    return state


def issue_receipt(root, manifest):
    import manim
    if manifest['timing'].get('transcriptSource') != 'whisper' or manifest['timing'].get('timestampResolution') != 'word':
        raise CueContractError('Whisper word timestamps must complete before Manim timing validation')
    contract = CueContract(manifest)
    validate_scene_discovery(root, manifest)
    transcript = json.loads((Path(root) / manifest['timing']['transcriptPath']).read_text())
    tokens = [token for segment in transcript['transcription'] for token in segment.get('tokens', [])
              if token.get('text', '').strip() and not token['text'].startswith('[_')]
    if not tokens:
        raise CueContractError('Whisper word timestamps must complete before Manim timing validation')
    normalize = lambda text: ' '.join(re.findall(r'\w+', text.casefold()))
    for cue in contract.cues:
        if cue.trigger_type == 'EDIT':
            continue
        phrase = normalize(cue.trigger_text)
        matched = False
        for index, token in enumerate(tokens):
            offset = token.get('offsets', {}).get('from')
            if type(offset) not in (int, float) or abs(offset / 1000 - cue.transcript_timestamp) > 0.001:
                continue
            text = ''
            for following in tokens[index:]:
                text += following['text']
                if normalize(text) == phrase:
                    matched = True
                    break
                if len(normalize(text)) > len(phrase) + 1:
                    break
        if not matched:
            raise CueContractError(f'{cue.cue_id}: trigger phrase and timestamp do not match the Whisper words')
    manim.config.pixel_width = contract.pixel_width
    manim.config.pixel_height = contract.pixel_height
    manim.config.frame_rate = float(contract.frame_rate)
    if (manim.config.pixel_width, manim.config.pixel_height) != (1920, 1080):
        raise CueContractError('Manim timing dimensions must be 1920 x 1080')
    end = manifest['timing']['contentEnd']
    padded = manifest['timing']['paddedCompositionEnd']
    if padded < max(10, end + 2) or any(c.scene_time + c.duration > end + 0.001 for c in contract.cues):
        raise CueContractError('Manim timing needs complete cues and trim-safe padding')
    receipt = {'schemaVersion': 1, 'stage': 'manim-timing', 'validator': 'manim',
               'validatorVersion': manim.__version__, 'result': 'passed',
               'episodeId': manifest['scene']['episodeId'], 'sceneId': manifest['scene']['sceneId'],
               **source_state(root, manifest), 'validatedAt': datetime.now(timezone.utc).isoformat()}
    receipt['receiptSha256'] = value_hash(receipt)
    return receipt


def validate_timing_receipt(root, manifest, require_approval=True):
    proof_path = manifest.get('timing', {}).get('proofPath')
    if not proof_path:
        raise CueContractError('a current Manim timing receipt is required; a flag is not proof')
    receipt = json.loads((Path(root) / proof_path).read_text())
    unsigned = {key: value for key, value in receipt.items() if key != 'receiptSha256'}
    if receipt.get('receiptSha256') != value_hash(unsigned):
        raise CueContractError('Manim timing receipt hash is stale or invalid')
    expected = {'schemaVersion': 1, 'stage': 'manim-timing', 'validator': 'manim', 'result': 'passed',
                'episodeId': manifest['scene']['episodeId'], 'sceneId': manifest['scene']['sceneId'],
                **source_state(root, manifest)}
    if any(receipt.get(key) != value for key, value in expected.items()) or not receipt.get('validatorVersion') or not receipt.get('validatedAt'):
        raise CueContractError('Manim timing receipt is missing, failed, or stale for this scene and source revision')
    if require_approval and manifest.get('review', {}).get('approvedEvidenceSha256') != value_hash(approval_state(manifest, receipt)):
        raise CueContractError('human approval is stale for this scene, version, and timing evidence')
    return receipt


if __name__ == '__main__':
    import sys
    try:
        record = json.loads(sys.stdin.read())
        if '--issue' in sys.argv:
            result = issue_receipt(record['root'], record['manifest'])
        else:
            result = validate_timing_receipt(record['root'], record['manifest'], require_approval=record.get('requireApproval', True))
        print(json.dumps(result))
    except (ValueError, OSError, TypeError, KeyError, AttributeError, ImportError) as error:
        sys.exit(f'Lineups timing evidence: {error}')
