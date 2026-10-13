import crypto from "node:crypto";
import {requireDiscovery} from "../lib/lineups/discovery.mjs";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const configIndex = process.argv.indexOf("--config");
if (configIndex === -1 || !process.argv[configIndex + 1]) throw new Error("Usage: node scripts/prepare-lineups-rank-reveal-scene.mjs <sceneId> --config <rank-reveal-timing.json> [--inspect]");
const auditPath = path.resolve(root, process.argv[configIndex + 1]);
const sceneId = process.argv[2];
const inspectOnly = process.argv.includes("--inspect");

if (!sceneId) throw new Error("Usage: node scripts/prepare-lineups-rank-reveal-scene.mjs <sceneId>");

const audit = JSON.parse(fs.readFileSync(auditPath, "utf8"));
if (!inspectOnly) requireDiscovery({...audit, transcriptPath: audit.transcriptPath ?? audit.transcript.source}, root);
const scene = audit.scenes.find((item) => item.sceneId === sceneId);
if (!scene) throw new Error(`Unknown Rank Reveal scene: ${sceneId}`);

const teams = Object.fromEntries(audit.scenes.map((item) => [item.rank, item]));
const duration = scene.compositionDurationSeconds;
const teamDuration = audit.motionContract.teamRevealDurationSeconds;
const teamStart = scene.teamCue.sceneTime;
const teamEnd = Number((teamStart + teamDuration).toFixed(3));
const easing = { type: "EASE_OUT" };
const motionTargetId = scene.motionRootNodeId || scene.instanceId;

const tracks = [];
const cues = [];
if (scene.rank === audit.motionContract.initialBoardCascadeRank) {
  const starts = [0, 0.12, 0.24, 0.36, 0.48, 0.6, 0.72, 0.84, 0.96, 1.08];
  const ranks = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1];
  cues.push({
    cueId: "rank-board-enter",
    elementId: "rank-board",
    triggerType: "EDIT",
    triggerText: "scene start",
    transcriptTimestamp: scene.verifiedAnchorTimestamp,
    sceneTime: 0,
    action: "stagger-board-rows-10-to-1",
    duration: audit.motionContract.boardStaggerDurationSeconds,
  });
  tracks.push(...ranks.map((rank, index) => ({
    cueId: "rank-board-enter",
    rank,
    nodeId: `${scene.sceneId}/ROW/RANK-${rank}`,
    nodeName: `ROW / RANK ${rank}`,
    property: "opacity",
    duration,
    keyframes: [
      { time: starts[index], value: 0 },
      { time: Number((starts[index] + 0.42).toFixed(3)), value: 1 },
      { time: duration, value: 1 },
    ],
  })));
}

const teamCueId = `rank-${scene.rank}-content`;
cues.push({
  cueId: teamCueId,
  elementId: `rank-${scene.rank}-content`,
  triggerType: "WORD",
  triggerText: scene.teamCue.triggerText,
  transcriptTimestamp: scene.teamCue.transcriptTimestamp,
  sceneTime: teamStart,
  action: `reveal-rank-${scene.rank}-content`,
  duration: teamDuration,
});
tracks.push(
  {
    cueId: teamCueId,
    nodeId: `${scene.sceneId}/TEAM-NAME/RANK-${scene.rank}`,
    nodeName: `TEAM NAME / RANK ${scene.rank}`,
    property: "opacity",
    duration,
    keyframes: [{ time: teamStart, value: 0 }, { time: teamEnd, value: 1 }, { time: duration, value: 1 }],
  },
  {
    cueId: teamCueId,
    nodeId: `${scene.sceneId}/LOGO-SLOT/RANK-${scene.rank}`,
    nodeName: `LOGO SLOT / RANK ${scene.rank}`,
    property: "opacity",
    duration,
    keyframes: [{ time: teamStart, value: 0 }, { time: teamEnd, value: 1 }, { time: duration, value: 1 }],
  },
);

