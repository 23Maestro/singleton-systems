"""Validate FaithTalk output paths through the repository's physical-volume gate."""
from pathlib import Path
import subprocess
import sys

CLIENT_ROOT = Path("/Volumes/HomeSSD/Generated/FAITHTALK")


def require_output(value):
    target = Path(value).expanduser().absolute()
    client = CLIENT_ROOT
    try:
        parts = target.relative_to(client).parts
    except ValueError as error:
        raise ValueError("FaithTalk outputs must stay on HomeSSD") from error
    if not parts or parts[0] not in {"audio", "renders", "previews"}:
        raise ValueError("Use a FaithTalk audio, renders, or previews destination")
    gate = Path(__file__).resolve().parent / "developer-storage/storage-gate.mjs"
    result = subprocess.run(
        ["node", str(gate), "route", "--client", "FAITHTALK", "--kind", parts[0]],
        check=True, capture_output=True, text=True,
    )
    routed = Path(result.stdout.strip()).resolve(strict=True)
    resolved = target.resolve()
    if not resolved.is_relative_to(routed):
        raise ValueError("FaithTalk output escapes the verified media directory")
    return resolved


if __name__ == "__main__":
    for value in sys.argv[1:]:
        require_output(value)
