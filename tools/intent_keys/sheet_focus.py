"""Validate the 6 spoken sheet keys against Whisper and the retained edit."""
import hashlib
import json
from fractions import Fraction
from pathlib import Path
from tools.intent_keys.plan import match_word_anchor, map_cue, frame_number, validate_manim

ROOT = Path('/Volumes/HomeSSD/Generated/INTENT_SOLUTIONS/references')
words = ROOT / 'e01-sheet-six-keys.json'
main_path = ROOT / '2026-10-23-e01-flow/plan.json'
main = json.loads(main_path.read_text())
raw = json.loads(words.read_text())
tokens = [t for s in raw['transcription'] for t in s.get('tokens', [])
          if t['text'].strip() and not t['text'].startswith('[_')]
starts = [t for t in tokens if t['text'].strip().casefold() == 'ctrl']
if len(starts) != 6:
    raise ValueError('Expected exactly 6 Ctrl phrases in the selected audio window')
cues = []
for i, (letter, start) in enumerate(zip('AEWURC', starts)):
    seconds = 44 + start['offsets']['from'] / 1000
    match = match_word_anchor(tokens, seconds, f'Ctrl {letter}', 44)
    next_seconds = 44 + starts[i+1]['offsets']['from'] / 1000 if i < 5 else 59.34
    mapped = map_cue(main['ranges'], {'sourceClip':'02-the-sheet-screen.mp4',
                     'sourceSeconds':seconds, 'durationSeconds':next_seconds-seconds})
    cues.append({'key':f'Ctrl + {letter}', 'sourceSeconds':seconds,
                 'previewFrame':frame_number(seconds-44,Fraction(30)), **match, **mapped})
plan = {'fps':main['fps'], 'ranges':main['ranges'], 'wordCues':cues,'candidates':[],
        'sourceWindow':{'sourceFile':'02-the-sheet-screen.mp4','sourceIn':44,'duration':16},
        'sourceBindings':{str(p):hashlib.sha256(p.read_bytes()).hexdigest() for p in [words,main_path]}}
proof = validate_manim(plan)
(ROOT / 'e01-sheet-focus-cues.json').write_text(json.dumps(plan,indent=2)+'\n')
(ROOT / 'e01-sheet-focus-manim-proof.json').write_text(json.dumps(proof,indent=2)+'\n')
print(json.dumps({'keys':[c['key'] for c in cues], 'previewFrames':[c['previewFrame'] for c in cues], 'manim':proof['result']}))
