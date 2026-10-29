import importlib.util
import io
import json
from pathlib import Path
import unittest
import urllib.error

SOURCE = Path(__file__).resolve().parents[1] / "skills/craft-inbox/scripts/craft.py"
spec = importlib.util.spec_from_file_location("craft_client", SOURCE)
craft = importlib.util.module_from_spec(spec)
spec.loader.exec_module(craft)


class FakeOpener:
    def __init__(self, responses):
        self.responses = list(responses)
        self.requests = []

    def open(self, request, timeout):
        self.requests.append(request)
        response = self.responses.pop(0)
        if isinstance(response, Exception):
            raise response
        return io.BytesIO(json.dumps(response).encode())


def connection(space=craft.EXPECTED_SPACE):
    return {"space": {"id": space, "name": "Fixture"}}


class CraftClientTests(unittest.TestCase):
    def test_wrong_space_sends_no_content_request(self):
        opener = FakeOpener([connection("other-space")])
        with self.assertRaisesRegex(craft.CraftError, "expected Craft"):
            craft.Client("https://connect.craft.do/links/fixture/api/v1", opener).request("GET", "/blocks", {"id": "doc"})
        self.assertEqual(len(opener.requests), 1)

    def test_write_requires_deliberate_flag_before_any_network(self):
        opener = FakeOpener([])
        with self.assertRaisesRegex(craft.CraftError, "--write"):
            craft.Client("https://connect.craft.do/links/fixture/api/v1", opener).request("POST", "/blocks", body={})
        self.assertEqual(opener.requests, [])

    def test_block_update_keeps_ids_and_json_body(self):
        opener = FakeOpener([connection(), {"items": [{"id": "stable-id", "markdown": "Next draft"}]}])
        body = {"blocks": [{"id": "stable-id", "markdown": "Next draft"}]}
        result = craft.Client("https://connect.craft.do/links/fixture/api/v1", opener).request("PUT", "/blocks", body=body, write=True)
        self.assertEqual(result["items"][0]["id"], "stable-id")
        self.assertEqual(opener.requests[1].method, "PUT")
        self.assertEqual(json.loads(opener.requests[1].data), body)

    def test_timed_out_insert_is_not_replayed(self):
        opener = FakeOpener([connection(), TimeoutError()])
        with self.assertRaisesRegex(craft.CraftError, "result is unknown"):
            craft.Client("https://connect.craft.do/links/fixture/api/v1", opener).request("POST", "/blocks", body={}, write=True)
        self.assertEqual(len(opener.requests), 2)

    def test_transport_error_does_not_expose_connection(self):
        private = "https://connect.craft.do/links/never-print-this/api/v1"
        error = urllib.error.HTTPError(private, 403, private, {}, None)
        opener = FakeOpener([error])
        with self.assertRaises(craft.CraftError) as caught:
            craft.Client(private, opener).request("GET", "/connection")
        self.assertNotIn("never-print-this", str(caught.exception))

    def test_endpoint_binding_and_path_escape(self):
        self.assertTrue(craft.endpoint_allowed("GET", "/collections/abc123/items"))
        self.assertFalse(craft.endpoint_allowed("GET", "//elsewhere.test"))
        self.assertFalse(craft.endpoint_allowed("GET", "/../blocks"))
        self.assertFalse(craft.endpoint_allowed("POST", "/connection"))

    def test_get_uses_craft_boolean_and_stable_id_query(self):
        opener = FakeOpener([connection(), {"id": "stable-id"}])
        craft.Client("https://connect.craft.do/links/fixture/api/v1", opener).request(
            "GET", "/blocks", {"id": "stable-id", "fetchMetadata": True, "maxDepth": -1})
        self.assertIn("fetchMetadata=true", opener.requests[1].full_url)
        self.assertIn("id=stable-id", opener.requests[1].full_url)

    def test_redirect_is_not_followed(self):
        with self.assertRaisesRegex(craft.CraftError, "redirected"):
            craft.NoRedirect().redirect_request(None, None, 302, "Found", {}, "https://elsewhere.test")


if __name__ == "__main__":
    unittest.main()
