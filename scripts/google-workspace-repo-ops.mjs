#!/usr/bin/env node

import { authenticate } from "@google-cloud/local-auth";
import { google } from "googleapis";
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { createReadStream } from "node:fs";

const ROOT = process.cwd();
const DEFAULT_CLIENT_FILE = path.join(ROOT, "config/google-workspace/oauth-client.json");
const TOKEN_DIR = path.join(ROOT, ".google-workspace");
const TOKEN_FILE = path.join(TOKEN_DIR, "repo-ops-token.json");
const LEGACY_TOKEN_FILES = [
  path.join(TOKEN_DIR, "workspace-token.json"),
  path.join(TOKEN_DIR, "flow-token.json"),
];
const RESULT_FILE = path.join(TOKEN_DIR, "personal-ops-chores.json");

const TASKS_SHEET = "Chores";
const TASK_HEADERS = ["Task ID", "Room", "Task", "Duration", "Plan", "Notes"];
const ROOMS = ["Auto", "Bathroom", "Garage", "Kitchen", "Laundry", "Living Room", "Office"];
const DURATIONS = ["5m", "10m", "15m", "30m", "45m", "60m", "90m", "2h", "4h+"];
const PLAN_OPTIONS = ["Pending", "Today"];

const SCOPES = [
  "https://www.googleapis.com/auth/forms.body",
  "https://www.googleapis.com/auth/forms.responses.readonly",
  "https://www.googleapis.com/auth/spreadsheets",
  "https://www.googleapis.com/auth/drive.file",
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile",
];

const command = process.argv[2] || "help";
const flags = parseFlags(process.argv.slice(3));

async function main() {
  switch (command) {
    case "auth":
      await getAuthClient({ forceLogin: true });
      console.log("Repository Google authorization saved.");
      break;
    case "whoami":
      await printWhoami();
      break;
    case "chores:setup":
      await setupChores();
      break;
    case "chores:repair":
      await repairChores();
      break;
    case "chores:status":
      await statusChores();
      break;
    case "drive:upload":
      await driveUpload(flags);
      break;
    case "help":
    default:
      printHelp();
      break;
  }
}

function parseFlags(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith("--")) {
      const key = argv[i].slice(2);
      const value = argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[++i] : true;
      out[key] = value;
    }
  }
  return out;
}

async function getAuthClient({ forceLogin = false } = {}) {
  const clientFile = process.env.GOOGLE_WORKSPACE_OAUTH_CLIENT_FILE || DEFAULT_CLIENT_FILE;
  await assertExists(
    clientFile,
    [
      `Missing OAuth client file: ${clientFile}`,
      "Create a Desktop OAuth client in Google Cloud, download JSON, and save it there.",
      "You can also set GOOGLE_WORKSPACE_OAUTH_CLIENT_FILE=/absolute/path/client.json.",
    ].join("\n")
  );

  const keys = JSON.parse(await fs.readFile(clientFile, "utf8"));
  const credentials = keys.installed || keys.web;
  const oauth2Client = new google.auth.OAuth2(
    credentials.client_id,
    credentials.client_secret,
    firstRedirectUri(credentials)
  );

  const savedTokenFile = await firstExistingFile([TOKEN_FILE, ...LEGACY_TOKEN_FILES]);

  if (!forceLogin && savedTokenFile) {
    const savedCredentials = JSON.parse(await fs.readFile(savedTokenFile, "utf8"));
    oauth2Client.setCredentials(savedCredentials);
    return oauth2Client;
  }

  const authedClient = await authenticate({
    keyfilePath: clientFile,
    scopes: SCOPES,
  });
  await fs.mkdir(TOKEN_DIR, { recursive: true });
  await fs.writeFile(TOKEN_FILE, JSON.stringify(authedClient.credentials, null, 2));
  return authedClient;
}

