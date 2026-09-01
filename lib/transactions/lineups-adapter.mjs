import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import { cloneValue, hashValue } from "./contract.mjs";

const STAGES = Object.freeze([
  { ownerId: "figma-scene", stage: "figma-to-export", dependsOn: [] },
  { ownerId: "eagle-render", stage: "export-to-premiere", dependsOn: ["figma-scene"] },
  { ownerId: "premiere-import", stage: "premiere-import", dependsOn: ["eagle-render"] },
  { ownerId: "premiere-placement", stage: "premiere-placement", dependsOn: ["premiere-import"] },
]);

function readJson(file, label) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (error) {
    throw new Error(`${label} could not be read: ${error.message}`);
  }
}

function fileHash(file) {
  return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}

function receiptHash(receipt) {
  const unsigned = cloneValue(receipt);
  delete unsigned.receiptSha256;
  return hashValue(unsigned);
}

function ownerUri(manifest, ownerId) {
  if (ownerId === "figma-scene") {
    return `figma://${manifest.figma.fileKey}/nodes/${manifest.figma.rootNodeId}`;
  }
  if (ownerId === "eagle-render") {
    return `eagle://${manifest.ownership.eaglePath}/${manifest.scene.sceneId}.mp4`;
  }
  if (ownerId === "premiere-import") {
    return `premiere://${manifest.scene.episodeId}/items/${manifest.premiere.projectItemId}`;
  }
  return `premiere://${manifest.premiere.sequenceId}/clips/${manifest.premiere.timelineClipId}`;
}

function expectedState(manifest, ownerId) {
  if (ownerId === "figma-scene") {
    return {
      fileKey: manifest.figma.fileKey,
      rootNodeId: manifest.figma.rootNodeId,
      sourceComponentId: manifest.figma.sourceComponentId,
      episodeInstanceId: manifest.figma.episodeInstanceId,
      motionEngine: manifest.motion.engine,
      cueSha256: hashValue(manifest.motion.cues),
    };
  }
  if (ownerId === "eagle-render") {
    return {
      exportPath: manifest.export.path,
      fileSha256: manifest.export.fileSha256,
      eaglePath: manifest.ownership.eaglePath,
      motionEngine: manifest.motion.engine,
      cueSha256: hashValue(manifest.motion.cues),
    };
  }
  if (ownerId === "premiere-import") {
    return {
      projectItemId: manifest.premiere.projectItemId,
      treePath: manifest.premiere.treePath,
      labelReadback: manifest.premiere.labelReadback,
    };
  }
  return {
    timelineClipId: manifest.premiere.timelineClipId,
    sequenceId: manifest.premiere.sequenceId,
    trackIndex: manifest.premiere.trackIndex,
    startTime: manifest.premiere.approvedStartTime,
  };
}

function verifyStage({ manifest, manifestSha256, receipt, stage, priorReceipt, root }) {
  if (receipt.schemaVersion !== 1 || receipt.stage !== stage.stage) {
    return { ok: false, error: `${stage.ownerId} receipt names the wrong stage` };
  }
  if (receipt.episodeId !== manifest.scene.episodeId || receipt.sceneId !== manifest.scene.sceneId) {
    return { ok: false, error: `${stage.ownerId} receipt names a different scene` };
  }
  if (receipt.manifestSha256 !== manifestSha256) {
    return { ok: false, error: `${stage.ownerId} receipt is stale for the current manifest` };
  }
  if (receipt.receiptSha256 !== receiptHash(receipt)) {
    return { ok: false, error: `${stage.ownerId} receipt hash is stale or tampered` };
  }
  if (receipt.previousReceiptSha256 !== (priorReceipt?.receiptSha256 ?? null)) {
    return { ok: false, error: `${stage.ownerId} receipt does not chain to its required owner` };
  }
  if (receipt.status !== "passed") {
    return { ok: false, error: `${stage.ownerId} receipt is incomplete` };
  }
  if (receipt.review?.status !== "approved" || receipt.review?.reviewer !== "Jerami") {
    return { ok: false, error: `${stage.ownerId} receipt lacks Jerami review` };
  }
  const expected = expectedState(manifest, stage.ownerId);
  for (const [field, value] of Object.entries(expected)) {
    if (hashValue(receipt.evidence?.[field]) !== hashValue(value)) {
      return { ok: false, error: `${stage.ownerId} readback mismatches ${field}` };
    }
  }
  if (stage.ownerId !== "figma-scene") {
    const exportFile = path.resolve(root, manifest.export.path);
    if (!fs.existsSync(exportFile) || fileHash(exportFile) !== manifest.export.fileSha256) {
      return { ok: false, error: `${stage.ownerId} render is missing or stale` };
    }
    if (receipt.artifactSha256 !== manifest.export.fileSha256) {
      return { ok: false, error: `${stage.ownerId} receipt names the wrong render hash` };
    }
  }
  return {
    ok: true,
    evidence: {
      stage: stage.stage,
      externalReceiptSha256: receipt.receiptSha256,
      manifestSha256,
      artifactSha256: receipt.artifactSha256,
    },
  };
}

