#!/usr/bin/env bash
set -euo pipefail

RESUME_PY="/Users/singleton23/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3.12"

if [[ ! -x "$RESUME_PY" ]]; then
  echo "Pinned resume Python is missing: $RESUME_PY" >&2
  exit 127
fi

exec "$RESUME_PY" "$@"
