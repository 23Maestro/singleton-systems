#!/bin/bash
# @raycast.schemaVersion 1
# @raycast.title Save API Key
# @raycast.mode compact
# @raycast.packageName Singleton Systems
# @raycast.icon 🔐
# @raycast.description Save a named API key in the Mac login Keychain.

set -euo pipefail
helper="$HOME/Library/Application Support/Singleton Systems/api-key-intake/api-key-intake"
if [[ ! -x "$helper" ]]; then
  echo 'API key helper is not installed.'
  exit 1
fi
exec "$helper" --interactive