async function driveUpload(flags) {
  if (!flags.file) {
    throw new Error("drive:upload requires --file <localPath> [--dest <folderId>] [--name <name>]");
  }
  const auth = await getAuthClient();
  const localPath = path.resolve(flags.file);
  await assertExists(localPath, `Missing local file: ${localPath}`);
  const name = flags.name || path.basename(localPath);
  const fileStat = await fs.stat(localPath);
  const totalBytes = fileStat.size;
  const sessionFile = path.join(TOKEN_DIR, "drive-upload-session.json");
  const existingSession = await readUploadSession(sessionFile);
  let session = existingSession && existingSession.localPath === localPath &&
    existingSession.totalBytes === totalBytes && existingSession.name === name
    ? existingSession
    : null;

  const accessToken = (await auth.getAccessToken()).token;
  if (!accessToken) throw new Error("Google auth did not return an access token.");

  if (!session) {
    const metadata = { name };
    if (flags.dest) metadata.parents = [flags.dest];
    const response = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json; charset=UTF-8",
        "X-Upload-Content-Type": mimeTypeFor(name),
        "X-Upload-Content-Length": String(totalBytes),
      },
      body: JSON.stringify(metadata),
    });
    if (!response.ok) throw new Error(`Could not start Drive upload (${response.status}): ${await response.text()}`);
    session = {
      uploadUrl: response.headers.get("location"),
      localPath,
      totalBytes,
      name,
      nextByte: 0,
    };
    if (!session.uploadUrl) throw new Error("Drive did not return a resumable upload URL.");
    await fs.mkdir(TOKEN_DIR, { recursive: true });
    await fs.writeFile(sessionFile, JSON.stringify(session, null, 2));
  }

  const chunkSize = 8 * 1024 * 1024;
  const handle = await fs.open(localPath, "r");
  const startedAt = Date.now();
  try {
    while (session.nextByte < totalBytes) {
      const offset = session.nextByte;
      const length = Math.min(chunkSize, totalBytes - offset);
      const buffer = Buffer.allocUnsafe(length);
      const { bytesRead } = await handle.read(buffer, 0, length, offset);
      const end = offset + bytesRead - 1;
      let response;
      for (let attempt = 0; ; attempt++) {
        try {
          response = await fetch(session.uploadUrl, {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Length": String(bytesRead),
              "Content-Range": `bytes ${offset}-${end}/${totalBytes}`,
            },
            body: buffer.subarray(0, bytesRead),
          });
          if (![408, 429, 500, 502, 503, 504].includes(response.status) || attempt >= 8) break;
          await delay(Math.min(30000, 1000 * 2 ** attempt));
        } catch (error) {
          if (attempt >= 8) throw error;
          console.log(`Network drop at ${formatBytes(offset)}; retrying in ${Math.min(30, 2 ** attempt)}s...`);
          await delay(Math.min(30000, 1000 * 2 ** attempt));
        }
      }

      if (response.status === 308) {
        const range = response.headers.get("range");
        const match = range && range.match(/bytes=0-(\\d+)/);
        session.nextByte = match ? Number(match[1]) + 1 : offset + bytesRead;
        await fs.writeFile(sessionFile, JSON.stringify(session, null, 2));
        const elapsed = Math.max(1, (Date.now() - startedAt) / 1000);
        const speed = session.nextByte / elapsed;
        const remaining = (totalBytes - session.nextByte) / Math.max(1, speed);
        console.log(`Uploaded ${formatBytes(session.nextByte)} / ${formatBytes(totalBytes)} (${((session.nextByte / totalBytes) * 100).toFixed(1)}%) — ${formatBytes(speed)}/s — ETA ${formatDuration(remaining)}`);
        continue;
      }
      if (![200, 201].includes(response.status)) {
        throw new Error(`Drive upload failed at ${formatBytes(offset)} (${response.status}): ${await response.text()}`);
      }
      const data = await response.json();
      await fs.rm(sessionFile, { force: true });
      console.log(JSON.stringify({ uploaded: data }, null, 2));
      return;
    }
  } finally {
    await handle.close();
  }
}

async function readUploadSession(file) {
  if (!(await exists(file))) return null;
  try { return JSON.parse(await fs.readFile(file, "utf8")); } catch { return null; }
}

