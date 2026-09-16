import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

import { canComplete, createTransaction, executeTransaction } from "../lib/transactions/engine.mjs";
import { createLineupsReconciliation } from "../lib/transactions/lineups-adapter.mjs";
import { hashValue } from "../lib/transactions/contract.mjs";

const sourceRoot = process.cwd();
const hook = path.join(sourceRoot, ".codex/hooks/lineups_enforcement.py");
const fixtureSource = path.join(sourceRoot, "config/lineups/fixtures/valid");
const python = process.env.PYTHON || "python3";
const manifestSchema = JSON.parse(fs.readFileSync(path.join(sourceRoot, "config/lineups/scene-manifest.schema.json"), "utf8"));
const fixtureManifest = JSON.parse(fs.readFileSync(path.join(fixtureSource, "scene-manifest.json"), "utf8"));
const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);
const validateManifestSchema = ajv.compile(manifestSchema);
assert.equal(validateManifestSchema(fixtureManifest), true, JSON.stringify(validateManifestSchema.errors));

const approvedFigmaInput = {
  code: "const instance = await figma.getNodeByIdAsync(\"428:9001\");\nif (!instance || instance.type !== \"INSTANCE\") throw new Error(\"Expected approved Lineups instance\");\ninstance.setProperties({\"Logo\":\"Eagles\",\"Headline\":\"FOUR TAKEAWAYS\"});\nconst frame = instance.detachInstance();\nreturn { rootNodeId: \"428:9000\", sourceComponentId: \"428:8000\", episodeInstanceId: frame.id, nodeType: frame.type };",
  description: "Lineups scene BIGTEN-SEC-01/scene-07 approved property replacement",
  fileKey: "LINEUPS_FILE_KEY",
  skillNames: "singleton-figma-system,figma-use,file-hygiene,layer-cleanup",
};

const rankFigmaInput = {
  code: "const instance = await figma.getNodeByIdAsync(\"1276:5\");\nif (!instance || instance.type !== \"INSTANCE\") throw new Error(\"Expected approved Rank Reveal instance\");\nreturn { rootNodeId: instance.id, sourceComponentId: instance.mainComponent.id, episodeInstanceId: instance.id, nodeType: instance.type, sourceRevision: \"rank-reveal-normalized-v1\" };",
  description: "Lineups weekly Rank Reveal property and Figma Motion update",
  fileKey: "o7E24iymIT80MTXGYIogVH",
  skillNames: "singleton-figma-system,figma-use,figma-use-motion,file-hygiene,layer-cleanup",
};

function createCase() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "lineups-enforcement-"));
  const fixture = path.join(root, "config/lineups/fixtures/valid");
  fs.mkdirSync(path.dirname(fixture), { recursive: true });
  fs.cpSync(fixtureSource, fixture, { recursive: true });
  fs.writeFileSync(path.join(root, "config/cerebral-registry.json"), "{}\n");
  return {
    root,
    fixture,
    manifestPath: path.join(fixture, "scene-manifest.json"),
    receiptDir: path.join(fixture, "receipts"),
  };
}

function runHook(testCase, event, toolName, toolInput, toolResponse) {
  const payload = {
    hook_event_name: event,
    cwd: testCase.root,
    tool_name: toolName,
    tool_input: toolInput,
  };
  if (toolResponse !== undefined) payload.tool_response = toolResponse;
  return spawnSync(python, [hook], {
    cwd: testCase.root,
    input: JSON.stringify(payload),
    encoding: "utf8",
    env: {
      ...process.env,
      LINEUPS_MANIFEST_PATH: testCase.manifestPath,
      LINEUPS_RECEIPT_DIR: testCase.receiptDir,
    },
  });
}

function readManifest(testCase) {
  return JSON.parse(fs.readFileSync(testCase.manifestPath, "utf8"));
}

