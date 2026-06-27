#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const ENV_PATH = path.join(ROOT, ".env.local");
const CACHE_DIR = path.join(ROOT, ".cache", "asana-opportunity-hq");
const CACHE_PATH = path.join(CACHE_DIR, "readback.json");
const REPORT_PATH = path.join(CACHE_DIR, "readback.md");

const PROJECTS = [
  ["Cash Jobs", "1216085587829071"],
  ["Career Jobs", "1216085578664620"],
  ["Freelance", "1216085578664363"],
  ["Offer", "1216085286554312"],
  ["Proof", "1216085441190325"],
];

const TEST_GOAL = "1216085728180187";
const OFFER_PROJECT = "1216085286554312";
const MIGRATION_PARENT_TASK = "1216085584219817";
const EXPECTED_SECTIONS = ["Queued", "Today", "In Motion", "Waiting", "Done", "Parked"];
const EXPECTED_FIELDS = ["Time", "Money Priority", "Goal Horizon", "Block"];
const REQUIRED_TASK_FIELDS = ["Time", "Money Priority", "Goal Horizon"];
const EXPECTED_DEPENDENCY_CHAIN = [
  "Read Notion Opportunity HQ source data",
  "Create clean Asana task import",
  "Verify Asana counts and dependencies",
];

function readEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};

  const env = {};
  for (const rawLine of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const equals = line.indexOf("=");
    if (equals === -1) continue;

    const key = line.slice(0, equals).trim();
    let value = line.slice(equals + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

const fileEnv = readEnvFile(ENV_PATH);
const asanaToken = process.env.ASANA_ACCESS_TOKEN || fileEnv.ASANA_ACCESS_TOKEN;
const workspaceGid = process.env.ASANA_WORKSPACE_GID || fileEnv.ASANA_WORKSPACE_GID;

if (!asanaToken) {
  console.error("Missing ASANA_ACCESS_TOKEN in environment or .env.local");
  process.exit(1);
}

if (!workspaceGid) {
  console.error("Missing ASANA_WORKSPACE_GID in environment or .env.local");
  process.exit(1);
}

async function asana(pathname, options = {}) {
  const response = await fetch(`https://app.asana.com/api/1.0${pathname}`, {
    ...options,
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${asanaToken}`,
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const message = body?.errors?.map((error) => error.message).join("; ") || response.statusText;
    throw new Error(`${response.status} ${pathname}: ${message}`);
  }
  return body;
}

async function asanaPages(pathname) {
  let next = pathname;
  const rows = [];

  while (next) {
    const body = await asana(next);
    rows.push(...(body.data || []));
    if (body.next_page?.uri) {
      const nextUrl = new URL(body.next_page.uri);
      next = `${nextUrl.pathname}${nextUrl.search}`.replace(/^\/api\/1\.0/, "");
    } else {
      next = null;
    }
  }

  return rows;
}

function sectionNameForTask(task, sectionsByGid) {
  const sectionGid = task.memberships?.find((membership) => sectionsByGid.has(membership.section?.gid))?.section?.gid;
  return sectionGid ? sectionsByGid.get(sectionGid) : "No Section";
}

async function readProject([name, gid]) {
  const [project, sections, tasks] = await Promise.all([
    asana(`/projects/${gid}?opt_fields=gid,name,permalink_url,custom_field_settings.custom_field.name`),
    asanaPages(`/projects/${gid}/sections?limit=100&opt_fields=gid,name`),
    asanaPages(`/projects/${gid}/tasks?limit=100&opt_fields=gid,name,completed,permalink_url,due_on,memberships.section.gid,memberships.section.name,custom_fields.name,custom_fields.display_value,custom_fields.enum_value.name,dependencies.gid,dependents.gid`),
  ]);

  const sectionsByGid = new Map(sections.map((section) => [section.gid, section.name]));
  const countsBySection = {};
  let dependencyCount = 0;
  let dependentCount = 0;

  for (const task of tasks) {
    const sectionName = sectionNameForTask(task, sectionsByGid);
    countsBySection[sectionName] = (countsBySection[sectionName] || 0) + 1;
    dependencyCount += task.dependencies?.length || 0;
    dependentCount += task.dependents?.length || 0;
  }

  return {
    name,
    gid,
    url: project.data.permalink_url,
    sections: sections.map((section) => section.name),
    customFields: project.data.custom_field_settings?.map((setting) => setting.custom_field?.name).filter(Boolean) || [],
    taskCount: tasks.length,
    tasks: tasks.map((task) => ({
      gid: task.gid,
      name: task.name,
      section: sectionNameForTask(task, sectionsByGid),
      fields: taskFields(task),
      url: task.permalink_url,
      dueOn: task.due_on || "",
    })),
    countsBySection,
    dependencyCount,
    dependentCount,
  };
}

async function readGoal() {
  const [goal, relationships] = await Promise.all([
    asana(`/goals/${TEST_GOAL}?opt_fields=gid,name,permalink_url,due_on,metric.progress_source,metric.unit,metric.precision,metric.current_number_value,metric.target_number_value,time_period.name`),
    asanaPages(`/goal_relationships?supported_goal=${TEST_GOAL}&limit=100&opt_fields=gid,supporting_resource.name,supporting_resource.resource_type,contribution_weight`),
  ]);

  return {
    ...goal.data,
    relationships: relationships.map((relationship) => ({
      gid: relationship.gid,
      supportingResource: relationship.supporting_resource,
      contributionWeight: relationship.contribution_weight,
    })),
  };
}

async function readDependencyProbe() {
  const subtasks = await asanaPages(
    `/tasks/${MIGRATION_PARENT_TASK}/subtasks?limit=100&opt_fields=gid,name,permalink_url,dependencies.name,dependents.name`,
  );

  return {
    parentTaskGid: MIGRATION_PARENT_TASK,
    expectedChain: EXPECTED_DEPENDENCY_CHAIN,
    subtasks: subtasks.map((task) => ({
      gid: task.gid,
      name: task.name,
      url: task.permalink_url,
      dependencyGids: (task.dependencies || []).map((dependency) => dependency.gid),
      dependentGids: (task.dependents || []).map((dependent) => dependent.gid),
    })),
  };
}

const projects = await Promise.all(PROJECTS.map(readProject));
const [goal, dependencyProbe] = await Promise.all([readGoal(), readDependencyProbe()]);
const schemaErrors = [];
const titleOwners = new Map();

for (const project of projects) {
  const sectionNames = project.sections.join("|");
  const fieldNames = project.customFields.join("|");

  if (sectionNames !== EXPECTED_SECTIONS.join("|")) {
    schemaErrors.push(`${project.name} sections: ${sectionNames}`);
  }
  if (fieldNames !== EXPECTED_FIELDS.join("|")) {
    schemaErrors.push(`${project.name} fields: ${fieldNames}`);
  }

  for (const task of project.tasks) {
    const owners = titleOwners.get(task.name) || [];
    owners.push(project.name);
    titleOwners.set(task.name, owners);

    for (const field of REQUIRED_TASK_FIELDS) {
      if (!task.fields[field]) {
        schemaErrors.push(`${project.name} / ${task.name} missing ${field}`);
      }
    }
  }
}

for (const [title, owners] of titleOwners) {
  if (owners.length > 1) {
    schemaErrors.push(`Duplicate task title "${title}" in ${owners.join(", ")}`);
  }
}

if (goal.metric?.progress_source !== "project_task_completion") {
  schemaErrors.push(`Goal metric is ${goal.metric?.progress_source || "missing"}`);
}

if (
  !goal.relationships.some(
    (relationship) => relationship.supportingResource?.gid === OFFER_PROJECT,
  )
) {
  schemaErrors.push("Goal is not supported by the Offer project");
}

const subtasksByName = new Map(dependencyProbe.subtasks.map((task) => [task.name, task]));
const subtaskNamesByGid = new Map(dependencyProbe.subtasks.map((task) => [task.gid, task.name]));
for (const name of EXPECTED_DEPENDENCY_CHAIN) {
  if (!subtasksByName.has(name)) {
    schemaErrors.push(`Dependency probe missing subtask "${name}"`);
  }
}

for (let index = 1; index < EXPECTED_DEPENDENCY_CHAIN.length; index += 1) {
  const task = subtasksByName.get(EXPECTED_DEPENDENCY_CHAIN[index]);
  const dependency = subtasksByName.get(EXPECTED_DEPENDENCY_CHAIN[index - 1]);
  if (task && dependency && !task.dependencyGids.includes(dependency.gid)) {
    schemaErrors.push(`"${task.name}" does not depend on "${dependency.name}"`);
  }
}

if (schemaErrors.length) {
  console.error("Asana Opportunity HQ schema drift:");
  for (const error of schemaErrors) console.error(`- ${error}`);
  process.exit(1);
}

const readback = {
  generatedAt: new Date().toISOString(),
  workspaceGid,
  projects,
  goal,
  dependencyProbe,
};

if (!process.argv.includes("--no-cache")) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
  fs.writeFileSync(CACHE_PATH, `${JSON.stringify(readback, null, 2)}\n`);
  fs.writeFileSync(REPORT_PATH, `${markdownReport(readback)}\n`);
}

console.log(`Asana Opportunity HQ readback (${readback.generatedAt})`);
for (const project of projects) {
  const sectionSummary = Object.entries(project.countsBySection)
    .map(([section, count]) => `${section}:${count}`)
    .join(", ");
  console.log(`- ${project.name}: ${project.taskCount} tasks (${sectionSummary || "none"})`);
}
console.log(
  `- Goal: ${goal.name} | metric=${goal.metric?.progress_source || "none"} | relationships=${goal.relationships.length}`,
);
console.log(`- Dependency probe: ${dependencyProbe.subtasks.length} subtasks`);

function markdownReport(readback) {
  const lines = [
    "# Asana Opportunity HQ Readback",
    "",
    `Generated: ${readback.generatedAt}`,
    "",
    "## Projects",
    "",
  ];

  for (const project of readback.projects) {
    lines.push(`### ${project.name}`, "");
    lines.push(`URL: ${project.url}`, "");
    lines.push(`Sections: ${project.sections.join(" | ")}`, "");
    lines.push(`Fields: ${project.customFields.join(" | ")}`, "");
    lines.push(`Task count: ${project.taskCount}`, "");
    for (const task of project.tasks) {
      const fields = REQUIRED_TASK_FIELDS.map((field) => `${field}: ${task.fields[field] || "missing"}`).join("; ");
      lines.push(`- [${task.section}] ${task.name} (${fields})`);
    }
    lines.push("");
  }

  lines.push("## Goal Probe", "");
  lines.push(`Name: ${readback.goal.name}`);
  lines.push(`URL: ${readback.goal.permalink_url}`);
  lines.push(`Metric: ${readback.goal.metric?.progress_source || "none"}`);
  lines.push(`Relationships: ${readback.goal.relationships.length}`);
  lines.push("", "## Dependency Probe", "");
  lines.push(`Parent task: ${readback.dependencyProbe.parentTaskGid}`, "");
  for (const task of readback.dependencyProbe.subtasks) {
    const dependencies = task.dependencyGids.map((gid) => subtaskNamesByGid.get(gid) || gid);
    lines.push(
      `- ${task.name} (depends on: ${dependencies.join(", ") || "none"})`,
    );
  }

  return lines.join("\n");
}

function taskFields(task) {
  return Object.fromEntries(
    (task.custom_fields || []).map((field) => [
      field.name,
      field.enum_value?.name || field.display_value || "",
    ]),
  );
}
