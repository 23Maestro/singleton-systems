import { homedir } from 'node:os';
import { join } from 'node:path';
import { loadEnvFile } from 'node:process';
import { newAccessLink } from '../lib/studio-session.ts';

try {
  loadEnvFile(process.env.STUDIO_CONFIG ?? join(homedir(), '.config/singleton-systems/studio.env'));
  const origin = new URL(process.env.STUDIO_ORIGIN);
  if (origin.protocol !== 'https:' || origin.username || origin.password) throw new Error('Use the verified HTTPS Studio origin.');
  const url = new URL('/studio', origin);
  url.hash = new URLSearchParams({ access: newAccessLink() }).toString();
  console.log(url.href);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
