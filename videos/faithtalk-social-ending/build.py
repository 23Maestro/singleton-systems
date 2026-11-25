#!/usr/bin/env python3
"""Build a FaithTalk social promo from the retained official sting and episode JSON."""
import argparse
import datetime
import hashlib
import html
import json
import os
from pathlib import Path
import subprocess
import wave

ROOT = Path(__file__).resolve().parent
REPO = ROOT.parents[1]
FPS = 30000 / 1001


def run(args, log=None):
    if log:
        with log.open('w') as handle:
            subprocess.run(args, stdout=handle, stderr=handle, check=True)
    else:
        return subprocess.check_output(args, stderr=subprocess.PIPE)


def digest(path):
    with Path(path).open('rb') as handle:
        return hashlib.file_digest(handle, 'sha256').hexdigest()


def pcm(path, af=None):
    return run(['ffmpeg', '-v', 'error', '-i', str(path), '-vn', *(['-af', af] if af else []), '-ar', '48000',
                '-ac', '2', '-c:a', 'pcm_s24le', '-f', 's24le', '-'])


def loudness(path, end, af=''):
    # Integrated LUFS and true peak of the speech section only (sting excluded).
    p = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', str(path), '-vn', '-af',
                        f'atrim=end={end},asetpts=PTS-STARTPTS{af},loudnorm=I=-24:TP=-2:LRA=7:print_format=json',
                        '-f', 'null', '-'], capture_output=True, text=True, check=True)
    d = json.loads(p.stderr[p.stderr.rfind('{'):p.stderr.rfind('}') + 1])
    return float(d['input_i']), float(d['input_tp'])


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--config', required=True, type=Path)
    parser.add_argument('--prepare-only', action='store_true')
    args = parser.parse_args()
    config = json.loads(args.config.read_text())
    template = json.loads((ROOT / 'template.json').read_text())
    output = Path(config['outputDirectory']).resolve()
    subprocess.run(['python3', str(REPO / 'scripts/faithtalk_storage.py'), str(output)], check=True)
    output.mkdir(parents=True, exist_ok=True)
    source = Path(config['source']).resolve(strict=True)
    sting = Path(template['nativeLogoSting']).resolve(strict=True)
    assert digest(source) == config['sourceSha256'], 'Selected clip changed'
    assert digest(sting) == template['nativeLogoStingSha256'], 'Official sting changed'
    if not args.prepare_only and any(output.iterdir()):
        raise RuntimeError('Output directory is not empty. Use a fresh outputDirectory for each render; existing media is never reused or overwritten.')
    count = int(config['videoEndFrame'])
    end = float(config['audioEndSeconds'])
    probe = json.loads(run(['ffprobe', '-v', 'error', '-select_streams', 'v:0',
                            '-show_entries', 'stream=nb_frames,r_frame_rate,width,height',
                            '-of', 'json', str(source)]))['streams'][0]
    assert probe['r_frame_rate'] == '30000/1001', 'Source must be 29.97 fps'
    assert (probe['width'], probe['height']) == (1080, 1920), 'Source must be 1080x1920'
    assert 0 < count <= int(probe['nb_frames']), 'Cut exceeds source frames'
    assert 0 < end <= count / FPS, 'Audio cut exceeds picture boundary'
    air = datetime.date.fromisoformat(config['airDate'])
    values = {'EPISODE': str(int(config['episode'])), 'AIR_DATE': air.strftime('%B %-d').upper(),
              'WEEKDAY': air.strftime('%A').upper(), 'AIRTIME': config['airtime'],
              'WATCH_URL': config.get('watchUrl', template['watchUrl']), 'TAGLINE': 'ALL-NEW EPISODE'}
    # Optional no-date card for clips posted after air: replaces TAGLINE, WEEKDAY, AIR_DATE, AIRTIME.
    values.update(config.get('cardText', {}))
    project = ROOT / 'instances' / config.get('instance', 'episode-' + values['EPISODE'])
    (project / 'compositions').mkdir(parents=True, exist_ok=True)
    assets = project / 'assets'
    if not assets.exists():
        assets.symlink_to(Path(template['assets']), target_is_directory=True)
    card = (ROOT / 'compositions/card.template.html').read_text()
    for key, value in values.items():
        card = card.replace('__' + key + '__', html.escape(value).replace('\n', '<br>'))
    if not values['AIRTIME']:
        # No-date card: center WATCH NOW between the line above it and the gold rule.
        # A 2-line tagline pushes FULL EPISODE down 1 line; WATCH NOW re-centers below it.
        two = '\n' in values['TAGLINE']
        card = card.replace('id="weekday" class="text day" style="left:108px;top:465px', f'id="weekday" class="text day" style="left:108px;top:{512 if two else 465}px')
        card = card.replace('id="date-0" class="text date" style="left:108px;top:550px', f'id="date-0" class="text date" style="left:108px;top:{624 if two else 590}px')
    assert '__EPISODE__' not in card and '__AIR_DATE__' not in card and '__WATCH_URL__' not in card
    (project / 'compositions/card.html').write_text(card)
    (project / 'index.html').write_text((ROOT / 'index.template.html').read_text())
    if args.prepare_only:
        print(json.dumps({'project': str(project), 'outputDirectory': str(output)}))
        return
    cli = os.environ.get('FAITHTALK_HYPERFRAMES_CLI')
    if not cli:
        for package in (Path.home() / '.npm/_npx').glob('*/node_modules/hyperframes/package.json'):
            if json.loads(package.read_text()).get('version') == '0.8.70':
                cli = str(package.parent / 'dist/cli.js')
                break
    if not cli:
        raise RuntimeError('Set FAITHTALK_HYPERFRAMES_CLI to the reviewed 0.8.70 CLI')
    schedule = output / 'schedule-animation.mp4'
    if not schedule.exists():
        render = ['node', cli, 'render', str(project), '--fps', '30000/1001', '--quality', 'delivery',
                  '--workers', '2', '--output', str(schedule), '--frames-cache-dir',
                  '/Volumes/HomeSSD/Active Work/hyperframes/cache/extracted-frames']
        run(render, output / 'schedule-render.log')
    ending = output / 'FaithTalk Social Ending.mp4'
    graph = ("[0:v]fps=30000/1001,setsar=1,drawbox=x=430:y=1235:w=222:h=76:color=black:t=fill,"
             "crop=iw:ih-36:0:36,pad=iw:ih+36:0:0:black,format=gbrp[sting];"
             "[1:v]fps=30000/1001,setsar=1,format=gbrp[card];"
             "[sting][card]blend=all_mode=lighten,format=yuv420p,split[early][late];"
             "[early]trim=end_frame=131,setpts=PTS-STARTPTS,tpad=stop_mode=clone:stop=72[e];"
             "[late]trim=start_frame=131:end_frame=159,setpts=PTS-STARTPTS[l];"
             "[e][l]concat=n=2:v=1:a=0,settb=1/30000,setpts=N*1001[v]")
    encode = ['-r', '30000/1001', '-c:v', 'libx264', '-bf', '0', '-profile:v', 'main', '-level:v', '4.0',
              '-crf', '16', '-preset', 'fast', '-threads', '4', '-pix_fmt', 'yuv420p',
              '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709',
              '-video_track_timescale', '30000']
    if not ending.exists():
        run(['ffmpeg', '-n', '-v', 'error', '-i', str(sting), '-i', str(schedule), '-filter_complex', graph,
             '-map', '[v]', '-an', '-frames:v', '231', *encode, str(ending)], output / 'ending-render.log')
    trimmed = output / 'trimmed-picture.mp4'
    if not trimmed.exists():
        run(['ffmpeg', '-n', '-v', 'error', '-i', str(source), '-vf',
             f'trim=end_frame={count},setpts=N*1001/30000/TB', '-an', '-frames:v', str(count),
             *encode, str(trimmed)], output / 'trim-render.log')
    # Source speech ends before the next phrase; remaining frame fraction is silent.
    # Speech matches the broadcast outro level (about -24 LUFS) with one static gain; the sting keeps its native audio.
    # 745 teaser loudness check: the reference is the measured opening narration of the approved outro.
    ref = config.get('speechReference')
    target = loudness(Path(ref['file']), ref['end'])[0] if ref else config.get('speechTargetLufs', template.get('speechTargetLufs'))
    gain = 0.0
    if target is not None:
        lufs, peak = loudness(source, end)
        gain = round(target - lufs, 2)
        assert peak + gain <= -2, f'Speech gain {gain} dB would push true peak to {peak + gain:.2f} dBTP'
    source_audio = pcm(source, f'volume={gain}dB' if gain else None)[:round(end * 48000) * 6]
    prefix_samples = round(count / FPS * 48000)
    # Sting sits at the approved outro's closing-logo level (reference logoStart..logoEnd), one static gain.
    sting_gain = 0.0
    if ref and 'logoStart' in ref:
        p = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', ref['file'], '-vn', '-af',
                            f"atrim=start={ref['logoStart']}:end={ref['logoEnd']},asetpts=PTS-STARTPTS,loudnorm=I=-24:TP=-2:LRA=7:print_format=json",
                            '-f', 'null', '-'], capture_output=True, text=True, check=True)
        logo_lufs = float(json.loads(p.stderr[p.stderr.rfind('{'):p.stderr.rfind('}') + 1])['input_i'])
        sting_gain = round(logo_lufs - loudness(sting, 7.7)[0], 2)
    native = pcm(sting, f'volume={sting_gain}dB' if sting_gain else None)
    total = round((count + 231) / FPS * 48000)
    assembled = source_audio + bytes(prefix_samples * 6 - len(source_audio)) + native
    assert len(assembled) <= total * 6
    assembled += bytes(total * 6 - len(assembled))
    audio = output / 'assembled-audio.wav'
    with wave.open(str(audio), 'wb') as handle:
        handle.setnchannels(2)
        handle.setsampwidth(3)
        handle.setframerate(48000)
        handle.writeframes(assembled)
    concat = output / 'picture.ffconcat'
    concat.write_text('ffconcat version 1.0\n' + ''.join("file '" + str(p).replace("'", "'\\''") + "'\n" for p in [trimmed, ending]))
    final = output / f"FaithTalk Episode {values['EPISODE']} - Social Promo - Clean Ending.mp4"
    run(['ffmpeg', '-n', '-v', 'error', '-f', 'concat', '-safe', '0', '-i', str(concat), '-i', str(audio),
         '-map', '0:v:0', '-map', '1:a:0', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '320k',
         '-ar', '48000', '-ac', '2', '-map_metadata', '-1', '-metadata', 'title=' + final.stem,
         '-movflags', '+faststart', str(final)], output / 'assembly.log')
    if target is not None:
        out_lufs, out_peak = loudness(final, end)
        assert abs(out_lufs - target) <= 0.5 and out_peak <= -2, f'Rendered speech {out_lufs} LUFS / {out_peak} dBTP vs reference {target}'
    record = {'template': str(ROOT / 'template.json'), 'config': str(args.config.resolve()), **config,
              'output': str(final), 'outputSha256': digest(final), 'sourceFramesRetained': count,
              'endingFrames': 231, 'outputFrames': count + 231, 'nativeStingSource': str(sting),
              'nativeStingSha256': digest(sting), 'addedMusic': False, 'sourceGainChangeDb': gain, 'speechTargetLufs': target, 'speechReference': ref, 'renderedSpeechLufs': out_lufs if target is not None else None, 'renderedSpeechTruePeak': out_peak if target is not None else None,
              'audioBoundarySilenceSamples': prefix_samples - len(source_audio) // 6,
              'nativeAudioRetainedInAssembly': True, 'stingGainDb': sting_gain, 'renderProject': str(project),
              'review': 'Technical and Jerami visual/listening review pending'}
    (output / 'assembly-record.json').write_text(json.dumps(record, indent=2) + '\n')
    print(json.dumps({'output': str(final), 'frames': count + 231, 'seconds': (count + 231) / FPS}))


if __name__ == '__main__':
    main()
