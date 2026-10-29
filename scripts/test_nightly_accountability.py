import runpy
import tempfile
import unittest
from datetime import datetime
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor

ROOT = Path(__file__).resolve().parents[1]
HOOK = runpy.run_path(str(ROOT / ".codex/hooks/nightly_accountability.py"))["accountability_context"]


class NightlyAccountabilityTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.directory = Path(self.temp.name) / "state"

    def call(self, iso, prompt="Help finish this edit", event="UserPromptSubmit"):
        return HOOK({"hook_event_name": event, "prompt": prompt, "session_id": "fixture-session"},
                    now=datetime.fromisoformat(iso), state_dir=self.directory)

    def test_cutoff_and_morning(self):
        self.assertEqual(self.call("2026-10-27T04:29:59+00:00"), "")
        self.assertFalse(self.directory.exists())
        self.assertIn("nightly-accountability", self.call("2026-10-27T04:30:00+00:00"))
        self.assertEqual(self.call("2026-10-28T10:00:00+00:00"), "")

    def test_automated_and_nonprompt_events_do_not_claim_night(self):
        for prompt in ("<heartbeat>scheduled</heartbeat>", " \n<HEARTBEAT>tick</HEARTBEAT>", "", "  "):
            self.assertEqual(self.call("2026-10-27T05:00:00+00:00", prompt), "")
        for event in ("SessionStart", "Stop", "PreToolUse"):
            self.assertEqual(self.call("2026-10-27T05:00:00+00:00", event=event), "")
        self.assertFalse(self.directory.exists())
        self.assertTrue(self.call("2026-10-27T05:00:00+00:00"))

    def test_once_per_night_and_next_night(self):
        self.assertTrue(self.call("2026-10-27T04:30:00+00:00"))
        self.assertEqual(self.call("2026-10-27T06:00:00+00:00"), "")
        self.assertTrue(self.call("2026-10-28T04:30:00+00:00"))
        self.assertEqual((self.directory / "last-night").stat().st_mode & 0o777, 0o600)

    def test_standard_time_and_dst_repeated_hour(self):
        self.assertEqual(self.call("2026-12-01T05:29:00+00:00"), "")
        self.assertTrue(self.call("2026-12-01T05:30:00+00:00"))
        self.assertTrue(self.call("2026-11-01T05:30:00+00:00"))
        self.assertEqual(self.call("2026-11-01T06:30:00+00:00"), "")

    def test_concurrent_prompts_nudge_once(self):
        with ThreadPoolExecutor(max_workers=8) as pool:
            results = list(pool.map(lambda _: self.call("2026-10-27T05:00:00+00:00"), range(12)))
        self.assertEqual(sum(bool(result) for result in results), 1)

    def test_storage_failure_does_not_block(self):
        self.directory.write_text("not a directory")
        self.assertEqual(self.call("2026-10-27T05:00:00+00:00"), "")

    def test_unbound_fixture_does_not_claim_night(self):
        self.assertEqual(HOOK({"hook_event_name": "UserPromptSubmit", "prompt": "fixture"},
                              now=datetime.fromisoformat("2026-10-27T05:00:00+00:00"),
                              state_dir=self.directory), "")
        self.assertFalse(self.directory.exists())

    def test_registered_guard_includes_nudge(self):
        guard = runpy.run_path(str(ROOT / ".codex/hooks/cerebral_singleton_guard.py"))
        emitted = []
        main = guard["main"]
        scope = main.__globals__
        scope.update(read_input=lambda: {"hook_event_name": "UserPromptSubmit", "prompt": "test"},
                     in_repo=lambda _: True, cleanup_codex_git_temp=lambda **_: None,
                     context=lambda *_: "route", run_task_closeout_gate=lambda _: None,
                     emit=lambda packet, event: emitted.append((packet, event)))
        original = scope["runpy"].run_path
        from unittest.mock import patch
        with patch.object(scope["runpy"], "run_path", side_effect=lambda file: (
            {"accountability_context": lambda _: "nightly test context"}
            if str(file).endswith("nightly_accountability.py") else original(file)
        )):
            main()
        self.assertEqual(emitted, [("route\nnightly test context", "UserPromptSubmit")])


if __name__ == "__main__":
    unittest.main()
