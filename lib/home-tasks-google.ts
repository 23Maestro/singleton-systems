import { google } from "googleapis";
import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

const TASKS_SHEET = "Chores";
const TASK_OPTIONS_SHEET = "Task Options";
const TASK_HEADERS = ["Task ID", "Room", "Task", "Duration", "Plan", "Notes"] as const;
const TASK_OPTION_HEADERS = ["Room", "Task", "Duration", "Notes"] as const;
const LOCAL_CLIENT_FILE = path.join(process.cwd(), "config/google-workspace/oauth-client.json");
const LOCAL_TOKEN_FILE = path.join(process.cwd(), ".google-workspace/flow-token.json");
const LOCAL_RESULT_FILE = path.join(process.cwd(), ".google-workspace/personal-ops-chores.json");

export const HOME_TASK_ROOMS = ["Auto", "Bathroom", "Garage", "Kitchen", "Laundry", "Living Room", "Office"] as const;
export const HOME_TASK_DURATIONS = ["5m", "10m", "15m", "30m", "45m", "60m", "90m", "2h", "4h+"] as const;
export const HOME_TASK_PLANS = ["Pending", "Today"] as const;

export type HomeTaskRoom = (typeof HOME_TASK_ROOMS)[number];
export type HomeTaskDuration = (typeof HOME_TASK_DURATIONS)[number];
export type HomeTaskPlan = (typeof HOME_TASK_PLANS)[number];

export type HomeTask = {
  taskId: string;
  room: HomeTaskRoom;
  task: string;
  duration: HomeTaskDuration;
  plan: HomeTaskPlan;
  notes: string;
};

export type HomeTaskOption = {
  room: HomeTaskRoom;
  task: string;
  duration: HomeTaskDuration;
  notes: string;
};

type TaskInput = Partial<HomeTask> & Pick<HomeTask, "room" | "task" | "duration" | "plan"> & {
  saveAsOption?: boolean;
};

export async function listHomeTasks() {
  const sheets = await getSheetsClient();
  const spreadsheetId = await getSpreadsheetId();
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${TASKS_SHEET}!A1:F`,
  });
  const rows = response.data.values || [];
  const [headers = [], ...taskRows] = rows;

  return taskRows
    .map((row) => rowToTask(headers, row))
    .filter((task): task is HomeTask => Boolean(task));
}

export async function listHomeTaskOptions() {
  const sheets = await getSheetsClient();
  const spreadsheetId = await getSpreadsheetId();
  await ensureTaskOptionsSheet(sheets, spreadsheetId);
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${TASK_OPTIONS_SHEET}!A2:D`,
  });
  const rows = response.data.values || [];

  return rows
    .map((row) => optionRowToTask(row))
    .filter((option): option is HomeTaskOption => Boolean(option));
}

export async function addHomeTask(input: TaskInput) {
  const task = normalizeTask({
    taskId: `task_${new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14)}_${randomUUID().slice(0, 8)}`,
    room: input.room,
    task: input.task,
    duration: input.duration,
    plan: input.plan,
    notes: input.notes || "",
  });

  const sheets = await getSheetsClient();
  const spreadsheetId = await getSpreadsheetId();
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${TASKS_SHEET}!A:F`,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values: [taskToRow(task)] },
  });
  if (input.saveAsOption) {
    await saveHomeTaskOption(task);
  }
  return task;
}

export async function updateHomeTask(taskId: string, input: Partial<HomeTask>) {
  const sheets = await getSheetsClient();
  const spreadsheetId = await getSpreadsheetId();
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${TASKS_SHEET}!A1:F`,
  });
  const rows = response.data.values || [];
  const [headers = [], ...taskRows] = rows;
  const rowOffset = taskRows.findIndex((row) => row[0] === taskId);
  if (rowOffset === -1) {
    throw new Error(`Task not found: ${taskId}`);
  }

  const existing = rowToTask(headers, taskRows[rowOffset]);
  if (!existing) {
    throw new Error(`Task row is invalid: ${taskId}`);
  }
  const next = normalizeTask({ ...existing, ...input, taskId });
  const rowNumber = rowOffset + 2;

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${TASKS_SHEET}!A${rowNumber}:F${rowNumber}`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [taskToRow(next)] },
  });

  return next;
}

function rowToTask(headers: unknown[], row: unknown[]) {
  const byHeader = Object.fromEntries(headers.map((header, index) => [String(header), String(row[index] || "")]));
  const taskId = byHeader["Task ID"] || String(row[0] || "");
  const task = byHeader.Task || String(row[2] || "");
  const room = byHeader.Room || String(row[1] || "");
  if (!taskId || !task || !isRoom(room)) return null;

  return normalizeTask({
    taskId,
    room,
    task,
    duration: byHeader.Duration || String(row[3] || "15m"),
    plan: byHeader.Plan || String(row[4] || "Pending"),
    notes: byHeader.Notes || String(row[5] || ""),
  });
}

function normalizeTask(task: {
  taskId: string;
  room: string;
  task: string;
  duration: string;
  plan: string;
  notes?: string;
}): HomeTask {
  const room = isRoom(task.room) ? task.room : "Office";
  const duration = isDuration(task.duration) ? task.duration : "15m";
  const plan = isPlan(task.plan) ? task.plan : "Pending";

  return {
    taskId: task.taskId,
    room,
    task: task.task.trim(),
    duration,
    plan,
    notes: task.notes?.trim() || "",
  };
}

function taskToRow(task: HomeTask) {
  return [task.taskId, task.room, task.task, task.duration, task.plan, task.notes];
}

async function saveHomeTaskOption(task: HomeTaskOption) {
  const sheets = await getSheetsClient();
  const spreadsheetId = await getSpreadsheetId();
  await ensureTaskOptionsSheet(sheets, spreadsheetId);
  const options = await listHomeTaskOptions();
  const alreadyExists = options.some(
    (option) => option.room === task.room && option.task.trim().toLowerCase() === task.task.trim().toLowerCase()
  );
  if (alreadyExists) return;

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${TASK_OPTIONS_SHEET}!A:D`,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values: [[task.room, task.task, task.duration, task.notes || ""]] },
  });
}

