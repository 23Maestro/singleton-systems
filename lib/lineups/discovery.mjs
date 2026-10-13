import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const sourceRoot = fileURLToPath(new URL('../../', import.meta.url));
export function checkDiscovery(record, root = sourceRoot) {
  return spawnSync(process.env.PYTHON || 'python3', ['-m', 'tools.lineups_motion.discovery'], {
    cwd: root, input: JSON.stringify(record), encoding: 'utf8', timeout: 10000,
    env: {...process.env, PYTHONPATH: sourceRoot},
  });
}
export function requireDiscovery(record, root) {
  const result = checkDiscovery(record, root);
  if (result.status !== 0) throw new Error(result.stderr || result.error?.message || 'Lineups discovery failed');
}

export function checkTiming(manifest, root = sourceRoot, requireApproval = true) {
  const installed = path.join(os.homedir(), '.pyenv/versions/3.12.3/bin/python3');
  const python = process.env.PYTHON || (fs.existsSync(installed) ? installed : 'python3');
  return spawnSync(python, ['-m', 'tools.lineups_motion.timing_evidence'], {
    cwd: sourceRoot, input: JSON.stringify({root, manifest, requireApproval}), encoding: 'utf8', timeout: 10000,
    env: {...process.env, PYTHONPATH: sourceRoot},
  });
}

export function checkMedia(manifest, root = sourceRoot) {
  const installed = path.join(os.homedir(), '.pyenv/versions/3.12.3/bin/python3');
  const python = process.env.PYTHON || (fs.existsSync(installed) ? installed : 'python3');
  return spawnSync(python, ['-m', 'tools.lineups_motion.media_evidence'], {
    cwd: sourceRoot, input: JSON.stringify({root, manifest}), encoding: 'utf8', timeout: 80000,
    env: {...process.env, PYTHONPATH: sourceRoot},
  });
}
