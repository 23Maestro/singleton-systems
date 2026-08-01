#!/usr/bin/env python3
"""Render the preview via the concat demuxer.

A 218-term select='between(...)' expression exceeds ffmpeg's expression
evaluator (Cannot allocate memory), so each keep range becomes a concat entry
with inpoint/outpoint instead. Still one encode pass, still frame accurate.
"""
import json, subprocess, sys
from pathlib import Path

HERE = Path(__file__).parent
MEDIA = "/Volumes/MediaSSD/05_FINISHED/2026-07-29_josh-sayer_vsl_Descript.mp4"
OUT = HERE / "josh_vsl_preview_v1.mp4"
LIST = HERE / "concat.txt"

keeps = json.load(open(HERE / "cutlist.json"))["keeps"]

with open(LIST, "w") as f:
    f.write("ffconcat version 1.0\n")
    for s, e in keeps:
        f.write(f"file '{MEDIA}'\ninpoint {s:.4f}\noutpoint {e:.4f}\n")

cmd = [
    "ffmpeg", "-y", "-v", "warning", "-stats",
    "-f", "concat", "-safe", "0", "-segment_time_metadata", "1", "-i", str(LIST),
    "-vf", "scale=1280:-2,fps=30000/1001",
    "-af", "aresample=async=1:first_pts=0",
    "-c:v", "h264_videotoolbox", "-b:v", "3500k",
    "-c:a", "aac", "-b:a", "128k", "-ar", "48000",
    "-movflags", "+faststart",
    str(OUT),
]
print(f"{len(keeps)} keep segments -> {OUT.name}", flush=True)
rc = subprocess.call(cmd)
if rc == 0:
    d = subprocess.check_output(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "csv=p=0", str(OUT)], text=True).strip()
    print(f"\nrendered {float(d):.2f}s  ({float(d)/60:.2f} min)")
sys.exit(rc)
