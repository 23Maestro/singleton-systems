#!/usr/bin/env python3
"""One approved, idle-only handover, followed by ChatGPT quit/reopen. No retries."""
import argparse
import fcntl
import importlib.util
import json
import os
from pathlib import Path
import signal
import socket
import subprocess
import time

spec = importlib.util.spec_from_file_location("health", Path(__file__).with_name("codex-remote-health.py"))
health = importlib.util.module_from_spec(spec)
spec.loader.exec_module(health)
HOME = Path.home() / ".codex"
STATE = Path.home() / ".local/state/codex-remote-reliability"


def atomic_json(path, value):
    temp = path.with_suffix(path.suffix + ".new")
    temp.write_text(json.dumps(value, indent=2) + "\n")
    temp.chmod(0o600)
    temp.replace(path)


def identity(pid):
    return health.process_rows(health.run(["ps", "-axo", "pid=,ppid=,lstart=,command="])).get(pid)


def matches(actual, expected):
    return actual is not None and all(actual[k] == expected[k] for k in ["pid", "started", "command"])


def blockers(report, expected):
    reasons = list(report["gaps"])
    if report.get("control", {}).get("pid") != expected["pid"]:
        reasons.append("Control-socket peer changed")
    for t in report.get("control", {}).get("threads", []):
        if t["status"]["type"] != "idle":
            reasons.append(f"Chat is not idle: {t['id']}")
    if report["active_goals"]:
        reasons.append("An active goal remains")
    return reasons


def remote_preference(pid, enabled, ephemeral):
    import websocket
    raw = socket.socket(socket.AF_UNIX)
    raw.settimeout(5)
    raw.connect(str(HOME / "app-server-control/app-server-control.sock"))
    if raw.getsockopt(0, 2) != pid:
        raw.close()
        raise RuntimeError("Remote preference peer changed")
    ws = websocket.create_connection("ws://localhost/", socket=raw, timeout=5)
    try:
        calls = [("initialize", {"clientInfo": {"name": "codex_remote_recovery", "version": "1.0"},
                                 "capabilities": {"experimentalApi": True}}),
                 ("remoteControl/enable" if enabled else "remoteControl/disable", {"ephemeral": ephemeral})]
        for i, (method, params) in enumerate(calls, 1):
            ws.send(json.dumps(dict(id=i, method=method, params=params)))
            deadline = time.monotonic() + 10
            while time.monotonic() < deadline:
                reply = json.loads(ws.recv())
                if reply.get("id") == i:
                    if "error" in reply:
                        raise RuntimeError(f"{method} failed: {reply['error'].get('code')}")
                    break
            else:
                raise TimeoutError(method)
            if i == 1:
                ws.send('{"method":"initialized"}')
    finally:
        ws.close()


def desktop_idle(report, old_pid):
    with health.database(HOME, "thread_history_1.sqlite") as db:
        for backend in report["backends"]:
            if backend["pid"] == old_pid:
                continue
            for tid in backend["writer_threads"]:
                latest = db.execute("SELECT status FROM thread_turns WHERE thread_id=? ORDER BY started_at DESC LIMIT 1", (tid,)).fetchone()
                if latest is None or latest[0] not in ["completed", "interrupted", "failed"]:
                    raise RuntimeError(f"Another backend has unfinished or unknown work: {tid}")


def wait_exit(expected, seconds):
    for _ in range(seconds * 2):
        current = identity(expected["pid"])
        if current is None:
            return
        if not matches(current, expected):
            raise RuntimeError("PID was reused; no further signals sent")
        time.sleep(0.5)
    raise RuntimeError(f"PID {expected['pid']} did not exit; no forced kill attempted")


