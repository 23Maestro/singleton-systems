#!/usr/bin/env python3
"""Read existing Codex processes and control socket; never start/stop a server."""
import argparse
import json
import os
from pathlib import Path
import re
import socket
import sqlite3
import subprocess
import sys
import time


def run(args):
    result = subprocess.run(args, capture_output=True, text=True, timeout=20)
    if result.returncode:
        raise RuntimeError(f"{args[0]} failed ({result.returncode})")
    return result.stdout


def process_rows(text):
    rows = {}
    for line in text.splitlines():
        parts = line.split(None, 7)
        if len(parts) == 8:
            pid, ppid = map(int, parts[:2])
            rows[pid] = dict(pid=pid, parent=ppid, started=" ".join(parts[2:7]), command=parts[7])
    return rows


def fd_summary(text):
    result = dict(open_fds=0, highest_fd=None, pipes=0, writer_threads=[])
    numeric = False
    for line in text.splitlines():
        if line.startswith("f"):
            match = re.fullmatch(r"f(\d+)[a-zA-Z]*", line)
            numeric = bool(match)
            if match:
                result["open_fds"] += 1
                result["highest_fd"] = max(result["highest_fd"] or 0, int(match[1]))
        elif numeric and line == "tPIPE":
            result["pipes"] += 1
        elif numeric and line.startswith("n") and "/thread-writer-locks/" in line:
            result["writer_threads"].append(Path(line[1:]).stem)
    return result


def read_control(home):
    # websocket-client is already installed in Jerami's Python; no new server or proxy.
    import websocket
    raw = socket.socket(socket.AF_UNIX)
    raw.settimeout(5)
    try:
        raw.connect(str(home / "app-server-control/app-server-control.sock"))
        # Darwin sys/un.h: SOL_LOCAL=0, LOCAL_PEERPID=2 identifies the actual peer.
        pid = raw.getsockopt(0, 2)
        ws = websocket.create_connection("ws://localhost/", socket=raw, timeout=5)
    except Exception:
        raw.close()
        raise
    serial = 0

    def call(method, params=None):
        nonlocal serial
        serial += 1
        request = dict(id=serial, method=method)
        if params is not None:
            request["params"] = params
        ws.send(json.dumps(request))
        deadline = time.monotonic() + 8
        while time.monotonic() < deadline:
            message = json.loads(ws.recv())
            if message.get("id") == serial:
                if "error" in message:
                    raise RuntimeError(f"{method}: {message['error'].get('code')}")
                return message["result"]
        raise TimeoutError(method)

    try:
        init = call("initialize", {"clientInfo": {"name": "codex_remote_health", "version": "1.0"},
                                   "capabilities": {"experimentalApi": True}})
        ws.send('{"method":"initialized"}')
        remote = call("remoteControl/status/read")
        threads, seen, cursor = [], set(), None
        for _ in range(100):
            page = call("thread/loaded/list", dict(limit=100, cursor=cursor))
            for tid in page["data"]:
                thread = call("thread/read", dict(threadId=tid, includeTurns=False))["thread"]
                threads.append(dict(id=tid, name=thread.get("name"), status=thread["status"]))
            cursor = page.get("nextCursor")
            if not cursor:
                break
            if cursor in seen:
                raise RuntimeError("loaded-thread pagination repeated a cursor")
            seen.add(cursor)
        else:
            raise RuntimeError("loaded-thread inventory exceeded 100 pages")
        return dict(pid=pid, user_agent=init["userAgent"], remote_status=remote["status"],
                    threads=threads, inventory_scope="this control-socket backend only")
    finally:
        ws.close()


ERRORS = {
    "file_exhaustion": "Too many open files",
    "writer_conflict": "already has an active writer",
    "registration_conflict": "Remote app server already online",
    "network_permission": "application network permission was revoked",
}


def native_error_kind(target, body):
    # Only native failure-producing components, not tool-call logs quoting an error.
    if not target.startswith(("codex_thread_store::", "codex_skills_extension::", "codex_rmcp_client::",
                              "codex_app_server_transport::", "codex_app_server::",
                              "codex_core::unified_exec::", "codex_core::exec")):
        return None
    return next((kind for kind, needle in ERRORS.items() if needle in body), None)