function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function formatBytes(value) {
  const units = ["B", "KB", "MB", "GB"];
  let number = value;
  let index = 0;
  while (number >= 1024 && index < units.length - 1) { number /= 1024; index++; }
  return `${number.toFixed(index ? 1 : 0)} ${units[index]}`;
}

function formatDuration(seconds) {
  if (!Number.isFinite(seconds)) return "unknown";
  const minutes = Math.floor(seconds / 60);
  const remainder = Math.round(seconds % 60);
  return minutes ? `${minutes}m ${remainder}s` : `${remainder}s`;
}

function mimeTypeFor(fileName) {
  const extension = path.extname(fileName).toLowerCase();
  return {
    ".mp4": "video/mp4",
    ".mov": "video/quicktime",
    ".webm": "video/webm",
    ".pdf": "application/pdf",
    ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".txt": "text/plain",
  }[extension] || "application/octet-stream";
}

async function printWhoami() {
  const auth = await getAuthClient();
  console.log(JSON.stringify(await getGoogleProfile(auth), null, 2));
}

async function getGoogleProfile(auth) {
  const oauth2 = google.oauth2({ version: "v2", auth });
  const { data } = await oauth2.userinfo.get();
  return { email: data.email, name: data.name };
}

async function setupChores() {
  const auth = await getAuthClient();
  const sheets = google.sheets({ version: "v4", auth });
  const forms = google.forms({ version: "v1", auth });

  const spreadsheet = await createChoresSpreadsheet(sheets);
  const sheetIds = sheetIdMap(spreadsheet.data.sheets);
  await shapeChoresSpreadsheet(sheets, spreadsheet.data.spreadsheetId, sheetIds);

  const form = await createChoresForm(forms);

  const profile = await getGoogleProfile(auth);
  const result = {
    owner: profile.email,
    spreadsheetId: spreadsheet.data.spreadsheetId,
    spreadsheetUrl: spreadsheet.data.spreadsheetUrl,
    formId: form.formId,
    formUrl: form.responderUri,
    formEditUrl: `https://docs.google.com/forms/d/${form.formId}/edit`,
    createdAt: new Date().toISOString(),
    note: "Use Apps Script setupPersonalOpsChores or FormApp.setDestination to link responses to the Sheet.",
  };

  await fs.mkdir(TOKEN_DIR, { recursive: true });
  await fs.writeFile(RESULT_FILE, JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result, null, 2));
}

async function repairChores() {
  const auth = await getAuthClient();
  const sheets = google.sheets({ version: "v4", auth });
  const forms = google.forms({ version: "v1", auth });
  const result = await readResultFile();
  const spreadsheetId = result.spreadsheetId;
  const formId = result.formId;

  const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
  const ids = sheetIdMap(spreadsheet.data.sheets);
  await repairTaskSheet(sheets, spreadsheetId, ids);
  const refreshed = await sheets.spreadsheets.get({ spreadsheetId });
  await shapeDerivedSheets(sheets, spreadsheetId, sheetIdMap(refreshed.data.sheets));
  await repairChoresForm(forms, formId);

  const profile = await getGoogleProfile(auth);
  const readback = await readChoresState(sheets, forms, spreadsheetId, formId, profile.email);
  console.log(JSON.stringify(readback, null, 2));
}

async function statusChores() {
  const auth = await getAuthClient();
  const sheets = google.sheets({ version: "v4", auth });
  const forms = google.forms({ version: "v1", auth });
  const result = await readResultFile();
  const profile = await getGoogleProfile(auth);
  const readback = await readChoresState(
    sheets,
    forms,
    result.spreadsheetId,
    result.formId,
    profile.email
  );
  console.log(JSON.stringify(readback, null, 2));
}

async function createChoresSpreadsheet(sheets) {
  return sheets.spreadsheets.create({
    requestBody: {
      properties: {
        title: "Personal Ops Chores",
        timeZone: "America/New_York",
      },
      sheets: [
        { properties: { title: TASKS_SHEET, gridProperties: { rowCount: 200, columnCount: 6, frozenRowCount: 1 } } },
        { properties: { title: "Kanban", gridProperties: { rowCount: 100, columnCount: 7, frozenRowCount: 2 } } },
        { properties: { title: "Daily Plan", gridProperties: { rowCount: 100, columnCount: 6, frozenRowCount: 1 } } },
        { properties: { title: "Form Fields", gridProperties: { rowCount: 50, columnCount: 3, frozenRowCount: 1 } } },
      ],
    },
  });
}

