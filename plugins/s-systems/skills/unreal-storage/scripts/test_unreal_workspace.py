import importlib.util
import json
from pathlib import Path
import plistlib
import subprocess
import tempfile
from types import SimpleNamespace
import unittest
from unittest.mock import patch

spec = importlib.util.spec_from_file_location("unreal_workspace", Path(__file__).with_name("unreal_workspace.py"))
workspace = importlib.util.module_from_spec(spec)
spec.loader.exec_module(workspace)


class WorkspaceTests(unittest.TestCase):
    def test_configure_preserves_plugins_and_before_copy(self):
        with tempfile.TemporaryDirectory() as directory:
            p = Path(directory) / "Test.uproject"
            original = b'{"FileVersion":3,"Plugins":[{"Name":"Other","Enabled":true},{"Name":"PythonScriptPlugin","Enabled":false}]}'
            p.write_bytes(original)
            receipt = workspace.configure(p)
            self.assertEqual(Path(receipt["backup"]).read_bytes(), original)
            plugins = json.loads(p.read_text())["Plugins"]
            self.assertIn({"Name": "Other", "Enabled": True}, plugins)
            self.assertTrue(next(x for x in plugins if x["Name"] == "PythonScriptPlugin")["Enabled"])
            self.assertFalse(workspace.configure(p)["changed"])

    def test_pristine_sample_is_not_a_working_copy(self):
        with tempfile.TemporaryDirectory() as directory:
            base = Path(directory)
            working = base / "projects"
            working.mkdir()
            sample = base / "Sample.uproject"
            sample.write_text("{}")
            with patch.object(workspace, "route", return_value=working):
                with self.assertRaisesRegex(ValueError, "working copy"):
                    workspace.working_project(base, "LINEUPS", sample)
            self.assertEqual(sample.read_text(), "{}")

    def test_symlink_cannot_escape_working_projects(self):
        with tempfile.TemporaryDirectory() as directory:
            base = Path(directory)
            working = base / "projects"
            working.mkdir()
            outside = base / "outside"
            outside.mkdir()
            project = outside / "Test.uproject"
            project.write_text("{}")
            (working / "escape").symlink_to(outside, target_is_directory=True)
            with patch.object(workspace, "route", return_value=working):
                with self.assertRaises(ValueError):
                    workspace.working_project(base, "LINEUPS", working / "escape/Test.uproject")

    def test_volume_gate_failure_is_not_retried_internally(self):
        with patch.object(workspace.subprocess, "run", side_effect=workspace.subprocess.CalledProcessError(2, "gate")) as run:
            with self.assertRaises(workspace.subprocess.CalledProcessError):
                workspace.route(workspace.repository(), "LINEUPS", "projects")
            self.assertEqual(run.call_count, 1)

    def test_runtime_rejects_wrong_volume_identity_and_case_sensitive_format(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            config_dir = root / "config/unreal"
            config_dir.mkdir(parents=True)
            mount = root / "volume"
            mount.mkdir()
            config = {"mountPoint": str(mount), "volumeUuid": "EXPECTED", "minimumFreeGiB": 50,
                      "sourceRoot": "Generated"}
            (config_dir / "storage.json").write_text(json.dumps(config))
            for info in [
                {"VolumeUUID": "WRONG", "MountPoint": str(mount), "FilesystemName": "APFS", "Internal": False},
                {"VolumeUUID": "EXPECTED", "MountPoint": str(mount), "FilesystemName": "Case-sensitive APFS", "Internal": False},
                {"VolumeUUID": "EXPECTED", "MountPoint": "/", "FilesystemName": "APFS", "Internal": True},
            ]:
                with self.subTest(info=info), patch.object(workspace.subprocess, "run",
                        return_value=subprocess.CompletedProcess([], 0, plistlib.dumps(info))):
                    with self.assertRaisesRegex(ValueError, "not mounted"):
                        workspace.runtime_volume(root)
                    self.assertEqual(list(mount.iterdir()), [])

    def test_client_symlink_cannot_escape_runtime_volume(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            volume = root / "volume"
            volume.mkdir()
            outside = root / "outside"
            outside.mkdir()
            (volume / "LINEUPS").symlink_to(outside, target_is_directory=True)
            with patch.object(workspace, "runtime_volume", return_value=volume):
                with self.assertRaisesRegex(ValueError, "outside the registered volume"):
                    workspace.route(root, "LINEUPS", "projects")
            self.assertEqual(list(outside.iterdir()), [])

    def test_missing_mount_or_low_space_stops_before_project_writes(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            mount = root / "volume"
            mount.mkdir()
            config_dir = root / "config/unreal"
            config_dir.mkdir(parents=True)
            (config_dir / "storage.json").write_text(json.dumps({
                "mountPoint": str(mount), "volumeUuid": "EXPECTED", "minimumFreeGiB": 50,
                "sourceRoot": "Generated"}))
            info = {"VolumeUUID": "EXPECTED", "MountPoint": str(mount),
                    "FilesystemName": "APFS", "Internal": False}
            with patch.object(workspace.subprocess, "run",
                    return_value=subprocess.CompletedProcess([], 0, plistlib.dumps(info))):
                with patch.object(workspace.os.path, "ismount", return_value=False):
                    with self.assertRaisesRegex(ValueError, "fallback folder"):
                        workspace.runtime_volume(root)
                with patch.object(workspace.os.path, "ismount", return_value=True), \
                        patch.object(workspace.os, "statvfs", return_value=SimpleNamespace(f_bavail=1, f_frsize=4096)):
                    with self.assertRaisesRegex(ValueError, "50 GiB"):
                        workspace.runtime_volume(root)
            self.assertEqual(list(mount.iterdir()), [])

    def test_native_launch_keeps_cache_paths_external_without_remote_control_flags(self):
        with tempfile.TemporaryDirectory() as directory:
            base = Path(directory)
            engine = base / "engines/UE_Test/Engine/Binaries/Mac/UnrealEditor.app/Contents/MacOS/UnrealEditor"
            engine.parent.mkdir(parents=True)
            engine.write_text("#!/bin/sh\nexit 0\n")
            engine.chmod(0o700)
            project = base / "Test.uproject"
            project.write_text("{}")
            workspace.configure(project)
            script = base / "probe.py"
            script.write_text("pass")
            def routed(root, client, kind):
                result = base / kind
                result.mkdir(exist_ok=True)
                return result
            with patch.object(workspace, "route", side_effect=routed):
                command, env, log, probe = workspace.launch_plan(base, "LINEUPS", project, base / "engines/UE_Test", script)
            self.assertEqual(command[0], str(engine.resolve()))
            self.assertEqual(env["UE-LocalDataCachePath"], str(base / "ddc"))
            self.assertEqual(env["UE-ZenDataPath"], str(base / "zen"))
            self.assertTrue(workspace.within(log, base / "receipts"))
            self.assertTrue(workspace.within(probe, base / "receipts"))
            self.assertFalse(any("WebControl" in value or "RemoteControl" in value for value in command))


if __name__ == "__main__":
    unittest.main()
