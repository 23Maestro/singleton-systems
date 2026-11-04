#!/usr/bin/env python3
"""Firecrawl-only requests in the macOS desktop login session. No key export."""
import json
import os
import socket
import stat

from inspect_source import InspectionError, MAX_BYTES, fetch, load_key, login_agent_root, public_https

MAX_REQUEST = 8192


def handle_request(raw):
    try:
        if len(raw) > MAX_REQUEST:
            raise InspectionError("Request exceeds 8 KiB.")
        request = json.loads(raw)
        if not isinstance(request, dict):
            raise InspectionError("Use a JSON object.")
        operation = request.get("operation")
        if operation == "health" and set(request) == {"operation"}:
            load_key()
            return {"status": "ok", "ready": True}
        if operation != "scrape" or set(request) != {"operation", "url"}:
            raise InspectionError("Only a public-source scrape is allowed.")
        url = request["url"]
        if not isinstance(url, str) or len(url) > 4096:
            raise InspectionError("Use a public HTTPS URL under 4096 characters.")
        payload = fetch(public_https(url), load_key())
        return {"status": "ok", "payload": payload}
    except InspectionError as error:
        return {"status": "error", "message": str(error)}
    except (ValueError, TypeError):
        return {"status": "error", "message": "Invalid Firecrawl request."}
    except Exception:
        return {"status": "error", "message": "Firecrawl login request failed."}


def serve():
    root = login_agent_root()
    info = root.lstat()
    if not stat.S_ISDIR(info.st_mode) or info.st_uid != os.getuid() or info.st_mode & 0o077:
        raise RuntimeError("Unsafe Firecrawl helper directory")
    os.umask(0o077)
    address = root / "firecrawl.sock"
    if address.exists():
        info = address.lstat()
        if not stat.S_ISSOCK(info.st_mode) or info.st_uid != os.getuid():
            raise RuntimeError("Firecrawl socket belongs to another owner")
        address.unlink()
    with socket.socket(socket.AF_UNIX, socket.SOCK_STREAM) as server:
        server.bind(str(address))
        address.chmod(0o600)
        server.listen(4)
        while True:
            connection, _ = server.accept()
            with connection:
                connection.settimeout(10)
                try:
                    raw = bytearray()
                    while len(raw) <= MAX_REQUEST:
                        part = connection.recv(min(4096, MAX_REQUEST + 1 - len(raw)))
                        if not part:
                            break
                        raw.extend(part)
                    response = json.dumps(handle_request(raw)).encode()
                    if len(response) > MAX_BYTES:
                        response = b'{"status":"error","message":"Firecrawl response exceeds 25 MiB."}'
                    connection.settimeout(10)
                    connection.sendall(response)
                except (OSError, ValueError):
                    pass


if __name__ == "__main__":
    serve()
