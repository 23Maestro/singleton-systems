#!/usr/bin/env python3
"""Keep CAD tooling on HomeSSD; leave other uvx commands unchanged."""
from __future__ import annotations

import json
import os
from pathlib import Path
import plistlib
import re
import shutil
import subprocess
import sys

VOLUME = Path('/Volumes/HomeSSD')
UUID = '0EB7E204-D359-47B2-B9B1-89B2DC77BC5A'
ROOT = VOLUME / 'Generated/SINGLETON_SYSTEMS/source/cad-tooling'
STATE = Path.home() / '.local/state/singleton-systems/cad-storage'
MARKER = '# singleton-cad-storage-v1'
PYTHON = Path.home() / '.pyenv/versions/3.12.3/bin/python3'


def is_cad(args):
    return any(re.fullmatch(r'(?:--from=)?cadgen(?:[=<>!~@].*)?', a) for a in args)


def check_volume(volume=VOLUME, expected=UUID):
    # No free-space quota on ordinary launches. The installation uses storage:gate.
    result = subprocess.run(['/usr/sbin/diskutil', 'info', '-plist', str(volume)],
                            capture_output=True, timeout=10, check=True)
    info = plistlib.loads(result.stdout)
    if info.get('VolumeUUID') != expected or info.get('MountPoint') != str(volume):
        raise RuntimeError('CAD needs HomeSSD. Its files will not be rebuilt internally.')
    if not os.access(volume, os.W_OK):
        raise RuntimeError('HomeSSD is not writable.')


def cad_environment(root=ROOT):
    check_volume()
    if not root.resolve().is_relative_to(VOLUME.resolve()):
        raise RuntimeError('CAD root escapes HomeSSD.')
    env = dict(os.environ)
    folders = {'UV_CACHE_DIR': 'uv-cache', 'UV_PYTHON_INSTALL_DIR': 'python',
               'UV_TOOL_DIR': 'tools', 'CADGEN_CACHE_DIR': 'model-cache',
               'CADGEN_LAUNCHER_DIR': 'bin', 'PYTHONPYCACHEPREFIX': 'pycache',
               'TMPDIR': 'tmp'}
    for variable, folder in folders.items():
        path = root / folder
        path.mkdir(parents=True, exist_ok=True)
        if not path.resolve().is_relative_to(root.resolve()):
            raise RuntimeError(f'CAD path escapes HomeSSD: {path}')
        env[variable] = str(path)
    return env


def routed_args(args):
    # Environment variables can be overridden by CLI flags. Keep CAD on its route.
    result, i = [], 0
    while i < len(args):
        if args[i] == '--cache-dir':
            i += 2
            continue
        if args[i].startswith('--cache-dir='):
            i += 1
            continue
        if args[i] in {'--no-cache', '-n'}:
            i += 1
            continue
        result.append(args[i])
        i += 1
    return ['--cache-dir', str(ROOT / 'uv-cache'), *result]


def wrapper(mode, source):
    import shlex
    return '#!/bin/sh\n' + MARKER + '\nexec ' + ' '.join(map(shlex.quote, [str(PYTHON), str(source), mode])) + ' "$@"\n'


def install():
    """Install small launchers, retaining originals for an explicit rollback."""
    STATE.mkdir(parents=True, exist_ok=True, mode=0o700)
    source = Path(__file__).resolve()
    for mode in ['uvx', 'cadgen']:
        target = Path.home() / '.local/bin' / mode
        backup = STATE / (mode + '-original')
        current = target.read_bytes()
        if MARKER.encode() not in current:
            if not backup.exists():
                shutil.copy2(target, backup)
            elif mode == 'cadgen' and not current.startswith(b'#!/bin/sh\n# cadgen proxy:'):
                raise RuntimeError('Unexpected CAD launcher; review before replacing it.')
        temporary = target.with_name(target.name + '.cad-storage-new')
        with temporary.open('x') as stream:
            stream.write(wrapper(mode, source))
        temporary.chmod(0o755)
        temporary.replace(target)
    print(json.dumps(health()))


def health():
    launchers = {}
    for mode in ['uvx', 'cadgen']:
        path = Path.home() / '.local/bin' / mode
        try:
            installed = Path.home() / '.codex/skills/dev-storage/scripts/cad_storage.py'
            launchers[mode] = path.read_text() == wrapper(mode, installed)
        except (OSError, UnicodeError):
            launchers[mode] = False
    return {'root': str(ROOT), 'launchers': launchers, 'healthy': all(launchers.values())}


def main():
    mode, *args = sys.argv[1:]
    if mode == 'install':
        install()
    elif mode == 'health':
        value = health()
        print(json.dumps(value))
        return 0 if value['healthy'] else 2
    elif mode == 'uvx':
        env = cad_environment() if is_cad(args) else dict(os.environ)
        argv = routed_args(args) if is_cad(args) else args
        uv = str(Path.home() / '.local/bin/uv')
        os.execve(uv, [uv, 'tool', 'uvx', *argv], env)
    elif mode == 'cadgen':
        env = cad_environment()
        os.execve('/bin/sh', ['/bin/sh', str(STATE / 'cadgen-original'), *args], env)
    elif mode == 'update-uv':
        # uv's updater replaces uvx. Restore the CAD route in the same command.
        result = subprocess.run([str(Path.home()/'.local/bin/uv'), 'self', 'update', *args])
        install()
        return result.returncode
    else:
        raise ValueError('Expected install, health, uvx, cadgen, or update-uv')
    return 0


if __name__ == '__main__':
    try:
        raise SystemExit(main())
    except (OSError, ValueError, RuntimeError, subprocess.SubprocessError) as error:
        print(str(error), file=sys.stderr)
        raise SystemExit(69)
