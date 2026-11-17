"""Place an explicitly approved render roster without granting authoring access."""

import time
import gzip
import xml.etree.ElementTree as ET
from pathlib import Path

from .premiere_delivery import PREFIX, digest, file_digest, objects, read, require, save


def validate(binding):
    approval = binding.get('approval', {})
    require(binding.get('schemaVersion') == 1 and binding.get('fps') == 25,
            'unsupported motion placement binding')
    require(approval.get('reviewer') == 'Jerami' and approval.get('status') == 'approved'
            and approval.get('source') and approval.get('bindingSha256') == digest(
                {k: v for k, v in binding.items() if k != 'approval'}), 'motion approval changed')
    proof = binding['manifest']
    require(file_digest(proof['path']) == proof['sha256'], 'approved motion manifest changed')
    manifest = read(proof['path'])
    require(manifest['episode'] == binding['episodeId'] and manifest['approvedBy'], 'wrong approved episode')
    scenes = manifest['scenes']
    rows = binding['scenes']
    require(len(rows) == len(scenes) and len({r['projectItemId'] for r in rows}) == len(rows),
            'incomplete or duplicate render roster')
    for row, scene in zip(rows, scenes):
        require(row['sceneId'] == scene['id'] and row['sha256'] == scene['motionSha256']
                and row['time'] == scene['timelineIn'] and row['duration'] == scene['duration']
                and row['hasAudio'] == scene['hasAudio'] and row['name'] == scene['eagleName'] + '.mp4'
                and Path(row['eaglePath']).parent.name == row['eagleItemId'] + '.info',
                'render differs from approved scene')
    require(binding['trackIndex'] == 4, 'motion placement is restricted to V5')


def near(a, b):
    return isinstance(a, (float, int)) and abs(a - b) <= .04001


def saved_transitions(binding, plan):
    root = ET.fromstring(gzip.open(binding['projectPath'], 'rb').read())
    ids = {e.get('ObjectID'): e for e in root if e.get('ObjectID')}
    uids = {e.get('ObjectUID'): e for e in root if e.get('ObjectUID')}
    sequence = uids[binding['sequenceId']]
    groups = [ids[e.get('ObjectRef')] for e in sequence.findall('./TrackGroups/TrackGroup/Second')]
    group = next(e for e in groups if e.tag == 'VideoTrackGroup')
    ref = next(e for e in group.findall('./TrackGroup/Tracks/Track') if int(e.get('Index')) == plan['trackIndex'])
    track = uids[ref.get('ObjectURef')]
    clips = [ids[e.get('ObjectRef')] for e in track.findall('./ClipTrack/ClipItems/TrackItems/TrackItem')]
    matches = [c for c in clips if c.findtext('.//TrackItem/Node/ID') == str(int(plan['args']['clipId'], 16))]
    require(len(matches) == 1, 'saved transition clip identity mismatch')
    for edge in ['start', 'end']:
        value = float(matches[0].findtext('.//TrackItem/' + edge.title(), '0')) / 254016000000
        require(abs(value - plan[edge]) < .001, 'saved transition clip moved')
    result = []
    for ref in track.findall('./ClipTrack/TransitionItems/TrackItems/TrackItem'):
        e = ids[ref.get('ObjectRef')]
        result.append(dict(name=e.findtext('.//DisplayName'),
                           start=float(e.findtext('.//Start', '0')) / 254016000000,
                           end=float(e.findtext('.//End', '0')) / 254016000000))
    return result


def verify_saved_transition(binding, plan):
    args = plan['args']
    transitions = saved_transitions(binding, plan)
    for side in (['start', 'end'] if args['position'] == 'both' else [args['position']]):
        found = [t for t in transitions if t['name'] == args['transitionName']
                 and abs(t[side] - plan[side]) < .001
                 and abs((t['end'] - t['start']) * binding['fps'] - args['durationFrames']) < .001]
        require(len(found) == 1, 'saved transition name, edge or frame count mismatch')


