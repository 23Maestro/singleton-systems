#!/usr/bin/env python3
"""Inspect one public source with Firecrawl; preserve evidence without credentials."""
import argparse
import hashlib
import ipaddress
import json
import os
import re
import socket
import stat
import subprocess
import sys
from datetime import datetime, timezone
from html.parser import HTMLParser
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import urljoin, urlsplit
from urllib.request import Request, urlopen

API_URL = "https://api.firecrawl.dev/v2/scrape"
MAX_BYTES = 25 * 1024 * 1024


class InspectionError(ValueError):
    pass


class KeychainSessionError(InspectionError):
    pass


def login_agent_root():
    return Path.home() / "Library/Application Support/Singleton Systems/firecrawl-research"


def public_https(value):
    parts = urlsplit(value)
    host = parts.hostname or ""
    if parts.scheme != "https" or not host or parts.username or parts.password or parts.port not in (None, 443):
        raise InspectionError("Use a public HTTPS source URL without credentials or a custom port.")
    if host.lower() == "localhost" or host.lower().endswith((".localhost", ".local", ".internal")):
        raise InspectionError("Local source URLs are not supported.")
    try:
        if not ipaddress.ip_address(host).is_global:
            raise InspectionError("Private source IP addresses are not supported.")
    except ValueError as error:
        if isinstance(error, InspectionError):
            raise
    return value


def load_key():
    key = os.environ.get("FIRECRAWL_API_KEY", "").strip()
    if not key:
        try:
            result = subprocess.run(
                ["/usr/bin/security", "find-generic-password", "-s",
                 "com.singleton-systems.api-keys.Firecrawl", "-a", "singleton23", "-w"],
                capture_output=True, timeout=10, check=False)
        except (OSError, subprocess.SubprocessError):
            raise InspectionError("Firecrawl credential lookup failed.") from None
        if result.returncode == 36:
            raise KeychainSessionError("Firecrawl Keychain access was denied (security exit 36: user interaction not allowed).")
        key = result.stdout.decode("utf-8", errors="replace").strip() if result.returncode == 0 else ""
    if not re.fullmatch(r"fc-[A-Za-z0-9_-]+", key):
        raise InspectionError("No valid existing Firecrawl credential was found.")
    return key


class Images(HTMLParser):
    def __init__(self, source):
        super().__init__()
        self.source, self.items, self.seen = source, [], set()

    def add(self, url, alt=""):
        url = urljoin(self.source, url)
        try:
            public_https(url)
        except ValueError:
            return
        if url not in self.seen:
            self.seen.add(url)
            self.items.append({"url": url, "alt": alt, "status": "lead_only"})

    def handle_starttag(self, tag, attrs):
        values = dict(attrs)
        if tag == "img":
            for key in ("src", "data-src"):
                if values.get(key):
                    self.add(values[key], values.get("alt", ""))
        if tag == "meta" and values.get("property") == "og:image" and values.get("content"):
            self.add(values["content"])


def page_data(payload):
    data = payload.get("data")
    return data if isinstance(data, dict) else {}


def page_metadata(data):
    metadata = data.get("metadata")
    return metadata if isinstance(metadata, dict) else {}


def assess(payload, expected):
    data = page_data(payload)
    metadata = page_metadata(data)
    status = metadata.get("statusCode")
    text = str(data.get("markdown") or "") + "\n" + str(data.get("html") or "")
    reasons = []
    if payload.get("success") is not True:
        reasons.append("provider_failed")
    if not isinstance(status, int) or not 200 <= status < 300:
        reasons.append("source_status_not_2xx")
    if metadata.get("error"):
        reasons.append("source_error")
    if not text.strip():
        reasons.append("empty_page")
    if re.search(r"^(?:404|403|page not found|access denied|just a moment)\b", str(metadata.get("title", "")), re.I):
        reasons.append("error_page_title")
    for term in expected:
        if term.casefold() not in text.casefold():
            reasons.append("expected_text_missing:" + term)
    return {"status": "failed" if reasons else "passed", "reasons": reasons}


def fetch(url, key):
    body = json.dumps({"url": url, "formats": ["markdown", "html", "links"],
                       "onlyMainContent": False, "timeout": 30000}).encode()
    request = Request(API_URL, data=body, headers={"Authorization": "Bearer " + key,
                                                 "Content-Type": "application/json"})
    try:
        with urlopen(request, timeout=50) as response:
            raw = response.read(MAX_BYTES + 1)
        if len(raw) > MAX_BYTES:
            raise InspectionError("Firecrawl response exceeded the 25 MiB inspection limit.")
        result = json.loads(raw)
        if not isinstance(result, dict):
            raise InspectionError("Firecrawl returned an invalid payload.")
        return result
    except HTTPError as error:
        raise InspectionError(f"Firecrawl API returned HTTP {error.code}.") from None
    except (URLError, TimeoutError, json.JSONDecodeError):
        raise InspectionError("Firecrawl network request or response decoding failed.") from None


