#!/usr/bin/env python3
"""Install the Firecrawl-only desktop helper; never alter Keychain access."""
import json
import os
from pathlib import Path
import plistlib
import shutil
import socket
import stat
import subprocess
import time

from inspect_source import login_agent_root

LABEL = "com.singleton-systems.firecrawl-research"


def main():
    root = login_agent_root()
    if root.exists():
        info = root.lstat()
        if not stat.S_ISDIR(info.st_mode) or info.st_uid != os.getuid() or info.st_mode & 0o077:
            raise RuntimeError("Existing Firecrawl directory has unsafe ownership or permissions")
    else:
        root.mkdir(mode=0o700, parents=True)
    source = Path(__file__).resolve().parent
    target = Path.home() / "Library/LaunchAgents" / (LABEL + ".plist")
    configuration = {"Label": LABEL,
                     "ProgramArguments": ["/usr/bin/python3", str(root / "login_agent.py")],
                     "RunAtLoad": True, "KeepAlive": True,
                     "StandardOutPath": "/dev/null", "StandardErrorPath": "/dev/null"}
    if target.exists() and plistlib.loads(target.read_bytes()).get("ProgramArguments") != configuration["ProgramArguments"]:
        raise RuntimeError("Existing Firecrawl LaunchAgent has a different owner")
    for name in ("inspect_source.py", "login_agent.py"):
        shutil.copyfile(source / name, root / name)
        (root / name).chmod(0o600)
    target.parent.mkdir(exist_ok=True)
    target.write_bytes(plistlib.dumps(configuration))
    target.chmod(0o600)
    domain = "gui/" + str(os.getuid())
    identity = domain + "/" + LABEL
    loaded = subprocess.run(["/bin/launchctl", "print", identity], capture_output=True)
    command = ["/bin/launchctl", "kickstart", "-k", identity] if loaded.returncode == 0 else ["/bin/launchctl", "bootstrap", domain, str(target)]
    result = subprocess.run(command, capture_output=True)
    if result.returncode:
        raise RuntimeError("macOS could not start the Firecrawl login helper; installed files are ready, but login-session launch is pending")
    for _ in range(30):
        try:
            with socket.socket(socket.AF_UNIX, socket.SOCK_STREAM) as client:
                client.settimeout(12)
                client.connect(str(root / "firecrawl.sock"))
                client.sendall(b'{"operation":"health"}')
                client.shutdown(socket.SHUT_WR)
                response = json.loads(client.recv(8192))
            if response.get("status") != "ok" or response.get("ready") is not True:
                raise RuntimeError(response.get("message", "Firecrawl health check failed"))
            print(json.dumps({"status": "ready", "label": LABEL, "credential": "available-in-login-session"}))
            return
        except (FileNotFoundError, ConnectionRefusedError):
            time.sleep(0.1)
    raise RuntimeError("Firecrawl login helper did not create its private socket")


if __name__ == "__main__":
    try:
        main()
    except Exception as error:
        raise SystemExit(str(error))
