"""Private, resumable routing decisions. Never invokes a production tool."""
import argparse
import copy
import datetime as dt
import fcntl
import hashlib
import json
import os
from pathlib import Path
import re
import tempfile

STAGES = ['evidence', 'attack', 'story_lane', 'assets', 'format', 'storyboard', 'routes', 'review']
LANES = ['origins', 'dogma', 'exceptional', 'enemies', 'flaws', 'associations', 'language', 'likability']
ATTACKS = {'jab': 'teach', 'feint': 'reframe', 'right_hook': 'ask'}
ASSET_STATES = ['ready', 'needs_adaptation', 'needs_screen_capture', 'needs_creation', 'needs_recording']
DEFAULT_STATE = Path.home() / '.local/state/singleton-systems/social-media-engine/workflow.json'
DEFAULT_SOURCES = Path.home() / '.local/share/singleton-systems/social-media-engine'


def require(condition, message):
    if not condition:
        raise ValueError(message)


def digest(value):
    return hashlib.sha256(json.dumps(value, sort_keys=True, ensure_ascii=False).encode()).hexdigest()


def nonempty(value):
    return isinstance(value, str) and bool(value.strip())


def identifier(value):
    return isinstance(value, str) and bool(re.fullmatch(r'[A-Za-z0-9][A-Za-z0-9_.-]{0,99}', value))


def read_jsonl(file):
    rows = {}
    for line in file.read_text().splitlines():
        if not line.strip():
            continue
        row = json.loads(line)
        require(identifier(row.get('id')) and row['id'] not in rows, 'Missing or duplicate source ID')
        rows[row['id']] = row
    return rows


def link_claims(ids, source_root):
    """Keep the full selected claim, its origin pointer and immutable fingerprints."""
    require(isinstance(ids, list) and ids and len(ids) == len(set(ids)), 'Choose distinct claim IDs')
    claims = read_jsonl(source_root / 'story-claims.jsonl')
    stories = read_jsonl(source_root / 'story-source.jsonl')
    superseded = {c.get('supersedes') for c in claims.values()}
    result = []
    for key in ids:
        require(key in claims and key not in superseded, f'Missing or superseded claim: {key}')
        claim = claims[key]
        story = stories.get(claim.get('story_id'))
        require(story and story.get('source') and nonempty(claim.get('status')), f'Missing story origin: {key}')
        result.append({'claim': claim, 'source_id': story['id'], 'source': story['source'],
                       'publication_status': story.get('publication_status', 'unknown'),
                       'claim_hash': digest(claim), 'source_hash': digest(story),
                       'proof': {'status': 'unchecked', 'reference': claim.get('evidence')}})
    return result


def evidence_errors(post, source_root):
    try:
        current = link_claims([x['claim']['id'] for x in post['claims']], source_root)
    except (OSError, ValueError, KeyError) as error:
        return [f'Source unavailable: {error}']
    errors = []
    for old, new in zip(post['claims'], current):
        if (old['claim_hash'], old['source_hash']) != (new['claim_hash'], new['source_hash']):
            errors.append('Source changed: ' + old['claim']['id'])
    return errors


def route_beat(beat, asset, tools):
    state = asset['state']
    route, skills = {
        'ready': ('reuse', []),
        'needs_adaptation': ('recut', ['video-workflows']),
        'needs_screen_capture': ('screen_capture', ['openscreen-demo']),
        'needs_creation': ('new_visual', ['video-workflows', 'figma']),
        'needs_recording': ('jerami_recording', []),
    }[state]
    if state == 'needs_adaptation' and asset.get('editable_design'):
        route, skills = 'figma_adaptation', ['video-workflows', 'figma']
    blockers = []
    for skill in skills:
        observation = tools.get(skill, {})
        if observation.get('status') != 'available' or not nonempty(observation.get('evidence')):
            blockers.append('Verify tool: ' + skill)
    if state == 'needs_recording':
        blockers.append('Jerami recording required')
    if state == 'ready' and not nonempty(asset.get('reference')):
        blockers.append('Ready asset needs a reference')
    return {'beat_id': beat['id'], 'asset_id': asset['id'], 'route': route,
            'skills': skills, 'blockers': blockers, 'execution': 'not_started',
            'constraints': asset.get('constraints', {}), 'claim_ids': beat['claim_ids']}


