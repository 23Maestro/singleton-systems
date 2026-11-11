"""Add the dust-logo sound to a rendered LineUps Blender preview.

Usage: python3 add_sfx.py <scene-binding.json> <video.mp4> <out.mp4>

The sound is made here in code (no third-party audio, nothing to license): a soft airy swish that pans
left to right with the wind, plus a few tiny high glints as the specks settle. Each logo gets its own
seed, so repeats never sound copied. It sits low (about -24 dBFS peak) under Mark's voice.
"""
import json, subprocess, sys, tempfile, wave
import numpy as np

SR, FPS = 48000, 25

def dust_sound(seed, dur=0.9):
    rng = np.random.default_rng(seed); n = int(SR * dur); t = np.arange(n) / SR
    noise = rng.normal(0, 1, n)
    spec = np.fft.rfft(noise); f = np.fft.rfftfreq(n, 1 / SR)
    spec *= np.exp(-((np.log(f + 1) - np.log(4500)) ** 2) / 0.9)                 # airy band around 4.5 kHz
    air = np.fft.irfft(spec, n); air /= np.abs(air).max()
    env = np.clip(t / 0.22, 0, 1) ** 1.5 * np.exp(-np.clip(t - 0.3, 0, None) * 4.5)
    swish = air * env * 0.6
    glint = np.zeros(n)
    for _ in range(12):                                                         # glints cluster as the dust settles
        at = rng.uniform(0.35, 0.8); i0 = int(at * SR); fq = rng.uniform(5000, 9000); m = n - i0
        tt = np.arange(m) / SR; glint[i0:] += np.sin(2 * np.pi * fq * tt) * np.exp(-tt / rng.uniform(0.03, 0.07)) * rng.uniform(0.15, 0.35)
    mono = swish + glint
    pan = np.clip(t / dur, 0, 1)                                                # blows in from the left
    st = np.stack([mono * np.cos(pan * np.pi / 2), mono * np.sin(pan * np.pi / 2)], 1)
    fade = np.ones(n); k = int(0.05 * SR); fade[-k:] = np.linspace(1, 0, k)
    return st * fade[:, None]

def main(binding, video, out):
    b = json.load(open(binding)); frames = b.get("dustFrames", [])
    assert frames, f"{binding} lists no dust frames"
    dur = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", video]))
    mix = np.zeros((int(dur * SR) + SR, 2))
    for i, fr in enumerate(frames):
        s = dust_sound(seed=1000 + int(fr) * 7 + i); i0 = int((fr - 1) / FPS * SR)
        mix[i0:i0 + len(s)] += s[: len(mix) - i0]
    mix *= 10 ** (-24 / 20) / max(np.abs(mix).max(), 1e-9)                     # subtle: -24 dBFS peak
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
        w = wave.open(tmp.name, "wb"); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((np.clip(mix, -1, 1) * 32767).astype("<i2").tobytes()); w.close()
        subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", video, "-i", tmp.name, "-map", "0:v", "-map", "1:a",
                        "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-shortest", out], check=True)
    print("SFX", len(frames), "dust sounds at frames", frames, "->", out)

if __name__ == "__main__":
    main(*sys.argv[1:4])
