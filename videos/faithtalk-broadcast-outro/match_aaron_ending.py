"""Match the approved Aaron picture/audio overlap without rebuilding the opening."""
import hashlib
import json
from pathlib import Path
import subprocess
import wave

REPO = Path(__file__).resolve().parents[2]
import sys
C = json.loads(Path(sys.argv[1] if len(sys.argv) > 1 else REPO / 'config/745-creative/faithtalk/episode-7-outro.json').read_text())
NAME = C.get('masterName', 'FaithTalk Episode 7 - Outro - Episode 8 Teaser')
SOURCE = Path(C['endingRevision']['source'])
REF = Path(C['masterReference'])
OUT = Path(C['endingRevision']['outputDirectory'])
# Dissolve starts 56 frames before the teaser's last word and reaches the full logo 20 frames before it
# (Episode 7 approved timing). A shorter teaser holds the final logo longer; the total stays fixed.
SPEECH_END = C['teaserPictureSlotStartFrame'] + 75 + C['teaserFrames']
CUT, TRANSITION, FULL_LOGO, TOTAL = 1679, SPEECH_END - 56, SPEECH_END - 20, 2166
assert CUT < TRANSITION


def run(args):
    p = subprocess.run(args, capture_output=True)
    if p.returncode:
        raise RuntimeError(p.stderr.decode(errors='replace'))
    return p.stdout


def pcm(path):
    return run(['ffmpeg', '-v', 'error', '-i', str(path), '-map', '0:a:0', '-vn',
                '-ar', '48000', '-ac', '2', '-c:a', 'pcm_s24le', '-f', 's24le', '-'])


def digest(path):
    with Path(path).open('rb') as f:
        return hashlib.file_digest(f, 'sha256').hexdigest()


def meter(path, start, end):
    af = f'atrim=start_sample={start}:end_sample={end},asetpts=PTS-STARTPTS,loudnorm=I=-24:TP=-2:LRA=7:print_format=json'
    p = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', str(path),
                        '-vn', '-af', af, '-f', 'null', '-'], capture_output=True, check=True)
    s = p.stderr.decode()
    d = json.loads(s[s.rfind('{'):s.rfind('}') + 1])
    return {'lufs': float(d['input_i']), 'truePeakDbtp': float(d['input_tp'])}


subprocess.run(['python3', str(REPO / 'scripts/faithtalk_storage.py'), str(OUT)], check=True)
OUT.mkdir(parents=True, exist_ok=True)
if any(OUT.glob('*.mov')):
    raise RuntimeError('Choose a fresh revision output directory.')
