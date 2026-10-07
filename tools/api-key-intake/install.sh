#!/bin/bash
set -euo pipefail
source_dir="$(cd -- "$(dirname -- "$0")" && pwd)"
install_dir="$HOME/Library/Application Support/Singleton Systems/api-key-intake"
mkdir -p "$install_dir"
chmod 700 "$install_dir"
/usr/bin/xcrun swiftc -O "$source_dir/main.swift" -o "$install_dir/api-key-intake.new"
chmod 700 "$install_dir/api-key-intake.new"
mv "$install_dir/api-key-intake.new" "$install_dir/api-key-intake"
chmod +x "$source_dir/save-api-key.sh"
/usr/bin/python3 "$source_dir/install-agent.py"
echo 'Installed API key helper.'
