"""Episode 7 standalone outro. Keep the weekly master and replace its teaser."""
import hashlib
import json
from pathlib import Path
import subprocess
import wave
from PIL import Image, ImageDraw, ImageFont

REPO = Path(__file__).resolve().parents[2]
import sys
C = json.loads(Path(sys.argv[1] if len(sys.argv) > 1 else REPO / 'config/745-creative/faithtalk/episode-7-outro.json').read_text())
NAME = C.get('masterName', 'FaithTalk Episode 7 - Outro - Episode 8 Teaser')
OUT = Path(C['outputDirectory'])
REF = C['masterReference']
SOURCE = C['teaserSource']
PASSES = '/Volumes/HomeSSD/Media Library/FAITHTALK/Templates/outro-r3-passes/source-figma-api'
FPS = 30000 / 1001


def run(args, log=None):
    if log:
        with (OUT / log).open('w') as h:
            subprocess.run(args, stdout=h, stderr=h, check=True)
        return b''
    return subprocess.check_output(args, stderr=subprocess.PIPE)


def pcm(path, af=None, seek=None):
    cmd = ['ffmpeg', '-v', 'error']
    if seek is not None:
        cmd += ['-ss', str(seek)]
    cmd += ['-i', str(path), '-map', '0:a:0', '-vn']
    if af:
        cmd += ['-af', af]
    return run(cmd + ['-ar', '48000', '-ac', '2', '-c:a', 'pcm_s24le', '-f', 's24le', '-'])


def meter(path, af):
    p = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', str(path), '-vn',
                        '-af', af + ',loudnorm=I=-24:TP=-2:LRA=7:print_format=json',
                        '-f', 'null', '-'], capture_output=True, check=True)
    s = p.stderr.decode()
    d = json.loads(s[s.rfind('{'):s.rfind('}') + 1])
    return {'lufs': float(d['input_i']), 'truePeakDbtp': float(d['input_tp'])}


def sha(p):
    with Path(p).open('rb') as f:
        return hashlib.file_digest(f, 'sha256').hexdigest()


