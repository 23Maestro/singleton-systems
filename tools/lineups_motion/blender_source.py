"""Verify the saved approved Blender master and the code that fills it."""
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def verify_file(ref, root=ROOT):
    if not isinstance(ref, dict) or not ref.get('path') or not ref.get('sha256'):
        raise ValueError('Blender source needs a file path and SHA-256')
    path = Path(root) / ref['path']
    if not path.is_file() or hashlib.sha256(path.read_bytes()).hexdigest() != ref['sha256']:
        raise ValueError('Blender source file is missing or changed: ' + str(path))
    return path


def verify_source(template, root=ROOT):
    source = template['source']
    if source.get('engine') != 'blender':
        raise ValueError('Expected a Blender template')
    path = Path(root) / source['manifestPath']
    native = json.loads(path.read_text())
    if (native.get('schemaVersion') != 1 or native.get('templateKey') != template['key']
            or native.get('variant') != source['variant']):
        raise ValueError('Blender native source identifies another template')
    master = verify_file(native.get('master'), root)
    if master.suffix != '.blend':
        raise ValueError('Blender master must be a .blend file')
    required = {'builder', 'dataContract', 'runner'}
    files = native.get('files', {})
    if not required <= files.keys():
        raise ValueError('Blender source needs builder, data contract and production runner')
    for ref in files.values():
        verify_file(ref, root)
    return native
