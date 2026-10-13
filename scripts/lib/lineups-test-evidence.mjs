import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {hashValue} from '../../lib/transactions/contract.mjs';

// External-boundary fixture. Run the real timing validator; this is not live-app proof.
export function prepareSceneEvidence(directory, manifest, sourceRoot = process.cwd()) {
  const cues = manifest.motion.cues.filter(cue => cue.triggerType !== 'EDIT');
  if (cues.length && cues[0].transcriptTimestamp > manifest.timing.verifiedAnchorTimestamp) {
    cues.unshift({triggerText: 'Introduction', transcriptTimestamp: manifest.timing.verifiedAnchorTimestamp});
  }
  const transcription = (cues.length ? cues : [{triggerText: 'Introduction', transcriptTimestamp: manifest.timing.verifiedAnchorTimestamp}]).map(cue => {
    const tokens = cue.triggerText.split(/\s+/).map((word, i) => ({text: `${i ? ' ' : ''}${word}`,
      offsets: {from: Math.round((cue.transcriptTimestamp + i * 0.01) * 1000), to: Math.round((cue.transcriptTimestamp + (i + 1) * 0.01) * 1000)}}));
    return {text: cue.triggerText, offsets: {from: tokens[0].offsets.from, to: tokens.at(-1).offsets.to + 1000}, tokens};
  });
  manifest.timing.transcriptPath = path.join(directory, 'transcript.json');
  manifest.discoveryPath = path.join(directory, 'discovery.json');
  fs.writeFileSync(manifest.timing.transcriptPath, JSON.stringify({transcription}));
  fs.writeFileSync(manifest.discoveryPath, JSON.stringify({schemaVersion: 1, episodeId: manifest.scene.episodeId,
    transcriptSha256: crypto.createHash('sha256').update(fs.readFileSync(manifest.timing.transcriptPath)).digest('hex'), fullTranscriptReviewed: true,
    lanes: ['quick action photo', 'quick stat', 'stat breakdown', 'comparison', 'year-by-year', 'asset swap', 'recurring board'].map(lane => ({lane,
      reviewedSegmentIds: transcription.map((_, i) => i), findings: lane === manifest.scene.lane ? [{outcome: 'candidate', candidateId: manifest.scene.sceneId,
        reason: 'The supplied source passage supports this fixture scene.', segmentIds: transcription.map((_, i) => i),
        start: transcription[0].offsets.from / 1000, end: transcription.at(-1).offsets.to / 1000,
        excerpt: transcription.map(s => s.text).join(' '), assetSearch: {status: 'verified', evidence: 'Fixture assets'}}] :
        [{outcome: 'no-fit', reason: 'The fixture passage has no additional visual argument for this lane.'}]}))}));
  // Tiny synthetic boundary images exercise pixel checks; no client media is used.
  const alphaRequired = manifest.scene.lane === 'asset swap' || (manifest.scene.lane === 'comparison' && manifest.scene.approvedOption !== 'Cinematic 2-up' && manifest.scene.comparisonKind === 'players');
  if (alphaRequired) {
    const images = spawnSync(process.env.PYTHON || 'python3', ['-c', `import json,sys,hashlib
from pathlib import Path
from PIL import Image
root=Path(sys.argv[1]); result=[]
for i in range(int(sys.argv[2])):
 original=root/f"original-{i}.png"; alpha=root/f"alpha-{i}.png"
 Image.new("RGB",(2,2),(40+i,100,150)).save(original)
 img=Image.new("RGBA",(2,2),(40+i,100,150,255)); img.putpixel((0,0),(0,0,0,0)); img.save(alpha)
 result.append({"alphaPath":str(alpha),"originalPath":str(original),"alphaSha256":hashlib.sha256(alpha.read_bytes()).hexdigest(),"originalSha256":hashlib.sha256(original.read_bytes()).hexdigest()})
print(json.dumps(result))`, directory, String(manifest.figma.focalAssets.filter(a => a.kind === 'photo' || a.kind === 'cutout').length)], {encoding: 'utf8'});
    if (images.status !== 0) throw new Error(images.stderr);
    let index = 0;
    for (const asset of manifest.figma.focalAssets.filter(a => a.kind === 'photo' || a.kind === 'cutout')) {
      const entry = manifest.figma.assetLedger?.find(row => row.sceneId === manifest.scene.sceneId && row.slotId === asset.layoutRole);
      asset.alphaProof = {...JSON.parse(images.stdout)[index++], sourceId: entry?.sourceId, imageHash: entry?.imageHash, edgesReviewedBy: 'Jerami'};
    }
  }
  manifest.timing.proofPath = path.join(directory, 'timing-receipt.json');
  const installed = path.join(os.homedir(), '.pyenv/versions/3.12.3/bin/python3');
  const python = process.env.PYTHON || (fs.existsSync(installed) ? installed : 'python3');
  const result = spawnSync(python, ['-m', 'tools.lineups_motion.timing_evidence', '--issue'], {
    cwd: sourceRoot, input: JSON.stringify({root: sourceRoot, manifest}), encoding: 'utf8', timeout: 10000,
  });
  // Invalid-manifest cases intentionally retain the prior proof and fail closed at the hook.
  if (result.status !== 0) return result;
  const receipt = JSON.parse(result.stdout);
  fs.writeFileSync(manifest.timing.proofPath, result.stdout);
  manifest.review.approvedEvidenceSha256 = hashValue({scene: manifest.scene, figma: manifest.figma, motion: manifest.motion,
    policy: manifest.policy, premiereIntent: Object.fromEntries(['sequenceId', 'trackIndex', 'approvedStartTime', 'approvedDuration', 'approvedEndTime', 'editorialTiming'].map(key => [key, manifest.premiere[key] ?? null])),
    timingSha256: receipt.timingSha256, timingReceiptSha256: receipt.receiptSha256,
    approvedToolInputSha256: manifest.enforcement.approvedToolInputSha256});
  return result;
}

