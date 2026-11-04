#!/usr/bin/env python3
"""Check a Lineups contract request supplied as JSON on stdin."""
import json
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from tools.lineups_motion.contract_gate import check

try:
    request = json.load(sys.stdin)
    result = check(Path(request['root']), request['manifest'], sys.argv[1])
    print(json.dumps(result))
except (ValueError, OSError, KeyError, TypeError, IndexError, AttributeError) as error:
    print(str(error), file=sys.stderr)
    sys.exit(1)
