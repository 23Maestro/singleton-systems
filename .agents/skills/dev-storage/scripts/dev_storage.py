#!/usr/bin/env python3
"""Scan the Development tree through the installed Hazel Veil classifier."""

from __future__ import annotations

import argparse
import json
import os
import shutil
import subprocess
from pathlib import Path


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
        depth = len(directory.relative_to(root).parts)
        if depth > 6:
            dirnames[:] = []
            continue
        matches = [directory / name for name in dirnames if name in CANDIDATES]
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
    parser.add_argument("--json", action="store_true", dest="as_json")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    root = args.root.expanduser().resolve(strict=True)
    classifier = args.classifier.expanduser().resolve(strict=True)
    reviewed = [
        decision
        for candidate in candidate_paths(root)
        if (decision := classify(classifier, candidate)) is not None
    ]
    total = sum(item["size_bytes"] for item in reviewed)

    if args.apply_reviewed:
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
