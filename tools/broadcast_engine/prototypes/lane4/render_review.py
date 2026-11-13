"""Render a 4A review movie: animated frames only, holds copied, 25 fps, then mux the episode audio at the
scene anchor (Studio has no audio track of its own).

blender -b -P render_review.py -- --blend SCENE.blend --out DIR --anchor SECONDS --duration SECONDS --source EPISODE.mp4
"""
import argparse, shutil, subprocess, sys
from pathlib import Path
import bpy
sys.path.insert(0, str(Path(__file__).resolve().parents[4]))
from tools.broadcast_engine import lane4_layout as L
from tools.broadcast_engine.prototypes.lane4.house import fcurves

a = argparse.ArgumentParser()
for name in ("--blend", "--out", "--source"): a.add_argument(name, required=True)
a.add_argument("--anchor", type=float, required=True); a.add_argument("--duration", type=float, required=True)
a.add_argument("--pre", type=int, default=0)
args = a.parse_args(sys.argv[sys.argv.index("--") + 1:])
bpy.ops.wm.open_mainfile(filepath=args.blend); sc = bpy.context.scene
out = Path(args.out); out.mkdir(parents=True, exist_ok=True); frames = out / "frames"; frames.mkdir(exist_ok=True)
end = min(sc.frame_end, args.pre + round(args.duration * 25))
curves = []
owners = list(sc.objects) + [m.node_tree for m in bpy.data.materials if m.node_tree]  # material keys: fades
for o in owners:
    curves += [(fc.data_path, [tuple(p.co) for p in fc.keyframe_points]) for fc in fcurves(o)]
active = L.active_frames(curves, end)
sc.render.image_settings.file_format = "PNG"; sc.render.image_settings.compression = 15
last = None
for f in range(1, end + 1):
    dest = frames / f"f_{f:04d}.png"
    if f in active or last is None:
        sc.frame_set(f); sc.render.filepath = str(dest); bpy.ops.render.render(write_still=True); last = dest
    else:
        shutil.copyfile(last, dest)
stem = Path(args.blend).stem; movie = out / f"{stem}-review.mp4"; audio = out / f"{stem}-review-audio.mp4"
run = lambda *c: subprocess.run(["ffmpeg", "-v", "error", "-y", *c], check=True)
run("-framerate", "25", "-start_number", str(args.pre + 1), "-i", str(frames / "f_%04d.png"), "-frames:v", str(round(args.duration * 25)),
    "-c:v", "libx264", "-crf", "18", "-pix_fmt", "yuv420p", "-movflags", "+faststart", str(movie))
run("-i", str(movie), "-ss", str(args.anchor), "-i", args.source, "-map", "0:v:0", "-map", "1:a:0", "-t", str(args.duration),
    "-c:v", "copy", "-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart", str(audio))
run("-ss", str(args.duration - .08), "-i", str(movie), "-frames:v", "1", str(out / "poster.png"))
print("RENDERED", len(active), "of", end, audio, flush=True)
