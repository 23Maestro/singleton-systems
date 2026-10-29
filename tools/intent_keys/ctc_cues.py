"""Retime E01's spoken cues (13 callouts, 6 sheet glows) to CTC-aligned words, then Manim-check them.

Whisper token times drift after pauses, so the plan's cues landed early or late. The cut's CTC
alignment (pipeline/srt.py, words on the episode timeline) gives each spoken key its real onset.
Each cue moves to the first frame of its key word; Manim checks frame math and retained cuts.
"""
import json
import re
import sys
from fractions import Fraction
from pathlib import Path

from tools.intent_keys.plan import PlanError, frame_number, validate_manim

PLAN = Path('/Volumes/HomeSSD/Content Editor.library/images/MVLQY7ALE3DGL.info/Intent Keys E01 - current tested plan 2026-10-23.json')
WORDS = Path('/Volumes/HomeSSD/Generated/INTENT_SOLUTIONS/previews/e01-v01/srt-words.json')
OUT = Path('/Volumes/HomeSSD/Generated/INTENT_SOLUTIONS/references/2026-10-24-e01-ctc')
FPS = Fraction(30)
SEARCH = 2.5  # seconds either side of the old cue
LEAD = {'ctrl': ('control', 'ctrl'), 'option': ('option',), 'tab': ('tab',), 'cmd': ('command', 'cmd')}
KEY = {'ctrl-a': 'a', 'ctrl-e': 'e', 'ctrl-r': 'r', 'ctrl-w': 'w', 'ctrl-u': 'u', 'ctrl-c': 'c',
       'option-b': 'b', 'option-f': 'f', 'ctrl-right': 'right', 'ctrl-left': 'left', 'cmd-space': 'space', 'tab': None}


# Spoken letters Whisper hears as words (cold open: "Control, A" heard as "Control, hey").
SOUNDS = {'a': ('a', 'hey', 'eh'), 'e': ('e', 'easy', 'eat'), 'r': ('r', 'are', 'our'), 'u': ('u', 'you'),
          'c': ('c', 'see'), 'b': ('b', 'be', 'bee'), 'f': ('f',), 'w': ('w',)}


def norm(text):
    return re.sub(r'[^a-z]', '', text.lower())


def find(words, near, lead, key):
    """CTC word nearest `near` that starts the spoken key ("control" + "A", or "tab")."""
    hits = []
    for i, w in enumerate(words):
        if abs(w['start'] - near) > SEARCH:
            continue
        if key is not None and any(norm(w['text']) == l + s for l in lead for s in SOUNDS.get(key, (key,))):
            hits.append(w)  # fused token, e.g. "Ctrl+e"
            continue
        if norm(w['text']) not in lead:
            continue
        if key is not None and (i + 1 >= len(words) or norm(words[i + 1]['text']) not in SOUNDS.get(key, (key,))):
            continue
        hits.append(w)
    if not hits:
        raise PlanError(f'No CTC word for {lead[0]} {key or ""} near {near:.2f}s')
    return min(hits, key=lambda w: abs(w['start'] - near))


def retime(cue, start, ranges):
    row = ranges[cue['row']]
    frame = frame_number(start, FPS)
    if not row['targetInFrame'] <= frame < row['targetOutFrame']:
        raise PlanError(f"{cue['id']}: CTC onset {start:.2f}s falls outside its edit row")
    duration = min(cue['durationFrames'], row['targetOutFrame'] - frame)
    shift = (frame - cue['targetFrame']) / 30
    return {**cue, 'targetFrame': frame, 'targetSeconds': frame / 30, 'durationFrames': duration,
            'holdClampedAtCut': duration < cue['durationFrames'], 'timingSource': 'CTC forced alignment (MMS)',
            'review': f'moved {shift:+.2f}s from the Whisper anchor'}, shift


def main():
    plan = json.loads(PLAN.read_text())
    words = json.loads(WORDS.read_text())
    report, cues = [], []
    for cue in plan['wordCues']:
        lead = LEAD[cue['card'].split('-')[0]]
        hit = find(words, cue['targetSeconds'], lead, KEY[cue['card']])
        new, shift = retime(cue, hit['start'], plan['ranges'])
        cues.append(new)
        report.append((cue['id'], cue['card'], round(shift, 2)))

    # Sheet glows: Max names A, E, W, U, R, C in one breath; each glow holds until the next key.
    sheet = next(c for c in plan['candidates'] if c['id'] == 'sheet-six-keys')
    scene_in, scene_out = sheet['targetFrame'], sheet['targetFrame'] + sheet['durationFrames']
    onsets, cursor = [], scene_in / 30
    for letter in 'aewurc':
        hit = find([w for w in words if w['start'] >= cursor - 0.05], cursor + 1.0, LEAD['ctrl'], letter)
        onsets.append((letter, frame_number(hit['start'], FPS)))
        cursor = hit['start'] + 0.1
    glows = []
    for i, (letter, frame) in enumerate(onsets):
        end = onsets[i + 1][1] if i < 5 else scene_out - 20
        glows.append({'id': f'glow-{letter}', 'key': f'Ctrl + {letter.upper()}', 'row': sheet['row'],
                      'targetFrame': frame, 'targetSeconds': frame / 30, 'durationFrames': end - frame,
                      'previewFrame': frame - scene_in})
        report.append((f'glow-{letter}', f'Ctrl + {letter.upper()}', None))

    out = {**plan, 'wordCues': cues, 'sheetGlows': glows,
           'cueTiming': {'source': str(WORDS), 'method': 'CTC forced alignment of the locked cut; cue = first frame of the key word'}}
    proof = validate_manim({**out, 'wordCues': cues + glows, 'candidates': plan['candidates']})
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / 'plan-ctc.json').write_text(json.dumps(out, indent=2) + '\n')
    (OUT / 'plan-ctc.manim-proof.json').write_text(json.dumps(proof, indent=2) + '\n')
    for cue_id, card, shift in report:
        print(f'{cue_id:8} {card:12} ' + (f'{shift:+.2f}s' if shift is not None else ''))
    for g in glows:
        print(f"{g['id']:8} frame {g['targetFrame']} ({g['targetSeconds']:.2f}s) holds {g['durationFrames']} frames")
    print('manim:', proof['result'], proof['version'])


if __name__ == '__main__':
    try:
        main()
    except PlanError as error:
        sys.exit(f'ctc cues: {error}')