async function shapeChoresSpreadsheet(sheets, spreadsheetId, ids) {
  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId,
    requestBody: {
      valueInputOption: "USER_ENTERED",
      data: [
        {
          range: `${TASKS_SHEET}!A1:F2`,
          values: [
            TASK_HEADERS,
            [makeTaskId(), "Office", "Test chore setup check", "15m", "Pending", "CLI setup test row"],
          ],
        },
        {
          range: "Kanban!A1:G2",
          values: [
            ROOMS,
            ROOMS.map((_, index) => {
              const col = columnLetter(index + 1);
              return `=IFERROR(FILTER(${TASKS_SHEET}!$C$2:$C,${TASKS_SHEET}!$B$2:$B=${col}$1),"")`;
            }),
          ],
        },
        {
          range: "'Daily Plan'!A1:F2",
          values: [
            TASK_HEADERS,
            [`=IFERROR(FILTER(${TASKS_SHEET}!A2:F,${TASKS_SHEET}!E2:E="Today"),"")`],
          ],
        },
        {
          range: "'Form Fields'!A1:C5",
          values: [
            ["Field", "Input", "Values"],
            ["Room", "Dropdown", ROOMS.join(", ")],
            ["Task", "Text", ""],
            ["Duration", "Dropdown", DURATIONS.join(", ")],
            ["Plan", "Dropdown", PLAN_OPTIONS.join(", ")],
          ],
        },
      ],
    },
  });

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        validationRequest(ids[TASKS_SHEET], 1, ROOMS),
        validationRequest(ids[TASKS_SHEET], 3, DURATIONS),
        validationRequest(ids[TASKS_SHEET], 4, PLAN_OPTIONS),
        boldHeader(ids[TASKS_SHEET], 6, { red: 0.91, green: 0.95, blue: 1 }),
        boldHeader(ids.Kanban, 7, { red: 0.9, green: 0.96, blue: 0.92 }),
        boldHeader(ids["Daily Plan"], 6, { red: 1, green: 0.96, blue: 0.86 }),
        boldHeader(ids["Form Fields"], 3, { red: 0.95, green: 0.93, blue: 1 }),
        columnWidth(ids[TASKS_SHEET], 0, 1, 150),
        columnWidth(ids[TASKS_SHEET], 1, 2, 130),
        columnWidth(ids[TASKS_SHEET], 2, 3, 260),
        columnWidth(ids[TASKS_SHEET], 3, 5, 110),
        columnWidth(ids[TASKS_SHEET], 5, 6, 180),
      ],
    },
  });
}

async function createChoresForm(forms) {
  const created = await forms.forms.create({
    requestBody: {
      info: {
        title: "Personal Ops Chores Intake",
        documentTitle: "Personal Ops Chores Intake",
      },
    },
  });
  const formId = created.data.formId;

  await forms.forms.batchUpdate({
    formId,
    requestBody: {
      requests: [
        {
          updateFormInfo: {
            info: {
              description: "Quick chore capture. Rooms store task lists; Plan is only Pending or Today.",
            },
            updateMask: "description",
          },
        },
        createChoiceItem("Room", ROOMS, 0),
        createTextItem("Task", false, 1),
        createChoiceItem("Duration", DURATIONS, 2),
        createChoiceItem("Plan", PLAN_OPTIONS, 3),
        createTextItem("Notes", true, 4, false),
      ],
    },
  });

  const full = await forms.forms.get({ formId });
  return full.data;
}

