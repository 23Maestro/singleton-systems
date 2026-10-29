#!/usr/bin/env python3
"""Small Craft REST client. Connection URLs stay in macOS Keychain."""
import argparse
import json
from pathlib import Path
import re
import subprocess
import sys
import urllib.error
import urllib.parse
import urllib.request

SERVICE = "com.singleton-systems.craft-inbox.23space"
ACCOUNT = "singleton23"
EXPECTED_SPACE = "f5b0a75f-1553-cc83-3804-f83592a53df1"
INDEX = Path(__file__).resolve().parents[1] / "references/api-index.json"


class CraftError(Exception):
    pass


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        raise CraftError("Craft redirected the request. Check the saved connection.")


def saved_connection():
    result = subprocess.run(
        ["security", "find-generic-password", "-s", SERVICE, "-a", ACCOUNT, "-w"],
        capture_output=True, text=True, timeout=10,
    )
    if result.returncode:
        raise CraftError("The Craft Inbox Keychain connection is unavailable.")
    base = result.stdout.strip().rstrip("/")
    if not re.fullmatch(r"https://connect\.craft\.do/links/[A-Za-z0-9_-]+/api/v1", base):
        raise CraftError("The saved Craft connection has an unexpected URL shape.")
    return base


def endpoint_allowed(method, path):
    if not re.fullmatch(r"/[A-Za-z0-9_/-]+", path) or "//" in path:
        return False
    for row in json.loads(INDEX.read_text()):
        pattern = re.escape(row["path"])
        pattern = re.sub(r"\\\{[^}]+\\\}", r"[A-Za-z0-9_-]+", pattern)
        if row["method"] == method and re.fullmatch(pattern, path):
            return True
    return False


class Client:
    def __init__(self, base, opener=None):
        self.base = base.rstrip("/")
        self.opener = opener or urllib.request.build_opener(NoRedirect())

    def _request(self, method, path, query=None, body=None, accept="application/json"):
        url = self.base + path
        if query:
            def scalar(value):
                return str(value).lower() if isinstance(value, bool) else value
            params = {key: [scalar(v) for v in value] if isinstance(value, list) else scalar(value)
                      for key, value in query.items() if value is not None}
            url += "?" + urllib.parse.urlencode(params, doseq=True)
        data = None if body is None else json.dumps(body, ensure_ascii=False).encode()
        request = urllib.request.Request(url, data=data, method=method, headers={
            "User-Agent": "Mozilla/5.0 SingletonSystemsCraftInbox/0.1",
            "Accept": accept, "Content-Type": "application/json",
        })
        try:
            with self.opener.open(request, timeout=30) as response:
                text = response.read().decode()
                return json.loads(text) if accept == "application/json" else text
        except urllib.error.HTTPError as error:
            suffix = " Read back the target before retrying a write." if method != "GET" else ""
            raise CraftError(f"Craft returned HTTP {error.code}.{suffix}") from None
        except (TimeoutError, urllib.error.URLError, OSError):
            suffix = " Its result is unknown. Read back before retrying." if method != "GET" else ""
            raise CraftError(f"Craft request did not finish.{suffix}") from None
        except (ValueError, UnicodeError):
            raise CraftError("Craft returned an unreadable response. Read back before retrying a write.") from None

    def request(self, method, path, query=None, body=None, write=False, accept="application/json"):
        method = method.upper()
        if not endpoint_allowed(method, path):
            raise CraftError("This method and path are not in the supplied Craft API reference.")
        if method != "GET" and not write:
            raise CraftError("Writes require an authorized request and the --write flag.")
        if method == "GET" and body is not None:
            raise CraftError("Use query parameters for GET requests.")
        connection = self._request("GET", "/connection")
        if connection.get("space", {}).get("id") != EXPECTED_SPACE:
            raise CraftError("The connection is not the expected Craft 23Space. No content request was sent.")
        if method == "GET" and path == "/connection":
            return connection
        return self._request(method, path, query, body, accept)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("method", choices=["GET", "POST", "PUT", "PATCH", "DELETE"])
    parser.add_argument("path")
    parser.add_argument("--query", default="{}", help="JSON object of query parameters")
    parser.add_argument("--body-file", type=Path, help="JSON request body")
    parser.add_argument("--write", action="store_true", help="Use only for the user's authorized mutation")
    parser.add_argument("--markdown", action="store_true", help="Request rendered markdown")
    args = parser.parse_args()
    try:
        query = json.loads(args.query)
        if not isinstance(query, dict):
            raise CraftError("Query parameters must be a JSON object.")
        body = json.loads(args.body_file.read_text()) if args.body_file else None
        output = Client(saved_connection()).request(
            args.method, args.path, query, body, args.write,
            "text/markdown" if args.markdown else "application/json",
        )
        print(output if isinstance(output, str) else json.dumps(output, ensure_ascii=False, indent=2))
    except (CraftError, ValueError, OSError) as error:
        # Do not print transport errors or private connection URLs.
        message = str(error) if isinstance(error, CraftError) else "The local request input could not be read."
        print(json.dumps({"error": message}), file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