function writeManifest(testCase, manifest) {
  fs.writeFileSync(testCase.manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
}

function rankRevealManifest(revealedRank = 10) {
  const manifest = structuredClone(fixtureManifest);
  manifest.enforcement.approvedToolInputSha256 = hashValue(rankFigmaInput);
  manifest.scene = {
    episodeId: "2026-09-15-nfl-week-2-power-rankings",
    sceneId: "S01",
    lane: "recurring board",
    approvedOption: "Rank Reveal",
    setting: "weekly cumulative 10-to-1 reveal",
  };
  manifest.figma = {
    fileKey: "o7E24iymIT80MTXGYIogVH",
    pageId: "1268:1446",
    rootNodeId: "1276:5",
    sourceComponentId: "1277:558",
    episodeInstanceId: "1276:5",
    sourceRevision: "rank-reveal-normalized-v1",
    episodeUsesInstance: false,
    motionWorkingCopyMode: "detached-from-canonical-instance",
    rootDimensions: { width: 1920, height: 1080 },
    background: {
      setting: "Field Night / No football",
      nodeId: "594:1256",
      imageHash: "6c84d05a7f038c5e3f9f14a4103cd9b533251e70",
      locked: true,
      separateFromArtwork: true,
    },
    exposedSlots: ["Team 1-10", "Logo 1-10", "Revealed 1-10"],
    allowedReplacementProperties: ["Team 1-10", "Logo 1-10", "Revealed 1-10"],
    rankReveal: {
      canonicalSourceComponentId: "1277:558",
      canonicalSourceName: "Recurring Board / Rank Reveal / 10 Teams",
      stateOrder: "10-to-1-cumulative",
      boardEntranceOrder: [10, 9, 8, 7, 6, 5, 4, 3, 2, 1],
      logoWrapperDimensions: { width: 96, height: 78 },
      motionWorkingCopyMode: "detached-from-canonical-instance",
      revealedRank,
      visibleRanks: Array.from({ length: 11 - revealedRank }, (_, index) => 10 - index),
      logoAssignments: Array.from({ length: 10 }, (_, index) => ({
        rank: index + 1,
        team: `TEAM ${index + 1}`,
        componentId: `normalized-logo-${index + 1}`,
        componentName: `Asset/Team Logo/Normalized/Team ${index + 1}`,
      })),
    },
    focalAssets: [],
    motionTracks: [
      ...(revealedRank === 10 ? Array.from({ length: 10 }, (_, index) => ({
        cueId: "rank-board-enter",
        rank: 10 - index,
        nodeId: `rank-row-${10 - index}`,
        property: "opacity",
        duration: 12.96,
        keyframes: [
          { time: index * 0.1, value: 0 },
          { time: index * 0.1 + 0.4, value: 100 },
          { time: 12.96, value: 100 },
        ],
      })) : []),
      {
        cueId: `rank-${revealedRank}-content`,
        nodeId: `rank-${revealedRank}-team-text`,
        property: "opacity",
        duration: 12.96,
        keyframes: [
          { time: 1.5, value: 0 },
          { time: 1.9, value: 100 },
          { time: 12.96, value: 100 },
        ],
      },
      {
        cueId: `rank-${revealedRank}-content`,
        nodeId: `rank-${revealedRank}-logo`,
        property: "opacity",
        duration: 12.96,
        keyframes: [
          { time: 1.5, value: 0 },
          { time: 1.9, value: 100 },
          { time: 12.96, value: 100 },
        ],
      },
    ],
  };
  manifest.motion = {
    engine: "figma",
    engineVersion: "figma-motion",
    timingValidator: "manim",
    frameRate: { numerator: 24000, denominator: 1001 },
    sourcePath: null,
    sceneClass: null,
    cues: [
      ...(revealedRank === 10 ? [{
        cueId: "rank-board-enter",
        elementId: "rank-board",
        triggerType: "EDIT",
        triggerText: "scene start",
        transcriptTimestamp: 55.16,
        sceneTime: 0,
        action: "stagger-board-rows-10-to-1",
        duration: 1.3,
      }] : []),
      {
        cueId: `rank-${revealedRank}-content`,
        elementId: `rank-${revealedRank}-content`,
        triggerType: "PHRASE",
        triggerText: revealedRank === 10 ? "New York Giants" : `rank ${revealedRank}`,
        transcriptTimestamp: 56.66,
        sceneTime: 1.5,
        action: `reveal-rank-${revealedRank}-content`,
        duration: 0.4,
      },
    ],
  };
  manifest.timing = {
    transcriptPhrase: revealedRank === 10 ? "number ten, New York Giants" : `rank ${revealedRank}`,
    transcriptSource: "whisper",
    transcriptPath: "transcripts/power-rankings.whisper.json",
    timestampResolution: "word",
    manimTimingValidated: true,
    verifiedAnchorTimestamp: 55.16,
    anchorVerified: true,
    entranceTimes: revealedRank === 10 ? [0, 1.5] : [1.5],
    lastEntrance: 1.5,
    contentEnd: 7.96,
    paddedCompositionEnd: 12.96,
    finalStateVisible: true,
    noExitAnimation: true,
  };
  manifest.export.backgroundPolicy = "no-football-baked";
  manifest.export.motionProof.engine = "figma";
  manifest.export.motionProof.sampleTimes = [0, 12.9];
  manifest.export.motionProof.frames[0].time = 0;
  manifest.export.motionProof.frames[1].time = 12.9;
  manifest.premiere.approvedStartTime = 55.16;
  manifest.premiere.approvedDuration = 12.96;
  manifest.premiere.approvedEndTime = 68.12;
  return manifest;
}

function refreshReceiptChain(testCase) {
  const manifestSha256 = hashValue(readManifest(testCase));
  let previousReceiptSha256 = null;
  for (const stage of ["figma-to-export", "export-to-premiere", "premiere-import", "premiere-placement"]) {
    const receiptPath = path.join(testCase.receiptDir, `scene-07.${stage}.receipt.json`);
    const receipt = JSON.parse(fs.readFileSync(receiptPath, "utf8"));
    receipt.manifestSha256 = manifestSha256;
    receipt.previousReceiptSha256 = previousReceiptSha256;
    delete receipt.receiptSha256;
    receipt.receiptSha256 = hashValue(receipt);
    previousReceiptSha256 = receipt.receiptSha256;
    fs.writeFileSync(receiptPath, `${JSON.stringify(receipt, null, 2)}\n`);
  }
}

function expectAllowed(result, label) {
  assert.equal(result.status, 0, `${label}: hook exited ${result.status}: ${result.stderr}`);
  assert.equal(result.stdout.trim(), "", `${label}: expected allow, got ${result.stdout}`);
}

function expectDenied(result, pattern, label) {
  assert.equal(result.status, 0, `${label}: hook exited ${result.status}: ${result.stderr}`);
  assert.match(result.stdout, /"permissionDecision": "deny"/, `${label}: expected PreToolUse deny`);
  assert.match(result.stdout, pattern, `${label}: wrong deny reason`);
}

function expectPostPass(result, pattern, label) {
  assert.equal(result.status, 0, `${label}: hook exited ${result.status}: ${result.stderr}`);
  assert.doesNotMatch(result.stdout, /"decision": "block"/, `${label}: unexpected PostToolUse block`);
  assert.match(result.stdout, pattern, `${label}: missing progression message`);
}

function expectPostBlock(result, pattern, label) {
  assert.equal(result.status, 0, `${label}: hook exited ${result.status}: ${result.stderr}`);
  assert.match(result.stdout, /"decision": "block"/, `${label}: expected PostToolUse block`);
  assert.match(result.stdout, pattern, `${label}: wrong PostToolUse reason`);
}

function pre(testCase, toolName, toolInput) {
  return runHook(testCase, "PreToolUse", toolName, toolInput);
}

function post(testCase, toolName, toolInput, toolResponse) {
  return runHook(testCase, "PostToolUse", toolName, toolInput, toolResponse);
}

function figmaReadback(manifest, overrides = {}) {
  return {
    rootNodeId: manifest.figma.rootNodeId,
    sourceComponentId: manifest.figma.sourceComponentId,
    episodeInstanceId: manifest.figma.episodeInstanceId,
    nodeType: manifest.figma.episodeUsesInstance ? "INSTANCE" : "FRAME",
    sourceRevision: manifest.figma.sourceRevision,
    focalAssets: manifest.figma.focalAssets.map(({ nodeId, kind, layoutRole, centerX }) => ({
      nodeId,
      kind,
      layoutRole,
      opaqueBounds: { x: centerX - 100, y: 100, width: 200, height: 200 },
    })),
    ...overrides,
  };
}

const hookConfig = JSON.parse(fs.readFileSync(path.join(sourceRoot, ".codex/hooks.json"), "utf8"));
const lineupsPreMatcher = hookConfig.hooks.PreToolUse.find((entry) => entry.hooks.some((item) => item.command.includes("lineups_enforcement.py"))).matcher;
const lineupsPostMatcher = hookConfig.hooks.PostToolUse.find((entry) => entry.hooks.some((item) => item.command.includes("lineups_enforcement.py"))).matcher;
const preRegex = new RegExp(lineupsPreMatcher);
const postRegex = new RegExp(lineupsPostMatcher);
for (const toolName of [
  "mcp__codex_apps__figma_use_figma",
  "mcp__codex_apps__figma_weave_run_tool",
  "mcp__codex_apps__figma_export_video",
  "mcp__premiere_pro__import_media",
  "mcp__premiere_pro__add_to_timeline",
  "mcp__premiere_pro__replace_clip",
  "mcp__premiere_pro__move_clip",
  "mcp__premiere_pro__trim_clip",
  "mcp__premiere_pro__add_transition",
  "mcp__premiere_pro__batch_add_transitions",
  "mcp__premiere_pro__apply_effect",
  "mcp__premiere_pro__apply_lut",
  "mcp__premiere_pro__set_clip_opacity",
  "mcp__premiere_pro__delete_project_item",
]) {
  assert.ok(preRegex.test(toolName), `PreToolUse matcher misses ${toolName}`);
}
for (const toolName of [
  "mcp__codex_apps__figma_use_figma",
  "mcp__codex_apps__figma_export_video",
  "mcp__premiere_pro__import_media",
  "mcp__premiere_pro__add_to_timeline",
  "mcp__premiere_pro__get_project_item_info",
  "mcp__premiere_pro__get_full_sequence_info",
]) {
  assert.ok(postRegex.test(toolName), `PostToolUse matcher misses ${toolName}`);
}
assert.ok(!preRegex.test("mcp__premiere_pro__get_transcript"), "read-only transcript calls must stay outside the mutation matcher");

const cases = [];
function withCase(callback) {
  const testCase = createCase();
  cases.push(testCase);
  callback(testCase);
}

try {
  withCase((testCase) => {
    fs.rmSync(testCase.manifestPath);
    expectDenied(
      pre(testCase, "mcp__codex_apps__figma_use_figma", rankFigmaInput),
      /requires an active scene manifest.*transcript anchor.*Manim timing validation.*Figma Motion/,
      "unenrolled Lineups Figma mutation",
    );
    expectAllowed(
      pre(testCase, "mcp__codex_apps__figma_use_figma", { ...rankFigmaInput, fileKey: "OTHER_FILE" }),
      "unenrolled unrelated Figma mutation",
    );
  });

  withCase((testCase) => {
    const manifest = rankRevealManifest();
    writeManifest(testCase, manifest);
    assert.equal(validateManifestSchema(manifest), true, JSON.stringify(validateManifestSchema.errors));
    expectAllowed(pre(testCase, "mcp__codex_apps__figma_use_figma", rankFigmaInput), "valid weekly Rank Reveal");
    expectPostPass(
      post(testCase, "mcp__codex_apps__figma_use_figma", rankFigmaInput, figmaReadback(manifest, {
        background: manifest.figma.background,
        rankReveal: manifest.figma.rankReveal,
      })),
      /Figma mutation readback passed/,
      "Rank Reveal canonical and timing readback",
    );

    const failures = [
      ["stale Rank Reveal source", (m) => { m.figma.sourceComponentId = "835:231"; }, /normalized canonical source/],
      ["raw Rank Reveal logo", (m) => { m.figma.rankReveal.logoAssignments[0].componentName = "Asset\/Team Logo\/Raw Team"; }, /raw or non-normalized logo/],
      ["non-cumulative Rank Reveal", (m) => { m.figma.rankReveal.visibleRanks = [9]; }, /preserve every prior 10-to-1 reveal/],
      ["missing Manim timing authority", (m) => { m.motion.timingValidator = null; }, /requires Manim.*transcript timing validat/],
      ["missing Figma Motion alignment", (m) => { m.figma.motionTracks[0].keyframes[0].time = 0.2; }, /row fades must begin at scene time 0/],
    ];
    for (const [label, mutate, pattern] of failures) {
      const changed = rankRevealManifest();
      mutate(changed);
      writeManifest(testCase, changed);
      expectDenied(pre(testCase, "mcp__codex_apps__figma_use_figma", rankFigmaInput), pattern, label);
    }

    const laterReveal = rankRevealManifest(9);
    writeManifest(testCase, laterReveal);
    assert.equal(validateManifestSchema(laterReveal), true, JSON.stringify(validateManifestSchema.errors));
    expectAllowed(pre(testCase, "mcp__codex_apps__figma_use_figma", rankFigmaInput), "valid later Rank Reveal");

    const replayedCascade = rankRevealManifest(9);
    const initialReveal = rankRevealManifest(10);
    replayedCascade.motion.cues.unshift(initialReveal.motion.cues[0]);
    replayedCascade.figma.motionTracks.unshift(...initialReveal.figma.motionTracks.slice(0, 10));
    replayedCascade.timing.entranceTimes = [0, 1.5];
    writeManifest(testCase, replayedCascade);
    expectDenied(
      pre(testCase, "mcp__codex_apps__figma_use_figma", rankFigmaInput),
      /must not replay the full-board cascade/,
      "later Rank Reveal replaying full board",
    );
  });

  for (const [lane, option] of [["stat breakdown", "stat breakdown"], ["comparison", "Simple comparison"], ["comparison", "Full comparison: 2"], ["year-by-year", "Trend table"], ["recurring board", "Super Bowl Bubble Board"]]) {
    withCase((testCase) => {
      const m = readManifest(testCase);
      m.scene.lane = lane; m.scene.approvedOption = option;
      writeManifest(testCase, m);
      expectDenied(pre(testCase, "mcp__codex_apps__figma_use_figma", approvedFigmaInput), /figma.background/, `${option} missing background`);
      m.figma.background = {setting: "Field Night / No football", nodeId: "background-node", imageHash: "6c84d05a7f038c5e3f9f14a4103cd9b533251e70", locked: true, separateFromArtwork: true};
      writeManifest(testCase, m);
      assert.equal(validateManifestSchema(m), true, JSON.stringify(validateManifestSchema.errors));
      expectAllowed(pre(testCase, "mcp__codex_apps__figma_use_figma", approvedFigmaInput), `${option} approved field`);
      const response = {rootNodeId: m.figma.rootNodeId, sourceComponentId: m.figma.sourceComponentId, episodeInstanceId: m.figma.episodeInstanceId, nodeType: "FRAME", sourceRevision: m.figma.sourceRevision};
      expectPostBlock(post(testCase, "mcp__codex_apps__figma_use_figma", approvedFigmaInput, response), /locked no-football background/, `${option} missing background readback`);
      expectPostPass(post(testCase, "mcp__codex_apps__figma_use_figma", approvedFigmaInput, {content: [{type: "text", text: JSON.stringify({...response, background: m.figma.background})}]}), /Figma mutation readback passed/, `${option} background readback`);
      const wrong = {...m.figma.background, imageHash: "f".repeat(40)};
      expectPostBlock(post(testCase, "mcp__codex_apps__figma_use_figma", approvedFigmaInput, {...response, background: wrong}), /locked no-football background/, `${option} changed art readback`);
      m.figma.background = wrong; writeManifest(testCase, m);
      expectDenied(pre(testCase, "mcp__codex_apps__figma_use_figma", approvedFigmaInput), /approved no-football/, `${option} wrong art`);
      m.figma.background.imageHash = "6c84d05a7f038c5e3f9f14a4103cd9b533251e70";
      m.figma.background.separateFromArtwork = false; writeManifest(testCase, m);
      expectDenied(pre(testCase, "mcp__codex_apps__figma_use_figma", approvedFigmaInput), /separate from transparent artwork/, `${option} baked background`);
    });
  }
  withCase((testCase) => {
    expectAllowed(pre(testCase, "mcp__codex_apps__figma_use_figma", approvedFigmaInput), "approved Figma transaction");

    expectDenied(
      pre(testCase, "mcp__codex_apps__figma_use_figma", {
        ...approvedFigmaInput,
        skillNames: "singleton-figma-system,figma-use",
      }),
      /file-hygiene, layer-cleanup/,
      "missing baseline Figma hygiene skills",
    );

    expectDenied(
      pre(testCase, "mcp__codex_apps__figma_use_figma", {
        ...approvedFigmaInput,
        code: `${approvedFigmaInput.code}\nconst frame = figma.createFrame(); frame.layoutMode = "VERTICAL";`,
      }),
      /safe-auto-layout-conversion/,
      "missing Auto Layout conversion skill",
    );

    expectDenied(
      pre(testCase, "mcp__codex_apps__figma_use_figma", {
        ...approvedFigmaInput,
        description: "Lineups color and contrast update",
      }),
      /accessibility-review/,
      "missing accessibility skill",
    );

    const manifest = readManifest(testCase);
    expectPostPass(
      post(testCase, "mcp__codex_apps__figma_use_figma", approvedFigmaInput, figmaReadback(manifest)),
      /Figma mutation readback passed/,
      "Figma readback",
    );
    const offAxisAssets = figmaReadback(manifest).focalAssets.map((asset) =>
      asset.layoutRole === "logo"
        ? { ...asset, opaqueBounds: { ...asset.opaqueBounds, x: asset.opaqueBounds.x - 180 } }
        : asset,
    );
    expectPostBlock(
      post(testCase, "mcp__codex_apps__figma_use_figma", approvedFigmaInput, figmaReadback(manifest, { focalAssets: offAxisAssets })),
      /opaque bounds.*960 px centerline/,
      "off-axis opaque logo bounds",
    );
    expectPostBlock(
      post(testCase, "mcp__codex_apps__figma_use_figma", approvedFigmaInput, figmaReadback(manifest, { sourceRevision: "figma-revision-stale" })),
      /current approved source revision/,
      "stale Figma mutation readback",
    );
  });

  withCase((testCase) => {
    expectDenied(
      pre(testCase, "mcp__codex_apps__figma_use_figma", { ...approvedFigmaInput, code: "figma.createFrame();" }),
      /approved transaction hash/,
      "loose-layer rebuild",
    );
    expectDenied(
      pre(testCase, "mcp__codex_apps__figma_use_figma", { ...approvedFigmaInput, code: "instance.setProperties({GuardedBackground: 'replace'});" }),
      /approved transaction hash/,
      "guarded property replacement",
    );
    expectDenied(
      pre(testCase, "mcp__codex_apps__figma_weave_run_tool", { recipeId: "bypass" }),
      /not an approved Lineups mutation path/,
      "Weave bypass",
    );
  });

  for (const [label, mutate, pattern] of [
    ["off-center focal asset", (m) => { m.figma.focalAssets[0].centered = false; }, /off-center without an approved exception/],
    ["repeated episode source", (m) => { m.figma.assetLedger[1].sourceId = m.figma.assetLedger[0].sourceId; }, /only once per episode/],
    ["misaligned center subject", (m) => { m.figma.focalAssets.find(({layoutRole}) => layoutRole === "center").centerX = 910; }, /share the 960 px centerline/],
    ["missing centered logo", (m) => { m.figma.focalAssets = m.figma.focalAssets.filter(({layoutRole}) => layoutRole !== "logo"); }, /exactly one left, center, right, and logo role/],
    ["incomplete three-subject roles", (m) => { m.figma.focalAssets = m.figma.focalAssets.filter(({layoutRole}) => !["right", "logo"].includes(layoutRole)); }, /exactly one left, center, right, and logo role/],
    ["duplicate three-subject role", (m) => { m.figma.focalAssets.push({...m.figma.focalAssets.find(({layoutRole}) => layoutRole === "left"), nodeId: "duplicate-left"}); }, /duplicate left roles/],
    ["wrong three-subject logo kind", (m) => { m.figma.focalAssets.find(({layoutRole}) => layoutRole === "logo").kind = "photo"; }, /logo role must use kind logo/],
    ["missing approved source revision", (m) => { delete m.figma.sourceRevision; }, /figma.sourceRevision/],
    ["fade-out", (m) => { m.figma.motionTracks[0].keyframes.at(-1).value = 0; }, /fades visible content back out/],
    ["zero opacity row", (m) => { m.figma.motionTracks[0].keyframes = [{ time: 0, value: 0 }, { time: 14.2, value: 0 }]; }, /remains 0 -> 0/],
    ["track exceeds root", (m) => { m.figma.motionTracks[1].duration = 14.3; }, /exceeds the root duration/],
    ["keyframe exceeds track", (m) => { m.figma.motionTracks[1].duration = 10; }, /keyframe beyond its duration/],
    ["missing trim-safe padding", (m) => { m.timing.paddedCompositionEnd = 11.19; }, /at least ten seconds.*two seconds of trim-safe padding/],
    ["missing Whisper word timing", (m) => { m.timing.timestampResolution = "segment"; }, /Whisper word-timestamp transcript/],
    ["missing Manim timing gate", (m) => { m.timing.manimTimingValidated = false; }, /Manim timing gate/],
    ["cue anchor drift", (m) => { m.motion.cues[1].sceneTime = 1.3; m.timing.entranceTimes[1] = 1.3; }, /transcriptTimestamp minus the verified anchor/],
    ["cue entrance drift", (m) => { m.timing.entranceTimes[1] = 1.25; }, /entranceTimes must match motion cue/],
    ["duplicate cue ID", (m) => { m.motion.cues[1].cueId = m.motion.cues[0].cueId; }, /cue IDs must be present and unique/],
    ["cue after content", (m) => { m.motion.cues[3].duration = 2; }, /extends beyond contentEnd/],
    ["loose episode composition", (m) => { m.figma.episodeUsesInstance = true; }, /must use a detached working copy/],
    ["missing detached-copy contract", (m) => { delete m.figma.motionWorkingCopyMode; }, /figma.motionWorkingCopyMode/],
    ["unnoted Premiere approval", (m) => { m.policy.effectsApproved = true; }, /needs an explicit approval note/],
  ]) {
    withCase((testCase) => {
      const manifest = readManifest(testCase);
      mutate(manifest);
      writeManifest(testCase, manifest);
      expectDenied(pre(testCase, "mcp__codex_apps__figma_use_figma", approvedFigmaInput), pattern, label);
    });
  }

  withCase((testCase) => {
    expectAllowed(
      pre(testCase, "mcp__codex_apps__figma_export_video", { fileKey: "LINEUPS_FILE_KEY", nodeId: "428:9000", quality: "high" }),
      "valid Figma export",
    );
    const manifest = readManifest(testCase);
    manifest.export.motionProof.sampleTimes = [0];
    writeManifest(testCase, manifest);
    expectDenied(
      pre(testCase, "mcp__codex_apps__figma_export_video", { fileKey: "LINEUPS_FILE_KEY", nodeId: "428:9000" }),
      /motion proof/,
      "export without motion proof",
    );
  });

  withCase((testCase) => {
    const manifest = readManifest(testCase);
    manifest.figma.rootNodeId = "pending:scene-07";
    manifest.figma.episodeInstanceId = "pending:scene-07";
    writeManifest(testCase, manifest);
    const input = {...approvedFigmaInput, description: "Initialize Lineups scene BIGTEN-SEC-01/scene-07"};
    manifest.enforcement.approvedToolInputSha256 = hashValue(input);
    writeManifest(testCase, manifest);
    expectAllowed(pre(testCase, "mcp__codex_apps__figma_use_figma", input), "planned Figma scene initialization");
    expectPostPass(
      post(testCase, "mcp__codex_apps__figma_use_figma", input, {
        plannedRootNodeId: "pending:scene-07",
        rootNodeId: "428:9900",
        sourceComponentId: manifest.figma.sourceComponentId,
        episodeInstanceId: "428:9900",
        nodeType: "FRAME",
        sourceRevision: manifest.figma.sourceRevision,
        focalAssets: figmaReadback(manifest).focalAssets,
      }),
      /Figma mutation readback passed/,
      "planned Figma scene initialization readback",
    );
  });

  withCase((testCase) => {
    const manifest = readManifest(testCase);
    manifest.export.motionProof.sampleTimes = [0, 14.1];
    writeManifest(testCase, manifest);
    expectDenied(
      pre(testCase, "mcp__codex_apps__figma_export_video", { fileKey: "LINEUPS_FILE_KEY", nodeId: "428:9000" }),
      /missing cue sample near 1.2/,
      "proof missing a cue frame",
    );
  });

  withCase((testCase) => {
    const manifest = readManifest(testCase);
    manifest.motion.engine = "manim";
    manifest.motion.engineVersion = "0.19.0";
    manifest.motion.sourcePath = "scenes/scene-07.py";
    manifest.motion.sceneClass = "Scene07";
    manifest.figma.motionTracks = [];
    manifest.export.motionProof.type = "cue-frame-proof";
    manifest.export.motionProof.engine = "manim";
    writeManifest(testCase, manifest);
    expectDenied(
      pre(testCase, "mcp__codex_apps__figma_use_figma", approvedFigmaInput),
      /Figma Motion as its sole visual engine/,
      "Manim cannot become a Lineups renderer",
    );
  });

  withCase((testCase) => {
    fs.rmSync(path.join(testCase.receiptDir, "scene-07.figma-to-export.receipt.json"));
    expectDenied(
      pre(testCase, "mcp__codex_apps__figma_export_video", { fileKey: "LINEUPS_FILE_KEY", nodeId: "428:9000" }),
      /figma-to-export receipt could not be read/,
      "missing export receipt",
    );
  });

  withCase((testCase) => {
    const renderPath = path.join(testCase.fixture, "render-proof.mp4");
    const validImport = { filePath: renderPath, binName: "06 Motion Renders" };
    expectAllowed(pre(testCase, "mcp__premiere_pro__import_media", validImport), "valid Premiere import");
    expectDenied(
      pre(testCase, "mcp__premiere_pro__import_media", { filePath: renderPath }),
      /06 Motion Renders bin/,
      "import at project root",
    );
    fs.appendFileSync(renderPath, "replacement");
    expectDenied(pre(testCase, "mcp__premiere_pro__import_media", validImport), /render hash does not match/, "stale render hash");
  });

  withCase((testCase) => {
    const manifest = readManifest(testCase);
    manifest.export.artifactRole = "alpha-helper";
    manifest.export.backgroundPolicy = "transparent";
    writeManifest(testCase, manifest);
    refreshReceiptChain(testCase);
    expectDenied(
      pre(testCase, "mcp__premiere_pro__import_media", {
        filePath: path.join(testCase.fixture, "render-proof.mp4"),
        binName: "06 Motion Renders",
      }),
      /finished football-visible Premiere render/,
      "Asset Swap alpha helper import",
    );
  });

  withCase((testCase) => {
    const receiptPath = path.join(testCase.receiptDir, "scene-07.export-to-premiere.receipt.json");
    const receipt = JSON.parse(fs.readFileSync(receiptPath, "utf8"));
    receipt.status = "failed";
    fs.writeFileSync(receiptPath, `${JSON.stringify(receipt, null, 2)}\n`);
    expectDenied(
      pre(testCase, "mcp__premiere_pro__import_media", { filePath: path.join(testCase.fixture, "render-proof.mp4"), binName: "06 Motion Renders" }),
      /receipt hash is stale or invalid/,
      "failed or tampered receipt",
    );
  });

  withCase((testCase) => {
    const manifest = readManifest(testCase);
    manifest.figma.sourceRevision = "figma-revision-current";
    writeManifest(testCase, manifest);
    const receiptPath = path.join(testCase.receiptDir, "scene-07.figma-to-export.receipt.json");
    const receipt = JSON.parse(fs.readFileSync(receiptPath, "utf8"));
    receipt.evidence.sourceRevision = "figma-revision-stale";
    fs.writeFileSync(receiptPath, `${JSON.stringify(receipt, null, 2)}\n`);
    refreshReceiptChain(testCase);
    expectDenied(
      pre(testCase, "mcp__premiere_pro__import_media", {
        filePath: path.join(testCase.fixture, "render-proof.mp4"),
        binName: "06 Motion Renders",
      }),
      /approved Figma source revision/,
      "stale Figma source revision receipt",
    );
  });

  withCase((testCase) => {
    const manifest = readManifest(testCase);
    manifest.export.motionProof.frames = [
      { time: 0, sha256: "a".repeat(64), width: 1920, height: 1080 },
      { time: 14.1, sha256: "b".repeat(64), width: 1920, height: 1080 },
    ];
    writeManifest(testCase, manifest);
    const receiptPath = path.join(testCase.receiptDir, "scene-07.figma-to-export.receipt.json");
    const receipt = JSON.parse(fs.readFileSync(receiptPath, "utf8"));
    receipt.evidence.proofFrames = [
      { time: 0, sha256: "c".repeat(64), width: 1920, height: 1080 },
      { time: 14.1, sha256: "b".repeat(64), width: 1920, height: 1080 },
    ];
    fs.writeFileSync(receiptPath, `${JSON.stringify(receipt, null, 2)}\n`);
    refreshReceiptChain(testCase);
    expectDenied(
      pre(testCase, "mcp__premiere_pro__import_media", {
        filePath: path.join(testCase.fixture, "render-proof.mp4"),
        binName: "06 Motion Renders",
      }),
      /current visible proof frames/,
      "stale visible proof frame receipt",
    );
  });

  withCase((testCase) => {
    const placement = {
      projectItemId: "project-item-scene-07",
      sequenceId: "sequence-lineups-01",
      trackIndex: 2,
      time: 312.4,
      insertMode: "overwrite",
      linkAudio: false,
    };
    expectAllowed(pre(testCase, "mcp__premiere_pro__add_to_timeline", placement), "valid timeline placement");
    expectDenied(
      pre(testCase, "mcp__premiere_pro__add_to_timeline", { ...placement, time: 309.8 }),
      /verified transcript anchor/,
      "placement before transcript anchor",
    );
  });

  withCase((testCase) => {
    for (const [toolName, input, pattern] of [
      ["mcp__premiere_pro__add_transition", { clipId1: "timeline-clip-scene-07", clipId2: "other", duration: 1, transitionName: "Blur Dissolve" }, /transitions are not approved/],
      ["mcp__premiere_pro__batch_add_transitions", { sequenceId: "sequence-lineups-01", trackIndex: 2, duration: 1, transitionName: "Blur Dissolve" }, /transitions are not approved/],
      ["mcp__premiere_pro__apply_effect", { clipId: "timeline-clip-scene-07", effectName: "Gaussian Blur" }, /effects are not approved/],
      ["mcp__premiere_pro__apply_lut", { clipId: "timeline-clip-scene-07", lutPath: "/tmp/test.cube" }, /LUTs are not approved/],
      ["mcp__premiere_pro__set_clip_opacity", { clipId: "timeline-clip-scene-07", opacity: 80 }, /opacity changes are not approved/],
      ["mcp__premiere_pro__delete_project_item", { projectItemId: "project-item-scene-07" }, /destructive Premiere mutations/],
    ]) {
      expectDenied(pre(testCase, toolName, input), pattern, toolName);
    }
  });

  withCase((testCase) => {
    const importInput = { filePath: path.join(testCase.fixture, "render-proof.mp4"), binName: "06 Motion Renders" };
    expectPostPass(
      post(testCase, "mcp__premiere_pro__import_media", importInput, { projectItemId: "project-item-scene-07" }),
      /expected project item/,
      "import output",
    );
    expectPostBlock(
      post(testCase, "mcp__premiere_pro__get_project_item_info", { projectItemId: "project-item-scene-07" }, { projectItemId: "project-item-scene-07", treePath: "root/scene-07.mp4" }),
      /expected treePath/,
      "wrong import treePath",
    );
    expectPostPass(
      post(testCase, "mcp__premiere_pro__get_project_item_info", { projectItemId: "project-item-scene-07" }, {
        projectItemId: "project-item-scene-07",
        treePath: "BIGTEN-SEC-01/06 Motion Renders/scene-07.mp4",
        colorLabel: "Caribbean",
      }),
      /import readback passed/,
      "valid import readback",
    );
    expectPostPass(
      post(testCase, "mcp__premiere_pro__add_to_timeline", { projectItemId: "project-item-scene-07", sequenceId: "sequence-lineups-01", trackIndex: 2, time: 312.4 }, { clipId: "timeline-clip-scene-07" }),
      /timeline mutation returned the expected clip/,
      "valid placement output",
    );
    expectPostPass(
      post(testCase, "mcp__premiere_pro__get_full_sequence_info", { sequenceId: "sequence-lineups-01" }, {
        sequenceId: "sequence-lineups-01",
        clips: [{ clipId: "timeline-clip-scene-07", trackIndex: 2, startTime: 312.4, duration: 14.2, endTime: 326.6 }],
      }),
      /placement readback passed/,
      "valid placement readback",
    );
  });

  withCase((testCase) => {
    const manifest = readManifest(testCase);
    manifest.premiere.approvedDuration = 14.2;
    manifest.premiere.approvedEndTime = 326.6;
    writeManifest(testCase, manifest);
    refreshReceiptChain(testCase);
    expectPostBlock(
      post(testCase, "mcp__premiere_pro__get_full_sequence_info", { sequenceId: "sequence-lineups-01" }, {
        sequenceId: "sequence-lineups-01",
        clips: [{
          clipId: "timeline-clip-scene-07",
          trackIndex: 2,
          startTime: 6312.4,
          duration: 1,
          endTime: 6313.4,
        }],
      }),
      /exact start, duration, end, and track/,
      "deceptive Premiere placement readback",
    );
  });

  withCase((testCase) => {
    fs.writeFileSync(testCase.manifestPath, "{ malformed");
    expectDenied(
      pre(testCase, "mcp__codex_apps__figma_use_figma", approvedFigmaInput),
      /active Lineups manifest could not be read/,
      "validator failure fails closed",
    );
  });

  withCase((testCase) => {
    fs.rmSync(testCase.manifestPath);
    expectAllowed(pre(testCase, "mcp__codex_apps__figma_use_figma", approvedFigmaInput), "unenrolled file boundary");
  });

  {
    const testCase = createCase();
    cases.push(testCase);
    const proof = createLineupsReconciliation({
      root: testCase.root,
      manifestPath: testCase.manifestPath,
      receiptDirectory: testCase.receiptDir,
    });
    const transaction = createTransaction(proof.definition);
    await executeTransaction(transaction, proof.adapters, { mode: "reconcile", continueOnFailure: true });
    assert.equal(transaction.status, "completed", transaction.error);
    assert.equal(canComplete(transaction), true);
    assert.deepEqual(
      transaction.receipts.map(({ ownerId }) => ownerId),
      ["figma-scene", "eagle-render", "premiere-import", "premiere-placement"],
    );
  }

  {
    const testCase = createCase();
    cases.push(testCase);
    const receiptPath = path.join(testCase.receiptDir, "scene-07.figma-to-export.receipt.json");
    const receipt = JSON.parse(fs.readFileSync(receiptPath, "utf8"));
    receipt.evidence.rootNodeId = "tampered-node";
    fs.writeFileSync(receiptPath, `${JSON.stringify(receipt, null, 2)}\n`);
    const proof = createLineupsReconciliation({
      root: testCase.root,
      manifestPath: testCase.manifestPath,
      receiptDirectory: testCase.receiptDir,
    });
    const transaction = createTransaction(proof.definition);
    await executeTransaction(transaction, proof.adapters, { mode: "reconcile", continueOnFailure: true });
    assert.equal(transaction.status, "incomplete");
    assert.equal(transaction.mutationLedger[0].status, "stale");
    assert.ok(transaction.mutationLedger.slice(1).every(({ status }) => status === "stale"));
    assert.equal(canComplete(transaction), false);
  }

  {
    const testCase = createCase();
    cases.push(testCase);
    const manifest = readManifest(testCase);
    manifest.review.status = "pending";
    manifest.review.reviewer = null;
    manifest.review.reviewedAt = null;
    writeManifest(testCase, manifest);
    const proof = createLineupsReconciliation({
      root: testCase.root,
      manifestPath: testCase.manifestPath,
      receiptDirectory: testCase.receiptDir,
    });
    const transaction = createTransaction(proof.definition);
    await executeTransaction(transaction, proof.adapters, { mode: "reconcile", continueOnFailure: true });
    assert.equal(transaction.status, "awaiting_review");
    assert.equal(canComplete(transaction), false);
  }
} finally {
  for (const testCase of cases) fs.rmSync(testCase.root, { recursive: true, force: true });
}

console.log("Lineups enforcement check passed: hook decisions plus shared transaction completion, staleness, and review gates.");