const background = {
  setting: "Field Night / No football",
  nodeId: `pending:${scene.sceneId}/BACKGROUND`,
  imageHash: "6c84d05a7f038c5e3f9f14a4103cd9b533251e70",
  locked: true,
  separateFromArtwork: true,
};
const rankReveal = {
  canonicalSourceComponentId: audit.figma.canonicalSourceComponentId,
  canonicalSourceName: audit.figma.canonicalSourceName,
  stateOrder: "10-to-1-cumulative",
  boardEntranceOrder: [10, 9, 8, 7, 6, 5, 4, 3, 2, 1],
  logoWrapperDimensions: audit.figma.logoWrapperDimensions,
  motionWorkingCopyMode: "detached-from-canonical-instance",
  revealedRank: scene.rank,
  visibleRanks: Array.from({ length: 11 - scene.rank }, (_, index) => 10 - index),
  logoAssignments: Array.from({ length: 10 }, (_, index) => {
    const item = teams[index + 1];
    return {
      rank: item.rank,
      team: item.team,
      componentId: item.logoComponentId,
      componentName: item.logoComponentName,
    };
  }),
};

const rankReadbackCode = `const rankSlots = Array.from({length: 10}, (_, index) => {
 const rank = index + 1;
 const text = working.findOne(node => node.name === "TEAM NAME / RANK " + rank && node.type === "TEXT");
 const slot = working.findOne(node => node.name === "LOGO SLOT / RANK " + rank);
 const logo = slot?.type === "INSTANCE" ? slot : slot?.findOne(node => node.type === "INSTANCE");
 if (!text || !slot || !logo?.mainComponent) throw new Error("Missing measured rank content " + rank);
 const visibleAtEnd = node => node.visible !== false && (node.manualKeyframeTracks?.OPACITY?.keyframes?.at(-1)?.value?.value ?? node.opacity) > 0;
 if (visibleAtEnd(text) !== visibleAtEnd(slot)) throw new Error("Rank text and logo visibility differ");
 return {rank, team: text.characters, componentId: logo.mainComponent.id, componentName: logo.mainComponent.name,
  shown: visibleAtEnd(text), width: slot.width, height: slot.height};
});
if (rankSlots.some(slot => slot.width !== rankSlots[0].width || slot.height !== rankSlots[0].height)) throw new Error("Rank logo wrappers differ");
const measuredRankReveal = {...${JSON.stringify(rankReveal)},
 canonicalSourceComponentId: working.getPluginData("lineupsSourceComponentId"), canonicalSourceName: source.name,
 logoWrapperDimensions: {width: rankSlots[0].width, height: rankSlots[0].height},
 visibleRanks: rankSlots.filter(slot => slot.shown).map(slot => slot.rank).sort((a,b) => b-a),
 logoAssignments: rankSlots.map(({rank, team, componentId, componentName}) => ({rank, team, componentId, componentName}))};`;

