"""Safety and lifecycle tests use only disposable fixtures, never live caches."""
import importlib.util
import json
import os
from pathlib import Path
import plistlib
import subprocess
import tempfile
import unittest
from unittest.mock import patch
import whisper_storage
import dev_storage

spec = importlib.util.spec_from_file_location("guard", Path(__file__).with_name("storage_guard.py"))
guard = importlib.util.module_from_spec(spec)
spec.loader.exec_module(guard)


class StorageGuardTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix="storage-guard-test-")
        self.root = Path(self.temp.name).resolve()
        self.home = self.root / "home"
        self.home.mkdir()
        self.chrome = self.root / "com.google.Chrome.code_sign_clone"
        self.chrome.mkdir()
        self.clear = {"paths": [], "commands": []}

    def tearDown(self):
        self.temp.cleanup()

    def clone(self, name="code_sign_clone.abcdef"):
        path = self.chrome / name
        contents = path / "Google Chrome.app.bundle/Contents"
        contents.mkdir(parents=True)
        (contents / "Info.plist").write_bytes(plistlib.dumps({"CFBundleIdentifier": "com.google.Chrome"}))
        return path

    def action(self, path):
        return {"path": str(path), "rule": "chrome-clones", "identity": guard.identity(path),
                "eligible": True, "idle_since": 100}

    def test_requires_48_hours_of_continuous_observed_idle(self):
        record = guard.idle_state({}, "x", [1], 100, False)
        self.assertFalse(record["eligible"])
        for hours in range(6, 49, 6):
            record = guard.idle_state({"x": record}, "x", [1], 100+hours*3600, False)
            self.assertEqual(record["eligible"], hours >= 48)

    def test_active_changed_or_missed_checks_reset_grace(self):
        old = {"x": {"token": [1], "checked_at": 200000, "idle_since": 1}}
        self.assertIsNone(guard.idle_state(old, "x", [1], 200001, True)["idle_since"])
        self.assertEqual(guard.idle_state(old, "x", [2], 200001, False)["idle_since"], 200001)
        self.assertEqual(guard.idle_state(old, "x", [1], 300000, False)["idle_since"], 300000)

    def test_clock_rollback_resets_grace(self):
        old = {"x": {"token": [1], "checked_at": 200, "idle_since": 1}}
        self.assertEqual(guard.idle_state(old, "x", [1], 100, False)["idle_since"], 100)

    def test_rejects_clone_symlink_and_unknown_contents(self):
        path = self.clone()
        guard.chrome_candidate(path, self.chrome)
        (path / "source.txt").write_text("irreplaceable")
        with self.assertRaises(ValueError):
            guard.chrome_candidate(path, self.chrome)
        linked = self.chrome / "code_sign_clone.ghijkl"
        linked.symlink_to(path)
        with self.assertRaises(ValueError):
            guard.chrome_candidate(linked, self.chrome)

    def test_rejects_symlink_ancestor(self):
        alias = self.root / "alias"
        alias.symlink_to(self.chrome)
        path = self.clone()
        with self.assertRaises(ValueError):
            guard.chrome_candidate(alias/path.name, alias)

    def test_rejects_wrong_bundle_and_outside_root(self):
        path = self.clone()
        info = path / "Google Chrome.app.bundle/Contents/Info.plist"
        info.write_bytes(plistlib.dumps({"CFBundleIdentifier": "com.other.app"}))
        with self.assertRaises(ValueError):
            guard.chrome_candidate(path, self.chrome)
        with self.assertRaises(ValueError):
            guard.chrome_candidate(self.home, self.chrome)

    def test_open_file_or_uv_process_blocks_cleanup(self):
        path = self.clone()
        inventory = {"paths": [str(path/"Google Chrome.app.bundle/Contents/file")], "commands": []}
        with patch.object(guard, "processes", return_value=inventory):
            with self.assertRaisesRegex(ValueError, "in use"):
                guard.execute_action(self.action(path), self.home, self.chrome, 200000)
        self.assertTrue(path.exists())
        self.assertTrue(guard.busy(self.home, {"paths": [], "commands": ["123 /bin/uvx"]}, uv=True))

    def test_new_or_replaced_clone_never_removed(self):
        path = self.clone()
        action = self.action(path)
        with patch.object(guard, "processes", return_value=self.clear):
            with self.assertRaisesRegex(ValueError, "grace"):
                guard.execute_action(action, self.home, self.chrome, 200)
            action["identity"] = [0]
            with self.assertRaisesRegex(ValueError, "changed"):
                guard.execute_action(action, self.home, self.chrome, 200000)
        self.assertTrue(path.exists())

    def test_process_scan_failure_never_becomes_idle(self):
        path = self.clone()
        with patch.object(guard, "processes", side_effect=RuntimeError("lsof failed")):
            with self.assertRaises(RuntimeError):
                guard.execute_action(self.action(path), self.home, self.chrome, 200000)
        self.assertTrue(path.exists())

    def test_approved_clone_removes_only_candidate_preserves_external_link_target(self):
        path = self.clone()
        protected = self.root / "source.txt"
        protected.write_text("keep")
        (path / "Google Chrome.app.bundle/Contents/link").symlink_to(protected)
        with patch.object(guard, "processes", return_value=self.clear), patch.object(guard, "tree_activity", return_value=1):
            guard.execute_action(self.action(path), self.home, self.chrome, 200000)
        self.assertFalse(path.exists())
        self.assertEqual(protected.read_text(), "keep")

    def test_recent_nested_clone_change_blocks_removal(self):
        path = self.clone()
        action = self.action(path)
        (path / "Google Chrome.app.bundle/Contents/recent").write_text("new")
        self.assertEqual(guard.identity(path), action["identity"])
        with patch.object(guard, "processes", return_value=self.clear):
            with self.assertRaisesRegex(ValueError, "within 48"):
                guard.execute_action(action, self.home, self.chrome, guard.time.time())
        self.assertTrue(path.exists())

    def test_uv_uses_native_prune_without_force_and_recent_activity_defers(self):
        cache = self.home / ".cache/uv"
        cache.mkdir(parents=True)
        action = {"rule": "uv-prune", "path": str(cache), "identity": guard.identity(cache),
                  "eligible": True, "idle_since": 1}
        result = subprocess.CompletedProcess([], 0, "", "Pruned")
        with patch.object(guard, "processes", return_value=self.clear), patch.object(guard, "tree_activity", return_value=1), patch.object(guard, "command", return_value="ignoring in-use checks"), patch.object(guard.subprocess, "run", return_value=result) as run:
            guard.execute_action(action, self.home, self.chrome, 200000)
            args = run.call_args.args[0]
            self.assertIn("prune", args)
            self.assertNotIn("--force", args)
            self.assertNotIn("--ci", args)
            self.assertIn(str(cache), args)
        with patch.object(guard, "processes", return_value=self.clear), patch.object(guard, "tree_activity", return_value=199999):
            with self.assertRaisesRegex(ValueError, "within 48"):
                guard.execute_action(action, self.home, self.chrome, 200000)

    def test_old_uv_and_failed_prune_are_not_success(self):
        cache = self.home / ".cache/uv"
        cache.mkdir(parents=True)
        action = {"rule": "uv-prune", "path": str(cache), "identity": guard.identity(cache), "eligible": True, "idle_since": 1}
        with patch.object(guard, "processes", return_value=self.clear), patch.object(guard, "tree_activity", return_value=1), patch.object(guard, "command", return_value="old help"):
            with self.assertRaisesRegex(ValueError, "Update uv"):
                guard.execute_action(action, self.home, self.chrome, 200000)
        with patch.object(guard, "processes", return_value=self.clear), patch.object(guard, "tree_activity", return_value=1), patch.object(guard, "command", return_value="ignoring in-use checks"), patch.object(guard.subprocess, "run", return_value=subprocess.CompletedProcess([], 2, "", "cache in use")):
            with self.assertRaisesRegex(RuntimeError, "cache in use"):
                guard.execute_action(action, self.home, self.chrome, 200000)

    def test_state_is_bounded_and_lock_excludes_overlap(self):
        state = self.root / "state"
        report = {"timestamp": 1, "free_bytes": 100, "complete": True, "items": [], "executed": []}
        with guard.state_lock(state):
            with self.assertRaises(BlockingIOError):
                with guard.state_lock(state):
                    pass
            for _ in range(125):
                guard.record(report, state)
        self.assertEqual(len(guard.load_state(state/"history.json")["runs"]), 120)
        self.assertEqual((state/"latest.json").stat().st_mode & 0o777, 0o600)

    def test_corrupt_state_and_symlink_state_fail_closed(self):
        path = self.root/"state.json"
        path.write_text("broken")
        with self.assertRaises(ValueError):
            guard.load_state(path)
        path.unlink()
        path.symlink_to(self.root/"missing")
        # A dangling symlink must also fail closed.
        with self.assertRaises(ValueError):
            guard.load_state(path)

    def test_failure_and_growth_are_reported_without_new_deletions(self):
        previous = {"timestamp": 100, "free_bytes": 90*guard.GB, "items": [{"path": "/x", "bytes": 1}], "alerts": []}
        report = {"timestamp": 200, "free_bytes": 25*guard.GB, "hazel": {"healthy": True},
                  "items": [{"path": "/x", "name": "cache", "bytes": 3*guard.GB, "budget_bytes": 8*guard.GB, "status": "measured"}]}
        guard.add_trends(report, previous)
        self.assertTrue(report["notify"])
        self.assertTrue(any("Grew" in a for a in report["alerts"]))
        self.assertTrue(any("critical" in a for a in report["alerts"]))

    def test_whisper_link_destination_and_parent_deletions_are_blocked(self):
        external = self.root / 'external-whisper'
        external.mkdir()
        model = external / whisper_storage.MODEL
        model.write_bytes(b'model')
        link = self.home / '.cache/whisper-models' / whisper_storage.MODEL
        link.parent.mkdir(parents=True)
        link.symlink_to(model)
        alias = self.root / 'node_modules'
        alias.symlink_to(external)
        with patch.object(whisper_storage, 'ROOT', external):
            for path in [link, link.parent, link.parent.parent, model, external, alias]:
                with self.subTest(path=path):
                    self.assertTrue(whisper_storage.protected(path, self.home))
                    with self.assertRaisesRegex(ValueError, 'Whisper'):
                        guard.execute_action({'path': str(path)}, self.home, self.chrome, 200000)
            self.assertNotIn(alias, list(dev_storage.candidate_paths(self.root)))
            self.assertFalse(whisper_storage.protected(self.home / '.cache/uv', self.home))
        self.assertEqual(model.read_bytes(), b'model')
        self.assertTrue(link.is_symlink())

    def test_whisper_health_detects_missing_drive_model_and_internal_copy(self):
        external = self.root / 'external-whisper'
        external.mkdir()
        target = external / whisper_storage.MODEL
        target.write_bytes(b'model')
        link = self.home / '.cache/whisper-models' / whisper_storage.MODEL
        link.parent.mkdir(parents=True)
        link.symlink_to(target)
        with patch.object(whisper_storage, 'ROOT', external), patch.object(whisper_storage, 'MODEL_BYTES', 5), patch.object(whisper_storage.cad_storage, 'check_volume') as volume:
            self.assertTrue(whisper_storage.health(self.home)['healthy'])
            volume.side_effect = RuntimeError('drive unavailable')
            self.assertFalse(whisper_storage.health(self.home)['healthy'])
            self.assertEqual(target.read_bytes(), b'model')
            volume.side_effect = None
            target.unlink()
            self.assertFalse(whisper_storage.health(self.home)['healthy'])
            self.assertTrue(link.is_symlink())
            self.assertFalse(target.exists())
            target.write_bytes(b'model')
            link.unlink()
            link.write_bytes(b'model')
            self.assertFalse(whisper_storage.health(self.home)['healthy'])
            self.assertEqual(link.read_bytes(), b'model')


if __name__ == "__main__":
    unittest.main()
