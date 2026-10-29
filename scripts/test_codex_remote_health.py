import importlib.util
from pathlib import Path
import unittest

spec = importlib.util.spec_from_file_location("health", Path(__file__).with_name("codex-remote-health.py"))
health = importlib.util.module_from_spec(spec)
spec.loader.exec_module(health)
handover_spec = importlib.util.spec_from_file_location("handover", Path(__file__).with_name("codex-remote-handover.py"))
handover = importlib.util.module_from_spec(handover_spec)
handover_spec.loader.exec_module(handover)


class HealthTests(unittest.TestCase):
    def test_descriptors_are_not_highest_fd_or_txt_mappings(self):
        sample = "ftxt\ntREG\nf2\ntPIPE\nf255u\ntREG\nn/x/thread-writer-locks/example.lock\n"
        self.assertEqual(health.fd_summary(sample), dict(open_fds=2, highest_fd=255, pipes=1, writer_threads=["example"]))

    def test_process_identity_preserves_start_and_space_in_binary_path(self):
        row = health.process_rows(" 42 1 Thu Oct 22 16:44:47 2026 /Applications/My App/codex app-server --listen unix://")[42]
        self.assertEqual(row["started"], "Thu Oct 22 16:44:47 2026")
        self.assertTrue(row["command"].startswith("/Applications/My App/"))

    def test_quoted_tool_error_is_not_runtime_failure(self):
        self.assertIsNone(health.native_error_kind("codex_core::tools::handlers::shell", "Too many open files"))
        self.assertEqual(health.native_error_kind("codex_thread_store::local::live_writer", "failed: Too many open files"), "file_exhaustion")

    def test_disabled_phone_and_unknown_inventory_cannot_report_healthy(self):
        report = dict(runtime_errors=[], control=dict(pid=42, remote_status="disabled"), managed=False,
                      backends=[dict(pid=43, writer_threads=["other"])], gaps=["missing inventory"])
        self.assertEqual(len(health.findings(report)), 4)

    def test_handover_waits_for_active_work_goals_and_incomplete_evidence(self):
        report = dict(gaps=["missing logs"], control=dict(pid=42, threads=[dict(id="music", status=dict(type="active"))]), active_goals=["goal"])
        self.assertEqual(len(handover.blockers(report, dict(pid=42))), 3)
        report.update(gaps=[], active_goals=[])
        report["control"]["threads"][0]["status"]["type"] = "idle"
        self.assertEqual(handover.blockers(report, dict(pid=42)), [])
        self.assertTrue(handover.blockers(report, dict(pid=43)))

    def test_pid_reuse_never_matches_original_process(self):
        expected = dict(pid=42, started="old start", command="codex app-server")
        self.assertFalse(handover.matches(None, expected))
        self.assertFalse(handover.matches(dict(expected, started="new start"), expected))
        self.assertFalse(handover.matches(dict(expected, command="other app"), expected))
        self.assertTrue(handover.matches(dict(expected), expected))


if __name__ == "__main__":
    unittest.main()
