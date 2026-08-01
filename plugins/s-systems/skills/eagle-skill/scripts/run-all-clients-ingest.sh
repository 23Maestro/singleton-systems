#!/bin/bash
# Watch-loop entry point, invoked on an interval by launchd (see the
# LaunchAgent plist in this same directory). Runs client-auto-ingest.mjs
# --apply for every client config found, skipping cleanly if Eagle isn't
# running (the API is unreachable without it).
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLIENTS_DIR="$SCRIPT_DIR/../clients"

if ! pgrep -x "Eagle" > /dev/null 2>&1; then
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] Eagle not running, skipping this pass."
  exit 0
fi

for config in "$CLIENTS_DIR"/*.json; do
  [ -e "$config" ] || continue
  slug="$(basename "$config" .json)"
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] --- $slug ---"
  node "$SCRIPT_DIR/client-auto-ingest.mjs" --client "$slug" --apply || \
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $slug pass failed, continuing to next client."
done