def new_state():
    return {'schema_version': 1, 'revision': 0, 'active_post': None, 'posts': {},
            'sessions': {}, 'events': {}, 'budget_entries': {}}


def load_state(file):
    if not file.exists():
        return new_state()
    state = json.loads(file.read_text())
    require(state.get('schema_version') == 1 and isinstance(state.get('revision'), int), 'Unsupported workflow state')
    for key in ['posts', 'sessions', 'events', 'budget_entries']:
        require(isinstance(state.get(key), dict), 'Invalid workflow state: ' + key)
    require(state.get('active_post') is None or state['active_post'] in state['posts'], 'Invalid active post')
    for post in state['posts'].values():
        require(identifier(post.get('id')) and post.get('stage') in STAGES, 'Invalid saved post or stage')
    return state


def intake_question(post=None):
    """Agent renders this through the in-app question tool; write-in is native."""
    if post and post.get('length_scope', {}).get('status') == 'selected':
        return None
    return {'title': 'What should we make for this story?',
            'options': ['Short form', 'Long form', 'Storyboards for both']}


def storyboard_versions(post):
    choice = post.get('length_scope', {})
    require(choice.get('status') == 'selected', 'Choose short form, long form or both first')
    value = choice['value']
    return ['short', 'long'] if value == 'both' else [value]


def checked_storyboards(post):
    versions = storyboard_versions(post)
    boards = post.get('storyboards', {})
    # Existing single-version records remain readable without a destructive migration.
    if not boards and len(versions) == 1:
        boards = {versions[0]: post['beats']}
    require(set(boards) == set(versions), 'Complete a separate storyboard for each selected version')
    for beats in boards.values():
        check_beats(post, beats)
    return boards


def check_assets(assets):
    require(isinstance(assets, list) and assets, 'Asset check is required')
    ids = set()
    for a in assets:
        require(identifier(a.get('id')) and a['id'] not in ids, 'Distinct asset IDs are required')
        ids.add(a['id'])
        require(a.get('state') in ASSET_STATES, 'Unknown asset state')
        require(nonempty(a.get('visual')), 'Describe the visual')
        if a['state'] in ['ready', 'needs_adaptation']:
            require(nonempty(a.get('reference')), 'Existing asset needs a source reference')
        if a.get('media_kind') == 'video':
            require(nonempty(a.get('source_revision')), 'Video needs its source revision')
            bounds = a.get('source_range_seconds', [])
            require(isinstance(bounds, list) and len(bounds) == 2
                    and all(type(x) in [int, float] for x in bounds)
                    and 0 <= bounds[0] < bounds[1] < 360000, 'Video needs original source-time bounds')
        if a.get('case') == 'power_rankings':
            c = a.get('constraints', {})
            require(c.get('host_position') == 'below' and c.get('rank_position') == 'above'
                    and c.get('preserve_rank_order') is True and c.get('preserve_master') is True
                    and c.get('caption_safe_area') is True, 'Power Rankings requires Mark below, ranks above and preserved source constraints')
        if a.get('case') == 'prospect_id':
            c = a.get('constraints', {})
            require(c.get('label') == 'Reconstruction — sample data' and c.get('sample_data') is True
                    and c.get('sequence') == ['On Hold', 'In Queue', 'deadline'], 'Prospect ID requires a labeled sample reconstruction')


def check_beats(post, beats):
    require(isinstance(beats, list) and beats, 'Storyboard needs beats')
    ids, last_end = set(), 0
    claims = {x['claim']['id'] for x in post['claims']}
    assets = {x['id'] for x in post['assets']}
    for b in beats:
        require(identifier(b.get('id')) and b['id'] not in ids, 'Distinct beat IDs required')
        ids.add(b['id'])
        require(isinstance(b.get('claim_ids'), list) and b['claim_ids'] and set(b['claim_ids']) <= claims, 'Beat has an unlinked claim')
        require(b.get('asset_id') in assets, 'Beat has an unknown asset')
        require(nonempty(b.get('point')) and nonempty(b.get('visual')), 'Each beat needs its point and visual')
        start, end = b.get('start_seconds'), b.get('end_seconds')
        require(type(start) in (int, float) and type(end) in (int, float)
                and last_end <= start < end < 36000, 'Beat timing must be finite and ordered')
        last_end = end


