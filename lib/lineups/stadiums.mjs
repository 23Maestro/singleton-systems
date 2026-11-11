import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));
const legacyHashes = ['508bd3cdcf3b17bf83fe30c50b1b2b11c66e3043', '6c84d05a7f038c5e3f9f14a4103cd9b533251e70'];

export function prepareStadium(scene) {
  const result = spawnSync(process.env.PYTHON || 'python3', ['-m', 'tools.lineups_motion.stadiums'],
    {cwd: root, input: JSON.stringify(scene), encoding: 'utf8'});
  if (result.status !== 0) throw new Error(result.stderr || 'Stadium source lookup failed');
  const asset = JSON.parse(result.stdout)[0];
  if (asset.status !== 'ready') return {asset};
  const hash = scene.stadiumImageHash;
  if (!/^[a-f0-9]{40}$/.test(hash || '') || legacyHashes.includes(hash)) {
    return {asset, status: 'stadium-upload-needed', upload: {filePath: asset.filePath, tool: 'upload_assets',
      instruction: 'Upload this Eagle source into the scene file, then set stadiumImageHash to the returned imageHash.'}};
  }
  return {asset, background: {setting: 'Team Stadium', focusTeam: asset.focusTeam, eagleItemId: asset.eagleItemId,
    sourceSha256: asset.sourceSha256, nodeId: `pending:${scene.sceneId}/BACKGROUND`, imageHash: hash,
    locked: true, separateFromArtwork: true}};
}

export function stadiumReadbackCode(background, swap = false) {
  return `const expectedStadium = ${JSON.stringify(background)};
const backgroundNodes = working.findAll(node => Array.isArray(node.fills) && node.fills.some(fill => fill.type === 'IMAGE' && ${JSON.stringify(swap ? [...legacyHashes, background.imageHash] : [background.imageHash])}.includes(fill.imageHash)));
if (backgroundNodes.length !== 1) throw new Error('Expected exactly 1 separate stadium background layer');
const backgroundNode = backgroundNodes[0];
${swap ? `backgroundNode.locked = false;
backgroundNode.fills = backgroundNode.fills.map(fill => fill.type === 'IMAGE' ? {...fill, imageHash: expectedStadium.imageHash} : fill);
backgroundNode.locked = true;
mutatedNodeIds.push(backgroundNode.id);` : ''}
const measuredBackground = {...expectedStadium, nodeId: backgroundNode.id, plannedNodeId: expectedStadium.nodeId,
 imageHash: backgroundNode.fills.find(fill => fill.type === 'IMAGE').imageHash,
 locked: backgroundNode.locked, separateFromArtwork: backgroundNode.id !== working.id};`;
}