base = pcm(SOURCE)
teaser_end = C['teaserAudioStartSample'] + round(C['teaserSeconds'] * 48000)
closing = base[C['closingAudioStartSample'] * 6:]
closing_start = teaser_end + 1
audio = base[:teaser_end * 6] + bytes(6) + closing
audio += bytes(len(base) - len(audio))
wav = OUT / 'assembled-audio.wav'
with wave.open(str(wav), 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(3)
    w.setframerate(48000)
    w.writeframes(audio)

prefix = OUT / 'unchanged-prefix.mp4'
tail = OUT / 'moving-picture-ending.mp4'
run(['ffmpeg', '-n', '-v', 'error', '-i', str(SOURCE), '-map', '0:v:0',
     '-frames:v', str(CUT), '-c:v', 'copy', '-an', '-video_track_timescale', '30000', str(prefix)])
graph = (
    f'[0:v]split[pre][out];[pre]trim=start_frame={CUT}:end_frame={TRANSITION},'
    'settb=1/30000,setpts=N*1001[pre];'
    f'[out]trim=start_frame={TRANSITION}:end_frame={FULL_LOGO},settb=1/30000,setpts=N*1001[outgoing];'
    '[1:v]split[logo][fade];[logo]trim=start_frame=2017:end_frame=2136,'
    f'settb=1/30000,setpts=N*1001,tpad=stop_mode=clone:stop={TOTAL - TRANSITION - 149}[hold];'
    '[fade]trim=start_frame=2136:end_frame=2166,settb=1/30000,setpts=N*1001[last];'
    '[hold][last]concat=n=2:v=1:a=0,settb=1/30000,setpts=N*1001[incoming];'
    '[outgoing][incoming]xfade=transition=fade:duration=1.2012:offset=0,'
    f'trim=end_frame={TOTAL - TRANSITION},settb=1/30000,setpts=N*1001[end];'
    '[pre][end]concat=n=2:v=1:a=0,settb=1/30000,setpts=N*1001,format=yuv420p[v]'
)
command = ['ffmpeg', '-n', '-v', 'error', '-filter_complex_threads', '4', '-i', str(SOURCE),
           '-i', str(REF), '-filter_complex', graph, '-map', '[v]', '-an', '-r', '30000/1001',
           '-video_track_timescale', '30000', '-c:v', 'libx264', '-threads', '6', '-profile:v', 'high',
           '-level', '5.1', '-preset', 'fast', '-crf', '15', '-pix_fmt', 'yuv420p',
           '-color_primaries', 'bt709', '-color_trc', 'iec61966-2-1', '-colorspace', 'bt709',
           '-color_range', 'tv', str(tail)]
(OUT / 'ending-command.json').write_text(json.dumps(command, indent=2) + '\n')
run(command)
concat = OUT / 'picture.ffconcat'
concat.write_text('ffconcat version 1.0\n' + ''.join("file '" + str(p) + "'\n" for p in [prefix, tail]))
master = OUT / (NAME + '.mov')
review = OUT / (NAME + ' - REVIEW.mp4')
run(['ffmpeg', '-n', '-v', 'error', '-f', 'concat', '-safe', '0', '-i', str(concat), '-i', str(wav),
     '-map', '0:v:0', '-map', '1:a:0', '-c:v', 'copy', '-c:a', 'pcm_s24be', '-ar', '48000', '-ac', '2',
     '-video_track_timescale', '30000', '-map_metadata', '-1', '-metadata', 'title=' + master.stem,
     '-movflags', '+faststart', str(master)])
run(['ffmpeg', '-n', '-v', 'error', '-i', str(master), '-vf', 'scale=1920:1080:flags=lanczos',
     '-c:v', 'libx264', '-threads', '6', '-crf', '20', '-preset', 'fast', '-pix_fmt', 'yuv420p',
     '-c:a', 'aac', '-b:a', '320k', '-ar', '48000', '-ac', '2', '-video_track_timescale', '30000',
     '-movflags', '+faststart', str(review)])
assert pcm(master) == audio
assert audio[:teaser_end * 6] == base[:teaser_end * 6]
assert audio[closing_start * 6:(closing_start * 6) + len(closing)] == closing

def frame_hashes(path):
    return run(['ffmpeg', '-v', 'error', '-i', str(path), '-map', '0:v:0',
                '-frames:v', str(CUT), '-an', '-f', 'framemd5', '-'])

assert frame_hashes(SOURCE) == frame_hashes(master), 'Opening picture changed'
proof = {}
for p in [master, review]:
    run(['ffmpeg', '-v', 'error', '-i', str(p), '-f', 'null', '-'])
    meta = json.loads(run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries',
                          'stream=width,height,nb_frames,r_frame_rate,duration', '-of', 'json', str(p)]))['streams'][0]
    assert int(meta['nb_frames']) == TOTAL and meta['r_frame_rate'] == '30000/1001', meta
    opening = meter(p, 0, C['teaserAudioStartSample'])
    teaser = meter(p, C['teaserAudioStartSample'], teaser_end)
    assert abs(opening['lufs'] - teaser['lufs']) <= .5
    assert max(opening['truePeakDbtp'], teaser['truePeakDbtp']) <= -2
    proof[p.name] = {'metadata': meta, 'sha256': digest(p), 'bytes': p.stat().st_size,
                     'opening': opening, 'teaser': teaser, 'differenceLu': abs(opening['lufs'] - teaser['lufs'])}
record = {**C, 'outputDirectory': str(OUT), 'teaserLastFrameHold': 0,
          'closingStartFrame': FULL_LOGO, 'closingAudioStartSample': closing_start,
          'master': str(master), 'review': str(review), 'parentMaster': str(SOURCE),
          'transition': {'startFrame': TRANSITION, 'endFrame': FULL_LOGO, 'frames': 36,
                         'seconds': 1.2012, 'speakerFreezeFrames': 0, 'extraFinalLogoHoldFrames': TOTAL - TRANSITION - 149},
          'audio': {'speechAndOpeningExact': True, 'nativeClosingAudioExact': True,
                    'closingStartSample': closing_start, 'closingEndSample': closing_start + len(closing) // 6,
                    'totalSamples': len(audio) // 6, 'addedMusic': False, 'gainChangeDb': 0},
          'prefixFramesExact': CUT, 'totalFrames': TOTAL, 'totalSeconds': 72.2722,
          'proof': proof, 'status': 'Technical checks passed. Visual and listening review pending.'}
(OUT / 'assembly-record.json').write_text(json.dumps(record, indent=2) + '\n')
prefix.unlink()
tail.unlink()
print(json.dumps({'master': str(master), 'review': str(review), 'frames': TOTAL, 'seconds': 72.2722}), flush=True)