def review_blockers(post, source_root):
    errors = evidence_errors(post, source_root)
    if intake_question(post):
        errors.append('Choose short form, long form or both first')
    for item in post['claims']:
        proof = item['proof']
        if proof.get('status') != 'checked' or not nonempty(proof.get('reference')) or not nonempty(proof.get('finding')):
            errors.append('Check proof: ' + item['claim']['id'])
        if not nonempty(proof.get('draft_treatment')):
            errors.append('Retain attribution, estimate and public-use labels: ' + item['claim']['id'])
    if post['assembly'] is None:
        errors.append('Choose assembled_review_draft or asset_kit')
    errors.extend(x for route in post['routes'] for x in route['blockers'])
    errors.append('Human review pending; routing never grants publication approval')
    return errors


def transition(state, event, source_root):
    """Apply one explicit command to a copy. Invalid commands never change disk state."""
    state = copy.deepcopy(state)
    op = event.get('op')
    data = event.get('data', {})
    require(isinstance(data, dict), 'Event data must be an object')
    session = event.get('session_id')
    require(identifier(session), 'Session ID required')
    if op == 'start':
        key = event.get('post_id')
        require(identifier(key), 'Post ID required')
        require(state['active_post'] in [None, key], 'Resume the active post before starting another')
        require(key not in state['posts'], 'Use resume for an existing post')
        require(data.get('origin', {}).get('kind') in ['craft', 'selected_work'] and nonempty(data['origin'].get('reference')), 'Idea needs a Craft or selected-work pointer')
        state['posts'][key] = {'id': key, 'stage': 'evidence', 'origin': data['origin'], 'claims': [],
            'choices': {}, 'length_scope': {}, 'storyboards': {}, 'assets': [], 'beats': [], 'routes': [], 'tools': {}, 'assembly': None,
            'review': {'technical': 'not_checked', 'human': 'pending', 'publication': 'not_authorized'},
            'recommendation': {'channels': ['Instagram', 'LinkedIn'], 'status': 'for_review', 'personal_youtube_cadence': 'deferred'},
            'holds': ['Devin trial', 'recording', 'account connections', 'media production', 'publication']}
        if re.fullmatch(r'intent[ _-]solutions', data['origin'].get('client', ''), re.I):
            week = data.get('budget_week')
            require(isinstance(week, str) and dt.date.fromisoformat(week).weekday() == 0, 'Intent Solutions needs its budget week')
            state['posts'][key]['budget'] = {'scope': 'intent_solutions', 'week': week, 'visibility': 'internal', 'cap_minutes': 120}
        state['active_post'] = key
        state['sessions'][session] = key
        return state
    if op == 'budget':
        require(identifier(data.get('id')) and data['id'] not in state['budget_entries'], 'Distinct budget entry ID required')
        require(data.get('route') in ['max_edits', 'jerami_demos'], 'Unknown Intent Solutions contribution route')
        require(data.get('post_id') is None or data['post_id'] in state['posts'], 'Budget refers to an unknown post')
        require(type(data.get('minutes')) is int and data['minutes'] > 0, 'Positive attention minutes required')
        day = dt.date.fromisoformat(data['week'])
        require(day.weekday() == 0, 'Budget week must start on Monday')
        total = sum(x['minutes'] for x in state['budget_entries'].values() if x['week'] == data['week'])
        require(total + data['minutes'] <= 120, 'Intent Solutions combined weekly cap is 120 minutes')
        state['budget_entries'][data['id']] = {**data, 'visibility': 'internal', 'basis': 'planned_attention'}
        return state
    key = event.get('post_id')
    require(key in state['posts'] and key == state['active_post'], 'Choose the active post')
    post = state['posts'][key]
    if op == 'resume':
        state['sessions'][session] = key
        return state
    require(state['sessions'].get(session) == key, 'Resume this post in the current session first')
    stage = post['stage']
    if op == 'scope':
        require(stage == 'evidence' or not post.get('length_scope'), 'Rewind to evidence before changing length')
        require(data.get('value') in ['short', 'long', 'both', 'custom'], 'Choose short, long, both or custom')
        require(nonempty(data.get('user_evidence')), 'Length needs the user choice as evidence')
        if data['value'] == 'custom':
            require(nonempty(data.get('detail')), 'Keep the write-in request')
        # Do not erase a legacy storyboard when adding its missing length choice.
        if not post.get('length_scope') and post['beats']:
            require(data['value'] in ['short', 'long'], 'Rewind to evidence before expanding a saved storyboard')
        post['length_scope'] = {**data, 'status': 'selected'}
    elif op == 'link':
        require(stage == 'evidence', 'Rewind to evidence before changing claims')
        post['claims'] = link_claims(data.get('claim_ids'), source_root)
    elif op == 'proof':
        matches = [x for x in post['claims'] if x['claim']['id'] == data.get('claim_id')]
        require(len(matches) == 1, 'Proof must name a linked claim')
        require(data.get('status') in ['missing', 'unchecked', 'checked'], 'Unknown proof status')
        if data['status'] == 'checked':
            require(all(nonempty(data.get(k)) for k in ['reference', 'finding', 'draft_treatment']), 'Checked proof needs a reference, finding and draft treatment')
        matches[0]['proof'] = data
    elif op == 'choose':
        field, value = data.get('field'), data.get('value')
        stages = {'attack_type': 'attack', 'content_lane': 'story_lane', 'platform': 'format',
                  'post_format': 'format', 'opening_hook': 'format', 'reference_set': 'format', 'direct_style': 'format'}
        require(field in stages and stage == stages[field], 'Choice belongs to another stage; rewind first')
        if field == 'attack_type':
            require(value in ATTACKS, 'Choose jab, feint or right_hook')
        elif field == 'content_lane':
            require(value in LANES, 'Choose one of the 8 story lanes')
        elif field == 'reference_set':
            require(isinstance(value, list) and all(nonempty(x) for x in value), 'References must be a list; empty is allowed')
        else:
            require(nonempty(value), 'Choice cannot be blank')
        require(data.get('status') in ['proposed', 'selected'] and nonempty(data.get('basis')), 'Record choice status and basis')
        post['choices'][field] = {'value': value, 'status': data['status'], 'basis': data['basis']}
    elif op == 'assets':
        require(stage == 'assets', 'Rewind to assets before changing the asset check')
        check_assets(data.get('assets'))
        post['assets'] = data['assets']
    elif op == 'storyboard':
        require(stage == 'storyboard', 'Rewind to storyboard before editing beats')
        check_beats(post, data.get('beats'))
        versions = storyboard_versions(post)
        version = data.get('version', versions[0] if len(versions) == 1 else None)
        require(version in versions, 'Name the short or long storyboard version')
        post.setdefault('storyboards', {})[version] = data['beats']
        post['beats'] = data['beats'] if len(versions) == 1 else []
    elif op == 'tools':
        require(stage in ['routes', 'review'], 'Check tools after the storyboard')
        for name, item in data.items():
            require(name in ['video-workflows', 'figma', 'openscreen-demo'] and item.get('status') in ['available', 'unavailable', 'unknown'] and nonempty(item.get('evidence')), 'Tool observations need status and evidence')
        post['tools'].update(data)
        post['routes'] = []
        post['stage'] = 'routes'
    elif op == 'assembly':
        require(data.get('value') in ['assembled_review_draft', 'asset_kit'] and nonempty(data.get('user_evidence')), 'Assembly needs an explicit user choice')
        post['assembly'] = data
    elif op == 'review':
        require(stage == 'review' and nonempty(data.get('user_evidence')), 'Review needs Jerami evidence at the review stage')
        require(data.get('verdict') in ['approved', 'changes_requested'], 'Unknown review verdict')
        if data['verdict'] == 'approved':
            require(len(review_blockers(post, source_root)) == 1, 'Resolve routing, proof and assembly blockers before approval')
            require(isinstance(data.get('artifacts'), list) and data['artifacts'], 'Review needs the exact artifact files')
            versions = storyboard_versions(post)
            if len(versions) > 1:
                coverage = data.get('artifact_versions', {})
                require(isinstance(coverage, dict) and set(coverage) == set(versions)
                        and all(isinstance(refs, list) and refs and all(ref in data['artifacts'] for ref in refs)
                                for refs in coverage.values()), 'Review must identify artifacts for both versions')
            checked = []
            for reference in data['artifacts']:
                artifact = Path(reference)
                require(artifact.is_absolute() and artifact.is_file(), 'Review artifact must be an existing absolute file')
                with artifact.open('rb') as handle:
                    sha = hashlib.file_digest(handle, 'sha256').hexdigest()
                checked.append({'path': str(artifact), 'sha256': sha})
            post['review'] = {'technical': 'routing_checked', 'human': 'approved', 'publication': 'not_authorized',
                              'user_evidence': data['user_evidence'], 'artifacts': checked,
                              'artifact_versions': data.get('artifact_versions', {})}
            state['active_post'] = None
            state['sessions'] = {s: p for s, p in state['sessions'].items() if p != key}
            return state
        post['review'] = {'technical': 'routing_checked', 'human': 'changes_requested',
                          'publication': 'not_authorized', 'user_evidence': data['user_evidence']}
        return state
    elif op == 'rewind':
        target = data.get('stage')
        require(target in STAGES and STAGES.index(target) < STAGES.index(stage), 'Rewind to an earlier stage')
        # Keep prior choices for inspection, but require every downstream gate again.
        post['stage'] = target
        post['routes'] = []
        downstream = {'attack_type': 'attack', 'content_lane': 'story_lane', 'platform': 'format',
                      'post_format': 'format', 'opening_hook': 'format', 'reference_set': 'format', 'direct_style': 'format'}
        for field, choice in post['choices'].items():
            if STAGES.index(downstream[field]) >= STAGES.index(target):
                choice['status'] = 'proposed'
        if STAGES.index(target) <= STAGES.index('storyboard'):
            post['beats'] = []
            post['storyboards'] = {}
    elif op == 'advance':
        require(stage != 'review', 'Review remains open for Jerami')
        storyboard_versions(post)
        c = post['choices']
        if stage == 'evidence':
            require(post['claims'], 'Link source claims first')
            require(not evidence_errors(post, source_root), 'Source changed or unavailable; relink before proceeding')
        elif stage in ['attack', 'story_lane']:
            field = 'attack_type' if stage == 'attack' else 'content_lane'
            require(c.get(field, {}).get('status') == 'selected', 'Select the proposed choice first')
        elif stage == 'assets':
            check_assets(post['assets'])
        elif stage == 'format':
            require(all(c.get(k, {}).get('status') == 'selected' for k in ['platform', 'post_format', 'opening_hook', 'reference_set', 'direct_style']), 'Complete platform, format, opening and style choices')
        elif stage == 'storyboard':
            checked_storyboards(post)
        elif stage == 'routes':
            if post.get('budget'):
                require(any(x.get('post_id') == key and x['week'] == post['budget']['week']
                            for x in state['budget_entries'].values()), 'Reserve this post within the shared Intent Solutions budget')
            checked_storyboards(post)
            assets = {a['id']: a for a in post['assets']}
            post['routes'] = [{**route_beat(b, assets[b['asset_id']], post['tools']), 'version': version}
                              for version, beats in checked_storyboards(post).items() for b in beats]
        post['stage'] = STAGES[STAGES.index(stage) + 1]
    else:
        raise ValueError('Unknown operation')
    post['review'] = {'technical': 'routing_checked' if post['stage'] == 'review' else 'not_checked',
                      'human': 'pending', 'publication': 'not_authorized'}
    return state


