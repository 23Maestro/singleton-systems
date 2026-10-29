"""Retained Whisper model policy. Checks never download, move, or delete data."""
from pathlib import Path
import subprocess

import cad_storage

ROOT = cad_storage.VOLUME / 'Generated/SINGLETON_SYSTEMS/source/whisper-models'
MODEL = 'ggml-medium.en.bin'
MODEL_BYTES = 1533774781


def protected(path, home=None):
    home = Path.home() if home is None else Path(home)
    roots = [home / '.cache/whisper-models', ROOT]
    # Protect both the link and its destination, including parent deletions.
    for candidate in [Path(path).absolute(), Path(path).resolve()]:
        for root in roots + [p.resolve() for p in roots]:
            if candidate == root or candidate in root.parents or root in candidate.parents:
                return True
    return False


def health(home=None):
    home = Path.home() if home is None else Path(home)
    link, target = home / '.cache/whisper-models' / MODEL, ROOT / MODEL
    result = {'path': str(link), 'target': str(target), 'protected': True}
    try:
        cad_storage.check_volume()
        if target.resolve() != target or not target.is_file():
            raise ValueError('Whisper model is missing from its HomeSSD location')
        if not link.is_symlink() or link.resolve() != target:
            raise ValueError('Whisper link changed; restore the HomeSSD link without deleting either copy')
        if target.stat().st_size != MODEL_BYTES:
            raise ValueError('Whisper model size changed; verify the download before use')
        return {**result, 'healthy': True, 'reason': 'Retained on HomeSSD'}
    except (OSError, ValueError, RuntimeError, subprocess.SubprocessError) as error:
        return {**result, 'healthy': False, 'reason': f'Whisper needs HomeSSD and its model link: {error}'}
