#!/usr/bin/env python3
"""Print stadium choices and per-candidate flags; never edit old comps."""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from tools.lineups_motion.stadiums import main

if __name__ == '__main__':
    main()