async function repairTaskSheet(sheets, spreadsheetId, ids) {
  if (!ids[TASKS_SHEET]) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            addSheet: {
              properties: {
                title: TASKS_SHEET,
                gridProperties: { rowCount: 200, columnCount: 6, frozenRowCount: 1 },
              },
            },
          },
        ],
      },
    });
  }

  const existing = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${TASKS_SHEET}!A1:Z`,
  });
  const rows = existing.data.values || [];
  const headers = rows[0] || [];
  const tasks = rows.slice(1).map((row) => normalizeTaskRow(headers, row)).filter(Boolean);

  await sheets.spreadsheets.values.clear({
    spreadsheetId,
    range: `${TASKS_SHEET}!A1:Z`,
  });
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${TASKS_SHEET}!A1:F${Math.max(tasks.length + 1, 2)}`,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [TASK_HEADERS, ...tasks],
    },
  });

  const refreshed = await sheets.spreadsheets.get({ spreadsheetId });
  const refreshedIds = sheetIdMap(refreshed.data.sheets);
  const requests = [
    validationRequest(refreshedIds[TASKS_SHEET], 1, ROOMS),
    validationRequest(refreshedIds[TASKS_SHEET], 3, DURATIONS),
    validationRequest(refreshedIds[TASKS_SHEET], 4, PLAN_OPTIONS),
    boldHeader(refreshedIds[TASKS_SHEET], 6, { red: 0.91, green: 0.95, blue: 1 }),
    columnWidth(refreshedIds[TASKS_SHEET], 0, 1, 150),
    columnWidth(refreshedIds[TASKS_SHEET], 1, 2, 130),
    columnWidth(refreshedIds[TASKS_SHEET], 2, 3, 260),
    columnWidth(refreshedIds[TASKS_SHEET], 3, 5, 110),
    columnWidth(refreshedIds[TASKS_SHEET], 5, 6, 180),
  ];

  if (refreshedIds.Rooms) {
    requests.push({ deleteSheet: { sheetId: refreshedIds.Rooms } });
  }

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: { requests },
  });
}

async function shapeDerivedSheets(sheets, spreadsheetId, ids) {
  const addRequests = ["Kanban", "Daily Plan", "Form Fields"]
    .filter((title) => !ids[title])
    .map((title) => ({
      addSheet: {
        properties: {
          title,
          gridProperties: {
            rowCount: title === "Form Fields" ? 50 : 100,
            columnCount: title === "Form Fields" ? 3 : title === "Daily Plan" ? 6 : ROOMS.length,
            frozenRowCount: 1,
          },
        },
      },
    }));

  if (addRequests.length) {
    await sheets.spreadsheets.batchUpdate({ spreadsheetId, requestBody: { requests: addRequests } });
    const refreshed = await sheets.spreadsheets.get({ spreadsheetId });
    ids = sheetIdMap(refreshed.data.sheets);
  }

  await sheets.spreadsheets.values.batchClear({
    spreadsheetId,
    requestBody: { ranges: ["Kanban!A:Z", "'Daily Plan'!A:Z", "'Form Fields'!A:Z"] },
  });
  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId,
    requestBody: {
      valueInputOption: "USER_ENTERED",
      data: [
        {
          range: `Kanban!A1:${columnLetter(ROOMS.length)}2`,
          values: [
            ROOMS,
            ROOMS.map((_, index) => {
              const col = columnLetter(index + 1);
              return `=IFERROR(FILTER(${TASKS_SHEET}!$C$2:$C,${TASKS_SHEET}!$B$2:$B=${col}$1),"")`;
            }),
          ],
        },
        {
          range: "'Daily Plan'!A1:F2",
          values: [
            TASK_HEADERS,
            [`=IFERROR(FILTER(${TASKS_SHEET}!A2:F,${TASKS_SHEET}!E2:E="Today"),"")`],
          ],
        },
        {
          range: "'Form Fields'!A1:C5",
          values: [
            ["Field", "Input", "Values"],
            ["Room", "Dropdown", ROOMS.join(", ")],
            ["Task", "Text", ""],
            ["Duration", "Dropdown", DURATIONS.join(", ")],
            ["Plan", "Dropdown", PLAN_OPTIONS.join(", ")],
          ],
        },
      ],
    },
  });

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        boldHeader(ids.Kanban, ROOMS.length, { red: 0.9, green: 0.96, blue: 0.92 }),
        boldHeader(ids["Daily Plan"], 6, { red: 1, green: 0.96, blue: 0.86 }),
        boldHeader(ids["Form Fields"], 3, { red: 0.95, green: 0.93, blue: 1 }),
      ],
    },
  });
}

