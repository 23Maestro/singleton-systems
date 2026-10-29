#!/usr/bin/env python3
"""Bounded macOS storage checks; optional cleanup after 48 observed idle hours."""
from __future__ import annotations

import argparse
from concurrent.futures import ThreadPoolExecutor
from contextlib import contextmanager
from datetime import datetime, timezone
import fcntl
import json
import os
from pathlib import Path
import plistlib
import re
import shutil
import stat
import subprocess
import sys
import time
import cad_storage
import whisper_storage

GB = 10**9
GRACE = 48 * 3600
MAX_GAP = 12 * 3600
RULES = {"chrome-clones", "uv-prune"}
POLICY_VERSION = 1
STATE = Path.home() / ".local/state/singleton-systems/storage-guard"


def command(args, timeout=30, env=None):
    result = subprocess.run([str(a) for a in args], capture_output=True, text=True,
                            timeout=timeout, check=False, env=env)
    if result.returncode or result.stderr.strip():
        raise RuntimeError(f"{Path(str(args[0])).name} failed: "
                           f"{result.stderr.strip()[:400] or result.returncode}")
    return result.stdout


def real_directory(path):
    """Reject every symlink component, including ancestors of a cleanup root."""
    path = Path(path).absolute()
    for part in [path, *path.parents]:
        if part.is_symlink():
            raise ValueError(f"Symlink path needs review: {part}")
    info = path.lstat()
    if not stat.S_ISDIR(info.st_mode) or info.st_uid != os.getuid():
        raise ValueError(f"Not an owned directory: {path}")
    return path


def identity(path):
    info = path.lstat()
    return [info.st_dev, info.st_ino, info.st_uid, info.st_mtime_ns, info.st_ctime_ns]


def measure(item):
    item = dict(item)
    path = Path(item["path"])
    try:
        if not path.exists() and not path.is_symlink():
            return {**item, "bytes": 0, "status": "absent"}
        if path.is_symlink():
            return {**item, "bytes": None, "status": "linked", "target": str(path.resolve())}
        raw = command(["/usr/bin/du", "-skx", path], timeout=120)
        item.update(bytes=int(raw.split()[0]) * 1024, status="measured")
    except (OSError, ValueError, RuntimeError, subprocess.SubprocessError) as error:
        item.update(bytes=None, status="error", error=str(error))
    return item


def clone_root():
    # /var is a system alias; resolve it once, then reject links below this root.
    tmp = Path(command(["/usr/bin/getconf", "DARWIN_USER_TEMP_DIR"]).strip()).resolve()
    if not re.fullmatch(r"/private/var/folders/[^/]+/[^/]+/T", str(tmp)):
        raise ValueError("Unexpected macOS per-user temporary path")
    return tmp.parent / "X/com.google.Chrome.code_sign_clone"


