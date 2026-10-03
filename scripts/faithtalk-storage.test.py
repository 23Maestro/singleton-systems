import subprocess
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

import faithtalk_storage as storage


class OutputGateTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.client = Path(self.temp.name) / "FAITHTALK"
        self.renders = self.client / "renders"
        self.renders.mkdir(parents=True)
        patcher = patch.object(storage, "CLIENT_ROOT", self.client)
        patcher.start()
        self.addCleanup(patcher.stop)

    def gate(self):
        return patch.object(storage.subprocess, "run", return_value=subprocess.CompletedProcess([], 0, str(self.renders) + "\n", ""))

    def test_output_requires_the_existing_physical_volume_gate(self):
        with self.gate() as gate:
            target = self.renders / "outro-r7" / "master.mov"
            self.assertEqual(storage.require_output(target), target.resolve())
            self.assertIn("storage-gate.mjs", gate.call_args.args[0][1])
            self.assertEqual(gate.call_args.args[0][-4:], ["--client", "FAITHTALK", "--kind", "renders"])
            self.assertTrue(gate.call_args.kwargs["check"])

    def test_internal_or_source_output_is_rejected_before_the_gate(self):
        with self.gate() as gate:
            for target in [Path(self.temp.name) / "master.mov", self.client / "source" / "master.mov"]:
                with self.assertRaises(ValueError):
                    storage.require_output(target)
            gate.assert_not_called()

    def test_symlink_escape_is_rejected(self):
        (self.renders / "escape").symlink_to(self.temp.name)
        with self.gate(), self.assertRaisesRegex(ValueError, "escapes"):
            storage.require_output(self.renders / "escape" / "master.mov")

    def test_parent_escape_is_rejected(self):
        with self.gate(), self.assertRaisesRegex(ValueError, "escapes"):
            storage.require_output(self.renders / ".." / "source" / "master.mov")

    def test_volume_failures_stop_the_caller(self):
        with patch.object(storage.subprocess, "run", side_effect=subprocess.CalledProcessError(2, ["node"])), self.assertRaises(subprocess.CalledProcessError):
            storage.require_output(self.renders / "master.mov")


if __name__ == "__main__":
    unittest.main()
