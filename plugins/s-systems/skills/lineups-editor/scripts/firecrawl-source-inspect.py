#!/usr/bin/env python3
"""Inspect one recorded Lineups source-page lead without exposing its API key."""
import argparse
import hashlib
import ipaddress
import json
import os
import re
import subprocess
import sys
import tempfile
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from html.parser import HTMLParser
from pathlib import Path

API_URL = "https://api.firecrawl.dev/v2/scrape"
KEYCHAIN_SERVICE = "com.singleton-systems.api-keys.Firecrawl"
KEYCHAIN_ACCOUNT = "singleton23"


class InspectionError(ValueError):
    pass


def sha256(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def read_json(path):
    try:
        value = json.loads(path.read_text())
        if not isinstance(value, dict):
            raise ValueError()
        return value
    except (OSError, ValueError):
        raise InspectionError("Required episode JSON is missing or invalid.") from None


def find_repo(cwd):
    for root in (Path(cwd).resolve(), *Path(cwd).resolve().parents):
        if (root / "CODEX.md").is_file() and (root / "config/lineups").is_dir():
            return root
    raise InspectionError("Run this operation from the Singleton Systems repository.")


def public_https(url):
    if not isinstance(url, str):
        raise InspectionError("Source URL must be a public HTTPS page.")
    try:
        parsed = urllib.parse.urlsplit(url)
        host = (parsed.hostname or "").lower()
        if (parsed.scheme != "https" or not host or parsed.username or parsed.password
                or parsed.port not in (None, 443) or parsed.fragment
                or host == "localhost" or host.endswith((".localhost", ".local"))
                or any(ord(c) < 33 for c in url)):
            raise ValueError()
        try:
            address = ipaddress.ip_address(host)
        except ValueError:
            if "." not in host:
                raise InspectionError("Source URL must be a public HTTPS page.")
        else:
            if not address.is_global:
                raise ValueError()
    except ValueError:
        raise InspectionError("Source URL must be a public HTTPS page.") from None
    return url


def validate_request(request_path, repo_root):
    root = Path(repo_root).resolve()
    path = Path(request_path).resolve()
    request = read_json(path)
    episode_id = request.get("episodeId", "")
    if not isinstance(episode_id, str) or not re.fullmatch(r"[a-z0-9][a-z0-9-]{1,120}", episode_id):
        raise InspectionError("Invalid episode ID.")
    episode = root / "config/lineups/episodes" / episode_id
    directory = episode / "storyboard/asset-search"
    if directory.resolve() != directory or path.parent != directory or not path.name.endswith(".request.json"):
        raise InspectionError("Request must be inside this episode's storyboard/asset-search directory.")
    if request.get("schemaVersion") != 1:
        raise InspectionError("Unsupported asset-search request schema.")
    cue_path = episode / "storyboard/cue-map.json"
    search_path = episode / "google-asset-search.json"
    for field, source in (("cueMapSha256", cue_path), ("searchEvidenceSha256", search_path)):
        if not source.is_file() or request.get(field) != sha256(source):
            raise InspectionError("Stale asset-search request: refresh the cue-map and search evidence hashes.")
    cue_map, search = read_json(cue_path), read_json(search_path)
    if cue_map.get("episodeId") != episode_id or search.get("episodeId") != episode_id:
        raise InspectionError("Episode evidence belongs to a different episode.")
    scene = next((s for s in cue_map.get("candidates", []) if s.get("id") == request.get("sceneId")), None)
    if not scene or scene.get("assetSearch", {}).get("status") != "needed":
        raise InspectionError("Scene has no current missing-asset request.")
    index = request.get("assetIndex")
    assets = scene.get("assetRequests", [])
    if type(index) is not int or not 0 <= index < len(assets):
        raise InspectionError("Asset index is not in the scene's missing-asset requests.")
    asset = assets[index]
    if request.get("query") != asset.get("query"):
        raise InspectionError("Search query does not match the proposed scene asset.")
    url = public_https(request.get("sourceUrl"))
    leads = [lead for query in search.get("queries", []) if query.get("query") == asset["query"]
             for lead in query.get("results", [])]
    if not any(lead.get("sourcePage") == url for lead in leads):
        raise InspectionError("Source URL is not a recorded Google lead for this asset.")
    receipt_path = path.with_name(path.name.replace(".request.json", ".receipt.json"))
    if receipt_path.is_symlink():
        raise InspectionError("Receipt destination cannot be a symlink.")
    return request, asset, receipt_path


def load_key():
    try:
        result = subprocess.run(
            ["/usr/bin/security", "find-generic-password", "-s", KEYCHAIN_SERVICE,
             "-a", KEYCHAIN_ACCOUNT, "-w"], capture_output=True, timeout=10, check=False)
    except (OSError, subprocess.SubprocessError):
        raise InspectionError("Firecrawl Keychain lookup failed.") from None
    key = result.stdout.decode("utf-8", errors="replace").strip()
    if result.returncode or not re.fullmatch(r"fc-[A-Za-z0-9_-]+", key):
        raise InspectionError("Firecrawl key is missing or invalid in macOS Keychain.")
    return key


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


def scrape(url, key):
    request = urllib.request.Request(API_URL, method="POST", data=json.dumps({
        "url": url, "formats": ["markdown", "html"], "onlyMainContent": True,
        "timeout": 30000,
    }).encode(), headers={"Authorization": "Bearer " + key, "Content-Type": "application/json"})
    try:
        with urllib.request.build_opener(NoRedirect()).open(request, timeout=45) as response:
            body = response.read(8 * 1024 * 1024 + 1)
        if len(body) > 8 * 1024 * 1024:
            raise InspectionError("Firecrawl response exceeded the evidence size limit.")
        # Scrub before parsing or retaining any returned content.
        value = json.loads(body.decode().replace(key, "[REDACTED]"))
    except urllib.error.HTTPError as error:
        raise InspectionError("Firecrawl HTTP " + str(error.code) + "; no automatic retry.") from None
    except (urllib.error.URLError, TimeoutError, OSError):
        raise InspectionError("Firecrawl request failed or timed out; no automatic retry.") from None
    except (UnicodeError, ValueError):
        raise InspectionError("Firecrawl returned invalid JSON.") from None
    if not isinstance(value, dict) or value.get("success") is not True or not isinstance(value.get("data"), dict):
        raise InspectionError("Firecrawl did not return a successful source-page inspection.")
    data = value["data"]
    if not isinstance(data.get("metadata"), dict) or data["metadata"].get("statusCode") != 200:
        raise InspectionError("Source page did not return HTTP 200.")
    return data


class Images(HTMLParser):
    def __init__(self, source):
        super().__init__()
        self.source, self.images, self.seen = source, [], set()

    def add(self, url, alt=""):
        url = urllib.parse.urljoin(self.source, url)
        try:
            public_https(url)
        except InspectionError:
            return
        if url not in self.seen and len(self.images) < 100:
            self.seen.add(url)
            self.images.append({"url": url, "captionOrAlt": alt[:1000], "selectionStatus": "lead-only"})

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "img":
            for field in ("src", "data-src"):
                if attrs.get(field):
                    self.add(attrs[field], attrs.get("alt", ""))
            remaining = attrs.get("srcset", "")
            while remaining.strip(" \t\n\r\f,"):
                # URLs may contain commas (including Cloudinary transforms).
                # Collect the URL through whitespace, then consume its descriptor.
                remaining = remaining.lstrip(" \t\n\r\f,")
                parts = remaining.split(None, 1)
                url = parts[0]
                remaining = parts[1] if len(parts) == 2 else ""
                self.add(url.rstrip(","), attrs.get("alt", ""))
                if not url.endswith(","):
                    remaining = remaining.partition(",")[2]
        if tag == "meta" and attrs.get("property") == "og:image" and attrs.get("content"):
            self.add(attrs["content"])


def evidence(data, source, asset):
    images = Images(source)
    images.feed(str(data.get("html", "")))
    markdown = str(data.get("markdown", ""))
    for alt, url in re.findall(r"!\[([^\]]*)\]\((https://[^\s)]+)\)", markdown):
        images.add(url, alt)
    metadata = data.get("metadata", {})
    for field in ("ogImage", "image"):
        if isinstance(metadata.get(field), str):
            images.add(metadata[field])
    terms = [word.lower() for word in asset["asset"].split() if len(word) > 3 and word.lower() not in ("action", "photo")]
    snippets = [line[:1200] for line in markdown.splitlines() if line.strip() and (
        any(term in line.lower() for term in terms) or re.search(r"credit|copyright|©|photos|\b20\d\d\b", line, re.I))][:40]
    return {"metadata": {k: v for k, v in metadata.items() if k.lower() in (
        "title", "description", "sourceurl", "url", "statuscode", "publishedtime", "modifiedtime",
        "article:published_time", "article:modified_time", "author", "copyright", "language")},
        "imageCandidates": images.images, "sourceExcerpts": snippets,
        "contentSha256": hashlib.sha256(json.dumps(data, sort_keys=True).encode()).hexdigest(),
        "selectionStatus": "lead-only", "assetSearchStatus": "needed",
        "contentTrust": "untrusted source material; verify image, date, team context and credit before selection"}


def inspect(request_path, repo_root, check=False):
    request_hash = sha256(Path(request_path))
    request, asset, receipt_path = validate_request(request_path, repo_root)
    if check:
        return {"status": "validated", "episodeId": request["episodeId"], "sceneId": request["sceneId"]}
    if receipt_path.exists():
        raise InspectionError("Receipt already exists. Read it or use a new request filename for a deliberate retry.")
    key = load_key()
    data = scrape(request["sourceUrl"], key)
    # Recheck bindings after the remote call before retaining its evidence.
    validate_request(request_path, repo_root)
    if sha256(Path(request_path)) != request_hash:
        raise InspectionError("Request changed during inspection; evidence was not saved.")
    receipt = {"schemaVersion": 1, "provider": "Firecrawl", "operation": "source-page-inspection",
        "status": "passed", "inspectedAt": datetime.now(timezone.utc).isoformat(),
        "request": request, "requestSha256": request_hash, "asset": asset,
        **evidence(data, request["sourceUrl"], asset)}
    serialized = json.dumps(receipt, indent=2).replace(key, "[REDACTED]") + "\n"
    temp_path = None
    try:
        with tempfile.NamedTemporaryFile(mode="w", dir=receipt_path.parent, delete=False) as handle:
            temp_path = Path(handle.name)
            handle.write(serialized)
        # Exclusive publication preserves an existing receipt, including racing runs.
        os.link(temp_path, receipt_path)
    finally:
        if temp_path:
            temp_path.unlink(missing_ok=True)
    return {"status": "passed", "receiptPath": str(receipt_path), "receiptSha256": sha256(receipt_path),
        "imageCandidateCount": len(receipt["imageCandidates"]), "selectionStatus": "lead-only"}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--request", required=True)
    parser.add_argument("--check", action="store_true", help="Validate bindings without Keychain or network access")
    args = parser.parse_args()
    try:
        result = inspect(Path(args.request), find_repo(Path.cwd()), check=args.check)
    except (InspectionError, OSError) as error:
        print(json.dumps({"status": "blocked", "reason": str(error)}))
        return 1
    print(json.dumps(result))
    return 0


if __name__ == "__main__":
    sys.exit(main())
