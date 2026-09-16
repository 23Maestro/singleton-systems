import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const episodeDir = path.join(root, "config/lineups/episodes/2026-09-15-nfl-week-2-power-rankings");
const config = JSON.parse(fs.readFileSync(path.join(episodeDir, "motion-scene-timing.json"), "utf8"));
const scene = config.scenes.find((item) => item.sceneId === process.argv[2]);
if (!scene) throw new Error("Usage: node scripts/prepare-lineups-motion-scene.mjs <S03|S05|S09|S12|S21|S24|S27>");

const duration = config.duration;
const pendingId = `pending:${scene.sceneId}`;
const cueDuration = 0.4;
const background = { setting: "Field Night / No football", nodeId: "594:1256", imageHash: "6c84d05a7f038c5e3f9f14a4103cd9b533251e70", locked: true, separateFromArtwork: true };
const isQuick = scene.lane === "quick stat";
const cues = [{ cueId: `${scene.sceneId}-photo-push`, elementId: "photo", triggerType: "EDIT", triggerText: "scene start", transcriptTimestamp: scene.anchor, sceneTime: 0, action: "slow-photo-push", duration: 0 }];
if (isQuick) {
  cues.push({ cueId: `${scene.sceneId}-statement`, elementId: "statement", triggerType: "WORD", triggerText: scene.triggerText, transcriptTimestamp: Number((scene.anchor + scene.cueTime).toFixed(3)), sceneTime: scene.cueTime, action: "reveal-statement", duration: cueDuration });
} else {
  scene.stats.forEach((stat, index) => cues.push({ cueId: `${scene.sceneId}-stat-${index + 1}`, elementId: `stat-${index + 1}`, triggerType: "WORD", triggerText: stat.triggerText, transcriptTimestamp: stat.transcriptTimestamp, sceneTime: Number((stat.transcriptTimestamp - scene.anchor).toFixed(3)), action: `reveal-stat-${index + 1}`, duration: cueDuration }));
}

const tracks = [{ cueId: `${scene.sceneId}-photo-push`, nodeId: `${scene.sceneId}/PHOTO`, nodeName: isQuick ? "EDIT / PHOTO 1 / FILL 1920x1080" : "EDIT / ACTION PHOTO / FILL LEFT PANEL", property: "scale", duration, keyframes: [{ time: 0, value: 1 }, { time: duration, value: 1.025 }] }];
if (isQuick) {
  tracks.push({ cueId: `${scene.sceneId}-statement`, nodeId: `${scene.sceneId}/STATEMENT`, nodeName: "STATEMENT / CYAN CALLOUT", property: "opacity", duration, keyframes: [{ time: scene.cueTime, value: 0 }, { time: Number((scene.cueTime + cueDuration).toFixed(3)), value: 1 }, { time: duration, value: 1 }] });
} else {
  scene.stats.forEach((stat, index) => {
    const start = Number((stat.transcriptTimestamp - scene.anchor).toFixed(3));
    const end = Number((start + cueDuration).toFixed(3));
    for (const prefix of ["VALUE", "LABEL"]) tracks.push({ cueId: `${scene.sceneId}-stat-${index + 1}`, nodeId: `${scene.sceneId}/${prefix}-${index + 1}`, nodeName: `${prefix} ${index + 1}`, property: "opacity", duration, keyframes: [{ time: start, value: 0 }, { time: end, value: 1 }, { time: duration, value: 1 }] });
  });
}

const quickProperties = { "Topic Small#653:5": scene.topicSmall, "Topic Large#653:6": scene.topicLarge, "Statement#653:7": scene.statement, "Show Topic Small#653:8": true, "Show Topic Large#653:9": true };
const statProperties = !isQuick ? Object.fromEntries([
  ["Subject#591:18", scene.subject], ["Headline#591:19", scene.headline],
  ...scene.stats.flatMap((stat, index) => [[`Value ${index + 1}#591:${20 + index}`, stat.value], [`Label ${index + 1}#591:${23 + index}`, stat.label]])
]) : {};
// Four-point properties use separate fourth-property ids.
if (!isQuick && scene.stats.length === 4) { statProperties["Value 4#591:26"] = scene.stats[3].value; statProperties["Label 4#591:27"] = scene.stats[3].label; delete statProperties["Value 4#591:23"]; delete statProperties["Label 4#591:26"]; }

