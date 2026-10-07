import { mkdir, readFile, writeFile, access } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const root = dirname(fileURLToPath(import.meta.url));
const commit = 'f37bd913a058ceca39d5bfc2369ec420018e5716';
const repo = 'alignui/alignui-nextjs-typescript-starter';
const manifest = resolve(root, 'inventory.json');
try { await access(manifest); throw new Error('Inventory already exists. Review updates before replacing this snapshot.'); }
catch (error) { if (error.code !== 'ENOENT') throw error; }
const digest = text => createHash('sha256').update(text).digest('hex');
const records = [];
async function download(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  return r.text();
}
async function save(path, content, source) {
  const target = resolve(root, path);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, content, { flag: 'wx' });
  records.push({ path, source, sha256: digest(content) });
}
const tree = JSON.parse(await download(`https://api.github.com/repos/${repo}/git/trees/${commit}?recursive=1`));
if (tree.truncated) throw new Error('Incomplete source tree');
const paths = tree.tree.filter(x => x.type === 'blob' && (
  x.path.startsWith('components/ui/') || x.path.startsWith('utils/') || x.path.startsWith('hooks/') ||
  ['LICENSE', 'tailwind.config.ts', 'app/globals.css', 'global.d.ts'].includes(x.path)
)).map(x => x.path);
const upstreamPackage = JSON.parse(await download(`https://raw.githubusercontent.com/${repo}/${commit}/package.json`));
await save('upstream-dependencies.json', JSON.stringify({ dependencies: upstreamPackage.dependencies, devDependencies: upstreamPackage.devDependencies }, null, 2) + '\n', `https://github.com/${repo}/blob/${commit}/package.json`);
for (let offset = 0; offset < paths.length; offset += 6) {
  await Promise.all(paths.slice(offset, offset + 6).map(async path => {
    const url = `https://raw.githubusercontent.com/${repo}/${commit}/${path}`;
    await save(`upstream/${path}`, await download(url), url);
  }));
}

// The public starter predates the live toast wrappers. Extract only the two
// explicitly documented files from the FREE base-component page.
const toastUrl = 'https://www.alignui.com/docs/v1.2/ui/toast';
const html = await download(toastUrl);
const entities = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };
const decode = s => s.replace(/&(#x[\da-f]+|#\d+|amp|lt|gt|quot|apos|nbsp);/gi, (_, key) => {
  if (key.startsWith('#x')) return String.fromCodePoint(parseInt(key.slice(2), 16));
  if (key.startsWith('#')) return String.fromCodePoint(Number(key.slice(1)));
  return entities[key];
});
const blocks = [...html.matchAll(/<pre\b[^>]*data-language="tsx"[^>]*>([\s\S]*?)<\/pre>/g)].map(m => decode(m[1].replace(/<[^>]+>/g, '')));
for (const [name, marker] of [['toast.tsx', 'const customToast'], ['toast-alert.tsx', 'const AlertToast']]) {
  const code = blocks.find(x => x.includes(marker));
  if (!code) throw new Error(`Missing documented ${name}`);
  await save(`upstream/components/ui/${name}`, code + '\n', toastUrl);
}
records.sort((a, b) => a.path.localeCompare(b.path));
await writeFile(manifest, JSON.stringify({
  importedAt: new Date().toISOString(), freeOnly: true, license: 'MIT',
  repository: `https://github.com/${repo}`, commit, cliVersion: '0.0.19',
  snapshotNote: 'Pinned public starter; toast wrappers from live free docs. Not a claim that every current v1.2 change is present.',
  files: records,
}, null, 2) + '\n', { flag: 'wx' });
console.log(`Imported ${records.filter(x => x.path.startsWith('upstream/components/ui/')).length} UI source files; ${records.length} licensed source/support files total.`);
