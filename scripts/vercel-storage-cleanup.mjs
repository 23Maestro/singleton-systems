#!/usr/bin/env node

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import path from "node:path";
import process from "node:process";
import readline from "node:readline/promises";
import { fileURLToPath, pathToFileURL } from "node:url";

export const EXPECTED_TEAM_SLUG = "23maestros-projects";
export const CLEANUP_TARGETS = new Set(["singleton-systems", "wemby-shot-lab"]);
export const RECOMMENDED_RETENTION = Object.freeze({
  expirationDays: 7,
  expirationDaysCanceled: 1,
  expirationDaysErrored: 7,
});

const RETENTION_FIELDS = [
  "expirationDays",
  "expirationDaysProduction",
  "expirationDaysCanceled",
  "expirationDaysErrored",
  "deploymentsToKeep",
];

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export function parseArgs(argv) {
  const result = { apply: false, help: false };
  for (const argument of argv) {
    if (argument === "--apply") result.apply = true;
    else if (argument === "--help" || argument === "-h") result.help = true;
    else throw new Error(`unknown argument: ${argument}`);
  }
  return result;
}

function hasBlock(team) {
  return Boolean(team.blocked || team.softBlock || team.paused);
}

export function assertExpectedTeam(teams) {
  const team = teams.find(({ slug }) => slug === EXPECTED_TEAM_SLUG);
  assert.ok(
    team,
    `Vercel team ${EXPECTED_TEAM_SLUG} is not available to the current CLI login.`,
  );
  assert.equal(
    team.membership?.confirmed,
    true,
    `Vercel team ${EXPECTED_TEAM_SLUG} membership is not confirmed.`,
  );
  assert.equal(
    team.billing?.status,
    "active",
    `Vercel team ${EXPECTED_TEAM_SLUG} is not active.`,
  );
  assert.equal(
    hasBlock(team),
    false,
    `Vercel team ${EXPECTED_TEAM_SLUG} is blocked or paused. Resolve that in Vercel before changing retention.`,
  );
  return team;
}

function normalizeRetention(value) {
  const normalized = {};
  for (const field of RETENTION_FIELDS) {
    normalized[field] = Number.isFinite(value?.[field]) ? value[field] : null;
  }
  return normalized;
}

function assertCompleteRetention(projectName, retention) {
  for (const field of RETENTION_FIELDS) {
    assert.ok(
      Number.isFinite(retention[field]),
      `${projectName}: Vercel did not return ${field}; use the dashboard fallback instead of guessing.`,
    );
  }
}

function lowerOnly(current, maximum) {
  return Math.min(current, maximum);
}

export function retentionMatches(actual, expected) {
  return RETENTION_FIELDS.every((field) => actual?.[field] === expected?.[field]);
}

export function buildCleanupPlan(projects) {
  return [...projects]
    .sort((left, right) => left.name.localeCompare(right.name))
    .map((project) => {
      const current = normalizeRetention(project.deploymentExpiration);
      if (!CLEANUP_TARGETS.has(project.name)) {
        return {
          id: project.id,
          name: project.name,
          current,
          recommended: null,
          changed: false,
        };
      }

      assertCompleteRetention(project.name, current);
      const recommended = {
        ...current,
        expirationDays: lowerOnly(current.expirationDays, RECOMMENDED_RETENTION.expirationDays),
        expirationDaysCanceled: lowerOnly(
          current.expirationDaysCanceled,
          RECOMMENDED_RETENTION.expirationDaysCanceled,
        ),
        expirationDaysErrored: lowerOnly(
          current.expirationDaysErrored,
          RECOMMENDED_RETENTION.expirationDaysErrored,
        ),
      };

      return {
        id: project.id,
        name: project.name,
        current,
        recommended,
        changed: !retentionMatches(current, recommended),
      };
    });
}

function isProjectEndpoint(endpoint) {
  const match = endpoint.match(/^\/v9\/projects\/([^/?]+)$/);
  if (!match) return null;
  return decodeURIComponent(match[1]);
}

function assertRetentionPayload(payload) {
  assert.deepEqual(
    Object.keys(payload ?? {}).sort(),
    ["deploymentExpiration"],
    "Vercel project PATCH must use a retention-only payload.",
  );
  const retention = payload.deploymentExpiration;
  assert.ok(retention && typeof retention === "object", "Vercel project PATCH requires deploymentExpiration.");
  assert.deepEqual(
    Object.keys(retention).sort(),
    [...RETENTION_FIELDS].sort(),
    "Vercel project PATCH contains unexpected retention fields.",
  );
  for (const field of RETENTION_FIELDS) {
    assert.ok(
      Number.isInteger(retention[field]) && retention[field] >= 1,
      `Vercel project PATCH requires a positive integer for ${field}.`,
    );
  }
}

