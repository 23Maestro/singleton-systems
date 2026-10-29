import importlib.util
import io
import json
import shlex
import subprocess
import tempfile
import unittest
import urllib.error
from pathlib import Path
from unittest.mock import Mock, patch

ROOT = Path(__file__).resolve().parents[1]
SCRIPT = ROOT / "plugins/s-systems/skills/lineups-editor/scripts/firecrawl-source-inspect.py"
LEGACY_SCRIPT = ROOT / "plugins/s-systems/skills/client-video-storyboard/scripts/firecrawl-source-inspect.py"


def module_at(name, path):
    spec = importlib.util.spec_from_file_location(name, path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


helper = module_at("asset_search", SCRIPT)
guard = module_at("cerebral_guard", ROOT / ".codex/hooks/cerebral_singleton_guard.py")


class AssetSearchTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name).resolve()
        bundled_script = self.root / SCRIPT.relative_to(ROOT)
        bundled_script.parent.mkdir(parents=True)
        bundled_script.write_text(SCRIPT.read_text())
        legacy_script = self.root / LEGACY_SCRIPT.relative_to(ROOT)
        legacy_script.parent.mkdir(parents=True, exist_ok=True)
        legacy_script.write_text(LEGACY_SCRIPT.read_text())
        self.episode = self.root / "config/lineups/episodes/test-week-6"
        self.directory = self.episode / "storyboard/asset-search"
        self.directory.mkdir(parents=True)
        self.url = "https://www.example.com/huntley"
        self.query = "Tyler Huntley Baltimore Ravens 2026 week 6 action photo"
        self.cue = self.episode / "storyboard/cue-map.json"
        self.google = self.episode / "google-asset-search.json"
        self.cue.write_text(json.dumps({"episodeId": "test-week-6", "candidates": [{
            "id": "R02", "assetSearch": {"status": "needed"},
            "assetRequests": [{"asset": "Tyler Huntley action photo", "query": self.query}]}]}))
        self.google.write_text(json.dumps({"episodeId": "test-week-6", "queries": [{
            "query": self.query, "results": [{"sourcePage": self.url}]}]}))
        self.request = {"schemaVersion": 1, "episodeId": "test-week-6", "sceneId": "R02",
            "assetIndex": 0, "query": self.query, "sourceUrl": self.url,
            "cueMapSha256": helper.sha256(self.cue), "searchEvidenceSha256": helper.sha256(self.google)}
        self.path = self.directory / "R02-source.request.json"
        self.write_request()

    def write_request(self):
        self.path.write_text(json.dumps(self.request))

    def hook_error(self, args=None):
        command = "python3 " + shlex.quote(str(SCRIPT)) + " " + (args or "--request " + shlex.quote(str(self.path)))
        with patch.object(guard, "repo_root_from", return_value=str(self.root)):
            return guard.lineups_asset_search_error({"tool_name": "Bash", "cwd": str(self.root),
                "tool_input": {"command": command}})

    def test_valid_hook_and_dry_run_never_read_key_or_network(self):
        self.assertIsNone(self.hook_error())
        with patch.object(helper, "load_key") as key, patch.object(helper, "scrape") as api:
            self.assertEqual(helper.inspect(self.path, self.root, check=True)["status"], "validated")
            key.assert_not_called()
            api.assert_not_called()

    def test_stale_wrong_asset_and_unrelated_url_block_before_key_or_network(self):
        changes = ({"cueMapSha256": "stale"}, {"searchEvidenceSha256": "stale"},
            {"sceneId": "other"}, {"assetIndex": -1}, {"assetIndex": True},
            {"query": "unrelated"}, {"sourceUrl": "https://www.example.com/unrelated"},
            {"sourceUrl": "https://127.0.0.1/test"}, {"sourceUrl": "https://user:pass@example.com"})
        original = dict(self.request)
        for change in changes:
            with self.subTest(change=change):
                self.request = {**original, **change}
                self.write_request()
                self.assertIn("blocked", self.hook_error())
                with patch.object(helper, "load_key") as key, patch.object(helper, "scrape") as api:
                    with self.assertRaises(helper.InspectionError):
                        helper.inspect(self.path, self.root)
                    key.assert_not_called()
                    api.assert_not_called()

    def test_outside_episode_and_symlink_destinations_block(self):
        outside = self.root / "outside.request.json"
        outside.write_text(self.path.read_text())
        with self.assertRaises(helper.InspectionError):
            helper.validate_request(outside, self.root)
        self.path.with_name("R02-source.receipt.json").symlink_to(outside)
        with self.assertRaises(helper.InspectionError):
            helper.validate_request(self.path, self.root)

    def test_hook_rejects_unbound_or_compound_invocation(self):
        self.assertIn("requires one", self.hook_error("--url https://www.example.com"))
        self.assertIn("requires one", self.hook_error("--request " + str(self.path) + " && echo after"))
        self.assertIsNone(guard.lineups_asset_search_error({"tool_name": "Bash", "tool_input": {
            "command": "sed -n '1,30p' " + str(SCRIPT)}}))

    def test_main_hook_blocks_before_runtime_registry_lookup(self):
        self.request["cueMapSha256"] = "stale"
        self.write_request()
        payload = {"hook_event_name": "PreToolUse", "tool_name": "Bash", "cwd": str(self.root),
            "tool_input": {"command": "python3 " + str(SCRIPT) + " --request " + str(self.path)}}
        with patch.object(guard, "in_repo", return_value=True), patch.object(guard, "repo_root_from", return_value=str(self.root)), \
                patch.object(guard, "read_input", return_value=payload), patch.object(guard, "load_runtime_skills") as registry, \
                patch("sys.stdout", new_callable=io.StringIO) as stdout:
            guard.main()
            self.assertFalse(json.loads(stdout.getvalue())["continue"])
            registry.assert_not_called()

    def data(self, key=""):
        return {"metadata": {"statusCode": 200, "title": "Huntley", "description": key},
            "html": '<img src="https://images.example.com/huntley.jpg" alt="QB Tyler Huntley">',
            "markdown": "Oct 12, 2026\nShawn Hubbard / Baltimore Ravens Photos\n" + key}

    def test_success_retains_leads_scrubs_key_and_blocks_repeat_spend(self):
        key = "fc-disposable-test"
        with patch.object(helper, "load_key", return_value=key), patch.object(helper, "scrape", return_value=self.data(key)):
            result = helper.inspect(self.path, self.root)
        receipt = Path(result["receiptPath"])
        self.assertNotIn(key, receipt.read_text())
        value = json.loads(receipt.read_text())
        self.assertEqual(value["requestSha256"], helper.sha256(self.path))
        self.assertEqual(value["selectionStatus"], "lead-only")
        self.assertEqual(value["assetSearchStatus"], "needed")
        self.assertEqual(value["imageCandidates"][0]["captionOrAlt"], "QB Tyler Huntley")
        with patch.object(helper, "load_key") as lookup:
            with self.assertRaisesRegex(helper.InspectionError, "Receipt already"):
                helper.inspect(self.path, self.root)
            lookup.assert_not_called()

    def test_request_changed_during_call_leaves_no_receipt(self):
        def changed(*args):
            self.request["extra"] = "changed"
            self.write_request()
            return self.data()
        with patch.object(helper, "load_key", return_value="fc-test"), patch.object(helper, "scrape", side_effect=changed):
            with self.assertRaisesRegex(helper.InspectionError, "changed during"):
                helper.inspect(self.path, self.root)
        self.assertFalse(self.path.with_name("R02-source.receipt.json").exists())

    def test_keychain_uses_fixed_service_without_key_in_argv(self):
        with patch.object(helper.subprocess, "run", return_value=subprocess.CompletedProcess([], 0, b"fc-test\n", b"")) as run:
            self.assertEqual(helper.load_key(), "fc-test")
            self.assertEqual(run.call_args.args[0], ["/usr/bin/security", "find-generic-password", "-s",
                "com.singleton-systems.api-keys.Firecrawl", "-a", "singleton23", "-w"])

    def test_transport_fixed_origin_redaction_timeout_and_no_redirect(self):
        key = "fc-test"
        response = Mock()
        response.read.return_value = json.dumps({"success": True, "data": self.data(key)}).encode()
        response.__enter__ = Mock(return_value=response)
        response.__exit__ = Mock(return_value=False)
        opener = Mock()
        opener.open.return_value = response
        with patch.object(helper.urllib.request, "build_opener", return_value=opener):
            data = helper.scrape(self.url, key)
        self.assertNotIn(key, json.dumps(data))
        request = opener.open.call_args.args[0]
        self.assertEqual(request.full_url, "https://api.firecrawl.dev/v2/scrape")
        self.assertEqual(request.get_header("Authorization"), "Bearer " + key)
        self.assertNotIn(key, request.data.decode())
        self.assertEqual(opener.open.call_args.kwargs["timeout"], 45)
        self.assertIsNone(helper.NoRedirect().redirect_request(None, None, 302, "", {}, "https://elsewhere.example.com"))

    def test_http_failure_sanitized_and_not_retried(self):
        opener = Mock()
        opener.open.side_effect = urllib.error.HTTPError(helper.API_URL, 402, "fc-secret", {}, None)
        with patch.object(helper.urllib.request, "build_opener", return_value=opener):
            with self.assertRaisesRegex(helper.InspectionError, "HTTP 402; no automatic retry") as error:
                helper.scrape(self.url, "fc-secret")
        self.assertNotIn("fc-secret", str(error.exception))
        self.assertEqual(opener.open.call_count, 1)

    def test_responsive_image_urls_preserve_transform_commas(self):
        parser = helper.Images(self.url)
        first = "https://images.example.com/c_crop,w_1920,h_1080/huntley.jpg"
        second = "https://images.example.com/c_crop,w_1280,h_720/huntley.jpg"
        parser.feed('<img srcset="' + first + ' 1920w,' + second + ' 1280w" alt="Huntley">')
        self.assertEqual([image["url"] for image in parser.images], [first, second])


if __name__ == "__main__":
    unittest.main()