def fetch_via_login_agent(url):
    """Use the same Firecrawl endpoint inside the desktop security session."""
    root = login_agent_root()
    address = root / "firecrawl.sock"
    try:
        for path, kind in ((root, stat.S_ISDIR), (address, stat.S_ISSOCK)):
            info = path.lstat()
            if not kind(info.st_mode) or info.st_uid != os.getuid() or info.st_mode & 0o077:
                raise InspectionError("Firecrawl login helper has unsafe ownership or permissions.")
        with socket.socket(socket.AF_UNIX, socket.SOCK_STREAM) as connection:
            connection.settimeout(65)
            connection.connect(str(address))
            connection.sendall(json.dumps({"operation": "scrape", "url": public_https(url)}).encode())
            connection.shutdown(socket.SHUT_WR)
            chunks = bytearray()
            while len(chunks) <= MAX_BYTES:
                part = connection.recv(min(65536, MAX_BYTES + 1 - len(chunks)))
                if not part:
                    break
                chunks.extend(part)
        if len(chunks) > MAX_BYTES:
            raise InspectionError("Firecrawl login response exceeded the 25 MiB limit.")
        response = json.loads(chunks)
        if not isinstance(response, dict):
            raise ValueError("Invalid envelope")
        if response.get("status") != "ok":
            raise InspectionError("Firecrawl login helper could not complete the request: " +
                                  str(response.get("message", "unknown error"))[:300])
        payload = response.get("payload")
        if not isinstance(payload, dict):
            raise ValueError("Invalid payload")
        return payload
    except InspectionError:
        raise
    except (OSError, ValueError):
        raise InspectionError("Firecrawl login helper is unavailable. Run this skill's scripts/install_login_agent.py, then retry. The saved Keychain item has not been changed.") from None


def inspect_url(url):
    try:
        key = load_key()
    except KeychainSessionError:
        return fetch_via_login_agent(url), "login-session"
    return fetch(url, key), "direct"


def write_receipt(args, payload, transport=None):
    stamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%S.%fZ")
    url_hash = hashlib.sha256(args.url.encode()).hexdigest()[:12]
    directory = Path(args.out_dir).expanduser().resolve() / f"{stamp}-{url_hash}"
    directory.mkdir(parents=True, exist_ok=False)
    data = page_data(payload)
    metadata = page_metadata(data)
    files = []
    for key, extension in (("markdown", "md"), ("html", "html"), ("links", "json")):
        value = data.get(key)
        if value:
            content = value if isinstance(value, str) else json.dumps(value, indent=2)
            path = directory / f"page.{extension}"
            path.write_text(content, encoding="utf-8")
            files.append({"path": str(path), "format": key,
                          "sha256": hashlib.sha256(path.read_bytes()).hexdigest()})
    final_url = metadata.get("url") or metadata.get("sourceURL") or args.url
    verdict = assess(payload, args.expect_text)
    try:
        public_https(final_url)
    except ValueError:
        verdict["status"] = "failed"
        verdict["reasons"].append("invalid_final_url")
    parser = Images(final_url if verdict["status"] == "passed" else args.url)
    parser.feed(str(data.get("html") or ""))
    receipt = {"schema_version": 1, "subject": args.subject, "purpose": args.purpose,
               "fetched_at": stamp, "source_url": args.url, "final_url": final_url,
               "source_status": metadata.get("statusCode"), "title": metadata.get("title"),
               "expected_text": args.expect_text, "verdict": verdict, "files": files,
               "image_leads": parser.items, "provider": "firecrawl_v2"}
    if transport is not None:
        receipt["credential_transport"] = transport
    path = directory / "receipt.json"
    path.write_text(json.dumps(receipt, indent=2) + "\n", encoding="utf-8")
    return path, receipt


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--url", required=True)
    parser.add_argument("--subject", required=True)
    parser.add_argument("--purpose", required=True)
    parser.add_argument("--out-dir", required=True)
    parser.add_argument("--expect-text", action="append", default=[])
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args(argv)
    try:
        public_https(args.url)
        if not args.subject.strip() or not args.purpose.strip():
            raise InspectionError("Subject and purpose must be nonempty.")
        if args.check:
            print(json.dumps({"status": "inputs_valid", "source_url": args.url, "subject": args.subject}))
            return 0
        payload, transport = inspect_url(args.url)
        path, receipt = write_receipt(args, payload, transport=transport)
        print(json.dumps({"receipt": str(path), "subject": args.subject, "verdict": receipt["verdict"],
                          "source_status": receipt["source_status"], "image_leads": len(receipt["image_leads"]),
                          "transport": transport}))
        return 0 if receipt["verdict"]["status"] == "passed" else 1
    except (InspectionError, OSError, ValueError) as error:
        print(str(error), file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
