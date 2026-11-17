"""Exact, approved timing edits for existing native titles, not render ingest.

Project and sequence identity are checked before clip IDs: copied projects can
reuse both sequence IDs and node IDs. No Eagle/render approval is implied.
"""

import time
from pathlib import Path

from .premiere_delivery import PREFIX, digest, objects, read, require, same, save


def validate(binding):
    unsigned = {k: v for k, v in binding.items() if k != 'approval'}
    approval = binding.get('approval', {})
    require(binding.get('schemaVersion') == 1 and binding.get('fps') == 25,
            'unsupported native title binding')
    require(approval.get('reviewer') == 'Jerami' and approval.get('status') == 'approved'
            and approval.get('source') and approval.get('bindingSha256') == digest(unsigned),
            'native title approval is missing or stale')
    rows = binding['clips']
    require(bool(rows) and len({r['clipId'] for r in rows}) == len(rows), 'duplicate or empty title roster')
    for row in rows:
        require(row['trackIndex'] == 2 and row['name'] == 'Graphic', 'only existing V3 native titles are bound')
        for key in ('beforeStartFrame', 'beforeEndFrame', 'startFrame', 'endFrame'):
            require(type(row[key]) is int and row[key] >= 0, 'invalid title frame')
        require(row['beforeEndFrame'] > row['beforeStartFrame'] and row['endFrame'] > row['startFrame'],
                'invalid title duration')
    require(all(a['endFrame'] == b['startFrame'] for a, b in zip(rows, rows[1:])), 'title plan has a gap or overlap')


def handle_locked(payload, binding):
    validate(binding)
    tool = payload['tool_name'][len(PREFIX):]
    args = payload.get('tool_input') or {}
    event = payload.get('hook_event_name')
    path = Path(binding['statePath'])
    state = read(path) if path.exists() else {}
    require(state.get('bindingSha256', binding['approval']['bindingSha256']) == binding['approval']['bindingSha256'],
            'native title state belongs to another binding')
    state['bindingSha256'] = binding['approval']['bindingSha256']
    if tool == 'get_project_info':
        if event == 'PostToolUse':
            project = next((x for x in objects(payload.get('tool_response')) if x.get('success') is True and 'path' in x), {})
            state['projectContext'] = dict(path=project.get('path'), sequenceId=project.get('activeSequence', {}).get('id'), at=time.time())
            state.pop('sequence', None)
            save(path, state)
        return False
    if tool not in {'get_full_sequence_info', 'move_clip', 'trim_clip', 'add_to_timeline', 'add_transition_to_clip'}:
        return False
    context = state.get('projectContext', {})
    require(context.get('path') == binding['projectPath'] and context.get('sequenceId') == binding['sequenceId']
            and 0 <= time.time() - context.get('at', 0) < 120, 'refresh exact project and active sequence for title timing')
    require(args.get('sequenceId', binding['sequenceId']) == binding['sequenceId'], 'wrong title sequence')
    if tool == 'get_full_sequence_info':
        if event == 'PostToolUse':
            sequence = next((x for x in objects(payload.get('tool_response')) if x.get('id') == binding['sequenceId'] and 'videoTracks' in x), {})
            require(bool(sequence), 'missing title sequence readback')
            # Older running clients do not register move_clip PostToolUse.
            # Recover only from the measured result, never by clearing a receipt.
            pending = state.get('pending')
            if pending:
                row = next(r for r in binding['clips'] if r['clipId'] == pending['args']['clipId'])
                matches = [c for t in sequence['videoTracks'] if t['index'] == row['trackIndex']
                           for c in t['clips'] if c['nodeId'] == row['clipId'] and c['name'] == row['name']]
                require(len(matches) == 1 and same(matches[0]['start'], row['startFrame'] / binding['fps'])
                        and (pending['tool'] != 'trim_clip' or same(matches[0]['end'], row['endFrame'] / binding['fps'])),
                        'pending title edit did not match measured result')
                state.pop('pending')
            state['sequence'] = dict(data=sequence, at=time.time())
            save(path, state)
        return True
    require(tool in {'move_clip', 'trim_clip'}, 'native title scope permits only move and duration edits')
    rows = [r for r in binding['clips'] if r['clipId'] == args.get('clipId')]
    require(len(rows) == 1, 'unbound title clip')
    row = rows[0]
    measured = state.get('sequence', {})
    require(0 <= time.time() - measured.get('at', 0) < 120, 'read back title sequence before each edit')
    clips = [c for t in measured.get('data', {}).get('videoTracks', []) if t['index'] == row['trackIndex']
             for c in t['clips'] if c['nodeId'] == row['clipId'] and c['name'] == row['name']]
    require(len(clips) == 1, 'title identity or track changed')
    clip = clips[0]
    fps = binding['fps']
    require(any(same(clip['start'], frame / fps) for frame in (row['beforeStartFrame'], row['startFrame']))
            and any(same(clip['duration'], frames / fps) for frames in
                    (row['beforeEndFrame'] - row['beforeStartFrame'], row['endFrame'] - row['startFrame'])),
            'title changed since binding; preserve live edits and rebind')
    if tool == 'move_clip':
        require(set(args) <= {'clipId', 'newTime', 'newTrackIndex'}
                and same(args.get('newTime'), row['startFrame'] / fps)
                and args.get('newTrackIndex', 2) == 2, 'move differs from approved title plan')
    else:
        require(set(args) == {'clipId', 'duration'} and same(clip['start'], row['startFrame'] / fps)
                and same(args.get('duration'), (row['endFrame'] - row['startFrame']) / fps),
                'duration differs from approved title plan')
    if event == 'PreToolUse':
        require(not state.get('pending'), 'previous title edit needs response and sequence readback')
        state['pending'] = dict(tool=tool, args=args)
    elif event == 'PostToolUse':
        require(state.get('pending') == dict(tool=tool, args=args), 'title response has no matching edit')
        response = list(objects(payload.get('tool_response')))
        require(any(x.get('success') is True for x in response)
                and not any(x.get('success') is False or x.get('isError') is True for x in response),
                'title edit failed; inspect before recovery')
        state.pop('pending')
        state.pop('sequence', None)
    save(path, state)
    return True