def apply_event(file, event, source_root=DEFAULT_SOURCES):
    file, source_root = Path(file), Path(source_root)
    require(identifier(event.get('event_id')), 'Stable event ID required')
    file.parent.mkdir(parents=True, exist_ok=True, mode=0o700)
    with open(str(file) + '.lock', 'a', encoding='utf-8') as lock:
        os.chmod(lock.name, 0o600)
        fcntl.flock(lock, fcntl.LOCK_EX)
        state = load_state(file)
        previous = state['events'].get(event['event_id'])
        if previous:
            require(previous == digest(event), 'Event ID reused with different contents')
            return state
        require(type(event.get('expected_revision')) is int and event['expected_revision'] == state['revision'], 'Stale revision; read and retry')
        updated = transition(state, event, source_root)
        updated['events'][event['event_id']] = digest(event)
        updated['revision'] += 1
        fd, temporary = tempfile.mkstemp(prefix='.workflow-', dir=file.parent)
        try:
            with os.fdopen(fd, 'w', encoding='utf-8') as handle:
                json.dump(updated, handle, ensure_ascii=False, indent=2)
                handle.flush()
                os.fsync(handle.fileno())
            os.replace(temporary, file)
            directory = os.open(file.parent, os.O_RDONLY)
            try:
                os.fsync(directory)
            finally:
                os.close(directory)
        finally:
            if os.path.exists(temporary):
                os.unlink(temporary)
        return load_state(file)