def database(home, name):
    return sqlite3.connect(f"file:{home / name}?mode=ro", uri=True, timeout=3)


def recent_errors(home, seconds):
    groups = {}
    with database(home, "logs_2.sqlite") as db:
        rows = db.execute("""SELECT ts, target, feedback_log_body, process_uuid FROM logs
            WHERE ts > ? AND level IN ('WARN','ERROR') AND
            (feedback_log_body LIKE '%Too many open files%' OR
             feedback_log_body LIKE '%already has an active writer%' OR
             feedback_log_body LIKE '%Remote app server already online%' OR
             feedback_log_body LIKE '%application network permission was revoked%')""", (time.time()-seconds,))
        for ts, target, body, process in rows:
            kind = native_error_kind(target, body)
            if kind:
                key = (kind, process)
                entry = groups.setdefault(key, dict(kind=kind, process=process, count=0, last_at=0))
                entry["count"] += 1
                entry["last_at"] = max(entry["last_at"], ts)
    return list(groups.values())


def findings(report):
    result = []
    for error in report["runtime_errors"]:
        result.append(f"{error['kind']}: {error['count']} native errors; last {error['last_at']}; {error['process']}")
    control = report.get("control", {})
    if control:
        if not report["managed"]:
            result.append("Control-socket backend is unmanaged; installed daemon fixes are not active.")
        if control["remote_status"] != "connected":
            result.append(f"Phone Remote on the SSH backend is {control['remote_status']}.")
        if any(p["pid"] != control["pid"] and p["writer_threads"] for p in report["backends"]):
            result.append("Other backends own chats: one Remote connection cannot acquire those writers.")
    result.extend(report["gaps"])
    return result


def collect(home, seconds):
    report = dict(checked_at=int(time.time()), backends=[], control={}, managed=False,
                  runtime_errors=[], active_goals=[], protected_pids=[], gaps=[], mobile_ui="unverified")
    rows = process_rows(run(["ps", "-axo", "pid=,ppid=,lstart=,command="]))
    pid = os.getpid()
    while pid in rows:
        report["protected_pids"].append(pid)
        pid = rows[pid]["parent"]
    for pid, row in rows.items():
        if re.search(r"(?:^|/)codex\s", row["command"]) and re.search(r"\bapp-server\b", row["command"]):
            try:
                row.update(fd_summary(run(["lsof", "-nP", "-p", str(pid), "-Fftn"])))
                report["backends"].append(row)
            except Exception as error:
                report["gaps"].append(f"PID {pid} descriptors unavailable: {error}")
    try:
        report["control"] = read_control(home)
        peer = report["control"]["pid"]
        if peer not in {p["pid"] for p in report["backends"]}:
            report["gaps"].append("Control peer changed or was missing from process inventory; rerun before recovery.")
        record_path = home / "app-server-daemon/app-server.pid"
        if record_path.exists():
            record = json.loads(record_path.read_text())
            report["managed"] = (record.get("pid") == peer and
                                 "--managed-daemon" in rows.get(peer, {}).get("command", ""))
    except Exception as error:
        report["gaps"].append(f"Control-socket inventory unavailable: {type(error).__name__}: {error}")
    try:
        report["runtime_errors"] = recent_errors(home, seconds)
    except Exception as error:
        report["gaps"].append(f"Native logs unavailable: {type(error).__name__}")
    try:
        with database(home, "goals_1.sqlite") as db:
            report["active_goals"] = [r[0] for r in db.execute("SELECT thread_id FROM thread_goals WHERE status='active'")]
    except Exception as error:
        report["gaps"].append(f"Goal inventory unavailable: {type(error).__name__}")
    report["findings"] = findings(report)
    report["result"] = "attention" if report["findings"] else "no_fault_observed"
    report["restart_authorized"] = False
    return report


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--since-minutes", type=int, default=60)
    args = parser.parse_args()
    if not 1 <= args.since_minutes <= 1440:
        parser.error("--since-minutes must be between 1 and 1440")
    try:
        result = collect(Path.home() / ".codex", args.since_minutes * 60)
    except Exception as error:
        result = dict(result="unknown", gaps=[f"{type(error).__name__}: {error}"])
    print(json.dumps(result, indent=2))
    sys.exit(0 if result["result"] == "no_fault_observed" else 2)
