#!/usr/bin/env python3
"""Build one reviewed comparison request in the live Unreal trial."""

import argparse
import json
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from tools.lineups_unreal.comparison import build_comparison

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("request", type=Path)
args = parser.parse_args()
try:
    result = build_comparison(json.loads(args.request.read_text()))
    print(json.dumps(result, indent=2))
except (ValueError, RuntimeError, OSError) as error:
    print(str(error), file=sys.stderr)
    sys.exit(1)