const mutationCode = `const source = await figma.getNodeByIdAsync("1277:558");
const target = await figma.getNodeByIdAsync(${JSON.stringify(motionTargetId)});
if (!source || source.type !== "COMPONENT") throw new Error("Expected canonical Rank Reveal component");
if (!target || !["INSTANCE", "FRAME"].includes(target.type)) throw new Error("Expected episode Rank Reveal instance or detached motion frame");
const sourceComponentId = target.type === "INSTANCE" ? target.mainComponent.id : target.getPluginData("lineupsSourceComponentId");
if (sourceComponentId !== source.id) throw new Error("Detached frame lacks verified canonical source provenance");
const mutatedNodeIds = [];
const working = target.type === "INSTANCE" ? target.detachInstance() : target;
working.setPluginData("lineupsSourceComponentId", sourceComponentId);
working.name = ${JSON.stringify(`MOTION / ${scene.sceneId} / RANK ${scene.rank}`)};
mutatedNodeIds.push(working.id);
for (const node of working.findAll((item) => item.name.startsWith("ROW / RANK ") || item.name.startsWith("TEAM NAME / RANK ") || item.name.startsWith("LOGO SLOT / RANK "))) {
  node.manualKeyframeTracks = {};
  node.animationStyles = [];
  mutatedNodeIds.push(node.id);
}
const targets = ${JSON.stringify(tracks)};
for (const target of targets) {
  const node = working.findOne((item) => item.name === target.nodeName);
  if (!node) throw new Error("Missing motion target " + target.nodeName);
  node.applyManualKeyframeTrack(
    { type: "PROPERTY", name: "OPACITY" },
    { keyframes: target.keyframes.map((frame, index) => ({
      timelinePosition: frame.time,
      value: { type: "FLOAT", value: frame.value },
      ...(index === 1 ? { easing: ${JSON.stringify(easing)} } : {}),
    })) },
  );
  mutatedNodeIds.push(node.id);
}
const firstTarget = working.findOne((item) => item.name === targets[0].nodeName);
const timeline = firstTarget?.timelines?.[0];
if (!timeline) throw new Error("Figma Motion timeline was not created");
firstTarget.setTimelineDuration(timeline.id, ${duration});
const backgroundNode = working.findOne(node => Array.isArray(node.fills) && node.fills.some(fill => fill.type === "IMAGE" && fill.imageHash === "6c84d05a7f038c5e3f9f14a4103cd9b533251e70"));
if (!backgroundNode) throw new Error("Measured Field Night background is missing");
const measuredBackground = {setting: "Field Night / No football", nodeId: backgroundNode.id, plannedNodeId: ${JSON.stringify(background.nodeId)},
 imageHash: backgroundNode.fills.find(fill => fill.type === "IMAGE").imageHash,
 locked: backgroundNode.locked, separateFromArtwork: backgroundNode.id !== working.id};
${rankReadbackCode}
return {
  rootNodeId: working.id,
  sourceComponentId,
  episodeInstanceId: working.id,
  nodeType: working.type,
  rootDimensions: {width: working.width, height: working.height},
  sourceRevision: "rank-reveal-normalized-v2-scene-motion",
  background: measuredBackground,
  rankReveal: measuredRankReveal,
  mutatedNodeIds,
  timelineDuration: firstTarget.timelines[0].duration,
  motionTracks: targets.map(target => {
 const node = working.findOne(item => item.name === target.nodeName);
 const measured = node.manualKeyframeTracks.OPACITY;
 if (!measured?.keyframes?.length) throw new Error("Missing measured motion track " + target.nodeName);
 return {nodeId: node.id, plannedNodeId: target.nodeId, property: target.property, cueId: target.cueId,
  duration: node.timelines[0].duration, keyframes: measured.keyframes.map(frame => ({time: frame.timelinePosition, value: frame.value.value}))};
}),
};`;

const inspectCode = `const source = await figma.getNodeByIdAsync("1277:558");
if (!source || source.type !== "COMPONENT") throw new Error("Missing canonical Rank Reveal source");
const working = await figma.getNodeByIdAsync(${JSON.stringify(motionTargetId)});
if (!working || working.type !== "FRAME") throw new Error("Expected detached Rank Reveal motion frame");
const definitions = ${JSON.stringify(tracks)};
const motionTracks = definitions.map(track => {
 const node = working.findOne(item => item.name === track.nodeName);
 const measured = node?.manualKeyframeTracks?.OPACITY;
 if (!measured?.keyframes?.length) throw new Error("Missing measured motion track " + track.nodeName);
 return {nodeId: node.id, plannedNodeId: track.nodeId, property: track.property, cueId: track.cueId,
  duration: node.timelines[0].duration, keyframes: measured.keyframes.map(frame => ({time: frame.timelinePosition, value: frame.value.value}))};
});
const backgroundNode = working.findOne(node => Array.isArray(node.fills) && node.fills.some(fill => fill.type === "IMAGE" && fill.imageHash === "6c84d05a7f038c5e3f9f14a4103cd9b533251e70"));
if (!backgroundNode) throw new Error("Measured Field Night background is missing");
const measuredBackground = {setting: "Field Night / No football", nodeId: backgroundNode.id, plannedNodeId: ${JSON.stringify(background.nodeId)},
 imageHash: backgroundNode.fills.find(fill => fill.type === "IMAGE").imageHash,
 locked: backgroundNode.locked, separateFromArtwork: backgroundNode.id !== working.id};
${rankReadbackCode}
return {
  rootNodeId: working.id,
  sourceComponentId: working.getPluginData("lineupsSourceComponentId"),
  episodeInstanceId: working.id,
  nodeType: working.type,
  rootDimensions: {width: working.width, height: working.height},
  sourceRevision: "rank-reveal-normalized-v2-scene-motion",
  background: measuredBackground,
  rankReveal: measuredRankReveal,
  motionTracks,
};`;
const code = inspectOnly ? inspectCode : mutationCode;

const toolInput = {
  code,
  description: inspectOnly
    ? `${audit.episodeId} ${scene.sceneId} rank ${scene.rank} Figma Motion timing readback`
    : `${audit.episodeId} ${scene.sceneId} rank ${scene.rank} transcript-timed Figma Motion correction`,
  fileKey: audit.figma.fileKey,
  skillNames: "figma-use,figma-use-motion,figma-generate-library,singleton-figma-system,file-hygiene,layer-cleanup",
};

