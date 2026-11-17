#!/usr/bin/env python3
"""Install the private expense service without touching existing Serve routes."""
import json
import os
from pathlib import Path
import plistlib
import shutil
import socket
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[2]
LABEL = "com.singleton-systems.expense-review"
PLIST = Path.home() / "Library/LaunchAgents" / (LABEL + ".plist")


def main():
    node = shutil.which("node")
    codex = shutil.which("codex")
    tailscale = shutil.which("tailscale")
    if not all((node, codex, tailscale)) or not (ROOT / ".env.local").is_file():
        raise SystemExit("The Node, Codex, Tailscale or finance configuration is unavailable.")
    serve = json.loads(subprocess.check_output([tailscale, "serve", "status", "--json"], text=True))
    if "8443" in serve.get("TCP", {}):
        raise SystemExit("Tailscale port 8443 is already in use. Existing routes were kept.")
    if PLIST.exists():
        raise SystemExit("The expense service already has a launch file. Review it before changing it.")
    existing = subprocess.run(["launchctl", "print", f"gui/{os.getuid()}/{LABEL}"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    if existing.returncode == 0:
        raise SystemExit("The expense service is already loaded. Review it before changing it.")
    with socket.socket() as probe:
        try:
            probe.bind(("127.0.0.1", 43871))
        except OSError as error:
            raise SystemExit("Loopback port 43871 is already in use.") from error
    environment_path = os.pathsep.join(dict.fromkeys([str(Path(node).parent), str(Path(codex).parent), str(Path(tailscale).parent), "/usr/bin", "/bin", "/usr/sbin", "/sbin"]))
    config = {"Label": LABEL, "ProgramArguments": [node, "--experimental-strip-types", "--env-file=" + str(ROOT / ".env.local"), str(ROOT / "scripts/finance-expense-server.mjs")],
              "WorkingDirectory": str(ROOT), "EnvironmentVariables": {"PATH": environment_path}, "RunAtLoad": True, "KeepAlive": True}
    if sys.argv[1:] != ["--install"]:
        print(f"Ready to install {LABEL} on loopback port 43871 and private Tailscale HTTPS port 8443.")
        return
    PLIST.parent.mkdir(parents=True, exist_ok=True)
    # Exclusive creation avoids overwriting a previously installed service.
    with PLIST.open("xb") as out:
        plistlib.dump(config, out)
    subprocess.run(["launchctl", "bootstrap", f"gui/{os.getuid()}", str(PLIST)], check=True)
    subprocess.run([tailscale, "serve", "--bg", "--https", "8443", "http://127.0.0.1:43871"], check=True)
    print("Expense service installed. Verify the HTTPS endpoint and phone before using it.")


if __name__ == "__main__":
    main()
