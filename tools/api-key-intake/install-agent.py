#!/usr/bin/env python3
import os
import pathlib
import plistlib
import shutil
import subprocess

root = pathlib.Path.home() / "Library/Application Support/Singleton Systems/api-key-intake"
shutil.copyfile(pathlib.Path(__file__).with_name("login-agent.py"), root / "login-agent.py")
(root / "login-agent.py").chmod(0o600)
label = "com.singleton-systems.api-key-intake"
folder = pathlib.Path.home() / "Library/LaunchAgents"
folder.mkdir(exist_ok=True)
target = folder / (label + ".plist")
configuration = {"Label": label,
                 "ProgramArguments": ["/usr/bin/python3", str(root / "login-agent.py")],
                 "RunAtLoad": True, "KeepAlive": True,
                 "StandardOutPath": "/dev/null", "StandardErrorPath": "/dev/null"}
if target.exists():
    existing = plistlib.loads(target.read_bytes())
    if existing.get("ProgramArguments") != configuration["ProgramArguments"]:
        raise RuntimeError("Existing LaunchAgent has a different owner")
target.write_bytes(plistlib.dumps(configuration))
target.chmod(0o600)
domain = "gui/" + str(os.getuid())
loaded = subprocess.run(["/bin/launchctl", "print", domain + "/" + label], capture_output=True)
if loaded.returncode == 0:
    subprocess.run(["/bin/launchctl", "kickstart", "-k", domain + "/" + label], check=True)
else:
    subprocess.run(["/bin/launchctl", "bootstrap", domain, str(target)], check=True)
print("Installed login-session intake agent.")