def social_intent(text):
    """Narrow intent matching; career evidence alone must not start a social task."""
    return bool(re.search(r'\b(?:social media engine|work[- ]to[- ]content|content capture plan)\b'
                          r'|\b(?:post|reel|carousel)\b.{0,80}\b(?:career|resume|proof|lineups|prospect|client work|saved stor\w+)\b'
                          r'|\b(?:career|resume|lineups|prospect|client work|saved stor\w+)\b.{0,80}\b(?:post|reel|carousel)\b', text, re.I | re.S))


def hook_context(payload, file=DEFAULT_STATE):
    """Read-only hint. Never inject private source text or saved prose into hooks."""
    event = payload.get('hook_event_name')
    if event not in ['UserPromptSubmit', 'SessionStart']:
        return ''
    prompt = str(payload.get('prompt', ''))
    explicit = social_intent(prompt)
    try:
        state = load_state(Path(file))
        key = state['sessions'].get(payload.get('session_id'))
        post = state['posts'].get(key)
        continuation = bool(post and re.search(r'^\s*(?:resume|continue|pick up)[.!]?\s*$'
                                              r'|\b(?:resume|continue|pick up)\b.{0,25}\b(?:saved post|current post|this post|content plan)\b'
                                              r'|\bnext beat\b', prompt, re.I))
        if not explicit and not (post and (event == 'SessionStart' or continuation)):
            return ''
        if not post and state['active_post']:
            post = state['posts'][state['active_post']]
        detail = f"Post {post['id']}; stage {post['stage']}; revision {state['revision']}." if post else 'No saved post. Choose the length before shaping the story.'
        intake = (' Ask with request_user_input_async: Short form, Long form, Storyboards for both; '
                  'the UI provides a write-in field. Reuse an explicit answer already given in this chat. '
                  'Save it with scope; do not ask again on resume.' if intake_question(post) else
                  ' Length is saved. Reuse it; do not ask again on resume.')
        return ('- [social-engine] ' + detail + intake + ' Use plugins/work-to-content/skills/work-to-content/scripts/social_engine.py status, then resume before a new idea. '
                'Career/resume material supplies evidence for this social task. Keep attack, story lane, format and opening separate. '
                'Route each beat; no tool execution or publication is authorized by this hint.')
    except (OSError, ValueError, KeyError, TypeError):
        return '- [social-engine] Saved routing state is unreadable. Repair or restore it before starting another post.' if explicit or event == 'SessionStart' else ''


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('command', choices=['status', 'apply', 'claims'])
    parser.add_argument('--state', type=Path, default=DEFAULT_STATE)
    parser.add_argument('--sources', type=Path, default=DEFAULT_SOURCES)
    parser.add_argument('--event', type=Path)
    parser.add_argument('--ids', nargs='+')
    args = parser.parse_args()
    try:
        if args.command == 'claims':
            result = link_claims(args.ids, args.sources)
        else:
            state = apply_event(args.state, json.loads(args.event.read_text()), args.sources) if args.command == 'apply' else load_state(args.state)
            result = {'state': state, 'intake_question': intake_question(state['posts'].get(state['active_post'])), 'blockers': review_blockers(state['posts'][state['active_post']], args.sources) if state['active_post'] else []}
        print(json.dumps(result, ensure_ascii=False, indent=2))
    except (OSError, ValueError, KeyError, TypeError, AttributeError) as error:
        print(json.dumps({'outcome': 'incomplete', 'error': str(error)}))
        raise SystemExit(1) from error


if __name__ == '__main__':
    main()
