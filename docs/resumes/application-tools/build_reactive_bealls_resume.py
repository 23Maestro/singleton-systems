#!/usr/bin/env python3
from __future__ import annotations

import sys

from build_reactive_resume import main


if __name__ == "__main__":
    raise SystemExit(main(["--job", "bealls-ai-specialist", *sys.argv[1:]]))
