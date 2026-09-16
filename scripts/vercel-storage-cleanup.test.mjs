import assert from "node:assert/strict";
import test from "node:test";

import {
  EXPECTED_TEAM_SLUG,
  RECOMMENDED_RETENTION,
  assertExpectedTeam,
  assertSafeApiCall,
  buildCleanupPlan,
  parseArgs,
  retentionMatches,
} from "./vercel-storage-cleanup.mjs";

const policy = {
  expirationDays: 30,
  expirationDaysProduction: 30,
  expirationDaysCanceled: 30,
  expirationDaysErrored: 30,
  deploymentsToKeep: 10,
};

const projects = [
  { id: "prj_singleton", name: "singleton-systems", deploymentExpiration: policy },
  { id: "prj_wemby", name: "wemby-shot-lab", deploymentExpiration: policy },
  { id: "prj_flowzone", name: "flowzone", deploymentExpiration: policy },
];

test("recommendations match Vercel's current Hobby retention options", () => {
  assert.deepEqual(RECOMMENDED_RETENTION, {
    expirationDays: 30,
    expirationDaysCanceled: 7,
    expirationDaysErrored: 7,
  });
});

test("dry-run is the default and apply must be explicit", () => {
  assert.deepEqual(parseArgs([]), { apply: false, help: false });
  assert.deepEqual(parseArgs(["--apply"]), { apply: true, help: false });
  assert.deepEqual(parseArgs(["--help"]), { apply: false, help: true });
  assert.throws(() => parseArgs(["--yes"]), /unknown argument/);
});

test("team verification requires the exact configured team and an active membership", () => {
  const team = assertExpectedTeam([
    {
      id: "team_expected",
      slug: EXPECTED_TEAM_SLUG,
      billing: { status: "active" },
      membership: { confirmed: true },
      blocked: null,
      softBlock: null,
    },
  ]);
  assert.equal(team.id, "team_expected");

  assert.throws(() => assertExpectedTeam([{ slug: "another-team" }]), /not available/);
  assert.throws(
    () =>
      assertExpectedTeam([
        {
          slug: EXPECTED_TEAM_SLUG,
          billing: { status: "active" },
          membership: { confirmed: false },
        },
      ]),
    /membership is not confirmed/,
  );
  assert.throws(
    () =>
      assertExpectedTeam([
        {
          slug: EXPECTED_TEAM_SLUG,
          billing: { status: "active" },
          membership: { confirmed: true },
          softBlock: { reason: "FAIR_USE_LIMITS_EXCEEDED" },
        },
      ]),
    /blocked or paused/,
  );
});

test("cleanup plan inventories every project but only changes the two approved targets", () => {
  const plan = buildCleanupPlan(projects);
  assert.deepEqual(
    plan.map(({ name }) => name),
    ["flowzone", "singleton-systems", "wemby-shot-lab"],
  );

  const singleton = plan.find(({ name }) => name === "singleton-systems");
  assert.deepEqual(singleton.recommended, {
    ...policy,
    expirationDays: RECOMMENDED_RETENTION.expirationDays,
    expirationDaysCanceled: RECOMMENDED_RETENTION.expirationDaysCanceled,
    expirationDaysErrored: RECOMMENDED_RETENTION.expirationDaysErrored,
  });
  assert.equal(singleton.changed, true);
  assert.equal(singleton.recommended.expirationDaysProduction, policy.expirationDaysProduction);
  assert.equal(singleton.recommended.deploymentsToKeep, policy.deploymentsToKeep);

  const flowzone = plan.find(({ name }) => name === "flowzone");
  assert.equal(flowzone.changed, false);
  assert.equal(flowzone.recommended, null);
});

test("recommendations never lengthen an existing shorter policy", () => {
  const current = {
    ...policy,
    expirationDays: 3,
    expirationDaysCanceled: 1,
    expirationDaysErrored: 2,
  };
  const [entry] = buildCleanupPlan([
    { id: "prj_singleton", name: "singleton-systems", deploymentExpiration: current },
  ]);
  assert.deepEqual(entry.recommended, current);
  assert.equal(entry.changed, false);
});

test("API safety gate permits only project reads and retention-only project patches", () => {
  assert.doesNotThrow(() => assertSafeApiCall({ method: "GET", endpoint: "/v2/teams" }));
  assert.doesNotThrow(() => assertSafeApiCall({ method: "GET", endpoint: "/v10/projects?limit=100" }));
  assert.doesNotThrow(() =>
    assertSafeApiCall({
      method: "PATCH",
      endpoint: "/v9/projects/singleton-systems",
      payload: { deploymentExpiration: policy },
    }),
  );

  assert.throws(
    () => assertSafeApiCall({ method: "DELETE", endpoint: "/v9/projects/singleton-systems" }),
    /unsafe Vercel API method/,
  );
  assert.throws(
    () => assertSafeApiCall({ method: "POST", endpoint: "/v13/deployments" }),
    /unsafe Vercel API method/,
  );
  assert.throws(
    () =>
      assertSafeApiCall({
        method: "PATCH",
        endpoint: "/v9/projects/flowzone",
        payload: { deploymentExpiration: policy },
      }),
    /not an approved cleanup target/,
  );
  assert.throws(
    () =>
      assertSafeApiCall({
        method: "PATCH",
        endpoint: "/v9/projects/wemby-shot-lab",
        payload: { name: "changed" },
      }),
    /retention-only payload/,
  );
});

test("verification compares every retention field", () => {
  assert.equal(retentionMatches(policy, { ...policy }), true);
  assert.equal(retentionMatches(policy, { ...policy, expirationDays: 7 }), false);
});
