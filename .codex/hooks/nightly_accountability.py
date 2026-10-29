"""Activity-only, once-per-night accountability context for the prompt hook."""

import fcntl
import os
import re
from datetime import datetime, timezone
from pathlib import Path
from zoneinfo import ZoneInfo


def accountability_context(payload, *, now=None, state_dir=None):
    if payload.get("hook_event_name") != "UserPromptSubmit":
        return ""
    if not payload.get("session_id"):
        return ""
    prompt = payload.get("prompt")
    if not isinstance(prompt, str) or not prompt.strip():
        return ""
    # Scheduled turns also reach UserPromptSubmit; they are not human activity.
    if re.match(r"\s*<heartbeat\b", prompt, re.IGNORECASE):
        return ""
    current = now or datetime.now(timezone.utc)
    if current.tzinfo is None:
        return ""
    local = current.astimezone(ZoneInfo("America/New_York"))
    minute = local.hour * 60 + local.minute
    if not 30 <= minute < 360:
        return ""
    directory = Path(state_dir) if state_dir is not None else (
        Path.home() / ".local/state/singleton-systems/nightly-accountability"
    )
    try:
        directory.mkdir(parents=True, exist_ok=True, mode=0o700)
        # One tiny marker, shared across sessions; serialize simultaneous prompts.
        with (directory / "last-night").open("a+", encoding="utf-8") as marker:
            os.fchmod(marker.fileno(), 0o600)
            fcntl.flock(marker, fcntl.LOCK_EX)
            marker.seek(0)
            night = local.date().isoformat()
            if marker.read().strip() == night:
                return ""
            marker.seek(0)
            marker.truncate()
            marker.write(night)
            marker.flush()
    except OSError:
        # An accountability nudge must never block the user's work.
        return ""
    return (
        "- [nightly-accountability] A human prompt arrived at "
        + local.strftime("%I:%M %p %Z")
        + ". Jerami requested one brief, shame-free check-in per night after 12:30 a.m. Eastern. "
        "Ask whether this work has a real deadline or concrete consequence before morning. "
        "If it can wait, suggest saving, leaving one sentence about where to resume, and signing off. "
        "If imperative, ask for the smallest necessary finish and a stopping time. "
        "Honor an urgency or stopping-time answer already in this prompt; do not ask it again. "
        "Keep helping with authorized work; this is a nudge, never a refusal or hard shutdown. "
        "Do not infer an all-nighter, start a planning exercise, or repeat the nudge this night."
    )
