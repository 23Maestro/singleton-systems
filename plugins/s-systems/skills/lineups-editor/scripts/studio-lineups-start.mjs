import { createHash, randomUUID } from 'node:crypto';
import { readFile, realpath, stat } from 'node:fs/promises';
import { parseArgs } from 'node:util';
import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, extname, join } from 'node:path';
import { loadEnvFile } from 'node:process';

const mediaTypes = {
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp',
  '.mp4': 'video/mp4', '.webm': 'video/webm',
};
const isLocalHttp = url => url.protocol === 'http:' && url.hostname === '127.0.0.1';

async function uploadAsset(origin, token, projectId, directory, relative, expectedHash) {
  const root = join(directory, 'assets');
  const file = await realpath(join(directory, relative));
  const contentType = mediaTypes[extname(relative).toLowerCase()];
  const info = await stat(file);
  if (dirname(file) !== root || !contentType || !info.isFile() || info.size > 25 * 1024 * 1024) {
    throw new Error('Use a supported review file inside the packet assets, up to 25 MiB.');
  }
  const bytes = await readFile(file);
  const sha256 = createHash('sha256').update(bytes).digest('hex');
  if (expectedHash && expectedHash !== sha256) throw new Error('The review asset does not match the packet hash.');
  const ticketResponse = await fetch(new URL('/api/studio/assets', origin), {
    method: 'POST', headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
    body: JSON.stringify({ projectId, sha256, contentType, bytes: bytes.length }),
    redirect: 'error', signal: AbortSignal.timeout(25000),
  });
  if (!ticketResponse.ok) throw new Error('Studio could not prepare the asset upload (' + ticketResponse.status + ').');
  const { url, ticket } = await ticketResponse.json();
  const target = new URL(url);
  if ((target.protocol !== 'https:' && !(isLocalHttp(origin) && isLocalHttp(target))) ||
      target.username || target.password || target.pathname !== '/studio-assets' || typeof ticket !== 'string') {
    throw new Error('Studio returned an invalid upload ticket.');
  }
  const response = await fetch(target, {
    method: 'POST', body: bytes,
    headers: { Authorization: 'Studio ' + ticket, 'Content-Type': contentType, 'Content-Length': String(bytes.length) },
    redirect: 'error', signal: AbortSignal.timeout(120_000),
  });
  if (!response.ok) throw new Error('Studio asset upload failed (' + response.status + ').');
  const receipt = await response.json();
  if (receipt.projectId !== projectId || receipt.sha256 !== sha256) throw new Error('Studio did not confirm the asset hash.');
  return { sha256, path: '/api/studio/assets?' + new URLSearchParams({ projectId, sha256 }) };
}

