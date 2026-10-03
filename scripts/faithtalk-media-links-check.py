#!/usr/bin/env python3
"""Offline-media check for the FaithTalk project: every media path the project
loads must exist. Fails loudly on any broken link.

Scans compositions (*.html, incl. .hyperframes review projects), JSON configs,
and the outro assemble script's declared inputs.

Usage:
  scripts/faithtalk-media-links-check.py
  scripts/faithtalk-media-links-check.py --assume-deleted LIST   # one path per line, files or folders
"""
import os, re, subprocess, sys
from pathlib import Path

PROJECT = Path(os.environ.get("FAITHTALK_PROJECT", "/Users/singleton23/Documents/Development/singleton-systems/videos/faithtalk-drawn-seed-preview"))
SCRIPTS = Path(__file__).resolve().parent
ATTR = re.compile(r"""(?:src|data-composition-src)=["']([^"'#?]+)["']|url\(["']?([^"')]+)["']?\)""")

def sources():
    for root, dirs, files in os.walk(PROJECT):
        dirs[:] = [d for d in dirs if d not in {"node_modules", ".git", "renders", "snapshots", "assets", "references"}]
        for f in files:
            if f.endswith((".html", ".json")) and f not in {"package.json", "hyperframes.json", "hyperframes.lock.json", "meta.json"}:
                yield Path(root) / f

def links(f):
    for m in ATTR.finditer(f.read_text(errors="ignore")):
        raw = m.group(1) or m.group(2)
        if raw and not raw.startswith(("http", "data:", "//", "#")) and "${" not in raw:
            yield raw, f.parent / raw          # resolved relative to the file, like the browser does

def main():
    deleted = []
    if "--assume-deleted" in sys.argv:
        deleted = [Path(l.strip()).resolve() for l in open(sys.argv[sys.argv.index("--assume-deleted") + 1]) if l.strip()]
    def online(p):
        try: r = p.resolve(strict=True)
        except FileNotFoundError: return False
        return not any(r == d or d in r.parents for d in deleted)
    offline, n = [], 0
    for f in sources():
        for raw, p in links(f):
            n += 1
            if not online(p): offline.append(f"{f.relative_to(PROJECT)} -> {raw}")
    inputs = subprocess.run(["bash", str(SCRIPTS / "faithtalk-outro-assemble.sh"), "--list-inputs"], capture_output=True, text=True, check=True).stdout.split("\n")
    for raw in filter(None, inputs):
        n += 1
        p = Path(raw) if raw.startswith("/") else PROJECT / raw
        if not online(p): offline.append(f"faithtalk-outro-assemble.sh -> {raw}")
    for o in sorted(set(offline)): print("OFFLINE", o)
    print(f"{n} links checked, {len(set(offline))} offline" + (f" (assuming {len(deleted)} paths deleted)" if deleted else ""))
    sys.exit(1 if offline else 0)

if __name__ == "__main__":
    main()