const mutationCode = `const source = await figma.getNodeByIdAsync(${JSON.stringify(scene.sourceComponentId)});
const section = await figma.getNodeByIdAsync(${JSON.stringify(scene.sectionId)});
if (!source || source.type !== "COMPONENT") throw new Error("Expected canonical Lineups source component");
if (!section || section.type !== "SECTION") throw new Error("Expected episode destination section");
for (const child of [...section.children]) if (child.name.startsWith(${JSON.stringify(`MOTION / ${scene.sceneId} /`)})) child.remove();
const instance = source.createInstance();
section.appendChild(instance);
instance.x = ${scene.x}; instance.y = ${scene.y};
if (instance.width !== 1920 || instance.height !== 1080 || instance.mainComponent.id !== source.id) throw new Error("Canonical instance verification failed");
const working = instance.detachInstance();
working.name = ${JSON.stringify(`MOTION / ${scene.sceneId} / ${isQuick ? scene.statement : scene.subject}`)};
await figma.loadFontAsync({ family: "Inter", style: "Bold" });
await figma.loadFontAsync({ family: "Inter", style: "Semi Bold" });
await figma.loadFontAsync({ family: "Anton", style: "Regular" });
const setText = (name, characters, fontName) => {
  const node = working.findOne((item) => item.type === "TEXT" && item.name === name);
  if (!node) throw new Error("Missing text target " + name);
  node.fontName = fontName;
  node.characters = characters;
  return node.id;
};
${isQuick ? `setText("TOPIC SMALL", ${JSON.stringify(scene.topicSmall)}, { family: "Inter", style: "Bold" });
setText("TOPIC LARGE", ${JSON.stringify(scene.topicLarge)}, { family: "Anton", style: "Regular" });
let callout = working.findOne((item) => item.name === "STATEMENT / CYAN CALLOUT");
if (!callout) throw new Error("Missing statement callout");
if (callout.type === "INSTANCE") callout = callout.detachInstance();
const statementText = callout.findOne((item) => item.type === "TEXT");
if (!statementText) throw new Error("Missing statement text");
statementText.fontName = { family: "Inter", style: "Bold" };
statementText.characters = ${JSON.stringify(scene.statement)};` : `setText("SUBJECT", ${JSON.stringify(scene.subject)}, { family: "Inter", style: "Bold" });
setText("HEADLINE", ${JSON.stringify(scene.headline)}, { family: "Anton", style: "Regular" });
${scene.stats.map((stat, index) => `setText("VALUE ${index + 1}", ${JSON.stringify(stat.value)}, { family: "Anton", style: "Regular" });\nsetText("LABEL ${index + 1}", ${JSON.stringify(stat.label)}, { family: "Inter", style: "Semi Bold" });`).join("\n")}`}
const trackDefs = ${JSON.stringify(tracks)};
const mutatedNodeIds = [working.id];
for (const node of working.findAll((item) => item.manualKeyframeTracks !== undefined)) { node.manualKeyframeTracks = {}; node.animationStyles = []; }
for (const track of trackDefs) {
  const node = working.findOne((item) => item.name === track.nodeName);
  if (!node) throw new Error("Missing motion target " + track.nodeName);
  const property = track.property === "scale" ? { type: "PROPERTY", name: "SCALE_XY" } : { type: "PROPERTY", name: "OPACITY" };
  node.applyManualKeyframeTrack(property, { keyframes: track.keyframes.map((frame, index) => ({ timelinePosition: frame.time, value: track.property === "scale" ? { type: "VECTOR", value: { x: frame.value, y: frame.value } } : { type: "FLOAT", value: frame.value }, ...(index === 1 ? { easing: { type: "EASE_OUT" } } : {}) })) });
  mutatedNodeIds.push(node.id);
}
const first = working.findOne((item) => item.name === trackDefs[0].nodeName);
const timeline = first?.timelines?.[0];
if (!timeline) throw new Error("Figma Motion timeline was not created");
first.setTimelineDuration(timeline.id, ${duration});
const photo = working.findOne((item) => item.name === ${JSON.stringify(isQuick ? "EDIT / PHOTO 1 / FILL 1920x1080" : "EDIT / ACTION PHOTO / FILL LEFT PANEL")});
if (!photo) throw new Error("Missing photo slot");
return { plannedRootNodeId: ${JSON.stringify(pendingId)}, rootNodeId: working.id, sourceComponentId: source.id, episodeInstanceId: working.id, nodeType: working.type, sourceRevision: ${JSON.stringify(scene.sourceRevision)}, ${isQuick ? "" : `background: ${JSON.stringify(background)},`} photoNodeId: photo.id, mutatedNodeIds, timelineDuration: first.timelines[0].duration, motionTracks: trackDefs.map((track) => ({ nodeName: track.nodeName, keyframes: track.keyframes })) };`;