const mediaCache = new Map();
process.once('exit', () => { for (const directory of mediaCache.values()) fs.rmSync(directory, {recursive: true, force: true}); });

// Decode real synthetic media for the delivery gate; never claim Figma/Premiere playback.
export function prepareMediaEvidence(manifest, caseName, sourceRoot = process.cwd()) {
  const gate = spawnSync(process.execPath, [path.join(sourceRoot, 'scripts/developer-storage/storage-gate.mjs'),
    'route', '--client', 'CATENA_MEDIA', '--kind', 'previews'], {encoding: 'utf8'});
  if (gate.status !== 0) throw new Error(gate.stderr || 'HomeSSD fixture storage is unavailable');
  const directory = fs.mkdtempSync(path.join(gate.stdout.trim(), `${caseName}-`));
  manifest.export.motionProof.frames = manifest.export.motionProof.sampleTimes.map(time => ({time, width: 1920, height: 1080}));
  const cacheKey = JSON.stringify([manifest.motion.frameRate, manifest.timing.paddedCompositionEnd, manifest.export.motionProof.frames.map(f => f.time)]);
  const cached = mediaCache.get(cacheKey);
  if (cached) {
    fs.cpSync(cached, directory, {recursive: true});
    manifest.export.path = path.join(directory, 'render-proof.mp4');
    manifest.export.fileSha256 = crypto.createHash('sha256').update(fs.readFileSync(manifest.export.path)).digest('hex');
    for (const frame of manifest.export.motionProof.frames) {
      frame.path = path.join(directory, `frame-${frame.time}.png`);
      frame.sha256 = crypto.createHash('sha256').update(fs.readFileSync(frame.path)).digest('hex');
    }
    return directory;
  }
  const video = path.join(directory, 'render-proof.mp4');
  const rate = `${manifest.motion.frameRate.numerator}/${manifest.motion.frameRate.denominator}`;
  const generated = spawnSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-f', 'lavfi', '-i',
    `color=c=blue:s=1920x1080:r=${rate}`, '-t', String(manifest.timing.paddedCompositionEnd),
    '-c:v', 'libx264', '-preset', 'ultrafast', '-threads', '2', '-pix_fmt', 'yuv420p', video], {encoding: 'utf8', timeout: 20000});
  if (generated.status !== 0) throw new Error(generated.stderr);
  manifest.export.path = video;
  manifest.export.fileSha256 = crypto.createHash('sha256').update(fs.readFileSync(video)).digest('hex');
  for (const frame of manifest.export.motionProof.frames) {
    frame.path = path.join(directory, `frame-${frame.time}.png`);
    const decoded = spawnSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-i', video, '-ss', frame.time.toFixed(9),
      '-frames:v', '1', '-f', 'image2pipe', '-vcodec', 'png', 'pipe:1'], {timeout: 20000, maxBuffer: 16 * 1024 * 1024});
    if (decoded.status !== 0) throw new Error(String(decoded.stderr));
    fs.writeFileSync(frame.path, decoded.stdout);
    frame.sha256 = crypto.createHash('sha256').update(decoded.stdout).digest('hex');
  }
  const cacheDirectory = fs.mkdtempSync(path.join(gate.stdout.trim(), 'lineups-test-cache-'));
  fs.cpSync(directory, cacheDirectory, {recursive: true});
  mediaCache.set(cacheKey, cacheDirectory);
  return directory;
}