async function ensureTaskOptionsSheet(sheets: Awaited<ReturnType<typeof getSheetsClient>>, spreadsheetId: string) {
  const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
  const exists = spreadsheet.data.sheets?.some((sheet) => sheet.properties?.title === TASK_OPTIONS_SHEET);
  if (!exists) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            addSheet: {
              properties: {
                title: TASK_OPTIONS_SHEET,
                gridProperties: { rowCount: 100, columnCount: 4, frozenRowCount: 1 },
              },
            },
          },
        ],
      },
    });
  }

  const headers = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${TASK_OPTIONS_SHEET}!A1:D1`,
  });
  if (!headers.data.values?.[0]?.length) {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${TASK_OPTIONS_SHEET}!A1:D1`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [[...TASK_OPTION_HEADERS]] },
    });
    await seedTaskOptionsFromTasks(sheets, spreadsheetId);
  }
}

async function seedTaskOptionsFromTasks(sheets: Awaited<ReturnType<typeof getSheetsClient>>, spreadsheetId: string) {
  const tasks = await listHomeTasks();
  const unique = new Map<string, HomeTaskOption>();
  for (const task of tasks) {
    const key = `${task.room}::${task.task.trim().toLowerCase()}`;
    if (!unique.has(key)) {
      unique.set(key, { room: task.room, task: task.task, duration: task.duration, notes: task.notes });
    }
  }
  if (!unique.size) return;

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${TASK_OPTIONS_SHEET}!A:D`,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: {
      values: [...unique.values()].map((option) => [option.room, option.task, option.duration, option.notes]),
    },
  });
}

function optionRowToTask(row: unknown[]) {
  const room = String(row[0] || "");
  const task = String(row[1] || "").trim();
  const duration = String(row[2] || "15m");
  if (!isRoom(room) || !task) return null;
  return {
    room,
    task,
    duration: isDuration(duration) ? duration : "15m",
    notes: String(row[3] || ""),
  };
}

function isRoom(value: string): value is HomeTaskRoom {
  return HOME_TASK_ROOMS.includes(value as HomeTaskRoom);
}

function isDuration(value: string): value is HomeTaskDuration {
  return HOME_TASK_DURATIONS.includes(value as HomeTaskDuration);
}

function isPlan(value: string): value is HomeTaskPlan {
  return HOME_TASK_PLANS.includes(value as HomeTaskPlan);
}

async function getSheetsClient() {
  const clientId = process.env.HOME_TASKS_GOOGLE_CLIENT_ID;
  const clientSecret = process.env.HOME_TASKS_GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.HOME_TASKS_GOOGLE_REFRESH_TOKEN;

  if (clientId && clientSecret && refreshToken) {
    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
    oauth2Client.setCredentials({ refresh_token: refreshToken });
    return google.sheets({ version: "v4", auth: oauth2Client });
  }

  const [clientRaw, tokenRaw] = await Promise.all([
    fs.readFile(LOCAL_CLIENT_FILE, "utf8"),
    fs.readFile(LOCAL_TOKEN_FILE, "utf8"),
  ]);
  const keys = JSON.parse(clientRaw);
  const token = JSON.parse(tokenRaw);
  const credentials = keys.installed || keys.web;
  const oauth2Client = new google.auth.OAuth2(credentials.client_id, credentials.client_secret);
  oauth2Client.setCredentials(token);
  return google.sheets({ version: "v4", auth: oauth2Client });
}

async function getSpreadsheetId() {
  if (process.env.HOME_TASKS_SPREADSHEET_ID) return process.env.HOME_TASKS_SPREADSHEET_ID;
  const result = JSON.parse(await fs.readFile(LOCAL_RESULT_FILE, "utf8"));
  return result.spreadsheetId as string;
}

export const homeTaskContract = {
  headers: TASK_HEADERS,
  optionHeaders: TASK_OPTION_HEADERS,
  rooms: HOME_TASK_ROOMS,
  durations: HOME_TASK_DURATIONS,
  plans: HOME_TASK_PLANS,
};
