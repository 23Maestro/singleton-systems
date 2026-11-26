// Lineups lane wrapper: reads the episode record, then runs the shared Studio start script.
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const args = process.argv.slice(2);
const at = args.indexOf('--episode');
const record = at >= 0 ? args[at + 1] : undefined;
if (!record) {
  console.error('Supply --episode and the episode title with --title.');
  process.exit(1);
}
const { episodeSlug, asanaTask } = JSON.parse(readFileSync(record, 'utf8'));
if (typeof asanaTask !== 'string' || !/^\d{10,25}$/.test(asanaTask)) {
  console.error('The episode record needs its slug and exact Asana task ID.');
  process.exit(1);
}
args.splice(at, 2, '--client', 'Catena Media', '--slug', String(episodeSlug ?? ''), '--task', 'asana:' + asanaTask);
// Run from the repository root, as the skill says.
const result = spawnSync(process.execPath, [join(process.cwd(), 'scripts/studio-start.mjs'), ...args], { stdio: 'inherit' });
process.exit(result.status ?? 1);
