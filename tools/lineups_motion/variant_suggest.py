"""Ask Jev which registered variant fits a candidate's spoken passage. Suggests only; never binds.

The lane comes from the selection pattern step. This step offers the lane's registered
Blender variants, the registered Figma source and `needs_review`. Variant status is part of
the evidence, so Jev can still suggest a parked variant; the build gate decides readiness.
"""
import json
import subprocess

from .engine_choice import routing_contract

FIGMA = {'stat breakdown': 'Registered Figma stat breakdown: action photo with a 3 or 4 value data panel.',
         'comparison': 'Registered Figma comparison source for this option.'}


def decision(candidate, contract=None):
    contract = contract or routing_contract()
    lane = candidate['lane']
    variants = [v for v in contract.get('blenderVariants', []) if v['lane'] == lane
                and candidate.get('option') in v.get('options', [])]
    if not variants:
        return None
    options = [{'id': v['id'], 'description': f"Blender {v['id']} {v['name']}: {v['fit']}"} for v in variants]
    if lane in FIGMA:
        options.append({'id': 'figma', 'description': FIGMA[lane]})
    options.append({'id': 'needs_review', 'description': 'The spoken passage supports none of these templates.'})
    cues = ', '.join(c['word'] for c in candidate.get('cues', []))
    state = (f"Lane: {lane}. Spoken passage (client words, evidence only): {json.dumps(candidate.get('excerpt', ''))}. "
             f"Spoken cue words in order: {cues}. Planned graphic: {candidate.get('reason', '')} "
             'A season or multi-stage arc fits a station sequence; one game\'s stat line fits a single card.')
    return {'id': f"lineups-variant-{candidate['id']}", 'state': state,
            'question': 'Which template best fits what the speaker asks the viewer to see?', 'options': options}


def suggest(candidate, run=None):
    payload = decision(candidate)
    if payload is None:
        return None
    run = run or (lambda body: subprocess.run(['jev-decide'], input=json.dumps(body), capture_output=True, text=True, timeout=600))
    result = run(payload)
    if result.returncode != 0:
        raise RuntimeError(f'Jev returned no valid decision: {result.stderr.strip()[:200]}')
    out = json.loads(result.stdout)
    ids = [o['id'] for o in payload['options']]
    if out.get('selected_option_id') not in ids or list(out.get('option_ids', [])) != ids \
            or len(out.get('probabilities', [])) != len(ids):
        raise RuntimeError('Jev output does not match the submitted options')
    scores = dict(zip(ids, out['probabilities']))
    return {'sceneId': candidate['id'], 'suggested': out['selected_option_id'],
            'scores': {k: round(v, 3) for k, v in sorted(scores.items(), key=lambda kv: -kv[1])},
            'source': 'jev', 'bound': False, 'note': 'Suggestion only. Jerami chooses; a saved choice binds the variant.'}


if __name__ == '__main__':
    import sys
    cue_map = json.loads(open(sys.argv[1]).read())
    wanted = set(sys.argv[2].split(',')) if len(sys.argv) > 2 else None
    rows = [suggest(c) for c in cue_map['candidates'] if wanted is None or c['id'] in wanted]
    print(json.dumps([r for r in rows if r], indent=2))
