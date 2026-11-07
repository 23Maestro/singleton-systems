import bpy, sys, os
out = sys.argv[sys.argv.index("--") + 1]
sc = bpy.context.scene; sc.eevee.taa_render_samples = 32
sc.render.image_settings.file_format = "PNG"; sc.render.filepath = os.path.join(out, "f_")
bpy.ops.render.render(animation=True)
