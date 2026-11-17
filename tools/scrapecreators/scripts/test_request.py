"""Credential and request boundary checks; no live credits or real secrets."""
import io
import subprocess
import unittest
from unittest.mock import patch
import request


class AccessTests(unittest.TestCase):
    def test_bad_endpoint_stops_before_credential_access(self):
        with patch.object(request, "credential", side_effect=AssertionError("credential read")):
            for endpoint in ["https://example.com", "//example.com/x", "/v1/youtube/channel?key=x"]:
                with self.assertRaises(request.RequestError):
                    request.request(endpoint, {})

    def test_environment_key_skips_keychain(self):
        with patch.dict(request.os.environ, {"SCRAPECREATORS_API_KEY": "fixture"}), patch.object(request.subprocess, "run") as run:
            self.assertEqual(request.credential(), "fixture")
            run.assert_not_called()

    def test_empty_environment_uses_saved_keychain(self):
        with patch.dict(request.os.environ, {"SCRAPECREATORS_API_KEY": ""}), patch.object(request.subprocess, "run", return_value=subprocess.CompletedProcess([], 0, "fixture\n", "")) as run:
            self.assertEqual(request.credential(), "fixture")
            self.assertIn("com.singleton-systems.scrapecreators", run.call_args.args[0])

    def test_provider_echo_is_redacted(self):
        with patch.object(request, "credential", return_value="fixture-secret"), patch.object(request.urllib.request, "build_opener") as opener:
            opener.return_value.open.return_value = io.BytesIO(b'{"success":true,"echo":"fixture-secret"}')
            self.assertEqual(request.request("/v1/youtube/channel", {})["echo"], "[REDACTED]")

    def test_redirect_cannot_forward_credential(self):
        with self.assertRaises(request.RequestError):
            request.NoRedirect().redirect_request(None, None, 302, "", {}, "https://example.com")


if __name__ == "__main__":
    unittest.main()
