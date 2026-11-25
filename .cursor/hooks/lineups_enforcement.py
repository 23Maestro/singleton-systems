#!/usr/bin/env python3
"""Cursor-native wrapper for the shared Lineups Premiere enforcement hook."""

import json
import os
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from tools.lineups_motion.cursor_hook import adapt_cursor_payload, adapt_cursor_response


def main():
    event = None
    try:
        envelope = json.load(sys.stdin)
        event = envelope.get("hook_event_name")
        payload = adapt_cursor_payload(envelope)
        if payload is None:
            print(json.dumps({"permission": "allow"}) if event == "beforeMCPExecution" else "{}")
            return
        payload["cwd"] = payload.get("cwd") or str(ROOT)
        result = subprocess.run(
            [sys.executable, str(ROOT / ".codex/hooks/lineups_enforcement.py")],
            input=json.dumps(payload),
            text=True,
            capture_output=True,
            cwd=ROOT,
            env=os.environ.copy(),
            check=False,
        )
        if result.returncode != 0:
            if event == "beforeMCPExecution":
                print(json.dumps({"permission": "deny", "user_message": "Lineups Premiere hook failed closed: " + (result.stderr.strip() or "gate process failed")}))
            else:
                print(json.dumps({"additional_context": "Lineups Premiere verification failed: " + (result.stderr.strip() or "gate process failed")}))
            return
        print(json.dumps(adapt_cursor_response(event, result.stdout)))
    except Exception as error:
        if event == "beforeMCPExecution":
            print(json.dumps({"permission": "deny", "user_message": f"Lineups Premiere hook failed closed: {error}"}))
        else:
            print(json.dumps({"additional_context": f"Lineups Premiere hook error: {error}"}))


if __name__ == "__main__":
    main()