try {
  const config = process.env.STUDIO_CONFIG ?? join(homedir(), '.config/singleton-systems/studio.env');
  if (existsSync(config)) loadEnvFile(config);
  const { values } = parseArgs({ options: {
    episode: { type: 'string' }, title: { type: 'string' }, storyboard: { type: 'string' },
    'chat-id': { type: 'string' }, 'host-id': { type: 'string' },
    packet: { type: 'string' }, 'media-base': { type: 'string' },
  } });
  if (!values.episode || !values.title?.trim() || values.title.trim().length > 120) {
    throw new Error('Supply --episode and the episode title with --title.');
  }
  const { episodeSlug, asanaTask } = JSON.parse(await readFile(values.episode, 'utf8'));
  if (typeof episodeSlug !== 'string' || !/^[a-z0-9][a-z0-9-]{0,119}$/.test(episodeSlug)
      || typeof asanaTask !== 'string' || !/^\d{10,25}$/.test(asanaTask)) {
    throw new Error('The episode record needs its slug and exact Asana task ID.');
  }
  if (!process.env.STUDIO_ORIGIN) throw new Error('Set the verified Studio origin first.');
  const origin = new URL(process.env.STUDIO_ORIGIN);
  if ((origin.protocol !== 'https:' && !isLocalHttp(origin)) || origin.username || origin.password) {
    throw new Error('Use an HTTPS Studio origin.');
  }
  const token = process.env.VIDEO_REVIEW_PRODUCER_TOKEN;
  if (!token || token.length < 32) throw new Error('Studio producer access is not configured.');
  const review = values.storyboard || values.packet;
  const chatId = values['chat-id'] ?? (review ? process.env.CODEX_THREAD_ID : undefined);
  const hostId = values['host-id'] ?? (review ? process.env.VIDEO_REVIEW_PRODUCER_HOST_ID : undefined);
  const begin = async (handoff) => {
    const response = await fetch(new URL('/api/studio/projects', origin), {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'start-lineups', projectId: randomUUID(), episodeSlug, asanaTask, title: values.title.trim(), ...(handoff ? { handoff } : {}) }),
      redirect: 'error', signal: AbortSignal.timeout(25000),
    });
    if (!response.ok) throw new Error('Studio start failed (' + response.status + ').');
    const project = await response.json();
    if (project.client !== 'Catena Media' || project.episodeSlug !== episodeSlug
        || project.task?.owner !== 'asana' || project.task.id !== asanaTask
        || !/^[0-9a-f-]{36}$/.test(project.projectId) || !['active', 'closed'].includes(project.status)) {
      throw new Error('Studio returned a project that does not match this episode.');
    }
    return project;
  };
  let handoff;
  if (review || chatId || hostId) {
    if (!review || !chatId || !hostId) throw new Error('The review handoff needs a packet or storyboard, the current Codex thread and the configured chat host.');
    if (process.env.CODEX_THREAD_ID && chatId !== process.env.CODEX_THREAD_ID) {
      throw new Error('The requested thread does not match this Codex chat.');
    }
    const storyboard = values.storyboard && new URL(values.storyboard);
    if (storyboard && (storyboard.protocol !== 'https:' || storyboard.username || storyboard.password)) {
      throw new Error('Use the verified HTTPS storyboard URL.');
    }
    handoff = { storyboardUrl: storyboard?.href, origin: { hostId, threadId: chatId } };
  }
  let packetRevision;
  if (values.packet || values['media-base']) {
    if (!handoff || !values.packet) throw new Error('Supply the review packet.');
    const base = values['media-base'] && new URL(values['media-base']);
    if (base && (base.protocol !== 'https:' || base.username || base.password || base.search || base.hash || !base.pathname.endsWith('/') || !handoff.storyboardUrl)) {
      throw new Error('Use the hosted packet directory URL with a trailing slash.');
    }
    const packet = JSON.parse(await readFile(values.packet, 'utf8'));
    if (packet.episodeId !== episodeSlug) throw new Error('The review packet does not match the episode.');
    const directory = await realpath(dirname(values.packet));
    const project = base ? null : await begin();
    if (project?.status === 'closed') throw new Error('The Studio project is closed.');
    if (project?.origin && (project.origin.threadId !== chatId || project.origin.hostId !== hostId)) {
      throw new Error('The storyboard is already bound to another chat.');
    }
    if (project && !handoff.storyboardUrl) {
      const storyboard = new URL('/studio/review.html', origin);
      storyboard.searchParams.set('project', project.projectId);
      handoff.storyboardUrl = storyboard.href;
    }
    const uploaded = new Map();
    const asset = async (relative, expectedHash) => {
      if (relative == null) return relative;
      if (typeof relative !== 'string' || !/^assets\/[a-zA-Z0-9_-]+\.[a-zA-Z0-9]+$/.test(relative)) {
        throw new Error('The review packet has an invalid asset path.');
      }
      if (base) return new URL(relative, base).href;
      if (!uploaded.has(relative)) {
        uploaded.set(relative, await uploadAsset(origin, token, project.projectId, directory, relative, expectedHash));
      }
      const result = uploaded.get(relative);
      if (expectedHash && result.sha256 !== expectedHash) throw new Error('The review asset does not match the packet hash.');
      return result.path;
    };
    for (const scene of packet.scenes) {
      if (scene.thumbnail != null) scene.thumbnail = await asset(scene.thumbnail);
      for (const version of scene.versions) {
        if (version.url != null) version.url = await asset(version.url, version.sha256);
        if (version.poster != null) version.poster = await asset(version.poster);
      }
    }
    packetRevision = createHash('sha256').update(JSON.stringify(packet)).digest('hex');
    packet.revision = packetRevision;
    handoff.packet = JSON.stringify(packet);
  }
  const project = await begin(handoff);
  if (handoff && (project.storyboardUrl !== handoff.storyboardUrl
      || project.origin?.threadId !== chatId || project.origin?.hostId !== hostId)) {
    throw new Error('Studio did not confirm the storyboard and source chat.');
  }
  if (packetRevision && project.packetRevision !== packetRevision) {
    throw new Error('Studio did not confirm the review packet revision.');
  }
  const url = new URL('/studio', origin);
  url.searchParams.set('project', project.projectId);
  console.log(JSON.stringify({ ...project, url: url.href }));
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
