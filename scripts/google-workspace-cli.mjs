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

const ROOMS = ["Office", "Bathroom", "Laundry", "Auto", "Kitchen", "Living Room", "Garage"];
const DURATIONS = ["10m", "15m", "30m", "45m", "60m", "90m", "2h", "4h+"];
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

async function createChoresSpreadsheet(sheets) {
  return sheets.spreadsheets.create({
    requestBody: {
      properties: {
        title: "Personal Ops Chores",
        timeZone: "America/New_York",
      },
      sheets: [
        { properties: { title: "Chores", gridProperties: { rowCount: 200, columnCount: 5, frozenRowCount: 1 } } },
        { properties: { title: "Kanban", gridProperties: { rowCount: 100, columnCount: 7, frozenRowCount: 2 } } },
        { properties: { title: "Daily Plan", gridProperties: { rowCount: 100, columnCount: 5, frozenRowCount: 1 } } },
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
          range: "Chores!A1:E2",
          values: [
            ["Room", "Task", "Duration", "Plan", "Notes"],
            ["Office", "Test chore setup check", "15m", "Pending", "CLI setup test row"],
          ],
        },
        {
          range: "Kanban!A1:G2",
          values: [
            ROOMS,
            ROOMS.map((_, index) => {
              const col = columnLetter(index + 1);
              return `=IFERROR(FILTER(Chores!$B$2:$B,Chores!$A$2:$A=${col}$1),"")`;
            }),
          ],
        },
        {
          range: "'Daily Plan'!A1:E2",
          values: [
            ["Room", "Task", "Duration", "Plan", "Notes"],
            ['=IFERROR(FILTER(Chores!A2:E,Chores!D2:D="Today"),"")'],
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
        validationRequest(ids.Chores, 0, ROOMS),
        validationRequest(ids.Chores, 2, DURATIONS),
        validationRequest(ids.Chores, 3, PLAN_OPTIONS),
        boldHeader(ids.Chores, 5, { red: 0.91, green: 0.95, blue: 1 }),
        boldHeader(ids.Kanban, 7, { red: 0.9, green: 0.96, blue: 0.92 }),
        boldHeader(ids["Daily Plan"], 5, { red: 1, green: 0.96, blue: 0.86 }),
        boldHeader(ids["Form Fields"], 3, { red: 0.95, green: 0.93, blue: 1 }),
        columnWidth(ids.Chores, 0, 1, 130),
        columnWidth(ids.Chores, 1, 2, 260),
        columnWidth(ids.Chores, 2, 4, 110),
        columnWidth(ids.Chores, 4, 5, 180),
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
