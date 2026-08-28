import fs from "node:fs";
import path from "node:path";
import { cloneValue, hashValue } from "./contract.mjs";

const ADAPTER_KINDS = new Set([
  "path-snapshot",
  "directory-parity",
  "command-readback",
  "git-state",
  "task-catalog",
]);

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function assertFlow(flowId, flow) {
  if (!flow) throw new Error(`unknown owner flow ${flowId}`);
  if (!Array.isArray(flow.owners) || flow.owners.length === 0) {
    throw new Error(`owner flow ${flowId} must declare owners`);
  }

  const seen = new Set();
  for (const owner of flow.owners) {
    if (!owner.ownerId || !owner.uri) throw new Error(`owner flow ${flowId} contains an invalid owner`);
    if (seen.has(owner.ownerId)) throw new Error(`owner flow ${flowId} repeats ${owner.ownerId}`);
    if (!ADAPTER_KINDS.has(owner.adapter?.kind)) {
      throw new Error(`owner ${owner.ownerId} uses unsupported adapter ${owner.adapter?.kind ?? "missing"}`);
    }
    for (const dependency of owner.dependsOn ?? []) {
      if (!seen.has(dependency)) {
        throw new Error(`owner ${owner.ownerId} must follow dependency ${dependency}`);
      }
    }
    seen.add(owner.ownerId);
  }
  return flow;
}

function pluginVersion(root) {
  const manifest = readJson(path.join(root, "plugins", "s-systems", ".codex-plugin", "plugin.json"));
  if (!manifest.version) throw new Error("SSystems plugin manifest is missing version");
  return manifest.version;
}

function replaceTokens(value, tokens) {
  if (Array.isArray(value)) return value.map((item) => replaceTokens(item, tokens));
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, replaceTokens(item, tokens)]));
  }
  if (typeof value !== "string") return value;
  return Object.entries(tokens).reduce(
    (result, [key, replacement]) => result.replaceAll(`{${key}}`, replacement),
    value,
  );
}

export function loadOwnerMap(file) {
  const ownerMap = readJson(file);
  if (!ownerMap || typeof ownerMap !== "object" || !ownerMap.flows) {
    throw new Error("transaction owner map must declare flows");
  }
  return ownerMap;
}

export function materializeOwnerFlow(options) {
  const root = path.resolve(options.root);
  const ownerMapPath = path.resolve(
    options.ownerMapPath ?? path.join(root, "config", "transactions", "owner-map.json"),
  );
  const ownerMap = loadOwnerMap(ownerMapPath);
  const flow = assertFlow(options.flowId, ownerMap.flows[options.flowId]);
  const tokens = { pluginVersion: pluginVersion(root) };
  const owners = cloneValue(flow.owners).map((owner) => ({
    ...owner,
    adapter: replaceTokens(owner.adapter, tokens),
  }));
  const graphHash = hashValue({ version: ownerMap.version, flow, tokens });
  const transactionId = options.transactionId ?? `tx-${options.flowId}-${graphHash.slice(0, 12)}`;

  return {
    graphHash,
    ownerMapPath,
    adapters: Object.fromEntries(owners.map((owner) => [owner.ownerId, owner.adapter])),
    definition: {
      transactionId,
      idempotencyKey: `${options.flowId}:${graphHash}`,
      intent: flow.intent,
      lane: flow.lane,
      route: flow.route,
      declaredOwners: owners.map((owner) => ({
        ownerId: owner.ownerId,
        uri: owner.uri,
        required: owner.required !== false,
        dependsOn: cloneValue(owner.dependsOn ?? []),
        reviewGateId: owner.reviewGateId ?? null,
      })),
      expectedMutations: owners.map((owner) => ({
        ownerId: owner.ownerId,
        operation: `reconcile-${owner.adapter.kind}`,
        input: { adapter: owner.adapter },
        compensation: {
          operation: "manual-repair",
          instructions: `Repair ${owner.ownerId}, then rerun readback before completion.`,
        },
      })),
      preconditions: [
        {
          preconditionId: "readback-only-run",
          required: true,
          status: "passed",
          evidence: "No live mutation adapter is enabled.",
        },
      ],
      reviewGates: cloneValue(flow.reviewGates ?? []).map((gate) => ({
        gateId: gate.gateId,
        description: gate.description ?? null,
        required: gate.required !== false,
        status: gate.status ?? "pending",
        reviewer: gate.reviewer ?? null,
        evidence: gate.evidence ?? null,
        reviewedAt: gate.reviewedAt ?? null,
      })),
    },
  };
}
