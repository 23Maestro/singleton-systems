"""Bind scene data to the same word-cue schedule checked by Manim."""
from decimal import Decimal, ROUND_HALF_UP


def validate_cue_frames(data, manifest):
    if manifest['motion'].get('frameRate') != {'numerator': 25, 'denominator': 1}:
        raise ValueError('Blender variants need a 25 fps cue map')
    if 'cards' in data:   # team cards: each value lands on its spoken cue; an optional line lands on its own
        frames = [c['cue'] for c in data['cards']] + [c['label_cue'] for c in data['cards'] if 'label_cue' in c]
        frames += [data['line']['frame']] if data.get('line') else []
        return _match(frames, manifest)
    frames = [r['frame'] for r in data['stats']]
    if data.get('tagline'):
        frames.append(data['tagline_frame'])
    return _match(frames, manifest)


def _match(frames, manifest):
    # Blender uses frame 1 at scene time zero. A cue frame is its final landed state.
    word_frames = [int((Decimal(str(c['sceneTime'])) * 25).quantize(Decimal('1'), rounding=ROUND_HALF_UP)) + 1
                   for c in manifest['motion']['cues'] if c.get('triggerType') in {'WORD', 'PHRASE'}]
    if any(f not in word_frames for f in frames):
        raise ValueError('Every stat and tagline landing frame must match a Manim-validated spoken cue')
    return frames
