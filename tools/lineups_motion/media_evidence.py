"""Verify the delivered video and the visible frame evidence before import."""

import hashlib
import io
import json
import math
import subprocess
from fractions import Fraction
from pathlib import Path


def validate_media(root, manifest):
    from PIL import Image
    video = Path(root) / manifest['export']['path']
    try:
        probe = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0',
                                '-show_entries', 'stream=width,height,avg_frame_rate,duration:format=duration',
                                '-of', 'json', str(video)], capture_output=True, check=True, timeout=20)
        data = json.loads(probe.stdout)
        stream, = data['streams']
        fps = Fraction(manifest['motion']['frameRate']['numerator'], manifest['motion']['frameRate']['denominator'])
        duration = float(stream.get('duration') or data['format']['duration'])
        if (not math.isfinite(duration) or duration <= 0 or (stream['width'], stream['height']) != (1920, 1080)
                or Fraction(stream['avg_frame_rate']) != fps
                or abs(duration - manifest['timing']['paddedCompositionEnd']) > float(1 / fps) + 0.001):
            raise ValueError('export video dimensions, frame rate or duration differ from the approved scene')
        frames = manifest['export']['motionProof']['frames']
        for cue in manifest['motion']['cues']:
            if not any(abs(frame['time'] - cue['sceneTime']) <= float(1 / fps) + 0.001 for frame in frames):
                raise ValueError('a decoded image is required at every transcript cue')
        for frame in frames:
            frame_path = frame.get('path')
            if not frame_path:
                raise ValueError('visible proof frames need current image files, not declared hashes')
            pixels = (Path(root) / frame_path).read_bytes()
            if hashlib.sha256(pixels).hexdigest() != frame['sha256']:
                raise ValueError('visible proof image file is stale')
            with Image.open(io.BytesIO(pixels)) as image:
                image.load()
                if image.size != (1920, 1080):
                    raise ValueError('visible proof image dimensions must be 1920 x 1080')
            decoded = subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-i', str(video),
                                      '-ss', f"{frame['time']:.9f}", '-frames:v', '1', '-f', 'image2pipe',
                                      '-vcodec', 'png', 'pipe:1'], capture_output=True, check=True, timeout=20)
            if hashlib.sha256(decoded.stdout).hexdigest() != frame['sha256']:
                raise ValueError('visible proof image does not match the decoded export frame')
    except (subprocess.CalledProcessError, subprocess.TimeoutExpired, OSError, KeyError, TypeError) as error:
        raise ValueError(f'export media could not be verified: {error}') from error
    return {'status': 'passed'}


if __name__ == '__main__':
    import sys
    try:
        record = json.loads(sys.stdin.read())
        print(json.dumps(validate_media(record['root'], record['manifest'])))
    except (ValueError, OSError) as error:
        sys.exit(f'Lineups media evidence: {error}')