export function assertSafeApiCall({ method = "GET", endpoint, payload = null }) {
  const normalizedMethod = method.toUpperCase();
  assert.ok(
    normalizedMethod === "GET" || normalizedMethod === "PATCH",
    `unsafe Vercel API method refused: ${normalizedMethod}`,
  );

  if (normalizedMethod === "GET") {
    const safeRead =
      endpoint === "/v2/teams" ||
      endpoint.startsWith("/v2/teams?") ||
      endpoint === "/v10/projects" ||
      endpoint.startsWith("/v10/projects?") ||
      Boolean(isProjectEndpoint(endpoint));
    assert.ok(safeRead, `unsafe Vercel API read refused: ${endpoint}`);
    return;
  }

  const projectName = isProjectEndpoint(endpoint);
  assert.ok(projectName, `unsafe Vercel API PATCH refused: ${endpoint}`);
  assert.ok(
    CLEANUP_TARGETS.has(projectName),
    `${projectName} is not an approved cleanup target.`,
  );
  assertRetentionPayload(payload);
}

function loginInstructions() {
  return [
    "Vercel CLI login is required.",
    `1. Run: npm exec -- vercel login`,
    "2. Finish the browser sign-in.",
    "3. Rerun: npm run vercel:storage:cleanup",
  ].join("\n");
}

function apiFailureMessage(result, endpoint) {
  const detail = (result.stderr || result.stdout || "").trim();
  if (/not authorized|unauthorized|log in|login|token/i.test(detail)) {
    return `${loginInstructions()}\n\nVercel response:\n${detail}`;
  }
  return `Vercel API request failed for ${endpoint} (exit ${result.status}).${detail ? `\n${detail}` : ""}`;
}

function runVercelApi({ method = "GET", endpoint, payload = null, scope = null }) {
  assertSafeApiCall({ method, endpoint, payload });
  const args = ["exec", "--", "vercel", "api", endpoint, "--raw", "--no-color"];
  if (method !== "GET") args.push("--method", method, "--input", "-");
  if (scope) args.push("--scope", scope);

  const result = spawnSync("npm", args, {
    cwd: root,
    encoding: "utf8",
    input: payload ? `${JSON.stringify(payload)}\n` : undefined,
    maxBuffer: 32 * 1024 * 1024,
  });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(apiFailureMessage(result, endpoint));

  try {
    return JSON.parse(result.stdout);
  } catch (error) {
    throw new Error(`Vercel returned invalid JSON for ${endpoint}.`, { cause: error });
  }
}

async function fetchAllProjects() {
  const projects = [];
  const seenCursors = new Set();
  let cursor = null;

  do {
    const query = new URLSearchParams({ limit: "100" });
    if (cursor !== null) query.set("from", String(cursor));
    const response = runVercelApi({
      endpoint: `/v10/projects?${query}`,
      scope: EXPECTED_TEAM_SLUG,
    });
    assert.ok(Array.isArray(response.projects), "Vercel project inventory did not include a projects array.");
    projects.push(...response.projects);
    cursor = response.pagination?.next ?? null;
    if (cursor !== null) {
      assert.ok(!seenCursors.has(String(cursor)), "Vercel project pagination repeated a cursor.");
      seenCursors.add(String(cursor));
    }
  } while (cursor !== null);

  return projects;
}

function displayValue(value) {
  return Number.isFinite(value) ? `${value}d` : "unknown";
}

function displayKeep(value) {
  return Number.isFinite(value) ? String(value) : "unknown";
}

function printInventory(plan) {
  const rows = plan.map((entry) => ({
    Project: entry.name,
    Preview: displayValue(entry.current.expirationDays),
    Production: displayValue(entry.current.expirationDaysProduction),
    Canceled: displayValue(entry.current.expirationDaysCanceled),
    Errored: displayValue(entry.current.expirationDaysErrored),
    "Production minimum": displayKeep(entry.current.deploymentsToKeep),
    Recommendation: entry.recommended
      ? entry.changed
        ? `${entry.recommended.expirationDays}d preview, ${entry.recommended.expirationDaysCanceled}d canceled, ${entry.recommended.expirationDaysErrored}d errored`
        : "already at or below recommendation"
      : "inventory only",
  }));
  console.table(rows);
}

function dashboardUrl(projectName) {
  return `https://vercel.com/${EXPECTED_TEAM_SLUG}/${projectName}/settings/security`;
}

