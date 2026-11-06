import bpy, sys, time
a = sys.argv[sys.argv.index("--") + 1:]; engine, frame, out = a[0], int(a[1]), a[2]
sc = bpy.context.scene; sc.frame_set(frame)
if engine == "cycles":
    sc.render.engine = "CYCLES"
    pr = bpy.context.preferences.addons["cycles"].preferences; pr.compute_device_type = "METAL"; pr.get_devices()
    for d in pr.devices: d.use = True
    sc.cycles.device = "GPU"; sc.cycles.samples = 128; sc.cycles.use_denoising = True
else:
    sc.eevee.taa_render_samples = 64
sc.render.filepath = out; t = time.time(); bpy.ops.render.render(write_still=True); print("TIME", engine, round(time.time() - t, 1))