def handle_locked(payload, binding):
    tool = payload['tool_name'][len(PREFIX):]
    owned = {'get_project_info', 'get_full_sequence_info', 'list_project_items', 'get_project_item_info',
             'add_to_timeline', 'trim_clip', 'move_clip', 'add_transition_to_clip', 'save_project'}
    if tool not in owned:
        return False
    validate(binding)
    path = Path(binding['statePath'])
    state = read(path) if path.exists() else {}
    require(state.get('bindingSha256', binding['approval']['bindingSha256']) == binding['approval']['bindingSha256'],
            'motion state belongs to another binding')
    state['bindingSha256'] = binding['approval']['bindingSha256']
    args = payload.get('tool_input') or {}
    post = payload.get('hook_event_name') == 'PostToolUse'
    response = list(objects(payload.get('tool_response')))
    if tool == 'get_project_info':
        if post:
            project = next((x for x in response if x.get('success') is True and 'path' in x), {})
            state['project'] = dict(path=project.get('path'), sequenceId=project.get('activeSequence', {}).get('id'), at=time.time())
            state.pop('sequence', None)
            save(path, state)
        return False
    context = state.get('project', {})
    require(context.get('path') == binding['projectPath'] and context.get('sequenceId') == binding['sequenceId']
            and 0 <= time.time() - context.get('at', 0) < 120, 'refresh exact motion project and sequence')
    if tool == 'save_project':
        if post and state.get('pendingTransition'):
            key = state['pendingTransition']
            plan = state.get('transitionAttemptPlan') or next(p for p in binding['transitions'] if digest(p['args']) == key)
            require(any(x.get('success') is True for x in response), 'project save failed')
            verify_saved_transition(binding, plan)
            state.setdefault('transitionsDone', []).append(key)
            state.pop('pendingTransition')
            save(path, state)
        return True
    if tool == 'get_project_item_info':
        rows = [r for r in binding['scenes'] + binding.get('coinSource', []) if r['projectItemId'] == args.get('projectItemId')]
        if not rows:
            return True
        require(len(rows) == 1, 'duplicate motion item binding')
        if post:
            row = rows[0]
            item = next((x for x in response if x.get('nodeId') == row['projectItemId'] and 'mediaPath' in x), {})
            require(item.get('mediaPath') == row['eaglePath']
                    and item.get('treePath', '').startswith('\\' + Path(binding['projectPath']).name + ('\\Quiver\\Catena Media\\' if row.get('coin') else '\\06 Motion Renders\\')),
                    'motion item readback belongs to another project, bin or source')
            state.setdefault('itemReadbacks', {})[row['projectItemId']] = time.time()
            save(path, state)
        return True
    if tool == 'list_project_items':
        if post:
            listing = next((x for x in response if x.get('success') is True and 'items' in x), {})
            for row in binding['scenes']:
                items = [i for i in listing.get('items', []) if i.get('id') == row['projectItemId']]
                require(len(items) == 1 and items[0].get('mediaPath') == row['eaglePath']
                        and '\\06 Motion Renders\\' in items[0].get('treePath', ''), 'motion import identity or bin changed')
            state['itemsAt'] = time.time()
            save(path, state)
        return True
    if tool == 'get_full_sequence_info':
        if post:
            if state.get('pendingTransition'):
                key = state['pendingTransition']
                plan = state.get('transitionAttemptPlan') or next(p for p in binding['transitions'] if digest(p['args']) == key)
                require(Path(binding['projectPath']).stat().st_mtime >= state.get('transitionAttemptAt', 0),
                        'save project before transition readback')
                verify_saved_transition(binding, plan)
                state.setdefault('transitionsDone', []).append(key)
                state.pop('pendingTransition')
            sequence = next((x for x in response if x.get('id') == binding['sequenceId'] and 'videoTracks' in x), {})
            require(bool(sequence), 'missing motion sequence readback')
            pending = state.get('pending')
            if pending:
                matches = [c for t in sequence['videoTracks'] if t['index'] == pending.get('trackIndex', binding['trackIndex'])
                           for c in t['clips'] if c['name'] == pending['name'] and near(c['start'], pending['time'])]
                require(len(matches) == 1 and near(matches[0]['duration'], pending['duration']),
                        'pending motion placement does not match readback')
                state.pop('pending')
            state['sequence'] = dict(data=sequence, at=time.time())
            save(path, state)
        return True
    if tool == 'add_transition_to_clip' and binding.get('transitions'):
        plans = [p for p in binding['transitions'] if p['args'] == args]
        require(len(plans) == 1, 'transition differs from approved plan')
        plan = plans[0]
        key = digest(args)
        if post:
            require(state.get('pendingTransition') == key, 'transition attempt mismatch')
            state['transitionResponse'] = payload.get('tool_response')
            result = next((r for r in response if r.get('success') is True and isinstance(r.get('placed'), list)), {})
            sides = ['start', 'end'] if args['position'] == 'both' else [args['position']]
            placed = result.get('placed', [])
            if (not any(r.get('success') is False or r.get('isError') is True for r in response)
                    and result.get('transitionName') == args['transitionName']
                    and len(placed) == len(sides)
                    and sorted(r.get('side', '') for r in placed) == sorted(sides)
                    and all(r.get('actualFrames') == args['durationFrames'] for r in placed)):
                state.setdefault('transitionsDone', []).append(key)
                state.pop('pendingTransition')
            # Only uncertain replies need saved-project recovery. Older runtimes
            # already return measurements; optional status flags are not evidence.
        else:
            require(not state.get('pendingTransition') and key not in state.get('transitionsDone', []),
                    'transition pending or already applied')
            measured = state.get('sequence', {})
            require(0 <= time.time() - measured.get('at', 0) < 120, 'refresh transition sequence')
            clips = [c for t in measured.get('data', {}).get('videoTracks', [])
                     if t['index'] == plan['trackIndex'] for c in t['clips'] if c['nodeId'] == args['clipId']]
            require(len(clips) == 1 and clips[0]['name'] == plan['name'], 'transition clip identity or track changed')
            require(plan['name'] in [r['name'] for r in binding['scenes']], 'transition outside render roster')
            require(clips[0]['end'] - clips[0]['start'] >= args['durationFrames'] / binding['fps'],
                    'clip is shorter than transition')
            state['pendingTransition'] = key
            state['transitionAttemptAt'] = time.time()
            state['transitionAttemptPlan'] = dict(plan, start=clips[0]['start'], end=clips[0]['end'])
        save(path, state)
        return True
    require(tool == 'add_to_timeline', 'this motion scope permits placement only')
    require(not state.get('pendingTransition'), 'read back previous transition')
    rows = [r for r in binding['scenes'] + binding.get('coins', []) if r['projectItemId'] == args.get('projectItemId')
            and (not r.get('coin') or r['time'] == args.get('time'))]
    require(len(rows) == 1, 'unbound motion project item')
    row = rows[0]
    require(args == dict(projectItemId=row['projectItemId'], sequenceId=binding['sequenceId'],
                         trackIndex=row.get('trackIndex', binding['trackIndex']), time=row['time'], insertMode='overwrite', linkAudio=True),
            'motion placement differs from approved plan')
    if post:
        require(state.get('pending') == row and any(x.get('success') is True for x in response)
                and not any(x.get('success') is False or x.get('isError') is True for x in response),
                'motion placement failed; inspect before retry')
        return True
    require(not state.get('pending'), 'read back previous motion placement')
    measured = state.get('sequence', {})
    item_at = max(state.get('itemsAt', 0), state.get('itemReadbacks', {}).get(row['projectItemId'], 0))
    require(0 <= time.time() - measured.get('at', 0) < 120 and 0 <= time.time() - item_at < 120,
            'refresh sequence and imported item identities')
    require(file_digest(row['eaglePath']) == row['sha256'], 'Eagle render changed')
    clips = [c for t in measured.get('data', {}).get('videoTracks', []) if t['index'] == row.get('trackIndex', binding['trackIndex']) for c in t['clips']]
    require(not any(c['name'] == row['name'] and (not row.get('coin') or near(c['start'], row['time'])) for c in clips), 'motion already placed')
    # Only a previously approved scene tail may be replaced by the next cue.
    for clip in clips:
        if clip['end'] > row['time'] and clip['start'] < row['time'] + row['duration']:
            require(not row.get('coin'), 'coin would overwrite existing video')
            earlier = [r for r in binding['scenes'] if r['name'] == clip['name'] and r['time'] < row['time']]
            require(len(earlier) == 1 and near(clip['start'], earlier[0]['time'])
                    and near(clip['end'], earlier[0]['time'] + earlier[0]['duration']), 'unapproved V5 overwrite')
    if row.get('coin'):
        require(row['trackIndex'] == 5 and row['duration'] == 2.2, 'coin differs from reference')
        audio = [c for t in measured['data']['audioTracks'] if t['index'] == 1 for c in t['clips']]
        require(not any(c['end'] > row['time'] and c['start'] < row['time'] + row['duration'] for c in audio),
                'coin would overwrite A2')
    state['pending'] = row
    save(path, state)
    return True
