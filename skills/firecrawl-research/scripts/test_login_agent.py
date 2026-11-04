import json
from pathlib import Path
import sys
import unittest
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parent))
import login_agent as agent


class LoginAgentTests(unittest.TestCase):
    def test_key_export_shell_and_extra_fields_are_rejected_before_key_read(self):
        requests = [{"operation": "read-key"}, {"operation": "exec", "command": "id"},
                    {"operation": "scrape", "url": "https://example.com", "headers": {}},
                    {"operation": "health", "name": "other-key"}]
        with patch.object(agent, "load_key", side_effect=AssertionError("key read")):
            for request in requests:
                self.assertEqual(agent.handle_request(json.dumps(request).encode())["status"], "error")

    def test_private_and_invalid_sources_are_rejected_before_key_read(self):
        with patch.object(agent, "load_key", side_effect=AssertionError("key read")):
            for url in ("http://example.com", "https://127.0.0.1", "https://localhost", [], "x" * 4097):
                result = agent.handle_request(json.dumps({"operation": "scrape", "url": url}).encode())
                self.assertEqual(result["status"], "error")

    def test_health_never_returns_the_key(self):
        with patch.object(agent, "load_key", return_value="fc-disposable-secret"):
            response = agent.handle_request(b'{"operation":"health"}')
        self.assertEqual(response, {"status": "ok", "ready": True})
        self.assertNotIn("fc-disposable-secret", json.dumps(response))

    def test_scrape_returns_only_provider_result(self):
        payload = {"success": True, "data": {"markdown": "Public source"}}
        with patch.object(agent, "load_key", return_value="fc-disposable-secret"), \
             patch.object(agent, "fetch", return_value=payload) as fetch:
            result = agent.handle_request(b'{"operation":"scrape","url":"https://example.com"}')
        fetch.assert_called_once_with("https://example.com", "fc-disposable-secret")
        self.assertEqual(result, {"status": "ok", "payload": payload})
        self.assertNotIn("fc-disposable-secret", json.dumps(result))

    def test_bad_json_and_large_requests_fail_closed(self):
        with patch.object(agent, "load_key", side_effect=AssertionError("key read")):
            for raw in (b"not json", b"[]", b"x" * 8193):
                self.assertEqual(agent.handle_request(raw)["status"], "error")

    def test_unexpected_exception_does_not_leak_its_text(self):
        with patch.object(agent, "load_key", side_effect=RuntimeError("fc-disposable-secret")):
            result = agent.handle_request(b'{"operation":"health"}')
        self.assertEqual(result, {"status": "error", "message": "Firecrawl login request failed."})


if __name__ == "__main__":
    unittest.main()