async function repairChoresForm(forms, formId) {
  const form = await forms.forms.get({ formId });
  const requests = [];
  form.data.items?.forEach((item, index) => {
    if (item.title === "Room") requests.push(updateChoiceItem(item, ROOMS, index));
    if (item.title === "Duration") requests.push(updateChoiceItem(item, DURATIONS, index));
    if (item.title === "Plan") requests.push(updateChoiceItem(item, PLAN_OPTIONS, index));
  });

  if (requests.length) {
    await forms.forms.batchUpdate({ formId, requestBody: { requests } });
  }
}

async function readChoresState(sheets, forms, spreadsheetId, formId, owner) {
  const [spreadsheet, chores, kanban, dailyPlan, fields, form] = await Promise.all([
    sheets.spreadsheets.get({ spreadsheetId }),
    sheets.spreadsheets.values.get({ spreadsheetId, range: `${TASKS_SHEET}!A1:F20` }),
    sheets.spreadsheets.values.get({ spreadsheetId, range: "Kanban!A1:G10" }),
    sheets.spreadsheets.values.get({ spreadsheetId, range: "'Daily Plan'!A1:F10" }),
    sheets.spreadsheets.values.get({ spreadsheetId, range: "'Form Fields'!A1:C10" }),
    forms.forms.get({ formId }),
  ]);

  return {
    owner,
    spreadsheetId,
    formId,
    sourceMapping: {
      appSheetTableLabel: "Home Tasks",
      googleSheetTab: TASKS_SHEET,
      contract: TASK_HEADERS,
    },
    sheetTitles: spreadsheet.data.sheets.map((sheet) => sheet.properties.title),
    choresPreview: chores.data.values || [],
    kanbanPreview: kanban.data.values || [],
    dailyPlanPreview: dailyPlan.data.values || [],
    formFieldsPreview: fields.data.values || [],
    formOptions: Object.fromEntries(
      (form.data.items || [])
        .filter((item) => item.questionItem?.question?.choiceQuestion)
        .map((item) => [
          item.title,
          item.questionItem.question.choiceQuestion.options.map((option) => option.value),
        ])
    ),
    note: "Google source is repaired. In AppSheet, regenerate Home Tasks columns and set Task ID as the key.",
  };
}

function validationRequest(sheetId, columnIndex, values) {
  return {
    setDataValidation: {
      range: {
        sheetId,
        startRowIndex: 1,
        endRowIndex: 200,
        startColumnIndex: columnIndex,
        endColumnIndex: columnIndex + 1,
      },
      rule: {
        condition: {
          type: "ONE_OF_LIST",
          values: values.map((userEnteredValue) => ({ userEnteredValue })),
        },
        strict: true,
        showCustomUi: true,
      },
    },
  };
}

function boldHeader(sheetId, columnCount, backgroundColor) {
  return {
    repeatCell: {
      range: {
        sheetId,
        startRowIndex: 0,
        endRowIndex: 1,
        startColumnIndex: 0,
        endColumnIndex: columnCount,
      },
      cell: {
        userEnteredFormat: {
          textFormat: { bold: true },
          backgroundColor,
        },
      },
      fields: "userEnteredFormat(textFormat,backgroundColor)",
    },
  };
}

function columnWidth(sheetId, startIndex, endIndex, pixelSize) {
  return {
    updateDimensionProperties: {
      range: {
        sheetId,
        dimension: "COLUMNS",
        startIndex,
        endIndex,
      },
      properties: { pixelSize },
      fields: "pixelSize",
    },
  };
}

function createChoiceItem(title, options, index) {
  return {
    createItem: {
      location: { index },
      item: {
        title,
        questionItem: {
          question: {
            required: true,
            choiceQuestion: {
              type: "DROP_DOWN",
              options: options.map((value) => ({ value })),
              shuffle: false,
            },
          },
        },
      },
    },
  };
}