export function createLineupsReconciliation(options) {
  const root = path.resolve(options.root);
  const manifestPath = path.resolve(options.manifestPath);
  const receiptDirectory = path.resolve(options.receiptDirectory);
  const manifest = readJson(manifestPath, "Lineups manifest");
  const manifestSha256 = hashValue(manifest);
  const transactionId = `tx-lineups-${manifest.scene.episodeId}-${manifest.scene.sceneId}-${manifestSha256.slice(0, 12)}`;

  const definition = {
    transactionId,
    idempotencyKey: `lineups:${manifest.scene.episodeId}:${manifest.scene.sceneId}:${manifestSha256}`,
    intent: `Deliver approved Lineups scene ${manifest.scene.sceneId} through its named motion engine, Eagle, and Premiere with readback.`,
    lane: manifest.scene.lane,
    route: "client-video",
    declaredOwners: STAGES.map((stage) => ({
      ownerId: stage.ownerId,
      uri: ownerUri(manifest, stage.ownerId),
      required: true,
      dependsOn: [...stage.dependsOn],
      reviewGateId: "lineups-scene-review",
    })),
    expectedMutations: STAGES.map((stage) => ({
      ownerId: stage.ownerId,
      operation: `verify-${stage.stage}`,
      input: {
        stage: stage.stage,
        manifestSha256,
        expectedState: expectedState(manifest, stage.ownerId),
      },
      compensation: {
        operation: "manual-repair",
        instructions: `Repair ${stage.ownerId}, issue a fresh stage receipt, then rerun readback.`,
      },
    })),
    preconditions: [
      {
        preconditionId: "lineups-enforcement-active",
        required: true,
        status: manifest.enforcement?.active === true ? "passed" : "failed",
        evidence: { manifestPath },
      },
      {
        preconditionId: "lineups-export-validated",
        required: true,
        status: manifest.export?.validationStatus === "passed" ? "passed" : "failed",
        evidence: { fileSha256: manifest.export?.fileSha256 ?? null },
      },
    ],
    reviewGates: [
      {
        gateId: "lineups-scene-review",
        description: "Jerami approves the scene manifest and correction payload before mutation.",
        required: true,
        status:
          manifest.review?.status === "approved" && manifest.review?.reviewer === "Jerami"
            ? "approved"
            : "pending",
        reviewer: manifest.review?.reviewer ?? null,
        evidence: { correctionPayloadId: manifest.review?.correctionPayloadId ?? null },
        reviewedAt: manifest.review?.reviewedAt ?? null,
      },
    ],
  };

  const receipts = new Map();
  const adapters = Object.fromEntries(
    STAGES.map((stage, index) => [
      stage.ownerId,
      {
        async plan({ mutation }) {
          return cloneValue(mutation.input);
        },
        async apply() {
          throw new Error("Lineups live mutation is hook-gated; this adapter is readback-only");
        },
        async readback() {
          const receipt = readJson(
            path.join(receiptDirectory, `${manifest.scene.sceneId}.${stage.stage}.receipt.json`),
            `${stage.ownerId} receipt`,
          );
          receipts.set(stage.ownerId, receipt);
          return receipt;
        },
        async verify({ readback }) {
          return verifyStage({
            manifest,
            manifestSha256,
            receipt: readback,
            stage,
            priorReceipt: index === 0 ? null : receipts.get(STAGES[index - 1].ownerId),
            root,
          });
        },
        async receipt({ readback, verification }) {
          return {
            adapter: "lineups-stage-readback",
            stage: stage.stage,
            externalReceiptSha256: readback.receiptSha256,
            verification: cloneValue(verification.evidence),
          };
        },
      },
    ]),
  );

  return { definition, adapters, manifest, manifestSha256 };
}