def watched_paths(home, chrome):
    entries = [
        ("uv", ".cache/uv", "uv-prune", 8),
        ("npm downloads", ".npm/_cacache", "review", 3),
        ("npm tools", ".npm/_npx", "review", 5),
        ("pip", "Library/Caches/pip", "review", 2),
        ("Homebrew downloads", "Library/Caches/Homebrew", "review", 3),
        ("pnpm store", "Library/pnpm", "review", 5),
        ("Codex release copies", ".codex/tmp", "protected-source", 1),
        ("Codex temporary data", ".codex/.tmp", "review", 3),
        ("Codex worktrees", ".codex/worktrees", "protected-source", 8),
        ("Codex history", ".codex/sessions", "protected-history", 15),
        ("Codex browser cache", "Library/Caches/Codex", "review", 3),
        ("Chrome cache", "Library/Caches/Google", "review", 3),
        ("Browser engines", "Library/Caches/ms-playwright", "protected-runtime", 4),
        ("Claude VM", "Library/Application Support/Claude/vm_bundles", "app-managed", 10),
        ("HyperFrames cache and history", ".cache/hyperframes", "protected-media", 5),
        ("Whisper model links (keep)", ".cache/whisper-models", "protected-runtime", 1),
        ("Background removal models", ".rembg", "model-placement-review", 1),
        ("Audio Hijack models", "Library/Application Support/Audio Hijack 4/models", "app-managed", 2),
        ("Premiere cache", "Library/Caches/com.adobe.PremierePro.26", "protected-media", 3),
    ]
    result = [{"name": n, "path": str(home / p), "class": c, "budget_bytes": b*GB}
              for n, p, c, b in entries]
    result += [
        {"name": "Whisper models on HomeSSD (keep)", "path": str(whisper_storage.ROOT), "class": "protected-external-runtime", "budget_bytes": 2*GB},
        {"name": "CAD tooling on HomeSSD", "path": str(cad_storage.ROOT), "class": "protected-external-runtime", "budget_bytes": 8*GB},
        {"name": "Chrome signing copies", "path": str(chrome), "class": "chrome-clones", "budget_bytes": 2*GB},
        {"name": "Apple downloaded assets", "path": "/System/Volumes/Data/System/Library/AssetsV2", "class": "system-managed", "budget_bytes": 45*GB},
    ]
    # Bounded discovery; never descend into dependencies, Git, media, or links.
    roots = [home / "Documents/Development", home / ".codex/worktrees"]
    candidates = {".next", "node_modules", ".scratch", ".git"}
    skip = candidates | {".venv", "venv", ".build", "vendor", "assets", "videos", "public", "_BLOAT_REVIEW"}
    for root in roots:
        def on_error(error):
            raise error
        for directory, dirs, _ in os.walk(root, followlinks=False, onerror=on_error):
            current = Path(directory)
            depth = len(current.relative_to(root).parts)
            for name in sorted(set(dirs) & candidates):
                path = current / name
                if path.is_symlink():
                    continue
                result.append({"name": f"{current.name}/{name}", "path": str(path),
                               "class": "protected-source" if name in {".git", ".scratch"} else "review",
                               "budget_bytes": (5 if name == ".git" else 2)*GB})
            dirs[:] = [n for n in dirs if n not in skip and not (current/n).is_symlink()] if depth < 3 else []
            if len(result) > 180:
                raise RuntimeError("Discovery limit reached; narrow the configured roots")
    return result


def processes():
    """Failures or incomplete lsof output must never become 'nothing is open'."""
    ps = command(["/bin/ps", "-axo", "pid=,comm="])
    handles = command(["/usr/sbin/lsof", "-nP", "-F", "pn"], timeout=30)
    if not ps.strip() or not handles.startswith("p"):
        raise RuntimeError("Process/open-file inventory is incomplete")
    paths = [str(Path(line[1:]).resolve()) for line in handles.splitlines()
             if line.startswith("n/")]
    return {"commands": ps.splitlines(), "paths": paths}


def busy(path, inventory, uv=False):
    target = str(path.resolve())
    if any(p == target or p.startswith(target + "/") for p in inventory["paths"]):
        return True
    if uv:
        for line in inventory["commands"]:
            parts = line.strip().split(maxsplit=1)
            if len(parts) == 2 and (Path(parts[1]).name in {"uv", "uvx"} or target + "/" in parts[1]):
                return True
    return False


def chrome_candidate(path, root):
    real_directory(root)
    real_directory(path)
    if path.parent != root or not re.fullmatch(r"code_sign_clone\.[A-Za-z0-9]{6}", path.name):
        raise ValueError("Not a direct Chrome clone child")
    children = list(path.iterdir())
    if len(children) != 1 or children[0].name not in {"Google Chrome.app", "Google Chrome.app.bundle"}:
        raise ValueError("Unexpected contents in Chrome clone")
    bundle = real_directory(children[0])
    info = bundle / "Contents/Info.plist"
    real_directory(info.parent)
    if info.is_symlink() or not info.is_file():
        raise ValueError("Missing real Chrome identity plist")
    data = plistlib.loads(info.read_bytes())
    if data.get("CFBundleIdentifier") != "com.google.Chrome":
        raise ValueError("Bundle is not Google Chrome")
    return identity(path)


def tree_activity(path):
    """Check nested changes too; root directory timestamps are insufficient."""
    newest = 0.0
    count = 0
    device = path.stat().st_dev
    def fail(error):
        raise error
    started = time.monotonic()
    for directory, dirs, files in os.walk(path, followlinks=False, onerror=fail):
        for name in [".", *dirs, *files]:
            item = Path(directory) / name
            info = item.lstat()
            if info.st_dev != device:
                raise ValueError("Cache contains a different mounted device")
            if stat.S_ISLNK(info.st_mode) and item.resolve().is_dir() and not item.resolve().is_relative_to(path):
                raise ValueError("Cache link escapes its root")
            newest = max(newest, info.st_mtime, info.st_ctime)
            count += 1
            if count > 2_000_000 or time.monotonic() - started > 120:
                raise RuntimeError("Cache activity scan exceeded its bound")
    return newest


