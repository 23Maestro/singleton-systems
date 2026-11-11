"""Fill a registered Blender design. Run inside Blender; --proof builds test data only.

Blender -b --python-exit-code 1 -P tools/broadcast_engine/fill.py --
  --variant 4A --data row.json --output /Volumes/HomeSSD/... --scene manifest.json
"""
import argparse
import hashlib
import json
from pathlib import Path
import runpy
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))


def main():
    import bpy
    from tools.lineups_motion.blender_source import verify_source
    from tools.lineups_motion.engine_choice import routing_contract
    from tools.lineups_motion.templates import resolve
    p = argparse.ArgumentParser()
    p.add_argument('--variant', choices=['3B', '4A'], required=True)
    p.add_argument('--data', type=Path, required=True)
    p.add_argument('--output', type=Path, required=True)
    p.add_argument('--scene', type=Path)
    p.add_argument('--proof', action='store_true')
    p.add_argument('--mode', choices=['build', 'still', 'anim'], default='build')
    p.add_argument('--frame', type=int)
    args = p.parse_args(sys.argv[sys.argv.index('--') + 1:])
    if args.proof == bool(args.scene):
        p.error('choose --scene for production or --proof for a test build')
    row = next(r for r in routing_contract()['blenderVariants'] if r['id'] == args.variant)
    if row.get('status') != 'approved':
        raise ValueError('Variant is not approved')
    template = resolve(row['templateKey'])
    native = verify_source(template)
    if args.scene:
        from tools.lineups_motion.contract_gate import check
        scene = json.loads(args.scene.read_text())
        if scene['scene'].get('blenderVariant') != args.variant:
            raise ValueError('Scene variant differs from requested variant')
        check(ROOT, scene, 'before-build')
        binding = scene.get('blender', {}).get('data')
        if (not binding or (ROOT / binding['path']).resolve() != args.data.resolve()
                or binding['sha256'] != hashlib.sha256(args.data.read_bytes()).hexdigest()):
            raise ValueError('Scene must bind the exact data file and its SHA-256')
        from tools.broadcast_engine.production_data import validate_cue_frames
        validate_cue_frames(json.loads(args.data.read_text()), scene)
    gate = subprocess.run(['node', str(ROOT / 'scripts/developer-storage/storage-gate.mjs'),
                           'route', '--client', 'CATENA_MEDIA_LINEUPS', '--kind', 'previews' if args.proof else 'renders'],
                          cwd=ROOT, capture_output=True, text=True, check=True)
    allowed = Path(gate.stdout.strip()).resolve()
    output = args.output.resolve()
    if not output.is_relative_to(allowed) or output == allowed:
        raise ValueError(f'Output must be an episode folder under {allowed}')
    # Never overwrite an existing build. A retry uses a new, reviewable version.
    output.mkdir(parents=True, exist_ok=False)
    data = args.data.resolve()
    builder = ROOT / native['files']['builder']['path']
    if args.variant == '3B':
        sys.argv = [str(builder), '--', str(data), str(output), 'build']
        result_name = 'lane3-card.blend'
    else:
        sys.argv = [str(builder), '--', str(output), str(data)]
        result_name = 'lane4-concept-v1.blend'
    runpy.run_path(str(builder), run_name='__main__')
    sc = bpy.context.scene
    if sc.render.fps != 25 or sc.render.fps_base != 1:
        raise ValueError('Production must use 25 fps')
    sc.render.filepath = str(output / 'frames/f_')
    bpy.ops.wm.save_as_mainfile(filepath=str(output / result_name))
    if args.mode == 'still':
        sc.frame_set(args.frame or sc.frame_end)
        sc.render.filepath = str(output / 'proof.png')
        bpy.ops.render.render(write_still=True)
    elif args.mode == 'anim':
        sc.render.image_settings.file_format = 'PNG'
        bpy.ops.render.render(animation=True)
    receipt = {'schemaVersion': 1, 'variant': args.variant, 'proofOnly': args.proof,
               'dataSha256': hashlib.sha256(data.read_bytes()).hexdigest(),
               'nativeManifestSha256': hashlib.sha256((ROOT / template['source']['manifestPath']).read_bytes()).hexdigest(),
               'file': str(output / result_name), 'frameRate': 25}
    (output / 'build-receipt.json').write_text(json.dumps(receipt, indent=2) + '\n')
    print(json.dumps(receipt))


if __name__ == '__main__':
    main()
