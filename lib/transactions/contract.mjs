import { createHash } from "node:crypto";

export const TRANSACTION_STATUSES = Object.freeze([
  "planned",
  "awaiting_review",
  "applying",
  "interrupted",
  "incomplete",
  "completed",
]);

export const OWNER_STATUSES = Object.freeze(["pending", "applied", "verified", "failed", "stale"]);

function sortedValue(value) {
  if (Array.isArray(value)) return value.map(sortedValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, item]) => [key, sortedValue(item)]),
    );
  }
  return value;
}

export function canonicalJson(value) {
  return JSON.stringify(sortedValue(value));
}

export function hashValue(value) {
  return createHash("sha256").update(canonicalJson(value)).digest("hex");
}

export function cloneValue(value) {
  return structuredClone(value);
}

function assertString(value, label) {
  if (typeof value !== "string" || value.trim() === "") throw new Error(`${label} is required`);
}

export function assertAdapter(adapter, ownerId) {
  if (!adapter || typeof adapter !== "object") throw new Error(`adapter ${ownerId} is missing`);
  for (const operation of ["plan", "apply", "readback", "verify", "receipt"]) {
    if (typeof adapter[operation] !== "function") {
      throw new Error(`adapter ${ownerId} must implement ${operation}()`);
    }
  }
  return adapter;
}

export function assertDefinition(definition) {
  if (!definition || typeof definition !== "object") throw new Error("transaction definition is required");
  for (const field of ["transactionId", "idempotencyKey", "intent", "lane", "route"]) {
    assertString(definition[field], field);
  }
  if (!Array.isArray(definition.declaredOwners) || definition.declaredOwners.length === 0) {
    throw new Error("at least one declared owner is required");
  }
  if (!Array.isArray(definition.expectedMutations)) throw new Error("expectedMutations must be an array");
  if (!Array.isArray(definition.preconditions)) throw new Error("preconditions must be an array");
  if (!Array.isArray(definition.reviewGates)) throw new Error("reviewGates must be an array");

  const ownerIds = new Set();
  for (const owner of definition.declaredOwners) {
    assertString(owner.ownerId, "ownerId");
    assertString(owner.uri, `owner ${owner.ownerId} uri`);
    if (ownerIds.has(owner.ownerId)) throw new Error(`duplicate owner ${owner.ownerId}`);
    ownerIds.add(owner.ownerId);
  }

  const mutationOwners = new Set();
  for (const mutation of definition.expectedMutations) {
    assertString(mutation.ownerId, "mutation ownerId");
    assertString(mutation.operation, `mutation ${mutation.ownerId} operation`);
    if (!ownerIds.has(mutation.ownerId)) throw new Error(`mutation names undeclared owner ${mutation.ownerId}`);
    if (mutationOwners.has(mutation.ownerId)) throw new Error(`duplicate mutation for ${mutation.ownerId}`);
    mutationOwners.add(mutation.ownerId);
  }
  for (const ownerId of ownerIds) {
    if (!mutationOwners.has(ownerId)) throw new Error(`owner ${ownerId} has no expected mutation`);
  }

  const seen = new Set();
  for (const owner of definition.declaredOwners) {
    for (const dependency of owner.dependsOn ?? []) {
      if (!ownerIds.has(dependency)) throw new Error(`owner ${owner.ownerId} depends on unknown owner ${dependency}`);
      if (!seen.has(dependency)) throw new Error(`owner ${owner.ownerId} must follow dependency ${dependency}`);
    }
    seen.add(owner.ownerId);
    if (owner.reviewGateId) {
      const gate = definition.reviewGates.find(({ gateId }) => gateId === owner.reviewGateId);
      if (!gate) throw new Error(`owner ${owner.ownerId} names unknown review gate ${owner.reviewGateId}`);
    }
  }
  return definition;
}

export function normalizeVerification(result) {
  if (result === true) return { ok: true, evidence: null, error: null };
  if (result === false) return { ok: false, evidence: null, error: "adapter verification returned false" };
  if (!result || typeof result !== "object" || typeof result.ok !== "boolean") {
    throw new Error("adapter verify() must return a boolean or { ok, evidence, error }");
  }
  return {
    ok: result.ok,
    evidence: result.evidence ?? null,
    error: result.error ?? (result.ok ? null : "adapter verification failed"),
  };
}
