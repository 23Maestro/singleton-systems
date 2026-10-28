#!/usr/bin/env python3
"""Forward the existing hook entry point to the canonical Lineups helper."""
from pathlib import Path
import runpy

canonical = Path(__file__).resolve().parents[2] / "lineups-editor/scripts/firecrawl-source-inspect.py"
exports = runpy.run_path(str(canonical))
validate_request = exports["validate_request"]

if __name__ == "__main__":
    raise SystemExit(exports["main"]())
