#!/bin/bash
# Watch-loop entry point, invoked on an interval by launchd (see the
# LaunchAgent plist in this same directory). Runs client-auto-ingest.mjs
# --apply for every client config found, skipping cleanly if Eagle isn't
# running (the API is unreachable without it).
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLIENTS_DIR="$SCRIPT_DIR/../clients"
LOCK_DIR="$HOME/.eagle-ingest-state/watch.lock"

if ! command -v node >/dev/null 2>&1; then
  export NVM_DIR="$HOME/.nvm"
  if [ -s "$NVM_DIR/nvm.sh" ]; then
    # launchd does not inherit the interactive shell's NVM path.
    . "$NVM_DIR/nvm.sh"
  fi
fi

NODE_BIN="$(command -v node || true)"
if [ -z "$NODE_BIN" ]; then
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] Node runtime unavailable, skipping this pass."
  exit 1
fi

mkdir -p "$(dirname "$LOCK_DIR")"
acquire_lock() {
  if mkdir "$LOCK_DIR" 2>/dev/null; then
    echo "$$" > "$LOCK_DIR/pid"
    return 0
  fi

  lock_pid="$(cat "$LOCK_DIR/pid" 2>/dev/null || true)"
  if [[ "$lock_pid" =~ ^[0-9]+$ ]] && kill -0 "$lock_pid" 2>/dev/null; then
    return 1
  fi

  rm -f "$LOCK_DIR/pid"
  rmdir "$LOCK_DIR" 2>/dev/null || return 1
  mkdir "$LOCK_DIR" 2>/dev/null || return 1
  echo "$$" > "$LOCK_DIR/pid"
}

release_lock() {
  rm -f "$LOCK_DIR/pid"
  rmdir "$LOCK_DIR" 2>/dev/null || true
}

if ! acquire_lock; then
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] Another ingest pass is active, skipping."
  exit 0
fi
trap release_lock EXIT

if ! pgrep -x "Eagle" > /dev/null 2>&1; then
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] Eagle not running, skipping this pass."
  exit 0
fi

for config in "$CLIENTS_DIR"/*.json; do
  [ -e "$config" ] || continue
  slug="$(basename "$config" .json)"
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] --- $slug ---"
  "$NODE_BIN" "$SCRIPT_DIR/client-auto-ingest.mjs" --client "$slug" --apply || \
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $slug pass failed, continuing to next client."
done
