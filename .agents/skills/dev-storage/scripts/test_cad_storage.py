"""Exercise CAD routing without touching live tools or volumes."""
import importlib.util
import os
from pathlib import Path
import plistlib
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import patch

spec = importlib.util.spec_from_file_location('cad_storage', Path(__file__).with_name('cad_storage.py'))
cad = importlib.util.module_from_spec(spec)
spec.loader.exec_module(cad)


class RoutingTests(unittest.TestCase):
    def test_cad_only(self):
        self.assertTrue(cad.is_cad(['--from', 'cadgen==0.8.2', 'cadgen', 'mcp']))
        self.assertTrue(cad.is_cad(['--from=cadgen==0.9.0', 'cadgen']))
        self.assertTrue(cad.is_cad(['cadgen@0.8.2', 'doctor']))
        self.assertFalse(cad.is_cad(['ruff', 'check', '.']))
        self.assertFalse(cad.is_cad(['--version']))

    def test_non_cad_does_not_require_external_drive(self):
        with patch.object(sys, 'argv', ['cad_storage.py', 'uvx', '--version']), patch.object(cad, 'check_volume', side_effect=RuntimeError('absent')) as check, patch.object(os, 'execve') as execute:
            cad.main()
            check.assert_not_called()
            self.assertEqual(execute.call_args.args[1][-3:], ['tool', 'uvx', '--version'])

    def test_missing_drive_does_not_launch_or_create_paths(self):
        with patch.object(sys, 'argv', ['cad_storage.py', 'uvx', 'cadgen']), patch.object(cad, 'check_volume', side_effect=RuntimeError('absent')), patch.object(os, 'execve') as execute, patch.object(Path, 'mkdir') as mkdir:
            with self.assertRaises(RuntimeError): cad.main()
            execute.assert_not_called()
            mkdir.assert_not_called()

    def test_wrong_volume_identity_is_rejected(self):
        result = subprocess.CompletedProcess([], 0, plistlib.dumps({'VolumeUUID': 'wrong', 'MountPoint': str(cad.VOLUME)}))
        with patch.object(subprocess, 'run', return_value=result):
            with self.assertRaises(RuntimeError): cad.check_volume()

    def test_all_cad_working_paths_are_external(self):
        with tempfile.TemporaryDirectory() as temp:
            volume = Path(temp).resolve()
            root = volume / 'cad'
            with patch.object(cad, 'check_volume'), patch.object(cad, 'VOLUME', volume):
                env = cad.cad_environment(root)
                for name in ['UV_CACHE_DIR', 'UV_PYTHON_INSTALL_DIR', 'UV_TOOL_DIR', 'CADGEN_CACHE_DIR', 'CADGEN_LAUNCHER_DIR', 'TMPDIR', 'PYTHONPYCACHEPREFIX']:
                    self.assertTrue(Path(env[name]).is_relative_to(root))
                    self.assertTrue(Path(env[name]).is_dir())

    def test_cache_override_cannot_redirect_cad_internally(self):
        args = cad.routed_args(['--cache-dir', '/internal', '--no-cache', '--from', 'cadgen==0.8.2', 'cadgen', 'mcp'])
        self.assertNotIn('/internal', args)
        self.assertNotIn('--no-cache', args)
        self.assertEqual(args[:2], ['--cache-dir', str(cad.ROOT/'uv-cache')])

    def test_uv_update_restores_router_even_on_update_failure(self):
        with patch.object(sys, 'argv', ['cad_storage.py', 'update-uv']), patch.object(subprocess, 'run', return_value=subprocess.CompletedProcess([], 1)), patch.object(cad, 'install') as install:
            self.assertEqual(cad.main(), 1)
            install.assert_called_once()


if __name__ == '__main__':
    unittest.main()