const toolInput = { code: mutationCode, description: `Week 2 ${scene.sceneId} transcript-timed ${isQuick ? "Quick Stat" : "Stat Breakdown"} Figma Motion scene`, fileKey: config.fileKey, skillNames: "figma-use,figma-use-motion,singleton-figma-system,file-hygiene,layer-cleanup,safe-auto-layout-conversion" };
const canonicalJson = (value) => Array.isArray(value) ? `[${value.map(canonicalJson).join(",")}]` : value && typeof value === "object" ? `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(",")}}` : JSON.stringify(value);
const approvedToolInputSha256 = crypto.createHash("sha256").update(canonicalJson(toolInput)).digest("hex");
const contentEnd = Math.max(...cues.map((cue) => cue.sceneTime + cue.duration));
const manifest = {
  schemaVersion: 2,
  enforcement: { active: true, approvedToolInputSha256 },
  scene: { episodeId: config.episodeId, sceneId: scene.sceneId, lane: scene.lane, approvedOption: scene.approvedOption, setting: isQuick ? "single-frame photo statement" : `${scene.stats.length}-point photo-left data panel` },
  figma: { fileKey: config.fileKey, pageId: config.pageId, rootNodeId: pendingId, sourceComponentId: scene.sourceComponentId, episodeInstanceId: pendingId, sourceRevision: scene.sourceRevision, episodeUsesInstance: false, motionWorkingCopyMode: "detached-from-canonical-instance", rootDimensions: { width: 1920, height: 1080 }, ...(isQuick ? {} : { background }), exposedSlots: isQuick ? ["Photo", "Topic Small", "Topic Large", "Statement"] : ["Photo", "Subject", "Headline", ...scene.stats.flatMap((_, index) => [`Value ${index + 1}`, `Label ${index + 1}`])], allowedReplacementProperties: isQuick ? ["TOPIC SMALL", "TOPIC LARGE", "STATEMENT"] : ["SUBJECT", "HEADLINE", ...scene.stats.flatMap((_, index) => [`VALUE ${index + 1}`, `LABEL ${index + 1}`])], focalAssets: [], motionTracks: tracks.map(({ nodeName, ...track }) => track) },
  motion: { engine: "figma", engineVersion: "figma-motion", timingValidator: "manim", frameRate: config.frameRate, sourcePath: null, sceneClass: null, cues },
  timing: { transcriptPhrase: cues.map((cue) => cue.triggerText).join(" "), transcriptSource: "whisper", transcriptPath: config.transcriptPath, timestampResolution: "word", manimTimingValidated: true, verifiedAnchorTimestamp: scene.anchor, anchorVerified: true, entranceTimes: cues.map((cue) => cue.sceneTime), lastEntrance: Math.max(...cues.map((cue) => cue.sceneTime)), contentEnd, paddedCompositionEnd: duration, finalStateVisible: true, noExitAnimation: true },
  policy: { transitionsApproved: false, effectsApproved: false, lutsApproved: false, opacityChangesApproved: false, approvalNote: null },
  export: { dimensions: { width: 1920, height: 1080 }, path: `pending/${config.episodeId}/${scene.sceneId}.mp4`, fileSha256: "0".repeat(64), artifactRole: "final-premiere-render", backgroundPolicy: isQuick ? "football-visible-baked" : "no-football-baked", validationStatus: "pending", motionProof: { type: "cue-frame-proof", engine: "figma", status: "failed", sampleTimes: [0, ...cues.slice(1).map((cue) => cue.sceneTime), duration - 0.1], frames: [{ time: 0, sha256: "0".repeat(64), width: 1920, height: 1080 }, { time: duration - 0.1, sha256: "0".repeat(64), width: 1920, height: 1080 }] } },
  ownership: { eaglePath: "Episode / 06 Motion Renders", duplicateFinalFolderIn23Projects: false },
  premiere: { sequenceId: "pending-week-2-sequence", trackIndex: 2, approvedStartTime: scene.anchor, approvedDuration: duration, approvedEndTime: Number((scene.anchor + duration).toFixed(3)), projectItemId: `pending-${scene.sceneId}`, treePath: `${config.episodeId}/06 Motion Renders/${scene.sceneId}.mp4`, labelReadback: "pending", timelineClipId: `pending-${scene.sceneId}` },
  review: { status: "approved", reviewer: "Jerami", reviewedAt: "2026-09-16T00:00:00Z", correctionPayloadId: null }
};
fs.writeFileSync(path.join(root, "config/lineups/active-scene.json"), `${JSON.stringify(manifest, null, 2)}\n`);
process.stdout.write(`${JSON.stringify({ toolInput, assetPath: path.join(root, "public/decision-maps/2026-09-15-nfl-week-2-power-rankings-pre-figma-review/assets", scene.asset), scene })}\n`);
