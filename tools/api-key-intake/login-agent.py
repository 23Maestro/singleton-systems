#!/usr/bin/env python3
"""Private, write-only intake bridge running in the desktop login session."""
import json
import os
import pathlib
import socket
import stat
import subprocess

root = pathlib.Path.home() / "Library/Application Support/Singleton Systems/api-key-intake"
address = root / "intake.sock"
os.umask(0o077)
if address.exists():
    if not stat.S_ISSOCK(address.lstat().st_mode):
        raise RuntimeError("Intake path is not a socket")
    address.unlink()
server = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
server.bind(str(address))
os.chmod(address, 0o600)
server.listen(4)
environment = dict(os.environ)
environment.pop("SSH_CONNECTION", None)
environment.pop("SSH_CLIENT", None)
while True:
    connection, _ = server.accept()
    with connection:
        connection.settimeout(10)
        try:
            chunks = bytearray()
            while len(chunks) <= 65536:
                chunk = connection.recv(min(4096, 65537 - len(chunks)))
                if not chunk:
                    break
                chunks.extend(chunk)
            if len(chunks) > 65536:
                raise ValueError("Request too large")
            child = subprocess.run([str(root / "api-key-intake"), "--stdin"],
                                   input=chunks, capture_output=True, timeout=12,
                                   env=environment)
            result = json.loads(child.stdout)
            # Only approved metadata can leave the bridge, even on errors.
            safe = {key: result[key] for key in ("status", "name", "service", "account", "message") if key in result}
        except Exception:
            safe = {"status": "error", "message": "Mac intake agent could not complete the request."}
        try:
            connection.sendall(json.dumps(safe).encode())
        except OSError:
            pass
