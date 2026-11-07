import bpy, sys, os
out = sys.argv[sys.argv.index("--") + 1]; frames = [int(x) for x in sys.argv[sys.argv.index("--") + 2].split(",")]
sc = bpy.context.scene; sc.render.resolution_percentage = 50; sc.eevee.taa_render_samples = 16
for f in frames:
    sc.frame_set(f); sc.render.filepath = os.path.join(out, f"proof_{f:04d}.png"); bpy.ops.render.render(write_still=True)