def handover(args):
    STATE.mkdir(parents=True, exist_ok=True, mode=0o700)
    with (STATE / "handover.lock").open("a") as lock:
        fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        plan = json.loads(Path(args.plan).read_text())
        expected, desktop = plan["backend"], plan["desktop"]
        cli = HOME / "packages/app-server-daemon/current/bin/codex"
        if health.run([str(cli), "--version"]).strip() != "codex-cli 0.163.0":
            raise RuntimeError("Prepared package version changed")
        if not matches(identity(expected["pid"]), expected) or not matches(identity(desktop["pid"]), desktop):
            raise RuntimeError("Approved process identity changed; recheck before handover")
        status = dict(status="checking", started_at=int(time.time()), old_pid=expected["pid"], mobile_ui="unverified")
        status_path = STATE / "handover-status.json"

        def record(state, **details):
            status.update(status=state, updated_at=int(time.time()), **details)
            atomic_json(status_path, status)

        if not args.apply:
            report = health.collect(HOME, 60)
            print(json.dumps(dict(plan=plan, blockers=blockers(report, expected), dry_run=True), indent=2))
            return
        app_closed = False
        try:
            deadline = time.monotonic() + 7200
            while time.monotonic() < deadline:
                if not matches(identity(expected["pid"]), expected) or not matches(identity(desktop["pid"]), desktop):
                    raise RuntimeError("Process identity changed while waiting")
                report = health.collect(HOME, 60)
                pending = blockers(report, expected)
                record("waiting_for_idle", waiting=pending)
                if not pending:
                    desktop_idle(report, expected["pid"])
                    # Two snapshots reduce the chance of crossing a newly started turn.
                    time.sleep(3)
                    if not blockers(health.collect(HOME, 60), expected):
                        break
                time.sleep(10)
            else:
                raise TimeoutError("Idle window did not arrive within 2 hours; nothing stopped")

            record("quitting_chatgpt", waiting=[])
            # Persist off through the native API. The managed daemon will opt in separately.
            remote_preference(expected["pid"], False, False)
            if not matches(identity(desktop["pid"]), desktop):
                raise RuntimeError("ChatGPT identity changed")
            quit_result = subprocess.run(["osascript", "-e", 'tell application id "com.openai.codex" to quit'],
                                         capture_output=True, text=True, timeout=20)
            if quit_result.returncode:
                if not matches(identity(desktop["pid"]), desktop):
                    raise RuntimeError("ChatGPT identity changed during quit")
                os.kill(desktop["pid"], signal.SIGTERM)
            app_closed = True
            wait_exit(desktop, 30)
            fresh = health.collect(HOME, 60)
            if blockers(fresh, expected):
                raise RuntimeError("Work became active or inventory failed after app quit")
            if not matches(identity(expected["pid"]), expected):
                raise RuntimeError("SSH backend identity changed")
            if expected["pid"] in fresh["protected_pids"]:
                raise RuntimeError("Recovery must run independently of the old backend")
            settings_path = HOME / "app-server-daemon/settings.json"
            settings = json.loads(settings_path.read_text()) if settings_path.exists() else {}
            atomic_json(STATE / "daemon-settings-before.json", dict(existed=settings_path.exists(), settings=settings))
            settings.setdefault("updater", {})["autoUpdateEnabled"] = False
            settings.setdefault("featureOverrides", {})["code_mode_host"] = True
            settings["shutdownGraceSeconds"] = 60
            atomic_json(settings_path, settings)
            record("replacing_backend")
            os.kill(expected["pid"], signal.SIGTERM)
            wait_exit(expected, 30)
            result = subprocess.run([str(cli), "app-server", "daemon", "bootstrap", "--remote-control"],
                                    capture_output=True, text=True, timeout=60)
            if result.returncode:
                raise RuntimeError("Managed bootstrap failed; no replacement process was killed: " + result.stderr[-600:])
            record("verifying_backend", bootstrap=json.loads(result.stdout))
            control = health.read_control(HOME)
            new_pid = control["pid"]
            if "0.163.0" not in control["user_agent"] or new_pid == expected["pid"]:
                raise RuntimeError("The expected new backend did not take ownership")
            # Keep local desktop auto-registration off while this daemon stays enabled.
            remote_preference(new_pid, False, False)
            remote_preference(new_pid, True, True)
            for _ in range(20):
                control = health.read_control(HOME)
                if control["remote_status"] == "connected":
                    break
                time.sleep(1)
            record("reopening_chatgpt", new_pid=new_pid, remote_status=control["remote_status"])
            health.run(["open", "-a", "/Applications/ChatGPT.app"])
            app_closed = False
            time.sleep(8)
            final = health.collect(HOME, 60)
            atomic_json(STATE / "handover-after.json", final)
            good = (final.get("managed") and final.get("control", {}).get("pid") == new_pid
                    and final["control"]["remote_status"] == "connected")
            record("backend_recovered_mobile_unverified" if good else "verification_needed",
                   new_pid=new_pid, remote_status=final.get("control", {}).get("remote_status"),
                   report=str(STATE / "handover-after.json"))
        except Exception as error:
            record("blocked", error=f"{type(error).__name__}: {error}")
            raise
        finally:
            if app_closed:
                subprocess.run(["open", "-a", "/Applications/ChatGPT.app"], timeout=20, check=False)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--plan", required=True)
    parser.add_argument("--apply", action="store_true")
    handover(parser.parse_args())