def idle_state(previous, key, token, now, active):
    old = previous.get(key, {})
    continuous = (old.get("token") == token and 0 <= now-old.get("checked_at", 0) <= MAX_GAP
                  and old.get("idle_since") is not None)
    since = None if active else old["idle_since"] if continuous else now
    return {"token": token, "checked_at": now, "idle_since": since,
            "eligible": since is not None and now-since >= GRACE}


def cleanup_plan(home, chrome, previous, inventory, now):
    actions, idle = [], {}
    if chrome.exists():
        real_directory(chrome)
        for path in sorted(chrome.iterdir()):
            if not path.name.startswith("code_sign_clone."):
                continue
            action = {"rule": "chrome-clones", "path": str(path), "eligible": False}
            try:
                token = chrome_candidate(path, chrome)
                active = busy(path, inventory)
                record = idle_state(previous, str(path), token, now, active)
                idle[str(path)] = record
                old_enough = now - max(path.stat().st_mtime, path.stat().st_ctime) >= GRACE
                if record["eligible"] and old_enough and now-tree_activity(path) < GRACE:
                    record.update(idle_since=now, eligible=False)
                action.update(eligible=record["eligible"] and old_enough, identity=token,
                              reason="open files" if active else "eligible" if record["eligible"] and old_enough else "48-hour grace",
                              idle_since=record["idle_since"])
            except (OSError, ValueError, RuntimeError, plistlib.InvalidFileException) as error:
                action["reason"] = str(error)
            actions.append(action)
    uv_cache = home / ".cache/uv"
    if uv_cache.exists():
        action = {"rule": "uv-prune", "path": str(uv_cache), "eligible": False}
        try:
            real_directory(uv_cache)
            active = busy(uv_cache, inventory, uv=True)
            token = identity(uv_cache)
            record = idle_state(previous, str(uv_cache), token, now, active)
            idle[str(uv_cache)] = record
            # Avoid an expensive tree walk while the cache is in use or in grace.
            if record["eligible"] and not active:
                latest = tree_activity(uv_cache)
                if now-latest < GRACE:
                    record.update(idle_since=now, eligible=False)
            action.update(eligible=record["eligible"] and not active, identity=token,
                          reason="uv or cached tools are running" if active else "eligible" if record["eligible"] else "48-hour whole-cache idle grace",
                          idle_since=record["idle_since"])
        except (OSError, ValueError, RuntimeError) as error:
            action["reason"] = str(error)
        actions.append(action)
    return actions, idle


def execute_action(action, home, chrome, now):
    """Revalidate identity and activity immediately before a narrow operation."""
    path = Path(action["path"])
    if whisper_storage.protected(path, home):
        raise ValueError("Whisper is retained on HomeSSD and excluded from cleanup")
    if not action.get("eligible") or now-(action.get("idle_since") or now) < GRACE:
        raise ValueError("The observed idle grace has not elapsed")
    real_directory(path)
    if identity(path) != action["identity"]:
        raise ValueError("Target changed after inspection")
    inventory = processes()
    if busy(path, inventory, uv=action["rule"] == "uv-prune"):
        raise ValueError("Target is in use")
    if action["rule"] == "chrome-clones":
        if now-tree_activity(path) < GRACE:
            raise ValueError("Clone contents changed within 48 hours")
        if chrome_candidate(path, chrome) != action["identity"]:
            raise ValueError("Clone changed during the open-file check")
        if not shutil.rmtree.avoids_symlink_attacks:
            raise RuntimeError("Python lacks symlink-safe directory removal")
        # rmtree unlinks internal symlinks; it never follows their destinations.
        shutil.rmtree(path)
        if path.exists():
            raise RuntimeError("Clone removal did not complete")
        return "Removed verified inactive Chrome clone"
    if action["rule"] != "uv-prune" or path != home / ".cache/uv":
        raise ValueError("Rule or path is not allowlisted")
    if now-tree_activity(path) < GRACE:
        raise ValueError("Cache was used within 48 hours")
    executable = home / ".local/bin/uv"
    help_text = command([executable, "cache", "prune", "--help"])
    # Older uv lacks the shared cache lock. Require the modern in-use check.
    if "ignoring in-use checks" not in help_text:
        raise ValueError("Update uv before using guarded pruning")
    # Native uv owns its cache. Never remove cache members with rmtree, --ci or --force.
    env = {**os.environ, "UV_LOCK_TIMEOUT": "1", "UV_NO_PROGRESS": "1"}
    result = subprocess.run([str(executable), "--no-config", "--offline", "cache", "prune", "--cache-dir", str(path)],
                            capture_output=True, text=True, timeout=180, env=env, check=False)
    if result.returncode:
        raise RuntimeError(f"uv deferred or failed: {result.stderr.strip()[-400:]}")
    return result.stderr.strip()[-400:] or "Native uv prune completed"