subprocess.run(['python3', str(REPO / 'scripts/faithtalk_storage.py'), str(OUT)], check=True)
OUT.mkdir(parents=True, exist_ok=True)
start = C['teaserAudioStartSample']
suffix = C['closingAudioStartSample']
length = round(C['teaserSeconds'] * 48000)
opening_filter = f'atrim=end_sample={start},asetpts=PTS-STARTPTS'
source_filter = f"atrim=start={C['teaserStartSeconds']}:duration={C['teaserSeconds']},asetpts=PTS-STARTPTS"
opening = meter(REF, opening_filter)
source_level = meter(SOURCE, source_filter)
gain = round(opening['lufs'] - source_level['lufs'], 3)
assert source_level['truePeakDbtp'] + gain <= -2
base_audio = pcm(REF)
# Cut at the quiet sentence boundary. No speech processing or whole-mix gain.
replacement = pcm(SOURCE, f'atrim=duration={C["teaserSeconds"]},asetpts=PTS-STARTPTS,volume={gain}dB', C['teaserStartSeconds'])[:length * 6]
assert len(replacement) == length * 6
audio = base_audio[:start * 6] + replacement + bytes((suffix - start - length) * 6) + base_audio[suffix * 6:]
assert len(audio) == len(base_audio)
wav = OUT / 'assembled-audio.wav'
with wave.open(str(wav), 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(3)
    w.setframerate(48000)
    w.writeframes(audio)

# The original connect passes have a horizontally uniform green wash. A clean
# strip at the same vertical coordinates removes only the obsolete handle.
# All other original graphics remain in the retained master.
patch = OUT / 'corrected-connect.mp4'
alpha = "if(lt(t,2.5),0,if(lt(t,3.1666667),if(lt(t,2.8333333),2*pow((t-2.5)/0.6666667,2),1-pow(-2*(t-2.5)/0.6666667+2,2)/2),1))"
handle_png = OUT / 'corrected-handle.png'
handle_image = Image.new('RGBA', (880, 220))
ImageDraw.Draw(handle_image).text((20, 60), '@myfaithtalktv',
    font=ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial.ttf', 128),
    fill='white', anchor='lt')
handle_image.save(handle_png)
patch_filter = (
    '[0:v]setpts=PTS*408/345,framerate=fps=30000/1001,trim=end_frame=408,'
    'format=gbrp16le[bg];'
    '[1:v]setpts=1.001*(PTS-STARTPTS),fps=30000/1001,trim=end_frame=408,'
    'format=gbrp16le,split[bf][bs];'
    '[bs]crop=2:220:20:1000,scale=880:220:flags=neighbor[bstrip];'
    '[bf][bstrip]overlay=x=584:y=1000:format=gbrp,format=gbrp16le,split[b][b2];'
    '[2:v]setpts=1.001*(PTS-STARTPTS),fps=30000/1001,trim=end_frame=408,'
    'format=gbrp16le,split[wf][ws];'
    '[ws]crop=2:220:20:1000,scale=880:220:flags=neighbor[wstrip];'
    '[wf][wstrip]overlay=x=584:y=1000:format=gbrp,format=gbrp16le[w];'
    "[w][b]blend=all_expr='clip((A-B)/0.992,0,65535)'[inverse];"
    "[bg][inverse]blend=all_expr='A*B/65535'[masked];"
    '[masked][b2]blend=all_mode=addition,format=yuv420p[clean];'
    "[3:v]format=rgba,geq=r='r(X,Y)':g='g(X,Y)':b='b(X,Y)':"
    f"a='alpha(X,Y)*({alpha.replace('t,', 'T,').replace('(t-', '(T-')})'[type];"
    '[clean][type]overlay=x=584:y=1000:shortest=1,format=yuv420p,settb=1/30000,setpts=N*1001[v]'
)
run(['ffmpeg', '-n', '-v', 'error', '-filter_complex_threads', '2', '-i',
     '/Volumes/HomeSSD/Active Work/FAITHTALK/renders/outro-r2-connect-soil-push-4k.mp4',
     '-i', PASSES + '/r6/connect-black.mp4', '-i', PASSES + '/r6/connect-white.mp4',
     '-loop', '1', '-framerate', '30000/1001', '-i', str(handle_png),
     '-filter_complex', patch_filter, '-map', '[v]', '-an', '-frames:v', '408',
     '-c:v', 'libx264', '-preset', 'fast', '-crf', '12', '-threads', '2', str(patch)], 'handle-render.log')

graph = (
    '[0:v]split[ref0][ref1];'
    '[ref0]trim=end_frame=1179,settb=1/30000,setpts=N*1001,format=yuv420p[pre];'
    '[5:v]settb=1/30000,setpts=(N+120)*1001[patch];'
    "[pre][patch]overlay=x=0:y=0:enable='between(n,120,527)':eof_action=pass[first];"
    '[ref1]trim=start_frame=2017:end_frame=2166,settb=1/30000,setpts=N*1001,format=yuv420p[last];'
    f"[1:v]trim=start_frame={C['teaserStartFrame']}:end_frame={C['teaserStartFrame'] + C['teaserFrames']},"
    'settb=1/30000,setpts=N*1001,scale=3840:2160:flags=lanczos,setsar=1,format=gbrp16le,'
    f"tpad=start_mode=clone:start=75:stop_mode=clone:stop={C['teaserLastFrameHold']}[clip];"
    '[2:v]setpts=1.001*(PTS-STARTPTS),fps=30000/1001,tpad=stop_mode=clone:stop=536,'
    'trim=end_frame=838,format=gbrp16le,split[black][black2];'
    '[3:v]setpts=1.001*(PTS-STARTPTS),fps=30000/1001,tpad=stop_mode=clone:stop=536,'
    'trim=end_frame=838,format=gbrp16le[white];'
    "[white][black]blend=all_expr='clip((A-B)/0.992,0,65535)'[inversealpha];"
    "[clip][inversealpha]blend=all_expr='A*B/65535'[masked];"
    '[masked][black2]blend=all_mode=addition,fade=t=out:st=27.460766666667:d=0.5005,'
    'format=yuv420p,settb=1/30000,setpts=N*1001[next];'
    '[first][next][last]concat=n=3:v=1:a=0,settb=1/30000,setpts=N*1001[v]'
)
master = OUT / (NAME + '.mov')
review = OUT / (NAME + ' - REVIEW.mp4')
cmd = ['ffmpeg', '-n', '-hide_banner', '-nostats', '-filter_complex_threads', '4']
for p in [REF, SOURCE, PASSES + '/nextweek-black.mp4', PASSES + '/nextweek-white.mp4', wav, patch]:
    cmd += ['-i', str(p)]
cmd += ['-filter_complex', graph, '-map', '[v]', '-map', '4:a:0', '-frames:v', '2166',
        '-r', '30000/1001', '-video_track_timescale', '30000', '-c:v', 'libx264', '-threads', '6',
        '-profile:v', 'high', '-level', '5.1', '-preset', 'fast', '-crf', '15', '-pix_fmt', 'yuv420p',
        '-color_primaries', 'bt709', '-color_trc', 'iec61966-2-1', '-colorspace', 'bt709',
        '-color_range', 'tv', '-c:a', 'pcm_s24be', '-ar', '48000', '-ac', '2',
        '-map_metadata', '-1', '-metadata', 'title=' + master.stem, '-movflags', '+faststart',
        '-progress', str(OUT / 'master-progress.txt'), str(master)]
(OUT / 'master-command.json').write_text(json.dumps(cmd, indent=2) + '\n')
run(cmd, 'master-render.log')
# A video-frame limit can stop audio packet writing before the last silent
# samples. Remux the complete WAV after picture encoding; keep the video bytes.
complete_audio = OUT / 'complete-audio.mov'
run(['ffmpeg', '-n', '-v', 'error', '-i', str(master), '-i', str(wav),
     '-map', '0:v:0', '-map', '1:a:0', '-c:v', 'copy', '-c:a', 'pcm_s24be',
     '-ar', '48000', '-ac', '2', '-map_metadata', '0', '-movflags', '+faststart',
     str(complete_audio)], 'complete-audio.log')
complete_audio.replace(master)
run(['ffmpeg', '-n', '-v', 'error', '-i', str(master), '-vf', 'scale=1920:1080', '-c:v', 'libx264',
     '-threads', '4', '-crf', '20', '-preset', 'fast', '-c:a', 'aac', '-b:a', '320k',
     '-movflags', '+faststart', str(review)], 'review-render.log')
assert pcm(master) == audio
proof = {}
for p in [master, review]:
    run(['ffmpeg', '-v', 'error', '-i', str(p), '-f', 'null', '-'])
    measured_opening = meter(p, opening_filter)
    measured_teaser = meter(p, f'atrim=start_sample={start}:end_sample={start + length},asetpts=PTS-STARTPTS')
    difference = abs(measured_opening['lufs'] - measured_teaser['lufs'])
    assert difference <= .5, difference
    assert max(measured_opening['truePeakDbtp'], measured_teaser['truePeakDbtp']) <= -2
    probe = json.loads(run(['ffprobe', '-v', 'error', '-show_entries',
                           'stream=codec_type,width,height,r_frame_rate,nb_frames:format=duration,size',
                           '-of', 'json', str(p)]))
    video = next(s for s in probe['streams'] if s['codec_type'] == 'video')
    assert video['nb_frames'] == '2166' and video['r_frame_rate'] == '30000/1001'
    proof[p.name] = {'opening': measured_opening, 'teaser': measured_teaser,
                     'differenceLu': difference, 'metadata': probe, 'sha256': sha(p)}
record = {**C, 'openingSource': opening, 'teaserSourceLevel': source_level, 'teaserGainDb': gain,
          'master': str(master), 'review': str(review), 'proof': proof,
          'prefixAudioExact': audio[:start * 6] == base_audio[:start * 6],
          'closingAudioExact': audio[suffix * 6:] == base_audio[suffix * 6:],
          'newMusic': False, 'wholeMixNormalization': False,
          'status': 'Technical checks passed. Visual and listening review pending.'}
(OUT / 'assembly-record.json').write_text(json.dumps(record, indent=2) + '\n')
print(json.dumps({'master': str(master), 'review': str(review), 'frames': 2166, 'seconds': 72.2722}), flush=True)
