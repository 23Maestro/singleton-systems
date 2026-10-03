#!/usr/bin/env python3
"""Phrase-level duck mix: music ducks smoothly under each spoken phrase, no compressor pumping.
Usage: faithtalk-duck-mix.py <vo.wav> <music.wav> <music_offset_s> <duration_s> <out.wav> [music_bed_lufs=-30]
VO to -24 LUFS, music bed -30 LUFS (arg 6), duck 6 dB (0.5 s down, 1.2 s up, pauses under 1.5 s held),
per-sample gain envelope, then one static gain to
-24 LKFS with true peak <= -2 dBTP (ATSC A/85). No dynamic loudness processing."""
import json, re, subprocess, sys
from pathlib import Path
from faithtalk_storage import require_output
vo, music, off, dur, out = sys.argv[1], sys.argv[2], float(sys.argv[3]), float(sys.argv[4]), sys.argv[5]
out = str(require_output(out))
require_output(out + ".pre.wav")
Path(out).parent.mkdir(parents=True, exist_ok=True)
BED = float(sys.argv[6]) if len(sys.argv) > 6 else -30.0
DUCK_DB, DOWN, UP, MERGE = 6.0, 0.5, 1.2, 1.5

def ff(*a): return subprocess.run(["ffmpeg", "-hide_banner", *a], capture_output=True, text=True, check=True).stderr
def lufs(f, af="ebur128=peak=true"):
    e = ff("-i", f, "-af", af, "-f", "null", "-")
    s = e[e.rfind("Summary:"):]
    return float(re.search(r"I:\s+(-?[\d.]+)", s).group(1)), float(re.search(r"Peak:\s+(-?[\d.]+)", s).group(1))

# speech phrases: silences shorter than MERGE stay inside the phrase
e = ff("-i", vo, "-af", f"silencedetect=n=-45dB:d={MERGE}", "-f", "null", "-")
st = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", e)]
en = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", e)]
bounds = [0.0] + [x for p in zip(st, en) for x in p] + [dur]
phrases = [(a, b) for a, b in zip(bounds[::2], bounds[1::2]) if b - a > 0.05]
# duck(t) in 0..1: trapezoid per phrase, starting DOWN before speech, releasing UP after
tz = "+".join(f"clip((t-{a-DOWN:.3f})/{DOWN},0,1)*clip(({b+UP:.3f}-t)/{UP},0,1)" for a, b in phrases)
# per-sample envelope (volume eval=frame steps once per audio frame and crackles on ramps)
env = f"pow(10,-{DUCK_DB}/20*min(1,{tz}))"

vg = -24 - lufs(vo)[0]; mg = BED - lufs(music)[0]
fc = (f"[0]volume={vg:.2f}dB,aformat=channel_layouts=stereo[v];"
      f"[1]volume={mg:.2f}dB,aformat=sample_fmts=fltp:channel_layouts=stereo,adelay={int(off*1000)}:all=1,apad=whole_dur={dur},atrim=0:{dur}[mb];"
      f"aevalsrc='{env}|{env}':s=48000:d={dur},aformat=sample_fmts=fltp:channel_layouts=stereo[e];"
      f"[mb][e]amultiply[m];"
      f"[v][m]amix=inputs=2:normalize=0,atrim=0:{dur}[o]")
ff("-y", "-i", vo, "-i", music, "-filter_complex", fc, "-map", "[o]", "-c:a", "pcm_s24le", out + ".pre.wav")
i, _ = lufs(out + ".pre.wav")
tp = float(re.search(r"Peak:\s+(-?[\d.]+)", ff("-i", out + ".pre.wav", "-af", "ebur128=peak=true", "-f", "null", "-").split("True peak:")[-1]).group(1))
g = -24 - i
assert tp + g <= -2, f"true peak would be {tp+g:.1f} dBTP"
ff("-y", "-i", out + ".pre.wav", "-af", f"volume={g:.2f}dB", "-c:a", "pcm_s24le", out)
fi, fp = lufs(out)
assert abs(fi + 24) <= 0.2 and fp <= -2, f"final mix outside target: {fi} LUFS, {fp} dBTP"
Path(out + ".pre.wav").unlink()
print("phrases:", " ".join(f"{a:.2f}-{b:.2f}" for a, b in phrases))
print(f"{out}: {len(phrases)} phrases, I {fi} LUFS, true peak {tp+g:.1f} dBTP")