def hazel_health(home, now):
    path = home / ".local/state/development-veil/last-hazel-run.json"
    try:
        data = json.loads(path.read_text())
        stamp = datetime.fromisoformat(data["timestamp"]).timestamp()
        real_hazel = any("hazelworker" in p.get("command", "").lower() for p in data.get("process_ancestry", []))
        healthy = real_hazel and data.get("outcome") == "ok" and data.get("exit_code") in (0, 1) and not data.get("stderr") and 0 <= now-stamp <= MAX_GAP
        return {"healthy": healthy, "last_run": stamp, "reason": "ok" if healthy else "Hazel failed, was not observed, or has been idle for over 12 hours"}
    except (OSError, ValueError, KeyError, TypeError) as error:
        return {"healthy": False, "reason": str(error)}


def add_trends(report, previous):
    old = {x["path"]: x for x in previous.get("items", [])}
    prior_time = previous.get("timestamp", report["timestamp"])
    fresh = 0 < report["timestamp"]-prior_time <= 2*86400
    for item in report["items"]:
        before = old.get(item["path"], {}).get("bytes")
        item["delta_bytes"] = item["bytes"]-before if fresh and item["bytes"] is not None and before is not None else None
    report["comparison_hours"] = round((report["timestamp"]-prior_time)/3600, 1) if previous else None
    report["free_delta_bytes"] = report["free_bytes"]-previous["free_bytes"] if fresh and "free_bytes" in previous else None
    report["alerts"] = []
    if report["free_bytes"] < 60*GB:
        report["alerts"].append("critical: under 30 GB free" if report["free_bytes"] < 30*GB else "warning: under 60 GB free")
    for item in report["items"]:
        if item["status"] == "error":
            report["alerts"].append(f"Scan failed: {item['name']}")
        elif (item.get("delta_bytes") or 0) >= 2*GB:
            report["alerts"].append(f"Grew by {item['delta_bytes']/GB:.1f} GB: {item['name']}")
        elif (item.get("bytes") or 0) > item["budget_bytes"]:
            report["alerts"].append(f"Over review budget: {item['name']}")
    if not report["hazel"]["healthy"]:
        report["alerts"].append(report["hazel"]["reason"])
    if report.get("cad_routing") and not report["cad_routing"]["healthy"]:
        report["alerts"].append("CAD launcher routing changed; restore it before launching CAD")
    if report.get("whisper_routing") and not report["whisper_routing"]["healthy"]:
        report["alerts"].append(report["whisper_routing"]["reason"])
    if report.get("error"):
        report["alerts"].append(report["error"])
    report["notify"] = bool(set(report["alerts"])-set(previous.get("alerts", []))) or (report.get("free_delta_bytes") or 0) <= -5*GB
    return report


def audit(home, previous, maintain=()):
    now = time.time()
    disk = shutil.disk_usage(home)
    report = {"schema_version": 1, "policy_version": POLICY_VERSION, "timestamp": now,
              "free_bytes": disk.free, "items": [], "actions": [], "idle": {},
              "maintenance_rules": sorted(maintain), "executed": [], "hazel": hazel_health(home, now),
              "cad_routing": cad_storage.health(),
              "whisper_routing": whisper_storage.health(home),
              "size_note": "Folder allocations can share APFS blocks. Do not sum overlaps or treat them as recovery."}
    try:
        chrome = clone_root()
        paths = watched_paths(home, chrome)
        with ThreadPoolExecutor(max_workers=2) as pool:
            report["items"] = list(pool.map(measure, paths))
        inventory = processes()
        report["actions"], report["idle"] = cleanup_plan(home, chrome, previous.get("idle", {}), inventory, now)
        # Any incomplete measurement defers every cleanup action.
        complete = not any(item["status"] == "error" for item in report["items"])
        for action in report["actions"]:
            if action["rule"] not in maintain or not action["eligible"] or not complete:
                continue
            before = shutil.disk_usage(home).free
            try:
                detail = execute_action(action, home, chrome, time.time())
                status = "completed"
            except (OSError, ValueError, RuntimeError, subprocess.SubprocessError) as error:
                detail, status = str(error), "deferred"
            report["executed"].append({"path": action["path"], "status": status, "detail": detail,
                                       "observed_free_delta_bytes": shutil.disk_usage(home).free-before})
            report["idle"].pop(action["path"], None)
        report["free_bytes_after"] = shutil.disk_usage(home).free
    except (OSError, ValueError, RuntimeError, subprocess.SubprocessError) as error:
        report["error"] = str(error)
    report["complete"] = not report.get("error") and not any(x["status"] == "error" for x in report["items"])
    return add_trends(report, previous)


