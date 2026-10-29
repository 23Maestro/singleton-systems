#!/usr/bin/env python3
"""Scan the Development tree through the installed Hazel Veil classifier."""

from __future__ import annotations

import argparse
import json
import os
import shutil
import subprocess
import sys
from pathlib import Path
import whisper_storage


CANDIDATES = {
    "node_modules", ".next", ".turbo", ".vite", ".parcel-cache", ".nuxt",
    ".svelte-kit", "__pycache__", ".pytest_cache", ".mypy_cache", ".ruff_cache",
    "ModuleCache.noindex", "SDKStatCaches.noindex", "SymbolCache.noindex",
    "CompilationCache.noindex",
}
SKIP = {".git", ".hg", ".svn", "_BLOAT_REVIEW"}


def candidate_paths(root: Path):
    for dirpath, dirnames, _ in os.walk(root, followlinks=False):
        directory = Path(dirpath)
        if directory.resolve().is_relative_to(whisper_storage.ROOT.resolve()) or directory == Path.home() / '.cache/whisper-models':
            dirnames[:] = []
            continue
        depth = len(directory.relative_to(root).parts)
        if depth > 6:
            dirnames[:] = []
            continue
        matches = [directory / name for name in dirnames
                   if name in CANDIDATES and not whisper_storage.protected(directory / name)]
        dirnames[:] = [name for name in dirnames if name not in CANDIDATES | SKIP]
        yield from matches


def classify(executable: Path, candidate: Path):
    result = subprocess.run(
        [str(executable), "--json", str(candidate)],
        capture_output=True,
        check=False,
        text=True,
    )
    if result.returncode != 0:
        return None
    return json.loads(result.stdout)


def human_size(size: int) -> str:
    value = float(size)
    for unit in ("B", "KiB", "MiB", "GiB", "TiB"):
        if value < 1024 or unit == "TiB":
            return f"{value:.1f} {unit}"
        value /= 1024
    raise AssertionError("unreachable")


def parse_args():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--root", type=Path, default=Path.home() / "Documents" / "Development"
    )
    parser.add_argument(
        "--classifier", type=Path, default=Path.home() / ".local/bin/development-veil"
    )
    parser.add_argument("--apply-reviewed", action="store_true")
    parser.add_argument("--machine", action="store_true", help="Audit known machine-wide storage offenders with the storage guard")
    parser.add_argument("--json", action="store_true", dest="as_json")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    if args.machine:
        if args.apply_reviewed:
            raise SystemExit("Machine cleanup requires the storage guard's explicit maintenance rules.")
        command = [sys.executable, str(Path(__file__).with_name("storage_guard.py")), "audit"]
        if args.as_json:
            command.append("--json")
        return subprocess.run(command, check=False).returncode
    root = args.root.expanduser().resolve(strict=True)
    classifier = args.classifier.expanduser().resolve(strict=True)
    reviewed = [
        decision
        for candidate in candidate_paths(root)
        if (decision := classify(classifier, candidate)) is not None
    ]
    total = sum(item["size_bytes"] for item in reviewed)

    if args.apply_reviewed:
        # Validate the classifier's returned paths before deleting anything.
        if any(whisper_storage.protected(item['candidate_path']) for item in reviewed):
            raise SystemExit('Whisper is retained on HomeSSD and excluded from cleanup.')
        for item in reviewed:
            shutil.rmtree(item["candidate_path"])

    if args.as_json:
        print(json.dumps({"total_bytes": total, "applied": args.apply_reviewed, "items": reviewed}))
    else:
        action = "Deleted" if args.apply_reviewed else "Reviewed"
        print(f"{action}: {len(reviewed)} folder(s), {human_size(total)}")
        for item in reviewed:
            print(f"{human_size(item['size_bytes']):>10}  {item['candidate_path']}")
            print(f"            restore: {item['rebuild_command']}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
