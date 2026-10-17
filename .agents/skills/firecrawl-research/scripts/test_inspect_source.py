import argparse
import contextlib
import importlib.util
import io
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

spec = importlib.util.spec_from_file_location("inspect_source", Path(__file__).with_name("inspect_source.py"))
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class InspectionTests(unittest.TestCase):
    def payload(self, **metadata):
        return {"success": True, "data": {"markdown": "LKW housing reference", "html": "<h1>LKW housing</h1>",
                "metadata": {"statusCode": 200, "title": "Housing", **metadata}}}

    def test_real_page_requires_source_status_content_and_expected_text(self):
        self.assertEqual(module.assess(self.payload(), ["LKW"])["status"], "passed")
        for payload in [self.payload(statusCode=404), self.payload(title="404 Not Found"),
                        {"success": True, "data": {"metadata": {"statusCode": 200}}}]:
            self.assertEqual(module.assess(payload, ["LKW"])["status"], "failed")
        self.assertEqual(module.assess(self.payload(), ["unseen part"])["status"], "failed")

    def test_check_has_no_network_credential_or_write_side_effect(self):
        with tempfile.TemporaryDirectory() as folder:
            output = Path(folder) / "unused"
            with patch.object(module, "load_key", side_effect=AssertionError("credential read")), \
                 patch.object(module, "fetch", side_effect=AssertionError("network call")), \
                 contextlib.redirect_stdout(io.StringIO()):
                result = module.main(["--url", "https://example.com/part", "--subject", "part",
                                      "--purpose", "inspect", "--out-dir", str(output), "--check"])
            self.assertEqual(result, 0)
            self.assertFalse(output.exists())

    def test_image_leads_resolve_relative_urls_without_private_targets(self):
        parser = module.Images("https://example.com/manual/")
        parser.feed('<img src="part.png" alt="Housing"><img src="part.png"><img src="https://127.0.0.1/secret">')
        self.assertEqual(len(parser.items), 1)
        self.assertEqual(parser.items[0]["url"], "https://example.com/manual/part.png")
        self.assertEqual(parser.items[0]["status"], "lead_only")

    def test_receipt_binds_the_actual_downloaded_content(self):
        import hashlib
        with tempfile.TemporaryDirectory() as folder:
            args = argparse.Namespace(url="https://example.com/manual", subject="part-01", purpose="shape",
                                      out_dir=folder, expect_text=["LKW"])
            path, receipt = module.write_receipt(args, self.payload())
            self.assertEqual(json.loads(path.read_text())["subject"], "part-01")
            for file in receipt["files"]:
                self.assertEqual(hashlib.sha256(Path(file["path"]).read_bytes()).hexdigest(), file["sha256"])

    def test_credential_and_private_urls_are_refused(self):
        for url in ["http://example.com/", "https://localhost/", "https://10.0.0.1/a", "https://user:secret@example.com/"]:
            with self.assertRaises(ValueError):
                module.public_https(url)

    def test_unexpected_provider_data_cannot_pass(self):
        for payload in [{"success": True, "data": ["unexpected"]},
                        {"success": True, "data": {"metadata": [200]}}]:
            self.assertEqual(module.assess(payload, ["LKW"])["status"], "failed")

    def test_redirected_page_resolves_images_at_the_final_url(self):
        with tempfile.TemporaryDirectory() as folder:
            args = argparse.Namespace(url="https://example.com/old/", subject="part", purpose="shape",
                                      out_dir=folder, expect_text=["LKW"])
            payload = self.payload(url="https://example.com/new/")
            payload["data"]["html"] = '<h1>LKW</h1><img src="part.png">'
            _, receipt = module.write_receipt(args, payload)
            self.assertEqual(receipt["image_leads"][0]["url"], "https://example.com/new/part.png")


if __name__ == "__main__":
    unittest.main()