def atomic_json(path, value):
    temporary = path.with_name(f".{path.name}.{os.getpid()}.tmp")
    flags = os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_NOFOLLOW
    try:
        fd = os.open(temporary, flags, 0o600)
        with os.fdopen(fd, "w") as stream:
            json.dump(value, stream, sort_keys=True)
            stream.write("\n")
        os.replace(temporary, path)
    finally:
        temporary.unlink(missing_ok=True)


def load_state(path):
    if path.is_symlink():
        raise ValueError("Unsafe storage state symlink")
    if not path.exists():
        return {}
    if path.stat().st_size > 2_000_000:
        raise ValueError("Unsafe or oversized storage state")
    value = json.loads(path.read_text())
    if not isinstance(value, dict):
        raise ValueError("Invalid storage state")
    return value


@contextmanager
def state_lock(directory):
    directory.mkdir(parents=True, exist_ok=True, mode=0o700)
    real_directory(directory)
    fd = os.open(directory / "run.lock", os.O_RDWR | os.O_CREAT | os.O_NOFOLLOW, 0o600)
    try:
        fcntl.flock(fd, fcntl.LOCK_EX | fcntl.LOCK_NB)
        yield
    finally:
        os.close(fd)


def record(report, directory):
    history = load_state(directory / "history.json").get("runs", [])
    history.append({"timestamp": report["timestamp"], "free_bytes": report["free_bytes"],
                    "complete": report["complete"], "sizes": {x["path"]: x["bytes"] for x in report["items"]},
                    "executed": report["executed"]})
    atomic_json(directory / "latest.json", report)
    history = history[-120:]
    while len(json.dumps(history)) > 1_500_000 and len(history) > 1:
        history.pop(0)
    atomic_json(directory / "history.json", {"runs": history})


def summary(report):
    print(f"Internal free: {report['free_bytes']/GB:.1f} GB. Scan: {'complete' if report['complete'] else 'INCOMPLETE'}.")
    print("Grace: 48 observed idle hours; a missed 12-hour check resets the grace.")
    print("Maintenance: " + (", ".join(report["maintenance_rules"]) or "report only"))
    for item in sorted(report["items"], key=lambda x: x.get("bytes") or 0, reverse=True)[:18]:
        size = f"{item['bytes']/GB:.1f} GB" if item["bytes"] is not None else item["status"]
        delta = f" ({item['delta_bytes']/GB:+.1f} GB)" if item.get("delta_bytes") is not None else ""
        print(f"{size:>10}{delta}  {item['path']}  [{item['class']}]")
    for action in report["actions"]:
        print(f"{action['rule']}: {action['reason']} — {action['path']}")
    for alert in report["alerts"]:
        print("Alert: " + alert)


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("mode", choices=["audit", "run", "health"])
    parser.add_argument("--json", action="store_true")
    parser.add_argument("--maintain", default="", help="Approved rules only: chrome-clones,uv-prune. Never implied by disk pressure.")
    args = parser.parse_args(argv)
    rules = set(filter(None, args.maintain.split(",")))
    if rules-RULES or (rules and args.mode != "run"):
        parser.error("Maintenance needs run and an explicit supported rule list")
    try:
        if args.mode == "health":
            report = load_state(STATE / "latest.json")
            healthy = bool(report.get("complete")) and 0 <= time.time()-report.get("timestamp", 0) <= MAX_GAP
            print(json.dumps({"healthy": healthy, "latest": str(STATE / 'latest.json'), "timestamp": report.get("timestamp")}))
            return 0 if healthy else 2
        if args.mode == "run":
            with state_lock(STATE):
                report = audit(Path.home(), load_state(STATE / "latest.json"), rules)
                record(report, STATE)
        else:
            report = audit(Path.home(), load_state(STATE / "latest.json"))
        print(json.dumps(report)) if args.json else summary(report)
        return 0 if report["complete"] else 2
    except (OSError, ValueError, RuntimeError, subprocess.SubprocessError) as error:
        print(json.dumps({"complete": False, "error": str(error)}))
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
