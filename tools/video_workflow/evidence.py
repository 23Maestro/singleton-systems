"""Evidence bindings shared by video clients."""
import hashlib
import json
from pathlib import Path


def record_sha256(value):
    data = json.dumps(value, sort_keys=True, separators=(',', ':'), ensure_ascii=False, allow_nan=False)
    return hashlib.sha256(data.encode()).hexdigest()


def file_sha256(path):
    with Path(path).open("rb") as stream:
        digest = hashlib.sha256()
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
        return digest.hexdigest()


def approval_matches(record, reviewer):
    approval = record.get("approval") or {}
    return (isinstance(approval, dict) and approval.get("reviewer") == reviewer and isinstance(approval.get("source"), str)
            and bool(approval["source"].strip()) and approval.get("sha256") == record_sha256(
                {key: value for key, value in record.items() if key != "approval"}))
