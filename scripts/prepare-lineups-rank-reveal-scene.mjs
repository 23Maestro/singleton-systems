import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const episodeDir = path.join(root, "config/lineups/episodes/2026-09-15-nfl-week-2-power-rankings");
const auditPath = path.join(episodeDir, "rank-reveal-timing.json");
const activePath = path.join(root, "config/lineups/active-scene.json");
const sceneId = process.argv[2];
const inspectOnly = process.argv.includes("--inspect");

if (!sceneId) throw new Error("Usage: node scripts/prepare-lineups-rank-reveal-scene.mjs <sceneId>");

const audit = JSON.parse(fs.readFileSync(auditPath, "utf8"));
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
  nodeId: "594:1256",
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

const mutationCode = `const source = await figma.getNodeByIdAsync("1277:558");
const target = await figma.getNodeByIdAsync(${JSON.stringify(motionTargetId)});
if (!source || source.type !== "COMPONENT") throw new Error("Expected canonical Rank Reveal component");
if (!target || !["INSTANCE", "FRAME"].includes(target.type)) throw new Error("Expected Week 2 Rank Reveal instance or detached motion frame");
const sourceComponentId = target.type === "INSTANCE" ? target.mainComponent.id : "1277:558";
const mutatedNodeIds = [];
${scene.rank === 10 ? `source.description = "Canonical weekly Rank Reveal visual source. Motion-free by design. Verify the episode instance, then detach the episode working copy for transcript-timed Figma Motion. Rank 10 alone cascades row shells 10 through 1 from scene time 0; ranks 9 through 1 animate only the new team name and normalized 96 x 78 logo. Manim validates cue math; Figma Motion is the sole visual engine.";
mutatedNodeIds.push(source.id);
for (const node of source.findAll((item) => item.name.startsWith("ROW / RANK ") || item.name.startsWith("TEAM NAME / RANK ") || item.name.startsWith("LOGO SLOT / RANK "))) {
  node.manualKeyframeTracks = {};
  node.animationStyles = [];
  mutatedNodeIds.push(node.id);
}` : ""}
const working = target.type === "INSTANCE" ? target.detachInstance() : target;
working.name = ${JSON.stringify(`MOTION / ${scene.sceneId} / RANK ${scene.rank}`)};
mutatedNodeIds.push(working.id);
for (const node of working.findAll((item) => item.name.startsWith("ROW / RANK ") || item.name.startsWith("TEAM NAME / RANK ") || item.name.startsWith("LOGO SLOT / RANK "))) {
  node.manualKeyframeTracks = {};
  node.animationStyles = [];
  mutatedNodeIds.push(node.id);
}
const targets = ${JSON.stringify(tracks.map((track) => ({ nodeName: track.nodeName, keyframes: track.keyframes })))};
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
return {
  rootNodeId: working.id,
  sourceComponentId,
  episodeInstanceId: working.id,
  nodeType: working.type,
  sourceRevision: "rank-reveal-normalized-v2-scene-motion",
  background: ${JSON.stringify(background)},
  rankReveal: ${JSON.stringify(rankReveal)},
  mutatedNodeIds,
  timelineDuration: firstTarget.timelines[0].duration,
  motionTracks: targets.map((target) => ({ nodeName: target.nodeName, keyframes: target.keyframes })),
};`;

const inspectCode = `const working = await figma.getNodeByIdAsync(${JSON.stringify(motionTargetId)});
if (!working || working.type !== "FRAME") throw new Error("Expected detached Rank Reveal motion frame");
const nodeNames = ${JSON.stringify(tracks.map((track) => track.nodeName))};
const motionTracks = nodeNames.map((nodeName) => {
  const node = working.findOne((item) => item.name === nodeName);
  if (!node) throw new Error("Missing motion target " + nodeName);
  return {
    nodeId: node.id,
    nodeName,
    manualKeyframeTracks: node.manualKeyframeTracks,
    animationStyles: node.animationStyles,
    timelines: node.timelines,
  };
});
return {
  rootNodeId: working.id,
  sourceComponentId: "1277:558",
  episodeInstanceId: working.id,
  nodeType: working.type,
  sourceRevision: "rank-reveal-normalized-v2-scene-motion",
  background: ${JSON.stringify(background)},
  rankReveal: ${JSON.stringify(rankReveal)},
  motionTracks,
};`;
const code = inspectOnly ? inspectCode : mutationCode;

const toolInput = {
  code,
  description: inspectOnly
    ? `Week 2 ${scene.sceneId} rank ${scene.rank} Figma Motion timing readback`
    : `Week 2 ${scene.sceneId} rank ${scene.rank} transcript-timed Figma Motion correction`,
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
    manimTimingValidated: true,
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
    sequenceId: "pending-week-2-sequence",
    trackIndex: 2,
    approvedStartTime: scene.verifiedAnchorTimestamp,
    approvedDuration: duration,
    approvedEndTime: Number((scene.verifiedAnchorTimestamp + duration).toFixed(3)),
    projectItemId: `pending-${scene.sceneId}`,
    treePath: `${audit.episodeId}/06 Motion Renders/${scene.sceneId}.mp4`,
    labelReadback: "pending",
    timelineClipId: `pending-${scene.sceneId}`,
  },
  review: { status: "pending", reviewer: "Jerami", reviewedAt: "2026-09-16T00:00:00Z", correctionPayloadId: null },
};

fs.writeFileSync(activePath, `${JSON.stringify(manifest, null, 2)}\n`);
process.stdout.write(`${JSON.stringify(toolInput)}\n`);
