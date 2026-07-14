#!/usr/bin/env node

import { authenticate } from "@google-cloud/local-auth";
import { google } from "googleapis";
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const ROOT = process.cwd();
const DEFAULT_CLIENT_FILE = path.join(ROOT, "config/google-workspace/oauth-client.json");
const TOKEN_DIR = path.join(ROOT, ".google-workspace");
const TOKEN_FILE = path.join(TOKEN_DIR, "flow-token.json");
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

async function main() {
  switch (command) {
    case "auth":
      await getAuthClient({ forceLogin: true });
      console.log("Google Workspace auth saved for flow.");
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
    case "help":
    default:
      printHelp();
      break;
  }
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

  if (!forceLogin && (await exists(TOKEN_FILE))) {
    oauth2Client.setCredentials(JSON.parse(await fs.readFile(TOKEN_FILE, "utf8")));
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

async function printWhoami() {
  const auth = await getAuthClient();
  const oauth2 = google.oauth2({ version: "v2", auth });
  const { data } = await oauth2.userinfo.get();
  console.log(JSON.stringify({ email: data.email, name: data.name }, null, 2));
}

async function setupChores() {
  const auth = await getAuthClient();
  const sheets = google.sheets({ version: "v4", auth });
  const forms = google.forms({ version: "v1", auth });

  const spreadsheet = await createChoresSpreadsheet(sheets);
  const sheetIds = sheetIdMap(spreadsheet.data.sheets);
  await shapeChoresSpreadsheet(sheets, spreadsheet.data.spreadsheetId, sheetIds);

  const form = await createChoresForm(forms);

  const result = {
    owner: "flow@singleton-systems.com",
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

  const readback = await readChoresState(sheets, forms, spreadsheetId, formId);
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

async function readChoresState(sheets, forms, spreadsheetId, formId) {
  const [spreadsheet, chores, kanban, dailyPlan, fields, form] = await Promise.all([
    sheets.spreadsheets.get({ spreadsheetId }),
    sheets.spreadsheets.values.get({ spreadsheetId, range: `${TASKS_SHEET}!A1:F20` }),
    sheets.spreadsheets.values.get({ spreadsheetId, range: "Kanban!A1:G10" }),
    sheets.spreadsheets.values.get({ spreadsheetId, range: "'Daily Plan'!A1:F10" }),
    sheets.spreadsheets.values.get({ spreadsheetId, range: "'Form Fields'!A1:C10" }),
    forms.forms.get({ formId }),
  ]);

  return {
    owner: "flow@singleton-systems.com",
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
  console.log(`Google Workspace CLI

Commands:
  npm run gws:auth          Authorize as flow@singleton-systems.com
  npm run gws:whoami        Print the authenticated Google user
  npm run gws:chores:setup  Create Personal Ops Chores Sheet and Form
  npm run gws:chores:repair Repair the existing Chores/Home Tasks source contract

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