function manualFallback(entry) {
  return [
    `Manual fallback for ${entry.name}:`,
    `1. Open ${dashboardUrl(entry.name)}`,
    "2. Find Deployment Retention Policy.",
    `3. Set Pre-Production to ${entry.recommended.expirationDays} days.`,
    `4. Set Canceled to ${entry.recommended.expirationDaysCanceled} day.`,
    `5. Set Errored to ${entry.recommended.expirationDaysErrored} days.`,
    `6. Leave Production at ${entry.current.expirationDaysProduction} days.`,
    `7. Leave the production minimum at ${entry.current.deploymentsToKeep}.`,
    "8. Save.",
  ].join("\n");
}

async function confirmApply() {
  assert.ok(
    process.stdin.isTTY && process.stdout.isTTY,
    "Apply mode requires an interactive terminal so confirmation cannot be bypassed.",
  );
  const prompt = readline.createInterface({ input: process.stdin, output: process.stdout });
  try {
    const answer = await prompt.question(`Type APPLY ${EXPECTED_TEAM_SLUG} to change retention: `);
    return answer.trim() === `APPLY ${EXPECTED_TEAM_SLUG}`;
  } finally {
    prompt.close();
  }
}

function assertProductionPreserved(entry) {
  assert.equal(
    entry.recommended.expirationDaysProduction,
    entry.current.expirationDaysProduction,
    `${entry.name}: production retention changed unexpectedly.`,
  );
  assert.equal(
    entry.recommended.deploymentsToKeep,
    entry.current.deploymentsToKeep,
    `${entry.name}: production rollback minimum changed unexpectedly.`,
  );
}

async function applyPlan(plan) {
  const changes = plan.filter(({ changed }) => changed);
  if (changes.length === 0) {
    console.log("\nThe approved projects are already at or below the recommended non-production retention.");
    return;
  }

  for (const entry of changes) assertProductionPreserved(entry);
  const confirmed = await confirmApply();
  if (!confirmed) {
    console.log("\nConfirmation did not match. No Vercel settings were changed.");
    return;
  }

  for (const entry of changes) {
    try {
      runVercelApi({
        method: "PATCH",
        endpoint: `/v9/projects/${encodeURIComponent(entry.name)}`,
        payload: { deploymentExpiration: entry.recommended },
        scope: EXPECTED_TEAM_SLUG,
      });
    } catch (error) {
      throw new Error(
        `${entry.name}: Vercel did not accept the automated retention update.\n\n${manualFallback(entry)}\n\n${error.message}`,
        { cause: error },
      );
    }
  }

  for (const entry of changes) {
    const project = runVercelApi({
      endpoint: `/v9/projects/${encodeURIComponent(entry.name)}`,
      scope: EXPECTED_TEAM_SLUG,
    });
    const actual = normalizeRetention(project.deploymentExpiration);
    if (!retentionMatches(actual, entry.recommended)) {
      throw new Error(
        `${entry.name}: retention verification did not match.\n\n${manualFallback(entry)}`,
      );
    }
    console.log(`Verified ${entry.name}: retention updated; production rollback settings preserved.`);
  }
}

function printHelp() {
  console.log(`Usage:
  npm run vercel:storage:cleanup
  npm run vercel:storage:cleanup -- --apply

Default mode is read-only. It verifies the ${EXPECTED_TEAM_SLUG} team, inventories every
project retention policy, and shows recommendations for singleton-systems and
wemby-shot-lab.

--apply prompts for the exact team name, updates only deployment retention for the two
approved projects, and reads the settings back. It never deploys or deletes anything.`);
}

export async function main(argv = process.argv.slice(2)) {
  const options = parseArgs(argv);
  if (options.help) {
    printHelp();
    return;
  }

  const teamsResponse = runVercelApi({ endpoint: "/v2/teams?limit=100" });
  const team = assertExpectedTeam(teamsResponse.teams ?? []);
  console.log(`Verified Vercel team: ${team.slug} (${team.billing.plan}, ${team.billing.status})`);

  const projects = await fetchAllProjects();
  const wrongOwner = projects.find(({ accountId }) => accountId !== team.id);
  assert.ok(!wrongOwner, `${wrongOwner?.name}: project owner does not match ${EXPECTED_TEAM_SLUG}.`);
  const plan = buildCleanupPlan(projects);
  printInventory(plan);

  if (!options.apply) {
    console.log("\nDry run complete. No Vercel settings were changed and no deployment was created.");
    console.log("Apply later with: npm run vercel:storage:cleanup -- --apply");
    return;
  }

  await applyPlan(plan);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(`\nVercel storage cleanup stopped:\n${error.message}`);
    process.exitCode = 1;
  });
}
