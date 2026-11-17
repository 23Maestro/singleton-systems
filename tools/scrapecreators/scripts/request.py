#!/usr/bin/env python3
"""Read public ScrapeCreators data using the saved credential, never print the key."""
import argparse
import json
import os
import re
import subprocess
import sys
import urllib.error
import urllib.parse
import urllib.request


class RequestError(RuntimeError):
    pass


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        raise RequestError("Unexpected provider redirect; request stopped.")


def credential():
    key = os.environ.get("SCRAPECREATORS_API_KEY", "").strip()
    if key:
        return key
    result = subprocess.run(
        ["security", "find-generic-password", "-s", "com.singleton-systems.scrapecreators",
         "-a", "singleton23", "-w"], capture_output=True, text=True, timeout=15)
    if result.returncode or not result.stdout.strip():
        raise RequestError(f"ScrapeCreators Keychain access failed (exit {result.returncode}); the key was not returned.")
    return result.stdout.strip()


def request(endpoint, params, timeout=60):
    if not re.fullmatch(r"/v[1-9][0-9]*/[a-zA-Z0-9_/-]+", endpoint):
        raise RequestError("Use a documented /vN/platform/action endpoint, without a URL or query.")
    if any(k.lower() in {"x-api-key", "api_key", "apikey", "key"} for k in params):
        raise RequestError("Credentials belong in the saved environment or Keychain, never query parameters.")
    key = credential()
    url = "https://api.scrapecreators.com" + endpoint + "?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers={"x-api-key": key})
    try:
        with urllib.request.build_opener(NoRedirect()).open(req, timeout=timeout) as response:
            raw = response.read().decode("utf-8")
        # Redact even an unexpected provider echo before stdout or file writes.
        result = json.loads(raw.replace(key, "[REDACTED]"))
    except urllib.error.HTTPError as error:
        raise RequestError(f"ScrapeCreators returned HTTP {error.code}; no retry was sent.") from None
    except (urllib.error.URLError, TimeoutError, ValueError):
        raise RequestError("ScrapeCreators network, timeout, or JSON failure; no retry was sent.") from None
    if not isinstance(result, dict) or result.get("success") is False:
        raise RequestError("ScrapeCreators returned an unsuccessful response; no retry was sent.")
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("endpoint")
    parser.add_argument("--param", action="append", default=[], metavar="NAME=VALUE")
    args = parser.parse_args()
    params = {}
    for value in args.param:
        if "=" not in value or not value.split("=", 1)[0]:
            parser.error("--param requires NAME=VALUE")
        name, content = value.split("=", 1)
        if name in params:
            parser.error("Duplicate parameter: " + name)
        params[name] = content
    try:
        print(json.dumps(request(args.endpoint, params), ensure_ascii=False))
    except (RequestError, subprocess.TimeoutExpired, FileNotFoundError) as error:
        print(str(error), file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