function createTextItem(title, paragraph, index, required = true) {
  return {
    createItem: {
      location: { index },
      item: {
        title,
        questionItem: {
          question: {
            required,
            textQuestion: {
              paragraph,
            },
          },
        },
      },
    },
  };
}

function updateChoiceItem(item, options, index) {
  return {
    updateItem: {
      location: { index },
      item: {
        itemId: item.itemId,
        title: item.title,
        questionItem: {
          question: {
            questionId: item.questionItem.question.questionId,
            required: true,
            choiceQuestion: {
              type: "DROP_DOWN",
              options: options.map((value) => ({ value })),
              shuffle: false,
            },
          },
        },
      },
      updateMask: "title,questionItem.question.required,questionItem.question.choiceQuestion",
    },
  };
}

function normalizeTaskRow(headers, row) {
  const byHeader = Object.fromEntries(headers.map((header, index) => [header, row[index] || ""]));
  const hasTaskIdHeader = headers.includes("Task ID");
  const task = hasTaskIdHeader ? byHeader.Task || "" : byHeader.Task || row[1] || "";
  const room = hasTaskIdHeader ? byHeader.Room || "" : byHeader.Room || row[0] || "";
  if (!task && !room) return null;

  const taskId = byHeader["Task ID"] || makeTaskId();
  return [
    taskId,
    room,
    task,
    hasTaskIdHeader ? byHeader.Duration || "15m" : byHeader.Duration || row[2] || "15m",
    hasTaskIdHeader ? byHeader.Plan || "Pending" : byHeader.Plan || row[3] || "Pending",
    hasTaskIdHeader ? byHeader.Notes || "" : byHeader.Notes || row[4] || "",
  ];
}

async function readResultFile() {
  await assertExists(
    RESULT_FILE,
    [
      `Missing result file: ${RESULT_FILE}`,
      "Run chores:setup first or add spreadsheetId/formId to .google-workspace/personal-ops-chores.json.",
    ].join("\n")
  );
  return JSON.parse(await fs.readFile(RESULT_FILE, "utf8"));
}

function sheetIdMap(sheets = []) {
  return Object.fromEntries(sheets.map((sheet) => [sheet.properties.title, sheet.properties.sheetId]));
}

function firstRedirectUri(credentials) {
  return credentials.redirect_uris?.[0] || "http://localhost";
}

async function assertExists(file, message) {
  if (!(await exists(file))) {
    throw new Error(message);
  }
}

async function exists(file) {
  try {
    await fs.access(file);
    return true;
  } catch {
    return false;
  }
}

async function firstExistingFile(files) {
  for (const file of files) {
    if (await exists(file)) return file;
  }
  return null;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function makeTaskId() {
  const stamp = new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14);
  const suffix = Math.random().toString(36).slice(2, 8);
  return `task_${stamp}_${suffix}`;
}

function columnLetter(columnNumber) {
  let column = "";
  while (columnNumber > 0) {
    const remainder = (columnNumber - 1) % 26;
    column = String.fromCharCode(65 + remainder) + column;
    columnNumber = Math.floor((columnNumber - 1) / 26);
  }
  return column;
}

function printHelp() {
  console.log(`Repository Google operations

Commands:
  npm run google:repo:auth          Authorize the repo-specific OAuth client
  npm run google:repo:whoami        Print the repo token's Google user
  npm run personal-ops:chores:setup Create the Personal Ops Chores Sheet and Form
  npm run personal-ops:chores:repair
                                    Repair the Chores/Home Tasks source contract
  npm run personal-ops:chores:status
                                    Read the live Chores/Home Tasks source contract
  npm run drive:upload:resumable -- --file <path> [--dest <folder-id>] [--name <name>]
                            Upload a local binary file to Drive (root if no folder is given)

Use the Homebrew gws command for general Drive, Gmail, Forms, Sheets, and Docs work.

Before auth:
  1. Enable Google Forms API, Google Sheets API, and Google Drive API.
  2. Create a Desktop OAuth client.
  3. Save the downloaded JSON to config/google-workspace/oauth-client.json.
`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