const canonicalJson = (value) => {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(",")}}`;
  }
  return JSON.stringify(value);
};
const approvedToolInputSha256 = crypto.createHash("sha256").update(canonicalJson(toolInput)).digest("hex");

const lastEntrance = Math.max(...cues.map((cue) => cue.sceneTime));
const manifest = {
  schemaVersion: 2,
  discoveryPath: audit.discoveryPath,
  enforcement: { active: true, approvedToolInputSha256 },
  scene: {
    episodeId: audit.episodeId,
    sceneId: scene.sceneId,
    lane: "recurring board",
    approvedOption: "Rank Reveal",
    setting: "weekly cumulative 10-to-1 reveal",
  },
  figma: {
    fileKey: audit.figma.fileKey,
    pageId: audit.figma.pageId,
    rootNodeId: motionTargetId,
    sourceComponentId: audit.figma.canonicalSourceComponentId,
    episodeInstanceId: motionTargetId,
    sourceRevision: "rank-reveal-normalized-v2-scene-motion",
    episodeUsesInstance: false,
    motionWorkingCopyMode: "detached-from-canonical-instance",
    rootDimensions: { width: 1920, height: 1080 },
    background,
    exposedSlots: ["Team 1-10", "Logo 1-10", "Revealed 1-10"],
    allowedReplacementProperties: ["Team 1-10", "Logo 1-10", "Revealed 1-10"],
    rankReveal,
    focalAssets: [],
    motionTracks: tracks.map(({ nodeName, ...track }) => track),
  },
  motion: {
    engine: "figma",
    engineVersion: "figma-motion",
    timingValidator: "manim",
    frameRate: audit.motionContract.frameRate,
    sourcePath: null,
    sceneClass: null,
    cues,
  },
  timing: {
    transcriptPhrase: `${scene.rankPhraseCue.triggerText} ${scene.teamCue.triggerText}`,
    transcriptSource: "whisper",
    transcriptPath: audit.transcript.source,
    timestampResolution: "word",
    manimTimingValidated: false,
    verifiedAnchorTimestamp: scene.verifiedAnchorTimestamp,
    anchorVerified: true,
    entranceTimes: cues.map((cue) => cue.sceneTime),
    lastEntrance,
    contentEnd: teamEnd,
    paddedCompositionEnd: duration,
    finalStateVisible: true,
    noExitAnimation: true,
  },
  policy: {
    transitionsApproved: false,
    effectsApproved: false,
    lutsApproved: false,
    opacityChangesApproved: false,
    approvalNote: null,
  },
  export: {
    dimensions: { width: 1920, height: 1080 },
    path: `pending/${audit.episodeId}/${scene.sceneId}.mp4`,
    fileSha256: "0".repeat(64),
    artifactRole: "final-premiere-render",
    backgroundPolicy: "no-football-baked",
    validationStatus: "pending",
    motionProof: {
      type: "cue-frame-proof",
      engine: "figma",
      status: "failed",
      sampleTimes: [0, teamStart, duration - 0.1],
      frames: [
        { time: 0, sha256: "0".repeat(64), width: 1920, height: 1080 },
        { time: duration - 0.1, sha256: "0".repeat(64), width: 1920, height: 1080 },
      ],
    },
  },
  ownership: { eaglePath: "Episode / 06 Motion Renders", duplicateFinalFolderIn23Projects: false },
  premiere: {
    sequenceId: "pending-episode-sequence",
    trackIndex: 2,
    approvedStartTime: scene.verifiedAnchorTimestamp,
    approvedDuration: duration,
    approvedEndTime: Number((scene.verifiedAnchorTimestamp + duration).toFixed(3)),
    projectItemId: `pending-${scene.sceneId}`,
    nameReadback: `${scene.sceneId}.mp4`,
    treePath: `${audit.episodeId}/06 Motion Renders/${scene.sceneId}.mp4`,
    labelReadback: "pending",
    timelineClipId: `pending-${scene.sceneId}`,
  },
  review: { status: "pending", reviewer: null, reviewedAt: null, correctionPayloadId: null },
};

process.stdout.write(`${JSON.stringify({toolInput, manifest})}\n`);
